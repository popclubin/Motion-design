import React, { useMemo, useRef } from 'react';
import { motion, AnimatePresence, type TargetAndTransition, type Transition } from 'motion/react';
import type { NumberDisplayConfig } from '../types';

export interface NumberDisplayProps {
  rawNumber: string;
  formattedNumber: string;
  isSlowMo: boolean;
  config: NumberDisplayConfig;
}

const STROKE_EROSION_PX = 2.4;
/** isSlowMo stretches both the spawn and exit durations by this factor (0.30s -> 0.70s, 0.15s -> 0.35s). */
const SLOWMO_FACTOR = 7 / 3;

/**
 * Computes the exact CSS font weight and stroke styles.
 * - For variable fonts (Outfit/Figtree): uses native variable font axes (100..900).
 * - For font.otf (static single-weight bold): weights < 500 erode into a hairline with
 *   a black stroke; weights > 500 expand outward with a white stroke to look heavier.
 */
export function getWeightStyle(w: number, isVar: boolean, erosionPx: number = STROKE_EROSION_PX) {
  if (isVar) {
    return {
      fontWeight: w,
      webkitTextStrokeWidth: '0px',
      webkitTextStrokeColor: 'transparent',
    };
  }

  if (w <= 500) {
    const stroke = (((500 - w) / 400) * erosionPx).toFixed(2);
    return {
      fontWeight: w,
      webkitTextStrokeWidth: `${stroke}px`,
      webkitTextStrokeColor: '#000000',
    };
  }

  const stroke = (((w - 500) / 450) * 2.8).toFixed(2);
  return {
    fontWeight: w,
    webkitTextStrokeWidth: `${stroke}px`,
    webkitTextStrokeColor: '#ffffff',
  };
}

/**
 * NumberDisplay:
 * - Empty state: only the Rupee symbol (₹), centered.
 * - On first digit: the Rupee symbol animates from center to top-left of the digits.
 * - Typing: new digit spawns small and springs up to scale 1, weight ramps from a
 *   hairline up to the target weight; preceding digits slide left.
 * - Backspacing: the deleted digit de-scales in place (digits do not shift back right).
 */
export const NumberDisplay: React.FC<NumberDisplayProps> = ({
  rawNumber,
  formattedNumber,
  isSlowMo,
  config,
}) => {
  const prevRawRef = useRef<string>('');
  const charIdsRef = useRef<string[]>([]);
  const nextIdRef = useRef<number>(1);
  const newestTokenKeyRef = useRef<string | null>(null);

  const isVariableFont = config.fontMode === 'outfit' || config.fontMode === 'figtree';
  const hasAmount = rawNumber.length > 0;

  const animDuration = isSlowMo ? config.speedIn * SLOWMO_FACTOR : config.speedIn;
  const exitDuration = isSlowMo ? config.speedOut * SLOWMO_FACTOR : config.speedOut;

  const springTransition = useMemo(
    () => ({
      type: 'spring' as const,
      stiffness: config.springStiffness,
      damping: config.springDamping,
      mass: config.springMass,
      layout: {
        type: 'spring' as const,
        stiffness: config.springStiffness,
        damping: config.springDamping,
        mass: config.springMass,
      },
    }),
    [config.springStiffness, config.springDamping, config.springMass]
  );

  const fontClass =
    config.fontMode === 'outfit' ? 'font-outfit' : config.fontMode === 'figtree' ? 'font-figtree' : 'font-custom';

  const w100 = getWeightStyle(100, isVariableFont);
  const w500 = getWeightStyle(500, isVariableFont);
  const wPeak = getWeightStyle(Math.min(950, config.targetWeight + 50), isVariableFont);
  const wTarget = getWeightStyle(config.targetWeight, isVariableFont);

  // Synchronize stable unique keys with each character of rawNumber
  if (rawNumber !== prevRawRef.current) {
    const prev = prevRawRef.current;
    if (rawNumber === '') {
      charIdsRef.current = [];
      newestTokenKeyRef.current = null;
    } else if (rawNumber.startsWith(prev)) {
      const addedCount = rawNumber.length - prev.length;
      for (let i = 0; i < addedCount; i++) {
        const newId = `digit_tok_${nextIdRef.current++}`;
        charIdsRef.current.push(newId);
        newestTokenKeyRef.current = newId;
      }
    } else if (prev.startsWith(rawNumber)) {
      charIdsRef.current = charIdsRef.current.slice(0, rawNumber.length);
      newestTokenKeyRef.current = null;
    } else {
      charIdsRef.current = [];
      for (let i = 0; i < rawNumber.length; i++) {
        charIdsRef.current.push(`digit_tok_${nextIdRef.current++}`);
      }
      newestTokenKeyRef.current = charIdsRef.current[charIdsRef.current.length - 1] || null;
    }
    prevRawRef.current = rawNumber;
  }

  const displayTokens = useMemo(() => {
    if (!formattedNumber) return [];

    let rawIdx = 0;
    const result: Array<{
      key: string;
      char: string;
      isComma: boolean;
      isDot: boolean;
      isNew: boolean;
    }> = [];

    for (let i = 0; i < formattedNumber.length; i++) {
      const char = formattedNumber[i];
      if (char === ',') {
        if (!config.enableCommas) continue;
        const precedingToken = result[result.length - 1];
        const precedingId = precedingToken ? precedingToken.key : `idx_${rawIdx}`;
        result.push({ key: `comma_after_${precedingId}`, char: ',', isComma: true, isDot: false, isNew: false });
      } else {
        const isDot = char === '.';
        const stableId = charIdsRef.current[rawIdx] || `raw_${rawIdx}_${char}`;
        const isNew = stableId === newestTokenKeyRef.current;
        rawIdx++;
        result.push({ key: stableId, char, isComma: false, isDot, isNew });
      }
    }

    return result;
  }, [formattedNumber, config.enableCommas]);

  return (
    <div className="relative flex items-center justify-center min-h-[68px] sm:min-h-[80px] md:min-h-[88px] w-full px-4 select-none overflow-visible">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-[9999px] -top-[9999px] opacity-0 select-none font-custom"
      >
        0123456789.
      </div>

      <motion.div
        key="number-display-amount-row"
        layout
        transition={springTransition}
        className={`relative flex tracking-tight text-white ${fontClass} justify-center ${
          hasAmount ? 'items-start' : 'items-center text-4xl sm:text-5xl md:text-6xl'
        }`}
        style={{
          lineHeight: 1,
          fontSize: hasAmount ? `${config.digitFontSize}px` : undefined,
          transform: `scale(${config.elementScale})`,
        }}
      >
        <div className="relative flex items-baseline tracking-tight" style={{ lineHeight: 1 }}>
          <motion.span
            key="currency-symbol-rupee"
            layout
            transition={springTransition}
            className={`select-none shrink-0 ${
              hasAmount ? 'absolute right-full top-0 text-white' : 'relative self-center text-4xl sm:text-5xl md:text-6xl text-white'
            }`}
            style={{
              lineHeight: 1,
              fontFamily: "'Outfit', 'Figtree', sans-serif",
              fontSize: hasAmount ? `${config.rupeeFontSize}px` : undefined,
              fontWeight: config.rupeeFontWeight,
              ...(hasAmount
                ? { marginRight: `${config.rupeeGap}px`, transform: `translateY(${config.rupeeTopOffset}px)` }
                : {}),
            }}
          >
            ₹
          </motion.span>

          <AnimatePresence mode="popLayout" initial={false}>
            {displayTokens.map((token, index) => {
              if (token.isComma) {
                return (
                  <motion.span
                    key={token.key}
                    id={`comma-token-${index}`}
                    layout={false}
                    initial={{ y: config.commaOffsetY, opacity: 0, scale: 1 }}
                    animate={{ y: 0, opacity: config.commaOpacity, scale: 1 }}
                    exit={{ opacity: 0, y: 0, scale: 1, transition: { duration: 0 } }}
                    transition={{
                      duration: isSlowMo ? config.commaEnterDuration * SLOWMO_FACTOR : config.commaEnterDuration,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    style={{
                      transformOrigin: 'bottom center',
                      fontWeight: 300,
                      WebkitFontSmoothing: 'antialiased',
                      marginLeft: `${Math.max(1, config.digitSpacing * 0.35)}px`,
                      marginRight: `${Math.max(1.5, config.digitSpacing * 0.7)}px`,
                    }}
                    className={`inline-block select-none ${fontClass} font-light`}
                  >
                    ,
                  </motion.span>
                );
              }

              if (token.isDot) {
                return (
                  <motion.span
                    key={token.key}
                    id={`dot-token-${index}`}
                    layout="position"
                    initial={{ scale: config.initialScale, opacity: 0.75, y: 0 }}
                    animate={{ scale: [config.initialScale, config.springOvershoot, 1], opacity: 0.75, y: 0 }}
                    exit={{ scale: config.initialScale, opacity: 0, y: 0, transition: { duration: exitDuration, ease: 'easeOut' } }}
                    transition={{ duration: animDuration * 0.9, times: [0, 0.58, 1], ease: ['easeOut', 'easeInOut'] }}
                    style={{
                      transformOrigin: 'bottom center',
                      fontWeight: 400,
                      WebkitFontSmoothing: 'antialiased',
                      marginLeft: `${Math.max(1, config.digitSpacing * 0.4)}px`,
                      marginRight: `${Math.max(1, config.digitSpacing * 0.4)}px`,
                    }}
                    className={`inline-block select-none ${fontClass} opacity-75`}
                  >
                    .
                  </motion.span>
                );
              }

              return (
                <motion.span
                  key={token.key}
                  id={`digit-token-${index}`}
                  layout="position"
                  initial={
                    (token.isNew
                      ? {
                          scale: config.initialScale,
                          opacity: 1,
                          y: 0,
                          fontWeight: w100.fontWeight,
                          webkitTextStrokeWidth: w100.webkitTextStrokeWidth,
                          webkitTextStrokeColor: w100.webkitTextStrokeColor,
                        }
                      : false) as TargetAndTransition | false
                  }
                  animate={
                    (token.isNew
                      ? {
                          scale: [config.initialScale, config.springOvershoot, 1.0],
                          opacity: 1,
                          y: 0,
                          fontWeight: [100, 500, wPeak.fontWeight, wTarget.fontWeight],
                          webkitTextStrokeWidth: [
                            w100.webkitTextStrokeWidth,
                            w500.webkitTextStrokeWidth,
                            wPeak.webkitTextStrokeWidth,
                            wTarget.webkitTextStrokeWidth,
                          ],
                          webkitTextStrokeColor: [
                            w100.webkitTextStrokeColor,
                            w500.webkitTextStrokeColor,
                            wPeak.webkitTextStrokeColor,
                            wTarget.webkitTextStrokeColor,
                          ],
                        }
                      : {
                          scale: 1,
                          opacity: 1,
                          y: 0,
                          fontWeight: wTarget.fontWeight,
                          webkitTextStrokeWidth: wTarget.webkitTextStrokeWidth,
                          webkitTextStrokeColor: wTarget.webkitTextStrokeColor,
                        }) as TargetAndTransition
                  }
                  exit={{
                    scale: config.initialScale,
                    opacity: 0,
                    y: 0,
                    fontWeight: w100.fontWeight,
                    webkitTextStrokeWidth: w100.webkitTextStrokeWidth,
                    webkitTextStrokeColor: w100.webkitTextStrokeColor,
                    transition: { duration: exitDuration, ease: 'easeOut' },
                  } as TargetAndTransition}
                  transition={
                    (token.isNew
                      ? {
                          ...springTransition,
                          scale: { duration: animDuration, times: [0, 0.58, 1], ease: ['easeOut', 'easeInOut'] },
                          fontWeight: { duration: animDuration, times: [0, 0.4, 0.72, 1], ease: ['easeOut', 'easeInOut', 'easeOut'] },
                          webkitTextStrokeWidth: { duration: animDuration, times: [0, 0.4, 0.72, 1], ease: ['easeOut', 'easeInOut', 'easeOut'] },
                          webkitTextStrokeColor: { duration: animDuration, times: [0, 0.4, 0.72, 1] },
                        }
                      : springTransition) as Transition
                  }
                  style={{
                    transformOrigin: 'bottom center',
                    paintOrder: 'fill stroke',
                    WebkitFontSmoothing: 'antialiased',
                    fontFeatureSettings: '"tnum"',
                    marginLeft: `${config.digitSpacing / 2}px`,
                    marginRight: `${config.digitSpacing / 2}px`,
                  }}
                  className={`inline-block select-none ${fontClass}`}
                >
                  {token.char}
                </motion.span>
              );
            })}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default NumberDisplay;
