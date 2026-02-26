import Link from 'next/link'
import { createGoal } from '@/app/actions'
import StakeFields from '@/components/StakeFields'

export default function NewGoalPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link
            href="/dashboard"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            &larr; Back to dashboard
          </Link>
        </div>
      </nav>

      <main className="max-w-xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold mb-6">Create a new goal</h1>

        <form action={createGoal} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Goal title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              placeholder="e.g. Run 3x per week"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Add more details about your goal..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <StakeFields />

          <button
            type="submit"
            className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Create goal
          </button>
        </form>
      </main>
    </div>
  )
}
