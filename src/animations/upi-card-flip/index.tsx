import { useEffect, useRef, useState } from 'react';
import type { AnimationConfig, ScreenMode } from './types';
import { DEFAULT_USER_PROFILE } from './data/userProfile';
import { CardAnimation } from './components/CardAnimation';
import { usePlayback } from '../_core/usePlayback';
import type { AnimationComponentProps } from '../../types/animation';

export default function UpiCardFlip({ params }: AnimationComponentProps) {
  const { isPaused } = usePlayback();
  const [currentScreen, setCurrentScreen] = useState<ScreenMode>('profile');
  const lastFlipRef = useRef<number | undefined>(undefined);

  const config: AnimationConfig = {
    duration: Number(params.duration ?? 0.46),
    easingMode: (params.easingMode as AnimationConfig['easingMode']) ?? 'cubic-bezier',
    bezier: [
      Number(params.bezierX1 ?? 0.22),
      Number(params.bezierY1 ?? 1.0),
      Number(params.bezierX2 ?? 0.36),
      Number(params.bezierY2 ?? 1.0),
    ],
    springStiffness: Number(params.springStiffness ?? 260),
    springDamping: Number(params.springDamping ?? 24),
    perspective: Number(params.perspective ?? 1200),
    flipAxis: (params.flipAxis as AnimationConfig['flipAxis']) ?? 'Y',
    midFlipScale: Number(params.midFlipScale ?? 0.95),
    staggerDelay: Number(params.staggerDelay ?? 0.08),
    slideDistance: Number(params.slideDistance ?? 45),
    direction: Number(params.direction ?? 1) as 1 | -1,
    chipSlideOffset: Number(params.chipSlideOffset ?? 170),
    chipBounceStiffness: Number(params.chipBounceStiffness ?? 270),
    chipBounceDamping: Number(params.chipBounceDamping ?? 15),
    maxTiltAngle: Number(params.maxTiltAngle ?? 12),
    parallaxIntensity: Number(params.parallaxIntensity ?? 1.0),
    shimmerIntensity: Number(params.shimmerIntensity ?? 0.85),
    movingBorderIntensity: Number(params.movingBorderIntensity ?? 0.95),
    gradientShiftIntensity: Number(params.gradientShiftIntensity ?? 1.0),
    enableGyro: Boolean(params.enableGyro ?? true) && !isPaused,
    showPhoneFrame: Boolean(params.showPhoneFrame ?? true),
  };

  useEffect(() => {
    const flipAt = params.flip as number | undefined;
    if (flipAt !== undefined && flipAt !== lastFlipRef.current) {
      lastFlipRef.current = flipAt;
      setCurrentScreen((prev) => (prev === 'profile' ? 'qr' : 'profile'));
    }
  }, [params.flip]);

  return (
    <div className="upi-card-flip relative flex h-full w-full items-center justify-center bg-neutral-950/40 select-none">
      <CardAnimation currentScreen={currentScreen} onScreenChange={setCurrentScreen} config={config} user={DEFAULT_USER_PROFILE} />
    </div>
  );
}
