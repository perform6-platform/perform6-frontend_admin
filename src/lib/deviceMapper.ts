import { format, formatDistanceToNow } from 'date-fns';
import type { Device } from '../constants/devices';
import type { ContentItem } from '../constants/contentLibrary';
import { defaultContentThumbnail } from '../constants/contentLibrary';
import type { DeviceInventoryItem, RegisteredDevice } from '../types/devices';
import type { MediaAsset } from '../types/media';
import { getRotationDayFromConnectionStart } from './deviceSchedule';
import { libraryTypeToCategory, resolveStorageUrl } from './libraryType';

function relativeTime(iso: string | null | undefined): string {
  if (!iso) return 'Never';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Never';
  return formatDistanceToNow(date, { addSuffix: true });
}

function storagePercent(used?: string, capacity?: string): number {
  const usedBytes = Number(used ?? 0);
  const capacityBytes = Number(capacity ?? 0);
  if (!capacityBytes || Number.isNaN(usedBytes) || Number.isNaN(capacityBytes)) return 0;
  return Math.min(100, Math.round((usedBytes / capacityBytes) * 100));
}

function formatDuration(seconds: number | null | undefined): string | undefined {
  if (seconds == null || !Number.isFinite(seconds) || seconds <= 0) return undefined;
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/** Map inventory row (GET /devices) into the UI Device shape. */
export function mapInventoryItem(item: DeviceInventoryItem): Device {
  const online =
    item.isOnline ??
    (item.state === 'pending' || item.state === 'claimed'
      ? Boolean(item.lastSeenAt)
      : Boolean(item.lastSeenAt));

  const locationLabel =
    item.location?.trim() ||
    (item.state === 'claimed'
      ? 'Claimed (pending deploy)'
      : item.state === 'pending'
        ? 'Pending pairing'
        : 'Unassigned');

  return {
    id: item.deviceId ?? item.pairingId ?? item.serialNumber,
    name: item.deviceName || item.serialNumber,
    location: locationLabel,
    status: online ? 'online' : 'offline',
    currentDay: '—',
    brightSignStatus: online ? 'connected' : 'disconnected',
    lastSync: relativeTime(item.lastSeenAt),
    model: item.model,
    serialNumber: item.serialNumber,
    firmware: item.firmwareVersion ?? '—',
    uptime: '—',
    storageUsed: 0,
  };
}

/** Map a registered device detail / fleet-status row into the UI Device shape. */
export function mapRegisteredDevice(device: RegisteredDevice): Device {
  const online =
    device.health?.status === 'ACTIVE' || device.activationStatus === 'ACTIVE';
  const rotationDay = device.rotationStartDate
    ? getRotationDayFromConnectionStart(device.rotationStartDate)
    : null;

  const deploymentName =
    typeof device.deployment?.name === 'string' ? device.deployment.name : undefined;
  const hardwareProfile =
    device.deployment &&
    typeof device.deployment.config === 'object' &&
    device.deployment.config !== null &&
    'hardwareProfileCode' in device.deployment.config
      ? String((device.deployment.config as { hardwareProfileCode?: unknown }).hardwareProfileCode ?? '')
      : '';

  const locationParts = [
    device.deployment?.fieldCategory,
    device.deployment?.exerciseVariant,
  ].filter(Boolean);

  return {
    id: device.id,
    name: device.deviceName || device.serialNumber || deploymentName || device.id.slice(0, 8),
    location: locationParts.length > 0 ? locationParts.join(' · ') : 'Unassigned',
    status: online ? 'online' : 'offline',
    currentDay: rotationDay ? `Day ${rotationDay}` : '—',
    brightSignStatus: online ? 'connected' : 'disconnected',
    lastSync: relativeTime(device.lastSeenAt ?? device.health?.lastSyncAt ?? null),
    model: device.model || hardwareProfile || '—',
    serialNumber: device.serialNumber || '—',
    firmware: device.firmwareVersion || device.health?.firmwareVersion || '—',
    uptime: '—',
    storageUsed: storagePercent(
      device.health?.storageUsedBytes,
      device.health?.storageCapacityBytes,
    ),
  };
}

/** Map API media asset into ContentItem for the library UI. */
export function mapMediaAssetToContentItem(asset: MediaAsset): ContentItem | null {
  const categoryId = libraryTypeToCategory(asset.libraryType ?? undefined);
  if (!categoryId) return null;

  const activeVersion = asset.versions?.find((v) => v.isActive) ?? asset.versions?.[0];
  const mediaType =
    asset.mediaType === 'IMAGE'
      ? 'image'
      : asset.mediaType === 'VIDEO'
        ? 'video'
        : 'video';

  return {
    id: asset.id,
    title: asset.title,
    mediaType,
    categoryId,
    duration: formatDuration(asset.durationSeconds),
    dateLabel: asset.createdAt ? format(new Date(asset.createdAt), 'd MMM yyyy') : '—',
    format: activeVersion?.codec?.toUpperCase() ?? 'MP4',
    thumbnailUrl:
      resolveStorageUrl(asset.thumbnailUrl) ??
      resolveStorageUrl(activeVersion?.fileUrl) ??
      defaultContentThumbnail,
    videoUrl: resolveStorageUrl(activeVersion?.fileUrl) ?? undefined,
    mediaVersionId: activeVersion?.id,
    libraryType: asset.libraryType ?? undefined,
  };
}
