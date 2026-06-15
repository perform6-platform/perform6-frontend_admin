import { format } from 'date-fns';
import { Info, Upload } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import type { ContentCategoryId, ContentItem } from '../../constants/contentLibrary';
import { defaultContentThumbnail } from '../../constants/contentLibrary';
import {
  contentCategoryGroups,
  getUploadCategoryInfo,
  ROTATION_DAYS,
  uploadPlaybackTypeOptions,
  type PlaybackCategoryId,
} from '../../constants/contentPlayback';
import { cn } from '../../lib/cn';
import { Button, Dropdown, Input, Modal, ModalBody } from '../ui';

const rotationDayOptions = Array.from({ length: ROTATION_DAYS }, (_, index) => {
  const day = index + 1;
  return { value: String(day), label: `Day ${day}` };
});

const defaultThumbnail = defaultContentThumbnail;

const acceptedVideoTypes = 'video/mp4,video/webm,video/quicktime,.mp4,.mov,.webm';

export interface UploadContentPayload {
  title: string;
  categoryId: ContentCategoryId;
  rotationDay?: number;
  file: File;
}

export interface UploadContentModalProps {
  open: boolean;
  defaultCategoryId?: ContentCategoryId;
  onClose: () => void;
  onSubmit?: (payload: UploadContentPayload) => void | Promise<void>;
}

function getPlaybackTypeForCategory(categoryId: ContentCategoryId): PlaybackCategoryId {
  const group = contentCategoryGroups.find((entry) =>
    entry.children.some((child) => child.id === categoryId),
  );
  return group?.playbackCategory ?? 'default';
}

function getSubCategoryForCategory(categoryId: ContentCategoryId): ContentCategoryId {
  const group = contentCategoryGroups.find((entry) =>
    entry.children.some((child) => child.id === categoryId),
  );
  return group?.children.find((child) => child.id === categoryId)?.id ?? categoryId;
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

export function UploadContentModal({
  open,
  defaultCategoryId = 'default-fitness',
  onClose,
  onSubmit,
}: UploadContentModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [playbackType, setPlaybackType] = useState<PlaybackCategoryId>(
    getPlaybackTypeForCategory(defaultCategoryId),
  );
  const [subCategoryId, setSubCategoryId] = useState<ContentCategoryId>(
    getSubCategoryForCategory(defaultCategoryId),
  );
  const [rotationDay, setRotationDay] = useState('14');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [titleTouched, setTitleTouched] = useState(false);

  const activeGroup = contentCategoryGroups.find((group) => group.playbackCategory === playbackType);
  const subCategoryOptions = useMemo(
    () =>
      (activeGroup?.children ?? []).map((child) => ({
        value: child.id,
        label: child.label,
      })),
    [activeGroup],
  );

  const categoryId = subCategoryId;
  const categoryInfo = getUploadCategoryInfo(categoryId, Number.parseInt(rotationDay, 10) || 1);
  const showSubCategory = (activeGroup?.children.length ?? 0) > 1;

  useEffect(() => {
    if (!open) return;
    const initialPlayback = getPlaybackTypeForCategory(defaultCategoryId);
    const initialSub = getSubCategoryForCategory(defaultCategoryId);
    setPlaybackType(initialPlayback);
    setSubCategoryId(initialSub);
    setRotationDay('14');
    setTitle('');
    setFile(null);
    setTitleTouched(false);
    setIsSubmitting(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [open, defaultCategoryId]);

  useEffect(() => {
    const group = contentCategoryGroups.find((entry) => entry.playbackCategory === playbackType);
    if (!group) return;
    const stillValid = group.children.some((child) => child.id === subCategoryId);
    if (!stillValid) {
      setSubCategoryId(group.children[0]!.id);
    }
  }, [playbackType, subCategoryId]);

  useEffect(() => {
    if (titleTouched) return;
    setTitle(categoryInfo.suggestedTitle.replace(/\.mp4$/i, ''));
  }, [categoryInfo.suggestedTitle, titleTouched]);

  function resetForm() {
    setTitle('');
    setPlaybackType(getPlaybackTypeForCategory(defaultCategoryId));
    setSubCategoryId(getSubCategoryForCategory(defaultCategoryId));
    setRotationDay('14');
    setFile(null);
    setTitleTouched(false);
    setIsSubmitting(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
    if (selected && !titleTouched) {
      setTitle(selected.name.replace(/\.[^.]+$/, ''));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) return;

    const parsedDay = Number.parseInt(rotationDay, 10);
    setIsSubmitting(true);
    try {
      await onSubmit?.({
        title: title.trim() || file.name,
        categoryId,
        rotationDay: categoryInfo.usesRotation ? parsedDay : undefined,
        file,
      });
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Upload video"
      description="First choose the playback type — Default, Start Here, or a rotation day video."
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 px-4"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="upload-content-form"
            size="sm"
            className="h-9 px-4"
            disabled={!file || isSubmitting}
          >
            {isSubmitting ? 'Uploading…' : 'Upload video'}
          </Button>
        </>
      }
    >
      <ModalBody>
        <form id="upload-content-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-content-muted">
              Playback type
            </label>
            <Dropdown
              options={uploadPlaybackTypeOptions.map((option) => ({
                value: option.value,
                label: `${option.label} — ${option.hint}`,
              }))}
              value={playbackType}
              onChange={(value) => setPlaybackType(value as PlaybackCategoryId)}
              fullWidth
            />
            <p className="mt-1.5 text-caption text-content-muted">
              Choose idle (Default), intro (Start Here), or daily rotation (Phase 1 / 2 / Full Program).
            </p>
          </div>

          {showSubCategory && (
            <div>
              <label className="mb-1 block text-xs font-medium text-content-muted">
                {playbackType === 'phase-1' ? 'Phase 1 track' : 'Track'}
              </label>
              <Dropdown
                options={subCategoryOptions}
                value={subCategoryId}
                onChange={(value) => setSubCategoryId(value as ContentCategoryId)}
                fullWidth
              />
            </div>
          )}

          {categoryInfo.usesRotation && (
            <div>
              <label className="mb-1 block text-xs font-medium text-content-muted">
                Rotation day (1–{ROTATION_DAYS})
              </label>
              <Dropdown
                options={rotationDayOptions}
                value={rotationDay}
                onChange={setRotationDay}
                fullWidth
              />
            </div>
          )}

          <div
            className={cn(
              'rounded-lg border border-brand-500/20 bg-brand-50/50 p-3 dark:bg-brand-600/10',
            )}
          >
            <div className="flex gap-2">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400" />
              <div className="min-w-0 space-y-1">
                <p className="text-body-sm font-semibold text-content-primary">
                  {categoryInfo.fullLabel}
                  <span className="ml-2 font-normal text-content-secondary">
                    ({categoryInfo.typeSummary})
                  </span>
                </p>
                <p className="text-caption text-content-secondary">{categoryInfo.rule.behavior}</p>
                <p className="text-caption text-content-muted">
                  Suggested filename:{' '}
                  <code className="rounded bg-surface-muted px-1 py-0.5 font-mono text-[11px]">
                    {categoryInfo.suggestedTitle}
                  </code>
                </p>
              </div>
            </div>
          </div>

          <Input
            label="Title"
            placeholder={categoryInfo.suggestedTitle}
            value={title}
            onChange={(event) => {
              setTitleTouched(true);
              setTitle(event.target.value);
            }}
          />

          <div>
            <label className="mb-1 block text-xs font-medium text-content-muted">Video file</label>
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedVideoTypes}
              onChange={handleFileChange}
              className="sr-only"
              id="upload-content-file"
              required
            />
            <label
              htmlFor="upload-content-file"
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
        </form>
      </ModalBody>
    </Modal>
  );
}
