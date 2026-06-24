import { ThemeToggle, UserMenu } from '../ui';
import { CARD_SURFACE_CLASS } from '../ui/cardStyles';
import { cn } from '../../lib/cn';

const PAGE_HEADER_ACTIONS_CLASS =
  'flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-3';

export default function PageHeader() {
  return (
    <header
      className={cn(
        CARD_SURFACE_CLASS,
        'mb-5 flex flex-col gap-4 p-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:p-5',
      )}
    >
      <div>
        <p className="text-caption font-medium text-content-muted">Welcome back</p>
        <h1 className="text-xl font-bold tracking-tight text-content-primary sm:text-2xl">
          Admin Panel
        </h1>
      </div>
      <div className={PAGE_HEADER_ACTIONS_CLASS}>
        <ThemeToggle className="shrink-0 self-end sm:self-auto" />
        <UserMenu name="Admin User" role="Super Admin" />
      </div>
    </header>
  );
}
