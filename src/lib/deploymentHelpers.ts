import type { ContentItem } from '../constants/contentLibrary';
import { allContentCategories, deploymentTrackOptions } from '../constants/contentPlayback';

export const deploymentSteps = [
  { id: 1, label: 'Select Content' },
  { id: 2, label: 'Select Devices' },
  { id: 3, label: 'Deployment Settings' },
  { id: 4, label: 'Review & Deploy' },
] as const;

export const deploymentDayOptions = Array.from({ length: 36 }, (_, index) => {
  const day = index + 1;
  return { value: `day-${day}`, label: `Day ${day}` };
});

export function getCategoryLabel(categoryId: string): string {
  return allContentCategories.find((category) => category.id === categoryId)?.label ?? categoryId;
}

export function getDeploymentTrackLabel(track: string): string {
  return deploymentTrackOptions.find((option) => option.value === track)?.label ?? track;
}

export function formatProgramTypeLabel(label: string): string {
  return label.replace('(', '- ').replace(')', '');
}

function parseDurationToSeconds(duration: string): number {
  const parts = duration.split(':').map((part) => Number.parseInt(part, 10));
  if (parts.length === 2) return (parts[0] ?? 0) * 60 + (parts[1] ?? 0);
  if (parts.length === 3) {
    return (parts[0] ?? 0) * 3600 + (parts[1] ?? 0) * 60 + (parts[2] ?? 0);
  }
  return 0;
}

export function formatVideosDuration(videos: ContentItem[]): string {
  const totalSeconds = videos.reduce(
    (sum, video) => sum + parseDurationToSeconds(video.duration ?? '0:00'),
    0,
  );

  if (totalSeconds === 0) return '—';
  const minutes = Math.max(1, Math.ceil(totalSeconds / 60));
  return `~${minutes} min`;
}

export function formatDeploymentTimestamp(date = new Date()): string {
  return date
    .toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
    .replace(',', '');
}

export function buildDeploymentName(programLabel: string, dayLabel: string): string {
  return `${dayLabel} ${programLabel} Update`;
}
