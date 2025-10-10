# Quick SQL Setup for Neon DB

Copy and paste this entire script into your Neon SQL Editor to set up all tables.

```sql
-- =====================================================
-- Racket Tracker Database Schema for Neon
-- =====================================================

-- Drop existing objects if you're resetting (use with caution!)
-- DROP VIEW IF EXISTS jobs_view;
-- DROP TABLE IF EXISTS jobs CASCADE;
-- DROP TABLE IF EXISTS rackets CASCADE;
-- DROP TABLE IF EXISTS customers CASCADE;
-- DROP TABLE IF EXISTS stores CASCADE;
-- DROP FUNCTION IF EXISTS update_job_timestamp();

-- =====================================================
-- 1. CREATE TABLES
-- =====================================================

-- Stores table
CREATE TABLE IF NOT EXISTS stores (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact_email VARCHAR(100),
    created_at TIMESTAMP DEFAULT now()
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    store_id INT REFERENCES stores(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT now()
);

-- Rackets table
CREATE TABLE IF NOT EXISTS rackets (
    id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES customers(id) ON DELETE CASCADE,
    store_id INT REFERENCES stores(id) ON DELETE CASCADE,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    string_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT now()
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    store_id INT REFERENCES stores(id) ON DELETE CASCADE,
    customer_id INT REFERENCES customers(id) ON DELETE CASCADE,
    racket_id INT REFERENCES rackets(id) ON DELETE SET NULL,
    service_type VARCHAR(20) NOT NULL DEFAULT 'Standard',
    additional_notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    job_qr_code VARCHAR(255),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- =====================================================
-- 2. CREATE FUNCTION & TRIGGER
-- =====================================================

-- Function to update job timestamp
CREATE OR REPLACE FUNCTION update_job_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating timestamp
CREATE TRIGGER trigger_update_job_timestamp
BEFORE UPDATE ON jobs
FOR EACH ROW
EXECUTE FUNCTION update_job_timestamp();

-- =====================================================
-- 3. CREATE VIEW
-- =====================================================

-- Aggregated view for easier querying
CREATE OR REPLACE VIEW jobs_view AS
SELECT
  j.id,
  j.store_id,
  j.status,
  j.service_type,
  j.additional_notes,
  j.created_at,
  j.updated_at,
  c.full_name AS customer_name,
  c.contact_number,
  c.email,
  r.brand AS racket_brand,
  r.model AS racket_model,
  r.string_type
FROM jobs j
JOIN customers c ON c.id = j.customer_id
LEFT JOIN rackets r ON r.id = j.racket_id;

-- =====================================================
-- 4. CREATE INDEXES (for performance)
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_customers_store_id ON customers(store_id);
CREATE INDEX IF NOT EXISTS idx_rackets_customer_id ON rackets(customer_id);
CREATE INDEX IF NOT EXISTS idx_rackets_store_id ON rackets(store_id);
CREATE INDEX IF NOT EXISTS idx_jobs_store_id ON jobs(store_id);
CREATE INDEX IF NOT EXISTS idx_jobs_customer_id ON jobs(customer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);

-- =====================================================
-- 5. INSERT SAMPLE DATA (Optional - uncomment to use)
-- =====================================================

-- Create a default store for testing
-- INSERT INTO stores (name, contact_email) 
-- VALUES ('My Tennis Shop', 'shop@example.com')
-- ON CONFLICT DO NOTHING;

-- =====================================================
-- DONE! 
-- =====================================================
-- Your database is now ready to use.
-- Verify by running: SELECT * FROM stores;
```

## Step-by-Step Instructions

1. **Login to Neon Console**: Go to https://console.neon.tech
2. **Open SQL Editor**: Click on your project → SQL Editor
3. **Copy & Paste**: Copy the entire SQL script above
4. **Execute**: Click "Run" or press `Ctrl+Enter` (or `Cmd+Enter` on Mac)
5. **Verify**: Run `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`

## Expected Tables

After running the script, you should have:
- ✅ `stores`
- ✅ `customers`
- ✅ `rackets`
- ✅ `jobs`
- ✅ `jobs_view` (view)

## Next Steps

1. Update your `.env.local` with `DATABASE_URL` from Neon
2. Test your API endpoints
3. Start your development server with `bun dev`

## Troubleshooting

**Error: "relation already exists"**
- This is fine! It means the table was already created.

**Error: "syntax error"**
- Make sure you copied the entire script
- Try running sections one at a time

**Error: "permission denied"**
- Make sure you're using the correct database connection
- Verify you have admin access to your Neon project
