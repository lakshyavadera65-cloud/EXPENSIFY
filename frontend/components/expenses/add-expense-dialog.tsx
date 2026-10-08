'use client'

import { createContext, useCallback, useContext, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format, parseISO } from 'date-fns'
import { CalendarIcon, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { CategoryIcon, tint } from '@/components/shared/category'
import { APP_CONFIG, CURRENCIES } from '@/lib/config'
import { CATEGORIES, getCategoryColor } from '@/lib/constants'
import { useExpenseActions } from '@/lib/hooks'
import { usePreferences } from '@/lib/preferences-context'
import { cn } from '@/lib/utils'

const schema = z.object({
  amount: z
    .string()
    .min(1, 'Enter an amount')
    .refine((v) => Number(v) > 0, 'Amount must be greater than 0')
    .refine((v) => Number(v) <= 10_000_000, 'That looks too large'),
  title: z.string().trim().min(2, 'Add a short description').max(60, 'Keep it under 60 characters'),
  category: z.string().trim().min(1, 'Pick a category').max(24, 'Category name is too long'),
  notes: z.string().max(200, 'Keep notes under 200 characters').optional(),
  date: z.string().min(1, 'Pick a date'),
})

type FormValues = z.infer<typeof schema>

const AddExpenseContext = createContext<{ open: () => void } | null>(null)

export function useAddExpense() {
  const ctx = useContext(AddExpenseContext)
  if (!ctx) throw new Error('useAddExpense must be used within AddExpenseProvider')
  return ctx
}

export function AddExpenseProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const open = useCallback(() => setIsOpen(true), [])
  return (
    <AddExpenseContext.Provider value={{ open }}>
      {children}
      <AddExpenseDialog open={isOpen} onOpenChange={setIsOpen} />
    </AddExpenseContext.Provider>
  )
}

export function AddExpenseButton({ className }: { className?: string }) {
  const { open } = useAddExpense()
  return (
    <Button size="lg" onClick={open} className={cn('h-10 rounded-xl px-4 font-semibold hover:bg-brand-hover', className)}>
      <Plus data-icon="inline-start" />
      Add expense
    </Button>
  )
}

const defaultValues = (): FormValues => ({
  amount: '',
  title: '',
  category: 'Food',
  notes: '',
  date: format(APP_CONFIG.today, 'yyyy-MM-dd'),
})

function AddExpenseDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { add } = useExpenseActions()
  const { currency } = usePreferences()
  const [customCategory, setCustomCategory] = useState('')
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: defaultValues() })

  const selectedCategory = watch('category')

  const onSubmit = async (values: FormValues) => {
    try {
      await add({
        amount: Math.round(Number(values.amount) * 100) / 100,
        title: values.title,
        category: values.category,
        description: values.notes || undefined,
        date: values.date,
      })
      toast.success('Expense added', { description: `${values.title} was added to ${values.category}.` })
      reset(defaultValues())
      setCustomCategory('')
      onOpenChange(false)
    } catch (err) {
      toast.error('Could not add expense', { description: err instanceof Error ? err.message : 'Please try again.' })
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) reset(defaultValues())
      }}
    >
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-3xl p-6 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Add expense</DialogTitle>
          <DialogDescription>Log a new expense. It will update your budgets instantly.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup className="gap-5">
            <Field data-invalid={!!errors.amount}>
              <FieldLabel htmlFor="amount" className="sr-only">
                Amount
              </FieldLabel>
              <div
                className={cn(
                  'flex items-center justify-center gap-1 rounded-2xl border bg-muted/50 px-4 py-5 transition-colors focus-within:border-brand',
                  errors.amount && 'border-destructive',
                )}
              >
                <span className="font-heading text-3xl font-semibold text-muted-foreground" aria-hidden="true">
                  {CURRENCIES[currency].symbol}
                </span>
                <input
                  id="amount"
                  inputMode="decimal"
                  autoFocus
                  placeholder="0"
                  aria-invalid={!!errors.amount}
                  aria-describedby={errors.amount ? 'amount-error' : undefined}
                  className="w-full max-w-56 bg-transparent text-center font-heading text-4xl font-bold tabular-nums outline-none placeholder:text-muted-foreground/50"
                  {...register('amount', {
                    onChange: (e) => {
                      e.target.value = e.target.value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1')
                    },
                  })}
                />
              </div>
              <FieldError id="amount-error" errors={[errors.amount]} className="text-center" />
            </Field>

            <Field data-invalid={!!errors.title}>
              <FieldLabel htmlFor="title">Description</FieldLabel>
              <Input id="title" placeholder="e.g. Lunch with team" aria-invalid={!!errors.title} {...register('title')} />
              <FieldError errors={[errors.title]} />
            </Field>

            <FieldSet data-invalid={!!errors.category}>
              <FieldLegend variant="label">Category</FieldLegend>
              <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Category">
                {CATEGORIES.map((c) => {
                  const active = selectedCategory === c
                  return (
                    <button
                      key={c}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => {
                        setValue('category', c, { shouldValidate: true })
                        setCustomCategory('')
                      }}
                      style={tint(getCategoryColor(c))}
                      className={cn(
                        'flex flex-col items-center gap-1.5 rounded-2xl border border-transparent p-2 text-xs font-medium text-muted-foreground transition-all outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50',
                        active && 'tint-bg tint-border text-foreground',
                      )}
                    >
                      <CategoryIcon category={c} size="sm" />
                      <span className="truncate">{c}</span>
                    </button>
                  )
                })}
                <div
                  className={cn(
                    'flex flex-col items-center justify-center gap-1 rounded-2xl border border-dashed p-2',
                    customCategory && 'border-brand',
                  )}
                >
                  <label htmlFor="custom-category" className="sr-only">
                    Custom category
                  </label>
                  <input
                    id="custom-category"
                    value={customCategory}
                    onChange={(e) => {
                      setCustomCategory(e.target.value)
                      setValue('category', e.target.value.trim() || 'Food', { shouldValidate: true })
                    }}
                    placeholder="+ Other"
                    className="w-full bg-transparent text-center text-xs font-medium outline-none placeholder:text-muted-foreground"
                  />
                </div>
              </div>
              <FieldError errors={[errors.category]} />
            </FieldSet>

            <Field data-invalid={!!errors.date}>
              <FieldLabel htmlFor="date-trigger">Date</FieldLabel>
              <Controller
                control={control}
                name="date"
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger
                      render={
                        <Button
                          id="date-trigger"
                          variant="outline"
                          className="h-9 w-full justify-start rounded-lg font-normal"
                        />
                      }
                    >
                      <CalendarIcon data-icon="inline-start" />
                      {field.value ? format(parseISO(field.value), 'EEEE, d MMM yyyy') : 'Pick a date'}
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? parseISO(field.value) : undefined}
                        onSelect={(d) => d && field.onChange(format(d, 'yyyy-MM-dd'))}
                        disabled={{ after: APP_CONFIG.today }}
                        defaultMonth={field.value ? parseISO(field.value) : APP_CONFIG.today}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              <FieldError errors={[errors.date]} />
            </Field>

            <Field data-invalid={!!errors.notes}>
              <FieldLabel htmlFor="notes">
                Notes <span className="font-normal text-muted-foreground">(optional)</span>
              </FieldLabel>
              <Textarea id="notes" rows={2} placeholder="Anything worth remembering?" {...register('notes')} />
              <FieldError errors={[errors.notes]} />
            </Field>
          </FieldGroup>

          <DialogFooter className="mx-0 mt-6 mb-0 gap-2 border-none bg-transparent p-0 sm:justify-end">
            <Button type="button" variant="ghost" size="lg" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" size="lg" disabled={isSubmitting} className="font-semibold hover:bg-brand-hover">
              {isSubmitting && <Spinner data-icon="inline-start" />}
              Save expense
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
