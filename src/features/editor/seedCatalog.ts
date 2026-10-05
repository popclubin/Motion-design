import type { CatalogEntry } from './animationCatalog';

const SEED_CATEGORIES = ['Seed: Cards', 'Seed: Orbits', 'Seed: Grids', 'Seed: Overlays'];

/** Dev-only: multiplies the real catalog into ~200 fake entries to perf-test the virtualized sidebar. */
export function buildSeedCatalog(base: CatalogEntry[], count = 200): CatalogEntry[] {
  if (base.length === 0) return [];

  return Array.from({ length: count }, (_, i) => {
    const source = base[i % base.length]!;
    const category = SEED_CATEGORIES[i % SEED_CATEGORIES.length]!;
    return {
      ...source,
      key: `seed-${i}`,
      displayName: `${source.displayName} ${i + 1}`,
      category,
      sortOrder: i,
      isNew: i % 11 === 0,
    };
  });
}
