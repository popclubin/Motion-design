import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Home, ShoppingBag, Receipt, CreditCard, RotateCcw } from 'lucide-react';

export type NavTabId = 'home' | 'shop' | 'bills' | 'card';

export type EasingStyle = 'original' | 'linear' | 'smooth' | 'snappy';

export interface PopBottomBarProps {
  selectedTab?: NavTabId;
  onSelectTab?: (tab: NavTabId) => void;
  onScanClick?: () => void;
  className?: string;
  autoPlay?: boolean;
  replayTrigger?: number;
  showInlineReplayButton?: boolean;
  isFixed?: boolean;
  /** Uniformly scales playback pace; 1 = exactly the original timing. */
  speed?: number;
  /** 'original' reproduces the spec's per-property curves exactly; the others substitute one uniform feel across the whole choreography. */
  easingStyle?: EasingStyle;
}

export interface PopBottomBarHandle {
  replay: () => void;
}

// Exact Cubic Bezier solver matching Jetpack Compose CubicBezierEasing
function createCubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;

  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  function sampleCurveX(t: number) {
    return ((ax * t + bx) * t + cx) * t;
  }
  function sampleCurveY(t: number) {
    return ((ay * t + by) * t + cy) * t;
  }
  function sampleCurveDerivativeX(t: number) {
    return (3 * ax * t + 2 * bx) * t + cx;
  }

  function solveCurveX(x: number) {
    let t2 = x;
    for (let i = 0; i < 8; i++) {
      const x2 = sampleCurveX(t2) - x;
      if (Math.abs(x2) < 1e-5) return t2;
      const d2 = sampleCurveDerivativeX(t2);
      if (Math.abs(d2) < 1e-5) break;
      t2 = t2 - x2 / d2;
    }
    let t0 = 0.0;
    let t1 = 1.0;
    let t2_bisect = x;
    if (t2_bisect < t0) return t0;
    if (t2_bisect > t1) return t1;
    while (t0 < t1) {
      const x2 = sampleCurveX(t2_bisect);
      if (Math.abs(x2 - x) < 1e-5) return t2_bisect;
      if (x > x2) t0 = t2_bisect;
      else t1 = t2_bisect;
      t2_bisect = (t1 - t0) * 0.5 + t0;
    }
    return t2_bisect;
  }

  return (t: number) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    return sampleCurveY(solveCurveX(t));
  };
}

// Specification interpolators from image.png:
// 1. Position 0-175ms: custom bezier (0.23, 0.02, 0, 0.96)
const easingPos0_175 = createCubicBezier(0.23, 0.02, 0.0, 0.96);

// 2. Position 175-502ms: custom bezier (0.34, 0.54, 0.06, 1.07)
const easingPos175_502 = createCubicBezier(0.34, 0.54, 0.06, 1.07);

// 3. Tabs Scale 92-212ms: custom bezier (0.63, 0, 0, 0.97)
const easingScaleTabs = createCubicBezier(0.63, 0.0, 0.0, 0.97);

// 4. Tabs Width 181-291ms: custom bezier (0.44, -0.02, 0.56, 1)
const easingWidthTabs = createCubicBezier(0.44, -0.02, 0.56, 1.0);

// 5. Bottom nav units Position 220-540ms: custom bezier (0.27, -0.04, 0, 0.99)
const easingNavItemPos = createCubicBezier(0.27, -0.04, 0.0, 0.99);

// 6. Opacity: custom bezier (0.5, 0, 0.5, 1)
const easingOpacity = createCubicBezier(0.5, 0.0, 0.5, 1.0);

// 7. Active black background motion curve:
// Starts fast in the beginning, and at the end slowly stops (Fast-Out, Slow-In)
const easingActiveBg = createCubicBezier(0.27, -0.04, 0, 0.99);

// Alternate uniform curves for the "Motion curve" tunable — 'original' (the default)
// leaves every property's own hand-tuned curve above untouched.
const ALT_EASINGS: Record<Exclude<EasingStyle, 'original'>, (t: number) => number> = {
  linear: (t) => t,
  smooth: createCubicBezier(0.4, 0.0, 0.2, 1.0),
  snappy: createCubicBezier(0.68, -0.6, 0.32, 1.6),
};

function pickEasing(
  style: EasingStyle,
  original: (t: number) => number,
): (t: number) => number {
  return style === 'original' ? original : ALT_EASINGS[style];
}

// Scanner laser animation interpolators:
// - Initial movement upwards from center: ease-out (faster in the start and slower at the end)
const easingScanEaseOut = createCubicBezier(0.1, 0.85, 0.25, 1.0);
// - Snappy custom bezier sweeps across the viewfinder: (0.75, 0, 0.25, 1)
const easingScanCustom = createCubicBezier(0.75, 0.0, 0.25, 1.0);
// - End motion returning to center: ease-in (slower at the start and faster in the end)
const easingScanEaseIn = createCubicBezier(0.42, 0.0, 0.85, 0.25);

const ENTRANCE_DURATION = 540;
const SCAN_ANIMATION_DURATION = 1150;
const TOTAL_ANIMATION_DURATION = ENTRANCE_DURATION + SCAN_ANIMATION_DURATION;

function getScannerLineOffsetY(time: number): number {
  if (time <= 0) return 0;
  const travel = 2.5;
  if (time <= 130) {
    // 0 - 130ms: 0 -> -travel (-2.5px), ease-out (faster in start, slower at end)
    const p = easingScanEaseOut(time / 130);
    return -travel * p;
  }
  if (time <= 390) {
    // 130 - 390ms: -travel -> +travel (+2.5px), sped up sweep
    const p = easingScanCustom((time - 130) / 260);
    return -travel + 2 * travel * p;
  }
  if (time <= 650) {
    // 390 - 650ms: +travel -> -travel (-2.5px), sped up sweep
    const p = easingScanCustom((time - 390) / 260);
    return travel - 2 * travel * p;
  }
  if (time <= 910) {
    // 650 - 910ms: -travel -> +travel (+2.5px), sped up sweep
    const p = easingScanCustom((time - 650) / 260);
    return -travel + 2 * travel * p;
  }
  if (time <= 1150) {
    // 910 - 1150ms: +travel -> 0px, coming back to center with ease-in (slower at start, faster in the end)
    const p = easingScanEaseIn((time - 910) / 240);
    return travel * (1 - p);
  }
  return 0;
}

function interpolate(
  t: number,
  t0: number,
  t1: number,
  v0: number,
  v1: number,
  easing?: (fraction: number) => number
): number {
  if (t <= t0) return v0;
  if (t >= t1) return v1;
  const fraction = (t - t0) / (t1 - t0);
  const easedFraction = easing ? easing(fraction) : fraction;
  return v0 + (v1 - v0) * easedFraction;
}

export const PopBottomBar = React.forwardRef<PopBottomBarHandle, PopBottomBarProps>(
  (
    {
      selectedTab = 'home',
      onSelectTab,
      onScanClick,
      className = '',
      autoPlay = true,
      replayTrigger,
      showInlineReplayButton = false,
      isFixed = false,
      speed = 1,
      easingStyle = 'original',
    },
    ref
  ) => {
    const ep0 = pickEasing(easingStyle, easingPos0_175);
    const ep175 = pickEasing(easingStyle, easingPos175_502);
    const esTabs = pickEasing(easingStyle, easingScaleTabs);
    const ewTabs = pickEasing(easingStyle, easingWidthTabs);
    const eNav = pickEasing(easingStyle, easingNavItemPos);
    const eOpacity = pickEasing(easingStyle, easingOpacity);
    const eBg = pickEasing(easingStyle, easingActiveBg);

    const tabs: Array<{ id: NavTabId; label: string; icon: React.ReactNode }> = [
    {
      id: 'home',
      label: 'Home',
      icon: <Home className="w-[18px] h-[18px]" strokeWidth={2.2} />,
    },
    {
      id: 'shop',
      label: 'Shop',
      icon: <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={1.9} />,
    },
    {
      id: 'bills',
      label: 'Bills',
      icon: <Receipt className="w-[18px] h-[18px]" strokeWidth={1.9} />,
    },
    {
      id: 'card',
      label: 'Card',
      icon: <CreditCard className="w-[18px] h-[18px]" strokeWidth={1.9} />,
    },
  ];

  // Animation timeline state: 540ms (entrance) + 1150ms (scanner animation) = 1690ms
  const [animTime, setAnimTime] = useState<number>(autoPlay ? 0 : TOTAL_ANIMATION_DURATION);
  const [isAnimating, setIsAnimating] = useState<boolean>(autoPlay);
  const requestRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const [manualScanTime, setManualScanTime] = useState<number | null>(null);
  const manualScanRef = useRef<number | null>(null);

  // Layout measurements
  const barRef = useRef<HTMLDivElement | null>(null);
  const tabItemRefs = useRef<Map<NavTabId, HTMLButtonElement>>(new Map());
  const [targetFinalWidth, setTargetFinalWidth] = useState<number>(272);

  // Measure tab bounds accurately
  const updateMeasurements = React.useCallback(() => {
    if (barRef.current) {
      const width = barRef.current.clientWidth || barRef.current.offsetWidth;
      if (width > 0) {
        setTargetFinalWidth(width);
      }
    }
  }, []);

  useLayoutEffect(() => {
    updateMeasurements();
    if (!barRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        if (width > 0) {
          setTargetFinalWidth(width);
        }
      }
    });
    observer.observe(barRef.current);
    const handleResize = () => updateMeasurements();
    window.addEventListener('resize', handleResize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [updateMeasurements]);

  // Animation playback runner: 540ms entrance + 1150ms scan laser
  const playAnimation = () => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    if (manualScanRef.current) {
      cancelAnimationFrame(manualScanRef.current);
    }
    setManualScanTime(null);
    updateMeasurements();
    setIsAnimating(true);
    setAnimTime(0);
    startTimeRef.current = null;

    const totalDuration = TOTAL_ANIMATION_DURATION;

    const step = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = (timestamp - startTimeRef.current) * speed;
      const current = Math.min(elapsed, totalDuration);

      setAnimTime(current);

      if (elapsed < totalDuration) {
        requestRef.current = requestAnimationFrame(step);
      } else {
        setAnimTime(totalDuration);
        setIsAnimating(false);
      }
    };

    requestRef.current = requestAnimationFrame(step);
  };

  React.useImperativeHandle(ref, () => ({
    replay: () => {
      playAnimation();
    },
  }));

  useEffect(() => {
    if (replayTrigger !== undefined && replayTrigger > 0) {
      playAnimation();
    }
  }, [replayTrigger]);

  useEffect(() => {
    if (autoPlay) {
      const timer = setTimeout(() => {
        playAnimation();
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [autoPlay]);

  useEffect(() => {
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (manualScanRef.current) cancelAnimationFrame(manualScanRef.current);
    };
  }, []);

  const selectedIndex = tabs.findIndex((t) => t.id === selectedTab);

  // --- Exact animation properties from specification (image.png) ---

  // 1. Vertical rise (Y translation):
  // Tabs & Button: y132 -> y48 (0 - 175ms), delta = 84px
  // interpolator: custom bezier (0.23, 0.02, 0, 0.96)
  const riseOffsetY = isAnimating
    ? animTime <= 175
      ? interpolate(animTime, 0, 175, 84, 0, ep0)
      : 0
    : 0;

  // Center alignment: the black ball is positioned directly behind the scanner item initially.
  // Distance from center of resting capsule to center of resting scanner button (with exact 12px gap):
  const scannerSize = 54;
  const gap = 12;
  const initialButtonOffsetX = -(targetFinalWidth + gap) / 2;
  const initialTabsOffsetX = (scannerSize + gap) / 2;

  // 2. Tabs horizontal position:
  // - 0-175ms: Held directly behind the scanner button at the center
  // - 175-502ms: Emerges from behind the scanner button to its resting dock position (initialTabsOffsetX -> 0px)
  const tabsOffsetX = isAnimating
    ? animTime <= 175
      ? initialTabsOffsetX
      : animTime <= 502
      ? interpolate(animTime, 175, 502, initialTabsOffsetX, 0, ep175)
      : 0
    : 0;

  // 3. Scanner Button horizontal position:
  // - 0-175ms: Center position
  // - 175-502ms: Slides to right dock position (initialButtonOffsetX -> 0px)
  const buttonOffsetX = isAnimating
    ? animTime <= 175
      ? initialButtonOffsetX
      : animTime <= 502
      ? interpolate(animTime, 175, 502, initialButtonOffsetX, 0, ep175)
      : 0
    : 0;

  // 4. Scales:
  // Tabs scale: 0% -> 164% (92-212ms), custom bezier (0.63, 0, 0, 0.97)
  const tabsScale = isAnimating
    ? animTime < 92
      ? 0
      : animTime <= 212
      ? interpolate(animTime, 92, 212, 0, 1.0, esTabs)
      : 1.0
    : 1.0;

  // Button scale: 100% -> 164% (0-212ms), normalized 0.61 -> 1.0
  const buttonScale = isAnimating
    ? animTime <= 212
      ? interpolate(animTime, 0, 212, 100 / 164, 1.0, ep0)
      : 1.0
    : 1.0;

  // 5. Tabs Width:
  // Width: starts as circular dot (scannerSize) -> expands to targetFinalWidth (181-291ms)
  let currentCapsuleWidth = targetFinalWidth;
  if (isAnimating) {
    if (animTime < 181) {
      currentCapsuleWidth = scannerSize;
    } else if (animTime <= 291) {
      currentCapsuleWidth = interpolate(
        animTime,
        181,
        291,
        scannerSize,
        targetFinalWidth,
        ewTabs
      );
    } else {
      currentCapsuleWidth = targetFinalWidth;
    }
  }

  const capsuleLeft = (targetFinalWidth - currentCapsuleWidth) / 2;

  // 6. Scanner icon (bar and scanner group) opacity:
  // Opacity: 0% -> 100% (119-501ms)
  const scannerIconOpacity = isAnimating
    ? animTime < 119
      ? 0
      : animTime <= 501
      ? interpolate(animTime, 119, 501, 0, 1.0, eOpacity)
      : 1.0
    : 1.0;

  // 7. Bottom nav units (Home, Shop, Bills, Card):
  const slotWidth = Math.max(38, (targetFinalWidth - 8) / 4);

  // Home:
  // - Position: x48.8 -> 20.6 (220-478ms) [delta: +28.2px, bezier 0.27, -0.04, 0, 0.99]
  // - Opacity: 0% -> 100% (186-236ms) [bezier 0.5, 0, 0.5, 1]
  const homeOffsetX = isAnimating
    ? animTime < 220
      ? 28.2
      : animTime <= 478
      ? interpolate(animTime, 220, 478, 28.2, 0, eNav)
      : 0
    : 0;
  const homeAlpha = isAnimating
    ? animTime < 186
      ? 0
      : animTime <= 236
      ? interpolate(animTime, 186, 236, 0, 1.0, eOpacity)
      : 1.0
    : 1.0;

  // Shop:
  // - Position: x94.9 -> 65.9 (280-540ms) [delta: +29.0px, bezier 0.27, -0.04, 0, 0.99]
  // - Opacity: 0% -> 100% (230-317ms) [bezier 0.5, 0, 0.5, 1]
  const shopOffsetX = isAnimating
    ? animTime < 280
      ? 29.0
      : animTime <= 540
      ? interpolate(animTime, 280, 540, 29.0, 0, eNav)
      : 0
    : 0;
  const shopAlpha = isAnimating
    ? animTime < 230
      ? 0
      : animTime <= 317
      ? interpolate(animTime, 230, 317, 0, 1.0, eOpacity)
      : 1.0
    : 1.0;

  // Bills:
  // - Position: x162.2 -> 111 (281-540ms) [delta: +51.2px, bezier 0.27, -0.04, 0, 0.99]
  // - Opacity: 0% -> 100% (304-387ms) [bezier 0.5, 0, 0.5, 1]
  const billsOffsetX = isAnimating
    ? animTime < 281
      ? 51.2
      : animTime <= 540
      ? interpolate(animTime, 281, 540, 51.2, 0, eNav)
      : 0
    : 0;
  const billsAlpha = isAnimating
    ? animTime < 304
      ? 0
      : animTime <= 387
      ? interpolate(animTime, 304, 387, 0, 1.0, eOpacity)
      : 1.0
    : 1.0;

  // Card:
  // - Position: x225.4 -> 156.1 (281-540ms) [delta: +69.3px, bezier 0.27, -0.04, 0, 0.99]
  // - Opacity: 0% -> 100% (317-540ms) [bezier 0.5, 0, 0.5, 1]
  const cardOffsetX = isAnimating
    ? animTime < 281
      ? 69.3
      : animTime <= 540
      ? interpolate(animTime, 281, 540, 69.3, 0, eNav)
      : 0
    : 0;
  const cardAlpha = isAnimating
    ? animTime < 317
      ? 0
      : animTime <= 540
      ? interpolate(animTime, 317, 540, 0, 1.0, eOpacity)
      : 1.0
    : 1.0;

  const navItemOffsets = [homeOffsetX, shopOffsetX, billsOffsetX, cardOffsetX];
  const navItemAlphas = [homeAlpha, shopAlpha, billsAlpha, cardAlpha];

  // 8. BG (Home tab selected background):
  // - Position: x200.5 -> 58.5 (310-535ms) [delta: +142.0px]
  // - Motion curve: starts fast in the beginning, and at the end slowly stops (cubic-bezier 0.2, 0, 0.2, 1)
  // - Opacity: 0% -> 100% (310-355ms) [bezier 0.5, 0, 0.5, 1]
  const bgOffsetX = isAnimating
    ? animTime < 310
      ? 142.0
      : animTime <= 535
      ? interpolate(animTime, 310, 535, 142.0, 0, eBg)
      : 0
    : 0;
  const bgOpacity = isAnimating
    ? animTime < 310
      ? 0
      : animTime <= 355
      ? interpolate(animTime, 310, 355, 0, 1.0, eOpacity)
      : 1.0
    : 1.0;

  const activeChipLeft = isAnimating
    ? 4 + bgOffsetX
    : 4 + selectedIndex * slotWidth;
  const activeChipOpacity = isAnimating
    ? bgOpacity
    : 1.0;

  // 9. Scanner Bar & Viewfinder Animation:
  // Starts right after entrance settles (at 540ms)
  let scanTime = 0;
  if (isAnimating && animTime >= ENTRANCE_DURATION) {
    scanTime = Math.min(SCAN_ANIMATION_DURATION, animTime - ENTRANCE_DURATION);
  } else if (manualScanTime !== null) {
    scanTime = manualScanTime;
  }
  const scannerLineOffsetY = getScannerLineOffsetY(scanTime);

  const handleScannerClick = () => {
    onScanClick?.();
    if (!isAnimating) {
      if (manualScanRef.current) {
        cancelAnimationFrame(manualScanRef.current);
      }
      let start: number | null = null;
      const duration = SCAN_ANIMATION_DURATION;
      const step = (ts: number) => {
        if (!start) start = ts;
        const el = (ts - start) * speed;
        const cur = Math.min(el, duration);
        setManualScanTime(cur);
        if (el < duration) {
          manualScanRef.current = requestAnimationFrame(step);
        } else {
          setManualScanTime(null);
        }
      };
      manualScanRef.current = requestAnimationFrame(step);
    }
  };

  return (
    <div
      id="pop-bottom-nav-container"
      className={`${
        isFixed
          ? 'fixed bottom-0 left-0 right-0 z-50 px-3 pb-3 pt-1'
          : 'relative z-30 w-full'
      } flex flex-col items-center justify-center pointer-events-auto select-none ${className}`}
    >
      {/* Interactive Replay Controller Badge (only if showInlineReplayButton is true) */}
      {showInlineReplayButton && (
        <div className="mb-2 flex items-center gap-1.5 opacity-85 hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={playAnimation}
            className="flex items-center gap-1.5 px-3.5 py-1 bg-[#1c202a]/95 text-neutral-300 hover:text-white rounded-full text-[11px] font-medium border border-white/10 shadow-lg backdrop-blur-md active:scale-95 transition-transform"
          >
            <RotateCcw className="w-3 h-3 text-orange-400" />
            <span>Replay Pill Animation</span>
          </button>
        </div>
      )}

      {/* Main bar row wrapper */}
      <div className="w-full max-w-[360px] flex items-center justify-between gap-3 relative">
        {/* Main 4-tab pill capsule container with scale & expansion choreography */}
        <div
          ref={barRef}
          id="pop-bottom-tabs-bar"
          className="relative flex-1 min-w-0 h-[54px] flex items-center z-10"
          style={{
            transform: `translate(${tabsOffsetX}px, ${riseOffsetY}px) scale(${tabsScale})`,
            transformOrigin: '50% 50%',
          }}
        >
          {/* Symmetrically Expanding Capsule with Strictly Clipped Content */}
          <div
            id="pop-capsule-body"
            className="absolute h-full rounded-full bg-gradient-to-b from-[#1c1f26] via-[#14161a] to-[#0d0f12] border border-[#2b2f3a]/80 shadow-[0_8px_32px_rgba(0,0,0,0.7)] overflow-hidden pointer-events-auto"
            style={{
              width: isAnimating && animTime < 291 ? `${currentCapsuleWidth}px` : '100%',
              left: isAnimating && animTime < 291 ? `${capsuleLeft}px` : '0px',
              transition: isAnimating
                ? 'none'
                : 'width 200ms cubic-bezier(0.4, 0, 0.2, 1), left 200ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {/* Inner coordinate container mapped 1:1 with bar coordinates */}
            <div
              className="absolute top-0 bottom-0 pointer-events-none"
              style={{
                left: isAnimating && animTime < 291 ? `${-capsuleLeft}px` : '0px',
                width: isAnimating && animTime < 291 ? `${targetFinalWidth}px` : '100%',
              }}
            >
              {/* Active Tab Chip (Highlight Pill):
                  During animation, Home's active chip slides from right (+142px) with fast-out slow-in curve 310-535ms;
                  After settling, tab switching smoothly slides the chip using FastOutSlowIn cubic-bezier(0.2, 0.0, 0.2, 1) */}
              <div
                id="active-chip-indicator"
                className="absolute top-1 bottom-1 rounded-full bg-[#222730] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] pointer-events-none z-10"
                style={{
                  left: `${activeChipLeft}px`,
                  width: `${slotWidth}px`,
                  opacity: activeChipOpacity,
                  transition: isAnimating
                    ? 'none'
                    : 'left 240ms cubic-bezier(0.2, 0.0, 0.2, 1.0), opacity 150ms ease',
                }}
              />

              {/* Individual Tabs:
                  Strictly clipped within the capsule boundary with their specified slide & fade-in choreographies */}
              {tabs.map((tab, index) => {
                const isSelected = selectedTab === tab.id;
                const baseLeft = 4 + index * slotWidth;
                const currentX = isAnimating ? baseLeft + navItemOffsets[index] : baseLeft;
                const currentAlpha = isAnimating ? navItemAlphas[index] : 1.0;

                return (
                  <button
                    key={tab.id}
                    ref={(el) => {
                      if (el) tabItemRefs.current.set(tab.id, el);
                      else tabItemRefs.current.delete(tab.id);
                    }}
                    id={`bottom-nav-tab-${tab.id}`}
                    type="button"
                    onClick={() => onSelectTab?.(tab.id)}
                    className="absolute top-1 bottom-1 flex flex-col items-center justify-center rounded-full transition-colors active:scale-95 z-20 pointer-events-auto"
                    style={{
                      left: `${currentX}px`,
                      width: `${slotWidth}px`,
                      opacity: currentAlpha,
                      pointerEvents: isAnimating && animTime < ENTRANCE_DURATION ? 'none' : 'auto',
                      transition: isAnimating ? 'none' : 'color 150ms ease',
                    }}
                  >
                    <div
                      className={`flex items-center justify-center mb-0.5 ${
                        isSelected ? 'text-white' : 'text-[#727885] hover:text-[#9ea4b3]'
                      }`}
                    >
                      {tab.icon}
                    </div>
                    <span
                      className={`text-[11px] leading-none tracking-tight ${
                        isSelected ? 'font-semibold text-white' : 'font-medium text-[#727885]'
                      }`}
                    >
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Floating End Sticky QR/Barcode Scanner Button */}
        <div
          id="pop-scanner-wrapper"
          className="shrink-0 relative z-20"
          style={{
            transform: `translate(${buttonOffsetX}px, ${riseOffsetY}px) scale(${buttonScale})`,
            transformOrigin: '50% 50%',
            transition: isAnimating ? 'none' : 'transform 200ms ease',
          }}
        >
          <button
            id="pop-scanner-action-button"
            type="button"
            onClick={handleScannerClick}
            aria-label="Scan QR Code"
            className="relative w-[54px] h-[54px] rounded-full text-[#111215] flex items-center justify-center shadow-[0_4px_24px_rgba(0,0,0,0.6),0_1px_3px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.85)] border border-white/50 active:scale-95 active:brightness-95 transition-transform overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #ffffff 0%, #edf0f5 25%, #dfe2ea 50%, #c4c8d3 75%, #abb0bd 100%)',
            }}
          >
            {/* Viewfinder: 4 Corner Brackets + Animated Scanner Bar with 1.8px Background Mask */}
            <svg
              id="scanner-icon-graphic"
              className="w-[26px] h-[26px] pointer-events-none"
              viewBox="0 0 24 24"
              fill="none"
              style={{
                opacity: scannerIconOpacity,
              }}
            >
              <defs>
                {/* Matches the metallic gradient on the scanner button */}
                <linearGradient id="scanner-bg-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="25%" stopColor="#edf0f5" />
                  <stop offset="50%" stopColor="#dfe2ea" />
                  <stop offset="75%" stopColor="#c4c8d3" />
                  <stop offset="100%" stopColor="#abb0bd" />
                </linearGradient>

                {/* Dynamic cutout mask carving a 1.8px (1.5-2px) clearance through the corner brackets */}
                <mask id="scanner-line-cutout-mask">
                  <rect x="-10" y="-10" width="44" height="44" fill="white" />
                  <g
                    style={{
                      transform: `translateY(${scannerLineOffsetY}px)`,
                      transformOrigin: '12px 12px',
                    }}
                  >
                    <line
                      x1="1.4"
                      y1="12"
                      x2="22.6"
                      y2="12"
                      stroke="black"
                      strokeWidth="6.2"
                      strokeLinecap="round"
                    />
                  </g>
                </mask>
              </defs>

              {/* Static Viewfinder: 4 Symmetrical Corner Brackets with cutout mask */}
              <g
                id="scanner-corner-brackets"
                stroke="#111215"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                mask="url(#scanner-line-cutout-mask)"
              >
                {/* Top-Left Corner */}
                <path d="M 3.2 8.0 V 5.8 A 2.6 2.6 0 0 1 5.8 3.2 H 8.0" />
                {/* Top-Right Corner */}
                <path d="M 16.0 3.2 H 18.2 A 2.6 2.6 0 0 1 20.8 5.8 V 8.0" />
                {/* Bottom-Left Corner */}
                <path d="M 3.2 16.0 V 18.2 A 2.6 2.6 0 0 0 5.8 20.8 H 8.0" />
                {/* Bottom-Right Corner */}
                <path d="M 16.0 20.8 H 18.2 A 2.6 2.6 0 0 0 20.8 18.2 V 16.0" />
              </g>

              {/* Animated Layer: Scanner Bar + 1.8px Background/White Mask */}
              <g
                id="scanner-animated-layer"
                style={{
                  transform: `translateY(${scannerLineOffsetY}px)`,
                  transformOrigin: '12px 12px',
                }}
              >
                {/* White / scanner background mask (1.8px margin around the 2.6px line: strokeWidth = 2.6 + 2 * 1.8 = 6.2px) */}
                <line
                  id="scanner-bar-bg-mask"
                  x1="1.4"
                  y1="12"
                  x2="22.6"
                  y2="12"
                  stroke="url(#scanner-bg-gradient)"
                  strokeWidth="6.2"
                  strokeLinecap="round"
                />
                {/* Scanner Bar (bold horizontal line with round caps, extending past corners) */}
                <line
                  id="scanner-bar-line"
                  x1="1.4"
                  y1="12"
                  x2="22.6"
                  y2="12"
                  stroke="#111215"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                />
              </g>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
});

PopBottomBar.displayName = 'PopBottomBar';

export default PopBottomBar;
