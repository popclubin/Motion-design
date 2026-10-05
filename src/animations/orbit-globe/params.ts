import type { ParamSchema } from '../_core/params';

const schema: ParamSchema = [
  { key: 'cardCount', type: 'slider', label: 'Card count', default: 8, min: 4, max: 16, step: 1 },
  { key: 'radius', type: 'slider', label: 'Radius', default: 120, min: 60, max: 200, step: 5, unit: 'px' },
  { key: 'speed', type: 'slider', label: 'Speed', default: 1, min: 0.2, max: 3, step: 0.1 },
  { key: 'accentColor', type: 'color', label: 'Accent colour', default: '#3d7bfa' },
];

export default schema;
