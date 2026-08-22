'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  BookmarkIcon,
  CheckIcon,
  CopyIcon,
  HeartIcon,
  InfoIcon,
  MessageSquareIcon,
  PlusIcon,
  SearchIcon,
  Share2Icon,
  StarIcon,
  UserCheckIcon,
  UsersIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { AppShell } from '@/components/app-shell'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Field, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useAuth } from '@/lib/auth'
import { communityTrips, money, type CommunityReview, type CommunityTrip } from '@/lib/data'
import { cn } from '@/lib/utils'

const categories = ['All', 'Top Rated', 'Most Bookmarked', 'Budget Friendly', 'North India', 'South India', 'West India']

export default function CommunityPage() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [trips, setTrips] = useState<CommunityTrip[]>(communityTrips)
  const [selectedTrip, setSelectedTrip] = useState<CommunityTrip | null>(null)

  // Review form state
  const [newRating, setNewRating] = useState(5)
  const [newComment, setNewComment] = useState('')

  const filteredTrips = useMemo(() => {
    const q = query.trim().toLowerCase()
    return trips.filter((trip) => {
      const matchesQuery =
        !q ||
        trip.title.toLowerCase().includes(q) ||
        trip.author.toLowerCase().includes(q) ||
        trip.cities.some((c) => c.toLowerCase().includes(q))

      let matchesCategory = true
      if (category === 'Top Rated') matchesCategory = trip.rating >= 4.8
      if (category === 'Most Bookmarked') matchesCategory = trip.bookmarked
      if (category === 'Budget Friendly') matchesCategory = trip.style === 'Budget' || trip.budget <= 20000
      if (category === 'North India') matchesCategory = trip.cities.some((c) => ['Jaipur', 'Udaipur', 'Delhi', 'Varanasi', 'Manali', 'Agra', 'Amritsar'].includes(c))
      if (category === 'South India') matchesCategory = trip.cities.some((c) => ['Kochi', 'Bengaluru'].includes(c))
      if (category === 'West India') matchesCategory = trip.cities.some((c) => ['Goa', 'Mumbai'].includes(c))

      return matchesQuery && matchesCategory
    })
  }, [query, category, trips])

  function toggleBookmark(tripId: string) {
    setTrips((prev) =>
      prev.map((t) => {
        if (t.id === tripId) {
          const nextState = !t.bookmarked
          toast.success(nextState ? `Saved "${t.title}" to your bookmarks` : `Removed "${t.title}" from bookmarks`)
          return { ...t, bookmarked: nextState }
        }
        return t
      }),
    )
  }

  function toggleLike(tripId: string) {
    setTrips((prev) =>
      prev.map((t) => {
        if (t.id === tripId) {
          return { ...t, likes: t.likes + 1 }
        }
        return t
      }),
    )
    toast.success('Appreciated trip itinerary!')
  }

  function handleCloneTrip(trip: CommunityTrip) {
    toast.success(`Cloned "${trip.title}" into your trips list!`)
  }

  function handleAddReview(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedTrip || !newComment.trim()) return

    const reviewObj: CommunityReview = {
      id: `r-${Date.now()}`,
      user: `${user.name} (You)`,
      avatar: user.initials,
      rating: newRating,
      comment: newComment,
      date: 'Just now',
    }

    setTrips((prev) =>
      prev.map((t) => {
        if (t.id === selectedTrip.id) {
          const updatedReviews = [reviewObj, ...t.reviews]
          const avgRating = Number((updatedReviews.reduce((acc, r) => acc + r.rating, 0) / updatedReviews.length).toFixed(1))
          const updatedTrip = {
            ...t,
            reviews: updatedReviews,
            reviewsCount: t.reviewsCount + 1,
            rating: avgRating,
          }
          setSelectedTrip(updatedTrip)
          return updatedTrip
        }
        return t
      }),
    )

    setNewComment('')
    toast.success('Your review has been posted!')
  }

  return (
    <AppShell title="Community Tab" searchPlaceholder="Search community trip itineraries">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <header className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <UsersIcon className="size-6 text-brand" aria-hidden="true" />
              <h2 className="font-display text-2xl font-bold text-ink">Community Itineraries</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Explore itineraries created by fellow travellers. Bookmark, review, or clone them directly to your plans.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <InputGroup className="h-11 flex-1 sm:max-w-md">
              <InputGroupAddon>
                <SearchIcon />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Search trip title, author, or city…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search community trips"
              />
            </InputGroup>

            <ToggleGroup
              value={[category]}
              onValueChange={(v) => {
                const next = (v as string[])[0]
                if (next) setCategory(next)
              }}
              variant="outline"
              size="sm"
              className="flex-wrap justify-start"
            >
              {categories.map((c) => (
                <ToggleGroupItem key={c} value={c}>
                  {c}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </header>

        {/* Main Content Layout (Grid + Wireframe Sidebar Note) */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Feed Grid */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Showing {filteredTrips.length} community itineraries</span>
              <span>Sorted by popularity & rating</span>
            </div>

            <ul className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {filteredTrips.map((trip) => (
                <li key={trip.id}>
                  <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg hover:shadow-ink/5">
                    <div className="relative">
                      <Image
                        src={trip.cover || '/placeholder.svg'}
                        alt={trip.title}
                        width={640}
                        height={420}
                        className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                      <button
                        type="button"
                        onClick={() => toggleBookmark(trip.id)}
                        aria-label={trip.bookmarked ? 'Remove bookmark' : 'Bookmark trip'}
                        className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-card/90 text-ink backdrop-blur transition-transform active:scale-95"
                      >
                        <BookmarkIcon
                          className={cn('size-4', trip.bookmarked && 'fill-brand text-brand')}
                          aria-hidden="true"
                        />
                      </button>
                      <Badge className="absolute left-3 top-3 border-0 bg-ink/80 text-card backdrop-blur">
                        {trip.days} Days · {trip.style}
                      </Badge>
                    </div>

                    <div className="flex flex-1 flex-col gap-3 p-4">
                      {/* Author row */}
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-8">
                          <AvatarFallback className="bg-brand-soft text-xs font-bold text-brand">
                            {trip.authorAvatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-ink">{trip.author}</p>
                          <p className="truncate text-[11px] text-muted-foreground">{trip.authorRole}</p>
                        </div>
                        <span className="flex items-center gap-1 rounded-full bg-warning-soft px-2 py-0.5 text-xs font-bold text-warning-foreground">
                          <StarIcon className="size-3 fill-warning text-warning" aria-hidden="true" />
                          {trip.rating}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-display text-base font-bold text-ink">{trip.title}</h3>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                          {trip.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {trip.cities.map((city) => (
                          <Badge key={city} variant="secondary" className="text-[11px]">
                            {city}
                          </Badge>
                        ))}
                      </div>

                      <dl className="mt-auto grid grid-cols-2 gap-2 border-t border-border pt-3 text-xs">
                        <div>
                          <dt className="text-muted-foreground">Estimated Budget</dt>
                          <dd className="tabular font-display text-sm font-bold text-ink">
                            {money(trip.budget)}
                          </dd>
                        </div>
                        <div className="text-right">
                          <dt className="text-muted-foreground">Reviews</dt>
                          <dd className="tabular font-display text-sm font-bold text-ink">
                            {trip.reviewsCount} reviews
                          </dd>
                        </div>
                      </dl>

                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setSelectedTrip(trip)}
                        >
                          <MessageSquareIcon data-icon="inline-start" />
                          Reviews ({trip.reviews.length})
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleCloneTrip(trip)}
                        >
                          <CopyIcon data-icon="inline-start" />
                          Clone Trip
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => toggleLike(trip.id)}
                          aria-label="Like itinerary"
                        >
                          <HeartIcon className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </div>

          {/* Sidebar Note (Matching Wireframe Screen 10) */}
          <aside className="flex flex-col gap-4">
            <Card className="border-brand/30 bg-brand-soft/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-ink">
                  <InfoIcon className="size-5 text-brand" aria-hidden="true" />
                  Community Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 text-xs text-muted-foreground leading-relaxed">
                <p>
                  <strong>Community tab</strong> keeps all the community trip itineraries published by users and local experts.
                </p>
                <p>
                  Users can <strong>bookmark</strong> these itineraries, <strong>rate or review</strong> them, and <strong>clone</strong> complete day-by-day plans into their own account to customize their trips with authentic feedback.
                </p>
                <Separator />
                <div className="flex flex-col gap-2 pt-1">
                  <h4 className="font-semibold text-ink">Why share your itinerary?</h4>
                  <ul className="flex flex-col gap-1.5 text-[11px]">
                    <li className="flex items-center gap-1.5">
                      <CheckIcon className="size-3.5 text-success" />
                      Help fellow travellers skip tourist traps
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckIcon className="size-3.5 text-success" />
                      Earn top-creator badges on your profile
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckIcon className="size-3.5 text-success" />
                      Receive feedback & tips for your next trip
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-ink">Top Community Contributors</CardTitle>
                <CardDescription className="text-xs">Based on itinerary ratings</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {[
                  { name: user.name, role: user.role || 'Trip Architect', trips: 5, avatar: user.initials },
                  { name: 'Aarti Rao', role: 'Pro Traveler · Rajasthan', trips: 14, avatar: 'AR' },
                  { name: 'Rohan Sharma', role: 'Local Guide · Goa', trips: 8, avatar: 'RS' },
                ].map((c) => (
                  <div key={c.name} className="flex items-center gap-3 rounded-xl border border-border p-2.5">
                    <Avatar className="size-8">
                      <AvatarFallback className="bg-brand-soft text-xs font-bold text-brand">
                        {c.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-ink">{c.name}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{c.role}</p>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">
                      {c.trips} plans
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      {/* Reviews & Ratings Dialog Modal */}
      <Dialog open={Boolean(selectedTrip)} onOpenChange={(open) => !open && setSelectedTrip(null)}>
        <DialogContent className="max-h-[85svh] max-w-lg overflow-y-auto">
          {selectedTrip && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">{selectedTrip.title}</DialogTitle>
                <DialogDescription className="flex items-center gap-2 text-xs">
                  Published by <span className="font-semibold text-ink">{selectedTrip.author}</span> · {selectedTrip.rating} ★ ({selectedTrip.reviewsCount} reviews)
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-4 py-2">
                {/* Write a Review Section */}
                <form onSubmit={handleAddReview} className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-3">
                  <h4 className="text-xs font-semibold text-ink">Rate & Review this itinerary</h4>
                  <div className="flex items-center gap-2">
                    <FieldLabel className="text-xs">Rating:</FieldLabel>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="text-warning transition-transform hover:scale-110"
                        >
                          <StarIcon
                            className={cn('size-5', star <= newRating ? 'fill-warning' : 'text-muted-foreground')}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <Field>
                    <Textarea
                      rows={2}
                      placeholder="Share your experience or tips about this itinerary..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="text-xs"
                      required
                    />
                  </Field>
                  <Button type="submit" size="sm" className="w-fit ml-auto">
                    <PlusIcon data-icon="inline-start" />
                    Submit Review
                  </Button>
                </form>

                <Separator />

                {/* Reviews List */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-xs font-semibold text-ink">Community Reviews ({selectedTrip.reviews.length})</h4>
                  {selectedTrip.reviews.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No reviews yet. Be the first to leave a review!</p>
                  ) : (
                    <ul className="flex flex-col gap-3">
                      {selectedTrip.reviews.map((rev) => (
                        <li key={rev.id} className="flex flex-col gap-1.5 rounded-xl border border-border bg-card p-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Avatar className="size-6">
                                <AvatarFallback className="bg-brand-soft text-[10px] font-bold text-brand">
                                  {rev.avatar}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs font-semibold text-ink">{rev.user}</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground">{rev.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <StarIcon
                                key={s}
                                className={cn(
                                  'size-3',
                                  s <= rev.rating ? 'fill-warning text-warning' : 'text-muted-foreground/40',
                                )}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{rev.comment}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  )
}
