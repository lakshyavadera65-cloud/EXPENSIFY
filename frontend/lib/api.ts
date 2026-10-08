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
  AppNotification,
  AuthResponse,
  Budget,
  ChangeLimitPayload,
  Customer,
  CustomerDetail,
  DashboardData,
  Expense,
  LoginPayload,
  NewBudget,
  NewExpense,
  RegisterPayload,
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
