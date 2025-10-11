import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// Reserved slugs that cannot be used
const RESERVED_SLUGS = [
  "api",
  "admin",
  "dashboard",
  "apply",
  "auth",
  "orders",
  "form",
  "about",
  "contact",
  "lessons",
  "products",
  "settings",
  "help",
  "docs",
  "support",
  "login",
  "logout",
  "signup",
  "register",
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json(
        { error: "Slug parameter is required" },
        { status: 400 }
      );
    }

    // Check if slug is reserved
    if (RESERVED_SLUGS.includes(slug.toLowerCase())) {
      return NextResponse.json({ available: false, reason: "reserved" });
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      return NextResponse.json({ available: false, reason: "invalid_format" });
    }

    // Check if slug exists in stores
    const stores = await sql`
      SELECT id FROM stores WHERE shop_slug = ${slug}
    `;

    // Check if slug exists in pending applications
    const applications = await sql`
      SELECT id FROM store_applications 
      WHERE shop_slug = ${slug} AND status = 'pending'
    `;

    const available = stores.length === 0 && applications.length === 0;

    return NextResponse.json({
      available,
      reason: available ? null : "taken",
    });
  } catch (error) {
    console.error("Slug check error:", error);
    return NextResponse.json(
      { error: "Failed to check slug availability" },
      { status: 500 }
    );
  }
}
