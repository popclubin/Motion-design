import type { ParamSchema } from '../_core/params';

const schema: ParamSchema = [
  { key: 'mobileView', type: 'toggle', label: 'Mobile view', default: true },
  { key: 'speed', type: 'slider', label: 'Animation speed', default: 1, min: 0.25, max: 3, step: 0.05, unit: 'x' },
  {
    key: 'easingStyle',
    type: 'segmented',
    label: 'Motion curve',
    default: 'original',
    options: [
      { label: 'Original', value: 'original' },
      { label: 'Linear', value: 'linear' },
      { label: 'Smooth', value: 'smooth' },
      { label: 'Snappy', value: 'snappy' },
    ],
  },
  { key: 'autoPlay', type: 'toggle', label: 'Auto-play on load', default: true },
  { key: 'replay', type: 'button', label: 'Replay animation', actionId: 'replay' },
];

export default schema;
