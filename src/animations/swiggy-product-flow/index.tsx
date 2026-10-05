import { useEffect, useMemo, useRef, useState } from 'react';
import type { AnimationTuningConfig, DatasetKey, ProductItem } from './types';
import { FEATURED_PRODUCTS, TECHNOSPORT_PRODUCTS, FASTANDUP_PRODUCTS, getBrandRecommendations } from './data/productsData';
import { CoreProductAnimation } from './components/CoreProductAnimation';
import { ProductScrollDetailsContent } from './components/ScrollExtendedAnimation';
import type { AnimationComponentProps } from '../../types/animation';

const FONTS_STYLE_ID = 'swiggy-product-flow-fonts';

/** Injects the Plus Jakarta Sans font once, scoped to this animation's class name. */
function useScopedFont() {
  useEffect(() => {
    if (document.getElementById(FONTS_STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = FONTS_STYLE_ID;
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
      .swiggy-product-flow { font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; }
    `;
    document.head.appendChild(style);
  }, []);
}

function getDataset(key: DatasetKey): ProductItem[] {
  if (key === 'technosport') return TECHNOSPORT_PRODUCTS;
  if (key === 'fastandup') return FASTANDUP_PRODUCTS;
  return FEATURED_PRODUCTS;
}

export default function SwiggyProductFlow({ params }: AnimationComponentProps) {
  useScopedFont();

  const dataset = (params.dataset as DatasetKey) ?? 'featured';
  const products = useMemo(() => getDataset(dataset), [dataset]);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const lastToggleRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    setActiveIndex(null);
  }, [dataset]);

  useEffect(() => {
    const toggleAt = params.toggleProduct as number | undefined;
    if (toggleAt !== undefined && toggleAt !== lastToggleRef.current) {
      lastToggleRef.current = toggleAt;
      setActiveIndex((prev) => (prev === null ? 0 : null));
    }
  }, [params.toggleProduct]);

  const tuning: AnimationTuningConfig = {
    springStiffness: Number(params.springStiffness ?? 340),
    springDamping: Number(params.springDamping ?? 28),
    springMass: Number(params.springMass ?? 0.85),
    dragCloseThreshold: Number(params.dragCloseThreshold ?? 110),
    enableBackdropBlur: Boolean(params.enableBackdropBlur ?? true),
  };

  const activeProduct = activeIndex !== null && activeIndex >= 0 ? products[activeIndex] : null;
  const recommendations = useMemo(
    () => (activeProduct ? getBrandRecommendations(activeProduct.brand_info.name, activeProduct.id) : []),
    [activeProduct]
  );

  const handleSelectRecommendation = (rec: ProductItem) => {
    const existingIdx = products.findIndex((p) => p.id === rec.id);
    setActiveIndex(existingIdx >= 0 ? existingIdx : 0);
  };

  return (
    <div className="swiggy-product-flow relative flex h-full w-full items-center justify-center bg-neutral-950/40 select-none">
      <div
        className="relative flex-shrink-0 bg-neutral-900 shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
        style={{ aspectRatio: '9.5 / 19.5', height: '90%', maxHeight: '100%', maxWidth: '100%', borderRadius: 54, border: '12px solid #1c1c1e' }}
      >
        <div className="absolute top-[108px] -left-[2px] h-16 w-[3px] rounded-l-sm bg-[#1c1c1e]" />
        <div className="absolute top-[180px] -left-[2px] h-10 w-[3px] rounded-l-sm bg-[#1c1c1e]" />
        <div className="absolute top-[140px] -right-[2px] h-20 w-[3px] rounded-r-sm bg-[#1c1c1e]" />

        <div className="relative h-full w-full overflow-hidden rounded-[42px] bg-[#0D0D0D]">
          <CoreProductAnimation
            products={products}
            tuning={tuning}
            activeProductIndex={activeIndex ?? undefined}
            onActiveIndexChange={(idx) => setActiveIndex(idx >= 0 ? idx : null)}
            renderScrollDetails={(product) => (
              <ProductScrollDetailsContent product={product} recommendations={recommendations} onSelectRecommendation={handleSelectRecommendation} />
            )}
          />
        </div>
      </div>
    </div>
  );
}
