import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { WavePattern } from '../types';

export interface ParticleOrbProps {
  /** Base radius of the sphere (default: 140) */
  radius?: number;
  /** Number of particles in the point-cloud sphere (default: 10000) */
  particleCount?: number;
  /** Primary neon flame color (default: '#ff3700') */
  color?: string;
  /** Secondary highlight color on wave crests (default: '#ff9d00') */
  secondaryColor?: string;
  /** Deep valley / inner base color (default: '#b30000') */
  coreColor?: string;
  /** Amplitude of wave displacement from 0.0 to 1.0 (default: 0.38) */
  waveAmplitude?: number;
  /** Frequency / number of harmonic wave crests & lobes (default: 7.0) */
  waveFrequency?: number;
  /** Speed of undulating motion (default: 1.25) */
  waveSpeed?: number;
  /** Speed of 3D auto orbit rotation (0.0 to 1.5, default: 0.0) */
  rotationSpeed?: number;
  /** Whether the animation is playing or paused (default: true) */
  isPlaying?: boolean;
  /** Individual particle diameter in pixels (default: 5.0) */
  particleSize?: number;
  /** Glow halo intensity multiplier (default: 1.6) */
  glowIntensity?: number;
  /** Harmonic wave mathematical pattern */
  wavePattern?: WavePattern;
  /** Whether user can rotate with mouse drag & touch (default: true) */
  interactive?: boolean;
  /** Custom class name for the container */
  className?: string;
  /** Custom inline styles */
  style?: React.CSSProperties;
}

/** Creates a smooth radial glow texture for high-fidelity particle rendering. */
function createParticleGlowTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
  gradient.addColorStop(0.18, 'rgba(255, 255, 255, 0.95)');
  gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.45)');
  gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.12)');
  gradient.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * ParticleOrb — the steady-state harmonic wave sphere from the original "Particle Orb
 * Origin Animation" project, with the bottom-right birth/flight sequence removed: the
 * orb always renders fully formed. Every wave/colour/motion parameter below matches the
 * original's math exactly.
 */
export const ParticleOrb: React.FC<ParticleOrbProps> = ({
  radius = 140,
  particleCount = 10000,
  color = '#ff3700',
  secondaryColor = '#ff9d00',
  coreColor = '#b30000',
  waveAmplitude = 0.38,
  waveFrequency = 7.0,
  waveSpeed = 1.25,
  rotationSpeed = 0.0,
  isPlaying = true,
  particleSize = 5.0,
  glowIntensity = 1.6,
  wavePattern = 'video-match',
  interactive = true,
  className = '',
  style = {},
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Parameter ref to synchronize state into the 60fps render loop
  const paramsRef = useRef({
    radius,
    waveAmplitude,
    waveFrequency,
    waveSpeed,
    rotationSpeed,
    isPlaying,
    particleSize,
    glowIntensity,
    wavePattern,
    color,
    secondaryColor,
    coreColor,
  });

  useEffect(() => {
    paramsRef.current = {
      radius,
      waveAmplitude,
      waveFrequency,
      waveSpeed,
      rotationSpeed,
      isPlaying,
      particleSize,
      glowIntensity,
      wavePattern,
      color,
      secondaryColor,
      coreColor,
    };
  }, [
    radius,
    waveAmplitude,
    waveFrequency,
    waveSpeed,
    rotationSpeed,
    isPlaying,
    particleSize,
    glowIntensity,
    wavePattern,
    color,
    secondaryColor,
    coreColor,
  ]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      48,
      container.clientWidth / container.clientHeight,
      1,
      2000,
    );
    camera.position.z = 460;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Fibonacci Golden-Spiral Sphere distribution for 100% uniform point density across all latitudes and poles
    const totalPoints = particleCount;
    const baseCoords: Array<[number, number, number]> = [];
    const positions = new Float32Array(totalPoints * 3);
    const colors = new Float32Array(totalPoints * 3);

    const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~2.39996323 rad

    for (let i = 0; i < totalPoints; i++) {
      const y0 = 1 - ((i + 0.5) / totalPoints) * 2; // from 1 to -1
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y0 * y0));
      const phi = goldenAngle * i;
      const x0 = Math.cos(phi) * radiusAtY;
      const z0 = Math.sin(phi) * radiusAtY;

      baseCoords.push([x0, y0, z0]);

      positions[i * 3] = x0 * radius;
      positions[i * 3 + 1] = y0 * radius;
      positions[i * 3 + 2] = z0 * radius;

      colors[i * 3] = 1.0;
      colors[i * 3 + 1] = 0.3;
      colors[i * 3 + 2] = 0.1;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const glowTexture = createParticleGlowTexture();
    const material = new THREE.PointsMaterial({
      size: particleSize,
      map: glowTexture,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
      sizeAttenuation: true,
    });

    const pointCloud = new THREE.Points(geometry, material);

    // Exact downward viewing pitch matching the reference video's angled perspective
    const BASE_PITCH = 0.52;
    const BASE_YAW = 0.12;
    pointCloud.rotation.x = BASE_PITCH;
    pointCloud.rotation.y = BASE_YAW;
    pointCloud.rotation.z = 0;
    scene.add(pointCloud);

    // Interactive Drag rotation (optional inspection)
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    const targetRotation = { x: BASE_PITCH, y: BASE_YAW };
    const currentRotation = { x: BASE_PITCH, y: BASE_YAW };

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

      targetRotation.y += deltaX * 0.006;
      targetRotation.x += deltaY * 0.006;
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

      targetRotation.y += deltaX * 0.006;
      targetRotation.x += deltaY * 0.006;
    };

    const onTouchEnd = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      if (!interactive) return;
      e.preventDefault();
      camera.position.z = THREE.MathUtils.clamp(camera.position.z + e.deltaY * 0.35, 280, 750);
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

    let animationFrameId: number;

    const threeColorPrimary = new THREE.Color();
    const threeColorSecondary = new THREE.Color();
    const threeColorCore = new THREE.Color();

    let simElapsedTime = 0;
    let prevFrameTime = performance.now() / 1000;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const currentTimeSec = performance.now() / 1000;
      const delta = Math.min(0.1, currentTimeSec - prevFrameTime);
      prevFrameTime = currentTimeSec;

      const {
        radius: curRadius,
        waveAmplitude: curAmp,
        waveFrequency: curFreq,
        waveSpeed: curSpeed,
        rotationSpeed: curRotSpeed,
        isPlaying: isSimPlaying,
        particleSize: curSize,
        glowIntensity: curGlow,
        wavePattern: curPattern,
        color: curColor,
        secondaryColor: curSecColor,
        coreColor: curCoreColor,
      } = paramsRef.current;

      if (isSimPlaying) {
        simElapsedTime += delta;
      }
      const elapsedTime = simElapsedTime;

      threeColorPrimary.set(curColor);
      threeColorSecondary.set(curSecColor);
      threeColorCore.set(curCoreColor);

      material.size = curSize;

      // Orientation handling (with interactive drag + optional auto-orbit rotation)
      if (isDragging) {
        currentRotation.x += (targetRotation.x - currentRotation.x) * 0.1;
        currentRotation.y += (targetRotation.y - currentRotation.y) * 0.1;
      } else {
        if (curRotSpeed > 0 && isSimPlaying) {
          targetRotation.y += delta * curRotSpeed * 0.6;
          targetRotation.x = BASE_PITCH + Math.sin(elapsedTime * 0.3) * 0.08 * curRotSpeed;
        } else if (curRotSpeed === 0) {
          targetRotation.x = BASE_PITCH;
          targetRotation.y = BASE_YAW;
        }
        currentRotation.x += (targetRotation.x - currentRotation.x) * 0.06;
        currentRotation.y += (targetRotation.y - currentRotation.y) * 0.06;
      }
      pointCloud.rotation.x = currentRotation.x;
      pointCloud.rotation.y = currentRotation.y;
      pointCloud.rotation.z = 0;

      // Mathematical harmonic undulation time
      const t = elapsedTime * curSpeed * 1.6;
      const effectiveAmp = curAmp * 1.1;

      const posAttr = geometry.attributes.position as THREE.BufferAttribute;
      const colAttr = geometry.attributes.color as THREE.BufferAttribute;
      const posArray = posAttr.array as Float32Array;
      const colArray = colAttr.array as Float32Array;

      for (let i = 0; i < baseCoords.length; i++) {
        const [x0, y0, z0] = baseCoords[i];

        let displacement = 0;

        if (curPattern === 'video-match') {
          const f = curFreq * 0.75;
          const w1 = Math.sin(x0 * f + t * 1.4) * Math.cos(y0 * f + t * 0.95) * Math.cos(z0 * (f * 0.8) - t * 1.2);
          const w2 = Math.sin((x0 * 0.8 + z0 * 0.6) * (f * 1.1) + t * 1.6) * Math.sin(y0 * (f * 1.2) - t * 1.3);
          const w3 = Math.cos((z0 * 0.8 - x0 * 0.6) * (f * 1.1) - t * 1.5) * Math.cos((y0 * 0.8 + x0 * 0.4) * (f * 0.9) + t * 1.1);
          const w4 = Math.sin((x0 + y0 + z0) * (f * 0.8) + t * 1.8) * 0.4;

          displacement = (w1 * 0.45 + w2 * 0.35 + w3 * 0.3 + w4 * 0.2) * effectiveAmp;
        } else if (curPattern === 'neural') {
          const f = curFreq * 0.8;
          const w1 = Math.sin(x0 * f + y0 * f + t * 2.0) * Math.cos(z0 * (f * 1.2) - t * 1.5);
          const w2 = Math.cos((x0 - z0) * f + t * 1.8) * Math.sin(y0 * (f * 1.4) + t * 1.2);
          displacement = (w1 * 0.6 + w2 * 0.4) * effectiveAmp;
        } else if (curPattern === 'ripple') {
          const f = curFreq * 1.2;
          const dist = Math.sqrt(x0 * x0 + z0 * z0);
          const w1 = Math.sin(dist * f - t * 2.5) * Math.cos(y0 * (f * 0.8) + t * 1.2);
          const w2 = Math.cos(x0 * f * 0.7 + z0 * f * 0.7 - t * 1.5);
          displacement = (w1 * 0.7 + w2 * 0.3) * effectiveAmp;
        } else if (curPattern === 'quantum') {
          const f = curFreq * 0.9;
          const w1 = Math.sin(x0 * f + t * 2.5) * Math.sin(y0 * f + t * 1.8) * Math.sin(z0 * f - t * 2.2);
          const w2 = Math.cos((x0 * 1.2 + z0 * 1.2) * f - t * 2.0) * Math.sin(y0 * (f * 1.3) + t * 1.6);
          displacement = (w1 * 0.55 + w2 * 0.45) * effectiveAmp;
        } else {
          const w1 = Math.sin(x0 * 2.5 + t * 1.2) * Math.cos(y0 * 2.5 + t * 1.0) * Math.sin(z0 * 2.5 - t * 0.8);
          displacement = w1 * effectiveAmp;
        }

        const r = curRadius * (1.0 + displacement);

        posArray[i * 3] = x0 * r;
        posArray[i * 3 + 1] = y0 * r;
        posArray[i * 3 + 2] = z0 * r;

        // Dynamic Color Shading based on wave crests & valleys with uniform luminance
        const normDisp = (displacement / (effectiveAmp || 0.1) + 1.0) * 0.5;
        const clampedDisp = Math.max(0.0, Math.min(1.0, normDisp));

        let rCol: number, gCol: number, bCol: number;
        if (clampedDisp < 0.5) {
          const factor = clampedDisp / 0.5;
          rCol = THREE.MathUtils.lerp(threeColorCore.r, threeColorPrimary.r, factor);
          gCol = THREE.MathUtils.lerp(threeColorCore.g, threeColorPrimary.g, factor);
          bCol = THREE.MathUtils.lerp(threeColorCore.b, threeColorPrimary.b, factor);
        } else {
          const factor = (clampedDisp - 0.5) / 0.5;
          rCol = THREE.MathUtils.lerp(threeColorPrimary.r, threeColorSecondary.r, factor);
          gCol = THREE.MathUtils.lerp(threeColorPrimary.g, threeColorSecondary.g, factor);
          bCol = THREE.MathUtils.lerp(threeColorPrimary.b, threeColorSecondary.b, factor);
        }

        const brightness = (0.9 + clampedDisp * 0.4) * curGlow;
        colArray[i * 3] = Math.min(1.0, rCol * brightness);
        colArray[i * 3 + 1] = Math.min(1.0, gCol * brightness);
        colArray[i * 3 + 2] = Math.min(1.0, bCol * brightness);
      }

      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;

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
      id="particle-orb-canvas-container"
      className={`relative h-full w-full cursor-grab touch-none select-none active:cursor-grabbing ${className}`}
      style={style}
    />
  );
};

export default ParticleOrb;
