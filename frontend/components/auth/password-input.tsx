'use client'

import { useState } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group'

export function PasswordInput(props: React.ComponentProps<typeof InputGroupInput>) {
  const [visible, setVisible] = useState(false)
  return (
    <InputGroup className="h-11 rounded-xl">
      <InputGroupAddon>
        <Lock />
      </InputGroupAddon>
      <InputGroupInput type={visible ? 'text' : 'password'} {...props} />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          size="icon-xs"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
        >
          {visible ? <EyeOff /> : <Eye />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}

export function passwordStrength(pw: string) {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  const labels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['#FB7185', '#FB7185', '#FBBF24', '#34D399', '#34D399']
  return { score, label: labels[score], color: colors[score] }
}

export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null
  const { score, label, color } = passwordStrength(password)
  return (
    <div className="flex items-center gap-3" aria-live="polite">
      <div className="flex flex-1 gap-1" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="h-1.5 flex-1 rounded-full bg-muted transition-colors"
            style={i < score ? { backgroundColor: color } : undefined}
          />
        ))}
      </div>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  )
}
