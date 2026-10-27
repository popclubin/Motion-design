import {
  ArrowUp,
  Code,
  Eye,
  Film,
  Image as ImageIcon,
  Mic,
  Moon,
  Paperclip,
  Play,
  Plus,
  RotateCcw,
  Sliders,
  Sun,
  Trash2,
  UploadCloud,
  ChevronLeft,
  LayoutGrid,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { AvatarMenu } from '../features/auth/AvatarMenu';
import { useAuth } from '../features/auth/AuthProvider';
import {
  deleteThumbnailAsset,
  publicThumbnailUrl,
  uploadThumbnailAsset,
  upsertAnimationMeta,
} from '../features/admin/adminApi';
import { useAdminCatalog } from '../features/admin/useAdminCatalog';
import {
  encodeExtraData,
  parseExtraData,
  refreshCatalog,
} from '../features/editor/animationCatalog';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { IconButton } from '../components/ui/IconButton';
import { Pill } from '../components/ui/Pill';
import { Select } from '../components/ui/Select';
import { Toggle } from '../components/ui/Toggle';
import { Tooltip } from '../components/ui/Tooltip';
import { useThemeStore } from '../lib/themeStore';
import { toastError, toastSuccess } from '../lib/toastStore';
import type { AnimationMetaRow } from '../types/database';

const SERVICE_MAINTENANCE_MSG = 'This service is currently under maintenance or coming soon';

interface MediaItem {
  id: string;
  file?: File;
  previewUrl: string;
  name: string;
}

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function AddAnimationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editSlug = searchParams.get('edit')?.trim();
  const isEdit = Boolean(editSlug);

  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const { user, profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const { rows, categories } = useAdminCatalog();
  const existingSlugs = useMemo(() => new Set(rows.map((r) => r.slug)), [rows]);

  // Form states (Metadata & multiple uploads)
  const [displayName, setDisplayName] = useState('');
  const [category, setCategory] = useState('');
  const [promptText, setPromptText] = useState('');
  const [isPublished, setIsPublished] = useState(true);

  // Dedicated Wallpaper (All Animations card thumbnail)
  const [wallpaperFile, setWallpaperFile] = useState<File | null>(null);
  const [wallpaperPreviewUrl, setWallpaperPreviewUrl] = useState<string | null>(null);
  const [wallpaperRemoved, setWallpaperRemoved] = useState(false);

  // Multi-media upload lists (Reference assets)
  const [imageItems, setImageItems] = useState<MediaItem[]>([]);
  const [videoItems, setVideoItems] = useState<MediaItem[]>([]);
  const [existingMeta, setExistingMeta] = useState<AnimationMetaRow | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Phone frame toggle for skeleton canvas
  const [showPhoneFrame, setShowPhoneFrame] = useState(true);

  // Load existing data when in edit mode
  useEffect(() => {
    if (!editSlug) return;

    supabase
      .from('animation_meta')
      .select('*')
      .eq('slug', editSlug)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) {
          toastError('Could not find animation to edit.');
          navigate('/editor');
          return;
        }

        const extra = parseExtraData(data.description_override);
        const isOwner = Boolean(
          user?.id && (data.updated_by === user.id || extra.creator_id === user.id),
        );
        if (!isAdmin && !isOwner) {
          toastError('You do not have permission to edit this animation.');
          navigate('/editor');
          return;
        }

        setExistingMeta(data);
        setDisplayName(data.display_name);
        if (data.category) setCategory(data.category);
        setIsPublished(data.is_published);
        setPromptText(extra.prompt ?? '');

        if (data.poster_path) {
          const posterUrl = publicThumbnailUrl(data.poster_path);
          if (posterUrl) setWallpaperPreviewUrl(posterUrl);
        }

        if (data.thumbnail_video_path) {
          const videoUrl = publicThumbnailUrl(data.thumbnail_video_path);
          if (videoUrl) {
            setVideoItems([
              {
                id: 'existing-video',
                previewUrl: videoUrl,
                name: 'Current Reference Video',
              },
            ]);
          }
        }
      });
  }, [editSlug, user?.id, isAdmin, navigate]);

  useEffect(() => {
    if (categories.length > 0 && !category) setCategory(categories[0]!.slug);
  }, [categories, category]);

  useEffect(() => {
    return () => {
      if (wallpaperPreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(wallpaperPreviewUrl);
      imageItems.forEach((item) => {
        if (item.previewUrl.startsWith('blob:')) URL.revokeObjectURL(item.previewUrl);
      });
      videoItems.forEach((item) => {
        if (item.previewUrl.startsWith('blob:')) URL.revokeObjectURL(item.previewUrl);
      });
    };
  }, [wallpaperPreviewUrl, imageItems, videoItems]);

  function handleWallpaperChange(file: File | null) {
    if (wallpaperPreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(wallpaperPreviewUrl);
    setWallpaperRemoved(false);
    setWallpaperFile(file);
    setWallpaperPreviewUrl(file ? URL.createObjectURL(file) : null);
  }

  function handleRemoveWallpaper() {
    if (wallpaperPreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(wallpaperPreviewUrl);
    setWallpaperFile(null);
    setWallpaperPreviewUrl(null);
    setWallpaperRemoved(true);
  }

  function handleAddImages(files: FileList | null) {
    if (!files || files.length === 0) return;
    const newItems: MediaItem[] = Array.from(files).map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      file,
      previewUrl: URL.createObjectURL(file),
      name: file.name,
    }));
    setImageItems((prev) => [...prev, ...newItems]);
  }

  function handleRemoveImage(id: string) {
    setImageItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.previewUrl.startsWith('blob:')) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
  }

  function handleAddVideos(files: FileList | null) {
    if (!files || files.length === 0) return;
    const newItems: MediaItem[] = Array.from(files).map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      file,
      previewUrl: URL.createObjectURL(file),
      name: file.name,
    }));
    setVideoItems((prev) => [...prev, ...newItems]);
  }

  function handleRemoveVideo(id: string) {
    setVideoItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.previewUrl.startsWith('blob:')) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
  }

  async function handleSubmit() {
    const trimmedName = displayName.trim();
    if (!trimmedName) {
      toastError('Please enter an animation name.');
      return;
    }

    const finalSlug = isEdit ? editSlug! : slugify(trimmedName);
    if (!finalSlug) {
      toastError('Please enter a valid animation name to generate slug.');
      return;
    }

    if (!isEdit && existingSlugs.has(finalSlug)) {
      toastError(`An animation with slug "${finalSlug}" already exists. Please pick a distinct name.`);
      return;
    }

    setIsSaving(true);
    try {
      let posterPath: string | null | undefined = undefined;
      let thumbnailVideoPath: string | null | undefined = undefined;

      // Handle Wallpaper upload / change / removal
      if (wallpaperFile) {
        posterPath = await uploadThumbnailAsset(
          finalSlug,
          wallpaperFile,
          existingMeta?.poster_path ?? null,
        );
      } else if (wallpaperRemoved) {
        posterPath = null;
        if (existingMeta?.poster_path) {
          await deleteThumbnailAsset(existingMeta.poster_path);
        }
      } else if (!isEdit && imageItems.length > 0 && imageItems[0].file) {
        posterPath = await uploadThumbnailAsset(finalSlug, imageItems[0].file, null);
      } else if (isEdit) {
        posterPath = existingMeta?.poster_path ?? null;
      }

      // Handle Video upload / removal
      const firstNewVideo = videoItems.find((v) => v.file);
      if (firstNewVideo?.file) {
        thumbnailVideoPath = await uploadThumbnailAsset(
          finalSlug,
          firstNewVideo.file,
          existingMeta?.thumbnail_video_path ?? null,
        );
      } else if (videoItems.length === 0 && existingMeta?.thumbnail_video_path) {
        thumbnailVideoPath = null;
        await deleteThumbnailAsset(existingMeta.thumbnail_video_path);
      } else if (isEdit) {
        thumbnailVideoPath = existingMeta?.thumbnail_video_path ?? null;
      }

      // Encode custom extra data (creator id, role, prompt notes) inside description_override
      const existingExtra = parseExtraData(existingMeta?.description_override ?? null);
      const extraPayload = encodeExtraData({
        prompt: promptText,
        creator_id: isEdit ? (existingExtra.creator_id ?? existingMeta?.updated_by ?? user?.id ?? null) : (user?.id ?? null),
        creator_role: isEdit ? (existingExtra.creator_role ?? (isAdmin ? 'admin' : 'user')) : (isAdmin ? 'admin' : 'user'),
      });

      await upsertAnimationMeta({
        slug: finalSlug,
        display_name: trimmedName,
        category: category || null,
        is_new: isEdit ? existingMeta?.is_new ?? false : true,
        is_published: isPublished,
        poster_path: posterPath !== undefined ? posterPath : null,
        thumbnail_video_path: thumbnailVideoPath !== undefined ? thumbnailVideoPath : null,
        description_override: extraPayload,
        sort_order: isEdit ? (existingMeta?.sort_order ?? 0) : 0,
      });

      toastSuccess(isEdit ? 'Animation updated successfully.' : 'Animation added successfully.');
      await refreshCatalog();
      navigate(`/editor/${finalSlug}`);
    } catch (err: unknown) {
      console.error('Failed to save animation:', err);
      const msg = err instanceof Error ? err.message : String(err);
      toastError(msg || 'Could not save animation.');
    } finally {
      setIsSaving(false);
    }
  }

  // Preserved for when maintenance mode is completed
  void handleSubmit;
  void isSaving;

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-bg text-text">
      {/* Top Header */}
      <header className="flex h-[var(--top-bar-height)] shrink-0 items-center justify-between border-b border-border bg-panel px-4">
        <div className="flex items-center gap-3">
          <IconButton
            aria-label="Back to editor"
            onClick={() => navigate(isEdit ? `/editor/${editSlug}` : '/editor')}
          >
            <ChevronLeft size={16} />
          </IconButton>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-text">
              {displayName.trim()
                ? isEdit
                  ? `Edit: ${displayName.trim()}`
                  : displayName.trim()
                : isEdit
                ? 'Edit Animation'
                : 'New Animation'}
            </span>
            <Pill className="text-[10px]">{isEdit ? 'Edit Mode' : 'Creator Studio'}</Pill>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <IconButton aria-label="Toggle theme" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </IconButton>
          <Button
            variant="ghost"
            className="text-[12px] h-8 px-3 text-muted hover:text-text"
            onClick={() => navigate(isEdit ? `/editor/${editSlug}` : '/editor')}
          >
            Cancel
          </Button>
          <Tooltip label={SERVICE_MAINTENANCE_MSG} side="bottom" align="end">
            <button
              type="button"
              onClick={() => toastError(SERVICE_MAINTENANCE_MSG)}
              className="flex items-center justify-center rounded-md bg-accent px-3 py-1.5 text-[12px] font-medium text-white shadow-sm opacity-60 hover:opacity-80 transition-opacity cursor-not-allowed"
            >
              {isEdit ? 'Save Changes' : 'Publish Animation'}
            </button>
          </Tooltip>
          <AvatarMenu />
        </div>
      </header>

      {/* Main 2-Column Split Workspace */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Upload multiple images, videos, text description & details  */}
        {/* ========================================================================= */}
        <aside className="flex h-full w-[380px] xl:w-[420px] shrink-0 flex-col border-r border-border bg-panel overflow-hidden">
          {/* Action Header without draft badge or star icons */}
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5 bg-raised/40">
            <span className="text-[12px] font-medium text-text">
              {isEdit ? 'Edit Animation Spec & Assets' : 'Animation Spec & Assets'}
            </span>
          </div>

          <div className="scrollbar-thin flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {/* Animation Name & Category */}
            <div className="space-y-3 rounded-lg border border-border bg-raised/30 p-3">
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted">
                  Animation Name
                </span>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. 3D Mobile Voucher App"
                  className="rounded-md border border-border bg-panel px-3 py-1.5 text-[13px] text-text placeholder:text-muted focus-visible:outline-none focus:border-accent"
                />
              </label>

              {categories.length > 0 && (
                <div className="pt-1">
                  <Select
                    label="Category"
                    value={category}
                    onChange={setCategory}
                    options={categories.map((c) => ({ label: c.name, value: c.slug }))}
                  />
                </div>
              )}
            </div>

            {/* Dedicated Wallpaper / Card Thumbnail (All Animations Preview) */}
            <div className="space-y-2 rounded-lg border border-border bg-raised/30 p-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <LayoutGrid size={13} className="text-accent" /> Animation Wallpaper (Card in All Animations)
                </span>
                {wallpaperPreviewUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveWallpaper}
                    className="text-muted hover:text-red-400 transition-colors cursor-pointer"
                    title="Remove wallpaper"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
              <p className="text-[11px] text-muted">
                This image will appear on the card in the All Animations list and sidebar.
              </p>

              {wallpaperPreviewUrl ? (
                <div className="flex flex-col gap-1.5 w-full max-w-[240px] mx-auto pt-1">
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-md border border-accent bg-black shadow-lg group">
                    <img src={wallpaperPreviewUrl} alt="Wallpaper card preview" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center p-2 text-center transition-opacity gap-1">
                      <span className="text-[11px] font-semibold text-white leading-tight truncate max-w-full">
                        {displayName.trim() || 'Animation Title'}
                      </span>
                      <label className="cursor-pointer rounded bg-panel/90 px-2 py-0.5 text-[10px] font-medium text-text hover:bg-panel mt-1">
                        Replace
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            handleWallpaperChange(e.target.files?.[0] ?? null);
                            e.target.value = '';
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-0.5">
                    <span className="text-[11px] font-medium text-text truncate max-w-[180px]">
                      {displayName.trim() || 'Animation Title'}
                    </span>
                    <span className="text-[10px] text-accent font-semibold">Sidebar Card</span>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-border/80 bg-panel/60 p-4 text-center cursor-pointer transition-colors hover:border-accent hover:bg-panel">
                  <LayoutGrid size={20} className="text-accent" />
                  <span className="text-[12px] font-medium text-text">Upload card wallpaper (16:10 recommended)</span>
                  <span className="text-[10px] text-muted">Preview matches the all animations card</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      handleWallpaperChange(e.target.files?.[0] ?? null);
                      e.target.value = '';
                    }}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Upload Reference Images (Supports Multiple) */}
            <div className="space-y-2 rounded-lg border border-border bg-raised/30 p-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <ImageIcon size={13} className="text-accent" /> Reference Images / Posters ({imageItems.length})
                </span>
                {imageItems.length > 0 && (
                  <label className="text-[11px] font-medium text-accent hover:underline cursor-pointer flex items-center gap-1">
                    <Plus size={12} /> Add more
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        handleAddImages(e.target.files);
                        e.target.value = '';
                      }}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {imageItems.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {imageItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="relative aspect-video w-full overflow-hidden rounded-md border border-border bg-black group"
                    >
                      <img src={item.previewUrl} alt={item.name} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-between p-2 transition-opacity">
                        <span className="text-[10px] text-white truncate max-w-[70%]">
                          {index === 0 ? '★ Primary' : item.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(item.id)}
                          className="rounded p-1 text-white hover:bg-red-500/80 transition-colors cursor-pointer"
                          title="Remove image"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-border/80 bg-panel/60 p-4 text-center cursor-pointer transition-colors hover:border-accent hover:bg-panel">
                  <UploadCloud size={20} className="text-muted" />
                  <span className="text-[12px] font-medium text-text">Click to upload images (multiple allowed)</span>
                  <span className="text-[10px] text-muted">Supports PNG, JPG, WebP, SVG</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      handleAddImages(e.target.files);
                      e.target.value = '';
                    }}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Upload Reference Videos (Supports Multiple) */}
            <div className="space-y-2 rounded-lg border border-border bg-raised/30 p-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <Film size={13} className="text-accent" /> Reference Videos ({videoItems.length})
                </span>
                {videoItems.length > 0 && (
                  <label className="text-[11px] font-medium text-accent hover:underline cursor-pointer flex items-center gap-1">
                    <Plus size={12} /> Add more
                    <input
                      type="file"
                      accept="video/*"
                      multiple
                      onChange={(e) => {
                        handleAddVideos(e.target.files);
                        e.target.value = '';
                      }}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {videoItems.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {videoItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="relative aspect-video w-full overflow-hidden rounded-md border border-border bg-black group"
                    >
                      <video
                        src={item.previewUrl}
                        muted
                        loop
                        playsInline
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-between p-2 transition-opacity">
                        <span className="text-[10px] text-white truncate max-w-[70%]">
                          {index === 0 ? '★ Primary' : item.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveVideo(item.id)}
                          className="rounded p-1 text-white hover:bg-red-500/80 transition-colors cursor-pointer"
                          title="Remove video"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-border/80 bg-panel/60 p-4 text-center cursor-pointer transition-colors hover:border-accent hover:bg-panel">
                  <Film size={20} className="text-muted" />
                  <span className="text-[12px] font-medium text-text">Click to upload motion videos (multiple allowed)</span>
                  <input
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={(e) => {
                      handleAddVideos(e.target.files);
                      e.target.value = '';
                    }}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Prompt & Specs Input Box */}
            <div className="space-y-1.5 rounded-lg border border-border bg-raised/30 p-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted">
                  Animation Prompt &amp; Notes
                </span>
                <span className="text-[10px] text-muted">Optional</span>
              </div>
              <div className="relative rounded-md border border-border bg-panel focus-within:border-accent">
                <textarea
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Make changes, add new features, ask for anything..."
                  rows={4}
                  className="w-full resize-none bg-transparent p-2.5 text-[12px] text-text placeholder:text-muted focus-visible:outline-none"
                />
                <div className="flex items-center justify-between border-t border-border/50 px-2.5 py-1.5 text-muted">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Attach file"
                      className="hover:text-text cursor-pointer p-0.5"
                    >
                      <Paperclip size={13} />
                    </button>
                    <span className="text-[10px] text-muted bg-raised px-1.5 py-0.5 rounded">
                      Default
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Voice input"
                      className="hover:text-text cursor-pointer p-0.5"
                    >
                      <Mic size={13} />
                    </button>
                    <Tooltip label={SERVICE_MAINTENANCE_MSG} side="top" align="end">
                      <button
                        type="button"
                        aria-label="Build animation"
                        onClick={() => toastError(SERVICE_MAINTENANCE_MSG)}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-white shadow-sm opacity-60 hover:opacity-80 transition-all cursor-not-allowed"
                      >
                        <ArrowUp size={14} strokeWidth={2.5} />
                      </button>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </div>

            {/* Status toggle */}
            <div className="pt-1">
              <Toggle
                label={isPublished ? 'Published to Hub' : 'Draft / Unpublished'}
                checked={isPublished}
                onChange={setIsPublished}
              />
            </div>
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* RIGHT SECTION: Center Stage (Generic Greyish Skeleton) + Mock Tweak Sidebar*/}
        {/* ========================================================================= */}
        <div className="flex flex-1 min-w-0 h-full overflow-hidden">
          {/* Middle Canvas / Stage with Generic Greyish Skeleton */}
          <main className="relative flex flex-1 h-full items-center justify-center overflow-hidden bg-[#000000]">
            {/* Top Preview Bar with Code icon */}
            <div className="absolute top-3 left-4 z-20 flex items-center gap-2">
              <div className="flex items-center rounded-md border border-white/10 bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-medium text-white shadow-md">
                <Eye size={12} className="mr-1.5 text-neutral-400" />
                <span>Preview</span>
              </div>
              <button
                type="button"
                className="flex items-center gap-1 rounded-md border border-white/10 bg-black/40 hover:bg-white/10 px-2 py-1 text-[11px] text-neutral-400 hover:text-white transition-colors cursor-pointer"
                title="View Code"
              >
                <Code size={13} />
              </button>
            </div>

            {/* Center Animation Placeholder: Greyish Wireframe Skeleton */}
            <div
              className={`relative flex items-center justify-center transition-all duration-300 ${
                showPhoneFrame ? 'p-6' : 'p-0 w-full h-full'
              }`}
            >
              {showPhoneFrame ? (
                /* Phone Chrome Bezels */
                <div
                  className="relative flex-shrink-0 bg-[#000000] shadow-[0_30px_100px_rgba(0,0,0,0.8)] transition-transform duration-300"
                  style={{
                    aspectRatio: '9.5 / 19.5',
                    height: '82vh',
                    maxHeight: '740px',
                    borderRadius: 52,
                    border: '11px solid #1c1c1e',
                    boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 35px 80px -15px rgba(0,0,0,0.9)',
                  }}
                >
                  {/* Phone Buttons */}
                  <div className="absolute top-[100px] -left-[2px] h-14 w-[3px] rounded-l-sm bg-[#1c1c1e]" />
                  <div className="absolute top-[165px] -left-[2px] h-9 w-[3px] rounded-l-sm bg-[#1c1c1e]" />
                  <div className="absolute top-[130px] -right-[2px] h-18 w-[3px] rounded-r-sm bg-[#1c1c1e]" />

                  {/* Phone Screen: Generic Greyish Skeleton */}
                  <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[42px] bg-[#0c0d10] text-white select-none">
                    {/* Status bar */}
                    <div className="relative z-40 flex w-full shrink-0 items-center justify-between px-7 pt-3 text-[12px] font-semibold text-white/40 select-none">
                      <div className="h-2.5 w-7 rounded-full bg-neutral-800 animate-pulse" />
                      <div className="absolute top-2 left-1/2 h-5 w-[90px] -translate-x-1/2 rounded-full bg-black border border-white/5" />
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-3 rounded-xs bg-neutral-800" />
                        <div className="h-2 w-4 rounded-xs bg-neutral-800" />
                      </div>
                    </div>

                    {/* Inside Phone Screen: Generic greyish wireframe skeleton */}
                    <div className="relative flex flex-1 flex-col items-center justify-between px-6 pt-8 pb-10">
                      {/* Top wireframe header lines */}
                      <div className="flex flex-col items-center gap-2 w-full pt-2">
                        <div className="h-6 w-3/5 rounded-md bg-neutral-800/80 animate-pulse" />
                        <div className="h-3 w-2/5 rounded-md bg-neutral-800/50 animate-pulse" />
                      </div>

                      {/* Center wireframe card / orb graphic */}
                      <div className="relative flex flex-1 w-full items-center justify-center my-6">
                        <div className="relative flex flex-col items-center justify-center w-full max-w-[240px] aspect-[4/5] rounded-3xl border border-neutral-800 bg-neutral-900/60 p-5 shadow-2xl backdrop-blur-sm animate-pulse">
                          {/* Inner pulsing circular motif */}
                          <div className="w-20 h-20 rounded-full border border-neutral-700/70 bg-gradient-to-b from-neutral-800 to-neutral-900 flex items-center justify-center mb-6 shadow-inner">
                            <div className="w-10 h-10 rounded-full bg-neutral-700/60" />
                          </div>
                          {/* Placeholder content bars */}
                          <div className="h-3 w-4/5 rounded-md bg-neutral-800 mb-2.5" />
                          <div className="h-2.5 w-3/5 rounded-md bg-neutral-800/60 mb-2" />
                          <div className="h-2.5 w-1/2 rounded-md bg-neutral-800/40" />

                          {/* Action button skeleton */}
                          <div className="mt-6 h-8 w-full rounded-full bg-neutral-800/90" />
                        </div>
                      </div>

                      {/* Bottom home indicator */}
                      <div className="h-1 w-28 rounded-full bg-neutral-800" />
                    </div>
                  </div>
                </div>
              ) : (
                /* Fullscreen Canvas view generic skeleton */
                <div className="flex h-full w-full flex-col items-center justify-center p-8 select-none">
                  <div className="flex flex-col items-center gap-3 w-full max-w-sm mb-10">
                    <div className="h-8 w-3/4 rounded-lg bg-neutral-800/80 animate-pulse" />
                    <div className="h-4 w-1/2 rounded-lg bg-neutral-800/50 animate-pulse" />
                  </div>
                  <div className="w-64 h-64 rounded-3xl border border-neutral-800 bg-neutral-900/60 flex items-center justify-center p-6 animate-pulse">
                    <div className="w-28 h-28 rounded-full border border-neutral-700 bg-neutral-800 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-neutral-700" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>

          {/* ========================================================================= */}
          {/* RIGHT SIDEBAR: Generic Greyish Mock Tuning Parameter Skeleton             */}
          {/* ========================================================================= */}
          <aside className="flex h-full w-[310px] xl:w-[330px] shrink-0 flex-col border-l border-border bg-[#0d0f12] text-text overflow-hidden select-none">
            {/* Tuning Header */}
            <div className="flex items-center justify-between border-b border-border/80 px-4 py-3 bg-[#111317]">
              <div className="flex items-center gap-2">
                <Sliders size={14} className="text-muted" />
                <span className="text-[12px] font-bold tracking-wider text-neutral-300 uppercase">
                  Animation Parameters
                </span>
              </div>
            </div>

            {/* Quick Action Play / Reset Mock Buttons */}
            <div className="flex items-center gap-1.5 border-b border-border/80 p-2.5 bg-[#14171d]/60">
              <button
                type="button"
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-[#1d222b] px-2.5 py-1.5 text-[11px] font-semibold text-neutral-300 hover:text-white transition-all cursor-pointer opacity-80"
              >
                <Play size={12} className="text-neutral-400" />
                <span>Play</span>
              </button>
              <button
                type="button"
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-[#1d222b] px-2.5 py-1.5 text-[11px] font-semibold text-neutral-300 hover:text-white transition-all cursor-pointer opacity-80"
              >
                <RotateCcw size={12} className="text-neutral-400" />
                <span>Reset to default</span>
              </button>
            </div>

            {/* Global Frame Toggle */}
            <div className="border-b border-border/80 px-4 py-2.5 bg-[#111317]/50">
              <Toggle
                label="Show phone frame"
                checked={showPhoneFrame}
                onChange={setShowPhoneFrame}
              />
            </div>

            {/* Generic Greyish Tweaking Parameter Skeleton List */}
            <div className="scrollbar-thin flex-1 overflow-y-auto px-4 py-4 space-y-6">
              {/* Group 1 Skeleton */}
              <div className="border-b border-border/70 pb-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-3 w-28 rounded bg-neutral-800" />
                  <div className="h-3 w-3 rounded-full bg-neutral-800" />
                </div>

                <div className="space-y-3.5 pt-1">
                  {[75, 45, 90, 60, 30].map((widthPct, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-3">
                      <div className="h-2.5 rounded bg-neutral-800/80" style={{ width: `${widthPct}px` }} />
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 rounded-full bg-neutral-800" />
                        <div className="h-2.5 w-6 rounded bg-neutral-800/60" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Group 2 Skeleton */}
              <div className="border-b border-border/70 pb-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-3 w-32 rounded bg-neutral-800" />
                  <div className="h-3 w-3 rounded-full bg-neutral-800" />
                </div>

                <div className="space-y-3.5 pt-1">
                  {[65, 80, 50, 70, 40].map((widthPct, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-3">
                      <div className="h-2.5 rounded bg-neutral-800/80" style={{ width: `${widthPct}px` }} />
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 rounded-full bg-neutral-800" />
                        <div className="h-2.5 w-6 rounded bg-neutral-800/60" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Group 3 Skeleton */}
              <div className="pb-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-3 w-24 rounded bg-neutral-800" />
                  <div className="h-3 w-3 rounded-full bg-neutral-800" />
                </div>

                <div className="space-y-3.5 pt-1">
                  {[55, 75, 40, 85].map((widthPct, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-3">
                      <div className="h-2.5 rounded bg-neutral-800/80" style={{ width: `${widthPct}px` }} />
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 rounded-full bg-neutral-800" />
                        <div className="h-2.5 w-6 rounded bg-neutral-800/60" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
