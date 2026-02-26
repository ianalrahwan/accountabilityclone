import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CheckinButton from '@/components/CheckinButton'
import CheckinHistory from '@/components/CheckinHistory'
import PartnerForm from '@/components/PartnerForm'
import StakeContractCard from '@/components/StakeContractCard'
import { deleteGoal } from '@/app/actions'
import { computeRequiredPeriods, computeStakePerPeriod } from '@/lib/stakes'
import type { Checkin, Partnership, StakeContract, DeductionLog } from '@/lib/types'

function isToday(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}

export default async function GoalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const { data: goal } = await supabase
    .from('goals')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!goal) notFound()

  const [{ data: checkins }, { data: partnership }, { data: stakeContract }] = await Promise.all([
    supabase
      .from('checkins')
      .select('*')
      .eq('goal_id', id)
      .order('checked_at', { ascending: false }),
    supabase
      .from('partnerships')
      .select('*')
      .eq('goal_id', id)
      .maybeSingle(),
    supabase
      .from('stake_contracts')
      .select('*')
      .eq('goal_id', id)
      .maybeSingle(),
  ])

  const checkedInToday = (checkins ?? []).some((c: Checkin) =>
    isToday(c.checked_at)
  )

  // Fetch deductions if stake contract exists
  let deductions: DeductionLog[] = []
  let totalPeriods = 0
  let checkedInPeriods = 0
  let stakePerPeriod = 0

  if (stakeContract) {
    const sc = stakeContract as StakeContract
    const { data: logs } = await supabase
      .from('deduction_log')
      .select('*')
      .eq('contract_id', sc.id)
      .order('processed_at', { ascending: false })

    deductions = (logs ?? []) as DeductionLog[]

    const contractInput = {
      frequency: sc.frequency,
      starts_at: sc.starts_at,
      ends_at: sc.ends_at,
      timezone: sc.timezone,
      total_stake_cents: sc.total_stake_cents,
    }
    const now = new Date()
    totalPeriods = computeRequiredPeriods(contractInput, now).length
    checkedInPeriods = deductions.filter(d => !d.was_missed).length
    stakePerPeriod = computeStakePerPeriod(contractInput, now)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            &larr; My goals
          </Link>
          <form
            action={async () => {
              'use server'
              await deleteGoal(id)
            }}
          >
            <button
              type="submit"
              className="text-xs text-red-400 hover:text-red-600 transition-colors"
              onClick={(e) => {
                if (!confirm('Delete this goal? This cannot be undone.')) {
                  e.preventDefault()
                }
              }}
            >
              Delete goal
            </button>
          </form>
        </div>
      </nav>

      <main className="max-w-xl mx-auto px-4 py-8 space-y-6">
        {/* Goal header */}
        <div>
          <h1 className="text-2xl font-semibold">{goal.title}</h1>
          {goal.description && (
            <p className="mt-1 text-gray-500">{goal.description}</p>
          )}
        </div>

        {/* Check-in button */}
        <CheckinButton goalId={id} checkedInToday={checkedInToday} />

        {/* Stake contract */}
        {stakeContract && (
          <StakeContractCard
            contract={stakeContract as StakeContract}
            deductions={deductions}
            totalPeriods={totalPeriods}
            checkedInPeriods={checkedInPeriods}
            stakePerPeriod={stakePerPeriod}
          />
        )}

        {/* Partner section */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-3">
            Accountability partner
          </h2>
          <PartnerForm goalId={id} partnership={partnership as Partnership | null} />
          {partnership && (
            <p className="mt-3 text-xs text-gray-400">
              Your partner can view your progress at{' '}
              <span className="font-mono text-gray-500">
                /partner/{id}
              </span>
            </p>
          )}
        </section>

        {/* Check-in history */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-3">
            Check-in history ({(checkins ?? []).length})
          </h2>
          <CheckinHistory checkins={(checkins ?? []) as Checkin[]} />
        </section>
      </main>
    </div>
  )
}
