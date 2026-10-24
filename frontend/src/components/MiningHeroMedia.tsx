'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type { CSSProperties } from 'react';
import { VIDEO_HERO_TREATMENT } from '@/lib/hero-media';

/**
 * Keep the original mining video as the hero's primary medium, but show an
 * existing mining photograph until actual playback is confirmed.
 * Browsers that cannot autoplay, decode or fetch the MP4 never see a black hero.
 */
export function MiningHeroMedia() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      video.pause();
      return;
    }

    if (!video.paused && video.readyState >= 2) setPlaying(true);

    // Muted/inline playback normally works without interaction. When browser
    // policy or decoding prevents it, leave the still photograph visible.
    const request = video.play();
    if (request) void request.catch(() => setPlaying(false));
  }, []);

  const videoStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
    zIndex: 1,
    opacity: playing ? VIDEO_HERO_TREATMENT.opacity : 0,
    transition: 'opacity 350ms ease',
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
        className="miningHeroVideo"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/images/mineria-1.avif"
        style={videoStyle}
        aria-hidden="true"
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onWaiting={() => setPlaying(false)}
        onStalled={() => setPlaying(false)}
        onError={() => setPlaying(false)}
      >
        <source src="/images/Mina-Video-1.mp4" type="video/mp4" />
      </video>
    </>
  );
}
