'use client'

import { useMemo, useState } from 'react'
import { format, parseISO, subDays } from 'date-fns'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Activity,
  ArrowUpRight,
  Calendar,
  CreditCard,
  Download,
  FileText,
  PieChart as PieIcon,
  Sparkles,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { ChartTooltip, PageHeader, Panel, PanelHeader } from '@/components/shared/page'
import { downloadExpenseCsv, downloadExpensePdf } from '@/lib/api'
import { APP_CONFIG } from '@/lib/config'
import { getCategoryColor } from '@/lib/constants'
import { useAnalyticsSummary } from '@/lib/hooks'
import { useMoney } from '@/lib/preferences-context'
import { cn } from '@/lib/utils'

const PRESETS = [
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 30 Days', days: 30 },
  { label: 'Last 90 Days', days: 90 },
  { label: 'All Time', days: 0 },
]

export function AnalyticsView() {
  const money = useMoney()
  const [preset, setPreset] = useState(30)
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  const [downloadingCsv, setDownloadingCsv] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const dateRange = useMemo(() => {
    if (preset === 0) return { startDate: undefined, endDate: undefined }
    const start = format(subDays(APP_CONFIG.today, preset - 1), 'yyyy-MM-dd')
    const end = format(APP_CONFIG.today, 'yyyy-MM-dd')
    return { startDate: start, endDate: end }
  }, [preset])

  const { data: analytics, isLoading } = useAnalyticsSummary(dateRange.startDate, dateRange.endDate)

  async function handleDownloadPdf() {
    setDownloadingPdf(true)
    try {
      toast.info('Generating PDF report from Java backend...')
      await downloadExpensePdf(dateRange.startDate, dateRange.endDate)
      toast.success('PDF report downloaded successfully!')
    } catch {
      toast.error('Failed to download PDF report')
    } finally {
      setDownloadingPdf(false)
    }
  }

  async function handleDownloadCsv() {
    setDownloadingCsv(true)
    try {
      toast.info('Exporting CSV from Java backend...')
      await downloadExpenseCsv(dateRange.startDate, dateRange.endDate)
      toast.success('CSV report downloaded successfully!')
    } catch {
      toast.error('Failed to download CSV report')
    } finally {
      setDownloadingCsv(false)
    }
  }

  const categoryData = useMemo(() => {
    if (!analytics?.categorySpending) return []
    return analytics.categorySpending
      .map((c) => ({
        ...c,
        color: getCategoryColor(c.category),
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount)
  }, [analytics])

  const paymentData = useMemo(() => {
    if (!analytics?.paymentMethodSpending) return []
    return analytics.paymentMethodSpending.sort((a, b) => b.totalAmount - a.totalAmount)
  }, [analytics])

  const focusedCat = categoryData.find((d) => d.category === activeCategory)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Spending Analytics"
        description="Comprehensive financial metrics calculated by the Java Spring Boot backend."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleDownloadPdf}
              disabled={downloadingPdf || isLoading}
              className="gap-1.5"
            >
              <FileText className="size-4" />
              PDF Report
            </Button>
            <Button
              variant="outline"
              onClick={handleDownloadCsv}
              disabled={downloadingCsv || isLoading}
              className="gap-1.5"
            >
              <Download className="size-4" />
              CSV Export
            </Button>
          </div>
        }
      />

      {/* Date Range Presets */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground mr-1">Time Horizon:</span>
        {PRESETS.map((p) => {
          const active = preset === p.days
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => setPreset(p.days)}
              className={cn(
                'rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors',
                active
                  ? 'bg-brand text-primary-foreground shadow-sm'
                  : 'bg-card text-muted-foreground hover:bg-muted hover:text-foreground border border-border',
              )}
            >
              {p.label}
            </button>
          )
        })}
      </div>

      {/* Key Metric Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Spending */}
        <Panel className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Total Spending</span>
            <Wallet className="size-4 text-brand" />
          </div>
          <div className="mt-3">
            {isLoading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <div className="font-heading text-2xl font-bold tabular-nums">
                {money(analytics?.totalSpending ?? 0)}
              </div>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              {analytics?.transactionCount ?? 0} total transactions
            </p>
          </div>
        </Panel>

        {/* Monthly Spending */}
        <Panel className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">This Month</span>
            <Calendar className="size-4 text-emerald-500" />
          </div>
          <div className="mt-3">
            {isLoading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <div className="font-heading text-2xl font-bold tabular-nums">
                {money(analytics?.thisMonthSpending ?? 0)}
              </div>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              Avg {money(analytics?.averageDailySpending ?? 0)}/day
            </p>
          </div>
        </Panel>

        {/* Budget Utilization */}
        <Panel className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Budget Utilization</span>
            <Activity className="size-4 text-amber-500" />
          </div>
          <div className="mt-3">
            {isLoading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <div className="flex items-baseline justify-between">
                <span className="font-heading text-2xl font-bold tabular-nums">
                  {analytics?.budgetUsedPercentage ?? 0}%
                </span>
                <span className="text-xs text-muted-foreground">
                  {money(analytics?.remainingBudget ?? 0)} left
                </span>
              </div>
            )}
            <Progress
              value={Math.min(analytics?.budgetUsedPercentage ?? 0, 100)}
              className="mt-2 h-2"
            />
          </div>
        </Panel>

        {/* Top Category */}
        <Panel className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Top Spending Category</span>
            <Sparkles className="size-4 text-purple-500" />
          </div>
          <div className="mt-3">
            {isLoading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <div className="font-heading text-2xl font-bold truncate">
                {analytics?.highestSpendingCategory ?? 'None'}
              </div>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              Peak day: {analytics?.highestSpendingDay || 'N/A'}
            </p>
          </div>
        </Panel>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Category Breakdown (Pie Chart) */}
        <Panel className="flex flex-col p-4">
          <PanelHeader
            title="Spending by Category"
            description="Breakdown calculated from Java Spring Data JPA"
          />
          {isLoading ? (
            <Skeleton className="h-64 w-full rounded-2xl" />
          ) : !categoryData.length ? (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              No category data for selected period
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="relative mx-auto size-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="totalAmount"
                      nameKey="category"
                      innerRadius="65%"
                      outerRadius="95%"
                      paddingAngle={2}
                      cornerRadius={4}
                      stroke="none"
                      onMouseLeave={() => setActiveCategory(null)}
                    >
                      {categoryData.map((d) => (
                        <Cell
                          key={d.category}
                          fill={d.color}
                          opacity={!activeCategory || activeCategory === d.category ? 1 : 0.3}
                          onMouseEnter={() => setActiveCategory(d.category)}
                          className="cursor-pointer outline-none transition-opacity"
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xs text-muted-foreground">{focusedCat?.category ?? 'Total'}</span>
                  <span className="font-heading text-base font-bold tabular-nums">
                    {money(focusedCat?.totalAmount ?? (analytics?.totalSpending ?? 0), { compact: true })}
                  </span>
                </div>
              </div>

              {/* Top categories list */}
              <div className="grid grid-cols-2 gap-2">
                {categoryData.slice(0, 6).map((cat) => (
                  <div
                    key={cat.category}
                    className="flex items-center justify-between rounded-xl bg-muted/40 p-2 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="size-2 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="truncate font-medium">{cat.category}</span>
                    </div>
                    <span className="font-semibold tabular-nums text-foreground">
                      {money(cat.totalAmount, { compact: true })} ({cat.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Panel>

        {/* Payment Methods Breakdown */}
        <Panel className="flex flex-col p-4">
          <PanelHeader
            title="Spending by Payment Method"
            description="UPI, Cards, Cash, Bank Transfer & Wallets"
          />
          {isLoading ? (
            <Skeleton className="h-64 w-full rounded-2xl" />
          ) : !paymentData.length ? (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              No payment data for selected period
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paymentData} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="paymentMethod"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                  />
                  <YAxis
                    width={48}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                    tickFormatter={(n) => money(n, { compact: true })}
                  />
                  <Tooltip
                    content={({ active, payload }) =>
                      active && payload?.[0] ? (
                        <ChartTooltip
                          label={String(payload[0].payload.paymentMethod)}
                          value={`${money(Number(payload[0].value))} (${payload[0].payload.percentage}%)`}
                          color="#38BDF8"
                        />
                      ) : null
                    }
                  />
                  <Bar dataKey="totalAmount" fill="#38BDF8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>
      </div>

      {/* Daily & Monthly Trend Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Daily Spending */}
        <Panel className="flex flex-col p-4">
          <PanelHeader
            title="Daily Spending"
            description="Aggregated day-by-day totals from Java database queries"
          />
          {isLoading ? (
            <Skeleton className="h-64 w-full rounded-2xl" />
          ) : !analytics?.dailySpending?.length ? (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              No daily transactions in range
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.dailySpending} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                    tickFormatter={(d: string) => format(parseISO(d), 'd MMM')}
                  />
                  <YAxis
                    width={48}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                    tickFormatter={(n) => money(n, { compact: true })}
                  />
                  <Tooltip
                    content={({ active, payload }) =>
                      active && payload?.[0] ? (
                        <ChartTooltip
                          label={format(parseISO(payload[0].payload.date), 'EEE, d MMM yyyy')}
                          value={money(Number(payload[0].value))}
                          color="var(--brand)"
                        />
                      ) : null
                    }
                  />
                  <Bar dataKey="totalAmount" fill="var(--brand)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>

        {/* Monthly Spending */}
        <Panel className="flex flex-col p-4">
          <PanelHeader
            title="Monthly Spending"
            description="Month-by-month financial comparison"
          />
          {isLoading ? (
            <Skeleton className="h-64 w-full rounded-2xl" />
          ) : !analytics?.monthlySpending?.length ? (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              No monthly transactions recorded
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.monthlySpending} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="monthName"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                  />
                  <YAxis
                    width={48}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                    tickFormatter={(n) => money(n, { compact: true })}
                  />
                  <Tooltip
                    content={({ active, payload }) =>
                      active && payload?.[0] ? (
                        <ChartTooltip
                          label={String(payload[0].payload.monthName)}
                          value={money(Number(payload[0].value))}
                          color="#10B981"
                        />
                      ) : null
                    }
                  />
                  <Bar dataKey="totalAmount" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>
      </div>
    </div>
  )
}
