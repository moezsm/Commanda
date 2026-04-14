import { ORDER_STATUS_LABELS, type OrderStatusHistory } from '@/lib/types'
import { formatDateTime } from '@/lib/utils'

interface StatusTimelineProps {
  history: OrderStatusHistory[]
}

export function StatusTimeline({ history }: StatusTimelineProps) {
  const sorted = [...history].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )

  return (
    <ol className="relative ml-2 border-l border-gray-200">
      {sorted.map((entry, index) => (
        <li key={entry.id} className={`ml-4 ${index < sorted.length - 1 ? 'mb-4' : ''}`}>
          <div className="absolute -left-1.5 mt-1 h-3 w-3 rounded-full border border-white bg-indigo-400" />
          <p className="text-sm font-medium text-gray-900">{ORDER_STATUS_LABELS[entry.status]}</p>
          {entry.change_note && (
            <p className="text-xs text-gray-500">{entry.change_note}</p>
          )}
          <p className="text-xs text-gray-400">{formatDateTime(entry.created_at)}</p>
        </li>
      ))}
    </ol>
  )
}
