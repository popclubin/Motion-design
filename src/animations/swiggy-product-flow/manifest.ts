import { defineManifest } from '../_core/manifest';

export default defineManifest({
  slug: 'swiggy-product-flow',
  name: 'Product Listing to Details Flow',
  description: 'A Swiggy-style product grid that opens into a full product page: image carousel, pull-down-to-close, and a scroll-up reveal of size/delivery/reviews.',
  category: 'Cards & Decks',
  tags: ['product', 'listing', 'pdp', 'carousel', 'gesture', 'scroll'],
  version: '1.0.0',
  addedAt: '2026-10-06',
  dependencies: { motion: '^12.23.24' },
  frame: 'phone',
});
