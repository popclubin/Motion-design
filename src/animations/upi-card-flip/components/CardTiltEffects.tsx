import React from 'react';
import type { TiltState } from '../hooks/useTiltPhysics';

interface MovingSpecularBorderProps {
  lightAngle: number;
  tiltState?: TiltState;
  intensity?: number;
  borderRadius?: number;
}

/** Dynamic moving light-grey / silver card gradient that shifts with live tilt. */
export function getDynamicCardGradient(tiltState?: TiltState, intensity: number = 1.0): string {
  if (!tiltState || intensity <= 0) {
    return 'linear-gradient(145deg, #ffffff 0%, #f7f8fb 24%, #eceff4 58%, #dde1e9 100%)';
  }

  const { tiltX, tiltY } = tiltState;
  const baseAngle = 142;
  const angleShift = (tiltX * 32 + tiltY * 20) * intensity;
  const currentAngle = Math.round(baseAngle + angleShift);

  const whiteStop = Math.max(0, Math.min(25, Math.round(4 - (tiltY * 12 + tiltX * 10) * intensity)));
  const mid1Stop = Math.max(16, Math.min(45, Math.round(24 - (tiltY * 14 + tiltX * 10) * intensity)));
  const mid2Stop = Math.max(45, Math.min(75, Math.round(58 - (tiltY * 14 + tiltX * 10) * intensity)));
  const endStop = Math.max(85, Math.min(100, Math.round(96 - tiltY * 6 * intensity)));

  return `linear-gradient(${currentAngle}deg, #ffffff ${whiteStop}%, #f7f8fb ${mid1Stop}%, #e9edf3 ${mid2Stop}%, #dce1e9 ${endStop}%)`;
}

/** Bright specular border reflection that travels along the tilted edge of the card. */
export const MovingSpecularBorder: React.FC<MovingSpecularBorderProps> = ({
  lightAngle,
  tiltState,
  intensity = 1,
  borderRadius = 32,
}) => {
  const tiltMagnitude = tiltState
    ? Math.min(1.4, Math.sqrt(tiltState.tiltX * tiltState.tiltX + tiltState.tiltY * tiltState.tiltY) * 1.5)
    : 0.8;

  const effectiveOpacity = Math.min(1, intensity * (0.65 + tiltMagnitude * 0.35));

  const angleRad = (lightAngle * Math.PI) / 180;
  const shadowX = -Math.sin(angleRad) * (5 + tiltMagnitude * 4);
  const shadowY = Math.cos(angleRad) * (5 + tiltMagnitude * 4);

  return (
    <>
      <div
        className="absolute inset-0 pointer-events-none z-20"
        style={{
          borderRadius: `${borderRadius}px`,
          border: '1px solid rgba(255, 255, 255, 0.95)',
          boxShadow: '0 0 0 1px rgba(210, 218, 230, 0.45) inset',
        }}
      />

      <div
        className="absolute -inset-[1.5px] pointer-events-none z-30 will-change-[background,opacity]"
        style={{
          borderRadius: `${borderRadius}px`,
          opacity: effectiveOpacity,
          background: `conic-gradient(from ${lightAngle}deg,
            #ffffff 0deg,
            #f8fafc 24deg,
            #cbd5e1 52deg,
            rgba(148, 163, 184, 0.45) 85deg,
            rgba(100, 116, 139, 0.04) 130deg,
            rgba(100, 116, 139, 0.0) 180deg,
            rgba(100, 116, 139, 0.04) 230deg,
            rgba(148, 163, 184, 0.45) 275deg,
            #cbd5e1 308deg,
            #f8fafc 336deg,
            #ffffff 360deg
          )`,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          padding: '1.5px',
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none z-10 will-change-[box-shadow,opacity]"
        style={{
          borderRadius: `${borderRadius}px`,
          opacity: effectiveOpacity,
          boxShadow: `${shadowX}px ${shadowY}px 22px -1px rgba(255, 255, 255, 0.7), inset ${-shadowX * 0.7}px ${-shadowY * 0.7}px 12px 0px rgba(255, 255, 255, 0.65)`,
        }}
      />
    </>
  );
};

interface CardFaceShimmerProps {
  tiltState: TiltState;
  intensity?: number;
  isDark?: boolean;
}

/** Moving bright silver shimmer that glides across the card face as the phone tilts. */
export const CardFaceShimmer: React.FC<CardFaceShimmerProps> = ({ tiltState, intensity = 1, isDark = false }) => {
  const { tiltX, tiltY, shimmerX, shimmerY } = tiltState;

  return (
    <div className="absolute inset-0 rounded-[32px] pointer-events-none overflow-hidden z-10 select-none" style={{ opacity: intensity }}>
      <div
        className="absolute inset-0 will-change-transform pointer-events-none"
        style={{
          background: `radial-gradient(
            ellipse 135% 90% at ${shimmerX}% ${shimmerY}%,
            rgba(255, 255, 255, ${isDark ? 0.6 : 0.75}) 0%,
            rgba(241, 245, 249, ${isDark ? 0.38 : 0.48}) 25%,
            rgba(203, 213, 225, ${isDark ? 0.16 : 0.22}) 50%,
            transparent 75%
          )`,
          mixBlendMode: isDark ? 'screen' : 'overlay',
        }}
      />

      <div
        className="absolute -inset-x-16 inset-y-0 will-change-transform pointer-events-none"
        style={{
          background: `linear-gradient(
            ${118 + tiltX * 24}deg,
            transparent 18%,
            rgba(248, 250, 252, 0.04) 32%,
            rgba(255, 255, 255, ${isDark ? 0.65 : 0.8}) 49%,
            rgba(226, 232, 240, ${isDark ? 0.45 : 0.55}) 53%,
            rgba(148, 163, 184, 0.15) 66%,
            transparent 84%
          )`,
          transform: `translateX(${tiltX * 55}px) translateY(${tiltY * 35}px)`,
          mixBlendMode: isDark ? 'screen' : 'soft-light',
        }}
      />

      <div
        className="absolute top-0 inset-x-0 h-32 pointer-events-none"
        style={{
          background: `linear-gradient(
            to bottom,
            rgba(255, 255, 255, ${Math.max(0.12, 0.5 - tiltY * 0.28)}) 0%,
            transparent 100%
          )`,
        }}
      />
    </div>
  );
};
