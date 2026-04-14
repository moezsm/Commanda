'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { DeliveryCompany } from '@/lib/types'

interface DeliveryCompanyPickerProps {
  workspaceId: string
  value: { id: string; name: string } | null
  onChange: (value: { id: string; name: string }) => void
}

export function DeliveryCompanyPicker({ workspaceId, value, onChange }: DeliveryCompanyPickerProps) {
  const [open, setOpen] = useState(false)
  const [companies, setCompanies] = useState<DeliveryCompany[]>([])
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'list' | 'create'>('list')
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)

  async function loadCompanies() {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('delivery_companies')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('is_active', true)
      .order('name')
    setCompanies((data ?? []) as DeliveryCompany[])
    setLoading(false)
  }

  function handleOpen() {
    setOpen(true)
    setMode('list')
    loadCompanies()
  }

  async function handleCreate() {
    if (!newName.trim()) return
    setCreating(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('delivery_companies')
      .insert({ workspace_id: workspaceId, name: newName.trim(), is_active: true })
      .select()
      .single()
    setCreating(false)
    if (!error && data) {
      onChange({ id: data.id, name: data.name })
      setOpen(false)
    }
  }

  return (
    <>
      <div>
        <label className="text-sm font-medium text-gray-700">Transporteur</label>
        <button
          type="button"
          onClick={handleOpen}
          className="mt-1 flex h-11 w-full items-center justify-between rounded-xl border border-gray-300 bg-white px-4 text-base text-left"
        >
          <span className={value ? 'text-gray-900 font-medium' : 'text-gray-400'}>
            {value?.name ?? 'Sélectionner…'}
          </span>
          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white">
          <div className="flex items-center border-b border-gray-200 px-4 py-3 gap-3">
            <button type="button" onClick={() => setOpen(false)} className="text-gray-500">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <span className="font-semibold text-gray-900">Sélectionner un transporteur</span>
          </div>

          {mode === 'list' && (
            <div className="flex-1 overflow-auto px-4 py-4">
              <button
                type="button"
                onClick={() => { setMode('create'); setNewName('') }}
                className="mb-3 flex w-full items-center gap-2 rounded-xl border border-dashed border-indigo-300 px-4 py-3 text-indigo-600 text-sm font-medium"
              >
                + Nouveau transporteur
              </button>
              {loading && <p className="py-4 text-center text-sm text-gray-400">Chargement…</p>}
              {!loading && companies.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => { onChange({ id: c.id, name: c.name }); setOpen(false) }}
                  className="flex w-full items-center justify-between rounded-xl px-4 py-3 hover:bg-gray-50 active:bg-gray-100"
                >
                  <span className="font-medium text-gray-900">{c.name}</span>
                  {c.contact_phone && <span className="text-sm text-gray-500">{c.contact_phone}</span>}
                </button>
              ))}
            </div>
          )}

          {mode === 'create' && (
            <div className="flex flex-col gap-4 px-4 py-4">
              <button type="button" onClick={() => setMode('list')} className="text-sm text-indigo-600">← Retour</button>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nom du transporteur *"
                className="h-11 w-full rounded-xl border border-gray-300 px-4 text-base focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleCreate}
                disabled={creating || !newName.trim()}
                className="h-12 w-full rounded-xl bg-indigo-600 text-white font-semibold disabled:opacity-50"
              >
                {creating ? 'Création…' : 'Créer et sélectionner'}
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}
