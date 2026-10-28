import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, Delete, Play } from 'lucide-react';
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
  const showDeviceFrame = Boolean(params.showDeviceFrame ?? false);

  const displayConfig: NumberDisplayConfig = {
    fontMode: (params.fontMode as NumberDisplayConfig['fontMode']) ?? 'custom',
    targetWeight: Number(params.targetWeight ?? 400),
    digitSpacing: Number(params.digitSpacing ?? 2),
    digitFontSize: Number(params.digitFontSize ?? 64),
    elementScale: Number(params.elementScale ?? 1.0),
    initialScale: Number(params.initialScale ?? 0.3),
    strokeWidthErosion: Number(params.strokeWidthErosion ?? 2.4),
    contentOffsetY: Number(params.contentOffsetY ?? 16),
    avatarNameGap: Number(params.avatarNameGap ?? 12),
    avatarSize: Number(params.avatarSize ?? 36),
    showDeviceFrame,
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
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [actionCount, setActionCount] = useState<number>(0);
  const [displayResetKey, setDisplayResetKey] = useState<number>(0);
  const lastDemoRef = useRef<number | undefined>(undefined);
  const demoTimeoutsRef = useRef<number[]>([]);

  const handleKeyInput = useCallback((key: string) => {
    setRawNumber((prev) => {
      if (key === 'backspace') {
        setLastAction('Backspace');
        setActionCount((c) => c + 1);
        if (prev.length <= 1) return '';
        return prev.slice(0, -1);
      }

      if (key === '.') {
        if (prev.includes('.')) return prev;
        setLastAction('.');
        setActionCount((c) => c + 1);
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
        if (prev === '0' && key !== '.') {
          setLastAction(key);
          setActionCount((c) => c + 1);
          return key;
        }

        setLastAction(key);
        setActionCount((c) => c + 1);
        return prev + key;
      }

      return prev;
    });
  }, []);

  const playDemoSequence = useCallback(() => {
    demoTimeoutsRef.current.forEach((id) => window.clearTimeout(id));
    demoTimeoutsRef.current = [];
    setRawNumber('');
    setLastAction(null);
    setDisplayResetKey((k) => k + 1);

    const demoSequence = ['5', '5', '6', '5'];
    demoSequence.forEach((k, idx) => {
      const id = window.setTimeout(() => {
        handleKeyInput(k);
      }, (idx + 1) * autoTypeInterval);
      demoTimeoutsRef.current.push(id);
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
  const tokens = formattedNumber ? formattedNumber.split('') : [];

  return (
    <div
      className={`payment-phone-screen relative flex h-full w-full items-center justify-center bg-neutral-950/40 select-none font-sans ${
        showDeviceFrame ? 'p-6' : 'p-2 sm:p-4'
      }`}
    >
      {/* Phone body - Proportional 9:19.5 aspect ratio fitting completely within viewport */}
      <div
        id="phone-body"
        style={{ aspectRatio: '9 / 19.5' }}
        className="relative h-full max-h-[min(96vh,840px)] w-auto max-w-[412px] shrink-0"
      >
        {/* Screen */}
        <div
          id="phone-device-frame"
          className={`absolute inset-0 bg-black flex flex-col overflow-hidden text-white ${
            showDeviceFrame
              ? 'rounded-[54px]'
              : 'rounded-[32px] sm:rounded-[44px] ring-1 ring-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.85)]'
          }`}
          style={{ paddingTop: displayConfig.contentOffsetY + (showDeviceFrame ? 12 : 0) }}
        >
          {/* Hardcoded background image from Amount input.png */}
          <div
            id="visual-dome-background"
            className="absolute inset-0 pointer-events-none bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/animations/payment-phone-screen/Amount%20input.png')" }}
          />

          {/* Top Header with Back Navigation Arrow */}
          <div
            id="phone-header"
            className="relative z-10 flex items-center justify-between px-3.5 sm:px-4 pt-3 sm:pt-4 pb-0 shrink-0"
          >
            <button
              id="btn-back"
              type="button"
              aria-label="Back"
              className="relative top-2 text-white/90 hover:text-white p-1 -ml-1 rounded-full active:scale-95 transition-transform cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
            </button>
          </div>

          {/* Recipient Profile Section */}
          <div
            id="recipient-section"
            className="relative z-10 flex flex-col items-center pt-0 sm:pt-1 pb-0 shrink-0"
          >
            {/* Avatar with purple gradient and initials */}
            <div
              id="recipient-avatar"
              style={{ width: displayConfig.avatarSize, height: displayConfig.avatarSize }}
              className="rounded-full bg-gradient-to-br from-[#7e1cc6] via-[#6515a8] to-[#45097a] flex items-center justify-center shadow-lg border border-purple-400/20 shrink-0"
            >
              <span
                style={{ fontSize: displayConfig.avatarSize * 0.4 }}
                className="text-white font-semibold tracking-wide leading-none"
              >
                DS
              </span>
            </div>

            {/* Recipient Name */}
            <h1
              id="recipient-name"
              style={{ marginTop: displayConfig.avatarNameGap }}
              className="text-white font-medium text-base sm:text-lg md:text-[19px] tracking-tight leading-snug"
            >
              Deepanshi Sharma
            </h1>

            {/* UPI ID */}
            <p
              id="recipient-upi"
              className="mt-0.5 text-white/60 text-xs sm:text-[13px] font-normal tracking-tight"
            >
              deepanshi@oksbi
            </p>
          </div>

          {/* Number Display Section */}
          <div
            id="number-display-section"
            className="relative z-10 flex flex-col items-center justify-center mt-3 sm:mt-4.5 mb-auto py-0 shrink-0 overflow-visible"
          >
            <NumberDisplay
              key={displayResetKey}
              rawNumber={rawNumber}
              formattedNumber={formattedNumber}
              tokens={tokens}
              lastAction={lastAction}
              actionCount={actionCount}
              isSlowMo={isSlowMo}
              config={displayConfig}
            />

            {/* Action button: Add a note & Demo */}
            <div className="flex items-center gap-2 mt-2 sm:mt-2.5">
              <button
                id="btn-add-note"
                type="button"
                className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg bg-[#19191d] hover:bg-[#222228] text-white/50 hover:text-white/70 text-xs sm:text-[13px] font-normal transition-colors border border-white/5 cursor-pointer"
              >
                Add a note
              </button>
              <button
                type="button"
                onClick={playDemoSequence}
                title="Replay the 5565 demo sequence"
                className="px-2.5 py-1 rounded-lg bg-orange-500/15 hover:bg-orange-500/25 text-orange-400 hover:text-orange-300 text-xs font-medium transition-colors border border-orange-500/20 flex items-center gap-1 active:scale-95 cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" />
                Demo
              </button>
            </div>
          </div>

          {/* Keypad Section */}
          <div
            id="keypad-section"
            style={{ containerType: 'inline-size' }}
            className="relative z-10 w-full mt-auto shrink-0 select-none"
          >
            <div className="grid grid-cols-3 gap-[1.02cqw] px-[3.05cqw] pb-[10.2cqw]">
              {KEYPAD_KEYS.map((key) => {
                const isBackspace = key === 'backspace';
                const isDot = key === '.';
                const hasFill = !isBackspace && !isDot;

                return (
                  <button
                    key={key}
                    id={`keypad-btn-${key}`}
                    type="button"
                    onClick={() => handleKeyInput(key)}
                    style={{ height: '14.25cqw', borderRadius: '4.07cqw' }}
                    className={`flex items-center justify-center transition-all select-none focus:outline-none active:scale-95 cursor-pointer ${
                      hasFill ? 'bg-[#1A1A1A] active:bg-[#262626]' : 'bg-transparent active:bg-[#1A1A1A]'
                    }`}
                  >
                    {isBackspace ? (
                      <Delete
                        style={{ width: '5.6cqw', height: '5.6cqw' }}
                        className="stroke-[2] text-[#E8E8E8]"
                      />
                    ) : isDot ? (
                      <span
                        style={{ width: '1.63cqw', height: '1.63cqw' }}
                        className="rounded-full bg-[#E8E8E8]"
                      />
                    ) : (
                      <span
                        style={{ fontSize: '6.1cqw', lineHeight: 1 }}
                        className="font-figtree font-medium text-[#E8E8E8]"
                      >
                        {key}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* iPhone 16 hardware frame: bezel, metal edge, Dynamic Island and side buttons */}
        {showDeviceFrame && (
          <div id="iphone-16-frame" aria-hidden="true" className="pointer-events-none absolute inset-0 z-30">
            {/* Black bezel + aluminium edge, wrapped around the screen */}
            <div
              className="absolute -inset-[10px] rounded-[64px] border-[10px] border-black"
              style={{
                boxShadow:
                  '0 0 0 1.5px #6b6b70, 0 0 0 3px #2b2b2e, 0 25px 60px rgba(0,0,0,0.85), inset 0 0 0 1px rgba(255,255,255,0.06)',
              }}
            />
            {/* Dynamic Island (124x36pt on a 393x852pt screen) */}
            <div className="absolute left-1/2 top-[1.3%] h-[4.2%] w-[31.5%] -translate-x-1/2 rounded-full bg-black" />
            {/* Side buttons: action, volume up, volume down (left) and power (right) */}
            <div className="absolute -left-[16px] top-[12.5%] h-[3.2%] w-[3px] rounded-l-sm bg-[#3a3a3e]" />
            <div className="absolute -left-[16px] top-[19%] h-[6.2%] w-[3px] rounded-l-sm bg-[#3a3a3e]" />
            <div className="absolute -left-[16px] top-[27.5%] h-[6.2%] w-[3px] rounded-l-sm bg-[#3a3a3e]" />
            <div className="absolute -right-[16px] top-[23%] h-[9.5%] w-[3px] rounded-r-sm bg-[#3a3a3e]" />
          </div>
        )}
      </div>
    </div>
  );
}
