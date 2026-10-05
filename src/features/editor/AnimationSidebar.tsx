import { useVirtualizer } from '@tanstack/react-virtual';
import { Search } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Pill } from '../../components/ui/Pill';
import { cx } from '../../lib/utils';
import { prefetchAnimation } from '../../animations/registry';
import { initialsFor, useAnimationCatalog, type CatalogEntry } from './animationCatalog';
import { ThumbnailVideo } from './ThumbnailVideo';
import { useEditorStore } from './editorStore';

const PREFETCH_DEBOUNCE_MS = 120;
const ITEM_ROW_HEIGHT = 184;
const COLUMNS = 2;

function buildRows(entries: CatalogEntry[]): CatalogEntry[][] {
  const rows: CatalogEntry[][] = [];
  for (let i = 0; i < entries.length; i += COLUMNS) {
    rows.push(entries.slice(i, i + COLUMNS));
  }
  return rows;
}

export function AnimationSidebar() {
  const activeSlug = useEditorStore((s) => s.activeSlug);
  const navigate = useNavigate();
  const { entries: allEntries } = useAnimationCatalog();
  const [search, setSearch] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const prefetchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const filteredEntries = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return allEntries;
    return allEntries.filter((entry) => entry.displayName.toLowerCase().includes(query));
  }, [allEntries, search]);

  const rows = useMemo(() => buildRows(filteredEntries), [filteredEntries]);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ITEM_ROW_HEIGHT,
    overscan: 6,
  });

  const schedulePrefetch = (slug: string) => {
    clearTimeout(prefetchTimer.current);
    prefetchTimer.current = setTimeout(() => prefetchAnimation(slug), PREFETCH_DEBOUNCE_MS);
  };
  const cancelPrefetch = () => clearTimeout(prefetchTimer.current);

  return (
    <aside className="flex h-full w-[var(--sidebar-width)] flex-col border-r border-border bg-panel">
      <div className="border-b border-border p-3">
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
      </div>

      <div ref={scrollRef} className="scrollbar-thin relative flex-1 overflow-y-auto py-3">
        <div style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const items = rows[virtualRow.index]!;
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
                <div className="grid grid-cols-2 gap-2">
                  {items.map((item) => {
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
                        className="group flex flex-col items-start gap-1.5 text-left cursor-pointer"
                      >
                        <div
                          className={cx(
                            'dotted-grid relative aspect-square w-full overflow-hidden rounded-md border border-border',
                            isActive && 'ring-2 ring-accent',
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
                          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/65 p-2 text-center opacity-0 backdrop-blur-[2px] transition-opacity duration-150 group-hover:opacity-100">
                            <span className="text-[12px] font-semibold text-white leading-tight">
                              {item.displayName}
                            </span>
                          </div>
                        </div>
                        <span className="truncate text-[12px] text-text">{item.displayName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
