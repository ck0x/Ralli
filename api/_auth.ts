import sql from "./_db.js";

export const isSuperAdmin = (userId: string) => {
  const adminId = process.env.ADMIN_USER_ID || process.env.VITE_ADMIN_USER_ID;
  return userId === adminId;
};

// Simple in-memory cache for merchant lookups to reduce DB roundtrips
const merchantCache = new Map<string, { merchant: any; timestamp: number }>();
const CACHE_TTL = 30000; // 30 seconds

export const getMerchantByUserId = async (clerkUserId: string) => {
  const cached = merchantCache.get(clerkUserId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.merchant;
  }

  const [merchant] = await sql`
    SELECT * FROM merchants WHERE clerk_user_id = ${clerkUserId}
  `;

  if (merchant) {
    merchantCache.set(clerkUserId, { merchant, timestamp: Date.now() });
  }

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
