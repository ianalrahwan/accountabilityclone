import type { Checkin } from '@/lib/types'

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function CheckinHistory({ checkins }: { checkins: Checkin[] }) {
  if (checkins.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-6">
        No check-ins yet. Hit the button above to start!
      </p>
    )
  }

  return (
    <ul className="divide-y divide-gray-100">
      {checkins.map((c) => (
        <li
          key={c.id}
          className="flex items-center gap-3 py-3 text-sm text-gray-600"
        >
          <span className="text-green-500 text-base">✓</span>
          {formatDateTime(c.checked_at)}
        </li>
      ))}
    </ul>
  )
}
