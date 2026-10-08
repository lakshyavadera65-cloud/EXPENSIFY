'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Settings,
  User as UserIcon,
  Globe,
  Coins,
  Bell,
  Server,
  CheckCircle2,
  RefreshCw,
  LogOut,
  Sparkles,
  Shield,
  Layers,
  Database,
} from 'lucide-react'
import { PageHeader, Panel, PanelHeader } from '@/components/shared/page'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/lib/auth-context'
import { usePreferences } from '@/lib/preferences-context'
import { CURRENCIES, type CurrencyCode } from '@/lib/config'
import * as api from '@/lib/api'
import { toast } from 'sonner'

export function SettingsView() {
  const { user, updateUser, logout, login } = useAuth()
  const { currency, setPreference, emailAlerts, pushNotifications } = usePreferences()

  // Profile Form State
  const [name, setName] = useState(user?.name || '')
  const [city, setCity] = useState(user?.city || '')
  const [country, setCountry] = useState(user?.country || '')
  const [savingProfile, setSavingProfile] = useState(false)

  // Backend Health Ping State
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking')
  const [latency, setLatency] = useState<number | null>(null)

  useEffect(() => {
    if (user) {
      setName(user.name)
      setCity(user.city || '')
      setCountry(user.country || '')
    }
  }, [user])

  useEffect(() => {
    checkHealth()
  }, [])

  async function checkHealth() {
    setBackendStatus('checking')
    const start = performance.now()
    try {
      const res = await fetch(`${api.API_URL || 'http://localhost:8080'}/api/health`)
      if (res.ok) {
        setLatency(Math.round(performance.now() - start))
        setBackendStatus('connected')
      } else {
        setBackendStatus('disconnected')
      }
    } catch {
      setBackendStatus('disconnected')
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSavingProfile(true)
    try {
      await api.updateProfile(user.id, { name, city, country })
      updateUser({ name, city, country })
      toast.success('Profile updated successfully')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <PageHeader
        title="Settings & System"
        description="Configure account preferences, default currency, and full-stack services."
      />

      <div className="grid gap-6">
        {/* Full-Stack Connection Card */}
        <Panel className="border border-border/80 bg-gradient-to-br from-card via-background to-muted/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="size-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Server className="size-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base">Backend Architecture</h3>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`size-2.5 rounded-full ${
                        backendStatus === 'connected'
                          ? 'bg-emerald-500 animate-pulse'
                          : backendStatus === 'checking'
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                    />
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {backendStatus === 'connected'
                        ? `Online (${latency}ms)`
                        : backendStatus === 'checking'
                        ? 'Checking...'
                        : 'Offline'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Spring Boot REST API on <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[11px]">{api.API_URL || 'http://localhost:8080'}</code>
                </p>
              </div>
            </div>

            <Button size="sm" variant="outline" onClick={checkHealth} className="gap-2 text-xs">
              <RefreshCw className="size-3.5" />
              Ping API
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-border/40 text-xs">
            <div className="flex items-center gap-2">
              <Database className="size-4 text-primary" />
              <span>H2 In-Memory DB (PostgreSQL mode)</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="size-4 text-emerald-500" />
              <span>JWT Authentication Active</span>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="size-4 text-sky-500" />
              <span>Automated Threshold Alerts</span>
            </div>
          </div>
        </Panel>

        {/* Profile Settings */}
        <Panel>
          <PanelHeader
            title="User Profile"
            description="Manage your account identity, personal information, and location."
          />
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="prof-name">Full Name</Label>
                <Input
                  id="prof-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prof-email">Email Address</Label>
                <Input
                  id="prof-email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted/50 cursor-not-allowed text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prof-city">City (for Local Weather Alerts)</Label>
                <Input
                  id="prof-city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Bengaluru"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prof-country">Country</Label>
                <Input
                  id="prof-country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. India"
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline">{user?.role} Role</Badge>
                <span>User ID: #{user?.id}</span>
              </div>
              <Button type="submit" disabled={savingProfile}>
                {savingProfile ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </form>
        </Panel>

        {/* Preferences & Currency */}
        <Panel>
          <PanelHeader
            title="Display & Regional Preferences"
            description="Configure default currency presentation and notification preferences."
          />
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <Label className="text-sm font-semibold">Base Currency</Label>
                <p className="text-xs text-muted-foreground">Select how monetary values are displayed throughout the UI.</p>
              </div>
              <Select
                value={currency}
                onValueChange={(val) => setPreference('currency', val as CurrencyCode)}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CURRENCIES).map(([code, meta]) => (
                    <SelectItem key={code} value={code}>
                      <span className="font-mono mr-1.5">{meta.symbol}</span>
                      <span>{code} ({meta.label})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 border-t border-border/40 flex items-center justify-between">
              <div>
                <Label className="text-sm font-semibold">Email Spending Warnings</Label>
                <p className="text-xs text-muted-foreground">Receive digest when spending approaches 80% and 100% threshold.</p>
              </div>
              <Switch
                checked={emailAlerts}
                onCheckedChange={(checked) => setPreference('emailAlerts', checked)}
              />
            </div>
          </div>
        </Panel>

        {/* Quick Persona Switcher for Testing */}
        <Panel className="border border-primary/20 bg-primary/5">
          <PanelHeader
            title="Persona Quick Switcher"
            description="Toggle between demo roles to test Customer and Manager capabilities instantly."
          />
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Button
              variant={user?.role === 'Customer' ? 'default' : 'outline'}
              className="w-full sm:w-auto gap-2"
              onClick={() => login({ email: 'lakshya@expensify.app', password: 'password123' })}
            >
              <UserIcon className="size-4" />
              Customer: Lakshya Vadera
            </Button>
            <Button
              variant={user?.role === 'Manager' ? 'default' : 'outline'}
              className="w-full sm:w-auto gap-2"
              onClick={() => login({ email: 'manager@expensify.app', password: 'password123' })}
            >
              <Sparkles className="size-4" />
              Manager: Raj Sharma
            </Button>
            <Button
              variant="ghost"
              className="w-full sm:w-auto sm:ml-auto gap-2 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
              onClick={logout}
            >
              <LogOut className="size-4" />
              Sign Out
            </Button>
          </div>
        </Panel>
      </div>
    </div>
  )
}
