import type { ParamSchema } from '../_core/params';

const schema: ParamSchema = [
  { key: 'showPhoneFrame', type: 'toggle', label: 'Phone frame', default: true },
  { key: 'enableGyro', type: 'toggle', label: 'Gyroscope / tilt', default: true },
  { key: 'flip', type: 'button', label: 'Flip card', actionId: 'flip' },
  {
    key: 'transition',
    type: 'group',
    label: 'Flip Transition',
    defaultOpen: true,
    children: [
      { key: 'duration', type: 'slider', label: 'Duration', default: 0.46, min: 0.2, max: 2.2, step: 0.02, unit: 's' },
      {
        key: 'easingMode',
        type: 'segmented',
        label: 'Easing',
        default: 'cubic-bezier',
        options: [
          { label: 'Cubic-bezier', value: 'cubic-bezier' },
          { label: 'Spring', value: 'spring' },
        ],
      },
      {
        key: 'bezierPreset',
        type: 'segmented',
        label: 'Curve preset',
        default: 'custom',
        visibleWhen: (v) => v.easingMode === 'cubic-bezier',
        options: [
          { label: 'Apple Fluid', value: 'appleEase' },
          { label: 'Decelerate Fast', value: 'smoothOut' },
          { label: 'Anticipate', value: 'anticipate' },
          { label: 'Gentle Back Out', value: 'backOut' },
          { label: 'Ease In Out Quart', value: 'easeInOutQuart' },
          { label: 'Linear', value: 'linear' },
          { label: 'Custom', value: 'custom' },
        ],
        presets: {
          appleEase: { bezierX1: 0.4, bezierY1: 0.0, bezierX2: 0.2, bezierY2: 1.0 },
          smoothOut: { bezierX1: 0.16, bezierY1: 1.0, bezierX2: 0.3, bezierY2: 1.0 },
          anticipate: { bezierX1: 0.38, bezierY1: -0.15, bezierX2: 0.26, bezierY2: 1.15 },
          backOut: { bezierX1: 0.34, bezierY1: 1.35, bezierX2: 0.64, bezierY2: 1.0 },
          easeInOutQuart: { bezierX1: 0.77, bezierY1: 0.0, bezierX2: 0.175, bezierY2: 1.0 },
          linear: { bezierX1: 0.0, bezierY1: 0.0, bezierX2: 1.0, bezierY2: 1.0 },
        },
      },
      {
        key: 'bezierPoints',
        type: 'group',
        label: 'Bezier points [x1, y1, x2, y2]',
        visibleWhen: (v) => v.easingMode === 'cubic-bezier',
        children: [
          { key: 'bezierX1', type: 'number', label: 'x1', default: 0.22, min: -0.5, max: 1.5, step: 0.01 },
          { key: 'bezierY1', type: 'number', label: 'y1', default: 1.0, min: -0.5, max: 1.5, step: 0.01 },
          { key: 'bezierX2', type: 'number', label: 'x2', default: 0.36, min: -0.5, max: 1.5, step: 0.01 },
          { key: 'bezierY2', type: 'number', label: 'y2', default: 1.0, min: -0.5, max: 1.5, step: 0.01 },
        ],
      },
      { key: 'springStiffness', type: 'slider', label: 'Spring stiffness', default: 260, min: 100, max: 500, step: 10, visibleWhen: (v) => v.easingMode === 'spring' },
      { key: 'springDamping', type: 'slider', label: 'Spring damping', default: 24, min: 10, max: 50, step: 1, visibleWhen: (v) => v.easingMode === 'spring' },
      {
        key: 'flipAxis',
        type: 'segmented',
        label: 'Flip axis',
        default: 'Y',
        options: [
          { label: 'Horizontal', value: 'Y' },
          { label: 'Vertical', value: 'X' },
        ],
      },
      {
        key: 'direction',
        type: 'segmented',
        label: 'Direction',
        default: '1',
        options: [
          { label: 'Clockwise', value: '1' },
          { label: 'Counter-clockwise', value: '-1' },
        ],
      },
      { key: 'perspective', type: 'slider', label: '3D perspective', default: 1200, min: 600, max: 2000, step: 50, unit: 'px' },
      { key: 'midFlipScale', type: 'slider', label: 'Mid-flip scale', default: 0.95, min: 0.88, max: 1.0, step: 0.01 },
      { key: 'staggerDelay', type: 'slider', label: 'Dashboard stagger delay', default: 0.08, min: 0, max: 0.3, step: 0.01, unit: 's' },
      { key: 'slideDistance', type: 'slider', label: 'Dashboard slide distance', default: 45, min: 10, max: 100, step: 5, unit: 'px' },
    ],
  },
  {
    key: 'chips',
    type: 'group',
    label: 'Action Chips',
    children: [
      { key: 'chipSlideOffset', type: 'slider', label: 'Slide-in offset', default: 170, min: 80, max: 260, step: 10, unit: 'px' },
      { key: 'chipBounceStiffness', type: 'slider', label: 'Bounce stiffness', default: 270, min: 160, max: 400, step: 10 },
      { key: 'chipBounceDamping', type: 'slider', label: 'Bounce damping', default: 15, min: 8, max: 26, step: 1 },
    ],
  },
  {
    key: 'tilt',
    type: 'group',
    label: 'Tilt & Shine',
    children: [
      { key: 'maxTiltAngle', type: 'slider', label: 'Max tilt rotation', default: 12, min: 4, max: 24, step: 1, unit: '°' },
      { key: 'parallaxIntensity', type: 'slider', label: 'Parallax depth', default: 1.0, min: 0.2, max: 2.5, step: 0.1, unit: 'x' },
      { key: 'shimmerIntensity', type: 'slider', label: 'Card shimmer', default: 0.85, min: 0, max: 1, step: 0.05 },
      { key: 'movingBorderIntensity', type: 'slider', label: 'Tilt border', default: 0.95, min: 0, max: 1, step: 0.05 },
      { key: 'gradientShiftIntensity', type: 'slider', label: 'Moving gradient shift', default: 1.0, min: 0, max: 2.5, step: 0.05, unit: 'x' },
    ],
  },
];

export default schema;
