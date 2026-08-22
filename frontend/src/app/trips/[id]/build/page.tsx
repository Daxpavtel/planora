'use client'

import { useCallback, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  EyeIcon,
  GripVerticalIcon,
  InboxIcon,
  MapPinIcon,
  PlusIcon,
  Redo2Icon,
  TrainFrontIcon,
  TrashIcon,
  TriangleAlertIcon,
  Undo2Icon,
  WalletIcon,
} from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Spinner } from '@/components/ui/spinner'
import {
  featuredTrip,
  itinerary as seedItinerary,
  money,
  unscheduled as seedUnscheduled,
  type ItineraryActivity,
  type ItineraryDay,
} from '@/services/mocks'
import { cn } from '@/lib/utils'

type Slot = 'Morning' | 'Afternoon' | 'Evening'
const slots: Slot[] = ['Morning', 'Afternoon', 'Evening']

const slotHint: Record<Slot, string> = {
  Morning: 'Before 12:00',
  Afternoon: '12:00 – 17:00',
  Evening: 'After 17:00',
}

const categoryTone: Record<string, string> = {
  Food: 'bg-primary/15 text-primary',
  Culture: 'bg-brand-soft text-brand',
  Sightseeing: 'bg-success-soft text-success',
  Adventure: 'bg-warning-soft text-warning-foreground',
  Nature: 'bg-success-soft text-success',
  Shopping: 'bg-secondary text-secondary-foreground',
}

function toMinutes(time: string) {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function durationMinutes(duration: string) {
  const hours = /(\d+)h/.exec(duration)
  const mins = /(\d+)m/.exec(duration)
  return (hours ? Number(hours[1]) * 60 : 0) + (mins ? Number(mins[1]) : 0)
}

function conflictIds(activities: ItineraryActivity[]) {
  const sorted = [...activities].sort((a, b) => toMinutes(a.time) - toMinutes(b.time))
  const clashing = new Set<string>()
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1]
    const current = sorted[i]
    if (toMinutes(prev.time) + durationMinutes(prev.duration) > toMinutes(current.time)) {
      clashing.add(prev.id)
      clashing.add(current.id)
    }
  }
  return clashing
}

export default function ItineraryBuilderPage() {
  const [history, setHistory] = useState<ItineraryDay[][]>([seedItinerary])
  const [cursor, setCursor] = useState(0)
  const [parked, setParked] = useState(seedUnscheduled)
  const [activeDay, setActiveDay] = useState(seedItinerary[0].id)
  const [saving, setSaving] = useState(false)
  const [dragging, setDragging] = useState<string | null>(null)

  const days = history[cursor]

  const commit = useCallback(
    (next: ItineraryDay[]) => {
      setHistory((prev) => [...prev.slice(0, cursor + 1), next])
      setCursor((c) => c + 1)
      setSaving(true)
      setTimeout(() => setSaving(false), 700)
    },
    [cursor],
  )

  const day = days.find((d) => d.id === activeDay) ?? days[0]
  const clashes = useMemo(() => conflictIds(day.activities), [day])

  const stops = useMemo(() => {
    const map = new Map<string, { city: string; days: ItineraryDay[] }>()
    for (const d of days) {
      const entry = map.get(d.city) ?? { city: d.city, days: [] }
      entry.days.push(d)
      map.set(d.city, entry)
    }
    return [...map.values()]
  }, [days])

  const totalPlanned = days.reduce((sum, d) => sum + d.activities.length, 0)
  const totalCost = days.reduce(
    (sum, d) => sum + d.activities.reduce((s, a) => s + a.cost, 0),
    0,
  )
  const completion = Math.min(
    100,
    Math.round((totalPlanned / (days.length * 3)) * 100),
  )

  function moveActivity(activityId: string, toSlot: Slot) {
    commit(
      days.map((d) =>
        d.id !== day.id
          ? d
          : {
              ...d,
              activities: d.activities.map((a) =>
                a.id === activityId ? { ...a, slot: toSlot } : a,
              ),
            },
      ),
    )
  }

  function removeActivity(activity: ItineraryActivity) {
    commit(
      days.map((d) =>
        d.id !== day.id ? d : { ...d, activities: d.activities.filter((a) => a.id !== activity.id) },
      ),
    )
    setParked((prev) => [
      ...prev,
      { id: activity.id, title: activity.title, city: day.city, cost: activity.cost, duration: activity.duration },
    ])
  }

  function scheduleParked(item: (typeof seedUnscheduled)[number], slot: Slot = 'Afternoon') {
    commit(
      days.map((d) =>
        d.id !== day.id
          ? d
          : {
              ...d,
              activities: [
                ...d.activities,
                {
                  id: item.id,
                  slot,
                  time: slot === 'Morning' ? '10:00' : slot === 'Afternoon' ? '14:00' : '19:00',
                  title: item.title,
                  category: 'Sightseeing',
                  duration: item.duration,
                  cost: item.cost,
                  location: item.city,
                },
              ],
            },
      ),
    )
    setParked((prev) => prev.filter((p) => p.id !== item.id))
  }

  function reorderStop(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= stops.length) return
    const order = stops.map((s) => s.city)
    ;[order[index], order[target]] = [order[target], order[index]]
    const next = [...days].sort((a, b) => order.indexOf(a.city) - order.indexOf(b.city))
    commit(next)
  }

  const leftPanel = (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-sm font-bold text-ink">City stops</h2>
        <Button variant="ghost" size="sm" render={<Link href="/explore" />}>
          <PlusIcon data-icon="inline-start" />
          Add stop
        </Button>
      </div>
      <ol className="flex flex-col gap-2">
        {stops.map((stop, index) => {
          const cost = stop.days.reduce(
            (sum, d) => sum + d.activities.reduce((s, a) => s + a.cost, 0),
            0,
          )
          const travel = stop.days.find((d) => d.travelNote)?.travelNote
          return (
            <li key={stop.city} className="flex flex-col gap-2">
              {travel && (
                <p className="flex items-center gap-2 rounded-lg border border-dashed border-border px-2.5 py-2 text-xs text-muted-foreground">
                  <TrainFrontIcon className="size-3.5 shrink-0" aria-hidden="true" />
                  {travel}
                </p>
              )}
              <div className="flex items-start gap-2 rounded-xl border border-border bg-card p-2.5">
                <span
                  className="mt-0.5 cursor-grab text-muted-foreground"
                  aria-hidden="true"
                  draggable
                >
                  <GripVerticalIcon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{stop.city}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {stop.days.length} days · {stop.days[0].date} · {money(cost)}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {stop.days.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setActiveDay(d.id)}
                        className={cn(
                          'rounded-md px-1.5 py-0.5 text-[11px] font-semibold',
                          d.id === day.id
                            ? 'bg-brand text-brand-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-brand-soft hover:text-brand',
                        )}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Move ${stop.city} earlier`}
                    disabled={index === 0}
                    onClick={() => reorderStop(index, -1)}
                  >
                    <ChevronUpIcon />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Move ${stop.city} later`}
                    disabled={index === stops.length - 1}
                    onClick={() => reorderStop(index, 1)}
                  >
                    <ChevronDownIcon />
                  </Button>
                </div>
              </div>
            </li>
          )
        })}
      </ol>

      <Separator />

      <div className="flex flex-col gap-2">
        <h3 className="flex items-center gap-1.5 text-sm font-bold text-ink">
          <InboxIcon className="size-4" aria-hidden="true" />
          Unscheduled ({parked.length})
        </h3>
        <p className="text-xs text-muted-foreground">
          Ideas waiting for a slot. Drop one into a day section on the right.
        </p>
        {parked.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
            Everything has a home. Nice work.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {parked.map((item) => (
              <li key={item.id}>
                <div
                  draggable
                  onDragStart={() => setDragging(`parked:${item.id}`)}
                  onDragEnd={() => setDragging(null)}
                  className="flex items-center gap-2 rounded-xl border border-border bg-card p-2.5"
                >
                  <GripVerticalIcon
                    className="size-4 shrink-0 cursor-grab text-muted-foreground"
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{item.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {item.city} · {item.duration} · {money(item.cost)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => scheduleParked(item)}
                    aria-label={`Add ${item.title} to ${day.label}`}
                  >
                    Add
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )

  const rightPanel = (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="relative">
          <Image
            src="/images/map-preview.png"
            alt={`Route map for ${featuredTrip.name}`}
            width={640}
            height={420}
            className="h-40 w-full object-cover"
          />
          <div className="absolute inset-x-3 bottom-3 flex flex-wrap gap-1.5">
            {stops.map((s, i) => (
              <Badge key={s.city} className="border-0 bg-card/90 text-ink backdrop-blur">
                {i + 1}. {s.city}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2 p-4">
          <h3 className="font-display text-sm font-bold text-ink">Trip summary</h3>
          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between gap-2">
              <dt className="text-muted-foreground">Days planned</dt>
              <dd className="tabular font-semibold text-ink">{days.length}</dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-muted-foreground">Activities</dt>
              <dd className="tabular font-semibold text-ink">{totalPlanned}</dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-muted-foreground">Activity spend</dt>
              <dd className="tabular font-semibold text-ink">{money(totalCost)}</dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-muted-foreground">Budget left</dt>
              <dd className="tabular font-semibold text-success">
                {money(featuredTrip.budget - featuredTrip.estimated)}
              </dd>
            </div>
          </dl>
          <Button variant="outline" size="sm" render={<Link href={`/trips/${featuredTrip.id}`} />}>
            <EyeIcon data-icon="inline-start" />
            Preview itinerary
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <h3 className="font-display text-sm font-bold text-ink">Today in {day.city}</h3>
        <ul className="mt-2 flex flex-col gap-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <ClockIcon className="size-3.5" aria-hidden="true" />
            {day.activities.length} activities · {day.date}
          </li>
          <li className="flex items-center gap-2">
            <WalletIcon className="size-3.5" aria-hidden="true" />
            {money(day.activities.reduce((s, a) => s + a.cost, 0))} planned spend
          </li>
          <li className="flex items-center gap-2">
            <MapPinIcon className="size-3.5" aria-hidden="true" />
            Longest walk between stops: 1.4 km
          </li>
        </ul>
      </div>
    </div>
  )

  return (
    <AppShell title="Itinerary builder" searchPlaceholder="Search activities to add">
      <div className="flex flex-col gap-4">
        <header className="sticky top-16 z-10 -mx-4 flex flex-wrap items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
          <div className="min-w-0">
            <h2 className="truncate font-display text-lg font-bold text-ink">
              {featuredTrip.name}
            </h2>
            <p className="truncate text-xs text-muted-foreground">
              {featuredTrip.dateLabel} · {stops.length} cities · {days.length} days
            </p>
          </div>

          <div className="flex items-center gap-2 sm:ml-auto">
            <span
              aria-live="polite"
              className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex"
            >
              {saving ? (
                <>
                  <Spinner className="size-3" />
                  Saving…
                </>
              ) : (
                <>
                  <CheckIcon className="size-3.5 text-success" aria-hidden="true" />
                  All changes saved
                </>
              )}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCursor((c) => Math.max(0, c - 1))}
              disabled={cursor === 0}
            >
              <Undo2Icon data-icon="inline-start" />
              Undo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCursor((c) => Math.min(history.length - 1, c + 1))}
              disabled={cursor >= history.length - 1}
            >
              <Redo2Icon data-icon="inline-start" />
              Redo
            </Button>
            <div className="hidden -space-x-2 sm:flex">
              {featuredTrip.collaborators.map((c) => (
                <Avatar key={c} className="size-7 ring-2 ring-background">
                  <AvatarFallback className="bg-sand text-[10px] font-semibold text-ink">
                    {c}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
          </div>

          <div className="flex w-full items-center gap-3">
            <Progress
              value={completion}
              aria-label="Planning completion"
              className="h-1.5 flex-1 [&_[data-slot=progress-indicator]]:bg-brand"
            />
            <span className="tabular shrink-0 text-xs font-semibold text-ink">
              {completion}% planned
            </span>
          </div>
        </header>

        <div className="flex gap-2 xl:hidden">
          <Sheet>
            <SheetTrigger render={<Button variant="outline" size="sm" className="flex-1" />}>
              Stops & unscheduled
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[80svh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Stops and unscheduled ideas</SheetTitle>
                <SheetDescription>Reorder cities or park an idea for later.</SheetDescription>
              </SheetHeader>
              <div className="px-4 pb-6">{leftPanel}</div>
            </SheetContent>
          </Sheet>
          <Sheet>
            <SheetTrigger render={<Button variant="outline" size="sm" className="flex-1" />}>
              Map & summary
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[80svh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Map and trip summary</SheetTitle>
                <SheetDescription>Route order, spend and daily context.</SheetDescription>
              </SheetHeader>
              <div className="px-4 pb-6">{rightPanel}</div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="grid gap-5 xl:grid-cols-[260px_minmax(0,1fr)_280px]">
          <aside className="hidden xl:block">
            <ScrollArea className="h-[calc(100svh-14rem)] pr-3">{leftPanel}</ScrollArea>
          </aside>

          <section className="flex min-w-0 flex-col gap-4">
            <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-card p-1.5">
              {days.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setActiveDay(d.id)}
                  aria-current={d.id === day.id ? 'true' : undefined}
                  className={cn(
                    'flex min-h-10 flex-col items-start rounded-lg px-3 py-1 text-left transition-colors',
                    d.id === day.id
                      ? 'bg-brand text-brand-foreground'
                      : 'text-muted-foreground hover:bg-muted',
                  )}
                >
                  <span className="text-xs font-bold">{d.label}</span>
                  <span
                    className={cn(
                      'text-[11px]',
                      d.id === day.id ? 'text-brand-foreground/80' : 'text-muted-foreground',
                    )}
                  >
                    {d.city}
                  </span>
                </button>
              ))}
            </div>

            {day.travelNote && (
              <div className="flex items-start gap-2 rounded-xl border border-border bg-sand/60 p-3 text-sm text-ink">
                <TrainFrontIcon className="mt-0.5 size-4 text-brand" aria-hidden="true" />
                <span>
                  <span className="font-semibold">Travel day.</span> {day.travelNote}
                </span>
              </div>
            )}

            {clashes.size > 0 && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-warning/40 bg-warning-soft p-3 text-sm text-ink"
              >
                <TriangleAlertIcon className="mt-0.5 size-4 text-warning" aria-hidden="true" />
                <span>
                  Two activities on {day.label} overlap. Adjust a start time or move one to another
                  slot.
                </span>
              </div>
            )}

            {slots.map((slot) => {
              const items = day.activities
                .filter((a) => a.slot === slot)
                .sort((a, b) => toMinutes(a.time) - toMinutes(b.time))
              return (
                <section
                  key={slot}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (!dragging) return
                    if (dragging.startsWith('parked:')) {
                      const item = parked.find((p) => p.id === dragging.slice(7))
                      if (item) scheduleParked(item, slot)
                    } else {
                      moveActivity(dragging, slot)
                    }
                    setDragging(null)
                  }}
                  className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4"
                >
                  <header className="flex items-center gap-2">
                    <h3 className="font-display text-sm font-bold text-ink">{slot}</h3>
                    <span className="text-xs text-muted-foreground">{slotHint[slot]}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto"
                      render={<Link href="/activities" />}
                    >
                      <PlusIcon data-icon="inline-start" />
                      Add activity
                    </Button>
                  </header>

                  {items.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
                      Nothing planned. Drag an idea here or add an activity.
                    </p>
                  ) : (
                    <ul className="flex flex-col gap-2">
                      {items.map((activity) => (
                        <li key={activity.id}>
                          <article
                            draggable
                            onDragStart={() => setDragging(activity.id)}
                            onDragEnd={() => setDragging(null)}
                            className={cn(
                              'flex items-start gap-3 rounded-xl border bg-background p-3',
                              clashes.has(activity.id)
                                ? 'border-warning/60 bg-warning-soft/50'
                                : 'border-border',
                            )}
                          >
                            <GripVerticalIcon
                              className="mt-1 size-4 shrink-0 cursor-grab text-muted-foreground"
                              aria-hidden="true"
                            />
                            <div className="min-w-0 flex-1 flex flex-col gap-1.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="tabular text-sm font-bold text-ink">
                                  {activity.time}
                                </span>
                                <span className="text-sm font-semibold text-ink">
                                  {activity.title}
                                </span>
                                <Badge
                                  className={cn(
                                    'border-0',
                                    categoryTone[activity.category] ?? 'bg-muted text-muted-foreground',
                                  )}
                                >
                                  {activity.category}
                                </Badge>
                                {activity.booked ? (
                                  <Badge className="border-0 bg-success-soft text-success">
                                    Booked
                                  </Badge>
                                ) : (
                                  <Badge variant="outline">Not booked</Badge>
                                )}
                              </div>
                              <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                <li className="flex items-center gap-1">
                                  <ClockIcon className="size-3" aria-hidden="true" />
                                  {activity.duration}
                                </li>
                                <li className="flex items-center gap-1">
                                  <MapPinIcon className="size-3" aria-hidden="true" />
                                  {activity.location}
                                </li>
                                <li className="tabular flex items-center gap-1">
                                  <WalletIcon className="size-3" aria-hidden="true" />
                                  {money(activity.cost)}
                                </li>
                              </ul>
                              {activity.note && (
                                <p className="text-xs italic text-muted-foreground">
                                  {activity.note}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeActivity(activity)}
                              className="text-muted-foreground"
                            >
                              <TrashIcon data-icon="inline-start" />
                              Unschedule
                            </Button>
                          </article>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )
            })}
          </section>

          <aside className="hidden xl:block">
            <ScrollArea className="h-[calc(100svh-14rem)] pr-1">{rightPanel}</ScrollArea>
          </aside>
        </div>
      </div>
    </AppShell>
  )
}
