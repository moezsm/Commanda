import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { FreePlanBanner } from '@/components/plan/FreePlanBanner'
import { formatDateTime } from '@/lib/utils'
import { FREE_PLAN_ACTIVE_ORDER_LIMIT, FREE_PLAN_SOFT_WARNING_THRESHOLD, type OrderWithDetails, type OrderStatus } from '@/lib/types'

const STATUS_OPTIONS: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Toutes' },
  { value: 'new', label: 'Nouvelles' },
  { value: 'confirmed', label: 'Confirmées' },
  { value: 'prepared', label: 'Préparées' },
  { value: 'shipped', label: 'Expédiées' },
  { value: 'delivered', label: 'Livrées' },
]

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; company?: string; page?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: profile } = await supabase.from('profiles').select('workspace_id').eq('id', user.id).single()
  if (!profile) redirect('/onboarding')

  const { data: workspace } = await supabase.from('workspaces').select('plan_tier').eq('id', profile.workspace_id).single()
  const isFree = workspace?.plan_tier === 'free'

  const q = searchParams.q?.trim() ?? ''
  const statusFilter = (searchParams.status ?? 'all') as OrderStatus | 'all'
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10))
  const pageSize = 30
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  // Active order count for plan enforcement
  const { count: activeCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', profile.workspace_id)
    .eq('is_archived', false)

  const totalActive = activeCount ?? 0
  const atLimit = isFree && totalActive >= FREE_PLAN_ACTIVE_ORDER_LIMIT
  const nearLimit = isFree && totalActive >= FREE_PLAN_SOFT_WARNING_THRESHOLD

  let query = supabase
    .from('orders')
    .select('id, client_name_snapshot, client_phone_snapshot, status, updated_at, delivery_companies(name)', { count: 'exact' })
    .eq('workspace_id', profile.workspace_id)
    .eq('is_archived', false)
    .order('updated_at', { ascending: false })
    .range(from, to)

  if (q) {
    query = query.or(
      `client_name_snapshot.ilike.%${q}%,client_phone_snapshot.ilike.%${q}%,order_reference.ilike.%${q}%`
    )
  }
  if (statusFilter !== 'all') {
    query = query.eq('status', statusFilter)
  }

  const { data: orders, count: totalCount } = await query
  const list = (orders ?? []) as unknown as OrderWithDetails[]
  const totalPages = Math.ceil((totalCount ?? 0) / pageSize)

  return (
    <div>
      <PageHeader
        title="Commandes"
        action={
          atLimit ? (
            <Link href="/upgrade" className="inline-flex items-center gap-1 rounded-xl bg-gray-200 px-3 py-2 text-sm font-semibold text-gray-400 cursor-not-allowed">
              + Nouvelle
            </Link>
          ) : (
            <Link href="/orders/new" className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white active:bg-indigo-700">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Nouvelle
            </Link>
          )
        }
      />

      {nearLimit && <FreePlanBanner currentCount={totalActive} limit={FREE_PLAN_ACTIVE_ORDER_LIMIT} />}

      {/* Search */}
      <div className="px-4 pb-2">
        <form>
          <input
            name="q"
            defaultValue={q}
            type="search"
            placeholder="Rechercher par client, réf…"
            className="h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-base focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          {statusFilter !== 'all' && <input type="hidden" name="status" value={statusFilter} />}
        </form>
      </div>

      {/* Status filter chips */}
      <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide">
        {STATUS_OPTIONS.map((opt) => (
          <Link
            key={opt.value}
            href={`/orders?${q ? `q=${encodeURIComponent(q)}&` : ''}${opt.value !== 'all' ? `status=${opt.value}` : ''}`}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === opt.value
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      {/* Orders list */}
      {list.length === 0 ? (
        <EmptyState
          title={q ? 'Aucune commande trouvée' : 'Aucune commande active'}
          description={!q && !atLimit ? 'Créez votre première commande.' : undefined}
          action={
            !q && !atLimit && (
              <Link href="/orders/new">
                <button className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
                  Nouvelle commande
                </button>
              </Link>
            )
          }
        />
      ) : (
        <div className="flex flex-col gap-2 px-4">
          {list.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm active:bg-gray-50"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-gray-900">{order.client_name_snapshot}</p>
                <p className="text-xs text-gray-400">
                  {(order.delivery_companies as { name: string } | null)?.name ?? '—'} · {formatDateTime(order.updated_at)}
                </p>
              </div>
              <StatusBadge status={order.status} className="ml-3 shrink-0" />
            </Link>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between py-4">
              {page > 1 ? (
                <Link href={`/orders?page=${page - 1}${q ? `&q=${encodeURIComponent(q)}` : ''}${statusFilter !== 'all' ? `&status=${statusFilter}` : ''}`}
                  className="px-4 py-2 text-sm text-indigo-600">← Précédent</Link>
              ) : <span />}
              <span className="text-xs text-gray-400">{page} / {totalPages}</span>
              {page < totalPages ? (
                <Link href={`/orders?page=${page + 1}${q ? `&q=${encodeURIComponent(q)}` : ''}${statusFilter !== 'all' ? `&status=${statusFilter}` : ''}`}
                  className="px-4 py-2 text-sm text-indigo-600">Suivant →</Link>
              ) : <span />}
            </div>
          )}
        </div>
      )}

      {/* FAB */}
      {!atLimit && (
        <Link
          href="/orders/new"
          className="fixed bottom-20 right-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 shadow-lg active:bg-indigo-700"
        >
          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </Link>
      )}
    </div>
  )
}
