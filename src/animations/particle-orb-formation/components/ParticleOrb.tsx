import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { WavePattern } from '../types';
import { SpeedCurveIntegrator } from '../utils/speedCurve';

export interface ParticleOrbProps {
  radius?: number;
  particleCount?: number;
  color?: string;
  secondaryColor?: string;
  coreColor?: string;
  waveAmplitude?: number;
  waveFrequency?: number;
  waveSpeed?: number;
  rotationSpeed?: number;
  particleSize?: number;
  glowIntensity?: number;
  wavePattern?: WavePattern;
  interactive?: boolean;
  /** Duration in seconds of the formation animation from surrounding space */
  formationDuration?: number;
  /** Manual progress override from 0 to 1, or null for auto-animated */
  manualProgress?: number | null;
  /** Starting percentage for formation animation (0 to 90) */
  startPercentage?: number;
  /** 11 points specifying convergence speed at 0%, 10%, ..., 100% */
  speedPoints?: number[];
  onFormationComplete?: () => void;
  /** Key to trigger a replay of the formation */
  formationKey?: number;
  onProgressUpdate?: (progress: number) => void;
  /** Freezes the whole animation loop (time, rotation, formation) while false */
  isPlaying?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

function createParticleGlowTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();

  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
  gradient.addColorStop(0.18, 'rgba(255, 255, 255, 0.95)');
  gradient.addColorStop(0.42, 'rgba(255, 255, 255, 0.45)');
  gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.12)');
  gradient.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

const vertexShader = `
  uniform float uProgress;
  uniform float uTime;
  uniform float uRadius;
  uniform float uWaveAmplitude;
  uniform float uWaveFrequency;
  uniform float uWaveSpeed;
  uniform float uBaseParticleSize;
  uniform float uGlowIntensity;
  uniform int uWavePattern;
  uniform vec3 uColorCore;
  uniform vec3 uColorPrimary;
  uniform vec3 uColorSecondary;

  attribute vec3 aOrigin;
  attribute vec3 aTarget;
  attribute float aDelay;
  attribute float aSize;
  attribute float aRandom;

  varying vec3 vColor;
  varying float vAlpha;

  float smootherstep(float edge0, float edge1, float x) {
    float t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
  }

  void main() {
    float delaySpan = 0.15;
    float startThreshold = aDelay * delaySpan;
    float pRaw = clamp((uProgress - startThreshold) / (1.0 - delaySpan), 0.0, 1.0);
    float ease = smootherstep(0.0, 1.0, pRaw);

    vec3 normTarget = normalize(aTarget);
    float x0 = normTarget.x;
    float y0 = normTarget.y;
    float z0 = normTarget.z;

    float t = uTime * uWaveSpeed * 1.6;
    float displacement = 0.0;

    if (uWavePattern == 0) { // video-match
      float f = uWaveFrequency * 0.75;
      float w1 = sin(x0 * f + t * 1.4) * cos(y0 * f + t * 0.95) * cos(z0 * (f * 0.8) - t * 1.2);
      float w2 = sin((x0 * 0.8 + z0 * 0.6) * (f * 1.1) + t * 1.6) * sin(y0 * (f * 1.2) - t * 1.3);
      float w3 = cos((z0 * 0.8 - x0 * 0.6) * (f * 1.1) - t * 1.5) * cos((y0 * 0.8 + x0 * 0.4) * (f * 0.9) + t * 1.1);
      float w4 = sin((x0 + y0 + z0) * (f * 0.8) + t * 1.8) * 0.4;
      displacement = (w1 * 0.45 + w2 * 0.35 + w3 * 0.3 + w4 * 0.2) * uWaveAmplitude;
    } else if (uWavePattern == 1) { // neural
      float f = uWaveFrequency * 0.8;
      float w1 = sin(x0 * f + y0 * f + t * 2.0) * cos(z0 * (f * 1.2) - t * 1.5);
      float w2 = cos((x0 - z0) * f + t * 1.8) * sin(y0 * (f * 1.4) + t * 1.2);
      displacement = (w1 * 0.6 + w2 * 0.4) * uWaveAmplitude;
    } else if (uWavePattern == 2) { // ripple
      float f = uWaveFrequency * 1.2;
      float dist = sqrt(x0 * x0 + z0 * z0);
      float w1 = sin(dist * f - t * 2.5) * cos(y0 * (f * 0.8) + t * 1.2);
      float w2 = cos(x0 * f * 0.7 + z0 * f * 0.7 - t * 1.5);
      displacement = (w1 * 0.7 + w2 * 0.3) * uWaveAmplitude;
    } else if (uWavePattern == 3) { // quantum
      float f = uWaveFrequency * 0.9;
      float w1 = sin(x0 * f + t * 2.5) * sin(y0 * f + t * 1.8) * sin(z0 * f - t * 2.2);
      float w2 = cos((x0 * 1.2 + z0 * 1.2) * f - t * 2.0) * sin(y0 * (f * 1.3) + t * 1.6);
      displacement = (w1 * 0.55 + w2 * 0.45) * uWaveAmplitude;
    } else { // smooth
      float w1 = sin(x0 * 2.5 + t * 1.2) * cos(y0 * 2.5 + t * 1.0) * sin(z0 * 2.5 - t * 0.8);
      displacement = w1 * uWaveAmplitude;
    }

    float flightArc = sin(ease * 3.14159265);

    float swirlAngle = flightArc * (0.55 + aRandom * 0.3) * (aRandom > 0.5 ? 1.0 : -1.0);
    float cosS = cos(swirlAngle);
    float sinS = sin(swirlAngle);
    mat2 rotXZ = mat2(cosS, -sinS, sinS, cosS);

    vec3 curOrigin = aOrigin;
    curOrigin.xz = rotXZ * curOrigin.xz;

    float driftAmp = (1.0 - ease) * 5.0;
    float driftTime = uTime * 0.45 + aRandom * 6.28318;
    curOrigin.x += sin(driftTime) * driftAmp;
    curOrigin.y += cos(driftTime * 0.78) * driftAmp;
    curOrigin.z += sin(driftTime * 0.92) * driftAmp;

    float currentDisp = displacement * ease;
    vec3 finalSpherePos = normTarget * (uRadius * (1.0 + currentDisp));

    vec3 currentPos = mix(curOrigin, finalSpherePos, ease);

    vec4 mvPosition = modelViewMatrix * vec4(currentPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    gl_PointSize = (uBaseParticleSize * aSize) * (480.0 / -mvPosition.z);

    vAlpha = 1.0;

    float normDisp = clamp((displacement / (uWaveAmplitude + 0.0001) + 1.0) * 0.5, 0.0, 1.0);
    vec3 orbColor;
    if (normDisp < 0.5) {
      orbColor = mix(uColorCore, uColorPrimary, normDisp * 2.0);
    } else {
      orbColor = mix(uColorPrimary, uColorSecondary, (normDisp - 0.5) * 2.0);
    }

    vec3 dissipatedColor = mix(uColorPrimary, uColorSecondary, aRandom * 0.75 + 0.15);
    vec3 finalColor = mix(dissipatedColor, orbColor, ease);

    vColor = finalColor * (0.95 + normDisp * 0.35 * ease) * uGlowIntensity;
  }
`;

const fragmentShader = `
  uniform sampler2D uTexture;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec4 texColor = texture2D(uTexture, gl_PointCoord);
    if (texColor.a < 0.01) discard;
    gl_FragColor = vec4(vColor, vAlpha * texColor.a);
  }
`;

function getPatternIndex(pattern?: WavePattern | string): number {
  switch (pattern) {
    case 'video-match': return 0;
    case 'neural': return 1;
    case 'ripple': return 2;
    case 'quantum': return 3;
    case 'smooth': return 4;
    default: return 0;
  }
}

export const ParticleOrb: React.FC<ParticleOrbProps> = ({
  radius = 120,
  particleCount = 12000,
  color = '#c32d04',
  secondaryColor = '#ff5200',
  coreColor = '#b30000',
  waveAmplitude = 0.25,
  waveFrequency = 7.5,
  waveSpeed = 0.35,
  rotationSpeed = 0.55,
  particleSize = 4.7,
  glowIntensity = 0.9,
  wavePattern = 'video-match',
  interactive = true,
  formationDuration = 1.9,
  manualProgress = null,
  startPercentage = 51,
  speedPoints = [3.0, 3.0, 3.0, 3.0, 3.0, 3.0, 2.7, 1.9, 1.3, 0.8, 0.2],
  onFormationComplete,
  formationKey = 0,
  onProgressUpdate,
  isPlaying = true,
  className = '',
  style = {},
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const formationStartTimeRef = useRef<number | null>(null);
  const hasCompletedRef = useRef<boolean>(false);
  const pauseOffsetRef = useRef<number>(0);
  const speedIntegratorRef = useRef<SpeedCurveIntegrator>(new SpeedCurveIntegrator(speedPoints));

  useEffect(() => {
    speedIntegratorRef.current.update(speedPoints);
  }, [speedPoints]);

  const propsRef = useRef({
    radius,
    waveAmplitude,
    waveFrequency,
    waveSpeed,
    rotationSpeed,
    particleSize,
    glowIntensity,
    wavePattern,
    color,
    secondaryColor,
    coreColor,
    formationDuration,
    manualProgress,
    startPercentage,
    isPlaying,
  });

  useEffect(() => {
    propsRef.current = {
      radius,
      waveAmplitude,
      waveFrequency,
      waveSpeed,
      rotationSpeed,
      particleSize,
      glowIntensity,
      wavePattern,
      color,
      secondaryColor,
      coreColor,
      formationDuration,
      manualProgress,
      startPercentage,
      isPlaying,
    };
  }, [
    radius,
    waveAmplitude,
    waveFrequency,
    waveSpeed,
    rotationSpeed,
    particleSize,
    glowIntensity,
    wavePattern,
    color,
    secondaryColor,
    coreColor,
    formationDuration,
    manualProgress,
    startPercentage,
    isPlaying,
  ]);

  useEffect(() => {
    formationStartTimeRef.current = null;
    hasCompletedRef.current = false;
  }, [formationKey]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / Math.max(container.clientHeight, 1),
      1,
      3000
    );
    camera.position.z = 480;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const totalPoints = particleCount;
    const aTarget = new Float32Array(totalPoints * 3);
    const aOrigin = new Float32Array(totalPoints * 3);
    const aDelay = new Float32Array(totalPoints);
    const aSize = new Float32Array(totalPoints);
    const aRandom = new Float32Array(totalPoints);

    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < totalPoints; i++) {
      const y0 = 1 - ((i + 0.5) / totalPoints) * 2;
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y0 * y0));
      const phi = goldenAngle * i;
      const x0 = Math.cos(phi) * radiusAtY;
      const z0 = Math.sin(phi) * radiusAtY;

      aTarget[i * 3] = x0 * radius;
      aTarget[i * 3 + 1] = y0 * radius;
      aTarget[i * 3 + 2] = z0 * radius;

      const aspect = container.clientWidth / Math.max(container.clientHeight, 1);
      const halfH = 480 * Math.tan((25 * Math.PI) / 180);
      const halfW = halfH * Math.max(aspect, 1.1);

      const isFrustum = Math.random() < 0.75;

      if (isFrustum) {
        const zDepth = (Math.random() - 0.5) * 420;
        const depthRatio = (480 - zDepth) / 480;
        const spreadX = (Math.random() - 0.5) * 2 * (halfW * 1.35 * depthRatio);
        const spreadY = (Math.random() - 0.5) * 2 * (halfH * 1.35 * depthRatio);

        aOrigin[i * 3] = spreadX;
        aOrigin[i * 3 + 1] = spreadY;
        aOrigin[i * 3 + 2] = zDepth;
      } else {
        const thetaS = Math.acos(2 * Math.random() - 1);
        const phiS = Math.random() * 2 * Math.PI;
        const rS = 320 + Math.pow(Math.random(), 0.7) * 360;

        aOrigin[i * 3] = rS * Math.sin(thetaS) * Math.cos(phiS);
        aOrigin[i * 3 + 1] = rS * Math.cos(thetaS);
        aOrigin[i * 3 + 2] = Math.min(220, rS * Math.sin(thetaS) * Math.sin(phiS));
      }

      aDelay[i] = Math.random();
      aSize[i] = 0.92 + (Math.random() - 0.5) * 0.2;
      aRandom[i] = Math.random();
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(aTarget, 3));
    geometry.setAttribute('aTarget', new THREE.BufferAttribute(aTarget, 3));
    geometry.setAttribute('aOrigin', new THREE.BufferAttribute(aOrigin, 3));
    geometry.setAttribute('aDelay', new THREE.BufferAttribute(aDelay, 1));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(aSize, 1));
    geometry.setAttribute('aRandom', new THREE.BufferAttribute(aRandom, 1));

    const glowTexture = createParticleGlowTexture();

    const uniforms = {
      uProgress: { value: 0.0 },
      uTime: { value: 0.0 },
      uRadius: { value: radius },
      uWaveAmplitude: { value: waveAmplitude },
      uWaveFrequency: { value: waveFrequency },
      uWaveSpeed: { value: waveSpeed },
      uBaseParticleSize: { value: particleSize },
      uGlowIntensity: { value: glowIntensity },
      uWavePattern: { value: getPatternIndex(wavePattern) },
      uColorCore: { value: new THREE.Color(coreColor) },
      uColorPrimary: { value: new THREE.Color(color) },
      uColorSecondary: { value: new THREE.Color(secondaryColor) },
      uTexture: { value: glowTexture },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
    });

    const pointCloud = new THREE.Points(geometry, material);
    scene.add(pointCloud);

    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    const targetRotation = { x: 0.15, y: 0.35 };
    const currentRotation = { x: 0.15, y: 0.35 };

    const onMouseDown = (e: MouseEvent) => {
      if (!interactive) return;
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!interactive || !isDragging) return;
      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;
      prevMousePos = { x: e.clientX, y: e.clientY };

      targetRotation.y += deltaX * 0.007;
      targetRotation.x += deltaY * 0.007;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (!interactive || e.touches.length === 0) return;
      isDragging = true;
      prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!interactive || !isDragging || e.touches.length === 0) return;
      const deltaX = e.touches[0].clientX - prevMousePos.x;
      const deltaY = e.touches[0].clientY - prevMousePos.y;
      prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };

      targetRotation.y += deltaX * 0.007;
      targetRotation.x += deltaY * 0.007;
    };

    const onTouchEnd = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      if (!interactive) return;
      e.preventDefault();
      camera.position.z = THREE.MathUtils.clamp(
        camera.position.z + e.deltaY * 0.35,
        260,
        850
      );
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElement.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    domElement.addEventListener('wheel', onWheel, { passive: false });

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width === 0 || height === 0) return;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
    });
    resizeObserver.observe(container);

    const clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const currentProps = propsRef.current;

      if (!currentProps.isPlaying) {
        pauseOffsetRef.current += delta;
        renderer.render(scene, camera);
        return;
      }

      const elapsedTime = clock.getElapsedTime() - pauseOffsetRef.current;

      let progress = 1.0;
      if (currentProps.manualProgress !== null && currentProps.manualProgress !== undefined) {
        progress = THREE.MathUtils.clamp(currentProps.manualProgress, 0.0, 1.0);
      } else {
        if (formationStartTimeRef.current === null) {
          formationStartTimeRef.current = elapsedTime;
        }
        const timeSinceStart = elapsedTime - formationStartTimeRef.current;
        const dur = Math.max(0.1, currentProps.formationDuration);
        const normalizedTime = THREE.MathUtils.clamp(timeSinceStart / dur, 0.0, 1.0);
        const startFraction = THREE.MathUtils.clamp((currentProps.startPercentage ?? 0) / 100, 0.0, 0.99);
        progress = speedIntegratorRef.current.getProgress(normalizedTime, startFraction);

        if (normalizedTime >= 1.0 && !hasCompletedRef.current) {
          hasCompletedRef.current = true;
          onFormationComplete?.();
        }
      }

      onProgressUpdate?.(progress);

      uniforms.uProgress.value = progress;
      uniforms.uTime.value = elapsedTime;
      uniforms.uRadius.value = currentProps.radius;
      uniforms.uWaveAmplitude.value = currentProps.waveAmplitude;
      uniforms.uWaveFrequency.value = currentProps.waveFrequency;
      uniforms.uWaveSpeed.value = currentProps.waveSpeed;
      uniforms.uBaseParticleSize.value = currentProps.particleSize;
      uniforms.uGlowIntensity.value = currentProps.glowIntensity;
      uniforms.uWavePattern.value = getPatternIndex(currentProps.wavePattern);

      uniforms.uColorCore.value.set(currentProps.coreColor);
      uniforms.uColorPrimary.value.set(currentProps.color);
      uniforms.uColorSecondary.value.set(currentProps.secondaryColor);

      if (!isDragging) {
        targetRotation.y += delta * currentProps.rotationSpeed * 0.65;
        targetRotation.x += delta * currentProps.rotationSpeed * 0.22 * Math.sin(elapsedTime * 0.3);
      }

      currentRotation.x += (targetRotation.x - currentRotation.x) * 0.08;
      currentRotation.y += (targetRotation.y - currentRotation.y) * 0.08;

      pointCloud.rotation.x = currentRotation.x;
      pointCloud.rotation.y = currentRotation.y;
      pointCloud.rotation.z = Math.sin(elapsedTime * 0.2) * 0.08;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElement.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      domElement.removeEventListener('wheel', onWheel);

      geometry.dispose();
      material.dispose();
      glowTexture.dispose();
      renderer.dispose();
      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
    };
  }, [particleCount, interactive]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full cursor-grab active:cursor-grabbing select-none overflow-hidden ${className}`}
      style={style}
    />
  );
};

export default ParticleOrb;
