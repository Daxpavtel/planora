'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  BookmarkIcon,
  CalendarDaysIcon,
  CheckIcon,
  ClockIcon,
  MapPinIcon,
  PlusIcon,
  SearchIcon,
  StarIcon,
  WalletIcon,
} from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { activities, itinerary, money, type Activity } from '@/lib/data'
import { cn } from '@/lib/utils'

const categories = ['All', 'Sightseeing', 'Heritage', 'Food', 'Culture', 'Spiritual', 'Adventure', 'Nature']
const times = ['Any time', 'Morning', 'Afternoon', 'Evening']
const prices = ['Any price', 'Free', 'Under ₹500', '₹500 and up']
const durations = ['Any length', 'Under 2h', '2h and up']

export default function ActivitiesPage() {
  const cityOptions = useMemo(
    () => ['All Cities', ...new Set(activities.map((a) => a.city))],
    [],
  )
  const [city, setCity] = useState('All Cities')
  const [date, setDate] = useState('2026-10-15')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [time, setTime] = useState('Any time')
  const [price, setPrice] = useState('Any price')
  const [duration, setDuration] = useState('Any length')
  const [setting, setSetting] = useState<string[]>([])
  const [accessible, setAccessible] = useState(false)
  const [saved, setSaved] = useState<string[]>([])
  const [added, setAdded] = useState<string[]>(
    itinerary.flatMap((d) => d.activities.map((a) => a.title)),
  )
  const [detail, setDetail] = useState<Activity | null>(null)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return activities.filter((a) => {
      if (city !== 'All Cities' && a.city !== city) return false
      if (q && !`${a.title} ${a.description} ${a.category} ${a.city}`.toLowerCase().includes(q)) return false
      if (category !== 'All' && a.category !== category) return false
      if (time !== 'Any time' && a.bestTime !== time) return false
      if (price === 'Free' && a.cost !== 0) return false
      if (price === 'Under ₹500' && a.cost >= 500) return false
      if (price === '₹500 and up' && a.cost < 500) return false
      const minutes =
        (/(\d+)h/.exec(a.duration) ? Number(/(\d+)h/.exec(a.duration)![1]) * 60 : 0) +
        (/(\d+)m/.exec(a.duration) ? Number(/(\d+)m/.exec(a.duration)![1]) : 0)
      if (duration === 'Under 2h' && minutes >= 120) return false
      if (duration === '2h and up' && minutes < 120) return false
      if (setting.includes('Indoor') && !a.indoor) return false
      if (setting.includes('Outdoor') && a.indoor) return false
      return true
    })
  }, [city, query, category, time, price, duration, setting])

  function toggleSaved(id: string) {
    setSaved((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  function toggleAdded(title: string) {
    setAdded((prev) => (prev.includes(title) ? prev.filter((x) => x !== title) : [...prev, title]))
  }

  return (
    <AppShell title="Find activities" searchPlaceholder="Search activities">
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-2xl font-bold text-ink">Things to do in {city}</h2>
            <p className="text-sm text-muted-foreground">
              Suggestions for your selected day. Adding one drops it straight into the builder.
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="city-select" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Destination
              </label>
              <Select value={city} onValueChange={(v) => setCity(v as string)}>
                <SelectTrigger id="city-select" className="w-44">
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {cityOptions.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="date" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Date
              </label>
              <InputGroup className="w-44">
                <InputGroupAddon>
                  <CalendarDaysIcon />
                </InputGroupAddon>
                <InputGroupInput
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </InputGroup>
            </div>
            <InputGroup className="min-w-0 flex-1 basis-64">
              <InputGroupAddon>
                <SearchIcon />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Search activities in this city…"
                value={query}
                aria-label="Search activities"
                onChange={(e) => setQuery(e.target.value)}
              />
            </InputGroup>
          </div>
        </header>

        <section
          aria-label="Filters"
          className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4"
        >
          <ToggleGroup
            value={[category]}
            onValueChange={(v) => {
              const next = (v as string[])[0]
              if (next) setCategory(next)
            }}
            size="sm"
            className="flex-wrap justify-start"
          >
            {categories.map((c) => (
              <ToggleGroupItem key={c} value={c}>
                {c}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          <Separator />

          <div className="flex flex-wrap items-center gap-2">
            {[
              { options: times, value: time, set: setTime, label: 'Time of day' },
              { options: prices, value: price, set: setPrice, label: 'Price' },
              { options: durations, value: duration, set: setDuration, label: 'Duration' },
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

            <ToggleGroup
              multiple
              value={setting}
              onValueChange={(v) => setSetting(v as string[])}
              size="sm"
              variant="outline"
            >
              <ToggleGroupItem value="Indoor">Indoor</ToggleGroupItem>
              <ToggleGroupItem value="Outdoor">Outdoor</ToggleGroupItem>
            </ToggleGroup>

            <Button
              variant={accessible ? 'secondary' : 'outline'}
              size="sm"
              aria-pressed={accessible}
              onClick={() => setAccessible((v) => !v)}
            >
              Step-free access
            </Button>
          </div>
        </section>

        <p className="text-sm text-muted-foreground">
          {results.length} activit{results.length === 1 ? 'y' : 'ies'} for{' '}
          {new Date(date).toLocaleDateString('en-GB', {
            weekday: 'long',
            day: 'numeric',
            month: 'short',
          })}
        </p>

        {results.length === 0 ? (
          <Empty className="rounded-2xl border border-dashed border-border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SearchIcon />
              </EmptyMedia>
              <EmptyTitle>Nothing matches yet</EmptyTitle>
              <EmptyDescription>
                Loosen a filter, or browse another city in this trip.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                variant="outline"
                onClick={() => {
                  setQuery('')
                  setCategory('All')
                  setTime('Any time')
                  setPrice('Any price')
                  setDuration('Any length')
                  setSetting([])
                }}
              >
                Reset filters
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {results.map((activity) => {
              const isAdded = added.includes(activity.title)
              const isSaved = saved.includes(activity.id)
              return (
                <li key={activity.id}>
                  <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg hover:shadow-ink/5">
                    <div className="relative">
                      <Image
                        src={activity.image || '/placeholder.svg'}
                        alt={activity.title}
                        width={640}
                        height={420}
                        className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                      <button
                        type="button"
                        onClick={() => toggleSaved(activity.id)}
                        aria-pressed={isSaved}
                        className="absolute right-3 top-3 flex min-h-9 items-center gap-1.5 rounded-full bg-card/90 px-3 text-xs font-semibold text-ink backdrop-blur"
                      >
                        <BookmarkIcon
                          className={cn('size-3.5', isSaved && 'fill-brand text-brand')}
                          aria-hidden="true"
                        />
                        {isSaved ? 'Saved' : 'Save'}
                      </button>
                      {isAdded && (
                        <Badge className="absolute left-3 top-3 border-0 bg-success text-success-foreground">
                          <CheckIcon data-icon="inline-start" />
                          In itinerary
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col gap-3 p-4">
                      <div className="flex items-start gap-2">
                        <h3 className="font-display text-base font-bold text-ink">
                          {activity.title}
                        </h3>
                        <span className="tabular ml-auto flex shrink-0 items-center gap-1 text-xs font-semibold text-ink">
                          <StarIcon className="size-3 fill-warning text-warning" aria-hidden="true" />
                          {activity.rating}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                        {activity.description}
                      </p>
                      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <li className="flex items-center gap-1">
                          <ClockIcon className="size-3" aria-hidden="true" />
                          {activity.duration}
                        </li>
                        <li className="tabular flex items-center gap-1">
                          <WalletIcon className="size-3" aria-hidden="true" />
                          {activity.cost === 0 ? 'Free' : money(activity.cost)}
                        </li>
                        <li className="flex items-center gap-1">
                          <MapPinIcon className="size-3" aria-hidden="true" />
                          {activity.location}
                        </li>
                      </ul>
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant="secondary">{activity.category}</Badge>
                        <Badge variant="outline">Best {activity.bestTime.toLowerCase()}</Badge>
                        <Badge variant="outline">{activity.indoor ? 'Indoor' : 'Outdoor'}</Badge>
                      </div>
                      <div className="mt-auto flex gap-2 pt-1">
                        <Button
                          size="sm"
                          className="flex-1"
                          variant={isAdded ? 'secondary' : 'default'}
                          onClick={() => toggleAdded(activity.title)}
                        >
                          {isAdded ? (
                            <CheckIcon data-icon="inline-start" />
                          ) : (
                            <PlusIcon data-icon="inline-start" />
                          )}
                          {isAdded ? 'Added' : 'Add to itinerary'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setDetail(activity)}>
                          Quick view
                        </Button>
                      </div>
                    </div>
                  </article>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <Sheet open={Boolean(detail)} onOpenChange={(open) => !open && setDetail(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          {detail && (
            <>
              <SheetHeader>
                <SheetTitle>{detail.title}</SheetTitle>
                <SheetDescription>
                  {detail.city} · {detail.category} · best in the {detail.bestTime.toLowerCase()}
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-4 px-4 pb-6">
                <Image
                  src={detail.image || '/placeholder.svg'}
                  alt={detail.title}
                  width={640}
                  height={420}
                  className="h-40 w-full rounded-xl object-cover"
                />
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {detail.description}
                </p>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    ['Duration', detail.duration],
                    ['Estimated cost', detail.cost === 0 ? 'Free' : money(detail.cost)],
                    ['Location', detail.location],
                    ['Setting', detail.indoor ? 'Indoor' : 'Outdoor'],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-border p-3">
                      <dt className="text-xs text-muted-foreground">{label}</dt>
                      <dd className="mt-0.5 font-semibold text-ink">{value}</dd>
                    </div>
                  ))}
                </dl>
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      toggleAdded(detail.title)
                      setDetail(null)
                    }}
                  >
                    <PlusIcon data-icon="inline-start" />
                    {added.includes(detail.title) ? 'Remove from itinerary' : 'Add to itinerary'}
                  </Button>
                  <Button
                    variant="outline"
                    render={<Link href="/trips/rajasthan-royal-heritage/build" />}
                  >
                    Open builder
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AppShell>
  )
}
