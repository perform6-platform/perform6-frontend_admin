export type SyncFleetStatus = 'IDLE' | 'DOWNLOADING' | 'SYNCING' | 'FAILED' | 'COMPLETE';

export type RequiredMediaStatus = 'CACHED' | 'DOWNLOADING' | 'FAILED' | 'MISSING';

export interface SyncFleetDeviceRow {
  deviceId: string;
  serialNumber: string | null;
  deviceName: string | null;
  model: string | null;
  isOnline: boolean;
  deployment: {
    id: string;
    deploymentType: string;
    fieldCategory: string;
    exerciseVariant: string;
  } | null;
  rotationDay: number | null;
  cacheWindow: {
    days: number;
    rotationDayFrom: number | null;
    rotationDayTo: number | null;
  };
  expectedCount: number;
  cachedCount: number;
  progressPercent: number;
  status: SyncFleetStatus;
  lastSyncAt: string | null;
  lastSyncStatus: string | null;
  activeDownload: {
    mediaVersionId: string;
    bytesDownloaded: string;
    totalBytes: string | null;
    phase: string;
  } | null;
}

export interface SyncFleetOverview {
  summary: {
    total: number;
    complete: number;
    incomplete: number;
    downloading: number;
  };
  devices: SyncFleetDeviceRow[];
}

export interface RequiredMediaRow {
  mediaVersionId: string;
  title: string | null;
  rotationDay: number | null;
  fileSize: string | null;
  downloadStatus: RequiredMediaStatus;
  bytesDownloaded: string | null;
  errorMessage: string | null;
}

export interface SyncDeviceDetail {
  device: SyncFleetDeviceRow;
  requiredMedia: RequiredMediaRow[];
  recentJobs: Array<{
    id: string;
    status: string;
    startedAt: string | null;
    completedAt: string | null;
    createdAt: string;
  }>;
  failedDownloads: Array<{
    mediaVersionId: string;
    errorMessage: string | null;
    createdAt: string;
    syncJobId: string;
  }>;
}
