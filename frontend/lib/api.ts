/**
 * Single entry point for every backend call.
 *
 * When NEXT_PUBLIC_API_URL is set, requests go to the Spring Boot REST API.
 * Otherwise each function resolves with in-memory mock data so the UI works standalone.
 */
import {
  computeBudgets,
  computeCustomerDetail,
  computeDashboard,
  computeWeather,
  db,
  DEMO_USERS,
} from './mock-data'
import type {
  AnalyticsSummaryDTO,
  AppNotification,
  AuthResponse,
  Budget,
  CategorySpendingDTO,
  ChangeLimitPayload,
  Customer,
  CustomerDetail,
  DailySpendingDTO,
  DashboardData,
  Expense,
  LoginPayload,
  MonthlySpendingDTO,
  NewBudget,
  NewExpense,
  NewRecurringExpense,
  PaymentMethodSpendingDTO,
  RecurringExpense,
  RegisterPayload,
  Role,
  User,
  Weather,
} from './types'

export const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? ''
export const USE_MOCK = !API_URL

let authToken: string | null = null

export function setAuthToken(token: string | null) {
  authToken = token
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message)
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  if (authToken) headers.set('Authorization', `Bearer ${authToken}`)

  const res = await fetch(`${API_URL}${path}`, { ...init, headers })
  if (!res.ok) {
    let message = res.statusText || 'Request failed'
    try {
      const body = await res.json()
      message = body.message ?? body.error ?? message
    } catch {}
    throw new ApiError(message, res.status)
  }
  if (res.status === 204) return undefined as T
  const text = await res.text()
  return (text ? JSON.parse(text) : undefined) as T
}

const json = (body: unknown) => JSON.stringify(body)

function mock<T>(produce: () => T, delay = 420): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(structuredClone(produce()))
      } catch (err) {
        reject(err)
      }
    }, delay)
  })
}

/* ------------------------------- Auth ------------------------------- */

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  if (USE_MOCK)
    return mock(() => ({
      id: Math.floor(Math.random() * 1000) + 10,
      name: payload.name,
      email: payload.email,
      role: payload.role,
      city: payload.city,
      country: payload.country,
      token: 'mock-token',
    }))
  const res = await request<any>('/api/auth/register', { method: 'POST', body: json(payload) })
  const roleCapitalized = (res.role ? res.role.charAt(0).toUpperCase() + res.role.slice(1).toLowerCase() : 'Customer') as Role
  return {
    ...res,
    id: res.id ?? res.userId,
    role: roleCapitalized,
  }
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  if (USE_MOCK)
    return mock(() => {
      if (payload.password.length < 6) throw new ApiError('Invalid email or password', 401)
      const user =
        DEMO_USERS.find((u) => u.email === payload.email.toLowerCase()) ??
        (payload.email.toLowerCase().includes('manager') ? DEMO_USERS[1] : DEMO_USERS[0])
      return { ...user, token: 'mock-token' }
    })
  const res = await request<any>('/api/auth/login', { method: 'POST', body: json(payload) })
  const roleCapitalized = (res.role ? res.role.charAt(0).toUpperCase() + res.role.slice(1).toLowerCase() : 'Customer') as Role
  return {
    ...res,
    id: res.id ?? res.userId,
    role: roleCapitalized,
  }
}

export function updateProfile(userId: number, data: Partial<Pick<User, 'name' | 'city' | 'country'>>): Promise<Partial<User>> {
  if (USE_MOCK) return mock(() => data)
  return request(`/api/users/${userId}`, { method: 'PUT', body: json(data) })
}

/* ----------------------------- Expenses ----------------------------- */

export function createExpense(userId: number, expense: NewExpense): Promise<Expense> {
  if (USE_MOCK)
    return mock(() => {
      const created: Expense = { ...expense, id: db.nextExpenseId++, userId }
      db.expenses.unshift(created)
      return created
    })
  return request(`/api/expenses/user/${userId}`, { method: 'POST', body: json(expense) })
}

export function getExpenses(userId: number): Promise<Expense[]> {
  if (USE_MOCK)
    return mock(() => [...db.expenses].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id), 650)
  return request(`/api/expenses/user/${userId}`)
}

export function getExpense(id: number): Promise<Expense> {
  if (USE_MOCK)
    return mock(() => {
      const found = db.expenses.find((e) => e.id === id)
      if (!found) throw new ApiError('Expense not found', 404)
      return found
    })
  return request(`/api/expenses/${id}`)
}

export function deleteExpense(id: number): Promise<void> {
  if (USE_MOCK)
    return mock(() => {
      db.expenses = db.expenses.filter((e) => e.id !== id)
    })
  return request(`/api/expenses/${id}`, { method: 'DELETE' })
}

/* ------------------------------ Budgets ----------------------------- */

export function createBudget(userId: number, budget: NewBudget): Promise<Budget> {
  if (USE_MOCK)
    return mock(() => {
      const created: Budget = { ...budget, id: db.nextBudgetId++, userId, spent: 0, endDate: budget.startDate }
      db.budgets = [...db.budgets.filter((b) => b.type !== budget.type), created]
      return computeBudgets().find((b) => b.id === created.id) ?? created
    })
  return request(`/api/budgets/user/${userId}`, { method: 'POST', body: json(budget) })
}

export function getBudgets(userId: number): Promise<Budget[]> {
  if (USE_MOCK) return mock(() => computeBudgets(), 550)
  return request(`/api/budgets/user/${userId}`)
}

export function changeBudgetLimit(budgetId: number, payload: ChangeLimitPayload): Promise<Budget> {
  if (USE_MOCK)
    return mock(() => {
      if (payload.currentPassword.length < 6) throw new ApiError('Current password is incorrect', 403)
      const budget = db.budgets.find((b) => b.id === budgetId)
      if (!budget) throw new ApiError('Budget not found', 404)
      budget.limitAmount = payload.newLimit
      return computeBudgets().find((b) => b.id === budgetId)!
    })
  return request(`/api/budgets/${budgetId}/limit`, { method: 'PUT', body: json(payload) })
}

/* ----------------------------- Dashboard ---------------------------- */

export function getDashboard(userId: number): Promise<DashboardData> {
  if (USE_MOCK) return mock(() => computeDashboard(), 600)
  return request(`/api/dashboard/user/${userId}`)
}

/* --------------------------- Notifications -------------------------- */

export function getNotifications(userId: number): Promise<AppNotification[]> {
  if (USE_MOCK) return mock(() => db.notifications, 400)
  return request(`/api/notifications/user/${userId}`)
}

export function markNotificationRead(id: number): Promise<void> {
  if (USE_MOCK)
    return mock(() => {
      const n = db.notifications.find((x) => x.id === id)
      if (n) n.read = true
    }, 150)
  return request(`/api/notifications/${id}/read`, { method: 'PUT' })
}

export function markAllNotificationsRead(userId: number): Promise<void> {
  if (USE_MOCK)
    return mock(() => {
      db.notifications.forEach((n) => (n.read = true))
    }, 200)
  return request(`/api/notifications/user/${userId}/read-all`, { method: 'PUT' })
}

export function getWeather(city: string): Promise<Weather> {
  if (USE_MOCK) return mock(() => computeWeather(city), 300)
  return request(`/api/weather?city=${encodeURIComponent(city)}`)
}

/* ------------------------------ Managers ---------------------------- */

export function assignCustomer(managerId: number, customerId: number): Promise<void> {
  if (USE_MOCK)
    return mock(() => {
      db.assignedCustomerIds.add(customerId)
    })
  return request(`/api/managers/${managerId}/customers/${customerId}`, { method: 'POST' })
}

export function getManagerCustomers(managerId: number): Promise<Customer[]> {
  if (USE_MOCK) return mock(() => db.customers.filter((c) => db.assignedCustomerIds.has(c.id)), 600)
  return request(`/api/managers/${managerId}/customers`)
}

export function getUnassignedCustomers(): Promise<Customer[]> {
  if (USE_MOCK) return mock(() => db.customers.filter((c) => !db.assignedCustomerIds.has(c.id)), 300)
  return request(`/api/customers?unassigned=true`)
}

export function getCustomerDetail(customerId: number): Promise<CustomerDetail> {
  if (USE_MOCK)
    return mock(() => {
      const c = db.customers.find((x) => x.id === customerId)
      if (!c) throw new ApiError('Customer not found', 404)
      return computeCustomerDetail(c)
    }, 450)
  return request(`/api/customers/${customerId}/detail`)
}

/* ----------------------------- Analytics ---------------------------- */

export function getAnalyticsSummary(startDate?: string, endDate?: string): Promise<AnalyticsSummaryDTO> {
  const params = new URLSearchParams()
  if (startDate) params.set('startDate', startDate)
  if (endDate) params.set('endDate', endDate)
  const q = params.toString() ? `?${params.toString()}` : ''
  if (USE_MOCK) {
    return mock(() => {
      const totalSpending = db.expenses.reduce((s, e) => s + e.amount, 0)
      return {
        totalSpending,
        todaySpending: 450,
        thisWeekSpending: 2300,
        thisMonthSpending: totalSpending,
        thisYearSpending: totalSpending,
        averageDailySpending: Math.round(totalSpending / 30),
        transactionCount: db.expenses.length,
        highestSpendingCategory: 'Food',
        highestSpendingDay: '2026-10-01',
        totalBudget: 25000,
        remainingBudget: 15000,
        budgetUsedPercentage: 40.0,
        categorySpending: [
          { category: 'FOOD', totalAmount: 3200, transactionCount: 4, percentage: 40 },
          { category: 'TRAVEL', totalAmount: 1500, transactionCount: 2, percentage: 20 },
          { category: 'BILLS', totalAmount: 2000, transactionCount: 1, percentage: 25 },
          { category: 'SHOPPING', totalAmount: 1200, transactionCount: 2, percentage: 15 },
        ],
        paymentMethodSpending: [
          { paymentMethod: 'UPI', totalAmount: 4500, transactionCount: 6, percentage: 55 },
          { paymentMethod: 'CREDIT_CARD', totalAmount: 2400, transactionCount: 2, percentage: 30 },
          { paymentMethod: 'CASH', totalAmount: 1000, transactionCount: 1, percentage: 15 },
        ],
        dailySpending: [],
        monthlySpending: [],
      }
    })
  }
  return request(`/api/analytics/summary${q}`)
}

export function getCategoryAnalytics(startDate?: string, endDate?: string): Promise<CategorySpendingDTO[]> {
  const params = new URLSearchParams()
  if (startDate) params.set('startDate', startDate)
  if (endDate) params.set('endDate', endDate)
  const q = params.toString() ? `?${params.toString()}` : ''
  return request(`/api/analytics/categories${q}`)
}

export function getPaymentMethodAnalytics(startDate?: string, endDate?: string): Promise<PaymentMethodSpendingDTO[]> {
  const params = new URLSearchParams()
  if (startDate) params.set('startDate', startDate)
  if (endDate) params.set('endDate', endDate)
  const q = params.toString() ? `?${params.toString()}` : ''
  return request(`/api/analytics/payment-methods${q}`)
}

export function getMonthlyAnalytics(year?: number): Promise<MonthlySpendingDTO[]> {
  const q = year ? `?year=${year}` : ''
  return request(`/api/analytics/monthly${q}`)
}

export function getDailyAnalytics(startDate?: string, endDate?: string): Promise<DailySpendingDTO[]> {
  const params = new URLSearchParams()
  if (startDate) params.set('startDate', startDate)
  if (endDate) params.set('endDate', endDate)
  const q = params.toString() ? `?${params.toString()}` : ''
  return request(`/api/analytics/daily${q}`)
}

/* ------------------------------ Reports ----------------------------- */

export async function downloadExpenseCsv(startDate?: string, endDate?: string): Promise<void> {
  const params = new URLSearchParams()
  if (startDate) params.set('startDate', startDate)
  if (endDate) params.set('endDate', endDate)
  const q = params.toString() ? `?${params.toString()}` : ''

  const headers = new Headers()
  if (authToken) headers.set('Authorization', `Bearer ${authToken}`)

  const res = await fetch(`${API_URL}/api/reports/expenses/csv${q}`, { headers })
  if (!res.ok) throw new ApiError('Failed to download CSV report', res.status)

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `expenses-${startDate || 'all'}-to-${endDate || 'now'}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export async function downloadExpensePdf(startDate?: string, endDate?: string): Promise<void> {
  const params = new URLSearchParams()
  if (startDate) params.set('startDate', startDate)
  if (endDate) params.set('endDate', endDate)
  const q = params.toString() ? `?${params.toString()}` : ''

  const headers = new Headers()
  if (authToken) headers.set('Authorization', `Bearer ${authToken}`)

  const res = await fetch(`${API_URL}/api/reports/expenses/pdf${q}`, { headers })
  if (!res.ok) throw new ApiError('Failed to download PDF report', res.status)

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `expense-report-${startDate || 'all'}-to-${endDate || 'now'}.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/* ------------------------ Recurring Expenses ------------------------ */

const mockRecurringExpenses: RecurringExpense[] = [
  {
    id: 1,
    description: 'Netflix Subscription',
    amount: 649,
    category: 'SUBSCRIPTIONS',
    paymentMethod: 'CREDIT_CARD',
    frequency: 'MONTHLY',
    startDate: '2026-01-01',
    nextDueDate: '2026-11-01',
    active: true,
  },
  {
    id: 2,
    description: 'House Rent',
    amount: 18000,
    category: 'RENT',
    paymentMethod: 'BANK_TRANSFER',
    frequency: 'MONTHLY',
    startDate: '2026-01-05',
    nextDueDate: '2026-11-05',
    active: true,
  },
]

export function getRecurringExpenses(): Promise<RecurringExpense[]> {
  if (USE_MOCK) return mock(() => [...mockRecurringExpenses], 400)
  return request('/api/recurring-expenses')
}

export function getRecurringExpense(id: number): Promise<RecurringExpense> {
  if (USE_MOCK) {
    return mock(() => {
      const found = mockRecurringExpenses.find((r) => r.id === id)
      if (!found) throw new ApiError('Recurring expense not found', 404)
      return found
    })
  }
  return request(`/api/recurring-expenses/${id}`)
}

export function createRecurringExpense(payload: NewRecurringExpense): Promise<RecurringExpense> {
  if (USE_MOCK) {
    return mock(() => {
      const created: RecurringExpense = {
        ...payload,
        id: Math.floor(Math.random() * 9000) + 100,
        nextDueDate: payload.nextDueDate || payload.startDate,
        active: true,
      }
      mockRecurringExpenses.push(created)
      return created
    })
  }
  return request('/api/recurring-expenses', { method: 'POST', body: json(payload) })
}

export function updateRecurringExpense(id: number, payload: Partial<RecurringExpense>): Promise<RecurringExpense> {
  if (USE_MOCK) {
    return mock(() => {
      const index = mockRecurringExpenses.findIndex((r) => r.id === id)
      if (index === -1) throw new ApiError('Recurring expense not found', 404)
      mockRecurringExpenses[index] = { ...mockRecurringExpenses[index], ...payload }
      return mockRecurringExpenses[index]
    })
  }
  return request(`/api/recurring-expenses/${id}`, { method: 'PUT', body: json(payload) })
}

export function deleteRecurringExpense(id: number): Promise<void> {
  if (USE_MOCK) {
    return mock(() => {
      const idx = mockRecurringExpenses.findIndex((r) => r.id === id)
      if (idx !== -1) mockRecurringExpenses.splice(idx, 1)
    })
  }
  return request(`/api/recurring-expenses/${id}`, { method: 'DELETE' })
}

export function pauseRecurringExpense(id: number): Promise<RecurringExpense> {
  if (USE_MOCK) {
    return mock(() => {
      const item = mockRecurringExpenses.find((r) => r.id === id)
      if (item) item.active = false
      return item!
    })
  }
  return request(`/api/recurring-expenses/${id}/pause`, { method: 'PATCH' })
}

export function resumeRecurringExpense(id: number): Promise<RecurringExpense> {
  if (USE_MOCK) {
    return mock(() => {
      const item = mockRecurringExpenses.find((r) => r.id === id)
      if (item) item.active = true
      return item!
    })
  }
  return request(`/api/recurring-expenses/${id}/resume`, { method: 'PATCH' })
}
