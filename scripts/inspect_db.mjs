import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set in env");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function main() {
  console.log("Listing last 20 orders:");
  const orders =
    await sql`SELECT id, merchant_id, customer_id, racket_brand, string_brand, status, created_at FROM orders ORDER BY created_at DESC LIMIT 20`;
  console.table(orders || []);

  console.log("\nListing merchants:");
  const merchants =
    await sql`SELECT id, clerk_user_id, business_name, status, created_at FROM merchants ORDER BY created_at DESC LIMIT 20`;
  console.table(merchants || []);

  console.log("\nListing customers:");
  const customers =
    await sql`SELECT id, merchant_id, name, phone, email, created_at FROM customers ORDER BY created_at DESC LIMIT 20`;
  console.table(customers || []);

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
