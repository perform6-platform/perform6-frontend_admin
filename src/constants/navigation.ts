import type { LucideIcon } from 'lucide-react';
import {
  CalendarDays,
  FileText,
  Gauge,
  LayoutDashboard,
  MapPin,
  Monitor,
  RotateCw,
  Upload,
} from 'lucide-react';

export interface NavItemConfig {
  label: string;
  to?: string;
  icon: LucideIcon;
  end?: boolean;
}

export const mainNavigation: NavItemConfig[] = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard, end: true },
  { label: 'Devices', to: '/devices', icon: Monitor },
  { label: 'Device Monitoring', to: '/device-monitoring', icon: Gauge },
  { label: 'Content Library', to: '/content-library', icon: FileText },
  { label: 'Rotation', to: '/rotation', icon: RotateCw },
  { label: 'Schedule', to: '/rotation-schedule', icon: CalendarDays },
  { label: 'Deployments', to: '/deployments', icon: Upload },
  { label: 'Locations', to: '/locations', icon: MapPin },
];

export const quickActions = [
  { label: 'Add New Device', icon: Monitor },
  { label: 'Upload New Content', icon: Upload },
  { label: 'Create New Schedule', icon: CalendarDays },
  { label: 'Deploy to Devices', icon: RotateCw },
] as const;
