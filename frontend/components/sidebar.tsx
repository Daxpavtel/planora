'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BookmarkIcon,
  CalendarDaysIcon,
  CompassIcon,
  HouseIcon,
  LogOutIcon,
  MapIcon,
  SettingsIcon,
  Share2Icon,
  UserIcon,
  UsersIcon,
} from 'lucide-react'
import { LogoMark, Wordmark } from '@/components/logo'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>
}

export const planNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: HouseIcon },
  { href: '/trips', label: 'My Trips', icon: MapIcon },
  { href: '/community', label: 'Community', icon: UsersIcon },
  { href: '/explore', label: 'Explore Cities', icon: CompassIcon },
  { href: '/activities', label: 'Activities', icon: BookmarkIcon },
  { href: '/calendar', label: 'Calendar', icon: CalendarDaysIcon },
  { href: '/shared/rajasthan-royal-heritage', label: 'Public View', icon: Share2Icon },
]

export const accountNavItems: NavItem[] = [
  { href: '/profile', label: 'Profile & Settings', icon: UserIcon },
  { href: '/admin', label: 'Admin Panel', icon: SettingsIcon },
  { href: '/login', label: 'Log out', icon: LogOutIcon },
]

export function isRouteActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/'
  if (href === '/dashboard') return pathname === '/dashboard'
  if (href === '/shared/rajasthan-royal-heritage') return pathname.startsWith('/shared')
  if (href === '/login') return pathname === '/login'
  return pathname === href || pathname.startsWith(`${href}/`)
}

interface SidebarContextValue {
  expanded: boolean
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>
  toggleSidebar: () => void
  openMobile: boolean
  setOpenMobile: React.Dispatch<React.SetStateAction<boolean>>
}

const SidebarContext = React.createContext<SidebarContextValue | undefined>(undefined)

const STORAGE_KEY = 'planora_sidebar_expanded'

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [expanded, setExpandedState] = React.useState<boolean>(false)
  const [openMobile, setOpenMobile] = React.useState<boolean>(false)
  const pathname = usePathname()

  // Hydrate state from localStorage safely on mount to prevent SSR mismatch
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved !== null) {
        setExpandedState(saved === 'true')
      }
    } catch {
      // ignore localStorage errors (e.g. private browsing)
    }
  }, [])

  // Auto close mobile drawer on navigation
  React.useEffect(() => {
    setOpenMobile(false)
  }, [pathname])

  const setExpanded = React.useCallback<React.Dispatch<React.SetStateAction<boolean>>>(
    (action) => {
      setExpandedState((prev) => {
        const nextVal = typeof action === 'function' ? action(prev) : action
        try {
          localStorage.setItem(STORAGE_KEY, String(nextVal))
        } catch {
          // ignore
        }
        return nextVal
      })
    },
    [],
  )

  const toggleSidebar = React.useCallback(() => {
    setExpanded((prev) => !prev)
  }, [setExpanded])

  return (
    <SidebarContext.Provider
      value={{
        expanded,
        setExpanded,
        toggleSidebar,
        openMobile,
        setOpenMobile,
      }}
    >
      <TooltipProvider delay={100}>{children}</TooltipProvider>
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.')
  }
  return context
}

interface SidebarNavListProps {
  pathname: string
  expanded: boolean
  onNavigate?: () => void
}

function SidebarNavList({ pathname, expanded, onNavigate }: SidebarNavListProps) {
  function renderItem(item: NavItem, isFooter = false) {
    const active = isRouteActive(pathname, item.href)
    const IconComponent = item.icon

    const linkContent = (
      <Link
        href={item.href}
        onClick={onNavigate}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'flex h-11 items-center rounded-lg text-sm font-medium transition-colors select-none',
          expanded ? 'gap-3 px-3' : 'justify-center px-0 w-11 mx-auto',
          active
            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-sm'
            : cn(
                isFooter ? 'text-sidebar-foreground/70' : 'text-sidebar-foreground/80',
                'hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
              ),
        )}
      >
        <IconComponent className="size-[18px] shrink-0 stroke-[1.8]" aria-hidden="true" />
        {expanded ? (
          <span className="truncate">{item.label}</span>
        ) : (
          <span className="sr-only">{item.label}</span>
        )}
      </Link>
    )

    if (expanded) {
      return (
        <div key={item.href} className="w-full">
          {linkContent}
        </div>
      )
    }

    return (
      <Tooltip key={item.href}>
        <TooltipTrigger render={linkContent} />
        <TooltipContent side="right" sideOffset={12}>
          {item.label}
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <nav aria-label="Main navigation" className="mt-6 flex flex-1 flex-col gap-1 w-full">
      {expanded ? (
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/50">
          Plan
        </p>
      ) : (
        <div className="h-1" aria-hidden="true" />
      )}

      {planNavItems.map((item) => renderItem(item))}

      {expanded ? (
        <Separator className="my-4 bg-sidebar-border" />
      ) : (
        <Separator className="mx-auto my-3 w-8 bg-sidebar-border/70" />
      )}

      {expanded ? (
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/50">
          Account
        </p>
      ) : (
        <div className="h-1" aria-hidden="true" />
      )}

      {accountNavItems.map((item, idx) => renderItem(item, idx >= 2))}
    </nav>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const { expanded, openMobile, setOpenMobile } = useSidebar()

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside
        aria-label="Sidebar"
        className={cn(
          'fixed inset-y-0 left-0 z-30 hidden flex-col overflow-hidden bg-sidebar py-5 transition-[width] duration-200 ease-out lg:flex',
          expanded ? 'w-[260px] px-3' : 'w-[72px] px-2.5',
        )}
      >
        <Link
          href="/dashboard"
          aria-label="Planora dashboard"
          className={cn(
            'flex h-10 items-center transition-all',
            expanded ? 'px-2' : 'justify-center',
          )}
        >
          {expanded ? (
            <Wordmark tone="invert" />
          ) : (
            <LogoMark className="size-7 text-primary" />
          )}
        </Link>

        <SidebarNavList pathname={pathname} expanded={expanded} />
      </aside>

      {/* Mobile Drawer Sheet */}
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="flex w-[280px] flex-col gap-0 bg-sidebar px-3 py-5 sm:max-w-[280px] border-r border-sidebar-border"
        >
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <Link
            href="/dashboard"
            className="px-2 py-1 flex items-center h-10"
            onClick={() => setOpenMobile(false)}
          >
            <Wordmark tone="invert" />
          </Link>
          <SidebarNavList
            pathname={pathname}
            expanded={true}
            onNavigate={() => setOpenMobile(false)}
          />
        </SheetContent>
      </Sheet>
    </>
  )
}
