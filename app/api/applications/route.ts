import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { auth0 } from "@/lib/auth0";

const sql = neon(process.env.DATABASE_URL!);

// POST - Submit new application
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth0.getSession(request);
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      businessName,
      shopSlug,
      ownerName,
      ownerEmail,
      phone,
      businessAddress,
      businessType,
      hearAbout,
      reason,
    } = body;

    // Validate required fields
    if (
      !businessName ||
      !shopSlug ||
      !ownerName ||
      !ownerEmail ||
      !phone ||
      !businessType ||
      !reason
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify the email matches the authenticated user
    if (session.user.email !== ownerEmail) {
      return NextResponse.json(
        { error: "Email mismatch with authenticated user" },
        { status: 403 }
      );
    }

    // Check if slug is still available
    const existingSlug = await sql`
      SELECT id FROM stores WHERE shop_slug = ${shopSlug}
      UNION
      SELECT id FROM store_applications WHERE shop_slug = ${shopSlug} AND status = 'pending'
    `;

    if (existingSlug.length > 0) {
      return NextResponse.json(
        { error: "Shop URL is no longer available" },
        { status: 409 }
      );
    }

    // Check if user already has a pending application
    const existingApplication = await sql`
      SELECT id FROM store_applications 
      WHERE owner_email = ${ownerEmail} AND status = 'pending'
    `;

    if (existingApplication.length > 0) {
      return NextResponse.json(
        { error: "You already have a pending application" },
        { status: 409 }
      );
    }

    // Insert application
    const result = await sql`
      INSERT INTO store_applications (
        business_name,
        shop_slug,
        owner_email,
        owner_name,
        phone,
        business_address,
        business_type,
        reason_for_signup,
        notes,
        status
      ) VALUES (
        ${businessName},
        ${shopSlug},
        ${ownerEmail},
        ${ownerName},
        ${phone},
        ${businessAddress || null},
        ${businessType},
        ${reason},
        ${hearAbout ? `Heard about us: ${hearAbout}` : null},
        'pending'
      )
      RETURNING id, business_name, shop_slug, submitted_at
    `;

    const application = result[0];

    // TODO: Send email notification to admin
    // This is where you'd integrate with Resend, SendGrid, etc.
    console.log("New application submitted:", application);

    return NextResponse.json(
      {
        success: true,
        application: {
          id: application.id,
          businessName: application.business_name,
          shopSlug: application.shop_slug,
          submittedAt: application.submitted_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Application submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}

// GET - List applications (admin only)
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth0.getSession(request);
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // TODO: Check if user is admin (replace with your admin email)
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "your-email@gmail.com";
    if (session.user.email !== ADMIN_EMAIL) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || "pending";

    const applications = await sql`
      SELECT 
        id,
        business_name,
        shop_slug,
        owner_name,
        owner_email,
        phone,
        business_address,
        business_type,
        reason_for_signup,
        notes,
        status,
        submitted_at,
        reviewed_at,
        reviewed_by,
        rejection_reason
      FROM store_applications
      WHERE status = ${status}
      ORDER BY submitted_at DESC
    `;

    return NextResponse.json({ applications });
  } catch (error) {
    console.error("Applications fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}
