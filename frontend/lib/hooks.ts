'use client'

import useSWR, { useSWRConfig } from 'swr'
import { useCallback } from 'react'
import * as api from './api'
import { useAuth } from './auth-context'
import type { NewBudget, NewExpense, NewRecurringExpense, RecurringExpense } from './types'

export function useExpenses() {
  const { user } = useAuth()
  return useSWR(user ? ['expenses', user.id] : null, ([, id]) => api.getExpenses(id))
}

export function useBudgets() {
  const { user } = useAuth()
  return useSWR(user ? ['budgets', user.id] : null, ([, id]) => api.getBudgets(id))
}

export function useDashboard() {
  const { user } = useAuth()
  return useSWR(user ? ['dashboard', user.id] : null, ([, id]) => api.getDashboard(id))
}

export function useAnalyticsSummary(startDate?: string, endDate?: string) {
  const { user } = useAuth()
  return useSWR(user ? ['analytics', user.id, startDate, endDate] : null, () =>
    api.getAnalyticsSummary(startDate, endDate),
  )
}

export function useRecurringExpenses() {
  const { user } = useAuth()
  return useSWR(user ? ['recurring-expenses', user.id] : null, () => api.getRecurringExpenses())
}

export function useNotifications() {
  const { user } = useAuth()
  return useSWR(user ? ['notifications', user.id] : null, ([, id]) => api.getNotifications(id))
}

export function useWeather() {
  const { user } = useAuth()
  const city = user?.city || 'Bengaluru'
  return useSWR(user ? ['weather', city] : null, ([, c]) => api.getWeather(c))
}

export function useManagerCustomers() {
  const { user } = useAuth()
  return useSWR(user?.role === 'Manager' ? ['customers', user.id] : null, ([, id]) => api.getManagerCustomers(id))
}

export function useCustomerDetail(customerId: number | null) {
  return useSWR(customerId ? ['customer', customerId] : null, ([, id]) => api.getCustomerDetail(id))
}

/** Revalidates every spending-related cache after a mutation. */
function useRefreshSpending() {
  const { mutate } = useSWRConfig()
  return useCallback(
    () =>
      mutate(
        (key) =>
          Array.isArray(key) &&
          ['expenses', 'budgets', 'dashboard', 'notifications', 'analytics', 'recurring-expenses'].includes(
            key[0] as string,
          ),
      ),
    [mutate],
  )
}

export function useExpenseActions() {
  const { user } = useAuth()
  const refresh = useRefreshSpending()
  const add = useCallback(
    async (expense: NewExpense) => {
      if (!user) throw new Error('Not signed in')
      const created = await api.createExpense(user.id, expense)
      await refresh()
      return created
    },
    [user, refresh],
  )
  const remove = useCallback(
    async (id: number) => {
      await api.deleteExpense(id)
      await refresh()
    },
    [refresh],
  )
  return { add, remove }
}

export function useBudgetActions() {
  const { user } = useAuth()
  const refresh = useRefreshSpending()
  const create = useCallback(
    async (budget: NewBudget) => {
      if (!user) throw new Error('Not signed in')
      await api.createBudget(user.id, budget)
      await refresh()
    },
    [user, refresh],
  )
  const changeLimit = useCallback(
    async (budgetId: number, newLimit: number, currentPassword: string) => {
      await api.changeBudgetLimit(budgetId, { newLimit, currentPassword })
      await refresh()
    },
    [refresh],
  )
  return { create, changeLimit }
}

export function useRecurringActions() {
  const refresh = useRefreshSpending()
  const create = useCallback(
    async (payload: NewRecurringExpense) => {
      const res = await api.createRecurringExpense(payload)
      await refresh()
      return res
    },
    [refresh],
  )
  const update = useCallback(
    async (id: number, payload: Partial<RecurringExpense>) => {
      const res = await api.updateRecurringExpense(id, payload)
      await refresh()
      return res
    },
    [refresh],
  )
  const remove = useCallback(
    async (id: number) => {
      await api.deleteRecurringExpense(id)
      await refresh()
    },
    [refresh],
  )
  const pause = useCallback(
    async (id: number) => {
      const res = await api.pauseRecurringExpense(id)
      await refresh()
      return res
    },
    [refresh],
  )
  const resume = useCallback(
    async (id: number) => {
      const res = await api.resumeRecurringExpense(id)
      await refresh()
      return res
    },
    [refresh],
  )
  return { create, update, remove, pause, resume }
}
