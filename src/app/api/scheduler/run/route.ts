import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { computeRequiredPeriods, computeStakePerPeriod } from '@/lib/stakes'
import { sendPayout } from '@/lib/paypal'
import type { StakeContract, Checkin } from '@/lib/types'

const SCHEDULER_SECRET = process.env.SCHEDULER_SECRET || ''

/**
 * Create a Supabase admin client that bypasses RLS (uses service role key).
 */
function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createSupabaseClient(url, serviceKey)
}

export async function POST(request: NextRequest) {
  // Authenticate via bearer token
  const authHeader = request.headers.get('authorization')
  if (!SCHEDULER_SECRET || authHeader !== `Bearer ${SCHEDULER_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const now = new Date()
  const summary = { processed: 0, deductions: 0, errors: 0, completed: 0 }

  // Fetch all active contracts
  const { data: contracts, error: fetchErr } = await supabase
    .from('stake_contracts')
    .select('*, goals(title)')
    .eq('status', 'active')

  if (fetchErr) {
    return NextResponse.json({ error: fetchErr.message }, { status: 500 })
  }

  for (const contract of (contracts || []) as (StakeContract & { goals: { title: string } })[]) {
    summary.processed++

    // Fetch check-ins for this goal
    const { data: checkins } = await supabase
      .from('checkins')
      .select('*')
      .eq('goal_id', contract.goal_id)

    const checkinDates = (checkins || []).map((c: Checkin) => new Date(c.checked_at))

    // Fetch existing deduction log entries to skip already-processed periods
    const { data: existingLogs } = await supabase
      .from('deduction_log')
      .select('period_key')
      .eq('contract_id', contract.id)

    const processedKeys = new Set((existingLogs || []).map((l: { period_key: string }) => l.period_key))

    // Compute required periods up to now
    const periods = computeRequiredPeriods({
      frequency: contract.frequency,
      starts_at: contract.starts_at,
      ends_at: contract.ends_at,
      timezone: contract.timezone,
      total_stake_cents: contract.total_stake_cents,
    }, now)

    const stakePerPeriod = computeStakePerPeriod({
      frequency: contract.frequency,
      starts_at: contract.starts_at,
      ends_at: contract.ends_at,
      timezone: contract.timezone,
      total_stake_cents: contract.total_stake_cents,
    }, now)

    for (const period of periods) {
      if (processedKeys.has(period.periodKey)) continue

      // For 3x_week, check-ins within the week window fill slots in order
      let wasMissed: boolean
      if (contract.frequency === '3x_week') {
        const checkinsInWindow = checkinDates.filter(
          d => d >= period.startsAt && d < period.endsAt
        ).length
        // Extract slot number from period key (e.g. "2026-W09-slot-2" → 2)
        const slotNum = parseInt(period.periodKey.split('-slot-')[1])
        wasMissed = checkinsInWindow < slotNum
      } else {
        // For daily/weekly: any check-in in the window means not missed
        const hasCheckin = checkinDates.some(
          d => d >= period.startsAt && d < period.endsAt
        )
        wasMissed = !hasCheckin
      }

      let payoutId: string | null = null
      let payoutStatus = wasMissed ? 'PENDING' : 'N/A'
      let payoutError: string | null = null

      if (wasMissed && stakePerPeriod > 0) {
        // Check if recipient has linked PayPal
        const { data: recipientToken } = await supabase
          .from('paypal_tokens')
          .select('paypal_email')
          .eq('user_id', contract.recipient_user_id || '')
          .maybeSingle()

        const recipientPaypalEmail = recipientToken?.paypal_email || null

        if (!recipientPaypalEmail) {
          payoutStatus = 'SKIPPED'
          payoutError = 'Recipient has not linked PayPal'
        } else {
          const goalTitle = contract.goals?.title || 'your goal'
          const result = await sendPayout({
            recipientEmail: recipientPaypalEmail,
            amountCents: stakePerPeriod,
            note: `Accountability stake: missed check-in on ${period.periodKey} for "${goalTitle}"`,
            senderBatchId: `${contract.id}-${period.periodKey}`,
          })

          payoutId = result.payoutId
          payoutStatus = result.status
          payoutError = result.error || null

          if (!result.success) summary.errors++
        }
        summary.deductions++
      }

      // Insert deduction log (ON CONFLICT DO NOTHING for idempotency)
      await supabase
        .from('deduction_log')
        .upsert({
          contract_id: contract.id,
          period_key: period.periodKey,
          was_missed: wasMissed,
          amount_cents: wasMissed ? stakePerPeriod : 0,
          payout_id: payoutId,
          payout_status: payoutStatus,
          payout_error: payoutError,
        }, { onConflict: 'contract_id,period_key', ignoreDuplicates: true })
    }

    // Mark contract as completed if past end date
    const endDate = new Date(contract.ends_at + 'T23:59:59Z')
    if (now > endDate) {
      await supabase
        .from('stake_contracts')
        .update({ status: 'completed' })
        .eq('id', contract.id)
      summary.completed++
    }
  }

  return NextResponse.json(summary)
}
