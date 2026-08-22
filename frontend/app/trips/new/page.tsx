'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  CloudUploadIcon,
  GlobeIcon,
  LockIcon,
  PlusIcon,
  TrashIcon,
  TriangleAlertIcon,
  UsersIcon,
} from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
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
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cities, money } from '@/lib/data'
import { cn } from '@/lib/utils'

const steps = [
  { id: 1, label: 'Trip details', hint: 'Name, dates and style' },
  { id: 2, label: 'Destinations', hint: 'Pick your city stops' },
  { id: 3, label: 'Preferences', hint: 'Pace and interests' },
  { id: 4, label: 'Review', hint: 'Check and create' },
]

const styles = ['Budget', 'Balanced', 'Comfort', 'Luxury'] as const
const interests = ['Food', 'Culture', 'Nature', 'Adventure', 'Nightlife', 'Shopping', 'Slow travel']
const privacyOptions = [
  { value: 'private', label: 'Private', hint: 'Only you can open this trip', icon: LockIcon },
  { value: 'friends', label: 'Friends', hint: 'People you invite can view', icon: UsersIcon },
  { value: 'public', label: 'Public', hint: 'Anyone with the link can view', icon: GlobeIcon },
]

function nights(start: string, end: string) {
  if (!start || !end) return 0
  const ms = new Date(end).getTime() - new Date(start).getTime()
  return Math.round(ms / 86400000)
}

export default function NewTripPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [pending, setPending] = useState(false)
  const [saved, setSaved] = useState<'idle' | 'saving' | 'saved'>('saved')

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], [])

  const [name, setName] = useState('')
  const [start, setStart] = useState('2026-10-15')
  const [end, setEnd] = useState('2026-10-25')
  const [description, setDescription] = useState('')
  const [origin, setOrigin] = useState('Ahmedabad, India')
  const [travellers, setTravellers] = useState(2)
  const [style, setStyle] = useState<(typeof styles)[number]>('Balanced')
  const [privacy, setPrivacy] = useState('private')
  const [stops, setStops] = useState(['jaipur', 'udaipur'])
  const [pace, setPace] = useState('Balanced — two or three anchors a day')
  const [picked, setPicked] = useState<string[]>(['Food', 'Heritage'])
  const [flexible, setFlexible] = useState(true)
  const [touchedName, setTouchedName] = useState(false)
  const [customTotalBudget, setCustomTotalBudget] = useState<number | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const queryCity = params.get('city')
      const queryCities = params.get('cities')
      if (queryCity && cities.some((c) => c.id === queryCity)) {
        setStops((prev) => (prev.includes(queryCity) ? prev : [queryCity, ...prev]))
        const found = cities.find((c) => c.id === queryCity)
        if (found && !name) {
          setName(`${found.name} Heritage & Culture Trail`)
        }
      } else if (queryCities) {
        const list = queryCities.split(',').filter((id) => cities.some((c) => c.id === id))
        if (list.length > 0) {
          setStops(list)
        }
      } else {
        const stored = localStorage.getItem('planora_selected_cities')
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            if (Array.isArray(parsed) && parsed.length > 0) {
              setStops(parsed)
            }
          } catch {}
        }
      }
    }
  }, [])

  const nightCount = nights(start, end)
  const isPastStart = Boolean(start && start < todayStr)
  const dateConflict = Boolean(start && end) && (nightCount <= 0 || isPastStart)
  const nameError = touchedName && name.trim().length < 3
  const stopCities = useMemo(
    () => stops.map((id) => cities.find((c) => c.id === id)).filter(Boolean) as typeof cities,
    [stops],
  )

  // Smart Useful Budget Calculation Logic
  const smartBudget = useMemo(() => {
    const styleMultiplier = {
      Budget: 0.75,
      Balanced: 1.0,
      Comfort: 1.45,
      Luxury: 2.3,
    }[style]

    const paceMultiplier = pace.startsWith('Packed') ? 1.25 : pace.startsWith('Relaxed') ? 0.85 : 1.0
    const nightsTotal = Math.max(1, nightCount)
    const roomUnits = Math.max(1, Math.ceil(travellers / 2))

    const avgCityDailyCost =
      stopCities.length > 0
        ? stopCities.reduce((sum, c) => sum + c.dailyCost, 0) / stopCities.length
        : 2500

    const stays = Math.round(nightsTotal * (avgCityDailyCost * 0.9) * roomUnits * styleMultiplier)
    const meals = Math.round(nightsTotal * 650 * travellers * styleMultiplier * paceMultiplier)
    const activitiesCost = Math.round(nightsTotal * 450 * travellers * styleMultiplier * paceMultiplier)
    const transit = Math.round((stopCities.length > 1 ? (stopCities.length - 1) * 1200 : 800) * travellers)
    const buffer = Math.round((stays + meals + activitiesCost + transit) * 0.08)
    const calculatedTotal = stays + meals + activitiesCost + transit + buffer

    return {
      stays,
      meals,
      activities: activitiesCost,
      transit,
      transport: transit,
      buffer,
      calculatedTotal,
      total: calculatedTotal,
      finalTotal: customTotalBudget !== null ? customTotalBudget : calculatedTotal,
    }
  }, [style, pace, nightCount, travellers, stopCities, customTotalBudget])

  const targetBudget = smartBudget.finalTotal

  function markDirty() {
    setSaved('saving')
    setTimeout(() => setSaved('saved'), 600)
  }

  function goNext() {
    if (step === 1) {
      setTouchedName(true)
      if (name.trim().length < 3 || dateConflict || isPastStart) return
    }
    if (step === 2 && stops.length === 0) return
    if (step === 4) {
      setPending(true)
      setTimeout(() => router.push('/trips/rajasthan-royal-heritage/build'), 900)
      return
    }
    setStep((s) => Math.min(4, s + 1))
  }

  function toggleStop(id: string) {
    setStops((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
    markDirty()
  }

  return (
    <AppShell title="Create a trip" searchPlaceholder="Search cities to add">
      <div className="flex flex-col gap-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="-ml-2 w-fit text-muted-foreground"
              render={<Link href="/trips" />}
            >
              <ArrowLeftIcon data-icon="inline-start" />
              Back to my trips
            </Button>
            <h2 className="font-display text-2xl font-bold text-ink">Plan a new trip</h2>
            <p className="text-sm text-muted-foreground">
              Four short steps. You can change everything later in the builder.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              aria-live="polite"
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              {saved === 'saving' ? (
                <>
                  <Spinner className="size-3" />
                  Saving draft…
                </>
              ) : (
                <>
                  <CheckIcon className="size-3.5 text-success" aria-hidden="true" />
                  Draft saved
                </>
              )}
            </span>
            <Button variant="outline" render={<Link href="/trips" />}>
              Save as draft
            </Button>
          </div>
        </header>

        <ol className="grid gap-2 sm:grid-cols-4">
          {steps.map((s) => {
            const done = s.id < step
            const active = s.id === step
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => s.id <= step && setStep(s.id)}
                  aria-current={active ? 'step' : undefined}
                  className={cn(
                    'flex min-h-14 w-full items-center gap-3 rounded-xl border px-3 text-left transition-colors',
                    active && 'border-brand bg-brand-soft',
                    done && 'border-border bg-card',
                    !active && !done && 'border-dashed border-border bg-card/50',
                  )}
                >
                  <span
                    className={cn(
                      'tabular flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                      done && 'bg-success text-success-foreground',
                      active && 'bg-brand text-brand-foreground',
                      !active && !done && 'bg-muted text-muted-foreground',
                    )}
                  >
                    {done ? <CheckIcon className="size-3.5" aria-hidden="true" /> : s.id}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-ink">{s.label}</span>
                    <span className="block truncate text-xs text-muted-foreground">{s.hint}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ol>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Card>
            <CardHeader>
              <CardTitle>{steps[step - 1].label}</CardTitle>
              <CardDescription>
                {step === 1 && 'The basics. Only a name and dates are required to continue.'}
                {step === 2 && 'Add the cities you want to stay in. Order can change later.'}
                {step === 3 && 'This tunes the activity suggestions in the builder.'}
                {step === 4 && 'One last look before we open the itinerary builder.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step === 1 && (
                <FieldGroup>
                  <Field data-invalid={nameError || undefined}>
                    <FieldLabel htmlFor="trip-name">Trip name</FieldLabel>
                    <Input
                      id="trip-name"
                      placeholder="European Summer Escape"
                      value={name}
                      aria-invalid={nameError || undefined}
                      onBlur={() => setTouchedName(true)}
                      onChange={(e) => {
                        setName(e.target.value)
                        markDirty()
                      }}
                    />
                    {nameError ? (
                      <FieldError>Give the trip a name of at least 3 characters.</FieldError>
                    ) : (
                      <FieldDescription>Something you&apos;ll recognise in a list.</FieldDescription>
                    )}
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field data-invalid={isPastStart || undefined}>
                      <FieldLabel htmlFor="start">Start date</FieldLabel>
                      <Input
                        id="start"
                        type="date"
                        min={todayStr}
                        value={start}
                        aria-invalid={isPastStart || undefined}
                        onChange={(e) => {
                          setStart(e.target.value)
                          markDirty()
                        }}
                      />
                      {isPastStart ? (
                        <FieldError>Start date cannot be in the past. Select today or a future date.</FieldError>
                      ) : null}
                    </Field>
                    <Field data-invalid={dateConflict || undefined}>
                      <FieldLabel htmlFor="end">End date</FieldLabel>
                      <Input
                        id="end"
                        type="date"
                        min={start || todayStr}
                        value={end}
                        aria-invalid={dateConflict || undefined}
                        onChange={(e) => {
                          setEnd(e.target.value)
                          markDirty()
                        }}
                      />
                      {dateConflict ? (
                        <FieldError>The end date needs to be after the start date and cannot be in the past.</FieldError>
                      ) : (
                        <FieldDescription>{nightCount} nights on the road.</FieldDescription>
                      )}
                    </Field>
                  </div>

                  <Field>
                    <FieldLabel htmlFor="trip-desc">Short description</FieldLabel>
                    <Textarea
                      id="trip-desc"
                      rows={3}
                      placeholder="Slow mornings, gallery afternoons, long dinners."
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value)
                        markDirty()
                      }}
                    />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor="origin">Starting city</FieldLabel>
                      <Input
                        id="origin"
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value)}
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="travellers">Travellers</FieldLabel>
                      <Input
                        id="travellers"
                        type="number"
                        min={1}
                        max={12}
                        value={travellers}
                        onChange={(e) => setTravellers(Math.max(1, Number(e.target.value)))}
                      />
                    </Field>
                  </div>

                  <Field>
                    <FieldLabel htmlFor="style">Travel style</FieldLabel>
                    <ToggleGroup
                      id="style"
                      value={[style]}
                      onValueChange={(value) => {
                        const next = (value as string[])[0]
                        if (next) setStyle(next as (typeof styles)[number])
                      }}
                      className="flex-wrap justify-start"
                    >
                      {styles.map((s) => (
                        <ToggleGroupItem key={s} value={s}>
                          {s}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                    <FieldDescription>
                      Used to shape the default daily budget per traveller.
                    </FieldDescription>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="cover">Cover image</FieldLabel>
                    <label
                      htmlFor="cover"
                      className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-input bg-muted/40 px-4 py-5 text-center"
                    >
                      <CloudUploadIcon className="size-5 text-muted-foreground" aria-hidden="true" />
                      <span className="text-sm font-medium text-ink">
                        Drop a photo or browse files
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Optional · JPG or PNG up to 5 MB
                      </span>
                      <input id="cover" type="file" accept="image/*" className="sr-only" />
                    </label>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="privacy">Privacy</FieldLabel>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {privacyOptions.map((option) => (
                        <button
                          key={option.value}
                          id={option.value === 'private' ? 'privacy' : undefined}
                          type="button"
                          onClick={() => setPrivacy(option.value)}
                          aria-pressed={privacy === option.value}
                          className={cn(
                            'flex min-h-16 flex-col items-start gap-1 rounded-xl border px-3 py-2 text-left transition-colors',
                            privacy === option.value
                              ? 'border-brand bg-brand-soft'
                              : 'border-border bg-card hover:bg-muted/60',
                          )}
                        >
                          <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                            <option.icon className="size-4" aria-hidden="true" />
                            {option.label}
                          </span>
                          <span className="text-xs text-muted-foreground">{option.hint}</span>
                        </button>
                      ))}
                    </div>
                  </Field>
                </FieldGroup>
              )}

              {step === 2 && (
                <div className="flex flex-col gap-5">
                  {stops.length === 0 && (
                    <div className="flex items-start gap-2 rounded-xl border border-warning/40 bg-warning-soft p-3 text-sm text-ink">
                      <TriangleAlertIcon className="mt-0.5 size-4 text-warning" aria-hidden="true" />
                      Add at least one city so we can build day-by-day plans.
                    </div>
                  )}

                  {stops.length > 0 && (
                    <ol className="flex flex-col gap-2">
                      {stopCities.map((city, index) => (
                        <li
                          key={city.id}
                          className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
                        >
                          <span className="tabular flex size-7 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-brand">
                            {index + 1}
                          </span>
                          <Image
                            src={city.image || '/placeholder.svg'}
                            alt=""
                            width={80}
                            height={80}
                            aria-hidden="true"
                            className="size-11 rounded-lg object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-ink">{city.name}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {city.country} · {city.suggestedDays} · ₹{city.dailyCost.toLocaleString('en-IN')}/day
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleStop(city.id)}
                            className="text-muted-foreground"
                          >
                            <TrashIcon data-icon="inline-start" />
                            Remove
                          </Button>
                        </li>
                      ))}
                    </ol>
                  )}

                  <Separator />

                  <div className="flex flex-col gap-3">
                    <h3 className="text-sm font-semibold text-ink">Suggested cities</h3>
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {cities.map((city) => {
                        const added = stops.includes(city.id)
                        return (
                          <li key={city.id}>
                            <button
                              type="button"
                              onClick={() => toggleStop(city.id)}
                              className={cn(
                                'flex min-h-14 w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors',
                                added
                                  ? 'border-brand bg-brand-soft'
                                  : 'border-border bg-card hover:bg-muted/60',
                              )}
                            >
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-ink">
                                  {city.name}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                  {city.country} · ₹{city.dailyCost.toLocaleString('en-IN')}/day
                                </p>
                              </div>
                              {added ? (
                                <CheckIcon className="size-4 text-brand" aria-hidden="true" />
                              ) : (
                                <PlusIcon
                                  className="size-4 text-muted-foreground"
                                  aria-hidden="true"
                                />
                              )}
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                </div>
              )}

              {step === 3 && (
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="pace">Daily pace</FieldLabel>
                    <Select value={pace} onValueChange={(v) => setPace(v as string)}>
                      <SelectTrigger id="pace" className="w-full">
                        <SelectValue placeholder="Choose a pace" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {[
                            'Relaxed — one thing a day',
                            'Balanced — two or three anchors a day',
                            'Packed — make every hour count',
                          ].map((p) => (
                            <SelectItem key={p} value={p}>
                              {p}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="trip-interests">Interests</FieldLabel>
                    <ToggleGroup
                      id="trip-interests"
                      multiple
                      value={picked}
                      onValueChange={(value) => setPicked(value as string[])}
                      className="flex-wrap justify-start"
                    >
                      {interests.map((i) => (
                        <ToggleGroupItem key={i} value={i}>
                          {i}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                    <FieldDescription>
                      We use these to rank activities, never to hide anything.
                    </FieldDescription>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="target">Target Total Budget (₹)</FieldLabel>
                    <Input
                      id="target"
                      type="number"
                      value={targetBudget}
                      min={1000}
                      step={1000}
                      onChange={(e) => setCustomTotalBudget(Number(e.target.value))}
                    />
                    <FieldDescription>
                      Total calculated budget for all {travellers} traveller{travellers > 1 ? 's' : ''} across {nightCount} nights & {stops.length} city stop{stops.length === 1 ? '' : 's'}.
                    </FieldDescription>
                  </Field>

                  {/* Useful Smart Budget Breakdown Card */}
                  <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-display text-sm font-bold text-ink">Estimated Total Cost Breakdown</span>
                      <span className="tabular font-display text-lg font-bold text-brand">{money(smartBudget.calculatedTotal)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                      <div className="rounded-lg bg-muted/60 p-2.5">
                        <p className="text-muted-foreground font-medium">🏨 Stays</p>
                        <p className="font-bold text-ink text-sm mt-0.5">{money(smartBudget.stays)}</p>
                      </div>
                      <div className="rounded-lg bg-muted/60 p-2.5">
                        <p className="text-muted-foreground font-medium">🍕 Dining</p>
                        <p className="font-bold text-ink text-sm mt-0.5">{money(smartBudget.meals)}</p>
                      </div>
                      <div className="rounded-lg bg-muted/60 p-2.5">
                        <p className="text-muted-foreground font-medium">🎟️ Activities</p>
                        <p className="font-bold text-ink text-sm mt-0.5">{money(smartBudget.activities)}</p>
                      </div>
                      <div className="rounded-lg bg-muted/60 p-2.5">
                        <p className="text-muted-foreground font-medium">🚆 Transport</p>
                        <p className="font-bold text-ink text-sm mt-0.5">{money(smartBudget.transit)}</p>
                      </div>
                    </div>

                    {/* Feasibility Alert */}
                    {targetBudget < smartBudget.calculatedTotal * 0.75 ? (
                      <p className="flex items-center gap-1.5 text-xs font-semibold text-warning">
                        <TriangleAlertIcon className="size-4 shrink-0 text-warning" aria-hidden="true" />
                        Target budget is low for these cities ({stopCities.map((c) => c.name).join(', ')}) & {travellers} travellers. Consider budgeting at least {money(smartBudget.calculatedTotal)}.
                      </p>
                    ) : targetBudget > smartBudget.calculatedTotal * 1.3 ? (
                      <p className="flex items-center gap-1.5 text-xs font-semibold text-success">
                        <CheckIcon className="size-4 shrink-0 text-success" aria-hidden="true" />
                        Generous budget! You have plenty of buffer for luxury stays, fine dining & experiences.
                      </p>
                    ) : (
                      <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                        <CheckIcon className="size-4 shrink-0 text-success" aria-hidden="true" />
                        Realistic total budget tailored to your travel style ({style}) and daily pace.
                      </p>
                    )}
                  </div>

                  <label className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Checkbox
                      checked={flexible}
                      onCheckedChange={(v) => setFlexible(Boolean(v))}
                      className="mt-0.5"
                    />
                    My dates are flexible by a few days — suggest cheaper travel legs.
                  </label>
                </FieldGroup>
              )}

              {step === 4 && (
                <div className="flex flex-col gap-4">
                  <dl className="grid gap-3 sm:grid-cols-2">
                    {[
                      ['Trip name', name || 'Untitled trip'],
                      ['Dates', `${start} → ${end} · ${nightCount} nights`],
                      ['Starting from', origin],
                      ['Travellers', `${travellers}`],
                      ['Travel style', style],
                      ['Privacy', privacyOptions.find((p) => p.value === privacy)?.label ?? ''],
                      ['Pace', pace],
                      ['Target Total Budget', money(targetBudget)],
                      ['Interests', picked.join(', ') || 'None yet'],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-xl border border-border bg-card p-3">
                        <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                          {label}
                        </dt>
                        <dd className="mt-0.5 text-sm font-semibold text-ink">{value}</dd>
                      </div>
                    ))}
                  </dl>

                  <div className="rounded-xl border border-border bg-card p-4">
                    <h3 className="text-sm font-semibold text-ink">Route</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {stopCities.map((c) => c.name).join(' → ') || 'No cities added yet'}
                    </p>
                  </div>

                  <div className="flex items-start gap-2 rounded-xl border border-success/30 bg-success-soft p-3 text-sm text-ink">
                    <CheckIcon className="mt-0.5 size-4 text-success" aria-hidden="true" />
                    Everything looks consistent. Creating the trip opens the itinerary builder with
                    empty days ready to fill.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <aside className="flex flex-col gap-4">
            <Card className="overflow-hidden p-0">
              <Image
                src="/images/map-preview.png"
                alt="Illustrated route preview between city stops"
                width={640}
                height={420}
                className="h-36 w-full object-cover"
              />
              <div className="flex flex-col gap-3 p-4">
                <h3 className="font-display text-base font-bold text-ink">Trip snapshot</h3>
                <dl className="flex flex-col gap-2 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-muted-foreground">Nights</dt>
                    <dd className="tabular font-semibold text-ink">{Math.max(0, nightCount)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-muted-foreground">City stops</dt>
                    <dd className="tabular font-semibold text-ink">{stops.length}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-muted-foreground">Travellers</dt>
                    <dd className="tabular font-semibold text-ink">{travellers}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-muted-foreground">Total Budget</dt>
                    <dd className="tabular font-semibold text-ink">{money(targetBudget)}</dd>
                  </div>
                </dl>
                <Badge variant="secondary" className="w-fit">
                  {style} pace · {privacyOptions.find((p) => p.value === privacy)?.label}
                </Badge>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Estimates use average daily costs for each city. Real numbers arrive once you add
                  stays and activities.
                </p>
              </div>
            </Card>
          </aside>
        </div>

        <div className="sticky bottom-20 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card/95 p-3 backdrop-blur lg:bottom-4">
          <Button
            variant="outline"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
          >
            <ArrowLeftIcon data-icon="inline-start" />
            Back
          </Button>
          <span className="tabular text-xs text-muted-foreground">Step {step} of 4</span>
          <Button className="ml-auto" onClick={goNext} disabled={pending}>
            {pending && <Spinner data-icon="inline-start" />}
            {step === 4 ? (pending ? 'Creating trip…' : 'Create trip') : 'Continue'}
            {!pending && <ArrowRightIcon data-icon="inline-end" />}
          </Button>
        </div>
      </div>
    </AppShell>
  )
}
