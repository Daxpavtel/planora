'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BellIcon,
  CompassIcon,
  HouseIcon,
  MapIcon,
  MenuIcon,
  PlusIcon,
  SearchIcon,
  UserIcon,
} from 'lucide-react'
import { Wordmark } from '@/components/logo'
import { Sidebar, isRouteActive, useSidebar } from '@/components/sidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { currentUser } from '@/lib/data'
import { cn } from '@/lib/utils'

const mobileNav = [
  { href: '/dashboard', label: 'Home', icon: HouseIcon },
  { href: '/trips', label: 'Trips', icon: MapIcon },
  { href: '/trips/new', label: 'Create', icon: PlusIcon },
  { href: '/explore', label: 'Explore', icon: CompassIcon },
  { href: '/profile', label: 'Profile', icon: UserIcon },
]

export function AppShell({
  title,
  children,
  searchPlaceholder = 'Search trips, cities and activities',
}: {
  title: string
  children: React.ReactNode
  searchPlaceholder?: string
}) {
  const pathname = usePathname()
  const { expanded, toggleSidebar, setOpenMobile } = useSidebar()

  return (
    <div className="min-h-svh bg-background">
      {/* Shared Single Source of Truth Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div
        className={cn(
          'transition-[padding-left] duration-200 ease-out',
          expanded ? 'lg:pl-[260px]' : 'lg:pl-[72px]',
        )}
      >
        <header className="sticky top-0 z-20 border-b border-border/80 bg-background/85 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-[1240px] items-center gap-3 px-4 sm:px-6">
            <Button
              variant="ghost"
              size="icon"
              aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
              aria-expanded={expanded}
              onClick={toggleSidebar}
              className="-ml-1 hidden shrink-0 lg:inline-flex"
            >
              <MenuIcon />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open navigation menu"
              onClick={() => setOpenMobile(true)}
              className="-ml-1 shrink-0 lg:hidden"
            >
              <MenuIcon />
            </Button>
            <Link href="/dashboard" className="lg:hidden">
              <Wordmark />
            </Link>
            <h1 className="hidden shrink-0 font-display text-base font-bold text-ink lg:block">
              {title}
            </h1>
            <div className="ml-auto hidden max-w-sm flex-1 lg:block">
              <InputGroup>
                <InputGroupAddon>
                  <SearchIcon />
                </InputGroupAddon>
                <InputGroupInput placeholder={searchPlaceholder} aria-label="Search" />
              </InputGroup>
            </div>
            <div className="ml-auto flex items-center gap-1 lg:ml-0">
              <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
                <BellIcon />
                <span className="absolute right-2 top-2 size-2 rounded-full bg-primary ring-2 ring-background" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<Button variant="ghost" className="h-11 gap-2 px-2" />}
                >
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-brand-soft text-xs font-semibold text-brand">
                      {currentUser.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium sm:block">{currentUser.firstName}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <span className="block text-sm font-semibold">{currentUser.name}</span>
                    <span className="block truncate text-xs font-normal text-muted-foreground">
                      {currentUser.email}
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem render={<Link href="/profile" />}>Profile</DropdownMenuItem>
                    <DropdownMenuItem render={<Link href="/calendar" />}>Calendar</DropdownMenuItem>
                    <DropdownMenuItem render={<Link href="/admin" />}>
                      Admin panel
                      <Badge variant="secondary" className="ml-auto">
                        Staff
                      </Badge>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem render={<Link href="/login" />} variant="destructive">
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1240px] px-4 pb-28 pt-6 sm:px-6 lg:pb-16">{children}</main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur lg:hidden"
      >
        <ul className="mx-auto flex max-w-md items-stretch justify-between px-2 pb-[env(safe-area-inset-bottom)]">
          {mobileNav.map((item) => {
            const active = isRouteActive(pathname, item.href)
            const create = item.href === '/trips/new'
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium',
                    active ? 'text-brand' : 'text-muted-foreground',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-8 items-center justify-center rounded-full',
                      create && 'bg-primary text-primary-foreground',
                      !create && active && 'bg-brand-soft',
                    )}
                  >
                    <item.icon className="size-[18px]" aria-hidden="true" />
                  </span>
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
