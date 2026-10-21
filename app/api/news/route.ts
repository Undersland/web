import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get('undersland_session')?.value

  if (!token) {
    return NextResponse.json(
      { error: { message: 'Sua sessão expirou. Entre novamente.' } },
      { status: 401 },
    )
  }

  try {
    const body = await request.json()
    const response = await fetch(new URL('/core/v1/news', apiUrl), {
      method: 'POST',
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    })

    const payload = await response.json().catch(() => ({
      error: { message: 'A API retornou uma resposta inválida.' },
    }))

    return NextResponse.json(payload, { status: response.status })
  } catch {
    return NextResponse.json(
      { error: { message: 'Não foi possível conectar à API.' } },
      { status: 502 },
    )
  }
}
