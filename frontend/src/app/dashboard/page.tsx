import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRightIcon,
  CalendarDaysIcon,
  MapPinIcon,
  PlusIcon,
  SparklesIcon,
  WalletIcon,
} from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { CityCard } from '@/features/destinations/components/city-card'
import { Toolbar } from '@/components/layout/toolbar'
import { TripCard } from '@/features/trips/components/trip-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { cities, currentUser, featuredTrip, money, trips } from '@/services/mocks'

const stats = [
  { label: 'Trips planned', value: '12' },
  { label: 'Cities visited', value: '28' },
  { label: 'Days on the road', value: '146' },
  { label: 'Saved this year', value: money(1840) },
]

export default function DashboardPage() {
  const upcoming = trips.filter((t) => t.status === 'upcoming' || t.status === 'ongoing')
  const previous = trips.filter((t) => t.status === 'completed')
  const daysAway = 112

  return (
    <AppShell title="Dashboard">
      <div className="flex flex-col gap-10">
        <section className="relative overflow-hidden rounded-3xl bg-ink">
          <Image
            src={featuredTrip.cover || '/placeholder.svg'}
            alt=""
            width={1600}
            height={900}
            aria-hidden="true"
            className="absolute inset-0 size-full object-cover opacity-45"
          />
          <div className="relative flex flex-col gap-6 p-6 sm:p-10">
            <div className="flex flex-col gap-3">
              <Badge className="w-fit border-0 bg-card/15 text-card backdrop-blur">
                <SparklesIcon data-icon="inline-start" />
                {daysAway} days until departure
              </Badge>
              <h2 className="max-w-xl text-balance font-display text-3xl font-bold leading-tight text-card sm:text-4xl">
                Good morning, {currentUser.firstName}. {featuredTrip.name} is nearly ready.
              </h2>
              <p className="max-w-lg text-pretty text-sm leading-relaxed text-card/80">
                {featuredTrip.summary} You have {featuredTrip.cities.length} cities booked and{' '}
                {100 - featuredTrip.progress}% of the itinerary still open.
              </p>
            </div>

            <dl className="flex flex-wrap gap-x-8 gap-y-4">
              <div>
                <dt className="text-xs uppercase tracking-wider text-card/60">Dates</dt>
                <dd className="flex items-center gap-1.5 font-display text-sm font-bold text-card">
                  <CalendarDaysIcon className="size-4" aria-hidden="true" />
                  {featuredTrip.dateLabel}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-card/60">Route</dt>
                <dd className="flex items-center gap-1.5 font-display text-sm font-bold text-card">
                  <MapPinIcon className="size-4" aria-hidden="true" />
                  {featuredTrip.cities.join(' → ')}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-card/60">Budget</dt>
                <dd className="tabular flex items-center gap-1.5 font-display text-sm font-bold text-card">
                  <WalletIcon className="size-4" aria-hidden="true" />
                  {money(featuredTrip.estimated)} of {money(featuredTrip.budget)}
                </dd>
              </div>
            </dl>

            <div className="flex max-w-md flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-card/80">
                <span>Planning progress</span>
                <span className="tabular font-semibold text-card">{featuredTrip.progress}%</span>
              </div>
              <Progress
                value={featuredTrip.progress}
                aria-label="Planning progress"
                className="bg-card/25 [&_[data-slot=progress-indicator]]:bg-card"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button render={<Link href={`/trips/${featuredTrip.id}/build`} />}>
                Continue building
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
              <Button
                variant="outline"
                className="border-card/30 bg-card/10 text-card hover:bg-card/20 hover:text-card"
                render={<Link href={`/trips/${featuredTrip.id}`} />}
              >
                View itinerary
              </Button>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <Toolbar
            placeholder="Search trips, cities and activities…"
            groupOptions={['None', 'Region', 'Status', 'Month']}
            group="None"
            filters={['Upcoming', 'Draft', 'Completed', 'Shared with me']}
            sortOptions={['Departure date', 'Recently updated', 'Budget']}
            sort="Departure date"
          >
            <Button render={<Link href="/trips/new" />} className="ml-auto">
              <PlusIcon data-icon="inline-start" />
              Plan a trip
            </Button>
          </Toolbar>

          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-border bg-card p-4">
                <dt className="text-xs text-muted-foreground">{s.label}</dt>
                <dd className="tabular font-display text-2xl font-bold text-ink">{s.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="flex flex-col gap-4">
          <header className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-bold text-ink">Top regional selections</h2>
              <p className="text-sm text-muted-foreground">
                Places trending with travellers planning the same months as you.
              </p>
            </div>
            <Button variant="ghost" size="sm" render={<Link href="/explore" />}>
              Browse all
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          </header>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cities.slice(0, 4).map((city) => (
              <CityCard key={city.id} city={city} />
            ))}
          </div>
        </section>

        <Separator />

        <section className="flex flex-col gap-4">
          <header className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-bold text-ink">In progress</h2>
              <p className="text-sm text-muted-foreground">Trips that still need your attention.</p>
            </div>
            <Button variant="ghost" size="sm" render={<Link href="/trips" />}>
              My trips
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          </header>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {upcoming.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <header>
            <h2 className="font-display text-xl font-bold text-ink">Previous trips</h2>
            <p className="text-sm text-muted-foreground">Reuse an old plan as a starting point.</p>
          </header>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {previous.map((trip) => (
              <TripCard key={trip.id} trip={trip} compact />
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  )
}
