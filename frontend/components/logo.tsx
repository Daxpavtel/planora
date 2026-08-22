import { cn } from '@/lib/utils'

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn('size-6', className)}
    >
      <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
      <path
        d="M4.5 9.5c3.2 1.6 5.2-1.4 8-.4 2.1.8 2.4 3.6 5.1 3.3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="2.6" fill="currentColor" />
    </svg>
  )
}

export function Wordmark({
  className,
  tone = 'default',
}: {
  className?: string
  tone?: 'default' | 'invert'
}) {
  return (
    <span className={cn('flex items-center gap-2', className)}>
      <LogoMark className={tone === 'invert' ? 'text-primary' : 'text-brand'} />
      <span
        className={cn(
          'font-display text-[17px] font-extrabold tracking-tight',
          tone === 'invert' ? 'text-white' : 'text-ink',
        )}
      >
        Globe<span className="font-medium opacity-70">Trotter</span>
      </span>
    </span>
  )
}
