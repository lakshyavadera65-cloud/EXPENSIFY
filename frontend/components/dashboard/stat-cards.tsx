'use client'

import { ArrowDownRight, ArrowUpRight, BellRing, CalendarDays, Coins, Wallet, type LucideIcon } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { CountUp, Stagger, StaggerItem } from '@/components/shared/motion'
import { tint } from '@/components/shared/category'
import { useMoney } from '@/lib/preferences-context'
import type { DashboardData } from '@/lib/types'
import { cn } from '@/lib/utils'

interface Stat {
  label: string
  value: number
  icon: LucideIcon
  color: string
  money: boolean
  change?: number
  hint: string
}

export function StatCards({ data }: { data?: DashboardData }) {
  const money = useMoney()

  if (!data) {
    return (
      <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-3xl" />
        ))}
      </div>
    )
  }

  const stats: Stat[] = [
    { label: 'Spent today', value: data.todayTotal, icon: Coins, color: '#FF7A00', money: true, change: data.todayChange, hint: 'vs yesterday' },
    { label: 'This month', value: data.monthTotal, icon: CalendarDays, color: '#F472B6', money: true, change: data.monthChange, hint: 'vs last month' },
    { label: 'Budget left', value: data.budgetRemaining, icon: Wallet, color: '#34D399', money: true, hint: 'of monthly limit' },
    { label: 'Active alerts', value: data.activeAlerts, icon: BellRing, color: '#FBBF24', money: false, hint: 'need attention' },
  ]

  return (
    <Stagger className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
      {stats.map((s) => {
        const down = (s.change ?? 0) < 0
        return (
          <StaggerItem key={s.label} lift>
            <div
              style={tint(s.color)}
              className="surface group relative h-full overflow-hidden rounded-3xl p-4 md:p-5"
            >
              <div
                aria-hidden="true"
                className="tint-bg pointer-events-none absolute -top-10 -right-10 size-32 rounded-full opacity-60 blur-2xl transition-opacity group-hover:opacity-100"
              />
              <div className="relative flex items-start justify-between gap-2">
                <span className="tint-bg tint-icon flex size-10 items-center justify-center rounded-2xl [&_svg]:size-[18px]">
                  <s.icon aria-hidden="true" />
                </span>
                {s.change !== undefined && (
                  <span
                    className={cn(
                      'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold',
                      down ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger',
                    )}
                  >
                    {down ? <ArrowDownRight className="size-3" aria-hidden="true" /> : <ArrowUpRight className="size-3" aria-hidden="true" />}
                    {Math.abs(s.change)}%
                  </span>
                )}
              </div>
              <div className="relative mt-4 flex flex-col gap-1">
                <p className="text-xs font-medium text-muted-foreground md:text-sm">{s.label}</p>
                <CountUp
                  value={s.value}
                  format={(n) => (s.money ? money(n) : Math.round(n).toString())}
                  className="truncate font-heading text-xl font-bold tabular-nums md:text-2xl"
                />
                <p className="text-xs text-muted-foreground">{s.hint}</p>
              </div>
            </div>
          </StaggerItem>
        )
      })}
    </Stagger>
  )
}
