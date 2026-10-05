import React from 'react';
import type { ProductCard } from '../types';

const ASSET_BASE = '/animations/tinder-swipe';

/** Pulsing organic mesh cloud shown on the instruction card. */
export const OrganicMeshCloud = React.memo(function OrganicMeshCloud() {
  return (
    <div className="relative w-[190px] h-[190px] flex items-center justify-center bg-black/40 rounded-[28px] overflow-hidden">
      <div className="absolute inset-2 rounded-full bg-red-600/25 blur-xl animate-pulse" style={{ animationDuration: '3.5s' }} />
      <div className="absolute inset-8 rounded-full bg-orange-500/15 blur-lg" />
      <svg viewBox="0 0 200 200" className="w-full h-full relative z-10 scale-[1.05]">
        <defs>
          <radialGradient id="meshRed" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF4114" stopOpacity="0.95" />
            <stop offset="60%" stopColor="#9E1000" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>
        {Array.from({ length: 14 }).map((_, r) => {
          const radius = 18 + r * 5.2;
          const pointsCount = Math.floor((2 * Math.PI * radius) / 5);
          const points = Array.from({ length: pointsCount }).map((_, i) => {
            const angle = (i / pointsCount) * 2 * Math.PI;
            const wave1 = Math.sin(angle * 5 + r * 0.4) * 4.5;
            const wave2 = Math.cos(angle * 3 - r * 0.7) * 2.5;
            const finalRadius = radius + wave1 + wave2;
            return { x: 100 + Math.cos(angle) * finalRadius, y: 100 + Math.sin(angle) * finalRadius };
          });

          let pathD = `M ${points[0].x} ${points[0].y}`;
          for (let i = 1; i < points.length; i++) pathD += ` L ${points[i].x} ${points[i].y}`;
          pathD += ' Z';

          return (
            <g key={r}>
              <path d={pathD} fill="none" stroke="url(#meshRed)" strokeWidth={r % 2 === 0 ? '0.9' : '0.5'} opacity={0.8 - r * 0.045} />
              {r % 2 === 0 &&
                points.map((pt, pIdx) => {
                  if (pIdx % 3 !== 0) return null;
                  return <circle key={pIdx} cx={pt.x} cy={pt.y} r="1.2" fill="#FF7E45" opacity={0.85 - r * 0.05} />;
                })}
            </g>
          );
        })}
      </svg>
    </div>
  );
});

interface AnimatedCounterProps {
  value: number;
  color?: string;
  fontWeight?: string | number;
  fontSize?: string;
}

/** A single-digit odometer-style counter that rolls between values. */
export function AnimatedCounter({ value, color = '#8C8C8C', fontWeight = 500, fontSize = '12px' }: AnimatedCounterProps) {
  const displayValue = value > 0 ? value : 1;
  const numbers = Array.from({ length: 15 }, (_, i) => i + 1);
  const lineHeight = 18;

  return (
    <span
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        height: `${lineHeight}px`,
        overflow: 'hidden',
        position: 'relative',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)',
        maskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)',
      }}
    >
      <span style={{ display: 'flex', flexDirection: 'column', transition: 'transform 450ms cubic-bezier(0.5, 0, 0.5, 1)', transform: `translateY(-${(displayValue - 1) * lineHeight}px)` }}>
        {numbers.map((num) => (
          <span key={num} style={{ height: `${lineHeight}px`, lineHeight: `${lineHeight}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize, fontFamily: 'Figtree', fontWeight, color }}>
            {num}
          </span>
        ))}
      </span>
    </span>
  );
}

/** The instruction card or a product card's inner content. */
export function renderCardInner(card: ProductCard) {
  if (card.isInstruction) {
    return (
      <div className="w-full h-full flex flex-col justify-between items-center relative p-6 pointer-events-none" style={{ background: 'radial-gradient(100% 100% at 50% 50%, #2a0f0d 0%, #100505 100%)' }}>
        <div className="w-[190px] h-[190px] flex items-center justify-center relative mt-12">
          <OrganicMeshCloud />
        </div>
        <div className="w-full text-center mt-auto mb-4">
          <div className="relative h-[3px] w-28 bg-[#2A2A2A] mx-auto mb-4 rounded-full overflow-hidden">
            <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#FF9858] to-[#FF5200] w-1/2" />
          </div>
          <p className="font-['Figtree'] font-medium text-[13px] text-white/80 leading-relaxed">
            Swipe <strong className="text-[#FF5200]">right</strong> on items you love
          </p>
          <p className="font-['Figtree'] font-normal text-[12px] text-white/40 mt-0.5">Swipe left on the rest</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative flex flex-col justify-between pointer-events-none bg-[#121212]">
      <div className="w-full h-full absolute inset-0 z-0 bg-[#121212]">
        <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent z-10" />
      </div>
      <div className="mt-auto p-6 relative z-10 w-full select-none">
        <span className="text-[11px] font-['Figtree'] uppercase font-bold tracking-widest text-[#FF5200]">{card.brand}</span>
        <h3 className="font-['Figtree'] text-[16px] text-[#FFFFFF] font-semibold leading-tight mt-1 mb-3">{card.title}</h3>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="font-['Figtree'] text-[15px] font-bold text-[#FFFFFF]">Price {card.price}</span>
          {card.originalPrice && <span className="font-['Figtree'] text-[12px] text-[#8C8C8C] line-through">{card.originalPrice}</span>}
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-[6px] bg-[#FF5200]/10 border border-[#FF5200]/25 rounded-[8px] px-2.5 py-1">
            <span className="font-['Figtree'] text-[12px] font-semibold text-[#FF5200]">{card.discountCoins}</span>
            <span className="text-[11px] text-white/50">using</span>
            <div className="flex items-center gap-[2px]">
              <img src={`${ASSET_BASE}/pop-coin.png`} className="w-[12px] h-[12px]" alt="popcoin" />
              <span className="text-[11px] font-semibold text-[#FFFFFF]">{card.coinValue}</span>
            </div>
          </div>
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-white/10 border border-white/5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M9 5L16 12L9 19" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
