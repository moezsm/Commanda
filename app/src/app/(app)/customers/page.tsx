import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import type { Customer } from '@/lib/types'

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: profile } = await supabase
    .from('profiles')
    .select('workspace_id')
    .eq('id', user.id)
    .single()
  if (!profile) redirect('/onboarding')

  const q = searchParams.q?.trim() ?? ''

  let query = supabase
    .from('customers')
    .select('*')
    .eq('workspace_id', profile.workspace_id)
    .order('created_at', { ascending: false })
    .limit(100)

  if (q) {
    query = query.or(
      `full_name.ilike.%${q}%,phone_primary.ilike.%${q}%`
    )
  }

  const { data: customers } = await query
  const list = (customers ?? []) as Customer[]

  return (
    <div>
      <PageHeader
        title="Clients"
        action={
          <Link
            href="/customers/new"
            className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white active:bg-indigo-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nouveau
          </Link>
        }
      />

      {/* Search */}
      <div className="px-4 pb-3">
        <form>
          <input
            name="q"
            defaultValue={q}
            type="search"
            placeholder="Rechercher par nom ou téléphone…"
            className="h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-base placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </form>
      </div>

      {list.length === 0 ? (
        <EmptyState
          title={q ? 'Aucun client trouvé' : 'Aucun client'}
          description={q ? undefined : 'Ajoutez votre premier client.'}
          action={
            !q && (
              <Link href="/customers/new">
                <Button>Ajouter un client</Button>
              </Link>
            )
          }
        />
      ) : (
        <div className="flex flex-col gap-2 px-4">
          {list.map((c) => (
            <Link
              key={c.id}
              href={`/customers/${c.id}`}
              className="flex flex-col rounded-2xl bg-white px-4 py-3 shadow-sm active:bg-gray-50"
            >
              <span className="font-medium text-gray-900">{c.full_name}</span>
              <span className="text-sm text-gray-500">{c.phone_primary}</span>
              {c.city && <span className="text-xs text-gray-400">{c.city}</span>}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
