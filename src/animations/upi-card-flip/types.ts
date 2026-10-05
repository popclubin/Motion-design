export type ScreenMode = 'profile' | 'qr';
export type FlipAxis = 'Y' | 'X';
export type EasingMode = 'cubic-bezier' | 'spring';

export interface AnimationConfig {
  duration: number;
  easingMode: EasingMode;
  bezier: [number, number, number, number];
  springStiffness: number;
  springDamping: number;
  perspective: number;
  flipAxis: FlipAxis;
  midFlipScale: number;
  staggerDelay: number;
  slideDistance: number;
  direction: 1 | -1;
  chipSlideOffset: number;
  chipBounceStiffness: number;
  chipBounceDamping: number;
  maxTiltAngle: number;
  parallaxIntensity: number;
  shimmerIntensity: number;
  movingBorderIntensity: number;
  gradientShiftIntensity: number;
  enableGyro: boolean;
  showPhoneFrame: boolean;
}

export interface UserProfile {
  name: string;
  memberSince: string;
  avatarUrl: string;
  upiId: string;
  mobile: string;
  bankName: string;
  bankAccountLast4: string;
  popCoins: number;
  cashback: number;
}
