import { motion } from 'motion/react';
import { usePlayback } from '../_core/usePlayback';
import type { AnimationComponentProps } from '../../types/animation';

export default function CardCascade({ params }: AnimationComponentProps) {
  const cardCount = Number(params.cardCount);
  const overlap = Number(params.overlap);
  const tilt = Number(params.tilt);
  const cardColor = String(params.cardColor);
  const { isPaused } = usePlayback();

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      {Array.from({ length: cardCount }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-56 w-40 rounded-xl border"
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
}
