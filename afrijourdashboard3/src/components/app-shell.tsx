import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { IconMenu2, IconX } from '@tabler/icons-react'
import Sidebar from './sidebar'
import { UserNav } from './user-nav'
import useIsCollapsed from '@/hooks/use-is-collapsed'
import { cn } from '@/lib/utils'

/**
 * AppShell — the persistent chrome around every authenticated route.
 *
 * Structure:
 *   +-----------------------------------------------------+
 *   | topbar (brand · hamburger[mobile] · UserNav[right]) |
 *   +---------+-------------------------------------------+
 *   |         |                                           |
 *   | sidebar | <Outlet />                                |
 *   |         |                                           |
 *   +---------+-------------------------------------------+
 *
 * Mobile (< md): sidebar becomes a slide-in drawer, triggered by hamburger.
 */
export default function AppShell() {
  const [isCollapsed, setIsCollapsed] = useIsCollapsed()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Lock body scroll while mobile drawer is open.
  useEffect(() => {
    document.body.classList.toggle('overflow-hidden', mobileOpen)
    return () => document.body.classList.remove('overflow-hidden')
  }, [mobileOpen])

  // Close drawer when the viewport grows past mobile.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setMobileOpen(false)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return (
    <div className='relative flex h-full min-h-svh flex-col bg-background text-foreground'>
      {/* ================= TOP BAR ================= */}
      <header
        className={cn(
          'sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border/60 bg-background/85 px-3 backdrop-blur-md md:px-6'
        )}
      >
        {/* Mobile hamburger */}
        <button
          type='button'
          onClick={() => setMobileOpen((v) => !v)}
          className='inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground/80 hover:bg-muted hover:text-foreground md:hidden'
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <IconX size={22} /> : <IconMenu2 size={22} />}
        </button>

        {/* Brand */}
        <a href='/' className='flex items-center gap-2 select-none'>
          <span className='inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/40'>
            <span className='text-sm font-black tracking-tighter'>AJ</span>
          </span>
          <span className='hidden text-sm font-semibold sm:inline bg-gradient-to-r from-primary via-yellow-300 to-emerald-400 bg-clip-text text-transparent'>
            Afrijour Dashboard
          </span>
        </a>

        {/* Right cluster */}
        <div className='ml-auto flex items-center gap-2'>
          <UserNav />
        </div>
      </header>

      {/* ================= BODY ================= */}
      <div className='relative flex flex-1'>
        {/* Sidebar — persistent on md+, drawer on mobile */}
        <Sidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />

        {/* Mobile overlay behind the drawer */}
        {mobileOpen && (
          <button
            aria-label='Close menu'
            onClick={() => setMobileOpen(false)}
            className='fixed inset-0 top-14 z-30 bg-black/60 backdrop-blur-sm md:hidden'
          />
        )}

        {/* Main content */}
        <main
          id='content'
          className={cn(
            'flex-1 overflow-x-hidden transition-[padding] duration-200',
            'md:pl-[var(--sidebar-current)]'
          )}
          style={
            {
              // Drives the desktop pad so the collapse button doesn't overlap content.
              ['--sidebar-current' as any]: isCollapsed
                ? 'var(--sidebar-width-collapsed)'
                : 'var(--sidebar-width)',
            } as React.CSSProperties
          }
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
