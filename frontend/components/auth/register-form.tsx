'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Globe, Mail, MapPin, User } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { useAuth } from '@/lib/auth-context'
import { ROLES, type Role } from '@/lib/types'
import { PasswordInput, PasswordStrength, passwordStrength } from './password-input'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type FormState = { name: string; email: string; password: string; role: Role; city: string; country: string }
type Errors = Partial<Record<keyof FormState | 'form', string>>

function IconInput({
  icon: Icon,
  invalid,
  ...props
}: React.ComponentProps<typeof InputGroupInput> & { icon: React.ElementType; invalid?: boolean }) {
  return (
    <InputGroup className="h-11 rounded-xl">
      <InputGroupAddon>
        <Icon />
      </InputGroupAddon>
      <InputGroupInput aria-invalid={invalid || undefined} {...props} />
    </InputGroup>
  )
}

export function RegisterForm() {
  const router = useRouter()
  const { register } = useAuth()
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    password: '',
    role: 'Customer',
    city: '',
    country: 'India',
  })
  const [errors, setErrors] = useState<Errors>({})
  const [pending, setPending] = useState(false)

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }))

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const next: Errors = {}
    if (form.name.trim().length < 2) next.name = 'Enter your full name'
    if (!EMAIL_RE.test(form.email)) next.email = 'Enter a valid email address'
    if (form.password.length < 8) next.password = 'Use at least 8 characters'
    else if (passwordStrength(form.password).score < 2) next.password = 'Add uppercase letters, numbers or symbols'
    if (!form.city.trim()) next.city = 'City is required for weather alerts'
    if (!form.country.trim()) next.country = 'Country is required'
    setErrors(next)
    if (Object.keys(next).length) return

    setPending(true)
    try {
      await register({ ...form, name: form.name.trim(), email: form.email.trim(), city: form.city.trim(), country: form.country.trim() })
      toast.success('Account created', { description: 'Your workspace is ready.' })
      router.replace('/dashboard')
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Unable to create account' })
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      {errors.form && (
        <Alert variant="destructive">
          <AlertDescription>{errors.form}</AlertDescription>
        </Alert>
      )}
      <FieldGroup>
        <Field data-invalid={!!errors.name || undefined}>
          <FieldLabel htmlFor="name">Full name</FieldLabel>
          <IconInput
            id="name"
            icon={User}
            autoComplete="name"
            placeholder="Lakshya Vadera"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            invalid={!!errors.name}
          />
          {errors.name && <FieldError>{errors.name}</FieldError>}
        </Field>

        <Field data-invalid={!!errors.email || undefined}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <IconInput
            id="email"
            icon={Mail}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            invalid={!!errors.email}
          />
          {errors.email && <FieldError>{errors.email}</FieldError>}
        </Field>

        <Field data-invalid={!!errors.password || undefined}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={form.password}
            onChange={(e) => set('password', e.target.value)}
            aria-invalid={!!errors.password || undefined}
          />
          <PasswordStrength password={form.password} />
          {errors.password && <FieldError>{errors.password}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="role">Account type</FieldLabel>
          <Select value={form.role} onValueChange={(v) => v && set('role', v as Role)}>
            <SelectTrigger id="role" className="h-11! w-full rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <FieldDescription>Managers can assign and monitor customer accounts.</FieldDescription>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={!!errors.city || undefined}>
            <FieldLabel htmlFor="city">City</FieldLabel>
            <IconInput
              id="city"
              icon={MapPin}
              autoComplete="address-level2"
              placeholder="Bengaluru"
              value={form.city}
              onChange={(e) => set('city', e.target.value)}
              invalid={!!errors.city}
            />
            {errors.city && <FieldError>{errors.city}</FieldError>}
          </Field>
          <Field data-invalid={!!errors.country || undefined}>
            <FieldLabel htmlFor="country">Country</FieldLabel>
            <IconInput
              id="country"
              icon={Globe}
              autoComplete="country-name"
              value={form.country}
              onChange={(e) => set('country', e.target.value)}
              invalid={!!errors.country}
            />
            {errors.country && <FieldError>{errors.country}</FieldError>}
          </Field>
        </div>
      </FieldGroup>

      <Button type="submit" size="lg" disabled={pending} className="h-11 rounded-xl text-sm font-semibold">
        {pending && <Spinner data-icon="inline-start" />}
        {pending ? 'Creating account' : 'Create account'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-brand-text hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  )
}
