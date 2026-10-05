export interface ProductSize {
  id: number;
  size: string;
  is_active: boolean;
  stockLeft?: number;
}

export interface ProductItem {
  id: number | string;
  title: string;
  brand_info: { id: number; name: string; logo?: string | null };
  category?: { name: string; full_name?: string };
  images: string;
  galleryImages?: string[];
  price: { currency: string; mrp: number; selling_price: number; discount_amount: number; discount_percent: number; popstarCoins?: number };
  offer_price_detail?: {
    bnpl_offer?: { emi_amount: number; emi_count: number; offer_discount: number; payable_amount: number; selling_price: number };
  };
  ratings_info: { average_rating: number; total_no_of_ratings: number };
  discount_percentage: number;
  popstar_coins: number;
  sizes: ProductSize[];
  availability: { is_available_to_buy: boolean; message: string; num_available: number };
  special_tags?: string | null;
  features?: string[];
  fabric?: string;
  fit?: string;
  washCare?: string;
}

export type DatasetKey = 'featured' | 'technosport' | 'fastandup';

export interface AnimationTuningConfig {
  springStiffness: number;
  springDamping: number;
  springMass: number;
  dragCloseThreshold: number;
  enableBackdropBlur: boolean;
}
