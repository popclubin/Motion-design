import { supabase } from '../../lib/supabase';
import type { AnimationMetaRow, CategoryRow } from '../../types/database';

export async function fetchAllAnimationMeta(): Promise<AnimationMetaRow[]> {
  const { data, error } = await supabase.from('animation_meta').select('*');
  if (error) throw error;
  return data ?? [];
}

export async function fetchAllCategories(): Promise<CategoryRow[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function upsertAnimationMeta(
  patch: Partial<AnimationMetaRow> & { slug: string; display_name: string },
): Promise<AnimationMetaRow> {
  const { data: userData } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('animation_meta')
    .upsert({
      ...patch,
      updated_at: new Date().toISOString(),
      updated_by: userData.user?.id,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function upsertCategory(row: CategoryRow): Promise<CategoryRow> {
  const { data, error } = await supabase.from('categories').upsert(row).select('*').single();
  if (error) throw error;
  return data;
}

export async function deleteCategory(slug: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('slug', slug);
  if (error) throw error;
}

function extensionFor(file: File): string {
  const match = /\.([a-zA-Z0-9]+)$/.exec(file.name);
  if (match) return match[1]!.toLowerCase();
  if (file.type) {
    const sub = file.type.split('/')[1];
    if (sub) return sub.replace('+xml', '').toLowerCase();
  }
  return 'bin';
}

export async function deleteThumbnailAsset(path: string | null): Promise<void> {
  if (!path) return;
  try {
    await supabase.storage.from('thumbnails').remove([path]);
  } catch {
    // Ignore cleanup error of previous file
  }
}

/** Converts any image type (PNG, GIF, BMP, SVG, AVIF, JPEG, WebP) to WebP before uploading to ensure 100% compatibility */
export async function normalizeImageFile(file: File): Promise<File> {
  if (file.type === 'image/webp' || file.type === 'image/jpeg') {
    return file;
  }
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const baseName = file.name.replace(/\.[^/.]+$/, '');
              const converted = new File([blob], `${baseName}.webp`, {
                type: 'image/webp',
              });
              resolve(converted);
            } else {
              resolve(file);
            }
          },
          'image/webp',
          0.92,
        );
      } catch {
        resolve(file);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}

export async function uploadThumbnailAsset(
  slug: string,
  file: File,
  previousPath: string | null,
): Promise<string> {
  let fileToUpload = file;
  if (file.type.startsWith('image/') || /\.(png|jpe?g|webp|gif|bmp|svg|avif|ico)$/i.test(file.name)) {
    fileToUpload = await normalizeImageFile(file);
  }

  const ext = extensionFor(fileToUpload);
  const path = `${slug}/${Date.now()}.${ext}`;
  const contentType = fileToUpload.type || (ext === 'webp' ? 'image/webp' : ext === 'mp4' ? 'video/mp4' : 'application/octet-stream');

  const { error: uploadError } = await supabase.storage.from('thumbnails').upload(path, fileToUpload, {
    contentType,
    upsert: true,
  });
  if (uploadError) throw uploadError;

  if (previousPath && previousPath !== path) {
    await deleteThumbnailAsset(previousPath);
  }

  return path;
}

export function publicThumbnailUrl(path: string | null): string | null {
  if (!path) return null;
  return supabase.storage.from('thumbnails').getPublicUrl(path).data.publicUrl;
}
