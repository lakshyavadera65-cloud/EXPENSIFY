export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP'

export interface CurrencyConfig {
  code: CurrencyCode
  symbol: string
  locale: string
  label: string
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  INR: { code: 'INR', symbol: '₹', locale: 'en-IN', label: 'Indian Rupee (₹)' },
  USD: { code: 'USD', symbol: '$', locale: 'en-US', label: 'US Dollar ($)' },
  EUR: { code: 'EUR', symbol: '€', locale: 'de-DE', label: 'Euro (€)' },
  GBP: { code: 'GBP', symbol: '£', locale: 'en-GB', label: 'British Pound (£)' },
}

export const DEFAULT_CURRENCY: CurrencyCode = 'INR'

export const APP_CONFIG = {
  name: 'Expensify',
  /** Fixed "today" so mock data and the date in the top bar stay consistent. */
  today: new Date(2026, 9, 8, 14, 30),
  customerCapacity: 1000,
}

export function formatCurrency(
  amount: number,
  code: CurrencyCode = DEFAULT_CURRENCY,
  options: { compact?: boolean; decimals?: number } = {},
) {
  const c = CURRENCIES[code]
  return new Intl.NumberFormat(c.locale, {
    style: 'currency',
    currency: c.code,
    maximumFractionDigits: options.decimals ?? 0,
    minimumFractionDigits: options.decimals ?? 0,
    notation: options.compact ? 'compact' : 'standard',
  }).format(amount)
}
