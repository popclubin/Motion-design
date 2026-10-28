import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Home, RotateCcw } from 'lucide-react';

export type NavTabId = 'home' | 'shop' | 'bills' | 'card';

export type EasingStyle = 'original' | 'linear' | 'smooth' | 'snappy';

// Custom tab vector icons matching attached design assets (ShopIconWrapper, BillIconWrapper, CardIconWrapper)
const ShopTabIcon: React.FC<{ className?: string }> = ({ className = 'w-[18px] h-[18px]' }) => (
  <svg
    viewBox="0 0 20 20"
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M10 0.833333C12.0189 0.833333 13.7018 2.26939 14.0845 4.17562C14.2701 4.1804 14.442 4.1868 14.6004 4.19922C15.0357 4.23336 15.4364 4.30711 15.8195 4.48893C16.417 4.77256 16.9169 5.22748 17.2551 5.7959C17.4719 6.16048 17.5825 6.55287 17.6571 6.98323C17.73 7.40349 17.7781 7.92179 17.8369 8.54899L18.3366 13.8818C18.4064 14.6257 18.464 15.2358 18.4684 15.7316C18.473 16.2362 18.4252 16.7043 18.2341 17.1492C17.9393 17.8351 17.423 18.4023 16.7676 18.7598C16.3426 18.9916 15.8811 19.0826 15.3784 19.1252C14.8844 19.167 14.2717 19.1667 13.5246 19.1667H6.47626C5.72911 19.1667 5.11646 19.167 4.62242 19.1252C4.1197 19.0826 3.65831 18.9915 3.23326 18.7598C2.57788 18.4023 2.06152 17.8351 1.76679 17.1492C1.57562 16.7043 1.52704 16.2362 1.5316 15.7316C1.53608 15.2358 1.59451 14.6257 1.66425 13.8818L2.16392 8.54899C2.22272 7.92177 2.2709 7.40349 2.34377 6.98323C2.41841 6.55283 2.52888 6.16051 2.74579 5.7959C3.08389 5.22758 3.58316 4.77257 4.18052 4.48893C4.56375 4.30702 4.96498 4.23336 5.40041 4.19922C5.55841 4.18683 5.72973 4.18041 5.91474 4.17562C6.29727 2.26934 7.98117 0.833479 10 0.833333ZM12.5 7.5V5.83333H7.50002V7.5C7.50002 7.96024 7.12693 8.33333 6.66669 8.33333C6.20659 8.33317 5.83336 7.96013 5.83336 7.5V5.84473C5.72386 5.84868 5.62353 5.85372 5.53062 5.861C5.19617 5.88723 5.02138 5.93492 4.89586 5.99447C4.59711 6.13628 4.34716 6.36375 4.17808 6.64795C4.10702 6.7674 4.0434 6.9372 3.98602 7.26807C3.9269 7.60906 3.8845 8.05121 3.82326 8.70443L3.32359 14.0381C3.25118 14.8104 3.20196 15.3383 3.19826 15.7471C3.19468 16.1464 3.2372 16.3502 3.29755 16.4909C3.44488 16.8338 3.70314 17.1178 4.03078 17.2965C4.16523 17.3699 4.36462 17.4313 4.76321 17.465C5.17058 17.4995 5.70043 17.5 6.47626 17.5H13.5246C14.3004 17.5 14.8303 17.4995 15.2377 17.465C15.6359 17.4313 15.8348 17.3698 15.9693 17.2965C16.297 17.1178 16.556 16.8339 16.7033 16.4909C16.7636 16.3502 16.8054 16.1464 16.8018 15.7471C16.7981 15.3383 16.7497 14.8104 16.6773 14.0381L16.1776 8.70443C16.1164 8.05123 16.074 7.60906 16.0148 7.26807C15.9575 6.93725 15.8938 6.7674 15.8228 6.64795C15.6537 6.36374 15.4038 6.13628 15.105 5.99447C14.9795 5.9349 14.8047 5.88725 14.4702 5.861C14.3771 5.8537 14.2764 5.84868 14.1667 5.84473V7.5C14.1667 7.96024 13.7936 8.33333 13.3334 8.33333C12.8733 8.33317 12.5 7.96013 12.5 7.5ZM10 2.5C8.912 2.50013 7.98913 3.19627 7.64569 4.16667H12.3552C12.0117 3.19615 11.0882 2.5 10 2.5Z" />
  </svg>
);

const BillTabIcon: React.FC<{ className?: string }> = ({ className = 'w-[18px] h-[18px]' }) => (
  <svg
    viewBox="0 0 20 20"
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M15.8333 6.49984C15.8333 5.78618 15.833 5.30097 15.8024 4.92594C15.7726 4.5606 15.7183 4.3735 15.6519 4.24316C15.4921 3.92962 15.237 3.67459 14.9235 3.51481C14.7932 3.4484 14.6061 3.39411 14.2407 3.36426C13.8657 3.33362 13.3805 3.33333 12.6668 3.33333H7.33317C6.61951 3.33333 6.13431 3.33362 5.75928 3.36426C5.39393 3.39411 5.20683 3.4484 5.0765 3.51481C4.76295 3.67459 4.50792 3.92962 4.34815 4.24316C4.28174 4.3735 4.22744 4.5606 4.19759 4.92594C4.16696 5.30097 4.16667 5.78618 4.16667 6.49984V15.8634L5.13509 15.1595L5.25309 15.0871C5.53978 14.9441 5.88923 14.977 6.14583 15.1823L7.73275 16.4518L9.51009 15.1595L9.62402 15.0895C9.89948 14.9502 10.2343 14.9737 10.4899 15.1595L12.2664 16.4518L13.8542 15.1823C14.1473 14.9478 14.5613 14.9387 14.8649 15.1595L15.8333 15.8634V6.49984ZM17.5 17.5C17.5 17.8134 17.3244 18.1008 17.0451 18.243C16.7658 18.3852 16.4302 18.3581 16.1768 18.1738L14.3994 16.8807L12.8125 18.151C12.5193 18.3856 12.1054 18.3946 11.8018 18.1738L10 16.8628L8.19824 18.1738C7.89459 18.3946 7.48067 18.3856 7.1875 18.151L5.59977 16.8807L3.82324 18.1738C3.56977 18.3581 3.23419 18.3852 2.95492 18.243C2.67564 18.1008 2.5 17.8134 2.5 17.5V6.49984C2.5 5.8136 2.49915 5.24869 2.53662 4.79004C2.5749 4.32166 2.65689 3.89075 2.86296 3.48633C3.18251 2.85924 3.69257 2.34918 4.31966 2.02962C4.72408 1.82356 5.15499 1.74156 5.62337 1.70329C6.08202 1.66581 6.64693 1.66667 7.33317 1.66667H12.6668C13.3531 1.66667 13.918 1.66581 14.3766 1.70329C14.845 1.74156 15.2759 1.82356 15.6803 2.02962C16.3074 2.34918 16.8175 2.85924 17.137 3.48633C17.3431 3.89075 17.4251 4.32166 17.4634 4.79004C17.5009 5.24869 17.5 5.8136 17.5 6.49984V17.5Z" />
    <path d="M8.33333 11.6667C8.79357 11.6667 9.16667 12.0398 9.16667 12.5C9.16667 12.9602 8.79357 13.3333 8.33333 13.3333H6.66667C6.20643 13.3333 5.83334 12.9602 5.83333 12.5C5.83333 12.0398 6.20643 11.6667 6.66667 11.6667H8.33333ZM11.6667 8.33333C12.1269 8.33333 12.5 8.70643 12.5 9.16667C12.5 9.6269 12.1269 10 11.6667 10H6.66667C6.20643 10 5.83333 9.6269 5.83333 9.16667C5.83333 8.70643 6.20643 8.33333 6.66667 8.33333H11.6667ZM13.3333 5C13.7936 5 14.1667 5.3731 14.1667 5.83333C14.1667 6.29357 13.7936 6.66667 13.3333 6.66667H6.66667C6.20643 6.66667 5.83333 6.29357 5.83333 5.83333C5.83333 5.3731 6.20643 5 6.66667 5H13.3333Z" />
  </svg>
);

const CardTabIcon: React.FC<{ className?: string }> = ({ className = 'w-[18px] h-[18px]' }) => (
  <svg
    viewBox="0 0 20 20"
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M17.5 9.16667H2.50001V13.1665C2.50001 13.647 2.50107 13.9574 2.52036 14.1935C2.53886 14.4198 2.57017 14.5039 2.59116 14.5451C2.67103 14.7017 2.79829 14.829 2.95493 14.9089C2.99613 14.9298 3.08017 14.9612 3.30649 14.9797C3.54261 14.9989 3.85305 15 4.33351 15H15.6665C16.147 15 16.4574 14.9989 16.6935 14.9797C16.9199 14.9612 17.0039 14.9298 17.0451 14.9089C17.2017 14.829 17.329 14.7017 17.4089 14.5451C17.4299 14.5039 17.4612 14.4198 17.4797 14.1935C17.499 13.9574 17.5 13.647 17.5 13.1665V9.16667ZM9.16668 10.8333C9.62692 10.8333 10 11.2064 10 11.6667C10 12.1269 9.62692 12.5 9.16668 12.5H5.00001C4.53978 12.5 4.16668 12.1269 4.16668 11.6667C4.16668 11.2064 4.53978 10.8333 5.00001 10.8333H9.16668ZM17.5 6.8335C17.5 6.35303 17.499 6.04259 17.4797 5.80648C17.4612 5.58016 17.4299 5.49611 17.4089 5.45492C17.329 5.29828 17.2017 5.17101 17.0451 5.09115C17.0039 5.07015 16.9199 5.03884 16.6935 5.02035C16.4574 5.00105 16.147 5 15.6665 5H4.33351C3.85305 5 3.54261 5.00105 3.30649 5.02035C3.08017 5.03884 2.99613 5.07015 2.95493 5.09115C2.79829 5.17101 2.67103 5.29827 2.59116 5.45492C2.57017 5.49611 2.53886 5.58016 2.52036 5.80648C2.50107 6.04259 2.50001 6.35304 2.50001 6.8335V7.5H17.5V6.8335ZM19.1667 13.1665C19.1667 13.6195 19.1676 14.0097 19.1415 14.3294C19.1145 14.6588 19.0547 14.9867 18.8941 15.3019C18.6544 15.7721 18.2721 16.1544 17.8019 16.394C17.4867 16.5547 17.1588 16.6145 16.8294 16.6414C16.5097 16.6676 16.1195 16.6667 15.6665 16.6667H4.33351C3.88055 16.6667 3.49031 16.6676 3.17059 16.6414C2.84121 16.6145 2.51334 16.5547 2.19809 16.394C1.72791 16.1544 1.34562 15.7721 1.10597 15.3019C0.945344 14.9867 0.885501 14.6588 0.858575 14.3294C0.832452 14.0097 0.833347 13.6195 0.833347 13.1665V6.8335C0.833347 6.38054 0.832452 5.9903 0.858575 5.67057C0.885501 5.34119 0.945344 5.01333 1.10597 4.69808C1.34562 4.22789 1.72791 3.8456 2.19809 3.60596C2.51334 3.44533 2.84121 3.38549 3.17059 3.35856C3.49031 3.33244 3.88055 3.33333 4.33351 3.33333H15.6665C16.1195 3.33333 16.5097 3.33244 16.8294 3.35856C17.1588 3.38549 17.4867 3.44533 17.8019 3.60596C18.2721 3.8456 18.6544 4.22789 18.8941 4.69808C19.0547 5.01333 19.1145 5.34119 19.1415 5.67057C19.1676 5.9903 19.1667 6.38054 19.1667 6.8335V13.1665Z" />
  </svg>
);

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

    const tabs: Array<{
      id: NavTabId;
      label: string;
      icon: React.ReactNode;
    }> = [
      {
        id: 'home',
        label: 'Home',
        icon: <Home className="w-[18px] h-[18px]" strokeWidth={2.2} />,
      },
      {
        id: 'shop',
        label: 'Shop',
        icon: <ShopTabIcon className="w-[18px] h-[18px]" />,
      },
      {
        id: 'bills',
        label: 'Bills',
        icon: <BillTabIcon className="w-[18px] h-[18px]" />,
      },
      {
        id: 'card',
        label: 'Card',
        icon: <CardTabIcon className="w-[18px] h-[18px]" />,
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
            className="absolute h-full rounded-full border border-[#2b2f3a]/80 shadow-[0_8px_32px_rgba(0,0,0,0.7)] overflow-hidden pointer-events-auto"
            style={{
              background: 'linear-gradient(to bottom, #252525 0%, #0E0E0E 100%)',
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
                className="absolute top-1 bottom-1 rounded-full pointer-events-none z-10"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
                      className={`text-[11px] leading-none tracking-tight pt-[2px] ${
                        isSelected ? 'font-semibold text-white' : 'font-medium text-[#727885]'
                      }`}
                      style={{ paddingTop: '2px' }}
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
                strokeWidth="2.0"
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
                  strokeWidth="2.0"
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
