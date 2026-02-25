import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SignInButton from '@/components/SignInButton'

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  const params = await searchParams
  const hasError = params.error === 'auth'

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Logo / Brand */}
        <div>
          <h1 className="text-4xl font-bold text-indigo-600">Accountability</h1>
          <p className="mt-3 text-lg text-gray-600">
            Set goals. Stay accountable. Get results.
          </p>
        </div>

        {/* Feature highlights */}
        <ul className="text-left space-y-3 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-indigo-500 font-bold mt-0.5">+</span>
            Create goals and track your progress
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-500 font-bold mt-0.5">+</span>
            Add an accountability partner to keep you honest
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-500 font-bold mt-0.5">+</span>
            Check in daily — your partner sees every update
          </li>
        </ul>

        {/* Error message */}
        {hasError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-4 py-2">
            Sign-in failed. Please try again.
          </p>
        )}

        {/* Sign in */}
        <SignInButton />
      </div>
    </main>
  )
}
