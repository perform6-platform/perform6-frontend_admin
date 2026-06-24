import { format } from 'date-fns';
import { Upload } from 'lucide-react';
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import type { ContentCategoryId, ContentItem } from '../../constants/contentLibrary';
import { defaultContentThumbnail } from '../../constants/contentLibrary';
import { getFullCategoryLabel, getUploadCategoryInfo, ROTATION_DAYS } from '../../constants/contentPlayback';
import { cn } from '../../lib/cn';
import { Button, Input } from '../ui';
import { CARD_SURFACE_CLASS } from '../ui/cardStyles';

const defaultThumbnail = defaultContentThumbnail;
const acceptedVideoTypes = 'video/mp4,video/webm,video/quicktime,.mp4,.mov,.webm';

export interface UploadContentPayload {
  title: string;
  categoryId: ContentCategoryId;
  rotationDay?: number;
  file: File;
}

export interface UploadContentFormProps {
  categoryId: ContentCategoryId;
  onCancel: () => void;
  onSubmit?: (payload: UploadContentPayload) => void | Promise<void>;
  embedded?: boolean;
  formId?: string;
  onReadyChange?: (ready: boolean) => void;
  onSubmittingChange?: (submitting: boolean) => void;
}

function formatVideoDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function getFileExtension(name: string): string {
  return name.split('.').pop()?.toUpperCase() ?? 'MP4';
}

function inferRotationDayFromTitle(title: string): number {
  const dayPaddedMatch = title.match(/(?:^|_)(\d{2})(?:_|\.)/);
  if (dayPaddedMatch) {
    const day = Number.parseInt(dayPaddedMatch[1]!, 10);
    if (day >= 1 && day <= ROTATION_DAYS) return day;
  }

  const dayMatch = title.toUpperCase().match(/DAY\s*(\d+)/);
  if (dayMatch) {
    const day = Number.parseInt(dayMatch[1]!, 10);
    if (day >= 1 && day <= ROTATION_DAYS) return day;
  }

  return 1;
}

async function readVideoMetadata(file: File): Promise<{ duration?: string; thumbnailUrl: string }> {
  const objectUrl = URL.createObjectURL(file);

  try {
    return await new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;

      video.onloadedmetadata = () => {
        const duration = formatVideoDuration(video.duration);
        video.currentTime = Math.min(0.5, video.duration > 0 ? video.duration / 3 : 0);
        video.onseeked = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth || 480;
            canvas.height = video.videoHeight || 270;
            canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
            resolve({ duration, thumbnailUrl: canvas.toDataURL('image/jpeg', 0.82) });
          } catch {
            resolve({ duration, thumbnailUrl: defaultThumbnail });
          }
        };
      };

      video.onerror = () => resolve({ thumbnailUrl: defaultThumbnail });
      video.src = objectUrl;
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function buildContentItemFromUpload(
  payload: UploadContentPayload,
  id: string,
): Promise<ContentItem> {
  const metadata = await readVideoMetadata(payload.file);

  return {
    id,
    title: payload.title.trim() || payload.file.name,
    mediaType: 'video',
    categoryId: payload.categoryId,
    rotationDay: payload.rotationDay,
    duration: metadata.duration,
    dateLabel: format(new Date(), 'd MMM yyyy'),
    format: getFileExtension(payload.file.name),
    thumbnailUrl: metadata.thumbnailUrl,
    videoUrl: URL.createObjectURL(payload.file),
  };
}

export function UploadContentForm({
  categoryId,
  onCancel,
  onSubmit,
  embedded = false,
  formId = 'upload-content-form',
  onReadyChange,
  onSubmittingChange,
}: UploadContentFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categoryInfo = getUploadCategoryInfo(categoryId, 1);
  const categoryLabel = getFullCategoryLabel(categoryId);

  useEffect(() => {
    setTitle('');
    setFile(null);
    setIsSubmitting(false);
    onReadyChange?.(false);
    onSubmittingChange?.(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [categoryId, onReadyChange, onSubmittingChange]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
    onReadyChange?.(Boolean(selected));
    if (selected && !title.trim()) {
      setTitle(selected.name.replace(/\.[^.]+$/, ''));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) return;

    const uploadTitle = title.trim() || file.name;
    const parsedDay = inferRotationDayFromTitle(uploadTitle);
    setIsSubmitting(true);
    onSubmittingChange?.(true);
    try {
      await onSubmit?.({
        title: uploadTitle,
        categoryId,
        rotationDay: categoryInfo.usesRotation ? parsedDay : undefined,
        file,
      });
      setTitle('');
      setFile(null);
      onReadyChange?.(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } finally {
      setIsSubmitting(false);
      onSubmittingChange?.(false);
    }
  }

  return (
    <form
      id={formId}
      onSubmit={handleSubmit}
      className={cn(
        'space-y-4',
        !embedded && cn(CARD_SURFACE_CLASS, 'mb-4 border-brand-200/60 p-4 sm:p-5 dark:border-brand-600/30'),
      )}
    >
      {!embedded && (
        <div>
          <p className="text-body-sm font-medium text-content-primary">Upload to {categoryLabel}</p>
          <p className="mt-0.5 text-caption text-content-secondary">
            Add a title and video file for this category.
          </p>
        </div>
      )}

      <Input
        label="Title"
        placeholder="Video title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        required
      />

      <div>
        <label className="mb-1 block text-xs font-medium text-content-muted">Video file</label>
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedVideoTypes}
          onChange={handleFileChange}
          className="sr-only"
          id={`upload-content-file-${categoryId}`}
          required
        />
        <label
          htmlFor={`upload-content-file-${categoryId}`}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed',
            'border-surface-border bg-surface-muted px-4 py-8 text-center transition-colors',
            'hover:border-brand-500/40 hover:bg-brand-50/30 dark:hover:bg-brand-600/10',
          )}
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-600/10 text-brand-600 dark:text-brand-400">
            <Upload className="h-5 w-5" />
          </span>
          <span className="text-body-sm font-medium text-content-primary">
            {file ? file.name : 'Choose a video file'}
          </span>
          <span className="text-caption text-content-muted">MP4, MOV, or WebM</span>
        </label>
      </div>

      {!embedded && (
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" size="sm" className="h-9 px-4" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" size="sm" className="h-9 px-4" disabled={!file || isSubmitting}>
            {isSubmitting ? 'Uploading…' : 'Upload video'}
          </Button>
        </div>
      )}
    </form>
  );
}
