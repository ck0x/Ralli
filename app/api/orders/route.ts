import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/neonDb";
import { z } from "zod";

const createOrderSchema = z.object({
  storeId: z.number().int().positive(),
  customerName: z.string().min(1),
  contactNumber: z.string().min(3),
  email: z
    .string()
    .email()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  racketBrand: z.string().min(1),
  racketModel: z.string().min(1),
  stringType: z.string().optional(),
  serviceType: z.string().default("standard"),
  additionalNotes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  // Auth is already checked by middleware - this route is protected
  const storeId = req.nextUrl.searchParams.get("storeId");
  if (!storeId)
    return NextResponse.json({ error: "storeId required" }, { status: 400 });
  
  try {
    const data = await sql`
      SELECT * FROM jobs_view 
      WHERE store_id = ${parseInt(storeId)} 
      ORDER BY created_at DESC
    `;
    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Auth is already checked by middleware - this route is protected
  const body = await req.json().catch(() => null);
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });

  try {
    // Upsert customer (simplistic: match by full_name + contact_number + store)
    const existingCustomers = await sql`
      SELECT id FROM customers 
      WHERE full_name = ${parsed.data.customerName}
        AND contact_number = ${parsed.data.contactNumber}
        AND store_id = ${parsed.data.storeId}
      LIMIT 1
    `;
    
    let customerId = existingCustomers?.[0]?.id;
    
    if (!customerId) {
      const insertedCustomer = await sql`
        INSERT INTO customers (store_id, full_name, contact_number, email)
        VALUES (
          ${parsed.data.storeId},
          ${parsed.data.customerName},
          ${parsed.data.contactNumber},
          ${parsed.data.email || null}
        )
        RETURNING id
      `;
      customerId = insertedCustomer[0].id;
    }

    // Insert racket (simplistic always new; could de-duplicate later)
    const racket = await sql`
      INSERT INTO rackets (store_id, customer_id, brand, model, string_type)
      VALUES (
        ${parsed.data.storeId},
        ${customerId},
        ${parsed.data.racketBrand},
        ${parsed.data.racketModel},
        ${parsed.data.stringType || null}
      )
      RETURNING id
    `;

    const job = await sql`
      INSERT INTO jobs (store_id, customer_id, racket_id, service_type, additional_notes, status)
      VALUES (
        ${parsed.data.storeId},
        ${customerId},
        ${racket[0].id},
        ${parsed.data.serviceType},
        ${parsed.data.additionalNotes || null},
        'pending'
      )
      RETURNING *
    `;

    return NextResponse.json({ data: job[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
