'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { useTheme } from 'next-themes'
import { Bell, LogOut, Moon, Search, Settings, Sun } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Logo } from '@/components/shared/logo'
import { AddExpenseButton } from '@/components/expenses/add-expense-dialog'
import { useAuth } from '@/lib/auth-context'
import { APP_CONFIG } from '@/lib/config'
import { useNotifications } from '@/lib/hooks'

export function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function greeting(date: Date) {
  const h = date.getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export function TopBar() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const { resolvedTheme, setTheme } = useTheme()
  const { data: notifications } = useNotifications()
  const unread = notifications?.filter((n) => !n.read).length ?? 0
  const firstName = user?.name.split(' ')[0] ?? ''

  return (
    <header className="glass sticky top-0 z-30 flex h-16 items-center gap-3 border-b px-4 md:px-8">
      <Link href="/dashboard" className="md:hidden" aria-label="Expensify home">
        <Logo collapsed />
      </Link>

      <div className="hidden min-w-0 flex-col lg:flex">
        <p className="truncate text-sm font-semibold">
          {greeting(APP_CONFIG.today)}, {firstName}
        </p>
        <p className="text-xs text-muted-foreground">
          <time dateTime={format(APP_CONFIG.today, 'yyyy-MM-dd')}>{format(APP_CONFIG.today, 'EEEE, d MMMM yyyy')}</time>
        </p>
      </div>

      <form
        role="search"
        className="ml-auto w-full max-w-xs"
        onSubmit={(e) => {
          e.preventDefault()
          const q = new FormData(e.currentTarget).get('q')?.toString().trim()
          router.push(q ? `/expenses?q=${encodeURIComponent(q)}` : '/expenses')
        }}
      >
        <InputGroup className="h-9 rounded-xl bg-muted/60">
          <InputGroupInput name="q" placeholder="Search expenses" aria-label="Search expenses" />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>
      </form>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-xl"
          aria-label={unread ? `Alerts, ${unread} unread` : 'Alerts'}
          render={<Link href="/alerts" />}
          nativeButton={false}
        >
          <Bell />
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-brand ring-2 ring-background" aria-hidden="true" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl"
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
        >
          <Sun className="hidden dark:block" />
          <Moon className="dark:hidden" />
        </Button>

        <AddExpenseButton className="ml-2 hidden md:inline-flex" />

        <DropdownMenu>
          <DropdownMenuTrigger
            className="ml-2 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            aria-label="Open user menu"
          >
            <Avatar className="size-9">
              <AvatarFallback className="bg-linear-to-br from-brand-light to-brand-hover text-xs font-semibold text-primary-foreground">
                {initials(user?.name ?? 'U')}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex flex-col gap-0.5 py-2">
                <span className="text-sm font-semibold text-foreground">{user?.name}</span>
                <span className="truncate text-xs font-normal">{user?.email}</span>
                <span className="text-xs font-normal text-brand-text">{user?.role} account</span>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push('/settings')}>
                <Settings />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => {
                  logout()
                  router.replace('/login')
                }}
              >
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
