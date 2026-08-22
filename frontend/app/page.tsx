import Image from 'next/image'
import Link from 'next/link'
import { ArrowRightIcon, CalendarDaysIcon, CompassIcon, PiggyBankIcon, RouteIcon, SparklesIcon } from 'lucide-react'
import { Wordmark } from '@/components/logo'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cities, featuredTrip, money } from '@/lib/data'

const pillars = [
  {
    icon: RouteIcon,
    title: 'Multi-city Indian Itineraries',
    body: 'Add iconic stops across India, reorder them seamlessly, and let Vande Bharat and flight legs slot in automatically.',
  },
  {
    icon: CalendarDaysIcon,
    title: 'Explore Sights & Authentic Food',
    body: 'Morning, afternoon, and evening slots tailored for heritage monuments, sunset boat rides, and legendary food trails.',
  },
  {
    icon: PiggyBankIcon,
    title: 'Live Budget in Rupees (₹)',
    body: 'Every palace visit, heritage stay, and travel leg calculates into a live per-day and per-city breakdown.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Wordmark showTagline />
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
            <Badge variant="secondary" className="rounded-full gap-1.5 px-3 py-1">
              <SparklesIcon className="size-3.5 text-brand" />
              Plan Smarter. Travel Better.
            </Badge>
            <h1 className="text-pretty text-4xl font-extrabold leading-[1.05] text-ink sm:text-5xl lg:text-6xl">
              Plan the whole journey across India, effortlessly.
            </h1>
            <p className="max-w-xl text-pretty text-base leading-relaxed text-muted-foreground">
              Planora turns your dream Indian holiday into a day-by-day itinerary — royal palaces,
              spiritual ghats, serene backwaters, famous street food, and a live budget that balances as you plan.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" render={<Link href="/dashboard" />}>
                Open the dashboard
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
              <Button size="lg" variant="outline" render={<Link href="/explore" />}>
                <CompassIcon data-icon="inline-start" />
                Explore Indian destinations
              </Button>
            </div>
            <dl className="mt-2 flex flex-wrap gap-x-8 gap-y-3">
              {[
                ['12 Indian Cities', 'Curated destinations'],
                ['100% Verified', 'Famous places & foods'],
                ['₹48,500', 'Average trip budget'],
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
                src={featuredTrip.cover}
                alt="Royal Rajasthan & Golden Triangle"
                width={900}
                height={640}
                className="h-[300px] w-full object-cover sm:h-[420px]"
                priority
              />
              <div className="flex items-center gap-4 p-5">
                <div className="min-w-0">
                  <p className="truncate font-display text-base font-bold text-ink">
                    {featuredTrip.name}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {featuredTrip.cities.join(' · ')} — 10 days
                  </p>
                </div>
                <Badge className="ml-auto shrink-0 bg-success-soft text-success">
                  {money(featuredTrip.budget)} Budget
                </Badge>
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
              <h2 className="font-display text-2xl font-bold text-ink">Popular destinations in India</h2>
              <p className="text-sm text-muted-foreground">
                Iconic cities travellers are adding to itineraries this season.
              </p>
            </div>
            <Button variant="ghost" render={<Link href="/explore" />}>
              Browse all 12 cities
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
                    src={city.image}
                    alt={`${city.name}, ${city.country}`}
                    width={400}
                    height={300}
                    className="h-36 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                  <div className="p-3">
                    <p className="font-display text-sm font-bold text-ink">{city.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {city.region} · {money(city.dailyCost)}/day
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-t border-border bg-brand/5 py-14">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 text-center sm:px-6">
            <h2 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">
              Ready to create your perfect itinerary?
            </h2>
            <p className="max-w-xl text-base text-muted-foreground">
              Build a personalized route with famous landmarks, food stops, and activity timers across India.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button size="lg" render={<Link href="/register" />}>
                Get Started Free
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
              <Button size="lg" variant="outline" render={<Link href="/dashboard" />}>
                Go to Dashboard
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 sm:flex-row sm:items-center sm:px-6">
          <Wordmark showTagline />
          <p className="text-sm text-muted-foreground sm:ml-auto">
            Planora · Plan Smarter. Travel Better.
          </p>
        </div>
      </footer>
    </div>
  )
}
