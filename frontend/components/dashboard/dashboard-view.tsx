'use client'

import { useMemo } from 'react'
import { format } from 'date-fns'
import { PageHeader } from '@/components/shared/page'
import { AddExpenseButton } from '@/components/expenses/add-expense-dialog'
import { useAuth } from '@/lib/auth-context'
import { APP_CONFIG } from '@/lib/config'
import { useDashboard, useExpenses } from '@/lib/hooks'
import { StatCards } from './stat-cards'
import { SpendingChart } from './spending-chart'
import { CategoryBreakdown } from './category-breakdown'
import { WeeklyChart } from './weekly-chart'
import { RecentExpenses } from './recent-expenses'
import { WeatherCard } from './weather-card'
import { BudgetOverview } from './budget-overview'

function greeting(hour: number) {
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function DashboardView() {
  const { user } = useAuth()
  const { data: dashboard } = useDashboard()
  const { data: expenses } = useExpenses()
  const today = APP_CONFIG.today

  const monthExpenses = useMemo(
    () => expenses?.filter((e) => e.date.slice(0, 7) === format(today, 'yyyy-MM')),
    [expenses, today],
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`${greeting(new Date().getHours())}, ${user?.name.split(' ')[0] ?? 'there'}`}
        description={`Here's your spending snapshot for ${format(today, 'EEEE, d MMMM')}.`}
        actions={<AddExpenseButton className="hidden md:inline-flex" />}
      />

      <StatCards data={dashboard} />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SpendingChart daily={dashboard?.daily} />
        </div>
        <CategoryBreakdown expenses={monthExpenses} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <WeeklyChart weekly={dashboard?.weekly} />
          <RecentExpenses expenses={expenses} />
        </div>
        <div className="flex flex-col gap-4">
          <WeatherCard />
          <BudgetOverview />
        </div>
      </div>
    </div>
  )
}
