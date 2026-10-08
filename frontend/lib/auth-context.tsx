'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as api from './api'
import type { LoginPayload, RegisterPayload, User } from './types'

const SESSION_KEY = 'expensify.session'

interface AuthContextValue {
  user: User | null
  ready: boolean
  login: (payload: LoginPayload) => Promise<User>
  register: (payload: RegisterPayload) => Promise<User>
  logout: () => void
  updateUser: (data: Partial<User>) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SESSION_KEY)
      if (raw) {
        const session = JSON.parse(raw) as { user: User; token: string | null }
        api.setAuthToken(session.token)
        setUser(session.user)
      }
    } catch {
      window.localStorage.removeItem(SESSION_KEY)
    }
    setReady(true)
  }, [])

  const persist = useCallback((next: User | null, token: string | null) => {
    api.setAuthToken(token)
    if (next) window.localStorage.setItem(SESSION_KEY, JSON.stringify({ user: next, token }))
    else window.localStorage.removeItem(SESSION_KEY)
    setUser(next)
  }, [])

  const login = useCallback(
    async (payload: LoginPayload) => {
      const { token, ...rest } = await api.login(payload)
      persist(rest, token ?? null)
      return rest
    },
    [persist],
  )

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const { token, ...rest } = await api.register(payload)
      persist(rest, token ?? null)
      return rest
    },
    [persist],
  )

  const logout = useCallback(() => persist(null, null), [persist])

  const updateUser = useCallback((data: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev
      const next = { ...prev, ...data }
      const raw = window.localStorage.getItem(SESSION_KEY)
      const token = raw ? (JSON.parse(raw).token as string | null) : null
      window.localStorage.setItem(SESSION_KEY, JSON.stringify({ user: next, token }))
      return next
    })
  }, [])

  const value = useMemo(
    () => ({ user, ready, login, register, logout, updateUser }),
    [user, ready, login, register, logout, updateUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
