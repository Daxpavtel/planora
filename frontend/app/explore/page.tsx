'use client'

import { useMemo, useState } from 'react'
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
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cities, money, type City } from '@/lib/data'
import { cn } from '@/lib/utils'

const regions = ['All', 'Europe', 'Asia', 'Africa']
const budgets = ['Any', 'Low', 'Medium', 'High']
const climates = ['Any', 'Mild', 'Warm', 'Tropical', 'Cool', 'Seasonal', 'Mediterranean']
const interestFilters = ['Food', 'Culture', 'Nature', 'History', 'Beach', 'Adventure']

const highlights: Record<string, string[]> = {
  lisbon: ['Tram 28 at dawn', 'Time Out Market lunch', 'Belém pastries', 'Day trip to Sintra'],
  kyoto: ['Fushimi Inari at sunrise', 'Nishiki Market', 'Philosopher’s Path', 'Arashiyama bamboo'],
  udaipur: ['Lake Pichola boat', 'City Palace', 'Bagore Ki Haveli show', 'Ranakpur drive'],
  istanbul: ['Bosphorus ferry', 'Kadıköy food walk', 'Basilica Cistern', 'Hammam afternoon'],
  'cape-town': ['Table Mountain hike', 'Bo-Kaap walk', 'Cape Point drive', 'Constantia wines'],
  bali: ['Tegallalang terraces', 'Canggu surf lesson', 'Ubud market', 'Sidemen valley'],
  amsterdam: ['Canal ring cycle', 'Rijksmuseum', 'Noord ferry', 'Vondelpark picnic'],
  berlin: ['East Side Gallery', 'Museum Island', 'Tempelhofer Feld', 'Kreuzberg street food'],
}

export default function ExplorePage() {
  const [query, setQuery] = useState('')
  const [region, setRegion] = useState('All')
  const [budget, setBudget] = useState('Any')
  const [climate, setClimate] = useState('Any')
  const [interests, setInterests] = useState<string[]>([])
  const [layout, setLayout] = useState('Grid')
  const [saved, setSaved] = useState<string[]>(['kyoto'])
  const [added, setAdded] = useState<string[]>(['amsterdam'])
  const [compare, setCompare] = useState<string[]>([])
  const [detail, setDetail] = useState<City | null>(null)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return cities.filter((city) => {
      if (q && !`${city.name} ${city.country} ${city.tags.join(' ')}`.toLowerCase().includes(q))
        return false
      if (region !== 'All' && !city.region.includes(region)) return false
      if (budget !== 'Any' && city.budgetLevel !== budget) return false
      if (climate !== 'Any' && city.climate !== climate) return false
      if (interests.length > 0 && !interests.some((i) => city.tags.includes(i))) return false
      return true
    })
  }, [query, region, budget, climate, interests])

  function toggle(list: string[], setList: (v: string[]) => void, id: string) {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id])
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
              Search by city, country or the kind of days you want to have.
            </p>
          </div>
          <InputGroup className="h-12">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Try “coastal food city” or “Kyoto”"
              value={query}
              aria-label="Search destinations"
              onChange={(e) => setQuery(e.target.value)}
              className="text-base"
            />
          </InputGroup>
        </header>

        <section aria-label="Filters" className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <FilterRow label="Region" options={regions} value={region} onChange={setRegion} />
            <FilterRow label="Budget" options={budgets} value={budget} onChange={setBudget} />
          </div>
          <Separator />
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
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

        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-muted-foreground">
            {results.length} destination{results.length === 1 ? '' : 's'}
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

        {results.length === 0 ? (
          <Empty className="rounded-2xl border border-dashed border-border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SearchIcon />
              </EmptyMedia>
              <EmptyTitle>No cities match those filters</EmptyTitle>
              <EmptyDescription>
                Try widening the budget or clearing a couple of interests.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                variant="outline"
                onClick={() => {
                  setQuery('')
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
                <li key={city.id} className="flex flex-wrap items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">
                      {city.name}, {city.country}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      €{city.dailyCost}/day · {city.suggestedDays}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setDetail(city)}>
                    Details
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((city) => {
              const isSaved = saved.includes(city.id)
              const isAdded = added.includes(city.id)
              const inCompare = compare.includes(city.id)
              return (
                <li key={city.id}>
                  <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg hover:shadow-ink/5">
                    <div className="relative">
                      <Image
                        src={city.image || '/placeholder.svg'}
                        alt={`${city.name}, ${city.country}`}
                        width={640}
                        height={420}
                        className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                      <button
                        type="button"
                        onClick={() => toggle(saved, setSaved, city.id)}
                        aria-pressed={isSaved}
                        className="absolute right-3 top-3 flex min-h-9 items-center gap-1.5 rounded-full bg-card/90 px-3 text-xs font-semibold text-ink backdrop-blur"
                      >
                        <BookmarkIcon
                          className={cn('size-3.5', isSaved && 'fill-brand text-brand')}
                          aria-hidden="true"
                        />
                        {isSaved ? 'Saved' : 'Save'}
                      </button>
                      <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-ink/80 px-2 py-1 text-xs font-semibold text-card backdrop-blur">
                        <StarIcon className="size-3 fill-warning text-warning" aria-hidden="true" />
                        {(city.popularity / 20).toFixed(1)} · {city.popularity}% popular
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col gap-3 p-4">
                      <div>
                        <h3 className="font-display text-base font-bold text-ink">
                          {city.name}
                          <span className="ml-2 text-xs font-normal text-muted-foreground">
                            {city.country}
                          </span>
                        </h3>
                        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                          {city.description}
                        </p>
                      </div>

                      <ul className="flex flex-wrap gap-1.5">
                        {city.tags.map((t) => (
                          <li key={t}>
                            <Badge variant="secondary">{t}</Badge>
                          </li>
                        ))}
                      </ul>

                      <dl className="grid grid-cols-2 gap-2 border-t border-border pt-3 text-xs">
                        <div>
                          <dt className="text-muted-foreground">Avg. daily cost</dt>
                          <dd className="tabular font-display text-sm font-bold text-ink">
                            {money(city.dailyCost)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">Suggested stay</dt>
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
                          onClick={() => toggle(added, setAdded, city.id)}
                        >
                          {isAdded ? (
                            <CheckIcon data-icon="inline-start" />
                          ) : (
                            <PlusIcon data-icon="inline-start" />
                          )}
                          {isAdded ? 'In this trip' : 'Add to trip'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setDetail(city)}>
                          Details
                        </Button>
                        <Button
                          variant={inCompare ? 'secondary' : 'outline'}
                          size="icon-sm"
                          aria-label={`Compare ${city.name}`}
                          onClick={() => toggle(compare, setCompare, city.id)}
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
                const city = cities.find((c) => c.id === id)
                if (!city) return null
                return (
                  <dl key={id} className="rounded-xl border border-border p-3 text-sm">
                    <p className="font-display text-sm font-bold text-ink">{city.name}</p>
                    {[
                      ['Daily cost', money(city.dailyCost)],
                      ['Budget level', city.budgetLevel],
                      ['Climate', city.climate],
                      ['Stay', city.suggestedDays],
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
                  src={detail.image || '/placeholder.svg'}
                  alt={`${detail.name}, ${detail.country}`}
                  width={640}
                  height={420}
                  className="h-40 w-full rounded-xl object-cover"
                />
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    ['Ideal duration', detail.suggestedDays],
                    ['Cost index', `${detail.budgetLevel} · €${detail.dailyCost}/day`],
                    ['Climate', detail.climate],
                    ['Popularity', `${detail.popularity}%`],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-border p-3">
                      <dt className="text-xs text-muted-foreground">{label}</dt>
                      <dd className="mt-0.5 font-semibold text-ink">{value}</dd>
                    </div>
                  ))}
                </dl>
                <div>
                  <h4 className="font-display text-sm font-bold text-ink">Popular experiences</h4>
                  <ul className="mt-2 flex flex-col gap-2">
                    {(highlights[detail.id] ?? []).map((h) => (
                      <li
                        key={h}
                        className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-sm text-ink"
                      >
                        <CheckIcon className="size-3.5 text-brand" aria-hidden="true" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      toggle(added, setAdded, detail.id)
                      setDetail(null)
                    }}
                  >
                    <PlusIcon data-icon="inline-start" />
                    Add to trip
                  </Button>
                  <Button variant="outline" render={<Link href="/activities" />}>
                    See activities
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
