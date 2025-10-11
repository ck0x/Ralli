import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { auth0 } from "@/lib/auth0";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin access
    const session = await auth0.getSession();
    if (!session || session.user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get recent activity logs (last 100)
    const logs = await sql`
      SELECT *
      FROM activity_log
      ORDER BY created_at DESC
      LIMIT 100
    `;

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Activity logs fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity logs" },
      { status: 500 }
    );
  }
}
