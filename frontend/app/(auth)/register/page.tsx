'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CameraIcon, CheckIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { authApi } from '@/lib/api'

const countries = ['India', 'Portugal', 'Japan', 'Germany', 'Netherlands', 'France', 'USA', 'Other']
const interests = ['Food', 'Culture', 'Nature', 'Nightlife', 'Budget']

export default function RegisterPage() {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [firstName, setFirstName] = useState('Yash')
  const [lastName, setLastName] = useState('Mehta')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [homeCountry, setHomeCountry] = useState('India')
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Food', 'Culture'])

  const strength =
    (password.length >= 8 ? 1 : 0) +
    (/[A-Z]/.test(password) ? 1 : 0) +
    (/\d/.test(password) ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(password) ? 1 : 0)
  const strengthLabel = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'][strength]

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!email || password.length < 6) {
      toast.error('Please enter a valid email and password (minimum 6 characters).')
      return
    }

    try {
      setPending(true)
      await authApi.register({
        email,
        password,
        full_name: `${firstName} ${lastName}`.trim(),
        language_preference: 'English',
      })
      toast.success('Account created successfully in database!')
      router.push('/dashboard')
    } catch (err: any) {
      toast.error(err.message || 'Registration failed.')
      setPending(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-ink">Create your account</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Sign up to store live itineraries and destinations directly in MySQL.
        </p>
      </header>

      <form onSubmit={onSubmit}>
        <FieldGroup>
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarFallback className="bg-brand-soft text-base font-semibold text-brand">
                {firstName?.[0] || 'Y'}{lastName?.[0] || 'M'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => toast.info('Photo upload enabled via backend')}>
                <CameraIcon data-icon="inline-start" />
                Upload photo
              </Button>
              <p className="text-xs text-muted-foreground">JPG or PNG, up to 5 MB.</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="first">First name</FieldLabel>
              <Input
                id="first"
                placeholder="Yash"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="last">Last name</FieldLabel>
              <Input
                id="last"
                placeholder="Mehta"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
                required
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="reg-email">Email address</FieldLabel>
              <Input
                id="reg-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="home-country">Home Country</FieldLabel>
              <Select value={homeCountry} onValueChange={(v) => setHomeCountry(v as string)}>
                <SelectTrigger id="home-country" className="w-full">
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {countries.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="reg-password">Password</FieldLabel>
            <Input
              id="reg-password"
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
            <div className="flex items-center justify-between gap-2 pt-1 text-xs">
              <span className="text-muted-foreground">Password strength:</span>
              <span className="font-semibold text-ink">{strengthLabel}</span>
            </div>
            <div className="flex h-1 gap-1 overflow-hidden rounded-full bg-muted">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`flex-1 ${i < strength ? 'bg-brand' : 'bg-transparent'}`}
                />
              ))}
            </div>
          </Field>

          <FieldSeparator />

          <Field>
            <FieldLabel htmlFor="interests">Travel interests</FieldLabel>
            <ToggleGroup
              id="interests"
              multiple
              value={selectedInterests}
              onValueChange={(v) => setSelectedInterests(v as string[])}
              className="flex-wrap justify-start"
            >
              {interests.map((i) => (
                <ToggleGroupItem key={i} value={i}>
                  {i}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <FieldDescription>
              Helps us recommend the best activities and stays for your trips.
            </FieldDescription>
          </Field>

          <label className="flex items-start gap-2 text-sm text-muted-foreground">
            <Checkbox defaultChecked className="mt-0.5" />
            <span>
              I agree to the{' '}
              <Link href="/terms" className="font-semibold text-ink underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="font-semibold text-ink underline">
                Privacy Policy
              </Link>
              .
            </span>
          </label>

          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending ? <Spinner data-icon="inline-start" /> : null}
            {pending ? 'Creating account in database…' : 'Create account'}
          </Button>
        </FieldGroup>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
