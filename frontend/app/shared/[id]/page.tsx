'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  BookmarkIcon,
  CalendarDaysIcon,
  ClockIcon,
  CopyIcon,
  EyeIcon,
  FlagIcon,
  LinkIcon,
  MapPinIcon,
  ShareIcon,
  TrainFrontIcon,
  UsersIcon,
  WalletIcon,
  XIcon,
} from 'lucide-react'
import { Wordmark } from '@/components/logo'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { featuredTrip, itinerary, money } from '@/lib/data'
import { cn } from '@/lib/utils'

const cityAccent: Record<string, string> = {
  Paris: 'bg-brand',
  Amsterdam: 'bg-success',
  Berlin: 'bg-warning',
}

export default function SharedItineraryPage() {
  const [saved, setSaved] = useState(false)
  const [showInvite, setShowInvite] = useState(true)
  const totalActivities = itinerary.reduce((sum, d) => sum + d.activities.length, 0)

  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-4xl items-center gap-3 px-4 sm:px-6">
          <Link href="/">
            <Wordmark />
          </Link>
          <Badge variant="secondary" className="ml-1 hidden sm:flex">
            Read-only itinerary
          </Badge>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setSaved((v) => !v)}>
              <BookmarkIcon
                data-icon="inline-start"
                className={cn(saved && 'fill-brand text-brand')}
              />
              {saved ? 'Saved' : 'Save'}
            </Button>
            <Button size="sm" render={<Link href="/register" />}>
              <CopyIcon data-icon="inline-start" />
              Copy this trip
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-8 sm:px-6">
        <section className="overflow-hidden rounded-3xl border border-border bg-card">
          <Image
            src={featuredTrip.cover || '/placeholder.svg'}
            alt={`Cover photo for ${featuredTrip.name}`}
            width={1280}
            height={720}
            className="h-56 w-full object-cover sm:h-72"
            priority
          />
          <div className="flex flex-col gap-5 p-5 sm:p-7">
            <div className="flex items-center gap-3">
              <Avatar className="size-10">
                <AvatarFallback className="bg-brand-soft text-sm font-semibold text-brand">
                  YM
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">Yash Mehta</p>
                <p className="text-xs text-muted-foreground">
                  Planned 12 trips · Ahmedabad, India
                </p>
              </div>
              <span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                <EyeIcon className="size-3.5" aria-hidden="true" />
                2,418 views
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <h1 className="text-balance font-display text-3xl font-bold text-ink sm:text-4xl">
                {featuredTrip.name}
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {featuredTrip.summary}
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                [MapPinIcon, 'Route', featuredTrip.cities.join(' → ')],
                [CalendarDaysIcon, 'Dates', featuredTrip.dateLabel],
                [ClockIcon, 'Duration', `${itinerary.length} days`],
                [WalletIcon, 'Estimated', money(featuredTrip.estimated)],
              ].map(([Icon, label, value]) => {
                const IconComponent = Icon as typeof MapPinIcon
                return (
                  <div key={label as string} className="rounded-xl border border-border p-3">
                    <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                      {label as string}
                    </dt>
                    <dd className="mt-1 flex items-start gap-1.5 text-sm font-semibold text-ink">
                      <IconComponent className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                      {value as string}
                    </dd>
                  </div>
                )
              })}
            </dl>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">
                <UsersIcon data-icon="inline-start" />
                {featuredTrip.travellers} travellers
              </Badge>
              <Badge variant="secondary">{featuredTrip.style} style</Badge>
              <Badge variant="secondary">{totalActivities} activities</Badge>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button render={<Link href="/register" />}>
                <CopyIcon data-icon="inline-start" />
                Copy this trip
              </Button>
              <Button variant="outline">
                <ShareIcon data-icon="inline-start" />
                Share
              </Button>
              <Button variant="outline">
                <LinkIcon data-icon="inline-start" />
                Copy link
              </Button>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-border bg-card">
          <Image
            src="/images/map-preview.png"
            alt={`Map preview of the route through ${featuredTrip.cities.join(', ')}`}
            width={1280}
            height={720}
            className="h-52 w-full object-cover"
          />
          <ul className="flex flex-wrap gap-2 p-4">
            {featuredTrip.cities.map((city, index) => (
              <li key={city}>
                <Badge variant="outline">
                  {index + 1}. {city}
                </Badge>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-display text-xl font-bold text-ink">Day by day</h2>
          <ol className="flex flex-col">
            {itinerary.map((day, index) => {
              const newCity = index === 0 || itinerary[index - 1].city !== day.city
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

                  <div className="ml-1.5 flex flex-col gap-2 border-l-2 border-border pb-6 pl-5">
                    <header className="flex flex-wrap items-baseline gap-2">
                      <h4 className="font-display text-sm font-bold text-ink">{day.label}</h4>
                      <span className="text-xs text-muted-foreground">{day.date}</span>
                    </header>
                    {day.activities.map((a) => (
                      <article
                        key={a.id}
                        className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-xl border border-border bg-background p-3"
                      >
                        <span className="tabular w-12 text-sm font-bold text-ink">{a.time}</span>
                        <span className="text-sm font-semibold text-ink">{a.title}</span>
                        <Badge variant="secondary" className="ml-auto">
                          {a.category}
                        </Badge>
                        <span className="w-full text-xs text-muted-foreground">
                          {a.duration} · {a.location} ·{' '}
                          {a.cost === 0 ? 'Free' : money(a.cost)}
                        </span>
                      </article>
                    ))}
                  </div>
                </li>
              )
            })}
          </ol>
        </section>

        <section className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-sand/60 p-4">
          <p className="min-w-0 flex-1 text-sm text-muted-foreground">
            Personal notes, bookings and exact expenses stay private to the creator.
          </p>
          <Button variant="ghost" size="sm">
            <FlagIcon data-icon="inline-start" />
            Report this itinerary
          </Button>
        </section>
      </main>

      {showInvite && (
        <div className="sticky bottom-0 z-20 border-t border-border bg-card/95 backdrop-blur">
          <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
            <p className="min-w-0 flex-1 text-sm text-ink">
              Like this plan? Copy it into your own account and edit every day.
            </p>
            <Button size="sm" render={<Link href="/register" />}>
              Create a free account
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Dismiss sign-up invitation"
              onClick={() => setShowInvite(false)}
            >
              <XIcon />
            </Button>
          </div>
        </div>
      )}

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-4xl flex-col gap-2 px-4 py-8 sm:flex-row sm:items-center sm:px-6">
          <Wordmark />
          <p className="text-sm text-muted-foreground sm:ml-auto">
            Shared with GlobeTrotter · Read-only view
          </p>
        </div>
      </footer>
    </div>
  )
}
