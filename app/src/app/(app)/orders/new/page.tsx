import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { OrderForm } from '@/components/orders/OrderForm'
import { PageHeader } from '@/components/ui/PageHeader'
import { FREE_PLAN_ACTIVE_ORDER_LIMIT } from '@/lib/types'

export default async function NewOrderPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: profile } = await supabase.from('profiles').select('workspace_id').eq('id', user.id).single()
  if (!profile) redirect('/onboarding')

  const { data: workspace } = await supabase.from('workspaces').select('plan_tier, default_currency').eq('id', profile.workspace_id).single()
  const isFree = workspace?.plan_tier === 'free'

  if (isFree) {
    const { count } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', profile.workspace_id)
      .eq('is_archived', false)
    if ((count ?? 0) >= FREE_PLAN_ACTIVE_ORDER_LIMIT) {
      redirect('/upgrade?reason=order_limit')
    }
  }

  return (
    <div>
      <PageHeader title="Nouvelle commande" />
      <OrderForm
        workspaceId={profile.workspace_id}
        defaultCurrency={workspace?.default_currency ?? 'TND'}
      />
    </div>
  )
}
