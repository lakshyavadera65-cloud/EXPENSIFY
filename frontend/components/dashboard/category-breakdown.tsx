'use client'

import { useMemo, useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { Panel, PanelHeader } from '@/components/shared/page'
import { getCategoryColor } from '@/lib/constants'
import { useMoney } from '@/lib/preferences-context'
import type { Expense } from '@/lib/types'
import { cn } from '@/lib/utils'

export function categoryTotals(expenses: Expense[]) {
  const map = new Map<string, number>()
  for (const e of expenses) map.set(e.category, (map.get(e.category) ?? 0) + e.amount)
  return [...map.entries()]
    .map(([category, amount]) => ({ category, amount, color: getCategoryColor(category) }))
    .sort((a, b) => b.amount - a.amount)
}

export function CategoryBreakdown({ expenses }: { expenses?: Expense[] }) {
  const money = useMoney()
  const [active, setActive] = useState<string | null>(null)
  const data = useMemo(() => categoryTotals(expenses ?? []), [expenses])
  const total = data.reduce((s, d) => s + d.amount, 0)
  const focused = data.find((d) => d.category === active)

  return (
    <Panel className="flex flex-col">
      <PanelHeader title="By category" description="Where your money goes" />
      {!expenses ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : (
        <div className="flex flex-col gap-5">
          <div className="relative mx-auto size-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="amount"
                  nameKey="category"
                  innerRadius="70%"
                  outerRadius="100%"
                  paddingAngle={3}
                  cornerRadius={6}
                  stroke="none"
                  animationDuration={900}
                  onMouseLeave={() => setActive(null)}
                >
                  {data.map((d) => (
                    <Cell
                      key={d.category}
                      fill={d.color}
                      opacity={!active || active === d.category ? 1 : 0.3}
                      onMouseEnter={() => setActive(d.category)}
                      className="cursor-pointer outline-none transition-opacity"
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xs text-muted-foreground">{focused?.category ?? 'Total'}</span>
              <span className="font-heading text-lg font-bold tabular-nums">{money(focused?.amount ?? total, { compact: true })}</span>
            </div>
          </div>
          <ul className="flex flex-col gap-1">
            {data.slice(0, 5).map((d) => {
              const pct = total ? Math.round((d.amount / total) * 100) : 0
              return (
                <li key={d.category}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(d.category)}
                    onMouseLeave={() => setActive(null)}
                    onFocus={() => setActive(d.category)}
                    onBlur={() => setActive(null)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted',
                      active === d.category && 'bg-muted',
                    )}
                  >
                    <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: d.color }} aria-hidden="true" />
                    <span className="flex-1 truncate">{d.category}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">{pct}%</span>
                    <span className="w-20 text-right font-medium tabular-nums">{money(d.amount, { compact: true })}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </Panel>
  )
}
