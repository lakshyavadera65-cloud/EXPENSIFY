import type { Budget, BudgetType } from './types'

export const BUDGET_LABELS: Record<BudgetType, string> = {
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
  YEARLY: 'Yearly',
}

export const BUDGET_ORDER: BudgetType[] = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']

export function usagePercent(b: Pick<Budget, 'spent' | 'limitAmount'>) {
  if (!b.limitAmount) return 0
  return Math.round((b.spent / b.limitAmount) * 100)
}

export function usageTone(pct: number) {
  if (pct >= 100) return { label: 'Over limit', color: '#FB7185' }
  if (pct >= 90) return { label: 'Critical', color: '#FB7185' }
  if (pct >= 80) return { label: 'Near limit', color: '#FBBF24' }
  return { label: 'On track', color: '#34D399' }
}
