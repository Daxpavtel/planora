import Image from 'next/image'
import { PlusIcon, StarIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { City } from '@/services/mocks'

export function CityCard({ city }: { city: City }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg hover:shadow-ink/5">
      <div className="relative">
        <Image
          src={city.image || '/placeholder.svg'}
          alt={`${city.name}, ${city.country}`}
          width={640}
          height={420}
          className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-card/90 px-2 py-1 text-xs font-semibold text-ink backdrop-blur">
          <StarIcon className="size-3 fill-warning text-warning" aria-hidden="true" />
          {(city.popularity / 20).toFixed(1)}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="font-display text-base font-bold text-ink">{city.name}</h3>
          <p className="text-xs text-muted-foreground">
            {city.country} · {city.region}
          </p>
        </div>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {city.description}
        </p>
        <ul className="flex flex-wrap gap-1.5">
          {city.tags.map((t) => (
            <li key={t}>
              <Badge variant="secondary">{t}</Badge>
            </li>
          ))}
        </ul>
        <dl className="grid grid-cols-2 gap-2 border-t border-border pt-3 text-xs">
          <div>
            <dt className="text-muted-foreground">Avg. daily cost</dt>
            <dd className="tabular font-display text-sm font-bold text-ink">
              €{city.dailyCost}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Suggested stay</dt>
            <dd className="font-display text-sm font-bold text-ink">{city.suggestedDays}</dd>
          </div>
        </dl>
        <Button variant="outline" size="sm" className="mt-auto w-full">
          <PlusIcon data-icon="inline-start" />
          Add to trip
        </Button>
      </div>
    </article>
  )
}
