import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Menu, SlidersHorizontal, X } from 'lucide-react';
import { Navigate, useParams } from 'react-router';
import { IconButton } from '../components/ui/IconButton';
import { animationRegistry } from '../animations/registry';
import { AnimationSidebar } from '../features/editor/AnimationSidebar';
import { ControlsPanel } from '../features/editor/ControlsPanel';
import { Stage } from '../features/editor/Stage';
import { TopBar } from '../features/editor/TopBar';
import { useEditorStore } from '../features/editor/editorStore';

export default function EditorPage() {
  const { slug } = useParams();
  const setActiveSlug = useEditorStore((s) => s.setActiveSlug);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  useEffect(() => {
    if (slug) setActiveSlug(slug);
  }, [slug, setActiveSlug]);

  if (!slug) {
    const first = animationRegistry[0];
    return first ? <Navigate to={`/editor/${first.manifest.slug}`} replace /> : null;
  }

  return (
    <div className="grid h-screen grid-rows-[var(--top-bar-height)_1fr] overflow-hidden bg-bg">
      <TopBar />
      <div className="relative flex flex-1 overflow-hidden">
        {/* Left Sidebar on desktop */}
        {!leftCollapsed && (
          <div className="hidden shrink-0 h-full overflow-hidden lg:block">
            <AnimationSidebar />
          </div>
        )}

        {/* Left collapse / expand toggle in the middle of visible screen */}
        <button
          type="button"
          aria-label={leftCollapsed ? 'Expand left sidebar' : 'Collapse left sidebar'}
          onClick={() => setLeftCollapsed((v) => !v)}
          className={`hidden lg:flex absolute top-1/2 -translate-y-1/2 z-30 h-14 w-4.5 items-center justify-center rounded-r-md border border-l-0 border-border bg-panel text-muted hover:text-text hover:bg-raised shadow-md transition-all duration-150 cursor-pointer ${
            leftCollapsed ? 'left-0' : 'left-[var(--sidebar-width)]'
          }`}
        >
          {leftCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Center Stage */}
        <Stage />

        {/* Right collapse / expand toggle in the middle of visible screen */}
        <button
          type="button"
          aria-label={rightCollapsed ? 'Expand right panel' : 'Collapse right panel'}
          onClick={() => setRightCollapsed((v) => !v)}
          className={`hidden lg:flex absolute top-1/2 -translate-y-1/2 z-30 h-14 w-4.5 items-center justify-center rounded-l-md border border-r-0 border-border bg-panel text-muted hover:text-text hover:bg-raised shadow-md transition-all duration-150 cursor-pointer ${
            rightCollapsed ? 'right-0' : 'right-[var(--panel-width)]'
          }`}
        >
          {rightCollapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>

        {/* Right Sidebar on desktop */}
        {!rightCollapsed && (
          <div className="hidden shrink-0 h-full overflow-hidden lg:block">
            <ControlsPanel />
          </div>
        )}

        {/* Mobile controls */}
        <IconButton
          aria-label="Open animation list"
          onClick={() => setSidebarOpen(true)}
          className="absolute top-3 left-3 border border-border bg-panel lg:hidden z-30"
        >
          <Menu size={16} />
        </IconButton>
        <IconButton
          aria-label="Open parameters"
          onClick={() => setPanelOpen(true)}
          className="absolute top-3 right-3 border border-border bg-panel lg:hidden z-30"
        >
          <SlidersHorizontal size={16} />
        </IconButton>

        {sidebarOpen && (
          <div className="absolute inset-0 z-40 flex lg:hidden">
            <div className="relative shrink-0 h-full overflow-hidden">
              <AnimationSidebar />
              <IconButton
                aria-label="Close animation list"
                onClick={() => setSidebarOpen(false)}
                className="absolute top-3 right-3 border border-border bg-panel"
              >
                <X size={16} />
              </IconButton>
            </div>
            <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
          </div>
        )}

        {panelOpen && (
          <div className="absolute inset-0 z-40 flex justify-end lg:hidden">
            <div className="flex-1 bg-black/50" onClick={() => setPanelOpen(false)} />
            <div className="relative shrink-0 h-full overflow-hidden">
              <ControlsPanel />
              <IconButton
                aria-label="Close parameters"
                onClick={() => setPanelOpen(false)}
                className="absolute top-3 left-3 border border-border bg-panel"
              >
                <X size={16} />
              </IconButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
