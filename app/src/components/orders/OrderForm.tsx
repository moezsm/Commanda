'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { CustomerPicker } from '@/components/customers/CustomerPicker'
import { DeliveryCompanyPicker } from '@/components/delivery/DeliveryCompanyPicker'
import { SOURCE_CHANNEL_LABELS, type OrderWithDetails, type SourceChannel, type OrderStatus } from '@/lib/types'

interface OrderFormProps {
  workspaceId: string
  defaultCurrency: string
  order?: OrderWithDetails
}

interface OrderItem {
  product_name_snapshot: string
  sku_snapshot: string
  quantity: number
  unit_price_snapshot: string
}

const SOURCE_OPTIONS = Object.entries(SOURCE_CHANNEL_LABELS).map(([value, label]) => ({ value, label }))

export function OrderForm({ workspaceId, defaultCurrency, order }: OrderFormProps) {
  const router = useRouter()
  const isEditing = !!order

  const [customer, setCustomer] = useState<{ id: string; name: string; phone: string; address?: string } | null>(
    order?.customer_id && (order.customers as { id: string; full_name: string; phone_primary: string } | null)
      ? {
          id: order.customer_id,
          name: (order.customers as { full_name: string }).full_name,
          phone: (order.customers as { phone_primary: string }).phone_primary,
        }
      : null
  )

  const [deliveryCompany, setDeliveryCompany] = useState<{ id: string; name: string } | null>(
    order?.delivery_company_id && (order.delivery_companies as { id: string; name: string } | null)
      ? { id: order.delivery_company_id, name: (order.delivery_companies as { name: string }).name }
      : null
  )

  const [items, setItems] = useState<OrderItem[]>(
    order?.order_items?.map((i) => ({
      product_name_snapshot: i.product_name_snapshot,
      sku_snapshot: i.sku_snapshot ?? '',
      quantity: i.quantity,
      unit_price_snapshot: i.unit_price_snapshot?.toString() ?? '',
    })) ?? [{ product_name_snapshot: '', sku_snapshot: '', quantity: 1, unit_price_snapshot: '' }]
  )

  const [deliveryAddress, setDeliveryAddress] = useState(order?.delivery_address_snapshot ?? '')
  const [deliveryCity, setDeliveryCity] = useState(order?.delivery_city_snapshot ?? '')
  const [sourceChannel, setSourceChannel] = useState<string>(order?.source_channel ?? 'facebook')
  const [notes, setNotes] = useState(order?.notes ?? '')
  const [orderRef, setOrderRef] = useState(order?.order_reference ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  // Auto-fill delivery from customer when selected
  function handleCustomerChange(val: { id: string; name: string; phone: string; address?: string }) {
    setCustomer(val)
    if (!deliveryAddress && val.address) setDeliveryAddress(val.address)
  }

  function updateItem(index: number, field: keyof OrderItem, value: string | number) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  function addItem() {
    setItems((prev) => [...prev, { product_name_snapshot: '', sku_snapshot: '', quantity: 1, unit_price_snapshot: '' }])
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!customer) e.customer = 'Sélectionnez un client.'
    if (items.every((i) => !i.product_name_snapshot.trim())) e.items = 'Ajoutez au moins un produit.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/sign-in'); return }

    // Calc total
    const total = items.reduce((sum, item) => {
      const price = parseFloat(item.unit_price_snapshot || '0')
      return sum + price * item.quantity
    }, 0)

    const orderPayload = {
      workspace_id: workspaceId,
      customer_id: customer?.id ?? null,
      delivery_company_id: deliveryCompany?.id ?? null,
      order_reference: orderRef.trim() || null,
      source_channel: sourceChannel as SourceChannel,
      status: (isEditing ? order!.status : 'new') as OrderStatus,
      total_amount_snapshot: total > 0 ? total : null,
      currency_code: defaultCurrency,
      delivery_address_snapshot: deliveryAddress.trim() || null,
      delivery_city_snapshot: deliveryCity.trim() || null,
      client_name_snapshot: customer?.name ?? '',
      client_phone_snapshot: customer?.phone ?? '',
      notes: notes.trim() || null,
      created_by: user.id,
      updated_at: new Date().toISOString(),
    }

    if (isEditing && order) {
      const { error: updateError } = await supabase.from('orders').update(orderPayload).eq('id', order.id)
      if (updateError) { setErrors({ form: 'Erreur mise à jour.' }); setLoading(false); return }

      // Replace order items
      await supabase.from('order_items').delete().eq('order_id', order.id)
      const validItems = items.filter((i) => i.product_name_snapshot.trim())
      if (validItems.length > 0) {
        await supabase.from('order_items').insert(
          validItems.map((i) => ({
            workspace_id: workspaceId,
            order_id: order.id,
            product_name_snapshot: i.product_name_snapshot.trim(),
            sku_snapshot: i.sku_snapshot.trim() || null,
            quantity: i.quantity,
            unit_price_snapshot: parseFloat(i.unit_price_snapshot || '0') || null,
            line_total_snapshot: parseFloat(i.unit_price_snapshot || '0') * i.quantity || null,
          }))
        )
      }

      setLoading(false)
      router.push(`/orders/${order.id}`)
      router.refresh()
    } else {
      const { data: newOrder, error: insertError } = await supabase
        .from('orders')
        .insert(orderPayload)
        .select()
        .single()

      if (insertError || !newOrder) { setErrors({ form: 'Erreur création commande.' }); setLoading(false); return }

      // Insert items
      const validItems = items.filter((i) => i.product_name_snapshot.trim())
      if (validItems.length > 0) {
        await supabase.from('order_items').insert(
          validItems.map((i) => ({
            workspace_id: workspaceId,
            order_id: newOrder.id,
            product_name_snapshot: i.product_name_snapshot.trim(),
            sku_snapshot: i.sku_snapshot.trim() || null,
            quantity: i.quantity,
            unit_price_snapshot: parseFloat(i.unit_price_snapshot || '0') || null,
            line_total_snapshot: parseFloat(i.unit_price_snapshot || '0') * i.quantity || null,
          }))
        )
      }

      // Initial status history
      await supabase.from('order_status_history').insert({
        workspace_id: workspaceId,
        order_id: newOrder.id,
        status: 'new',
        changed_by: user.id,
      })

      setLoading(false)
      router.push(`/orders/${newOrder.id}`)
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4 pb-32">
      {/* Customer */}
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <CustomerPicker workspaceId={workspaceId} value={customer} onChange={handleCustomerChange} />
        {errors.customer && <p className="mt-1 text-sm text-red-600">{errors.customer}</p>}
      </div>

      {/* Products */}
      <div className="rounded-2xl bg-white p-4 shadow-sm flex flex-col gap-3">
        <p className="text-sm font-semibold text-gray-700">Produits</p>
        {items.map((item, index) => (
          <div key={index} className="flex flex-col gap-2 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
            <Input
              placeholder="Nom du produit *"
              value={item.product_name_snapshot}
              onChange={(e) => updateItem(index, 'product_name_snapshot', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Réf. SKU"
                value={item.sku_snapshot}
                onChange={(e) => updateItem(index, 'sku_snapshot', e.target.value)}
              />
              <Input
                type="number"
                placeholder="Quantité"
                value={item.quantity}
                min={1}
                onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value || '1', 10))}
              />
            </div>
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                placeholder={`Prix (${defaultCurrency})`}
                value={item.unit_price_snapshot}
                onChange={(e) => updateItem(index, 'unit_price_snapshot', e.target.value)}
                className="flex-1"
              />
              {items.length > 1 && (
                <button type="button" onClick={() => removeItem(index)} className="text-red-400 text-sm">Retirer</button>
              )}
            </div>
          </div>
        ))}
        {errors.items && <p className="text-sm text-red-600">{errors.items}</p>}
        <button type="button" onClick={addItem} className="text-indigo-600 text-sm font-medium text-left">
          + Ajouter un produit
        </button>
      </div>

      {/* Delivery */}
      <div className="rounded-2xl bg-white p-4 shadow-sm flex flex-col gap-3">
        <p className="text-sm font-semibold text-gray-700">Livraison</p>
        <DeliveryCompanyPicker workspaceId={workspaceId} value={deliveryCompany} onChange={setDeliveryCompany} />
        <Input
          label="Adresse de livraison"
          value={deliveryAddress}
          onChange={(e) => setDeliveryAddress(e.target.value)}
          placeholder="Adresse complète"
        />
        <Input
          label="Ville"
          value={deliveryCity}
          onChange={(e) => setDeliveryCity(e.target.value)}
        />
      </div>

      {/* Meta */}
      <div className="rounded-2xl bg-white p-4 shadow-sm flex flex-col gap-3">
        <Select
          label="Source"
          options={SOURCE_OPTIONS}
          value={sourceChannel}
          onChange={(e) => setSourceChannel(e.target.value)}
        />
        <Input
          label="Référence interne"
          value={orderRef}
          onChange={(e) => setOrderRef(e.target.value)}
          placeholder="Optionnel"
        />
        <Textarea
          label="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
        {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}
      </div>

      {/* Fixed save button */}
      <div className="fixed bottom-16 left-0 right-0 border-t border-gray-200 bg-white px-4 py-3">
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          {isEditing ? 'Sauvegarder les modifications' : 'Créer la commande'}
        </Button>
      </div>
    </form>
  )
}
