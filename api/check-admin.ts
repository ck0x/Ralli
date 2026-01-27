import type { IncomingMessage, ServerResponse } from "node:http";
import sql, { ensureTables } from "./_db";
import { isSuperAdmin, getMerchantByUserId } from "./_auth";

const send = (res: ServerResponse, status: number, payload: unknown) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
};

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
) {
  const headerUserId = (req.headers["x-admin-user-id"] as string) || null;

  if (!headerUserId) {
    send(res, 200, { role: "anonymous" });
    return;
  }

  try {
    await ensureTables();

    if (isSuperAdmin(headerUserId)) {
      send(res, 200, { role: "super_admin", userId: headerUserId });
      return;
    }

    const merchant = await getMerchantByUserId(headerUserId);
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

    send(res, 200, { role: "none" });
  } catch (err) {
    console.error("check-admin error", err);
    send(res, 500, { error: "Failed to check admin" });
  }
}
