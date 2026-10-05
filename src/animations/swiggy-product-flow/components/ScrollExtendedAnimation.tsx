import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, CreditCard, RotateCcw, ChevronDown, ChevronRight, Star } from 'lucide-react';
import type { ProductItem } from '../types';
import { APP_ASSETS } from '../data/productsData';

interface ProductScrollDetailsContentProps {
  product: ProductItem;
  recommendations: ProductItem[];
  onSelectRecommendation?: (product: ProductItem) => void;
}

/**
 * The extended product details revealed by scrolling up from the preview:
 * select size, delivery estimate, trust badges, a details accordion, rating
 * breakdown, and "more from this brand" recommendations.
 */
export function ProductScrollDetailsContent({ product, recommendations, onSelectRecommendation }: ProductScrollDetailsContentProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedSizeId, setSelectedSizeId] = useState('m');

  const ratingDistribution = [
    { stars: 5, count: 165, max: 165 },
    { stars: 4, count: 44, max: 165 },
    { stars: 3, count: 73, max: 165 },
    { stars: 2, count: 14, max: 165 },
    { stars: 1, count: 2, max: 165 },
  ];

  return (
    <div className="flex flex-col space-y-4 pt-4 pb-8 px-4 text-[#FFFFFF] bg-[#0D0D0D]">
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-sm font-semibold text-[#FFFFFF]">Select size</span>
          <button className="flex items-center gap-0.5 text-xs font-semibold text-[#FFFFFF] hover:text-zinc-200 transition-colors">
            <span>Size chart</span>
            <ChevronRight size={14} className="text-[#FFFFFF]" />
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'xs', label: 'XS', isAvailable: true },
            { id: 's', label: 'S', isAvailable: false },
            { id: 'm', label: 'M', isAvailable: true, stockLeft: 5, stockColor: '#D3970D' },
            { id: 'l', label: 'L', isAvailable: true, stockLeft: 10, stockColor: '#D3970D' },
            { id: 'xl', label: 'XL', isAvailable: false },
            { id: 'xxl', label: 'XXL', isAvailable: true },
          ].map((s) => {
            const isSelected = selectedSizeId === s.id;
            return (
              <div key={s.id} className="flex flex-col items-center shrink-0">
                <button
                  onClick={() => s.isAvailable && setSelectedSizeId(s.id)}
                  disabled={!s.isAvailable}
                  className={`min-w-[52px] h-[44px] px-3 rounded-[8px] text-xs font-semibold transition-all border flex items-center justify-center ${
                    isSelected
                      ? 'bg-[#FFFFFF] text-[#000000] border-[#FFFFFF] shadow-sm'
                      : s.isAvailable
                      ? 'bg-[#161616] border-[#1F1F1F] text-[#FFFFFF] hover:border-white/20'
                      : 'bg-[#161616] border-[#1F1F1F] text-[#4B4B4B] cursor-not-allowed opacity-50'
                  }`}
                >
                  {s.label}
                </button>
                {s.stockLeft ? (
                  <span className="text-[10px] font-medium mt-1" style={{ color: s.stockColor }}>
                    {s.stockLeft} left
                  </span>
                ) : (
                  <span className="h-[15px]" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-3.5 rounded-[14px] bg-[#161616] border border-[#1F1F1F]">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-[#FFFFFF] truncate">Delivery • Wed, 4th Jan</span>
          <button className="flex items-center gap-0.5 text-xs font-semibold text-[#FFFFFF] hover:text-zinc-200">
            <span>Change</span>
            <ChevronRight size={14} className="text-[#FFFFFF]" />
          </button>
        </div>
        <p className="text-[11px] text-[#71717A] mt-0.5 truncate">Home • 14th Sunshine View,</p>
      </div>

      <div className="flex items-center justify-evenly py-2 px-1">
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-2">
          <ShieldCheck size={26} className="text-[#A1A1AA]" strokeWidth={1.6} />
          <span className="text-[10px] text-[#A1A1AA] leading-tight whitespace-pre-line">Secure{'\n'}payments</span>
        </div>
        <div className="w-[0.5px] h-10 bg-[#1F1F1F]" />
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-2">
          <CreditCard size={26} className="text-[#A1A1AA]" strokeWidth={1.6} />
          <span className="text-[10px] text-[#A1A1AA] leading-tight whitespace-pre-line">COD{'\n'}available</span>
        </div>
        <div className="w-[0.5px] h-10 bg-[#1F1F1F]" />
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-2">
          <RotateCcw size={26} className="text-[#A1A1AA]" strokeWidth={1.6} />
          <span className="text-[10px] text-[#A1A1AA] leading-tight whitespace-pre-line">7 day{'\n'}return</span>
        </div>
      </div>

      <div className="rounded-[14px] bg-[#161616] border border-[#1F1F1F] overflow-hidden">
        <button onClick={() => setDetailsOpen(!detailsOpen)} className="w-full flex items-center justify-between p-3.5 text-left font-semibold text-sm text-[#FFFFFF]">
          <span>Product details</span>
          <ChevronDown size={18} className={`text-[#71717A] transition-transform duration-200 ${detailsOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {detailsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="px-3.5 pb-3.5 text-xs text-[#A1A1AA] border-t border-[#1F1F1F] pt-2.5 whitespace-pre-line leading-relaxed"
            >
              Fabric: {product.fabric || 'Silk blend'}
              {'\n'}
              Fit: {product.fit || 'Regular'}
              {'\n'}
              Care: {product.washCare || 'Machine wash cold'}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="w-full h-[0.5px] bg-[#1F1F1F] my-1" />

      <div className="flex items-center gap-6 px-1 py-1">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-[#FFFFFF]">{product.ratings_info.average_rating.toFixed(1)}</span>
            <Star size={20} className="fill-[#D4D4D8] text-[#D4D4D8]" />
          </div>
          <span className="text-xs text-[#71717A]">{product.ratings_info.total_no_of_ratings.toLocaleString()} ratings</span>
        </div>

        <div className="flex-1 flex flex-col space-y-1.5">
          {ratingDistribution.map((row) => {
            const fraction = Math.min(row.count / row.max, 1);
            return (
              <div key={row.stars} className="flex items-center gap-3 h-5">
                <span className="text-xs font-semibold text-[#FFFFFF] w-2">{row.stars}</span>
                <div className="flex-1 h-1 rounded-full bg-[#161616] overflow-hidden">
                  <div className="h-full rounded-full bg-[#FFFFFF]" style={{ width: `${fraction * 100}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-full h-[0.5px] bg-[#1F1F1F] my-1" />

      <div className="pt-1">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-semibold text-[#FFFFFF]">More from this brand</h3>
          <ChevronRight size={16} className="text-[#FFFFFF]" />
        </div>

        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
          {recommendations.map((rec) => (
            <div
              key={`rec-${rec.id}`}
              onClick={() => onSelectRecommendation?.(rec)}
              className="w-[156px] shrink-0 rounded-[12px] bg-[#161616] overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
            >
              <div className="relative w-[156px] aspect-[1/1.27] bg-[#1C1C1E] overflow-hidden rounded-[12px]">
                <img
                  src={rec.images}
                  alt={rec.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = APP_ASSETS.productImage1;
                  }}
                />

                <div className="absolute top-0 left-0 bg-[#E54D00] px-2 py-0.5 text-[10px] text-[#FFFFFF] font-medium">Price drop</div>

                <div className="absolute bottom-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] bg-[rgba(0,0,0,0.55)] text-[10px] font-semibold text-[#FFFFFF]">
                  <Star size={10} className="fill-[#D4D4D8] text-[#D4D4D8]" />
                  <span>{rec.ratings_info?.average_rating || 4.5}</span>
                </div>
              </div>

              <div className="p-2">
                <span className="text-[10px] text-[#71717A] truncate block">{rec.brand_info.name}</span>
                <p className="text-xs font-semibold text-[#FFFFFF] truncate mt-0.5">{rec.title}</p>

                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-xs font-semibold text-[#FFFFFF]">₹{rec.price.selling_price}</span>
                  <span className="text-xs text-[#71717A] line-through">₹{rec.price.mrp}</span>
                </div>
              </div>

              <div className="w-full h-8 px-2 flex items-center justify-between rounded-b-[12px]" style={{ background: 'linear-gradient(90deg, #0554DA 0%, #0062FF 100%)' }}>
                <div className="flex items-baseline text-xs font-semibold text-[#FFFFFF]">
                  <span>₹{rec.price.selling_price}</span>
                  <span className="mx-1 text-[#FFFFFF]">+</span>
                  <img src={APP_ASSETS.popCoin} alt="" className="w-3.5 h-3.5 object-contain inline self-center mr-0.5" />
                  <span>{rec.popstar_coins || 234}</span>
                </div>

                <img src={APP_ASSETS.popChopIcon} alt="" className="w-4 h-4 object-contain opacity-80" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
