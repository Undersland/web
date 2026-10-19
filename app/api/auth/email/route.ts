import { NextResponse } from 'next/server'

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string
    notificationToken?: string
  }

  try {
    const response = await fetch(`${apiUrl}/users/v1/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: body.email,
        metadata: {
          platform: 'web',
          notificationToken: body.notificationToken,
        },
      }),
      cache: 'no-store',
    })

    const payload = await response.json()
    return NextResponse.json(payload, { status: response.status })
  } catch (error) {
    console.error('Unable to reach the users service:', error)
    return NextResponse.json(
      { error: { message: 'The authentication service is unavailable.' } },
      { status: 503 },
    )
  }
}
