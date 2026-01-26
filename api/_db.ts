import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL ?? "");

let tablesEnsured = false;

export const ensureTables = async () => {
  if (tablesEnsured) return;

  await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`;

  await sql`
    CREATE TABLE IF NOT EXISTS customers (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      phone text UNIQUE NOT NULL,
      email text,
      preferred_language text,
      created_at timestamptz DEFAULT now()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
      racket_brand text NOT NULL,
      racket_model text,
      string_category text NOT NULL,
      string_focus text NOT NULL,
      string_brand text NOT NULL,
      string_model text NOT NULL,
      tension integer NOT NULL,
      notes text,
      status text NOT NULL DEFAULT 'pending',
      created_at timestamptz DEFAULT now(),
      completed_at timestamptz
    );
  `;

  tablesEnsured = true;
};

export default sql;
