'use client'

import { useMemo, useState } from 'react'
import {
  ActivityIcon,
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  BanIcon,
  CheckIcon,
  DownloadIcon,
  EyeIcon,
  MoreHorizontalIcon,
  SearchIcon,
  Share2Icon,
  ShieldCheckIcon,
  TrendingUpIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { toast } from 'sonner'
import { AppShell } from '@/components/layout/app-shell'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  adminActivities,
  adminCities,
  adminEngagement,
  adminMonthly,
  adminSharedItineraries,
  adminUsers,
  moderationQueue,
} from '@/services/mocks'
import { cn } from '@/lib/utils'

const chartConfig = {
  trips: { label: 'Trips created', color: 'var(--chart-1)' },
  added: { label: 'Times added', color: 'var(--chart-2)' },
} satisfies ChartConfig

const kpis = [
  { label: 'Total users', value: '18,420', delta: '+8.4%', up: true, hint: 'vs last month' },
  { label: 'Trips created', value: '7,780', delta: '+12.1%', up: true, hint: 'last 6 months' },
  {
    label: 'Active shared itineraries',
    value: '2,164',
    delta: '+19.6%',
    up: true,
    hint: 'vs last month',
  },
  { label: 'Avg. trip length', value: '6.4 days', delta: '-0.3', up: false, hint: 'vs last month' },
]

const ranges = ['Last 30 days', 'Last 6 months', 'Last 12 months', 'All time']

type PendingUser = { id: string; name: string; nextStatus: 'Active' | 'Suspended' }
type PendingReport = { id: string; title: string }

export default function AdminPage() {
  const [range, setRange] = useState('Last 6 months')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const [resolved, setResolved] = useState<string[]>([])
  const [statuses, setStatuses] = useState<Record<string, string>>(() =>
    Object.fromEntries(adminUsers.map((u) => [u.id, u.status])),
  )
  const [pendingUser, setPendingUser] = useState<PendingUser | null>(null)
  const [pendingReport, setPendingReport] = useState<PendingReport | null>(null)

  const maxCityTrips = adminCities[0].trips

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase()
    return adminUsers.filter((u) => {
      const matchesQuery =
        !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      const matchesStatus =
        statusFilter === 'All statuses' || statuses[u.id] === statusFilter
      return matchesQuery && matchesStatus
    })
  }, [query, statusFilter, statuses])

  const openQueue = moderationQueue.filter((m) => !resolved.includes(m.id))

  function confirmStatusChange() {
    if (!pendingUser) return
    setStatuses((prev) => ({ ...prev, [pendingUser.id]: pendingUser.nextStatus }))
    toast.success(
      pendingUser.nextStatus === 'Suspended'
        ? `${pendingUser.name} has been suspended.`
        : `${pendingUser.name} has been restored.`,
    )
    setPendingUser(null)
  }

  function confirmRemoveContent() {
    if (!pendingReport) return
    setResolved((prev) => [...prev, pendingReport.id])
    toast.success(`Removed “${pendingReport.title}” and notified the owner.`)
    setPendingReport(null)
  }

  return (
    <AppShell title="Admin panel" searchPlaceholder="Search users, cities and reports">
      <div className="flex flex-col gap-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="size-5 text-brand" aria-hidden="true" />
              <h2 className="font-display text-2xl font-bold text-ink">Platform analytics</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Aggregated, anonymised usage across all GlobeTrotter accounts.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={range} onValueChange={(v) => setRange(v as string)}>
              <SelectTrigger className="w-44" aria-label="Date range">
                <SelectValue placeholder="Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {ranges.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <DownloadIcon data-icon="inline-start" />
              Export CSV
            </Button>
          </div>
        </header>

        <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {kpis.map((k) => (
            <div key={k.label} className="flex flex-col gap-1 rounded-2xl border border-border bg-card p-4">
              <dt className="text-xs text-muted-foreground">{k.label}</dt>
              <dd className="tabular font-display text-2xl font-bold text-ink">{k.value}</dd>
              <p
                className={cn(
                  'flex items-center gap-1 text-xs font-medium',
                  k.up ? 'text-success' : 'text-destructive',
                )}
              >
                {k.up ? (
                  <ArrowUpRightIcon className="size-3.5" aria-hidden="true" />
                ) : (
                  <ArrowDownRightIcon className="size-3.5" aria-hidden="true" />
                )}
                {k.delta}
                <span className="font-normal text-muted-foreground">{k.hint}</span>
              </p>
            </div>
          ))}
        </dl>

        <Card>
          <CardHeader>
            <CardTitle>User engagement</CardTitle>
            <CardDescription>How actively travellers return to plan, {range.toLowerCase()}.</CardDescription>
            <CardAction>
              <Badge className="border-0 bg-accent text-accent-foreground">
                <ActivityIcon data-icon="inline-start" />
                Healthy
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {adminEngagement.map((e) => (
              <div key={e.label} className="flex flex-col gap-2">
                <p className="text-xs text-muted-foreground">{e.label}</p>
                <p className="tabular font-display text-xl font-bold text-ink">{e.value}</p>
                <Progress
                  value={e.share}
                  aria-label={e.label}
                  className="[&_[data-slot=progress-indicator]]:bg-brand"
                />
                <p className="text-xs text-muted-foreground">{e.note}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
          <Card>
            <CardHeader>
              <CardTitle>Trips created</CardTitle>
              <CardDescription>{range}, all regions.</CardDescription>
              <CardAction>
                <Badge className="border-0 bg-success-soft text-success">
                  <TrendingUpIcon data-icon="inline-start" />
                  +117% growth
                </Badge>
              </CardAction>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-64 w-full">
                <AreaChart data={adminMonthly} margin={{ left: 4, right: 8, top: 8 }}>
                  <defs>
                    <linearGradient id="fillTrips" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--brand)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} width={40} tickMargin={4} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    dataKey="trips"
                    type="monotone"
                    stroke="var(--brand)"
                    strokeWidth={2}
                    fill="url(#fillTrips)"
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Most popular cities</CardTitle>
              <CardDescription>By trips that include the city.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {adminCities.map((c) => (
                <div key={c.city} className="flex flex-col gap-1.5">
                  <div className="flex items-baseline justify-between gap-2 text-sm">
                    <span className="font-semibold text-ink">{c.city}</span>
                    <span className="flex items-baseline gap-2">
                      <span className="tabular font-semibold text-ink">
                        {c.trips.toLocaleString('en-US')}
                      </span>
                      <span className="text-xs font-medium text-success">{c.change}</span>
                    </span>
                  </div>
                  <Progress
                    value={(c.trips / maxCityTrips) * 100}
                    aria-label={`${c.city} trips`}
                    className="[&_[data-slot=progress-indicator]]:bg-brand"
                  />
                </div>
              ))}
            </CardContent>
            <CardFooter className="border-t border-border pt-4">
              <p className="text-xs text-muted-foreground">
                Udaipur is the fastest riser this quarter, up 22%.
              </p>
            </CardFooter>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Most added activities</CardTitle>
            <CardDescription>
              Across every itinerary built in the {range.toLowerCase()}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <BarChart
                data={adminActivities}
                layout="vertical"
                margin={{ left: 8, right: 16 }}
              >
                <CartesianGrid horizontal={false} />
                <XAxis type="number" dataKey="added" tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="activity"
                  tickLine={false}
                  axisLine={false}
                  width={150}
                  tickMargin={8}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="added" fill="var(--chart-2)" radius={[0, 6, 6, 0]} barSize={22} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Separator />

        <Tabs defaultValue="users">
          <TabsList>
            <TabsTrigger value="users">
              <UsersIcon data-icon="inline-start" />
              Users
            </TabsTrigger>
            <TabsTrigger value="shared">
              <Share2Icon data-icon="inline-start" />
              Shared itineraries
            </TabsTrigger>
            <TabsTrigger value="moderation">
              Moderation
              {openQueue.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {openQueue.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="pt-5">
            <Card>
              <CardHeader>
                <CardTitle>User management</CardTitle>
                <CardDescription>
                  Showing {filteredUsers.length} of {adminUsers.length} accounts.
                </CardDescription>
                <CardAction className="flex flex-wrap items-center gap-2">
                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as string)}>
                    <SelectTrigger className="w-40" aria-label="Filter by status">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {['All statuses', 'Active', 'Suspended'].map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <InputGroup className="w-full sm:w-64">
                    <InputGroupAddon>
                      <SearchIcon />
                    </InputGroupAddon>
                    <InputGroupInput
                      placeholder="Search name or email"
                      aria-label="Search users"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </InputGroup>
                </CardAction>
              </CardHeader>
              <CardContent>
                {filteredUsers.length === 0 ? (
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <SearchIcon />
                      </EmptyMedia>
                      <EmptyTitle>No matching users</EmptyTitle>
                      <EmptyDescription>
                        Try a different name, or clear the filters to see the full list.
                      </EmptyDescription>
                    </EmptyHeader>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setQuery('')
                        setStatusFilter('All statuses')
                      }}
                    >
                      Clear filters
                    </Button>
                  </Empty>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Trips</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-10" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell>
                            <span className="flex items-center gap-3">
                              <Avatar className="size-8">
                                <AvatarFallback className="bg-brand-soft text-xs font-semibold text-brand">
                                  {u.name
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="flex flex-col">
                                <span className="font-medium text-ink">{u.name}</span>
                                <span className="text-xs text-muted-foreground">{u.email}</span>
                              </span>
                            </span>
                          </TableCell>
                          <TableCell className="tabular">{u.trips}</TableCell>
                          <TableCell className="text-muted-foreground">{u.joined}</TableCell>
                          <TableCell>
                            <Badge
                              className={cn(
                                'border-0',
                                statuses[u.id] === 'Active'
                                  ? 'bg-success-soft text-success'
                                  : 'bg-destructive/10 text-destructive',
                              )}
                            >
                              {statuses[u.id]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                render={
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label={`Actions for ${u.name}`}
                                  />
                                }
                              >
                                <MoreHorizontalIcon />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => toast.info(`Opened activity log for ${u.name}.`)}
                                >
                                  View activity
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => toast.success(`Reset link sent to ${u.email}.`)}
                                >
                                  Send password reset
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  variant={statuses[u.id] === 'Active' ? 'destructive' : undefined}
                                  onClick={() =>
                                    setPendingUser({
                                      id: u.id,
                                      name: u.name,
                                      nextStatus:
                                        statuses[u.id] === 'Active' ? 'Suspended' : 'Active',
                                    })
                                  }
                                >
                                  {statuses[u.id] === 'Active'
                                    ? 'Suspend account'
                                    : 'Restore account'}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shared" className="pt-5">
            <Card>
              <CardHeader>
                <CardTitle>Active shared itineraries</CardTitle>
                <CardDescription>
                  Public itineraries receiving traffic in the {range.toLowerCase()}.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Itinerary</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Copies</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminSharedItineraries.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>
                          <span className="flex flex-col">
                            <span className="font-medium text-ink">{s.title}</span>
                            <span className="text-xs text-muted-foreground">
                              Starts in {s.city}
                            </span>
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{s.owner}</TableCell>
                        <TableCell className="tabular">
                          {s.views.toLocaleString('en-US')}
                        </TableCell>
                        <TableCell className="tabular">{s.copies}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toast.info(`Opened “${s.title}”.`)}
                          >
                            <EyeIcon data-icon="inline-start" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="border-t border-border pt-4">
                <p className="text-xs text-muted-foreground">
                  Copies mean another traveller duplicated the itinerary into their own account.
                </p>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="moderation" className="pt-5">
            <Card>
              <CardHeader>
                <CardTitle>Moderation queue</CardTitle>
                <CardDescription>Reported itineraries, notes and profiles.</CardDescription>
              </CardHeader>
              <CardContent>
                {openQueue.length === 0 ? (
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <CheckIcon />
                      </EmptyMedia>
                      <EmptyTitle>Queue is clear</EmptyTitle>
                      <EmptyDescription>
                        Nothing is waiting for review. New reports appear here immediately.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {openQueue.map((m) => (
                      <li
                        key={m.id}
                        className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center"
                      >
                        <div className="flex flex-col gap-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline">{m.type}</Badge>
                            <span className="font-medium text-ink">{m.title}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {m.reason} · reported by {m.reporter}
                          </p>
                        </div>
                        <div className="flex gap-2 sm:ml-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setResolved((prev) => [...prev, m.id])
                              toast.success('Report dismissed. Content stays published.')
                            }}
                          >
                            <XIcon data-icon="inline-start" />
                            Dismiss
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setPendingReport({ id: m.id, title: m.title })}
                          >
                            <BanIcon data-icon="inline-start" />
                            Remove content
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={pendingUser !== null} onOpenChange={(open) => !open && setPendingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingUser?.nextStatus === 'Suspended'
                ? `Suspend ${pendingUser?.name}?`
                : `Restore ${pendingUser?.name}?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingUser?.nextStatus === 'Suspended'
                ? 'They will be signed out and lose access to planning tools. Their trips are kept and can be restored at any time.'
                : 'They will regain access to their trips and planning tools straight away.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep as is</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusChange}>
              {pendingUser?.nextStatus === 'Suspended' ? 'Suspend account' : 'Restore account'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={pendingReport !== null}
        onOpenChange={(open) => !open && setPendingReport(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this content?</AlertDialogTitle>
            <AlertDialogDescription>
              {`“${pendingReport?.title ?? ''}” will be unpublished and the owner notified. This cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemoveContent}>Remove content</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  )
}
