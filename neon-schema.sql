-- Neon Database Schema for Racket Tracker
-- Run these commands in your Neon DB SQL Editor or via psql

-- Core tables
CREATE TABLE IF NOT EXISTS stores (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact_email VARCHAR(100),
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    store_id INT REFERENCES stores(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rackets (
    id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES customers(id) ON DELETE CASCADE,
    store_id INT REFERENCES stores(id) ON DELETE CASCADE,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    string_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT now()
);

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

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_job_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function before updating jobs
CREATE TRIGGER trigger_update_job_timestamp
BEFORE UPDATE ON jobs
FOR EACH ROW
EXECUTE FUNCTION update_job_timestamp();

-- Aggregated view for simpler API fetch
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

-- Optional: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_store_id ON customers(store_id);
CREATE INDEX IF NOT EXISTS idx_rackets_customer_id ON rackets(customer_id);
CREATE INDEX IF NOT EXISTS idx_rackets_store_id ON rackets(store_id);
CREATE INDEX IF NOT EXISTS idx_jobs_store_id ON jobs(store_id);
CREATE INDEX IF NOT EXISTS idx_jobs_customer_id ON jobs(customer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);

-- Optional: Insert a sample store for testing
-- Uncomment the following lines if you want a default store
-- INSERT INTO stores (name, contact_email) 
-- VALUES ('Default Store', 'store@example.com')
-- ON CONFLICT DO NOTHING;
