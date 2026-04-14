import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { formatDate } from '@/lib/utils'
import type { OrderWithDetails } from '@/lib/types'

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: profile } = await supabase.from('profiles').select('workspace_id').eq('id', user.id).single()
  if (!profile) redirect('/onboarding')

  const q = searchParams.q?.trim() ?? ''
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10))
  const pageSize = 30
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('orders')
    .select('id, client_name_snapshot, client_phone_snapshot, status, archived_at, delivery_companies(name)', { count: 'exact' })
    .eq('workspace_id', profile.workspace_id)
    .eq('is_archived', true)
    .order('archived_at', { ascending: false })
    .range(from, to)

  if (q) {
    query = query.or(
      `client_name_snapshot.ilike.%${q}%,client_phone_snapshot.ilike.%${q}%`
    )
  }

  const { data: orders, count } = await query
  const list = (orders ?? []) as unknown as OrderWithDetails[]
  const totalPages = Math.ceil((count ?? 0) / pageSize)

  return (
    <div>
      <PageHeader title="Archive" subtitle={`${count ?? 0} commandes`} />
      <div className="px-4 pb-3">
        <form>
          <input
            name="q"
            defaultValue={q}
            type="search"
            placeholder="Rechercher dans l'archive…"
            className="h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-base focus:border-indigo-500 focus:outline-none"
          />
        </form>
      </div>
      {list.length === 0 ? (
        <EmptyState title={q ? 'Aucun résultat' : "L'archive est vide"} />
      ) : (
        <div className="flex flex-col gap-2 px-4">
          {list.map((o) => (
            <Link
              key={o.id}
              href={`/orders/${o.id}`}
              className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm active:bg-gray-50"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-gray-900">{o.client_name_snapshot}</p>
                <p className="text-xs text-gray-400">Archivée le {formatDate(o.archived_at)}</p>
              </div>
              <StatusBadge status={o.status} className="ml-3 shrink-0" />
            </Link>
          ))}
          {totalPages > 1 && (
            <div className="flex justify-between py-4">
              {page > 1 && <Link href={`/orders/archive?page=${page - 1}${q ? `&q=${encodeURIComponent(q)}` : ''}`} className="text-sm text-indigo-600">← Précédent</Link>}
              <span className="text-xs text-gray-400">{page} / {totalPages}</span>
              {page < totalPages && <Link href={`/orders/archive?page=${page + 1}${q ? `&q=${encodeURIComponent(q)}` : ''}`} className="text-sm text-indigo-600">Suivant →</Link>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
