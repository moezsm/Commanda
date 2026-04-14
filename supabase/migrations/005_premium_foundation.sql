-- Migration 005: Subscriptions, Entitlements, Events
-- Iteration 07 — T07-01, T07-06

-- ── Subscriptions ─────────────────────────────
CREATE TABLE subscriptions (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id           UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  plan_tier              plan_tier NOT NULL DEFAULT 'free',
  plan_status            plan_status NOT NULL DEFAULT 'active',
  billing_customer_ref   TEXT,
  current_period_start   TIMESTAMPTZ,
  current_period_end     TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_workspace ON subscriptions(workspace_id);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions_workspace_select"
  ON subscriptions FOR SELECT
  USING (workspace_id = get_my_workspace_id());

-- ── Workspace Entitlements ─────────────────────
-- Allows fine-grained feature overrides per workspace
CREATE TABLE workspace_entitlements (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  feature_key   TEXT NOT NULL,
  enabled       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (workspace_id, feature_key)
);

CREATE INDEX idx_entitlements_workspace ON workspace_entitlements(workspace_id);

ALTER TABLE workspace_entitlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "entitlements_workspace_select"
  ON workspace_entitlements FOR SELECT
  USING (workspace_id = get_my_workspace_id());

-- ── Workspace Events (analytics / conversion) ──
CREATE TABLE workspace_events (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  event_key     TEXT NOT NULL,
  metadata      JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workspace_events_workspace ON workspace_events(workspace_id, created_at DESC);
CREATE INDEX idx_workspace_events_key       ON workspace_events(event_key, created_at DESC);

ALTER TABLE workspace_events ENABLE ROW LEVEL SECURITY;

-- Events are write-only for workspace members; NOT readable by them (operator only)
CREATE POLICY "workspace_events_insert"
  ON workspace_events FOR INSERT
  WITH CHECK (workspace_id = get_my_workspace_id());

CREATE POLICY "workspace_events_no_select"
  ON workspace_events FOR SELECT
  USING (FALSE);
