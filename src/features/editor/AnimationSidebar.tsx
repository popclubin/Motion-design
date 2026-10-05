import { useVirtualizer } from '@tanstack/react-virtual';
import { Search } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Pill } from '../../components/ui/Pill';
import { Select } from '../../components/ui/Select';
import { cx } from '../../lib/utils';
import { prefetchAnimation } from '../../animations/registry';
import { initialsFor, useAnimationCatalog, type CatalogEntry } from './animationCatalog';
import { buildSeedCatalog } from './seedCatalog';
import { ThumbnailVideo } from './ThumbnailVideo';
import { useEditorStore } from './editorStore';

const PREFETCH_DEBOUNCE_MS = 120;
const HEADER_ROW_HEIGHT = 32;
const ITEM_ROW_HEIGHT = 184;
const COLUMNS = 2;

type Row =
  | { type: 'header'; category: string }
  | { type: 'items'; items: CatalogEntry[] };

function groupByCategory(entries: CatalogEntry[]): { category: string; items: CatalogEntry[] }[] {
  const order: string[] = [];
  const byCategory = new Map<string, CatalogEntry[]>();
  for (const entry of entries) {
    if (!byCategory.has(entry.category)) {
      order.push(entry.category);
      byCategory.set(entry.category, []);
    }
    byCategory.get(entry.category)!.push(entry);
  }
  return order.map((category) => ({ category, items: byCategory.get(category)! }));
}

function buildRows(entries: CatalogEntry[]): Row[] {
  const rows: Row[] = [];
  for (const group of groupByCategory(entries)) {
    rows.push({ type: 'header', category: `${group.category} · ${group.items.length}` });
    for (let i = 0; i < group.items.length; i += COLUMNS) {
      rows.push({ type: 'items', items: group.items.slice(i, i + COLUMNS) });
    }
  }
  return rows;
}

export function AnimationSidebar() {
  const activeSlug = useEditorStore((s) => s.activeSlug);
  const navigate = useNavigate();
  const { entries: realEntries } = useAnimationCatalog();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [seedEnabled, setSeedEnabled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prefetchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [pinnedHeader, setPinnedHeader] = useState<string | null>(null);

  const allEntries = useMemo(
    () => (seedEnabled ? buildSeedCatalog(realEntries) : realEntries),
    [seedEnabled, realEntries],
  );

  const categories = useMemo(
    () => Array.from(new Set(allEntries.map((e) => e.category))),
    [allEntries],
  );

  const filteredEntries = useMemo(() => {
    const query = search.trim().toLowerCase();
    return allEntries.filter((entry) => {
      if (categoryFilter !== 'all' && entry.category !== categoryFilter) return false;
      if (query && !entry.displayName.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [allEntries, search, categoryFilter]);

  const rows = useMemo(() => buildRows(filteredEntries), [filteredEntries]);

  const rowOffsets = useMemo(() => {
    let acc = 0;
    return rows.map((row) => {
      const offset = acc;
      acc += row.type === 'header' ? HEADER_ROW_HEIGHT : ITEM_ROW_HEIGHT;
      return offset;
    });
  }, [rows]);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: (i) => (rows[i]?.type === 'header' ? HEADER_ROW_HEIGHT : ITEM_ROW_HEIGHT),
    overscan: 6,
  });

  const schedulePrefetch = (slug: string) => {
    clearTimeout(prefetchTimer.current);
    prefetchTimer.current = setTimeout(() => prefetchAnimation(slug), PREFETCH_DEBOUNCE_MS);
  };
  const cancelPrefetch = () => clearTimeout(prefetchTimer.current);

  const handleScroll = () => {
    const scrollTop = scrollRef.current?.scrollTop ?? 0;
    let headerIndex = -1;
    for (let i = 0; i < rows.length; i++) {
      if (rowOffsets[i]! <= scrollTop) {
        if (rows[i]!.type === 'header') headerIndex = i;
      } else break;
    }
    setPinnedHeader(headerIndex >= 0 ? (rows[headerIndex] as { category: string }).category : null);
  };

  return (
    <aside className="flex h-full w-[var(--sidebar-width)] flex-col border-r border-border bg-panel">
      <div className="flex flex-col gap-2 border-b border-border p-3">
        <div className="flex items-center gap-2 rounded-md border border-border bg-raised px-2.5 py-1.5">
          <Search size={14} className="text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search animations"
            className="w-full bg-transparent text-[12px] text-text placeholder:text-muted focus-visible:outline-none"
          />
        </div>
        <Select
          label="Category"
          value={categoryFilter}
          onChange={setCategoryFilter}
          options={[{ label: 'All categories', value: 'all' }, ...categories.map((c) => ({ label: c, value: c }))]}
        />
        {import.meta.env.DEV && (
          <button
            type="button"
            onClick={() => setSeedEnabled((v) => !v)}
            className="self-start text-[11px] text-muted underline hover:text-text"
          >
            {seedEnabled ? 'Seed: 200 fake entries (on)' : 'Seed 200 fake entries (dev)'}
          </button>
        )}
      </div>

      <div ref={scrollRef} onScroll={handleScroll} className="scrollbar-thin relative flex-1 overflow-y-auto">
        {pinnedHeader && (
          <div className="sticky top-0 z-10 border-b border-border bg-panel px-3 py-1.5 text-[11px] font-semibold tracking-wide text-muted uppercase">
            {pinnedHeader}
          </div>
        )}
        <div style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index]!;
            return (
              <div
                key={virtualRow.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: virtualRow.size,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className="px-3"
              >
                {row.type === 'header' ? (
                  <div className="flex items-center py-1.5 text-[11px] font-semibold tracking-wide text-muted uppercase">
                    {row.category}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {row.items.map((item) => {
                      const isActive = item.slug === activeSlug;
                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => navigate(`/editor/${item.slug}`)}
                          onMouseEnter={() => schedulePrefetch(item.slug)}
                          onMouseLeave={cancelPrefetch}
                          onFocus={() => schedulePrefetch(item.slug)}
                          onBlur={cancelPrefetch}
                          className="flex flex-col items-start gap-1.5 text-left"
                        >
                          <div
                            className={cx(
                              'dotted-grid relative aspect-square w-full overflow-hidden rounded-md border border-border',
                              isActive && 'ring-2 ring-white/70',
                            )}
                          >
                            <ThumbnailVideo
                              videoSrc={item.thumbnailUrl}
                              posterSrc={item.posterUrl}
                              initials={initialsFor(item.displayName)}
                              className="h-full w-full object-cover"
                            />
                            {item.isNew && (
                              <Pill className="absolute top-1.5 left-1.5 bg-panel">New</Pill>
                            )}
                          </div>
                          <span className="truncate text-[12px] text-text">{item.displayName}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
