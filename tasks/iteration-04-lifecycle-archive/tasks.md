# Iteration 04 — Lifecycle and Archive

## Iteration Goal

Deliver order status progression and a clean archive layer so the active order list stays lean and fast regardless of historical volume.

## Dependencies

- Iteration 03 completed
- `orders`, `order_status_history`, and active list in place

## Iteration MVP End State

Seller can track an order from receipt to delivery and archive completed work. Active list never shows clutter.

---

## Tickets

### T04-01 — Implement status update action and sheet

- **Effort:** 2 h
- **Input:** T03-03, T03-06
- **Output:** Bottom sheet on order detail screen offering valid next-state transitions: `new → confirmed → prepared → shipped → delivered`; also allow `cancelled` from any non-archived state; saving writes new `order_status_history` row and updates `orders.status` and `orders.updated_at`
- **Acceptance test:** Status chip on order detail updates immediately after selection; history timeline adds the new entry; invalid transitions (e.g. delivered → new) are not offered

---

### T04-02 — Implement status history timeline component

- **Effort:** 1 h
- **Input:** T04-01, `order_status_history` table
- **Output:** `StatusTimeline` reusable component rendering rows from `order_status_history` ordered by `created_at` ascending; shows status label, changed-by, optional note, and time
- **Acceptance test:** All history entries appear in chronological order; component renders correctly on 375 px

---

### T04-03 — Implement manual archive action

- **Effort:** 1 h
- **Input:** T03-06, T00-06 archive decision record
- **Output:** Archive option in order detail action menu; confirmation dialog; on confirm: sets `orders.is_archived = true`, `orders.archived_at = now()`, appends `archived` status to `order_status_history`
- **Acceptance test:** Archived order disappears from active list immediately; `is_archived` and `archived_at` are set in DB; status history has archive entry

---

### T04-04 — Auto-archive delivered orders

- **Effort:** 1 h
- **Input:** T04-01, T04-03
- **Output:** When status is set to `delivered`, display a prompt offering to archive immediately or keep active; if user accepts, triggers archive action; if dismissed, order stays active until manual archive
- **Acceptance test:** Delivered order with auto-archive accepted moves to archive; dismissed delivered order stays in active list at `delivered` status

---

### T04-05 — Implement archive list screen

- **Effort:** 2 h
- **Input:** T04-03, `mobile-user-flows.md` section 10
- **Output:** `/orders/archive` screen listing orders where `is_archived = true` for the workspace; sorted by `archived_at` descending; search input filtering by customer name, phone, or product name snapshot; each row shows customer name, product summary, archive date, final status
- **Acceptance test:** Active orders never appear; search returns correct matches within workspace only; long archive list paginates at 30 items

---

### T04-06 — Add archive navigation entry point

- **Effort:** 30 min
- **Input:** T04-05, navigation shell from T01-09
- **Output:** Archive link added to the More/Settings tab navigation; visible and accessible from all screens
- **Acceptance test:** Tapping archive entry navigates to `/orders/archive`
