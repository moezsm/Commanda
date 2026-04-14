-- Manual workspace elevation script for operators
-- Run with service role key (not anon key)
-- Purpose: Test premium features without Stripe integration
--
-- Usage:
--   Replace <WORKSPACE_ID> with the actual UUID from the workspaces table
--   Run in Supabase SQL editor with service role credentials

DO $$
DECLARE
  target_workspace_id UUID := '<WORKSPACE_ID>';
BEGIN
  -- Update workspace plan
  UPDATE workspaces
  SET plan_tier = 'premium_wave1', plan_status = 'active'
  WHERE id = target_workspace_id;

  -- Insert or update subscription record
  INSERT INTO subscriptions (workspace_id, plan_tier, plan_status, current_period_start, current_period_end)
  VALUES (
    target_workspace_id,
    'premium_wave1',
    'active',
    NOW(),
    NOW() + INTERVAL '30 days'
  )
  ON CONFLICT (workspace_id) DO UPDATE
    SET plan_tier = 'premium_wave1',
        plan_status = 'active',
        current_period_start = NOW(),
        current_period_end = NOW() + INTERVAL '30 days',
        updated_at = NOW();

  RAISE NOTICE 'Workspace % elevated to premium_wave1', target_workspace_id;
END $$;

-- To revert to free:
-- UPDATE workspaces SET plan_tier = 'free', plan_status = 'active' WHERE id = '<WORKSPACE_ID>';
-- UPDATE subscriptions SET plan_tier = 'free', plan_status = 'cancelled', updated_at = NOW() WHERE workspace_id = '<WORKSPACE_ID>';
