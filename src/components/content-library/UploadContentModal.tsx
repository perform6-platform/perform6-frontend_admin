import { useEffect, useState } from 'react';
import type { ContentCategoryId } from '../../constants/contentLibrary';
import { getFullCategoryLabel } from '../../constants/contentPlayback';
import { Button, Modal, ModalBody } from '../ui';
import {
  UploadContentForm,
  type UploadContentPayload,
} from './UploadContentForm';

const UPLOAD_FORM_ID = 'upload-content-modal-form';

export interface UploadContentModalProps {
  open: boolean;
  defaultCategoryId?: ContentCategoryId;
  onClose: () => void;
  onSubmit?: (payload: UploadContentPayload) => void | Promise<void>;
}

export function UploadContentModal({
  open,
  defaultCategoryId = 'default-fitness',
  onClose,
  onSubmit,
}: UploadContentModalProps) {
  const [canSubmit, setCanSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const categoryLabel = getFullCategoryLabel(defaultCategoryId);

  useEffect(() => {
    if (!open) {
      setCanSubmit(false);
      setIsSubmitting(false);
    }
  }, [open]);

  async function handleSubmit(payload: UploadContentPayload) {
    await onSubmit?.(payload);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Upload video"
      description={`Upload to ${categoryLabel}`}
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 px-4"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form={UPLOAD_FORM_ID}
            size="sm"
            className="h-9 px-4"
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? 'Uploading…' : 'Upload video'}
          </Button>
        </>
      }
    >
      <ModalBody>
        {open && (
          <UploadContentForm
            key={defaultCategoryId}
            categoryId={defaultCategoryId}
            embedded
            formId={UPLOAD_FORM_ID}
            onCancel={onClose}
            onSubmit={handleSubmit}
            onReadyChange={setCanSubmit}
            onSubmittingChange={setIsSubmitting}
          />
        )}
      </ModalBody>
    </Modal>
  );
}

export {
  UploadContentForm,
  buildContentItemFromUpload,
  type UploadContentPayload,
} from './UploadContentForm';
