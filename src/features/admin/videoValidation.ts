export const MAX_VIDEO_BYTES = 8 * 1024 * 1024;
export const WARN_DURATION_SECONDS = 6;
export const WARN_MAX_WIDTH = 640;
export const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm'];

export interface VideoProbe {
  durationSeconds: number;
  width: number;
  height: number;
}

export interface VideoWarning {
  message: string;
}

export function probeVideoFile(file: File): Promise<VideoProbe> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.src = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      const probe: VideoProbe = {
        durationSeconds: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
      };
      URL.revokeObjectURL(video.src);
      resolve(probe);
    };
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Could not read video metadata.'));
    };
  });
}

export function warningsFor(probe: VideoProbe): VideoWarning[] {
  const warnings: VideoWarning[] = [];
  if (probe.durationSeconds > WARN_DURATION_SECONDS) {
    warnings.push({
      message: `This clip is ${probe.durationSeconds.toFixed(1)}s — thumbnails usually loop best under ${WARN_DURATION_SECONDS}s.`,
    });
  }
  if (probe.width > WARN_MAX_WIDTH) {
    warnings.push({
      message: `This clip is ${probe.width}px wide — thumbnails are small, ${WARN_MAX_WIDTH}px or narrower is plenty.`,
    });
  }
  return warnings;
}

/** Captures the video's first frame as a webp blob, for use as a poster when none was uploaded. */
export function captureFirstFramePoster(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    video.src = URL.createObjectURL(file);

    const cleanup = () => URL.revokeObjectURL(video.src);

    video.onloadeddata = () => {
      video.currentTime = 0;
    };
    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        cleanup();
        reject(new Error('Canvas 2D context unavailable.'));
        return;
      }
      ctx.drawImage(video, 0, 0);
      canvas.toBlob(
        (blob) => {
          cleanup();
          if (blob) resolve(blob);
          else reject(new Error('Could not encode poster image.'));
        },
        'image/webp',
        0.85,
      );
    };
    video.onerror = () => {
      cleanup();
      reject(new Error('Could not read video for poster capture.'));
    };
  });
}
