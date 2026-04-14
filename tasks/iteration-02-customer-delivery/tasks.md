# Iteration 02 — Customers and Delivery Companies

## Iteration Goal

Deliver the reusable customer and courier data layer so order capture in Iteration 03 has real entities to link.

## Dependencies

- Iteration 01 completed
- `workspaces` table, RLS, and session in place

## Iteration MVP End State

Seller can create, search, and select customers and delivery companies. All records are strictly workspace-scoped.

---

## Tickets

### T02-01 — Create `customers` table with RLS

- **Effort:** 1 h
- **Input:** `data-model-plan.md` section 4 (Customer entity)
- **Output:** Migration: `customers` table with `id`, `workspace_id`, `full_name`, `phone_primary`, `phone_secondary`, `address_line`, `city`, `region`, `country_code`, `notes`, `created_at`, `updated_at`; RLS: workspace members can only read and write their workspace rows; composite index on `(workspace_id, phone_primary)` and `(workspace_id, full_name)`
- **Acceptance test:** Insert as User A is invisible to User B's session; index exists in schema

---

### T02-02 — Create `delivery_companies` table with RLS

- **Effort:** 1 h
- **Input:** `data-model-plan.md` section 4 (Delivery company entity)
- **Output:** Migration: `delivery_companies` table with `id`, `workspace_id`, `name`, `contact_name`, `contact_phone`, `notes`, `is_active`, `created_at`; RLS: workspace-scoped read/write; index on `(workspace_id, is_active)`
- **Acceptance test:** Row created by User A is not readable by User B

---

### T02-03 — Implement customer list screen

- **Effort:** 2 h
- **Input:** T02-01, `mobile-user-flows.md` section 9
- **Output:** `/customers` screen showing workspace customers; sorted by most recent; search input filtering by name or phone; empty state with add CTA
- **Acceptance test:** 20-item list renders in under 1 s; search filters results on keystroke; empty state shows when no customers exist

---

### T02-04 — Implement create and edit customer screen

- **Effort:** 2 h
- **Input:** T02-01, `mobile-user-flows.md` section 5
- **Output:** `/customers/new` and `/customers/[id]/edit` screens; fields: full name (required), phone primary (required), phone secondary, address line, city, notes; save button fixed at bottom; inline validation
- **Acceptance test:** Required field validation blocks save; saved customer appears in list; edit persists changes; delete of non-linked customer works

---

### T02-05 — Implement customer detail screen

- **Effort:** 1 h
- **Input:** T02-04
- **Output:** `/customers/[id]` screen showing all customer fields; edit shortcut; placeholder order history section (populated in Iteration 03)
- **Acceptance test:** All saved fields display correctly; edit button navigates to edit screen

---

### T02-06 — Implement customer picker component

- **Effort:** 2 h
- **Input:** T02-03, T02-04
- **Output:** Reusable `CustomerPicker` component: opens as a sheet/modal, search input, existing customer rows, "Add new" inline option that opens create form and returns selection; usable inside the order form in Iteration 03
- **Acceptance test:** Selecting existing customer returns `customer_id`; adding new customer saves it and returns new `customer_id`; no navigation away from parent form

---

### T02-07 — Implement delivery company list screen

- **Effort:** 1 h
- **Input:** T02-02, `mobile-user-flows.md` section 6
- **Output:** `/settings/delivery-companies` screen listing active delivery companies; add and edit actions; toggle active/inactive
- **Acceptance test:** Only `is_active = true` companies appear by default; inactive toggle hides the company from picker

---

### T02-08 — Implement create and edit delivery company screen

- **Effort:** 1 h
- **Input:** T02-02
- **Output:** `/settings/delivery-companies/new` and `/settings/delivery-companies/[id]/edit`; fields: name (required), contact name, contact phone, notes; save and delete actions
- **Acceptance test:** Required field validation blocks save; saved company appears in list

---

### T02-09 — Implement delivery company picker component

- **Effort:** 1 h
- **Input:** T02-07, T02-08
- **Output:** Reusable `DeliveryCompanyPicker` component showing active companies; "Add new" inline option; returns `delivery_company_id` to parent form
- **Acceptance test:** Picker shows only active companies; adding new company saves it and returns its id; no navigation away from parent
