import React, { useState, useRef } from 'react';
import { RotateCcw, Check } from 'lucide-react';
import { SPEED_CURVE_PRESETS, sampleSpeedAt } from '../utils/speedCurve';
import { cx } from '../../../lib/utils';

interface SpeedCurveEditorProps {
  speedPoints: number[]; // 11 values for 0%, 10%, ..., 100%
  onChangeSpeedPoints: (points: number[]) => void;
  startPercentage: number; // 0 to 90
  currentProgress: number; // 0 to 1
  onReplay?: () => void;
  onManualScrub?: (val: number) => void;
}

const MAX_SPEED = 3.0;
const MIN_SPEED = 0.1;

export const SpeedCurveEditor: React.FC<SpeedCurveEditorProps> = ({
  speedPoints,
  onChangeSpeedPoints,
  startPercentage,
  currentProgress,
  onReplay,
  onManualScrub,
}) => {
  const [activePointIndex, setActivePointIndex] = useState<number | null>(null);
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>('smooth-s');
  const svgRef = useRef<SVGSVGElement | null>(null);
  const isDraggingRef = useRef(false);

  // Graph dimensions in SVG viewbox coordinates
  const svgWidth = 560;
  const svgHeight = 160;
  const padLeft = 36;
  const padRight = 16;
  const padTop = 16;
  const padBottom = 24;
  const plotW = svgWidth - padLeft - padRight;
  const plotH = svgHeight - padTop - padBottom;

  const getXForPercent = (pct: number) => padLeft + (pct / 100) * plotW;
  const getYForSpeed = (spd: number) => {
    const clamped = Math.max(MIN_SPEED, Math.min(MAX_SPEED, spd));
    const ratio = (clamped - MIN_SPEED) / (MAX_SPEED - MIN_SPEED);
    return padTop + (1 - ratio) * plotH;
  };

  const getSpeedForY = (y: number) => {
    const clampedY = Math.max(padTop, Math.min(padTop + plotH, y));
    const ratio = 1 - (clampedY - padTop) / plotH;
    const spd = MIN_SPEED + ratio * (MAX_SPEED - MIN_SPEED);
    return Math.round(spd * 20) / 20; // Round to 0.05 step
  };

  // Generate SVG curve path
  const numSamples = 80;
  let curvePathD = '';
  let areaPathD = '';

  for (let s = 0; s <= numSamples; s++) {
    const t = s / numSamples;
    const spd = sampleSpeedAt(t, speedPoints);
    const x = padLeft + t * plotW;
    const y = getYForSpeed(spd);
    if (s === 0) {
      curvePathD += `M ${x.toFixed(1)} ${y.toFixed(1)}`;
      areaPathD += `M ${x.toFixed(1)} ${padTop + plotH} L ${x.toFixed(1)} ${y.toFixed(1)}`;
    } else {
      curvePathD += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
      areaPathD += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
  }
  areaPathD += ` L ${padLeft + plotW} ${padTop + plotH} Z`;

  // Pointer event handlers for dragging points on the SVG
  const handlePointerDownPoint = (index: number, e: React.PointerEvent) => {
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    isDraggingRef.current = true;
    setActivePointIndex(index);
    setSelectedPreset('custom');
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || activePointIndex === null || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientY = e.clientY - rect.top;
    const svgY = (clientY / rect.height) * svgHeight;
    const newSpeed = getSpeedForY(svgY);

    const updated = [...speedPoints];
    updated[activePointIndex] = newSpeed;
    onChangeSpeedPoints(updated);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      try {
        (e.target as Element).releasePointerCapture(e.pointerId);
      } catch {
        // Safe ignore
      }
    }
    setActivePointIndex(null);
  };

  const handleSliderChange = (index: number, value: number) => {
    const updated = [...speedPoints];
    updated[index] = value;
    onChangeSpeedPoints(updated);
    setSelectedPreset('custom');
  };

  const applyPreset = (presetId: string) => {
    const found = SPEED_CURVE_PRESETS.find((p) => p.id === presetId);
    if (found) {
      onChangeSpeedPoints([...found.points]);
      setSelectedPreset(presetId);
    }
  };

  // Current progress indicator on curve
  const currentT = Math.max(0, Math.min(1, currentProgress));
  const indicatorX = padLeft + currentT * plotW;
  const currentSpeedAtProgress = sampleSpeedAt(currentT, speedPoints);
  const indicatorY = getYForSpeed(currentSpeedAtProgress);

  return (
    <div className="flex flex-col gap-4 border-t border-border pt-4 min-w-0 max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold tracking-wide text-muted uppercase">
          Speed Curve
        </span>
        {onReplay && (
          <button
            type="button"
            onClick={onReplay}
            className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border bg-raised px-2.5 text-[11px] font-medium text-text hover:bg-border transition-colors duration-150 cursor-pointer"
          >
            <RotateCcw size={11} className="text-accent" />
            Replay
          </button>
        )}
      </div>

      {/* Presets */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin max-w-full min-w-0">
        {SPEED_CURVE_PRESETS.map((preset) => {
          const isActive = selectedPreset === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.id)}
              className={cx(
                'rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors duration-150 whitespace-nowrap cursor-pointer',
                isActive
                  ? 'bg-accent text-white shadow-sm'
                  : 'border border-border bg-raised text-muted hover:text-text hover:bg-border',
              )}
              title={preset.description}
            >
              {preset.name}
            </button>
          );
        })}
        {selectedPreset === 'custom' && (
          <span className="flex items-center gap-1 rounded-md border border-accent/30 bg-accent/15 px-2 py-0.5 text-[11px] font-medium text-accent whitespace-nowrap">
            <Check size={11} /> Custom
          </span>
        )}
      </div>

      {/* SVG Curve */}
      <div className="relative w-full overflow-hidden rounded-md border border-border bg-raised p-2">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="h-36 w-full select-none touch-none sm:h-40"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <defs>
            <linearGradient id="speedCurveFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3d7bfa" stopOpacity="0.30" />
              <stop offset="70%" stopColor="#3d7bfa" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#3d7bfa" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Reference Lines */}
          {[1.0, 2.0, 3.0].map((spd) => {
            const y = getYForSpeed(spd);
            const isBase = spd === 1.0;
            return (
              <g key={spd}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={padLeft + plotW}
                  y2={y}
                  stroke="currentColor"
                  className={isBase ? 'text-border opacity-80' : 'text-border opacity-40'}
                  strokeDasharray={isBase ? '3 3' : '2 4'}
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 6}
                  y={y + 3.5}
                  textAnchor="end"
                  fill="var(--color-muted)"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {spd.toFixed(1)}x
                </text>
              </g>
            );
          })}

          {/* Vertical 10% Interval Grid Lines */}
          {Array.from({ length: 11 }).map((_, i) => {
            const pct = i * 10;
            const x = getXForPercent(pct);
            return (
              <g key={pct}>
                <line
                  x1={x}
                  y1={padTop}
                  x2={x}
                  y2={padTop + plotH}
                  stroke="currentColor"
                  className={i === 0 || i === 10 ? 'text-border opacity-70' : 'text-border opacity-30'}
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={padTop + plotH + 15}
                  textAnchor="middle"
                  fill="var(--color-muted)"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {pct}%
                </text>
              </g>
            );
          })}

          {/* Area Gradient */}
          <path d={areaPathD} fill="url(#speedCurveFill)" />

          {/* Speed Curve Stroke */}
          <path
            d={curvePathD}
            fill="none"
            stroke="#3d7bfa"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Start Percentage Indicator */}
          {startPercentage > 0 && (
            <g>
              <rect
                x={padLeft}
                y={padTop}
                width={(startPercentage / 100) * plotW}
                height={plotH}
                fill="rgba(0, 0, 0, 0.25)"
              />
              <line
                x1={getXForPercent(startPercentage)}
                y1={padTop}
                x2={getXForPercent(startPercentage)}
                y2={padTop + plotH}
                stroke="#3d7bfa"
                strokeWidth="1.5"
                strokeDasharray="3 2"
                opacity="0.9"
              />
              <g transform={`translate(${getXForPercent(startPercentage)}, ${padTop})`}>
                <rect
                  x="-22"
                  y="-12"
                  width="44"
                  height="12"
                  rx="3"
                  fill="#3d7bfa"
                />
                <text
                  x="0"
                  y="-3"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="7.5"
                  fontWeight="600"
                  fontFamily="monospace"
                >
                  START {startPercentage}%
                </text>
              </g>
            </g>
          )}

          {/* Live Progress Line & Dot */}
          <line
            x1={indicatorX}
            y1={padTop}
            x2={indicatorX}
            y2={padTop + plotH}
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeDasharray="2 2"
            opacity="0.8"
          />
          <circle
            cx={indicatorX}
            cy={indicatorY}
            r="4.5"
            fill="#ffffff"
            stroke="#3d7bfa"
            strokeWidth="2"
            className="filter drop-shadow-[0_0_6px_rgba(61,123,250,0.8)]"
          />

          {/* Draggable Points */}
          {speedPoints.map((speed, i) => {
            const pct = i * 10;
            const cxPos = getXForPercent(pct);
            const cyPos = getYForSpeed(speed);
            const isHovered = hoveredPointIndex === i;
            const isActive = activePointIndex === i;

            return (
              <g key={i}>
                <circle
                  cx={cxPos}
                  cy={cyPos}
                  r="14"
                  fill="transparent"
                  className="cursor-ns-resize"
                  onPointerDown={(e) => handlePointerDownPoint(i, e)}
                  onPointerEnter={() => setHoveredPointIndex(i)}
                  onPointerLeave={() => setHoveredPointIndex(null)}
                />

                {(isHovered || isActive) && (
                  <circle
                    cx={cxPos}
                    cy={cyPos}
                    r="8"
                    fill="none"
                    stroke="#3d7bfa"
                    strokeWidth="1.5"
                    opacity="0.8"
                  />
                )}

                <circle
                  cx={cxPos}
                  cy={cyPos}
                  r={isActive ? 5 : isHovered ? 4.5 : 3.5}
                  fill={isActive ? '#ffffff' : '#3d7bfa'}
                  stroke="var(--color-raised)"
                  strokeWidth="1.5"
                  className="transition-all cursor-ns-resize"
                />

                <text
                  x={cxPos}
                  y={cyPos - 7}
                  textAnchor="middle"
                  fill={isHovered || isActive ? 'var(--color-text)' : 'var(--color-muted)'}
                  fontSize={isHovered || isActive ? '9' : '8'}
                  fontWeight={isHovered || isActive ? '600' : '400'}
                  fontFamily="monospace"
                  className="pointer-events-none"
                >
                  {speed.toFixed(1)}x
                </text>
              </g>
            );
          })}
        </svg>

        {/* Live Metrics Bar */}
        <div className="flex items-center justify-between px-1 pt-1.5 text-[11px] font-mono text-muted">
          <span>
            Start: <strong className="font-semibold text-text">{startPercentage}%</strong>
          </span>
          <span>
            Stage: <strong className="font-semibold text-text">{Math.round(currentProgress * 100)}%</strong>
          </span>
          <span>
            Velocity: <strong className="font-semibold text-accent">{currentSpeedAtProgress.toFixed(2)}x</strong>
          </span>
        </div>
      </div>

      {/* Interval Sliders */}
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-semibold tracking-wide text-muted uppercase">
          Interval Faders
        </span>
        <div className="grid grid-cols-11 gap-1 rounded-md border border-border bg-raised p-2.5">
          {speedPoints.map((speed, i) => {
            const pct = i * 10;
            return (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <span className="text-[9px] font-mono text-muted">{pct}%</span>
                <input
                  type="range"
                  min={MIN_SPEED}
                  max={MAX_SPEED}
                  step="0.05"
                  value={speed}
                  onChange={(e) => handleSliderChange(i, parseFloat(e.target.value))}
                  className="h-14 w-1 cursor-ns-resize appearance-none rounded-full bg-border accent-accent [writing-mode:vertical-lr] [direction:rtl]"
                  title={`${pct}%: ${speed.toFixed(2)}x`}
                />
                <span className="text-[9px] font-mono text-text">{speed.toFixed(1)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Manual Scrub */}
      {onManualScrub && (
        <div className="flex items-center justify-between gap-3 pt-1">
          <span className="text-[12px] text-muted">Stage scrub</span>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={currentProgress}
              onChange={(e) => onManualScrub(parseFloat(e.target.value))}
              className="h-1 w-28 cursor-pointer appearance-none rounded-full bg-border accent-accent"
            />
            <span className="w-10 text-right text-[12px] tabular-nums font-mono text-text">
              {Math.round(currentProgress * 100)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
