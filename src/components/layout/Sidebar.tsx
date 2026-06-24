import { NavLink, useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ChevronLeft, ChevronRight, LogOut, X } from 'lucide-react';
import perform6SidebarIcon from '../../assets/sidebar-logo-icon.png';
import { mainNavigation } from '../../constants/navigation';
import { PERFORM6_LOGO_URL } from '../../constants/branding';
import { useMobileNav } from '../../context/MobileNavContext';
import { useSidebarCollapse } from '../../context/SidebarCollapseContext';
import { cn } from '../../lib/cn';

interface SidebarTooltipProps {
  label: string;
  collapsed?: boolean;
  children: ReactNode;
}

function SidebarTooltip({ label, collapsed, children }: SidebarTooltipProps) {
  if (!collapsed) return children;

  return (
    <div className="group/tooltip relative">
      {children}
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute left-[calc(100%+0.625rem)] top-1/2 z-50 -translate-y-1/2',
          'whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg',
          'opacity-0 transition-opacity duration-150',
          'group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100',
          'dark:bg-slate-800',
        )}
      >
        {label}
      </span>
    </div>
  );
}

interface SidebarNavItemProps {
  label: string;
  to?: string;
  icon: LucideIcon;
  end?: boolean;
  collapsed?: boolean;
  onNavigate?: () => void;
}

function SidebarNavItem({
  label,
  to,
  icon: Icon,
  end,
  collapsed = false,
  onNavigate,
}: SidebarNavItemProps) {
  if (!to) {
    return (
      <SidebarTooltip label={label} collapsed={collapsed}>
        <span
          className={cn(
            'flex items-center rounded-lg text-body-sm text-content-muted',
            'cursor-not-allowed opacity-60',
            collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5',
          )}
        >
          <Icon className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && label}
        </span>
      </SidebarTooltip>
    );
  }

  return (
    <SidebarTooltip label={label} collapsed={collapsed}>
      <NavLink
        to={to}
        end={end}
        onClick={onNavigate}
        className={({ isActive }) =>
          cn(
            'ui-sidebar-nav-item',
            collapsed && 'ui-sidebar-nav-item--collapsed',
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
            {!collapsed && <span className="truncate">{label}</span>}
          </>
        )}
      </NavLink>
    </SidebarTooltip>
  );
}

interface SidebarPanelProps {
  className?: string;
  collapsed?: boolean;
  onNavigate?: () => void;
  showClose?: boolean;
  onClose?: () => void;
  showCollapseToggle?: boolean;
  onToggleCollapse?: () => void;
  isCollapsedView?: boolean;
}

export function SidebarPanel({
  className,
  collapsed = false,
  onNavigate,
  showClose,
  onClose,
  showCollapseToggle = false,
  onToggleCollapse,
  isCollapsedView = false,
}: SidebarPanelProps) {
  const navigate = useNavigate();

  function handleLogout() {
    onNavigate?.();
    navigate('/login');
  }

  return (
    <div className={cn('flex h-full min-h-0 flex-col overflow-visible', className)}>
      <div
        className={cn(
          'relative flex items-center gap-3 py-6',
          collapsed ? 'justify-center px-3' : 'justify-between px-5',
        )}
      >
        {showCollapseToggle && onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={isCollapsedView ? 'Expand sidebar' : 'Collapse sidebar'}
            className={cn(
              'absolute -right-3 top-1/2 z-30 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full',
              'border-2 border-white bg-indigo-600 text-white shadow-[0_4px_12px_rgba(79,70,229,0.35)]',
              'transition-transform hover:scale-105 hover:bg-indigo-700',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40',
            )}
          >
            {isCollapsedView ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        )}
        <div className={cn('min-w-0', collapsed ? 'flex justify-center' : 'flex-1')}>
          {collapsed ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white p-1 shadow-sm">
              <img
                src={perform6SidebarIcon}
                alt="Perform6"
                className="h-full w-full rounded-full object-cover"
              />
            </div>
          ) : (
            <div className="inline-flex  bg-white px-2.5 py-1.5">
              <img
                src={PERFORM6_LOGO_URL}
                alt="Perform6"
                className="h-9 w-auto max-w-[148px] object-contain object-left"
              />
            </div>
          )}
        </div>
        {showClose && onClose && !collapsed && (
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
        {showClose && onClose && collapsed && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className={cn(
              'absolute right-3 top-4 inline-flex h-8 w-8 items-center justify-center rounded-lg',
              'text-content-secondary hover:bg-surface-muted',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40',
            )}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav
        className={cn(
          'hide-scrollbar flex-1 space-y-1 py-2',
          collapsed ? 'overflow-visible px-2' : 'overflow-y-auto px-4',
        )}
      >
        {mainNavigation.map((item) => (
          <SidebarNavItem
            key={item.label}
            {...item}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <div
        className={cn(
          'border-t border-surface-border/80 py-4',
          collapsed ? 'px-2' : 'px-5',
        )}
      >
        <SidebarTooltip label="Logout" collapsed={collapsed}>
          <button
            type="button"
            onClick={handleLogout}
            className={cn(
              'flex w-full items-center text-body-sm font-medium text-content-secondary transition-colors',
              'hover:text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40',
              collapsed ? 'justify-center px-2 py-2' : 'gap-3',
            )}
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && 'Logout'}
          </button>
        </SidebarTooltip>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const { isOpen, close } = useMobileNav();
  const { collapsed, toggleCollapsed } = useSidebarCollapse();

  return (
    <>
      <aside
        className={cn(
          'relative sticky top-4 z-30 ml-4 hidden h-[calc(100vh-2rem)] shrink-0 transition-[width] duration-300 ease-in-out lg:block',
          collapsed ? 'w-[5.25rem]' : 'w-64',
        )}
      >
        <div
          className={cn(
            'ui-sidebar-shell',
            'flex h-full flex-col overflow-visible rounded-card',
          )}
        >
          <SidebarPanel
            collapsed={collapsed}
            showCollapseToggle
            onToggleCollapse={toggleCollapsed}
            isCollapsedView={collapsed}
          />
        </div>
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
          'ui-sidebar-shell',
          'fixed inset-y-4 left-4 z-50 flex w-[min(calc(100vw-2rem),17rem)] flex-col overflow-hidden rounded-card',
          'transition-transform duration-300 ease-out lg:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-[calc(100%+1rem)] pointer-events-none',
        )}
        aria-hidden={!isOpen}
      >
        <SidebarPanel showClose onClose={close} onNavigate={close} />
      </aside>
    </>
  );
}
