'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  InboxIcon,
  PlusIcon,
  TrainFrontIcon,
  TriangleAlertIcon,
  WalletIcon,
} from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useAuth } from '@/lib/auth'
import {
  featuredTrip,
  itinerary,
  money,
  unscheduled,
  type ItineraryActivity,
} from '@/lib/data'
import { cn } from '@/lib/utils'

const views = ['Month', 'Week', 'Timeline']
const cityTone: Record<string, { dot: string; soft: string }> = {
  Jaipur: { dot: 'bg-brand', soft: 'bg-brand-soft text-brand' },
  Udaipur: { dot: 'bg-success', soft: 'bg-success-soft text-success' },
  Delhi: { dot: 'bg-warning', soft: 'bg-warning-soft text-warning-foreground' },
  Goa: { dot: 'bg-sky-500', soft: 'bg-sky-100 text-sky-700' },
  Mumbai: { dot: 'bg-indigo-500', soft: 'bg-indigo-100 text-indigo-700' },
  Varanasi: { dot: 'bg-amber-600', soft: 'bg-amber-100 text-amber-800' },
}

// October 2026 starts on a Thursday.
const monthStartOffset = 3
const daysInMonth = 31
const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const todayDate = 15

function dayNumber(date: string) {
  return Number(date.split(' ')[1])
}

export default function CalendarPage() {
  const { user } = useAuth()
  const [view, setView] = useState('Month')
  const [cityFilter, setCityFilter] = useState('All cities')
  const [categoryFilter, setCategoryFilter] = useState('All categories')
  const [travellerFilter, setTravellerFilter] = useState('Everyone')
  const [days, setDays] = useState(itinerary)
  const [dragging, setDragging] = useState<{ dayId: string; id: string } | null>(null)

  const cities = ['All cities', ...new Set(itinerary.map((d) => d.city))]
  const categories = [
    'All categories',
    ...new Set(itinerary.flatMap((d) => d.activities.map((a) => a.category))),
  ]

  const byDate = useMemo(() => {
    const map = new Map<number, (typeof days)[number]>()
    for (const d of days) map.set(dayNumber(d.date), d)
    return map
  }, [days])

  function visible(activity: ItineraryActivity, city: string) {
    if (cityFilter !== 'All cities' && city !== cityFilter) return false
    if (categoryFilter !== 'All categories' && activity.category !== categoryFilter) return false
    return true
  }

  function reschedule(targetDayId: string) {
    if (!dragging) return
    const source = days.find((d) => d.id === dragging.dayId)
    const moved = source?.activities.find((a) => a.id === dragging.id)
    if (!source || !moved || targetDayId === dragging.dayId) {
      setDragging(null)
      return
    }
    setDays((prev) =>
      prev.map((d) => {
        if (d.id === dragging.dayId) {
          return { ...d, activities: d.activities.filter((a) => a.id !== moved.id) }
        }
        if (d.id === targetDayId) {
          return { ...d, activities: [...d.activities, moved] }
        }
        return d
      }),
    )
    setDragging(null)
  }

  const conflictDay = days.find((d) => {
    const times = d.activities.map((a) => a.time)
    return new Set(times).size !== times.length || d.activities.length > 3
  })

  return (
    <AppShell title="Trip calendar" searchPlaceholder="Search scheduled activities">
      <div className="flex flex-col gap-5">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink">June 2026</h2>
            <p className="text-sm text-muted-foreground">
              {featuredTrip.name} · {featuredTrip.dateLabel}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="icon" aria-label="Previous month">
              <ChevronLeftIcon />
            </Button>
            <Button variant="outline" size="sm">
              Today
            </Button>
            <Button variant="outline" size="icon" aria-label="Next month">
              <ChevronRightIcon />
            </Button>
            <ToggleGroup
              value={[view]}
              onValueChange={(v) => {
                const next = (v as string[])[0]
                if (next) setView(next)
              }}
              variant="outline"
              spacing={0}
              size="sm"
            >
              {views.map((v) => (
                <ToggleGroupItem key={v} value={v}>
                  {v}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </header>

        <div className="flex flex-wrap items-center gap-2">
          {[
            { value: cityFilter, set: setCityFilter, options: cities, label: 'City' },
            {
              value: categoryFilter,
              set: setCategoryFilter,
              options: categories,
              label: 'Category',
            },
            {
              value: travellerFilter,
              set: setTravellerFilter,
              options: ['Everyone', user.firstName, 'Aarti', 'Sam'],
              label: 'Traveller',
            },
          ].map((filter) => (
            <Select
              key={filter.label}
              value={filter.value}
              onValueChange={(v) => filter.set(v as string)}
            >
              <SelectTrigger size="sm" className="w-40" aria-label={filter.label}>
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {filter.options.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          ))}
          <ul className="ml-auto flex flex-wrap items-center gap-3">
            {Object.entries(cityTone).map(([city, tone]) => (
              <li key={city} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className={cn('size-2.5 rounded-full', tone.dot)} aria-hidden="true" />
                {city}
              </li>
            ))}
          </ul>
        </div>

        {conflictDay && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-2xl border border-warning/40 bg-warning-soft p-3 text-sm text-ink"
          >
            <TriangleAlertIcon className="mt-0.5 size-4 text-warning" aria-hidden="true" />
            <span>
              {conflictDay.date} looks crowded — {conflictDay.activities.length} activities and a
              travel leg. Consider moving one to the next day.
            </span>
          </div>
        )}

        {view === 'Month' && (
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="grid grid-cols-7 border-b border-border">
              {weekdays.map((w) => (
                <div
                  key={w}
                  className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {w}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {Array.from({ length: monthStartOffset + daysInMonth }).map((_, index) => {
                const dateNum = index - monthStartOffset + 1
                if (dateNum < 1) {
                  return <div key={`pad-${index}`} className="min-h-24 border-b border-r border-border/60" />
                }
                const day = byDate.get(dateNum)
                const tone = day ? cityTone[day.city] : undefined
                const items = day?.activities.filter((a) => visible(a, day.city)) ?? []
                return (
                  <div
                    key={dateNum}
                    onDragOver={(e) => day && e.preventDefault()}
                    onDrop={() => day && reschedule(day.id)}
                    className={cn(
                      'flex min-h-24 flex-col gap-1 border-b border-r border-border/60 p-1.5',
                      day ? 'bg-card' : 'bg-muted/30',
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          'tabular flex size-6 items-center justify-center rounded-full text-xs font-semibold',
                          dateNum === todayDate
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground',
                        )}
                      >
                        {dateNum}
                      </span>
                      {day && tone && (
                        <span className={cn('size-2 rounded-full', tone.dot)} aria-hidden="true" />
                      )}
                      {day?.travelNote && (
                        <TrainFrontIcon
                          className="size-3 text-muted-foreground"
                          aria-label="Travel day"
                        />
                      )}
                    </div>
                    <ul className="flex flex-col gap-1">
                      {items.slice(0, 3).map((a) => (
                        <li key={a.id}>
                          <Popover>
                            <PopoverTrigger
                              render={
                                <button
                                  type="button"
                                  draggable
                                  onDragStart={() => setDragging({ dayId: day!.id, id: a.id })}
                                  onDragEnd={() => setDragging(null)}
                                  className={cn(
                                    'flex w-full items-baseline gap-1 rounded-md px-1.5 py-1 text-left text-[11px] font-medium',
                                    tone?.soft ?? 'bg-muted text-muted-foreground',
                                  )}
                                />
                              }
                            >
                              <span className="tabular font-bold">{a.time}</span>
                              <span className="min-w-0 flex-1 truncate">{a.title}</span>
                            </PopoverTrigger>
                            <PopoverContent className="w-64">
                              <div className="flex flex-col gap-2">
                                <p className="text-sm font-semibold text-ink">{a.title}</p>
                                <ul className="flex flex-col gap-1 text-xs text-muted-foreground">
                                  <li className="flex items-center gap-1.5">
                                    <ClockIcon className="size-3" aria-hidden="true" />
                                    {a.time} · {a.duration}
                                  </li>
                                  <li className="tabular flex items-center gap-1.5">
                                    <WalletIcon className="size-3" aria-hidden="true" />
                                    {money(a.cost)}
                                  </li>
                                </ul>
                                <Separator />
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    className="flex-1"
                                    render={
                                      <Link href={`/trips/${featuredTrip.id}/build`} />
                                    }
                                  >
                                    Edit
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    Move
                                  </Button>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </li>
                      ))}
                      {items.length > 3 && (
                        <li className="px-1.5 text-[11px] text-muted-foreground">
                          +{items.length - 3} more
                        </li>
                      )}
                    </ul>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {view === 'Week' && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {days.map((day) => {
              const tone = cityTone[day.city]
              return (
                <section
                  key={day.id}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => reschedule(day.id)}
                  className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-3"
                >
                  <header className="flex items-center gap-2">
                    <span className={cn('size-2.5 rounded-full', tone?.dot)} aria-hidden="true" />
                    <h3 className="font-display text-sm font-bold text-ink">{day.date}</h3>
                    <span className="ml-auto text-xs text-muted-foreground">{day.city}</span>
                  </header>
                  {day.travelNote && (
                    <p className="rounded-lg bg-sand/70 px-2 py-1.5 text-[11px] text-ink">
                      {day.travelNote}
                    </p>
                  )}
                  <ul className="flex flex-col gap-1.5">
                    {day.activities
                      .filter((a) => visible(a, day.city))
                      .map((a) => (
                        <li
                          key={a.id}
                          draggable
                          onDragStart={() => setDragging({ dayId: day.id, id: a.id })}
                          onDragEnd={() => setDragging(null)}
                          className={cn(
                            'flex flex-col rounded-lg px-2 py-1.5 text-xs',
                            tone?.soft ?? 'bg-muted text-muted-foreground',
                          )}
                        >
                          <span className="tabular font-bold">{a.time}</span>
                          <span className="font-medium">{a.title}</span>
                          <span className="tabular opacity-80">{money(a.cost)}</span>
                        </li>
                      ))}
                  </ul>
                </section>
              )
            })}
          </div>
        )}

        {view === 'Timeline' && (
          <div className="flex flex-col gap-3">
            {days.map((day) => {
              const tone = cityTone[day.city]
              return (
                <div
                  key={day.id}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => reschedule(day.id)}
                  className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-start sm:gap-4"
                >
                  <div className="flex w-32 shrink-0 items-center gap-2">
                    <span className={cn('size-2.5 rounded-full', tone?.dot)} aria-hidden="true" />
                    <div>
                      <p className="text-sm font-bold text-ink">{day.date}</p>
                      <p className="text-xs text-muted-foreground">{day.city}</p>
                    </div>
                  </div>
                  <ul className="flex min-w-0 flex-1 flex-wrap gap-2">
                    {day.travelNote && (
                      <li className="flex items-center gap-1.5 rounded-lg bg-sand/70 px-2.5 py-1.5 text-xs text-ink">
                        <TrainFrontIcon className="size-3.5" aria-hidden="true" />
                        Travel day
                      </li>
                    )}
                    {day.activities
                      .filter((a) => visible(a, day.city))
                      .map((a) => (
                        <li
                          key={a.id}
                          draggable
                          onDragStart={() => setDragging({ dayId: day.id, id: a.id })}
                          onDragEnd={() => setDragging(null)}
                          className={cn(
                            'flex items-baseline gap-2 rounded-lg px-2.5 py-1.5 text-xs',
                            tone?.soft ?? 'bg-muted text-muted-foreground',
                          )}
                        >
                          <span className="tabular font-bold">{a.time}</span>
                          {a.title}
                          <span className="tabular opacity-80">{money(a.cost)}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              )
            })}
          </div>
        )}

        <section className="rounded-2xl border border-dashed border-border bg-card p-4">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="flex items-center gap-1.5 font-display text-sm font-bold text-ink">
              <InboxIcon className="size-4" aria-hidden="true" />
              Unscheduled ({unscheduled.length})
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
              render={<Link href={`/trips/${featuredTrip.id}/build`} />}
            >
              <PlusIcon data-icon="inline-start" />
              Schedule in builder
            </Button>
          </div>
          <ul className="mt-3 flex flex-wrap gap-2">
            {unscheduled.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs"
              >
                <span className="font-semibold text-ink">{item.title}</span>
                <Badge variant="secondary">{item.city}</Badge>
                <span className="tabular text-muted-foreground">
                  {item.duration} · {money(item.cost)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AppShell>
  )
}
