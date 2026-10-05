import { Film, GripVertical, Image as ImageIcon, Pencil, Plus, UploadCloud } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { AvatarMenu } from '../features/auth/AvatarMenu';
import { EditDrawer, type AnimationMetaPatch } from '../features/admin/EditDrawer';
import { publicThumbnailUrl, uploadThumbnailAsset, upsertAnimationMeta } from '../features/admin/adminApi';
import { useAdminCatalog, type AdminRow } from '../features/admin/useAdminCatalog';
import { initialsFor, refreshCatalog } from '../features/editor/animationCatalog';
import { Button } from '../components/ui/Button';
import { Dialog } from '../components/ui/Dialog';
import { Pill } from '../components/ui/Pill';
import { Select } from '../components/ui/Select';
import { Spinner } from '../components/ui/Spinner';
import { Toggle } from '../components/ui/Toggle';
import { toastError, toastSuccess } from '../lib/toastStore';
import type { CategoryRow } from '../types/database';

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function AdminThumbnail({
  posterPath,
  videoPath,
  name,
}: {
  posterPath: string | null;
  videoPath: string | null;
  name: string;
}) {
  const [imgError, setImgError] = useState(false);
  const [vidError, setVidError] = useState(false);
  const posterUrl = publicThumbnailUrl(posterPath);
  const videoUrl = publicThumbnailUrl(videoPath);

  useEffect(() => {
    setImgError(false);
  }, [posterPath]);

  useEffect(() => {
    setVidError(false);
  }, [videoPath]);

  if (posterUrl && !imgError) {
    return (
      <img
        src={posterUrl}
        alt=""
        onError={() => setImgError(true)}
        className="h-full w-full object-cover"
      />
    );
  }
  if (videoUrl && !vidError) {
    return (
      <video
        src={videoUrl}
        muted
        loop
        autoPlay
        playsInline
        onError={() => setVidError(true)}
        className="h-full w-full object-cover"
      />
    );
  }
  return (
    <span className="text-[11px] font-semibold text-muted">
      {initialsFor(name)}
    </span>
  );
}

interface AddAnimationDialogProps {
  open: boolean;
  onClose: () => void;
  categories: CategoryRow[];
  existingSlugs: Set<string>;
  onCreated: () => Promise<void>;
}

function AddAnimationDialog({
  open,
  onClose,
  categories,
  existingSlugs,
  onCreated,
}: AddAnimationDialogProps) {
  const [displayName, setDisplayName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugCustomized, setSlugCustomized] = useState(false);
  const [category, setCategory] = useState(categories[0]?.slug ?? '');
  const [isPublished, setIsPublished] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!slugCustomized) {
      setSlug(slugify(displayName));
    }
  }, [displayName, slugCustomized]);

  useEffect(() => {
    if (categories.length > 0 && !category) {
      setCategory(categories[0]!.slug);
    }
  }, [categories, category]);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(imagePreviewUrl);
      if (videoPreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(videoPreviewUrl);
    };
  }, [imagePreviewUrl, videoPreviewUrl]);

  function handleImageChange(file: File | null) {
    if (videoPreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(videoPreviewUrl);
    if (imagePreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(imagePreviewUrl);
    setVideoFile(null);
    setVideoPreviewUrl(null);
    setImageFile(file);
    setImagePreviewUrl(file ? URL.createObjectURL(file) : null);
  }

  function handleVideoChange(file: File | null) {
    if (imagePreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(imagePreviewUrl);
    if (videoPreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(videoPreviewUrl);
    setImageFile(null);
    setImagePreviewUrl(null);
    setVideoFile(file);
    setVideoPreviewUrl(file ? URL.createObjectURL(file) : null);
  }

  async function handleAddSubmit() {
    const trimmedName = displayName.trim();
    const finalSlug = slug.trim();

    if (!trimmedName) {
      toastError('Please enter an animation name.');
      return;
    }
    if (!finalSlug) {
      toastError('Please enter a valid slug.');
      return;
    }
    if (existingSlugs.has(finalSlug)) {
      toastError('An animation with this slug already exists.');
      return;
    }

    setIsSaving(true);
    try {
      let posterPath: string | null = null;
      let thumbnailVideoPath: string | null = null;

      if (imageFile) {
        posterPath = await uploadThumbnailAsset(finalSlug, imageFile, null);
      } else if (videoFile) {
        thumbnailVideoPath = await uploadThumbnailAsset(finalSlug, videoFile, null);
      }

      await upsertAnimationMeta({
        slug: finalSlug,
        display_name: trimmedName,
        category: category || null,
        is_new: true,
        is_published: isPublished,
        poster_path: posterPath,
        thumbnail_video_path: thumbnailVideoPath,
        sort_order: 0,
      });

      toastSuccess('Animation added.');
      await onCreated();
      onClose();
    } catch {
      toastError('Could not create animation.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="Add New Animation">
      <div className="flex flex-col gap-4">
        {/* Preview box */}
        <div className="relative aspect-video w-full overflow-hidden rounded-md border border-border bg-raised">
          {imagePreviewUrl ? (
            <img src={imagePreviewUrl} alt="Preview" className="h-full w-full object-cover" />
          ) : videoPreviewUrl ? (
            <video
              src={videoPreviewUrl}
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

        {/* Display name */}
        <label className="flex flex-col gap-1">
          <span className="text-[12px] text-muted">Animation name</span>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. Glowing Sphere"
            className="rounded-md border border-border bg-raised px-2.5 py-1.5 text-[13px] text-text focus-visible:outline-none"
          />
        </label>

        {/* Slug */}
        <label className="flex flex-col gap-1">
          <span className="text-[12px] text-muted">Slug</span>
          <input
            value={slug}
            onChange={(e) => {
              setSlugCustomized(true);
              setSlug(e.target.value);
            }}
            placeholder="e.g. glowing-sphere"
            className="rounded-md border border-border bg-raised px-2.5 py-1.5 text-[13px] text-text focus-visible:outline-none"
          />
        </label>

        {/* Category */}
        {categories.length > 0 && (
          <Select
            label="Category"
            value={category}
            onChange={setCategory}
            options={categories.map((c) => ({ label: c.name, value: c.slug }))}
          />
        )}

        {/* Image upload */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[12px] font-medium text-muted">Image upload</span>
          <label className="flex cursor-pointer items-center justify-between gap-2 rounded-md border border-border bg-raised px-3 py-2 text-[13px] text-text transition-colors hover:border-accent">
            <div className="flex min-w-0 items-center gap-2">
              <ImageIcon size={16} className="shrink-0 text-muted" />
              <span className="truncate text-[12px] text-text">
                {imageFile ? imageFile.name : 'Choose an image file…'}
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

        {/* Video upload */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[12px] font-medium text-muted">Video upload</span>
          <label className="flex cursor-pointer items-center justify-between gap-2 rounded-md border border-border bg-raised px-3 py-2 text-[13px] text-text transition-colors hover:border-accent">
            <div className="flex min-w-0 items-center gap-2">
              <Film size={16} className="shrink-0 text-muted" />
              <span className="truncate text-[12px] text-text">
                {videoFile ? videoFile.name : 'Choose a video file…'}
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

        {/* Published toggle */}
        <Toggle
          label={isPublished ? 'Published' : 'Unpublished'}
          checked={isPublished}
          onChange={setIsPublished}
        />

        <div className="mt-2 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={isSaving || !displayName.trim() || !slug.trim()}
            onClick={() => void handleAddSubmit()}
          >
            {isSaving ? 'Adding…' : 'Add animation'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

export default function AdminPage() {
  const { rows, categories, isLoading, error, refetch } = useAdminCatalog();
  const [localRows, setLocalRows] = useState<AdminRow[] | null>(null);
  const [localCategories, setLocalCategories] = useState<CategoryRow[] | null>(null);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [dragSlug, setDragSlug] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    setLocalRows(null);
  }, [rows]);

  useEffect(() => {
    setLocalCategories(null);
  }, [categories]);

  const effectiveRows = localRows ?? rows;
  const effectiveCategories = localCategories ?? categories;

  const existingSlugs = useMemo(
    () => new Set(effectiveRows.map((r) => r.slug)),
    [effectiveRows],
  );

  const grouped = useMemo(() => {
    const byCategory = new Map<string, AdminRow[]>();
    for (const row of effectiveRows) {
      if (!byCategory.has(row.displayCategory)) byCategory.set(row.displayCategory, []);
      byCategory.get(row.displayCategory)!.push(row);
    }
    for (const list of byCategory.values()) list.sort((a, b) => a.sortOrder - b.sortOrder);
    return byCategory;
  }, [effectiveRows]);

  async function applyPatch(patch: AnimationMetaPatch) {
    const previous = effectiveRows;
    setLocalRows(
      effectiveRows.map((row) =>
        row.slug === patch.slug
          ? {
              ...row,
              displayName: patch.display_name,
              category: patch.category,
              isNew: patch.is_new,
              isPublished: patch.is_published,
              descriptionOverride: patch.description_override,
              thumbnailVideoPath:
                patch.thumbnail_video_path !== undefined
                  ? patch.thumbnail_video_path
                  : row.thumbnailVideoPath,
              posterPath:
                patch.poster_path !== undefined ? patch.poster_path : row.posterPath,
            }
          : row,
      ),
    );
    try {
      await upsertAnimationMeta({
        ...patch,
        sort_order: effectiveRows.find((r) => r.slug === patch.slug)?.sortOrder ?? 0,
      });
      toastSuccess('Saved.');
      refetch();
      void refreshCatalog();
    } catch {
      setLocalRows(previous);
      toastError('Could not save changes.');
    }
  }

  async function toggleField(row: AdminRow, field: 'isPublished' | 'isNew', value: boolean) {
    await applyPatch({
      slug: row.slug,
      display_name: row.displayName,
      category: row.category,
      is_new: field === 'isNew' ? value : row.isNew,
      is_published: field === 'isPublished' ? value : row.isPublished,
      description_override: row.descriptionOverride,
    });
  }

  async function handleDrop(category: string, targetSlug: string) {
    if (!dragSlug || dragSlug === targetSlug) return;
    const list = [...(grouped.get(category) ?? [])];
    const fromIndex = list.findIndex((r) => r.slug === dragSlug);
    const toIndex = list.findIndex((r) => r.slug === targetSlug);
    if (fromIndex === -1 || toIndex === -1) return;

    const [moved] = list.splice(fromIndex, 1);
    list.splice(toIndex, 0, moved!);
    const reordered = list.map((r, i) => ({ ...r, sortOrder: i }));

    const previous = effectiveRows;
    setLocalRows(
      effectiveRows.map((row) => reordered.find((r) => r.slug === row.slug) ?? row),
    );

    try {
      await Promise.all(
        reordered.map((row) =>
          upsertAnimationMeta({
            slug: row.slug,
            display_name: row.displayName,
            category: row.category,
            is_new: row.isNew,
            is_published: row.isPublished,
            description_override: row.descriptionOverride,
            sort_order: row.sortOrder,
          }),
        ),
      );
      toastSuccess('Order saved.');
      refetch();
      void refreshCatalog();
    } catch {
      setLocalRows(previous);
      toastError('Could not save the new order.');
    }
  }

  const editingRow = effectiveRows.find((r) => r.slug === editingSlug) ?? null;

  return (
    <div className="h-screen overflow-y-auto bg-bg">
      <header className="flex h-[var(--top-bar-height)] items-center justify-between border-b border-border bg-panel px-4">
        <span className="text-[14px] font-semibold text-text">Motion Library — Admin</span>
        <AvatarMenu />
      </header>

      <div className="mx-auto max-w-5xl p-6">
        {isLoading && (
          <div className="flex items-center gap-2 text-[13px] text-muted">
            <Spinner /> Loading…
          </div>
        )}
        {error && <p className="text-[13px] text-danger">{error}</p>}

        {!isLoading && !error && (
          <>
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-[18px] font-semibold text-text">Animation Management</h1>
              <Button
                variant="primary"
                onClick={() => setIsAddDialogOpen(true)}
                className="gap-1.5"
              >
                <Plus size={15} />
                Add animation
              </Button>
            </div>

            <div className="flex flex-col gap-6">
              {Array.from(grouped.entries()).map(([category, list]) => (
                <div key={category}>
                  <h2 className="mb-2 text-[12px] font-semibold tracking-wide text-muted uppercase">
                    {category}
                  </h2>
                  <div className="overflow-hidden rounded-md border border-border">
                    {list.map((row) => (
                      <div
                        key={row.slug}
                        draggable
                        onDragStart={() => setDragSlug(row.slug)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => void handleDrop(category, row.slug)}
                        className="flex items-center gap-3 border-b border-border bg-panel px-3 py-2 last:border-b-0"
                      >
                        <GripVertical size={14} className="shrink-0 cursor-grab text-muted" />
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-raised">
                          <AdminThumbnail
                            posterPath={row.posterPath}
                            videoPath={row.thumbnailVideoPath}
                            name={row.displayName}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] text-text">{row.displayName}</p>
                          <p className="truncate text-[11px] text-muted">{row.slug}</p>
                        </div>
                        {row.isNew && <Pill>New</Pill>}
                        <Toggle
                          label="Published"
                          checked={row.isPublished}
                          onChange={(v) => void toggleField(row, 'isPublished', v)}
                          className="shrink-0"
                        />
                        <span className="w-28 shrink-0 truncate text-[11px] text-muted">
                          {row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : '—'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setEditingSlug(row.slug)}
                          className="shrink-0 rounded-md p-1.5 text-muted hover:bg-raised hover:text-text"
                          aria-label={`Edit ${row.slug}`}
                        >
                          <Pencil size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {editingRow && (
        <EditDrawer
          row={editingRow}
          categories={effectiveCategories}
          onClose={() => setEditingSlug(null)}
          onSave={applyPatch}
        />
      )}

      <AddAnimationDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        categories={effectiveCategories}
        existingSlugs={existingSlugs}
        onCreated={async () => {
          refetch();
          await refreshCatalog();
        }}
      />
    </div>
  );
}
