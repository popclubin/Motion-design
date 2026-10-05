import { useCallback, useEffect, useRef, useState } from 'react';
import type { WavePattern } from './types';
import { COLOR_THEMES } from './themes';
import { DEFAULT_SPEED_POINTS } from './utils/speedCurve';
import { usePlayback } from '../_core/usePlayback';
import type { AnimationComponentProps } from '../../types/animation';
import { ParticleOrb } from './components/ParticleOrb';
import { SpeedCurveEditor } from './components/SpeedCurveEditor';

export default function ParticleOrbFormation({ params, panel: Panel }: AnimationComponentProps) {
  const { isPaused } = usePlayback();

  const colorThemeId = String(params.colorTheme ?? 'flame-orb');
  const theme = COLOR_THEMES.find((t) => t.id === colorThemeId) ?? COLOR_THEMES[0];
  const wavePattern = String(params.wavePattern ?? 'video-match') as WavePattern;
  const formationDuration = Number(params.formationDuration ?? 1.9);
  const startPercentage = Number(params.startPercentage ?? 51);
  const waveAmplitude = Number(params.waveAmplitude ?? 0.25);
  const waveFrequency = Number(params.waveFrequency ?? 7.5);
  const waveSpeed = Number(params.waveSpeed ?? 0.35);
  const rotationSpeed = Number(params.rotationSpeed ?? 0.55);
  const particleSize = Number(params.particleSize ?? 4.7);
  const glowIntensity = Number(params.glowIntensity ?? 0.9);
  const particleCount = Number(params.particleCount ?? 12000);
  const radius = Number(params.radius ?? 120);
  const interactive = Boolean(params.interactive ?? true);
  const isPlaying = Boolean(params.isPlaying ?? true) && !isPaused;

  const [speedPoints, setSpeedPoints] = useState<number[]>(DEFAULT_SPEED_POINTS);
  const [formationKey, setFormationKey] = useState(1);
  const [progress, setProgress] = useState(startPercentage / 100);
  const [isManualScrubbing, setIsManualScrubbing] = useState(false);
  const [manualProgress, setManualProgress] = useState(startPercentage / 100);

  const lastReplayRef = useRef<number | undefined>(undefined);

  const handleReplay = useCallback(() => {
    setIsManualScrubbing(false);
    setFormationKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const replayAt = params.replay as number | undefined;
    if (replayAt !== undefined && replayAt !== lastReplayRef.current) {
      lastReplayRef.current = replayAt;
      handleReplay();
    }
  }, [params.replay, handleReplay]);

  const handleManualScrub = useCallback((val: number) => {
    setIsManualScrubbing(true);
    setManualProgress(val);
  }, []);

  const activeProgress = isManualScrubbing ? manualProgress : progress;

  return (
    <main className="relative h-full w-full overflow-hidden bg-panel select-none">
      <div className="absolute inset-0 z-10">
        <ParticleOrb
          formationKey={formationKey}
          radius={radius}
          particleCount={particleCount}
          color={theme.primary}
          secondaryColor={theme.secondary}
          coreColor={theme.core}
          waveAmplitude={waveAmplitude}
          waveFrequency={waveFrequency}
          waveSpeed={waveSpeed}
          rotationSpeed={rotationSpeed}
          particleSize={particleSize}
          glowIntensity={glowIntensity}
          wavePattern={wavePattern}
          formationDuration={formationDuration}
          startPercentage={startPercentage}
          speedPoints={speedPoints}
          manualProgress={isManualScrubbing ? manualProgress : null}
          onProgressUpdate={setProgress}
          interactive={interactive}
          isPlaying={isPlaying}
        />
      </div>

      <Panel>
        <SpeedCurveEditor
          speedPoints={speedPoints}
          onChangeSpeedPoints={setSpeedPoints}
          startPercentage={startPercentage}
          currentProgress={activeProgress}
          onReplay={handleReplay}
          onManualScrub={handleManualScrub}
        />
      </Panel>
    </main>
  );
}
