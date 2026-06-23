import { Menu } from 'lucide-react';
import { PERFORM6_LOGO_URL } from '../../constants/branding';
import { useMobileNav } from '../../context/MobileNavContext';
import { cn } from '../../lib/cn';

export default function MobileNavBar() {
  const { toggle } = useMobileNav();

  return (
    <header
      className={cn(
        'relative z-30 shrink-0 border-b border-surface-border bg-page lg:hidden',
      )}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={toggle}
          aria-label="Open menu"
          className={cn(
            'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
            'border border-surface-border bg-surface text-content-secondary',
            'hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40',
          )}
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <img
            src={PERFORM6_LOGO_URL}
            alt="Perform6"
            className="h-8 w-auto max-w-[132px] object-contain object-left"
          />
        </div>
      </div>
    </header>
  );
}
