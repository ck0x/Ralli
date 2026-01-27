import sql from "./_db.js";

export const isSuperAdmin = (userId: string) => {
  return (
    userId === process.env.VITE_ADMIN_USER_ID ||
    userId === process.env.ADMIN_USER_ID
  );
};

export const getMerchantByUserId = async (clerkUserId: string) => {
  const [merchant] = await sql`
    SELECT * FROM merchants WHERE clerk_user_id = ${clerkUserId}
  `;
  return merchant;
};

export const requireAdmin = async (req: any, res: any) => {
  const headerUserId = req.headers["x-admin-user-id"];

  if (!headerUserId) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }

  // Check if Super Admin
  if (isSuperAdmin(headerUserId)) {
    return { role: "super_admin", userId: headerUserId };
  }

  // Check if Merchant
  const merchant = await getMerchantByUserId(headerUserId);
  if (merchant) {
    if (merchant.status !== "approved") {
      res.status(403).json({ error: "Merchant account not approved." });
      return null;
    }
    return { role: "merchant", merchant };
  }

  res.status(403).json({ error: "Access denied." });
  return null;
};
