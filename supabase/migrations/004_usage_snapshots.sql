-- Migration 004: Workspace Usage Snapshots
-- Iteration 06 — T06-05

CREATE TABLE workspace_usage_snapshots (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id         UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  snapshot_date        DATE NOT NULL,
  active_order_count   INTEGER NOT NULL DEFAULT 0,
  archived_order_count INTEGER NOT NULL DEFAULT 0,
  customer_count       INTEGER NOT NULL DEFAULT 0,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (workspace_id, snapshot_date)
);

CREATE INDEX idx_usage_snapshots_workspace ON workspace_usage_snapshots(workspace_id, snapshot_date DESC);

ALTER TABLE workspace_usage_snapshots ENABLE ROW LEVEL SECURITY;

-- Usage snapshots are operator-only by default (no user-visible RLS select needed)
-- The service role key is used for inserts from Edge Functions / crons
CREATE POLICY "usage_snapshots_no_public_access"
  ON workspace_usage_snapshots FOR SELECT
  USING (FALSE);
