import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { X } from 'lucide-react';
import { mainNavigation } from '../../constants/navigation';
import { PERFORM6_LOGO_URL } from '../../constants/branding';
import { useMobileNav } from '../../context/MobileNavContext';
import { cn } from '../../lib/cn';
import { CARD_SURFACE_CLASS, UserMenu } from '../ui';

interface SidebarNavItemProps {
  label: string;
  to?: string;
  icon: LucideIcon;
  end?: boolean;
  onNavigate?: () => void;
}

function SidebarNavItem({ label, to, icon: Icon, end, onNavigate }: SidebarNavItemProps) {
  if (!to) {
    return (
      <span
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-body-sm text-content-muted',
          'cursor-not-allowed opacity-60',
        )}
        title="Coming soon"
      >
        <Icon className="h-[18px] w-[18px] shrink-0" />
        {label}
      </span>
    );
  }

  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'ui-sidebar-nav-item',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40',
          isActive && 'ui-sidebar-nav-item--active',
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={cn(
              'h-[18px] w-[18px] shrink-0',
              isActive ? 'text-current' : 'text-content-muted',
            )}
          />
          {label}
        </>
      )}
    </NavLink>
  );
}

interface SidebarPanelProps {
  className?: string;
  onNavigate?: () => void;
  showClose?: boolean;
  onClose?: () => void;
}

export function SidebarPanel({ className, onNavigate, showClose, onClose }: SidebarPanelProps) {
  return (
    <div className={cn('flex h-full flex-col', className)}>
      <div className="flex items-center justify-between gap-3 border-b border-surface-border px-4 py-4 sm:px-5 sm:py-5">
        <div className="min-w-0 flex-1">
          <img
            src={PERFORM6_LOGO_URL}
            alt="Perform6"
            className="h-9 w-auto max-w-[148px] object-contain object-left"
          />
        </div>
        {showClose && onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className={cn(
              'inline-flex h-9 w-9 items-center justify-center rounded-lg',
              'border border-surface-border text-content-secondary hover:bg-surface-muted',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40',
            )}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="hide-scrollbar flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {mainNavigation.map((item) => (
          <SidebarNavItem key={item.label} {...item} onNavigate={onNavigate} />
        ))}
      </nav>

      <UserMenu name="Admin User" role="Super Admin" />
    </div>
  );
}

export default function Sidebar() {
  const { isOpen, close } = useMobileNav();

  return (
    <>
      <aside
        className={cn(
          CARD_SURFACE_CLASS,
          'sticky top-4 ml-2 hidden h-[calc(100vh-2rem)] w-60 shrink-0 flex-col overflow-hidden lg:ml-4 lg:flex xl:ml-3',
        )}
      >
        <SidebarPanel />
      </aside>

      {isOpen && (
        <button
          type="button"
          aria-label="Close menu overlay"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={close}
        />
      )}

      <aside
        className={cn(
          CARD_SURFACE_CLASS,
          'fixed inset-y-0 left-0 z-50 flex w-[min(100vw-1.5rem,17rem)] flex-col overflow-hidden',
          'transition-transform duration-300 ease-out lg:hidden',
          isOpen ? 'translate-x-3' : '-translate-x-full pointer-events-none',
        )}
        aria-hidden={!isOpen}
      >
        <SidebarPanel showClose onClose={close} onNavigate={close} />
      </aside>
    </>
  );
}
