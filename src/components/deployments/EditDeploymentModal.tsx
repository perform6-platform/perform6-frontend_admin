import { useEffect, useMemo, useState } from 'react';
import { Button, Dropdown, Input, Modal, ModalBody, SectionLabel } from '../ui';
import {
  useCategoryVariants,
  useDeployment,
  useUpdateDeployment,
} from '../../hooks/useDeployments';
import { useCategories } from '../../hooks/useCategories';
import { useToast } from '../../context/ToastContext';
import { DEFAULT_DEPLOYMENT_SCREENS } from '../../lib/screenCategoryDefaults';
import { getApiErrorMessage } from '../../services/axios';
import type {
  BrandingMode,
  DeploymentEntity,
  UpdateDeploymentPayload,
} from '../../types/deployments';

export interface EditDeploymentModalProps {
  open: boolean;
  deployment: DeploymentEntity | null;
  onClose: () => void;
  onSaved?: () => void;
}

const brandingOptions = [
  { value: 'PLATFORM_DEFAULT', label: 'Platform default' },
  { value: 'CUSTOM', label: 'Custom' },
  { value: 'NONE', label: 'None' },
];

function isDefaultDeployment(type: string | undefined): boolean {
  return (type ?? '').toUpperCase().includes('DEFAULT');
}

export function EditDeploymentModal({
  open,
  deployment,
  onClose,
  onSaved,
}: EditDeploymentModalProps) {
  const { showToast } = useToast();
  const { mutateAsync: updateDeployment, isPending } = useUpdateDeployment();
  const { data: detail } = useDeployment(open && deployment ? deployment.id : null);
  const { data: contentCategories = [] } = useCategories();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fieldCategory, setFieldCategory] = useState('');
  const [exerciseVariant, setExerciseVariant] = useState('');
  const [brandingMode, setBrandingMode] = useState<BrandingMode>('PLATFORM_DEFAULT');
  const [brandingId, setBrandingId] = useState('');
  const [screenCategories, setScreenCategories] = useState<Record<string, string>>({});

  const source = detail ?? deployment;
  const showScreenEditor = isDefaultDeployment(source?.deploymentType);

  const { data: variants = [] } = useCategoryVariants(fieldCategory || null);

  const categoryOptions = useMemo(
    () =>
      contentCategories.map((category) => ({
        value: category.id,
        label: `${category.name}${category.isSystem ? '' : ' (custom)'}`,
      })),
    [contentCategories],
  );

  useEffect(() => {
    if (!source || !open) return;
    setName(source.name ?? '');
    setDescription(
      typeof source.description === 'string' ? source.description : '',
    );
    setFieldCategory(source.fieldCategory ?? '');
    setExerciseVariant(source.exerciseVariant ?? '');
    const mode = source.config?.brandingMode;
    setBrandingMode(
      mode === 'CUSTOM' || mode === 'NONE' || mode === 'PLATFORM_DEFAULT'
        ? mode
        : 'PLATFORM_DEFAULT',
    );
    const linkedBrandingId = source.branding?.[0]?.id;
    setBrandingId(typeof linkedBrandingId === 'string' ? linkedBrandingId : '');

    const screens =
      source.screens ??
      source.screenAssignments?.map((assignment) => ({
        screenKey: assignment.screenKey,
        categoryId: assignment.categoryId ?? assignment.category?.id ?? null,
      })) ??
      [];

    const nextScreens: Record<string, string> = {
      SCREEN_1: '',
      SCREEN_2: '',
      SCREEN_3: '',
    };
    for (const screen of screens) {
      if (screen.screenKey && screen.categoryId) {
        nextScreens[screen.screenKey] = screen.categoryId;
      }
    }
    setScreenCategories(nextScreens);
  }, [source, open]);

  async function handleSave() {
    if (!deployment) return;

    const payload: UpdateDeploymentPayload = {
      name: name.trim() || undefined,
      description: description.trim() || undefined,
      fieldCategory: fieldCategory || undefined,
      exerciseVariant: exerciseVariant || undefined,
      brandingMode,
      brandingId:
        brandingMode === 'CUSTOM' && brandingId.trim()
          ? brandingId.trim()
          : undefined,
    };

    if (showScreenEditor) {
      const picks = DEFAULT_DEPLOYMENT_SCREENS.filter((screen) =>
        Boolean(screenCategories[screen.screenKey]),
      ).map((screen) => ({
        screenKey: screen.screenKey,
        categoryId: screenCategories[screen.screenKey]!,
      }));
      if (picks.length === DEFAULT_DEPLOYMENT_SCREENS.length) {
        payload.screenCategories = picks;
      }
    }

    try {
      await updateDeployment({ id: deployment.id, payload });
      showToast({
        title: 'Deployment updated',
        message: 'Changes apply on the next device sync.',
        variant: 'success',
      });
      onSaved?.();
    } catch (error) {
      showToast({
        title: getApiErrorMessage(error, 'Failed to update deployment'),
        variant: 'error',
      });
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit deployment"
      description="Update field, variant, branding, screens, or display name."
      size="lg"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 px-4"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-9 px-4"
            onClick={() => void handleSave()}
            disabled={isPending || !fieldCategory || !exerciseVariant}
          >
            {isPending ? 'Saving…' : 'Save changes'}
          </Button>
        </>
      }
    >
      <ModalBody>
        <div className="space-y-4">
          <Input
            label="Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Deployment name"
          />
          <Input
            label="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Optional notes"
          />

          <div>
            <label className="mb-1 block text-xs font-medium text-content-muted">
              Field category
            </label>
            <Dropdown
              fullWidth
              value={fieldCategory}
              onChange={(value) => {
                setFieldCategory(value);
                setExerciseVariant('');
              }}
              options={[
                { value: 'FITNESS', label: 'Fitness' },
                { value: 'GOLF', label: 'Golf' },
              ]}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-content-muted">
              Exercise variant
            </label>
            <Dropdown
              fullWidth
              value={exerciseVariant}
              onChange={setExerciseVariant}
              options={variants.map((variant) => ({
                value: String(variant.value ?? variant.id),
                label: variant.label,
              }))}
              disabled={!fieldCategory}
              placeholder={fieldCategory ? 'Select variant' : 'Select field first'}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-content-muted">
              Branding mode
            </label>
            <Dropdown
              fullWidth
              value={brandingMode}
              onChange={(value) => setBrandingMode(value as BrandingMode)}
              options={brandingOptions}
            />
          </div>

          {brandingMode === 'CUSTOM' && (
            <Input
              label="Branding ID"
              value={brandingId}
              onChange={(event) => setBrandingId(event.target.value)}
              placeholder="UUID from branding upload"
            />
          )}

          {showScreenEditor && (
            <div className="space-y-3 rounded-lg border border-surface-border p-3">
              <SectionLabel className="block">Screen content</SectionLabel>
              <p className="text-caption text-content-secondary">
                Change which parent category plays on each screen.
              </p>
              {DEFAULT_DEPLOYMENT_SCREENS.map((screen) => (
                <div key={screen.screenKey}>
                  <p className="mb-1 text-xs font-medium text-content-muted">
                    {screen.label}
                  </p>
                  <Dropdown
                    options={[
                      { value: '', label: 'Select category…' },
                      ...categoryOptions,
                    ]}
                    value={screenCategories[screen.screenKey] ?? ''}
                    onChange={(value) =>
                      setScreenCategories((current) => ({
                        ...current,
                        [screen.screenKey]: value,
                      }))
                    }
                    fullWidth
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </ModalBody>
    </Modal>
  );
}
