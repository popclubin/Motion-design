import React, { useState, useEffect, useRef, useCallback } from 'react';

export interface TiltState {
  tiltX: number; // -1 to 1 (left to right)
  tiltY: number; // -1 to 1 (top to bottom)
  rotateX: number; // degrees
  rotateY: number; // degrees
  lightAngle: number; // 0 to 360 degrees
  shimmerX: number; // 0 to 100 percentage
  shimmerY: number; // 0 to 100 percentage
  fgOffset: { x: number; y: number };
  mgOffset: { x: number; y: number };
  bgOffset: { x: number; y: number };
  isGyroAvailable: boolean;
  isGyroActive: boolean;
  hasGyro: boolean;
  needsPermissionPrompt: boolean;
}

interface UseTiltOptions {
  maxTiltAngle?: number;
  parallaxIntensity?: number;
  enabled?: boolean;
}

/**
 * useTiltPhysics
 * Jitter-free physics engine handling device gyroscope / accelerometer input,
 * desktop pointer tracking with automatic center recovery, iOS permission flow,
 * and a touch-move fallback when hardware sensors are restricted.
 */
export function useTiltPhysics({
  maxTiltAngle = 18,
  parallaxIntensity = 1.0,
  enabled = true,
}: UseTiltOptions = {}) {
  const targetX = useRef<number>(0);
  const targetY = useRef<number>(0);

  const currentX = useRef<number>(0);
  const currentY = useRef<number>(0);

  const animFrameRef = useRef<number | null>(null);

  const [isGyroAvailable, setIsGyroAvailable] = useState<boolean>(false);
  const [isGyroActive, setIsGyroActive] = useState<boolean>(false);
  const [needsPermissionPrompt, setNeedsPermissionPrompt] = useState<boolean>(false);

  const restingBetaRef = useRef<number | null>(null);
  const restingGammaRef = useRef<number | null>(null);
  const lastSensorEventRef = useRef<number>(0);

  const [tiltState, setTiltState] = useState<TiltState>({
    tiltX: 0,
    tiltY: 0,
    rotateX: 0,
    rotateY: 0,
    lightAngle: 135,
    shimmerX: 50,
    shimmerY: 50,
    fgOffset: { x: 0, y: 0 },
    mgOffset: { x: 0, y: 0 },
    bgOffset: { x: 0, y: 0 },
    isGyroAvailable: false,
    isGyroActive: false,
    hasGyro: false,
    needsPermissionPrompt: false,
  });

  const computeState = useCallback(
    (x: number, y: number): TiltState => {
      let angle = (Math.atan2(y, x) * 180) / Math.PI + 90;
      if (angle < 0) angle += 360;

      const pFactor = parallaxIntensity;

      return {
        tiltX: x,
        tiltY: y,
        rotateX: -y * maxTiltAngle,
        rotateY: x * maxTiltAngle,
        lightAngle: Math.round(angle),
        shimmerX: 50 + x * 40,
        shimmerY: 50 + y * 40,
        fgOffset: { x: x * 12 * pFactor, y: y * 10 * pFactor },
        mgOffset: { x: x * 6 * pFactor, y: y * 5 * pFactor },
        bgOffset: { x: -x * 6 * pFactor, y: -y * 5 * pFactor },
        isGyroAvailable,
        isGyroActive,
        hasGyro: isGyroActive || isGyroAvailable,
        needsPermissionPrompt,
      };
    },
    [maxTiltAngle, parallaxIntensity, isGyroAvailable, isGyroActive, needsPermissionPrompt]
  );

  const recalibrate = useCallback((beta?: number, gamma?: number) => {
    if (beta !== undefined) restingBetaRef.current = beta;
    if (gamma !== undefined) restingGammaRef.current = gamma;
    if (beta === undefined && gamma === undefined) {
      restingBetaRef.current = null;
      restingGammaRef.current = null;
    }
  }, []);

  // RAF loop for smooth exponential smoothing (lerp)
  useEffect(() => {
    if (!enabled) return;

    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const lerpSpeed = 16;
      const lerpFactor = 1 - Math.exp(-lerpSpeed * dt);

      currentX.current += (targetX.current - currentX.current) * lerpFactor;
      currentY.current += (targetY.current - currentY.current) * lerpFactor;

      setTiltState(computeState(currentX.current, currentY.current));

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [enabled, computeState]);

  const requestGyroPermission = useCallback(async () => {
    if (
      typeof window !== 'undefined' &&
      typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> })
        .requestPermission === 'function'
    ) {
      try {
        const permission = await (
          DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }
        ).requestPermission();
        if (permission === 'granted') {
          setIsGyroActive(true);
          setIsGyroAvailable(true);
          setNeedsPermissionPrompt(false);
          restingBetaRef.current = null;
          restingGammaRef.current = null;
          return true;
        }
      } catch (err) {
        console.warn('Gyroscope permission notice:', err);
      }
    }
    return false;
  }, []);

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> })
        .requestPermission === 'function'
    ) {
      setNeedsPermissionPrompt(true);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma === null && e.beta === null) return;

      lastSensorEventRef.current = performance.now();
      setIsGyroAvailable(true);
      setIsGyroActive(true);
      setNeedsPermissionPrompt(false);

      const gamma = e.gamma ?? 0;
      const beta = e.beta ?? 45;

      if (restingBetaRef.current === null) {
        restingBetaRef.current = beta;
        restingGammaRef.current = gamma;
        targetX.current = 0;
        targetY.current = 0;
        return;
      }

      const adaptAlpha = 0.005;
      if (Math.abs(beta) < 130) {
        restingBetaRef.current += (beta - restingBetaRef.current) * adaptAlpha;
      }
      if (Math.abs(gamma) < 70) {
        restingGammaRef.current! += (gamma - restingGammaRef.current!) * adaptAlpha;
      }

      const tiltSensitivity = 12;
      const deltaX = gamma - (restingGammaRef.current ?? 0);
      const deltaY = beta - (restingBetaRef.current ?? 45);

      targetX.current = Math.max(-1, Math.min(1, deltaX / tiltSensitivity));
      targetY.current = Math.max(-1, Math.min(1, deltaY / tiltSensitivity));
    };

    const handleMotion = (e: DeviceMotionEvent) => {
      if (performance.now() - lastSensorEventRef.current < 250) return;

      const acc = e.accelerationIncludingGravity;
      if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

      const ax = acc.x ?? 0;
      const ay = acc.y ?? 0;
      const az = acc.z ?? 0;

      if (Math.abs(ax) < 0.001 && Math.abs(ay) < 0.001 && Math.abs(az) < 0.001) return;

      setIsGyroAvailable(true);
      setIsGyroActive(true);
      setNeedsPermissionPrompt(false);

      const rollDeg = Math.atan2(-ax, Math.sqrt(ay * ay + az * az)) * (180 / Math.PI);
      const pitchDeg = Math.atan2(ay, Math.max(0.1, Math.abs(az))) * (180 / Math.PI);

      if (restingBetaRef.current === null) {
        restingBetaRef.current = pitchDeg;
        restingGammaRef.current = rollDeg;
        targetX.current = 0;
        targetY.current = 0;
        return;
      }

      const adaptAlpha = 0.005;
      restingBetaRef.current += (pitchDeg - restingBetaRef.current) * adaptAlpha;
      restingGammaRef.current! += (rollDeg - restingGammaRef.current!) * adaptAlpha;

      const tiltSensitivity = 12;
      targetX.current = Math.max(-1, Math.min(1, (rollDeg - (restingGammaRef.current ?? 0)) / tiltSensitivity));
      targetY.current = Math.max(-1, Math.min(1, (pitchDeg - (restingBetaRef.current ?? 45)) / tiltSensitivity));
    };

    window.addEventListener('deviceorientation', handleOrientation, true);
    window.addEventListener('deviceorientationabsolute', handleOrientation as EventListener, true);
    window.addEventListener('devicemotion', handleMotion, true);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
      window.removeEventListener('deviceorientationabsolute', handleOrientation as EventListener, true);
      window.removeEventListener('devicemotion', handleMotion, true);
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const handleUserInteraction = () => {
      if (needsPermissionPrompt) {
        requestGyroPermission();
      }
    };

    window.addEventListener('click', handleUserInteraction, { passive: true });
    window.addEventListener('touchend', handleUserInteraction, { passive: true });

    return () => {
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('touchend', handleUserInteraction);
    };
  }, [enabled, needsPermissionPrompt, requestGyroPermission]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent | React.MouseEvent) => {
      if (!enabled) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const clientX = 'clientX' in e ? e.clientX : 0;
      const clientY = 'clientY' in e ? e.clientY : 0;

      targetX.current = Math.max(-1, Math.min(1, ((clientX - rect.left) / rect.width - 0.5) * 2));
      targetY.current = Math.max(-1, Math.min(1, ((clientY - rect.top) / rect.height - 0.5) * 2));
    },
    [enabled]
  );

  const handlePointerLeave = useCallback(() => {
    if (performance.now() - lastSensorEventRef.current > 1000) {
      targetX.current = 0;
      targetY.current = 0;
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled) return;
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const rect = e.currentTarget.getBoundingClientRect();
        targetX.current = Math.max(-1, Math.min(1, ((touch.clientX - rect.left) / rect.width - 0.5) * 2));
        targetY.current = Math.max(-1, Math.min(1, ((touch.clientY - rect.top) / rect.height - 0.5) * 2));
      }
    },
    [enabled]
  );

  const handleTouchEnd = useCallback(() => {
    if (performance.now() - lastSensorEventRef.current > 1000) {
      targetX.current = 0;
      targetY.current = 0;
    }
  }, []);

  return {
    ...tiltState,
    handlePointerMove,
    handlePointerLeave,
    handleTouchMove,
    handleTouchEnd,
    requestGyroPermission,
    recalibrate,
  };
}
