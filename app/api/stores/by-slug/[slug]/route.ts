import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;

    const stores = await sql`
      SELECT 
        id,
        name,
        shop_slug,
        owner_email,
        owner_name,
        contact_email,
        phone,
        business_address,
        business_type,
        is_active,
        subscription_tier,
        created_at
      FROM stores
      WHERE shop_slug = ${slug} AND is_active = true
      LIMIT 1
    `;

    if (stores.length === 0) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    return NextResponse.json(stores[0]);
  } catch (error) {
    console.error("Store fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch store" },
      { status: 500 }
    );
  }
}
