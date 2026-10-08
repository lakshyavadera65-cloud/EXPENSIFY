import { Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Logo({ collapsed = false, className }: { collapsed?: boolean; className?: string }) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-brand-light via-brand to-brand-hover text-primary-foreground shadow-[0_8px_20px_-6px_rgb(255_122_0/0.6)]">
        <Wallet className="size-[18px]" aria-hidden="true" />
      </span>
      {!collapsed && <span className="font-heading text-lg font-bold tracking-tight">Expensify</span>}
    </span>
  )
}
