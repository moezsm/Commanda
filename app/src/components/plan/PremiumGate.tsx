'use client'

import Link from 'next/link'
import type { FeatureKey } from '@/lib/features'

interface PremiumGateProps {
  featureKey: FeatureKey
  hasAccess: boolean
  children: React.ReactNode
  lockedMessage?: string
}

/**
 * Wraps premium-only UI. Renders children when hasAccess is true,
 * shows a locked upgrade prompt otherwise.
 * Pass hasAccess from the server component after calling hasFeature().
 */
export function PremiumGate({
  hasAccess,
  children,
  lockedMessage = 'Cette fonctionnalité est disponible en plan Premium.',
}: PremiumGateProps) {
  if (hasAccess) {
    return <>{children}</>
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-indigo-200 bg-indigo-50 p-6 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
        <svg className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <p className="text-sm text-gray-600">{lockedMessage}</p>
      <Link
        href="/upgrade"
        className="mt-3 text-sm font-medium text-indigo-600 underline"
      >
        Voir les options Premium →
      </Link>
    </div>
  )
}
