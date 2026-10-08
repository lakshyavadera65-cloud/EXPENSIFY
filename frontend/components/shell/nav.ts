import { BarChart3, Bell, LayoutDashboard, PiggyBank, Receipt, Settings, Users, type LucideIcon } from 'lucide-react'
import type { Role } from '@/lib/types'

export interface NavItem {
  href: string
  label: string
  shortLabel?: string
  icon: LucideIcon
  color: string
  roles?: Role[]
  badge?: 'unread'
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, color: '#FF7A00' },
  { href: '/expenses', label: 'Expenses', icon: Receipt, color: '#F472B6' },
  { href: '/analytics', label: 'Analytics', icon: BarChart3, color: '#6366F1' },
  { href: '/budgets', label: 'Budgets', icon: PiggyBank, color: '#34D399' },
  { href: '/alerts', label: 'Alerts', icon: Bell, color: '#FBBF24', badge: 'unread' },
  { href: '/customers', label: 'Team', icon: Users, color: '#38BDF8', roles: ['Manager', 'Head', 'Admin'] },
  { href: '/settings', label: 'Settings', icon: Settings, color: '#A78BFA' },
]

export function navForRole(role: Role | undefined) {
  return NAV_ITEMS.filter((item) => !item.roles || (role && item.roles.includes(role)))
}
