import { useMemo } from 'react';
import type { Deployment } from '../../constants/deployments';
import {
  getDeploymentStatusLabel,
  getDeploymentStatusVariant,
} from '../../constants/deployments';
import { getFullCategoryLabel, getPlaybackCategoryForContent } from '../../constants/contentPlayback';
import {
  getContentTrackFromCategoryId,
  getContentTrackLabel,
  getDeploymentModeLabel,
  getExerciseVariationFromCategoryId,
  getExerciseVariationLabel,
  usesRotationForPlayback,
} from '../../lib/deploymentHelpers';
import { enrichDeploymentDetails } from '../../lib/deploymentDetails';
import { formatDateLabel } from '../../lib/formatDateLabel';
import {
  getDeploymentBrandingLabel,
  resolveDeploymentBranding,
} from '../../constants/branding';
import { cn } from '../../lib/cn';
import { Badge, Button, CARD_SURFACE_CLASS, Modal, ModalBody, SectionLabel } from '../ui';

export interface DeploymentDetailsModalProps {
  open: boolean;
  deployment: Deployment | null;
  onClose: () => void;
}

export function DeploymentDetailsModal({
  open,
  deployment,
  onClose,
}: DeploymentDetailsModalProps) {
  const displayDeployment = useMemo(
    () => (deployment ? enrichDeploymentDetails(deployment) : null),
    [deployment],
  );

  const videoGroups = useMemo(() => {
    if (!displayDeployment?.scheduleEntries?.length) return [];

    const groups = new Map<string, typeof displayDeployment.scheduleEntries>();
    displayDeployment.scheduleEntries.forEach((entry) => {
      const key = getFullCategoryLabel(entry.categoryId);
      const existing = groups.get(key) ?? [];
      groups.set(key, [...existing, entry]);
    });

    return Array.from(groups.entries()).map(([programLabel, entries]) => ({
      programLabel,
      entries: [...entries].sort((a, b) => a.day - b.day),
    }));
  }, [displayDeployment]);

  const brandingDisplay = useMemo(() => {
    if (!displayDeployment) return null;

    return resolveDeploymentBranding(displayDeployment.brandingMode ?? 'default', {
      companyName: displayDeployment.companyName ?? '',
      brandingLogoUrl: displayDeployment.brandingLogoUrl ?? null,
    });
  }, [displayDeployment]);

  const trackLabel = displayDeployment?.categoryId
    ? getContentTrackLabel(getContentTrackFromCategoryId(displayDeployment.categoryId))
    : '—';

  const variationLabel = displayDeployment?.categoryId
    ? getExerciseVariationLabel(getExerciseVariationFromCategoryId(displayDeployment.categoryId))
    : '—';

  const programSummary =
    displayDeployment?.deploymentMode === 'default'
      ? 'Default, Start Here, Phase 1, Phase 2'
      : displayDeployment?.deploymentMode === 'touch-screen'
        ? 'Default, Start Here, Phase 1, Phase 2, Full Program'
        : '—';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Deployment details"
      description={displayDeployment?.name}
      size="xl"
      className="max-h-[min(92vh,860px)] sm:max-h-[min(90vh,860px)]"
      footer={
        <Button type="button" size="sm" className="h-9 px-4" onClick={onClose}>
          Close
        </Button>
      }
    >
      <ModalBody className="space-y-4">
        {!displayDeployment ? (
          <p className="text-body-sm text-content-muted">No deployment selected.</p>
        ) : (
          <>
            <div className={cn(CARD_SURFACE_CLASS, 'flex flex-wrap items-center justify-between gap-3 p-4')}>
              <div>
                <p className="text-body-sm font-medium text-content-primary">{displayDeployment.name}</p>
                <p className="text-caption text-content-secondary">{displayDeployment.contentSchedule}</p>
              </div>
              <Badge variant={getDeploymentStatusVariant(displayDeployment.status)}>
                {getDeploymentStatusLabel(displayDeployment.status)}
              </Badge>
            </div>

            <section className={cn(CARD_SURFACE_CLASS, 'p-4 sm:p-5')}>
              <SectionLabel className="mb-3 block">Overview</SectionLabel>
              <dl className="divide-y divide-surface-border rounded-lg border border-surface-border">
                <DetailRow label="Deployment name" value={displayDeployment.name} />
                <DetailRow label="Target device" value={displayDeployment.targetDevices} />
                {displayDeployment.connectionStartDate && (
                  <DetailRow
                    label="Connection start"
                    value={formatConnectionStartLabel(displayDeployment.connectionStartDate)}
                  />
                )}
                <DetailRow label="Content / schedule" value={displayDeployment.contentSchedule} />
                <DetailRow label="Started" value={displayDeployment.startedAt} />
                <DetailRow label="Completed" value={displayDeployment.completedAt} />
              </dl>
            </section>

            <section className={cn(CARD_SURFACE_CLASS, 'p-4 sm:p-5')}>
              <SectionLabel className="mb-3 block">Deployment configuration</SectionLabel>
              <dl className="divide-y divide-surface-border rounded-lg border border-surface-border">
                <DetailRow
                  label="Deployment type"
                  value={
                    displayDeployment.deploymentMode
                      ? getDeploymentModeLabel(displayDeployment.deploymentMode)
                      : '—'
                  }
                />
                <DetailRow label="Category" value={trackLabel} />
                <DetailRow label="Exercise variation" value={variationLabel} />
                <DetailRow label="Programs" value={programSummary} />
                <DetailRow
                  label="Bundle deployment"
                  value={
                    displayDeployment.isBundleDeployment
                      ? 'Yes'
                      : displayDeployment.isBundleDeployment === false
                        ? 'No'
                        : '—'
                  }
                />
                <DetailRow
                  label="Uses rotation"
                  value={
                    displayDeployment.usesRotation
                      ? 'Yes'
                      : displayDeployment.usesRotation === false
                        ? 'No'
                        : '—'
                  }
                />
                <DetailRow
                  label="Rotation day"
                  value={
                    displayDeployment.rotationDay
                      ? `Day ${displayDeployment.rotationDay}`
                      : '—'
                  }
                />
                <DetailRow
                  label="Branding"
                  value={getDeploymentBrandingLabel(displayDeployment.brandingMode)}
                />
                <DetailRow
                  label="Company name"
                  value={brandingDisplay?.companyName || '—'}
                />
              </dl>
            </section>

            {brandingDisplay && (
              <section className={cn(CARD_SURFACE_CLASS, 'p-4 sm:p-5')}>
                <SectionLabel className="mb-3 block">Company branding</SectionLabel>
                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-36 overflow-hidden rounded-lg border border-surface-border bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800">
                    <div className="absolute left-2 top-2 flex max-w-[calc(100%-1rem)] items-center gap-1.5 rounded bg-white/95 px-1.5 py-1 shadow-sm">
                      {brandingDisplay.brandingLogoUrl && (
                        <img
                          src={brandingDisplay.brandingLogoUrl}
                          alt=""
                          className="h-6 w-6 shrink-0 rounded object-contain"
                        />
                      )}
                      {brandingDisplay.companyName && (
                        <span className="truncate text-xs font-semibold text-slate-900">
                          {brandingDisplay.companyName}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-body-sm text-content-secondary">
                    Logo and company name are shown on the upper-left corner of deployed videos.
                  </p>
                </div>
              </section>
            )}

            <section className={cn(CARD_SURFACE_CLASS, 'p-4 sm:p-5')}>
              <SectionLabel className="mb-3 block">Deployed videos</SectionLabel>
              {videoGroups.length === 0 ? (
                <p className="rounded-lg border border-dashed border-surface-border px-4 py-8 text-center text-body-sm text-content-muted">
                  No video schedule was recorded for this deployment.
                </p>
              ) : (
                <div className="max-h-72 space-y-4 overflow-y-auto pr-1">
                  {videoGroups.map(({ programLabel, entries }) => (
                    <div key={programLabel}>
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="text-caption font-semibold uppercase tracking-wide text-content-muted">
                          {programLabel}
                        </p>
                        <Badge variant="neutral">
                          {entries.length} video{entries.length === 1 ? '' : 's'}
                        </Badge>
                      </div>
                      <ul className="divide-y divide-surface-border rounded-lg border border-surface-border">
                        {entries.map((entry, index) => (
                          <li
                            key={`${programLabel}-${entry.day}-${index}`}
                            className="flex items-center justify-between gap-3 px-3 py-2.5"
                          >
                            <span className="min-w-0 truncate text-body-sm text-content-primary">
                              {entry.videoTitle}
                            </span>
                            <span className="shrink-0 text-caption text-content-secondary">
                              {usesRotationForPlayback(getPlaybackCategoryForContent(entry.categoryId))
                                ? `Day ${entry.day}`
                                : 'All days'}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </ModalBody>
    </Modal>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <dt className="text-body-sm text-content-secondary">{label}</dt>
      <dd className="text-right text-body-sm font-medium text-content-primary">{value}</dd>
    </div>
  );
}

function formatConnectionStartLabel(value: string): string {
  const [year, month, day] = value.split('-').map((part) => Number.parseInt(part, 10));
  if (!year || !month || !day) return value;
  return formatDateLabel(new Date(year, month - 1, day));
}
