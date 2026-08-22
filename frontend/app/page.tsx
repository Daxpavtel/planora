import Image from 'next/image'
import Link from 'next/link'
import { ArrowRightIcon, CalendarDaysIcon, PiggyBankIcon, RouteIcon } from 'lucide-react'
import { Wordmark } from '@/components/logo'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cities } from '@/lib/data'

const screens = [
  { href: '/login', label: 'Login', n: '01' },
  { href: '/register', label: 'Registration', n: '02' },
  { href: '/dashboard', label: 'Dashboard', n: '03' },
  { href: '/trips/new', label: 'Create new trip', n: '04' },
  { href: '/trips', label: 'My trips', n: '05' },
  { href: '/explore', label: 'City search', n: '06' },
  { href: '/activities', label: 'Activity search', n: '07' },
  { href: '/trips/european-summer-escape/build', label: 'Itinerary builder', n: '08' },
  { href: '/trips/european-summer-escape', label: 'Itinerary + budget', n: '09' },
  { href: '/calendar', label: 'Calendar view', n: '10' },
  { href: '/shared/european-summer-escape', label: 'Public itinerary', n: '11' },
  { href: '/profile', label: 'Profile & settings', n: '12' },
  { href: '/admin', label: 'Admin panel', n: '13' },
]

const pillars = [
  {
    icon: RouteIcon,
    title: 'Multi-city by default',
    body: 'Add stops, reorder them, and let travel legs slot in between cities automatically.',
  },
  {
    icon: CalendarDaysIcon,
    title: 'Days you can actually walk',
    body: 'Morning, afternoon and evening slots with overlap warnings before you commit.',
  },
  {
    icon: PiggyBankIcon,
    title: 'Budget that updates itself',
    body: 'Every activity, stay and train adds to a live per-day and per-city breakdown.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Wordmark />
          <nav className="ml-auto flex items-center gap-2">
            <Button variant="ghost" render={<Link href="/login" />}>
              Log in
            </Button>
            <Button render={<Link href="/register" />}>Create account</Button>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:py-20">
          <div className="flex flex-col items-start gap-6">
            <Badge variant="secondary" className="rounded-full">
              Personalised travel planning
            </Badge>
            <h1 className="text-pretty text-4xl font-extrabold leading-[1.05] text-ink sm:text-5xl lg:text-6xl">
              Plan the whole trip, not just the flights.
            </h1>
            <p className="max-w-xl text-pretty text-base leading-relaxed text-muted-foreground">
              GlobeTrotter turns a vague idea into a day-by-day itinerary — cities, activities,
              travel legs and a budget that adds up as you build. Share it as a public page when
              you&apos;re done.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" render={<Link href="/dashboard" />}>
                Open the dashboard
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
              <Button size="lg" variant="outline" render={<Link href="/shared/european-summer-escape" />}>
                See a shared itinerary
              </Button>
            </div>
            <dl className="mt-2 flex flex-wrap gap-x-8 gap-y-3">
              {[
                ['12 days', 'Longest planned trip'],
                ['3 cities', 'Average per trip'],
                ['€2,840', 'Live budget total'],
              ].map(([value, label]) => (
                <div key={label} className="flex flex-col">
                  <dt className="tabular font-display text-xl font-bold text-ink">{value}</dt>
                  <dd className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-xl shadow-ink/5">
              <Image
                src="/images/paris.png"
                alt="Rooftops of Paris at golden hour"
                width={900}
                height={640}
                className="h-[300px] w-full object-cover sm:h-[420px]"
                priority
              />
              <div className="flex items-center gap-4 p-5">
                <div className="min-w-0">
                  <p className="truncate font-display text-base font-bold text-ink">
                    European Summer Escape
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    Paris · Amsterdam · Berlin — 12 days
                  </p>
                </div>
                <Badge className="ml-auto shrink-0 bg-success-soft text-success">On budget</Badge>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-card">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 py-14 sm:px-6 md:grid-cols-3">
            {pillars.map((p) => (
              <div key={p.title} className="flex flex-col gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <p.icon className="size-5" aria-hidden="true" />
                </span>
                <h2 className="font-display text-lg font-bold text-ink">{p.title}</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold text-ink">Popular right now</h2>
              <p className="text-sm text-muted-foreground">
                Cities travellers are adding to itineraries this month.
              </p>
            </div>
            <Button variant="ghost" render={<Link href="/explore" />}>
              Browse all cities
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          </div>
          <ul className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {cities.slice(0, 4).map((city) => (
              <li key={city.id}>
                <Link
                  href="/explore"
                  className="group block overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg hover:shadow-ink/5"
                >
                  <Image
                    src={city.image || '/placeholder.svg'}
                    alt={`${city.name}, ${city.country}`}
                    width={400}
                    height={300}
                    className="h-32 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                  <div className="p-3">
                    <p className="font-display text-sm font-bold text-ink">{city.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {city.country} · €{city.dailyCost}/day
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-t border-border bg-sand/60">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <Card>
              <CardHeader>
                <CardTitle>All screens in this prototype</CardTitle>
                <CardDescription>
                  Thirteen connected screens, from sign-in through to the admin panel.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {screens.map((s) => (
                    <li key={s.href}>
                      <Link
                        href={s.href}
                        className="flex min-h-11 items-center gap-3 rounded-lg border border-transparent px-3 text-sm font-medium text-ink transition-colors hover:border-border hover:bg-background"
                      >
                        <span className="tabular text-xs font-semibold text-brand">{s.n}</span>
                        {s.label}
                        <ArrowRightIcon className="ml-auto size-4 text-muted-foreground" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 sm:flex-row sm:items-center sm:px-6">
          <Wordmark />
          <p className="text-sm text-muted-foreground sm:ml-auto">
            A trip-planning prototype · Odoo x CHARUSAT hackathon
          </p>
        </div>
      </footer>
    </div>
  )
}
