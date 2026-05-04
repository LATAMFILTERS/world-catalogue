'use client';
import { useEffect, useState } from 'react';

export default function Intro({ onComplete }) {
  const [done, setDone] = useState(false);
  const [phase, setPhase] = useState('mechanic');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('logo'), 9000);
    const t2 = setTimeout(() => {
      setDone(true);
      onComplete();
    }, 13000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (done) return null;

  const css = `
    .intro-wrap{position:fixed;inset:0;z-index:9999;background:#000;overflow:hidden;}
    .intro-mechanic-wrap{position:absolute;inset:0;opacity:1;transition:opacity 0.8s ease;}
    .intro-mechanic-wrap.hidden{opacity:0;}
    .intro-mechanic{position:absolute;bottom:0;left:-20%;height:95%;width:auto;animation:iSlideRight 8s cubic-bezier(0.25,0.1,0.1,1.0) forwards;}
    .intro-vignette{position:absolute;inset:0;background:radial-gradient(ellipse at 35% 50%,rgba(0,0,0,0) 30%,rgba(0,0,0,0.85) 100%);}
    .intro-ov{position:absolute;inset:0;background:linear-gradient(to right,rgba(0,0,0,0.1) 20%,rgba(0,0,0,0.96) 60%);}
    .intro-content{position:absolute;bottom:10%;right:6%;text-align:right;}
    .intro-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.3em;color:#FFF12D;text-transform:uppercase;opacity:0;margin-bottom:20px;animation:iFadeIn 1s ease forwards 3s;}
    .intro-asset{font-family:'Russo One',sans-serif;font-size:clamp(56px,9vw,108px);color:#FFF12D;text-transform:uppercase;line-height:0.88;opacity:0;transform:translateY(40px);animation:iSlideUp 0.7s ease forwards 4s;}
    .intro-protection{font-family:'Russo One',sans-serif;font-size:clamp(56px,9vw,108px);color:#fff;text-transform:uppercase;line-height:0.88;opacity:0;transform:translateY(40px);animation:iSlideUp 0.7s ease forwards 5.5s;}
    .intro-line-wrap{display:flex;justify-content:flex-end;}
    .intro-line{width:0;height:3px;background:#FFF12D;margin-top:24px;animation:iDrawLine 0.8s ease forwards 6.5s;}
    .intro-logo-wrap{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;opacity:0;transition:opacity 1.2s ease;}
    .intro-logo-wrap.visible{opacity:1;}
    .intro-logo{height:420px;width:auto;animation:iZoomIn 1.5s cubic-bezier(0.34,1.2,0.64,1) forwards;}
    .intro-slogan{font-family:'Russo One',sans-serif;font-size:clamp(16px,2vw,22px);color:rgba(255,255,255,0.85);letter-spacing:0.1em;text-align:center;opacity:0;animation:iFadeIn 1s ease forwards 1.5s;}
    .intro-fadeout{position:absolute;inset:0;background:#000;opacity:0;pointer-events:none;animation:iFadeOut 0.8s ease forwards 12s;}
    @keyframes iSlideRight{from{left:-20%;opacity:0;}to{left:2%;opacity:1;}}
    @keyframes iFadeIn{from{opacity:0;}to{opacity:1;}}
    @keyframes iSlideUp{from{opacity:0;transform:translateY(40px);}to{opacity:1;transform:translateY(0);}}
    @keyframes iDrawLine{from{width:0;}to{width:240px;}}
    @keyframes iZoomIn{from{opacity:0;transform:scale(0.75);}to{opacity:1;transform:scale(1);}}
    @keyframes iFadeOut{from{opacity:0;}to{opacity:1;}}
  `;

  return (
    <>
      <style>{css}</style>
      <div className="intro-wrap">
        <div className={`intro-mechanic-wrap ${phase === 'logo' ? 'hidden' : ''}`}>
          <img className="intro-mechanic" src="https://elimfilters.com/wp-content/uploads/2026/05/Gemini_Generated_Image_rw850rw850rw850r.png" alt="" />
          <div className="intro-vignette" />
          <div className="intro-ov" />
          <div className="intro-content">
            <div className="intro-eyebrow">// ELIMFILTERS | ASSET PROTECTION SYSTEMS</div>
            <div className="intro-asset">ASSET</div>
            <div className="intro-protection">PROTECTION</div>
            <div className="intro-line-wrap"><div className="intro-line" /></div>
          </div>
        </div>
        <div className={`intro-logo-wrap ${phase === 'logo' ? 'visible' : ''}`}>
          <img className="intro-logo" src="https://elimfilters.com/wp-content/uploads/2025/11/AE6A9C09-F12F-4AA4-8021-EAF6F448860E.webp" alt="ELIMFILTERS" />
          <div className="intro-slogan">We develop technology to protect your assets.</div>
        </div>
        <div className="intro-fadeout" />
      </div>
    </>
  );
}