import Image from 'next/image'
import Link from 'next/link'
import { CalendarDaysIcon, MapPinIcon, UsersIcon, WalletIcon } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { Trip } from '@/services/mocks'
import { money } from '@/services/mocks'
import { cn } from '@/lib/utils'

const statusStyles: Record<Trip['status'], string> = {
  upcoming: 'bg-brand-soft text-brand',
  ongoing: 'bg-primary/15 text-primary',
  draft: 'bg-muted text-muted-foreground',
  completed: 'bg-success-soft text-success',
}

const statusLabel: Record<Trip['status'], string> = {
  upcoming: 'Upcoming',
  ongoing: 'Happening now',
  draft: 'Draft',
  completed: 'Completed',
}

export function TripCard({ trip, compact = false }: { trip: Trip; compact?: boolean }) {
  const over = trip.estimated > trip.budget

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg hover:shadow-ink/5">
      <Link href={`/trips/${trip.id}`} className="relative block">
        <Image
          src={trip.cover || '/placeholder.svg'}
          alt={trip.name}
          width={640}
          height={420}
          className={cn(
            'w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]',
            compact ? 'h-32' : 'h-44',
          )}
        />
        <Badge className={cn('absolute left-3 top-3 border-0', statusStyles[trip.status])}>
          {statusLabel[trip.status]}
        </Badge>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-col gap-1">
          <Link href={`/trips/${trip.id}`} className="font-display text-base font-bold text-ink">
            {trip.name}
          </Link>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDaysIcon className="size-3.5" aria-hidden="true" />
            {trip.dateLabel}
          </p>
        </div>

        {!compact && (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {trip.summary}
          </p>
        )}

        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <li className="flex items-center gap-1.5">
            <MapPinIcon className="size-3.5" aria-hidden="true" />
            {trip.cities.join(' · ')}
          </li>
          <li className="flex items-center gap-1.5">
            <UsersIcon className="size-3.5" aria-hidden="true" />
            {trip.travellers}
          </li>
        </ul>

        <div className="mt-auto flex flex-col gap-2 pt-1">
          <div className="flex items-baseline justify-between gap-2 text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <WalletIcon className="size-3.5" aria-hidden="true" />
              {money(trip.estimated)}
              <span className="text-xs">/ {money(trip.budget)}</span>
            </span>
            <span
              className={cn(
                'tabular text-xs font-semibold',
                over ? 'text-destructive' : 'text-success',
              )}
            >
              {over ? `${money(trip.estimated - trip.budget)} over` : `${trip.progress}% planned`}
            </span>
          </div>
          <Progress
            value={trip.progress}
            aria-label={`${trip.name} planning progress`}
            className="[&_[data-slot=progress-indicator]]:bg-brand"
          />
          <div className="flex items-center gap-2 pt-1">
            <div className="flex -space-x-2">
              {trip.collaborators.map((c) => (
                <Avatar key={c} className="size-6 ring-2 ring-card">
                  <AvatarFallback className="bg-sand text-[10px] font-semibold text-ink">
                    {c}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">{trip.style}</span>
          </div>
        </div>
      </div>
    </article>
  )
}
