'use client'

import { animate, motion, useInView, useMotionValue, type Variants } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
}

export function Stagger({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className={className}>
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  className,
  children,
  lift = false,
}: {
  className?: string
  children: React.ReactNode
  lift?: boolean
}) {
  return (
    <motion.div
      variants={item}
      whileHover={lift ? { y: -4, transition: { duration: 0.2 } } : undefined}
      className={cn('min-w-0', className)}
    >
      {children}
    </motion.div>
  )
}

export function CountUp({
  value,
  format,
  duration = 1.1,
  className,
}: {
  value: number
  format: (n: number) => string
  duration?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const mv = useMotionValue(0)
  const [display, setDisplay] = useState(() => format(0))

  useEffect(() => {
    if (!inView) return
    const controls = animate(mv, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(format(Math.round(v))),
    })
    return () => controls.stop()
  }, [inView, value, duration, format, mv])

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      <span aria-hidden="true">{display}</span>
      <span className="sr-only">{format(value)}</span>
    </span>
  )
}
