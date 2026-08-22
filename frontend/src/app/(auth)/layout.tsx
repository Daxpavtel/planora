import Image from 'next/image'
import Link from 'next/link'
import { Wordmark } from '@/components/common/logo'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[1fr_1.1fr]">
      <div className="flex flex-col px-4 py-6 sm:px-8">
        <Link href="/" className="inline-flex">
          <Wordmark />
        </Link>
        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-md">{children}</div>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          By continuing you agree to the Terms of Service and Privacy Policy.
        </p>
      </div>

      <div className="relative hidden lg:block">
        <Image
          src="/images/auth-hero.png"
          alt="Traveller looking out over a coastal town"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent" />
        <figure className="absolute inset-x-0 bottom-0 p-10">
          <blockquote className="max-w-md text-balance font-display text-2xl font-bold leading-snug text-white">
            &ldquo;We planned eleven days across three countries in one evening — and the budget
            actually held.&rdquo;
          </blockquote>
          <figcaption className="mt-4 text-sm text-white/70">
            Nina Patel · 27 trips planned with GlobeTrotter
          </figcaption>
        </figure>
      </div>
    </div>
  )
}
