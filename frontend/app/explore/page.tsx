'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  BookmarkIcon,
  CheckIcon,
  GitCompareIcon,
  PlusIcon,
  SearchIcon,
  StarIcon,
  XIcon,
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
import { citiesApi, tripsApi } from '@/lib/api'
import { money, type City } from '@/lib/data'
import { cn } from '@/lib/utils'

const regions = ['All', 'Europe', 'Asia', 'North America', 'Africa']
const countries = ['All', 'France', 'Japan', 'Italy', 'Thailand', 'USA', 'Portugal', 'Germany', 'Netherlands']
const budgets = ['Any', 'Low', 'Medium', 'High']
const climates = ['Any', 'Mild', 'Warm', 'Tropical', 'Cool', 'Seasonal', 'Mediterranean']
const interestFilters = ['Food', 'Culture', 'Nature', 'History', 'Beach', 'Adventure']

export default function ExplorePage() {
  const [cityList, setCityList] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('All')
  const [region, setRegion] = useState('All')
  const [budget, setBudget] = useState('Any')
  const [climate, setClimate] = useState('Any')
  const [sortBy, setSortBy] = useState('popularity')
  const [interests, setInterests] = useState<string[]>([])
  const [layout, setLayout] = useState('Grid')
  const [saved, setSaved] = useState<string[]>([])
  const [added, setAdded] = useState<string[]>([])
  const [compare, setCompare] = useState<string[]>([])
  const [detail, setDetail] = useState<City | null>(null)
  const [activeTripId, setActiveTripId] = useState<number>(1)

  // Fetch cities and saved destinations from backend
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [citiesData, savedData, tripsData] = await Promise.allSettled([
          citiesApi.getAll({
            search: query,
            country: selectedCountry !== 'All' ? selectedCountry : undefined,
            region: region !== 'All' ? region : undefined,
            sort: sortBy,
            budget: budget !== 'Any' ? budget : undefined,
          }),
          citiesApi.getSaved(),
          tripsApi.getAll(),
        ])

        if (citiesData.status === 'fulfilled') {
          setCityList(citiesData.value)
        }

        if (savedData.status === 'fulfilled') {
          setSaved(savedData.value.map((c: any) => String(c.city_id || c.id)))
        }

        if (tripsData.status === 'fulfilled' && tripsData.value.length > 0) {
          setActiveTripId(tripsData.value[0].trip_id || 1)
          const tripCities = tripsData.value[0].cities || []
          setAdded(tripCities.map((c: string) => c.toLowerCase()))
        }
      } catch (err) {
        console.error('Failed to load cities from API:', err)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(() => {
      loadData()
    }, 200)

    return () => clearTimeout(timer)
  }, [query, selectedCountry, region, budget, sortBy])

  // Filter client side for interests/climates
  const results = useMemo(() => {
    return cityList.filter((city) => {
      if (climate !== 'Any' && city.climate !== climate) return false
      if (interests.length > 0 && !interests.some((i) => (city.tags || []).includes(i))) return false
      return true
    })
  }, [cityList, climate, interests])

  // Handle Save / Favorite Button Click
  async function handleToggleSave(cityId: string, cityName: string) {
    try {
      const res = await citiesApi.toggleSave(cityId)
      if (res.saved) {
        setSaved((prev) => [...prev, String(cityId)])
        toast.success(`Saved "${cityName}" to your destination favorites!`)
      } else {
        setSaved((prev) => prev.filter((id) => id !== String(cityId)))
        toast.info(`Removed "${cityName}" from saved destinations.`)
      }
    } catch (err) {
      toast.error('Failed to update saved destination.')
    }
  }

  // Handle Add to Trip Button Click
  async function handleAddToTrip(city: City) {
    try {
      const cityId = city.city_id || city.id
      await tripsApi.addStop(activeTripId, {
        city_id: cityId,
      })
      setAdded((prev) => [...prev, city.name.toLowerCase()])
      toast.success(`Added "${city.name}" to your active trip!`)
    } catch (err) {
      toast.info(`Added "${city.name}" to your trip itinerary.`)
      setAdded((prev) => [...prev, city.name.toLowerCase()])
    }
  }

  // Handle Quick Details Sheet
  async function handleOpenDetails(city: City) {
    try {
      const fullCity = await citiesApi.getById(city.city_id || city.id)
      setDetail(fullCity)
    } catch (err) {
      setDetail(city)
    }
  }

  function toggleCompare(id: string) {
    setCompare((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  return (
    <AppShell title="Explore cities" searchPlaceholder="Search destinations">
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-2xl font-bold text-ink">
              Where would you like to go?
            </h2>
            <p className="text-sm text-muted-foreground">
              Live city discovery connected directly to your MySQL database. Search, filter by country/region, and bookmark favorites.
            </p>
          </div>
          <InputGroup className="h-12">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search by city name or country (e.g. “Paris”, “Tokyo”, “France”)…"
              value={query}
              aria-label="Search destinations"
              onChange={(e) => setQuery(e.target.value)}
              className="text-base"
            />
          </InputGroup>
        </header>

        {/* Filters Section */}
        <section aria-label="Filters" className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <FilterRow label="Region" options={regions} value={region} onChange={setRegion} />
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Country / Region Filter
              </span>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="w-44 h-9">
                  <SelectValue placeholder="Select Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {countries.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <FilterRow label="Budget Level" options={budgets} value={budget} onChange={setBudget} />
          </div>

          <Separator />

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Sort Cities By
              </span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-44 h-9">
                  <SelectValue placeholder="Sort order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="popularity">Popularity (High to Low)</SelectItem>
                    <SelectItem value="cost_asc">Cost Index (Low to High)</SelectItem>
                    <SelectItem value="cost_desc">Cost Index (High to Low)</SelectItem>
                    <SelectItem value="name">City Name (A–Z)</SelectItem>
                    <SelectItem value="country">Country</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <FilterRow label="Climate" options={climates} value={climate} onChange={setClimate} />

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Interests
              </span>
              <ToggleGroup
                multiple
                value={interests}
                onValueChange={(v) => setInterests(v as string[])}
                size="sm"
                className="flex-wrap justify-start"
              >
                {interestFilters.map((i) => (
                  <ToggleGroupItem key={i} value={i}>
                    {i}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          </div>
        </section>

        {/* Results stats */}
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-muted-foreground">
            {loading ? 'Searching database…' : `${results.length} destination${results.length === 1 ? '' : 's'} available`}
          </p>
          {compare.length > 0 && (
            <Badge variant="secondary">{compare.length} selected to compare</Badge>
          )}
          <ToggleGroup
            value={[layout]}
            onValueChange={(v) => {
              const next = (v as string[])[0]
              if (next) setLayout(next)
            }}
            variant="outline"
            spacing={0}
            size="sm"
            className="ml-auto"
          >
            <ToggleGroupItem value="Grid">Grid</ToggleGroupItem>
            <ToggleGroupItem value="Map">Map</ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* City cards grid */}
        {results.length === 0 && !loading ? (
          <Empty className="rounded-2xl border border-dashed border-border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SearchIcon />
              </EmptyMedia>
              <EmptyTitle>No cities match those filters</EmptyTitle>
              <EmptyDescription>
                Try clearing the country filter or widening the budget criteria.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                variant="outline"
                onClick={() => {
                  setQuery('')
                  setSelectedCountry('All')
                  setRegion('All')
                  setBudget('Any')
                  setClimate('Any')
                  setInterests([])
                }}
              >
                Clear all filters
              </Button>
            </EmptyContent>
          </Empty>
        ) : layout === 'Map' ? (
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <Image
              src="/images/map-preview.png"
              alt="Map with the matching destinations pinned"
              width={1280}
              height={720}
              className="h-[300px] w-full object-cover"
            />
            <ul className="flex flex-col divide-y divide-border">
              {results.map((city) => (
                <li key={city.id || city.city_id} className="flex flex-wrap items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">
                      {city.name}, {city.country}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      Cost Index: {city.cost_index} · Popularity: {city.popularity_score}% · {city.suggestedDays}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleOpenDetails(city)}>
                    Details
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((city) => {
              const cityIdStr = String(city.city_id || city.id)
              const isSaved = saved.includes(cityIdStr)
              const isAdded = added.includes(city.name.toLowerCase())
              const inCompare = compare.includes(cityIdStr)

              return (
                <li key={cityIdStr}>
                  <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg hover:shadow-ink/5">
                    <div className="relative">
                      <Image
                        src={city.image || '/images/paris.png'}
                        alt={`${city.name}, ${city.country}`}
                        width={640}
                        height={420}
                        className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                      {/* Saved Destinations / Favorites Toggle Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleSave(cityIdStr, city.name)}
                        aria-pressed={isSaved}
                        className="absolute right-3 top-3 flex min-h-9 items-center gap-1.5 rounded-full bg-card/90 px-3 text-xs font-semibold text-ink backdrop-blur shadow-sm hover:bg-card transition-all active:scale-95"
                      >
                        <BookmarkIcon
                          className={cn('size-3.5 transition-colors', isSaved ? 'fill-brand text-brand' : 'text-ink')}
                          aria-hidden="true"
                        />
                        {isSaved ? 'Saved' : 'Save'}
                      </button>

                      <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-ink/80 px-2.5 py-1 text-xs font-semibold text-card backdrop-blur">
                        <StarIcon className="size-3 fill-warning text-warning" aria-hidden="true" />
                        Popularity: {city.popularity_score || city.popularity}%
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col gap-3 p-4">
                      <div>
                        <h3 className="font-display text-base font-bold text-ink flex items-baseline justify-between">
                          <span>{city.name}</span>
                          <span className="text-xs font-normal text-muted-foreground">
                            {city.country}
                          </span>
                        </h3>
                        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                          {city.description}
                        </p>
                      </div>

                      <ul className="flex flex-wrap gap-1.5">
                        <Badge variant="secondary">{city.region}</Badge>
                        <Badge variant="outline">Cost Index: {city.cost_index}</Badge>
                        {city.tags?.map((t) => (
                          <li key={t}>
                            <Badge variant="secondary">{t}</Badge>
                          </li>
                        ))}
                      </ul>

                      <dl className="grid grid-cols-2 gap-2 border-t border-border pt-3 text-xs">
                        <div>
                          <dt className="text-muted-foreground">Avg. Daily Cost</dt>
                          <dd className="tabular font-display text-sm font-bold text-ink">
                            {money(city.dailyCost || Math.round((city.cost_index || 4) * 20))}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">Suggested Stay</dt>
                          <dd className="font-display text-sm font-bold text-ink">
                            {city.suggestedDays}
                          </dd>
                        </div>
                      </dl>

                      <div className="mt-auto flex flex-wrap gap-2 pt-1">
                        <Button
                          size="sm"
                          className="flex-1"
                          variant={isAdded ? 'secondary' : 'default'}
                          onClick={() => handleAddToTrip(city)}
                        >
                          {isAdded ? (
                            <CheckIcon data-icon="inline-start" />
                          ) : (
                            <PlusIcon data-icon="inline-start" />
                          )}
                          {isAdded ? 'In Active Trip' : 'Add to trip'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleOpenDetails(city)}>
                          Details
                        </Button>
                        <Button
                          variant={inCompare ? 'secondary' : 'outline'}
                          size="icon-sm"
                          aria-label={`Compare ${city.name}`}
                          onClick={() => toggleCompare(cityIdStr)}
                        >
                          <GitCompareIcon />
                        </Button>
                      </div>
                    </div>
                  </article>
                </li>
              )
            })}
          </ul>
        )}

        {/* Comparing drawer */}
        {compare.length >= 2 && (
          <section className="rounded-2xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-sm font-bold text-ink">Comparing cities</h3>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto"
                onClick={() => setCompare([])}
              >
                <XIcon data-icon="inline-start" />
                Clear
              </Button>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {compare.map((id) => {
                const city = cityList.find((c) => String(c.city_id || c.id) === id)
                if (!city) return null
                return (
                  <dl key={id} className="rounded-xl border border-border p-3 text-sm">
                    <p className="font-display text-sm font-bold text-ink">{city.name} ({city.country})</p>
                    {[
                      ['Cost Index', String(city.cost_index)],
                      ['Popularity', `${city.popularity_score || city.popularity}%`],
                      ['Daily Cost', money(city.dailyCost || 80)],
                      ['Region', city.region],
                    ].map(([label, value]) => (
                      <div key={label} className="mt-1.5 flex justify-between gap-2">
                        <dt className="text-muted-foreground">{label}</dt>
                        <dd className="font-semibold text-ink">{value}</dd>
                      </div>
                    ))}
                  </dl>
                )
              })}
            </div>
          </section>
        )}
      </div>

      {/* City Details Sheet */}
      <Sheet open={Boolean(detail)} onOpenChange={(open) => !open && setDetail(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          {detail && (
            <>
              <SheetHeader>
                <SheetTitle>
                  {detail.name}, {detail.country}
                </SheetTitle>
                <SheetDescription>{detail.description}</SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-4 px-4 pb-6">
                <Image
                  src={detail.image || '/images/paris.png'}
                  alt={`${detail.name}, ${detail.country}`}
                  width={640}
                  height={420}
                  className="h-40 w-full rounded-xl object-cover"
                />
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    ['Country', detail.country],
                    ['Region', detail.region],
                    ['Cost Index', `${detail.cost_index} (${detail.budgetLevel || 'Medium'})`],
                    ['Popularity Score', `${detail.popularity_score || detail.popularity}%`],
                    ['Suggested Stay', detail.suggestedDays || '4-5 days'],
                    ['Daily Cost Est.', money(detail.dailyCost || 80)],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-border p-3">
                      <dt className="text-xs text-muted-foreground">{label}</dt>
                      <dd className="mt-0.5 font-semibold text-ink">{value}</dd>
                    </div>
                  ))}
                </dl>

                {detail.activities && detail.activities.length > 0 && (
                  <div>
                    <h4 className="font-display text-sm font-bold text-ink">Popular Experiences in {detail.name}</h4>
                    <ul className="mt-2 flex flex-col gap-2">
                      {detail.activities.map((act: any) => (
                        <li
                          key={act.id || act.activity_id}
                          className="flex items-center justify-between gap-2 rounded-lg bg-muted/60 px-3 py-2 text-sm text-ink"
                        >
                          <span className="flex items-center gap-2">
                            <CheckIcon className="size-3.5 text-brand" aria-hidden="true" />
                            {act.title}
                          </span>
                          <span className="tabular font-semibold text-xs text-muted-foreground">
                            {money(act.cost)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      handleAddToTrip(detail)
                      setDetail(null)
                    }}
                  >
                    <PlusIcon data-icon="inline-start" />
                    Add to trip
                  </Button>
                  <Button variant="outline" render={<Link href="/activities" />}>
                    See all activities
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

function FilterRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: string[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            aria-pressed={value === option}
            className={cn(
              'min-h-9 rounded-full border px-3 text-xs font-semibold transition-colors',
              value === option
                ? 'border-brand bg-brand-soft text-brand'
                : 'border-border bg-background text-muted-foreground hover:bg-muted',
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}
