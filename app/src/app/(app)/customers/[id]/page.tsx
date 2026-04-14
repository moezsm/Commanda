import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'
import type { Customer } from '@/lib/types'

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: profile } = await supabase
    .from('profiles')
    .select('workspace_id')
    .eq('id', user.id)
    .single()
  if (!profile) redirect('/onboarding')

  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('id', params.id)
    .eq('workspace_id', profile.workspace_id)
    .single()

  if (!customer) notFound()
  const c = customer as Customer

  return (
    <div>
      <PageHeader
        title={c.full_name}
        action={
          <Link href={`/customers/${c.id}/edit`}>
            <Button variant="secondary" size="sm">Modifier</Button>
          </Link>
        }
      />
      <div className="flex flex-col gap-3 px-4">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <dl className="flex flex-col gap-3">
            <Row label="Téléphone principal" value={c.phone_primary} />
            {c.phone_secondary && <Row label="Téléphone secondaire" value={c.phone_secondary} />}
            {c.address_line && <Row label="Adresse" value={c.address_line} />}
            {c.city && <Row label="Ville" value={c.city} />}
            {c.region && <Row label="Région" value={c.region} />}
            {c.notes && <Row label="Notes" value={c.notes} />}
            <Row label="Client depuis" value={formatDate(c.created_at)} />
          </dl>
        </div>

        {/* Order history placeholder — populated in Iteration 03 */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-700 mb-2">Commandes</p>
          <p className="text-sm text-gray-400">Historique des commandes disponible après création.</p>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900">{value}</dd>
    </div>
  )
}
