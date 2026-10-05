const MAX_CONCURRENT_PLAYING = 8;

/** Caps how many sidebar thumbnail videos play at once, evicting the least-visible first. */
class ThumbnailPlaybackManager {
  private playing = new Map<HTMLVideoElement, number>();

  request(el: HTMLVideoElement, ratio = 1) {
    this.playing.set(el, ratio);
    this.enforceCap();
    void el.play().catch(() => {
      // Autoplay can be rejected before the element is fully ready — harmless.
    });
  }

  release(el: HTMLVideoElement) {
    this.playing.delete(el);
    el.pause();
  }

  updateRatio(el: HTMLVideoElement, ratio: number) {
    if (this.playing.has(el)) this.playing.set(el, ratio);
  }

  private enforceCap() {
    const overflow = this.playing.size - MAX_CONCURRENT_PLAYING;
    if (overflow <= 0) return;

    const farthestFirst = [...this.playing.entries()].sort((a, b) => a[1] - b[1]);
    for (const [el] of farthestFirst.slice(0, overflow)) {
      el.pause();
      this.playing.delete(el);
    }
  }
}

export const thumbnailPlayback = new ThumbnailPlaybackManager();
