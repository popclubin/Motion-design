import { Search } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Pill } from '../../components/ui/Pill';
import { cx } from '../../lib/utils';
import { prefetchAnimation } from '../../animations/registry';
import { initialsFor, useAnimationCatalog } from './animationCatalog';
import { ThumbnailVideo } from './ThumbnailVideo';
import { useEditorStore } from './editorStore';

const PREFETCH_DEBOUNCE_MS = 120;

export function AnimationSidebar() {
  const activeSlug = useEditorStore((s) => s.activeSlug);
  const navigate = useNavigate();
  const { entries: allEntries } = useAnimationCatalog();
  const [search, setSearch] = useState('');
  const prefetchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const filteredEntries = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return allEntries;
    return allEntries.filter((entry) => entry.displayName.toLowerCase().includes(query));
  }, [allEntries, search]);

  const schedulePrefetch = (slug: string) => {
    clearTimeout(prefetchTimer.current);
    prefetchTimer.current = setTimeout(() => prefetchAnimation(slug), PREFETCH_DEBOUNCE_MS);
  };
  const cancelPrefetch = () => clearTimeout(prefetchTimer.current);

  return (
    <aside className="flex h-full w-[var(--sidebar-width)] flex-col border-r border-border bg-panel select-none">
      <div className="border-b border-border p-3 flex flex-col gap-2.5">
        <Link
          to="/editor"
          className="flex items-center justify-between rounded-md border border-border bg-raised px-2.5 py-1.5 text-[12px] font-medium text-text hover:bg-border transition-colors duration-150"
        >
          <span>Projects</span>
          <span className="text-[10px] text-muted font-normal">All</span>
        </Link>
        <div className="flex items-center gap-2 rounded-md border border-border bg-raised px-2.5 py-1.5">
          <Search size={14} className="text-muted shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search animations"
            className="w-full bg-transparent text-[12px] text-text placeholder:text-muted focus-visible:outline-none"
          />
        </div>
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {filteredEntries.map((item) => {
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
              className="group flex w-full flex-col items-start gap-1.5 text-left cursor-pointer select-none"
            >
              <div
                className={cx(
                  'relative aspect-[16/10] w-full overflow-hidden rounded-md border border-border bg-raised',
                  isActive && 'ring-2 ring-accent border-accent',
                )}
              >
                <ThumbnailVideo
                  videoSrc={item.thumbnailUrl}
                  posterSrc={item.posterUrl}
                  initials={initialsFor(item.displayName)}
                  className="h-full w-full object-cover"
                />
                {item.isNew && (
                  <Pill className="absolute top-1.5 left-1.5 bg-panel text-[10px] px-1.5 py-0">New</Pill>
                )}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/65 p-2 text-center opacity-0 backdrop-blur-[2px] transition-opacity duration-150 group-hover:opacity-100">
                  <span className="text-[12px] font-semibold text-white leading-tight">
                    {item.displayName}
                  </span>
                </div>
              </div>
              <span className="truncate text-[12px] font-medium text-text">{item.displayName}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
