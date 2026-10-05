import { defineManifest } from '../_core/manifest';

export default defineManifest({
  slug: 'payment-phone-screen',
  name: 'Payment Phone Screen',
  description: 'UPI-style amount entry screen with a tactile, digit-by-digit spring animation and Indian currency formatting.',
  category: 'Mobile & UI',
  tags: ['phone', 'payment', 'upi', 'keypad', 'spring'],
  version: '1.0.0',
  addedAt: '2026-10-06',
  dependencies: { motion: '^12.23.24' },
  frame: 'phone',
});
