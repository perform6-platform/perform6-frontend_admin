import type { ContentCategoryId, PlaybackCategoryId } from './contentPlayback';
import type { DeploymentBrandingMode } from './branding';
import type { DeploymentMode } from '../lib/deploymentHelpers';

export type DeploymentStatus = 'completed' | 'failed' | 'scheduled' | 'in-progress';

export type DeploymentTab = 'all' | 'scheduled';

export interface DeploymentScheduleEntry {
  day: number;
  videoTitle: string;
  categoryId: ContentCategoryId;
}

export interface DeploymentSubmitPayload {
  name: string;
  targetDevices: string;
  contentSchedule: string;
  status: DeploymentStatus;
  startedAt: string;
  completedAt: string;
  categoryId: ContentCategoryId;
  playbackCategory: PlaybackCategoryId;
  usesRotation: boolean;
  isBundleDeployment: boolean;
  deploymentMode: DeploymentMode;
  videoTitle: string;
  scheduleEntries: DeploymentScheduleEntry[];
  rotationDay: number;
  deviceId?: string;
  deviceName?: string;
  connectionStartDate?: string;
  brandingMode?: DeploymentBrandingMode;
  brandingLogoUrl?: string | null;
  companyName?: string;
}

export interface Deployment {
  id: string;
  name: string;
  targetDevices: string;
  contentSchedule: string;
  status: DeploymentStatus;
  startedAt: string;
  completedAt: string;
  categoryId?: ContentCategoryId;
  deploymentMode?: DeploymentMode;
  isBundleDeployment?: boolean;
  usesRotation?: boolean;
  rotationDay?: number;
  scheduleEntries?: DeploymentScheduleEntry[];
  deviceId?: string;
  deviceName?: string;
  connectionStartDate?: string;
  brandingMode?: DeploymentBrandingMode;
  brandingLogoUrl?: string | null;
  companyName?: string;
}

export const deploymentTabs: { value: DeploymentTab; label: string }[] = [
  { value: 'all', label: 'All Deployments' },
  { value: 'scheduled', label: 'Scheduled Deployments' },
];

export const mockDeployments: Deployment[] = [
  {
    id: 'dep-1',
    name: 'Day 14 Content Update',
    targetDevices: '42 Devices',
    contentSchedule: 'Day 14 Content',
    status: 'completed',
    startedAt: '14 Apr 10:00 AM',
    completedAt: '14 Apr 10:02 AM',
  },
  {
    id: 'dep-2',
    name: 'Full Program Update',
    targetDevices: '42 Devices',
    contentSchedule: 'Day 14 Content',
    status: 'completed',
    startedAt: '14 Apr 10:05 AM',
    completedAt: '14 Apr 10:08 AM',
  },
  {
    id: 'dep-3',
    name: 'Team Training Update',
    targetDevices: '42 Devices',
    contentSchedule: 'Day 14 Content',
    status: 'completed',
    startedAt: '14 Apr 10:10 AM',
    completedAt: '14 Apr 10:12 AM',
  },
  {
    id: 'dep-4',
    name: 'New York Gym Update',
    targetDevices: '5 Devices',
    contentSchedule: 'Day 14 Content',
    status: 'completed',
    startedAt: '14 Apr 11:00 AM',
    completedAt: '14 Apr 11:03 AM',
  },
  {
    id: 'dep-5',
    name: 'System Test',
    targetDevices: '5 Devices',
    contentSchedule: 'Test Content',
    status: 'failed',
    startedAt: '14 Apr 11:30 AM',
    completedAt: '14 Apr 11:31 AM',
  },
  {
    id: 'dep-6',
    name: 'Chicago Gym Rollout',
    targetDevices: '9 Devices',
    contentSchedule: 'Day 15 Content',
    status: 'completed',
    startedAt: '15 Apr 9:00 AM',
    completedAt: '15 Apr 9:04 AM',
  },
  {
    id: 'dep-7',
    name: 'Phase 1 Refresh',
    targetDevices: '42 Devices',
    contentSchedule: 'Day 15 Content',
    status: 'completed',
    startedAt: '15 Apr 9:15 AM',
    completedAt: '15 Apr 9:18 AM',
  },
  {
    id: 'dep-8',
    name: 'Dallas Gym Update',
    targetDevices: '8 Devices',
    contentSchedule: 'Day 15 Content',
    status: 'failed',
    startedAt: '15 Apr 10:00 AM',
    completedAt: '15 Apr 10:01 AM',
  },
  {
    id: 'dep-9',
    name: 'Weekend Schedule Push',
    targetDevices: '42 Devices',
    contentSchedule: 'Day 16 Content',
    status: 'scheduled',
    startedAt: '—',
    completedAt: '—',
  },
  {
    id: 'dep-10',
    name: 'Miami Gym Update',
    targetDevices: '7 Devices',
    contentSchedule: 'Day 16 Content',
    status: 'scheduled',
    startedAt: '—',
    completedAt: '—',
  },
  {
    id: 'dep-11',
    name: 'Start Here Module',
    targetDevices: '42 Devices',
    contentSchedule: 'Start Here',
    status: 'completed',
    startedAt: '16 Apr 8:00 AM',
    completedAt: '16 Apr 8:03 AM',
  },
  {
    id: 'dep-12',
    name: 'Boston Gym Rollout',
    targetDevices: '5 Devices',
    contentSchedule: 'Day 17 Content',
    status: 'completed',
    startedAt: '17 Apr 9:30 AM',
    completedAt: '17 Apr 9:33 AM',
  },
  {
    id: 'dep-13',
    name: 'Los Angeles Sync',
    targetDevices: '7 Devices',
    contentSchedule: 'Day 17 Content',
    status: 'in-progress',
    startedAt: '17 Apr 10:00 AM',
    completedAt: '—',
  },
  {
    id: 'dep-14',
    name: 'Day 18 Full Deploy',
    targetDevices: '42 Devices',
    contentSchedule: 'Day 18 Content',
    status: 'scheduled',
    startedAt: '—',
    completedAt: '—',
  },
  {
    id: 'dep-15',
    name: 'Emergency Content Fix',
    targetDevices: '12 Devices',
    contentSchedule: 'Hotfix Pack',
    status: 'completed',
    startedAt: '18 Apr 2:00 PM',
    completedAt: '18 Apr 2:02 PM',
  },
];

export function getDeploymentStatusLabel(status: DeploymentStatus): string {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'failed':
      return 'Failed';
    case 'scheduled':
      return 'Scheduled';
    case 'in-progress':
      return 'In Progress';
    default:
      return status;
  }
}

export function getDeploymentStatusVariant(
  status: DeploymentStatus,
): 'success' | 'danger' | 'warning' | 'brand' | 'neutral' {
  switch (status) {
    case 'completed':
      return 'success';
    case 'failed':
      return 'danger';
    case 'scheduled':
      return 'brand';
    case 'in-progress':
      return 'warning';
    default:
      return 'neutral';
  }
}
