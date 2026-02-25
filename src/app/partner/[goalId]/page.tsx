import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CheckinHistory from '@/components/CheckinHistory'
import type { Checkin } from '@/lib/types'

export default async function PartnerViewPage({
  params,
}: {
  params: Promise<{ goalId: string }>
}) {
  const { goalId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/')

  // Verify this user is the listed partner for this goal
  const { data: partnership } = await supabase
    .from('partnerships')
    .select('*')
    .eq('goal_id', goalId)
    .maybeSingle()

  const isPartner =
    partnership?.partner_user_id === user.id ||
    partnership?.partner_email === user.email

  if (!partnership || !isPartner) notFound()

  // Fetch the goal (RLS will also enforce this)
  const { data: goal } = await supabase
    .from('goals')
    .select('*, profiles (full_name, email)')
    .eq('id', goalId)
    .single()

  if (!goal) notFound()

  const { data: checkins } = await supabase
    .from('checkins')
    .select('*')
    .eq('goal_id', goalId)
    .order('checked_at', { ascending: false })

  const owner = goal.profiles as { full_name: string | null; email: string }
  const ownerName = owner.full_name || owner.email

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-indigo-600">Accountability</h1>
          <Link
            href="/dashboard"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            My goals
          </Link>
        </div>
      </nav>

      <main className="max-w-xl mx-auto px-4 py-8 space-y-6">
        {/* Banner */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-5 py-4">
          <p className="text-xs text-indigo-500 font-medium uppercase tracking-wide mb-0.5">
            You are the accountability partner for
          </p>
          <p className="text-lg font-semibold text-indigo-900">{ownerName}</p>
        </div>

        {/* Goal */}
        <div>
          <h1 className="text-2xl font-semibold">{goal.title}</h1>
          {goal.description && (
            <p className="mt-1 text-gray-500">{goal.description}</p>
          )}
        </div>

        {/* Progress summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-indigo-600">
              {(checkins ?? []).length}
            </p>
            <p className="text-sm text-gray-500 mt-1">Total check-ins</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-indigo-600">
              {
                (checkins ?? []).filter((c: Checkin) => {
                  const d = new Date(c.checked_at)
                  const now = new Date()
                  const daysDiff = Math.floor(
                    (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
                  )
                  return daysDiff <= 7
                }).length
              }
            </p>
            <p className="text-sm text-gray-500 mt-1">This week</p>
          </div>
        </div>

        {/* Check-in history */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-3">
            Check-in history
          </h2>
          <CheckinHistory checkins={(checkins ?? []) as Checkin[]} />
        </section>
      </main>
    </div>
  )
}
