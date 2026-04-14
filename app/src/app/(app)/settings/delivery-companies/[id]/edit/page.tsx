import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { DeliveryCompanyForm } from '@/components/delivery/DeliveryCompanyForm'
import { PageHeader } from '@/components/ui/PageHeader'
import type { DeliveryCompany } from '@/lib/types'

export default async function EditDeliveryCompanyPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: profile } = await supabase.from('profiles').select('workspace_id').eq('id', user.id).single()
  if (!profile) redirect('/onboarding')

  const { data } = await supabase
    .from('delivery_companies')
    .select('*')
    .eq('id', params.id)
    .eq('workspace_id', profile.workspace_id)
    .single()
  if (!data) notFound()

  return (
    <div>
      <PageHeader title="Modifier le transporteur" />
      <DeliveryCompanyForm company={data as DeliveryCompany} />
    </div>
  )
}
