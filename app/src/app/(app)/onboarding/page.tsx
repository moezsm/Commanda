'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function OnboardingPage() {
  const router = useRouter()
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!displayName.trim()) {
      setError('Le nom de la boutique est requis.')
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/sign-in'); return }

    // Create workspace + profile in one transaction via two inserts
    const { data: workspace, error: wsError } = await supabase
      .from('workspaces')
      .insert({ owner_user_id: user.id, display_name: displayName.trim() })
      .select()
      .single()

    if (wsError || !workspace) {
      // Workspace may already exist (re-visit scenario) — fetch it
      const { data: existing } = await supabase
        .from('workspaces')
        .select()
        .eq('owner_user_id', user.id)
        .single()
      if (existing) {
        await supabase.from('workspaces').update({ display_name: displayName.trim() }).eq('id', existing.id)
        router.push('/home')
        return
      }
      setLoading(false)
      setError('Erreur lors de la création. Réessayez.')
      return
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({ id: user.id, workspace_id: workspace.id })

    setLoading(false)
    if (profileError && !profileError.message.includes('duplicate')) {
      setError('Erreur lors de la création du profil.')
      return
    }
    router.push('/home')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-center text-2xl font-bold text-indigo-600">Commanda</h1>
        <p className="mb-8 text-center text-sm text-gray-500">Bienvenue ! Configurons votre boutique.</p>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold text-gray-900">Nom de votre boutique</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Nom affiché"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              placeholder="Ex: Mode Tunisienne"
              hint="Ce nom sera visible sur vos documents."
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" size="lg" className="mt-2 w-full" loading={loading}>
              Commencer
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
