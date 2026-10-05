export type WavePattern = 'video-match' | 'neural' | 'ripple' | 'quantum' | 'smooth';

export interface ColorPreset {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  core: string;
}
