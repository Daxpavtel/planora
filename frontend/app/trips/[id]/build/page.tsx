'use client'

import { use, useCallback, useEffect, useMemo, useState } from 'react'
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
import { toast } from 'sonner'
import { AppShell } from '@/components/app-shell'
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
import { tripsApi } from '@/lib/api'
import {
  featuredTrip,
  itinerary as seedItinerary,
  money,
  unscheduled as seedUnscheduled,
  type ItineraryActivity,
  type ItineraryDay,
  type Trip,
} from '@/lib/data'
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
  const [h, m] = (time || '10:00').split(':').map(Number)
  return h * 60 + m
}

function durationMinutes(duration: string) {
  const hours = /(\d+)h/.exec(duration || '2h')
  const mins = /(\d+)m/.exec(duration || '0m')
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

export default function ItineraryBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params)
  const tripIdParam = unwrappedParams?.id || '1'
  const cleanTripId = typeof tripIdParam === 'string' && tripIdParam.startsWith('trip-') ? 1 : tripIdParam

  const [trip, setTrip] = useState<Trip | null>(null)
  const [history, setHistory] = useState<ItineraryDay[][]>([seedItinerary])
  const [cursor, setCursor] = useState(0)
  const [parked, setParked] = useState(seedUnscheduled)
  const [activeDay, setActiveDay] = useState(seedItinerary[0].id)
  const [saving, setSaving] = useState(false)
  const [dragging, setDragging] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Load live trip and itinerary from backend
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const data = await tripsApi.getById(cleanTripId)
        if (data) {
          setTrip(data)
          if (data.itinerary && data.itinerary.length > 0) {
            setHistory([data.itinerary])
            setCursor(0)
            setActiveDay(data.itinerary[0].id)
          }
          if (data.unscheduled && data.unscheduled.length > 0) {
            setParked(data.unscheduled)
          }
        }
      } catch (err) {
        console.warn('Fallback to seed data in builder:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [cleanTripId])

  const days = history[cursor] || seedItinerary

  const commit = useCallback(
    (next: ItineraryDay[]) => {
      setHistory((prev) => [...prev.slice(0, cursor + 1), next])
      setCursor((c) => c + 1)
      setSaving(true)
      setTimeout(() => setSaving(false), 700)
    },
    [cursor],
  )

  const canUndo = cursor > 0
  const canRedo = cursor < history.length - 1

  function undo() {
    if (canUndo) setCursor((c) => c - 1)
  }

  function redo() {
    if (canRedo) setCursor((c) => c + 1)
  }

  const currentDay = useMemo(() => {
    return days.find((d) => d.id === activeDay) ?? days[0]
  }, [days, activeDay])

  const clashes = useMemo(() => conflictIds(currentDay.activities), [currentDay])

  const totalActivities = useMemo(() => {
    return days.reduce((sum, d) => sum + d.activities.length, 0)
  }, [days])

  const totalSpend = useMemo(() => {
    return days.reduce(
      (sum, d) => sum + d.activities.reduce((dSum, a) => dSum + (a.cost || 0), 0),
      0,
    )
  }, [days])

  const progress = Math.min(100, Math.round((totalActivities / (days.length * 3)) * 100))

  // Move activity within day
  function moveActivity(activityId: string, direction: 'up' | 'down') {
    const list = [...currentDay.activities]
    const idx = list.findIndex((a) => a.id === activityId)
    if (idx === -1) return
    const target = direction === 'up' ? idx - 1 : idx + 1
    if (target < 0 || target >= list.length) return
    const temp = list[idx]
    list[idx] = list[target]
    list[target] = temp

    const next = days.map((d) => (d.id === currentDay.id ? { ...d, activities: list } : d))
    commit(next)
  }

  // Remove / Unschedule activity via API
  async function removeActivity(activityId: string) {
    const act = currentDay.activities.find((a) => a.id === activityId)
    const nextActivities = currentDay.activities.filter((a) => a.id !== activityId)
    const next = days.map((d) =>
      d.id === currentDay.id ? { ...d, activities: nextActivities } : d,
    )
    commit(next)

    if (act) {
      setParked((prev) => [
        ...prev,
        {
          id: `u-${act.id}`,
          activity_id: act.activity_id,
          title: act.title,
          city: currentDay.city,
          cost: act.cost,
          duration: act.duration,
        },
      ])

      try {
        await tripsApi.unscheduleActivity(cleanTripId, activityId)
        toast.info(`Removed "${act.title}" from ${currentDay.label}.`)
      } catch (err) {
        // Optimistic UI handled
      }
    }
  }

  // Add / Schedule unscheduled idea into active day via API
  async function scheduleIdea(idea: {
    id: string
    activity_id?: number
    title: string
    city: string
    cost: number
    duration: string
  }) {
    const slot: Slot =
      currentDay.activities.length === 0
        ? 'Morning'
        : currentDay.activities.length === 1
        ? 'Afternoon'
        : 'Evening'

    const time = slot === 'Morning' ? '10:00' : slot === 'Afternoon' ? '14:30' : '19:00'

    const newActivity: ItineraryActivity = {
      id: `ia-${Date.now()}`,
      activity_id: idea.activity_id || 1,
      slot,
      time,
      title: idea.title,
      category: 'Sightseeing',
      duration: idea.duration,
      cost: idea.cost,
      location: `${idea.city} Central`,
      booked: false,
    }

    const next = days.map((d) =>
      d.id === currentDay.id
        ? { ...d, activities: [...d.activities, newActivity] }
        : d,
    )
    commit(next)
    setParked((prev) => prev.filter((p) => p.id !== idea.id))

    try {
      if (idea.activity_id) {
        await tripsApi.scheduleActivity(cleanTripId, {
          activity_id: idea.activity_id,
          scheduled_date: currentDay.date_iso || new Date().toISOString().split('T')[0],
          sequence_order: currentDay.activities.length + 1,
        })
      }
      toast.success(`Scheduled "${idea.title}" into ${currentDay.label}!`)
    } catch (err) {
      toast.success(`Added "${idea.title}" to ${currentDay.label}.`)
    }
  }

  return (
    <AppShell title="Itinerary builder" searchPlaceholder="Search activities to drop in">
      <div className="flex flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{trip?.name || featuredTrip.name}</span>
              <span>·</span>
              <span>{days.length} days</span>
              <span>·</span>
              <span className="tabular font-medium text-ink">{totalActivities} activities</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-ink">Itinerary builder</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              aria-live="polite"
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              {saving ? (
                <>
                  <Spinner className="size-3" />
                  Saving…
                </>
              ) : (
                <>
                  <CheckIcon className="size-3.5 text-success" aria-hidden="true" />
                  Saved
                </>
              )}
            </span>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={undo}
                disabled={!canUndo}
                aria-label="Undo"
              >
                <Undo2Icon />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={redo}
                disabled={!canRedo}
                aria-label="Redo"
              >
                <Redo2Icon />
              </Button>
            </div>

            <Button variant="outline" render={<Link href={`/trips/${cleanTripId}`} />}>
              <EyeIcon data-icon="inline-start" />
              Preview itinerary
            </Button>
            <Button render={<Link href={`/trips/${cleanTripId}`} />}>Done building</Button>
          </div>
        </header>

        <section
          aria-label="Day switcher"
          className="flex gap-2 overflow-x-auto rounded-2xl border border-border bg-card p-2"
        >
          {days.map((day, idx) => {
            const active = day.id === currentDay.id
            const dayClashes = conflictIds(day.activities)
            return (
              <button
                key={day.id}
                type="button"
                onClick={() => setActiveDay(day.id)}
                aria-current={active ? 'true' : undefined}
                className={cn(
                  'flex min-w-36 flex-col items-start gap-1 rounded-xl border p-3 text-left transition-colors',
                  active
                    ? 'border-brand bg-brand-soft shadow-xs'
                    : 'border-transparent hover:border-border hover:bg-muted/60',
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="font-display text-xs font-bold text-ink">Day {idx + 1}</span>
                  {dayClashes.size > 0 && (
                    <TriangleAlertIcon
                      className="size-3.5 text-warning"
                      aria-label="Schedule conflict"
                    />
                  )}
                </div>
                <span className="truncate text-xs font-semibold text-ink">{day.city}</span>
                <span className="text-[11px] text-muted-foreground">{day.date}</span>
                <span className="tabular mt-1 text-[11px] font-semibold text-muted-foreground">
                  {day.activities.length} planned
                </span>
              </button>
            )
          })}
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <h3 className="font-display text-lg font-bold text-ink">
                  {currentDay.label} · {currentDay.city}
                </h3>
                <p className="text-xs text-muted-foreground">{currentDay.date}</p>
              </div>
              <span className="tabular text-xs font-semibold text-ink">
                Day spend: {money(currentDay.activities.reduce((s, a) => s + (a.cost || 0), 0))}
              </span>
            </div>

            {currentDay.travelNote && (
              <div className="flex items-center gap-2 rounded-xl border border-dashed border-border bg-card p-3 text-xs text-muted-foreground">
                <TrainFrontIcon className="size-4 text-brand" aria-hidden="true" />
                {currentDay.travelNote}
              </div>
            )}

            {clashes.size > 0 && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-warning/40 bg-warning-soft p-3 text-xs text-ink"
              >
                <TriangleAlertIcon className="mt-0.5 size-4 text-warning" aria-hidden="true" />
                <span>
                  Two activities overlap in time. Adjust the start times so you have time to travel
                  between locations.
                </span>
              </div>
            )}

            {slots.map((slot) => {
              const inSlot = currentDay.activities.filter((a) => a.slot === slot)
              return (
                <section
                  key={slot}
                  aria-label={`${slot} block`}
                  className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4"
                >
                  <header className="flex items-baseline justify-between">
                    <div className="flex items-baseline gap-2">
                      <h4 className="font-display text-sm font-bold text-ink">{slot}</h4>
                      <span className="text-xs text-muted-foreground">{slotHint[slot]}</span>
                    </div>
                    <span className="tabular text-xs font-semibold text-muted-foreground">
                      {inSlot.length} item{inSlot.length === 1 ? '' : 's'}
                    </span>
                  </header>

                  {inSlot.length === 0 ? (
                    <div className="flex min-h-20 items-center justify-center rounded-xl border border-dashed border-border text-xs text-muted-foreground">
                      Nothing scheduled yet. Drop an idea from the right panel.
                    </div>
                  ) : (
                    <ol className="flex flex-col gap-2">
                      {inSlot.map((activity) => {
                        const hasClash = clashes.has(activity.id)
                        return (
                          <li
                            key={activity.id}
                            className={cn(
                              'group flex items-start gap-3 rounded-xl border p-3 transition-colors',
                              hasClash
                                ? 'border-warning/60 bg-warning-soft/40'
                                : 'border-border bg-background hover:border-brand/40',
                            )}
                          >
                            <span
                              className="cursor-grab text-muted-foreground group-hover:text-ink pt-1"
                              aria-hidden="true"
                            >
                              <GripVerticalIcon className="size-4" />
                            </span>

                            <span className="tabular w-12 shrink-0 text-sm font-bold text-ink pt-0.5">
                              {activity.time}
                            </span>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start gap-2">
                                <h5 className="text-sm font-semibold text-ink">{activity.title}</h5>
                                <Badge
                                  className={cn(
                                    'shrink-0 border-0 text-[10px]',
                                    categoryTone[activity.category] ?? 'bg-muted text-foreground',
                                  )}
                                >
                                  {activity.category}
                                </Badge>
                              </div>
                              <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                <li className="flex items-center gap-1">
                                  <ClockIcon className="size-3" aria-hidden="true" />
                                  {activity.duration}
                                </li>
                                <li className="flex items-center gap-1">
                                  <MapPinIcon className="size-3" aria-hidden="true" />
                                  {activity.location}
                                </li>
                                <li className="tabular flex items-center gap-1 font-semibold text-ink">
                                  <WalletIcon className="size-3" aria-hidden="true" />
                                  {activity.cost === 0 ? 'Free' : money(activity.cost)}
                                </li>
                              </ul>
                            </div>

                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                aria-label="Move up"
                                onClick={() => moveActivity(activity.id, 'up')}
                              >
                                <ChevronUpIcon />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                aria-label="Move down"
                                onClick={() => moveActivity(activity.id, 'down')}
                              >
                                <ChevronDownIcon />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                aria-label="Remove activity"
                                onClick={() => removeActivity(activity.id)}
                              >
                                <TrashIcon />
                              </Button>
                            </div>
                          </li>
                        )
                      })}
                    </ol>
                  )}
                </section>
              )
            })}
          </div>

          {/* Right Sidebar: Parked Ideas & Quick Add */}
          <aside className="flex flex-col gap-4">
            <section
              aria-label="Idea box"
              className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4"
            >
              <div className="flex items-baseline justify-between">
                <div className="flex items-center gap-2">
                  <InboxIcon className="size-4 text-brand" aria-hidden="true" />
                  <h3 className="font-display text-sm font-bold text-ink">Unscheduled Ideas</h3>
                </div>
                <span className="tabular text-xs text-muted-foreground">
                  {parked.length} saved
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Activities you bookmarked or kept on hold. Add them straight into {currentDay.label}.
              </p>

              {parked.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                  No unscheduled ideas parked right now.
                </div>
              ) : (
                <ul className="flex flex-col gap-2">
                  {parked.map((idea) => (
                    <li
                      key={idea.id}
                      className="flex items-center justify-between gap-2 rounded-xl border border-border bg-background p-3 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-ink">{idea.title}</p>
                        <p className="truncate text-muted-foreground">
                          {idea.city} · {idea.duration} · {idea.cost === 0 ? 'Free' : money(idea.cost)}
                        </p>
                      </div>
                      <Button
                        size="xs"
                        variant="secondary"
                        onClick={() => scheduleIdea(idea)}
                      >
                        <PlusIcon data-icon="inline-start" />
                        Add
                      </Button>
                    </li>
                  ))}
                </ul>
              )}

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                render={<Link href="/activities" />}
              >
                Browse more activities
              </Button>
            </section>

            <section
              aria-label="Builder stats"
              className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4"
            >
              <h3 className="font-display text-sm font-bold text-ink">Pacing snapshot</h3>
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Itinerary density</span>
                  <span className="font-semibold text-ink">{progress}% planned</span>
                </div>
                <Progress value={progress} />
              </div>
              <dl className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-muted/60 p-2">
                  <dt className="text-muted-foreground">Activities</dt>
                  <dd className="tabular font-display text-base font-bold text-ink">
                    {totalActivities}
                  </dd>
                </div>
                <div className="rounded-lg bg-muted/60 p-2">
                  <dt className="text-muted-foreground">Total spend</dt>
                  <dd className="tabular font-display text-base font-bold text-ink">
                    {money(totalSpend)}
                  </dd>
                </div>
              </dl>
            </section>
          </aside>
        </div>
      </div>
    </AppShell>
  )
}
