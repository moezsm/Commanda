-- Migration 003: Orders, Order Items, Order Status History
-- Iteration 03 — T03-01, T03-02, T03-03

-- ── Order status enum ──────────────────────────
CREATE TYPE order_status AS ENUM (
  'new', 'confirmed', 'prepared', 'shipped', 'delivered', 'cancelled'
);

-- ── Source channel enum ────────────────────────
CREATE TYPE source_channel AS ENUM (
  'facebook', 'instagram', 'whatsapp', 'other'
);

-- ── Orders table ───────────────────────────────
CREATE TABLE orders (
  id                         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id               UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  customer_id                UUID REFERENCES customers(id) ON DELETE SET NULL,
  delivery_company_id        UUID REFERENCES delivery_companies(id) ON DELETE SET NULL,
  order_reference            TEXT,
  source_channel             source_channel,
  status                     order_status NOT NULL DEFAULT 'new',
  total_amount_snapshot      NUMERIC(10, 3),
  currency_code              CHAR(3) NOT NULL DEFAULT 'TND',
  delivery_address_snapshot  TEXT,
  delivery_city_snapshot     TEXT,
  delivery_region_snapshot   TEXT,
  client_name_snapshot       TEXT NOT NULL,
  client_phone_snapshot      TEXT NOT NULL,
  notes                      TEXT,
  is_archived                BOOLEAN NOT NULL DEFAULT FALSE,
  archived_at                TIMESTAMPTZ,
  created_by                 UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Primary query indexes (performance KPIs)
CREATE INDEX idx_orders_workspace                 ON orders(workspace_id);
CREATE INDEX idx_orders_ws_active_updated         ON orders(workspace_id, is_archived, updated_at DESC);
CREATE INDEX idx_orders_ws_status                 ON orders(workspace_id, status);
CREATE INDEX idx_orders_ws_archived_at            ON orders(workspace_id, archived_at DESC) WHERE is_archived = TRUE;
CREATE INDEX idx_orders_ws_client_name            ON orders(workspace_id, client_name_snapshot);
CREATE INDEX idx_orders_ws_client_phone           ON orders(workspace_id, client_phone_snapshot);
CREATE INDEX idx_orders_ws_customer               ON orders(workspace_id, customer_id);
CREATE INDEX idx_orders_ws_delivery_company       ON orders(workspace_id, delivery_company_id);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orders_workspace_select"
  ON orders FOR SELECT
  USING (workspace_id = get_my_workspace_id());

CREATE POLICY "orders_workspace_insert"
  ON orders FOR INSERT
  WITH CHECK (workspace_id = get_my_workspace_id());

CREATE POLICY "orders_workspace_update"
  ON orders FOR UPDATE
  USING (workspace_id = get_my_workspace_id())
  WITH CHECK (workspace_id = get_my_workspace_id());

-- ── Order Items ────────────────────────────────
CREATE TABLE order_items (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id           UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  order_id               UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_name_snapshot  TEXT NOT NULL,
  sku_snapshot           TEXT,
  quantity               INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price_snapshot    NUMERIC(10, 3),
  line_total_snapshot    NUMERIC(10, 3),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(workspace_id, order_id);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "order_items_workspace_select"
  ON order_items FOR SELECT
  USING (workspace_id = get_my_workspace_id());

CREATE POLICY "order_items_workspace_insert"
  ON order_items FOR INSERT
  WITH CHECK (workspace_id = get_my_workspace_id());

CREATE POLICY "order_items_workspace_update"
  ON order_items FOR UPDATE
  USING (workspace_id = get_my_workspace_id())
  WITH CHECK (workspace_id = get_my_workspace_id());

CREATE POLICY "order_items_workspace_delete"
  ON order_items FOR DELETE
  USING (workspace_id = get_my_workspace_id());

-- ── Order Status History ───────────────────────
CREATE TABLE order_status_history (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  order_id     UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status       order_status NOT NULL,
  changed_by   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  change_note  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_history_order ON order_status_history(workspace_id, order_id, created_at ASC);

ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "order_history_workspace_select"
  ON order_status_history FOR SELECT
  USING (workspace_id = get_my_workspace_id());

CREATE POLICY "order_history_workspace_insert"
  ON order_status_history FOR INSERT
  WITH CHECK (workspace_id = get_my_workspace_id());
