'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Spinner } from '@/components/ui/spinner'
import { AddExpenseProvider } from '@/components/expenses/add-expense-dialog'
import { Logo } from '@/components/shared/logo'
import { useAuth } from '@/lib/auth-context'
import { AppSidebar } from './app-sidebar'
import { MobileNav } from './mobile-nav'
import { TopBar } from './top-bar'

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    if (ready && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`)
  }, [ready, user, router, pathname])

  if (!ready || !user) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4" role="status">
        <Logo />
        <Spinner className="size-5 text-brand" />
        <span className="sr-only">Loading your workspace</span>
      </div>
    )
  }

  return (
    <AddExpenseProvider>
      <div className="flex min-h-dvh">
        <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 pt-6 pb-28 md:px-8 md:pt-8 md:pb-12">{children}</main>
        </div>
      </div>
      <MobileNav />
    </AddExpenseProvider>
  )
}
