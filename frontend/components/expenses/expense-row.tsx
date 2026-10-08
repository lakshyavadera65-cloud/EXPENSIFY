'use client'

import { format, parseISO } from 'date-fns'
import { CategoryIcon } from '@/components/shared/category'
import { useMoney } from '@/lib/preferences-context'
import type { Expense } from '@/lib/types'

export function ExpenseRow({ expense, action }: { expense: Expense; action?: React.ReactNode }) {
  const money = useMoney()
  return (
    <div className="flex items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-muted/60">
      <CategoryIcon category={expense.category} />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium">{expense.title}</span>
        <span className="truncate text-xs text-muted-foreground">
          {expense.category} {expense.paymentMethod ? `· ${expense.paymentMethod}` : ''} · {format(parseISO(expense.date), 'd MMM')}
        </span>
      </div>
      <span className="font-heading text-sm font-semibold tabular-nums">-{money(expense.amount)}</span>
      {action}
    </div>
  )
}
