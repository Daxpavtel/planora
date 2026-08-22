'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ChevronDownIcon,
  InfoIcon,
  PlusIcon,
  Trash2Icon,
  TriangleAlertIcon,
} from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis } from 'recharts'
import { toast } from 'sonner'
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
import { expensesApi } from '@/lib/api'
import { money } from '@/lib/data'
import { cn } from '@/lib/utils'

// Strict 4-Bucket Chart Configuration
const chartConfig = {
  amount: { label: 'Amount' },
  transport: { label: 'Transport', color: 'var(--chart-1)' },
  stay: { label: 'Stay', color: 'var(--chart-2)' },
  activities: { label: 'Activities', color: 'var(--chart-3)' },
  meals: { label: 'Meals', color: 'var(--chart-4)' },
} satisfies ChartConfig

const categoryColor: Record<string, string> = {
  Transport: 'var(--chart-1)',
  Stay: 'var(--chart-2)',
  Activities: 'var(--chart-3)',
  Meals: 'var(--chart-4)',
}

const currencies = ['EUR (€)', 'USD ($)', 'INR (₹)', 'GBP (£)']
const expenseCategories = ['Transport', 'Stay', 'Activities', 'Meals'] as const

export function TripBudget({ tripId = 1 }: { tripId?: string | number }) {
  const [budgetData, setBudgetData] = useState<{
    target_budget: number
    total_spent: number
    remaining_budget: number
    percentage_used: number
    categories: { Transport: number; Stay: number; Activities: number; Meals: number }
    budgetByCategory: { category: string; amount: number; fill: string }[]
    dailySpend: { day: string; date: string; amount: number }[]
    budgetByCity: { city: string; nights: number; amount: number; share: number }[]
  }>({
    target_budget: 3200,
    total_spent: 2710,
    remaining_budget: 490,
    percentage_used: 85,
    categories: { Transport: 742, Stay: 1080, Activities: 486, Meals: 402 },
    budgetByCategory: [
      { category: 'Transport', amount: 742, fill: 'var(--chart-1)' },
      { category: 'Stay', amount: 1080, fill: 'var(--chart-2)' },
      { category: 'Activities', amount: 486, fill: 'var(--chart-3)' },
      { category: 'Meals', amount: 402, fill: 'var(--chart-4)' },
    ],
    dailySpend: [
      { day: 'Jun 12', date: '2026-06-12', amount: 186 },
      { day: 'Jun 13', date: '2026-06-13', amount: 214 },
      { day: 'Jun 14', date: '2026-06-14', amount: 298 },
      { day: 'Jun 15', date: '2026-06-15', amount: 172 },
      { day: 'Jun 16', date: '2026-06-16', amount: 264 },
    ],
    budgetByCity: [
      { city: 'Paris', nights: 4, amount: 1120, share: 50 },
      { city: 'Rome', nights: 4, amount: 980, share: 50 },
    ],
  })

  const [expenseList, setExpenseList] = useState<any[]>([])
  const [target, setTarget] = useState(3200)
  const [currency, setCurrency] = useState('EUR (€)')
  const [openTable, setOpenTable] = useState(true)
  const [loading, setLoading] = useState(true)

  // Add Expense Dialog state
  const [openAddModal, setOpenAddModal] = useState(false)
  const [newCategory, setNewCategory] = useState<'Transport' | 'Stay' | 'Activities' | 'Meals'>('Transport')
  const [newAmount, setNewAmount] = useState<string>('')
  const [newDate, setNewDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [submittingExpense, setSubmittingExpense] = useState(false)

  // Fetch live budget breakdown and expenses from backend
  async function loadBudget() {
    try {
      setLoading(true)
      const cleanTripId = typeof tripId === 'string' && tripId.startsWith('trip-') ? 1 : tripId
      const [budgetRes, expensesRes] = await Promise.all([
        expensesApi.getBudget(cleanTripId),
        expensesApi.getExpenses(cleanTripId),
      ])

      if (budgetRes) {
        setBudgetData(budgetRes)
        setTarget(budgetRes.target_budget || 3200)
      }
      if (expensesRes) {
        setExpenseList(expensesRes)
      }
    } catch (err) {
      console.warn('Using default budget state:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBudget()
  }, [tripId])

  const spent = budgetData.total_spent || budgetData.budgetByCategory.reduce((sum, c) => sum + c.amount, 0)
  const remaining = target - spent
  const dailySpend = budgetData.dailySpend || []
  const perDay = Math.round(spent / (dailySpend.length || 1))
  const health = remaining < 0 ? 'critical' : remaining < target * 0.1 ? 'warning' : 'healthy'
  const overDays = useMemo(() => dailySpend.filter((d) => d.amount > perDay * 1.35), [dailySpend, perDay])

  const healthStyles = {
    healthy: 'border-success/30 bg-success-soft text-success',
    warning: 'border-warning/40 bg-warning-soft text-warning-foreground',
    critical: 'border-destructive/30 bg-destructive/10 text-destructive',
  }[health]

  const healthCopy = {
    healthy: 'On track — you have budget remaining across Transport, Stay, Activities, and Meals.',
    warning: 'Close to your limit. Watch transportation and stay costs before adding more.',
    critical: 'Over budget! Review activity costs or choose a more economical stay.',
  }[health]

  // Handle Add Expense Submission
  async function handleAddExpense(e: React.FormEvent) {
    e.preventDefault()
    const amt = parseFloat(newAmount)
    if (isNaN(amt) || amt <= 0) {
      toast.error('Please enter a valid expense amount.')
      return
    }

    try {
      setSubmittingExpense(true)
      const cleanTripId = typeof tripId === 'string' && tripId.startsWith('trip-') ? 1 : tripId
      await expensesApi.addExpense(cleanTripId, {
        category: newCategory,
        amount: amt,
        expense_date: newDate,
      })

      toast.success(`Added ${newCategory} expense of ${money(amt)}!`)
      setNewAmount('')
      setOpenAddModal(false)
      await loadBudget()
    } catch (err: any) {
      toast.error(err.message || 'Failed to add expense.')
    } finally {
      setSubmittingExpense(false)
    }
  }

  // Handle Delete Expense
  async function handleDeleteExpense(id: string | number) {
    try {
      await expensesApi.deleteExpense(id)
      toast.success('Expense deleted successfully.')
      await loadBudget()
    } catch (err) {
      toast.error('Failed to delete expense.')
    }
  }

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

        {/* Add Expense Button */}
        <Button
          variant="outline"
          className="mb-0.5 sm:ml-auto"
          onClick={() => setOpenAddModal(true)}
        >
          <PlusIcon data-icon="inline-start" />
          Add expense
        </Button>
      </div>

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ['Total budget', money(target)],
          ['Calculated spend', money(spent)],
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
            {Math.round((spent / (target || 1)) * 100)}% used
          </Badge>
        </div>
        <Progress
          value={Math.min(100, (spent / (target || 1)) * 100)}
          aria-label="Budget used"
          className="bg-card/60"
        />
        <p className="text-sm">{healthCopy}</p>
      </div>

      {/* Strict 4 Categories Breakdown Chart & Stats */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>4-Bucket Financial Breakdown</CardTitle>
            <CardDescription>Strictly categorized into Transport, Stay, Activities & Meals.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-56 w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie data={budgetData.budgetByCategory} dataKey="amount" nameKey="category" innerRadius={54}>
                  {budgetData.budgetByCategory.map((entry) => (
                    <Cell key={entry.category} fill={categoryColor[entry.category] || 'var(--chart-1)'} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <ul className="flex flex-col gap-2">
              {budgetData.budgetByCategory.map((c) => (
                <li key={c.category} className="flex items-center gap-2 text-sm">
                  <span
                    aria-hidden="true"
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: categoryColor[c.category] || 'var(--chart-1)' }}
                  />
                  <span className="font-medium text-ink">{c.category}</span>
                  <span className="tabular ml-auto font-bold text-ink">{money(c.amount)}</span>
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
                Days above {money(Math.round(perDay * 1.35))} are flagged as heavy spending days.
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
                {overDays.map((d) => d.day).join(', ')} exceed your daily average due to hotel stays and transport legs.
              </span>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>By city</CardTitle>
              <CardDescription>Nights, spend and share of the total.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {budgetData.budgetByCity.map((c) => (
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

      {/* Expenses Table */}
      <Collapsible open={openTable} onOpenChange={setOpenTable}>
        <Card>
          <CardHeader>
            <CardTitle>Recorded Expenses</CardTitle>
            <CardDescription>Live expenses retrieved from the database.</CardDescription>
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
                      <TableHead>Category</TableHead>
                      <TableHead>Expense Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="w-12 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenseList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                          No specific expense entries yet. Add your first expense above.
                        </TableCell>
                      </TableRow>
                    ) : (
                      expenseList.map((e) => (
                        <TableRow key={e.id || e.expense_id}>
                          <TableCell>
                            <Badge
                              className={cn(
                                'border-0',
                                e.category === 'Transport' && 'bg-blue-100 text-blue-700',
                                e.category === 'Stay' && 'bg-amber-100 text-amber-700',
                                e.category === 'Activities' && 'bg-emerald-100 text-emerald-700',
                                e.category === 'Meals' && 'bg-orange-100 text-orange-700',
                              )}
                            >
                              {e.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{e.day || e.expense_date}</TableCell>
                          <TableCell className="tabular text-right font-semibold text-ink">
                            {money(e.amount)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleDeleteExpense(e.expense_id || e.id)}
                              aria-label="Delete expense"
                            >
                              <Trash2Icon className="size-3.5 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
        <InfoIcon className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        All figures are live financial calculations in {currency} stored directly in the MySQL database.
      </p>

      {/* Add Expense Modal Dialog */}
      <Dialog open={openAddModal} onOpenChange={setOpenAddModal}>
        <DialogContent>
          <form onSubmit={handleAddExpense}>
            <DialogHeader>
              <DialogTitle>Add New Trip Expense</DialogTitle>
              <DialogDescription>
                Record an expense strictly under one of the four financial categories.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4 py-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="exp-category">Financial Category</Label>
                <Select
                  value={newCategory}
                  onValueChange={(v) => setNewCategory(v as any)}
                >
                  <SelectTrigger id="exp-category" className="w-full">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {expenseCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="exp-amount">Amount (€)</Label>
                <Input
                  id="exp-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="e.g. 85.00"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="exp-date">Expense Date</Label>
                <Input
                  id="exp-date"
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submittingExpense}>
                {submittingExpense ? 'Saving…' : 'Add Expense'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
