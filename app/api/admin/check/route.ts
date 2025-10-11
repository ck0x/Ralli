import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Admin check API called");

    // Check authentication - In Auth0 v4, getSession() doesn't take parameters
    const session = await auth0.getSession();
    if (!session) {
      console.log("❌ No session found");
      return NextResponse.json(
        { isAdmin: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    console.log("✅ Session found, user email:", session.user.email);

    // Check if user email matches admin email
    const adminEmail = process.env.ADMIN_EMAIL;
    console.log("🔑 ADMIN_EMAIL from env:", adminEmail);

    if (!adminEmail) {
      console.error("❌ ADMIN_EMAIL not set in environment variables");
      return NextResponse.json(
        { isAdmin: false, error: "Admin email not configured" },
        { status: 500 }
      );
    }

    const isAdmin = session.user.email === adminEmail;
    console.log(
      "🎯 Comparing:",
      session.user.email,
      "===",
      adminEmail,
      "=>",
      isAdmin
    );

    return NextResponse.json({
      isAdmin,
      email: session.user.email,
    });
  } catch (error) {
    console.error("❌ Admin check error:", error);
    return NextResponse.json(
      { isAdmin: false, error: "Failed to check admin status" },
      { status: 500 }
    );
  }
}
