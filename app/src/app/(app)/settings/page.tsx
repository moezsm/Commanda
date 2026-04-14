import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: profile } = await supabase.from('profiles').select('workspace_id').eq('id', user.id).single()
  const workspaceQuery = profile
    ? await supabase.from('workspaces').select('display_name, plan_tier').eq('id', profile.workspace_id).single()
    : { data: null }
  const workspace = workspaceQuery.data

  const menuItems = [
    { label: 'Paramètres boutique', href: '/settings/workspace' },
    { label: 'Transporteurs', href: '/settings/delivery-companies' },
    { label: 'Archive des commandes', href: '/orders/archive' },
    { label: 'Passer en Premium', href: '/upgrade' },
  ]

  return (
    <div>
      <PageHeader
        title={workspace?.display_name ?? 'Mon compte'}
        subtitle={workspace?.plan_tier === 'free' ? 'Plan gratuit' : 'Plan premium'}
      />
      <div className="px-4 flex flex-col gap-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center justify-between rounded-2xl bg-white px-4 py-4 shadow-sm active:bg-gray-50"
          >
            <span className="font-medium text-gray-900">{item.label}</span>
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}

        <form action="/api/auth/sign-out" method="POST" className="mt-4">
          <button
            type="submit"
            className="w-full rounded-2xl border border-red-200 bg-white py-4 text-sm font-medium text-red-600 active:bg-red-50"
          >
            Se déconnecter
          </button>
        </form>
      </div>
    </div>
  )
}
