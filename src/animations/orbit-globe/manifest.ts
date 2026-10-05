import { defineManifest } from '../_core/manifest';

export default defineManifest({
  slug: 'orbit-globe',
  name: 'Orbit Globe',
  description: 'Cards orbiting around a tilted ring, perspective-rotated.',
  category: '3D & Perspective',
  tags: ['3d', 'orbit', 'ring', 'cards'],
  version: '1.0.0',
  addedAt: '2026-10-05',
  dependencies: { motion: '^14' },
  frame: 'square',
});
