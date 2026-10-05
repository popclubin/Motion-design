import { defineManifest } from '../_core/manifest';

export default defineManifest({
  slug: 'particle-orb',
  name: 'Particle Wave Orb',
  description:
    'A glowing 3D sphere of thousands of particles, undulating with harmonic waves rendered in WebGL.',
  category: '3D & Perspective',
  tags: ['3d', 'particles', 'webgl', 'three'],
  version: '1.0.0',
  addedAt: '2026-10-06',
  dependencies: { three: '^0.186.1' },
  frame: 'square',
});
