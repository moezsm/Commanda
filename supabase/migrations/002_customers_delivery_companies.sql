-- Migration 002: Customers and Delivery Companies
-- Iteration 02 — T02-01, T02-02

-- ── Customers ─────────────────────────────────
CREATE TABLE customers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  full_name       TEXT NOT NULL,
  phone_primary   TEXT NOT NULL,
  phone_secondary TEXT,
  address_line    TEXT,
  city            TEXT,
  region          TEXT,
  country_code    CHAR(2),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customers_workspace       ON customers(workspace_id);
CREATE INDEX idx_customers_ws_name        ON customers(workspace_id, full_name);
CREATE INDEX idx_customers_ws_phone       ON customers(workspace_id, phone_primary);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customers_workspace_select"
  ON customers FOR SELECT
  USING (workspace_id = get_my_workspace_id());

CREATE POLICY "customers_workspace_insert"
  ON customers FOR INSERT
  WITH CHECK (workspace_id = get_my_workspace_id());

CREATE POLICY "customers_workspace_update"
  ON customers FOR UPDATE
  USING (workspace_id = get_my_workspace_id())
  WITH CHECK (workspace_id = get_my_workspace_id());

CREATE POLICY "customers_workspace_delete"
  ON customers FOR DELETE
  USING (workspace_id = get_my_workspace_id());

-- ── Delivery Companies ─────────────────────────
CREATE TABLE delivery_companies (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  contact_name  TEXT,
  contact_phone TEXT,
  notes         TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_delivery_companies_workspace        ON delivery_companies(workspace_id);
CREATE INDEX idx_delivery_companies_ws_active        ON delivery_companies(workspace_id, is_active);

ALTER TABLE delivery_companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "delivery_companies_workspace_select"
  ON delivery_companies FOR SELECT
  USING (workspace_id = get_my_workspace_id());

CREATE POLICY "delivery_companies_workspace_insert"
  ON delivery_companies FOR INSERT
  WITH CHECK (workspace_id = get_my_workspace_id());

CREATE POLICY "delivery_companies_workspace_update"
  ON delivery_companies FOR UPDATE
  USING (workspace_id = get_my_workspace_id())
  WITH CHECK (workspace_id = get_my_workspace_id());

CREATE POLICY "delivery_companies_workspace_delete"
  ON delivery_companies FOR DELETE
  USING (workspace_id = get_my_workspace_id());
