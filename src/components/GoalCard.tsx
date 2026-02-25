import Link from 'next/link'
import type { GoalWithMeta } from '@/lib/types'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function GoalCard({ goal }: { goal: GoalWithMeta }) {
  return (
    <Link
      href={`/goals/${goal.id}`}
      className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{goal.title}</h3>
          {goal.description && (
            <p className="mt-1 text-sm text-gray-500 line-clamp-1">
              {goal.description}
            </p>
          )}
        </div>

        {/* Partner badge */}
        {goal.partnership ? (
          <span className="shrink-0 text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full px-2.5 py-0.5">
            Partner added
          </span>
        ) : (
          <span className="shrink-0 text-xs bg-gray-100 text-gray-500 rounded-full px-2.5 py-0.5">
            No partner
          </span>
        )}
      </div>

      <div className="mt-3 text-xs text-gray-400">
        {goal.last_checkin ? (
          <span>Last check-in: {formatDate(goal.last_checkin)}</span>
        ) : (
          <span>No check-ins yet</span>
        )}
      </div>
    </Link>
  )
}
