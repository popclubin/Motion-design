import { useEffect, useState } from 'react';
import { animationRegistry, createPlaceholderEntry, isRecentlyAdded, type AnimationEntry } from '../../animations/registry';
import { supabase } from '../../lib/supabase';
import type { AnimationMetaRow, CategoryRow } from '../../types/database';

export interface CatalogEntry {
  /** Unique within the rendered list; usually equal to slug, except for seeded dev-only duplicates. */
  key: string;
  slug: string;
  displayName: string;
  category: string;
  sortOrder: number;
  thumbnailUrl: string | null;
  posterUrl: string | null;
  isNew: boolean;
  entry: AnimationEntry;
}

interface RemoteCatalogData {
  metaBySlug: Map<string, AnimationMetaRow>;
  categoryOrder: Map<string, number>;
}

function publicUrlFor(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) {
    return path;
  }
  return supabase.storage.from('thumbnails').getPublicUrl(path).data.publicUrl;
}

async function fetchRemoteCatalogData(): Promise<RemoteCatalogData> {
  const [metaResult, categoryResult] = await Promise.all([
    supabase.from('animation_meta').select('*'),
    supabase.from('categories').select('*'),
  ]);

  const metaBySlug = new Map<string, AnimationMetaRow>(
    (metaResult.data ?? []).map((row: AnimationMetaRow) => [row.slug, row]),
  );
  const categoryOrder = new Map<string, number>(
    (categoryResult.data ?? []).map((row: CategoryRow) => [row.slug, row.sort_order]),
  );

  return { metaBySlug, categoryOrder };
}

// Shared across every useAnimationCatalog() consumer, kept fresh by a Realtime
// subscription and refresh calls so admin edits appear instantly.
let cache: RemoteCatalogData = { metaBySlug: new Map(), categoryOrder: new Map() };
let initPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

export async function refreshCatalog(): Promise<void> {
  try {
    const data = await fetchRemoteCatalogData();
    cache = data;
    notify();
  } catch {
    // Ignore offline errors
  }
}

function initialize(): Promise<void> {
  initPromise ??= refreshCatalog()
    .finally(() => {
      supabase
        .channel('animation-catalog-sync')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'animation_meta' },
          (payload) => {
            const metaBySlug = new Map(cache.metaBySlug);
            const row = (payload.new ?? payload.old) as AnimationMetaRow;
            if (payload.eventType === 'DELETE') metaBySlug.delete(row.slug);
            else metaBySlug.set(row.slug, row);
            cache = { ...cache, metaBySlug };
            notify();
          },
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'categories' },
          (payload) => {
            const categoryOrder = new Map(cache.categoryOrder);
            const row = (payload.new ?? payload.old) as CategoryRow;
            if (payload.eventType === 'DELETE') categoryOrder.delete(row.slug);
            else categoryOrder.set(row.slug, row.sort_order);
            cache = { ...cache, categoryOrder };
            notify();
          },
        )
        .subscribe();
    });
  return initPromise;
}

function mergeEntry(entry: AnimationEntry, remote: RemoteCatalogData): CatalogEntry | null {
  const meta = remote.metaBySlug.get(entry.manifest.slug);
  if (meta && !meta.is_published) return null;

  const videoUrl = publicUrlFor(meta?.thumbnail_video_path ?? null);
  const posterUrl = publicUrlFor(meta?.poster_path ?? null);

  return {
    key: entry.manifest.slug,
    slug: entry.manifest.slug,
    displayName: meta?.display_name ?? entry.manifest.name,
    category: meta?.category ?? entry.manifest.category,
    sortOrder: meta?.sort_order ?? remote.categoryOrder.get(entry.manifest.category) ?? 0,
    thumbnailUrl: videoUrl,
    posterUrl: posterUrl,
    isNew: meta?.is_new ?? isRecentlyAdded(entry.manifest.addedAt),
    entry,
  };
}

export function initialsFor(name: string): string {
  const words = name.trim().split(/\s+/).slice(0, 2);
  return words.map((w) => w.charAt(0).toUpperCase()).join('');
}

interface UseAnimationCatalogResult {
  entries: CatalogEntry[];
  isLoading: boolean;
}

export function useAnimationCatalog(): UseAnimationCatalogResult {
  const [, forceRender] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const listener = () => forceRender((n) => n + 1);
    listeners.add(listener);
    void initialize().finally(() => setIsLoading(false));
    void refreshCatalog();
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const registrySlugs = new Set(animationRegistry.map((e) => e.manifest.slug));
  const entries: CatalogEntry[] = [];

  for (const entry of animationRegistry) {
    const merged = mergeEntry(entry, cache);
    if (merged) entries.push(merged);
  }

  for (const meta of cache.metaBySlug.values()) {
    if (!registrySlugs.has(meta.slug) && meta.is_published) {
      const placeholder = createPlaceholderEntry(
        meta.slug,
        meta.display_name || meta.slug,
        meta.category ?? 'Other',
      );
      entries.push({
        key: meta.slug,
        slug: meta.slug,
        displayName: meta.display_name || meta.slug,
        category: meta.category ?? 'Other',
        sortOrder: meta.sort_order ?? cache.categoryOrder.get(meta.category ?? '') ?? 0,
        thumbnailUrl: publicUrlFor(meta.thumbnail_video_path),
        posterUrl: publicUrlFor(meta.poster_path),
        isNew: meta.is_new,
        entry: placeholder,
      });
    }
  }

  entries.sort((a, b) => a.sortOrder - b.sortOrder || a.displayName.localeCompare(b.displayName));

  return { entries, isLoading };
}
