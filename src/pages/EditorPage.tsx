import { useEffect, useState } from 'react';
import { Menu, SlidersHorizontal, X } from 'lucide-react';
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
      <div className="relative flex overflow-hidden">
        <div className="hidden lg:block">
          <AnimationSidebar />
        </div>
        <Stage />
        <div className="hidden lg:block">
          <ControlsPanel />
        </div>

        <IconButton
          aria-label="Open animation list"
          onClick={() => setSidebarOpen(true)}
          className="absolute top-3 left-3 border border-border bg-panel lg:hidden"
        >
          <Menu size={16} />
        </IconButton>
        <IconButton
          aria-label="Open parameters"
          onClick={() => setPanelOpen(true)}
          className="absolute top-3 right-3 border border-border bg-panel lg:hidden"
        >
          <SlidersHorizontal size={16} />
        </IconButton>

        {sidebarOpen && (
          <div className="absolute inset-0 z-40 flex lg:hidden">
            <div className="relative">
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
            <div className="relative">
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
