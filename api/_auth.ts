export const requireAdmin = (req: any, res: any) => {
  const adminUserId = process.env.ADMIN_USER_ID;
  const headerUserId = req.headers["x-admin-user-id"];

  if (!adminUserId || !headerUserId || headerUserId !== adminUserId) {
    res.status(403).json({ error: "Admin access required." });
    return false;
  }

  return true;
};
