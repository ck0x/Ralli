import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { auth0 } from "@/lib/auth0";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin access
    const session = await auth0.getSession(request);
    if (!session || session.user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get pending applications count
    const [pendingApps] = await sql`
      SELECT COUNT(*) as count 
      FROM store_applications 
      WHERE status = 'pending'
    `;

    // Get active stores count
    const [activeStores] = await sql`
      SELECT COUNT(*) as count 
      FROM stores 
      WHERE is_active = true
    `;

    // Get total users count
    const [totalUsers] = await sql`
      SELECT COUNT(*) as count 
      FROM store_users 
      WHERE is_active = true
    `;

    // Get recent activity count (last 24 hours)
    const [recentActivity] = await sql`
      SELECT COUNT(*) as count 
      FROM activity_log 
      WHERE created_at >= now() - interval '24 hours'
    `;

    return NextResponse.json({
      pendingApplications: parseInt(pendingApps.count),
      activeStores: parseInt(activeStores.count),
      totalUsers: parseInt(totalUsers.count),
      recentActivity: parseInt(recentActivity.count),
    });
  } catch (error) {
    console.error("Stats fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
