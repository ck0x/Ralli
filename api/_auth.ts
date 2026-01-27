import sql from "./_db.js";

export const isSuperAdmin = (userId: string) => {
  const adminId = process.env.ADMIN_USER_ID || process.env.VITE_ADMIN_USER_ID;
  return userId === adminId;
};

export const getMerchantByUserId = async (clerkUserId: string) => {
  const [merchant] = await sql`
    SELECT * FROM merchants WHERE clerk_user_id = ${clerkUserId}
  `;
  return merchant;
};

const sendError = (res: any, status: number, message: string) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ error: message }));
};

export const requireAdmin = async (req: any, res: any) => {
  const headerUserId = req.headers["x-admin-user-id"];

  if (!headerUserId) {
    sendError(res, 401, "Unauthorized");
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
      sendError(res, 403, "Merchant account not approved");
      return null;
    }
    return { role: "merchant", merchant };
  }

  sendError(res, 403, "Access denied");
  return null;
};
