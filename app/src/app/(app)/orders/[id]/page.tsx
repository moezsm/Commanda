import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { StatusTimeline } from '@/components/orders/StatusTimeline'
import { StatusUpdateSheet } from '@/components/orders/StatusUpdateSheet'
import { ArchiveOrderButton } from '@/components/orders/ArchiveOrderButton'
import { formatDateTime, formatCurrency } from '@/lib/utils'
import { SOURCE_CHANNEL_LABELS, type OrderWithDetails } from '@/lib/types'

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: profile } = await supabase.from('profiles').select('workspace_id').eq('id', user.id).single()
  if (!profile) redirect('/onboarding')

  const { data: order } = await supabase
    .from('orders')
    .select(`
      *,
      customers(id, full_name, phone_primary),
      delivery_companies(id, name),
      order_items(*),
      order_status_history(*)
    `)
    .eq('id', params.id)
    .eq('workspace_id', profile.workspace_id)
    .single()

  if (!order) notFound()
  const o = order as OrderWithDetails

  return (
    <div>
      <PageHeader
        title={`Commande #${o.order_reference ?? o.id.slice(0, 8)}`}
        action={
          !o.is_archived && (
            <Link href={`/orders/${o.id}/edit`}>
              <button className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 active:bg-gray-50">
                Modifier
              </button>
            </Link>
          )
        }
      />

      <div className="flex flex-col gap-3 px-4 pb-32">
        {/* Status + archive */}
        <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
          <div>
            <p className="text-xs text-gray-500 mb-1">Statut</p>
            <StatusBadge status={o.status} />
          </div>
          <div className="flex gap-2">
            {!o.is_archived && <StatusUpdateSheet orderId={o.id} currentStatus={o.status} workspaceId={profile.workspace_id} />}
            {!o.is_archived && <ArchiveOrderButton orderId={o.id} currentStatus={o.status} />}
          </div>
        </div>

        {/* Customer */}
        {o.customers && (
          <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Client</p>
            <Link href={`/customers/${o.customers.id}`} className="font-medium text-indigo-600">
              {o.customers.full_name}
            </Link>
            <p className="text-sm text-gray-500">{o.customers.phone_primary}</p>
          </div>
        )}

        {/* Products */}
        {o.order_items && o.order_items.length > 0 && (
          <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
            <p className="text-xs text-gray-500 mb-2">Produits</p>
            {o.order_items.map((item) => (
              <div key={item.id} className="flex items-start justify-between py-1">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.product_name_snapshot}</p>
                  {item.sku_snapshot && <p className="text-xs text-gray-400">Réf: {item.sku_snapshot}</p>}
                  <p className="text-xs text-gray-500">Qté: {item.quantity}</p>
                </div>
                {item.line_total_snapshot != null && (
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(item.line_total_snapshot, o.currency_code)}
                  </p>
                )}
              </div>
            ))}
            {o.total_amount_snapshot != null && (
              <div className="mt-2 border-t border-gray-100 pt-2 flex justify-between">
                <span className="text-sm font-semibold">Total</span>
                <span className="text-sm font-semibold">{formatCurrency(o.total_amount_snapshot, o.currency_code)}</span>
              </div>
            )}
          </div>
        )}

        {/* Delivery */}
        <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Livraison</p>
          {o.delivery_companies && <p className="font-medium text-gray-900">{(o.delivery_companies as { name: string }).name}</p>}
          {o.delivery_address_snapshot && <p className="text-sm text-gray-600">{o.delivery_address_snapshot}</p>}
          {o.delivery_city_snapshot && <p className="text-sm text-gray-500">{o.delivery_city_snapshot}</p>}
        </div>

        {/* Meta */}
        <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
          {o.source_channel && (
            <p className="text-sm text-gray-600">
              Source: <span className="font-medium">{SOURCE_CHANNEL_LABELS[o.source_channel]}</span>
            </p>
          )}
          {o.notes && <p className="mt-1 text-sm text-gray-600">Notes: {o.notes}</p>}
          <p className="mt-1 text-xs text-gray-400">Créée le {formatDateTime(o.created_at)}</p>
          {o.is_archived && (
            <p className="mt-1 text-xs text-orange-500">Archivée le {formatDateTime(o.archived_at)}</p>
          )}
        </div>

        {/* Status timeline */}
        {o.order_status_history && o.order_status_history.length > 0 && (
          <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
            <p className="text-xs text-gray-500 mb-2">Historique</p>
            <StatusTimeline history={o.order_status_history} />
          </div>
        )}
      </div>
    </div>
  )
}
