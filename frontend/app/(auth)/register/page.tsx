import type { Metadata } from 'next'
import { RegisterForm } from '@/components/auth/register-form'

export const metadata: Metadata = { title: 'Create account' }

export default function RegisterPage() {
  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Create your account</h1>
        <p className="text-muted-foreground">Start tracking expenses and set smarter budgets in minutes.</p>
      </div>
      <RegisterForm />
    </>
  )
}
