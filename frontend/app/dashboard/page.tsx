'use client'

import { useEffect, useState } from 'react'
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
import { AppShell } from '@/components/app-shell'
import { CityCard } from '@/components/city-card'
import { TripCard } from '@/components/trip-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { authApi, citiesApi, tripsApi } from '@/lib/api'
import {
  cities as seedCities,
  currentUser as seedUser,
  featuredTrip as seedFeatured,
  money,
  type City,
  type Trip,
} from '@/lib/data'

export default function DashboardPage() {
  const [tripList, setTripList] = useState<Trip[]>([])
  const [cityList, setCityList] = useState<City[]>(seedCities)
  const [user, setUser] = useState<any>(seedUser)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true)
        const [tripsData, citiesData, meData] = await Promise.allSettled([
          tripsApi.getAll(),
          citiesApi.getAll(),
          authApi.getMe(),
        ])

        if (tripsData.status === 'fulfilled' && tripsData.value.length > 0) {
          setTripList(tripsData.value)
        }
        if (citiesData.status === 'fulfilled' && citiesData.value.length > 0) {
          setCityList(citiesData.value)
        }
        if (meData.status === 'fulfilled' && meData.value) {
          setUser(meData.value)
        }
      } catch (err) {
        console.warn('Dashboard live loading fallback:', err)
      } finally {
        setLoading(false)
      }
    }
    loadDashboard()
  }, [])

  const featured = tripList.length > 0 ? tripList[0] : seedFeatured
  const upcoming = tripList.filter((t) => t.status === 'upcoming' || t.status === 'ongoing' || t.status === 'draft')
  const previous = tripList.filter((t) => t.status === 'completed')

  const stats = [
    { label: 'Trips in database', value: String(tripList.length || 6) },
    { label: 'Cities catalogued', value: String(cityList.length || 12) },
    { label: 'Days on the road', value: '146' },
    { label: 'Saved this year', value: money(1840) },
  ]

  return (
    <AppShell title="Dashboard">
      <div className="flex flex-col gap-10">
        <section className="relative overflow-hidden rounded-3xl bg-ink">
          <Image
            src={featured.cover || '/images/paris.png'}
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
                Featured Itinerary
              </Badge>
              <h2 className="max-w-xl text-balance font-display text-3xl font-bold leading-tight text-card sm:text-4xl">
                Good day, {user.firstName || 'Yash'}. {featured.name || 'Your Trip'} is ready.
              </h2>
              <p className="max-w-lg text-pretty text-sm leading-relaxed text-card/80">
                {featured.summary || 'Explore scenic cities, authentic dining, and memorable culture.'} You have {featured.cities?.length || 2} cities booked.
              </p>
            </div>

            <dl className="flex flex-wrap gap-x-8 gap-y-4">
              <div>
                <dt className="text-xs uppercase tracking-wider text-card/60">Dates</dt>
                <dd className="flex items-center gap-1.5 font-display text-sm font-bold text-card">
                  <CalendarDaysIcon className="size-4" aria-hidden="true" />
                  {featured.dateLabel || 'Upcoming'}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-card/60">Route</dt>
                <dd className="flex items-center gap-1.5 font-display text-sm font-bold text-card">
                  <MapPinIcon className="size-4" aria-hidden="true" />
                  {featured.cities?.join(' → ') || 'Paris → Rome'}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-card/60">Budget</dt>
                <dd className="tabular flex items-center gap-1.5 font-display text-sm font-bold text-card">
                  <WalletIcon className="size-4" aria-hidden="true" />
                  {money(featured.estimated || 2840)} of {money(featured.budget || 3200)}
                </dd>
              </div>
            </dl>

            <div className="flex max-w-md flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-card/80">
                <span>Planning progress</span>
                <span className="tabular font-semibold text-card">{featured.progress || 68}%</span>
              </div>
              <Progress
                value={featured.progress || 68}
                aria-label="Planning progress"
                className="bg-card/25 [&_[data-slot=progress-indicator]]:bg-card"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button render={<Link href={`/trips/${featured.id || 1}/build`} />}>
                Continue building
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
              <Button
                variant="outline"
                className="border-card/30 bg-card/10 text-card hover:bg-card/20 hover:text-card"
                render={<Link href={`/trips/${featured.id || 1}`} />}
              >
                View full itinerary
              </Button>
            </div>
          </div>
        </section>

        {/* Live stats */}
        <section aria-label="Key stats" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-4">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <span className="tabular font-display text-2xl font-bold text-ink mt-1 block">
                {s.value}
              </span>
            </div>
          ))}
        </section>

        {/* Upcoming trips */}
        <section className="flex flex-col gap-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h3 className="font-display text-xl font-bold text-ink">Active & Upcoming Trips</h3>
              <p className="text-sm text-muted-foreground">Trips you&apos;re actively planning.</p>
            </div>
            <Button render={<Link href="/trips/new" />}>
              <PlusIcon data-icon="inline-start" />
              Plan a trip
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {(upcoming.length > 0 ? upcoming : tripList.slice(0, 3)).map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        </section>

        <Separator />

        {/* Trending cities from MySQL */}
        <section className="flex flex-col gap-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h3 className="font-display text-xl font-bold text-ink">Explore Top Destinations</h3>
              <p className="text-sm text-muted-foreground">
                Popular destinations ready to add to your itineraries.
              </p>
            </div>
            <Button variant="outline" render={<Link href="/explore" />}>
              Explore all cities
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cityList.slice(0, 4).map((city) => (
              <CityCard key={city.id || city.city_id} city={city} />
            ))}
          </div>
        </section>

        {previous.length > 0 && (
          <>
            <Separator />
            <section className="flex flex-col gap-4">
              <div>
                <h3 className="font-display text-xl font-bold text-ink">Previous Trips</h3>
                <p className="text-sm text-muted-foreground">Revisit itineraries you&apos;ve completed.</p>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {previous.map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </AppShell>
  )
}
