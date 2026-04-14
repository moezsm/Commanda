# Iteration 00 — Foundation

## Iteration Goal

Lock all architecture and product decisions so implementation begins with no open blockers.

## Dependencies

- All existing planning documents (`product-study.md`, `feature-design.md`, `data-model-plan.md`, `pricing-model.md`, `technology-selection.md`)

## Iteration MVP End State

A signed-off architecture blueprint exists. An implement agent can start Iteration 01 immediately.

---

## Tickets

### T00-01 — Lock MVP scope and non-goals

- **Effort:** 1 h
- **Input:** `product-study.md` section 6, `feature-design.md` modules A–H
- **Output:** Updated `tasks/README.md` with a confirmed scope checklist and explicit out-of-scope list
- **Acceptance test:** Non-goals list exists, includes full inventory, marketplace integrations, real-time courier API, team permissions, and e-invoicing

---

### T00-02 — Confirm free plan limits

- **Effort:** 1 h
- **Input:** `pricing-model.md` sections 4 and 10
- **Output:** A short decision record added to `tasks/iteration-00-foundation/decisions.md` listing exact active order cap, team seat limit, and export restriction for the free plan
- **Acceptance test:** Limits are numeric and unambiguous so they can be enforced in code

---

### T00-03 — Confirm premium packaging boundaries

- **Effort:** 1 h
- **Input:** `pricing-model.md` sections 5 and 11, `feature-design.md` section 4
- **Output:** `tasks/iteration-00-foundation/decisions.md` extended with the first premium wave feature list
- **Acceptance test:** Each premium feature is named and assigned to premium wave 1, 2, or 3; e-invoicing is confirmed as last

---

### T00-04 — Confirm Tunisia-first language strategy

- **Effort:** 30 min
- **Input:** `product-study.md` section 12
- **Output:** Decision record entry: one language at launch (French), Arabic as second phase OR bilingual from day one, with rationale
- **Acceptance test:** Decision is explicit, not open. Implement agent knows which locale to scaffold

---

### T00-05 — Confirm tenant model and RLS approach

- **Effort:** 1 h
- **Input:** `data-model-plan.md` sections 3, 7, 8
- **Output:** Decision record entry confirming workspace-based multi-tenancy, `workspace_id` on all operational tables, and Supabase RLS as the isolation mechanism
- **Acceptance test:** The decision record lists every core table that must carry `workspace_id` and states the RLS rule pattern

---

### T00-06 — Confirm archive policy rules

- **Effort:** 30 min
- **Input:** `data-model-plan.md` section 9
- **Output:** Decision record entry with archive trigger conditions (delivered status, manual action), `is_archived` flag approach, and the rule that active views must exclude archived records
- **Acceptance test:** Archive trigger and query exclusion rule is written down and unambiguous

---

### T00-07 — Define MVP performance KPIs

- **Effort:** 1 h
- **Input:** `mobile-user-flows.md` section 4, `technology-selection.md` section 4
- **Output:** Decision record entry listing measurable KPIs: order save round-trip time target, active order list load time target, customer search response time target
- **Acceptance test:** KPIs are numeric (e.g. order save completes in under 2 seconds on a mid-range mobile device on a 4G connection)

---

### T00-08 — Approve iteration sequence and agent handoff protocol

- **Effort:** 30 min
- **Input:** `tasks/README.md`
- **Output:** `tasks/README.md` updated to confirm definition-of-ready and definition-of-done language
- **Acceptance test:** `tasks/README.md` is the single source of truth for iteration order and handoff rules
