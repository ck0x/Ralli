import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseAdmin";
import { z } from "zod";

const patchSchema = z.object({
  status: z.enum(["pending", "in-progress", "ready", "picked-up"]).optional(),
  additionalNotes: z.string().optional(),
});

export async function PATCH(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  // Auth is already checked by middleware - this route is protected
  const params = await context.params; // Await per Next.js dynamic route guidance
  const idNum = Number(params.id);
  if (Number.isNaN(idNum))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const body = await _req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("jobs")
    .update({
      status: parsed.data.status,
      additional_notes: parsed.data.additionalNotes,
    })
    .eq("id", idNum)
    .select("*")
    .single();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  // Auth is already checked by middleware - this route is protected
  const params = await context.params;
  const idNum = Number(params.id);
  if (Number.isNaN(idNum))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const supabase = getSupabaseServer();
  const { error } = await supabase.from("jobs").delete().eq("id", idNum);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
