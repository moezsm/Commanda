# Iteration 03 — Order Capture

## Iteration Goal

Deliver the central value loop. After receiving an order on social media, the seller can save it in Commanda with product, client, delivery company, and notes in under one minute.

## Dependencies

- Iteration 02 completed
- `customers` and `delivery_companies` tables and pickers ready

## Iteration MVP End State

Commanda is usable for real daily order recording. The core promise is delivered.

---

## Tickets

### T03-01 — Create `orders` and `order_items` tables with RLS

- **Effort:** 2 h
- **Input:** `data-model-plan.md` section 4 (Order and Order item snapshot entities)
- **Output:** Migrations for `orders` (`id`, `workspace_id`, `customer_id`, `delivery_company_id`, `order_reference`, `source_channel`, `status`, `total_amount_snapshot`, `currency_code`, `delivery_address_snapshot`, `delivery_city_snapshot`, `client_name_snapshot`, `client_phone_snapshot`, `notes`, `is_archived`, `archived_at`, `created_by`, `created_at`, `updated_at`) and `order_items` (`id`, `workspace_id`, `order_id`, `product_name_snapshot`, `sku_snapshot`, `quantity`, `unit_price_snapshot`, `line_total_snapshot`, `created_at`); RLS on both; indexes on `(workspace_id, is_archived, updated_at)` and `(workspace_id, status)`
- **Acceptance test:** Rows visible only within correct workspace; index exists; `is_archived` defaults to false

---

### T03-02 — Create `order_status_history` table with RLS

- **Effort:** 1 h
- **Input:** `data-model-plan.md` section 4 (Order status history entity)
- **Output:** Migration for `order_status_history` (`id`, `workspace_id`, `order_id`, `status`, `changed_by`, `change_note`, `created_at`); RLS workspace-scoped; index on `(workspace_id, order_id, created_at)`
- **Acceptance test:** Status entry created on order insert; readable only within workspace

---

### T03-03 — Define order status enum

- **Effort:** 30 min
- **Input:** `product-study.md` section 5, `data-model-plan.md`
- **Output:** Postgres enum or constrained text check: `new`, `confirmed`, `prepared`, `shipped`, `delivered`, `cancelled`, `archived`; TypeScript enum in `lib/types.ts` matching exactly
- **Acceptance test:** Invalid status string is rejected at database level; TypeScript type matches DB enum

---

### T03-04 — Implement new order form — structure and fields

- **Effort:** 3 h
- **Input:** `mobile-user-flows.md` section 4, T03-01, T02-06, T02-09
- **Output:** `/orders/new` screen with sections: customer (uses `CustomerPicker`), product (product name, SKU optional, quantity, unit price optional), delivery company (uses `DeliveryCompanyPicker`), delivery details (address auto-filled from customer, editable), source channel (Facebook, Instagram, WhatsApp, Other), notes; Save button fixed at bottom
- **Acceptance test:** All required fields show inline error if empty on submit; form renders correctly on 375 px viewport

---

### T03-05 — Implement order save server action

- **Effort:** 2 h
- **Input:** T03-01, T03-02, T03-03, T03-04
- **Output:** Next.js server action that: inserts `orders` row with snapshots from customer and form, inserts `order_items` row(s), inserts initial `order_status_history` row with status `new` or `confirmed`, scopes all inserts to `workspace_id` from session
- **Acceptance test:** On submit, order row and items row and status history row all exist in DB with correct `workspace_id`; client snapshot fields are stored even if customer data later changes

---

### T03-06 — Implement order detail screen

- **Effort:** 2 h
- **Input:** T03-05, `mobile-user-flows.md` section 7
- **Output:** `/orders/[id]` screen showing: status badge, customer summary (tappable to customer profile), product lines, delivery company and notes, source channel, order notes, status timeline (from `order_status_history`); edit and archive actions accessible
- **Acceptance test:** All saved fields render correctly; tapping customer navigates to `/customers/[id]`; inaccessible order id returns 404 or redirect

---

### T03-07 — Implement order edit screen

- **Effort:** 2 h
- **Input:** T03-04, T03-05
- **Output:** `/orders/[id]/edit` screen pre-filled with existing order data; saves updated values including new snapshots; does not overwrite `order_status_history`
- **Acceptance test:** Editing customer and saving produces updated snapshot; original status history is intact

---

### T03-08 — Implement active orders list screen

- **Effort:** 2 h
- **Input:** T03-01, `mobile-user-flows.md` section 8
- **Output:** `/orders` screen: lists orders where `is_archived = false` for the workspace; sorted by `updated_at` descending; each row shows customer name, product summary, status chip, delivery company name; FAB for new order; empty state with CTA
- **Acceptance test:** Archived orders do not appear; list paginates at 30 items; renders in under 1 s for 30 item workspace on mobile
