import { Monitor } from 'lucide-react';
import type { Device } from '../../constants/devices';
import { getRotationRowForDay } from '../../constants/rotationSchedule';
import { useDeployments } from '../../context/DeploymentsContext';
import { useRotationSchedule } from '../../context/RotationScheduleContext';
import { cn } from '../../lib/cn';
import {
  getDeviceRotationDay,
  getDeviceVideosForDay,
  getLatestDeploymentForDevice,
} from '../../lib/deviceSchedule';
import { BrightSignDeviceImage } from '../devices/BrightSignDeviceImage';
import { Badge, CARD_SURFACE_CLASS, SectionLabel } from '../ui';

export interface DeviceMonitoringPanelProps {
  device: Device | null;
  className?: string;
}

export function DeviceMonitoringPanel({ device, className }: DeviceMonitoringPanelProps) {
  const { deployments } = useDeployments();
  const { rows } = useRotationSchedule();

  if (!device) {
    return (
      <div className={cn(CARD_SURFACE_CLASS, 'flex min-h-[480px] items-center justify-center p-6', className)}>
        <p className="text-body-sm text-content-muted">Select a device to view schedule details</p>
      </div>
    );
  }

  const deviceDeployment = getLatestDeploymentForDevice(deployments, device.id);
  const rotationDay = getDeviceRotationDay(device, deviceDeployment);
  const scheduleRow = getRotationRowForDay(rotationDay, rows);
  const currentVideos = getDeviceVideosForDay(scheduleRow);

  return (
    <div className={cn(CARD_SURFACE_CLASS, 'p-5 sm:p-6', className)}>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-content-primary">{device.name}</h2>
          <p className="mt-1 text-body-sm text-content-secondary">{device.location}</p>
        </div>
        <Badge variant={device.status === 'online' ? 'success' : 'danger'} className="shrink-0">
          {device.status === 'online' ? 'Online' : 'Offline'}
        </Badge>
      </div>

      <div className="mb-6 flex flex-col items-center">
        <BrightSignDeviceImage />
        <p className="mt-2 text-body-sm font-semibold text-content-primary">{device.model}</p>
      </div>

      <section className="rounded-lg border border-surface-border bg-surface-muted/30 p-4 sm:p-5">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-600/15 dark:text-brand-400">
            <Monitor className="h-5 w-5" />
          </div>
          <div>
            <SectionLabel className="mb-1 block">Currently playing on Day {rotationDay}</SectionLabel>
            <p className="text-body-sm text-content-secondary">
              {device.name} · {device.location} · Day {rotationDay}
              {scheduleRow ? ` · ${scheduleRow.dayLabel}, ${scheduleRow.dateLabel}` : ''}
            </p>
          </div>
        </div>

        {currentVideos.length === 0 ? (
          <p className="rounded-lg border border-dashed border-surface-border px-4 py-8 text-center text-body-sm text-content-muted">
            No videos assigned for this day. Set up the rotation schedule first.
          </p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {currentVideos.map((entry) => (
              <li
                key={`${entry.group}-${entry.label}`}
                className="rounded-lg border border-surface-border bg-surface px-3 py-2.5"
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
        )}
      </section>
    </div>
  );
}
