import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'
import type { DeliveryCompany } from '@/lib/types'

export default async function DeliveryCompaniesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: profile } = await supabase.from('profiles').select('workspace_id').eq('id', user.id).single()
  if (!profile) redirect('/onboarding')

  const { data } = await supabase
    .from('delivery_companies')
    .select('*')
    .eq('workspace_id', profile.workspace_id)
    .order('name')

  const companies = (data ?? []) as DeliveryCompany[]

  return (
    <div>
      <PageHeader
        title="Transporteurs"
        action={
          <Link
            href="/settings/delivery-companies/new"
            className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white"
          >
            + Nouveau
          </Link>
        }
      />
      <div className="flex flex-col gap-2 px-4">
        {companies.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-400">Aucun transporteur enregistré.</p>
        )}
        {companies.map((c) => (
          <Link
            key={c.id}
            href={`/settings/delivery-companies/${c.id}/edit`}
            className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm active:bg-gray-50"
          >
            <div>
              <p className="font-medium text-gray-900">{c.name}</p>
              {c.contact_phone && <p className="text-sm text-gray-500">{c.contact_phone}</p>}
            </div>
            <span className={`text-xs font-medium ${c.is_active ? 'text-green-600' : 'text-gray-400'}`}>
              {c.is_active ? 'Actif' : 'Inactif'}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
