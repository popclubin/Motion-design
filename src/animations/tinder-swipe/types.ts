export interface ProductCard {
  id: string;
  isInstruction?: boolean;
  brand?: string;
  title: string;
  price?: string;
  originalPrice?: string;
  discountCoins?: string;
  coinValue?: number;
  image?: string;
}

export interface ExitingCard {
  card: ProductCard;
  direction: 'left' | 'right';
  id: string;
  startX: number;
  startY: number;
  startRot: number;
  startGrayscale: number;
  animating: boolean;
}

export interface SwipePhysicsConfig {
  animationDuration: number;
  easing: string;
  swipeThreshold: number;
  maxRotation: number;
  rotationSensitivity: number;
  grayscaleDistance: number;
  maxYLimit: number;
  stackScaleStep: number;
  stackOffsetStep: number;
  comeUpDuration: number;
}
