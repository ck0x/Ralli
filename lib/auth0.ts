// lib/auth0.ts

import { Auth0Client } from "@auth0/nextjs-auth0/server";

// Initialize the Auth0 client
export const auth0 = new Auth0Client({
  // Options are loaded from environment variables by default
  // Ensure necessary environment variables are properly set
  // domain: process.env.AUTH0_DOMAIN,
  // clientId: process.env.AUTH0_CLIENT_ID,
  // clientSecret: process.env.AUTH0_CLIENT_SECRET,
  // appBaseUrl: process.env.APP_BASE_URL,
  // secret: process.env.AUTH0_SECRET,

  authorizationParameters: {
    // In v4, the AUTH0_SCOPE and AUTH0_AUDIENCE environment variables for API authorized applications are no longer automatically picked up by the SDK.
    // Instead, we need to provide the values explicitly.
    scope: process.env.AUTH0_SCOPE || "openid profile email",
    audience: process.env.AUTH0_AUDIENCE,
  },

  // Configure session and transaction cookies for Vercel deployment
  session: {
    // Use rolling sessions to refresh the session on each request
    rolling: true,
    // Absolute session duration (7 days in seconds)
    absoluteDuration: 60 * 60 * 24 * 7,
    // Inactivity duration (1 day in seconds)
    inactivityDuration: 60 * 60 * 24,
    // Cookie configuration for production
    cookie: {
      // Use secure cookies in production (Vercel always uses HTTPS)
      secure: process.env.NODE_ENV === "production",
      // SameSite=lax is more compatible with redirects
      sameSite: "lax",
    },
  },

  // Configure transaction cookie (used during auth flow)
  transactionCookie: {
    // Use secure cookies in production
    secure: process.env.NODE_ENV === "production",
    // SameSite=lax is required for the callback to work
    sameSite: "lax",
  },
});
