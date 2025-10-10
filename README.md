# Racket Tracker

Lightweight badminton racket stringing intake & tracking app. Now wired for Supabase.

## Environment Variables

Create a `.env.local` with:

````markdown
# Ralli

Lightweight badminton racket stringing intake & tracking app with Auth0 authentication and Supabase backend.

## 🔒 Security

**All data routes and features are now protected with Auth0 authentication.**

- **Protected:** `/orders`, `/products`, and all `/api/orders` endpoints
- **Public:** `/`, `/form` (kiosk intake), `/about`, `/contact`, `/lessons`

See [SECURITY.md](./SECURITY.md) for detailed security implementation.

## Environment Variables

Create a `.env.local` with:

```bash
# Auth0 Configuration
AUTH0_SECRET='use-openssl-rand-hex-32'
AUTH0_DOMAIN='your-domain.auth0.com'
AUTH0_CLIENT_ID='your-client-id'
AUTH0_CLIENT_SECRET='your-client-secret'
AUTH0_SCOPE='openid profile email'
APP_BASE_URL='http://localhost:3000'

# Store Configuration
STORE_ID=1

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=service_role_key
```

## Auth0 Setup

1. Create an Auth0 account and application
2. Configure callback URLs in Auth0 dashboard:
   - Allowed Callback URLs: `http://localhost:3000/auth/callback`
   - Allowed Logout URLs: `http://localhost:3000`
   - Allowed Web Origins: `http://localhost:3000`
3. Copy credentials to `.env.local`
4. Generate secret: `openssl rand -hex 32`

See [AUTH0_GUIDE.md](./AUTH0_GUIDE.md) for detailed Auth0 usage.

## Supabase Schema

Use the provided SQL (see `supabase-schema.sql`) to create tables. Add a convenience view for API aggregation:

```sql
create or replace view jobs_view as
select
  j.id,
  j.store_id,
  j.status,
  j.service_type,
  j.additional_notes,
  j.created_at,
  j.updated_at,
  c.full_name as customer_name,
  c.contact_number,
  c.email,
  r.brand as racket_brand,
  r.model as racket_model,
  r.string_type
from jobs j
join customers c on c.id = j.customer_id
left join rackets r on r.id = j.racket_id;
```

## API Routes (Protected)

All API routes require authentication:

- `GET /api/orders?storeId=1` - list orders (requires auth)
- `POST /api/orders` - create order (requires auth)
- `PATCH /api/orders/:id` - update status/notes (requires auth)
- `DELETE /api/orders/:id` - remove job (requires auth)

## Authentication Routes (Public)

Auto-configured by Auth0 SDK:

- `/auth/login` - Login with Auth0
- `/auth/logout` - Logout
- `/auth/callback` - OAuth callback
- `/auth/profile` - Get user profile

## Roadmap

- ✅ Auth0 authentication with session management
- ✅ Protected API routes and pages
- ✅ Public kiosk intake form
- 🚧 Role-based access control (RBAC) for multi-store
- 🚧 Realtime subscriptions (Supabase channel) to live-update dashboard
- 🚧 Bulk status update endpoint
- 🚧 Order tension + pricing fields

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Auth0 and Supabase credentials

# Run development server
npm run dev

# Visit http://localhost:3000
# Login to access /orders and /products
```
````

## Supabase Schema

Use the provided SQL (see `supabase-schema.sql`) to create tables. Add a convenience view for API aggregation:

```sql
create or replace view jobs_view as
select
  j.id,
  j.store_id,
  j.status,
  j.service_type,
  j.additional_notes,
  j.created_at,
  j.updated_at,
  c.full_name as customer_name,
  c.contact_number,
  c.email,
  r.brand as racket_brand,
  r.model as racket_model,
  r.string_type
from jobs j
join customers c on c.id = j.customer_id
left join rackets r on r.id = j.racket_id;
```

## API Routes

- `GET /api/orders?storeId=1` list
- `POST /api/orders` create (auto upserts customer + racket)
- `PATCH /api/orders/:id` update status/notes
- `DELETE /api/orders/:id` remove job

## Roadmap

- Auth (Supabase Auth, RLS policies)
- Realtime subscriptions (Supabase channel) to live-update dashboard
- Bulk status update endpoint
- Order tension + pricing fields
