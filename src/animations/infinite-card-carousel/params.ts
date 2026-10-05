import type { ParamSchema } from '../_core/params';

const schema: ParamSchema = [
  { key: 'showPhoneFrame', type: 'toggle', label: 'Show phone frame', default: true },
  {
    key: 'snapSymmetry',
    type: 'group',
    label: 'Snap & Symmetry',
    defaultOpen: true,
    children: [
      { key: 'flankingCardsCount', type: 'slider', label: 'Side cards (per side)', default: 5, min: 1, max: 6, step: 1 },
      { key: 'snapStiffness', type: 'slider', label: 'Snap stiffness', default: 180, min: 80, max: 320, step: 5 },
      { key: 'snapDamping', type: 'slider', label: 'Snap damping', default: 27, min: 16, max: 42, step: 1 },
      { key: 'swipeSensitivity', type: 'slider', label: 'Swipe sensitivity', default: 0.35, min: 0.2, max: 3.5, step: 0.1 },
      { key: 'swipeThreshold', type: 'slider', label: 'Swipe trigger distance', default: 36, min: 10, max: 80, step: 2, unit: 'px' },
      { key: 'symmetricLighting', type: 'toggle', label: 'Symmetric studio lighting', default: true },
      { key: 'showSymmetryGuides', type: 'toggle', label: 'Show symmetry guides', default: false },
    ],
  },
  {
    key: 'centerCard',
    type: 'group',
    label: 'Center Card',
    children: [
      { key: 'centerPerspective', type: 'slider', label: 'Center perspective', default: 1800, min: 280, max: 1800, step: 20, unit: 'px' },
      { key: 'heroLiftY', type: 'slider', label: 'Elevation (lift Y)', default: 46, min: 0, max: 240, step: 1, unit: 'px' },
      { key: 'heroPopZ', type: 'slider', label: 'Pop-forward depth (Z)', default: 54, min: -50, max: 160, step: 1, unit: 'px' },
      { key: 'heroRotY', type: 'slider', label: 'Center yaw', default: -1, min: -70, max: 30, step: 1, unit: '°' },
      { key: 'heroTiltX', type: 'slider', label: 'Center pitch', default: -13, min: -35, max: 35, step: 1, unit: '°' },
      { key: 'heroRotZ', type: 'slider', label: 'Center roll', default: 0, min: -20, max: 20, step: 0.5, unit: '°' },
      { key: 'cardScaleActive', type: 'slider', label: 'Center active scale', default: 1.09, min: 0.8, max: 1.4, step: 0.01 },
      { key: 'heroTravelCurve', type: 'slider', label: 'Emergence curve sharpness', default: 3.1, min: 0.8, max: 5, step: 0.1 },
    ],
  },
  {
    key: 'lightShadows',
    type: 'group',
    label: 'Light & Shadows',
    children: [
      { key: 'castShadowOnNeighbors', type: 'toggle', label: 'Cast shadow on neighbors', default: true },
      { key: 'castShadowOpacity', type: 'slider', label: 'Card-on-card shadow opacity', default: 1, min: 0, max: 1, step: 0.02 },
      { key: 'shadowIntensity', type: 'slider', label: 'Drop shadow darkness', default: 0.56, min: 0.1, max: 1, step: 0.02 },
      { key: 'shadowSoftness', type: 'slider', label: 'Shadow softness', default: 31, min: 2, max: 45, step: 1, unit: 'px' },
      { key: 'specularSheen', type: 'slider', label: 'Specular sheen', default: 1, min: 0, max: 1, step: 0.05 },
    ],
  },
  {
    key: 'fanCurve',
    type: 'group',
    label: 'Fan Curve',
    children: [
      { key: 'fanRadius', type: 'slider', label: 'Circle arc radius', default: 210, min: 100, max: 750, step: 10, unit: 'px' },
      { key: 'fanSpacing', type: 'slider', label: 'Card spacing', default: 1, min: 0, max: 180, step: 1, unit: 'px' },
      { key: 'fanTiltStep', type: 'slider', label: 'Fan roll spread', default: 0.5, min: 0.5, max: 10, step: 0.1, unit: '°' },
      { key: 'yawAngle', type: 'slider', label: 'Side inward yaw', default: 63, min: 10, max: 85, step: 1, unit: '°' },
      { key: 'curveDepth', type: 'slider', label: 'Z-depth curvature', default: 51, min: 0, max: 140, step: 1, unit: 'px' },
      { key: 'baseYOffset', type: 'slider', label: 'Base Y offset', default: 74, min: -40, max: 140, step: 1, unit: 'px' },
    ],
  },
  {
    key: 'cameraDimensions',
    type: 'group',
    label: 'Camera & Dimensions',
    children: [
      {
        key: 'cardOrientation',
        type: 'segmented',
        label: 'Orientation',
        default: 'vertical',
        options: [
          { label: 'Vertical', value: 'vertical' },
          { label: 'Horizontal', value: 'horizontal' },
        ],
        presets: {
          vertical: { cardWidth: 118 },
          horizontal: { cardWidth: 240 },
        },
      },
      { key: 'cardWidth', type: 'slider', label: 'Card width', default: 118, min: 90, max: 360, step: 1, unit: 'px' },
      { key: 'perspective', type: 'slider', label: 'Stage perspective', default: 1900, min: 350, max: 1900, step: 25, unit: 'px' },
      { key: 'tiltX', type: 'slider', label: 'Stage tilt (pitch)', default: 35, min: -35, max: 35, step: 1, unit: '°' },
    ],
  },
  {
    key: 'motionGlow',
    type: 'group',
    label: 'Motion & Glow',
    children: [
      { key: 'soundEnabled', type: 'toggle', label: 'Sound', default: true },
      { key: 'hapticsEnabled', type: 'toggle', label: 'Haptic feedback', default: true },
      { key: 'autoRotate', type: 'toggle', label: 'Auto-rotate', default: false },
      { key: 'autoRotateSpeed', type: 'slider', label: 'Auto-rotate speed', default: 25, min: -50, max: 50, step: 1, unit: '°/s' },
      { key: 'glowIntensity', type: 'slider', label: 'Spotlight glow intensity', default: 0.8, min: 0, max: 1.8, step: 0.05 },
      {
        key: 'glowColorMode',
        type: 'segmented',
        label: 'Spotlight colour',
        default: 'amber',
        options: [
          { label: 'Lime', value: 'neon-green' },
          { label: 'Brand', value: 'card-brand' },
          { label: 'Cyan', value: 'cyan' },
          { label: 'Amber', value: 'amber' },
        ],
      },
    ],
  },
];

export default schema;
