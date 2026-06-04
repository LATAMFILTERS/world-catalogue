'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';

// ─── CSS injected once ────────────────────────────────────────────────────────
const CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { background: #080808; }

  .reveal {
    opacity: 0;
    transform: translateY(36px);
    transition: opacity 0.75s cubic-bezier(0.16,1,0.3,1), transform 0.75s cubic-bezier(0.16,1,0.3,1);
  }
  .reveal.visible { opacity: 1; transform: translateY(0); }
  .reveal-left {
    opacity: 0;
    transform: translateX(-32px);
    transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1);
  }
  .reveal-left.visible { opacity: 1; transform: translateX(0); }
  .reveal-right {
    opacity: 0;
    transform: translateX(32px);
    transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1);
  }
  .reveal-right.visible { opacity: 1; transform: translateX(0); }

  .stagger-1 { transition-delay: 0.05s; }
  .stagger-2 { transition-delay: 0.12s; }
  .stagger-3 { transition-delay: 0.19s; }
  .stagger-4 { transition-delay: 0.26s; }
  .stagger-5 { transition-delay: 0.33s; }
  .stagger-6 { transition-delay: 0.40s; }

  .bar-fill {
    width: 0%;
    transition: width 1.2s cubic-bezier(0.16,1,0.3,1) 0.3s;
  }
  .bar-fill.visible { width: var(--bar-w); }

  .ind-card {
    background: #111;
    border: 1px solid rgba(255,255,255,0.07);
    transition: background 0.25s, border-color 0.25s, transform 0.25s;
  }
  .ind-card:hover {
    background: #181818;
    border-color: rgba(255,241,45,0.2);
    transform: translateY(-3px);
  }

  .tech-btn {
    transition: all 0.2s;
    cursor: pointer;
    border: none;
    text-align: left;
    width: 100%;
  }

  .scroll-progress {
    position: fixed;
    top: 52px;
    left: 0;
    height: 2px;
    background: #FFF12D;
    z-index: 99;
    transition: width 0.1s linear;
  }

  .hero-text-swap {
    display: inline-block;
    overflow: hidden;
    vertical-align: bottom;
  }
  .hero-text-inner {
    display: block;
    animation: textCycle 9s steps(1) infinite;
  }
  @keyframes textCycle {
    0%   { transform: translateY(0%); opacity: 1; }
    28%  { transform: translateY(0%); opacity: 1; }
    33%  { transform: translateY(-100%); opacity: 0; }
    34%  { transform: translateY(100%); opacity: 0; }
    38%  { transform: translateY(0%); opacity: 1; }
    61%  { transform: translateY(0%); opacity: 1; }
    66%  { transform: translateY(-100%); opacity: 0; }
    67%  { transform: translateY(100%); opacity: 0; }
    71%  { transform: translateY(0%); opacity: 1; }
    99%  { transform: translateY(0%); opacity: 1; }
    100% { transform: translateY(-100%); opacity: 0; }
  }
  .hero-text-inner span {
    display: block;
  }

  @keyframes pulse-dot {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.2; }
  }
  .live-dot {
    display: inline-block;
    width: 6px; height: 6px;
    background: #22c55e;
    border-radius: 50%;
    animation: pulse-dot 1.8s ease-in-out infinite;
    vertical-align: middle;
    margin-right: 6px;
  }

  input[type=range] {
    -webkit-appearance: none;
    height: 3px;
    background: rgba(255,255,255,0.1);
    border-radius: 2px;
    outline: none;
    width: 100%;
    cursor: pointer;
  }
  input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px; height: 16px;
    background: #FFF12D;
    border-radius: 50%;
    cursor: pointer;
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #080808; }
  ::-webkit-scrollbar-thumb { background: rgba(255,241,45,0.15); border-radius: 2px; }
`;

// ─── Tokens ───────────────────────────────────────────────────────────────────
const G = '#FFF12D';
const G2 = 'rgba(255,241,45,0.10)';
const G3 = 'rgba(255,241,45,0.05)';
const GB = 'rgba(255,241,45,0.18)';
const W6 = 'rgba(255,255,255,0.58)';
const W3 = 'rgba(255,255,255,0.28)';
const W1 = 'rgba(255,255,255,0.07)';
const S1 = '#080808';
const S2 = '#0f0f0f';
const S3 = '#161616';

// ─── Scroll reveal hook ───────────────────────────────────────────────────────
function useReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .bar-fill');
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  });
}

// ─── Scroll progress ──────────────────────────────────────────────────────────
function ScrollProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      setPct((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return <div className="scroll-progress" style={{ width: `${pct}%` }} />;
}

// ─── Particle canvas ──────────────────────────────────────────────────────────
function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d')!;
    let raf: number;
    type P = { x:number;y:number;vx:number;vy:number;r:number;a:number };
    let pts: P[] = [];

    function init() {
      c!.width = c!.offsetWidth; c!.height = c!.offsetHeight;
      pts = Array.from({ length: 70 }, () => ({
        x: Math.random() * c!.width, y: Math.random() * c!.height,
        vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.2 + 0.4, a: Math.random() * 0.35 + 0.08,
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, c!.width, c!.height);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = c!.width; if (p.x > c!.width) p.x = 0;
        if (p.y < 0) p.y = c!.height; if (p.y > c!.height) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,241,45,${p.a})`; ctx.fill();
      });
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
          if (d < 110) {
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(255,241,45,${0.055 * (1 - d / 110)})`;
            ctx.lineWidth = 0.4; ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    }
    init(); window.addEventListener('resize', init); draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', init); };
  }, []);
  return <canvas ref={ref} style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none' }} />;
}

// ─── Counter on scroll ────────────────────────────────────────────────────────
function Counter({ to, suffix='', decimals=0 }: { to:number; suffix?:string; decimals?:number }) {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; obs.disconnect();
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - t0) / 1800, 1);
        setV(parseFloat(((1 - Math.pow(1 - p, 3)) * to).toFixed(decimals)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [to, decimals]);
  return <span ref={ref}>{v.toFixed(decimals)}{suffix}</span>;
}

// ─── Shared layout ────────────────────────────────────────────────────────────
function Wrap({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ maxWidth:1160, margin:'0 auto', padding:'0 clamp(1.5rem,4vw,3rem)', ...style }}>{children}</div>;
}
function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.6rem', letterSpacing:'0.22em',
    color: G, opacity:0.72, marginBottom:'1.25rem', textTransform:'uppercase' }}>▸ {children}</p>;
}
function H2({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <h2 style={{ fontFamily:'Outfit, sans-serif', fontSize:'clamp(2.4rem,5vw,4rem)',
    fontWeight:700, letterSpacing:'-0.035em', lineHeight:1.03, color:'#fff', ...style }}>{children}</h2>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 01 — HERO
// ═══════════════════════════════════════════════════════════════════════════════
function Hero() {
  return (
    <section id="hero" style={{ position:'relative', minHeight:'100vh',
      display:'flex', alignItems:'center', overflow:'hidden', background: S1 }}>
      <ParticleCanvas />
      <div style={{ position:'absolute', inset:0,
        background:'radial-gradient(ellipse 70% 55% at 55% 45%, rgba(255,241,45,0.032) 0%, transparent 65%)' }} />

      {/* Large background number */}
      <div style={{ position:'absolute', right:'-2%', top:'50%', transform:'translateY(-50%)',
        fontFamily:'Outfit, sans-serif', fontSize:'clamp(18rem,28vw,36rem)', fontWeight:700,
        color:'rgba(255,241,45,0.022)', lineHeight:1, userSelect:'none', pointerEvents:'none',
        letterSpacing:'-0.06em' }}>01</div>

      <Wrap style={{ position:'relative', zIndex:2, paddingTop:'clamp(6rem,12vw,9rem)', paddingBottom:'5rem' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 430px', gap:'5rem', alignItems:'center' }}>

          {/* ── Left ── */}
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:'2.5rem' }}>
              <span className="live-dot" />
              <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.62rem',
                letterSpacing:'0.18em', color: W3 }}>WORLD CATALOGUE · ACTIVE</span>
            </div>

            <h1 style={{ fontFamily:'Outfit, sans-serif',
              fontSize:'clamp(3rem,6.5vw,5.2rem)', fontWeight:700,
              letterSpacing:'-0.04em', lineHeight:1.0, marginBottom:'2rem', color:'#fff' }}>
              Filtration for<br />
              <span style={{ color: G }} className="hero-text-swap">
                <span className="hero-text-inner">
                  <span>Mining.</span>
                  <span>Marine.</span>
                  <span>Agriculture.</span>
                </span>
              </span>
              <br />
              <span style={{ color:'rgba(255,255,255,0.45)' }}>Zero Compromise.</span>
            </h1>

            <p style={{ fontFamily:'Inter, sans-serif', fontSize:'1.05rem', color: W6,
              lineHeight:1.8, maxWidth:510, marginBottom:'3rem' }}>
              ELIMFILTERS® engineers asset-protection filtration for the most demanding
              industrial environments on earth — validated against ISO 16889, ISO 4406,
              and ISO 5011.
            </p>

            <div style={{ display:'flex', gap:'0.85rem', flexWrap:'wrap', marginBottom:'4rem' }}>
              <Link href="/distributor-application" style={{
                padding:'14px 34px', background: G, color:'#000',
                fontFamily:'Outfit, sans-serif', fontWeight:700, fontSize:'0.85rem',
                letterSpacing:'0.09em', borderRadius:3, textDecoration:'none' }}>
                BECOME A DISTRIBUTOR
              </Link>
              <Link href="https://part-search.elimfilters.com" style={{
                padding:'14px 34px', color: G, background:'transparent',
                fontFamily:'Outfit, sans-serif', fontWeight:700, fontSize:'0.85rem',
                letterSpacing:'0.09em', borderRadius:3, textDecoration:'none',
                border:`1.5px solid ${GB}` }}>
                PART SEARCH →
              </Link>
            </div>

            {/* Standards strip */}
            <div style={{ display:'flex', gap:'1.5rem', flexWrap:'wrap' }}>
              {['ISO 16889','ISO 4406','ISO 5011','SAE J1211','ASTM D6304'].map(s => (
                <span key={s} style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.62rem',
                  letterSpacing:'0.1em', color: W3, padding:'4px 10px',
                  border:`1px solid ${W1}`, borderRadius:2 }}>{s}</span>
              ))}
            </div>
          </div>

          {/* ── Right — technical spec card ── */}
          <div style={{ background: S2, border:`1px solid ${GB}`, borderRadius:8,
            overflow:'hidden', boxShadow:`0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px ${G2}` }}>

            <div style={{ background:'linear-gradient(135deg, #161616, #111)',
              borderBottom:`1px solid ${W1}`, padding:'1.1rem 1.5rem',
              display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.72rem', color: G, fontWeight:600 }}>
                NANOCORE-H1000
              </span>
              <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.58rem',
                color:'rgba(34,197,94,0.9)', padding:'3px 9px',
                border:'1px solid rgba(34,197,94,0.22)', borderRadius:2,
                background:'rgba(34,197,94,0.07)' }}>ACTIVE SKU</span>
            </div>

            <div style={{ padding:'1.5rem' }}>
              <p style={{ fontFamily:'Outfit, sans-serif', fontSize:'1rem',
                fontWeight:700, color:'#fff', marginBottom:'0.3rem' }}>
                High-Pressure Hydraulic Element
              </p>
              <p style={{ fontFamily:'Inter, sans-serif', fontSize:'0.78rem',
                color: W6, marginBottom:'1.5rem' }}>
                NANOCORE glass-fibre · Wire mesh support structure
              </p>

              {[
                ['Efficiency',   'β₁₀(c) = 1000'],
                ['Absolute Rating', '1 µm'],
                ['Collapse ΔP',  '350 bar'],
                ['Flow Rate',    'Up to 400 L/min'],
                ['Temp Range',   '−30°C to +120°C'],
                ['Standard',     'ISO 16889'],
              ].map(([k, v]) => (
                <div key={k} style={{ display:'flex', justifyContent:'space-between',
                  padding:'7px 0', borderBottom:`1px solid ${W1}` }}>
                  <span style={{ fontFamily:'Inter, sans-serif', fontSize:'0.77rem', color: W6 }}>{k}</span>
                  <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.77rem',
                    color:'#fff', fontWeight:600 }}>{v}</span>
                </div>
              ))}

              <div style={{ marginTop:'1.25rem', padding:'0.85rem 1rem',
                background: G3, border:`1px solid ${GB}`, borderRadius:4 }}>
                <p style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.62rem',
                  color: W3, marginBottom:4 }}>OEM CROSS-REFERENCES</p>
                <p style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.78rem',
                  color: G, fontWeight:600 }}>P550048 · LF3000 · W719/30 · +340 more</p>
              </div>
            </div>
          </div>
        </div>

        {/* KPI bar */}
        <div style={{ marginTop:'5rem', display:'grid', gridTemplateColumns:'repeat(4,1fr)',
          background: S2, border:`1px solid ${W1}`, borderRadius:6, overflow:'hidden', gap:1 }}>
          {[
            { n:99.9, s:'%', d:1, label:'Media Filtration Efficiency' },
            { n:2000, s:'+', d:0, label:'Active SKUs in Catalogue' },
            { n:4000, s:'h', d:0, label:'Proven Service Life' },
            { n:45,   s:'%', d:0, label:'Extended Engine Life' },
          ].map((k, i) => (
            <div key={i} style={{ background: S1, padding:'2rem 1.5rem', textAlign:'center',
              borderRight: i < 3 ? `1px solid ${W1}` : 'none' }}>
              <div style={{ fontFamily:'Outfit, sans-serif',
                fontSize:'clamp(2rem,3.5vw,2.8rem)', fontWeight:700, color: G, lineHeight:1 }}>
                <Counter to={k.n} suffix={k.s} decimals={k.d} />
              </div>
              <div style={{ fontFamily:'Inter, sans-serif', fontSize:'0.72rem',
                color: W6, marginTop:'0.5rem', lineHeight:1.4 }}>{k.label}</div>
            </div>
          ))}
        </div>
      </Wrap>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 02 — COST OF CONTAMINATION
// ═══════════════════════════════════════════════════════════════════════════════
function Contamination() {
  useReveal();
  const systems = [
    { code:'F-01', name:'Hydraulic Circuit', particle:'≥ 10 µm',
      damage:'Valve silting · Seal erosion · Pump cavitation',
      cost:'$38,000', hours:'72 hrs', sev:'rgba(245,158,11,0.85)' },
    { code:'F-02', name:'Lube Oil Circuit', particle:'≥ 5 µm',
      damage:'Bearing fatigue · Journal wear · Oil breakdown',
      cost:'$62,000', hours:'5–14 days', sev:'rgba(239,68,68,0.85)' },
    { code:'F-03', name:'Fuel Injection', particle:'≥ 4 µm',
      damage:'Injector erosion · Spray distortion · ECU fault',
      cost:'$24,000', hours:'36 hrs', sev:'rgba(245,158,11,0.85)' },
    { code:'F-04', name:'Air Intake', particle:'≥ 20 µm',
      damage:'Turbo blade erosion · Cylinder scoring · Piston wear',
      cost:'$91,000', hours:'7–21 days', sev:'rgba(239,68,68,0.85)' },
  ];

  return (
    <section id="contamination" style={{ background: S2, padding:'8rem 0', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', right:'-3%', top:'50%', transform:'translateY(-50%)',
        fontFamily:'Outfit, sans-serif', fontSize:'clamp(16rem,25vw,32rem)', fontWeight:700,
        color:'rgba(255,255,255,0.018)', lineHeight:1, userSelect:'none', letterSpacing:'-0.06em' }}>02</div>

      <Wrap style={{ position:'relative', zIndex:1 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'5rem', alignItems:'start' }}>

          {/* Left — sticky brief */}
          <div className="reveal-left" style={{ position:'sticky', top:'6rem' }}>
            <Eyebrow>THE COST OF CONTAMINATION</Eyebrow>
            <H2>One Particle.<br /><span style={{ color: G }}>Millions in<br />Lost Production.</span></H2>
            <p style={{ fontFamily:'Inter, sans-serif', fontSize:'1rem', color: W6,
              lineHeight:1.8, marginTop:'1.5rem', maxWidth:420 }}>
              Contamination-induced failure is the leading cause of unplanned downtime
              in industrial operations. Sub-10µm particles — invisible to the eye —
              trigger progressive damage that compounds over thousands of hours.
            </p>

            {/* 70% stat */}
            <div style={{ marginTop:'2.5rem', padding:'1.5rem',
              background: S1, borderLeft:`3px solid rgba(239,68,68,0.65)`, borderRadius:'0 4px 4px 0',
              border:`1px solid rgba(239,68,68,0.15)`, borderLeft:`3px solid rgba(239,68,68,0.65)` }}>
              <p style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.58rem',
                color:'rgba(239,68,68,0.7)', letterSpacing:'0.15em', marginBottom:'0.6rem' }}>
                INDUSTRY DATA — NFPA / ISO 4406
              </p>
              <p style={{ fontFamily:'Outfit, sans-serif', fontSize:'1.7rem',
                fontWeight:700, color:'#fff', lineHeight:1.2 }}>
                70% of hydraulic system failures are contamination-related.
              </p>
            </div>

            <div style={{ marginTop:'1.5rem', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
              {[
                ['$180k+','Average annual contamination loss per industrial fleet'],
                ['3.2×',  'More downtime with substandard filtration media'],
              ].map(([n, l]) => (
                <div key={n} style={{ padding:'1.25rem', background: S1, border:`1px solid ${W1}`, borderRadius:4 }}>
                  <div style={{ fontFamily:'Outfit, sans-serif', fontSize:'2rem', fontWeight:700, color: G }}>{n}</div>
                  <div style={{ fontFamily:'Inter, sans-serif', fontSize:'0.72rem', color: W6, marginTop:5, lineHeight:1.4 }}>{l}</div>
                </div>
              ))}
            </div>

            {/* Particle scale */}
            <div style={{ marginTop:'2rem' }}>
              <p style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.58rem',
                letterSpacing:'0.14em', color: W3, marginBottom:'0.75rem' }}>
                PARTICLE SIZE — DAMAGE THRESHOLD
              </p>
              {[
                { s:'100 µm', label:'Visible to naked eye', w:100, c:'rgba(156,163,175,0.5)' },
                { s:' 40 µm', label:'Hydraulic damage zone', w:75,  c:'rgba(245,158,11,0.6)' },
                { s:' 10 µm', label:'Critical wear range',  w:52,  c:'rgba(239,68,68,0.65)' },
                { s:'  4 µm', label:'Valve silting',        w:34,  c:'rgba(239,68,68,0.85)' },
                { s:'  1 µm', label:'NANOCORE capture',     w:18,  c: G },
              ].map((p, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.5rem' }}>
                  <div style={{ background:'#161616', border:`1px solid ${W1}`,
                    borderRadius:2, height:28, width:200, flexShrink:0, overflow:'hidden', position:'relative' }}>
                    <div className="bar-fill visible" style={{
                      height:'100%', background: p.c, opacity:0.9,
                      '--bar-w': `${p.w}%`, width:`${p.w}%`,
                    } as React.CSSProperties} />
                  </div>
                  <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.68rem',
                    color: p.c, minWidth:48 }}>{p.s}</span>
                  <span style={{ fontFamily:'Inter, sans-serif', fontSize:'0.7rem', color: W3 }}>{p.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — failure cards */}
          <div style={{ display:'grid', gap:'1rem' }}>
            {systems.map((f, i) => (
              <div key={i} className={`reveal stagger-${i + 1}`}
                style={{ background: S1, border:`1px solid ${W1}`, borderRadius:6, overflow:'hidden' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr auto',
                  alignItems:'center', gap:'1rem',
                  padding:'1.1rem 1.4rem', borderBottom:`1px solid ${W1}` }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.85rem' }}>
                    <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.6rem',
                      color: W3, minWidth:38 }}>{f.code}</span>
                    <span style={{ fontFamily:'Outfit, sans-serif', fontSize:'1rem',
                      fontWeight:700, color:'#fff' }}>{f.name}</span>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontFamily:'Outfit, sans-serif', fontSize:'1.3rem',
                      fontWeight:700, color: f.sev }}>{f.cost}</div>
                    <div style={{ fontFamily:'Inter, sans-serif', fontSize:'0.65rem', color: W3 }}>avg repair</div>
                  </div>
                </div>
                <div style={{ padding:'0.9rem 1.4rem', display:'grid',
                  gridTemplateColumns:'repeat(3,1fr)', gap:'1rem' }}>
                  {[
                    ['TRIGGER', f.particle, f.sev],
                    ['DOWNTIME', f.hours, '#fff'],
                    ['MODE', f.damage, W6],
                  ].map(([k, v, c]) => (
                    <div key={k as string}>
                      <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.55rem',
                        color: W3, letterSpacing:'0.12em', marginBottom:4 }}>{k}</div>
                      <div style={{ fontFamily: k === 'MODE' ? 'Inter, sans-serif' : 'JetBrains Mono, monospace',
                        fontSize:'0.75rem', color: c as string, fontWeight:600, lineHeight:1.4 }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Wrap>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 03 — TECHNOLOGY
// ═══════════════════════════════════════════════════════════════════════════════
function Technology() {
  const [active, setActive] = useState(0);
  useReveal();

  const techs = [
    { id:'NANOCORE', tag:'Electrospun PTFE Nanofiber', color: G,
      beta:'β₁(c) = 1000', micron:'1 µm', collapse:'350 bar', temp:'+200°C',
      std:'ISO 16889', apps:['Lube Oil', 'Turbines', 'Precision Hydraulics'], bar:100,
      desc:'Absolute filtration at 1µm. Designed for turbine lube circuits and precision hydraulic systems where ISO 4406 code 14/12/9 is a contractual requirement. Performance that commodity glass-fibre media cannot physically reach.' },
    { id:'MACROCORE', tag:'Borosilicate Glass + Wire Mesh', color:'rgba(99,179,237,0.9)',
      beta:'β₁₀(c) = 1000', micron:'10 µm', collapse:'350 bar', temp:'+120°C',
      std:'ISO 16889', apps:['Mobile Hydraulics', 'Construction', 'Mining'], bar:92,
      desc:'Wire-mesh reinforced glass fibre for 350-bar hydraulic circuits. Standard on open-pit mining shovels, underground loaders, and construction plant where filter collapse causes immediate and catastrophic actuator failure.' },
    { id:'SYNTEPORE', tag:'Hydrophobic Nanofiber Membrane', color:'rgba(192,132,252,0.9)',
      beta:'β₁(c) ≥ 200', micron:'1 µm', collapse:'120 kPa', temp:'+90°C',
      std:'ISO 8573-1', apps:['Fuel Systems', 'Compressed Air', 'Marine'], bar:86,
      desc:'99.5% water-phase rejection. Critical in marine diesel and agricultural fuel systems where bio-fouling and water contamination destroy precision injectors within 500 operating hours. ISO 8573-1 Class 1 compressed air certification.' },
    { id:'DRYCORE', tag:'Gradient-Density Cellulose Matrix', color:'rgba(74,222,128,0.9)',
      beta:'β₁₀(c) ≥ 200', micron:'10 µm', collapse:'250 kPa', temp:'+120°C',
      std:'ISO 5011', apps:['Air Intake', 'Cabin Air', 'Agriculture'], bar:78,
      desc:'Three-layer gradient density for high dust-load air intake environments. Outer layer captures macro-particles; fine inner layer retains sub-10µm contamination. ISO 5011 collapse resistance exceeds SAE J726 specification.' },
  ];
  const t = techs[active];

  return (
    <section id="technology" style={{ background: S1, padding:'8rem 0', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', left:'-3%', top:'50%', transform:'translateY(-50%)',
        fontFamily:'Outfit, sans-serif', fontSize:'clamp(16rem,25vw,32rem)', fontWeight:700,
        color:'rgba(255,241,45,0.018)', lineHeight:1, userSelect:'none', letterSpacing:'-0.06em' }}>03</div>

      <Wrap style={{ position:'relative', zIndex:1 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'5rem' }}>
          <div className="reveal-left">
            <Eyebrow>PROPRIETARY MEDIA TECHNOLOGY</Eyebrow>
            <H2>Four Technologies.<br /><span style={{ color: G }}>One Standard<br />of Excellence.</span></H2>
            <p style={{ fontFamily:'Inter, sans-serif', fontSize:'1rem', color: W6,
              lineHeight:1.8, marginTop:'1.5rem', marginBottom:'2.5rem', maxWidth:420 }}>
              Not commodity glass fibre. Every ELIMFILTERS® product is built on a
              proprietary media platform engineered for a specific contamination
              environment and validated against international test standards.
            </p>

            {techs.map((tech, i) => (
              <button key={i} className="tech-btn" onClick={() => setActive(i)} style={{
                display:'flex', alignItems:'center', gap:'1rem',
                padding:'0.9rem 1.1rem', marginBottom:'0.4rem',
                background: active === i ? G2 : 'transparent',
                border:`1px solid ${active === i ? GB : W1}`, borderRadius:5,
              }}>
                <div style={{ width:8, height:8, borderRadius:2, flexShrink:0,
                  background: active === i ? tech.color : W3 }} />
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.8rem',
                    fontWeight:600, color: active === i ? tech.color : W6 }}>{tech.id}</div>
                  <div style={{ fontFamily:'Inter, sans-serif', fontSize:'0.7rem',
                    color: W3, marginTop:2 }}>{tech.tag}</div>
                </div>
                <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.72rem',
                  color: active === i ? tech.color : W3 }}>{tech.beta}</div>
              </button>
            ))}
          </div>

          <div className="reveal-right">
            <div style={{ background: S2, border:`1px solid ${GB}`,
              borderTop:`3px solid ${t.color}`, borderRadius:8, overflow:'hidden' }}>
              <div style={{ padding:'2rem' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.5rem' }}>
                  <span style={{ fontFamily:'Outfit, sans-serif', fontSize:'1.9rem',
                    fontWeight:700, color: t.color }}>{t.id}</span>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap', justifyContent:'flex-end' }}>
                    {t.apps.map(a => (
                      <span key={a} style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.58rem',
                        color: W3, padding:'3px 7px', border:`1px solid ${W1}`, borderRadius:2 }}>{a}</span>
                    ))}
                  </div>
                </div>
                <p style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.62rem',
                  color: t.color, opacity:0.72, letterSpacing:'0.1em', marginBottom:'1.25rem' }}>{t.tag}</p>

                {/* Animated efficiency bar */}
                <div style={{ marginBottom:'1.5rem' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                    <span style={{ fontFamily:'Inter, sans-serif', fontSize:'0.72rem', color: W6 }}>
                      Filtration Performance Index
                    </span>
                    <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.72rem', color: t.color }}>
                      {t.bar}/100
                    </span>
                  </div>
                  <div style={{ height:5, background: W1, borderRadius:3 }}>
                    <div style={{ height:'100%', width:`${t.bar}%`,
                      background:`linear-gradient(90deg, ${t.color}99, ${t.color})`,
                      borderRadius:3, transition:'width 0.5s ease' }} />
                  </div>
                </div>

                <p style={{ fontFamily:'Inter, sans-serif', fontSize:'0.88rem',
                  color: W6, lineHeight:1.75, marginBottom:'1.5rem' }}>{t.desc}</p>
              </div>

              <div style={{ borderTop:`1px solid ${W1}`, display:'grid',
                gridTemplateColumns:'repeat(3,1fr)', background: W1, gap:1 }}>
                {[
                  ['BETA RATIO', t.beta],
                  ['ABS. RATING', t.micron],
                  ['COLLAPSE ΔP', t.collapse],
                  ['MAX TEMP', t.temp],
                  ['STANDARD', t.std],
                  ['MEDIA TYPE', t.tag.split(' ').slice(0,2).join(' ')],
                ].map(([k, v]) => (
                  <div key={k} style={{ background: S1, padding:'0.9rem 1rem' }}>
                    <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.53rem',
                      color: W3, letterSpacing:'0.12em', marginBottom:4 }}>{k}</div>
                    <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.73rem',
                      color:'#fff', fontWeight:600, lineHeight:1.4 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Wrap>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 04 — COMPARISON
// ═══════════════════════════════════════════════════════════════════════════════
function Comparison() {
  useReveal();
  const rows = [
    ['Media Technology', 'Proprietary (4 platforms)', 'Standard glass fibre', 'Standard glass fibre', 'Cellulose/synthetic'],
    ['Best Beta Ratio', 'β₁(c) = 1000', 'β₆(c) ≥ 200', 'β₁₀(c) ≥ 200', 'β₇(c) ≥ 200'],
    ['Absolute Rating', '1 µm', '6 µm', '10 µm', '7 µm'],
    ['Collapse Pressure', '≥ 350 bar', '≥ 250 bar', '≥ 210 bar', '≥ 250 bar'],
    ['OEM Cross-Refs', '20,000+', '15,000+', '12,000+', '14,000+'],
    ['Industry Coverage', '12 industries', '8 industries', 'Fleet / OTR', 'Automotive / Ind.'],
    ['ISO 16889', '✓', '✓', '✓', '✓'],
    ['VIN / Machine Search', '✓', '✗', '✗', '✗'],
    ['Technical Knowledge Base', '26 articles · 6 domains', 'Datasheets only', 'Datasheets only', 'Datasheets only'],
    ['Distributor Portal', 'Territory + co-marketing', 'Standard program', 'Standard program', 'Standard program'],
  ];

  return (
    <section id="comparison" style={{ background: S2, padding:'8rem 0', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', right:'-3%', top:'50%', transform:'translateY(-50%)',
        fontFamily:'Outfit, sans-serif', fontSize:'clamp(16rem,25vw,32rem)', fontWeight:700,
        color:'rgba(255,255,255,0.016)', lineHeight:1, userSelect:'none', letterSpacing:'-0.06em' }}>04</div>

      <Wrap style={{ position:'relative', zIndex:1 }}>
        <div className="reveal" style={{ textAlign:'center', marginBottom:'4rem' }}>
          <Eyebrow>COMPETITIVE BENCHMARK</Eyebrow>
          <H2>How We Stand Against<br /><span style={{ color: G }}>the Industry Leaders.</span></H2>
        </div>

        <div className="reveal" style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', minWidth:680 }}>
            <thead>
              <tr>
                <th style={{ padding:'0.9rem 1.2rem', textAlign:'left',
                  fontFamily:'Inter, sans-serif', fontSize:'0.72rem', color: W3,
                  fontWeight:400, borderBottom:`1px solid ${W1}`, width:'28%' }}>SPECIFICATION</th>
                {['ELIMFILTERS®', 'Donaldson', 'Fleetguard', 'Mann+Hummel'].map((h, i) => (
                  <th key={h} style={{ padding:'0.9rem 1.2rem', textAlign:'center',
                    fontFamily:'Outfit, sans-serif', fontSize:'0.82rem', fontWeight:700,
                    color: i === 0 ? G : W6,
                    background: i === 0 ? G3 : 'transparent',
                    borderBottom: i === 0 ? `2px solid ${GB}` : `1px solid ${W1}`,
                    borderTop: i === 0 ? `2px solid ${GB}` : 'none',
                    borderLeft: i === 0 ? `1px solid ${GB}` : 'none',
                    borderRight: i === 0 ? `1px solid ${GB}` : 'none',
                  }}>
                    {h}
                    {i === 0 && <div style={{ fontFamily:'JetBrains Mono, monospace',
                      fontSize:'0.52rem', color: G, opacity:0.65, marginTop:2 }}>WORLD CATALOGUE</div>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={ri} style={{ background: ri % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                  <td style={{ padding:'0.8rem 1.2rem', fontFamily:'Inter, sans-serif',
                    fontSize:'0.8rem', color: W6, borderBottom:`1px solid ${W1}` }}>{r[0]}</td>
                  {r.slice(1).map((v, vi) => (
                    <td key={vi} style={{ padding:'0.8rem 1.2rem', textAlign:'center',
                      fontFamily: vi === 0 ? 'JetBrains Mono, monospace' : 'Inter, sans-serif',
                      fontSize:'0.8rem',
                      color: vi === 0 ? (v === '✓' ? 'rgba(34,197,94,0.9)' : G) :
                             (v === '✗' ? 'rgba(239,68,68,0.4)' : W3),
                      fontWeight: vi === 0 ? 600 : 400,
                      background: vi === 0 ? G3 : 'transparent',
                      borderBottom:`1px solid ${W1}`,
                      borderLeft: vi === 0 ? `1px solid ${GB}` : 'none',
                      borderRight: vi === 0 ? `1px solid ${GB}` : 'none',
                    }}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Wrap>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 05 — ROI CALCULATOR
// ═══════════════════════════════════════════════════════════════════════════════
function ROI() {
  const [fleet, setFleet] = useState(50);
  const [intv, setIntv] = useState(500);
  const [inc, setInc] = useState(2);
  useReveal();

  const loss = Math.round(fleet * (inc / 10)) * (38000 + 1200 * 48);
  const saved = Math.round(loss * 0.65);
  const invest = Math.round(fleet * (8760 / intv) * 180);
  const net = saved - invest;
  const roi = invest > 0 ? Math.round((net / invest) * 100) : 0;
  const fmt = (n: number) => n >= 1e6 ? `$${(n/1e6).toFixed(1)}M` : `$${Math.round(n/1000)}k`;

  return (
    <section id="roi" style={{ background: S1, padding:'8rem 0', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', inset:0,
        background:'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,241,45,0.022) 0%, transparent 65%)' }} />
      <div style={{ position:'absolute', left:'-3%', top:'50%', transform:'translateY(-50%)',
        fontFamily:'Outfit, sans-serif', fontSize:'clamp(16rem,25vw,32rem)', fontWeight:700,
        color:'rgba(255,241,45,0.018)', lineHeight:1, userSelect:'none', letterSpacing:'-0.06em' }}>05</div>

      <Wrap style={{ position:'relative', zIndex:1 }}>
        <div className="reveal" style={{ textAlign:'center', marginBottom:'4rem' }}>
          <Eyebrow>ROI CALCULATOR</Eyebrow>
          <H2>Your Fleet's Contamination<br /><span style={{ color: G }}>Cost — Calculated.</span></H2>
          <p style={{ fontFamily:'Inter, sans-serif', fontSize:'1rem', color: W6,
            lineHeight:1.8, maxWidth:520, margin:'1rem auto 0' }}>
            Enter your fleet parameters. See the real cost of substandard filtration
            and what ELIMFILTERS® returns to your P&L.
          </p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'2.5rem' }}>
          <div className="reveal-left" style={{ background: S2, border:`1px solid ${W1}`,
            borderRadius:8, padding:'2.5rem' }}>
            <p style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.62rem',
              color: G, letterSpacing:'0.15em', marginBottom:'2rem' }}>FLEET PARAMETERS</p>

            {[
              { label:'Fleet Size', val:fleet, set:setFleet, min:5, max:500, step:5, unit:'units' },
              { label:'Filter Service Interval', val:intv, set:setIntv, min:250, max:2000, step:50, unit:'hours' },
              { label:'Contamination Incidents per 10 units / year', val:inc, set:setInc, min:0, max:10, step:1, unit:'incidents' },
            ].map(({ label, val, set, min, max, step, unit }) => (
              <div key={label} style={{ marginBottom:'2rem' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.7rem' }}>
                  <label style={{ fontFamily:'Inter, sans-serif', fontSize:'0.82rem', color: W6 }}>{label}</label>
                  <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.82rem',
                    color: G, fontWeight:600 }}>{val} {unit}</span>
                </div>
                <input type="range" min={min} max={max} step={step} value={val}
                  onChange={e => set(Number(e.target.value))} />
                <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
                  <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.58rem', color: W3 }}>{min}</span>
                  <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.58rem', color: W3 }}>{max}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="reveal-right" style={{ display:'grid', gap:'0.85rem', alignContent:'start' }}>
            <div style={{ background:`linear-gradient(135deg, ${G2}, ${G3})`,
              border:`1px solid ${GB}`, borderRadius:8, padding:'2rem', textAlign:'center' }}>
              <p style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.6rem',
                color: G, letterSpacing:'0.15em', marginBottom:'0.75rem' }}>ESTIMATED NET ANNUAL SAVINGS</p>
              <div style={{ fontFamily:'Outfit, sans-serif', fontSize:'3.8rem', fontWeight:700,
                color: net >= 0 ? G : 'rgba(239,68,68,0.9)', lineHeight:1 }}>
                {fmt(Math.abs(net))}
              </div>
              <p style={{ fontFamily:'Inter, sans-serif', fontSize:'0.78rem', color: W6, marginTop:'0.5rem' }}>
                {net >= 0 ? 'net return above filter investment' : 'additional investment required'}
              </p>
            </div>

            {[
              { label:'Annual Failure Cost (current)', val:fmt(loss), c:'rgba(239,68,68,0.85)', sub:'unfiltered losses' },
              { label:'Losses Prevented', val:fmt(saved), c:'rgba(34,197,94,0.85)', sub:'65% incident reduction' },
              { label:'Annual Filter Investment', val:fmt(invest), c: W6, sub:`${fleet} units · ${Math.round(8760/intv)} changes/yr` },
              { label:'Return on Investment', val:`${roi}%`, c: G, sub:'net ROI on filter spend' },
            ].map(row => (
              <div key={row.label} style={{ background: S2, border:`1px solid ${W1}`,
                borderRadius:6, padding:'1.1rem 1.4rem',
                display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div>
                  <div style={{ fontFamily:'Inter, sans-serif', fontSize:'0.78rem', color: W6 }}>{row.label}</div>
                  <div style={{ fontFamily:'Inter, sans-serif', fontSize:'0.68rem', color: W3, marginTop:2 }}>{row.sub}</div>
                </div>
                <div style={{ fontFamily:'Outfit, sans-serif', fontSize:'1.4rem',
                  fontWeight:700, color: row.c }}>{row.val}</div>
              </div>
            ))}

            <p style={{ fontFamily:'Inter, sans-serif', fontSize:'0.68rem', color: W3, lineHeight:1.5 }}>
              Estimates based on NFPA/ISO industry averages. Actual savings vary by application.
              65% incident reduction based on β₁₀(c) = 1000 vs standard β₁₀(c) = 200 media.
            </p>
          </div>
        </div>
      </Wrap>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 06 — INDUSTRIES (no emojis)
// ═══════════════════════════════════════════════════════════════════════════════
function Industries() {
  useReveal();
  const industries = [
    { code:'MI', name:'Mining', color:'rgba(245,158,11,0.85)', kpis:['4,000h service life','ISO 4406: 17/15/12','350 bar collapse'] },
    { code:'AG', name:'Agriculture', color:'rgba(74,222,128,0.85)', kpis:['Seasonal dust management','Water-rejection fuel media','Cabin air protection'] },
    { code:'MR', name:'Marine', color:'rgba(96,165,250,0.85)', kpis:['Salt-corrosion resistant','Bio-fouling prevention','99.5% water rejection'] },
    { code:'CO', name:'Construction', color:'rgba(251,113,133,0.85)', kpis:['350 bar hydraulic rated','Mixed application fleets','OEM cross-ref library'] },
    { code:'OG', name:'Oil & Gas', color: G, kpis:['β₁(c) = 1000 lube','H₂S resistant housings','+200°C temperature range'] },
    { code:'FL', name:'Fleet & Transport', color:'rgba(192,132,252,0.85)', kpis:['+45% engine lifespan','20k+ OEM cross-refs','VIN search integration'] },
    { code:'PG', name:'Power Generation', color:'rgba(45,212,191,0.85)', kpis:['Turbine lube circuits','High-temp lube oil','Continuous duty rated'] },
    { code:'MF', name:'Manufacturing', color:'rgba(251,146,60,0.85)', kpis:['ISO 4406: 14/12/9','Servo valve protection','CNC hydraulic circuits'] },
    { code:'UT', name:'Water & Utilities', color:'rgba(125,211,252,0.85)', kpis:['Pump protection media','NSF-rated options','Continuous operation rated'] },
  ];

  return (
    <section id="industries" style={{ background: S2, padding:'8rem 0', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', right:'-3%', top:'50%', transform:'translateY(-50%)',
        fontFamily:'Outfit, sans-serif', fontSize:'clamp(16rem,25vw,32rem)', fontWeight:700,
        color:'rgba(255,255,255,0.016)', lineHeight:1, userSelect:'none', letterSpacing:'-0.06em' }}>06</div>

      <Wrap style={{ position:'relative', zIndex:1 }}>
        <div className="reveal" style={{ display:'flex', justifyContent:'space-between',
          alignItems:'flex-end', marginBottom:'4rem', flexWrap:'wrap', gap:'2rem' }}>
          <div>
            <Eyebrow>INDUSTRY COVERAGE</Eyebrow>
            <H2>Built for the<br /><span style={{ color: G }}>World's Hardest Jobs.</span></H2>
          </div>
          <p style={{ fontFamily:'Inter, sans-serif', fontSize:'0.95rem', color: W6,
            maxWidth:360, lineHeight:1.75 }}>
            Twelve industries. One filtration standard. Every ELIMFILTERS® product
            is specified against the operating parameters of your exact application.
          </p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)',
          gap:1, background: W1, border:`1px solid ${W1}`, borderRadius:8, overflow:'hidden' }}>
          {industries.map((ind, i) => (
            <div key={i} className={`ind-card reveal stagger-${Math.min(i + 1, 6)}`}
              style={{ padding:'2rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between',
                alignItems:'flex-start', marginBottom:'1.25rem' }}>
                <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'1.6rem',
                  fontWeight:700, color: ind.color, letterSpacing:'-0.02em' }}>{ind.code}</span>
                <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.52rem',
                  color: W3, padding:'3px 7px', border:`1px solid ${W1}`, borderRadius:2 }}>
                  IND-0{i + 1}
                </span>
              </div>
              <h3 style={{ fontFamily:'Outfit, sans-serif', fontSize:'1.1rem',
                fontWeight:700, color:'#fff', marginBottom:'1rem' }}>{ind.name}</h3>
              <div style={{ display:'grid', gap:'0.4rem' }}>
                {ind.kpis.map(k => (
                  <div key={k} style={{ display:'flex', alignItems:'center', gap:7 }}>
                    <div style={{ width:3, height:3, borderRadius:'50%',
                      background: ind.color, flexShrink:0 }} />
                    <span style={{ fontFamily:'Inter, sans-serif', fontSize:'0.73rem', color: W3 }}>{k}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Wrap>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 07 — DISTRIBUTOR
// ═══════════════════════════════════════════════════════════════════════════════
function Distributor() {
  useReveal();
  return (
    <section id="distributor" style={{ background: S1, padding:'8rem 0 10rem', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', inset:0,
        background:'radial-gradient(ellipse 70% 60% at 50% 100%, rgba(255,241,45,0.03) 0%, transparent 60%)' }} />
      <div style={{ position:'absolute', left:'-3%', top:'50%', transform:'translateY(-50%)',
        fontFamily:'Outfit, sans-serif', fontSize:'clamp(16rem,25vw,32rem)', fontWeight:700,
        color:'rgba(255,241,45,0.016)', lineHeight:1, userSelect:'none', letterSpacing:'-0.06em' }}>07</div>

      <Wrap style={{ position:'relative', zIndex:1 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'5rem', alignItems:'center' }}>
          <div className="reveal-left">
            <Eyebrow>DISTRIBUTOR PROGRAMME</Eyebrow>
            <H2>Only the Best<br /><span style={{ color: G }}>Sell ELIMFILTERS®.</span></H2>
            <p style={{ fontFamily:'Inter, sans-serif', fontSize:'1rem', color: W6,
              lineHeight:1.8, marginTop:'1.5rem', marginBottom:'2.5rem' }}>
              A selective network built for companies that serve industrial markets
              seriously. Territory agreements. Technical catalogue. Co-marketing support
              that positions your business as the expert source in your region.
            </p>

            {[
              { n:'01', t:'Apply', d:'Submit company details, territory, and intended verticals.' },
              { n:'02', t:'Territory Review', d:'We review for market fit and strategic alignment.' },
              { n:'03', t:'Onboarding', d:'Portal access, catalogue, pricing, and technical training.' },
              { n:'04', t:'First Order', d:'Opening stock with full ELIMFILTERS® launch support.' },
            ].map(s => (
              <div key={s.n} style={{ display:'flex', gap:'1.25rem', alignItems:'flex-start',
                padding:'1rem 1.2rem', background: S2, border:`1px solid ${W1}`,
                borderRadius:5, marginBottom:'0.5rem' }}>
                <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.68rem',
                  color: G, minWidth:28, paddingTop:2 }}>{s.n}</span>
                <div>
                  <div style={{ fontFamily:'Outfit, sans-serif', fontSize:'0.95rem',
                    fontWeight:700, color:'#fff', marginBottom:3 }}>{s.t}</div>
                  <div style={{ fontFamily:'Inter, sans-serif', fontSize:'0.78rem', color: W6 }}>{s.d}</div>
                </div>
              </div>
            ))}

            <Link href="/distributor-application" style={{
              display:'inline-block', marginTop:'2rem', padding:'15px 38px',
              background: G, color:'#000', fontFamily:'Outfit, sans-serif', fontWeight:700,
              fontSize:'0.88rem', letterSpacing:'0.1em', borderRadius:3, textDecoration:'none' }}>
              APPLY NOW →
            </Link>
          </div>

          <div className="reveal-right" style={{ display:'grid', gap:'1rem' }}>
            {[
              { name:'ASSOCIATE', badge:'Entry Level', color:'rgba(156,163,175,0.8)',
                hl:false, features:['Full product catalogue','Cross-reference tool','Technical data sheets','Email support'] },
              { name:'PREMIER', badge:'Most Common', color:'rgba(99,179,237,0.9)',
                hl:true, features:['Everything in Associate','Territory exclusivity','Priority stock allocation','Dedicated account manager','Co-marketing materials'] },
              { name:'ELITE', badge:'Invite Only', color: G,
                hl:false, features:['Everything in Premier','Custom SKU programs','OEM co-development','Advance product access','Board-level partnership'] },
            ].map((t, i) => (
              <div key={i} style={{
                background: t.hl ? 'rgba(99,179,237,0.04)' : S2,
                border:`1px solid ${t.hl ? 'rgba(99,179,237,0.2)' : W1}`,
                borderLeft:`3px solid ${t.color}`,
                borderRadius:6, padding:'1.5rem' }}>
                <div style={{ display:'flex', alignItems:'center',
                  justifyContent:'space-between', marginBottom:'1rem' }}>
                  <span style={{ fontFamily:'Outfit, sans-serif', fontSize:'1rem',
                    fontWeight:700, color: t.color }}>{t.name}</span>
                  <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.58rem',
                    color: W3, padding:'3px 8px', border:`1px solid ${W1}`, borderRadius:2 }}>{t.badge}</span>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4px 1rem' }}>
                  {t.features.map(f => (
                    <div key={f} style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ color: t.color, fontSize:'0.68rem' }}>✓</span>
                      <span style={{ fontFamily:'Inter, sans-serif', fontSize:'0.76rem', color: W6 }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Wrap>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FOOTER
// ═══════════════════════════════════════════════════════════════════════════════
function Footer() {
  useReveal();
  const cols = [
    {
      head: 'SOLUTIONS',
      links: ['Air Filtration Systems','Fuel Filtration','Hydraulic Filtration','Oil Filtration','Coolant Filtration','Differential Protection'],
    },
    {
      head: 'INDUSTRIES',
      links: ['Mining & Extraction','Agriculture','Marine & Offshore','Construction','Oil & Gas','Power Generation'],
    },
    {
      head: 'CATALOGUE',
      links: ['Product Search','Cross-Reference Tool','Technical Datasheets','System Configurator','Specification Request','Part Finder API'],
    },
    {
      head: 'COMPANY',
      links: ['About ELIMFILTERS®','Proprietary Technologies','Certifications','Distributor Programme','Contact / Support','Press & Media'],
    },
  ];

  return (
    <footer style={{ background:'#040404', borderTop:`1px solid rgba(255,241,45,0.08)`, position:'relative', overflow:'hidden' }}>
      {/* Top gradient */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:1,
        background:'linear-gradient(90deg, transparent, rgba(255,241,45,0.18), transparent)' }} />

      {/* CTA strip */}
      <div style={{ borderBottom:`1px solid ${W1}`, padding:'4rem 0' }}>
        <Wrap style={{ display:'flex', flexWrap:'wrap', alignItems:'center',
          justifyContent:'space-between', gap:'2rem' }}>
          <div className="reveal-left">
            <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.62rem',
              color: G, letterSpacing:'0.2em', marginBottom:'0.75rem' }}>CONTACT US</div>
            <h2 style={{ fontFamily:'Outfit, sans-serif', fontSize:'clamp(1.6rem,3vw,2.4rem)',
              fontWeight:700, color:'#fff', lineHeight:1.15 }}>
              Ready to protect<br />
              <span style={{ color: G }}>your fleet?</span>
            </h2>
            <p style={{ fontFamily:'Inter, sans-serif', fontSize:'0.9rem', color: W6,
              lineHeight:1.7, marginTop:'0.75rem', maxWidth:360 }}>
              Speak with a filtration engineer about your operating environment,
              machine hours, and cost targets.
            </p>
          </div>
          <div className="reveal-right" style={{ display:'flex', flexDirection:'column', gap:'0.75rem', alignItems:'flex-start' }}>
            <a href="mailto:sales@elimfilters.com" style={{
              display:'inline-flex', alignItems:'center', gap:'0.6rem',
              padding:'15px 36px', background: G, color:'#000',
              fontFamily:'Outfit, sans-serif', fontWeight:700, fontSize:'0.88rem',
              letterSpacing:'0.1em', borderRadius:3, textDecoration:'none' }}>
              <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.8rem' }}>→</span>
              REQUEST CONSULTATION
            </a>
            <a href="https://part-search.elimfilters.com" style={{
              display:'inline-flex', alignItems:'center', gap:'0.6rem',
              padding:'15px 36px', background:'transparent', color: G,
              fontFamily:'Outfit, sans-serif', fontWeight:700, fontSize:'0.88rem',
              letterSpacing:'0.1em', borderRadius:3, textDecoration:'none',
              border:`1px solid rgba(255,241,45,0.25)` }}>
              SEARCH CATALOGUE
            </a>
          </div>
        </Wrap>
      </div>

      {/* Standards strip */}
      <div style={{ borderBottom:`1px solid ${W1}`, padding:'1.5rem 0' }}>
        <Wrap style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:'2rem', justifyContent:'space-between' }}>
          <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.58rem',
            color: W3, letterSpacing:'0.15em' }}>COMPLIANCE & CERTIFICATIONS</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'0.75rem' }}>
            {['ISO 16889','ISO 19438','SAE J726','API SN','ASTM D6922','EN 13900-5'].map(s => (
              <span key={s} style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.6rem',
                color: W3, padding:'4px 10px',
                border:`1px solid rgba(255,255,255,0.06)`, borderRadius:2,
                letterSpacing:'0.1em' }}>{s}</span>
            ))}
          </div>
        </Wrap>
      </div>

      {/* Link columns */}
      <div style={{ padding:'4rem 0 3rem' }}>
        <Wrap>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:'3rem 2rem' }}>
            {/* Brand column */}
            <div className="reveal" style={{ gridColumn:'1 / -1', display:'grid',
              gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:'3rem 2rem', alignItems:'start' }}>
              <div style={{ gridColumn:'1 / 1' }}>
                <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.8rem',
                  fontWeight:600, color: G, letterSpacing:'0.18em', marginBottom:'1rem' }}>ELIMFILTERS®</div>
                <p style={{ fontFamily:'Inter, sans-serif', fontSize:'0.77rem', color: W3,
                  lineHeight:1.8, marginBottom:'1.25rem', maxWidth:220 }}>
                  Industrial asset protection filtration engineered for maximum performance.
                  12 industries. 12 systems. 12 proprietary technologies.
                </p>
                <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
                  {['LinkedIn','YouTube','WhatsApp'].map(n => (
                    <span key={n} style={{ fontFamily:'Inter, sans-serif', fontSize:'0.68rem',
                      color: W3, padding:'5px 10px',
                      border:`1px solid ${W1}`, borderRadius:2,
                      cursor:'pointer', letterSpacing:'0.05em' }}>{n}</span>
                  ))}
                </div>
              </div>

              {cols.map(col => (
                <div key={col.head}>
                  <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.58rem',
                    color: W3, letterSpacing:'0.2em', marginBottom:'1.25rem',
                    paddingBottom:'0.75rem', borderBottom:`1px solid ${W1}` }}>{col.head}</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:'0.55rem' }}>
                    {col.links.map(l => (
                      <span key={l} style={{ fontFamily:'Inter, sans-serif', fontSize:'0.78rem',
                        color:'rgba(255,255,255,0.38)', cursor:'pointer',
                        transition:'color 0.15s',
                        letterSpacing:'0.01em' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.38)')}
                      >{l}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Wrap>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop:`1px solid ${W1}`, padding:'1.5rem 0' }}>
        <Wrap style={{ display:'flex', flexWrap:'wrap', alignItems:'center',
          justifyContent:'space-between', gap:'1rem' }}>
          <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.58rem',
            color: W3, letterSpacing:'0.1em' }}>
            © {new Date().getFullYear()} ELIMFILTERS® — ALL RIGHTS RESERVED
          </span>
          <div style={{ display:'flex', gap:'1.5rem' }}>
            {['Privacy Policy','Terms of Use','Cookie Preferences'].map(l => (
              <span key={l} style={{ fontFamily:'Inter, sans-serif', fontSize:'0.68rem',
                color: W3, cursor:'pointer', letterSpacing:'0.04em' }}>{l}</span>
            ))}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
            <span className="live-dot" />
            <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.58rem',
              color: W3, letterSpacing:'0.1em' }}>SYSTEMS OPERATIONAL</span>
          </div>
        </Wrap>
      </div>
    </footer>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// NAV
// ═══════════════════════════════════════════════════════════════════════════════
const NAV_ITEMS = [
  { id:'hero', label:'Overview' },
  { id:'contamination', label:'Contamination' },
  { id:'technology', label:'Technology' },
  { id:'comparison', label:'Benchmark' },
  { id:'roi', label:'ROI Calculator' },
  { id:'industries', label:'Industries' },
  { id:'distributor', label:'Distributors' },
];

function Nav() {
  const [active, setActive] = useState('hero');
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }),
      { threshold: 0.3 }
    );
    NAV_ITEMS.forEach(s => { const el = document.getElementById(s.id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  return (
    <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100,
      background:'rgba(8,8,8,0.92)', backdropFilter:'blur(20px)',
      borderBottom:`1px solid ${W1}`, height:52,
      display:'flex', alignItems:'center' }}>
      <Wrap style={{ display:'flex', alignItems:'center', gap:'0.2rem', width:'100%', padding:'0 clamp(1.5rem,4vw,3rem)' }}>
        <Link href="/" style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.7rem',
          color: G, fontWeight:600, letterSpacing:'0.16em', textDecoration:'none',
          marginRight:'1.5rem', flexShrink:0 }}>ELIMFILTERS®</Link>
        <div style={{ width:1, height:16, background: W1, marginRight:'1rem', flexShrink:0 }} />
        <div style={{ display:'flex', gap:'0.1rem', overflowX:'auto', scrollbarWidth:'none', flex:1 }}>
          {NAV_ITEMS.map(s => (
            <a key={s.id} href={`#${s.id}`} style={{
              fontFamily:'Inter, sans-serif', fontSize:'0.7rem',
              color: active === s.id ? G : W3, textDecoration:'none',
              padding:'5px 11px', borderRadius:3, whiteSpace:'nowrap',
              background: active === s.id ? G3 : 'transparent',
              border:`1px solid ${active === s.id ? GB : 'transparent'}`,
              transition:'all 0.15s',
            }}>{s.label}</a>
          ))}
        </div>
        <Link href="https://part-search.elimfilters.com" style={{
          fontFamily:'Outfit, sans-serif', fontSize:'0.7rem', fontWeight:700,
          color:'#000', background: G, padding:'7px 15px', borderRadius:3,
          textDecoration:'none', flexShrink:0, letterSpacing:'0.07em', marginLeft:'1rem',
        }}>SEARCH PARTS</Link>
      </Wrap>
    </nav>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════════════════════
export default function PremiumPreview() {
  return (
    <main style={{ background: S1, color:'#fff', minHeight:'100vh' }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <Nav />
      <ScrollProgress />
      <div style={{ paddingTop:52 }}>
        <Hero />
        <Contamination />
        <Technology />
        <Comparison />
        <ROI />
        <Industries />
        <Distributor />
        <Footer />
      </div>
    </main>
  );
}
