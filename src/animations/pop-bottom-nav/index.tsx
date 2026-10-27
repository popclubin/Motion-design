import { useEffect, useRef, useState } from 'react';
import { X, QrCode } from 'lucide-react';
import type { AnimationComponentProps } from '../../types/animation';
import PopBottomBar, { type NavTabId, type PopBottomBarHandle, type EasingStyle } from './components/PopBottomBar';

export default function PopBottomNav({ params }: AnimationComponentProps) {
  const [activeTab, setActiveTab] = useState<NavTabId>('home');
  const [scannerOpen, setScannerOpen] = useState(false);
  const barRef = useRef<PopBottomBarHandle | null>(null);
  const lastReplay = useRef<number | undefined>(undefined);

  const speed = Number(params.speed ?? 1);
  const easingStyle = String(params.easingStyle ?? 'original') as EasingStyle;
  const autoPlay = Boolean(params.autoPlay ?? true);
  const mobileView = Boolean(params.mobileView ?? true);
  const replay = params.replay as number | undefined;

  useEffect(() => {
    if (replay !== undefined && replay !== lastReplay.current) {
      lastReplay.current = replay;
      barRef.current?.replay();
    }
  }, [replay]);

  const renderBar = (isFixedToBottom = false) => (
    <PopBottomBar
      ref={barRef}
      selectedTab={activeTab}
      onSelectTab={setActiveTab}
      onScanClick={() => setScannerOpen(true)}
      autoPlay={autoPlay}
      speed={speed}
      easingStyle={easingStyle}
      isFixed={false}
      className={isFixedToBottom ? 'w-full' : ''}
    />
  );

  const scannerModal = scannerOpen && (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-between bg-black/95 p-6 select-none">
      <div className="flex w-full items-center justify-between pt-6">
        <span className="text-base font-bold tracking-tight text-white">Scan any UPI QR Code</span>
        <button
          type="button"
          onClick={() => setScannerOpen(false)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="relative flex h-64 w-64 items-center justify-center rounded-3xl border-2 border-white/20 p-4">
        <div className="absolute top-0 left-0 h-8 w-8 rounded-tl-xl border-t-4 border-l-4 border-white" />
        <div className="absolute top-0 right-0 h-8 w-8 rounded-tr-xl border-t-4 border-r-4 border-white" />
        <div className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-xl border-b-4 border-l-4 border-white" />
        <div className="absolute bottom-0 right-0 h-8 w-8 rounded-br-xl border-b-4 border-r-4 border-white" />
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-orange-400 to-transparent shadow-[0_0_8px_#fb923c]" />
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 text-neutral-400">
          <QrCode className="h-16 w-16 opacity-30" />
          <span className="text-xs text-neutral-400">Align QR code inside frame</span>
        </div>
      </div>

      <div className="w-full pb-8 text-center">
        <p className="text-xs text-neutral-400">Supports Google Pay, PhonePe, Paytm, BHIM &amp; all UPI apps</p>
      </div>
    </div>
  );

  if (!mobileView) {
    return (
      <main className="pop-bottom-nav relative flex h-full w-full items-center justify-center overflow-hidden bg-neutral-950/40 p-2 sm:p-3 select-none">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-blue-600/10 via-orange-500/5 to-transparent opacity-75 blur-[130px]" />
        </div>
        <div className="relative z-10 w-full flex items-center justify-center">
          {renderBar(false)}
        </div>
        {scannerModal}
      </main>
    );
  }

  return (
    <main className="pop-bottom-nav relative flex h-full w-full items-center justify-center p-3 select-none">
      {/* Decreased frame size with exact 814/1790 aspect ratio to fully fit the POP background */}
      <div
        className="relative flex flex-col items-center justify-between rounded-[48px] border-[10px] border-[#1c1c1e] bg-black shadow-[0_25px_60px_rgba(0,0,0,0.6)] overflow-hidden"
        style={{
          aspectRatio: '814 / 1790',
          height: '84%',
          maxHeight: '740px',
          maxWidth: '100%',
        }}
      >
        {/* Full-bleed POP Home Page Background - fitted edge-to-edge from top to bottom */}
        <div
          className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none"
          style={{
            backgroundImage: 'url(/animations/pop-bottom-nav/pop-home-bg.png)',
            backgroundSize: '100% 100%',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />

        {/* Minimalist Dynamic Island Pill centered at the top between status indicators */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 h-5 w-[86px] rounded-full bg-black z-30 pointer-events-none" />

        {/* Bottom container docking the navigation bar right at the bottom of the background */}
        <div className="relative z-20 mt-auto w-full px-2.5 pb-2.5 pt-1 flex flex-col items-center justify-end">
          <div className="w-full flex items-center justify-center">
            {renderBar(true)}
          </div>

          {/* iOS Home indicator bar sitting just below the nav pill */}
          <div className="mt-2 mb-0.5 h-1 w-28 rounded-full bg-neutral-400/80 shadow-xs pointer-events-none" />
        </div>

        {scannerModal}
      </div>
    </main>
  );
}
