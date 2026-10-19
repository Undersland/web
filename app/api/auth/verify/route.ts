import { NextResponse } from 'next/server'

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

type ValidateResponse = {
  data?: { token?: string; expiresIn?: number }
  error?: { message?: string } | null
}

export async function POST(request: Request) {
  const { token } = (await request.json()) as { token?: string }

  if (!token) {
    return NextResponse.json({ error: 'Token is required.' }, { status: 400 })
  }

  const validationResponse = await fetch(`${apiUrl}/users/v1/token/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
    cache: 'no-store',
  })
  const payload = (await validationResponse.json()) as ValidateResponse
  const sessionToken = payload.data?.token

  if (!validationResponse.ok || !sessionToken) {
    return NextResponse.json(
      { error: payload.error?.message ?? 'Invalid or expired token.' },
      { status: validationResponse.status },
    )
  }

  const response = NextResponse.json({ data: { authenticated: true } })
  response.cookies.set('undersland_session', sessionToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: payload.data?.expiresIn ?? 3600,
    path: '/',
    ...(process.env.SESSION_COOKIE_DOMAIN
      ? { domain: process.env.SESSION_COOKIE_DOMAIN }
      : {}),
  })

  return response
}
