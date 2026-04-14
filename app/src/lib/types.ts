// ──────────────────────────────────────────────
// Commanda — Shared TypeScript Types
// ──────────────────────────────────────────────

export type PlanTier = 'free' | 'premium_wave1' | 'premium_wave2' | 'premium_wave3'
export type PlanStatus = 'active' | 'trialing' | 'past_due' | 'cancelled'

export type OrderStatus =
  | 'new'
  | 'confirmed'
  | 'prepared'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'Nouveau',
  confirmed: 'Confirmé',
  prepared: 'Préparé',
  shipped: 'Expédié',
  delivered: 'Livré',
  cancelled: 'Annulé',
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  new: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-yellow-100 text-yellow-800',
  prepared: 'bg-orange-100 text-orange-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

/** Valid transitions from a given status */
export const VALID_NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  new: ['confirmed', 'cancelled'],
  confirmed: ['prepared', 'cancelled'],
  prepared: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
}

export type SourceChannel = 'facebook' | 'instagram' | 'whatsapp' | 'other'

export const SOURCE_CHANNEL_LABELS: Record<SourceChannel, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
  other: 'Autre',
}

// ── Database Row Types ──────────────────────────

export interface Workspace {
  id: string
  owner_user_id: string
  display_name: string | null
  country_code: string
  default_currency: string
  plan_tier: PlanTier
  plan_status: PlanStatus
  created_at: string
}

export interface Profile {
  id: string
  workspace_id: string
  full_name: string | null
  role: string
  phone: string | null
  created_at: string
}

export interface Customer {
  id: string
  workspace_id: string
  full_name: string
  phone_primary: string
  phone_secondary: string | null
  address_line: string | null
  city: string | null
  region: string | null
  country_code: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface DeliveryCompany {
  id: string
  workspace_id: string
  name: string
  contact_name: string | null
  contact_phone: string | null
  notes: string | null
  is_active: boolean
  created_at: string
}

export interface Order {
  id: string
  workspace_id: string
  customer_id: string | null
  delivery_company_id: string | null
  order_reference: string | null
  source_channel: SourceChannel | null
  status: OrderStatus
  total_amount_snapshot: number | null
  currency_code: string
  delivery_address_snapshot: string | null
  delivery_city_snapshot: string | null
  delivery_region_snapshot: string | null
  client_name_snapshot: string
  client_phone_snapshot: string
  notes: string | null
  is_archived: boolean
  archived_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  workspace_id: string
  order_id: string
  product_name_snapshot: string
  sku_snapshot: string | null
  quantity: number
  unit_price_snapshot: number | null
  line_total_snapshot: number | null
  created_at: string
}

export interface OrderStatusHistory {
  id: string
  workspace_id: string
  order_id: string
  status: OrderStatus
  changed_by: string | null
  change_note: string | null
  created_at: string
}

export interface WorkspaceUsageSnapshot {
  id: string
  workspace_id: string
  snapshot_date: string
  active_order_count: number
  archived_order_count: number
  customer_count: number
}

// ── Composite / Join Types ───────────────────────

export interface OrderWithDetails extends Order {
  customers?: Customer | null
  delivery_companies?: DeliveryCompany | null
  order_items?: OrderItem[]
  order_status_history?: OrderStatusHistory[]
}

// ── Free Plan Constants ──────────────────────────

export const FREE_PLAN_ACTIVE_ORDER_LIMIT = 150
export const FREE_PLAN_SOFT_WARNING_THRESHOLD = 140 // show banner in final 10
