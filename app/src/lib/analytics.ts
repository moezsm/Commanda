import { createClient } from '@/lib/supabase/server'

export type EventKey =
  | 'order_created'
  | 'order_archived'
  | 'limit_warning_shown'
  | 'upgrade_page_visited'
  | 'premium_gate_encountered'
  | 'daily_usage_snapshot'

/**
 * Track a product event for conversion and usage analytics.
 * No PII in metadata — only structural data (counts, feature keys).
 */
export async function trackEvent(
  workspaceId: string,
  eventKey: EventKey,
  metadata?: Record<string, string | number | boolean>
): Promise<void> {
  try {
    const supabase = await createClient()
    await supabase.from('workspace_events').insert({
      workspace_id: workspaceId,
      event_key: eventKey,
      metadata: metadata ?? null,
    })
  } catch {
    // Non-blocking — analytics failures must not disrupt core workflows
  }
}
