import { LayoutGrid, RefreshCw, RotateCw } from 'lucide-react';
import type { Device } from '../../constants/devices';
import { getDeviceMonitoringMetrics } from '../../constants/deviceMonitoring';
import { cn } from '../../lib/cn';
import { BrightSignDeviceImage } from '../devices/BrightSignDeviceImage';
import { Button, CARD_SURFACE_CLASS } from '../ui';
import { UsageGauge } from './UsageGauge';

export interface DeviceMonitoringPanelProps {
  device: Device | null;
  className?: string;
}

export function DeviceMonitoringPanel({ device, className }: DeviceMonitoringPanelProps) {
  if (!device) {
    return (
      <div className={cn(CARD_SURFACE_CLASS, 'flex min-h-[480px] items-center justify-center p-6', className)}>
        <p className="text-body-sm text-content-muted">Select a device to view monitoring details</p>
      </div>
    );
  }

  const metrics = getDeviceMonitoringMetrics(device);

  const statItems = [
    { label: 'Uptime', value: metrics.uptime },
    { label: 'Last Sync', value: device.lastSync },
    { label: 'Current Day', value: device.currentDay },
    { label: 'Temperature', value: metrics.temperature },
  ];

  return (
    <div className={cn(CARD_SURFACE_CLASS, 'p-5 sm:p-6', className)}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-content-primary">{device.name}</h2>
        <p className="mt-1 text-body-sm text-content-secondary">{device.location}</p>
      </div>

      <div className="mb-6 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex shrink-0 flex-col items-center lg:w-[220px]">
          <BrightSignDeviceImage />
          <p className="mt-2 text-body-sm font-semibold text-content-primary">{device.model}</p>
        </div>

        <div className="grid flex-1 grid-cols-3 gap-4 sm:gap-6">
          <UsageGauge label="CPU Usage" value={metrics.cpuUsage} color="#22c55e" />
          <UsageGauge label="Memory Usage" value={metrics.memoryUsage} color="#eab308" />
          <UsageGauge label="Storage Usage" value={metrics.storageUsage} color="#f97316" />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statItems.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-surface-border bg-surface-muted/40 px-4 py-3"
          >
            <p className="text-caption text-content-secondary">{item.label}</p>
            <p className="mt-1 text-body-sm font-semibold text-content-primary">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" className="h-9 gap-2 px-4">
          <RefreshCw className="h-4 w-4" />
          Reboot Device
        </Button>
        <Button size="sm" variant="outline" className="h-9 gap-2 px-4">
          <RotateCw className="h-4 w-4" />
          Force Sync
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-9 gap-2 border-surface-border px-4 text-content-secondary hover:text-content-primary"
        >
          <LayoutGrid className="h-4 w-4" />
          View Logs
        </Button>
      </div>
    </div>
  );
}
