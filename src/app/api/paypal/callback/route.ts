import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { exchangeCodeForTokens, fetchPaypalUserInfo, storePaypalTokens } from '@/lib/paypal'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const origin = new URL(request.url).origin

  // Validate CSRF state
  const storedState = request.cookies.get('paypal_oauth_state')?.value
  if (!state || !storedState || state !== storedState) {
    return NextResponse.redirect(new URL('/settings?paypal=error&reason=csrf', origin))
  }

  // Verify user is logged in
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL('/', origin))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/settings?paypal=error&reason=no_code', origin))
  }

  try {
    const redirectUri = process.env.PAYPAL_REDIRECT_URI || `${origin}/api/paypal/callback`
    const tokens = await exchangeCodeForTokens(code, redirectUri)
    const userInfo = await fetchPaypalUserInfo(tokens.access_token)
    await storePaypalTokens(user.id, tokens, userInfo)

    const response = NextResponse.redirect(new URL('/settings?paypal=linked', origin))
    response.cookies.delete('paypal_oauth_state')
    return response
  } catch (err) {
    console.error('PayPal OAuth callback error:', err)
    const response = NextResponse.redirect(new URL('/settings?paypal=error&reason=exchange_failed', origin))
    response.cookies.delete('paypal_oauth_state')
    return response
  }
}
