import { useState } from 'react';
import { DatePicker, StatusBadge, ThemeToggle } from '../ui';
import { CARD_SURFACE_CLASS } from '../ui/cardStyles';
import { cn } from '../../lib/cn';

const PAGE_HEADER_ACTIONS_CLASS =
  'flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-3';

export default function PageHeader() {
  const [selectedDate, setSelectedDate] = useState(() => new Date(2025, 3, 14));

  return (
    <header className={cn(CARD_SURFACE_CLASS, 'mb-4 p-4 sm:mb-6 sm:p-5')}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold uppercase text-content-primary sm:text-page-title">Admin Panel</h1>
        <div className={PAGE_HEADER_ACTIONS_CLASS}>
          <DatePicker value={selectedDate} onChange={setSelectedDate} className="w-full sm:w-auto" />
          <StatusBadge
            label="BrightSign Status"
            value="Connected"
            variant="success"
            className="w-full justify-between sm:w-auto sm:justify-start"
          />
          <ThemeToggle className="shrink-0 self-end sm:self-auto" />
        </div>
      </div>
    </header>
  );
}
