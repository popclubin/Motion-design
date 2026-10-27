import { Suspense } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Pencil } from 'lucide-react';
import { ControlsPortal } from '../../animations/_core/ControlsPortal';
import { AnimationErrorBoundary } from '../../animations/_core/AnimationErrorBoundary';
import { AnimationSkeleton } from '../../animations/_core/AnimationSkeleton';
import { getLazyAnimationComponent } from '../../animations/registry';
import { useAnimationCatalog } from './animationCatalog';
import { defaultParamsFor, useEditorStore } from './editorStore';

export function Stage() {
  const navigate = useNavigate();
  const { slug: routeSlug } = useParams();
  const storeActiveSlug = useEditorStore((s) => s.activeSlug);
  const activeSlug = storeActiveSlug || routeSlug;
  const paramsBySlug = useEditorStore((s) => s.paramsBySlug);
  const restartCount = useEditorStore((s) => s.restartCount);
  const setParams = useEditorStore((s) => s.setParams);
  const { entries } = useAnimationCatalog();
  const currentCatalogItem = entries.find((e) => e.slug === activeSlug);
  const canEdit = Boolean(currentCatalogItem?.canEdit);

  const LazyAnimation = activeSlug ? getLazyAnimationComponent(activeSlug) : undefined;
  const params = activeSlug ? (paramsBySlug[activeSlug] ?? defaultParamsFor(activeSlug)) : {};

  return (
    <div
      className="relative flex h-full flex-1 items-center justify-center overflow-hidden bg-bg"
      style={{ contain: 'layout paint', isolation: 'isolate' }}
    >
      {canEdit && (
        <button
          type="button"
          onClick={() => navigate(`/add-animation?edit=${activeSlug}`)}
          className="absolute top-3.5 right-4 z-30 flex items-center gap-1.5 rounded-md border border-border bg-panel/90 backdrop-blur-md px-2.5 py-1.5 text-[12px] font-medium text-text shadow-md hover:bg-raised hover:border-accent transition-all cursor-pointer"
          title="Edit this animation"
        >
          <Pencil size={13} className="text-accent" />
          <span>Edit animation</span>
        </button>
      )}

      {LazyAnimation && (
        <AnimationErrorBoundary resetKey={`${activeSlug}:${restartCount}`}>
          <Suspense fallback={<AnimationSkeleton />}>
            <LazyAnimation
              key={`${activeSlug}:${restartCount}`}
              params={params}
              setParams={setParams}
              panel={ControlsPortal}
            />
          </Suspense>
        </AnimationErrorBoundary>
      )}
    </div>
  );
}
