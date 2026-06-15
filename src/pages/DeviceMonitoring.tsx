import { useEffect, useMemo, useState } from 'react';
import { DeviceMonitoringList } from '../components/device-monitoring/DeviceMonitoringList';
import { DeviceMonitoringPanel } from '../components/device-monitoring/DeviceMonitoringPanel';
import { Dropdown, PageTitle, Switch } from '../components/ui';
import { mockDevices } from '../constants/devices';
import { deviceMonitoringFilterOptions } from '../constants/deviceMonitoring';

export default function DeviceMonitoring() {
  const [filter, setFilter] = useState('all');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>('1');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const filteredDevices = useMemo(() => {
    if (filter === 'online') {
      return mockDevices.filter((device) => device.status === 'online');
    }
    if (filter === 'offline') {
      return mockDevices.filter((device) => device.status === 'offline');
    }
    return mockDevices;
  }, [filter]);

  const selectedDevice = useMemo(() => {
    if (selectedDeviceId) {
      return filteredDevices.find((device) => device.id === selectedDeviceId) ?? null;
    }
    return filteredDevices[0] ?? null;
  }, [filteredDevices, selectedDeviceId]);

  useEffect(() => {
    if (selectedDeviceId && !filteredDevices.some((device) => device.id === selectedDeviceId)) {
      setSelectedDeviceId(filteredDevices[0]?.id ?? null);
    }
  }, [filteredDevices, selectedDeviceId]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <PageTitle>Device Monitoring</PageTitle>

        <div className="flex flex-wrap items-center gap-3 sm:justify-end">
          <Dropdown
            options={[...deviceMonitoringFilterOptions]}
            value={filter}
            onChange={setFilter}
            className="w-full sm:w-auto"
          />
          <Switch checked={autoRefresh} onChange={setAutoRefresh} label="Auto Refresh" className="shrink-0" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[300px_minmax(0,1fr)]">
        <DeviceMonitoringList
          devices={filteredDevices}
          selectedDeviceId={selectedDevice?.id ?? null}
          onSelect={setSelectedDeviceId}
        />
        <DeviceMonitoringPanel device={selectedDevice} />
      </div>
    </div>
  );
}
