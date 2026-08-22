'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { SparklesIcon } from 'lucide-react'
import { Wordmark } from '@/components/logo'
import { Badge } from '@/components/ui/badge'

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
    monument: 'Taj Mahal',
    location: 'Agra, Uttar Pradesh',
    quote: '“Ivory-white marble poetry on the banks of Yamuna, an eternal symbol of love and architectural perfection.”',
    tag: 'UNESCO World Heritage',
  },
  {
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
    monument: 'Amber Fort & Hawa Mahal',
    location: 'Jaipur, Rajasthan',
    quote: '“Sheesh Mahal mirror halls and majestic hilltop ramparts overlooking the pink desert capital.”',
    tag: 'Royal Rajput Splendor',
  },
  {
    image: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=1200&q=80',
    monument: 'City Palace & Lake Pichola',
    location: 'Udaipur, Rajasthan',
    quote: '“Floating marble palaces, sunset cruises, and the romantic soul of the Aravalli mountain valleys.”',
    tag: 'City of Lakes',
  },
  {
    image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80',
    monument: 'Dashashwamedh Ganga Ghats',
    location: 'Varanasi, Uttar Pradesh',
    quote: '“Rhythmic brass lamps, chants over the holy Ganga, and the timeless spiritual heartbeat of India.”',
    tag: 'Spiritual Capital',
  },
  {
    image: 'https://images.unsplash.com/photo-1588714477688-cf28a50e94f7?auto=format&fit=crop&w=1200&q=80',
    monument: 'Golden Temple (Harmandir Sahib)',
    location: 'Amritsar, Punjab',
    quote: '“Gilded dome shining over the sacred Amrit Sarovar, radiating peace and boundless community warmth.”',
    tag: 'Holy Sanctuary',
  },
  {
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1200&q=80',
    monument: 'Mehrangarh Fort',
    location: 'Jodhpur, Rajasthan',
    quote: '“Towering sandstone citadel standing guardian over the blue painted houses of the desert.”',
    tag: 'The Sun City Citadel',
  },
  {
    image: 'https://images.unsplash.com/photo-1620766182966-c6eb5ed2b788?auto=format&fit=crop&w=1200&q=80',
    monument: 'Vijaya Vittala Stone Chariot',
    location: 'Hampi, Karnataka',
    quote: '“Ancient carved stone marvels, musical pillars, and legendary ruins of the Vijayanagara Empire.”',
    tag: 'Ancient Architecture',
  },
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  const slide = slides[currentSlide]

  return (
    <div className="flex min-h-svh w-full flex-col overflow-x-hidden bg-background lg:grid lg:grid-cols-[1fr_1.15fr]">
      {/* Mobile Heritage Banner (Visible only on mobile/tablet) */}
      <div className="relative flex h-36 w-full flex-col justify-between overflow-hidden bg-ink p-4 text-white sm:h-44 lg:hidden">
        <Image
          src={slide.image}
          alt={slide.monument}
          fill
          className="object-cover opacity-65"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-black/40 to-black/30" />
        
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="inline-flex">
            <Wordmark tone="invert" showTagline />
          </Link>
          <Badge className="border-0 bg-brand/90 text-brand-foreground text-[10px] py-0.5 px-2">
            {slide.tag}
          </Badge>
        </div>

        <div className="relative z-10">
          <p className="text-xs font-semibold text-white/90 drop-shadow">
            📍 {slide.monument}, {slide.location}
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-6 md:p-8 lg:p-10">
        <div className="hidden lg:block">
          <Link href="/" className="inline-flex">
            <Wordmark showTagline />
          </Link>
        </div>

        <div className="my-auto flex w-full items-center justify-center py-6 sm:py-8">
          <div className="w-full max-w-sm sm:max-w-md">{children}</div>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          By continuing you agree to Planora’s Terms of Service and Privacy Policy.
        </p>
      </div>

      {/* Desktop Slideshow (Visible only on desktop lg+) */}
      <div className="relative hidden overflow-hidden bg-ink lg:block">
        {slides.map((s, index) => (
          <div
            key={s.monument}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <Image
              src={s.image}
              alt={s.monument}
              fill
              className="object-cover scale-105 transition-transform duration-7000 ease-out"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/15" />
            <figure className="absolute inset-x-0 bottom-0 p-10 flex flex-col gap-4 text-white">
              <div className="flex items-center gap-2">
                <Badge className="bg-brand/90 text-brand-foreground border-0 gap-1.5 py-1 px-3">
                  <SparklesIcon className="size-3.5" />
                  {s.tag}
                </Badge>
                <span className="text-xs font-semibold text-white/80">
                  {s.location}
                </span>
              </div>
              <blockquote className="max-w-lg font-display text-2xl font-bold leading-snug drop-shadow-md text-balance">
                {s.quote}
              </blockquote>
              <figcaption className="text-sm font-semibold tracking-wide text-white/90">
                — {s.monument}
              </figcaption>
            </figure>
          </div>
        ))}

        {/* Slide Indicators / Navigation Dots */}
        <div className="absolute bottom-4 right-10 z-20 flex items-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentSlide ? 'w-8 bg-brand' : 'w-2 bg-white/50 hover:bg-white'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
