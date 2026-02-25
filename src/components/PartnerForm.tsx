'use client'

import { useState, useTransition } from 'react'
import { savePartnership, removePartnership } from '@/app/actions'
import type { Partnership } from '@/lib/types'

export default function PartnerForm({
  goalId,
  partnership,
}: {
  goalId: string
  partnership: Partnership | null
}) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await savePartnership(goalId, email)
      if (result?.error) setError(result.error)
      else setEmail('')
    })
  }

  function handleRemove() {
    startTransition(() => removePartnership(goalId))
  }

  if (partnership) {
    return (
      <div className="flex items-center justify-between gap-4 bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3">
        <div>
          <p className="text-xs text-indigo-500 font-medium uppercase tracking-wide mb-0.5">
            Accountability partner
          </p>
          <p className="text-sm font-medium text-indigo-900">
            {partnership.partner_email}
          </p>
          {!partnership.partner_user_id && (
            <p className="text-xs text-indigo-400 mt-0.5">
              Has not signed up yet
            </p>
          )}
        </div>
        <button
          onClick={handleRemove}
          disabled={isPending}
          className="text-xs text-red-500 hover:text-red-700 underline shrink-0"
        >
          Remove
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSave} className="space-y-3">
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="partner@example.com"
          required
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors"
        >
          {isPending ? 'Saving...' : 'Add partner'}
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </form>
  )
}
