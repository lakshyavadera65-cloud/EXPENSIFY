'use client'

import { ThemeProvider } from 'next-themes'
import { MotionConfig } from 'framer-motion'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/lib/auth-context'
import { PreferencesProvider } from '@/lib/preferences-context'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
      <MotionConfig reducedMotion="user">
        <AuthProvider>
          <PreferencesProvider>
            <TooltipProvider>
              {children}
              <Toaster position="top-right" richColors closeButton />
            </TooltipProvider>
          </PreferencesProvider>
        </AuthProvider>
      </MotionConfig>
    </ThemeProvider>
  )
}
