import type { ParamSchema } from '../_core/params';

const schema: ParamSchema = [
  { key: 'isSlowMo', type: 'toggle', label: 'Slow motion (0.5x)', default: false },
  { key: 'enableCommas', type: 'toggle', label: 'Indian comma grouping', default: true },
  {
    key: 'timing',
    type: 'group',
    label: 'Speed & Timing',
    defaultOpen: true,
    children: [
      { key: 'speedIn', type: 'slider', label: 'Digit spawn duration', default: 0.3, min: 0.1, max: 1.2, step: 0.02, unit: 's' },
      { key: 'speedOut', type: 'slider', label: 'Backspace exit duration', default: 0.15, min: 0.05, max: 0.8, step: 0.02, unit: 's' },
      { key: 'autoTypeInterval', type: 'slider', label: 'Demo typing interval', default: 340, min: 100, max: 800, step: 20, unit: 'ms' },
      { key: 'demo', type: 'button', label: 'Replay demo (types 5565)', actionId: 'demo' },
    ],
  },
  {
    key: 'scale',
    type: 'group',
    label: 'Scale & Font Size',
    children: [
      { key: 'digitFontSize', type: 'slider', label: 'Digit font size', default: 64, min: 24, max: 120, step: 1, unit: 'px' },
      { key: 'elementScale', type: 'slider', label: 'Whole input scale', default: 1.0, min: 0.5, max: 1.5, step: 0.05, unit: 'x' },
      { key: 'initialScale', type: 'slider', label: 'Digit spawn start scale', default: 0.3, min: 0.05, max: 0.6, step: 0.05, unit: 'x' },
    ],
  },
  {
    key: 'spring',
    type: 'group',
    label: 'Spring Physics',
    children: [
      { key: 'springOvershoot', type: 'slider', label: 'Overshoot', default: 1.08, min: 1.0, max: 1.3, step: 0.02, unit: 'x' },
      { key: 'springStiffness', type: 'slider', label: 'Stiffness', default: 540, min: 100, max: 900, step: 20 },
      { key: 'springDamping', type: 'slider', label: 'Damping', default: 26, min: 10, max: 60, step: 2 },
      { key: 'springMass', type: 'slider', label: 'Mass', default: 0.45, min: 0.1, max: 1.5, step: 0.05 },
    ],
  },
  {
    key: 'font',
    type: 'group',
    label: 'Font & Weight',
    children: [
      {
        key: 'fontMode',
        type: 'segmented',
        label: 'Font',
        default: 'custom',
        options: [
          { label: 'Custom', value: 'custom' },
          { label: 'Outfit', value: 'outfit' },
          { label: 'Figtree', value: 'figtree' },
        ],
      },
      { key: 'targetWeight', type: 'slider', label: 'Target weight', default: 400, min: 100, max: 950, step: 50 },
      { key: 'digitSpacing', type: 'slider', label: 'Digit spacing', default: 2, min: 0, max: 24, step: 1, unit: 'px' },
    ],
  },
  {
    key: 'comma',
    type: 'group',
    label: 'Comma Behavior',
    children: [
      { key: 'commaOffsetY', type: 'slider', label: 'Rise distance', default: 16, min: 0, max: 50, step: 1, unit: 'px' },
      { key: 'commaOpacity', type: 'slider', label: 'Target opacity', default: 1.0, min: 0.1, max: 1.0, step: 0.05 },
      { key: 'commaEnterDuration', type: 'slider', label: 'Rise duration', default: 0.32, min: 0.1, max: 0.8, step: 0.02, unit: 's' },
    ],
  },
  {
    key: 'rupee',
    type: 'group',
    label: 'Rupee Symbol',
    children: [
      { key: 'rupeeFontSize', type: 'slider', label: 'Font size', default: 42, min: 16, max: 80, step: 1, unit: 'px' },
      { key: 'rupeeFontWeight', type: 'slider', label: 'Font weight', default: 500, min: 100, max: 900, step: 50 },
      { key: 'rupeeGap', type: 'slider', label: 'Gap to first digit', default: 0, min: 0, max: 36, step: 1, unit: 'px' },
      { key: 'rupeeTopOffset', type: 'slider', label: 'Vertical nudge', default: 0, min: -16, max: 16, step: 1, unit: 'px' },
    ],
  },
];

export default schema;
