import { motion } from 'motion/react';
import { usePlayback } from '../_core/usePlayback';
import type { AnimationComponentProps } from '../../types/animation';

export default function CardCascade({ params }: AnimationComponentProps) {
  const cardCount = Number(params.cardCount ?? 4);
  const overlap = Number(params.overlap ?? 60);
  const tilt = Number(params.tilt ?? 6);
  const cardColor = String(params.cardColor ?? '#1b1b20');
  const mobileView = Boolean(params.mobileView ?? true);
  const { isPaused } = usePlayback();

  const content = (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      {Array.from({ length: cardCount }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-56 w-40 rounded-xl border shadow-xl"
          style={{
            background: cardColor,
            borderColor: 'var(--color-border)',
            left: `calc(50% - 80px + ${i * (overlap / 2 - 30)}px)`,
            zIndex: i,
          }}
          initial={{ rotate: 0, y: 0 }}
          animate={{
            rotate: (i - cardCount / 2) * tilt,
            y: isPaused ? 0 : [0, -8, 0],
          }}
          transition={{
            rotate: { duration: 0.6, delay: i * 0.08 },
            y: { repeat: Infinity, duration: 3, delay: i * 0.15, ease: 'easeInOut' },
          }}
        />
      ))}
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
