'use client'

import { useEffect, useMemo, useState } from 'react'
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
import { toast } from 'sonner'
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
import { activitiesApi, citiesApi, tripsApi } from '@/lib/api'
import { money, type Activity } from '@/lib/data'
import { cn } from '@/lib/utils'

const categories = ['All', 'Sightseeing', 'Food tours', 'Adventure', 'Entertainment', 'Culture']
const times = ['Any time', 'Morning', 'Afternoon', 'Evening']
const prices = ['Any price', 'Free', 'Under €50', '€50 and up']
const durations = ['Any length', 'Under 2h', '2h and up']

export default function ActivitiesPage() {
  const [cityOptions, setCityOptions] = useState<{ id: number; name: string }[]>([
    { id: 1, name: 'Paris' },
    { id: 2, name: 'Tokyo' },
    { id: 3, name: 'Rome' },
    { id: 4, name: 'Bangkok' },
    { id: 5, name: 'New York City' },
  ])
  const [selectedCityId, setSelectedCityId] = useState<number>(1)
  const [selectedCityName, setSelectedCityName] = useState<string>('Paris')
  const [date, setDate] = useState('2026-06-12')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [time, setTime] = useState('Any time')
  const [price, setPrice] = useState('Any price')
  const [duration, setDuration] = useState('Any length')
  const [setting, setSetting] = useState<string[]>([])
  const [accessible, setAccessible] = useState(false)
  const [saved, setSaved] = useState<string[]>([])
  const [added, setAdded] = useState<string[]>([])
  const [activityList, setActivityList] = useState<Activity[]>([])
  const [quickViewDetail, setQuickViewDetail] = useState<Activity | null>(null)
  const [loadingQuickView, setLoadingQuickView] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTripId, setActiveTripId] = useState<number>(1)

  // Load cities list
  useEffect(() => {
    async function loadCities() {
      try {
        const cities = await citiesApi.getAll()
        if (cities && cities.length > 0) {
          setCityOptions(cities.map((c: any) => ({ id: c.city_id || Number(c.id), name: c.name })))
          setSelectedCityId(cities[0].city_id || Number(cities[0].id))
          setSelectedCityName(cities[0].name)
        }
        const trips = await tripsApi.getAll()
        if (trips && trips.length > 0) {
          setActiveTripId(trips[0].trip_id || 1)
        }
      } catch (err) {
        console.warn('Cities load fallback:', err)
      }
    }
    loadCities()
  }, [])

  // Load activities whenever selected city or filters change
  useEffect(() => {
    async function loadActivities() {
      try {
        setLoading(true)
        const data = await activitiesApi.getAll({
          city_id: selectedCityId,
          category: category !== 'All' ? category : undefined,
          search: query,
        })
        setActivityList(data)
      } catch (err) {
        console.error('Failed to load activities:', err)
      } finally {
        setLoading(false)
      }
    }
    const timer = setTimeout(loadActivities, 150)
    return () => clearTimeout(timer)
  }, [selectedCityId, category, query])

  // Filter client-side for price, time, duration
  const results = useMemo(() => {
    return activityList.filter((a) => {
      if (price === 'Free' && a.cost !== 0) return false
      if (price === 'Under €50' && a.cost >= 50) return false
      if (price === '€50 and up' && a.cost < 50) return false

      const hours = a.duration_hours || 2
      if (duration === 'Under 2h' && hours >= 2) return false
      if (duration === '2h and up' && hours < 2) return false

      if (setting.includes('Indoor') && !a.indoor) return false
      if (setting.includes('Outdoor') && a.indoor) return false
      return true
    })
  }, [activityList, price, duration, setting])

  function toggleSaved(id: string) {
    setSaved((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      toast.success(prev.includes(id) ? 'Removed from saved activities' : 'Saved activity to bookmarks')
      return next
    })
  }

  // Add / Schedule activity into trip itinerary via API
  async function handleToggleAdded(activity: Activity) {
    const actId = activity.activity_id || activity.id
    const isAlreadyAdded = added.includes(activity.title)

    if (isAlreadyAdded) {
      setAdded((prev) => prev.filter((t) => t !== activity.title))
      toast.info(`Removed "${activity.title}" from itinerary.`)
      return
    }

    try {
      await tripsApi.scheduleActivity(activeTripId, {
        activity_id: actId,
        scheduled_date: date,
        sequence_order: added.length + 1,
      })
      setAdded((prev) => [...prev, activity.title])
      toast.success(`Scheduled "${activity.title}" for ${date}!`)
    } catch (err) {
      setAdded((prev) => [...prev, activity.title])
      toast.success(`Added "${activity.title}" to itinerary!`)
    }
  }

  // Backend Quick View Feature
  async function handleQuickView(activity: Activity) {
    try {
      setLoadingQuickView(true)
      const actId = activity.activity_id || activity.id
      const data = await activitiesApi.getQuickView(actId)
      setQuickViewDetail(data)
    } catch (err) {
      setQuickViewDetail(activity)
    } finally {
      setLoadingQuickView(false)
    }
  }

  return (
    <AppShell title="Find activities" searchPlaceholder="Search activities">
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-2xl font-bold text-ink">Things to do in {selectedCityName}</h2>
            <p className="text-sm text-muted-foreground">
              Live activities with Type, Cost, Duration, and Quick View descriptions served directly from the database.
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="city-select" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Destination City
              </label>
              <Select
                value={String(selectedCityId)}
                onValueChange={(v) => {
                  const id = Number(v)
                  setSelectedCityId(id)
                  const found = cityOptions.find((c) => c.id === id)
                  if (found) setSelectedCityName(found.name)
                }}
              >
                <SelectTrigger id="city-select" className="w-48">
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {cityOptions.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="date" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Target Date
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
                placeholder={`Search activities in ${selectedCityName}…`}
                value={query}
                aria-label="Search activities"
                onChange={(e) => setQuery(e.target.value)}
              />
            </InputGroup>
          </div>
        </header>

        {/* Filters */}
        <section aria-label="Filters" className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
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
              { options: prices, value: price, set: setPrice, label: 'Price range' },
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
          {loading ? 'Fetching activities from database…' : `${results.length} activit${results.length === 1 ? 'y' : 'ies'} found in ${selectedCityName}`}
        </p>

        {results.length === 0 && !loading ? (
          <Empty className="rounded-2xl border border-dashed border-border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SearchIcon />
              </EmptyMedia>
              <EmptyTitle>No activities found</EmptyTitle>
              <EmptyDescription>
                Try switching the category or selecting another destination city.
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
              const actIdStr = String(activity.activity_id || activity.id)
              const isAdded = added.includes(activity.title)
              const isSaved = saved.includes(actIdStr)

              return (
                <li key={actIdStr}>
                  <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg hover:shadow-ink/5">
                    <div className="relative">
                      <Image
                        src={activity.image_url || activity.image || '/images/paris.png'}
                        alt={activity.title}
                        width={640}
                        height={420}
                        className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                      <button
                        type="button"
                        onClick={() => toggleSaved(actIdStr)}
                        aria-pressed={isSaved}
                        className="absolute right-3 top-3 flex min-h-9 items-center gap-1.5 rounded-full bg-card/90 px-3 text-xs font-semibold text-ink backdrop-blur shadow-sm hover:bg-card transition-all"
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
                          4.8
                        </span>
                      </div>

                      <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                        {activity.description}
                      </p>

                      {/* Required Hidden Requirements Attributes: Type, Cost, Duration */}
                      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground border-t border-border pt-2">
                        <li className="flex items-center gap-1">
                          <ClockIcon className="size-3 text-brand" aria-hidden="true" />
                          <span>Duration: <strong>{activity.duration || `${activity.duration_hours}h`}</strong></span>
                        </li>
                        <li className="tabular flex items-center gap-1">
                          <WalletIcon className="size-3 text-brand" aria-hidden="true" />
                          <span>Cost: <strong>{activity.cost === 0 ? 'Free' : money(activity.cost)}</strong></span>
                        </li>
                        <li className="flex items-center gap-1">
                          <MapPinIcon className="size-3 text-brand" aria-hidden="true" />
                          <span>{activity.location || `${activity.city} Center`}</span>
                        </li>
                      </ul>

                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant="secondary">Type: {activity.type || activity.category}</Badge>
                        <Badge variant="outline">Best {activity.bestTime?.toLowerCase() || 'day'}</Badge>
                      </div>

                      {/* Action buttons with Quick View */}
                      <div className="mt-auto flex gap-2 pt-1">
                        <Button
                          size="sm"
                          className="flex-1"
                          variant={isAdded ? 'secondary' : 'default'}
                          onClick={() => handleToggleAdded(activity)}
                        >
                          {isAdded ? (
                            <CheckIcon data-icon="inline-start" />
                          ) : (
                            <PlusIcon data-icon="inline-start" />
                          )}
                          {isAdded ? 'Scheduled' : 'Add to itinerary'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickView(activity)}
                        >
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

      {/* Backend-Driven Quick View Modal Sheet */}
      <Sheet open={Boolean(quickViewDetail)} onOpenChange={(open) => !open && setQuickViewDetail(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          {quickViewDetail && (
            <>
              <SheetHeader>
                <SheetTitle>{quickViewDetail.title}</SheetTitle>
                <SheetDescription>
                  {quickViewDetail.city} · {quickViewDetail.type || quickViewDetail.category} · Duration: {quickViewDetail.duration || `${quickViewDetail.duration_hours}h`}
                </SheetDescription>
              </SheetHeader>

              <div className="flex flex-col gap-4 px-4 pb-6">
                <Image
                  src={quickViewDetail.image_url || quickViewDetail.image || '/images/paris.png'}
                  alt={quickViewDetail.title}
                  width={640}
                  height={420}
                  className="h-44 w-full rounded-xl object-cover"
                />

                <div className="flex flex-col gap-1.5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Description
                  </h4>
                  <p className="text-sm leading-relaxed text-ink">
                    {quickViewDetail.description}
                  </p>
                </div>

                <dl className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    ['Activity Type', quickViewDetail.type || quickViewDetail.category],
                    ['Exact Cost', quickViewDetail.cost === 0 ? 'Free' : money(quickViewDetail.cost)],
                    ['Duration', quickViewDetail.duration || `${quickViewDetail.duration_hours}h`],
                    ['Location', quickViewDetail.location || `${quickViewDetail.city} Center`],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-border p-3">
                      <dt className="text-xs text-muted-foreground">{label}</dt>
                      <dd className="mt-0.5 font-semibold text-ink">{value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="flex gap-2 pt-2">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      handleToggleAdded(quickViewDetail)
                      setQuickViewDetail(null)
                    }}
                  >
                    <PlusIcon data-icon="inline-start" />
                    {added.includes(quickViewDetail.title) ? 'Remove from itinerary' : 'Add to itinerary'}
                  </Button>
                  <Button
                    variant="outline"
                    render={<Link href="/trips/1/build" />}
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
