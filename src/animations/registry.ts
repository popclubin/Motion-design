import { lazy, type LazyExoticComponent, type ComponentType } from 'react';
import type { AnimationManifest } from './_core/manifest';
import type { ParamSchema } from './_core/params';
import type { AnimationComponentProps, AnimationModule } from '../types/animation';

const manifestModules = import.meta.glob<{ default: AnimationManifest }>(
  './[!_]*/manifest.ts',
  { eager: true },
);
const paramsModules = import.meta.glob<{ default: ParamSchema }>('./[!_]*/params.ts', {
  eager: true,
});
const indexLoaders = import.meta.glob<AnimationModule>('./[!_]*/index.tsx');

function folderOf(path: string): string {
  // path looks like './orbit-globe/manifest.ts'
  return path.split('/')[1]!;
}

export interface AnimationEntry {
  manifest: AnimationManifest;
  schema: ParamSchema;
  load: () => Promise<AnimationModule>;
  thumbnail: string;
}

const entries: AnimationEntry[] = [];
const seenSlugs = new Set<string>();

for (const [path, mod] of Object.entries(manifestModules)) {
  const folder = folderOf(path);
  const manifest = mod.default;
  const indexPath = `./${folder}/index.tsx`;
  const paramsPath = `./${folder}/params.ts`;

  if (import.meta.env.DEV) {
    if (!manifest) {
      console.error(`[animations] ${path} has no default export from defineManifest().`);
      continue;
    }
    if (manifest.slug !== folder) {
      console.error(
        `[animations] manifest.slug "${manifest.slug}" does not match folder name "${folder}".`,
      );
    }
    if (seenSlugs.has(manifest.slug)) {
      console.error(`[animations] duplicate slug "${manifest.slug}" — slugs must be unique.`);
      continue;
    }
    if (!indexLoaders[indexPath]) {
      console.error(`[animations] ${folder} has a manifest.ts but no index.tsx.`);
      continue;
    }
    if (!paramsModules[paramsPath]) {
      console.error(`[animations] ${folder} has a manifest.ts but no params.ts.`);
      continue;
    }
  }

  const loader = indexLoaders[indexPath];
  const schema = paramsModules[paramsPath]?.default;
  if (!loader || !schema) continue;

  seenSlugs.add(manifest.slug);
  entries.push({
    manifest,
    schema,
    load: loader,
    thumbnail: `/animations/${manifest.slug}/thumbnail.webm`,
  });
}

entries.sort((a, b) => a.manifest.name.localeCompare(b.manifest.name));

export const animationRegistry: AnimationEntry[] = entries;

export const DEFAULT_PLACEHOLDER_SCHEMA: ParamSchema = [
  { key: 'color', type: 'color', label: 'Accent colour', default: '#3d7bfa' },
  { key: 'speed', type: 'slider', label: 'Speed', default: 2, min: 0.5, max: 5, step: 0.5 },
  { key: 'scale', type: 'slider', label: 'Scale', default: 1, min: 0.5, max: 2, step: 0.1 },
];

export function createPlaceholderEntry(
  slug: string,
  displayName = slug,
  category = 'Other',
): AnimationEntry {
  return {
    manifest: {
      slug,
      name: displayName,
      category,
      description: 'Animation preview in progress.',
      tags: ['placeholder'],
      version: '1.0.0',
      addedAt: new Date().toISOString().slice(0, 10),
      dependencies: { motion: '^14' },
      frame: 'free',
    },
    schema: DEFAULT_PLACEHOLDER_SCHEMA,
    load: async () => ({
      default: (await import('./_core/PlaceholderAnimation')).default,
    }),
    thumbnail: '',
  };
}

export function getAnimationEntry(slug: string): AnimationEntry | undefined {
  return animationRegistry.find((entry) => entry.manifest.slug === slug) ?? createPlaceholderEntry(slug);
}

export function getCategories(): string[] {
  return Array.from(new Set(animationRegistry.map((entry) => entry.manifest.category)));
}

export function isRecentlyAdded(addedAt: string, withinDays = 21): boolean {
  const added = new Date(addedAt).getTime();
  if (Number.isNaN(added)) return false;
  return Date.now() - added <= withinDays * 24 * 60 * 60 * 1000;
}

const lazyComponentCache = new Map<
  string,
  LazyExoticComponent<ComponentType<AnimationComponentProps>>
>();

export function getLazyAnimationComponent(slug: string) {
  const cached = lazyComponentCache.get(slug);
  if (cached) return cached;

  const entry = getAnimationEntry(slug);
  if (!entry) return undefined;

  const component = lazy(entry.load);
  lazyComponentCache.set(slug, component);
  return component;
}

export function prefetchAnimation(slug: string) {
  void getAnimationEntry(slug)?.load();
}
