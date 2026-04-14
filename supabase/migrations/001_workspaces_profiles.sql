-- Migration 001: Workspaces and Profiles
-- Iteration 01 — T01-03

-- ── Enable UUID extension ─────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Plan types ────────────────────────────────
CREATE TYPE plan_tier AS ENUM ('free', 'premium_wave1', 'premium_wave2', 'premium_wave3');
CREATE TYPE plan_status AS ENUM ('active', 'trialing', 'past_due', 'cancelled');

-- ── Workspaces ────────────────────────────────
CREATE TABLE workspaces (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name      TEXT,
  country_code      CHAR(2) NOT NULL DEFAULT 'TN',
  default_currency  CHAR(3) NOT NULL DEFAULT 'TND',
  plan_tier         plan_tier NOT NULL DEFAULT 'free',
  plan_status       plan_status NOT NULL DEFAULT 'active',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workspaces_owner ON workspaces(owner_user_id);

-- Row-Level Security
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_owner_select"
  ON workspaces FOR SELECT
  USING (owner_user_id = auth.uid());

CREATE POLICY "workspace_owner_update"
  ON workspaces FOR UPDATE
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "workspace_owner_insert"
  ON workspaces FOR INSERT
  WITH CHECK (owner_user_id = auth.uid());

-- ── Profiles ──────────────────────────────────
-- One profile row per auth.user, links the user to their workspace
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  full_name     TEXT,
  role          TEXT NOT NULL DEFAULT 'owner',
  phone         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_workspace ON profiles(workspace_id);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profile_self_select"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "profile_self_update"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "profile_self_insert"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- ── Helper function used by other RLS policies ──
-- Returns the workspace_id for the currently authenticated user
CREATE OR REPLACE FUNCTION get_my_workspace_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT workspace_id FROM profiles WHERE id = auth.uid() LIMIT 1;
$$;
