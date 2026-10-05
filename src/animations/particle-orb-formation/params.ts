import type { ParamSchema } from '../_core/params';
import { COLOR_THEMES } from './themes';

const schema: ParamSchema = [
  {
    key: 'colorTheme',
    type: 'segmented',
    label: 'Color theme',
    default: 'flame-orb',
    options: COLOR_THEMES.map((t) => ({ label: t.name, value: t.id })),
  },
  {
    key: 'wavePattern',
    type: 'segmented',
    label: 'Wave mode',
    default: 'video-match',
    options: [
      { label: 'Harmonics', value: 'video-match' },
      { label: 'Neural', value: 'neural' },
      { label: 'Ripple', value: 'ripple' },
      { label: 'Quantum', value: 'quantum' },
      { label: 'Breath', value: 'smooth' },
    ],
  },
  {
    key: 'formation',
    type: 'group',
    label: 'Formation',
    defaultOpen: true,
    children: [
      { key: 'formationDuration', type: 'slider', label: 'Formation duration', default: 1.9, min: 1.5, max: 9.0, step: 0.1, unit: 's' },
      { key: 'startPercentage', type: 'slider', label: 'Formation start pose', default: 51, min: 0, max: 90, step: 1, unit: '%' },
      { key: 'replay', type: 'button', label: 'Replay formation', actionId: 'replay' },
    ],
  },
  {
    key: 'waveDynamics',
    type: 'group',
    label: 'Wave Dynamics & Particles',
    defaultOpen: true,
    children: [
      { key: 'waveAmplitude', type: 'slider', label: 'Wave amplitude', default: 0.25, min: 0.05, max: 0.8, step: 0.02 },
      { key: 'waveFrequency', type: 'slider', label: 'Ridge frequency', default: 7.5, min: 2.0, max: 16.0, step: 0.5 },
      { key: 'waveSpeed', type: 'slider', label: 'Undulation speed', default: 0.35, min: 0.1, max: 2.5, step: 0.05, unit: 'x' },
      { key: 'rotationSpeed', type: 'slider', label: 'Orbital spin speed', default: 0.55, min: 0.0, max: 1.5, step: 0.05, unit: 'x' },
      { key: 'particleSize', type: 'slider', label: 'Particle size', default: 4.7, min: 1.5, max: 7.0, step: 0.2, unit: 'px' },
      { key: 'glowIntensity', type: 'slider', label: 'Glow & corona halo', default: 0.9, min: 0.2, max: 2.5, step: 0.1, unit: 'x' },
      { key: 'particleCount', type: 'slider', label: 'Particle density', default: 12000, min: 3000, max: 24000, step: 1000 },
      { key: 'radius', type: 'slider', label: 'Base sphere radius', default: 120, min: 70, max: 220, step: 5, unit: 'px' },
    ],
  },
  { key: 'interactive', type: 'toggle', label: 'Drag to rotate / scroll to zoom', default: true },
  { key: 'isPlaying', type: 'toggle', label: 'Playing', default: true },
];

export default schema;
