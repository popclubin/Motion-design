import type { SpeedCurvePreset } from '../types';

export const DEFAULT_SPEED_POINTS = [3.0, 3.0, 3.0, 3.0, 3.0, 3.0, 2.7, 1.9, 1.3, 0.8, 0.2];
export const DEFAULT_START_PERCENTAGE = 51;
export const DEFAULT_FORMATION_DURATION = 1.9;

export const SPEED_CURVE_PRESETS: SpeedCurvePreset[] = [
  {
    id: 'smooth-s',
    name: 'S-Curve',
    description: 'Gentle start, fluid mid-flight velocity, and ultra-soft landing.',
    points: [3.0, 3.0, 3.0, 3.0, 3.0, 3.0, 2.7, 1.9, 1.3, 0.8, 0.2],
  },
  {
    id: 'linear',
    name: 'Linear',
    description: 'Uniform, steady particle convergence speed from start to finish.',
    points: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
  },
  {
    id: 'slow-start',
    name: 'Slow Start',
    description: 'Slow atmospheric gathering, then accelerating rapidly into the orb.',
    points: [0.2, 0.3, 0.5, 0.8, 1.1, 1.5, 1.8, 2.1, 2.4, 2.6, 2.8],
  },
  {
    id: 'soft-landing',
    name: 'Fast Burst',
    description: 'Fast explosive convergence, then gliding delicately to a halt.',
    points: [2.5, 2.3, 2.0, 1.7, 1.4, 1.1, 0.8, 0.55, 0.35, 0.22, 0.15],
  },
  {
    id: 'pulsed',
    name: 'Harmonic',
    description: 'Rhythmic breathing waves that undulate during particle assembly.',
    points: [0.4, 1.6, 0.6, 1.9, 0.7, 1.8, 0.6, 1.6, 0.6, 0.9, 0.3],
  },
];

function catmullRom(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const v0 = (p2 - p0) * 0.5;
  const v1 = (p3 - p1) * 0.5;
  const t2 = t * t;
  const t3 = t * t2;
  return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;
}

export function sampleSpeedAt(t: number, points: number[]): number {
  const clampedT = Math.max(0, Math.min(1, t));
  const n = points.length - 1;
  const scaled = clampedT * n;
  const i = Math.floor(scaled);
  const frac = scaled - i;

  if (i >= n) return points[n];

  const p0 = points[Math.max(0, i - 1)];
  const p1 = points[i];
  const p2 = points[Math.min(n, i + 1)];
  const p3 = points[Math.min(n, i + 2)];

  const val = catmullRom(p0, p1, p2, p3, frac);
  return Math.max(0.05, Math.min(4.0, val));
}

/**
 * Precomputed cumulative-progress lookup table: guarantees strictly monotonic
 * 0->1 progress that matches the target formation duration exactly.
 */
export class SpeedCurveIntegrator {
  private samples: number[] = [];
  private pointsKey: string = '';

  constructor(points: number[]) {
    this.update(points);
  }

  public update(points: number[]): void {
    const key = points.map((p) => p.toFixed(2)).join(',');
    if (key === this.pointsKey && this.samples.length > 0) return;
    this.pointsKey = key;

    const SAMPLES = 200;
    const rawIntegral: number[] = new Array(SAMPLES + 1);
    rawIntegral[0] = 0;

    let cumulative = 0;
    const dt = 1.0 / SAMPLES;

    for (let s = 1; s <= SAMPLES; s++) {
      const tMid = (s - 0.5) * dt;
      const speed = sampleSpeedAt(tMid, points);
      cumulative += speed * dt;
      rawIntegral[s] = cumulative;
    }

    const totalArea = cumulative > 0.0001 ? cumulative : 1.0;
    this.samples = rawIntegral.map((val) => Math.min(1.0, Math.max(0.0, val / totalArea)));
    this.samples[SAMPLES] = 1.0;
  }

  public getProgress(normalizedTime: number, startProgress: number = 0): number {
    const tClamped = Math.max(0, Math.min(1, normalizedTime));
    const SAMPLES = 200;
    const pos = tClamped * SAMPLES;
    const idx = Math.floor(pos);
    const frac = pos - idx;

    let baseFactor = 1.0;
    if (idx < SAMPLES) {
      const y0 = this.samples[idx];
      const y1 = this.samples[idx + 1];
      baseFactor = y0 + (y1 - y0) * frac;
    }

    const startP = Math.max(0, Math.min(0.999, startProgress));
    return startP + (1.0 - startP) * baseFactor;
  }
}
