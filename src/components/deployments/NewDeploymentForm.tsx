import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { BrandingLogoUpload } from './BrandingLogoUpload';
import { DeploymentStepper } from './DeploymentStepper';
import {
  Badge,
  Button,
  CARD_SURFACE_CLASS,
  DatePicker,
  Dropdown,
  Input,
  SectionLabel,
} from '../ui';
import { useToast } from '../../context/ToastContext';
import { useCreateBranding, usePlatformDefaultBranding } from '../../hooks/useBranding';
import {
  useCategoryVariants,
  useDeploymentCategories,
  useDeploymentPreview,
  useDeploymentTypes,
  useRegisterDeployment,
} from '../../hooks/useDeployments';
import { useClaimedDevices, useDevices as useInventoryDevices } from '../../hooks/useDevices';
import { resolveStorageUrl } from '../../lib/libraryType';
import {
  formatPreviewDuration,
  parseDeploymentPreviewSlots,
} from '../../lib/deploymentPreview';
import { cn } from '../../lib/cn';
import { formatDateLabel } from '../../lib/formatDateLabel';
import { getApiErrorMessage } from '../../services/axios';
import type { DeviceInventoryItem } from '../../types/devices';
import type {
  BrandingMode,
  RegisterClusterPayload,
  RegisterSinglePayload,
} from '../../types/deployments';

const TOTAL_STEPS = 4;

type BrandingUiMode = 'none' | 'platform' | 'custom';

const brandingOptions = [
  { value: 'none', label: 'None' },
  { value: 'platform', label: 'Platform default' },
  { value: 'custom', label: 'Custom' },
] as const;

const hd226Slots = [
  { memberKey: 'DEVICE_A' as const, label: 'Start Here Player (DEVICE_A)' },
  { memberKey: 'DEVICE_B' as const, label: 'Phase 1 Player (DEVICE_B)' },
  { memberKey: 'DEVICE_C' as const, label: 'Phase 2 Player (DEVICE_C)' },
];

function isHd226(model: string | null | undefined): boolean {
  return (model ?? '').toUpperCase().includes('HD226');
}

export interface NewDeploymentFormProps {
  onSuccess?: (message: string) => void;
}

export function NewDeploymentForm({ onSuccess }: NewDeploymentFormProps) {
  const { showToast } = useToast();
  const [step, setStep] = useState(1);

  const [deploymentType, setDeploymentType] = useState('');
  const [fieldCategory, setFieldCategory] = useState('');
  const [exerciseVariant, setExerciseVariant] = useState('');
  const [rotationStartDate, setRotationStartDate] = useState<Date | undefined>(new Date());
  const [deviceName, setDeviceName] = useState('');

  const [selectedPairingId, setSelectedPairingId] = useState('');
  const [clusterMembers, setClusterMembers] = useState<Record<string, string>>({
    DEVICE_A: '',
    DEVICE_B: '',
    DEVICE_C: '',
  });

  const [brandingUiMode, setBrandingUiMode] = useState<BrandingUiMode>('none');
  const [companyName, setCompanyName] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: types = [], isLoading: typesLoading } = useDeploymentTypes();
  const { data: categories = [], isLoading: categoriesLoading } = useDeploymentCategories();
  const { data: variants = [], isLoading: variantsLoading } = useCategoryVariants(
    fieldCategory || null,
  );

  const { data: claimedInventory } = useClaimedDevices({ limit: 100 });
  const { data: hd226Inventory } = useInventoryDevices({
    state: 'claimed',
    hardwareProfile: 'HD226',
    limit: 100,
  });

  const previewQuery =
    deploymentType && fieldCategory && exerciseVariant
      ? {
          deploymentType,
          fieldCategory,
          exerciseVariant,
          rotationStartDate: rotationStartDate
            ? format(rotationStartDate, 'yyyy-MM-dd')
            : undefined,
        }
      : null;

  const { data: preview, isLoading: previewLoading } = useDeploymentPreview(previewQuery);
  const { data: platformBranding } = usePlatformDefaultBranding();
  const { mutateAsync: createBranding } = useCreateBranding();
  const { mutateAsync: registerDeployment } = useRegisterDeployment();

  const claimedDevices = claimedInventory?.items ?? [];
  const hd226Devices = hd226Inventory?.items ?? [];

  const selectedDevice = useMemo(
    () => claimedDevices.find((d) => d.pairingId === selectedPairingId),
    [claimedDevices, selectedPairingId],
  );

  const isCluster = selectedDevice ? isHd226(selectedDevice.model) : false;

  useEffect(() => {
    if (types.length > 0 && !deploymentType) {
      setDeploymentType(types[0]!.value);
    }
  }, [types, deploymentType]);

  useEffect(() => {
    if (categories.length > 0 && !fieldCategory) {
      setFieldCategory(categories[0]!.value);
    }
  }, [categories, fieldCategory]);

  useEffect(() => {
    if (variants.length > 0) {
      const stillValid = variants.some((v) => v.value === exerciseVariant);
      if (!stillValid) setExerciseVariant(variants[0]!.value);
    } else {
      setExerciseVariant('');
    }
  }, [variants, exerciseVariant]);

  useEffect(() => {
    if (selectedDevice?.deviceName && !deviceName) {
      setDeviceName(selectedDevice.deviceName);
    }
  }, [selectedDevice, deviceName]);

  const deviceOptions = useMemo(
    () =>
      claimedDevices.map((device) => ({
        value: device.pairingId ?? '',
        label: `${device.deviceName || device.serialNumber} — ${device.model}${
          device.location ? ` · ${device.location}` : ''
        }`,
      })),
    [claimedDevices],
  );

  const hd226Options = useMemo(
    () =>
      hd226Devices.map((device) => ({
        value: device.pairingId ?? '',
        label: `${device.deviceName || device.serialNumber} — ${device.serialNumber}`,
      })),
    [hd226Devices],
  );

  const previewSlots = useMemo(() => parseDeploymentPreviewSlots(preview), [preview]);

  function resetForm() {
    setStep(1);
    setSelectedPairingId('');
    setClusterMembers({ DEVICE_A: '', DEVICE_B: '', DEVICE_C: '' });
    setDeviceName('');
    setBrandingUiMode('none');
    setCompanyName('');
    setLogoFile(null);
    setLogoPreviewUrl(null);
    setRotationStartDate(new Date());
  }

  function toApiBrandingMode(mode: BrandingUiMode): BrandingMode {
    if (mode === 'platform') return 'PLATFORM_DEFAULT';
    if (mode === 'custom') return 'CUSTOM';
    return 'NONE';
  }

  async function handleDeploy() {
    if (!deploymentType || !fieldCategory || !exerciseVariant) {
      showToast({ title: 'Select type, category, and variant first', variant: 'error' });
      return;
    }

    const dateStr = rotationStartDate ? format(rotationStartDate, 'yyyy-MM-dd') : undefined;
    const brandingMode = toApiBrandingMode(brandingUiMode);

    setIsSubmitting(true);
    try {
      let brandingId: string | undefined;

      if (brandingMode === 'CUSTOM') {
        if (!logoFile && !companyName.trim()) {
          showToast({
            title: 'Custom branding requires a brand name or logo',
            variant: 'error',
          });
          setIsSubmitting(false);
          return;
        }
        const branding = await createBranding({
          brandName: companyName.trim() || undefined,
          logo: logoFile ?? undefined,
        });
        brandingId = branding.id;
      }

      if (isCluster) {
        const members = hd226Slots.map((slot) => ({
          memberKey: slot.memberKey,
          pairingId: clusterMembers[slot.memberKey]!,
          deviceName:
            hd226Devices.find((d) => d.pairingId === clusterMembers[slot.memberKey])?.deviceName ??
            slot.label,
        }));

        const missing = members.filter((m) => !m.pairingId);
        const unique = new Set(members.map((m) => m.pairingId));
        if (missing.length > 0 || unique.size !== 3) {
          showToast({
            title: 'HD226 requires 3 unique claimed players (A/B/C)',
            variant: 'error',
          });
          setIsSubmitting(false);
          return;
        }

        const payload: RegisterClusterPayload = {
          hardwareProfile: 'HD226',
          members,
          deploymentType,
          fieldCategory,
          exerciseVariant,
          rotationStartDate: dateStr,
          brandingMode,
          brandingId,
        };

        const result = await registerDeployment(payload);
        showToast({
          title: result.message || 'Deployment registered',
          variant: 'success',
        });
        onSuccess?.(result.message || 'Deployment registered');
        resetForm();
        return;
      }

      if (!selectedPairingId) {
        showToast({ title: 'Select a claimed device', variant: 'error' });
        setIsSubmitting(false);
        return;
      }

      const payload: RegisterSinglePayload = {
        pairingId: selectedPairingId,
        deploymentType,
        fieldCategory,
        exerciseVariant,
        rotationStartDate: dateStr,
        deviceName: deviceName.trim() || selectedDevice?.deviceName || undefined,
        hardwareProfile: selectedDevice?.model,
        brandingMode,
        brandingId,
      };

      const result = await registerDeployment(payload);
      showToast({
        title: result.message || 'Deployment registered',
        message: result.data.apiToken
          ? 'API token was issued — store it securely; it is shown once.'
          : undefined,
        variant: 'success',
      });
      onSuccess?.(result.message || 'Deployment registered');
      resetForm();
    } catch (error) {
      showToast({
        title: getApiErrorMessage(error, 'Failed to register deployment'),
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function canGoNext(): boolean {
    if (step === 1) return Boolean(deploymentType && fieldCategory && exerciseVariant);
    if (step === 2) return true;
    if (step === 3) {
      if (isCluster) {
        return hd226Slots.every((slot) => Boolean(clusterMembers[slot.memberKey]));
      }
      return Boolean(selectedPairingId);
    }
    return true;
  }

  return (
    <div className="space-y-4">
      <DeploymentStepper currentStep={step} totalSteps={TOTAL_STEPS} />

      {step === 1 && (
        <div className={cn(CARD_SURFACE_CLASS, 'space-y-4 p-4 sm:p-5')}>
          <SectionLabel className="block">Deployment configuration</SectionLabel>

          <div>
            <p className="mb-1 text-xs font-medium text-content-muted">Deployment type</p>
            <Dropdown
              options={types.map((t) => ({ value: t.value, label: t.label }))}
              value={deploymentType}
              onChange={setDeploymentType}
              fullWidth
              disabled={typesLoading}
            />
          </div>

          <div>
            <p className="mb-1 text-xs font-medium text-content-muted">Field category</p>
            <Dropdown
              options={categories.map((c) => ({ value: c.value, label: c.label }))}
              value={fieldCategory}
              onChange={(value) => {
                setFieldCategory(value);
                setExerciseVariant('');
              }}
              fullWidth
              disabled={categoriesLoading}
            />
          </div>

          <div>
            <p className="mb-1 text-xs font-medium text-content-muted">Exercise variant</p>
            <Dropdown
              options={variants.map((v) => ({ value: v.value, label: v.label }))}
              value={exerciseVariant}
              onChange={setExerciseVariant}
              fullWidth
              disabled={variantsLoading || !fieldCategory}
            />
          </div>

          <div>
            <p className="mb-1 text-xs font-medium text-content-muted">Rotation start date</p>
            <DatePicker value={rotationStartDate} onChange={setRotationStartDate} />
            {rotationStartDate && (
              <p className="mt-1 text-caption text-content-secondary">
                {formatDateLabel(rotationStartDate)}
              </p>
            )}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className={cn(CARD_SURFACE_CLASS, 'space-y-4 p-4 sm:p-5')}>
          <SectionLabel className="block">Content preview</SectionLabel>
          <p className="text-body-sm text-content-secondary">
            All assigned videos for this deployment configuration. Rotating libraries list every
            rotation day — each item&apos;s <strong>day</strong> is the rotation day number.
          </p>
          {previewLoading && (
            <p className="text-body-sm text-content-muted">Loading preview…</p>
          )}
          {!previewLoading && previewSlots.length === 0 && (
            <p className="text-body-sm text-content-muted">
              No preview content for this configuration.
            </p>
          )}
          <div className="max-h-[min(70vh,560px)] space-y-4 overflow-y-auto pr-1">
            {previewSlots.map((slot) => (
              <section key={slot.key}>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-caption font-semibold uppercase tracking-wide text-content-muted">
                    {slot.label}
                  </p>
                  <div className="flex items-center gap-2">
                    {slot.isRotating && (
                      <Badge variant="brand">36-day rotation</Badge>
                    )}
                    <Badge variant="success">
                      {slot.items.length} video{slot.items.length === 1 ? '' : 's'}
                    </Badge>
                  </div>
                </div>
                <ul
                  className={cn(
                    'grid gap-2',
                    slot.isRotating ? 'sm:grid-cols-2 xl:grid-cols-3' : 'sm:grid-cols-2',
                  )}
                >
                  {slot.items.map((item, index) => {
                    const thumbnailUrl = resolveStorageUrl(item.thumbnail);
                    const durationLabel = formatPreviewDuration(item.duration);
                    return (
                      <li
                        key={`${slot.key}-${item.mediaVersionId || item.day}-${index}`}
                        className="flex items-start gap-3 rounded-lg border border-surface-border bg-surface-muted/30 px-3 py-2"
                      >
                        <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-md border border-surface-border bg-surface-muted">
                          {thumbnailUrl ? (
                            <img
                              src={thumbnailUrl}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-caption text-content-muted">
                              —
                            </div>
                          )}
                          {slot.isRotating && (
                            <span className="absolute bottom-0 left-0 right-0 bg-brand-600/90 px-1 py-0.5 text-center text-[10px] font-semibold text-white">
                              Day {item.day}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-body-sm font-medium text-content-primary">
                            {item.video}
                          </p>
                          <p className="text-caption text-content-secondary">
                            {slot.isRotating ? `Rotation day ${item.day}` : `Day ${item.day}`}
                            {durationLabel ? ` · ${durationLabel}` : ''}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className={cn(CARD_SURFACE_CLASS, 'space-y-4 p-4 sm:p-5')}>
          <SectionLabel className="block">Claimed device</SectionLabel>
          <p className="text-body-sm text-content-secondary">
            Pick a device in <strong>ADMIN_CLAIMED</strong> state. HD226 deployments need three
            claimed players.
          </p>

          <div>
            <p className="mb-1 text-xs font-medium text-content-muted">Primary claimed device</p>
            <Dropdown
              options={[{ value: '', label: 'Select device…' }, ...deviceOptions]}
              value={selectedPairingId}
              onChange={(value) => {
                setSelectedPairingId(value);
                setDeviceName('');
              }}
              fullWidth
            />
          </div>

          {selectedDevice && !isCluster && (
            <Input
              label="Device name (optional override)"
              placeholder={selectedDevice.deviceName ?? 'Gym Screen 1'}
              value={deviceName}
              onChange={(event) => setDeviceName(event.target.value)}
            />
          )}

          {selectedDevice && (
            <p className="text-caption text-content-secondary">
              Model: {selectedDevice.model}
              {selectedDevice.serialNumber ? ` · ${selectedDevice.serialNumber}` : ''}
              {isCluster ? ' · HD226 cluster mode' : ''}
            </p>
          )}

          {isCluster && (
            <div className="space-y-3 rounded-lg border border-surface-border p-3">
              <p className="text-body-sm font-medium text-content-primary">
                HD226 cluster slots (A → Start Here, B → Phase 1, C → Phase 2)
              </p>
              {hd226Slots.map((slot) => (
                <div key={slot.memberKey}>
                  <p className="mb-1 text-xs font-medium text-content-muted">{slot.label}</p>
                  <Dropdown
                    options={[{ value: '', label: 'Select HD226 player…' }, ...hd226Options]}
                    value={clusterMembers[slot.memberKey] ?? ''}
                    onChange={(value) =>
                      setClusterMembers((current) => ({ ...current, [slot.memberKey]: value }))
                    }
                    fullWidth
                  />
                </div>
              ))}
              {hd226Devices.length < 3 && (
                <p className="text-caption text-status-warning">
                  Need at least 3 claimed HD226 devices. Currently: {hd226Devices.length}.
                </p>
              )}
            </div>
          )}

          {claimedDevices.length === 0 && (
            <p className="text-body-sm text-content-muted">
              No claimed devices. Claim a pairing code from the Devices page first.
            </p>
          )}
        </div>
      )}

      {step === 4 && (
        <div className={cn(CARD_SURFACE_CLASS, 'space-y-4 p-4 sm:p-5')}>
          <SectionLabel className="block">Branding & deploy</SectionLabel>

          <div>
            <p className="mb-1 text-xs font-medium text-content-muted">Branding mode</p>
            <Dropdown
              options={[...brandingOptions]}
              value={brandingUiMode}
              onChange={(value) => setBrandingUiMode(value as BrandingUiMode)}
              fullWidth
            />
          </div>

          {brandingUiMode === 'platform' && platformBranding && (
            <p className="text-body-sm text-content-secondary">
              Using platform default: {platformBranding.brandName}
              {platformBranding.logoUrl
                ? ` (${resolveStorageUrl(platformBranding.logoUrl)})`
                : ''}
            </p>
          )}

          {brandingUiMode === 'custom' && (
            <>
              <Input
                label="Brand name"
                placeholder="Acme Fitness"
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
              />
              <BrandingLogoUpload
                previewUrl={logoPreviewUrl}
                companyName={companyName}
                onChange={(file, preview) => {
                  setLogoFile(file);
                  setLogoPreviewUrl(preview);
                }}
              />
            </>
          )}

          <div className="rounded-lg border border-surface-border bg-surface-muted/20 p-3 text-body-sm text-content-secondary">
            <p>
              <span className="font-medium text-content-primary">Type:</span> {deploymentType}
            </p>
            <p>
              <span className="font-medium text-content-primary">Category:</span> {fieldCategory} /{' '}
              {exerciseVariant}
            </p>
            <p>
              <span className="font-medium text-content-primary">Start:</span>{' '}
              {rotationStartDate ? format(rotationStartDate, 'yyyy-MM-dd') : '—'}
            </p>
            <p>
              <span className="font-medium text-content-primary">Device:</span>{' '}
              {isCluster
                ? 'HD226 cluster (3 players)'
                : selectedDevice?.deviceName || selectedDevice?.serialNumber || '—'}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 px-4"
          disabled={step === 1 || isSubmitting}
          onClick={() => setStep((current) => Math.max(1, current - 1))}
        >
          Back
        </Button>
        {step < TOTAL_STEPS ? (
          <Button
            type="button"
            size="sm"
            className="h-9 px-4"
            disabled={!canGoNext()}
            onClick={() => setStep((current) => Math.min(TOTAL_STEPS, current + 1))}
          >
            Next
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            className="h-9 px-4"
            disabled={isSubmitting || !canGoNext()}
            onClick={() => void handleDeploy()}
          >
            {isSubmitting ? 'Deploying…' : 'Register deployment'}
          </Button>
        )}
      </div>
    </div>
  );
}

/** Re-export for callers that still expect an inventory item helper. */
export type { DeviceInventoryItem };
