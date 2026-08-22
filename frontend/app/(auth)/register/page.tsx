'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CameraIcon, CheckIcon } from 'lucide-react'
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
import { useAuth } from '@/lib/auth'

const countries = ['India', 'United States', 'United Kingdom', 'Australia', 'Germany', 'United Arab Emirates', 'Other']
const interests = ['Food', 'Culture', 'Nature', 'Heritage', 'Adventure', 'Relaxation']

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [pending, setPending] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [homeCity, setHomeCity] = useState('')
  const [country, setCountry] = useState('India')
  const [password, setPassword] = useState('')

  const initials = ((firstName.trim()[0] || 'U') + ((lastName || '').trim()[0] || '')).toUpperCase()

  const strength =
    (password.length >= 8 ? 1 : 0) +
    (/[A-Z]/.test(password) ? 1 : 0) +
    (/\d/.test(password) ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(password) ? 1 : 0)
  const strengthLabel = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'][strength]

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    register({
      firstName: firstName || 'Traveler',
      lastName,
      email: email || 'traveler@planora.app',
      homeCity: homeCity || 'Mumbai',
      country,
    })
    setTimeout(() => router.push('/dashboard'), 700)
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-ink">Create your account</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Join Planora to discover authentic Indian destinations, iconic food, and curated itineraries.
        </p>
      </header>

      <form onSubmit={onSubmit}>
        <FieldGroup>
          <div className="flex items-center gap-4">
            <Avatar className="size-16 ring-2 ring-brand/20">
              <AvatarFallback className="bg-brand-soft text-base font-bold text-brand">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <Button type="button" variant="outline" size="sm" className="w-fit">
                <CameraIcon data-icon="inline-start" />
                Upload photo
              </Button>
              <p className="text-xs text-muted-foreground">JPG or PNG, up to 2 MB.</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="first">First name</FieldLabel>
              <Input
                id="first"
                placeholder="e.g. Aarav"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="last">Last name</FieldLabel>
              <Input
                id="last"
                placeholder="e.g. Sharma"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
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
                placeholder="aarav.sharma@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="phone">Phone number</FieldLabel>
              <Input id="phone" type="tel" placeholder="+91 98765 43210" autoComplete="tel" />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="city">Home city</FieldLabel>
              <Input
                id="city"
                placeholder="e.g. Mumbai"
                autoComplete="address-level2"
                value={homeCity}
                onChange={(e) => setHomeCity(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="country">Country</FieldLabel>
              <Select value={country} onValueChange={(v) => setCountry(v as string)}>
                <SelectTrigger id="country" className="w-full">
                  <SelectValue placeholder="Select country" />
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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="flex items-center gap-3">
              <div className="flex flex-1 gap-1" aria-hidden="true">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className={`h-1 flex-1 rounded-full ${
                      i < strength ? 'bg-success' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">{strengthLabel}</span>
            </div>
            <FieldDescription>
              Use 8+ characters with a number and a symbol.
            </FieldDescription>
          </Field>

          <FieldSeparator />

          <Field>
            <FieldLabel htmlFor="interests">What do you travel for?</FieldLabel>
            <ToggleGroup
              id="interests"
              multiple
              defaultValue={['Food', 'Culture']}
              className="flex-wrap justify-start"
            >
              {interests.map((i) => (
                <ToggleGroupItem key={i} value={i} aria-label={i}>
                  {i}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </Field>

          <Field>
            <FieldLabel htmlFor="about">Additional information</FieldLabel>
            <Textarea
              id="about"
              rows={3}
              placeholder="Dietary needs, accessibility requirements, travel pace…"
            />
          </Field>

          <label className="flex items-start gap-2 text-sm text-muted-foreground">
            <Checkbox defaultChecked className="mt-0.5" />
            Email me itinerary reminders and price drops for saved cities.
          </label>

          <Button type="submit" size="lg" className="h-10 w-full" disabled={pending}>
            {pending ? <Spinner data-icon="inline-start" /> : <CheckIcon data-icon="inline-start" />}
            {pending ? 'Creating account…' : 'Register'}
          </Button>
        </FieldGroup>
      </form>

      <p className="text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
