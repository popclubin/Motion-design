import type { WavePattern } from './types';
import { usePlayback } from '../_core/usePlayback';
import type { AnimationComponentProps } from '../../types/animation';
import { ParticleOrb } from './components/ParticleOrb';

export default function ParticleWaveOrb({ params }: AnimationComponentProps) {
  const { isPaused } = usePlayback();

  const color = String(params.color ?? '#ff3700');
  const secondaryColor = String(params.secondaryColor ?? '#ff9d00');
  const coreColor = String(params.coreColor ?? '#b30000');
  const wavePattern = String(params.wavePattern ?? 'video-match') as WavePattern;
  const waveAmplitude = Number(params.waveAmplitude ?? 0.38);
  const waveFrequency = Number(params.waveFrequency ?? 7.0);
  const waveSpeed = Number(params.waveSpeed ?? 1.25);
  const rotationSpeed = Number(params.rotationSpeed ?? 0.0);
  const particleSize = Number(params.particleSize ?? 5.0);
  const glowIntensity = Number(params.glowIntensity ?? 1.6);
  const particleCount = Number(params.particleCount ?? 10000);
  const interactive = Boolean(params.interactive ?? true);
  const isPlaying = Boolean(params.isPlaying ?? true) && !isPaused;

  return (
    <main className="relative h-full w-full overflow-hidden bg-panel select-none">
      <div className="absolute inset-0 z-10">
        <ParticleOrb
          radius={140}
          particleCount={particleCount}
          color={color}
          secondaryColor={secondaryColor}
          coreColor={coreColor}
          waveAmplitude={waveAmplitude}
          waveFrequency={waveFrequency}
          waveSpeed={waveSpeed}
          rotationSpeed={rotationSpeed}
          isPlaying={isPlaying}
          particleSize={particleSize}
          glowIntensity={glowIntensity}
          wavePattern={wavePattern}
          interactive={interactive}
        />
      </div>
    </main>
  );
}
