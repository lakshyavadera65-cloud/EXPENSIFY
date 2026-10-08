'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Panel, PanelHeader } from '@/components/shared/page'
import { BUDGET_LABELS, BUDGET_ORDER, usagePercent, usageTone } from '@/lib/budget'
import { useBudgets } from '@/lib/hooks'
import { useMoney } from '@/lib/preferences-context'

export function BudgetOverview() {
  const money = useMoney()
  const { data } = useBudgets()
  const budgets = data ? [...data].sort((a, b) => BUDGET_ORDER.indexOf(a.type) - BUDGET_ORDER.indexOf(b.type)) : undefined

  return (
    <Panel>
      <PanelHeader
        title="Budget health"
        action={
          <Button variant="ghost" size="icon-sm" render={<Link href="/budgets" />} nativeButton={false} aria-label="Manage budgets">
            <ArrowRight />
          </Button>
        }
      />
      <div className="flex flex-col gap-4">
        {!budgets
          ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-xl" />)
          : budgets.map((b) => {
              const pct = usagePercent(b)
              const tone = usageTone(pct)
              return (
                <div key={b.id} className="flex flex-col gap-2">
                  <div className="flex items-baseline justify-between gap-2 text-sm">
                    <span className="font-medium">{BUDGET_LABELS[b.type]}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {money(b.spent, { compact: true })} / {money(b.limitAmount, { compact: true })}
                    </span>
                  </div>
                  <div
                    className="h-2 overflow-hidden rounded-full bg-muted"
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${BUDGET_LABELS[b.type]} budget used`}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: tone.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(pct, 100)}%` }}
                      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                </div>
              )
            })}
      </div>
    </Panel>
  )
}
