'use client'

import { useMemo, useState } from 'react'
import {
  ChevronDownIcon,
  InfoIcon,
  PlusIcon,
  TriangleAlertIcon,
} from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis } from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  budgetByCategory,
  budgetByCity,
  dailySpend,
  expenses,
  featuredTrip,
  money,
} from '@/lib/data'
import { cn } from '@/lib/utils'

const chartConfig = {
  amount: { label: 'Amount' },
  transport: { label: 'Transport', color: 'var(--chart-1)' },
  stays: { label: 'Stays', color: 'var(--chart-2)' },
  activities: { label: 'Activities', color: 'var(--chart-3)' },
  meals: { label: 'Meals', color: 'var(--chart-4)' },
  other: { label: 'Other', color: 'var(--chart-5)' },
} satisfies ChartConfig

const categoryColor: Record<string, string> = {
  Transport: 'var(--chart-1)',
  Stays: 'var(--chart-2)',
  Activities: 'var(--chart-3)',
  Meals: 'var(--chart-4)',
  Other: 'var(--chart-5)',
}

const currencies = ['EUR (€)', 'USD ($)', 'INR (₹)', 'GBP (£)']

export function TripBudget() {
  const [target, setTarget] = useState(featuredTrip.budget)
  const [currency, setCurrency] = useState('EUR (€)')
  const [openTable, setOpenTable] = useState(true)

  const spent = budgetByCategory.reduce((sum, c) => sum + c.amount, 0)
  const remaining = target - spent
  const perDay = Math.round(spent / dailySpend.length)
  const health = remaining < 0 ? 'critical' : remaining < target * 0.1 ? 'warning' : 'healthy'
  const overDays = useMemo(() => dailySpend.filter((d) => d.amount > perDay * 1.35), [perDay])

  const healthStyles = {
    healthy: 'border-success/30 bg-success-soft text-success',
    warning: 'border-warning/40 bg-warning-soft text-warning-foreground',
    critical: 'border-destructive/30 bg-destructive/10 text-destructive',
  }[health]

  const healthCopy = {
    healthy: 'On track — you have room for one more experience per city.',
    warning: 'Close to the limit. Watch the travel legs before adding more.',
    critical: 'Over budget. Trim a paid activity or move a night to a cheaper stay.',
  }[health]

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="target-budget">Target budget</Label>
          <Input
            id="target-budget"
            type="number"
            step={50}
            value={target}
            onChange={(e) => setTarget(Number(e.target.value))}
            className="w-36"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="currency">Currency</Label>
          <Select value={currency} onValueChange={(v) => setCurrency(v as string)}>
            <SelectTrigger id="currency" className="w-40">
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {currencies.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" className="mb-0.5 sm:ml-auto">
          <PlusIcon data-icon="inline-start" />
          Add expense
        </Button>
      </div>

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ['Total budget', money(target)],
          ['Estimated spend', money(spent)],
          [
            remaining < 0 ? 'Over budget by' : 'Remaining',
            money(Math.abs(remaining)),
          ],
          ['Average per day', money(perDay)],
        ].map(([label, value], index) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-4">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd
              className={cn(
                'tabular font-display text-2xl font-bold text-ink',
                index === 2 && remaining < 0 && 'text-destructive',
                index === 2 && remaining >= 0 && 'text-success',
              )}
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <div className={cn('flex flex-col gap-2 rounded-2xl border p-4', healthStyles)}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-display text-sm font-bold">Budget health</span>
          <Badge className="border-0 bg-card/70 text-ink">
            {Math.round((spent / target) * 100)}% used
          </Badge>
        </div>
        <Progress
          value={Math.min(100, (spent / target) * 100)}
          aria-label="Budget used"
          className="bg-card/60"
        />
        <p className="text-sm">{healthCopy}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Where the money goes</CardTitle>
            <CardDescription>Split across the whole trip.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-56 w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie data={budgetByCategory} dataKey="amount" nameKey="category" innerRadius={54}>
                  {budgetByCategory.map((entry) => (
                    <Cell key={entry.category} fill={categoryColor[entry.category]} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <ul className="flex flex-col gap-2">
              {budgetByCategory.map((c) => (
                <li key={c.category} className="flex items-center gap-2 text-sm">
                  <span
                    aria-hidden="true"
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: categoryColor[c.category] }}
                  />
                  <span className="text-muted-foreground">{c.category}</span>
                  <span className="tabular ml-auto font-semibold text-ink">{money(c.amount)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily spend</CardTitle>
              <CardDescription>
                Days above {money(Math.round(perDay * 1.35))} are flagged as heavy.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-56 w-full">
                <BarChart data={dailySpend} margin={{ left: 4, right: 4 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    interval={0}
                    tickFormatter={(v: string) => v.replace('Jun ', '')}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="amount" radius={6}>
                    {dailySpend.map((d) => (
                      <Cell
                        key={d.day}
                        fill={d.amount > perDay * 1.35 ? 'var(--warning)' : 'var(--brand)'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {overDays.length > 0 && (
            <div
              role="alert"
              className="flex flex-col gap-1 rounded-2xl border border-warning/40 bg-warning-soft p-4 text-sm text-ink"
            >
              <span className="flex items-center gap-2 font-semibold">
                <TriangleAlertIcon className="size-4 text-warning" aria-hidden="true" />
                {overDays.length} heavy spending days
              </span>
              <span className="text-muted-foreground">
                {overDays.map((d) => d.day).join(', ')} run well above your daily average — mostly
                travel legs and paid entries.
              </span>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>By city</CardTitle>
              <CardDescription>Nights, spend and share of the total.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {budgetByCity.map((c) => (
                <div key={c.city} className="flex flex-col gap-1.5">
                  <div className="flex items-baseline justify-between gap-2 text-sm">
                    <span className="font-semibold text-ink">
                      {c.city}
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        {c.nights} nights
                      </span>
                    </span>
                    <span className="tabular font-semibold text-ink">{money(c.amount)}</span>
                  </div>
                  <Progress
                    value={c.share}
                    aria-label={`${c.city} share of budget`}
                    className="[&_[data-slot=progress-indicator]]:bg-brand"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Collapsible open={openTable} onOpenChange={setOpenTable}>
        <Card>
          <CardHeader>
            <CardTitle>Expenses</CardTitle>
            <CardDescription>Everything currently counted in the estimate.</CardDescription>
            <CardAction>
              <CollapsibleTrigger render={<Button variant="outline" size="sm" />}>
                {openTable ? 'Hide table' : 'Show table'}
                <ChevronDownIcon
                  data-icon="inline-end"
                  className={cn('transition-transform', openTable && 'rotate-180')}
                />
              </CollapsibleTrigger>
            </CardAction>
          </CardHeader>
          <CollapsibleContent>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Day</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell className="font-medium text-ink">{e.item}</TableCell>
                        <TableCell className="text-muted-foreground">{e.city}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{e.category}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{e.day}</TableCell>
                        <TableCell className="tabular text-right font-semibold text-ink">
                          {money(e.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
        <InfoIcon className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        All figures are estimates in {currency}. Prices for stays and transport update when you add a
        real booking reference in the builder.
      </p>
    </div>
  )
}
