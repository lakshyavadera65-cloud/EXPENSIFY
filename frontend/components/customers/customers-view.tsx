'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Search,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  MapPin,
  Mail,
  ChevronRight,
  ExternalLink,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { PageHeader, Panel, PanelHeader } from '@/components/shared/page'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useManagerCustomers, useCustomerDetail } from '@/lib/hooks'
import { useAuth } from '@/lib/auth-context'
import { useMoney } from '@/lib/preferences-context'
import { format, parseISO } from 'date-fns'
import type { Customer, CustomerStatus } from '@/lib/types'

const STATUS_CONFIG: Record<CustomerStatus, { color: string; bg: string }> = {
  'On track': { color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' },
  'Near limit': { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' },
  'Over budget': { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)' },
}

export function CustomersView() {
  const { user, login } = useAuth()
  const money = useMoney()
  const { data: customers, isLoading } = useManagerCustomers()
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null)
  const [search, setSearch] = useState('')

  const { data: detail, isLoading: loadingDetail } = useCustomerDetail(selectedCustomerId)

  const isManager = user?.role === 'Manager' || user?.role === 'Head' || user?.role === 'Admin'

  const filtered = (customers || []).filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.city?.toLowerCase().includes(search.toLowerCase())
  )

  if (!isManager) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Customer Oversight"
          description="Manager dashboard for monitoring assigned customer portfolios and risk thresholds."
        />
        <Panel className="text-center py-16 max-w-xl mx-auto border border-sky-500/20 bg-sky-500/5">
          <Users className="mx-auto size-16 text-sky-500 mb-4 opacity-80" />
          <h2 className="text-2xl font-bold">Manager Access Required</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            You are currently signed in as <span className="font-semibold text-foreground">{user?.name}</span> ({user?.role}).
            The Customer Management suite requires Manager privileges to oversee spending accounts and adjust limits.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={() => login({ email: 'manager@expensify.app', password: 'password123' })}
              className="gap-2 bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 text-white shadow-md"
            >
              <Sparkles className="size-4" />
              Switch to Manager Account
            </Button>
          </div>
        </Panel>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Customer Accounts"
        description="Monitor spending behaviors, high-risk threshold crossings, and portfolio limits."
        actions={
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customers..."
              className="pl-9 rounded-2xl"
            />
          </div>
        }
      />

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Panel className="p-4">
          <p className="text-xs text-muted-foreground">Total Customers</p>
          <p className="text-2xl font-bold mt-1 tabular-nums">{customers?.length || 0}</p>
        </Panel>
        <Panel className="p-4">
          <p className="text-xs text-muted-foreground">On Track</p>
          <p className="text-2xl font-bold mt-1 tabular-nums text-emerald-500">
            {customers?.filter((c) => c.status === 'On track').length || 0}
          </p>
        </Panel>
        <Panel className="p-4">
          <p className="text-xs text-muted-foreground">Near Limit (≥80%)</p>
          <p className="text-2xl font-bold mt-1 tabular-nums text-amber-500">
            {customers?.filter((c) => c.status === 'Near limit').length || 0}
          </p>
        </Panel>
        <Panel className="p-4">
          <p className="text-xs text-muted-foreground">Over Limit (&gt;100%)</p>
          <p className="text-2xl font-bold mt-1 tabular-nums text-rose-500">
            {customers?.filter((c) => c.status === 'Over budget').length || 0}
          </p>
        </Panel>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-3xl" />)
        ) : filtered.length === 0 ? (
          <Panel className="col-span-full text-center py-12">
            <Users className="mx-auto size-12 text-muted-foreground mb-3 opacity-40" />
            <h3 className="font-semibold text-lg">No customers found</h3>
            <p className="text-muted-foreground text-sm mt-1">Try adjusting your search criteria.</p>
          </Panel>
        ) : (
          filtered.map((c) => {
            const pct = Math.round((c.totalSpend / (c.monthlyLimit || 1)) * 100)
            const style = STATUS_CONFIG[c.status] || STATUS_CONFIG['On track']
            return (
              <Panel
                key={c.id}
                className="group relative cursor-pointer border border-border/50 hover:border-sky-500/40 transition-all hover:shadow-lg flex flex-col justify-between"
                onClick={() => setSelectedCustomerId(c.id)}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-bold text-base group-hover:text-sky-500 transition-colors">{c.name}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Mail className="size-3" /> {c.email}
                      </p>
                      {c.city && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="size-3" /> {c.city}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant="outline"
                      style={{ color: style.color, borderColor: style.color, backgroundColor: style.bg }}
                      className="font-semibold shrink-0 text-xs"
                    >
                      {c.status}
                    </Badge>
                  </div>

                  {/* Spending Progress */}
                  <div className="space-y-1.5 my-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Monthly Spend</span>
                      <span className="font-bold tabular-nums">
                        {money(c.totalSpend)} / {money(c.monthlyLimit)}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted/60">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: style.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(pct, 100)}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs font-medium text-sky-500 group-hover:translate-x-1 transition-transform">
                  <span>View Account Details</span>
                  <ChevronRight className="size-4" />
                </div>
              </Panel>
            )
          })
        )}
      </div>

      {/* Customer Detail Dialog */}
      <Dialog open={!!selectedCustomerId} onOpenChange={(open) => !open && setSelectedCustomerId(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl p-6">
          {loadingDetail || !detail ? (
            <div className="space-y-4 py-6">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : (
            <div>
              <DialogHeader>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <DialogTitle className="text-2xl font-bold">{detail.name}</DialogTitle>
                    <DialogDescription className="mt-1 flex items-center gap-3">
                      <span>{detail.email}</span>
                      <span>·</span>
                      <span>{detail.city}</span>
                    </DialogDescription>
                  </div>
                  <Badge
                    variant="outline"
                    style={{
                      color: STATUS_CONFIG[detail.status].color,
                      borderColor: STATUS_CONFIG[detail.status].color,
                      backgroundColor: STATUS_CONFIG[detail.status].bg,
                    }}
                    className="text-xs font-semibold px-2.5 py-1"
                  >
                    {detail.status}
                  </Badge>
                </div>
              </DialogHeader>

              {/* Financial Snapshot */}
              <div className="grid grid-cols-2 gap-3 my-6">
                <div className="surface p-4 rounded-2xl border border-border/60">
                  <p className="text-xs text-muted-foreground">Total Period Spending</p>
                  <p className="text-2xl font-bold text-foreground mt-1 tabular-nums">{money(detail.totalSpend)}</p>
                </div>
                <div className="surface p-4 rounded-2xl border border-border/60">
                  <p className="text-xs text-muted-foreground">Configured Monthly Limit</p>
                  <p className="text-2xl font-bold text-foreground mt-1 tabular-nums">{money(detail.monthlyLimit)}</p>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h4 className="font-semibold text-sm mb-3">Recent Transactions</h4>
                <div className="space-y-2">
                  {detail.expenses && detail.expenses.length > 0 ? (
                    detail.expenses.slice(0, 5).map((e) => (
                      <div
                        key={e.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/30 text-sm"
                      >
                        <div>
                          <p className="font-medium">{e.title || e.description || e.category}</p>
                          <p className="text-xs text-muted-foreground">{e.category} · {e.date}</p>
                        </div>
                        <span className="font-bold tabular-nums text-foreground">-{money(e.amount)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No recent expenses logged.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
