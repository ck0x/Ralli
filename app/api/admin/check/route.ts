import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth0.getSession(request);
    if (!session) {
      return NextResponse.json(
        { isAdmin: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Check if user email matches admin email
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      console.error("ADMIN_EMAIL not set in environment variables");
      return NextResponse.json(
        { isAdmin: false, error: "Admin email not configured" },
        { status: 500 }
      );
    }

    const isAdmin = session.user.email === adminEmail;

    return NextResponse.json({
      isAdmin,
      email: session.user.email,
    });
  } catch (error) {
    console.error("Admin check error:", error);
    return NextResponse.json(
      { isAdmin: false, error: "Failed to check admin status" },
      { status: 500 }
    );
  }
}
