import { defineManifest } from '../_core/manifest';

export default defineManifest({
  slug: 'card-cascade',
  name: 'Card Cascade',
  description: 'A fan of overlapping cards that tilt and bob in sequence.',
  category: 'Cards & Decks',
  tags: ['cards', 'stack', 'tilt'],
  version: '1.0.0',
  addedAt: '2026-10-05',
  dependencies: { motion: '^14' },
  frame: 'phone',
});
