import { motion } from 'motion/react';
import type { ScreenMode } from '../types';
import type { TiltState } from '../hooks/useTiltPhysics';

interface CylinderMeshBackgroundProps {
  currentScreen: ScreenMode;
  tiltState?: TiltState;
}

const QR_BG_URL = '/animations/upi-card-flip/qr-bg.png';

/**
 * CylinderMeshBackground
 * The Profile screen shows the same cylinder-mesh background as the QR screen,
 * just with a dark scrim over its lower half for the dashboard; the scrim lifts
 * away on the QR screen. Both layers react to live tilt with parallax depth.
 */
export function CylinderMeshBackground({ currentScreen, tiltState }: CylinderMeshBackgroundProps) {
  const isQr = currentScreen === 'qr';

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      <div className="absolute inset-0 bg-[#0f1115]" />

      <div
        className="absolute -inset-8 pointer-events-none will-change-transform"
        style={{
          transform: tiltState ? `translate3d(${-tiltState.tiltX * 22}px, ${-tiltState.tiltY * 18}px, 0px)` : 'none',
        }}
      >
        <img src={QR_BG_URL} alt="" className="w-full h-full object-cover object-center" />
      </div>

      <div
        className="absolute top-10 left-1/2 -translate-x-1/2 w-[340px] h-[360px] rounded-full blur-3xl pointer-events-none will-change-transform"
        style={{
          background: 'radial-gradient(circle at 50% 45%, rgba(255, 255, 255, 0.35) 0%, rgba(230, 238, 250, 0.14) 40%, transparent 72%)',
          transform: tiltState ? `translate3d(${tiltState.tiltX * 16}px, ${tiltState.tiltY * 14}px, 0px)` : 'none',
        }}
      />

      {/* Back scrim: darkens only the lower half for the Profile dashboard, lifts away on the QR screen */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={false}
        animate={{ opacity: isQr ? 0 : 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background:
            'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 48%, rgba(8, 9, 12, 0.5) 60%, rgba(6, 7, 10, 0.88) 78%, rgba(5, 5, 8, 0.98) 100%)',
        }}
      />

      <div
        className="absolute inset-y-0 left-0 w-12 pointer-events-none"
        style={{ background: 'linear-gradient(to right, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0.1) 60%, transparent 100%)' }}
      />
    </div>
  );
}
