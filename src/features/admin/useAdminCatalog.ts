import { useCallback, useEffect, useState } from 'react';
import { animationRegistry } from '../../animations/registry';
import type { AnimationMetaRow, CategoryRow } from '../../types/database';
import { fetchAllAnimationMeta, fetchAllCategories } from './adminApi';

export interface AdminRow {
  slug: string;
  displayName: string;
  /** Real `animation_meta.category` value (a categories.slug) or null if never set — only write this back as-is. */
  category: string | null;
  /** Label to group/display by; falls back to the manifest's category name when `category` is null. */
  displayCategory: string;
  sortOrder: number;
  isNew: boolean;
  isPublished: boolean;
  thumbnailVideoPath: string | null;
  posterPath: string | null;
  descriptionOverride: string | null;
  updatedAt: string | null;
  meta: AnimationMetaRow | null;
}

function toAdminRow(
  slug: string,
  fallbackName: string,
  fallbackCategory: string,
  meta: AnimationMetaRow | null,
): AdminRow {
  return {
    slug,
    displayName: meta?.display_name ?? fallbackName,
    category: meta?.category ?? null,
    displayCategory: meta?.category ?? fallbackCategory,
    sortOrder: meta?.sort_order ?? 0,
    isNew: meta?.is_new ?? false,
    isPublished: meta?.is_published ?? true,
    thumbnailVideoPath: meta?.thumbnail_video_path ?? null,
    posterPath: meta?.poster_path ?? null,
    descriptionOverride: meta?.description_override ?? null,
    updatedAt: meta?.updated_at ?? null,
    meta,
  };
}

interface UseAdminCatalogResult {
  rows: AdminRow[];
  categories: CategoryRow[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAdminCatalog(): UseAdminCatalogResult {
  const [rows, setRows] = useState<AdminRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchToken, setRefetchToken] = useState(0);

  const refetch = useCallback(() => setRefetchToken((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    Promise.all([fetchAllAnimationMeta(), fetchAllCategories()])
      .then(([metaRows, categoryRows]) => {
        if (cancelled) return;
        const metaBySlug = new Map(metaRows.map((row) => [row.slug, row]));
        const registrySlugs = new Set(animationRegistry.map((e) => e.manifest.slug));
        const combinedRows: AdminRow[] = animationRegistry.map((entry) =>
          toAdminRow(
            entry.manifest.slug,
            entry.manifest.name,
            entry.manifest.category,
            metaBySlug.get(entry.manifest.slug) ?? null,
          ),
        );

        for (const meta of metaRows) {
          if (!registrySlugs.has(meta.slug)) {
            combinedRows.push(
              toAdminRow(
                meta.slug,
                meta.display_name || meta.slug,
                meta.category ?? 'Other',
                meta,
              ),
            );
          }
        }

        setRows(combinedRows);
        setCategories(categoryRows);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [refetchToken]);

  return { rows, categories, isLoading, error, refetch };
}
