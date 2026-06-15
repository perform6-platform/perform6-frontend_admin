import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  CalendarDays,
  FileText,
  Gauge,
  LayoutDashboard,
  MapPin,
  Monitor,
  Package,
  RotateCw,
  Settings,
  Upload,
  Users,
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
  { label: 'Programs', to: '/programs', icon: Package },
  { label: 'Rotation Schedule', to: '/rotation-schedule', icon: CalendarDays },
  { label: 'Deployments', to: '/deployments', icon: Upload },
  { label: 'Locations', to: '/locations', icon: MapPin },
  { label: 'Users & Roles', icon: Users },
  { label: 'Activity Logs', icon: Activity },
  { label: 'Reports', icon: FileText },
  { label: 'Settings', icon: Settings },
];

export const quickActions = [
  { label: 'Add New Device', icon: Monitor },
  { label: 'Upload New Content', icon: Upload },
  { label: 'Create New Schedule', icon: CalendarDays },
  { label: 'Deploy to Devices', icon: RotateCw },
] as const;
