import { useEffect, useState } from 'react';
import { Button, Dropdown, Input, Modal, ModalBody } from '../ui';
import { useCategoryVariants, useUpdateDeployment } from '../../hooks/useDeployments';
import { useToast } from '../../context/ToastContext';
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

export function EditDeploymentModal({
  open,
  deployment,
  onClose,
  onSaved,
}: EditDeploymentModalProps) {
  const { showToast } = useToast();
  const { mutateAsync: updateDeployment, isPending } = useUpdateDeployment();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fieldCategory, setFieldCategory] = useState('');
  const [exerciseVariant, setExerciseVariant] = useState('');
  const [brandingMode, setBrandingMode] = useState<BrandingMode>('PLATFORM_DEFAULT');
  const [brandingId, setBrandingId] = useState('');

  const { data: variants = [] } = useCategoryVariants(fieldCategory || null);

  useEffect(() => {
    if (!deployment || !open) return;
    setName(deployment.name ?? '');
    setDescription(
      typeof deployment.description === 'string' ? deployment.description : '',
    );
    setFieldCategory(deployment.fieldCategory ?? '');
    setExerciseVariant(deployment.exerciseVariant ?? '');
    const mode = deployment.config?.brandingMode;
    setBrandingMode(
      mode === 'CUSTOM' || mode === 'NONE' || mode === 'PLATFORM_DEFAULT'
        ? mode
        : 'PLATFORM_DEFAULT',
    );
    setBrandingId('');
  }, [deployment, open]);

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

    try {
      await updateDeployment({ id: deployment.id, payload });
      showToast({
        title: 'Deployment updated',
        message: 'Changes will apply on the next device sync.',
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
      description="Update field, variant, branding, or display name."
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
        </div>
      </ModalBody>
    </Modal>
  );
}
