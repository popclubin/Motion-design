import type { ParamSchema } from '../_core/params';

const schema: ParamSchema = [
  {
    key: 'dataset',
    type: 'segmented',
    label: 'Catalog',
    default: 'featured',
    options: [
      { label: 'Popclub Picks', value: 'featured' },
      { label: 'Technosport', value: 'technosport' },
      { label: 'Fast&Up', value: 'fastandup' },
    ],
  },
  { key: 'toggleProduct', type: 'button', label: 'Open / close product', actionId: 'toggleProduct' },
  {
    key: 'preset',
    type: 'segmented',
    label: 'Feel preset',
    default: 'swiggy',
    options: [
      { label: 'Swiggy Fluid', value: 'swiggy' },
      { label: 'Bouncy', value: 'bouncy' },
      { label: 'Snappy', value: 'snappy' },
      { label: 'Smooth', value: 'smooth' },
      { label: 'Custom', value: 'custom' },
    ],
    presets: {
      swiggy: { springStiffness: 340, springDamping: 28, springMass: 0.85, dragCloseThreshold: 110 },
      bouncy: { springStiffness: 420, springDamping: 18, springMass: 0.95, dragCloseThreshold: 90 },
      snappy: { springStiffness: 550, springDamping: 40, springMass: 0.6, dragCloseThreshold: 80 },
      smooth: { springStiffness: 240, springDamping: 32, springMass: 1.1, dragCloseThreshold: 140 },
    },
  },
  {
    key: 'physics',
    type: 'group',
    label: 'Open & Close Physics',
    defaultOpen: true,
    children: [
      { key: 'springStiffness', type: 'slider', label: 'Spring stiffness', default: 340, min: 120, max: 600, step: 10 },
      { key: 'springDamping', type: 'slider', label: 'Spring damping', default: 28, min: 10, max: 50, step: 2 },
      { key: 'springMass', type: 'slider', label: 'Spring mass', default: 0.85, min: 0.3, max: 1.5, step: 0.05 },
      { key: 'dragCloseThreshold', type: 'slider', label: 'Pull-to-close distance', default: 110, min: 50, max: 220, step: 5, unit: 'px' },
    ],
  },
  { key: 'enableBackdropBlur', type: 'toggle', label: 'Backdrop blur on open', default: true },
];

export default schema;
