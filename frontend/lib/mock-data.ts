import { addDays, format, startOfWeek, subDays, parseISO, isSameDay, isSameMonth, isWithinInterval, endOfWeek } from 'date-fns'
import { APP_CONFIG } from './config'
import { CATEGORIES } from './constants'
import type {
  AppNotification,
  Budget,
  Customer,
  CustomerDetail,
  CustomerStatus,
  DashboardData,
  Expense,
  User,
  Weather,
} from './types'

const TODAY = APP_CONFIG.today
const iso = (d: Date) => format(d, 'yyyy-MM-dd')

export const DEMO_USERS: User[] = [
  { id: 1, name: 'Lakshya Vadera', email: 'lakshya@expensify.app', role: 'Customer', city: 'Bengaluru', country: 'India' },
  { id: 2, name: 'Lakshya Vadera', email: 'manager@expensify.app', role: 'Manager', city: 'Bengaluru', country: 'India' },
]

type Seed = [day: string, title: string, category: string, amount: number, description?: string]

const SEED: Seed[] = [
  ['2026-10-08', 'Swiggy lunch', 'Food', 460, 'Paneer thali with team'],
  ['2026-10-08', 'Uber to office', 'Travel', 380],
  ['2026-10-08', 'Apollo Pharmacy', 'Health', 1020, 'Monthly medicines'],
  ['2026-10-07', 'BESCOM electricity', 'Bills', 3200],
  ['2026-10-07', 'Starbucks', 'Food', 540],
  ['2026-10-06', 'Myntra order', 'Shopping', 4800, 'Festive kurta set'],
  ['2026-10-06', 'PVR movie night', 'Entertainment', 900],
  ['2026-10-05', 'BigBasket groceries', 'Food', 2650],
  ['2026-10-05', 'Udemy course', 'Education', 1499, 'Spring Boot masterclass'],
  ['2026-10-04', 'IndiGo flight', 'Travel', 6850, 'BLR to DEL'],
  ['2026-10-03', 'Netflix', 'Entertainment', 649],
  ['2026-10-03', 'Cult.fit membership', 'Health', 1500],
  ['2026-10-02', 'ACT Fibernet', 'Bills', 1179],
  ['2026-10-02', 'Zomato dinner', 'Food', 620],
  ['2026-10-01', 'Amazon order', 'Shopping', 3240],
  ['2026-10-01', 'Books from Blossom', 'Education', 1213],
  ['2026-10-01', 'Dinner at Toit', 'Food', 2000],
  ['2026-09-30', 'Zomato dinner', 'Food', 780],
  ['2026-09-30', 'Ola ride', 'Travel', 320],
  ['2026-09-29', 'Jio recharge', 'Bills', 599],
  ['2026-09-28', 'Concert tickets', 'Entertainment', 2400],
  ['2026-09-28', 'Third Wave Coffee', 'Food', 380],
  ['2026-09-27', 'Decathlon', 'Shopping', 2150],
  ['2026-09-26', 'Dentist visit', 'Health', 1800],
  ['2026-09-25', 'Weekly groceries', 'Food', 2240],
  ['2026-09-24', 'IRCTC train', 'Travel', 1460],
  ['2026-09-23', 'Coursera Plus', 'Education', 2999],
  ['2026-09-22', 'BWSSB water bill', 'Bills', 450],
  ['2026-09-22', 'Office lunch', 'Food', 340],
  ['2026-09-20', 'Spotify', 'Entertainment', 119],
  ['2026-09-20', 'Nike sneakers', 'Shopping', 5499],
  ['2026-09-18', 'BESCOM electricity', 'Bills', 2860],
  ['2026-09-17', 'Uber ride', 'Travel', 290],
  ['2026-09-17', 'Breakfast at CTR', 'Food', 260],
  ['2026-09-15', 'Vitamins', 'Health', 940],
  ['2026-09-14', 'Hotel in Goa', 'Travel', 7200],
  ['2026-09-13', 'Bowling with friends', 'Entertainment', 1100],
  ['2026-09-12', 'Stationery', 'Education', 640],
  ['2026-09-11', 'Groceries', 'Food', 1980],
  ['2026-09-10', 'Indane gas cylinder', 'Bills', 1050],
  ['2026-09-09', 'Sony headphones', 'Shopping', 3499],
]

export const db = {
  expenses: SEED.map<Expense>(([date, title, category, amount, description], i) => ({
    id: i + 1,
    userId: 1,
    title,
    category,
    amount,
    date,
    description,
  })),
  nextExpenseId: SEED.length + 1,
  budgets: [] as Budget[],
  nextBudgetId: 5,
  notifications: [] as AppNotification[],
  customers: [] as Customer[],
  assignedCustomerIds: new Set<number>(),
}

function sumWhere(predicate: (d: Date) => boolean) {
  return db.expenses.filter((e) => predicate(parseISO(e.date))).reduce((s, e) => s + e.amount, 0)
}

const weekOpts = { weekStartsOn: 1 as const }

export function computeBudgets(): Budget[] {
  const daily = sumWhere((d) => isSameDay(d, TODAY))
  const weekly = sumWhere((d) =>
    isWithinInterval(d, { start: startOfWeek(TODAY, weekOpts), end: endOfWeek(TODAY, weekOpts) }),
  )
  const monthly = sumWhere((d) => isSameMonth(d, TODAY))
  const spentFor: Record<string, number> = {
    DAILY: daily,
    WEEKLY: weekly,
    MONTHLY: monthly,
    YEARLY: 349700 + monthly,
  }
  return db.budgets.map((b) => ({ ...b, spent: spentFor[b.type] ?? b.spent }))
}

db.budgets = [
  { id: 1, userId: 1, type: 'DAILY', budgetAmount: 2000, limitAmount: 2500, spent: 0, startDate: '2026-10-08', endDate: '2026-10-08' },
  { id: 2, userId: 1, type: 'WEEKLY', budgetAmount: 15000, limitAmount: 18000, spent: 0, startDate: '2026-10-05', endDate: '2026-10-11' },
  { id: 3, userId: 1, type: 'MONTHLY', budgetAmount: 45000, limitAmount: 48000, spent: 0, startDate: '2026-10-01', endDate: '2026-10-31' },
  { id: 4, userId: 1, type: 'YEARLY', budgetAmount: 480000, limitAmount: 500000, spent: 0, startDate: '2026-01-01', endDate: '2026-12-31' },
]

const hoursAgo = (h: number) => new Date(TODAY.getTime() - h * 3600_000).toISOString()

db.notifications = [
  { id: 1, kind: 'BUDGET', severity: 'warning', threshold: 85, title: 'Weekly budget at 85%', message: 'You have used 85% of your ₹18,000 weekly limit with 4 days to go.', createdAt: hoursAgo(1), read: false },
  { id: 2, kind: 'WEATHER', severity: 'info', title: 'Heavy rain expected in Bengaluru', message: 'Expect cab surge pricing this evening. Consider leaving early or taking the metro.', createdAt: hoursAgo(3), read: false },
  { id: 3, kind: 'PAYMENT', severity: 'danger', title: 'UPI payments may fail', message: 'HDFC Bank reports intermittent UPI downtime between 6 PM and 8 PM today.', createdAt: hoursAgo(5), read: false },
  { id: 4, kind: 'BUDGET', severity: 'warning', threshold: 80, title: 'Weekly budget at 80%', message: 'Heads up, you crossed 80% of your weekly budget.', createdAt: hoursAgo(26), read: true },
  { id: 5, kind: 'BUDGET', severity: 'success', title: 'Monthly budget on track', message: 'You are 12% under your monthly average. Nice work!', createdAt: hoursAgo(30), read: true },
  { id: 6, kind: 'INFO', severity: 'info', title: 'New expense categories', message: 'You can now add custom categories when logging an expense.', createdAt: hoursAgo(48), read: true },
  { id: 7, kind: 'BUDGET', severity: 'danger', threshold: 100, title: 'Daily limit reached on Oct 4', message: 'Your IndiGo flight pushed daily spend to 274% of the limit.', createdAt: hoursAgo(98), read: true },
  { id: 8, kind: 'BUDGET', severity: 'danger', threshold: 95, title: 'Daily budget at 95%', message: 'You are close to your ₹2,500 daily limit.', createdAt: hoursAgo(120), read: true },
  { id: 9, kind: 'WEATHER', severity: 'info', title: 'Clear skies this weekend', message: 'Great weather for outdoor plans. Bengaluru will be 27°C and sunny.', createdAt: hoursAgo(150), read: true },
  { id: 10, kind: 'PAYMENT', severity: 'danger', title: 'Card network maintenance', message: 'RuPay transactions were paused from 1 AM to 3 AM for scheduled maintenance.', createdAt: hoursAgo(200), read: true },
  { id: 11, kind: 'BUDGET', severity: 'warning', threshold: 90, title: 'Monthly budget at 90% (September)', message: 'September closed at 90% of the monthly limit.', createdAt: hoursAgo(220), read: true },
  { id: 12, kind: 'INFO', severity: 'success', title: 'Welcome to Expensify', message: 'Your account is set up. Start by adding your first expense.', createdAt: hoursAgo(400), read: true },
]

const CUSTOMER_NAMES: [string, string][] = [
  ['Aarav Sharma', 'Mumbai'], ['Diya Patel', 'Ahmedabad'], ['Vihaan Gupta', 'Delhi'], ['Ananya Iyer', 'Chennai'],
  ['Arjun Reddy', 'Hyderabad'], ['Ishita Banerjee', 'Kolkata'], ['Kabir Singh', 'Chandigarh'], ['Meera Nair', 'Kochi'],
  ['Rohan Mehta', 'Pune'], ['Saanvi Joshi', 'Jaipur'], ['Aditya Rao', 'Bengaluru'], ['Kavya Menon', 'Thiruvananthapuram'],
  ['Reyansh Kapoor', 'Delhi'], ['Tara Desai', 'Surat'], ['Vivaan Malhotra', 'Gurugram'], ['Myra Kulkarni', 'Nagpur'],
  ['Atharv Chawla', 'Lucknow'], ['Riya Bose', 'Kolkata'], ['Shaurya Verma', 'Indore'], ['Anika Pillai', 'Mysuru'],
  ['Krish Agarwal', 'Bhopal'], ['Navya Saxena', 'Noida'], ['Dhruv Bhatt', 'Vadodara'], ['Pari Thakur', 'Shimla'],
  ['Yash Kohli', 'Amritsar'],
]

function seeded(n: number) {
  const x = Math.sin(n * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

db.customers = CUSTOMER_NAMES.map(([name, city], i) => {
  const monthlyLimit = Math.round((25000 + seeded(i + 1) * 45000) / 1000) * 1000
  const ratio = 0.45 + seeded(i + 50) * 0.75
  const totalSpend = Math.round(monthlyLimit * ratio)
  const status: CustomerStatus = ratio >= 1 ? 'Over budget' : ratio >= 0.85 ? 'Near limit' : 'On track'
  return {
    id: 100 + i,
    name,
    email: `${name.split(' ')[0].toLowerCase()}.${name.split(' ')[1].toLowerCase()}@mail.com`,
    city,
    totalSpend,
    monthlyLimit,
    status,
  }
})
db.customers.slice(0, 22).forEach((c) => db.assignedCustomerIds.add(c.id))

export function computeDashboard(): DashboardData {
  const todayTotal = sumWhere((d) => isSameDay(d, TODAY))
  const monthTotal = sumWhere((d) => isSameMonth(d, TODAY))
  const budgets = computeBudgets()
  const monthly = budgets.find((b) => b.type === 'MONTHLY')

  const daily = Array.from({ length: 90 }, (_, i) => {
    const day = subDays(TODAY, 89 - i)
    const fromExpenses = sumWhere((d) => isSameDay(d, day))
    const inRealRange = 89 - i < 30
    return {
      date: iso(day),
      amount: inRealRange ? fromExpenses : Math.round(seeded(i + 7) * 3600 + 200),
    }
  })

  const sept = sumWhere((d) => d.getMonth() === 8)
  const monthlyTrend = [
    { month: 'May', amount: 41200 },
    { month: 'Jun', amount: 38900 },
    { month: 'Jul', amount: 44600 },
    { month: 'Aug', amount: 39800 },
    { month: 'Sep', amount: sept + 8600 },
    { month: 'Oct', amount: monthTotal },
  ]

  const thisWeekStart = startOfWeek(TODAY, weekOpts)
  const lastWeekStart = subDays(thisWeekStart, 7)
  const weekly = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => ({
    day,
    thisWeek: sumWhere((d) => isSameDay(d, addDays(thisWeekStart, i))),
    lastWeek: sumWhere((d) => isSameDay(d, addDays(lastWeekStart, i))),
  }))

  return {
    todayTotal,
    todayChange: -8.4,
    monthTotal,
    monthChange: -12,
    budgetRemaining: monthly ? Math.max(monthly.limitAmount - monthly.spent, 0) : 0,
    activeAlerts: db.notifications.filter((n) => !n.read).length,
    daily,
    monthly: monthlyTrend,
    weekly,
  }
}

export function computeCustomerDetail(customer: Customer): CustomerDetail {
  const expenses: Expense[] = Array.from({ length: 8 }, (_, i) => {
    const category = CATEGORIES[Math.floor(seeded(customer.id + i) * CATEGORIES.length)]
    return {
      id: customer.id * 100 + i,
      userId: customer.id,
      title: `${category} purchase`,
      category,
      amount: Math.round((seeded(customer.id * 3 + i) * 4000 + 250) / 10) * 10,
      date: iso(subDays(TODAY, i * 2)),
    }
  })
  const daily = Array.from({ length: 14 }, (_, i) => ({
    date: iso(subDays(TODAY, 13 - i)),
    amount: Math.round(seeded(customer.id + i * 11) * 3200 + 150),
  }))
  const budgets: Budget[] = [
    { id: customer.id * 10 + 1, userId: customer.id, type: 'MONTHLY', budgetAmount: customer.monthlyLimit * 0.9, limitAmount: customer.monthlyLimit, spent: customer.totalSpend, startDate: '2026-10-01', endDate: '2026-10-31' },
    { id: customer.id * 10 + 2, userId: customer.id, type: 'WEEKLY', budgetAmount: Math.round(customer.monthlyLimit / 4.5), limitAmount: Math.round(customer.monthlyLimit / 4), spent: Math.round(customer.totalSpend / 4.2), startDate: '2026-10-05', endDate: '2026-10-11' },
  ]
  return { ...customer, expenses, budgets, daily }
}

export function computeWeather(city = 'Bengaluru'): Weather {
  return {
    city,
    temperature: 24,
    condition: 'Thunderstorms likely',
    warning: 'Heavy rain alert from 5 PM to 10 PM. Expect cab surge pricing.',
  }
}
