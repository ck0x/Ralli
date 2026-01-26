import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL ?? "");

let tablesEnsured = false;

export const ensureTables = async () => {
  if (tablesEnsured) return;

  await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`;

  await sql`
    CREATE TABLE IF NOT EXISTS merchants (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      clerk_user_id text UNIQUE NOT NULL,
      business_name text NOT NULL,
      status text NOT NULL DEFAULT 'pending', -- pending, approved, rejected
      created_at timestamptz DEFAULT now()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS customers (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      merchant_id uuid REFERENCES merchants(id) ON DELETE CASCADE,
      name text NOT NULL,
      phone text NOT NULL,
      email text,
      preferred_language text,
      created_at timestamptz DEFAULT now(),
      UNIQUE(merchant_id, phone)
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      merchant_id uuid REFERENCES merchants(id) ON DELETE CASCADE,
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

  // Migrations for existing tables
  await sql`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'merchant_id') THEN
        ALTER TABLE customers ADD COLUMN merchant_id uuid REFERENCES merchants(id) ON DELETE CASCADE;
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'merchant_id') THEN
        ALTER TABLE orders ADD COLUMN merchant_id uuid REFERENCES merchants(id) ON DELETE CASCADE;
      END IF;
      
      -- We must drop the old unique constraint on phone if it exists and replace it with (merchant_id, phone)
      -- This part is tricky in SQL without knowing constraint name, but usually 'customers_phone_key'
      BEGIN
        ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_phone_key;
        ALTER TABLE customers ADD CONSTRAINT customers_merchant_phone_key UNIQUE (merchant_id, phone);
      EXCEPTION WHEN OTHERS THEN
        -- create generic unique index if constraint manipulation fails
        CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_merchant_phone ON customers(merchant_id, phone);
      END;

    END
    $$;
  `;

  tablesEnsured = true;
};

export default sql;
