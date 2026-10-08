'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  CheckCheck,
  CloudRain,
  AlertTriangle,
  Info,
  ShieldAlert,
  Sparkles,
  Thermometer,
  Wind,
  CheckCircle2,
} from 'lucide-react'
import { PageHeader, Panel, PanelHeader } from '@/components/shared/page'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useNotifications, useWeather } from '@/lib/hooks'
import { useAuth } from '@/lib/auth-context'
import * as api from '@/lib/api'
import { useSWRConfig } from 'swr'
import { toast } from 'sonner'
import type { AppNotification } from '@/lib/types'

export function AlertsView() {
  const { user } = useAuth()
  const { data: notifications, isLoading } = useNotifications()
  const { data: weather } = useWeather()
  const { mutate } = useSWRConfig()
  const [filter, setFilter] = useState<'all' | 'unread' | 'budgets' | 'weather'>('all')

  const unreadCount = notifications?.filter((n) => !n.read).length || 0

  async function handleMarkRead(id: number) {
    try {
      await api.markNotificationRead(id)
      mutate((key) => Array.isArray(key) && key[0] === 'notifications')
      toast.success('Marked as read')
    } catch {
      toast.error('Failed to update alert')
    }
  }

  async function handleMarkAllRead() {
    if (!user) return
    try {
      await api.markAllNotificationsRead(user.id)
      mutate((key) => Array.isArray(key) && key[0] === 'notifications')
      toast.success('All alerts marked as read')
    } catch {
      toast.error('Failed to update alerts')
    }
  }

  const filtered = (notifications || []).filter((item) => {
    if (filter === 'unread') return !item.read
    if (filter === 'budgets') return item.kind === 'BUDGET'
    if (filter === 'weather') return item.kind === 'WEATHER'
    return true
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Alerts & Notifications"
        description="Real-time threshold triggers, expense advisories, and weather impacts."
        actions={
          unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              className="gap-2 border-primary/20 text-primary hover:bg-primary/5"
            >
              <CheckCheck className="size-4" />
              Mark all as read ({unreadCount})
            </Button>
          )
        }
      />

      {/* Weather & Weather-Impacted Alert Card */}
      {weather && (
        <Panel className="relative overflow-hidden border border-sky-500/20 bg-gradient-to-br from-sky-500/10 via-background to-indigo-500/5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-sky-500/20 flex items-center justify-center text-sky-500 shrink-0">
                <CloudRain className="size-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg">{weather.city} Advisory</h3>
                  <Badge variant="outline" className="border-sky-500/30 text-sky-400">
                    Live Weather Impact
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {weather.warning || `${weather.condition} at ${weather.temperature}°C. Delivery surge alerts enabled.`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground bg-background/50 px-3 py-2 rounded-xl border border-border/40">
              <div className="flex items-center gap-1.5">
                <Thermometer className="size-4 text-amber-500" />
                <span>{weather.temperature}°C</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Wind className="size-4 text-sky-500" />
                <span>{weather.condition}</span>
              </div>
            </div>
          </div>
        </Panel>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Button
          size="sm"
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          className="rounded-full text-xs"
        >
          All Alerts ({notifications?.length || 0})
        </Button>
        <Button
          size="sm"
          variant={filter === 'unread' ? 'default' : 'outline'}
          onClick={() => setFilter('unread')}
          className="rounded-full text-xs"
        >
          Unread ({unreadCount})
        </Button>
        <Button
          size="sm"
          variant={filter === 'budgets' ? 'default' : 'outline'}
          onClick={() => setFilter('budgets')}
          className="rounded-full text-xs"
        >
          Budgets & Limits
        </Button>
      </div>

      {/* Alerts Feed */}
      <div className="flex flex-col gap-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
        ) : filtered.length === 0 ? (
          <Panel className="text-center py-12">
            <CheckCircle2 className="mx-auto size-12 text-emerald-500 mb-3 opacity-60" />
            <h3 className="font-semibold text-lg">No notifications right now</h3>
            <p className="text-muted-foreground text-sm mt-1">You are all caught up with your budget alerts.</p>
          </Panel>
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`surface rounded-2xl p-4 sm:p-5 flex items-start justify-between gap-4 transition-all border ${
                  item.read ? 'border-border/30 opacity-75' : 'border-amber-500/25 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
                      item.severity === 'danger'
                        ? 'bg-rose-500/10 text-rose-500'
                        : item.severity === 'warning'
                        ? 'bg-amber-500/10 text-amber-500'
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {item.severity === 'danger' ? (
                      <ShieldAlert className="size-5" />
                    ) : item.severity === 'warning' ? (
                      <AlertTriangle className="size-5" />
                    ) : (
                      <Info className="size-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-sm sm:text-base">{item.title}</h4>
                      {!item.read && (
                        <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
                      )}
                      <Badge
                        variant="secondary"
                        className="text-[10px] uppercase font-bold tracking-wider py-0 px-2"
                      >
                        {item.kind}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{item.message}</p>
                    <p className="text-xs text-muted-foreground/60 mt-2">
                      {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Recent'}
                    </p>
                  </div>
                </div>

                {!item.read && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleMarkRead(item.id)}
                    className="text-xs shrink-0 text-muted-foreground hover:text-foreground"
                  >
                    Mark read
                  </Button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
