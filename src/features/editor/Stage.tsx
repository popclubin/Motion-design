import { Suspense } from 'react';
import { useParams } from 'react-router';
import { ControlsPortal } from '../../animations/_core/ControlsPortal';
import { AnimationErrorBoundary } from '../../animations/_core/AnimationErrorBoundary';
import { AnimationSkeleton } from '../../animations/_core/AnimationSkeleton';
import { getLazyAnimationComponent } from '../../animations/registry';
import { defaultParamsFor, useEditorStore } from './editorStore';

export function Stage() {
  const { slug: routeSlug } = useParams();
  const storeActiveSlug = useEditorStore((s) => s.activeSlug);
  const activeSlug = storeActiveSlug || routeSlug;
  const paramsBySlug = useEditorStore((s) => s.paramsBySlug);
  const restartCount = useEditorStore((s) => s.restartCount);
  const setParams = useEditorStore((s) => s.setParams);

  const LazyAnimation = activeSlug ? getLazyAnimationComponent(activeSlug) : undefined;
  const params = activeSlug ? (paramsBySlug[activeSlug] ?? defaultParamsFor(activeSlug)) : {};

  return (
    <div
      className="relative flex h-full flex-1 items-center justify-center overflow-hidden bg-bg"
      style={{ contain: 'layout paint', isolation: 'isolate' }}
    >
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
