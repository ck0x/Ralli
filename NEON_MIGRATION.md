# Neon Database Migration Guide

This project has been migrated from Supabase to Neon Database. Follow these steps to set up your Neon database.

## Prerequisites

- A Neon account (sign up at https://neon.tech)
- Node.js/Bun installed

## Setup Instructions

### 1. Create a Neon Project

1. Go to https://console.neon.tech
2. Create a new project
3. Choose your preferred region
4. Copy your connection string

### 2. Configure Environment Variables

Create or update your `.env.local` file with your Neon database connection string:

```bash
DATABASE_URL="postgresql://[user]:[password]@[host]/[dbname]?sslmode=require"
```

**Important:** Make sure to replace the placeholders with your actual Neon credentials.

### 3. Run the Database Schema

You need to execute the SQL schema to create all necessary tables, views, and functions.

#### Option A: Using Neon Console (Recommended)

1. Open your Neon project in the console
2. Go to the SQL Editor
3. Copy the entire contents of `neon-schema.sql`
4. Paste and execute it in the SQL Editor

#### Option B: Using psql

```bash
psql "postgresql://[user]:[password]@[host]/[dbname]?sslmode=require" -f neon-schema.sql
```

### 4. Verify the Installation

After running the schema, verify that all tables were created:

```sql
-- Run this in the Neon SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see:
- `customers`
- `jobs`
- `jobs_view` (view)
- `rackets`
- `stores`

### 5. Insert Test Data (Optional)

If you want to create a test store:

```sql
INSERT INTO stores (name, contact_email) 
VALUES ('Test Store', 'test@example.com');
```

## Database Schema Overview

### Tables

1. **stores** - Store information
   - id (SERIAL PRIMARY KEY)
   - name
   - contact_email
   - created_at

2. **customers** - Customer information
   - id (SERIAL PRIMARY KEY)
   - store_id (FK to stores)
   - full_name
   - contact_number
   - email
   - created_at

3. **rackets** - Racket information
   - id (SERIAL PRIMARY KEY)
   - customer_id (FK to customers)
   - store_id (FK to stores)
   - brand
   - model
   - string_type
   - created_at

4. **jobs** - Service jobs/orders
   - id (SERIAL PRIMARY KEY)
   - store_id (FK to stores)
   - customer_id (FK to customers)
   - racket_id (FK to rackets)
   - service_type
   - additional_notes
   - status
   - job_qr_code
   - created_at
   - updated_at

### Views

- **jobs_view** - Aggregated view combining jobs with customer and racket information for easier querying

## Key Differences from Supabase

### API Changes

- **Before (Supabase):**
  ```typescript
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('store_id', storeId);
  ```

- **After (Neon):**
  ```typescript
  const data = await sql`
    SELECT * FROM jobs 
    WHERE store_id = ${storeId}
  `;
  ```

### Connection Management

- **Supabase:** Used `@supabase/supabase-js` client library
- **Neon:** Uses `@neondatabase/serverless` with SQL tagged templates

### Authentication

- Authentication remains handled by Auth0 (no changes needed)
- Neon focuses purely on database connectivity

## Troubleshooting

### Connection Issues

If you get connection errors:
1. Verify your `DATABASE_URL` is correct
2. Ensure SSL mode is set to `require`
3. Check that your Neon project is active
4. Verify your IP is not blocked (Neon usually allows all IPs by default)

### Migration Issues

If tables don't exist:
1. Ensure you ran the entire `neon-schema.sql` file
2. Check for SQL errors in the Neon console
3. Verify you're connected to the correct database

## Performance Tips

1. **Indexes:** The schema includes indexes on frequently queried columns
2. **Connection Pooling:** Neon automatically handles connection pooling
3. **Caching:** Connection caching is enabled in `lib/neonDb.ts`

## Support

- Neon Documentation: https://neon.tech/docs
- Neon Discord: https://discord.gg/neon
- GitHub Issues: Create an issue in this repository

## Migration Checklist

- [ ] Created Neon project
- [ ] Added `DATABASE_URL` to `.env.local`
- [ ] Ran `neon-schema.sql` in Neon console
- [ ] Verified all tables exist
- [ ] Tested API endpoints
- [ ] Removed old Supabase environment variables
