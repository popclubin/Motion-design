import { motion } from 'motion/react';
import { usePlayback } from '../_core/usePlayback';
import type { AnimationComponentProps } from '../../types/animation';

export default function OrbitGlobe({ params }: AnimationComponentProps) {
  const cardCount = Number(params.cardCount);
  const radius = Number(params.radius);
  const speed = Number(params.speed);
  const accentColor = String(params.accentColor);
  const { isPaused } = usePlayback();

  return (
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
              className="absolute top-1/2 left-1/2 h-10 w-7 rounded-md"
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
}
