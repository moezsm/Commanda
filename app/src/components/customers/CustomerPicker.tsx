'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Customer } from '@/lib/types'

interface CustomerPickerProps {
  workspaceId: string
  value: { id: string; name: string; phone: string; address?: string } | null
  onChange: (value: { id: string; name: string; phone: string; address?: string }) => void
}

export function CustomerPicker({ workspaceId, value, onChange }: CustomerPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'search' | 'create'>('search')
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [creating, setCreating] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  async function doSearch(q: string) {
    setLoading(true)
    const supabase = createClient()
    let query = supabase
      .from('customers')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('full_name')
      .limit(20)
    if (q) query = query.or(`full_name.ilike.%${q}%,phone_primary.ilike.%${q}%`)
    const { data } = await query
    setResults((data ?? []) as Customer[])
    setLoading(false)
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value
    setSearch(q)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(q), 300)
  }

  function handleOpen() {
    setOpen(true)
    setMode('search')
    setSearch('')
    doSearch('')
  }

  function handleSelect(c: Customer) {
    onChange({ id: c.id, name: c.full_name, phone: c.phone_primary, address: c.address_line ?? undefined })
    setOpen(false)
  }

  async function handleCreate() {
    if (!newName.trim() || !newPhone.trim()) return
    setCreating(true)
    const supabase = createClient()
    const { data: created, error } = await supabase
      .from('customers')
      .insert({ workspace_id: workspaceId, full_name: newName.trim(), phone_primary: newPhone.trim() })
      .select()
      .single()
    setCreating(false)
    if (!error && created) {
      onChange({ id: created.id, name: created.full_name, phone: created.phone_primary })
      setOpen(false)
    }
  }

  return (
    <>
      <div>
        <label className="text-sm font-medium text-gray-700">
          Client <span className="text-red-500">*</span>
        </label>
        <button
          type="button"
          onClick={handleOpen}
          className="mt-1 flex h-11 w-full items-center justify-between rounded-xl border border-gray-300 bg-white px-4 text-base text-left"
        >
          {value ? (
            <div>
              <span className="font-medium text-gray-900">{value.name}</span>
              <span className="ml-2 text-sm text-gray-500">{value.phone}</span>
            </div>
          ) : (
            <span className="text-gray-400">Sélectionner un client…</span>
          )}
          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white">
          <div className="flex items-center border-b border-gray-200 px-4 py-3 gap-3">
            <button type="button" onClick={() => setOpen(false)} className="text-gray-500">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <span className="font-semibold text-gray-900">Sélectionner un client</span>
          </div>

          {mode === 'search' && (
            <>
              <div className="px-4 py-3">
                <input
                  autoFocus
                  type="search"
                  value={search}
                  onChange={handleSearchChange}
                  placeholder="Rechercher…"
                  className="h-11 w-full rounded-xl border border-gray-300 bg-gray-50 px-4 text-base focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex-1 overflow-auto px-4">
                <button
                  type="button"
                  onClick={() => { setMode('create'); setNewName(search); setNewPhone('') }}
                  className="mb-3 flex w-full items-center gap-2 rounded-xl border border-dashed border-indigo-300 px-4 py-3 text-indigo-600 text-sm font-medium"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Nouveau client
                </button>
                {loading && <p className="py-4 text-center text-sm text-gray-400">Chargement…</p>}
                {!loading && results.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelect(c)}
                    className="flex w-full flex-col items-start rounded-xl px-4 py-3 hover:bg-gray-50 active:bg-gray-100"
                  >
                    <span className="font-medium text-gray-900">{c.full_name}</span>
                    <span className="text-sm text-gray-500">{c.phone_primary}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {mode === 'create' && (
            <div className="flex flex-col gap-4 px-4 py-4">
              <button type="button" onClick={() => setMode('search')} className="mb-2 text-sm text-indigo-600">← Retour à la recherche</button>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nom complet *"
                className="h-11 w-full rounded-xl border border-gray-300 px-4 text-base focus:outline-none focus:border-indigo-500"
              />
              <input
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="Téléphone *"
                type="tel"
                className="h-11 w-full rounded-xl border border-gray-300 px-4 text-base focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleCreate}
                disabled={creating || !newName.trim() || !newPhone.trim()}
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
