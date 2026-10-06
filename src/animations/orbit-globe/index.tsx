import { motion } from 'motion/react';
import { usePlayback } from '../_core/usePlayback';
import type { AnimationComponentProps } from '../../types/animation';

export default function OrbitGlobe({ params }: AnimationComponentProps) {
  const cardCount = Number(params.cardCount ?? 8);
  const radius = Number(params.radius ?? 120);
  const speed = Number(params.speed ?? 1);
  const accentColor = String(params.accentColor ?? '#3d7bfa');
  const mobileView = Boolean(params.mobileView ?? true);
  const { isPaused } = usePlayback();

  const content = (
    <div className="relative flex h-full w-full items-center justify-center">
      <motion.div
        className="relative"
        style={{ width: radius * 2, height: radius * 2 }}
        animate={isPaused ? {} : { rotate: 360 }}
        transition={{ repeat: Infinity, duration: 10 / speed, ease: 'linear' }}
      >
        {Array.from({ length: cardCount }).map((_, i) => {
          const angle = (i / cardCount) * Math.PI * 2;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          return (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 h-10 w-7 rounded-md shadow-md"
              style={{
                transform: `translate(${x - 14}px, ${y - 20}px)`,
                background: accentColor,
                opacity: 0.85,
              }}
            />
          );
        })}
      </motion.div>
    </div>
  );

  if (!mobileView) {
    return <div className="relative flex h-full w-full items-center justify-center">{content}</div>;
  }

  return (
    <div className="relative flex h-full w-full items-center justify-center p-4 select-none">
      <div
        className="relative flex flex-col items-center justify-between rounded-[48px] border-[10px] border-[#1c1c1e] bg-[#0a0a0c] shadow-[0_25px_60px_rgba(0,0,0,0.6)] overflow-hidden"
        style={{
          aspectRatio: '390 / 844',
          height: '92%',
          maxHeight: '844px',
          maxWidth: '100%',
        }}
      >
        <div className="relative z-40 flex w-full shrink-0 items-center justify-between px-7 pt-3 text-[13px] font-semibold text-white select-none">
          <span>9:41</span>
          <div className="absolute top-2 left-1/2 h-7 w-[108px] -translate-x-1/2 rounded-full bg-black" />
          <span className="flex items-center gap-1.5 text-[11px]">
            5G
            <span className="h-3 w-6 rounded-[3px] border border-white/70" />
          </span>
        </div>

        <div className="relative flex-1 w-full h-full overflow-hidden">
          {content}
        </div>

        <div className="z-40 flex w-full shrink-0 justify-center pb-2 select-none">
          <div className="h-1 w-28 rounded-full bg-neutral-500/70" />
        </div>
      </div>
    </div>
  );
}
