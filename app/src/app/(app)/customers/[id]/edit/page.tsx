import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { CustomerForm } from '@/components/customers/CustomerForm'
import { PageHeader } from '@/components/ui/PageHeader'
import type { Customer } from '@/lib/types'

export default async function EditCustomerPage({ params }: { params: { id: string } }) {
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

  return (
    <div>
      <PageHeader title="Modifier le client" />
      <CustomerForm customer={customer as Customer} />
    </div>
  )
}
