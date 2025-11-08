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

    // Get all stores with summary data
    console.log("🔍 Fetching stores from database...");
    const stores = await sql`
      SELECT 
        id,
        name,
        shop_slug,
        owner_email,
        owner_name,
        contact_email,
        business_address,
        phone,
        is_active,
        subscription_tier,
        business_type,
        created_at,
        approved_at,
        approved_by
      FROM stores
      ORDER BY created_at DESC
    `;

    console.log(`✅ Found ${stores.length} stores`);
    if (stores.length > 0) {
      console.log("First store:", JSON.stringify(stores[0], null, 2));
    }

    return NextResponse.json({ stores });
  } catch (error) {
    console.error("❌ Stores fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stores" },
      { status: 500 }
    );
  }
}
