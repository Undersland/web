'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef, useState } from 'react'

function Verification() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const email = searchParams.get('email')
  const started = useRef(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token || started.current) return
    started.current = true

    fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then((response) => {
        if (!response.ok) throw new Error('Invalid token')
        router.replace('/app')
        router.refresh()
      })
      .catch(() => {
        setError('This access link is invalid or has expired.')
      })
  }, [router, token])

  return (
    <div className="mx-auto flex h-full max-w-md flex-col items-center justify-center px-6 text-center">
      <p
        className="text-sm text-muted-foreground"
        role={error ? 'alert' : undefined}
      >
        {error ??
          (token
            ? 'Signing you in…'
            : `We sent an access link${email ? ` to ${email}` : ' to your email'}.`)}
      </p>
      {error ? (
        <button
          type="button"
          className="mt-4 text-sm font-medium underline"
          onClick={() => router.replace('/auth')}
        >
          Request a new link
        </button>
      ) : null}
    </div>
  )
}

export default function Page() {
  return (
    <Suspense>
      <Verification />
    </Suspense>
  )
}
