'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import type { Frequency } from '@/lib/types'

// ---- Goals ----

const stakeSchema = z.object({
  total_stake: z.coerce.number().positive().max(10000),
  frequency: z.enum(['daily', '3x_week', 'weekly']),
  starts_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  ends_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timezone: z.string().min(1),
  recipient_email: z.string().email(),
})

export async function createGoal(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const title = (formData.get('title') as string).trim()
  const description = (formData.get('description') as string | null)?.trim() || null
  const hasStake = formData.get('has_stake') === 'true'

  if (!title) redirect('/goals/new')

  const { data, error } = await supabase
    .from('goals')
    .insert({ user_id: user.id, title, description })
    .select('id')
    .single()

  if (error) {
    console.error('createGoal insert error:', error.message)
    redirect('/goals/new')
  }

  // Create stake contract if requested
  if (hasStake) {
    const parsed = stakeSchema.safeParse({
      total_stake: formData.get('total_stake'),
      frequency: formData.get('frequency'),
      starts_at: formData.get('starts_at'),
      ends_at: formData.get('ends_at'),
      timezone: formData.get('timezone'),
      recipient_email: formData.get('recipient_email'),
    })

    if (!parsed.success) {
      // Goal was created but stake failed — still redirect, user can add stake later
      redirect(`/goals/${data.id}`)
    }

    const s = parsed.data
    const recipientEmail = s.recipient_email.toLowerCase()

    // Check if recipient has an account
    const { data: recipientProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', recipientEmail)
      .maybeSingle()

    await supabase.from('stake_contracts').insert({
      goal_id: data.id,
      total_stake_cents: Math.round(s.total_stake * 100),
      frequency: s.frequency as Frequency,
      starts_at: s.starts_at,
      ends_at: s.ends_at,
      timezone: s.timezone,
      recipient_user_id: recipientProfile?.id ?? null,
      recipient_email: recipientEmail,
    })
  }

  redirect(`/goals/${data.id}`)
}

export async function deleteGoal(goalId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/')

  await supabase.from('goals').delete().eq('id', goalId).eq('user_id', user.id)

  redirect('/dashboard')
}

// ---- Check-ins ----

export async function createCheckin(goalId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/')

  await supabase.from('checkins').insert({ goal_id: goalId })

  revalidatePath(`/goals/${goalId}`)
}

// ---- Partnerships ----

export async function savePartnership(goalId: string, partnerEmail: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const email = partnerEmail.trim().toLowerCase()
  if (!email) return { error: 'Email is required' }

  // Check if partner already has an account
  const { data: partnerProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  const { error } = await supabase.from('partnerships').upsert(
    {
      goal_id: goalId,
      partner_email: email,
      partner_user_id: partnerProfile?.id ?? null,
    },
    { onConflict: 'goal_id' }
  )

  if (error) return { error: error.message }

  revalidatePath(`/goals/${goalId}`)
  return { success: true }
}

export async function removePartnership(goalId: string) {
  const supabase = await createClient()
  await supabase.from('partnerships').delete().eq('goal_id', goalId)
  revalidatePath(`/goals/${goalId}`)
}

// ---- Stake Contracts ----

export async function cancelStakeContract(contractId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/')

  // RLS ensures only the goal owner can update
  const { error } = await supabase
    .from('stake_contracts')
    .update({ status: 'cancelled' })
    .eq('id', contractId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
}

// ---- PayPal ----

export async function unlinkPaypal() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/')

  await supabase.from('paypal_tokens').delete().eq('user_id', user.id)
  revalidatePath('/settings')
}
