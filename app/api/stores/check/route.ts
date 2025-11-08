import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 }
      );
    }

    console.log(`🔍 Checking store for email: ${email}`);

    // Check if email exists in stores table (as owner)
    const stores = await sql`
      SELECT id, name, shop_slug 
      FROM stores 
      WHERE owner_email = ${email} AND is_active = true
      LIMIT 1
    `;

    console.log(`📊 Found ${stores.length} stores as owner`);

    // Also check store_users table (if it exists)
    let storeUsers: any[] = [];
    try {
      storeUsers = await sql`
        SELECT su.store_id, s.shop_slug, s.name
        FROM store_users su
        JOIN stores s ON s.id = su.store_id
        WHERE su.user_email = ${email} AND s.is_active = true
        LIMIT 1
      `;
    } catch (e) {
      console.log("📝 Note: store_users table doesn't exist or has different structure");
    }

    console.log(`📊 Found ${storeUsers.length} stores as user`);

    const hasStore = stores.length > 0 || storeUsers.length > 0;
    const storeData = stores[0] || storeUsers[0];

    const result = {
      hasStore,
      shopSlug: storeData?.shop_slug || null,
      storeName: storeData?.name || null,
    };

    console.log(`✅ Result:`, JSON.stringify(result));

    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Store check error:", error);
    return NextResponse.json(
      { error: "Failed to check store status" },
      { status: 500 }
    );
  }
}
