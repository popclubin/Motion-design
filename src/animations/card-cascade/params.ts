import type { ParamSchema } from '../_core/params';

const schema: ParamSchema = [
  {
    key: 'preset',
    type: 'segmented',
    label: 'Preset',
    default: 'fan',
    options: [
      { label: 'Fan', value: 'fan' },
      { label: 'Tight', value: 'tight' },
      { label: 'Flat', value: 'flat' },
    ],
    presets: {
      fan: { cardCount: 4, overlap: 60, tilt: 6 },
      tight: { cardCount: 6, overlap: 85, tilt: 2 },
      flat: { cardCount: 4, overlap: 40, tilt: 0 },
    },
  },
  { key: 'cardCount', type: 'slider', label: 'Card count', default: 4, min: 2, max: 8, step: 1 },
  { key: 'overlap', type: 'slider', label: 'Overlap', default: 60, min: 0, max: 100, step: 5, unit: '%' },
  { key: 'tilt', type: 'slider', label: 'Tilt', default: 6, min: 0, max: 20, step: 1, unit: '°' },
  { key: 'cardColor', type: 'color', label: 'Card colour', default: '#1b1b20' },
];

export default schema;
