import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { auth0 } from "@/lib/auth0";

const sql = neon(process.env.DATABASE_URL!);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication and admin access
    const session = await auth0.getSession();
    if (!session || session.user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { is_active } = await request.json();
    const resolvedParams = await params;
    const storeId = parseInt(resolvedParams.id);

    await sql`
      UPDATE stores
      SET is_active = ${is_active}
      WHERE id = ${storeId}
    `;

    // Log the activity
    await sql`
      INSERT INTO activity_log (store_id, user_email, action, entity_type, entity_id, details)
      VALUES (
        ${storeId},
        ${session.user.email},
        ${is_active ? "store_activated" : "store_deactivated"},
        'store',
        ${storeId},
        ${JSON.stringify({ is_active, changed_by: session.user.email })}
      )
    `;

    return NextResponse.json({
      success: true,
      message: `Store ${is_active ? "activated" : "deactivated"} successfully`,
    });
  } catch (error: any) {
    console.error("Store update error:", error);
    return NextResponse.json(
      { error: "Failed to update store" },
      { status: 500 }
    );
  }
}
