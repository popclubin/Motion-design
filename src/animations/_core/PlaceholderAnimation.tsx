import type { AnimationComponentProps } from '../../types/animation';

export default function PlaceholderAnimation(_props: AnimationComponentProps) {
  return (
    <div className="relative flex h-full w-full items-center justify-center p-4 sm:p-6 overflow-hidden select-none">
      {/* Phone Chrome Bezel */}
      <div
        className="relative flex flex-col items-center justify-between rounded-[48px] border-[10px] border-[#1c1c1e] bg-[#0c0d10] shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden"
        style={{
          aspectRatio: '9.5 / 19.5',
          height: '84vh',
          maxHeight: '740px',
          maxWidth: '100%',
        }}
      >
        {/* Status bar placeholder */}
        <div className="relative z-40 flex w-full shrink-0 items-center justify-between px-7 pt-3 text-[12px] font-semibold text-white/30 select-none">
          <div className="h-2.5 w-7 rounded-full bg-neutral-800 animate-pulse" />
          <div className="absolute top-2 left-1/2 h-5 w-[90px] -translate-x-1/2 rounded-full bg-black border border-white/5" />
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-3 rounded-xs bg-neutral-800" />
            <div className="h-2 w-4 rounded-xs bg-neutral-800" />
          </div>
        </div>

        {/* Inside Phone Screen: Greyish wireframe skeleton */}
        <div className="relative flex flex-1 w-full flex-col items-center justify-between px-6 pt-8 pb-10">
          {/* Header wireframe skeleton */}
          <div className="flex flex-col items-center gap-2.5 w-full pt-2">
            <div className="h-6 w-3/5 rounded-md bg-neutral-800/80 animate-pulse" />
            <div className="h-3 w-2/5 rounded-md bg-neutral-800/50 animate-pulse" />
          </div>

          {/* Center wireframe card skeleton */}
          <div className="relative flex flex-1 w-full items-center justify-center my-6">
            <div className="relative flex flex-col items-center justify-center w-full max-w-[240px] aspect-[4/5] rounded-3xl border border-neutral-800/80 bg-neutral-900/60 p-5 shadow-2xl backdrop-blur-sm animate-pulse">
              <div className="w-20 h-20 rounded-full border border-neutral-700/60 bg-gradient-to-b from-neutral-800 to-neutral-900 flex items-center justify-center mb-6 shadow-inner">
                <div className="w-10 h-10 rounded-full bg-neutral-700/60" />
              </div>
              <div className="h-3 w-4/5 rounded-md bg-neutral-800 mb-2.5" />
              <div className="h-2.5 w-3/5 rounded-md bg-neutral-800/60 mb-2" />
              <div className="h-2.5 w-1/2 rounded-md bg-neutral-800/40" />

              <div className="mt-6 h-8 w-full rounded-full bg-neutral-800/90" />
            </div>
          </div>

          {/* Label indicating animation is in progress */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-[11px] font-medium tracking-wide text-neutral-500 uppercase">
              Animation in progress
            </span>
            <div className="h-1 w-28 rounded-full bg-neutral-800" />
          </div>
        </div>
      </div>
    </div>
  );
}
