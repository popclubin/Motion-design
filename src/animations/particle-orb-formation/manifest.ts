import { defineManifest } from '../_core/manifest';

export default defineManifest({
  slug: 'particle-orb-formation',
  name: 'Particle Orb Formation',
  description: 'Thousands of particles converge from surrounding space into a pulsating wave-sphere, with a tunable speed curve.',
  category: '3D & Perspective',
  tags: ['3d', 'particles', 'three.js', 'formation', 'webgl'],
  version: '1.0.0',
  addedAt: '2026-10-06',
  dependencies: { three: '^0.186.1' },
  frame: 'square',
});
