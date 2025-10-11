import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { auth0 } from "@/lib/auth0";

const sql = neon(process.env.DATABASE_URL!);

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and admin access
    const session = await auth0.getSession();
    if (!session || session.user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { action, reason } = await request.json();
    const applicationId = parseInt(params.id);

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    if (action === "approve") {
      // Call the approval function
      const result = await sql`
        SELECT approve_store_application(${applicationId}, ${session.user.email})
      `;

      return NextResponse.json({
        success: true,
        storeId: result[0].approve_store_application,
        message: "Application approved and store created",
      });
    } else if (action === "reject") {
      if (!reason) {
        return NextResponse.json(
          { error: "Rejection reason is required" },
          { status: 400 }
        );
      }

      // Update application status to rejected
      await sql`
        UPDATE store_applications
        SET 
          status = 'rejected',
          reviewed_at = now(),
          reviewed_by = ${session.user.email},
          rejection_reason = ${reason}
        WHERE id = ${applicationId}
      `;

      // TODO: Send rejection email to applicant

      return NextResponse.json({
        success: true,
        message: "Application rejected",
      });
    }
  } catch (error: any) {
    console.error("Application action error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process application" },
      { status: 500 }
    );
  }
}

// Optional: DELETE endpoint to remove an application
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and admin access
    const session = await auth0.getSession();
    if (!session || session.user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const applicationId = parseInt(params.id);

    await sql`
      DELETE FROM store_applications
      WHERE id = ${applicationId}
    `;

    return NextResponse.json({
      success: true,
      message: "Application deleted",
    });
  } catch (error: any) {
    console.error("Application deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 }
    );
  }
}
