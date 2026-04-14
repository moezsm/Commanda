# Iteration 05 — Search and Dashboard

## Iteration Goal

Give sellers fast access to what needs attention now and a reliable way to find any record quickly.

## Dependencies

- Iteration 04 completed
- Orders, customers, archive, status, and lifecycle all working

## Iteration MVP End State

Home dashboard provides an actionable daily snapshot. Search and filters work across orders and customers within the workspace.

---

## Tickets

### T05-01 — Implement order status filter on active list

- **Effort:** 1 h
- **Input:** T03-08, T03-03
- **Output:** Filter chips or dropdown on `/orders` screen for each status value: All (default), New, Confirmed, Prepared, Shipped, Delivered; filters query using `(workspace_id, is_archived, status)` index
- **Acceptance test:** Selecting a status chip shows only matching active orders; All chip shows all non-archived; no cross-tenant results

---

### T05-02 — Implement delivery company filter on active list

- **Effort:** 1 h
- **Input:** T03-08, T02-07
- **Output:** Secondary filter control on `/orders` screen for delivery company; shows workspace's active companies as options; filters by `delivery_company_id`
- **Acceptance test:** Filtering by company shows only orders using that company; combined with status filter both predicates apply

---

### T05-03 — Implement order search by customer or reference

- **Effort:** 2 h
- **Input:** T03-08, `data-model-plan.md` section 8
- **Output:** Search input on `/orders` screen; queries `client_name_snapshot`, `client_phone_snapshot`, `order_reference` with `ilike` scoped to `workspace_id` and `is_archived = false`; debounced to 300 ms
- **Acceptance test:** Typing 3+ characters returns matching orders; no archived orders appear; empty query resets to full active list

---

### T05-04 — Improve customer search with phone prefix match

- **Effort:** 1 h
- **Input:** T02-03
- **Output:** Customer search on `/customers` updated to search both `full_name` and `phone_primary` using the `(workspace_id, phone_primary)` index; phone search works from first digits entered
- **Acceptance test:** Entering 6 digits matches customers whose phone starts with those digits; name search still works

---

### T05-05 — Implement home dashboard screen

- **Effort:** 3 h
- **Input:** `mobile-user-flows.md` section 11, T03-08, T04-01
- **Output:** `/home` screen displaying: New Order primary button, count card for active orders, count card for orders awaiting shipment (status `confirmed` or `prepared`), count card for orders delivered today, list of 5 most recently updated active orders with status chips; all counts fetched in a single aggregated workspace-scoped query
- **Acceptance test:** Counts are accurate after order status changes; tapping a recent order navigates to order detail; counts do not include archived orders; screen loads in under 1.5 s on simulated mobile

---

### T05-06 — Add composite indexes for search performance

- **Effort:** 1 h
- **Input:** T03-01, T02-01, `data-model-plan.md` section 8
- **Output:** Migration adding: `(workspace_id, client_name_snapshot)` on `orders`; `(workspace_id, client_phone_snapshot)` on `orders`; confirm `(workspace_id, full_name)` and `(workspace_id, phone_primary)` on `customers` exist from T02-01
- **Acceptance test:** `EXPLAIN` on workspace-scoped name search uses the new index; no sequential scans on orders or customers within a workspace
