import type { IncomingMessage, ServerResponse } from "node:http";
import sql, { ensureTables } from "./_db";

const send = (res: ServerResponse, status: number, payload: unknown) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
};

export default async function handler(
  req: IncomingMessage & { query?: Record<string, string> },
  res: ServerResponse,
) {
  if (req.method !== "GET") {
    send(res, 405, { error: "Method not allowed" });
    return;
  }

  const phone = (req.query?.phone ?? "").trim();
  if (!phone) {
    send(res, 400, { error: "Phone is required" });
    return;
  }

  try {
    await ensureTables();
    const rows = await sql`
      SELECT id, name, phone, email, preferred_language
      FROM customers
      WHERE phone = ${phone}
      LIMIT 1
    `;

    const customer = rows.length
      ? {
          id: rows[0].id as string,
          name: rows[0].name as string,
          phone: rows[0].phone as string,
          email: rows[0].email as string | null,
          preferredLanguage: rows[0].preferred_language as string | null,
        }
      : null;

    send(res, 200, { customer });
  } catch (error) {
    send(res, 500, { error: "Failed to fetch customer" });
  }
}
