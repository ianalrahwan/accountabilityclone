import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { randomUUID } from 'node:crypto'

const MOCK = process.env.MOCK_PAYPAL === 'true'
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || ''
const PAYPAL_REDIRECT_URI = process.env.PAYPAL_REDIRECT_URI || 'http://localhost:3000/api/paypal/callback'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  const state = randomUUID()
  const origin = new URL(request.url).origin

  // In mock mode, skip PayPal and go straight to callback with a fake code
  if (MOCK) {
    const callbackUrl = new URL('/api/paypal/callback', origin)
    callbackUrl.searchParams.set('code', 'MOCK_CODE')
    callbackUrl.searchParams.set('state', state)

    const response = NextResponse.redirect(callbackUrl)
    response.cookies.set('paypal_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    })
    return response
  }

  const paypalAuthUrl = new URL('https://www.paypal.com/signin/authorize')
  paypalAuthUrl.searchParams.set('response_type', 'code')
  paypalAuthUrl.searchParams.set('client_id', PAYPAL_CLIENT_ID)
  paypalAuthUrl.searchParams.set('scope', 'openid email https://uri.paypal.com/services/paypalattributes')
  paypalAuthUrl.searchParams.set('redirect_uri', PAYPAL_REDIRECT_URI)
  paypalAuthUrl.searchParams.set('state', state)

  const response = NextResponse.redirect(paypalAuthUrl)
  response.cookies.set('paypal_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })
  return response
}
