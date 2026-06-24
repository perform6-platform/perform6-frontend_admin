import { useEffect, useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import type { ContentTrack } from '../../constants/contentPlayback';
import { mockDevices } from '../../constants/devices';
import type { DeploymentSubmitPayload } from '../../constants/deployments';
import {
  deploymentBrandingOptions,
  resolveDeploymentBranding,
  DEFAULT_BRANDING_LOGO_URL,
  DEFAULT_COMPANY_NAME,
  type DeploymentBrandingMode,
} from '../../constants/branding';
import { currentRotationDay } from '../../constants/rotationSchedule';
import { useContent } from '../../context/ContentContext';
import { useRotationSchedule } from '../../context/RotationScheduleContext';
import {
  buildDeploymentBundleName,
  buildDeploymentBundleSchedule,
  bundleEntriesToContentItems,
  contentTrackOptions,
  countBundlePrograms,
  deploymentModeOptions,
  exerciseVariationOptions,
  formatDeploymentTimestamp,
  getContentTrackLabel,
  getContentWizardStepLabel,
  getContentWizardSteps,
  getDeploymentBundleVideos,
  getDeploymentModeLabel,
  getExerciseVariationLabel,
  isDeploymentEntryUploaded,
  resolveDeploymentCategoryId,
  type ContentWizardStepKind,
  type DeploymentMode,
  type DeploymentVideoEntry,
  type ExerciseVariation,
} from '../../lib/deploymentHelpers';
import { cn } from '../../lib/cn';
import { DeploymentContentSummary } from './DeploymentContentSummary';
import { DeploymentStepper } from './DeploymentStepper';
import { BrandingLogoUpload } from './BrandingLogoUpload';
import { VideoThumbnailWithBranding } from './VideoThumbnailWithBranding';
import { Badge, Button, CARD_SURFACE_CLASS, DatePicker, Dropdown, Input, SectionLabel } from '../ui';
import { formatDateLabel } from '../../lib/formatDateLabel';

const TOTAL_DEPLOYMENT_STEPS = 3;

export interface NewDeploymentFormProps {
  onSubmit?: (payload: DeploymentSubmitPayload) => void;
}

export function NewDeploymentForm({ onSubmit }: NewDeploymentFormProps) {
  const { getVideosByCategory } = useContent();
  const { rows: scheduleRows } = useRotationSchedule();
  const [step, setStep] = useState(1);
  const [contentWizardIndex, setContentWizardIndex] = useState(0);
  const [deploymentMode, setDeploymentMode] = useState<DeploymentMode>('touch-screen');
  const [contentTrack, setContentTrack] = useState<ContentTrack>('fitness');
  const [exerciseVariation, setExerciseVariation] = useState<ExerciseVariation>('wall');
  const [deploymentName, setDeploymentName] = useState('');
  const [brandingMode, setBrandingMode] = useState<DeploymentBrandingMode>('default');
  const [brandingLogoUrl, setBrandingLogoUrl] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [connectionStartDate, setConnectionStartDate] = useState<Date | undefined>();

  const deviceOptions = useMemo(
    () =>
      mockDevices.map((device) => ({
        value: device.id,
        label: `${device.name} — ${device.location}`,
      })),
    [],
  );

  const selectedDevice = useMemo(
    () => mockDevices.find((device) => device.id === selectedDeviceId),
    [selectedDeviceId],
  );

  const targetDeviceLabel = selectedDevice
    ? `${selectedDevice.name} — ${selectedDevice.location}`
    : '';

  const resolvedBranding = useMemo(
    () =>
      resolveDeploymentBranding(brandingMode, {
        companyName,
        brandingLogoUrl,
      }),
    [brandingMode, companyName, brandingLogoUrl],
  );

  const deploymentVideoEntries = useMemo(
    () =>
      getDeploymentBundleVideos(
        contentTrack,
        exerciseVariation,
        deploymentMode,
        getVideosByCategory,
        scheduleRows,
      ),
    [contentTrack, exerciseVariation, deploymentMode, getVideosByCategory, scheduleRows],
  );

  const categoryVideos = useMemo(
    () => bundleEntriesToContentItems(deploymentVideoEntries),
    [deploymentVideoEntries],
  );

  const videoGroups = useMemo(() => {
    const groups = new Map<string, DeploymentVideoEntry[]>();
    deploymentVideoEntries.forEach((entry) => {
      const key = entry.programLabel ?? 'Program';
      const existing = groups.get(key) ?? [];
      groups.set(key, [...existing, entry]);
    });
    return Array.from(groups.entries());
  }, [deploymentVideoEntries]);

  const libraryVideoCount = deploymentVideoEntries.length;

  const contentWizardSteps = useMemo(
    () => getContentWizardSteps(deploymentMode),
    [deploymentMode],
  );

  const currentContentWizardStep = contentWizardSteps[contentWizardIndex] ?? 'type';
  const isLastContentWizardStep = contentWizardIndex >= contentWizardSteps.length - 1;

  const programTypeLabel = buildDeploymentBundleSchedule(contentTrack, deploymentMode);
  const contentScheduleLabel = buildDeploymentBundleSchedule(contentTrack, deploymentMode);
  const bundleProgramLabels =
    deploymentMode === 'touch-screen'
      ? 'Default, Start Here, Phase 1, Phase 2, Full Program'
      : 'Default, Start Here, Phase 1, Phase 2';

  function resetForm() {
    setStep(1);
    setContentWizardIndex(0);
    setDeploymentMode('touch-screen');
    setContentTrack('fitness');
    setExerciseVariation('wall');
    setBrandingMode('default');
    setBrandingLogoUrl(null);
    setCompanyName('');
    setSelectedDeviceId('');
    setConnectionStartDate(undefined);
    setDeploymentName(buildDeploymentBundleName('fitness', 'touch-screen'));
  }

  useEffect(() => {
    if (!selectedDeviceId) {
      setConnectionStartDate(undefined);
      return;
    }
    setConnectionStartDate((current) => current ?? new Date());
  }, [selectedDeviceId]);

  useEffect(() => {
    setDeploymentName(buildDeploymentBundleName(contentTrack, deploymentMode));
  }, [contentTrack, deploymentMode]);

  useEffect(() => {
    if (contentWizardIndex >= contentWizardSteps.length) {
      setContentWizardIndex(Math.max(0, contentWizardSteps.length - 1));
    }
  }, [contentWizardIndex, contentWizardSteps.length]);

  function handleDeploy() {
    const startedAt = formatDeploymentTimestamp();
    const completedAt = formatDeploymentTimestamp();
    const primaryCategoryId = resolveDeploymentCategoryId('default', contentTrack, exerciseVariation);

    onSubmit?.({
      name: deploymentName.trim() || buildDeploymentBundleName(contentTrack, deploymentMode),
      targetDevices: targetDeviceLabel,
      contentSchedule: contentScheduleLabel,
      status: 'in-progress',
      startedAt,
      completedAt,
      categoryId: primaryCategoryId,
      playbackCategory: 'default',
      usesRotation: true,
      isBundleDeployment: true,
      deploymentMode,
      videoTitle: deploymentVideoEntries[0]?.title ?? '',
      scheduleEntries: deploymentVideoEntries
        .filter(isDeploymentEntryUploaded)
        .map((entry) => ({
          day: entry.day,
          videoTitle: entry.title,
          categoryId: entry.categoryId ?? primaryCategoryId,
        })),
      rotationDay: currentRotationDay,
      deviceId: selectedDeviceId,
      deviceName: selectedDevice?.name,
      connectionStartDate: connectionStartDate
        ? format(connectionStartDate, 'yyyy-MM-dd')
        : undefined,
      brandingMode: resolvedBranding.brandingMode,
      brandingLogoUrl: resolvedBranding.brandingLogoUrl,
      companyName: resolvedBranding.companyName,
    });
    resetForm();
  }

  function handleContentWizardBack() {
    if (contentWizardIndex > 0) {
      setContentWizardIndex((current) => current - 1);
      return;
    }
    setStep((current) => current - 1);
  }

  function handleContentWizardNext() {
    if (!isLastContentWizardStep) {
      setContentWizardIndex((current) => current + 1);
      return;
    }
    setStep((current) => current + 1);
  }

  function handleOuterBack() {
    if (step === 2) {
      setContentWizardIndex(contentWizardSteps.length - 1);
    }
    setStep((current) => current - 1);
  }

  function renderContentWizardStep(stepKind: ContentWizardStepKind) {
    switch (stepKind) {
      case 'type':
        return (
          <RadioOptionGroup
            label="Deployment type"
            options={deploymentModeOptions}
            value={deploymentMode}
            onChange={setDeploymentMode}
          />
        );
      case 'category':
        return (
          <RadioOptionGroup
            label="Select category"
            options={contentTrackOptions}
            value={contentTrack}
            onChange={setContentTrack}
          />
        );
      case 'variation':
        return (
          <RadioOptionGroup
            label="Exercise variation"
            options={exerciseVariationOptions}
            value={exerciseVariation}
            onChange={setExerciseVariation}
          />
        );
      default:
        return null;
    }
  }

  function renderStepContent() {
    if (step === 1) {
      return (
        <div className={cn(CARD_SURFACE_CLASS, 'p-4 sm:p-5')}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <SectionLabel className="block">
              {isLastContentWizardStep
                ? 'Review content'
                : getContentWizardStepLabel(currentContentWizardStep)}
            </SectionLabel>
            <p className="text-caption text-content-muted">
              Step {contentWizardIndex + 1} of {contentWizardSteps.length}
            </p>
          </div>

          {renderContentWizardStep(currentContentWizardStep)}

          {isLastContentWizardStep && (
            <div className="mt-5 border-t border-surface-border pt-4">
              <p className="mb-1 text-body-sm font-medium text-content-primary">
                Videos selected in Rotation
              </p>
              <p className="mb-3 text-body-sm text-content-secondary">
                {libraryVideoCount === 0
                  ? 'No videos assigned in Rotation for this track yet. Assign videos to days in Rotation first.'
                  : `${libraryVideoCount} video${libraryVideoCount === 1 ? '' : 's'} from your Rotation schedule will be deployed.`}
              </p>
              {libraryVideoCount === 0 ? (
                <p className="rounded-lg border border-dashed border-surface-border px-4 py-8 text-center text-body-sm text-content-muted">
                  Go to{' '}
                  <Link
                    to="/rotation"
                    className="font-medium text-brand-600 hover:underline dark:text-brand-400"
                  >
                    Rotation
                  </Link>{' '}
                  to select which videos play on each day.
                </p>
              ) : (
                <div className="max-h-80 space-y-4 overflow-y-auto pr-1">
                  {videoGroups.map(([programLabel, entries]) => (
                    <section key={programLabel}>
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-caption font-semibold uppercase tracking-wide text-content-muted">
                          {programLabel}
                        </p>
                        <Badge variant="success">
                          {entries.length} video{entries.length === 1 ? '' : 's'}
                        </Badge>
                      </div>
                      <ul className="grid gap-2 sm:grid-cols-2">
                        {entries.map((entry, index) => (
                          <DeploymentVideoEntryCard
                            key={`${programLabel}-${entry.day}-${index}`}
                            entry={entry}
                            brandingLogoUrl={resolvedBranding.brandingLogoUrl}
                            companyName={resolvedBranding.companyName}
                          />
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    const summary = (
      <DeploymentContentSummary
        programTypeLabel={programTypeLabel}
        contentLabel={contentScheduleLabel}
        videos={categoryVideos}
        brandingLogoUrl={resolvedBranding.brandingLogoUrl}
        companyName={resolvedBranding.companyName}
        className="xl:max-w-[260px]"
      />
    );

    if (step === 2) {
      return (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[260px_minmax(0,1fr)]">
          {summary}
          <div className={cn(CARD_SURFACE_CLASS, 'space-y-4 p-4 sm:p-5')}>
            <SectionLabel className="block">Deployment Settings</SectionLabel>
            <p className="text-body-sm text-content-secondary">
              Select the target device and when its rotation connection started.
            </p>

            <div>
              <label className="mb-1 block text-xs font-medium text-content-muted">Device</label>
              <Dropdown
                options={deviceOptions}
                value={selectedDeviceId}
                onChange={setSelectedDeviceId}
                placeholder="Select a device"
                fullWidth
                clearable
              />
            </div>

            {selectedDevice && (
              <div className="rounded-lg border border-surface-border bg-surface-muted/30 p-3">
                <p className="text-body-sm font-medium text-content-primary">{selectedDevice.name}</p>
                <p className="mt-0.5 text-caption text-content-secondary">
                  {selectedDevice.location} · {selectedDevice.status === 'online' ? 'Online' : 'Offline'}
                </p>
              </div>
            )}

            {selectedDeviceId && (
              <div>
                <label className="mb-1 block text-xs font-medium text-content-muted">
                  Connection start date
                </label>
                <p className="mb-2 text-body-sm text-content-secondary">
                  When did this device start its current rotation connection?
                </p>
                <DatePicker
                  value={connectionStartDate}
                  onChange={setConnectionStartDate}
                  className="w-full"
                />
              </div>
            )}

            <Input
              label="Deployment name"
              value={deploymentName}
              onChange={(event) => setDeploymentName(event.target.value)}
              required
            />

            <RadioOptionGroup
              label="Branding"
              options={deploymentBrandingOptions}
              value={brandingMode}
              onChange={(value) => {
                setBrandingMode(value);
                if (value === 'default') {
                  setCompanyName('');
                  setBrandingLogoUrl(null);
                }
              }}
            />

            {brandingMode === 'default' ? (
              <div className="rounded-lg border border-surface-border bg-surface-muted/30 p-3">
                <p className="mb-3 text-body-sm text-content-secondary">
                  Your company branding will be used on all deployed videos.
                </p>
                <div className="relative h-16 w-28 overflow-hidden rounded-md border border-surface-border bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800">
                  <div className="absolute left-1.5 top-1.5 flex max-w-[calc(100%-0.75rem)] items-center gap-1 rounded bg-white/95 px-1 py-0.5 shadow-sm">
                    <img
                      src={DEFAULT_BRANDING_LOGO_URL}
                      alt=""
                      className="h-4 w-4 shrink-0 rounded object-contain"
                    />
                    <span className="truncate text-[8px] font-semibold text-slate-900">
                      {DEFAULT_COMPANY_NAME}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Input
                  label="Company name"
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                  placeholder="e.g. Acme Fitness"
                  required
                />
                <BrandingLogoUpload
                  value={brandingLogoUrl}
                  companyName={companyName}
                  onChange={setBrandingLogoUrl}
                />
              </>
            )}
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
            <ReviewRow label="Deployment type" value={getDeploymentModeLabel(deploymentMode)} />
            <ReviewRow label="Category" value={getContentTrackLabel(contentTrack)} />
            <ReviewRow label="Programs" value={bundleProgramLabels} />
            <ReviewRow label="Exercise variation" value={getExerciseVariationLabel(exerciseVariation)} />
            <ReviewRow label="Content schedule" value={contentScheduleLabel} />
            <ReviewRow
              label="Videos"
              value={`${libraryVideoCount} from Rotation (${countBundlePrograms(deploymentVideoEntries)} programs)`}
            />
            <ReviewRow label="Target device" value={targetDeviceLabel || '—'} />
            <ReviewRow
              label="Connection start"
              value={connectionStartDate ? formatDateLabel(connectionStartDate) : '—'}
            />
            <ReviewRow
              label="Branding"
              value={
                brandingMode === 'custom'
                  ? `Custom${resolvedBranding.companyName ? ` — ${resolvedBranding.companyName}` : ''}`
                  : 'Perform6 (default)'
              }
            />
          </dl>
        </div>
      </div>
    );
  }

  const isDeviceSettingsValid =
    selectedDeviceId.length > 0 && connectionStartDate !== undefined;

  const isCustomBrandingValid =
    brandingMode !== 'custom' || companyName.trim().length > 0;

  const canContinue =
    step === 1
      ? isLastContentWizardStep
        ? libraryVideoCount > 0
        : true
      : step === 2
        ? isCustomBrandingValid && isDeviceSettingsValid
        : step === 3
          ? libraryVideoCount > 0 && isCustomBrandingValid && isDeviceSettingsValid
          : true;

  const showBackButton = step > 1 || (step === 1 && contentWizardIndex > 0);

  return (
    <div className="space-y-5">
      <DeploymentStepper currentStep={step} />
      {renderStepContent()}
      <div className="flex flex-col-reverse gap-2 border-t border-surface-border pt-4 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" size="sm" className="h-9 px-4" onClick={resetForm}>
          Reset
        </Button>
        {showBackButton && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 px-4"
            onClick={step === 1 ? handleContentWizardBack : handleOuterBack}
          >
            Back
          </Button>
        )}
        {step < TOTAL_DEPLOYMENT_STEPS ? (
          <Button
            type="button"
            size="sm"
            className="h-9 gap-2 px-4"
            disabled={!canContinue}
            onClick={step === 1 ? handleContentWizardNext : () => setStep((current) => current + 1)}
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            className="h-9 px-4"
            disabled={!canContinue}
            onClick={handleDeploy}
          >
            Deploy
          </Button>
        )}
      </div>
    </div>
  );
}

function DeploymentVideoEntryCard({
  entry,
  brandingLogoUrl,
  companyName,
}: {
  entry: DeploymentVideoEntry;
  brandingLogoUrl?: string | null;
  companyName?: string;
}) {
  const thumbnailUrl = entry.video?.thumbnailUrl;
  const scheduleLabel = entry.usesRotation
    ? `Selected for Day ${entry.day}`
    : 'Selected for all days';

  return (
    <li className="flex items-start gap-3 rounded-lg border border-surface-border bg-surface-muted/30 p-3">
      <VideoThumbnailWithBranding
        thumbnailUrl={thumbnailUrl}
        brandingLogoUrl={brandingLogoUrl}
        companyName={companyName}
        className="h-12 w-20 rounded-md"
        logoClassName="h-3.5 w-3.5"
        nameClassName="text-[8px]"
      />
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="text-caption font-medium text-brand-600 dark:text-brand-400">
            {scheduleLabel}
          </span>
          <Badge variant="success">Uploaded</Badge>
        </div>
        <p className="truncate text-body-sm font-medium text-content-primary">{entry.title}</p>
        {entry.video && (
          <p className="text-caption text-content-secondary">
            {entry.video.duration ?? '—'} · {entry.video.format}
          </p>
        )}
      </div>
    </li>
  );
}

function RadioOptionGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset>
      <legend className="sr-only">{label}</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <label
              key={option.value}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors',
                selected
                  ? 'border-brand-600 bg-brand-50 dark:bg-brand-600/10'
                  : 'border-surface-border hover:border-brand-500/30',
              )}
            >
              <input
                type="radio"
                name={label}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="h-4 w-4 shrink-0 accent-brand-600"
              />
              <span className="text-body-sm font-medium text-content-primary">{option.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
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
