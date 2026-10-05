import type { ParamSchema } from '../_core/params';

const schema: ParamSchema = [
  {
    key: 'easingPreset',
    type: 'segmented',
    label: 'Curve preset',
    default: 'snappy',
    options: [
      { label: 'Snappy Release', value: 'snappy' },
      { label: 'Linear', value: 'linear' },
      { label: 'Ease Out', value: 'easeOut' },
      { label: 'Bouncy', value: 'bouncy' },
      { label: 'Smooth', value: 'smooth' },
      { label: 'Custom', value: 'custom' },
    ],
    presets: {
      snappy: { bezierX1: 0.25, bezierY1: 1, bezierX2: 0.5, bezierY2: 1 },
      linear: { bezierX1: 0, bezierY1: 0, bezierX2: 1, bezierY2: 1 },
      easeOut: { bezierX1: 0, bezierY1: 0, bezierX2: 0.58, bezierY2: 1 },
      bouncy: { bezierX1: 0.34, bezierY1: 1.56, bezierX2: 0.64, bezierY2: 1 },
      smooth: { bezierX1: 0.4, bezierY1: 0, bezierX2: 0.2, bezierY2: 1 },
    },
  },
  {
    key: 'bezierPoints',
    type: 'group',
    label: 'Curve points [x1, y1, x2, y2]',
    children: [
      { key: 'bezierX1', type: 'number', label: 'x1', default: 0.25, min: -0.5, max: 1.5, step: 0.01 },
      { key: 'bezierY1', type: 'number', label: 'y1', default: 1, min: -0.5, max: 1.5, step: 0.01 },
      { key: 'bezierX2', type: 'number', label: 'x2', default: 0.5, min: -0.5, max: 1.5, step: 0.01 },
      { key: 'bezierY2', type: 'number', label: 'y2', default: 1, min: -0.5, max: 1.5, step: 0.01 },
    ],
  },
  {
    key: 'swipePhysics',
    type: 'group',
    label: 'Swipe Physics',
    defaultOpen: true,
    children: [
      { key: 'animationDuration', type: 'slider', label: 'Flight-out speed', default: 600, min: 200, max: 1200, step: 20, unit: 'ms' },
      { key: 'swipeThreshold', type: 'slider', label: 'Swipe distance threshold', default: 80, min: 40, max: 150, step: 5, unit: 'px' },
      { key: 'maxRotation', type: 'slider', label: 'Max tilt rotation', default: 15, min: 5, max: 30, step: 1, unit: '°' },
      { key: 'rotationSensitivity', type: 'slider', label: 'Rotation sensitivity', default: 160, min: 80, max: 240, step: 10, unit: 'px' },
      { key: 'grayscaleDistance', type: 'slider', label: 'Reject grayscale distance', default: 80, min: 40, max: 160, step: 10, unit: 'px' },
      { key: 'maxYLimit', type: 'slider', label: 'Vertical rubber-band limit', default: 40, min: 10, max: 80, step: 5, unit: 'px' },
    ],
  },
  {
    key: 'cardStack',
    type: 'group',
    label: 'Card Stack',
    children: [
      { key: 'stackScaleStep', type: 'slider', label: 'Scale step per card', default: 0.06, min: 0.02, max: 0.12, step: 0.01 },
      { key: 'stackOffsetStep', type: 'slider', label: 'Offset step per card', default: 20, min: 5, max: 40, step: 5, unit: 'px' },
      { key: 'comeUpDuration', type: 'slider', label: 'Stack come-up duration', default: 350, min: 150, max: 600, step: 10, unit: 'ms' },
    ],
  },
];

export default schema;
