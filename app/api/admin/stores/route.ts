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

    // Get all stores with summary data
    const stores = await sql`
      SELECT * FROM store_summary
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ stores });
  } catch (error) {
    console.error("Stores fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stores" },
      { status: 500 }
    );
  }
}
