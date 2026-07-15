import { useMemo } from 'react';
import { useDeployment } from '../../hooks/useDeployments';
import { cn } from '../../lib/cn';
import { resolveStorageUrl } from '../../lib/libraryType';
import type { DeploymentEntity, DeploymentScreenSummary } from '../../types/deployments';
import { Badge, Button, CARD_SURFACE_CLASS, Modal, ModalBody, SectionLabel } from '../ui';

export interface DeploymentDetailsModalProps {
  open: boolean;
  deploymentId: string | null;
  onClose: () => void;
}

function formatLabel(value: string | undefined | null): string {
  if (!value) return '—';
  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function brandingLabel(config?: Record<string, unknown>): string {
  const mode = config?.brandingMode;
  if (mode === 'CUSTOM') return 'Custom';
  if (mode === 'NONE') return 'None';
  return 'Platform default';
}

function resolveScreens(deployment: DeploymentEntity | undefined): DeploymentScreenSummary[] {
  if (!deployment) return [];
  if (Array.isArray(deployment.screens) && deployment.screens.length > 0) {
    return deployment.screens;
  }
  return (deployment.screenAssignments ?? []).map((assignment) => ({
    id: assignment.id,
    screenKey: assignment.screenKey,
    contentSlot: assignment.contentSlot,
    categoryId: assignment.categoryId ?? null,
    categoryName:
      assignment.categoryName ?? assignment.category?.name ?? null,
    categorySlug: assignment.categorySlug ?? assignment.category?.slug ?? null,
    sortOrder: assignment.sortOrder,
  }));
}

export function DeploymentDetailsModal({
  open,
  deploymentId,
  onClose,
}: DeploymentDetailsModalProps) {
  const { data: deployment, isLoading, isError } = useDeployment(
    open ? deploymentId : null,
  );

  const screens = useMemo(() => resolveScreens(deployment), [deployment]);
  const branding = deployment?.branding?.[0];
  const logoUrl =
    branding && typeof branding.logoUrl === 'string'
      ? resolveStorageUrl(branding.logoUrl)
      : null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Deployment details"
      description={deployment?.name}
      size="xl"
      className="max-h-[min(92vh,860px)]"
      footer={
        <Button type="button" size="sm" className="h-9 px-4" onClick={onClose}>
          Close
        </Button>
      }
    >
      <ModalBody className="space-y-4">
        {isLoading ? (
          <p className="text-body-sm text-content-muted">Loading deployment…</p>
        ) : isError || !deployment ? (
          <p className="text-body-sm text-content-muted">Failed to load deployment details.</p>
        ) : (
          <>
            <section className={cn(CARD_SURFACE_CLASS, 'p-4 sm:p-5')}>
              <SectionLabel className="mb-3 block">Overview</SectionLabel>
              <dl className="divide-y divide-surface-border rounded-lg border border-surface-border">
                <DetailRow label="Name" value={deployment.name || '—'} />
                <DetailRow label="Type" value={formatLabel(deployment.deploymentType)} />
                <DetailRow label="Field" value={formatLabel(deployment.fieldCategory)} />
                <DetailRow label="Variant" value={formatLabel(deployment.exerciseVariant)} />
                <DetailRow label="Branding" value={brandingLabel(deployment.config)} />
                <DetailRow
                  label="Devices"
                  value={String(deployment.devices?.length ?? 0)}
                />
                <DetailRow
                  label="Description"
                  value={
                    typeof deployment.description === 'string' && deployment.description.trim()
                      ? deployment.description
                      : '—'
                  }
                />
              </dl>
            </section>

            <section className={cn(CARD_SURFACE_CLASS, 'p-4 sm:p-5')}>
              <SectionLabel className="mb-3 block">Screen → category</SectionLabel>
              {screens.length === 0 ? (
                <p className="rounded-lg border border-dashed border-surface-border px-4 py-6 text-center text-body-sm text-content-muted">
                  No screen assignments on this deployment.
                </p>
              ) : (
                <ul className="divide-y divide-surface-border rounded-lg border border-surface-border">
                  {screens.map((screen) => (
                    <li
                      key={screen.screenKey}
                      className="flex items-center justify-between gap-3 px-4 py-3"
                    >
                      <div>
                        <p className="text-body-sm font-medium text-content-primary">
                          {formatLabel(screen.screenKey)}
                        </p>
                        <p className="text-caption text-content-muted">
                          {screen.contentSlot
                            ? formatLabel(screen.contentSlot)
                            : 'Content slot'}
                        </p>
                      </div>
                      <Badge variant="brand">
                        {screen.categoryName || screen.categoryId || 'Unassigned'}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {deployment.devices && deployment.devices.length > 0 && (
              <section className={cn(CARD_SURFACE_CLASS, 'p-4 sm:p-5')}>
                <SectionLabel className="mb-3 block">Linked devices</SectionLabel>
                <ul className="divide-y divide-surface-border rounded-lg border border-surface-border">
                  {deployment.devices.map((device) => (
                    <li key={device.id} className="px-4 py-3 text-body-sm text-content-primary">
                      <span className="font-medium">{device.id.slice(0, 8)}…</span>
                      {device.rotationStartDate ? (
                        <span className="ml-2 text-content-secondary">
                          Rotation start {String(device.rotationStartDate)}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {(logoUrl || branding?.brandName) && (
              <section className={cn(CARD_SURFACE_CLASS, 'p-4 sm:p-5')}>
                <SectionLabel className="mb-3 block">Branding</SectionLabel>
                <div className="flex items-center gap-3">
                  {logoUrl && (
                    <img
                      src={logoUrl}
                      alt=""
                      className="h-12 w-12 rounded object-contain border border-surface-border bg-white"
                    />
                  )}
                  <p className="text-body-sm text-content-primary">
                    {branding?.brandName || 'Custom branding'}
                  </p>
                </div>
              </section>
            )}
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
      <dd className="max-w-[60%] text-right text-body-sm font-medium text-content-primary">
        {value}
      </dd>
    </div>
  );
}
