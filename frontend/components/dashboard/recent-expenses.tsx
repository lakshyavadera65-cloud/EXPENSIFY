'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Panel, PanelHeader } from '@/components/shared/page'
import { ExpenseRow } from '@/components/expenses/expense-row'
import type { Expense } from '@/lib/types'

export function RecentExpenses({ expenses }: { expenses?: Expense[] }) {
  return (
    <Panel>
      <PanelHeader
        title="Recent expenses"
        description="Your latest transactions"
        action={
          <Button variant="ghost" size="sm" render={<Link href="/expenses" />} nativeButton={false}>
            View all
            <ArrowRight data-icon="inline-end" />
          </Button>
        }
      />
      <div className="flex flex-col gap-1">
        {!expenses
          ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-2xl" />)
          : expenses.slice(0, 6).map((e) => <ExpenseRow key={e.id} expense={e} />)}
      </div>
    </Panel>
  )
}
