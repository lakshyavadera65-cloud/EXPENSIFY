import { cn } from '@/lib/utils'

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-balance md:text-3xl">{title}</h1>
        {description && <p className="text-sm text-muted-foreground md:text-base">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

/** Rounded-3xl surface used for every card in the app. */
export function Panel({
  className,
  children,
  ...props
}: React.ComponentProps<'section'>) {
  return (
    <section className={cn('surface rounded-3xl p-5 md:p-6', className)} {...props}>
      {children}
    </section>
  )
}

export function PanelHeader({
  title,
  description,
  action,
  className,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('mb-5 flex items-start justify-between gap-4', className)}>
      <div className="flex min-w-0 flex-col gap-0.5">
        <h2 className="text-base font-semibold">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function ChartTooltip({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="glass rounded-xl border px-3 py-2 text-xs shadow-lg">
      <p className="text-muted-foreground">{label}</p>
      <p className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-foreground">
        {color && <span className="size-2 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />}
        {value}
      </p>
    </div>
  )
}
