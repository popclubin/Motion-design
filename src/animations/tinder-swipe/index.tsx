import { useEffect, useRef, useState } from 'react';
import type { AnimationComponentProps } from '../../types/animation';
import type { ExitingCard, ProductCard } from './types';
import { INITIAL_CARDS } from './data/cards';
import { AnimatedCounter, renderCardInner } from './components/CardVisuals';

const ASSET_BASE = '/animations/tinder-swipe';
const FONTS_STYLE_ID = 'tinder-swipe-fonts';

/** Injects the self-hosted Awesome Serif Italic + Figtree fonts once, scoped to this animation. */
function useScopedFonts() {
  useEffect(() => {
    if (document.getElementById(FONTS_STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = FONTS_STYLE_ID;
    style.textContent = `
      @font-face {
        font-family: 'Awesome Serif Italic';
        font-style: italic;
        font-weight: 700;
        font-display: swap;
        src: url('${ASSET_BASE}/fonts/AwesomeSerifItalic-Bold.otf') format('opentype');
      }
      @font-face {
        font-family: 'Awesome Serif Italic';
        font-style: italic;
        font-weight: 400;
        font-display: swap;
        src: url('${ASSET_BASE}/fonts/AwesomeSerifItalic-Regular.otf') format('opentype');
      }
      @font-face {
        font-family: 'TinderSwipeFigtree';
        font-style: normal;
        font-weight: 300 900;
        font-display: swap;
        src: url('${ASSET_BASE}/fonts/figtree-latin.woff2') format('woff2');
      }
      .tinder-swipe .font-\\['Figtree'\\] { font-family: 'TinderSwipeFigtree', sans-serif; }
    `;
    document.head.appendChild(style);
  }, []);
}

export default function TinderSwipe({ params }: AnimationComponentProps) {
  useScopedFonts();

  const animationDuration = Number(params.animationDuration ?? 600);
  const bezierX1 = Number(params.bezierX1 ?? 0.25);
  const bezierY1 = Number(params.bezierY1 ?? 1);
  const bezierX2 = Number(params.bezierX2 ?? 0.5);
  const bezierY2 = Number(params.bezierY2 ?? 1);
  const easing = `cubic-bezier(${bezierX1}, ${bezierY1}, ${bezierX2}, ${bezierY2})`;
  const swipeThreshold = Number(params.swipeThreshold ?? 80);
  const maxRotation = Number(params.maxRotation ?? 15);
  const rotationSensitivity = Number(params.rotationSensitivity ?? 160);
  const grayscaleDistance = Number(params.grayscaleDistance ?? 80);
  const maxYLimit = Number(params.maxYLimit ?? 40);
  const stackScaleStep = Number(params.stackScaleStep ?? 0.06);
  const stackOffsetStep = Number(params.stackOffsetStep ?? 20);
  const comeUpDuration = Number(params.comeUpDuration ?? 350);

  const [cards, setCards] = useState<ProductCard[]>(INITIAL_CARDS);
  const [history, setHistory] = useState<{ card: ProductCard; direction: 'left' | 'right' }[]>([]);
  const [rightSwipeCount, setRightSwipeCount] = useState(0);
  const [hasSwipedFirstCard, setHasSwipedFirstCard] = useState(false);

  const [exitingCards, setExitingCards] = useState<ExitingCard[]>([]);
  const [undoing, setUndoing] = useState<'left' | 'right' | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const startPos = useRef({ x: 0, y: 0 });
  const dragX = useRef(0);
  const dragY = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const hasTriggeredHaptic = useRef(false);

  const clampY = (rawY: number) => {
    if (Math.abs(rawY) <= maxYLimit) return rawY;
    const sign = rawY > 0 ? 1 : -1;
    const overflow = Math.abs(rawY) - maxYLimit;
    return sign * (maxYLimit + Math.log10(1 + overflow) * 8);
  };

  const executeSwipe = (direction: 'left' | 'right') => {
    if (cards.length === 0 || undoing) return;

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(20);
    }

    const topCard = cards[0];
    const startX = dragX.current;
    const startY = clampY(dragY.current * 0.4);
    const startRot = Math.min(maxRotation, Math.max(-maxRotation, (dragX.current / rotationSensitivity) * maxRotation));
    const startGrayscale = startX < 0 ? Math.min(100, (Math.abs(startX) / grayscaleDistance) * 100) : 0;

    const exitId = `${topCard.id}-${Date.now()}`;

    setExitingCards((prev) => [...prev, { card: topCard, direction, id: exitId, startX, startY, startRot, startGrayscale, animating: false }]);
    setCards((prev) => prev.slice(1));
    setHistory((prev) => [{ card: topCard, direction }, ...prev]);

    if (topCard.isInstruction) {
      setHasSwipedFirstCard(true);
    } else if (direction === 'right') {
      setRightSwipeCount((c) => c + 1);
    }

    dragX.current = 0;
    dragY.current = 0;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setExitingCards((prev) => prev.map((item) => (item.id === exitId ? { ...item, animating: true } : item)));
      });
    });

    setTimeout(() => {
      setExitingCards((prev) => prev.filter((item) => item.id !== exitId));
    }, animationDuration);
  };

  const handleUndo = () => {
    if (history.length === 0 || !hasSwipedFirstCard || undoing) return;
    const lastAction = history[0];

    setHistory((prev) => prev.slice(1));
    setCards((prev) => [lastAction.card, ...prev]);

    if (!lastAction.card.isInstruction && lastAction.direction === 'right') {
      setRightSwipeCount((c) => Math.max(0, c - 1));
    }
    if (lastAction.card.isInstruction) {
      setHasSwipedFirstCard(false);
    }

    setUndoing(lastAction.direction);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setUndoing(null);
      });
    });
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (undoing || cards.length === 0) return;
    setIsDragging(true);
    hasTriggeredHaptic.current = false;
    startPos.current = { x: e.clientX, y: e.clientY };
    cardRef.current?.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    dragX.current = e.clientX - startPos.current.x;
    dragY.current = e.clientY - startPos.current.y;

    const x = dragX.current;
    const rawY = dragY.current * 0.4;
    const finalY = clampY(rawY);

    if (Math.abs(rawY) > maxYLimit) {
      if (!hasTriggeredHaptic.current) {
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(15);
        hasTriggeredHaptic.current = true;
      }
    } else {
      hasTriggeredHaptic.current = false;
    }

    const rotateAngle = Math.min(maxRotation, Math.max(-maxRotation, (x / rotationSensitivity) * maxRotation));

    if (cardRef.current) {
      cardRef.current.style.transform = `translate3d(${x}px, ${finalY}px, 0) rotate(${rotateAngle}deg)`;
      cardRef.current.style.transition = 'none';
      const grayscaleValue = x < 0 ? Math.min(100, (Math.abs(x) / grayscaleDistance) * 100) : 0;
      cardRef.current.style.filter = `grayscale(${grayscaleValue}%)`;
      cardRef.current.style.opacity = '1';
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    cardRef.current?.releasePointerCapture(e.pointerId);

    const x = dragX.current;
    if (Math.abs(x) > swipeThreshold) {
      executeSwipe(x > 0 ? 'right' : 'left');
    } else {
      dragX.current = 0;
      dragY.current = 0;
      if (cardRef.current) {
        cardRef.current.style.transform = 'translate3d(0, 0, 0) rotate(0deg)';
        cardRef.current.style.filter = 'grayscale(0%)';
        cardRef.current.style.opacity = '1';
        cardRef.current.style.transition = `transform ${animationDuration}ms ${easing}, filter ${animationDuration}ms ${easing}`;
      }
    }
  };

  const progressRatio = Math.min(1, rightSwipeCount / 10);
  const radius = 33;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressRatio * circumference;
  const isProceedArrowReady = rightSwipeCount >= 3;
  const visibleCards = cards.slice(0, 4);

  return (
    <div className="tinder-swipe relative flex h-full w-full items-center justify-center bg-neutral-950/40 select-none">
      <div
        className="relative flex-shrink-0 bg-neutral-900 shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
        style={{ aspectRatio: '9.5 / 19.5', height: '90%', maxHeight: '100%', maxWidth: '100%', borderRadius: 54, border: '12px solid #1c1c1e' }}
      >
        <div className="absolute top-[108px] -left-[2px] h-16 w-[3px] rounded-l-sm bg-[#1c1c1e]" />
        <div className="absolute top-[180px] -left-[2px] h-10 w-[3px] rounded-l-sm bg-[#1c1c1e]" />
        <div className="absolute top-[140px] -right-[2px] h-20 w-[3px] rounded-r-sm bg-[#1c1c1e]" />

        <div className="relative h-full w-full overflow-hidden rounded-[42px] bg-[#0D0D0D]">
          <div className="bg-[#0D0D0D] relative overflow-hidden flex flex-col justify-between h-full w-full" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
            <img decoding="async" alt="" className="absolute inset-0 w-full h-full object-cover object-top pointer-events-none z-0" src={`${ASSET_BASE}/chat-bg.jpg`} style={{ opacity: 0.65 }} />
            <div
              className="absolute inset-0 pointer-events-none z-0"
              style={{ background: 'radial-gradient(65% 42% at 50% 50%, rgba(255,64,20,0.18) 0%, rgba(180,20,0,0.08) 45%, transparent 78%)', mixBlendMode: 'screen' }}
            />

            <div className="flex justify-between items-center px-4 pb-2 relative z-10 w-full" style={{ paddingTop: '16px' }}>
              <button className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-black/20" style={{ cursor: 'default' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="#E6E6E6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <div className="flex gap-2 items-center">
                <button className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-black/20">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M4 8H20M4 16H20" stroke="#E6E6E6" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
                <div
                  className="flex gap-[4px] items-center justify-center rounded-full px-3 py-1 border border-white/5"
                  style={{ background: 'radial-gradient(circle at 50% -28%, rgba(70,70,70,1) 17.5%, rgba(50,50,50,1) 55%, rgba(31,31,31,1) 93%)' }}
                >
                  <img decoding="async" alt="" style={{ width: 14, height: 14, flexShrink: 0 }} src={`${ASSET_BASE}/pop-coin.png`} />
                  <span className="font-['Figtree'] font-semibold leading-[20px] text-[13px] text-[#e6e6e6]">2.9k</span>
                </div>
              </div>
            </div>

            <div className="text-center px-4 relative z-10 shrink-0 select-none">
              <h1 className="text-4xl text-[#FFFFFF] select-none" style={{ fontFamily: "'Awesome Serif Italic', serif", fontStyle: 'italic', fontWeight: 700 }}>
                Swipe to refine
              </h1>
              <p className="font-['Figtree'] text-[13px] text-white mt-1 select-none">Every right swipe tells us what you love</p>
            </div>

            <div className="relative flex-1 flex items-center justify-center px-4 select-none mt-2 mb-2 z-10 overflow-visible">
              {cards.length === 0 && exitingCards.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center px-6 py-12 rounded-[16px] border border-white/10 bg-black/40 backdrop-blur-md w-[240px] h-[320px] z-10 shadow-[0_25px_80px_2px_rgba(0,0,0,0.95)]">
                  <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mb-4 border border-orange-500/30">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#FF5200" strokeWidth="2" />
                      <path d="M8 12L11 15L16 9" stroke="#FF5200" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3 className="font-['Figtree'] text-lg font-bold text-white mb-2">All Refined!</h3>
                  <p className="font-['Figtree'] text-xs text-[#8C8C8C] max-w-[200px]">We have custom-tailored suggestions ready for you based on your swipes!</p>
                </div>
              ) : (
                <div className="relative w-[240px] h-[320px] select-none flex items-center justify-center overflow-visible">
                  {visibleCards.map((card, idx) => {
                    const stackIdx = undoing ? idx - 1 : idx;
                    const isTop = idx === 0;

                    const scale = isTop ? 1 : Math.max(0, 1 - stackIdx * stackScaleStep);
                    const translateY = isTop ? 0 : stackIdx * stackOffsetStep;
                    const containerOpacity = stackIdx >= 3 ? 0 : 1;
                    const depthDarkness = stackIdx === 0 ? 0 : Math.min(0.65, stackIdx * 0.25);

                    let filterStyle = 'grayscale(0%)';
                    let transformStyle = `translate3d(0px, ${translateY}px, 0) scale(${scale}) rotate(0deg)`;
                    let transitionStyle = `transform ${comeUpDuration}ms ${easing}, opacity ${comeUpDuration}ms ${easing}, filter ${comeUpDuration}ms ${easing}`;

                    if (isTop) {
                      if (undoing === 'left') {
                        transformStyle = 'translate3d(-150%, 15%, 0) rotate(-15deg)';
                        filterStyle = 'grayscale(100%)';
                        transitionStyle = 'none';
                      } else if (undoing === 'right') {
                        transformStyle = 'translate3d(150%, 15%, 0) rotate(15deg)';
                        transitionStyle = 'none';
                      }
                    }

                    if (undoing !== null || (isTop && isDragging)) {
                      transitionStyle = 'none';
                    }

                    return (
                      <div
                        key={card.id}
                        ref={isTop ? cardRef : null}
                        onPointerDown={isTop ? handlePointerDown : undefined}
                        onPointerMove={isTop ? handlePointerMove : undefined}
                        onPointerUp={isTop ? handlePointerUp : undefined}
                        className="absolute rounded-[16px] overflow-hidden select-none shadow-[0_25px_80px_2px_rgba(0,0,0,0.95)] bg-black"
                        style={{
                          width: '100%',
                          height: '100%',
                          zIndex: 15 - idx,
                          opacity: containerOpacity,
                          transform: transformStyle,
                          filter: filterStyle,
                          transition: transitionStyle,
                          cursor: isTop ? 'grab' : 'auto',
                          touchAction: 'none',
                          border: '1px solid rgba(255,255,255,0.1)',
                        }}
                      >
                        <div
                          className="absolute inset-0 bg-black z-40 pointer-events-none rounded-[16px]"
                          style={{ opacity: depthDarkness, transition: transitionStyle === 'none' ? 'none' : `opacity ${animationDuration}ms ${easing}` }}
                        />
                        {renderCardInner(card)}
                      </div>
                    );
                  })}

                  {exitingCards.map((exit) => {
                    const targetX = exit.direction === 'right' ? '150%' : '-150%';
                    const targetRot = exit.direction === 'right' ? maxRotation : -maxRotation;
                    const targetGrayscale = exit.direction === 'left' ? 100 : exit.startGrayscale;

                    const currentTransform = exit.animating
                      ? `translate3d(${targetX}, 15%, 0) rotate(${targetRot}deg)`
                      : `translate3d(${exit.startX}px, ${exit.startY}px, 0) rotate(${exit.startRot}deg)`;
                    const currentFilter = exit.animating ? `grayscale(${targetGrayscale}%)` : `grayscale(${exit.startGrayscale}%)`;

                    return (
                      <div
                        key={exit.id}
                        className="absolute rounded-[16px] overflow-hidden select-none shadow-[0_25px_80px_2px_rgba(0,0,0,0.95)] bg-black pointer-events-none"
                        style={{
                          width: '100%',
                          height: '100%',
                          zIndex: 50,
                          opacity: 1,
                          border: '1px solid rgba(255,255,255,0.1)',
                          transform: currentTransform,
                          filter: currentFilter,
                          transition: exit.animating ? `transform ${animationDuration}ms ${easing}, filter ${animationDuration}ms ${easing}` : 'none',
                        }}
                      >
                        {renderCardInner(exit.card)}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex flex-col items-center justify-center pt-2 relative z-10 shrink-0 select-none" style={{ paddingBottom: '16px' }}>
              <div className="flex items-center justify-center gap-6 mb-4">
                <button
                  onClick={handleUndo}
                  disabled={!hasSwipedFirstCard || history.length === 0}
                  className="flex items-center justify-center w-[40px] h-[40px] rounded-full transition-all border"
                  style={{
                    background: 'rgba(22, 22, 22, 0.4)',
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                    cursor: hasSwipedFirstCard && history.length > 0 ? 'pointer' : 'not-allowed',
                    opacity: hasSwipedFirstCard && history.length > 0 ? 1 : 0.35,
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M3 10H14C17.866 10 21 13.134 21 17C21 20.866 17.866 24 14 24" stroke="#E6E6E6" strokeWidth="2" strokeLinecap="round" />
                    <path d="M8 5L3 10L8 15" stroke="#E6E6E6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                <div className="relative w-[76px] h-[76px] flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                    <circle cx="38" cy="38" r={radius} fill="transparent" stroke="rgba(255, 255, 255, 0.13)" strokeWidth="1" />
                    {hasSwipedFirstCard && (
                      <circle
                        cx="38"
                        cy="38"
                        r={radius}
                        fill="transparent"
                        stroke="url(#progressGradient)"
                        strokeWidth="4"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-300 ease-out"
                      />
                    )}
                    <defs>
                      <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#F3522A" />
                        <stop offset="100%" stopColor="#8D1818" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {isProceedArrowReady ? (
                    <button className="absolute w-[51px] h-[51px] rounded-full bg-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      onClick={() => !undoing && executeSwipe('left')}
                      disabled={!hasSwipedFirstCard}
                      className="absolute w-[54px] h-[54px] rounded-full flex items-center justify-center transition-all"
                      style={{ cursor: hasSwipedFirstCard ? 'pointer' : 'not-allowed', opacity: hasSwipedFirstCard ? 1 : 0.35 }}
                    >
                      <img src={`${ASSET_BASE}/swipe.svg`} className="w-5 h-5 object-contain" style={{ filter: 'brightness(0.9) contrast(1.1)' }} alt="Swipe" />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => !undoing && executeSwipe('right')}
                  disabled={!hasSwipedFirstCard}
                  className="flex items-center justify-center w-[40px] h-[40px] rounded-full transition-all border"
                  style={{
                    background: 'rgba(22, 22, 22, 0.4)',
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                    cursor: hasSwipedFirstCard ? 'pointer' : 'not-allowed',
                    opacity: hasSwipedFirstCard ? 1 : 0.35,
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="#E6E6E6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              <div className="h-6 flex items-center justify-center">
                {rightSwipeCount < 3 ? (
                  <p className="font-['Figtree'] text-[14px] text-[#8C8C8C] flex items-center gap-0.5">
                    <span>Min.</span>
                    <AnimatedCounter value={3 - rightSwipeCount} color="#FFFFFF" fontWeight={500} fontSize="14px" />
                    <span>right {3 - rightSwipeCount === 1 ? 'swipe' : 'swipes'} to refine</span>
                  </p>
                ) : rightSwipeCount < 10 ? (
                  <p className="font-['Figtree'] text-[14px] text-[#8C8C8C] flex items-center gap-1">
                    <AnimatedCounter value={10 - rightSwipeCount} color="#FFFFFF" fontWeight={500} fontSize="14px" />
                    <span className="text-white font-bold">more</span>
                    <span>right {10 - rightSwipeCount === 1 ? 'swipe' : 'swipes'} for best results</span>
                  </p>
                ) : (
                  <p className="font-['Figtree'] text-[14px] font-semibold text-white tracking-wide">
                    Refinement complete! <span className="text-[#FF5200]">Tap arrow to proceed</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
