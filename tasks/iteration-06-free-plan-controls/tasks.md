# Iteration 06 — Free Plan Controls

## Iteration Goal

Enforce freemium limits at the workspace level without breaking the core daily workflow for free-tier sellers.

## Dependencies

- Iteration 05 completed
- All core workflows functional
- Free plan limits confirmed in `tasks/iteration-00-foundation/decisions.md`

## Iteration MVP End State

Free-tier limits are enforced and observable. Core order workflow remains usable. Platform is ready for premium conversion testing.

---

## Tickets

### T06-01 — Implement active order count check server-side

- **Effort:** 1 h
- **Input:** T00-02 decisions, T03-05, `workspaces.plan_tier`
- **Output:** Server action for order creation checks current `count(*) where is_archived = false and workspace_id = ?` against the free plan limit before inserting; returns a structured error if limit reached
- **Acceptance test:** Creating an order when at the cap returns a clear error; creating at cap minus one succeeds; premium workspace bypasses the check

---

### T06-02 — Implement soft-limit warning banner

- **Effort:** 1 h
- **Input:** T06-01, T03-08, T05-05
- **Output:** Banner component shown on `/orders` and `/home` when active order count is within 10 of the free plan limit; message explains the limit and links to an upgrade info screen; dismissable per session
- **Acceptance test:** Banner appears at correct threshold; does not appear for premium workspaces; dismissing hides it until next session

---

### T06-03 — Implement hard-limit block on new order form

- **Effort:** 1 h
- **Input:** T06-01, T03-04
- **Output:** When a free workspace has reached the active order cap, the New Order button and FAB show a disabled state with a tooltip explaining the limit; form is not accessible until orders are archived
- **Acceptance test:** At cap, FAB is disabled; tapping shows upgrade message; archiving one order re-enables the button

---

### T06-04 — Implement upgrade info screen

- **Effort:** 1 h
- **Input:** `pricing-model.md` sections 5 and 7
- **Output:** `/upgrade` screen describing premium plan benefits, noting it is coming soon or providing a waitlist email input; no billing integration yet
- **Acceptance test:** Screen is accessible from the warning banner and from the More tab; no payment flow is present yet

---

### T06-05 — Implement workspace usage stats for operator insight

- **Effort:** 2 h
- **Input:** T03-01, T04-03
- **Output:** Supabase Edge Function or server action that writes a daily snapshot of `active_order_count`, `archived_order_count`, `customer_count` per workspace into a `workspace_usage_snapshots` table; run manually or via cron approach; table includes `workspace_id`, `snapshot_date`, counts
- **Acceptance test:** Snapshot row is created with correct counts; row is workspace-scoped and not readable cross-tenant

---

### T06-06 — Validate free plan does not break small seller flow

- **Effort:** 1 h
- **Input:** All T06 tickets
- **Output:** Manual test checklist document at `tasks/iteration-06-free-plan-controls/validation.md` covering: create order under limit passes, create at limit blocked, soft warning appears, archive unblocks, core search and dashboard work unaffected
- **Acceptance test:** All checklist items pass; no regression in Iterations 01–05 functionality
