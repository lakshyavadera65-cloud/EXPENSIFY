'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronsLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Logo } from '@/components/shared/logo'
import { tint } from '@/components/shared/category'
import { useAuth } from '@/lib/auth-context'
import { useNotifications } from '@/lib/hooks'
import { cn } from '@/lib/utils'
import { navForRole } from './nav'

export function AppSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname()
  const { user } = useAuth()
  const { data: notifications } = useNotifications()
  const unread = notifications?.filter((n) => !n.read).length ?? 0
  const items = navForRole(user?.role)

  return (
    <motion.aside
      animate={{ width: collapsed ? 84 : 256 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 hidden h-dvh shrink-0 flex-col border-r bg-sidebar md:flex"
      aria-label="Primary"
    >
      <div className={cn('flex h-16 items-center px-5', collapsed && 'justify-center px-0')}>
        <Link href="/dashboard" className="rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
          <Logo collapsed={collapsed} />
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        <p className={cn('px-3 pb-2 text-xs font-medium tracking-wider text-muted-foreground uppercase', collapsed && 'sr-only')}>
          Menu
        </p>
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon
          const count = item.badge === 'unread' ? unread : 0
          const link = (
            <Link
              href={item.href}
              aria-current={active ? 'page' : undefined}
              style={tint(item.color)}
              className={cn(
                'group relative flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted-foreground transition-colors outline-none hover:bg-sidebar-accent hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50',
                active && 'bg-brand/12 text-foreground hover:bg-brand/15',
                collapsed && 'justify-center px-0',
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute top-2 bottom-2 left-0 w-1 rounded-r-full bg-brand"
                  aria-hidden="true"
                />
              )}
              <span className="tint-bg tint-icon flex size-8 shrink-0 items-center justify-center rounded-lg">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
              {count > 0 &&
                (collapsed ? (
                  <span className="absolute top-2 right-4 size-2 rounded-full bg-brand" aria-label={`${count} unread`} />
                ) : (
                  <Badge className="h-5 min-w-5 rounded-full px-1.5 tabular-nums">{count}</Badge>
                ))}
            </Link>
          )
          return collapsed ? (
            <Tooltip key={item.href}>
              <TooltipTrigger render={<div />}>{link}</TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ) : (
            <div key={item.href}>{link}</div>
          )
        })}
      </nav>

      <div className={cn('flex p-3', collapsed ? 'justify-center' : 'justify-end')}>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="rounded-xl text-muted-foreground"
        >
          <ChevronsLeft className={cn('transition-transform', collapsed && 'rotate-180')} />
        </Button>
      </div>
    </motion.aside>
  )
}
