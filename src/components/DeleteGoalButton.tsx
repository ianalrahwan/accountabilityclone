'use client'

import { deleteGoal } from '@/app/actions'

export default function DeleteGoalButton({ goalId }: { goalId: string }) {
  return (
    <form
      action={() => deleteGoal(goalId)}
      onSubmit={(e) => {
        if (!confirm('Delete this goal? This cannot be undone.')) {
          e.preventDefault()
        }
      }}
    >
      <button
        type="submit"
        className="text-xs text-red-400 hover:text-red-600 transition-colors"
      >
        Delete goal
      </button>
    </form>
  )
}
