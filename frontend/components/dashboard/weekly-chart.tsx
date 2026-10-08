'use client'

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { Panel, PanelHeader } from '@/components/shared/page'
import { useMoney } from '@/lib/preferences-context'
import type { DashboardData } from '@/lib/types'

export function WeeklyChart({ weekly }: { weekly?: DashboardData['weekly'] }) {
  const money = useMoney()
  const thisWeek = weekly?.reduce((s, d) => s + d.thisWeek, 0) ?? 0
  const lastWeek = weekly?.reduce((s, d) => s + d.lastWeek, 0) ?? 0

  return (
    <Panel>
      <PanelHeader
        title="This week vs last"
        description={weekly ? `${money(thisWeek)} so far, ${money(lastWeek)} last week` : 'Loading'}
        action={
          <div className="hidden items-center gap-3 text-xs text-muted-foreground sm:flex">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-brand" aria-hidden="true" />
              This week
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-muted-foreground/40" aria-hidden="true" />
              Last week
            </span>
          </div>
        }
      />
      {!weekly ? (
        <Skeleton className="h-56 w-full rounded-2xl" />
      ) : (
        <div className="h-56 w-full" role="img" aria-label="Bar chart comparing daily spending this week and last week">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekly} barGap={4} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 6" />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={10} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
              <Tooltip
                cursor={{ fill: 'var(--muted)', radius: 8 }}
                content={({ active, payload, label }) =>
                  active && payload?.length ? (
                    <div className="glass rounded-xl border px-3 py-2 text-xs shadow-lg">
                      <p className="mb-1 text-muted-foreground">{label}</p>
                      <p className="font-semibold tabular-nums">This week: {money(Number(payload[0]?.value ?? 0))}</p>
                      <p className="text-muted-foreground tabular-nums">Last week: {money(Number(payload[1]?.value ?? 0))}</p>
                    </div>
                  ) : null
                }
              />
              <Bar dataKey="thisWeek" fill="var(--brand)" radius={[8, 8, 4, 4]} maxBarSize={22} animationDuration={800} />
              <Bar dataKey="lastWeek" fill="var(--muted-foreground)" fillOpacity={0.3} radius={[8, 8, 4, 4]} maxBarSize={22} animationDuration={800} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Panel>
  )
}
