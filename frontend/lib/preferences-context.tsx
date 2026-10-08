'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { DEFAULT_CURRENCY, formatCurrency, type CurrencyCode } from './config'

const PREFS_KEY = 'expensify.preferences'

interface Preferences {
  currency: CurrencyCode
  emailAlerts: boolean
  pushNotifications: boolean
}

const DEFAULTS: Preferences = { currency: DEFAULT_CURRENCY, emailAlerts: true, pushNotifications: false }

interface PreferencesContextValue extends Preferences {
  setPreference: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void
  format: (amount: number, options?: { compact?: boolean }) => string
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null)

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULTS)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PREFS_KEY)
      if (raw) setPrefs({ ...DEFAULTS, ...JSON.parse(raw) })
    } catch {}
  }, [])

  const setPreference = useCallback<PreferencesContextValue['setPreference']>((key, value) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value }
      window.localStorage.setItem(PREFS_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const format = useCallback(
    (amount: number, options?: { compact?: boolean }) => formatCurrency(amount, prefs.currency, options),
    [prefs.currency],
  )

  const value = useMemo(() => ({ ...prefs, setPreference, format }), [prefs, setPreference, format])

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext)
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider')
  return ctx
}

export function useMoney() {
  return usePreferences().format
}
