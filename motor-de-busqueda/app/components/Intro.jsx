'use client';
import { useEffect, useRef, useState } from 'react';

const VIDEOS = [
  'https://elimfilters.com/wp-content/uploads/2026/05/moleculas.mp4',
  'https://elimfilters.com/wp-content/uploads/2026/05/maquinaria-en-mina.mp4',
  'https://elimfilters.com/wp-content/uploads/2026/05/p554004.mp4',
];

const WP = 'https://elimfilters.com/wp-content/uploads';
const LOGO_E = `${WP}/2025/11/AE6A9C09-F12F-4AA4-8021-EAF6F448860E.webp`;
const LOGO_FULL = `${WP}/2025/11/logo-sin-fondo.png`;

export default function Intro({ onComplete }) {
  const videoRefs = [useRef(null), useRef(null), useRef(null)];
  const [current, setCurrent] = useState(0);
  const [phase, setPhase] = useState('videos'); // 'videos' | 'logo' | 'done'
  const [videoOpacity, setVideoOpacity] = useState(0);
  const [textVisible, setTextVisible] = useState(false);
  const [logoVisible, setLogoVisible] = useState(false);
  const [sloganVisible, setSloganVisible] = useState(false);
  const [overlayOut, setOverlayOut] = useState(false);
  const rafRef = useRef(null);
  const timeoutRefs = useRef([]);

  const addTimeout = (fn, ms) => {
    const t = setTimeout(fn, ms);
    timeoutRefs.current.push(t);
    return t;
  };

  // Fade video in/out using requestAnimationFrame
  const fadeVideo = (videoEl, from, to, duration, cb) => {
    if (!videoEl) return;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      videoEl.style.opacity = from + (to - from) * progress;
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        videoEl.style.opacity = to;
        if (cb) cb();
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const playVideo = (index) => {
    const videoEl = videoRefs[index]?.current;
    if (!videoEl) return;
    videoEl.currentTime = 0;
    videoEl.play().catch(() => {});
    fadeVideo(videoEl, 0, 1, 500, null);
  };

  const fadeOutAndNext = (index) => {
    const videoEl = videoRefs[index]?.current;
    if (!videoEl) return;
    fadeVideo(videoEl, 1, 0, 500, () => {
      if (index < VIDEOS.length - 1) {
        setCurrent(index + 1);
        playVideo(index + 1);
        if (index === 0) setTextVisible(true);
      } else {
        // All videos done → logo phase
        setPhase('logo');
        setTextVisible(false);
        addTimeout(() => {
          setLogoVisible(true);
          addTimeout(() => {
            setSloganVisible(true);
            addTimeout(() => {
              setOverlayOut(true);
              addTimeout(() => {
                if (onComplete) onComplete();
              }, 1000);
            }, 1800);
          }, 600);
        }, 200);
      }
    });
  };

  useEffect(() => {
    // Start first video
    addTimeout(() => {
      playVideo(0);
    }, 100);

    // Video timing: 4s each, 0.5s fade out before end
    addTimeout(() => fadeOutAndNext(0), 4000);
    addTimeout(() => fadeOutAndNext(1), 8500);
    addTimeout(() => fadeOutAndNext(2), 13000);

    return () => {
      timeoutRefs.current.forEach(clearTimeout);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      videoRefs.forEach(ref => {
        if (ref.current) ref.current.pause();
      });
    };
  }, []);

  const css = `
    .intro-wrap{position:fixed;inset:0;z-index:9999;background:#000;overflow:hidden;}
    .intro-video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;}
    .intro-veo-cover{position:absolute;bottom:0;right:0;width:160px;height:60px;background:#000;z-index:5;}
    .intro-text{position:absolute;bottom:15%;left:6%;z-index:6;transition:opacity 0.8s ease,transform 0.8s ease;}
    .intro-eyebrow{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.35em;color:rgba(255,241,45,0.7);text-transform:uppercase;margin-bottom:16px;}
    .intro-title1{font-family:'Russo One',sans-serif;font-size:clamp(52px,8vw,100px);color:#fff;text-transform:uppercase;line-height:0.9;margin:0;}
    .intro-title2{font-family:'Russo One',sans-serif;font-size:clamp(52px,8vw,100px);color:#FFF12D;text-transform:uppercase;line-height:0.9;margin:0 0 16px;}
    .intro-line{width:120px;height:3px;background:#FFF12D;margin-bottom:16px;}
    .intro-sub{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);letter-spacing:0.08em;max-width:400px;line-height:1.7;}
    .intro-logo-phase{position:absolute;inset:0;z-index:7;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;transition:opacity 0.8s ease;}
    .intro-logo-e{width:clamp(120px,20vw,200px);height:auto;transition:opacity 0.8s ease,transform 0.8s ease;}
    .intro-slogan{font-family:'Russo One',sans-serif;font-size:clamp(14px,2vw,18px);color:rgba(255,255,255,0.6);letter-spacing:0.15em;text-transform:uppercase;margin-top:24px;text-align:center;transition:opacity 0.8s ease;}
    .intro-skip{position:absolute;top:24px;right:24px;z-index:20;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.2em;color:rgba(255,255,255,0.3);cursor:pointer;text-transform:uppercase;background:transparent;border:none;padding:8px 16px;transition:color 0.2s;}
    .intro-skip:hover{color:#FFF12D;}
    .intro-progress{position:absolute;bottom:0;left:0;height:2px;background:#FFF12D;z-index:20;opacity:0.5;transition:width 0.1s linear;}
    @media(max-width:768px){.intro-text{bottom:20%;left:5%;} .intro-title1,.intro-title2{font-size:clamp(40px,10vw,72px);}}
  `;

  const totalDuration = 13500;
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const pct = Math.min((Date.now() - start) / totalDuration * 100, 100);
      setProgress(pct);
      if (pct >= 100) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="intro-wrap">
      <style>{css}</style>

      {/* Videos */}
      {VIDEOS.map((src, i) => (
        <video
          key={i}
          ref={videoRefs[i]}
          className="intro-video"
          src={src}
          muted
          playsInline
          preload="auto"
          style={{ zIndex: 2 + i }}
        />
      ))}

      {/* Cover VEO watermark — bottom right */}
      <div className="intro-veo-cover" style={{ zIndex: 8 }}>
        <img
          src={LOGO_E}
          alt="E"
          style={{ width: '40px', height: 'auto', opacity: 0.7, margin: '10px auto', display: 'block' }}
        />
      </div>

      {/* Text overlay — appears during video 2 */}
      {phase === 'videos' && (
        <div
          className="intro-text"
          style={{
            opacity: textVisible ? 1 : 0,
            transform: textVisible ? 'translateY(0)' : 'translateY(24px)',
          }}
        >
          <div className="intro-eyebrow">// FILTVEX TECHNOLOGY LLC</div>
          <h1 className="intro-title1">ASSET</h1>
          <h1 className="intro-title2">PROTECTION.</h1>
          <div className="intro-line" />
          <p className="intro-sub">Industrial filtration technology engineered for the machines that cannot stop.</p>
        </div>
      )}

      {/* Logo phase */}
      {phase === 'logo' && (
        <div
          className="intro-logo-phase"
          style={{ opacity: overlayOut ? 0 : 1 }}
        >
          <img
            className="intro-logo-e"
            src={LOGO_E}
            alt="ELIMFILTERS"
            style={{
              opacity: logoVisible ? 1 : 0,
              transform: logoVisible ? 'scale(1)' : 'scale(0.75)',
            }}
          />
          <div
            className="intro-slogan"
            style={{ opacity: sloganVisible ? 1 : 0 }}
          >
            We develop technology to protect your assets.
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="intro-progress" style={{ width: `${progress}%` }} />

      {/* Skip */}
      <button
        className="intro-skip"
        onClick={() => { if (onComplete) onComplete(); }}
      >
        SKIP INTRO
      </button>
    </div>
  );
}
