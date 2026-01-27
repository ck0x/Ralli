import type { IncomingMessage, ServerResponse } from "node:http";
import sql, { ensureTables } from "./_db.js";
import { requireAdmin } from "./_auth.js";
import { sendCompletionEmail } from "./_email.js";

type OrderPayload = {
  phone: string;
  name: string;
  email?: string;
  preferredLanguage?: string;
  racketBrand: string;
  racketModel?: string;
  stringCategory: "durable" | "repulsion";
  stringFocus: "attack" | "control";
  stringBrand: string;
  stringModel: string;
  tension: number;
  notes?: string;
};

type StatusPayload = {
  orderId: string;
  status: "pending" | "in_progress" | "completed";
};

const send = (res: ServerResponse, status: number, payload: unknown) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
};

const readBody = async (req: IncomingMessage) => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(chunk as Buffer);
  }
  const raw = Buffer.concat(chunks).toString("utf-8");
  return raw ? JSON.parse(raw) : {};
};

export default async function handler(
  req: IncomingMessage & { query?: Record<string, string> },
  res: ServerResponse,
) {
  const auth = await requireAdmin(req, res);
  // Allow authenticated merchants or super admins to list orders (POST handles its own check below but improved logic consolidates it)
  // Actually, let's keep it simple. Even GET requires auth now.
  if (!auth) return;

  if (req.method === "GET") {
    try {
      await ensureTables();
      const status = req.query?.status;

      let whereClause = sql`TRUE`;
      if (auth.role === "merchant") {
        whereClause = sql`${whereClause} AND merchant_id = ${auth.merchant.id}`;
      }
      if (status) {
        whereClause = sql`${whereClause} AND status = ${status}`;
      }

      const rows = await sql`
            SELECT o.id, o.customer_id, o.racket_brand, o.racket_model, o.string_category,
                   o.string_focus, o.string_brand, o.string_model, o.tension, o.notes,
                   o.status, o.created_at, o.completed_at,
                   c.name AS customer_name, c.phone AS customer_phone, c.email AS customer_email
            FROM orders o
            JOIN customers c ON c.id = o.customer_id
            WHERE ${whereClause}
            ORDER BY o.created_at DESC
            LIMIT 200
          `;

      const orders = rows.map((row) => ({
        id: row.id as string,
        merchantId: row.merchant_id as string,
        customerId: row.customer_id as string,
        customerName: row.customer_name as string,
        customerPhone: row.customer_phone as string,
        customerEmail: row.customer_email as string | null,
        racketBrand: row.racket_brand as string,
        racketModel: row.racket_model as string | null,
        stringCategory: row.string_category as "durable" | "repulsion",
        stringFocus: row.string_focus as "attack" | "control",
        stringBrand: row.string_brand as string,
        stringModel: row.string_model as string,
        tension: row.tension as number,
        notes: row.notes as string | null,
        status: row.status as "pending" | "in_progress" | "completed",
        createdAt: row.created_at as string,
        completedAt: row.completed_at as string | null,
      }));

      send(res, 200, { orders });
    } catch (error) {
      console.error(error);
      send(res, 500, { error: "Failed to fetch orders" });
    }
    return;
  }

  if (req.method === "POST") {
    // Auth already checked at top
    if (auth.role !== "merchant") {
      send(res, 403, { error: "Only merchants can create orders" });
      return;
    }

    try {
      const payload = (await readBody(req)) as OrderPayload;
      const phone = payload.phone?.trim();
      const merchantId = auth.merchant.id;

      if (
        !phone ||
        !payload.name ||
        !payload.racketBrand ||
        !payload.stringBrand ||
        !payload.stringModel
      ) {
        send(res, 400, { error: "Missing required fields" });
        return;
      }

      await ensureTables();

      let customerId: string;

      // Check if customer exists for this merchant
      const existingCustomers = await sql`
        SELECT id FROM customers 
        WHERE phone = ${phone} AND merchant_id = ${merchantId}
        LIMIT 1
      `;

      if (existingCustomers.length > 0) {
        customerId = existingCustomers[0].id;
        // Update basic info if needed
        await sql`
            UPDATE customers SET
            name = ${payload.name},
            email = ${payload.email ?? null},
            preferred_language = ${payload.preferredLanguage ?? "en"}
            WHERE id = ${customerId}
        `;
      } else {
        // Create new customer for this merchant
        const newCustomer = await sql`
            INSERT INTO customers (merchant_id, name, phone, email, preferred_language)
            VALUES (${merchantId}, ${payload.name}, ${phone}, ${payload.email ?? null}, ${payload.preferredLanguage ?? "en"})
            RETURNING id
          `;
        customerId = newCustomer[0].id;
      }

      const orderRows = await sql`
        INSERT INTO orders (
          merchant_id,
          customer_id,
          racket_brand,
          racket_model,
          string_category,
          string_focus,
          string_brand,
          string_model,
          tension,
          notes,
          status
        ) VALUES (
          ${merchantId},
          ${customerId},
          ${payload.racketBrand},
          ${payload.racketModel ?? null},
          ${payload.stringCategory},
          ${payload.stringFocus},
          ${payload.stringBrand},
          ${payload.stringModel},
          ${payload.tension},
          ${payload.notes ?? null},
          'pending'
        )
        RETURNING id
      `;

      send(res, 200, { orderId: orderRows[0].id });
    } catch (error) {
      console.error(error);
      send(res, 500, { error: "Failed to create order" });
    }
    return;
  }

  if (req.method === "PATCH") {
    if (auth.role !== "merchant") {
      send(res, 403, { error: "Only merchants can update orders" });
      return;
    }

    try {
      const payload = (await readBody(req)) as StatusPayload;
      if (!payload.orderId || !payload.status) {
        send(res, 400, { error: "Missing orderId or status" });
        return;
      }

      await ensureTables();
      const completedAt = payload.status === "completed" ? new Date() : null;

      const result = await sql`
        UPDATE orders
        SET status = ${payload.status}, completed_at = ${completedAt}
        WHERE id = ${payload.orderId} AND merchant_id = ${auth.merchant.id}
        RETURNING id
      `;

      if (result.length === 0) {
        send(res, 404, { error: "Order not found or access denied" });
        return;
      }

      if (payload.status === "completed") {
        const rows = await sql`
          SELECT c.email, c.name, o.racket_brand, o.string_model, o.tension
          FROM orders o
          JOIN customers c ON c.id = o.customer_id
          WHERE o.id = ${payload.orderId}
          LIMIT 1
        `;

        if (rows.length && rows[0].email) {
          await sendCompletionEmail({
            to: rows[0].email as string,
            customerName: rows[0].name as string,
            racketBrand: rows[0].racket_brand as string,
            stringModel: rows[0].string_model as string,
            tension: rows[0].tension as number,
          });
        }
      }

      send(res, 200, { success: true });
    } catch (error) {
      send(res, 500, { error: "Failed to update order" });
    }
    return;
  }

  send(res, 405, { error: "Method not allowed" });
}
