'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type { CSSProperties } from 'react';
import { VIDEO_HERO_TREATMENT } from '@/lib/hero-media';

/**
 * The mining film is the primary hero medium. Keep it paintable from the
 * initial render: opacity:0 until onPlaying creates an autoplay visibility
 * deadlock on some browsers. The image below is only a loading/error fallback.
 */
export function MiningHeroMedia() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [requiresPlay, setRequiresPlay] = useState(false);
  const [manualPlay, setManualPlay] = useState(false);

  const tryPlay = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    setManualPlay(true);
    const attempt = video.play();
    if (attempt) {
      void attempt.then(() => setRequiresPlay(false)).catch(() => setRequiresPlay(true));
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Respect user motion preferences; explicit playback remains available.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      video.pause();
      // Report the need for user interaction after the effect, not synchronously
      // during React's effect synchronization phase.
      void Promise.resolve().then(() => setRequiresPlay(true));
      return;
    }

    video.muted = true;
    const attempt = video.play();
    if (attempt) {
      void attempt.catch(() => setRequiresPlay(true));
    }
  }, []);

  const videoStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
    zIndex: 1,
    opacity: VIDEO_HERO_TREATMENT.opacity,
    pointerEvents: 'none',
  };

  return (
    <>
      <Image
        className="miningHeroPoster"
        src="/images/mineria-1.avif"
        alt=""
        aria-hidden="true"
        fill
        unoptimized
        priority
        sizes="100vw"
      />
      <video
        ref={videoRef}
        className={manualPlay ? "miningHeroVideo miningHeroManualPlay" : "miningHeroVideo"}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/images/mineria-1.avif"
        style={videoStyle}
        aria-hidden="true"
        onPlaying={() => setRequiresPlay(false)}
        onError={() => setRequiresPlay(true)}
      >
        <source src="/images/Mineria-Video1.mp4" type="video/mp4" />
      </video>
      {requiresPlay && (
        <button
          type="button"
          className="miningHeroPlayButton"
          aria-label="Play mining hero video"
          onClick={tryPlay}
        >
          <span aria-hidden="true">▶</span> REPRODUCIR VIDEO
        </button>
      )}
    </>
  );
}
