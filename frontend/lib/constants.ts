import {
  Banknote,
  Building2,
  Clapperboard,
  CreditCard,
  GraduationCap,
  HeartPulse,
  Home,
  Layers,
  Plane,
  Receipt,
  Repeat,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Tag,
  UtensilsCrossed,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import type { Severity } from './types'

export const CATEGORIES = [
  'Food',
  'Travel',
  'Shopping',
  'Bills',
  'Entertainment',
  'Health',
  'Education',
  'Rent',
  'Groceries',
  'Subscriptions',
  'Other',
] as const

export type Category = (typeof CATEGORIES)[number]

export const categoryColors: Record<string, string> = {
  Food: '#FF7A00',
  Travel: '#38BDF8',
  Bills: '#A78BFA',
  Shopping: '#F472B6',
  Health: '#34D399',
  Entertainment: '#FBBF24',
  Education: '#2DD4BF',
  Rent: '#818CF8',
  Groceries: '#10B981',
  Subscriptions: '#EC4899',
  Other: '#94A3B8',
}

export const categoryIcons: Record<string, LucideIcon> = {
  Food: UtensilsCrossed,
  Travel: Plane,
  Bills: Receipt,
  Shopping: ShoppingBag,
  Health: HeartPulse,
  Entertainment: Clapperboard,
  Education: GraduationCap,
  Rent: Home,
  Groceries: ShoppingCart,
  Subscriptions: Repeat,
  Other: Tag,
}

export const PAYMENT_METHODS = [
  { value: 'UPI', label: 'UPI', icon: Smartphone, color: '#38BDF8' },
  { value: 'CASH', label: 'Cash', icon: Banknote, color: '#10B981' },
  { value: 'CREDIT_CARD', label: 'Credit Card', icon: CreditCard, color: '#F472B6' },
  { value: 'DEBIT_CARD', label: 'Debit Card', icon: CreditCard, color: '#818CF8' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer', icon: Building2, color: '#FBBF24' },
  { value: 'WALLET', label: 'Wallet', icon: Wallet, color: '#A78BFA' },
  { value: 'OTHER', label: 'Other', icon: Layers, color: '#94A3B8' },
] as const

/** Deterministic, vivid color for categories that are not in the map. */
export function getCategoryColor(category: string): string {
  const known = categoryColors[category]
  if (known) return known
  let hash = 0
  for (let i = 0; i < category.length; i++) hash = (hash * 31 + category.charCodeAt(i)) >>> 0
  const hue = hash % 360
  return hslToHex(hue, 78, 62)
}

export function getCategoryIcon(category: string): LucideIcon {
  return categoryIcons[category] ?? Tag
}

function hslToHex(h: number, s: number, l: number) {
  const sat = s / 100
  const light = l / 100
  const k = (n: number) => (n + h / 30) % 12
  const a = sat * Math.min(light, 1 - light)
  const f = (n: number) => light - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  const toHex = (x: number) =>
    Math.round(x * 255)
      .toString(16)
      .padStart(2, '0')
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`.toUpperCase()
}

export const severityColors: Record<Severity, string> = {
  info: '#38BDF8',
  warning: '#FBBF24',
  danger: '#FB7185',
  success: '#34D399',
}

export const BUDGET_THRESHOLDS = [80, 85, 90, 95, 100]
