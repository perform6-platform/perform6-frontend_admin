import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import type { ContentCategoryId } from '../../constants/contentLibrary';
import { allContentCategories, contentCategoryGroups, deploymentTrackOptions } from '../../constants/contentPlayback';
import { mockDevices, type Device } from '../../constants/devices';
import type { DeploymentStatus } from '../../constants/deployments';
import { useContent } from '../../context/ContentContext';
import {
  buildDeploymentName,
  deploymentDayOptions,
  formatDeploymentTimestamp,
  getCategoryLabel,
  getDeploymentTrackLabel,
} from '../../lib/deploymentHelpers';
import { cn } from '../../lib/cn';
import { DeploymentContentSummary } from './DeploymentContentSummary';
import { DeploymentStepper } from './DeploymentStepper';
import { Badge, Button, CARD_SURFACE_CLASS, Dropdown, Input, Modal, SectionLabel } from '../ui';

const programTypeOptions = contentCategoryGroups.flatMap((group) =>
  group.children.map((category) => ({
    value: category.id,
    label: `${group.label} — ${category.label}`,
  })),
);

const trackOptions = deploymentTrackOptions.map((option) => ({
  value: option.value,
  label: option.label,
}));

const timingOptions = [
  { value: 'now', label: 'Deploy now' },
  { value: 'scheduled', label: 'Schedule for later' },
];

export interface NewDeploymentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (payload: {
    name: string;
    targetDevices: string;
    contentSchedule: string;
    status: DeploymentStatus;
    startedAt: string;
    completedAt: string;
  }) => void;
}

export function NewDeploymentModal({ open, onClose, onSubmit }: NewDeploymentModalProps) {
  const { getVideosByCategory } = useContent();
  const [step, setStep] = useState(1);
  const [categoryId, setCategoryId] = useState<ContentCategoryId>('phase-1-fitness-wall');
  const [contentDay, setContentDay] = useState('day-14');
  const [deploymentTrack, setDeploymentTrack] = useState('fitness');
  const [deploymentName, setDeploymentName] = useState('');
  const [timing, setTiming] = useState('now');
  const [search, setSearch] = useState('');
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<Set<string>>(new Set());

  const categoryVideos = useMemo(() => {
    const videos = getVideosByCategory(categoryId);
    const dayNumber = contentDay.replace('day-', '');
    const dayMatches = videos.filter(
      (video) =>
        video.title.includes(`_${dayNumber}`) ||
        video.title.includes(`${dayNumber}_`) ||
        video.title.toUpperCase().includes(`DAY ${dayNumber}`),
    );

    return dayMatches.length > 0 ? dayMatches : videos.slice(0, 1);
  }, [categoryId, contentDay, getVideosByCategory]);

  const programTypeLabel = getCategoryLabel(categoryId);
  const contentDayLabel =
    deploymentDayOptions.find((option) => option.value === contentDay)?.label ?? 'Day 14';

  const filteredDevices = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return mockDevices;

    return mockDevices.filter(
      (device) =>
        device.name.toLowerCase().includes(query) ||
        device.location.toLowerCase().includes(query),
    );
  }, [search]);

  useEffect(() => {
    if (!open) return;

    const onlineIds = mockDevices.filter((device) => device.status === 'online').map((device) => device.id);
    setSelectedDeviceIds(new Set(onlineIds.slice(0, 12)));
    setStep(1);
    setCategoryId('phase-1-fitness-wall');
    setContentDay('day-14');
    setDeploymentTrack('fitness');
    setTiming('now');
    setSearch('');
  }, [open]);

  useEffect(() => {
    setDeploymentName(buildDeploymentName(programTypeLabel, contentDayLabel));
  }, [programTypeLabel, contentDayLabel]);

  function handleClose() {
    onClose();
  }

  function toggleDevice(deviceId: string) {
    setSelectedDeviceIds((current) => {
      const next = new Set(current);
      if (next.has(deviceId)) next.delete(deviceId);
      else next.add(deviceId);
      return next;
    });
  }

  function toggleAllFiltered(checked: boolean) {
    setSelectedDeviceIds((current) => {
      const next = new Set(current);
      filteredDevices.forEach((device) => {
        if (checked) next.add(device.id);
        else next.delete(device.id);
      });
      return next;
    });
  }

  const allFilteredSelected =
    filteredDevices.length > 0 && filteredDevices.every((device) => selectedDeviceIds.has(device.id));

  function handleDeploy() {
    const selectedCount = selectedDeviceIds.size;
    const status: DeploymentStatus = timing === 'scheduled' ? 'scheduled' : 'in-progress';
    const startedAt = timing === 'now' ? formatDeploymentTimestamp() : '—';
    const completedAt = timing === 'now' ? formatDeploymentTimestamp() : '—';

    onSubmit?.({
      name: deploymentName.trim() || buildDeploymentName(programTypeLabel, contentDayLabel),
      targetDevices: `${selectedCount} Device${selectedCount === 1 ? '' : 's'}`,
      contentSchedule: `${contentDayLabel} · ${programTypeLabel}`,
      status,
      startedAt,
      completedAt,
    });
    handleClose();
  }

  function renderStepContent() {
    if (step === 1) {
      return (
        <div className={cn(CARD_SURFACE_CLASS, 'p-4 sm:p-5')}>
          <SectionLabel className="mb-4 block">Select Content</SectionLabel>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-content-muted">Deployment track</label>
              <Dropdown
                options={trackOptions}
                value={deploymentTrack}
                onChange={setDeploymentTrack}
                fullWidth
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-content-muted">Content category</label>
              <Dropdown
                options={programTypeOptions}
                value={categoryId}
                onChange={(value) => setCategoryId(value as ContentCategoryId)}
                fullWidth
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-content-muted">Rotation day</label>
              <Dropdown
                options={deploymentDayOptions}
                value={contentDay}
                onChange={setContentDay}
                fullWidth
              />
            </div>
          </div>

          <div className="mt-5 border-t border-surface-border pt-4">
            <p className="mb-3 text-body-sm text-content-secondary">
              Videos from Content Library for this program ({categoryVideos.length} available)
            </p>
            {categoryVideos.length === 0 ? (
              <p className="rounded-lg border border-dashed border-surface-border px-4 py-8 text-center text-body-sm text-content-muted">
                No videos uploaded yet. Add content in Content Library or Programs first.
              </p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {categoryVideos.map((video) => (
                  <li
                    key={video.id}
                    className="flex items-center gap-3 rounded-lg border border-surface-border bg-surface-muted/30 p-3"
                  >
                    <img
                      src={video.thumbnailUrl}
                      alt=""
                      className="h-14 w-24 shrink-0 rounded-md object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-body-sm font-medium text-content-primary">{video.title}</p>
                      <p className="text-caption text-content-secondary">
                        {video.duration ?? '—'} · {video.format}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      );
    }

    const summary = (
      <DeploymentContentSummary
        programTypeLabel={programTypeLabel}
        contentLabel={contentDayLabel}
        videos={categoryVideos}
        className="xl:max-w-[260px]"
      />
    );

    if (step === 2) {
      return (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[260px_minmax(0,1fr)]">
          {summary}
          <div className={cn(CARD_SURFACE_CLASS, 'p-4 sm:p-5')}>
            <SectionLabel className="mb-4 block">Select Devices</SectionLabel>
            <Input
              icon={<Search className="h-4 w-4" />}
              placeholder="Search devices..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search devices"
              className="mb-4"
            />

            <div className="table-scroll-x overflow-x-auto rounded-lg border border-surface-border">
              <p className="scroll-hint px-3 py-2 text-caption text-content-muted md:hidden">
                Swipe to see all columns →
              </p>
              <table className="w-full min-w-[480px] border-collapse text-left sm:min-w-[520px]">
                <thead>
                  <tr className="border-b border-surface-border bg-surface-muted/50">
                    <th className="w-10 px-3 py-3">
                      <input
                        type="checkbox"
                        checked={allFilteredSelected}
                        onChange={(event) => toggleAllFiltered(event.target.checked)}
                        aria-label="Select all devices"
                        className="h-4 w-4 rounded border-surface-border accent-brand-600"
                      />
                    </th>
                    <th className="px-3 py-3 text-section-label uppercase text-content-secondary">
                      Device Name
                    </th>
                    <th className="px-3 py-3 text-section-label uppercase text-content-secondary">
                      Location
                    </th>
                    <th className="px-3 py-3 text-section-label uppercase text-content-secondary">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDevices.map((device) => (
                    <DeviceSelectRow
                      key={device.id}
                      device={device}
                      checked={selectedDeviceIds.has(device.id)}
                      onToggle={() => toggleDevice(device.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-3 text-body-sm text-content-secondary">
              Selected {selectedDeviceIds.size} of {mockDevices.length} devices
            </p>
          </div>
        </div>
      );
    }

    if (step === 3) {
      return (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[260px_minmax(0,1fr)]">
          {summary}
          <div className={cn(CARD_SURFACE_CLASS, 'space-y-4 p-4 sm:p-5')}>
            <SectionLabel className="block">Deployment Settings</SectionLabel>
            <Input
              label="Deployment name"
              value={deploymentName}
              onChange={(event) => setDeploymentName(event.target.value)}
              required
            />
            <div>
              <label className="mb-1 block text-xs font-medium text-content-muted">Timing</label>
              <Dropdown options={timingOptions} value={timing} onChange={setTiming} fullWidth />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[260px_minmax(0,1fr)]">
        {summary}
        <div className={cn(CARD_SURFACE_CLASS, 'space-y-4 p-4 sm:p-5')}>
          <SectionLabel className="block">Review & Deploy</SectionLabel>
          <dl className="divide-y divide-surface-border rounded-lg border border-surface-border">
            <ReviewRow label="Deployment name" value={deploymentName} />
            <ReviewRow label="Deployment track" value={getDeploymentTrackLabel(deploymentTrack)} />
            <ReviewRow label="Content category" value={programTypeLabel} />
            <ReviewRow
              label="Videos"
              value={categoryVideos.length === 1 ? '1 Video' : `${categoryVideos.length} Videos`}
            />
            <ReviewRow
              label="Target devices"
              value={`${selectedDeviceIds.size} of ${mockDevices.length} devices`}
            />
            <ReviewRow
              label="Timing"
              value={timing === 'now' ? 'Deploy now' : 'Schedule for later'}
            />
          </dl>
        </div>
      </div>
    );
  }

  const canContinue =
    step === 1 ? categoryVideos.length > 0 : step === 2 ? selectedDeviceIds.size > 0 : true;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="New Deployment"
      size="xl"
      className="max-h-[min(92vh,860px)] sm:max-h-[min(90vh,860px)]"
      footer={
        <>
          <Button type="button" variant="outline" size="sm" className="h-9 px-4" onClick={handleClose}>
            Cancel
          </Button>
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 px-4"
              onClick={() => setStep((current) => current - 1)}
            >
              Back
            </Button>
          )}
          {step < 4 ? (
            <Button
              type="button"
              size="sm"
              className="h-9 gap-2 px-4"
              disabled={!canContinue}
              onClick={() => setStep((current) => current + 1)}
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              className="h-9 px-4"
              disabled={selectedDeviceIds.size === 0}
              onClick={handleDeploy}
            >
              Deploy
            </Button>
          )}
        </>
      }
    >
      <DeploymentStepper currentStep={step} className="mb-5" />
      {renderStepContent()}
    </Modal>
  );
}

function DeviceSelectRow({
  device,
  checked,
  onToggle,
}: {
  device: Device;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <tr className="border-b border-surface-border last:border-b-0">
      <td className="px-3 py-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          aria-label={`Select ${device.name}`}
          className="h-4 w-4 rounded border-surface-border accent-brand-600"
        />
      </td>
      <td className="px-3 py-3 text-body-sm font-medium text-content-primary">{device.name}</td>
      <td className="px-3 py-3 text-body-sm text-content-secondary">{device.location}</td>
      <td className="px-3 py-3">
        <Badge variant={device.status === 'online' ? 'success' : 'danger'}>
          {device.status === 'online' ? 'Online' : 'Offline'}
        </Badge>
      </td>
    </tr>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <dt className="text-body-sm text-content-secondary">{label}</dt>
      <dd className="text-body-sm font-medium text-content-primary">{value}</dd>
    </div>
  );
}
