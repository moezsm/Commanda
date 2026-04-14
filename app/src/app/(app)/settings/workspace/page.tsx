'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { PageHeader } from '@/components/ui/PageHeader'
import type { Workspace } from '@/lib/types'

const COUNTRY_OPTIONS = [
  { value: 'TN', label: 'Tunisie' },
  { value: 'FR', label: 'France' },
  { value: 'DZ', label: 'Algérie' },
  { value: 'MA', label: 'Maroc' },
]

const CURRENCY_OPTIONS = [
  { value: 'TND', label: 'Dinar Tunisien (TND)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'DZD', label: 'Dinar Algérien (DZD)' },
  { value: 'MAD', label: 'Dirham Marocain (MAD)' },
]

export default function WorkspaceSettingsPage() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [countryCode, setCountryCode] = useState('TN')
  const [currency, setCurrency] = useState('TND')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('workspace_id').eq('id', user.id).single().then(({ data: profile }) => {
        if (!profile) return
        supabase.from('workspaces').select('*').eq('id', profile.workspace_id).single().then(({ data }) => {
          if (data) {
            setWorkspace(data)
            setDisplayName(data.display_name ?? '')
            setCountryCode(data.country_code)
            setCurrency(data.default_currency)
          }
        })
      })
    })
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!workspace) return
    setSaving(true)
    setError(null)
    setSuccess(false)
    const supabase = createClient()
    const { error: updateError } = await supabase
      .from('workspaces')
      .update({ display_name: displayName, country_code: countryCode, default_currency: currency })
      .eq('id', workspace.id)
    setSaving(false)
    if (updateError) { setError('Erreur lors de la sauvegarde.'); return }
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div>
      <PageHeader title="Paramètres de la boutique" />
      <div className="px-4">
        <form onSubmit={handleSave} className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm">
          <Input
            label="Nom de la boutique"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
          <Select
            label="Pays"
            options={COUNTRY_OPTIONS}
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
          />
          <Select
            label="Devise"
            options={CURRENCY_OPTIONS}
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">Paramètres sauvegardés.</p>}
          <Button type="submit" loading={saving} className="w-full">
            Sauvegarder
          </Button>
        </form>

        <div className="mt-4">
          <form action="/api/auth/sign-out" method="POST">
            <button
              type="submit"
              className="w-full rounded-xl border border-red-200 py-3 text-sm font-medium text-red-600 active:bg-red-50"
            >
              Se déconnecter
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
