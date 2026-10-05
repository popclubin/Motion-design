import { defineManifest } from '../_core/manifest';

export default defineManifest({
  slug: 'upi-card-flip',
  name: 'UPI Card Flip Transition',
  description: 'A true 3D perspective shared-element flip between a profile card and its QR code, with tilt/gyro parallax and bouncing action chips.',
  category: 'Cards & Decks',
  tags: ['card', 'flip', '3d', 'upi', 'tilt', 'gyroscope'],
  version: '1.0.0',
  addedAt: '2026-10-06',
  dependencies: { motion: '^12.23.24' },
  frame: 'phone',
});
