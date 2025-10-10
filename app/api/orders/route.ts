import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseAdmin";
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
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("jobs_view")
    .select("*")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  // Auth is already checked by middleware - this route is protected
  const body = await req.json().catch(() => null);
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  const supabase = getSupabaseServer();
  // Upsert customer (simplistic: match by full_name + contact_number + store)
  const { data: existingCustomers } = await supabase
    .from("customers")
    .select("id")
    .eq("full_name", parsed.data.customerName)
    .eq("contact_number", parsed.data.contactNumber)
    .eq("store_id", parsed.data.storeId)
    .limit(1);
  let customerId = existingCustomers?.[0]?.id;
  if (!customerId) {
    const { data: insertedCustomer, error: custErr } = await supabase
      .from("customers")
      .insert({
        store_id: parsed.data.storeId,
        full_name: parsed.data.customerName,
        contact_number: parsed.data.contactNumber,
        email: parsed.data.email,
      })
      .select("id")
      .single();
    if (custErr)
      return NextResponse.json({ error: custErr.message }, { status: 500 });
    customerId = insertedCustomer.id;
  }
  // Insert racket (simplistic always new; could de-duplicate later)
  const { data: racket, error: racketErr } = await supabase
    .from("rackets")
    .insert({
      store_id: parsed.data.storeId,
      customer_id: customerId,
      brand: parsed.data.racketBrand,
      model: parsed.data.racketModel,
      string_type: parsed.data.stringType,
    })
    .select("id")
    .single();
  if (racketErr)
    return NextResponse.json({ error: racketErr.message }, { status: 500 });

  const { data: job, error: jobErr } = await supabase
    .from("jobs")
    .insert({
      store_id: parsed.data.storeId,
      customer_id: customerId,
      racket_id: racket.id,
      service_type: parsed.data.serviceType,
      additional_notes: parsed.data.additionalNotes,
      status: "pending",
    })
    .select("*")
    .single();
  if (jobErr)
    return NextResponse.json({ error: jobErr.message }, { status: 500 });
  return NextResponse.json({ data: job });
}
