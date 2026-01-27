import sql, { ensureTables } from "./_db.js";
import { requireAdmin } from "./_auth.js";
import { send, readBody } from "./_utils.js";

export default async function handler(req: any, res: any) {
  console.log("MERCHANTS HANDLER START - Method:", req.method);
  await ensureTables();

  if (req.method === "POST") {
    try {
      const body = await readBody(req);
      console.log("POST BODY:", body);
      const { clerkUserId, businessName, businessEmail, businessPhone } = body;

      if (!clerkUserId || !businessName) {
        console.error("Missing fields:", { clerkUserId, businessName });
        return send(res, 400, {
          error: "Missing fields (clerkUserId or businessName)",
        });
      }

      // Insert optional contact fields when provided
      const [newMerchant] = await sql`
        INSERT INTO merchants (clerk_user_id, business_name, business_email, business_phone, status)
        VALUES (
          ${clerkUserId},
          ${businessName},
          ${businessEmail ?? null},
          ${businessPhone ?? null},
          'pending'
        )
        RETURNING *
      `;

      console.log("New merchant created:", newMerchant.id);
      return send(res, 201, { merchant: newMerchant });
    } catch (error) {
      console.error("Registration error", error);
      return send(res, 500, {
        error: "Registration failed. Account might already exist.",
      });
    }
  }

  const auth = await requireAdmin(req, res);
  if (!auth) return;

  if (req.method === "GET") {
    if (auth.role !== "super_admin") {
      return send(res, 403, { error: "Forbidden" });
    }

    try {
      const rows =
        await sql`SELECT id, clerk_user_id, business_name, business_email, business_phone, status, created_at FROM merchants ORDER BY created_at DESC`;
      const merchants = rows.map((r: any) => ({
        id: r.id,
        clerkUserId: r.clerk_user_id,
        businessName: r.business_name,
        businessEmail: r.business_email ?? null,
        businessPhone: r.business_phone ?? null,
        status: r.status,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : null,
      }));
      return send(res, 200, { merchants });
    } catch (error) {
      console.error(error);
      return send(res, 500, { error: "Failed to fetch merchants" });
    }
  }

  if (req.method === "PATCH") {
    if (auth.role !== "super_admin") {
      return send(res, 403, { error: "Forbidden" });
    }

    try {
      const { merchantId, status } = await readBody(req);
      if (!["approved", "rejected"].includes(status)) {
        return send(res, 400, { error: "Invalid status" });
      }

      const [updated] = await sql`
            UPDATE merchants 
            SET status = ${status}
            WHERE id = ${merchantId}
            RETURNING *
        `;
      return send(res, 200, { merchant: updated });
    } catch (e) {
      console.error(e);
      return send(res, 500, { error: "Update failed" });
    }
  }

  return send(res, 405, { error: "Method not allowed" });
}
