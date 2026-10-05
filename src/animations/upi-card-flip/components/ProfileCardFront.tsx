import { useState } from 'react';
import { Copy, Check, QrCode, Pencil, ChevronRight, Zap } from 'lucide-react';
import type { AnimationConfig, UserProfile } from '../types';
import type { TiltState } from '../hooks/useTiltPhysics';
import { MovingSpecularBorder, CardFaceShimmer, getDynamicCardGradient } from './CardTiltEffects';

interface ProfileCardFrontProps {
  user: UserProfile;
  onOpenQr: () => void;
  tiltState: TiltState;
  config: AnimationConfig;
}

/** The front white profile card: avatar, name, UPI ID, mobile number, and a "My QR" button. */
export function ProfileCardFront({ user, onOpenQr, tiltState, config }: ProfileCardFrontProps) {
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
      id="profile-card-front"
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
        style={{ background: 'radial-gradient(ellipse at 50% 10%, rgba(255,255,255,0.9) 0%, transparent 60%)' }}
      />
      <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-white/95 to-transparent pointer-events-none rounded-t-[32px] z-10" />

      <div className="text-center pt-1 relative z-20 pointer-events-none">
        <h1 id="profile-user-name" className="font-serif-display italic font-semibold text-[30px] sm:text-[32px] tracking-tight text-neutral-900 leading-tight">
          {user.name}
        </h1>
        <p className="text-xs text-neutral-500 font-medium mt-1 tracking-wide font-sans-ui">member since {user.memberSince}</p>
      </div>

      <div className="flex justify-center my-2.5 relative z-20">
        <div className="relative group">
          <div className="w-[104px] h-[104px] sm:w-[110px] sm:h-[110px] rounded-full p-1 bg-gradient-to-b from-neutral-300 via-neutral-100 to-neutral-400">
            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover rounded-full" />
          </div>

          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center border-2 border-white hover:bg-neutral-800 active:scale-90 transition-transform cursor-pointer"
            title="Edit profile photo"
            aria-label="Edit profile photo"
          >
            <Pencil size={13} className="text-white fill-white" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-3.5 border border-neutral-200/80 text-xs text-neutral-800 space-y-2 relative z-20">
        <div className="flex items-center justify-between">
          <span className="text-neutral-400 font-medium">UPI ID</span>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-800 font-mono tracking-tight text-[13px]">{user.upiId}</span>
            <button
              type="button"
              onClick={handleCopy}
              className="text-neutral-500 hover:text-neutral-900 transition-colors p-1 rounded-md hover:bg-neutral-200/60 cursor-pointer"
              title="Copy UPI ID"
              aria-label="Copy UPI ID"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        <div className="h-[1px] bg-neutral-200/90" />

        <div className="flex items-center justify-between">
          <span className="text-neutral-400 font-medium">Mobile No.</span>
          <span className="font-semibold text-neutral-800 tracking-tight text-[13px]">{user.mobile}</span>
        </div>
      </div>

      <div className="flex justify-center pt-2 pb-0.5 relative z-20">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenQr();
          }}
          className="group inline-flex items-center gap-2 px-6 py-2 rounded-full bg-neutral-900 text-white font-sans-ui text-sm font-semibold hover:bg-black active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <span>My QR</span>
          <QrCode size={16} className="text-white transition-transform group-hover:scale-110" />
        </button>
      </div>
    </div>
  );
}

/** The Profile screen's bottom dashboard: UPI Lite banner, POPcoins & Cashback, account management. */
export function ProfileBottomDashboard({ user }: { user: UserProfile }) {
  const [activeDot, setActiveDot] = useState(0);

  return (
    <div className="w-full space-y-3 font-sans-ui select-none">
      <div className="relative overflow-hidden rounded-2xl border border-orange-500/25 bg-gradient-to-r from-[#2c1308] via-[#1c0d05] to-[#120b08] p-3.5 sm:p-4 shadow-xl group cursor-pointer active:scale-[0.99] transition-transform">
        <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-28 h-28 bg-orange-500/25 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-red-600 p-[1.5px] shadow-lg shadow-orange-600/30 flex-shrink-0">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-600 to-amber-500 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-white/25 rounded-full blur-xs -top-1" />
                <Zap size={20} className="text-white fill-white drop-shadow" />
              </div>
            </div>

            <div>
              <div className="text-[13px] font-serif-display italic text-amber-200/95 leading-tight">Introducing</div>
              <div className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">UPI Lite</div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-neutral-300 font-medium">Activate</div>
            <div className="text-xs font-semibold text-amber-300 flex items-center justify-end gap-1 mt-0.5">
              <span>& Earn</span>
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-500/30 text-amber-400 text-[10px] font-bold">🪙</span>
              <span>200</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5 mt-2.5">
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              onClick={() => setActiveDot(i)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${activeDot === i ? 'w-4 bg-white' : 'w-1.5 bg-neutral-600'}`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        <div className="rounded-2xl border border-neutral-800/80 bg-gradient-to-br from-[#1b1210] via-[#141212] to-[#101012] p-3 sm:p-3.5 flex items-center justify-between cursor-pointer hover:border-neutral-700/80 active:scale-[0.98] transition-all">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-600 p-[1px] flex-shrink-0 shadow-md">
              <div className="w-full h-full rounded-full bg-[#c2410c] flex items-center justify-center font-bold text-white text-base">P</div>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-white tracking-tight truncate">{user.popCoins.toLocaleString()}</div>
              <div className="text-[11px] text-neutral-400 font-medium truncate">POPcoins</div>
            </div>
          </div>
          <ChevronRight size={16} className="text-neutral-500 flex-shrink-0" />
        </div>

        <div className="rounded-2xl border border-neutral-800/80 bg-gradient-to-br from-[#0e1a14] via-[#121614] to-[#101012] p-3 sm:p-3.5 flex items-center justify-between cursor-pointer hover:border-neutral-700/80 active:scale-[0.98] transition-all">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/30 p-1 flex-shrink-0 flex items-center justify-center shadow-md">
              <div className="w-full h-full rounded-lg bg-emerald-600/30 flex items-center justify-center text-emerald-400 font-bold text-xs">₹</div>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-white tracking-tight truncate">₹{user.cashback.toFixed(2)}</div>
              <div className="text-[11px] text-neutral-400 font-medium truncate">Cashback</div>
            </div>
          </div>
          <ChevronRight size={16} className="text-neutral-500 flex-shrink-0" />
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-800/80 bg-[#121316] p-3.5 sm:p-4">
        <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">UPI</div>

        <div className="flex items-center justify-between cursor-pointer hover:opacity-90 active:scale-[0.99] transition-all pt-0.5">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full border-2 border-neutral-500 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
            </div>

            <div>
              <div className="text-sm font-semibold text-neutral-100">Account management</div>
              <div className="text-xs text-neutral-400 font-medium">3 accounts • 2 cards</div>
            </div>
          </div>

          <ChevronRight size={18} className="text-neutral-500" />
        </div>
      </div>
    </div>
  );
}
