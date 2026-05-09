'use client';
import { useEffect, useRef, useState } from 'react';

const VIDEOS = [
  'https://cdn.elimfilters.com/Slow_macro_push-in_particles_202605060145.mp4',
  'https://cdn.elimfilters.com/maquinaria.mp4',
  'https://elimfilters.com/wp-content/uploads/2026/05/p554004.mp4',
];

const WP = 'https://elimfilters.com/wp-content/uploads';
const LOGO_E = `${WP}/2025/11/AE6A9C09-F12F-4AA4-8021-EAF6F448860E.webp`;

export default function Intro({ onComplete }) {
  const videoRefs = [useRef(null), useRef(null), useRef(null)];
  const [current, setCurrent] = useState(0);
  const [phase, setPhase] = useState('videos');
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

  const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  const fadeVideo = (videoEl, from, to, duration, cb) => {
    if (!videoEl) return;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = easeInOutCubic(progress);
      videoEl.style.opacity = from + (to - from) * eased;
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
    fadeVideo(videoEl, 0, 1, 800, null);
  };

  const fadeOutAndNext = (index) => {
    const videoEl = videoRefs[index]?.current;
    if (!videoEl) return;
    fadeVideo(videoEl, 1, 0, 800, () => {
      if (index < VIDEOS.length - 1) {
        setCurrent(index + 1);
        playVideo(index + 1);
        if (index === 0) setTextVisible(true);
      } else {
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
              }, 1200);
            }, 2400);
          }, 600);
        }, 200);
      }
    });
  };

  useEffect(() => {
    addTimeout(() => { playVideo(0); }, 100);
    addTimeout(() => fadeOutAndNext(0), 4000);
    addTimeout(() => fadeOutAndNext(1), 8800);
    addTimeout(() => fadeOutAndNext(2), 13600);

    return () => {
      timeoutRefs.current.forEach(clearTimeout);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      videoRefs.forEach(ref => { if (ref.current) ref.current.pause(); });
    };
  }, []);

  const css = `
    .intro-wrap{position:fixed;inset:0;z-index:9999;background:#000;overflow:hidden;}
    .intro-video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;}
    .intro-video-scaled{transform:scale(0.88) translateX(4%) translateY(3%);}
    .intro-text{position:absolute;bottom:15%;left:6%;z-index:6;transition:opacity 0.8s cubic-bezier(0.16,1,0.3,1),transform 0.8s cubic-bezier(0.16,1,0.3,1);}
    .intro-eyebrow{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.35em;color:rgba(255,241,45,0.7);text-transform:uppercase;margin-bottom:16px;}
    .intro-title1{font-family:'Russo One',sans-serif;font-size:clamp(52px,8vw,100px);color:#fff;text-transform:uppercase;line-height:0.9;margin:0;}
    .intro-title2{font-family:'Russo One',sans-serif;font-size:clamp(52px,8vw,100px);color:#FFF12D;text-transform:uppercase;line-height:0.9;margin:0 0 16px;}
    .intro-line{width:120px;height:3px;background:#FFF12D;margin-bottom:16px;}
    .intro-sub{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);letter-spacing:0.08em;max-width:400px;line-height:1.7;}
    .intro-logo-phase{position:absolute;inset:0;z-index:7;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;transition:opacity 1.2s cubic-bezier(0.16,1,0.3,1);}
    .intro-logo-e{width:clamp(120px,20vw,200px);height:auto;transition:opacity 1.2s cubic-bezier(0.25,0.46,0.45,0.94),transform 1.2s cubic-bezier(0.25,0.46,0.45,0.94);}
    .intro-slogan{font-family:'Russo One',sans-serif;font-size:clamp(14px,2vw,18px);color:rgba(255,255,255,0.6);letter-spacing:0.15em;text-transform:uppercase;margin-top:32px;text-align:center;transition:opacity 1.2s cubic-bezier(0.25,0.46,0.45,0.94);max-width:500px;line-height:1.8;}
    .intro-skip{position:absolute;top:24px;right:24px;z-index:20;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.2em;color:rgba(255,255,255,0.3);cursor:pointer;text-transform:uppercase;background:transparent;border:none;padding:8px 16px;transition:color 0.2s;}
    .intro-skip:hover{color:#FFF12D;}
    .intro-progress{position:absolute;bottom:0;left:0;height:2px;background:#FFF12D;z-index:20;opacity:0.5;transition:width 0.1s linear;}
    @media(max-width:768px){.intro-text{bottom:20%;left:5%;} .intro-title1,.intro-title2{font-size:clamp(40px,10vw,72px);}}
  `;

  const totalDuration = 15600;
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
      {VIDEOS.map((src, i) => (
        <video key={i} ref={videoRefs[i]} className={`intro-video ${i === 2 ? 'intro-video-scaled' : ''}`} src={src} muted playsInline preload="auto" style={{ zIndex: 2 + i }} />
      ))}
      {phase === 'videos' && (
        <div className="intro-text" style={{ opacity: textVisible ? 1 : 0, transform: textVisible ? 'translateY(0)' : 'translateY(24px)' }}>
          <div className="intro-eyebrow">// FILTVEX TECHNOLOGY LLC</div>
          <h1 className="intro-title1">ASSET</h1>
          <h1 className="intro-title2">PROTECTION.</h1>
          <div className="intro-line" />
          <p className="intro-sub">Industrial filtration technology engineered for the machines that cannot stop.</p>
        </div>
      )}
      {phase === 'logo' && (
        <div className="intro-logo-phase" style={{ opacity: overlayOut ? 0 : 1 }}>
          <img className="intro-logo-e" src={LOGO_E} alt="ELIMFILTERS" style={{ opacity: logoVisible ? 1 : 0, transform: logoVisible ? 'scale(1)' : 'scale(0.85)' }} />
          <div className="intro-slogan" style={{ opacity: sloganVisible ? 1 : 0, transform: sloganVisible ? 'translateY(0)' : 'translateY(20px)' }}>
            We develop technology to protect your assets.
          </div>
        </div>
      )}
      <div className="intro-progress" style={{ width: `${progress}%` }} />
      <button className="intro-skip" onClick={() => { if (onComplete) onComplete(); }}>SKIP INTRO</button>
    </div>
  );
}
