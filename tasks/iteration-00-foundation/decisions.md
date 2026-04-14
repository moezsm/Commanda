# Iteration 00 — Foundation Decisions

Signed-off decisions for all implementation agents. These are locked unless a new architecture decision explicitly overrides them.

---

## T00-02 — Free Plan Limits (Confirmed)

| Limit | Value | Enforcement |
|---|---|---|
| Active orders (non-archived) | 150 orders max | DB-level counter check on insert |
| Team members per workspace | 1 (solo only) | Blocked in invite flow; no team tables in MVP |
| Exports | Not available on free plan | Feature-flagged off |
| Product catalog | Not available (manual entry only) | No catalog tables in MVP |
| Advanced analytics | Not available | Feature-flagged off |
| Archived orders | Unlimited (archive-first retrieval) | No cap on archived rows |

**Rationale:** 150 active orders supports a small seller's daily flow (~5–10 orders/day × 2–4 week active cycle) without creating uncontrolled DB growth. Archived orders remain accessible so sellers are never data-locked.

---

## T00-03 — Premium Packaging Boundaries (Confirmed)

### Premium Wave 1 (first paid tier)
- Unlimited active orders
- Team access (up to 3 seats)
- CSV export of orders and customers
- Advanced order filters (date range, status, delivery company)
- Bulk status update

### Premium Wave 2 (second paid tier)
- Unlimited team seats
- Customer insights (repeat buyer frequency, average order value)
- Reusable product catalog with pricing
- Branded delivery slips (PDF generation)

### Premium Wave 3 (last — compliance)
- E-invoicing: Tunisia FATUR compliance
- E-invoicing: French invoicing requirements (FAZ/TVA)

**Confirmed:** E-invoicing is the last premium feature. No shortcuts.

---

## T00-04 — Tunisia-First Language Strategy (Confirmed)

**Decision: French at launch only.**

- UI language at MVP: French exclusively
- Locale: `fr-TN` for number formatting, date formatting, currency (TND)
- Arabic: Phase 2 addition (RTL layout support deferred)
- Rationale: Tunisian social-media sellers primarily operate in French for professional communications. Single locale reduces implementation complexity and allows faster launch.

**What this means for implement agents:**
- All UI strings in French
- Use `next-intl` or a lightweight i18n solution with `fr` as the only namespace at launch
- Keep string keys in code so Arabic can be added without refactor

---

## T00-05 — Tenant Model and RLS Approach (Confirmed)

**Decision: Workspace-based multi-tenancy with Supabase RLS.**

### Tables that MUST carry `workspace_id`

| Table | workspace_id required |
|---|---|
| workspaces | N/A (is the root entity) |
| profiles | yes |
| customers | yes |
| delivery_companies | yes |
| orders | yes |
| order_items | yes |
| order_status_history | yes |
| plan_usage | yes |

### RLS Rule Pattern

```sql
-- Standard read policy for workspace-scoped tables
CREATE POLICY "workspace_isolation_select"
  ON <table_name>
  FOR SELECT
  USING (workspace_id = (
    SELECT workspace_id FROM profiles WHERE id = auth.uid()
  ));

-- Standard write policy
CREATE POLICY "workspace_isolation_insert"
  ON <table_name>
  FOR INSERT
  WITH CHECK (workspace_id = (
    SELECT workspace_id FROM profiles WHERE id = auth.uid()
  ));
```

**Every server action must explicitly scope queries with `workspace_id`. No unscoped reads in production code.**

---

## T00-06 — Archive Policy Rules (Confirmed)

**Archive trigger conditions:**
1. Manual — seller clicks "Archive" on an order in `delivered` or `cancelled` status
2. Automatic — future: orders older than 90 days in `delivered` status (deferred to iteration 04)

**Implementation approach:**
- Use `is_archived boolean DEFAULT false` column on `orders` table
- Use `archived_at timestamptz` column to record when archival occurred
- Active views: always add `WHERE is_archived = false` to order list queries
- Archive view: `WHERE is_archived = true` for the separate archive screen

**No physical deletion in MVP.** Data is never destroyed, only hidden from active views.

---

## T00-07 — MVP Performance KPIs (Confirmed)

| Operation | Target | Measurement method |
|---|---|---|
| Order save round-trip | < 2 000 ms on 4G mobile | Vercel function duration log |
| Active order list load (30 items) | < 1 000 ms TTI on 4G mobile | Vercel Analytics |
| Customer search response | < 500 ms after keystroke debounce | Supabase query log |
| Sign-in → home screen | < 3 000 ms end-to-end | Lighthouse mobile simulation |

**Index strategy to meet these KPIs:**
- `(workspace_id, is_archived, updated_at DESC)` on `orders`
- `(workspace_id, status)` on `orders`
- `(workspace_id, full_name)` on `customers`
- `(workspace_id, phone_primary)` on `customers`
- `(workspace_id, is_active)` on `delivery_companies`

---

## T00-08 — Iteration Sequence and Agent Handoff Protocol (Confirmed)

### Definition of Ready (before starting any task)
- Requirement is clear and bounded
- All dependency tasks are marked complete
- Acceptance criteria are testable and specific
- No open product decisions block implementation

### Definition of Done (for any iteration)
- All must-have tickets complete
- Acceptance criteria validated locally
- No cross-tenant data exposure (verified by test or manual check)
- Mobile usability confirmed on 375 px viewport
- `tasks/done/` contains evidence or notes for the iteration

### Iteration order
00 → 01 → 02 → 03 → 04 → 05 → 06 → 07

Parallel work is permitted only when tasks within the same iteration have no shared dependencies.

---

## T00-01 — MVP Scope and Non-Goals (Confirmed)

### In scope for MVP (Iterations 00–06)
- Authentication and workspace isolation
- Customer records management
- Delivery company management
- Order capture with product lines and snapshots
- Order status lifecycle and manual archive
- Active orders list with basic search
- Basic dashboard (order count by status)
- Free-plan usage limit enforcement

### Explicit out-of-scope for MVP
- Real-time courier API integration
- Full inventory / product catalog
- Team/multi-user access
- Marketplace integrations (Jumia, Tunisie Annonces)
- E-invoicing (any country)
- Advanced analytics and reporting
- Mobile native app (PWA only)
- Payment processing in-app
- Multi-language / RTL support
- Automated archiving job
- File attachments / order photos
