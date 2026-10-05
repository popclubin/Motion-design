import { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronDown, Copy, Check, MessageCircle, Download } from 'lucide-react';
import type { AnimationConfig, UserProfile } from '../types';
import type { TiltState } from '../hooks/useTiltPhysics';
import { MovingSpecularBorder, CardFaceShimmer, getDynamicCardGradient } from './CardTiltEffects';

interface ProfileCardBackProps {
  user: UserProfile;
  tiltState: TiltState;
  config: AnimationConfig;
}

/** The back white card: avatar + name header, orange QR matrix, and bank/UPI details. */
export function ProfileCardBack({ user, tiltState, config }: ProfileCardBackProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(user.upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const dynamicBackground = getDynamicCardGradient(tiltState, config.gradientShiftIntensity);

  return (
    <div
      id="profile-card-back"
      className="w-full h-full relative rounded-[32px] overflow-hidden p-4 sm:p-5 flex flex-col justify-between select-none cursor-pointer border border-neutral-200/70"
      style={{
        background: dynamicBackground,
        boxShadow: `${-tiltState.tiltX * 10}px ${-tiltState.tiltY * 10}px 36px -6px rgba(0, 0, 0, 0.48), 0 24px 50px -10px rgba(0, 0, 0, 0.42), 0 0 0 1px rgba(255, 255, 255, 0.95) inset`,
      }}
    >
      <MovingSpecularBorder lightAngle={tiltState.lightAngle} tiltState={tiltState} intensity={config.movingBorderIntensity} borderRadius={32} />
      <CardFaceShimmer tiltState={tiltState} intensity={config.shimmerIntensity} isDark={false} />

      <div
        className="absolute inset-0 rounded-[32px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 12%, rgba(255,255,255,0.92) 0%, transparent 60%)' }}
      />
      <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-white/95 to-transparent pointer-events-none rounded-t-[32px] z-10" />

      <div className="flex items-center justify-center gap-3 pt-0.5 relative z-20 pointer-events-none">
        <div className="w-8 h-8 rounded-full p-0.5 bg-neutral-300 overflow-hidden flex-shrink-0">
          <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover rounded-full" />
        </div>
        <h2 id="qr-user-name" className="font-serif-display italic font-semibold text-[26px] sm:text-[28px] tracking-tight text-neutral-900 leading-none">
          {user.name}
        </h2>
      </div>

      <div className="flex flex-col items-center justify-center my-1 relative z-20">
        <div className="w-[226px] h-[226px] sm:w-[242px] sm:h-[242px] bg-white p-3 rounded-2xl flex items-center justify-center relative border border-neutral-200/80">
          <svg viewBox="0 0 160 160" className="w-full h-full text-[#FF4800]" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 12 h40 v40 h-40 z M20 20 v24 h24 v-24 z M26 26 h12 v12 h-12 z" />
            <path d="M108 12 h40 v40 h-40 z M116 20 v24 h24 v-24 z M122 26 h12 v12 h-12 z" />
            <path d="M12 108 h40 v40 h-40 z M20 116 v24 h24 v-24 z M26 122 h12 v12 h-12 z" />

            <rect x="58" y="18" width="6" height="6" rx="1" />
            <rect x="70" y="18" width="6" height="6" rx="1" />
            <rect x="82" y="18" width="6" height="6" rx="1" />
            <rect x="94" y="18" width="6" height="6" rx="1" />

            <rect x="18" y="58" width="6" height="6" rx="1" />
            <rect x="18" y="70" width="6" height="6" rx="1" />
            <rect x="18" y="82" width="6" height="6" rx="1" />
            <rect x="18" y="94" width="6" height="6" rx="1" />

            <rect x="58" y="28" width="10" height="16" rx="1" />
            <rect x="74" y="28" width="14" height="8" rx="1" />
            <rect x="72" y="42" width="8" height="12" rx="1" />
            <rect x="86" y="32" width="12" height="16" rx="1" />

            <rect x="36" y="58" width="8" height="16" rx="1" />
            <rect x="48" y="64" width="16" height="8" rx="1" />
            <rect x="48" y="76" width="10" height="18" rx="1" />
            <rect x="64" y="58" width="14" height="22" rx="1" />
            <rect x="84" y="58" width="10" height="8" rx="1" />
            <rect x="82" y="72" width="14" height="14" rx="1" />
            <rect x="72" y="88" width="12" height="12" rx="1" />

            <rect x="100" y="58" width="16" height="10" rx="1" />
            <rect x="122" y="58" width="10" height="18" rx="1" />
            <rect x="138" y="62" width="10" height="14" rx="1" />
            <rect x="104" y="74" width="12" height="12" rx="1" />
            <rect x="120" y="82" width="18" height="12" rx="1" />

            <rect x="14" y="68" width="16" height="10" rx="1" />
            <rect x="14" y="84" width="12" height="16" rx="1" />
            <rect x="32" y="80" width="10" height="16" rx="1" />
            <rect x="58" y="104" width="16" height="10" rx="1" />
            <rect x="58" y="120" width="8" height="24" rx="1" />
            <rect x="72" y="112" width="12" height="16" rx="1" />
            <rect x="72" y="134" width="20" height="12" rx="1" />

            <rect x="92" y="104" width="14" height="10" rx="1" />
            <rect x="110" y="100" width="8" height="20" rx="1" />
            <rect x="124" y="104" width="18" height="8" rx="1" />
            <rect x="100" y="120" width="18" height="12" rx="1" />
            <rect x="98" y="136" width="14" height="10" rx="1" />
            <rect x="122" y="120" width="14" height="14" rx="1" />
            <rect x="120" y="138" width="18" height="10" rx="1" />
            <rect x="142" y="126" width="8" height="18" rx="1" />
          </svg>
        </div>
      </div>

      <div className="pt-2 border-t border-neutral-300/80 relative z-20 flex flex-col items-center gap-1 font-sans-ui text-xs">
        <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-2 cursor-pointer py-1 px-2.5 rounded-lg bg-white/70 hover:bg-white border border-neutral-200/80 transition-colors">
          <div className="w-4 h-4 rounded bg-[#97144d] flex items-center justify-center text-white">
            <Check size={11} strokeWidth={3} />
          </div>
          <span className="font-semibold text-neutral-800">
            {user.bankName} • {user.bankAccountLast4}
          </span>
          <ChevronDown size={14} className="text-neutral-400" />
        </div>

        <div onClick={handleCopy} className="flex items-center gap-1.5 text-neutral-500 cursor-pointer py-0.5 px-2 rounded-lg hover:bg-white/60 transition-colors" title="Click to copy UPI ID">
          {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} className="text-neutral-400" />}
          <span className="font-mono text-[11px] text-neutral-600 font-medium">{copied ? 'Copied to clipboard!' : user.upiId}</span>
          <ChevronDown size={13} className="text-neutral-400 ml-0.5" />
        </div>
      </div>
    </div>
  );
}

interface ProfileBackActionsProps {
  user: UserProfile;
  onSetAmountClick?: () => void;
  config: AnimationConfig;
}

/**
 * The QR screen's action pills: Set amount, Share, Download.
 * Each slides in from the right with a spring bounce, sequentially staggered.
 */
export function ProfileBackActions({ user, onSetAmountClick, config }: ProfileBackActionsProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator
        .share({ title: `Pay ${user.name} via UPI`, text: `Scan QR code or pay to ${user.upiId}`, url: window.location.href })
        .catch(() => showToast('Share cancelled'));
    } else {
      showToast('Share link ready');
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    showToast('QR Code saved to gallery');
  };

  const baseDelay = Math.max(0.12, config.duration * 0.32);

  return (
    <div className="w-full relative font-sans-ui select-none">
      {toastMessage && (
        <div className="absolute -top-11 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-xs font-medium px-4 py-1.5 rounded-full border border-neutral-700 shadow-xl flex items-center gap-1.5 whitespace-nowrap animate-in fade-in zoom-in-95 duration-200 z-50">
          <Check size={13} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* The 3 pills move as a single rigid unit so the gap between them stays constant through the slide and bounce. */}
      <motion.div
        className="flex items-center justify-center gap-2 sm:gap-2.5 overflow-visible w-full"
        initial={{ x: config.chipSlideOffset, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: config.chipSlideOffset * 0.7, opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } }}
        transition={{ type: 'spring', stiffness: config.chipBounceStiffness, damping: config.chipBounceDamping, mass: 0.72, delay: baseDelay }}
      >
        <motion.button
          type="button"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.94 }}
          onClick={(e) => {
            e.stopPropagation();
            onSetAmountClick?.();
          }}
          className="flex-1 max-w-[118px] inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full bg-neutral-900/90 hover:bg-neutral-800 text-white text-xs font-semibold border border-neutral-700/70 backdrop-blur-md cursor-pointer whitespace-nowrap"
        >
          <span className="font-sans font-bold text-sm">₹</span>
          <span className="truncate">Set amount</span>
        </motion.button>

        <motion.button
          type="button"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.94 }}
          onClick={handleShare}
          className="flex-1 max-w-[110px] inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full bg-neutral-900/90 hover:bg-neutral-800 text-white text-xs font-semibold border border-neutral-700/70 backdrop-blur-md cursor-pointer whitespace-nowrap"
        >
          <div className="w-4 h-4 rounded-full bg-emerald-600 flex items-center justify-center text-white flex-shrink-0">
            <MessageCircle size={10} className="fill-white" />
          </div>
          <span className="truncate">Share</span>
        </motion.button>

        <motion.button
          type="button"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.94 }}
          onClick={handleDownload}
          className="flex-1 max-w-[115px] inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full bg-neutral-900/90 hover:bg-neutral-800 text-white text-xs font-semibold border border-neutral-700/70 backdrop-blur-md cursor-pointer whitespace-nowrap"
        >
          <Download size={13} className="text-neutral-300 flex-shrink-0" />
          <span className="truncate">Download</span>
        </motion.button>
      </motion.div>
    </div>
  );
}
