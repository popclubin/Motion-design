export type WavePattern = 'video-match' | 'neural' | 'ripple' | 'quantum' | 'smooth';

export interface ColorTheme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  core: string;
  accent: string;
}

export interface SpeedCurvePreset {
  id: string;
  name: string;
  description: string;
  points: number[];
}
