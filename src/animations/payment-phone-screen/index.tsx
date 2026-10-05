import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, Delete, Link2, Play } from 'lucide-react';
import { usePlayback } from '../_core/usePlayback';
import type { AnimationComponentProps } from '../../types/animation';
import type { NumberDisplayConfig } from './types';
import { NumberDisplay } from './components/NumberDisplay';

const FONT_ASSET_URL = '/animations/payment-phone-screen/font.otf';
const FONTS_STYLE_ID = 'payment-phone-screen-fonts';

/** Injects the custom font + Google Fonts once, scoped to this animation's class names. */
function useScopedFonts() {
  useEffect(() => {
    if (document.getElementById(FONTS_STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = FONTS_STYLE_ID;
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..900;1,300..900&family=Outfit:wght@100..900&display=swap');
      @font-face {
        font-family: 'PaymentScreenCustomFont';
        src: url('${FONT_ASSET_URL}') format('opentype');
        font-weight: 100 900;
        font-display: block;
      }
      .payment-phone-screen .font-custom { font-family: 'PaymentScreenCustomFont', 'Outfit', 'Figtree', sans-serif; }
      .payment-phone-screen .font-outfit { font-family: 'Outfit', 'Figtree', sans-serif; }
      .payment-phone-screen .font-figtree { font-family: 'Figtree', sans-serif; }
    `;
    document.head.appendChild(style);
  }, []);
}

/** Formats a raw digit string into the Indian currency numbering system (e.g. 1,23,456.78). */
function formatIndianCurrency(raw: string): string {
  if (!raw) return '';

  const parts = raw.split('.');
  const integerPart = parts[0];
  const decimalPart = parts.length > 1 ? '.' + parts[1] : '';

  if (integerPart.length === 0) {
    return decimalPart ? '0' + decimalPart : '';
  }
  if (integerPart.length <= 3) {
    return integerPart + decimalPart;
  }

  const lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  const formattedOthers = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');

  return `${formattedOthers},${lastThree}${decimalPart}`;
}

const KEYPAD_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'backspace'];

export default function PaymentPhoneScreen({ params }: AnimationComponentProps) {
  const { isPaused } = usePlayback();
  useScopedFonts();

  const isSlowMo = Boolean(params.isSlowMo ?? false);
  const enableCommas = Boolean(params.enableCommas ?? true);
  const autoTypeInterval = Number(params.autoTypeInterval ?? 340);

  const displayConfig: NumberDisplayConfig = {
    fontMode: (params.fontMode as NumberDisplayConfig['fontMode']) ?? 'custom',
    targetWeight: Number(params.targetWeight ?? 400),
    digitSpacing: Number(params.digitSpacing ?? 2),
    digitFontSize: Number(params.digitFontSize ?? 64),
    elementScale: Number(params.elementScale ?? 1.0),
    initialScale: Number(params.initialScale ?? 0.3),
    speedIn: Number(params.speedIn ?? 0.3),
    speedOut: Number(params.speedOut ?? 0.15),
    springStiffness: Number(params.springStiffness ?? 540),
    springDamping: Number(params.springDamping ?? 26),
    springMass: Number(params.springMass ?? 0.45),
    springOvershoot: Number(params.springOvershoot ?? 1.08),
    enableCommas,
    commaOffsetY: Number(params.commaOffsetY ?? 16),
    commaOpacity: Number(params.commaOpacity ?? 1.0),
    commaEnterDuration: Number(params.commaEnterDuration ?? 0.32),
    rupeeFontSize: Number(params.rupeeFontSize ?? 42),
    rupeeFontWeight: Number(params.rupeeFontWeight ?? 500),
    rupeeGap: Number(params.rupeeGap ?? 0),
    rupeeTopOffset: Number(params.rupeeTopOffset ?? 0),
  };

  const [rawNumber, setRawNumber] = useState('');
  const lastDemoRef = useRef<number | undefined>(undefined);

  const handleKeyInput = useCallback((key: string) => {
    setRawNumber((prev) => {
      if (key === 'backspace') {
        if (prev.length <= 1) return '';
        return prev.slice(0, -1);
      }

      if (key === '.') {
        if (prev.includes('.')) return prev;
        return prev === '' ? '0.' : prev + '.';
      }

      if (/^[0-9]$/.test(key)) {
        const digitsOnly = prev.replace(/\./g, '');
        if (digitsOnly.length >= 7) return prev;

        if (prev.includes('.')) {
          const [, dec] = prev.split('.');
          if (dec && dec.length >= 2) return prev;
        }

        if (prev === '0' && key === '0') return prev;
        if (prev === '0' && key !== '.') return key;

        return prev + key;
      }

      return prev;
    });
  }, []);

  const playDemoSequence = useCallback(() => {
    setRawNumber('');
    const demoSequence = ['5', '5', '6', '5'];
    demoSequence.forEach((k, idx) => {
      setTimeout(() => handleKeyInput(k), (idx + 1) * autoTypeInterval);
    });
  }, [handleKeyInput, autoTypeInterval]);

  useEffect(() => {
    const demoAt = params.demo as number | undefined;
    if (demoAt !== undefined && demoAt !== lastDemoRef.current) {
      lastDemoRef.current = demoAt;
      playDemoSequence();
    }
  }, [params.demo, playDemoSequence]);

  // Physical keyboard support, only while this animation is in view
  useEffect(() => {
    if (isPaused) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;

      if (/^[0-9]$/.test(event.key)) {
        event.preventDefault();
        handleKeyInput(event.key);
      } else if (event.key === '.') {
        event.preventDefault();
        handleKeyInput('.');
      } else if (event.key === 'Backspace') {
        event.preventDefault();
        handleKeyInput('backspace');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyInput, isPaused]);

  const formattedNumber = enableCommas ? formatIndianCurrency(rawNumber) : rawNumber;

  return (
    <div className="payment-phone-screen relative flex h-full w-full items-center justify-center bg-neutral-950/40 select-none">
      {/* Device bezel matching the infinite-card-carousel phone frame */}
      <div
        className="relative flex-shrink-0 bg-neutral-900 shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
        style={{ aspectRatio: '9.5 / 19.5', height: '90%', maxHeight: '100%', maxWidth: '100%', borderRadius: 54, border: '12px solid #1c1c1e' }}
      >
        <div className="absolute top-[108px] -left-[2px] h-16 w-[3px] rounded-l-sm bg-[#1c1c1e]" />
        <div className="absolute top-[180px] -left-[2px] h-10 w-[3px] rounded-l-sm bg-[#1c1c1e]" />
        <div className="absolute top-[140px] -right-[2px] h-20 w-[3px] rounded-r-sm bg-[#1c1c1e]" />

        <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[42px] bg-black text-white">
          {/* Status bar, matching the infinite-card-carousel screen chrome */}
          <div className="relative z-40 flex w-full shrink-0 items-center justify-between px-7 pt-3 text-[13px] font-semibold text-white select-none">
            <span>9:41</span>
            <div className="absolute top-2 left-1/2 h-7 w-[108px] -translate-x-1/2 rounded-full bg-black" />
            <span className="flex items-center gap-1.5 text-[11px]">
              5G
              <span className="h-3 w-6 rounded-[3px] border border-white/70" />
            </span>
          </div>

          {/* Glowing dome backdrop */}
          <div className="absolute top-0 left-0 right-0 h-[52%] pointer-events-none overflow-hidden">
            <div
              className="absolute -top-[35%] -left-[25%] -right-[25%] h-[105%] rounded-full"
              style={{
                background:
                  'radial-gradient(ellipse at 50% 65%, rgba(225, 75, 12, 0.95) 0%, rgba(195, 55, 8, 0.75) 45%, rgba(120, 30, 5, 0.3) 72%, rgba(0, 0, 0, 0) 100%)',
                filter: 'blur(8px)',
              }}
            />
            <div
              className="absolute top-[22%] left-[7%] right-[7%] h-[82%] rounded-full bg-black"
              style={{ boxShadow: '0 -15px 35px 5px rgba(240, 85, 20, 0.45)' }}
            />
            <div
              className="absolute inset-0"
              style={{ background: 'radial-gradient(circle at 50% 18%, rgba(255, 100, 30, 0.25) 0%, transparent 60%)' }}
            />
          </div>

          <div className="relative z-10 flex items-center justify-between px-3.5 pt-2 pb-0 shrink-0">
            <button type="button" aria-label="Back" className="text-white/90 hover:text-white p-1 -ml-1 rounded-full active:scale-95 transition-transform">
              <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
            </button>
          </div>

          <div className="relative z-10 flex flex-col items-center pt-0 pb-0 shrink-0">
            <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#7e1cc6] via-[#6515a8] to-[#45097a] flex items-center justify-center shadow-lg border border-purple-400/20">
              <span className="text-white font-semibold text-lg sm:text-2xl tracking-wide">HK</span>
            </div>
            <h1 className="mt-2 text-white font-medium text-base sm:text-lg tracking-tight leading-snug">Harsh</h1>
            <p className="mt-0.5 text-white/60 text-xs sm:text-[13px] font-normal tracking-tight">harsh@oksbi</p>
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center mt-3 mb-auto py-0 shrink-0 overflow-visible">
            <NumberDisplay
              rawNumber={rawNumber}
              formattedNumber={formattedNumber}
              isSlowMo={isSlowMo}
              config={displayConfig}
            />

            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                className="px-3 py-1 rounded-lg bg-[#19191d] hover:bg-[#222228] text-white/50 hover:text-white/70 text-xs font-normal transition-colors border border-white/5"
              >
                Add a note
              </button>
              <button
                type="button"
                onClick={playDemoSequence}
                title="Replay the 5565 demo sequence"
                className="px-2.5 py-1 rounded-lg bg-orange-500/15 hover:bg-orange-500/25 text-orange-400 hover:text-orange-300 text-xs font-medium transition-colors border border-orange-500/20 flex items-center gap-1 active:scale-95"
              >
                <Play className="w-3 h-3 fill-current" />
                Demo
              </button>
            </div>
          </div>

          <div className="relative z-10 w-full px-4 sm:px-6 pb-2 mt-auto shrink-0 select-none">
            <div className="grid grid-cols-3 gap-y-1.5 gap-x-2 max-w-[340px] mx-auto">
              {KEYPAD_KEYS.map((key) => {
                const isBackspace = key === 'backspace';
                const isDot = key === '.';
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleKeyInput(key)}
                    className="flex items-center justify-center h-12 sm:h-14 rounded-full active:bg-white/10 active:scale-95 transition-all text-white font-medium select-none focus:outline-none"
                  >
                    {isBackspace ? (
                      <Delete className="w-5 h-5 stroke-[1.8] text-white/80" />
                    ) : isDot ? (
                      <span className="text-2xl sm:text-3xl font-bold leading-none mb-1 text-white/90">.</span>
                    ) : (
                      <span className="text-xl sm:text-2xl font-normal text-white">{key}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-center gap-1.5 text-white/40 text-[10px] py-2 pb-3 shrink-0">
            <span>Banking Name: Harshwardhan K</span>
            <Link2 className="w-3 h-3 stroke-[2]" />
          </div>

          <div className="z-40 flex w-full shrink-0 justify-center pb-2 select-none">
            <div className="h-1 w-28 rounded-full bg-neutral-500/70" />
          </div>
        </div>
      </div>
    </div>
  );
}
