// Feature flag and entitlement system
// Used to gate premium features by workspace plan tier or explicit entitlement overrides

import { createClient } from '@/lib/supabase/server'
import type { PlanTier } from '@/lib/types'

export type FeatureKey =
  | 'bulk_status_update'
  | 'analytics'
  | 'team_access'
  | 'export'
  | 'advanced_filters'
  | 'product_catalog'

/** Features included in each plan tier by default */
const PLAN_DEFAULTS: Record<PlanTier, FeatureKey[]> = {
  free: [],
  premium_wave1: [
    'bulk_status_update',
    'export',
    'advanced_filters',
  ],
  premium_wave2: [
    'bulk_status_update',
    'export',
    'advanced_filters',
    'analytics',
    'team_access',
    'product_catalog',
  ],
  premium_wave3: [
    'bulk_status_update',
    'export',
    'advanced_filters',
    'analytics',
    'team_access',
    'product_catalog',
  ],
}

/**
 * Returns true if the workspace has access to the given feature.
 * Checks workspace_entitlements table first (explicit overrides),
 * then falls back to plan tier defaults.
 */
export async function hasFeature(workspaceId: string, featureKey: FeatureKey): Promise<boolean> {
  const supabase = await createClient()

  // Check explicit entitlement override
  const { data: entitlement } = await supabase
    .from('workspace_entitlements')
    .select('enabled')
    .eq('workspace_id', workspaceId)
    .eq('feature_key', featureKey)
    .single()

  if (entitlement != null) {
    return entitlement.enabled
  }

  // Fall back to plan tier
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('plan_tier')
    .eq('id', workspaceId)
    .single()

  if (!workspace) return false
  const tier = workspace.plan_tier as PlanTier
  return PLAN_DEFAULTS[tier]?.includes(featureKey) ?? false
}

/**
 * Returns a map of all feature keys and their enabled status for a workspace.
 * Efficient for pages that need to check multiple features at once.
 */
export async function getWorkspaceFeatures(workspaceId: string): Promise<Record<FeatureKey, boolean>> {
  const supabase = await createClient()

  const [workspaceRes, entitlementRes] = await Promise.all([
    supabase.from('workspaces').select('plan_tier').eq('id', workspaceId).single(),
    supabase.from('workspace_entitlements').select('feature_key, enabled').eq('workspace_id', workspaceId),
  ])

  const tier = (workspaceRes.data?.plan_tier ?? 'free') as PlanTier
  const planDefaults = new Set(PLAN_DEFAULTS[tier] ?? [])

  const features = {} as Record<FeatureKey, boolean>
  const allKeys: FeatureKey[] = [
    'bulk_status_update', 'analytics', 'team_access', 'export',
    'advanced_filters', 'product_catalog',
  ]

  for (const key of allKeys) {
    features[key] = planDefaults.has(key)
  }

  // Apply explicit overrides
  for (const row of entitlementRes.data ?? []) {
    features[row.feature_key as FeatureKey] = row.enabled
  }

  return features
}
