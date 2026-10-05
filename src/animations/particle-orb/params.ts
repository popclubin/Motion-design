import type { ParamSchema } from '../_core/params';

const schema: ParamSchema = [
  {
    key: 'colorPreset',
    type: 'segmented',
    label: 'Colour preset',
    default: 'original-fire',
    options: [
      { label: 'Flame', value: 'original-fire' },
      { label: 'Cyber Violet', value: 'cyber-violet' },
      { label: 'Quantum Cyan', value: 'quantum-cyan' },
      { label: 'Solar Corona', value: 'solar-gold' },
      { label: 'Emerald Matrix', value: 'emerald-matrix' },
      { label: 'Deep Crimson', value: 'deep-crimson' },
    ],
    presets: {
      'original-fire': { color: '#ff3700', secondaryColor: '#ff9d00', coreColor: '#b30000' },
      'cyber-violet': { color: '#d900ff', secondaryColor: '#00f7ff', coreColor: '#49007a' },
      'quantum-cyan': { color: '#00f2fe', secondaryColor: '#4facfe', coreColor: '#003566' },
      'solar-gold': { color: '#ffaa00', secondaryColor: '#fff275', coreColor: '#cc3700' },
      'emerald-matrix': { color: '#00ff88', secondaryColor: '#adff2f', coreColor: '#004d26' },
      'deep-crimson': { color: '#ff003c', secondaryColor: '#ff6b8b', coreColor: '#590014' },
    },
  },
  { key: 'color', type: 'color', label: 'Primary colour', default: '#ff3700' },
  { key: 'secondaryColor', type: 'color', label: 'Peak crest colour', default: '#ff9d00' },
  { key: 'coreColor', type: 'color', label: 'Core base colour', default: '#b30000' },
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
    key: 'waveDynamics',
    type: 'group',
    label: 'Wave Dynamics & Particles',
    defaultOpen: true,
    children: [
      { key: 'waveAmplitude', type: 'slider', label: 'Wave amplitude', default: 0.38, min: 0.05, max: 0.85, step: 0.01 },
      { key: 'waveFrequency', type: 'slider', label: 'Ridge frequency', default: 7.0, min: 2.0, max: 16.0, step: 0.5 },
      { key: 'waveSpeed', type: 'slider', label: 'Undulation speed', default: 1.25, min: 0.1, max: 3.5, step: 0.05, unit: 'x' },
      { key: 'rotationSpeed', type: 'slider', label: 'Auto orbit rotation', default: 0.0, min: 0.0, max: 1.5, step: 0.05, unit: 'x' },
      { key: 'particleSize', type: 'slider', label: 'Particle size', default: 5.0, min: 1.0, max: 6.0, step: 0.1, unit: 'px' },
      { key: 'glowIntensity', type: 'slider', label: 'Glow halo intensity', default: 1.6, min: 0.5, max: 3.0, step: 0.1, unit: 'x' },
      {
        key: 'particleCount',
        type: 'segmented',
        label: 'Particle density',
        default: '10000',
        options: [
          { label: 'Performance (6k)', value: '6000' },
          { label: 'Standard (10k)', value: '10000' },
          { label: 'Ultra (16k)', value: '16000' },
        ],
      },
    ],
  },
  { key: 'interactive', type: 'toggle', label: 'Drag to rotate / scroll to zoom', default: true },
  { key: 'isPlaying', type: 'toggle', label: 'Playing', default: true },
];

export default schema;
