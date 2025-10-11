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

    // Check if email exists in stores table (as owner)
    const stores = await sql`
      SELECT id, name, shop_slug 
      FROM stores 
      WHERE owner_email = ${email} AND is_active = true
      LIMIT 1
    `;

    // Also check store_users table
    const storeUsers = await sql`
      SELECT su.store_id, s.shop_slug, s.name
      FROM store_users su
      JOIN stores s ON s.id = su.store_id
      WHERE su.email = ${email} AND su.is_active = true AND s.is_active = true
      LIMIT 1
    `;

    const hasStore = stores.length > 0 || storeUsers.length > 0;
    const storeData = stores[0] || storeUsers[0];

    return NextResponse.json({
      hasStore,
      shopSlug: storeData?.shop_slug || null,
      storeName: storeData?.name || null
    });
  } catch (error) {
    console.error("Store check error:", error);
    return NextResponse.json(
      { error: "Failed to check store status" },
      { status: 500 }
    );
  }
}
