'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'
import { InputField } from '@/components/ui/input-field'

export default function Page() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isPending) return

    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail) return

    setError(null)
    setIsPending(true)

    try {
      const deviceId =
        localStorage.getItem('undersland_web_device_id') ?? crypto.randomUUID()
      localStorage.setItem('undersland_web_device_id', deviceId)

      const response = await fetch('/api/auth/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalizedEmail,
          notificationToken: `web:${deviceId}`,
        }),
      })

      if (!response.ok) {
        const payload = (await response.json()) as {
          error?: { message?: string }
        }
        throw new Error(payload.error?.message)
      }

      router.push(
        `/auth/verification?email=${encodeURIComponent(normalizedEmail)}`,
      )
    } catch (error) {
      setError(
        error instanceof Error && error.message
          ? error.message
          : 'Unable to send the access link. Please try again.',
      )
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col items-center justify-center px-20">
      <Image
        src="/UndersLand - Light.svg"
        alt="UndersLand"
        width={80}
        height={80}
        priority
        className="mb-4 dark:hidden"
      />
      <Image
        src="/UndersLand - Dark.svg"
        alt=""
        width={80}
        height={80}
        priority
        aria-hidden="true"
        className="hidden dark:block"
      />

      <p className="mt-4 max-w-md text-center text-[13px] text-muted-foreground">
        Welcome to the{' '}
        <strong className="text-foreground font-medium">
          administrative panel
        </strong>
        .
      </p>

      <form className="mt-6 w-full max-w-sm" onSubmit={signIn}>
        <InputField.Root id="email">
          <InputField.Control
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </InputField.Root>
        <button
          type="submit"
          disabled={isPending}
          className="mt-3 h-10 w-full rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? 'Sending…' : 'Continue with email'}
        </button>
        {error ? (
          <p className="mt-3 text-center text-xs text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </form>
    </div>
  )
}
