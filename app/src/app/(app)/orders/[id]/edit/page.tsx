import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { OrderForm } from '@/components/orders/OrderForm'
import { PageHeader } from '@/components/ui/PageHeader'
import type { OrderWithDetails } from '@/lib/types'

export default async function EditOrderPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: profile } = await supabase.from('profiles').select('workspace_id').eq('id', user.id).single()
  if (!profile) redirect('/onboarding')

  const { data: workspace } = await supabase.from('workspaces').select('default_currency').eq('id', profile.workspace_id).single()

  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', params.id)
    .eq('workspace_id', profile.workspace_id)
    .single()

  if (!order) notFound()

  return (
    <div>
      <PageHeader title="Modifier la commande" />
      <OrderForm
        workspaceId={profile.workspace_id}
        defaultCurrency={workspace?.default_currency ?? 'TND'}
        order={order as OrderWithDetails}
      />
    </div>
  )
}
