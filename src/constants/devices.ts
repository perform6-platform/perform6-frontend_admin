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
