'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  ORDER_STATUS_LABELS,
  VALID_NEXT_STATUSES,
  type OrderStatus,
} from '@/lib/types'

interface Props {
  orderId: string
  currentStatus: OrderStatus
  workspaceId: string
}

export function StatusUpdateSheet({ orderId, currentStatus, workspaceId }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [note, setNote] = useState('')

  const nextStatuses = VALID_NEXT_STATUSES[currentStatus]
  if (nextStatuses.length === 0) return null

  async function handleUpdate(newStatus: OrderStatus) {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('orders').update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    }).eq('id', orderId)

    await supabase.from('order_status_history').insert({
      workspace_id: workspaceId,
      order_id: orderId,
      status: newStatus,
      changed_by: user?.id ?? null,
      change_note: note.trim() || null,
    })

    setLoading(false)
    setOpen(false)
    setNote('')
    router.refresh()
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-600 active:bg-indigo-100"
      >
        Mettre à jour
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40" onClick={() => setOpen(false)}>
          <div
            className="rounded-t-3xl bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 text-base font-semibold text-gray-900">Changer le statut</h3>
            <div className="mb-4 flex flex-col gap-2">
              {nextStatuses.map((status) => (
                <button
                  key={status}
                  type="button"
                  disabled={loading}
                  onClick={() => handleUpdate(status)}
                  className="flex h-12 w-full items-center justify-center rounded-xl border border-gray-200 text-sm font-medium text-gray-800 active:bg-gray-50 disabled:opacity-50"
                >
                  {ORDER_STATUS_LABELS[status]}
                </button>
              ))}
            </div>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note optionnelle…"
              className="h-11 w-full rounded-xl border border-gray-300 px-4 text-sm focus:outline-none focus:border-indigo-500 mb-3"
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-full py-3 text-sm text-gray-500"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </>
  )
}
