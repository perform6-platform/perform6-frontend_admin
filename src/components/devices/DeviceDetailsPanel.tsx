import { Download } from 'lucide-react';
import type { Device } from '../../constants/devices';
import { useRotationSchedule } from '../../context/RotationScheduleContext';
import { cn } from '../../lib/cn';
import {
  exportRotationScheduleCsv,
  getDeviceScheduleExportFilename,
} from '../../lib/exportRotationSchedule';
import { BrightSignDeviceImage } from './BrightSignDeviceImage';
import { Badge, Button, Card, CardTitle } from '../ui';

interface DeviceDetailsPanelProps {
  device: Device | null;
  className?: string;
}

interface DetailRowProps {
  label: string;
  value: string;
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-body-sm text-content-secondary">{label}</span>
      <span className="text-right text-body-sm font-medium text-content-primary">{value}</span>
    </div>
  );
}

export function DeviceDetailsPanel({ device, className }: DeviceDetailsPanelProps) {
  const { getRowByDay } = useRotationSchedule();

  if (!device) {
    return (
      <Card className={cn('flex min-h-[320px] items-center justify-center p-5', className)}>
        <p className="text-center text-body-sm text-content-muted">Select a device to view details</p>
      </Card>
    );
  }

  function handleExportSchedule() {
    exportRotationScheduleCsv(getRowByDay, getDeviceScheduleExportFilename(device.name));
  }

  return (
    <Card className={cn('p-5', className)}>
      <CardTitle className="mb-4">Device Details</CardTitle>

      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold text-content-primary">{device.name}</h3>
          <p className="mt-0.5 text-body-sm text-content-secondary">{device.location}</p>
        </div>
        <Badge variant={device.status === 'online' ? 'success' : 'danger'} className="shrink-0">
          {device.status === 'online' ? 'Online' : 'Offline'}
        </Badge>
      </div>

      <div className="mb-2 rounded-lg bg-surface-muted/80 px-4 py-3 dark:bg-[var(--color-surface-muted)]">
        <BrightSignDeviceImage />
        <p className="mt-1 text-center text-body-sm font-semibold text-content-primary">{device.model}</p>
      </div>

      <div className="divide-y divide-surface-border border-y border-surface-border">
        <DetailRow label="Serial Number" value={device.serialNumber} />
        <DetailRow label="Firmware" value={device.firmware} />
        <DetailRow label="Uptime" value={device.uptime} />
        <DetailRow label="Last Sync" value={device.lastSync} />
        <DetailRow label="Current Day" value={device.currentDay} />
        <div className="py-2.5">
          <div className="flex items-center justify-between gap-4">
            <span className="text-body-sm text-content-secondary">Storage Used</span>
            <span className="text-body-sm font-medium text-content-primary">{device.storageUsed}%</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full rounded-full bg-[#2563eb]"
              style={{ width: `${device.storageUsed}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4">
        <Button type="button" size="sm" className="h-9 w-full gap-2" onClick={handleExportSchedule}>
          <Download className="h-4 w-4" />
          Export Schedule
        </Button>
      </div>
    </Card>
  );
}
