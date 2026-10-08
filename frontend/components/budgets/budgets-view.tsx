'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { PiggyBank, Plus, ShieldCheck, TrendingUp, AlertTriangle } from 'lucide-react'
import { PageHeader, Panel, PanelHeader } from '@/components/shared/page'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { BUDGET_LABELS, BUDGET_ORDER, usagePercent, usageTone } from '@/lib/budget'
import { useBudgets, useBudgetActions } from '@/lib/hooks'
import { useMoney } from '@/lib/preferences-context'
import type { Budget, BudgetType } from '@/lib/types'
import { toast } from 'sonner'

export function BudgetsView() {
  const money = useMoney()
  const { data: budgets, isLoading } = useBudgets()
  const { create, changeLimit } = useBudgetActions()

  // State for Change Limit Dialog
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null)
  const [newLimit, setNewLimit] = useState('')
  const [password, setPassword] = useState('')
  const [submittingLimit, setSubmittingLimit] = useState(false)

  // State for Create Budget Dialog
  const [createOpen, setCreateOpen] = useState(false)
  const [newType, setNewType] = useState<BudgetType>('MONTHLY')
  const [newAmount, setNewAmount] = useState('')
  const [newLimitAmount, setNewLimitAmount] = useState('')
  const [submittingCreate, setSubmittingCreate] = useState(false)

  const sorted = budgets ? [...budgets].sort((a, b) => BUDGET_ORDER.indexOf(a.type) - BUDGET_ORDER.indexOf(b.type)) : []

  async function handleChangeLimit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedBudget) return
    if (!newLimit || Number(newLimit) <= 0) {
      toast.error('Please enter a valid limit amount')
      return
    }
    if (!password) {
      toast.error('Password is required to change budget limit')
      return
    }
    setSubmittingLimit(true)
    try {
      await changeLimit(selectedBudget.id, Number(newLimit), password)
      toast.success(`${BUDGET_LABELS[selectedBudget.type]} budget limit updated successfully`)
      setSelectedBudget(null)
      setNewLimit('')
      setPassword('')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update limit')
    } finally {
      setSubmittingLimit(false)
    }
  }

  async function handleCreateBudget(e: React.FormEvent) {
    e.preventDefault()
    if (!newAmount || !newLimitAmount) {
      toast.error('Please fill in all budget fields')
      return
    }
    setSubmittingCreate(true)
    try {
      await create({
        type: newType,
        budgetAmount: Number(newAmount),
        limitAmount: Number(newLimitAmount),
        startDate: new Date().toISOString().split('T')[0],
      })
      toast.success('Budget created successfully')
      setCreateOpen(false)
      setNewAmount('')
      setNewLimitAmount('')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create budget')
    } finally {
      setSubmittingCreate(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Budgets & Limits"
        description="Monitor spending thresholds and adjust period limits with verified authentication."
        actions={
          <Button onClick={() => setCreateOpen(true)} className="gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md hover:from-orange-600 hover:to-amber-600">
            <Plus className="size-4" />
            Set Budget
          </Button>
        }
      />

      {/* Info Banner */}
      <div className="surface flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-foreground">
        <AlertTriangle className="size-5 shrink-0 text-amber-500" />
        <div>
          <p className="font-semibold text-amber-500">Automated Alert Protection Active</p>
          <p className="text-muted-foreground mt-0.5">
            The EXPENSIFY engine automatically monitors your expenses and sends real-time alerts as you cross 80%, 85%, 90%, 95%, and 100% of your configured limit.
          </p>
        </div>
      </div>

      {/* Budgets Grid */}
      <div className="grid gap-5 md:grid-cols-2">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-3xl" />)
        ) : sorted.length === 0 ? (
          <Panel className="col-span-full text-center py-12">
            <PiggyBank className="mx-auto size-12 text-muted-foreground mb-3 opacity-40" />
            <h3 className="font-semibold text-lg">No active budgets</h3>
            <p className="text-muted-foreground text-sm mt-1">Create your first budget to begin tracking limits.</p>
            <Button onClick={() => setCreateOpen(true)} className="mt-4">Create Budget</Button>
          </Panel>
        ) : (
          sorted.map((b) => {
            const pct = usagePercent(b)
            const tone = usageTone(pct)
            return (
              <Panel key={b.id} className="relative overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-2xl flex items-center justify-center bg-orange-500/10 text-orange-500">
                        <PiggyBank className="size-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{BUDGET_LABELS[b.type]} Budget</h3>
                        <p className="text-xs text-muted-foreground">Threshold Limit: {money(b.limitAmount)}</p>
                      </div>
                    </div>
                    <Badge variant="outline" style={{ borderColor: tone.color, color: tone.color }} className="font-semibold">
                      {tone.label} ({pct}%)
                    </Badge>
                  </div>

                  <div className="space-y-2 my-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Spent so far</span>
                      <span className="font-bold tabular-nums">{money(b.spent)}</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-muted/60">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: tone.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(pct, 100)}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Total Allocation: {money(b.budgetAmount)}</span>
                      <span>Remaining: {money(Math.max(b.limitAmount - b.spent, 0))}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/50 flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <ShieldCheck className="size-3.5 text-emerald-500" /> Password protected
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedBudget(b)
                      setNewLimit(String(b.limitAmount))
                    }}
                  >
                    Change Limit
                  </Button>
                </div>
              </Panel>
            )
          })
        )}
      </div>

      {/* Change Limit Modal with Password Authentication */}
      <Dialog open={!!selectedBudget} onOpenChange={(open) => !open && setSelectedBudget(null)}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleChangeLimit}>
            <DialogHeader>
              <DialogTitle>Update {selectedBudget ? BUDGET_LABELS[selectedBudget.type] : ''} Limit</DialogTitle>
              <DialogDescription>
                Changing your threshold limit requires your account password to verify identity.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="limit-amount">New Limit Amount (₹)</Label>
                <Input
                  id="limit-amount"
                  type="number"
                  step="any"
                  value={newLimit}
                  onChange={(e) => setNewLimit(e.target.value)}
                  placeholder="e.g. 25000"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="auth-pwd">Account Password</Label>
                <Input
                  id="auth-pwd"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your current password"
                  required
                />
                <p className="text-xs text-muted-foreground">Default demo password: <code className="bg-muted px-1 py-0.5 rounded">password123</code></p>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setSelectedBudget(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submittingLimit}>
                {submittingLimit ? 'Verifying...' : 'Save New Limit'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create New Budget Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreateBudget}>
            <DialogHeader>
              <DialogTitle>Set New Budget</DialogTitle>
              <DialogDescription>Define an allocation and threshold limit for a spending period.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Period Type</Label>
                <Select value={newType} onValueChange={(v) => setNewType(v as BudgetType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DAILY">Daily</SelectItem>
                    <SelectItem value="WEEKLY">Weekly</SelectItem>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="YEARLY">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget-alloc">Budget Allocation Amount (₹)</Label>
                <Input
                  id="budget-alloc"
                  type="number"
                  step="any"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="e.g. 35000"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget-lim">Alert Threshold Limit (₹)</Label>
                <Input
                  id="budget-lim"
                  type="number"
                  step="any"
                  value={newLimitAmount}
                  onChange={(e) => setNewLimitAmount(e.target.value)}
                  placeholder="e.g. 30000"
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submittingCreate}>
                {submittingCreate ? 'Saving...' : 'Create Budget'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
