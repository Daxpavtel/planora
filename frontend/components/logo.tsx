import Image from 'next/image'
import { cn } from '@/lib/utils'

export function LogoMark({ className }: { className?: string }) {
  return (
    <div className={cn('relative flex items-center justify-center overflow-hidden rounded-lg', className)}>
      <Image
        src="/logo.png"
        alt="Planora Logo"
        width={36}
        height={36}
        className="size-full object-contain"
        priority
      />
    </div>
  )
}

export function Wordmark({
  className,
  tone = 'default',
  showTagline = false,
}: {
  className?: string
  tone?: 'default' | 'invert'
  showTagline?: boolean
}) {
  return (
    <span className={cn('flex items-center gap-2.5 select-none', className)}>
      <span
        className={cn(
          'relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-xl p-0.5 shadow-sm transition-all',
          tone === 'invert' ? 'bg-white/10 ring-1 ring-white/20' : 'bg-white shadow-ink/5 border border-border/80',
        )}
      >
        <Image
          src="/logo.png"
          alt="Planora"
          width={32}
          height={32}
          className="size-full object-contain"
          priority
        />
      </span>
      <span className="flex flex-col justify-center leading-none">
        <span
          className={cn(
            'font-display text-[17px] font-extrabold tracking-tight',
            tone === 'invert' ? 'text-white' : 'text-ink',
          )}
        >
          Planora
        </span>
        {showTagline ? (
          <span
            className={cn(
              'text-[9.5px] font-medium tracking-normal mt-0.5',
              tone === 'invert' ? 'text-white/70' : 'text-muted-foreground',
            )}
          >
            Plan Smarter. Travel Better.
          </span>
        ) : null}
      </span>
    </span>
  )
}
