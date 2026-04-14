'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { OrderStatus } from '@/lib/types'

interface Props {
  orderId: string
  currentStatus: OrderStatus
}

export function ArchiveOrderButton({ orderId, currentStatus }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // For delivered status, show an explicit auto-archive prompt
  async function archive() {
    if (!confirm('Archiver cette commande ?')) return
    setLoading(true)
    const supabase = createClient()
    await supabase.from('orders').update({
      is_archived: true,
      archived_at: new Date().toISOString(),
      status: currentStatus === 'delivered' ? 'delivered' : currentStatus,
      updated_at: new Date().toISOString(),
    }).eq('id', orderId)
    setLoading(false)
    router.push('/orders')
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={archive}
      disabled={loading}
      className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 active:bg-gray-50 disabled:opacity-50"
    >
      {loading ? '…' : 'Archiver'}
    </button>
  )
}
