export type DeviceStatus = 'online' | 'offline';
export type BrightSignStatus = 'connected' | 'disconnected';

export interface Device {
  id: string;
  name: string;
  location: string;
  status: DeviceStatus;
  currentDay: string;
  brightSignStatus: BrightSignStatus;
  lastSync: string;
  model: string;
  serialNumber: string;
  firmware: string;
  uptime: string;
  storageUsed: number;
}

function buildDevice(
  partial: Omit<Device, 'model' | 'serialNumber' | 'firmware' | 'uptime' | 'storageUsed'> & {
    model?: string;
    serialNumber?: string;
    firmware?: string;
    uptime?: string;
    storageUsed?: number;
  },
): Device {
  const index = Number.parseInt(partial.id, 10) || 1;
  return {
    model: partial.model ?? 'BrightSign XT5',
    serialNumber: partial.serialNumber ?? `BS-XT5-${String(index).padStart(3, '0')}${String(1234560 + index)}`,
    firmware: partial.firmware ?? '9.0.117',
    uptime: partial.uptime ?? `${5 + (index % 3)}d ${10 + (index % 12)}h ${20 + (index % 40)}m`,
    storageUsed: partial.storageUsed ?? 45 + (index % 40),
    ...partial,
  };
}

export const locationOptions = [
  { value: 'all', label: 'All Locations' },
  { value: 'new-york', label: 'New York Gym' },
  { value: 'chicago', label: 'Chicago Gym' },
  { value: 'dallas', label: 'Dallas Gym' },
  { value: 'los-angeles', label: 'Los Angeles Gym' },
  { value: 'miami', label: 'Miami Gym' },
  { value: 'boston', label: 'Boston Gym' },
] as const;

export const assignableLocations = locationOptions.filter((option) => option.value !== 'all');

const locationLabelByKey = Object.fromEntries(
  assignableLocations.map((option) => [option.value, option.label]),
) as Record<string, string>;

const locationKeyByLabel = Object.fromEntries(
  assignableLocations.map((option) => [option.label, option.value]),
) as Record<string, string>;

export function getLocationLabelFromKey(key: string): string {
  return locationLabelByKey[key] ?? key;
}

export function getLocationKeyFromLabel(label: string): string {
  return locationKeyByLabel[label] ?? assignableLocations[0]?.value ?? 'new-york';
}

export const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'online', label: 'Online' },
  { value: 'offline', label: 'Offline' },
] as const;

export const mockDevices: Device[] = [
  buildDevice({ id: '1', name: 'BrightSign-001', location: 'New York Gym', status: 'online', currentDay: 'Day 14', brightSignStatus: 'connected', lastSync: '1 min ago', storageUsed: 58 }),
  buildDevice({ id: '2', name: 'BrightSign-002', location: 'Chicago Gym', status: 'online', currentDay: 'Day 14', brightSignStatus: 'connected', lastSync: '2 min ago' }),
  buildDevice({ id: '3', name: 'BrightSign-003', location: 'Dallas Gym', status: 'offline', currentDay: 'Day 14', brightSignStatus: 'disconnected', lastSync: '25 min ago', storageUsed: 72 }),
  buildDevice({ id: '4', name: 'BrightSign-004', location: 'Los Angeles Gym', status: 'online', currentDay: 'Day 14', brightSignStatus: 'connected', lastSync: '3 min ago' }),
  buildDevice({ id: '5', name: 'BrightSign-005', location: 'Miami Gym', status: 'online', currentDay: 'Day 14', brightSignStatus: 'connected', lastSync: '5 min ago' }),
  buildDevice({ id: '6', name: 'BrightSign-006', location: 'Boston Gym', status: 'offline', currentDay: 'Day 14', brightSignStatus: 'disconnected', lastSync: '18 min ago' }),
  buildDevice({ id: '7', name: 'BrightSign-007', location: 'New York Gym', status: 'online', currentDay: 'Day 14', brightSignStatus: 'connected', lastSync: '4 min ago' }),
  buildDevice({ id: '8', name: 'BrightSign-008', location: 'Chicago Gym', status: 'online', currentDay: 'Day 14', brightSignStatus: 'connected', lastSync: '6 min ago' }),
  buildDevice({ id: '9', name: 'BrightSign-009', location: 'Dallas Gym', status: 'online', currentDay: 'Day 14', brightSignStatus: 'connected', lastSync: '7 min ago' }),
  buildDevice({ id: '10', name: 'BrightSign-010', location: 'Miami Gym', status: 'offline', currentDay: 'Day 14', brightSignStatus: 'disconnected', lastSync: '32 min ago' }),
  buildDevice({ id: '11', name: 'BrightSign-011', location: 'Boston Gym', status: 'online', currentDay: 'Day 14', brightSignStatus: 'connected', lastSync: '8 min ago' }),
  buildDevice({ id: '12', name: 'BrightSign-012', location: 'Los Angeles Gym', status: 'online', currentDay: 'Day 14', brightSignStatus: 'connected', lastSync: '9 min ago' }),
  buildDevice({ id: '13', name: 'BrightSign-013', location: 'New York Gym', status: 'online', currentDay: 'Day 14', brightSignStatus: 'connected', lastSync: '10 min ago' }),
  buildDevice({ id: '14', name: 'BrightSign-014', location: 'Chicago Gym', status: 'offline', currentDay: 'Day 14', brightSignStatus: 'disconnected', lastSync: '45 min ago' }),
  buildDevice({ id: '15', name: 'BrightSign-015', location: 'Dallas Gym', status: 'online', currentDay: 'Day 14', brightSignStatus: 'connected', lastSync: '11 min ago' }),
  ...Array.from({ length: 30 }, (_, i) =>
    buildDevice({
      id: String(i + 16),
      name: `BrightSign-${String(i + 16).padStart(3, '0')}`,
      location: ['New York Gym', 'Chicago Gym', 'Dallas Gym', 'Miami Gym', 'Boston Gym', 'Los Angeles Gym'][i % 6],
      status: (i % 5 === 0 ? 'offline' : 'online') as DeviceStatus,
      currentDay: 'Day 14',
      brightSignStatus: (i % 5 === 0 ? 'disconnected' : 'connected') as BrightSignStatus,
      lastSync: `${12 + i} min ago`,
    }),
  ),
];
