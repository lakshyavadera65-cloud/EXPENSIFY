'use client'

import { useMemo, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Skeleton } from '@/components/ui/skeleton'
import { ChartTooltip, Panel, PanelHeader } from '@/components/shared/page'
import { useMoney } from '@/lib/preferences-context'
import type { DailyTotal } from '@/lib/types'

const RANGES = [
  { value: '7', label: '7D' },
  { value: '30', label: '30D' },
  { value: '90', label: '90D' },
]

export function SpendingChart({ daily }: { daily?: DailyTotal[] }) {
  const money = useMoney()
  const [range, setRange] = useState('30')

  const data = useMemo(() => (daily ?? []).slice(-Number(range)), [daily, range])
  const total = data.reduce((s, d) => s + d.amount, 0)
  const avg = data.length ? total / data.length : 0

  return (
    <Panel className="flex flex-col">
      <PanelHeader
        title="Spending trend"
        description={daily ? `${money(total)} total, ${money(avg)} daily average` : 'Loading your activity'}
        action={
          <ToggleGroup
            value={[range]}
            onValueChange={(v) => v[0] && setRange(v[0])}
            variant="outline"
            size="sm"
            aria-label="Date range"
          >
            {RANGES.map((r) => (
              <ToggleGroupItem key={r.value} value={r.value} className="px-3 text-xs">
                {r.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        }
      />
      {!daily ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : (
        <div className="h-64 w-full" role="img" aria-label={`Area chart of daily spending over the last ${range} days`}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 6" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                minTickGap={28}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                tickFormatter={(d: string) => format(parseISO(d), 'd MMM')}
              />
              <YAxis
                width={52}
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                tickFormatter={(n: number) => money(n, { compact: true })}
              />
              <Tooltip
                cursor={{ stroke: 'var(--brand)', strokeWidth: 1, strokeDasharray: '4 4' }}
                content={({ active, payload }) =>
                  active && payload?.[0] ? (
                    <ChartTooltip
                      label={format(parseISO(payload[0].payload.date), 'EEE, d MMM')}
                      value={money(Number(payload[0].value))}
                      color="var(--brand)"
                    />
                  ) : null
                }
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="var(--brand)"
                strokeWidth={2.5}
                fill="url(#spendFill)"
                animationDuration={900}
                activeDot={{ r: 5, strokeWidth: 3, stroke: 'var(--card)', fill: 'var(--brand)' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Panel>
  )
}
