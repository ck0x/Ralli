import type { IncomingMessage, ServerResponse } from "node:http";
import sql, { ensureTables } from "./_db.js";
import { isSuperAdmin, getMerchantByUserId } from "./_auth.js";

const send = (res: ServerResponse, status: number, payload: unknown) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
};

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
) {
  console.log("CHECK-ADMIN HANDLER START");
  const headerUserId = (req.headers["x-admin-user-id"] as string) || null;
  console.log("headerUserId:", headerUserId);

  if (!headerUserId) {
    console.log("No headerUserId, returning anonymous");
    send(res, 200, { role: "anonymous" });
    return;
  }

  try {
    console.log("Ensuring tables...");
    await ensureTables();
    console.log("Tables ensured.");

    if (isSuperAdmin(headerUserId)) {
      console.log("User is super admin");
      send(res, 200, { role: "super_admin", userId: headerUserId });
      return;
    }

    console.log("Checking if merchant...");
    const merchant = await getMerchantByUserId(headerUserId);
    console.log("Merchant search result:", merchant);
    if (merchant) {
      send(res, 200, {
        role: "merchant",
        merchant: {
          id: merchant.id,
          businessName: merchant.business_name,
          status: merchant.status,
        },
      });
      return;
    }

    console.log("User not found in merchants, returning role: none");
    send(res, 200, { role: "none" });
  } catch (err) {
    console.error("check-admin error", err);
    send(res, 500, { error: "Failed to check admin" });
  }
}
