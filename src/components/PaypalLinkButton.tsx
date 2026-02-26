'use client'

import { useTransition } from 'react'
import { unlinkPaypal } from '@/app/actions'

export default function PaypalLinkButton({
  isLinked,
  paypalEmail,
}: {
  isLinked: boolean
  paypalEmail: string | null
}) {
  const [isPending, startTransition] = useTransition()

  if (isLinked) {
    return (
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900">PayPal connected</p>
          <p className="text-xs text-gray-500">{paypalEmail}</p>
        </div>
        <button
          onClick={() => startTransition(() => unlinkPaypal())}
          disabled={isPending}
          className="text-xs text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
        >
          {isPending ? 'Unlinking...' : 'Unlink'}
        </button>
      </div>
    )
  }

  return (
    <a
      href="/api/paypal/connect"
      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
    >
      Link PayPal
    </a>
  )
}
