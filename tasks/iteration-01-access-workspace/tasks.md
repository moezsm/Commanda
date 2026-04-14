# Iteration 01 — Access and Workspace

## Iteration Goal

Deliver secure authentication and strict one-workspace-per-seller isolation. No seller can see another seller's data.

## Dependencies

- Iteration 00 completed and `decisions.md` signed off
- Supabase project provisioned
- Vercel project connected to repository

## Iteration MVP End State

Any seller can sign up, receive a dedicated workspace, and log in to a mobile-first shell. Cross-tenant access is blocked at the database level.

---

## Tickets

### T01-01 — Provision Supabase project and set environment variables

- **Effort:** 1 h
- **Input:** Supabase account, Vercel project
- **Output:** `.env.local` template committed with `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` placeholders; Supabase project live
- **Acceptance test:** `supabase status` or dashboard shows project active; Next.js app boots without missing env errors

---

### T01-02 — Scaffold Next.js app with TypeScript and Tailwind

- **Effort:** 2 h
- **Input:** Next.js 14 App Router, TypeScript, Tailwind CSS
- **Output:** Repo contains working Next.js app with App Router, TypeScript strict mode, and Tailwind; a bare mobile-first layout shell at `/`
- **Acceptance test:** `npm run build` passes with zero TypeScript errors; layout renders correctly on 375 px viewport

---

### T01-03 — Create `workspaces` table with RLS

- **Effort:** 1 h
- **Input:** `data-model-plan.md` section 4 (Workspace entity), T00-05 decision record
- **Output:** Supabase migration file creating `workspaces` table with columns `id`, `owner_user_id`, `display_name`, `country_code`, `default_currency`, `plan_tier`, `plan_status`, `created_at`; RLS policy: owner can read and update their own workspace only
- **Acceptance test:** Authenticated user can read their own workspace row; `select * from workspaces` as a different user returns zero rows for the first user's workspace

---

### T01-04 — Implement sign-up flow

- **Effort:** 2 h
- **Input:** Supabase Auth email/password, T01-03
- **Output:** `/sign-up` screen with email and password fields; on success, creates a workspace row owned by the new user and redirects to onboarding; form shows inline field validation errors
- **Acceptance test:** New user registers, workspace row exists in `workspaces` table with correct `owner_user_id`; duplicate email shows error

---

### T01-05 — Implement sign-in and sign-out flow

- **Effort:** 1 h
- **Input:** Supabase Auth session, T01-04
- **Output:** `/sign-in` screen; successful login redirects to `/home`; sign-out clears session and redirects to `/sign-in`; protected routes redirect unauthenticated users to `/sign-in`
- **Acceptance test:** Sign-in works for an existing account; visiting `/home` unauthenticated redirects to `/sign-in`

---

### T01-06 — Implement basic onboarding screen

- **Effort:** 1 h
- **Input:** T01-04, `mobile-user-flows.md` section 12
- **Output:** `/onboarding` screen shown once after sign-up; seller enters workspace display name; on save, updates `workspaces.display_name` and redirects to `/home`
- **Acceptance test:** Onboarding screen appears only for workspaces with no display name set; submitting a name persists it and skips onboarding on next login

---

### T01-07 — Implement workspace settings screen

- **Effort:** 1 h
- **Input:** T01-03, T01-06
- **Output:** `/settings/workspace` screen showing and allowing edit of `display_name`, `country_code`, `default_currency`
- **Acceptance test:** Changes save correctly; refreshing shows updated values; another user's workspace settings are not reachable

---

### T01-08 — Validate cross-tenant isolation

- **Effort:** 2 h
- **Input:** T01-03, T01-05
- **Output:** Test document or automated test demonstrating that User A cannot read User B's workspace via direct Supabase SDK calls using User A's session token
- **Acceptance test:** All cross-tenant read attempts return empty results or RLS error; no bypass exists via direct table query

---

### T01-09 — Implement mobile bottom navigation shell

- **Effort:** 2 h
- **Input:** `mobile-user-flows.md` section 3, T01-05
- **Output:** Persistent bottom navigation with tabs: Home, Orders, Customers, More; each tab renders a placeholder page; navigation is touch-friendly on 375 px viewport
- **Acceptance test:** All tabs are tappable and route correctly; active tab is visually indicated; no horizontal scroll on 375 px
