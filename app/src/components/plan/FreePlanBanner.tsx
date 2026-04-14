'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Props {
  currentCount: number
  limit: number
}

export function FreePlanBanner({ currentCount, limit }: Props) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  const remaining = limit - currentCount

  return (
    <div className="mx-4 mb-3 flex items-start gap-3 rounded-2xl bg-orange-50 border border-orange-200 px-4 py-3">
      <svg className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <div className="flex-1 text-sm">
        <p className="font-medium text-orange-800">
          {remaining <= 0
            ? 'Limite atteinte — archivez pour continuer.'
            : `Plus que ${remaining} commande${remaining > 1 ? 's' : ''} disponible${remaining > 1 ? 's' : ''}.`}
        </p>
        <Link href="/upgrade" className="text-orange-700 underline text-xs">
          Voir les options premium
        </Link>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="text-orange-400 hover:text-orange-600"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
  )
}
