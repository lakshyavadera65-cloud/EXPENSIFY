'use client'

import { useMemo, useState } from 'react'
import { format, parseISO, subDays } from 'date-fns'
import { Download, FileText, Repeat, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CategoryBadge, CategoryIcon, tint } from '@/components/shared/category'
import { PageHeader, Panel } from '@/components/shared/page'
import { AddExpenseButton } from './add-expense-dialog'
import { ExpenseRow } from './expense-row'
import { RecurringExpensesView } from './recurring-expenses-view'
import { downloadExpenseCsv, downloadExpensePdf } from '@/lib/api'
import { APP_CONFIG } from '@/lib/config'
import { CATEGORIES, getCategoryColor } from '@/lib/constants'
import { useExpenseActions, useExpenses } from '@/lib/hooks'
import { useMoney } from '@/lib/preferences-context'
import type { Expense } from '@/lib/types'
import { cn } from '@/lib/utils'

const PERIODS = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: 'all', label: 'All time' },
]

export function ExpensesView() {
  const money = useMoney()
  const { data, isLoading } = useExpenses()
  const { remove } = useExpenseActions()
  const [activeTab, setActiveTab] = useState<'expenses' | 'recurring'>('expenses')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string>('all')
  const [period, setPeriod] = useState('30')
  const [pendingDelete, setPendingDelete] = useState<Expense | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  const [downloadingCsv, setDownloadingCsv] = useState(false)

  const filtered = useMemo(() => {
    if (!data) return []
    const q = query.trim().toLowerCase()
    const since = period === 'all' ? null : format(subDays(APP_CONFIG.today, Number(period) - 1), 'yyyy-MM-dd')
    return data.filter(
      (e) =>
        (category === 'all' || e.category === category) &&
        (!since || e.date >= since) &&
        (!q || e.title.toLowerCase().includes(q) || e.description?.toLowerCase().includes(q)),
    )
  }, [data, query, category, period])

  const total = filtered.reduce((s, e) => s + e.amount, 0)

  async function confirmDelete() {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await remove(pendingDelete.id)
      toast.success('Expense deleted', { description: pendingDelete.title })
      setPendingDelete(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete expense')
    } finally {
      setDeleting(false)
    }
  }

  async function handleDownloadPdf() {
    setDownloadingPdf(true)
    try {
      toast.info('Generating PDF report from Spring Boot backend...')
      await downloadExpensePdf()
      toast.success('PDF report downloaded successfully!')
    } catch (err) {
      toast.error('Failed to download PDF report')
    } finally {
      setDownloadingPdf(false)
    }
  }

  async function handleDownloadCsv() {
    setDownloadingCsv(true)
    try {
      toast.info('Generating CSV report from Spring Boot backend...')
      await downloadExpenseCsv()
      toast.success('CSV report downloaded successfully!')
    } catch (err) {
      toast.error('Failed to download CSV report')
    } finally {
      setDownloadingCsv(false)
    }
  }

  const deleteButton = (e: Expense) => (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={`Delete ${e.title}`}
      onClick={() => setPendingDelete(e)}
      className="text-muted-foreground hover:text-danger"
    >
      <Trash2 />
    </Button>
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Expenses & Recurring"
        description="Search, filter, export reports and manage recurring subscriptions."
        actions={
          <>
            <Button
              variant="outline"
              onClick={handleDownloadPdf}
              disabled={downloadingPdf || isLoading}
              className="gap-1.5"
            >
              <FileText className="size-4" />
              PDF Report
            </Button>
            <Button
              variant="outline"
              onClick={handleDownloadCsv}
              disabled={downloadingCsv || isLoading}
              className="gap-1.5"
            >
              <Download className="size-4" />
              CSV Export
            </Button>
            <AddExpenseButton className="hidden md:inline-flex" />
          </>
        }
      />

      {/* Primary Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('expenses')}
          className={cn(
            'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors',
            activeTab === 'expenses'
              ? 'bg-brand text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          )}
        >
          All Expenses
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('recurring')}
          className={cn(
            'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors',
            activeTab === 'recurring'
              ? 'bg-brand text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          )}
        >
          <Repeat className="size-4" />
          Recurring Subscriptions
        </button>
      </div>

      {activeTab === 'recurring' ? (
        <RecurringExpensesView />
      ) : (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]" role="group" aria-label="Filter by category">
            {['all', ...CATEGORIES].map((c) => {
              const active = category === c
              return (
                <button
                  key={c}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCategory(c)}
                  style={c === 'all' ? undefined : tint(getCategoryColor(c))}
                  className={cn(
                    'flex h-9 shrink-0 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition-colors',
                    active
                      ? c === 'all'
                        ? 'border-brand bg-brand text-primary-foreground'
                        : 'tint-bg tint-text tint-border'
                      : 'bg-card text-muted-foreground hover:text-foreground',
                  )}
                >
                  {c !== 'all' && <span className="size-2 rounded-full bg-(--c)" aria-hidden="true" />}
                  {c === 'all' ? 'All' : c}
                </button>
              )
            })}
          </div>

          <Panel className="flex flex-col gap-4 p-3 md:p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <InputGroup className="h-10 rounded-xl sm:max-w-xs">
                <InputGroupAddon>
                  <Search />
                </InputGroupAddon>
                <InputGroupInput
                  placeholder="Search expenses"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search expenses"
                />
              </InputGroup>
              <Select value={period} onValueChange={(v) => v && setPeriod(v)}>
                <SelectTrigger className="h-10! rounded-xl sm:w-44" aria-label="Time period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {PERIODS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground sm:ml-auto" aria-live="polite">
                {filtered.length} {filtered.length === 1 ? 'expense' : 'expenses'} ·{' '}
                <span className="font-semibold text-foreground tabular-nums">{money(total)}</span>
              </p>
            </div>

            {isLoading ? (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 rounded-2xl" />
                ))}
              </div>
            ) : !filtered.length ? (
              <Empty className="py-12">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Search />
                  </EmptyMedia>
                  <EmptyTitle>No expenses found</EmptyTitle>
                  <EmptyDescription>Try a different search, category or time period.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <>
                <div className="flex flex-col gap-1 md:hidden">
                  {filtered.map((e) => (
                    <ExpenseRow key={e.id} expense={e} action={deleteButton(e)} />
                  ))}
                </div>
                <Table className="hidden md:table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Expense</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="w-12">
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <CategoryIcon category={e.category} size="sm" />
                            <div className="flex min-w-0 flex-col">
                              <span className="truncate font-medium">{e.title}</span>
                              {e.description && (
                                <span className="max-w-xs truncate text-xs text-muted-foreground">{e.description}</span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <CategoryBadge category={e.category} />
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                            {e.paymentMethod || 'UPI'}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{format(parseISO(e.date), 'd MMM yyyy')}</TableCell>
                        <TableCell className="text-right font-semibold tabular-nums">{money(e.amount)}</TableCell>
                        <TableCell>{deleteButton(e)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}
          </Panel>
        </>
      )}

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this expense?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete && `"${pendingDelete.title}" for ${money(pendingDelete.amount)} will be removed and your budgets recalculated.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting ? 'Deleting' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
