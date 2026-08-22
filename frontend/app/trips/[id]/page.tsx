'use client'

import { use, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  CalendarDaysIcon,
  ChevronDownIcon,
  ClockIcon,
  CloudSunIcon,
  DownloadIcon,
  MapIcon,
  MapPinIcon,
  PencilIcon,
  PrinterIcon,
  Share2Icon,
  TrainFrontIcon,
  UsersIcon,
  WalletIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { AppShell } from '@/components/app-shell'
import { TripBudget } from '@/components/trip-budget'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { tripsApi } from '@/lib/api'
import { money, type ItineraryActivity, type ItineraryDay, type Trip } from '@/lib/data'
import { cn } from '@/lib/utils'

const cityAccent: Record<string, string> = {
  Paris: 'bg-brand',
  Tokyo: 'bg-primary',
  Rome: 'bg-warning',
  Bangkok: 'bg-emerald-500',
  'New York City': 'bg-indigo-500',
  Amsterdam: 'bg-success',
  Berlin: 'bg-warning',
}

function ActivityBlock({ activity }: { activity: ItineraryActivity }) {
  const [open, setOpen] = useState(false)
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <article className="rounded-xl border border-border bg-card p-3">
        <div className="flex flex-wrap items-start gap-3">
          <span className="tabular w-12 shrink-0 text-sm font-bold text-ink">{activity.time}</span>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-ink">{activity.title}</h4>
            <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
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
          </div>
          <Badge variant="secondary" className="shrink-0">
            {activity.category}
          </Badge>
          <CollapsibleTrigger render={<Button variant="ghost" size="sm" />}>
            {open ? 'Less' : 'Details'}
            <ChevronDownIcon
              data-icon="inline-end"
              className={cn('transition-transform', open && 'rotate-180')}
            />
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
            <p>{activity.note ?? 'No extra notes. Arrive a few minutes early to skip the queue.'}</p>
            <p className="flex items-center gap-1.5">
              <CloudSunIcon className="size-3.5" aria-hidden="true" />
              Weather: forecast available closer to the date
            </p>
            <p>{activity.booked ? 'Booking confirmed.' : 'No booking needed for this one.'}</p>
          </div>
        </CollapsibleContent>
      </article>
    </Collapsible>
  )
}

export default function TripItineraryPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params)
  const tripIdParam = unwrappedParams?.id || '1'

  const [trip, setTrip] = useState<Trip | null>(null)
  const [itineraryDays, setItineraryDays] = useState<ItineraryDay[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('List')

  useEffect(() => {
    async function loadTripDetails() {
      try {
        setLoading(true)
        const data = await tripsApi.getById(tripIdParam)
        if (data) {
          setTrip(data)
          if (data.itinerary) {
            setItineraryDays(data.itinerary)
          }
        }
      } catch (err) {
        console.error('Failed to load trip from API:', err)
      } finally {
        setLoading(false)
      }
    }
    loadTripDetails()
  }, [tripIdParam])

  const totalActivities = itineraryDays.reduce((sum, d) => sum + d.activities.length, 0)
  const citiesList = trip?.cities || ['Paris', 'Rome']

  return (
    <AppShell title="Itinerary" searchPlaceholder="Search this itinerary">
      <div className="flex flex-col gap-6">
        <section className="relative overflow-hidden rounded-3xl bg-ink">
          <Image
            src={trip?.cover || '/images/paris.png'}
            alt=""
            width={1600}
            height={900}
            aria-hidden="true"
            className="absolute inset-0 size-full object-cover opacity-40"
          />
          <div className="relative flex flex-col gap-5 p-6 sm:p-9">
            <Badge className="w-fit border-0 bg-card/15 text-card backdrop-blur">
              {trip?.style || 'Balanced'} · {trip?.status === 'upcoming' ? 'Upcoming' : 'In progress'}
            </Badge>
            <div className="flex flex-col gap-2">
              <h2 className="font-display text-3xl font-bold text-card sm:text-4xl">
                {trip?.name || 'European Summer Escape'}
              </h2>
              <p className="text-sm text-card/80">{citiesList.join(' → ')}</p>
            </div>
            <dl className="flex flex-wrap gap-x-8 gap-y-4">
              {[
                [CalendarDaysIcon, 'Dates', trip?.dateLabel || '12 – 24 Jun 2026'],
                [UsersIcon, 'Travellers', `${trip?.travellers || 2} people`],
                [ClockIcon, 'Duration', `${itineraryDays.length || 5} days`],
                [WalletIcon, 'Estimated Spend', money(trip?.estimated || 2840)],
              ].map(([Icon, label, value]) => {
                const IconComponent = Icon as typeof CalendarDaysIcon
                return (
                  <div key={label as string}>
                    <dt className="text-xs uppercase tracking-wider text-card/60">
                      {label as string}
                    </dt>
                    <dd className="tabular flex items-center gap-1.5 font-display text-sm font-bold text-card">
                      <IconComponent className="size-4" aria-hidden="true" />
                      {value as string}
                    </dd>
                  </div>
                )
              })}
            </dl>
            <div className="flex flex-wrap gap-2">
              <Button render={<Link href={`/trips/${tripIdParam}/build`} />}>
                <PencilIcon data-icon="inline-start" />
                Edit trip
              </Button>
              <Button
                variant="outline"
                className="border-card/30 bg-card/10 text-card hover:bg-card/20 hover:text-card"
                render={<Link href={`/shared/${trip?.public_share_token || tripIdParam}`} />}
              >
                <Share2Icon data-icon="inline-start" />
                Share
              </Button>
              <Button
                variant="outline"
                className="border-card/30 bg-card/10 text-card hover:bg-card/20 hover:text-card"
                onClick={() => toast.success('Exporting itinerary PDF...')}
              >
                <DownloadIcon data-icon="inline-start" />
                Export PDF
              </Button>
              <Button
                variant="outline"
                className="border-card/30 bg-card/10 text-card hover:bg-card/20 hover:text-card"
                onClick={() => window.print()}
              >
                <PrinterIcon data-icon="inline-start" />
                Print
              </Button>
            </div>
          </div>
        </section>

        <Tabs defaultValue="itinerary" className="gap-5">
          <TabsList>
            <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
            <TabsTrigger value="budget">Budget Breakdown</TabsTrigger>
          </TabsList>

          <TabsContent value="itinerary" className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-3">
              <ToggleGroup
                value={[view]}
                onValueChange={(value) => {
                  const next = (value as string[])[0]
                  if (next) setView(next)
                }}
                variant="outline"
                spacing={0}
              >
                {['List', 'Calendar', 'Map'].map((v) => (
                  <ToggleGroupItem key={v} value={v}>
                    {v}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              <p className="text-sm text-muted-foreground">
                {itineraryDays.length} days · {totalActivities} activities · {citiesList.length} cities
              </p>
              <div className="ml-auto flex -space-x-2">
                {(trip?.collaborators || ['YM', 'AR']).map((c) => (
                  <Avatar key={c} className="size-7 ring-2 ring-background">
                    <AvatarFallback className="bg-sand text-[10px] font-semibold text-ink">
                      {c}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </div>

            {view === 'List' && (
              <ol className="flex flex-col">
                {itineraryDays.map((day, index) => {
                  const newCity = index === 0 || itineraryDays[index - 1].city !== day.city
                  const dayCost = day.activities.reduce((s, a) => s + a.cost, 0)
                  return (
                    <li key={day.id} className="flex flex-col">
                      {newCity && (
                        <div className="flex items-center gap-3 py-4">
                          <span
                            className={cn(
                              'size-3 rounded-full',
                              cityAccent[day.city] ?? 'bg-muted-foreground',
                            )}
                            aria-hidden="true"
                          />
                          <h3 className="font-display text-lg font-bold text-ink">{day.city}</h3>
                          <Separator className="flex-1" />
                        </div>
                      )}

                      {day.travelNote && (
                        <p className="mb-3 ml-1.5 flex items-center gap-2 border-l-2 border-dashed border-border py-2 pl-5 text-xs text-muted-foreground">
                          <TrainFrontIcon className="size-3.5" aria-hidden="true" />
                          {day.travelNote}
                        </p>
                      )}

                      <div className="ml-1.5 flex flex-col gap-3 border-l-2 border-border pb-6 pl-5">
                        <header className="flex flex-wrap items-baseline gap-2">
                          <h4 className="font-display text-sm font-bold text-ink">{day.label}</h4>
                          <span className="text-xs text-muted-foreground">{day.date}</span>
                          <span className="tabular ml-auto text-xs font-semibold text-ink">
                            {money(dayCost)}
                          </span>
                        </header>
                        {day.activities.length === 0 ? (
                          <p className="text-xs text-muted-foreground italic">No activities planned for this day.</p>
                        ) : (
                          day.activities.map((activity) => (
                            <ActivityBlock key={activity.id} activity={activity} />
                          ))
                        )}
                      </div>
                    </li>
                  )
                })}
              </ol>
            )}

            {view === 'Calendar' && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {itineraryDays.map((day) => (
                  <div key={day.id} className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'size-2.5 rounded-full',
                          cityAccent[day.city] ?? 'bg-muted-foreground',
                        )}
                        aria-hidden="true"
                      />
                      <h4 className="font-display text-sm font-bold text-ink">{day.date}</h4>
                      <span className="ml-auto text-xs text-muted-foreground">{day.city}</span>
                    </div>
                    <ul className="mt-3 flex flex-col gap-2">
                      {day.activities.map((a) => (
                        <li
                          key={a.id}
                          className="flex items-baseline gap-2 rounded-lg bg-muted/60 px-2.5 py-1.5 text-xs"
                        >
                          <span className="tabular font-semibold text-ink">{a.time}</span>
                          <span className="min-w-0 flex-1 truncate text-muted-foreground">
                            {a.title}
                          </span>
                          <span className="tabular font-semibold text-ink">{money(a.cost)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {view === 'Map' && (
              <div className="overflow-hidden rounded-2xl border border-border bg-card">
                <Image
                  src="/images/map-preview.png"
                  alt={`Map of the route between ${citiesList.join(', ')}`}
                  width={1280}
                  height={720}
                  className="h-[320px] w-full object-cover sm:h-[420px]"
                />
                <ul className="flex flex-col divide-y divide-border">
                  {citiesList.map((city, index) => (
                    <li key={city} className="flex items-center gap-3 p-4">
                      <span className="tabular flex size-7 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-brand">
                        {index + 1}
                      </span>
                      <span className="text-sm font-semibold text-ink">{city}</span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {itineraryDays.filter((d) => d.city === city).length} days planned
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center gap-3 rounded-2xl border border-border bg-sand/60 p-4">
              <MapIcon className="size-5 shrink-0 text-brand" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">
                Want to change the order or times? Everything is editable in the builder.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto shrink-0"
                render={<Link href={`/trips/${tripIdParam}/build`} />}
              >
                Open builder
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="budget">
            <TripBudget tripId={tripIdParam} />
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}
