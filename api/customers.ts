import type { IncomingMessage, ServerResponse } from "node:http";
import sql, { ensureTables } from "./_db.js";
import { requireAdmin } from "./_auth.js";
import { send } from "./_utils.js";

export default async function handler(
  req: IncomingMessage & { query?: Record<string, string> },
  res: ServerResponse,
) {
  if (req.method !== "GET") {
    send(res, 405, { error: "Method not allowed" });
    return;
  }

  // Require merchant auth to search for customers
  const auth = await requireAdmin(req, res);
  if (!auth) return;

  if (auth.role !== "merchant") {
    send(res, 403, { error: "Access denied" });
    return;
  }

  const phone = (req.query?.phone ?? "").trim();
  if (!phone) {
    send(res, 400, { error: "Phone is required" });
    return;
  }

  try {
    const rows = await sql`
      SELECT id, name, phone, email, preferred_language, merchant_id
      FROM customers
      WHERE phone = ${phone} AND merchant_id = ${auth.merchant.id}
      LIMIT 1
    `;

    const customer = rows.length
      ? {
          id: rows[0].id as string,
          merchantId: rows[0].merchant_id as string,
          name: rows[0].name as string,
          phone: rows[0].phone as string,
          email: rows[0].email as string | null,
          preferredLanguage: rows[0].preferred_language as string | null,
        }
      : null;

    let recentOrders: any[] = [];
    if (customer) {
      try {
        const customerId = customer.id;
        const merchantId = auth.merchant.id;
        console.log(
          `Fetching recent orders for customer=${customerId} merchant=${merchantId}`,
        );
        const orderRows = await sql`
          SELECT o.id, o.racket_brand, o.racket_model, o.string_brand, o.string_model, 
                 o.tension, o.pre_stretch, o.created_at, o.string_category, o.string_focus
          FROM orders o
          WHERE o.customer_id = ${customerId} AND o.merchant_id = ${merchantId}
          ORDER BY o.created_at DESC
          LIMIT 5
        `;
        recentOrders = orderRows.map((row) => ({
          id: row.id,
          racketBrand: row.racket_brand,
          racketModel: row.racket_model,
          stringBrand: row.string_brand,
          stringModel: row.string_model,
          stringCategory: row.string_category,
          stringFocus: row.string_focus,
          tension: row.tension,
          preStretch: row.pre_stretch,
          createdAt: row.created_at,
        }));
      } catch (err) {
        console.error("Error fetching recent orders:", err);
        // Don't fail the whole request if fetching recent orders fails - continue with empty list
        recentOrders = [];
      }
    }

    send(res, 200, { customer, recentOrders });
  } catch (error) {
    console.error(error);
    send(res, 500, { error: "Failed to fetch customer" });
  }
}
