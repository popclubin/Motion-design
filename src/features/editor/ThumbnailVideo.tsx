import { useEffect, useRef, useState } from 'react';
import { cx } from '../../lib/utils';
import { thumbnailPlayback } from './thumbnailPlayback';

interface ThumbnailVideoProps {
  videoSrc?: string | null;
  posterSrc?: string | null;
  initials: string;
  className?: string;
}

function usePrefersReducedMotion(): boolean {
  const [prefers] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  return prefers;
}

export function ThumbnailVideo({ videoSrc, posterSrc, initials, className }: ThumbnailVideoProps) {
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
          'flex items-center justify-center bg-raised text-[13px] font-semibold text-muted',
        )}
      >
        {initials}
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
