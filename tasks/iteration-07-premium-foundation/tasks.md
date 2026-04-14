# Iteration 07 — Premium Foundation

## Iteration Goal

Build the entitlement and feature-flag infrastructure that allows premium features to be enabled per workspace without immediate billing complexity.

## Dependencies

- Iteration 06 completed
- Free plan limits confirmed and enforced

## Iteration MVP End State

Commanda can gate features by plan tier. A workspace can be manually elevated to premium. Stripe can be added later without schema changes.

---

## Tickets

### T07-01 — Create `subscriptions` and `workspace_entitlements` tables

- **Effort:** 2 h
- **Input:** `data-model-plan.md` section 11
- **Output:** Migrations for: `subscriptions` (`id`, `workspace_id`, `plan_tier`, `plan_status`, `billing_customer_ref`, `current_period_start`, `current_period_end`, `created_at`, `updated_at`); `workspace_entitlements` (`id`, `workspace_id`, `feature_key`, `enabled`, `created_at`); RLS on both; `workspaces.plan_tier` updated by subscription status
- **Acceptance test:** Rows only readable by the owning workspace; inserting a `subscriptions` row with `plan_tier = premium` and updating `workspaces.plan_tier` is the full activation path

---

### T07-02 — Implement feature flag utility

- **Effort:** 1 h
- **Input:** T07-01, `workspaces.plan_tier`
- **Output:** `lib/features.ts` TypeScript module exporting `hasFeature(workspaceId: string, featureKey: FeatureKey): Promise<boolean>`; checks `workspace_entitlements` first, falls back to plan_tier default map; `FeatureKey` enum defined with initial keys: `bulk_status_update`, `analytics`, `team_access`, `export`
- **Acceptance test:** `hasFeature` returns `false` for a free workspace on a premium key; returns `true` after manual entitlement insert; TypeScript compiles cleanly

---

### T07-03 — Gate premium UI entry points

- **Effort:** 2 h
- **Input:** T07-02
- **Output:** `PremiumGate` React component wrapping premium-only UI blocks; shows children if feature is enabled, shows a locked state with upgrade prompt if not; apply to: bulk action button placeholder on orders list, analytics tab placeholder, team tab placeholder in More screen
- **Acceptance test:** Free workspace sees locked state; premium workspace sees real content; no premium data is fetched for free workspace

---

### T07-04 — Gate premium API routes and server actions

- **Effort:** 1 h
- **Input:** T07-02
- **Output:** Middleware-level or action-level guard: any server action requiring a premium feature calls `hasFeature` first; returns `403` with `{ error: 'plan_required', feature: key }` if not entitled
- **Acceptance test:** Calling a premium server action from a free workspace returns the structured error; calling from a premium workspace proceeds normally

---

### T07-05 — Implement manual workspace plan elevation

- **Effort:** 1 h
- **Input:** T07-01, T07-02
- **Output:** Supabase service-role SQL script `scripts/elevate-workspace.sql` that sets `plan_tier = 'premium'` on `workspaces` and inserts a `subscriptions` row with `plan_status = 'active'`; used by operator to test premium without Stripe; documented in usage comment in script
- **Acceptance test:** Running script on a workspace makes `hasFeature` return `true` for premium keys; reverting script restores free behavior

---

### T07-06 — Add product event tracking for conversion insight

- **Effort:** 2 h
- **Input:** T06-05, T07-03
- **Output:** `workspace_events` table (`id`, `workspace_id`, `event_key`, `metadata`, `created_at`); server-side event writes on: order created, archive triggered, limit warning shown, upgrade screen visited, premium gate encountered; TypeScript `trackEvent(workspaceId, key, metadata?)` helper
- **Acceptance test:** Event rows exist after each tracked action; rows are workspace-scoped; no PII in `metadata`

---

### T07-07 — Prepare Stripe integration interface

- **Effort:** 2 h
- **Input:** T07-01, `pricing-model.md` section 7
- **Output:** `lib/billing.ts` stub module with typed interface: `createCheckoutSession(workspaceId, priceId)`, `handleWebhook(event)`, `cancelSubscription(workspaceId)`; all functions throw `NotImplementedError` for now; Stripe SDK added to `package.json` but not yet wired; `.env.local` template updated with `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` placeholders
- **Acceptance test:** TypeScript compiles; calling stub functions throws a clear not-implemented error; Stripe is not charged
