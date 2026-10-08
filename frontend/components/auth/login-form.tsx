'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Spinner } from '@/components/ui/spinner'
import { USE_MOCK } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { PasswordInput } from './password-input'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({})
  const [pending, setPending] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const next: typeof errors = {}
    if (!EMAIL_RE.test(email)) next.email = 'Enter a valid email address'
    if (password.length < 6) next.password = 'Password must be at least 6 characters'
    setErrors(next)
    if (Object.keys(next).length) return

    setPending(true)
    try {
      const user = await login({ email: email.trim(), password })
      toast.success(`Welcome back, ${user.name.split(' ')[0]}`)
      router.replace(params.get('next') || '/dashboard')
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Unable to sign in' })
    } finally {
      setPending(false)
    }
  }

  function fillDemo(kind: 'customer' | 'manager') {
    setEmail(kind === 'manager' ? 'manager@expensify.app' : 'lakshya@expensify.app')
    setPassword('demo1234')
    setErrors({})
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      {errors.form && (
        <Alert variant="destructive">
          <AlertDescription>{errors.form}</AlertDescription>
        </Alert>
      )}
      <FieldGroup>
        <Field data-invalid={!!errors.email || undefined}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <InputGroup className="h-11 rounded-xl">
            <InputGroupAddon>
              <Mail />
            </InputGroupAddon>
            <InputGroupInput
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!errors.email || undefined}
            />
          </InputGroup>
          {errors.email && <FieldError>{errors.email}</FieldError>}
        </Field>

        <Field data-invalid={!!errors.password || undefined}>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <button
              type="button"
              className="text-xs font-medium text-brand-text hover:underline"
              onClick={() => toast.info('Password reset link sent', { description: 'Check your inbox to continue.' })}
            >
              Forgot password?
            </button>
          </div>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!errors.password || undefined}
          />
          {errors.password && <FieldError>{errors.password}</FieldError>}
        </Field>

        <Field orientation="horizontal">
          <Checkbox id="remember" defaultChecked />
          <FieldLabel htmlFor="remember" className="font-normal">
            Remember me for 30 days
          </FieldLabel>
        </Field>
      </FieldGroup>

      <Button type="submit" size="lg" disabled={pending} className="h-11 rounded-xl text-sm font-semibold">
        {pending && <Spinner data-icon="inline-start" />}
        {pending ? 'Signing in' : 'Sign in'}
      </Button>

      {USE_MOCK && (
        <div className="flex flex-col gap-2 rounded-2xl border border-dashed p-4">
          <p className="text-xs text-muted-foreground">Demo mode. Try a sample account:</p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" className="flex-1 rounded-lg" onClick={() => fillDemo('customer')}>
              Customer
            </Button>
            <Button type="button" variant="outline" size="sm" className="flex-1 rounded-lg" onClick={() => fillDemo('manager')}>
              Manager
            </Button>
          </div>
        </div>
      )}

      <p className="text-center text-sm text-muted-foreground">
        New to Expensify?{' '}
        <Link href="/register" className="font-semibold text-brand-text hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  )
}
