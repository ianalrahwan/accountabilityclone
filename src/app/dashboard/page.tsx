import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import GoalCard from '@/components/GoalCard'
import SignOutButton from '@/components/SignOutButton'
import type { GoalWithMeta } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/')

  // Fetch goals with last check-in, partnership, and stake contract info
  const { data: goals } = await supabase
    .from('goals')
    .select(`
      *,
      partnerships (*),
      checkins (checked_at),
      stake_contracts (*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const goalsWithMeta: GoalWithMeta[] = (goals ?? []).map((g) => {
    const checkinDates = (g.checkins as { checked_at: string }[])
      .map((c) => c.checked_at)
      .sort()
      .reverse()

    return {
      id: g.id,
      user_id: g.user_id,
      title: g.title,
      description: g.description,
      created_at: g.created_at,
      partnership: g.partnerships?.[0] ?? null,
      last_checkin: checkinDates[0] ?? null,
      stake_contract: g.stake_contracts?.[0] ?? null,
    }
  })

  const profile = user.user_metadata

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-indigo-600">Accountability</h1>
          <div className="flex items-center gap-4">
            {profile?.avatar_url && (
              <img
                src={profile.avatar_url as string}
                alt="avatar"
                className="w-8 h-8 rounded-full"
              />
            )}
            <Link
              href="/settings"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Settings
            </Link>
            <SignOutButton />
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Your Goals</h2>
          <Link
            href="/goals/new"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            + New Goal
          </Link>
        </div>

        {goalsWithMeta.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg">No goals yet.</p>
            <p className="mt-1 text-sm">
              Create your first goal to get started.
            </p>
            <Link
              href="/goals/new"
              className="mt-4 inline-block px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Create a goal
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {goalsWithMeta.map((goal) => (
              <li key={goal.id}>
                <GoalCard goal={goal} />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
