import { neon, neonConfig } from "@neondatabase/serverless";

// Configure Neon for optimal performance
neonConfig.fetchConnectionCache = true;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

/**
 * Get a Neon serverless SQL client
 * Use this for querying the database directly with tagged template literals
 */
export function getNeonClient() {
  return neon(process.env.DATABASE_URL!);
}

/**
 * Execute a SQL query with parameters
 * Note: Neon uses tagged template literals, so we construct the query string
 */
export const sql = getNeonClient();
