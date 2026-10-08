'use client'

import { useMemo, useState } from 'react'
import { format, parseISO, subDays } from 'date-fns'
import { Download, Search, Trash2 } from 'lucide-react'
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

function exportCsv(rows: Expense[]) {
  const header = ['Date', 'Title', 'Category', 'Amount', 'Description']
  const escape = (v: string | number | undefined) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const csv = [header, ...rows.map((r) => [r.date, r.title, r.category, r.amount, r.description])]
    .map((r) => r.map(escape).join(','))
    .join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `expenses-${format(new Date(), 'yyyy-MM-dd')}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function ExpensesView() {
  const money = useMoney()
  const { data, isLoading } = useExpenses()
  const { remove } = useExpenseActions()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string>('all')
  const [period, setPeriod] = useState('30')
  const [pendingDelete, setPendingDelete] = useState<Expense | null>(null)
  const [deleting, setDeleting] = useState(false)

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
        title="Expenses"
        description="Search, filter and manage every transaction."
        actions={
          <>
            <Button variant="outline" onClick={() => exportCsv(filtered)} disabled={!filtered.length}>
              <Download data-icon="inline-start" />
              Export CSV
            </Button>
            <AddExpenseButton className="hidden md:inline-flex" />
          </>
        }
      />

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
              <SelectValue>{(v: string) => PERIODS.find((p) => p.value === v)?.label}</SelectValue>
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
