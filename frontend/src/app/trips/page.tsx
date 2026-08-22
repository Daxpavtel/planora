'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { MapIcon, PlusIcon } from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { Toolbar } from '@/components/layout/toolbar'
import { TripCard } from '@/features/trips/components/trip-card'
import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { trips, type TripStatus } from '@/services/mocks'

const groups: { id: string; label: string; statuses: TripStatus[] }[] = [
  { id: 'all', label: 'All', statuses: ['ongoing', 'upcoming', 'draft', 'completed'] },
  { id: 'ongoing', label: 'Ongoing', statuses: ['ongoing'] },
  { id: 'upcoming', label: 'Up-coming', statuses: ['upcoming'] },
  { id: 'draft', label: 'Drafts', statuses: ['draft'] },
  { id: 'completed', label: 'Completed', statuses: ['completed'] },
]

export default function TripsPage() {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('Departure date')
  const [group, setGroup] = useState('None')
  const [filters, setFilters] = useState<string[]>([])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = trips.filter(
      (t) =>
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.cities.some((c) => c.toLowerCase().includes(q)),
    )
    if (filters.length > 0) {
      list = list.filter((t) => filters.includes(t.style))
    }
    return [...list].sort((a, b) => {
      if (sort === 'Budget') return b.budget - a.budget
      if (sort === 'Name') return a.name.localeCompare(b.name)
      return a.start.localeCompare(b.start)
    })
  }, [query, sort, filters])

  return (
    <AppShell title="My Trips" searchPlaceholder="Search my trips">
      <div className="flex flex-col gap-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink">My trips</h2>
            <p className="text-sm text-muted-foreground">
              {trips.length} trips across {new Set(trips.flatMap((t) => t.cities)).size} cities.
            </p>
          </div>
          <Button render={<Link href="/trips/new" />}>
            <PlusIcon data-icon="inline-start" />
            Plan a trip
          </Button>
        </header>

        <Toolbar
          placeholder="Search by trip or city…"
          value={query}
          onValueChange={setQuery}
          groupOptions={['None', 'Region', 'Month', 'Travel style']}
          group={group}
          onGroupChange={setGroup}
          filters={['Budget', 'Balanced', 'Comfort', 'Luxury']}
          activeFilters={filters}
          onToggleFilter={(f) =>
            setFilters((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]))
          }
          sortOptions={['Departure date', 'Budget', 'Name']}
          sort={sort}
          onSortChange={setSort}
        />

        <Tabs defaultValue="all" className="gap-6">
          <TabsList>
            {groups.map((g) => (
              <TabsTrigger key={g.id} value={g.id}>
                {g.label}
                <span className="tabular ml-1.5 text-xs text-muted-foreground">
                  {filtered.filter((t) => g.statuses.includes(t.status)).length}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {groups.map((g) => {
            const list = filtered.filter((t) => g.statuses.includes(t.status))
            if (g.id === 'all' && list.length > 0) {
              const ongoingList = list.filter((t) => t.status === 'ongoing')
              const upcomingList = list.filter((t) => t.status === 'upcoming' || t.status === 'draft')
              const completedList = list.filter((t) => t.status === 'completed')

              return (
                <TabsContent key={g.id} value={g.id} className="flex flex-col gap-8">
                  {ongoingList.length > 0 && (
                    <section className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <span className="size-2.5 rounded-full bg-success animate-pulse" />
                        <h3 className="font-display text-lg font-bold text-ink">Ongoing Trips</h3>
                        <span className="text-xs text-muted-foreground">({ongoingList.length})</span>
                      </div>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {ongoingList.map((trip) => (
                          <TripCard key={trip.id} trip={trip} />
                        ))}
                      </div>
                    </section>
                  )}

                  {upcomingList.length > 0 && (
                    <section className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-lg font-bold text-ink">Upcoming Trips & Drafts</h3>
                        <span className="text-xs text-muted-foreground">({upcomingList.length})</span>
                      </div>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {upcomingList.map((trip) => (
                          <TripCard key={trip.id} trip={trip} />
                        ))}
                      </div>
                    </section>
                  )}

                  {completedList.length > 0 && (
                    <section className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-lg font-bold text-ink">Completed Trips</h3>
                        <span className="text-xs text-muted-foreground">({completedList.length})</span>
                      </div>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {completedList.map((trip) => (
                          <TripCard key={trip.id} trip={trip} />
                        ))}
                      </div>
                    </section>
                  )}
                </TabsContent>
              )
            }

            return (
              <TabsContent key={g.id} value={g.id} className="flex flex-col gap-4">
                {list.length === 0 ? (
                  <Empty className="rounded-2xl border border-dashed border-border">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <MapIcon />
                      </EmptyMedia>
                      <EmptyTitle>No trips here yet</EmptyTitle>
                      <EmptyDescription>
                        Nothing matches these filters. Start a new plan instead.
                      </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                      <Button variant="outline" render={<Link href="/trips/new" />}>
                        <PlusIcon data-icon="inline-start" />
                        Create a trip
                      </Button>
                    </EmptyContent>
                  </Empty>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {list.map((trip) => (
                      <TripCard key={trip.id} trip={trip} />
                    ))}
                  </div>
                )}
              </TabsContent>
            )
          })}
        </Tabs>
      </div>
    </AppShell>
  )
}
