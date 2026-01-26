import sql, { ensureTables } from "./_db.js";
import { requireAdmin, isSuperAdmin } from "./_auth.js";

export default async function handler(req: any, res: any) {
  await ensureTables();

  if (req.method === "POST") {
    // Register as a new merchant
    // Note: In a production app, verify the Clerk session token here.
    const { clerkUserId, businessName } = req.body;

    if (!clerkUserId || !businessName) {
      return res.status(400).json({ error: "Missing fields" });
    }

    try {
      const [newMerchant] = await sql`
        INSERT INTO merchants (clerk_user_id, business_name, status)
        VALUES (${clerkUserId}, ${businessName}, 'pending')
        RETURNING *
      `;
      return res.status(201).json({ merchant: newMerchant });
    } catch (error) {
      console.error("Registration error", error);
      // specific error for unique constraint
      return res
        .status(500)
        .json({ error: "Registration failed. Account might already exist." });
    }
  }

  // Examples: GET (List merchants), PATCH (Approve/Reject)
  // These REQUIRE admin/auth context
  const auth = await requireAdmin(req, res);
  if (!auth) return;

  if (req.method === "GET") {
    // Only Super Admin can list all merchants
    if (auth.role !== "super_admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    try {
      const merchants =
        await sql`SELECT * FROM merchants ORDER BY created_at DESC`;
      return res.status(200).json({ merchants });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to fetch merchants" });
    }
  }

  if (req.method === "PATCH") {
    // Approve/Reject merchant (Super Admin only)
    if (auth.role !== "super_admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { merchantId, status } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    try {
      const [updated] = await sql`
            UPDATE merchants 
            SET status = ${status}
            WHERE id = ${merchantId}
            RETURNING *
        `;
      return res.status(200).json({ merchant: updated });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "Update failed" });
    }
  }
}
