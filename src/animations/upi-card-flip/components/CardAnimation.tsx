import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Share2, Compass } from 'lucide-react';
import type { AnimationConfig, ScreenMode, UserProfile } from '../types';
import { ProfileCardFront, ProfileBottomDashboard } from './ProfileCardFront';
import { ProfileCardBack, ProfileBackActions } from './ProfileCardBack';
import { CylinderMeshBackground } from './CylinderMeshBackground';
import { useTiltPhysics } from '../hooks/useTiltPhysics';

interface CardAnimationProps {
  currentScreen: ScreenMode;
  onScreenChange: (screen: ScreenMode) => void;
  config: AnimationConfig;
  user: UserProfile;
  onSetAmountClick?: () => void;
}

/**
 * CardAnimation
 * True 3D perspective shared-element flip between the Profile and QR cards,
 * with gyroscope/pointer tilt parallax and synchronized bottom-panel transitions.
 */
export function CardAnimation({ currentScreen, onScreenChange, config, user, onSetAmountClick }: CardAnimationProps) {
  const isQr = currentScreen === 'qr';
  const isYAxis = config.flipAxis === 'Y';
  const targetRotation = isQr ? 180 * config.direction : 0;
  const fullMobileView = !config.showPhoneFrame;

  // Track flip animation state so midFlipScale and transition only run when flipping
  const [isFlipping, setIsFlipping] = useState(false);
  const [flashKey, setFlashKey] = useState(0);

  const tilt = useTiltPhysics({
    maxTiltAngle: config.maxTiltAngle,
    parallaxIntensity: config.parallaxIntensity,
    enabled: config.enableGyro,
  });

  const handleToggleScreen = () => {
    tilt.recalibrate();
    setIsFlipping(true);
    setFlashKey((prev) => prev + 1);
    onScreenChange(isQr ? 'profile' : 'qr');
  };

  const transitionSpec =
    config.easingMode === 'spring'
      ? { type: 'spring' as const, stiffness: config.springStiffness, damping: config.springDamping, mass: 1 }
      : { duration: config.duration, ease: config.bezier };

  const screenContent = (
    <div
      onTouchMove={tilt.handleTouchMove}
      onTouchEnd={tilt.handleTouchEnd}
      onPointerMove={tilt.handlePointerMove}
      onPointerLeave={tilt.handlePointerLeave}
      className="relative flex h-full w-full flex-col overflow-y-auto overflow-x-hidden no-scrollbar bg-[#050508] text-white select-none"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <CylinderMeshBackground currentScreen={currentScreen} tiltState={tilt} />

      {tilt.needsPermissionPrompt && !tilt.isGyroActive && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            tilt.requestGyroPermission();
          }}
          className="absolute top-12 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg shadow-orange-500/30 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-transform animate-bounce"
          title="Enable Gyroscope Motion"
        >
          <Compass size={14} className="animate-spin" />
          <span>Enable 3D Motion Tilt</span>
        </button>
      )}

      {/* Status bar, matching the payment-phone-screen chrome */}
      <div className="relative z-40 flex w-full shrink-0 items-center justify-between px-7 pt-3 text-[13px] font-semibold text-white select-none">
        <span>9:41</span>
        <div className="absolute top-2 left-1/2 h-7 w-[108px] -translate-x-1/2 rounded-full bg-black" />
        <span className="flex items-center gap-1.5 text-[11px]">
          5G
          <span className="h-3 w-6 rounded-[3px] border border-white/70" />
        </span>
      </div>

      <AnimatePresence>
        {flashKey > 0 && (
          <motion.div
            key={`flash-${flashKey}`}
            className="absolute inset-0 pointer-events-none z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0.92, 1.12, 1.25] }}
            transition={{ duration: config.duration * 0.65, times: [0, 0.45, 1], ease: 'easeOut' }}
            style={{
              background: 'radial-gradient(circle at 50% 36%, rgba(255, 255, 255, 0.9) 0%, rgba(255, 240, 215, 0.45) 35%, transparent 70%)',
              mixBlendMode: 'screen',
            }}
          />
        )}
      </AnimatePresence>

      <div className="relative z-30 px-4 pt-1 pb-1 flex items-center justify-between shrink-0 select-none">
        <button
          type="button"
          onClick={() => (isQr ? handleToggleScreen() : null)}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
            isQr ? 'bg-black/40 hover:bg-black/60 text-white cursor-pointer active:scale-90 shadow-sm' : 'text-neutral-400 hover:text-white cursor-pointer'
          }`}
          title={isQr ? 'Back to Profile' : 'Back'}
          aria-label="Back"
        >
          <ChevronLeft size={22} />
        </button>

        <div className="w-9 h-9 flex items-center justify-center">
          {isQr ? (
            <button
              type="button"
              onClick={handleToggleScreen}
              className="w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all active:scale-90 cursor-pointer shadow-sm"
              title="Share"
              aria-label="Share"
            >
              <Share2 size={18} />
            </button>
          ) : (
            <div className="w-9 h-9" />
          )}
        </div>
      </div>

      <div
        className="relative z-20 flex-1 px-4 pt-0.5 pb-2 flex flex-col justify-start overflow-visible preserve-3d"
        style={{ perspective: `${config.perspective}px`, WebkitPerspective: `${config.perspective}px` }}
      >
        <div className="w-full flex justify-center overflow-visible preserve-3d">
          <motion.div
            onClick={handleToggleScreen}
            role="button"
            tabIndex={0}
            aria-label={isQr ? 'Click to flip to profile card' : 'Click to flip to QR card'}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleToggleScreen();
              }
            }}
            className="w-full max-w-[336px] relative preserve-3d select-none cursor-pointer rounded-[32px]"
            animate={{
              rotateY: (isYAxis ? targetRotation : 0) + (isQr ? -tilt.rotateY : tilt.rotateY),
              rotateX: (!isYAxis ? targetRotation : 0) + tilt.rotateX,
              scale: isFlipping ? [1, config.midFlipScale, 1] : 1,
              height: isQr ? 440 : 380,
            }}
            onAnimationComplete={() => setIsFlipping(false)}
            transition={{
              rotateY: isFlipping ? transitionSpec : { duration: 0.05, ease: 'linear' },
              rotateX: isFlipping ? transitionSpec : { duration: 0.05, ease: 'linear' },
              scale: { duration: config.duration, times: [0, 0.5, 1], ease: 'easeInOut' },
              height: { duration: config.duration * 0.85, ease: config.easingMode === 'cubic-bezier' ? config.bezier : 'easeInOut' },
            }}
            style={{
              transformStyle: 'preserve-3d',
              WebkitTransformStyle: 'preserve-3d',
              transformOrigin: 'center center',
              willChange: 'transform, height',
              overflow: 'visible',
              borderRadius: '32px',
            }}
          >
            <div
              className="absolute inset-0 w-full h-full rounded-[32px] overflow-hidden"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(0deg) translateZ(1px)',
                WebkitTransform: 'rotateY(0deg) translateZ(1px)',
                pointerEvents: isQr ? 'none' : 'auto',
                zIndex: isQr ? 1 : 2,
                borderRadius: '32px',
              }}
            >
              <ProfileCardFront user={user} onOpenQr={handleToggleScreen} tiltState={tilt} config={config} />
            </div>

            <div
              className="absolute inset-0 w-full h-full rounded-[32px] overflow-hidden"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: isYAxis ? 'rotateY(180deg) translateZ(1px)' : 'rotateX(180deg) translateZ(1px)',
                WebkitTransform: isYAxis ? 'rotateY(180deg) translateZ(1px)' : 'rotateX(180deg) translateZ(1px)',
                pointerEvents: isQr ? 'auto' : 'none',
                zIndex: isQr ? 2 : 1,
                borderRadius: '32px',
              }}
            >
              <ProfileCardBack user={user} tiltState={tilt} config={config} />
            </div>
          </motion.div>
        </div>

        <div className="w-full max-w-[336px] mx-auto mt-2.5 relative min-h-[175px]">
          <AnimatePresence initial={false}>
            {!isQr ? (
              <motion.div
                key="front-dashboard"
                initial={{ opacity: 0, y: config.slideDistance, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: config.slideDistance * 0.7, scale: 0.97, transition: { duration: config.duration * 0.35, ease: 'easeIn' } }}
                transition={{ duration: config.duration * 0.65, delay: config.staggerDelay, ease: [0.16, 1, 0.3, 1] }}
              >
                <ProfileBottomDashboard user={user} />
              </motion.div>
            ) : (
              <motion.div
                key="back-actions"
                className="pt-1 overflow-visible"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: config.duration * 0.25, ease: 'easeIn' } }}
                transition={{ duration: config.duration * 0.4 }}
              >
                <ProfileBackActions user={user} onSetAmountClick={onSetAmountClick} config={config} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="z-40 flex w-full shrink-0 justify-center pb-2 select-none">
        <div className="h-1 w-28 rounded-full bg-neutral-500/70" />
      </div>
    </div>
  );

  if (fullMobileView) {
    return (
      <div
        onTouchMove={tilt.handleTouchMove}
        onTouchEnd={tilt.handleTouchEnd}
        onPointerMove={tilt.handlePointerMove}
        onPointerLeave={tilt.handlePointerLeave}
        className="relative h-full w-full select-none"
      >
        {screenContent}
      </div>
    );
  }

  return (
    <div
      onTouchMove={tilt.handleTouchMove}
      onTouchEnd={tilt.handleTouchEnd}
      onPointerMove={tilt.handlePointerMove}
      onPointerLeave={tilt.handlePointerLeave}
      className="relative flex h-full w-full items-center justify-center select-none"
    >
      {/* Device bezel matching the payment-phone-screen phone frame */}
      <div
        className="relative flex-shrink-0 bg-neutral-900 shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
        style={{
          aspectRatio: '9.5 / 19.5',
          height: '90%',
          maxHeight: '100%',
          maxWidth: '100%',
          borderRadius: 54,
          border: '12px solid #1c1c1e',
        }}
      >
        {/* Side button nubs */}
        <div className="absolute top-[108px] -left-[2px] h-16 w-[3px] rounded-l-sm bg-[#1c1c1e]" />
        <div className="absolute top-[180px] -left-[2px] h-10 w-[3px] rounded-l-sm bg-[#1c1c1e]" />
        <div className="absolute top-[140px] -right-[2px] h-20 w-[3px] rounded-r-sm bg-[#1c1c1e]" />

        <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[42px] bg-black text-white">
          {screenContent}
        </div>
      </div>
    </div>
  );
}
