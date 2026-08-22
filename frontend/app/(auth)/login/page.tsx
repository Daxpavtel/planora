'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Spinner } from '@/components/ui/spinner'
import { authApi } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('yash.mehta@example.com')
  const [password, setPassword] = useState('travelfar')
  const [show, setShow] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!email.includes('@') || password.length < 6) {
      setError('Enter a valid email and a password of at least 6 characters.')
      return
    }
    setError(null)
    setPending(true)

    try {
      await authApi.login({ email, password })
      toast.success('Logged in successfully!')
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.')
      toast.error('Login failed.')
      setPending(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-ink">Welcome back</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Sign in to your Planora account connected directly to your MySQL database.
        </p>
      </header>

      <form onSubmit={onSubmit} noValidate>
        <FieldGroup>
          <Field data-invalid={error ? true : undefined}>
            <FieldLabel htmlFor="email">Email address</FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <MailIcon />
              </InputGroupAddon>
              <InputGroupInput
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                aria-invalid={error ? true : undefined}
                onChange={(e) => setEmail(e.target.value)}
              />
            </InputGroup>
          </Field>

          <Field data-invalid={error ? true : undefined}>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <LockIcon />
              </InputGroupAddon>
              <InputGroupInput
                id="password"
                type={show ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Your password"
                value={password}
                aria-invalid={error ? true : undefined}
                onChange={(e) => setPassword(e.target.value)}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  type="button"
                  size="icon-xs"
                  aria-label={show ? 'Hide password' : 'Show password'}
                  onClick={() => setShow((v) => !v)}
                >
                  {show ? <EyeOffIcon /> : <EyeIcon />}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            {error ? (
              <FieldDescription className="text-destructive">{error}</FieldDescription>
            ) : null}
          </Field>

          <div className="flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox defaultChecked />
              Keep me signed in
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-brand hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending ? <Spinner data-icon="inline-start" /> : null}
            {pending ? 'Signing in…' : 'Sign in'}
          </Button>
        </FieldGroup>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account yet?{' '}
        <Link href="/register" className="font-semibold text-brand hover:underline">
          Create one now
        </Link>
      </p>
    </div>
  )
}
