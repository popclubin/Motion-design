import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Heart, Share2, Star, Search, ChevronDown, ShoppingCart } from 'lucide-react';
import type { ProductItem, AnimationTuningConfig } from '../types';
import { APP_ASSETS } from '../data/productsData';

interface CoreProductAnimationProps {
  products: ProductItem[];
  tuning: AnimationTuningConfig;
  onProductSelect?: (product: ProductItem | null) => void;
  activeProductIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  renderScrollDetails?: (product: ProductItem, isCollapsed: boolean) => React.ReactNode;
  onScrollDelta?: (scrollTop: number) => void;
}

/**
 * Product listing grid that opens into a full product page: tap a card (shared-element
 * expand), swipe the image carousel, pull down from the top to close, scroll up to
 * reveal size/delivery/reviews.
 */
export function CoreProductAnimation({
  products,
  tuning,
  onProductSelect,
  activeProductIndex: externalIndex,
  onActiveIndexChange,
  renderScrollDetails,
  onScrollDelta,
}: CoreProductAnimationProps) {
  const [internalIndex, setInternalIndex] = useState<number | null>(null);
  const activeIndex = externalIndex !== undefined ? externalIndex : internalIndex;

  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [dragY, setDragY] = useState<number>(0);
  const [isPulling, setIsPulling] = useState<boolean>(false);
  const [scrollTop, setScrollTop] = useState<number>(0);
  const [wishlist, setWishlist] = useState<Record<string | number, boolean>>({});
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const carouselTrackRef = useRef<HTMLDivElement | null>(null);

  const touchStartYRef = useRef<number>(0);
  const touchStartXRef = useRef<number>(0);
  const isPullingDownRef = useRef<boolean>(false);

  const currentProduct = activeIndex !== null && activeIndex >= 0 ? products[activeIndex] : null;

  const productImages = currentProduct?.galleryImages && currentProduct.galleryImages.length > 0
    ? currentProduct.galleryImages
    : currentProduct ? [currentProduct.images] : [];

  useEffect(() => {
    setActiveImageIndex(0);
    setDragY(0);
    setIsPulling(false);
    setScrollTop(0);
    carouselTrackRef.current?.scrollTo({ left: 0, behavior: 'instant' as ScrollBehavior });
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [activeIndex]);

  const handleScrollToImage = (index: number) => {
    setActiveImageIndex(index);
    if (carouselTrackRef.current) {
      const containerWidth = carouselTrackRef.current.clientWidth;
      const cardWidth = containerWidth * 0.78;
      const gap = 14;
      carouselTrackRef.current.scrollTo({ left: index * (cardWidth + gap), behavior: 'smooth' });
    }
  };

  const handleCarouselScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const containerWidth = e.currentTarget.clientWidth;
    const cardWidth = containerWidth * 0.78;
    const gap = 14;
    const newIndex = Math.round(scrollLeft / (cardWidth + gap));
    if (newIndex >= 0 && newIndex < productImages.length && newIndex !== activeImageIndex) {
      setActiveImageIndex(newIndex);
    }
  };

  const toggleWishlist = (id: string | number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setWishlist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenProduct = (index: number) => {
    setActiveImageIndex(0);
    setDragY(0);
    setIsPulling(false);
    setScrollTop(0);
    if (onActiveIndexChange) {
      onActiveIndexChange(index);
    } else {
      setInternalIndex(index);
    }
    onProductSelect?.(products[index]);
  };

  const handleCloseProduct = useCallback(() => {
    setDragY(0);
    setIsPulling(false);
    if (onActiveIndexChange) {
      onActiveIndexChange(-1);
    } else {
      setInternalIndex(null);
    }
    onProductSelect?.(null);
  }, [onActiveIndexChange, onProductSelect]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentProduct) return;
      if (e.key === 'Escape') {
        handleCloseProduct();
      } else if (e.key === 'ArrowRight') {
        if (activeImageIndex < productImages.length - 1) handleScrollToImage(activeImageIndex + 1);
      } else if (e.key === 'ArrowLeft') {
        if (activeImageIndex > 0) handleScrollToImage(activeImageIndex - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentProduct, activeImageIndex, productImages.length, handleCloseProduct]);

  const scrollToExtendedDetails = () => {
    scrollContainerRef.current?.scrollTo({ top: 480, behavior: 'smooth' });
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const st = e.currentTarget.scrollTop;
    setScrollTop(st);
    onScrollDelta?.(st);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      touchStartYRef.current = e.touches[0].clientY;
      touchStartXRef.current = e.touches[0].clientX;
      isPullingDownRef.current = (scrollContainerRef.current?.scrollTop ?? 0) <= 2;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1 && isPullingDownRef.current) {
      const currentY = e.touches[0].clientY;
      const currentX = e.touches[0].clientX;
      const deltaY = currentY - touchStartYRef.current;
      const deltaX = Math.abs(currentX - touchStartXRef.current);

      if (deltaY > 0 && deltaY > deltaX * 1.2) {
        setIsPulling(true);
        const dampedY = deltaY < 80 ? deltaY : 80 + Math.pow(deltaY - 80, 0.85);
        setDragY(dampedY);
      } else if (deltaY <= 0) {
        setDragY(0);
        setIsPulling(false);
      }
    }
  };

  const handleTouchEnd = () => {
    if (isPulling) {
      if (dragY > tuning.dragCloseThreshold) {
        handleCloseProduct();
      } else {
        setDragY(0);
      }
      setIsPulling(false);
    }
    isPullingDownRef.current = false;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((scrollContainerRef.current?.scrollTop ?? 0) <= 2 && e.button === 0) {
      touchStartYRef.current = e.clientY;
      touchStartXRef.current = e.clientX;
      isPullingDownRef.current = true;

      const onMouseMove = (moveEvent: MouseEvent) => {
        if (!isPullingDownRef.current) return;
        const deltaY = moveEvent.clientY - touchStartYRef.current;
        const deltaX = Math.abs(moveEvent.clientX - touchStartXRef.current);
        if (deltaY > 0 && deltaY > deltaX) {
          setIsPulling(true);
          const dampedY = deltaY < 80 ? deltaY : 80 + Math.pow(deltaY - 80, 0.85);
          setDragY(dampedY);
        }
      };

      const onMouseUp = () => {
        isPullingDownRef.current = false;
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        setDragY((prev) => {
          if (prev > tuning.dragCloseThreshold) {
            handleCloseProduct();
            return prev;
          }
          return 0;
        });
        setIsPulling(false);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
  };

  const activeSpringTransition = { type: 'spring' as const, stiffness: tuning.springStiffness, damping: tuning.springDamping, mass: tuning.springMass };

  return (
    <div className="relative w-full h-full bg-[#0D0D0D] text-[#FFFFFF] overflow-hidden select-none flex flex-col font-sans">
      <div className="sticky top-0 z-20 flex items-center justify-between px-3 h-12 bg-[#0D0D0D] border-b border-[#262626]">
        <div className="flex items-center">
          <button
            onClick={() => (currentProduct ? handleCloseProduct() : null)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#FFFFFF] active:scale-95 transition-transform"
            aria-label="Back"
          >
            <ChevronLeft size={22} className="text-[#FFFFFF]" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center text-[#FFFFFF]" aria-label="Search">
            <Search size={19} className="text-[#FFFFFF]" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-[#FFFFFF]" aria-label="Wishlist">
            <Heart size={19} className="text-[#FFFFFF]" />
          </button>
          <div className="flex items-center gap-1 px-2 py-0.5 border border-white/15 rounded-full bg-transparent">
            <img src={APP_ASSETS.popCoin} alt="" className="w-3.5 h-3.5 object-contain" />
            <span className="text-xs font-semibold text-[#FFFFFF]">43K</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-24 bg-[#0D0D0D]">
        <div className="flex items-center gap-2 px-3 py-2.5 overflow-x-auto no-scrollbar">
          {['Status', 'Month', 'Category', 'Amount'].map((f, i) => (
            <button
              key={f + i}
              onClick={() => setActiveFilter(f)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-[8px] text-xs font-medium whitespace-nowrap transition-all border ${
                activeFilter === f ? 'bg-[#1C1C1E] border-[#262626] text-[#FFFFFF]' : 'bg-[#161616] border-[#1F1F1F] text-[#A1A1AA] hover:text-[#FFFFFF]'
              }`}
            >
              <span>{f}</span>
              <ChevronDown size={13} className="text-[#71717A]" />
            </button>
          ))}
        </div>

        <div className="px-3 mb-3 cursor-pointer active:scale-[0.99] transition-transform">
          <div className="rounded-[14px] overflow-hidden bg-[#161616]">
            <img src={APP_ASSETS.popChopBanner} alt="POPchop Banner" className="w-full h-auto object-cover block" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 px-3">
          {products.map((product, idx) => {
            const isLiked = wishlist[product.id] || false;
            const hasPopchopEmi = (product.offer_price_detail?.bnpl_offer?.emi_amount || 0) > 0;
            const emiAmt = product.offer_price_detail?.bnpl_offer?.emi_amount || Math.round(product.price.selling_price / 3);
            const popCoins = product.popstar_coins || 234;

            return (
              <motion.div
                key={`grid-item-${product.id}`}
                layoutId={`product-card-${product.id}`}
                onClick={() => handleOpenProduct(idx)}
                className="group relative flex flex-col bg-[#161616] rounded-[12px] overflow-hidden cursor-pointer active:scale-[0.98] transition-transform duration-150"
              >
                <div className="relative w-full aspect-square bg-[#1C1C1E] overflow-hidden rounded-[12px]">
                  <motion.img
                    layoutId={`product-image-${product.id}`}
                    src={product.images}
                    alt={product.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = APP_ASSETS.productImage2;
                    }}
                  />

                  <div className="absolute bottom-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-[6px] bg-[rgba(0,0,0,0.55)] text-[10px] font-semibold text-[#FFFFFF] backdrop-blur-xs">
                    <Star size={11} className="text-[#FFFFFF]" fill="none" strokeWidth={1.8} />
                    <span>{product.ratings_info?.average_rating || 4.5}</span>
                  </div>

                  <button
                    onClick={(e) => toggleWishlist(product.id, e)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[rgba(0,0,0,0.40)] flex items-center justify-center text-[#FFFFFF] active:scale-90 transition-transform"
                    aria-label="Save to wishlist"
                  >
                    <Heart size={14} className={isLiked ? 'fill-red-500 text-red-500' : 'text-[#FFFFFF]'} />
                  </button>
                </div>

                <div className="pt-2 px-2 pb-1 flex flex-col flex-1 justify-between">
                  <div>
                    <span className="text-[11px] font-medium text-[#71717A] truncate block">{product.brand_info.name}</span>
                    <h3 className="text-xs font-semibold text-[#FFFFFF] line-clamp-1 leading-snug mt-0.5">{product.title}</h3>
                  </div>

                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-[#FFFFFF]">₹{product.price.selling_price}</span>
                    {product.price.mrp > product.price.selling_price && (
                      <span className="text-xs font-semibold text-[#71717A] line-through">₹{product.price.mrp}</span>
                    )}
                  </div>
                </div>

                <div
                  className="w-full h-8 px-2 flex items-center justify-between rounded-b-[12px]"
                  style={{
                    background: hasPopchopEmi
                      ? 'linear-gradient(90deg, #2D0B5A 0%, #4D1282 50%, #250842 100%)'
                      : 'linear-gradient(90deg, #0554DA 0%, #0062FF 100%)',
                  }}
                >
                  <div className="flex items-center text-xs font-semibold text-[#FFFFFF]">
                    <span>₹{emiAmt}</span>
                    <span className="text-[11px] text-[#A1A1AA] ml-0.5">x3mo</span>
                    <span className="mx-1 text-[#FFFFFF]">+</span>
                    <img src={APP_ASSETS.popCoin} alt="" className="w-[18px] h-[18px] object-contain inline mr-0.5" />
                    <span>{popCoins}</span>
                  </div>

                  <img src={APP_ASSETS.popChopIcon} alt="" className="w-[18px] h-[18px] object-contain opacity-90" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {currentProduct && activeIndex !== null && (
          <motion.div
            key="pdp-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 - Math.min(dragY / 400, 0.7) }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`absolute inset-0 z-50 flex flex-col bg-[#0D0D0D] ${tuning.enableBackdropBlur ? 'backdrop-blur-xl' : ''}`}
          >
            <div className="sticky top-0 flex items-center justify-between px-3 h-12 bg-[#0D0D0D] border-b border-[#262626] z-40 shrink-0">
              <button onClick={handleCloseProduct} className="w-9 h-9 rounded-full flex items-center justify-center text-[#FFFFFF] active:scale-95 transition-transform" aria-label="Back">
                <ChevronLeft size={22} className="text-[#FFFFFF]" />
              </button>

              <div className="flex items-center gap-2">
                <button className="w-8 h-8 flex items-center justify-center text-[#FFFFFF]" aria-label="Search">
                  <Search size={19} className="text-[#FFFFFF]" />
                </button>

                <button
                  onClick={(e) => toggleWishlist(currentProduct.id, e)}
                  className="w-8 h-8 flex items-center justify-center text-[#FFFFFF] active:scale-95 transition-transform"
                  aria-label="Wishlist"
                >
                  <Heart size={19} className={wishlist[currentProduct.id] ? 'fill-red-500 text-red-500' : 'text-[#FFFFFF]'} />
                </button>

                <div className="flex items-center gap-1 px-2 py-0.5 border border-white/15 rounded-full bg-transparent">
                  <img src={APP_ASSETS.popCoin} alt="" className="w-3.5 h-3.5 object-contain" />
                  <span className="text-xs font-semibold text-[#FFFFFF]">43K</span>
                </div>
              </div>
            </div>

            <motion.div
              style={{ y: dragY, scale: 1 - Math.min(dragY / 1200, 0.12), borderRadius: dragY > 15 ? 24 : 0 }}
              transition={activeSpringTransition}
              className="flex-1 flex flex-col overflow-hidden relative bg-[#0D0D0D]"
            >
              {dragY > 10 && <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-white/40 z-50 pointer-events-none" />}

              <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                className="flex-1 overflow-y-auto no-scrollbar pb-24 bg-[#0D0D0D] overscroll-none"
              >
                <div className="flex flex-col">
                  <div className="relative w-full pt-2 pb-1 overflow-hidden">
                    <div
                      ref={carouselTrackRef}
                      onScroll={handleCarouselScroll}
                      className="w-full flex gap-3.5 px-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory touch-pan-x"
                      style={{ scrollSnapType: 'x mandatory', scrollPaddingLeft: '24px', scrollPaddingRight: '24px' }}
                    >
                      {productImages.map((imgUrl, i) => (
                        <div
                          key={`carousel-card-${i}-${currentProduct.id}`}
                          onClick={() => handleScrollToImage(i)}
                          className={`w-[78%] aspect-square shrink-0 rounded-[22px] overflow-hidden bg-[#161616] border border-[#262626] snap-center relative shadow-lg cursor-pointer transition-all duration-200 ${
                            i === activeImageIndex ? 'opacity-100 ring-1 ring-white/10' : 'opacity-70 hover:opacity-90'
                          }`}
                        >
                          <img
                            src={imgUrl}
                            alt={`Photo ${i + 1}`}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover object-center pointer-events-none select-none"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = APP_ASSETS.productImage2;
                            }}
                          />
                          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-[10px] font-semibold text-white/90">
                            {i + 1}/{productImages.length}
                          </div>
                        </div>
                      ))}
                    </div>

                    {productImages.length > 1 && (
                      <div className="flex items-center justify-center gap-1.5 mt-2.5 mb-1">
                        {productImages.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => handleScrollToImage(i)}
                            className={`h-1.5 transition-all duration-300 rounded-full ${i === activeImageIndex ? 'w-6 bg-[#FFFFFF]' : 'w-1.5 bg-[#3F3F46] hover:bg-[#71717A]'}`}
                            aria-label={`Slide ${i + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between px-4 h-9 mt-1">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-[#161616] border border-[#1F1F1F]">
                      <Star size={12} className="fill-[#D4D4D8] text-[#D4D4D8]" />
                      <span className="text-xs font-semibold text-[#FFFFFF]">{currentProduct.ratings_info?.average_rating || 4.5}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => toggleWishlist(currentProduct.id, e)}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-[#FFFFFF] active:scale-95 transition-transform"
                        aria-label="Wishlist"
                      >
                        <Heart size={19} className={wishlist[currentProduct.id] ? 'fill-red-500 text-red-500' : 'text-[#FFFFFF]'} />
                      </button>
                      <button className="w-9 h-9 rounded-full flex items-center justify-center text-[#FFFFFF] active:scale-95 transition-transform" aria-label="Share">
                        <Share2 size={19} className="text-[#FFFFFF]" />
                      </button>
                    </div>
                  </div>

                  <div className="px-4 pt-1.5">
                    <span className="text-[11px] font-medium text-[#71717A] underline block">{currentProduct.brand_info.name}</span>
                    <h1 className="text-base font-semibold text-[#FFFFFF] leading-snug mt-1">{currentProduct.title}</h1>
                  </div>

                  <div className="px-4 pt-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#FFFFFF]">₹{currentProduct.price.selling_price}</span>
                      <span className="text-sm font-semibold text-[#71717A] line-through">₹{currentProduct.price.mrp}</span>
                    </div>

                    <div className="mt-3 cursor-pointer active:scale-[0.99] transition-transform">
                      <img src={APP_ASSETS.popChopProductPricing} alt="POPchop Pricing" className="w-full h-auto rounded-[12px] object-cover block" />
                    </div>

                    <div className="mt-2.5 flex items-center gap-1.5 text-xs text-[#A1A1AA]">
                      <span>or</span>
                      <span className="font-semibold text-[#FFFFFF]">Pay ₹3,000 +</span>
                      <img src={APP_ASSETS.popCoin} alt="" className="w-3.5 h-3.5 object-contain" />
                      <span className="font-semibold text-[#FFFFFF]">200 now</span>
                    </div>
                  </div>

                  <div className="px-4 mt-3">
                    <div
                      onClick={scrollToExtendedDetails}
                      className="p-2.5 rounded-[12px] bg-[#161616] border border-[#1F1F1F] flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all hover:border-white/20 group"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[#FFFFFF] group-hover:translate-y-0.5 transition-transform">
                          <ChevronDown size={14} className="text-[#FFFFFF]" />
                        </div>
                        <span className="text-xs font-semibold text-[#FFFFFF]">Select size & extended product details</span>
                      </div>
                      <span className="text-[11px] font-medium text-[#71717A] group-hover:text-[#FFFFFF] transition-colors">Scroll up ↓</span>
                    </div>
                  </div>
                </div>

                <div className="mt-2">{renderScrollDetails && renderScrollDetails(currentProduct, scrollTop > 100 || dragY > 10)}</div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 bg-[#0D0D0D] border-t border-[#262626] z-40">
                <button className="w-full h-12 rounded-full bg-[#FFFFFF] hover:bg-zinc-200 active:scale-[0.98] text-[#000000] font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg">
                  <ShoppingCart size={17} className="text-[#000000]" />
                  <span>Add to cart</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
