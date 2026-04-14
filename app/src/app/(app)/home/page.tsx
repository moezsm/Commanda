import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { formatDateTime } from '@/lib/utils'
import type { OrderWithDetails } from '@/lib/types'

async function getDashboardStats(workspaceId: string) {
  const supabase = await createClient()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [activeCountRes, awaitingCountRes, deliveredTodayRes, recentOrdersRes] =
    await Promise.all([
      supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('workspace_id', workspaceId)
        .eq('is_archived', false),
      supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('workspace_id', workspaceId)
        .eq('is_archived', false)
        .in('status', ['confirmed', 'prepared']),
      supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('workspace_id', workspaceId)
        .eq('is_archived', false)
        .eq('status', 'delivered')
        .gte('updated_at', today.toISOString()),
      supabase
        .from('orders')
        .select('id, client_name_snapshot, status, updated_at, delivery_companies(name)')
        .eq('workspace_id', workspaceId)
        .eq('is_archived', false)
        .order('updated_at', { ascending: false })
        .limit(5),
    ])

  return {
    activeCount: activeCountRes.count ?? 0,
    awaitingCount: awaitingCountRes.count ?? 0,
    deliveredToday: deliveredTodayRes.count ?? 0,
    recentOrders: (recentOrdersRes.data ?? []) as unknown as OrderWithDetails[],
  }
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: profile } = await supabase
    .from('profiles')
    .select('workspace_id')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/onboarding')

  const stats = await getDashboardStats(profile.workspace_id)

  return (
    <div className="px-4 pt-6 pb-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Accueil</h1>
        <Link
          href="/orders/new"
          className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm active:bg-indigo-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nouvelle commande
        </Link>
      </div>

      {/* Stats cards */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-white p-4 shadow-sm text-center">
          <div className="text-2xl font-bold text-indigo-600">{stats.activeCount}</div>
          <div className="mt-1 text-xs text-gray-500">Actives</div>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm text-center">
          <div className="text-2xl font-bold text-orange-500">{stats.awaitingCount}</div>
          <div className="mt-1 text-xs text-gray-500">En attente</div>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm text-center">
          <div className="text-2xl font-bold text-green-600">{stats.deliveredToday}</div>
          <div className="mt-1 text-xs text-gray-500">Livrées auj.</div>
        </div>
      </div>

      {/* Recent orders */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-700">Dernières commandes</h2>
        {stats.recentOrders.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-center text-sm text-gray-400 shadow-sm">
            Aucune commande pour l&apos;instant
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {stats.recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm active:bg-gray-50"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-gray-900">
                    {order.client_name_snapshot}
                  </p>
                  <p className="text-xs text-gray-400">{formatDateTime(order.updated_at)}</p>
                </div>
                <StatusBadge status={order.status} className="ml-3 shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
