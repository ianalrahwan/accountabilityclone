'use client'

import { useTransition } from 'react'
import { createCheckin } from '@/app/actions'

export default function CheckinButton({
  goalId,
  checkedInToday,
}: {
  goalId: string
  checkedInToday: boolean
}) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (checkedInToday) return
    startTransition(() => createCheckin(goalId))
  }

  return (
    <button
      onClick={handleClick}
      disabled={checkedInToday || isPending}
      className={`
        w-full flex items-center justify-center gap-3 py-4 rounded-xl font-semibold text-lg transition-all
        ${
          checkedInToday
            ? 'bg-green-50 border-2 border-green-400 text-green-700 cursor-default'
            : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-md'
        }
        ${isPending ? 'opacity-70 cursor-not-allowed' : ''}
      `}
    >
      {checkedInToday ? (
        <>
          <span className="text-2xl">✓</span>
          Checked in today!
        </>
      ) : isPending ? (
        'Checking in...'
      ) : (
        <>
          <span className="text-2xl">☐</span>
          Check in for today
        </>
      )}
    </button>
  )
}
