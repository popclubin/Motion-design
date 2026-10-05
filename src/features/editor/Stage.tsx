import { RotateCw } from 'lucide-react';
import { Suspense } from 'react';
import { ControlsPortal } from '../../animations/_core/ControlsPortal';
import { AnimationErrorBoundary } from '../../animations/_core/AnimationErrorBoundary';
import { AnimationSkeleton } from '../../animations/_core/AnimationSkeleton';
import { getLazyAnimationComponent } from '../../animations/registry';
import { IconButton } from '../../components/ui/IconButton';
import { useEditorStore } from './editorStore';

export function Stage() {
  const activeSlug = useEditorStore((s) => s.activeSlug);
  const paramsBySlug = useEditorStore((s) => s.paramsBySlug);
  const restartCount = useEditorStore((s) => s.restartCount);
  const setParams = useEditorStore((s) => s.setParams);
  const restart = useEditorStore((s) => s.restart);

  const LazyAnimation = activeSlug ? getLazyAnimationComponent(activeSlug) : undefined;
  const params = activeSlug ? paramsBySlug[activeSlug] ?? {} : {};

  return (
    <div
      className="dotted-grid relative flex h-full flex-1 items-center justify-center p-10"
      style={{ contain: 'layout paint', isolation: 'isolate' }}
    >
      <div className="h-full w-full max-w-[720px] overflow-hidden rounded-[var(--radius-lg)] border border-border bg-panel shadow-panel">
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

      {activeSlug && (
        <IconButton
          aria-label="Restart animation"
          onClick={restart}
          className="absolute top-3 right-3 border border-border bg-panel"
        >
          <RotateCw size={14} />
        </IconButton>
      )}
    </div>
  );
}
