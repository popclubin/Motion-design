import type { ProductCard } from '../types';

const ASSET_BASE = '/animations/tinder-swipe';
const trendCargo = `${ASSET_BASE}/trend-cargo.jpg`;
const trendKnits = `${ASSET_BASE}/trend-knits.jpg`;
const trendSandals = `${ASSET_BASE}/trend-sandals.jpg`;
const trendSkincare = `${ASSET_BASE}/trend-skincare.jpg`;

export const INITIAL_CARDS: ProductCard[] = [
  { id: 'orb-instruction', isInstruction: true, title: 'Swipe to refine' },
  { id: 'product-1', brand: 'Trend', title: 'Classic Cargo Pants', price: '₹1,856', originalPrice: '₹2,856', discountCoins: '₹1000 off', coinValue: 1000, image: trendCargo },
  { id: 'product-2', brand: 'Trend', title: 'Cozy Knitted Sweater', price: '₹1,849', originalPrice: '₹2,699', discountCoins: '₹500 off', coinValue: 500, image: trendKnits },
  { id: 'product-3', brand: 'Trend', title: 'Premium Summer Sandals', price: '₹1,250', originalPrice: '₹1,999', discountCoins: '₹750 off', coinValue: 750, image: trendSandals },
  { id: 'product-4', brand: 'Trend', title: 'Advanced Skincare Set', price: '₹2,199', originalPrice: '₹4,399', discountCoins: '₹800 off', coinValue: 800, image: trendSkincare },
  { id: 'product-5', brand: 'Trend', title: 'Utility Cargo Trousers', price: '₹3,120', originalPrice: '₹4,800', discountCoins: '₹1000 off', coinValue: 1000, image: trendCargo },
  { id: 'product-6', brand: 'Trend', title: 'Chunky Knit Cardigan', price: '₹1,499', originalPrice: '₹2,999', discountCoins: '₹400 off', coinValue: 400, image: trendKnits },
  { id: 'product-7', brand: 'Trend', title: 'Leather Strap Sandals', price: '₹2,750', originalPrice: '₹3,999', discountCoins: '₹900 off', coinValue: 900, image: trendSandals },
  { id: 'product-8', brand: 'Trend', title: 'Daily Hydration Skincare', price: '₹1,999', originalPrice: '₹3,999', discountCoins: '₹600 off', coinValue: 600, image: trendSkincare },
  { id: 'product-9', brand: 'Trend', title: 'Slim Fit Cargos', price: '₹1,650', originalPrice: '₹3,299', discountCoins: '₹500 off', coinValue: 500, image: trendCargo },
  { id: 'product-10', brand: 'Trend', title: 'Winter Knit Essentials', price: '₹1,200', originalPrice: '₹1,999', discountCoins: '₹300 off', coinValue: 300, image: trendKnits },
];
