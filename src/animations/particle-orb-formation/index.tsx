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
  const showMobileFrame = Boolean(params.showMobileFrame ?? true);

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

  const orbCanvas = (
    <div
      className={`relative h-full w-full overflow-hidden select-none ${
        showMobileFrame ? 'bg-transparent' : 'bg-black'
      }`}
    >
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
  );

  return (
    <main className="relative flex h-full w-full items-center justify-center overflow-hidden bg-panel select-none">
      {showMobileFrame ? (
        <div className="relative flex h-full w-full items-center justify-center p-4">
          <div
            className="relative flex-shrink-0 bg-neutral-900 shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
            style={{
              aspectRatio: '9.5 / 19.5',
              height: '90%',
              maxHeight: '100%',
              maxWidth: '100%',
              borderRadius: 54,
              border: '12px solid #1c1c1e',
            }}
          >
            {/* Phone buttons */}
            <div className="absolute top-[108px] -left-[2px] h-16 w-[3px] rounded-l-sm bg-[#1c1c1e]" />
            <div className="absolute top-[180px] -left-[2px] h-10 w-[3px] rounded-l-sm bg-[#1c1c1e]" />
            <div className="absolute top-[140px] -right-[2px] h-20 w-[3px] rounded-r-sm bg-[#1c1c1e]" />

            <div
              className="relative flex h-full w-full flex-col overflow-hidden rounded-[42px] bg-[#050002] text-white"
              style={{
                backgroundImage: 'url(/animations/particle-orb-formation/wallpaper.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              {/* Status bar */}
              <div className="relative z-40 flex w-full shrink-0 items-center justify-between px-7 pt-3 text-[13px] font-semibold text-white select-none pointer-events-none">
                <span>9:41</span>
                <div className="absolute top-2 left-1/2 h-7 w-[108px] -translate-x-1/2 rounded-full bg-black" />
                <span className="flex items-center gap-1.5 text-[11px]">
                  5G
                  <span className="h-3 w-6 rounded-[3px] border border-white/70" />
                </span>
              </div>

              {/* Screen canvas */}
              <div className="relative flex-1 w-full h-full overflow-hidden">
                {orbCanvas}
              </div>

              {/* Home indicator bar */}
              <div className="z-40 flex w-full shrink-0 justify-center pb-2 select-none pointer-events-none">
                <div className="h-1 w-28 rounded-full bg-neutral-500/70" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 z-10">
          {orbCanvas}
        </div>
      )}

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
