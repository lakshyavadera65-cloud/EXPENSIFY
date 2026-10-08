import Image from 'next/image'
import Link from 'next/link'
import { Logo } from '@/components/shared/logo'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-linear-to-br from-[#2a1606] via-[#1a0f06] to-[#0f0d0b] p-10 text-[#fff4e8] lg:flex lg:flex-col">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 -left-32 size-[34rem] rounded-full bg-brand/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -bottom-40 size-[28rem] rounded-full bg-brand-light/20 blur-3xl"
        />
        <Link href="/" className="relative w-fit">
          <Logo className="[&_span]:text-[#fff4e8]" />
        </Link>
        <div className="relative flex flex-1 items-center justify-center py-10">
          <Image
            src="/images/wallet-coins.png"
            alt="An orange wallet with gold coins and a rising chart"
            width={520}
            height={520}
            priority
            className="w-full max-w-md drop-shadow-[0_40px_60px_rgb(255_122_0/0.35)]"
          />
        </div>
        <div className="relative flex max-w-md flex-col gap-3">
          <h2 className="text-3xl leading-tight font-bold text-balance">
            Every rupee, accounted for. Every budget, under control.
          </h2>
          <p className="text-sm leading-relaxed text-[#fff4e8]/70">
            Track daily spending, set smart limits and get alerted at 80, 85, 90, 95 and 100 percent before you
            overspend.
          </p>
        </div>
      </aside>

      <main className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="flex w-full max-w-md flex-col gap-8">
          <Link href="/" className="w-fit lg:hidden">
            <Logo />
          </Link>
          {children}
        </div>
      </main>
    </div>
  )
}
