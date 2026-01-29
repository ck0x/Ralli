import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL ?? "");

let tablesEnsured = false;

export const ensureTables = async () => {
  if (tablesEnsured) return;

  console.log("ENSURING TABLES...");
  await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`;
  console.log("EXTENSIONS OK");

  await sql`
    CREATE TABLE IF NOT EXISTS merchants (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      clerk_user_id text UNIQUE NOT NULL,
      business_name text NOT NULL,
      business_email text,
      business_phone text,
      status text NOT NULL DEFAULT 'pending', -- pending, approved, rejected
      created_at timestamptz DEFAULT now()
    );
  `;
  console.log("MERCHANTS TABLE OK");

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
  console.log("CUSTOMERS TABLE OK");

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
  console.log("ORDERS TABLE OK");

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

      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'pre_stretch') THEN
        ALTER TABLE orders ADD COLUMN pre_stretch text;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'due_date') THEN
        ALTER TABLE orders ADD COLUMN due_date timestamptz;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'is_express') THEN
        ALTER TABLE orders ADD COLUMN is_express boolean DEFAULT false;
      END IF;

      -- Add contact fields to merchants if missing
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'merchants' AND column_name = 'business_email') THEN
        ALTER TABLE merchants ADD COLUMN business_email text;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'merchants' AND column_name = 'business_phone') THEN
        ALTER TABLE merchants ADD COLUMN business_phone text;
      END IF;
      
      BEGIN
        ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_phone_key;
        ALTER TABLE customers ADD CONSTRAINT customers_merchant_phone_key UNIQUE (merchant_id, phone);
      EXCEPTION WHEN OTHERS THEN
        CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_merchant_phone ON customers(merchant_id, phone);
      END;

    END
    $$;
  `;
  console.log("MIGRATIONS OK");

  tablesEnsured = true;
};

export default sql;
