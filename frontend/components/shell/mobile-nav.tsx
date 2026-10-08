'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Plus } from 'lucide-react'
import { useAddExpense } from '@/components/expenses/add-expense-dialog'
import { useAuth } from '@/lib/auth-context'
import { useNotifications } from '@/lib/hooks'
import { cn } from '@/lib/utils'
import { navForRole } from './nav'

export function MobileNav() {
  const pathname = usePathname()
  const { open } = useAddExpense()
  const { user } = useAuth()
  const { data: notifications } = useNotifications()
  const unread = notifications?.filter((n) => !n.read).length ?? 0

  const all = navForRole(user?.role)
  const primary = all.filter((i) => i.href !== '/settings')
  const tabs = user?.role === 'Manager' ? primary.filter((i) => i.href !== '/alerts') : primary
  const left = tabs.slice(0, 2)
  const right = tabs.slice(2, 4)

  const renderTab = (item: (typeof tabs)[number]) => {
    const active = pathname.startsWith(item.href)
    const Icon = item.icon
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'relative flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium text-muted-foreground transition-colors',
          active && 'text-brand-text',
        )}
      >
        <Icon className="size-5" aria-hidden="true" />
        {item.label}
        {item.badge === 'unread' && unread > 0 && (
          <span className="absolute top-1.5 right-[calc(50%-14px)] size-2 rounded-full bg-brand" aria-label={`${unread} unread`} />
        )}
      </Link>
    )
  }

  return (
    <nav
      aria-label="Primary"
      className="glass fixed inset-x-0 bottom-0 z-40 flex items-center border-t px-2 pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {left.map(renderTab)}
      <div className="flex flex-1 justify-center">
        <button
          type="button"
          onClick={open}
          aria-label="Add expense"
          className="-mt-7 flex size-14 items-center justify-center rounded-2xl bg-linear-to-br from-brand-light via-brand to-brand-hover text-primary-foreground shadow-[0_12px_28px_-8px_rgb(255_122_0/0.7)] transition-transform outline-none active:scale-95 focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Plus className="size-6" aria-hidden="true" />
        </button>
      </div>
      {right.map(renderTab)}
    </nav>
  )
}
