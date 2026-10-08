import { cn } from '@/lib/utils'
import { getCategoryColor, getCategoryIcon } from '@/lib/constants'

type TintStyle = React.CSSProperties & { '--c': string }

export function tint(color: string): TintStyle {
  return { '--c': color }
}

export function CategoryIcon({
  category,
  size = 'md',
  className,
}: {
  category: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const Icon = getCategoryIcon(category)
  return (
    <span
      aria-hidden="true"
      style={tint(getCategoryColor(category))}
      className={cn(
        'tint-bg tint-icon inline-flex shrink-0 items-center justify-center rounded-xl',
        size === 'sm' && 'size-8 [&_svg]:size-4',
        size === 'md' && 'size-10 [&_svg]:size-[18px]',
        size === 'lg' && 'size-12 [&_svg]:size-5',
        className,
      )}
    >
      <Icon />
    </span>
  )
}

export function CategoryBadge({ category, className }: { category: string; className?: string }) {
  return (
    <span
      style={tint(getCategoryColor(category))}
      className={cn(
        'tint-bg tint-text tint-border inline-flex h-6 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium whitespace-nowrap',
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-(--c)" aria-hidden="true" />
      {category}
    </span>
  )
}
