'use client'

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { Calendar, CheckCircle2, Clock, Pause, Play, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CategoryBadge, CategoryIcon } from '@/components/shared/category'
import { Panel } from '@/components/shared/page'
import { APP_CONFIG, CURRENCIES } from '@/lib/config'
import { CATEGORIES, PAYMENT_METHODS } from '@/lib/constants'
import { useRecurringActions, useRecurringExpenses } from '@/lib/hooks'
import { useMoney, usePreferences } from '@/lib/preferences-context'
import type { ExpenseCategory, ExpensePaymentMethod, NewRecurringExpense, RecurringExpense, RecurringFrequency } from '@/lib/types'

export function RecurringExpensesView() {
  const money = useMoney()
  const { data: recurring, isLoading } = useRecurringExpenses()
  const { create, remove, pause, resume } = useRecurringActions()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form State
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<ExpenseCategory>('SUBSCRIPTIONS')
  const [paymentMethod, setPaymentMethod] = useState<ExpensePaymentMethod>('CREDIT_CARD')
  const [frequency, setFrequency] = useState<RecurringFrequency>('MONTHLY')
  const [startDate, setStartDate] = useState(format(APP_CONFIG.today, 'yyyy-MM-dd'))

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim() || !amount || Number(amount) <= 0) {
      toast.error('Please enter a valid description and positive amount')
      return
    }

    setIsSubmitting(true)
    try {
      const payload: NewRecurringExpense = {
        description: description.trim(),
        amount: Number(amount),
        category,
        paymentMethod,
        frequency,
        startDate,
      }
      await create(payload)
      toast.success('Recurring expense scheduled', {
        description: `${description} will repeat ${frequency.toLowerCase()}.`,
      })
      setIsOpen(false)
      setDescription('')
      setAmount('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to schedule recurring expense')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggle = async (item: RecurringExpense) => {
    try {
      if (item.active) {
        await pause(item.id)
        toast.info(`Paused ${item.description}`)
      } else {
        await resume(item.id)
        toast.success(`Resumed ${item.description}`)
      }
    } catch (err) {
      toast.error('Action failed')
    }
  }

  const handleDelete = async (id: number, name: string) => {
    try {
      await remove(id)
      toast.success(`Deleted ${name}`)
    } catch (err) {
      toast.error('Could not delete')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-heading text-lg font-semibold">Recurring Subscriptions & Bills</h3>
          <p className="text-xs text-muted-foreground">
            Automatically logged by the Java Spring Boot scheduler when due. Duplicate execution is strictly prevented.
          </p>
        </div>
        <Button size="sm" onClick={() => setIsOpen(true)} className="rounded-xl font-medium">
          <Plus data-icon="inline-start" />
          Add recurring
        </Button>
      </div>

      <Panel className="p-3 md:p-4">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-2xl" />
            ))}
          </div>
        ) : !recurring || recurring.length === 0 ? (
          <Empty className="py-12">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <RefreshCw />
              </EmptyMedia>
              <EmptyTitle>No recurring expenses</EmptyTitle>
              <EmptyDescription>
                Schedule subscriptions, rent, utility bills or EMI that recur automatically.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subscription / Bill</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Next Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recurring.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <CategoryIcon category={item.category} size="sm" />
                      <span className="font-medium">{item.description}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <CategoryBadge category={item.category} />
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                      {item.paymentMethod}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {item.frequency}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3" />
                      {item.nextDueDate ? format(parseISO(item.nextDueDate), 'd MMM yyyy') : 'Pending'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        item.active
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-zinc-500/10 text-zinc-500'
                      }`}
                    >
                      {item.active ? (
                        <>
                          <CheckCircle2 className="size-3" /> Active
                        </>
                      ) : (
                        <>
                          <Pause className="size-3" /> Paused
                        </>
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {money(item.amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title={item.active ? 'Pause' : 'Resume'}
                        onClick={() => handleToggle(item)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {item.active ? <Pause className="size-4" /> : <Play className="size-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="Delete"
                        onClick={() => handleDelete(item.id, item.description)}
                        className="text-muted-foreground hover:text-danger"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Panel>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add recurring expense</DialogTitle>
            <DialogDescription>
              Set up a repeating expense schedule processed by Spring Boot.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <FieldGroup className="gap-3">
              <Field>
                <FieldLabel htmlFor="rec-desc">Description</FieldLabel>
                <Input
                  id="rec-desc"
                  placeholder="e.g. Netflix Premium or Gym Membership"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="rec-amount">Amount (₹)</FieldLabel>
                <Input
                  id="rec-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="649"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field>
                  <FieldLabel>Category</FieldLabel>
                  <Select value={category} onValueChange={(v) => v && setCategory(v as ExpenseCategory)}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c.toUpperCase()}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel>Payment Method</FieldLabel>
                  <Select value={paymentMethod} onValueChange={(v) => v && setPaymentMethod(v as ExpensePaymentMethod)}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((pm) => (
                        <SelectItem key={pm.value} value={pm.value}>
                          {pm.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field>
                  <FieldLabel>Frequency</FieldLabel>
                  <Select value={frequency} onValueChange={(v) => v && setFrequency(v as RecurringFrequency)}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DAILY">Daily</SelectItem>
                      <SelectItem value="WEEKLY">Weekly</SelectItem>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                      <SelectItem value="YEARLY">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel htmlFor="rec-start">Start Date</FieldLabel>
                  <Input
                    id="rec-start"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </Field>
              </div>
            </FieldGroup>

            <DialogFooter className="mt-2">
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                Schedule Expense
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
