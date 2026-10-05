import { Film, Image as ImageIcon, UploadCloud, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/IconButton';
import { Toggle } from '../../components/ui/Toggle';
import type { CategoryRow } from '../../types/database';
import { deleteThumbnailAsset, publicThumbnailUrl, uploadThumbnailAsset } from './adminApi';
import type { AdminRow } from './useAdminCatalog';

export interface AnimationMetaPatch {
  slug: string;
  display_name: string;
  category: string | null;
  is_new: boolean;
  is_published: boolean;
  description_override: string | null;
  thumbnail_video_path?: string | null;
  poster_path?: string | null;
}

interface EditDrawerProps {
  row: AdminRow;
  categories?: CategoryRow[];
  onClose: () => void;
  onSave: (patch: AnimationMetaPatch) => Promise<void>;
}

export function EditDrawer({ row, onClose, onSave }: EditDrawerProps) {
  const [isPublished, setIsPublished] = useState(row.isPublished);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const existingVideoUrl = publicThumbnailUrl(row.thumbnailVideoPath);
  const existingImageUrl = publicThumbnailUrl(row.posterPath);

  // Clean up object URLs on unmount or change
  useEffect(() => {
    return () => {
      if (videoPreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(videoPreviewUrl);
      if (imagePreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [videoPreviewUrl, imagePreviewUrl]);

  function handleVideoChange(file: File | null) {
    if (imagePreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(imagePreviewUrl);
    if (videoPreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(videoPreviewUrl);
    setImageFile(null);
    setImagePreviewUrl(null);
    setVideoFile(file);
    setVideoPreviewUrl(file ? URL.createObjectURL(file) : null);
  }

  function handleImageChange(file: File | null) {
    if (videoPreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(videoPreviewUrl);
    if (imagePreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(imagePreviewUrl);
    setVideoFile(null);
    setVideoPreviewUrl(null);
    setImageFile(file);
    setImagePreviewUrl(file ? URL.createObjectURL(file) : null);
  }

  async function handleSubmit() {
    setIsSaving(true);
    try {
      let thumbnailPath: string | null | undefined = undefined;
      let posterPath: string | null | undefined = undefined;

      if (imageFile) {
        posterPath = await uploadThumbnailAsset(row.slug, imageFile, row.posterPath);
        thumbnailPath = null;
        if (row.thumbnailVideoPath) {
          await deleteThumbnailAsset(row.thumbnailVideoPath);
        }
      } else if (videoFile) {
        thumbnailPath = await uploadThumbnailAsset(row.slug, videoFile, row.thumbnailVideoPath);
        posterPath = null;
        if (row.posterPath) {
          await deleteThumbnailAsset(row.posterPath);
        }
      }

      await onSave({
        slug: row.slug,
        display_name: row.displayName,
        category: row.category,
        is_new: row.isNew,
        is_published: isPublished,
        description_override: row.descriptionOverride,
        ...(thumbnailPath !== undefined ? { thumbnail_video_path: thumbnailPath } : {}),
        ...(posterPath !== undefined ? { poster_path: posterPath } : {}),
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50">
      <div className="flex h-full w-full max-w-md flex-col border-l border-border bg-panel">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-[14px] font-semibold text-text">Edit {row.displayName || row.slug}</h2>
          <IconButton aria-label="Close" onClick={onClose}>
            <X size={16} />
          </IconButton>
        </div>

        <div className="scrollbar-thin flex-1 overflow-y-auto p-4">
          <div className="flex flex-col gap-4">
            {/* 1. Preview Box */}
            <div className="relative aspect-video w-full overflow-hidden rounded-md border border-border bg-raised">
              {imagePreviewUrl ? (
                <img
                  key={imagePreviewUrl}
                  src={imagePreviewUrl}
                  alt={row.displayName}
                  className="h-full w-full object-cover"
                />
              ) : videoPreviewUrl ? (
                <video
                  key={videoPreviewUrl}
                  src={videoPreviewUrl}
                  muted
                  loop
                  autoPlay
                  playsInline
                  className="h-full w-full object-cover"
                />
              ) : !videoFile && existingImageUrl ? (
                <img
                  key={existingImageUrl}
                  src={existingImageUrl}
                  alt={row.displayName}
                  className="h-full w-full object-cover"
                />
              ) : !imageFile && existingVideoUrl ? (
                <video
                  key={existingVideoUrl}
                  src={existingVideoUrl}
                  muted
                  loop
                  autoPlay
                  playsInline
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-muted">
                  <UploadCloud size={24} className="opacity-40" />
                  <span className="text-[12px]">No media selected</span>
                </div>
              )}
            </div>

            {/* 2. Image upload */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[12px] font-medium text-muted">Image upload</span>
              <label className="flex cursor-pointer items-center justify-between gap-2 rounded-md border border-border bg-raised px-3 py-2 text-[13px] text-text transition-colors hover:border-accent">
                <div className="flex min-w-0 items-center gap-2">
                  <ImageIcon size={16} className="shrink-0 text-muted" />
                  <span className="truncate text-[12px] text-text">
                    {imageFile
                      ? imageFile.name
                      : !videoFile && existingImageUrl
                        ? 'Current image'
                        : 'Choose an image file…'}
                  </span>
                </div>
                <span className="shrink-0 rounded bg-border px-2 py-0.5 text-[11px] text-muted">
                  Browse
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
                  className="hidden"
                />
              </label>
            </div>

            {/* 3. Video upload */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[12px] font-medium text-muted">Video upload</span>
              <label className="flex cursor-pointer items-center justify-between gap-2 rounded-md border border-border bg-raised px-3 py-2 text-[13px] text-text transition-colors hover:border-accent">
                <div className="flex min-w-0 items-center gap-2">
                  <Film size={16} className="shrink-0 text-muted" />
                  <span className="truncate text-[12px] text-text">
                    {videoFile
                      ? videoFile.name
                      : !imageFile && existingVideoUrl
                        ? 'Current video'
                        : 'Choose a video file…'}
                  </span>
                </div>
                <span className="shrink-0 rounded bg-border px-2 py-0.5 text-[11px] text-muted">
                  Browse
                </span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleVideoChange(e.target.files?.[0] ?? null)}
                  className="hidden"
                />
              </label>
            </div>

            {/* 4. Published toggle */}
            <div className="pt-2">
              <Toggle
                label={isPublished ? 'Published' : 'Unpublished'}
                checked={isPublished}
                onChange={setIsPublished}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border px-4 py-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" disabled={isSaving} onClick={() => void handleSubmit()}>
            {isSaving ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

