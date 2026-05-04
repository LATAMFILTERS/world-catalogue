'use client';
import { useEffect, useState } from 'react';

export default function Intro({ onComplete }) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setDone(true);
      onComplete();
    }, 8000);
    return () => clearTimeout(t);
  }, []);

  if (done) return null;

  const css = `
    .intro-wrap{position:fixed;inset:0;z-index:9999;background:#000;overflow:hidden;}
    .intro-bg{position:absolute;inset:0;background:url('https://elimfilters.com/wp-content/uploads/2026/02/Gemini_Generated_Image_8slfcz8slfcz8slf.png') left 60%/cover no-repeat;animation:iKenburns 8s ease-out forwards;transform-origin:left center;}
    .intro-ov{position:absolute;inset:0;background:linear-gradient(to right,rgba(0,0,0,0.2) 0%,rgba(0,0,0,0.5) 50%,rgba(0,0,0,0.95) 100%);}
    .intro-top{position:absolute;top:0;left:0;right:0;height:35%;background:linear-gradient(to bottom,rgba(0,0,0,1) 0%,rgba(0,0,0,0) 100%);}
    .intro-content{position:absolute;bottom:10%;right:6%;text-align:right;}
    .intro-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.3em;color:#FFF12D;text-transform:uppercase;opacity:0;margin-bottom:20px;animation:iFadeIn 1s ease forwards 3s;}
    .intro-asset{font-family:'Russo One',sans-serif;font-size:clamp(56px,9vw,108px);color:#FFF12D;text-transform:uppercase;line-height:0.88;opacity:0;transform:translateY(40px);animation:iSlideUp 0.7s ease forwards 4s;}
    .intro-protection{font-family:'Russo One',sans-serif;font-size:clamp(56px,9vw,108px);color:#fff;text-transform:uppercase;line-height:0.88;opacity:0;transform:translateY(40px);animation:iSlideUp 0.7s ease forwards 5s;}
    .intro-line-wrap{display:flex;justify-content:flex-end;}
    .intro-line{width:0;height:3px;background:#FFF12D;margin-top:24px;animation:iDrawLine 0.6s ease forwards 6s;}
    .intro-fadeout{position:absolute;inset:0;background:#000;opacity:0;pointer-events:none;animation:iFadeOut 1s ease forwards 7s;}
    @keyframes iKenburns{from{transform:scale(1.12) translateX(-5%);}to{transform:scale(1.0) translateX(0%);}}
    @keyframes iFadeIn{from{opacity:0;}to{opacity:1;}}
    @keyframes iSlideUp{from{opacity:0;transform:translateY(40px);}to{opacity:1;transform:translateY(0);}}
    @keyframes iDrawLine{from{width:0;}to{width:100px;}}
    @keyframes iFadeOut{from{opacity:0;}to{opacity:1;}}
  `;

  return (
    <>
      <style>{css}</style>
      <div className="intro-wrap">
        <div className="intro-bg" />
        <div className="intro-ov" />
        <div className="intro-top" />
        <div className="intro-content">
          <div className="intro-eyebrow">// ELIMFILTERS | ASSET PROTECTION SYSTEMS</div>
          <div className="intro-asset">ASSET</div>
          <div className="intro-protection">PROTECTION</div>
          <div className="intro-line-wrap"><div className="intro-line" /></div>
        </div>
        <div className="intro-fadeout" />
      </div>
    </>
  );
}