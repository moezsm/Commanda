'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import type { DeliveryCompany } from '@/lib/types'

interface Props {
  company?: DeliveryCompany
  workspaceId?: string
}

export function DeliveryCompanyForm({ company, workspaceId }: Props) {
  const router = useRouter()
  const isEditing = !!company

  const [name, setName] = useState(company?.name ?? '')
  const [contactName, setContactName] = useState(company?.contact_name ?? '')
  const [contactPhone, setContactPhone] = useState(company?.contact_phone ?? '')
  const [notes, setNotes] = useState(company?.notes ?? '')
  const [isActive, setIsActive] = useState(company?.is_active ?? true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  function validate() {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Le nom est requis.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    const supabase = createClient()

    if (isEditing && company) {
      const { error } = await supabase
        .from('delivery_companies')
        .update({ name: name.trim(), contact_name: contactName.trim() || null, contact_phone: contactPhone.trim() || null, notes: notes.trim() || null, is_active: isActive })
        .eq('id', company.id)
      setLoading(false)
      if (error) { setErrors({ form: 'Erreur.' }); return }
      router.push('/settings/delivery-companies')
      router.refresh()
    } else {
      let wsId = workspaceId
      if (!wsId) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/sign-in'); return }
        const { data: profile } = await supabase.from('profiles').select('workspace_id').eq('id', user.id).single()
        wsId = profile?.workspace_id
      }
      if (!wsId) return
      const { error } = await supabase.from('delivery_companies').insert({
        workspace_id: wsId, name: name.trim(),
        contact_name: contactName.trim() || null, contact_phone: contactPhone.trim() || null,
        notes: notes.trim() || null, is_active: isActive,
      })
      setLoading(false)
      if (error) { setErrors({ form: 'Erreur.' }); return }
      router.push('/settings/delivery-companies')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4 pb-32">
      <div className="rounded-2xl bg-white p-4 shadow-sm flex flex-col gap-4">
        <Input label="Nom du transporteur" value={name} onChange={(e) => setName(e.target.value)} required error={errors.name} />
        <Input label="Nom du contact" value={contactName} onChange={(e) => setContactName(e.target.value)} />
        <Input label="Téléphone du contact" type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
        <Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" className="h-5 w-5 rounded" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          <span className="text-sm text-gray-700">Actif (visible dans les commandes)</span>
        </label>
        {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}
      </div>
      <div className="fixed bottom-16 left-0 right-0 border-t border-gray-200 bg-white px-4 py-3">
        <Button type="submit" className="w-full" loading={loading}>
          {isEditing ? 'Sauvegarder' : 'Créer le transporteur'}
        </Button>
      </div>
    </form>
  )
}
