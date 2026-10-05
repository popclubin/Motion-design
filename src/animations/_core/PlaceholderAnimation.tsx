import { motion } from 'motion/react';
import { usePlayback } from './usePlayback';
import type { AnimationComponentProps } from '../../types/animation';

export default function PlaceholderAnimation({ params }: AnimationComponentProps) {
  const color = String(params.color ?? '#3d7bfa');
  const speed = Number(params.speed ?? 2);
  const scale = Number(params.scale ?? 1);
  const { isPaused } = usePlayback();

  const duration = Math.max(0.5, 4 / speed);

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      <motion.div
        style={{ transform: `scale(${scale})` }}
        className="flex flex-col items-center justify-center gap-4"
      >
        <div className="relative flex h-32 w-32 items-center justify-center">
          <motion.div
            className="absolute inset-0 rounded-2xl opacity-20 blur-md"
            style={{ backgroundColor: color }}
            animate={isPaused ? { scale: 1 } : { scale: [1, 1.25, 1] }}
            transition={{ repeat: Infinity, duration, ease: 'easeInOut' }}
          />
          <motion.div
            className="relative h-24 w-24 rounded-2xl border border-border shadow-lg"
            style={{ backgroundColor: color }}
            animate={
              isPaused
                ? { rotate: 0, scale: 1 }
                : { rotate: [0, 90, 180, 270, 360], scale: [1, 1.05, 0.95, 1] }
            }
            transition={{ repeat: Infinity, duration: duration * 2, ease: 'easeInOut' }}
          />
        </div>
        <span className="text-[13px] font-medium text-muted">Ready to animate</span>
      </motion.div>
    </div>
  );
}
