'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// ---- Goals ----

export async function createGoal(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const title = (formData.get('title') as string).trim()
  const description = (formData.get('description') as string | null)?.trim() || null

  if (!title) return { error: 'Title is required' }

  const { data, error } = await supabase
    .from('goals')
    .insert({ user_id: user.id, title, description })
    .select('id')
    .single()

  if (error) return { error: error.message }

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
