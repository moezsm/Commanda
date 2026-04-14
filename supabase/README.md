# Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Wait for provisioning (~2 min).

## 2. Configure Environment Variables

Copy `.env.local.example` to `.env.local` in the `app/` folder and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Get these values from: **Project Settings → API** in the Supabase dashboard.

## 3. Run Migrations

Execute the SQL migration files in order via the Supabase SQL editor or CLI:

```
supabase/migrations/
├── 001_workspaces_profiles.sql     — Workspaces, profiles, RLS helper function
├── 002_customers_delivery_companies.sql — Customers, delivery companies, RLS
├── 003_orders.sql                  — Orders, order items, order status history
├── 004_usage_snapshots.sql         — Workspace usage snapshots (operator only)
└── 005_premium_foundation.sql      — Subscriptions, entitlements, events
```

To run via Supabase dashboard:
1. Open **SQL Editor** in your project.
2. Paste each file's content and run in numbered order.

## 4. Authentication Configuration

In **Authentication → URL Configuration**:
- **Site URL**: `http://localhost:3000` (development) or your Vercel URL (production)
- **Redirect URLs**: Add `http://localhost:3000/auth/callback` and `https://yourdomain.vercel.app/auth/callback`

In **Authentication → Email**:
- Enable email/password provider (enabled by default).
- Configure SMTP for production (or use the built-in Supabase SMTP for development).

## 5. Cross-Tenant Isolation Verification

To verify RLS policies work correctly after setup:

1. Create two test accounts (User A and User B).
2. Both go through onboarding.
3. With User A's session, insert a test row in `orders`.
4. Using User B's Supabase client, query `SELECT * FROM orders` — must return 0 rows.

## 6. Premium Elevation (Test Operator)

To test premium features without Stripe:
1. Get the workspace UUID from the `workspaces` table.
2. Run `supabase/scripts/elevate-workspace.sql` replacing `<WORKSPACE_ID>`.
3. This sets `plan_tier = 'premium_wave1'` and inserts a 30-day subscription.

## 7. Usage Snapshots (Analytics)

The `workspace_usage_snapshots` table is write-only for workspace members. Populate it by running the server action or Edge Function with the service role key. Use this for operator dashboards and conversion analysis.
