import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
dotenv.config();

const sql = neon(process.env.DATABASE_URL ?? "");

async function testConn() {
  try {
    console.log("Connecting...");
    const result = await sql`SELECT 1 as connected`;
    console.log("Result:", result);
  } catch (err) {
    console.error("Connection failed:", err);
  }
}

testConn();
