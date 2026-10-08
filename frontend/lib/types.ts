export type Role = 'Customer' | 'Employee' | 'Manager' | 'Head' | 'Admin'

export const ROLES: Role[] = ['Customer', 'Employee', 'Manager', 'Head', 'Admin']

export interface User {
  id: number
  name: string
  email: string
  role: Role
  city?: string
  country?: string
}

export interface AuthResponse extends User {
  token?: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  role: Role
  city: string
  country: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface Expense {
  id: number
  userId: number
  title: string
  description?: string
  category: string
  amount: number
  /** ISO date string (yyyy-mm-dd) */
  date: string
}

export type NewExpense = Omit<Expense, 'id' | 'userId'>

export type BudgetType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'

export interface Budget {
  id: number
  userId: number
  type: BudgetType
  budgetAmount: number
  limitAmount: number
  spent: number
  startDate: string
  endDate: string
}

export interface NewBudget {
  type: BudgetType
  budgetAmount: number
  limitAmount: number
  startDate: string
}

export interface ChangeLimitPayload {
  newLimit: number
  currentPassword: string
}

export type NotificationKind = 'BUDGET' | 'WEATHER' | 'PAYMENT' | 'INFO'
export type Severity = 'info' | 'warning' | 'danger' | 'success'

export interface AppNotification {
  id: number
  kind: NotificationKind
  severity: Severity
  title: string
  message: string
  createdAt: string
  read: boolean
  threshold?: number
}

export interface DailyTotal {
  date: string
  amount: number
}

export interface DashboardData {
  todayTotal: number
  todayChange: number
  monthTotal: number
  monthChange: number
  budgetRemaining: number
  activeAlerts: number
  daily: DailyTotal[]
  monthly: { month: string; amount: number }[]
  weekly: { day: string; thisWeek: number; lastWeek: number }[]
}

export type CustomerStatus = 'On track' | 'Near limit' | 'Over budget'

export interface Customer {
  id: number
  name: string
  email: string
  city: string
  totalSpend: number
  monthlyLimit: number
  status: CustomerStatus
}

export interface CustomerDetail extends Customer {
  expenses: Expense[]
  budgets: Budget[]
  daily: DailyTotal[]
}

export interface Weather {
  city: string
  temperature: number
  condition: string
  warning?: string
}
