import { Monitor } from 'lucide-react';
import type { Device } from '../../constants/devices';
import type { RotationScheduleRow } from '../../constants/rotationSchedule';
import { getDeviceVideosForDay } from '../../lib/deviceSchedule';
import { cn } from '../../lib/cn';
import { Button, Modal, ModalBody, SectionLabel } from '../ui';
import { CARD_SURFACE_CLASS } from '../ui/cardStyles';

export interface ScheduleDayDetailsModalProps {
  open: boolean;
  onClose: () => void;
  row: RotationScheduleRow | null;
  device?: Device;
  connectionStartDate?: string;
  isCurrentDay?: boolean;
}

function formatConnectionStartLabel(value: string): string {
  const [year, month, day] = value.split('-').map((part) => Number.parseInt(part, 10));
  if (!year || !month || !day) return value;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function ScheduleDayDetailsModal({
  open,
  onClose,
  row,
  device,
  connectionStartDate,
  isCurrentDay = false,
}: ScheduleDayDetailsModalProps) {
  const videos = row ? getDeviceVideosForDay(row) : [];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={row ? `Day ${row.day} — ${row.dayLabel}` : 'Schedule details'}
      description={row ? row.dateLabel : undefined}
      size="lg"
      footer={
        <Button type="button" size="sm" className="h-9 px-4" onClick={onClose}>
          Close
        </Button>
      }
    >
      <ModalBody className="space-y-4">
        {!row ? (
          <p className="text-body-sm text-content-muted">No schedule day selected.</p>
        ) : (
          <section className={cn(CARD_SURFACE_CLASS, 'p-4 sm:p-5')}>
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-600/15 dark:text-brand-400">
                  <Monitor className="h-5 w-5" />
                </div>
                <div>
                  <SectionLabel className="mb-1 block">
                    {isCurrentDay ? `Currently playing on Day ${row.day}` : `Videos on Day ${row.day}`}
                  </SectionLabel>
                  <p className="text-body-sm text-content-secondary">
                    {device
                      ? `${device.name} · ${device.location} · Day ${row.day}`
                      : `Day ${row.day} · ${row.dateLabel}`}
                    {connectionStartDate
                      ? ` · Connection started ${formatConnectionStartLabel(connectionStartDate)}`
                      : device?.currentDay
                        ? ` · ${device.currentDay}`
                        : ''}
                  </p>
                </div>
              </div>
              {device && (
                <span
                  className={cn(
                    'rounded-full px-2.5 py-1 text-caption font-medium',
                    device.status === 'online'
                      ? 'bg-status-success/10 text-status-success'
                      : 'bg-status-warning/10 text-status-warning',
                  )}
                >
                  {device.status === 'online' ? 'Online' : 'Offline'}
                </span>
              )}
            </div>

            <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {videos.map((entry) => (
                <li
                  key={`${entry.group}-${entry.label}`}
                  className="rounded-lg border border-surface-border bg-surface-muted/30 px-3 py-2.5"
                >
                  <p className="text-caption font-medium text-content-muted">
                    {entry.group} · {entry.label}
                  </p>
                  <p className="mt-0.5 truncate text-body-sm font-medium text-content-primary" title={entry.video}>
                    {entry.video}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </ModalBody>
    </Modal>
  );
}
