import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ParamValues } from '../../_core/params';
import { INITIAL_CARDS, getCardBgImage } from '../types';
import { haptics } from '../utils/haptics';

interface CarouselProps {
  tuning: ParamValues;
  isPaused: boolean;
}

function num(tuning: ParamValues, key: string, fallback: number): number {
  const v = tuning[key];
  return typeof v === 'number' ? v : fallback;
}
function bool(tuning: ParamValues, key: string, fallback: boolean): boolean {
  const v = tuning[key];
  return typeof v === 'boolean' ? v : fallback;
}
function str(tuning: ParamValues, key: string, fallback: string): string {
  const v = tuning[key];
  return typeof v === 'string' ? v : fallback;
}

export function Carousel({ tuning, isPaused }: CarouselProps) {
  const [cards] = useState(INITIAL_CARDS);
  const [progress, setProgress] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const progressRef = useRef<number>(0);
  const targetProgressRef = useRef<number>(0);
  const velocityRef = useRef<number>(0);
  const isSpringActiveRef = useRef<boolean>(false);
  const animFrameRef = useRef<number | null>(null);
  const autoRotateRef = useRef<number | null>(null);

  const dragStartRef = useRef({
    pointerX: 0,
    startProgress: 0,
    lastX: 0,
    lastTime: 0,
  });

  const lastHapticCardRef = useRef<number>(0);
  const carouselContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  const cardCount = cards.length || 1;

  const snapStiffness = num(tuning, 'snapStiffness', 180);
  const snapDamping = num(tuning, 'snapDamping', 27);
  const swipeSensitivity = num(tuning, 'swipeSensitivity', 0.35);
  const swipeThreshold = num(tuning, 'swipeThreshold', 36);
  const symmetricLighting = bool(tuning, 'symmetricLighting', true);
  const showSymmetryGuides = bool(tuning, 'showSymmetryGuides', false);

  const centerPerspective = num(tuning, 'centerPerspective', 1800);
  const heroLiftY = num(tuning, 'heroLiftY', 46);
  const heroPopZ = num(tuning, 'heroPopZ', 54);
  const heroRotY = num(tuning, 'heroRotY', -1);
  const heroTiltX = num(tuning, 'heroTiltX', -13);
  const heroRotZ = num(tuning, 'heroRotZ', 0);
  const cardScaleActive = num(tuning, 'cardScaleActive', 1.09);
  const heroTravelCurve = num(tuning, 'heroTravelCurve', 3.1);

  const castShadowOnNeighbors = bool(tuning, 'castShadowOnNeighbors', true);
  const castShadowOpacity = num(tuning, 'castShadowOpacity', 1);
  const shadowIntensity = num(tuning, 'shadowIntensity', 0.56);
  const shadowSoftness = num(tuning, 'shadowSoftness', 31);
  const specularSheen = num(tuning, 'specularSheen', 1);

  const fanRadius = num(tuning, 'fanRadius', 210);
  const fanSpacing = num(tuning, 'fanSpacing', 1);
  const fanTiltStep = num(tuning, 'fanTiltStep', 0.5);
  const yawAngle = num(tuning, 'yawAngle', 63);
  const curveDepth = num(tuning, 'curveDepth', 51);
  const baseYOffset = num(tuning, 'baseYOffset', 74);

  const cardOrientation = str(tuning, 'cardOrientation', 'vertical');
  const isVertical = cardOrientation !== 'horizontal';
  const cardWidth = num(tuning, 'cardWidth', isVertical ? 118 : 240);
  const perspective = num(tuning, 'perspective', 1900);
  const tiltX = num(tuning, 'tiltX', 35);

  const soundEnabled = bool(tuning, 'soundEnabled', true);
  const hapticsEnabled = bool(tuning, 'hapticsEnabled', true);
  const showPhoneFrame = bool(tuning, 'showPhoneFrame', true);
  const autoRotate = bool(tuning, 'autoRotate', false);
  const autoRotateSpeed = num(tuning, 'autoRotateSpeed', 25);
  const glowIntensity = num(tuning, 'glowIntensity', 0.8);
  const glowColorMode = str(tuning, 'glowColorMode', 'amber');
  const flankingCount = num(tuning, 'flankingCardsCount', 5);

  useEffect(() => {
    haptics.setSoundEnabled(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    haptics.setHapticsEnabled(hapticsEnabled);
  }, [hapticsEnabled]);

  const activeIndex = useMemo(() => {
    if (cards.length === 0) return 0;
    const rounded = Math.round(progress);
    return ((rounded % cards.length) + cards.length) % cards.length;
  }, [progress, cards.length]);

  const currentActiveCard = cards[activeIndex] || cards[0];

  const startSpringToTarget = useCallback(
    (target: number, initialVelocity?: number) => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }

      targetProgressRef.current = target;
      if (initialVelocity !== undefined) velocityRef.current = initialVelocity;
      isSpringActiveRef.current = true;

      let lastTime = performance.now();

      const springStep = (now: number) => {
        const dt = Math.min((now - lastTime) / 1000, 0.032);
        lastTime = now;

        const current = progressRef.current;
        const targetVal = targetProgressRef.current;
        const dist = targetVal - current;

        const force = snapStiffness * dist - snapDamping * velocityRef.current;
        velocityRef.current += force * dt;
        const nextProgress = current + velocityRef.current * dt;

        const currentDetent = Math.round(nextProgress);
        if (currentDetent !== lastHapticCardRef.current && currentDetent !== targetVal) {
          lastHapticCardRef.current = currentDetent;
          haptics.triggerAlarmTick(1.0, 'detent');
        }

        if (Math.abs(dist) < 0.008 && Math.abs(velocityRef.current) < 0.05) {
          progressRef.current = targetVal;
          setProgress(targetVal);
          velocityRef.current = 0;
          isSpringActiveRef.current = false;

          if (lastHapticCardRef.current !== targetVal) {
            lastHapticCardRef.current = targetVal;
            haptics.triggerAlarmTick(1.2, 'snap');
          }
          return;
        }

        progressRef.current = nextProgress;
        setProgress(nextProgress);
        animFrameRef.current = requestAnimationFrame(springStep);
      };

      animFrameRef.current = requestAnimationFrame(springStep);
    },
    [snapStiffness, snapDamping],
  );

  const navigateStep = useCallback(
    (delta: number) => {
      haptics.unlockAudio();
      const currentInt = Math.round(progressRef.current);
      startSpringToTarget(currentInt + delta, delta * 1.5);
    },
    [startSpringToTarget],
  );

  // Auto-rotate tick loop — stops while the tab is hidden via isPaused.
  useEffect(() => {
    if (!autoRotate || isDragging || isPaused) return;

    let lastTime = performance.now();
    const tick = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      const stepSpeed = autoRotateSpeed / 28; // 28° matches the original's unexposed default spread angle
      const nextProgress = progressRef.current + stepSpeed * delta;
      progressRef.current = nextProgress;
      setProgress(nextProgress);
      autoRotateRef.current = requestAnimationFrame(tick);
    };

    autoRotateRef.current = requestAnimationFrame(tick);
    return () => {
      if (autoRotateRef.current) cancelAnimationFrame(autoRotateRef.current);
    };
  }, [autoRotate, autoRotateSpeed, isDragging, isPaused]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        navigateStep(1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        navigateStep(-1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigateStep]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) return;

    haptics.unlockAudio();
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    isSpringActiveRef.current = false;
    velocityRef.current = 0;

    setIsDragging(true);
    dragStartRef.current = {
      pointerX: e.clientX,
      startProgress: progressRef.current,
      lastX: e.clientX,
      lastTime: performance.now(),
    };
    lastHapticCardRef.current = Math.round(progressRef.current);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;

    const currentX = e.clientX;
    const now = performance.now();
    const deltaX = currentX - dragStartRef.current.pointerX;

    const dragDistancePerCard = cardWidth * 1.05;
    const progressDelta = -(deltaX / dragDistancePerCard) * swipeSensitivity;
    const newProgress = dragStartRef.current.startProgress + progressDelta;

    const dt = Math.max((now - dragStartRef.current.lastTime) / 1000, 0.001);
    const dx = currentX - dragStartRef.current.lastX;
    const instantVelocity = (-(dx / dragDistancePerCard) * swipeSensitivity) / dt;
    velocityRef.current = velocityRef.current * 0.4 + instantVelocity * 0.6;

    dragStartRef.current.lastX = currentX;
    dragStartRef.current.lastTime = now;

    progressRef.current = newProgress;
    setProgress(newProgress);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);

    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const currentP = progressRef.current;
    const currentV = velocityRef.current;
    const totalDeltaX = e.clientX - dragStartRef.current.pointerX;
    const threshold = swipeThreshold / Math.max(0.35, swipeSensitivity);

    let targetInteger: number;

    if (Math.abs(totalDeltaX) >= threshold || Math.abs(currentV) > 1.2 / Math.max(0.4, swipeSensitivity)) {
      if (totalDeltaX < -threshold || currentV > 0.8) {
        const momentumStep = Math.min(2, Math.max(1, Math.round(currentV * 0.35)));
        targetInteger = Math.ceil(dragStartRef.current.startProgress) + (momentumStep - 1);
        if (targetInteger <= currentP) targetInteger = Math.round(currentP + 1);
      } else {
        const momentumStep = Math.min(2, Math.max(1, Math.round(-currentV * 0.35)));
        targetInteger = Math.floor(dragStartRef.current.startProgress) - (momentumStep - 1);
        if (targetInteger >= currentP) targetInteger = Math.round(currentP - 1);
      }
    } else {
      targetInteger = Math.round(currentP);
    }

    startSpringToTarget(targetInteger, currentV);
  };

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      haptics.unlockAudio();

      const dominantDelta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(dominantDelta) < 2) return;

      const step = (dominantDelta / (cardWidth * 2.5)) * swipeSensitivity;
      const newProgress = progressRef.current + step;
      progressRef.current = newProgress;
      setProgress(newProgress);

      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      startSpringToTarget(Math.round(newProgress), step * 4);
    },
    [cardWidth, swipeSensitivity, startSpringToTarget],
  );

  const activeGlowColor = useMemo(() => {
    if (glowColorMode === 'neon-green') return '#84cc16';
    if (glowColorMode === 'cyan') return '#06b6d4';
    if (glowColorMode === 'amber') return '#f59e0b';
    return currentActiveCard?.accentColor || '#84cc16';
  }, [glowColorMode, currentActiveCard?.accentColor]);

  const cardHeight = isVertical
    ? Math.round(cardWidth * (1107 / 621))
    : Math.round(cardWidth * (621 / 1107));

  const slotsToRender = useMemo(() => {
    const centerInt = Math.round(progress);
    const slots: number[] = [];
    const buffer = 1;
    for (let offset = -(flankingCount + buffer); offset <= flankingCount + buffer; offset++) {
      slots.push(centerInt + offset);
    }
    return slots;
  }, [progress, flankingCount]);

  const renderCardSlot = (slotIndex: number) => {
    const u = slotIndex - progress;
    const dist = Math.abs(u);
    if (dist > flankingCount + 1.2) return null;

    const cardDataIndex = ((slotIndex % cardCount) + cardCount) % cardCount;
    const cardData = cards[cardDataIndex];
    if (!cardData) return null;

    const heroFactor = Math.exp(-heroTravelCurve * u * u);

    const R = fanRadius;
    const phi = dist * ((fanSpacing * 0.86) / Math.max(R, 80));
    const circleZ = -R * (1 - Math.cos(phi)) * 1.35;

    const wCenterHalf = (cardWidth / 2) * Math.cos(Math.abs(heroRotY) * (Math.PI / 180)) * cardScaleActive;
    const cardScaleBack = isVertical ? 0.9 : 0.9;
    const wSideHalf = (cardWidth / 2) * Math.cos(Math.abs(yawAngle) * (Math.PI / 180)) * cardScaleBack;

    const spacingCompaction = 1 - heroFactor * 0.35;
    const minSafeGap = 2;
    const centerClearance = wCenterHalf + wSideHalf + Math.max(minSafeGap, fanSpacing * 0.18 * spacingCompaction);
    const sideStep = 2 * wSideHalf + Math.max(minSafeGap, fanSpacing * 0.22);

    const sign = u >= 0 ? 1 : -1;
    const x = sign * (Math.min(dist, 1) * centerClearance + Math.max(0, dist - 1) * sideStep);

    const arcY = Math.pow(dist, 1.35) * (isVertical ? 16 : 10);
    const y = baseYOffset + arcY - heroFactor * heroLiftY;

    const z = heroFactor * heroPopZ + circleZ - Math.pow(dist, 1.15) * (curveDepth * 0.35);

    const sideRotZ = u * fanTiltStep;
    const rotZ = (1 - heroFactor) * sideRotZ + heroFactor * heroRotZ;

    const sideBaseYaw = yawAngle + Math.min(Math.max(0, dist - 1), 2) * 5;
    const sideRotY = u >= 0 ? -sideBaseYaw : sideBaseYaw;
    const centerYawTarget = heroFactor * heroRotY;
    const rotY = (1 - heroFactor) * sideRotY + centerYawTarget;

    const rotX = (1 - heroFactor) * (tiltX + 1.5) + heroFactor * heroTiltX;

    const currentPerspective = Math.round((1 - heroFactor) * perspective + heroFactor * centerPerspective);

    const currentScale = cardScaleBack + (cardScaleActive - cardScaleBack) * heroFactor;

    const opacity = dist <= flankingCount ? 1.0 : Math.max(0, 1 - (dist - flankingCount));
    const zIndex = Math.round(1000 + heroFactor * 300 - dist * 60);

    const isCenterCard = dist < 0.25;
    const bgUrl = getCardBgImage(cardData.bgImage);

    const sideShadowSignX = symmetricLighting ? (u >= 0 ? 1 : -1) : 1;
    const shadowDistance = 16;
    const sideShadowX = sideShadowSignX * (shadowDistance * 0.45);
    const sideShadowY = shadowDistance;

    const currentShadowX = (1 - heroFactor) * sideShadowX;
    const currentShadowY = (1 - heroFactor) * sideShadowY;

    const omniBlur = shadowSoftness * (1 + 0.3 * heroFactor);
    const omniSpread = heroFactor * (shadowSoftness * 0.22);
    const omniDeepBlur = shadowSoftness * 2.5;
    const omniDeepSpread = heroFactor * (shadowSoftness * 0.45);
    const tightBlur = Math.max(4, shadowSoftness * 0.4);

    const cardBoxShadow = `
      0px 0px ${tightBlur.toFixed(1)}px 0px rgba(0, 0, 0, ${(shadowIntensity * 0.95).toFixed(2)}),
      0px 0px ${omniBlur.toFixed(1)}px ${omniSpread.toFixed(1)}px rgba(0, 0, 0, ${(shadowIntensity * (0.7 + 0.3 * heroFactor)).toFixed(2)}),
      0px 0px ${omniDeepBlur.toFixed(1)}px ${omniDeepSpread.toFixed(1)}px rgba(0, 0, 0, ${(shadowIntensity * 0.6 * heroFactor).toFixed(2)}),
      ${currentShadowX.toFixed(1)}px ${currentShadowY.toFixed(1)}px ${shadowSoftness.toFixed(1)}px rgba(0, 0, 0, ${((1 - heroFactor) * shadowIntensity).toFixed(2)}),
      inset 0 1px 1.5px rgba(255, 255, 255, ${(specularSheen * 0.4).toFixed(2)})
    `;

    let neighborCastOpacity = 0;
    let shadowAngle = 90;
    if (castShadowOnNeighbors && dist >= 0.25) {
      const heroEmergence = Math.min(1.5, Math.max(0.6, heroLiftY / 75));
      const proximity = Math.exp(-Math.pow((dist - 1.0) / 1.2, 2));
      neighborCastOpacity = Math.min(1, proximity * castShadowOpacity * heroEmergence);
      shadowAngle = u > 0 ? 90 : 270;
    }

    return (
      <div
        key={`slot-${slotIndex}`}
        onClick={() => {
          if (!isCenterCard && !isDragging) {
            startSpringToTarget(slotIndex, (slotIndex - progress) * 2);
          }
        }}
        className={`absolute top-1/2 left-1/2 select-none cursor-pointer transition-opacity ${
          opacity <= 0.01 ? 'pointer-events-none' : ''
        }`}
        style={{
          width: `${cardWidth}px`,
          height: `${cardHeight}px`,
          transformOrigin: isVertical ? '50% 95%' : '50% 50%',
          transform: `perspective(${currentPerspective}px) translate(-50%, -50%) translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, ${z.toFixed(2)}px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) rotateZ(${rotZ.toFixed(2)}deg) scale(${currentScale.toFixed(3)})`,
          transformStyle: 'preserve-3d',
          zIndex,
          opacity: Math.max(0, Math.min(1, opacity)),
          willChange: 'transform, opacity',
        }}
      >
        <div
          className="relative h-full w-full overflow-hidden rounded-2xl border border-white/20"
          style={{
            backgroundColor: '#0d0d12',
            backgroundImage: `url(${bgUrl})`,
            backgroundSize: '100% 100%',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backfaceVisibility: 'hidden',
            aspectRatio: isVertical ? '621 / 1107' : '1107 / 621',
            boxShadow: cardBoxShadow,
          }}
        >
          {castShadowOnNeighbors && (
            <div
              className="pointer-events-none absolute inset-0 rounded-2xl"
              style={{
                opacity: Math.max(0, Math.min(1, neighborCastOpacity)),
                background: `linear-gradient(${shadowAngle}deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 28%, rgba(0,0,0,0.08) 55%, transparent 75%)`,
              }}
            />
          )}
          {specularSheen > 0.02 && (
            <div
              className="pointer-events-none absolute inset-0 rounded-2xl"
              style={{
                background: `linear-gradient(135deg, rgba(255,255,255,${(specularSheen * 0.22).toFixed(2)}) 0%, transparent 42%, rgba(0,0,0,0.12) 100%)`,
              }}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`relative flex h-full w-full flex-col items-center justify-center overflow-hidden select-none ${
        showPhoneFrame ? 'border-[10px] border-neutral-800 bg-black' : ''
      }`}
      style={showPhoneFrame ? { borderRadius: 48 } : undefined}
    >
      {showPhoneFrame && (
        <div className="relative z-40 flex w-full shrink-0 items-center justify-between px-6 pt-3 text-[11px] font-semibold text-neutral-400 select-none">
          <span>9:41</span>
          <div className="h-5 w-24 rounded-full border border-neutral-800/80 bg-neutral-900" />
          <span className="text-[10px]">5G</span>
        </div>
      )}

      {showSymmetryGuides && (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
          <div className="absolute top-0 bottom-0 w-px bg-emerald-500/40" />
        </div>
      )}

      <div
        ref={carouselContainerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        className="relative flex h-full w-full flex-1 touch-none items-center justify-center overflow-hidden active:cursor-grabbing"
        style={{ perspective: `${perspective}px`, perspectiveOrigin: '50% 50%' }}
      >
        <div
          className="pointer-events-none absolute bottom-12 left-1/2 h-64 w-80 -translate-x-1/2 rounded-full opacity-85 blur-3xl transition-all duration-300"
          style={{
            background: `radial-gradient(ellipse at center, ${activeGlowColor} 0%, ${activeGlowColor}33 45%, transparent 70%)`,
            transform: `translateX(-50%) scale(${glowIntensity})`,
          }}
        />

        <div className="pointer-events-auto relative flex h-full w-full items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
          {slotsToRender.map((slotIdx) => renderCardSlot(slotIdx))}
        </div>
      </div>

      <div className="absolute bottom-4 left-4 z-30 flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigateStep(-1)}
          className="rounded-full border border-white/10 bg-black/50 p-2 text-white backdrop-blur-md"
          title="Previous card"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => navigateStep(1)}
          className="rounded-full border border-white/10 bg-black/50 p-2 text-white backdrop-blur-md"
          title="Next card"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {showPhoneFrame && (
        <div className="z-40 flex w-full shrink-0 justify-center pb-2.5 select-none">
          <div className="h-1 w-28 rounded-full bg-neutral-600/60" />
        </div>
      )}
    </div>
  );
}
