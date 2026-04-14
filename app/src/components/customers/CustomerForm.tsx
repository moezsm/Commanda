'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import type { Customer } from '@/lib/types'

interface CustomerFormProps {
  customer?: Customer
}

export function CustomerForm({ customer }: CustomerFormProps) {
  const router = useRouter()
  const isEditing = !!customer

  const [fullName, setFullName] = useState(customer?.full_name ?? '')
  const [phonePrimary, setPhonePrimary] = useState(customer?.phone_primary ?? '')
  const [phoneSecondary, setPhoneSecondary] = useState(customer?.phone_secondary ?? '')
  const [addressLine, setAddressLine] = useState(customer?.address_line ?? '')
  const [city, setCity] = useState(customer?.city ?? '')
  const [notes, setNotes] = useState(customer?.notes ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  function validate() {
    const e: Record<string, string> = {}
    if (!fullName.trim()) e.fullName = 'Le nom est requis.'
    if (!phonePrimary.trim()) e.phonePrimary = 'Le téléphone est requis.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    const supabase = createClient()

    if (isEditing && customer) {
      const { error } = await supabase
        .from('customers')
        .update({
          full_name: fullName.trim(),
          phone_primary: phonePrimary.trim(),
          phone_secondary: phoneSecondary.trim() || null,
          address_line: addressLine.trim() || null,
          city: city.trim() || null,
          notes: notes.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', customer.id)
      setLoading(false)
      if (error) { setErrors({ form: 'Erreur lors de la sauvegarde.' }); return }
      router.push(`/customers/${customer.id}`)
      router.refresh()
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/sign-in'); return }
      const { data: profile } = await supabase.from('profiles').select('workspace_id').eq('id', user.id).single()
      if (!profile) { router.push('/onboarding'); return }

      const { data: newCustomer, error } = await supabase
        .from('customers')
        .insert({
          workspace_id: profile.workspace_id,
          full_name: fullName.trim(),
          phone_primary: phonePrimary.trim(),
          phone_secondary: phoneSecondary.trim() || null,
          address_line: addressLine.trim() || null,
          city: city.trim() || null,
          notes: notes.trim() || null,
        })
        .select()
        .single()
      setLoading(false)
      if (error || !newCustomer) { setErrors({ form: 'Erreur lors de la création.' }); return }
      router.push(`/customers/${newCustomer.id}`)
      router.refresh()
    }
  }

  async function handleDelete() {
    if (!customer || !confirm('Supprimer ce client ?')) return
    setDeleteLoading(true)
    const supabase = createClient()
    await supabase.from('customers').delete().eq('id', customer.id)
    setDeleteLoading(false)
    router.push('/customers')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4 pb-32">
      <div className="rounded-2xl bg-white p-4 shadow-sm flex flex-col gap-4">
        <Input
          label="Nom complet"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          error={errors.fullName}
        />
        <Input
          label="Téléphone principal"
          type="tel"
          value={phonePrimary}
          onChange={(e) => setPhonePrimary(e.target.value)}
          required
          error={errors.phonePrimary}
        />
        <Input
          label="Téléphone secondaire"
          type="tel"
          value={phoneSecondary}
          onChange={(e) => setPhoneSecondary(e.target.value)}
        />
        <Input
          label="Adresse"
          value={addressLine}
          onChange={(e) => setAddressLine(e.target.value)}
        />
        <Input
          label="Ville"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <Textarea
          label="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
        {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}
      </div>

      {/* Fixed bottom bar */}
      <div className="fixed bottom-16 left-0 right-0 border-t border-gray-200 bg-white px-4 py-3 flex gap-3">
        {isEditing && (
          <Button
            type="button"
            variant="danger"
            className="flex-1"
            onClick={handleDelete}
            loading={deleteLoading}
          >
            Supprimer
          </Button>
        )}
        <Button type="submit" className="flex-1" loading={loading}>
          {isEditing ? 'Sauvegarder' : 'Créer le client'}
        </Button>
      </div>
    </form>
  )
}
