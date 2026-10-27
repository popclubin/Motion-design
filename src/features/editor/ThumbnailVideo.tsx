import { useEffect, useRef, useState } from 'react';
import { cx } from '../../lib/utils';
import { thumbnailPlayback } from './thumbnailPlayback';

interface ThumbnailVideoProps {
  videoSrc?: string | null;
  posterSrc?: string | null;
  initials?: string;
  className?: string;
}

function usePrefersReducedMotion(): boolean {
  const [prefers] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  return prefers;
}

export function ThumbnailVideo({ videoSrc, posterSrc, className }: ThumbnailVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [imgError, setImgError] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const canPlay = Boolean(videoSrc) && !prefersReducedMotion && !videoError;

  useEffect(() => {
    setVideoError(false);
  }, [videoSrc]);

  useEffect(() => {
    setImgError(false);
  }, [posterSrc]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !canPlay) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting && entry.intersectionRatio >= 0.1);
        thumbnailPlayback.updateRatio(el, entry.intersectionRatio);
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [canPlay]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !canPlay) return;

    if (!isIntersecting) {
      thumbnailPlayback.release(el);
      return;
    }

    thumbnailPlayback.request(el);

    const onVisibilityChange = () => {
      if (document.hidden) thumbnailPlayback.release(el);
      else thumbnailPlayback.request(el);
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [canPlay, isIntersecting]);

  useEffect(() => {
    const el = videoRef.current;
    return () => {
      if (el) thumbnailPlayback.release(el);
    };
  }, []);

  if (!videoSrc || videoError) {
    if (posterSrc && !imgError) {
      return (
        <img
          src={posterSrc}
          alt=""
          onError={() => setImgError(true)}
          className={className}
        />
      );
    }
    return (
      <div
        className={cx(
          className,
          'relative flex items-center justify-center bg-[#101216] overflow-hidden select-none border border-neutral-800/40',
        )}
      >
        {/* Dummy greyish skeleton thumbnail */}
        <div className="flex flex-col items-center justify-center gap-2 w-full h-full p-2.5 opacity-60">
          <div className="w-11 h-7 rounded-md bg-neutral-800/90 animate-pulse border border-neutral-700/40 flex items-center justify-center shadow-inner">
            <div className="w-3.5 h-3.5 rounded-full bg-neutral-700/60" />
          </div>
          <div className="h-1.5 w-14 rounded bg-neutral-800/70 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      src={videoSrc}
      poster={posterSrc && !imgError ? posterSrc : undefined}
      muted
      loop
      autoPlay
      playsInline
      preload="metadata"
      onError={() => setVideoError(true)}
      className={className}
    />
  );
}
