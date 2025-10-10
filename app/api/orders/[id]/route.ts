import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/neonDb";
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

  try {
    // Update only the fields that were provided
    const status = parsed.data.status;
    const additionalNotes = parsed.data.additionalNotes;

    if (status !== undefined && additionalNotes !== undefined) {
      const data = await sql`
        UPDATE jobs 
        SET status = ${status}, additional_notes = ${additionalNotes}
        WHERE id = ${idNum}
        RETURNING *
      `;
      if (data.length === 0) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
      }
      return NextResponse.json({ data: data[0] });
    } else if (status !== undefined) {
      const data = await sql`
        UPDATE jobs 
        SET status = ${status}
        WHERE id = ${idNum}
        RETURNING *
      `;
      if (data.length === 0) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
      }
      return NextResponse.json({ data: data[0] });
    } else if (additionalNotes !== undefined) {
      const data = await sql`
        UPDATE jobs 
        SET additional_notes = ${additionalNotes}
        WHERE id = ${idNum}
        RETURNING *
      `;
      if (data.length === 0) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
      }
      return NextResponse.json({ data: data[0] });
    } else {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
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

  try {
    await sql`DELETE FROM jobs WHERE id = ${idNum}`;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
