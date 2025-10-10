import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth0 } from "./lib/auth0";

export async function middleware(request: NextRequest) {
  try {
    const path = request.nextUrl.pathname;

    // Let Auth0 middleware handle /auth/* routes first
    if (path.startsWith("/auth/")) {
      return await auth0.middleware(request);
    }

    // List of paths that should be protected (require authentication)
    // /form is now protected so we can track which user submits orders
    const protectedPaths = ["/orders", "/products", "/form", "/api/orders"];

    // Check if current path should be protected
    const isProtectedPath = protectedPaths.some((protectedPath) =>
      path.startsWith(protectedPath)
    );

    // If this is a protected path, check for session
    if (isProtectedPath) {
      const session = await auth0.getSession();

      // If no session, redirect to login
      if (!session) {
        const loginUrl = new URL("/auth/login", request.url);
        loginUrl.searchParams.set("returnTo", path);
        return NextResponse.redirect(loginUrl);
      }
    }

    return NextResponse.next();
  } catch (error) {
    // Log the error for debugging
    console.error("Middleware error:", error);

    // If middleware fails, let the request through to avoid breaking the site
    // You can change this behavior based on your security requirements
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
