import sql, { ensureTables } from "./_db.js";
import { requireAdmin, isSuperAdmin } from "./_auth.js";

const send = (res: any, status: number, payload: any) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
};

const readBody = async (req: any) => {
  const chunks: any[] = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const body = Buffer.concat(chunks).toString();
  return body ? JSON.parse(body) : {};
};

export default async function handler(req: any, res: any) {
  await ensureTables();

  if (req.method === "POST") {
    try {
      const { clerkUserId, businessName } = await readBody(req);

      if (!clerkUserId || !businessName) {
        return send(res, 400, { error: "Missing fields" });
      }

      const [newMerchant] = await sql`
        INSERT INTO merchants (clerk_user_id, business_name, status)
        VALUES (${clerkUserId}, ${businessName}, 'pending')
        RETURNING *
      `;
      return send(res, 201, { merchant: newMerchant });
    } catch (error) {
      console.error("Registration error", error);
      return send(res, 500, {
        error: "Registration failed. Account might already exist.",
      });
    }
  }

  // Examples: GET (List merchants), PATCH (Approve/Reject)
  // These REQUIRE admin/auth context
  const auth = await requireAdmin(req, res);
  if (!auth) return;

  if (req.method === "GET") {
    // Only Super Admin can list all merchants
    if (auth.role !== "super_admin") {
      return send(res, 403, { error: "Forbidden" });
    }

    try {
      const merchants =
        await sql`SELECT * FROM merchants ORDER BY created_at DESC`;
      return send(res, 200, { merchants });
    } catch (error) {
      console.error(error);
      return send(res, 500, { error: "Failed to fetch merchants" });
    }
  }

  if (req.method === "PATCH") {
    // Approve/Reject merchant (Super Admin only)
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
}
