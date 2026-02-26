import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PaypalLinkButton from '@/components/PaypalLinkButton'

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const { data: paypalToken } = await supabase
    .from('paypal_tokens')
    .select('paypal_email')
    .eq('user_id', user.id)
    .maybeSingle()

  const profile = user.user_metadata

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            &larr; Back to dashboard
          </Link>
        </div>
      </nav>

      <main className="max-w-xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-semibold">Settings</h1>

        {/* Profile */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-3">Profile</h2>
          <div className="flex items-center gap-3">
            {profile?.avatar_url && (
              <img
                src={profile.avatar_url as string}
                alt="avatar"
                className="w-10 h-10 rounded-full"
              />
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">
                {profile?.full_name || user.email}
              </p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
        </section>

        {/* PayPal */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-3">PayPal</h2>
          <PaypalLinkButton
            isLinked={!!paypalToken}
            paypalEmail={paypalToken?.paypal_email ?? null}
          />
          <p className="mt-3 text-xs text-gray-400">
            Link your PayPal account to receive accountability stake payments from friends.
          </p>
        </section>
      </main>
    </div>
  )
}
