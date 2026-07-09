import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import Nav from './nav'
import { cn } from '@/lib/utils'
import { getSideLinks } from '@/data/sidelinks'

interface SidebarProps {
  isCollapsed: boolean
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>
  mobileOpen: boolean
  onCloseMobile: () => void
  className?: string
}

/**
 * Sidebar — fixed left rail on md+, slide-in drawer on mobile.
 *
 * Width driven by CSS variables so AppShell can pad main content by the same
 * value (see AppShell for the corresponding style attribute).
 */
export default function Sidebar({
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  onCloseMobile,
  className,
}: SidebarProps) {
  const width = isCollapsed
    ? 'var(--sidebar-width-collapsed)'
    : 'var(--sidebar-width)'

  return (
    <aside
      style={{ width } as React.CSSProperties}
      className={cn(
        // Positioning: fixed under the topbar (top-14 = h-14).
        'fixed left-0 top-14 z-40 h-[calc(100svh-3.5rem)]',
        // Surface: match the landing hero — deep card green with subtle border.
        'border-r border-border/60 bg-card/95 shadow-lg backdrop-blur-md',
        // Mobile: hidden by default, slide in when mobileOpen.
        'transform transition-transform duration-200 ease-out',
        mobileOpen
          ? 'translate-x-0 w-64'
          : '-translate-x-full w-64 md:w-[var(--sidebar-current-desktop)]',
        // md+: always visible, no transform.
        'md:translate-x-0',
        className
      )}
    >
      {/* Nav — flex column, scrolls its own overflow so the collapse button stays pinned */}
      <div className='flex h-full flex-col'>
        <Nav
          id='sidebar-menu'
          className='flex-1 space-y-1 overflow-y-auto px-2 py-4'
          closeNav={onCloseMobile}
          isCollapsed={isCollapsed && !mobileOpen}
          links={getSideLinks()}
        />

        {/* Collapse toggle — desktop only */}
        <button
          type='button'
          onClick={() => setIsCollapsed((v) => !v)}
          className='hidden items-center justify-center gap-2 border-t border-border/60 py-2 text-xs text-muted-foreground hover:bg-muted/60 hover:text-foreground md:inline-flex'
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <IconChevronRight size={16} />
          ) : (
            <>
              <IconChevronLeft size={16} />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
