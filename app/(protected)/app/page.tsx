import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

type CurrentUser = {
  id: string
  role: string
  name: string
  email: string
  avatar_url: string | null
  verified_at: string | null
  created_at: string
  updated_at: string
}

type JwtClaims = {
  sub?: string
  role?: string
  iat?: number
  exp?: number
  [key: string]: unknown
}

function decodeJwtClaims(token: string): JwtClaims | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null

    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
  } catch {
    return null
  }
}

function formatTimestamp(timestamp?: number) {
  return timestamp ? new Date(timestamp * 1000).toISOString() : 'Not provided'
}

async function logout() {
  'use server'

  const cookieStore = await cookies()
  cookieStore.set('undersland_session', '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
    path: '/',
    ...(process.env.SESSION_COOKIE_DOMAIN
      ? { domain: process.env.SESSION_COOKIE_DOMAIN }
      : {}),
  })

  redirect('/auth')
}

export default async function Page() {
  const cookieStore = await cookies()
  const token = cookieStore.get('undersland_session')?.value

  if (!token) redirect('/auth')

  const response = await fetch(`${apiUrl}/users/v1/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })

  if (response.status === 401) redirect('/auth')

  if (!response.ok) {
    throw new Error(`Unable to load user: ${response.status}`)
  }

  const payload = (await response.json()) as { data: CurrentUser }
  const user = payload.data
  const claims = decodeJwtClaims(token)

  return (
    <main className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-8 px-6 py-12">
      <div>
        <p className="text-sm text-muted-foreground">Authenticated user</p>
        <div className="mt-1 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">{user.name}</h1>
            <span className="mt-3 inline-flex rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
              {user.role}
            </span>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">User information</h2>
        <dl className="grid gap-3 rounded-lg border p-5 sm:grid-cols-[10rem_1fr]">
          <dt className="text-muted-foreground">ID</dt>
          <dd className="break-all font-mono text-sm">{user.id}</dd>
          <dt className="text-muted-foreground">Role</dt>
          <dd>{user.role}</dd>
          <dt className="text-muted-foreground">Name</dt>
          <dd>{user.name}</dd>
          <dt className="text-muted-foreground">Email</dt>
          <dd>{user.email}</dd>
          <dt className="text-muted-foreground">Avatar URL</dt>
          <dd className="break-all">{user.avatar_url ?? 'Not provided'}</dd>
          <dt className="text-muted-foreground">Verified at</dt>
          <dd>{user.verified_at ?? 'Not verified'}</dd>
          <dt className="text-muted-foreground">Created at</dt>
          <dd>{user.created_at}</dd>
          <dt className="text-muted-foreground">Updated at</dt>
          <dd>{user.updated_at}</dd>
        </dl>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Session</h2>
        <dl className="grid gap-3 rounded-lg border p-5 sm:grid-cols-[10rem_1fr]">
          <dt className="text-muted-foreground">Subject</dt>
          <dd className="break-all font-mono text-sm">
            {claims?.sub ?? 'Not provided'}
          </dd>
          <dt className="text-muted-foreground">JWT role</dt>
          <dd>{claims?.role ?? 'Not provided'}</dd>
          <dt className="text-muted-foreground">Issued at</dt>
          <dd>{formatTimestamp(claims?.iat)}</dd>
          <dt className="text-muted-foreground">Expires at</dt>
          <dd>{formatTimestamp(claims?.exp)}</dd>
        </dl>

        <h3 className="mb-2 mt-5 text-sm font-semibold">Access token</h3>
        <pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-lg border bg-muted p-4 font-mono text-xs">
          {token}
        </pre>
      </section>
    </main>
  )
}
