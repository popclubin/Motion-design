import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Code2, Film, Smartphone } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { toastError, toastSuccess } from '../../lib/toastStore';
import { useEditorStore } from '../editor/editorStore';
import type { ExportProgressStage } from './exportAnimation';

const STAGE_LABEL: Record<ExportProgressStage, string> = {
  'collecting-source': 'Reading source…',
  'collecting-assets': 'Collecting assets…',
  'generating-project': 'Generating project…',
  zipping: 'Zipping…',
  done: 'Done',
};

interface ExportOption {
  id: 'react' | 'kotlin' | 'swift' | 'mp4';
  label: string;
  description: string;
  icon: typeof Code2;
  enabled: boolean;
}

const EXPORT_OPTIONS: ExportOption[] = [
  {
    id: 'react',
    label: 'React.js',
    description: 'Vite + React + Motion',
    icon: Code2,
    enabled: true,
  },
  {
    id: 'kotlin',
    label: 'Kotlin',
    description: 'Jetpack Compose',
    icon: Smartphone,
    enabled: false,
  },
  {
    id: 'swift',
    label: 'Swift',
    description: 'SwiftUI Animation',
    icon: Smartphone,
    enabled: false,
  },
  {
    id: 'mp4',
    label: 'MP4 video',
    description: 'Rendered video recording',
    icon: Film,
    enabled: false,
  },
];

export function ExportButton() {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<ExportProgressStage | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  function handleToggle() {
    if (!open && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMenuPosition({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
    setOpen((prev) => !prev);
  }

  async function handleExport() {
    const { activeSlug, paramsBySlug } = useEditorStore.getState();
    if (!activeSlug) return;

    setOpen(false);
    setStage('collecting-source');
    try {
      const { exportAnimationZip } = await import('./exportAnimation');
      await exportAnimationZip({
        slug: activeSlug,
        paramValues: paramsBySlug[activeSlug] ?? {},
        onProgress: setStage,
      });
      toastSuccess(`${activeSlug}.zip downloaded.`);
    } catch {
      toastError('Export failed — try again.');
    } finally {
      setStage(null);
    }
  }

  return (
    <>
      <div ref={containerRef} className="relative inline-block">
        <Button
          variant="primary"
          className="flex items-center gap-1.5 px-3 py-1.5 text-[13px]"
          disabled={stage !== null}
          onClick={handleToggle}
          aria-expanded={open}
          aria-haspopup="menu"
        >
          {stage ? (
            <>
              <Spinner className="border-white/30 border-t-white" />
              {STAGE_LABEL[stage]}
            </>
          ) : (
            <>
              <span>Export</span>
              <ChevronDown size={14} className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
            </>
          )}
        </Button>
      </div>

      {open &&
        menuPosition &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{ top: menuPosition.top, right: menuPosition.right }}
            className="fixed z-50 w-64 rounded-lg border border-border bg-panel p-1.5 shadow-panel animate-in fade-in zoom-in-95 duration-100"
          >
            <div className="px-2.5 py-1.5 border-b border-border mb-1">
              <span className="text-[11px] font-semibold text-muted tracking-wide uppercase">Export formats</span>
            </div>

            <div className="flex flex-col gap-1">
              {EXPORT_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                if (opt.enabled) {
                  return (
                    <button
                      key={opt.id}
                      role="menuitem"
                      type="button"
                      onClick={() => void handleExport()}
                      className="flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left hover:bg-raised transition-colors duration-150 cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent/15 text-accent shrink-0">
                          <Icon size={14} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[13px] font-medium text-text">{opt.label}</span>
                          <span className="text-[11px] text-muted truncate">{opt.description}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-medium text-accent bg-accent/10 px-1.5 py-0.5 rounded shrink-0">
                        ZIP
                      </span>
                    </button>
                  );
                }

                return (
                  <div
                    key={opt.id}
                    role="menuitem"
                    aria-disabled="true"
                    className="flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left opacity-50 cursor-not-allowed"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-raised text-muted shrink-0">
                        <Icon size={14} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[13px] font-medium text-text">{opt.label}</span>
                        <span className="text-[11px] text-muted truncate">{opt.description}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted bg-raised px-1.5 py-0.5 rounded shrink-0">
                      Soon
                    </span>
                  </div>
                );
              })}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
