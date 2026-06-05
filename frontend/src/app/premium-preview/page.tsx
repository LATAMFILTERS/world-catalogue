'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { useInView } from 'motion/react';

// ─── CSS injected once ────────────────────────────────────────────────────────
const CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { background: #080808; cursor: none; }
  a, button, [role=button], input[type=range] { cursor: none; }

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

  .hero-word {
    display: inline-block;
    transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.16,1,0.3,1);
  }
  .hero-word.out {
    opacity: 0;
    transform: translateY(-18px);
  }
  .hero-word.in {
    opacity: 0;
    transform: translateY(18px);
  }
  .hero-word.visible {
    opacity: 1;
    transform: translateY(0);
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

  .c-dot {
    position: fixed; top: -3px; left: -3px;
    width: 6px; height: 6px;
    background: #FFF12D; border-radius: 50%;
    pointer-events: none; z-index: 99999;
    will-change: transform; transition: opacity 0.2s;
  }
  .c-ring {
    position: fixed; top: -16px; left: -16px;
    width: 32px; height: 32px;
    border: 1px solid rgba(255,241,45,0.5);
    border-radius: 50%;
    pointer-events: none; z-index: 99998;
    will-change: transform;
    transition: width 0.22s ease, height 0.22s ease,
                top 0.22s ease, left 0.22s ease,
                border-color 0.22s ease;
  }
  .c-ring.expanded {
    width: 54px; height: 54px;
    top: -27px; left: -27px;
    border-color: rgba(255,241,45,0.18);
  }

  @keyframes ticker {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  .ticker-track {
    display: flex; width: max-content;
    animation: ticker 36s linear infinite;
  }
  .ticker-track:hover { animation-play-state: paused; }

  .pl-card {
    background: #090909;
    border-left: 3px solid rgba(255,241,45,0.15);
    transition: background 0.22s, border-color 0.22s;
  }
  .pl-card:hover {
    background: #111;
    border-left-color: #FFF12D;
  }
  .pl-card:hover .pl-code { color: #FFF12D !important; }
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

// ─── Custom cursor ────────────────────────────────────────────────────────────
function Cursor() {
  const dot  = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let mx = 0, my = 0, rx = 0, ry = 0, raf = 0;
    const move = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY;
      if (dot.current) dot.current.style.transform = `translate(${mx}px,${my}px)`;
    };
    const tick = () => {
      rx += (mx - rx) * 0.11;
      ry += (my - ry) * 0.11;
      if (ring.current) ring.current.style.transform = `translate(${rx}px,${ry}px)`;
      raf = requestAnimationFrame(tick);
    };
    const expand = () => ring.current?.classList.add('expanded');
    const shrink = () => ring.current?.classList.remove('expanded');
    window.addEventListener('mousemove', move);
    document.addEventListener('mouseover', e => {
      const t = e.target as HTMLElement;
      if (t.closest('a,button,[role=button]')) expand(); else shrink();
    });
    raf = requestAnimationFrame(tick);
    return () => { window.removeEventListener('mousemove', move); cancelAnimationFrame(raf); };
  }, []);
  return (
    <>
      <div ref={dot}  className="c-dot" />
      <div ref={ring} className="c-ring" />
    </>
  );
}

// ─── Ticker ───────────────────────────────────────────────────────────────────
const TICKER_ITEMS = [
  'AIR FILTRATION','FUEL FILTRATION','HYDRAULIC FILTRATION','OIL FILTRATION',
  'COOLANT FILTRATION','DIFFERENTIAL PROTECTION','CABIN AIR','WATER SEPARATION',
];
function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div style={{ background:'#050505', borderTop:`1px solid rgba(255,241,45,0.07)`,
      borderBottom:`1px solid rgba(255,241,45,0.07)`, overflow:'hidden', padding:'13px 0' }}>
      <div className="ticker-track">
        {items.map((t, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:'2.5rem',
            paddingRight:'2.5rem', flexShrink:0 }}>
            <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.6rem',
              color:'rgba(255,255,255,0.22)', letterSpacing:'0.22em', whiteSpace:'nowrap' }}>{t}</span>
            <span style={{ width:3, height:3, borderRadius:'50%',
              background:'rgba(255,241,45,0.35)', flexShrink:0 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Auto-play video (plays only when in viewport) ───────────────────────────
function IndustryVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const inView = useInView(ref as any, { once: false, margin: '-5%' });
  useEffect(() => {
    if (!ref.current) return;
    if (inView) ref.current.play().catch(() => {});
    else ref.current.pause();
  }, [inView]);
  return (
    <video ref={ref} playsInline muted loop preload="metadata"
      style={{ position:'absolute', inset:0, width:'100%', height:'100%',
        objectFit:'cover', opacity:0.28, transition:'opacity 0.6s' }}>
      <source src={src} type="video/mp4" />
    </video>
  );
}

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

// ─── Industry word cycler ─────────────────────────────────────────────────────
const CYCLE_WORDS = [
  'Mining.','Marine.','Agriculture.','Construction.',
  'Oil & Gas.','Power Gen.','Manufacturing.','Fleet.','Utilities.',
];

function useCycleWord() {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<'visible'|'out'|'in'>('visible');

  useEffect(() => {
    const tick = setInterval(() => {
      // 1. slide out
      setPhase('out');
      setTimeout(() => {
        // 2. swap word while invisible, snap to 'in' (below)
        setIdx(i => (i + 1) % CYCLE_WORDS.length);
        setPhase('in');
        // 3. slide in
        setTimeout(() => setPhase('visible'), 30);
      }, 370);
    }, 2200);
    return () => clearInterval(tick);
  }, []);

  return { word: CYCLE_WORDS[idx], phase };
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
  const { word, phase } = useCycleWord();
  return (
    <section id="hero" style={{ position:'relative', minHeight:'100vh',
      display:'flex', alignItems:'center', overflow:'hidden', background: S1 }}>
      {/* Background video */}
      <video autoPlay playsInline muted loop preload="metadata"
        style={{ position:'absolute', inset:0, width:'100%', height:'100%',
          objectFit:'cover', opacity:0.12, pointerEvents:'none' }}>
        <source src="/images/moleculas.mp4" type="video/mp4" />
      </video>
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
              <span className={`hero-word ${phase}`} style={{ color: G, minWidth:'6ch', display:'inline-block' }}>
                {word}
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
    { id:'NANOCORE',    img:'/assets/nanoforce.avif',        tag:'Electrospun PTFE Nanofibre',         color: G,                        beta:'β₁(c) = 1000',   micron:'1 µm',   collapse:'350 bar', temp:'+200°C', std:'ISO 16889',  bar:100, apps:['Turbine Lube','Precision Hyd.','Clean Room'],  desc:'Absolute filtration at 1 µm. Designed for turbine lube circuits and precision hydraulic systems where ISO 4406 code 14/12/9 is a contractual requirement.' },
    { id:'MACROCORE',   img:'/assets/macrocore.avif',        tag:'Borosilicate Glass + Wire Mesh',      color:'rgba(99,179,237,0.9)',     beta:'β₁₀(c) = 1000',  micron:'10 µm',  collapse:'350 bar', temp:'+120°C', std:'ISO 16889',  bar:92,  apps:['Mobile Hyd.','Construction','Mining'],          desc:'Wire-mesh reinforced glass fibre for 350 bar circuits. Standard on open-pit mining shovels and underground loaders.' },
    { id:'SYNTEPORE',   img:'/assets/syntepore.avif',        tag:'Hydrophobic Nanofibre Membrane',      color:'rgba(192,132,252,0.9)',    beta:'β₁(c) ≥ 200',    micron:'1 µm',   collapse:'120 kPa', temp:'+90°C',  std:'ISO 8573-1', bar:86,  apps:['Fuel Systems','Compr. Air','Marine'],           desc:'99.5% water-phase rejection. Critical in marine diesel and agriculture fuel systems where bio-fouling destroys CR injectors within 500 hours.' },
    { id:'DRYCORE',     img:'/assets/drycore.avif',          tag:'Gradient-Density Cellulose Matrix',   color:'rgba(74,222,128,0.9)',     beta:'β₁₀(c) ≥ 200',   micron:'10 µm',  collapse:'250 kPa', temp:'+120°C', std:'ISO 5011',   bar:78,  apps:['Air Intake','Cabin Air','Agriculture'],         desc:'Three-layer gradient density for high dust-load air intake environments. ISO 5011 collapse resistance exceeds SAE J726.' },
    { id:'HYDROCORE',   img:'/assets/aquaguardseries.avif',  tag:'Multi-Stage Coalescing Media',        color:'rgba(56,189,248,0.9)',     beta:'WR ≥ 99.5%',     micron:'3 µm',   collapse:'200 kPa', temp:'+80°C',  std:'ISO 19438',  bar:88,  apps:['Marine','Offshore','Fuel Storage'],             desc:'Multi-stage coalescing separates free and emulsified water from diesel, biodiesel and HVO fuel streams. Mandatory for offshore applications.' },
    { id:'INTEKCORE',   img:'/assets/intekcore.avif',        tag:'Integrated Composite Core System',    color:'rgba(251,191,36,0.9)',     beta:'β₅(c) ≥ 200',    micron:'5 µm',   collapse:'300 kPa', temp:'+130°C', std:'ISO 16889',  bar:91,  apps:['Dust Collectors','Hoppers','Cement'],           desc:'Integrated composite core media for continuous industrial filtration under high-vibration, high-cycle operating conditions.' },
    { id:'SYNTRAX',     img:'/assets/syntrax.avif',          tag:'Meltblown Synthetic Nanofibre',       color:'rgba(251,146,60,0.9)',     beta:'β₆(c) ≥ 200',    micron:'6 µm',   collapse:'200 bar', temp:'+140°C', std:'ISO 16889',  bar:82,  apps:['General Hyd.','Lube Oil','Transmissions'],     desc:'High-throughput meltblown media for standard hydraulic and lube circuits. Cost-effective performance at high flow rates.' },
    { id:'THERMACORE',  img:'/assets/cooltech.avif',         tag:'Ceramic-Composite High-Temp Media',   color:'rgba(239,68,68,0.9)',      beta:'β₃(c) ≥ 200',    micron:'3 µm',   collapse:'500 bar', temp:'+600°C', std:'ISO 4548',   bar:90,  apps:['Power Gen','Gas Turbines','Exhaust'],           desc:'Ceramic fibre composite rated to 600°C for gas turbine inlet and exhaust-side applications. Non-flammable under sustained flame.' },
    { id:'ISOGUARD',    img:'/assets/aquaguard.avif',        tag:'Precision ISO-Grade Depth Media',     color:'rgba(129,140,248,0.9)',    beta:'β₁(c) = 1000',   micron:'1 µm',   collapse:'420 bar', temp:'+180°C', std:'ISO 16889',  bar:97,  apps:['Turbines','Servo Systems','Semiconductor'],    desc:'Ultra-high-pressure depth filtration for servo-valve circuits requiring sustained ISO 4406 class 13/11/8 or better.' },
    { id:'MICROKAPPA',  img:'/assets/microkappa.avif',       tag:'Sub-Micron Depth Electrostatic',      color:'rgba(244,114,182,0.9)',    beta:'β₀.₅(c) ≥ 100',  micron:'0.5 µm', collapse:'300 bar', temp:'+160°C', std:'ISO 16889',  bar:98,  apps:['Electronics','Pharma','Aerospace'],             desc:'Electrostatic charge capture for sub-0.5 µm particles in critical process filtration. Approved for pharma and aerospace clean circuits.' },
  ];
  const t = techs[active];

  return (
    <section id="technology" style={{ background: S1, padding:'8rem 0', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', left:'-3%', top:'50%', transform:'translateY(-50%)',
        fontFamily:'Outfit, sans-serif', fontSize:'clamp(16rem,25vw,32rem)', fontWeight:700,
        color:'rgba(255,241,45,0.018)', lineHeight:1, userSelect:'none', letterSpacing:'-0.06em' }}>03</div>

      <Wrap style={{ position:'relative', zIndex:1 }}>
        {/* Header */}
        <div className="reveal" style={{ marginBottom:'3.5rem' }}>
          <Eyebrow>PROPRIETARY MEDIA TECHNOLOGY</Eyebrow>
          <H2>10 Technologies.<br /><span style={{ color: G }}>Zero Compromise.</span></H2>
          <p style={{ fontFamily:'Inter, sans-serif', fontSize:'1rem', color: W6,
            lineHeight:1.8, marginTop:'1rem', maxWidth:560 }}>
            Every ELIMFILTERS® product is built on a proprietary media platform —
            not commodity glass fibre. Each technology is engineered for a specific
            contamination environment and validated against international test standards.
          </p>
        </div>

        {/* Tech selector pills */}
        <div className="reveal" style={{ display:'flex', flexWrap:'wrap', gap:'0.4rem', marginBottom:'2rem' }}>
          {techs.map((tech, i) => (
            <button key={i} onClick={() => setActive(i)} className="tech-btn" style={{
              padding:'6px 14px', borderRadius:3,
              background: active === i ? G2 : 'transparent',
              border:`1px solid ${active === i ? GB : W1}`,
              fontFamily:'JetBrains Mono, monospace', fontSize:'0.68rem',
              fontWeight: active === i ? 700 : 400,
              color: active === i ? tech.color : W3,
            }}>{tech.id}</button>
          ))}
        </div>

        {/* Detail panel */}
        <div className="reveal" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'2.5rem', alignItems:'start' }}>
          <div style={{ background: S2, border:`1px solid ${GB}`, borderTop:`3px solid ${t.color}`, borderRadius:8, overflow:'hidden' }}>
            {/* Technology image */}
            <div style={{ height:140, overflow:'hidden', position:'relative', background:'#0a0a0a' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={t.img} alt={t.id}
                style={{ width:'100%', height:'100%', objectFit:'cover', opacity:0.55, transition:'opacity 0.3s' }}
                onMouseEnter={e => (e.currentTarget.style.opacity='0.8')}
                onMouseLeave={e => (e.currentTarget.style.opacity='0.55')}
                onError={e => { (e.currentTarget as HTMLImageElement).style.display='none'; }}
              />
              <div style={{ position:'absolute', inset:0,
                background:`linear-gradient(to top, ${S2} 0%, transparent 60%)` }} />
            </div>
            <div style={{ padding:'2rem' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.5rem' }}>
                <span style={{ fontFamily:'Outfit, sans-serif', fontSize:'1.8rem', fontWeight:700, color: t.color }}>{t.id}</span>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap', justifyContent:'flex-end' }}>
                  {t.apps.map(a => (
                    <span key={a} style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.58rem',
                      color: W3, padding:'3px 7px', border:`1px solid ${W1}`, borderRadius:2 }}>{a}</span>
                  ))}
                </div>
              </div>
              <p style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.62rem',
                color: t.color, opacity:0.72, letterSpacing:'0.1em', marginBottom:'1.25rem' }}>{t.tag}</p>
              <div style={{ marginBottom:'1.5rem' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <span style={{ fontFamily:'Inter, sans-serif', fontSize:'0.72rem', color: W6 }}>Performance Index</span>
                  <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.72rem', color: t.color }}>{t.bar}/100</span>
                </div>
                <div style={{ height:5, background: W1, borderRadius:3 }}>
                  <div style={{ height:'100%', width:`${t.bar}%`,
                    background:`linear-gradient(90deg, ${t.color}88, ${t.color})`,
                    borderRadius:3, transition:'width 0.45s ease' }} />
                </div>
              </div>
              <p style={{ fontFamily:'Inter, sans-serif', fontSize:'0.88rem', color: W6, lineHeight:1.75 }}>{t.desc}</p>
            </div>
            <div style={{ borderTop:`1px solid ${W1}`, display:'grid', gridTemplateColumns:'repeat(3,1fr)', background: W1, gap:1 }}>
              {[['BETA RATIO',t.beta],['ABS. RATING',t.micron],['COLLAPSE ΔP',t.collapse],['MAX TEMP',t.temp],['STANDARD',t.std],['MEDIA',t.tag.split(' ').slice(0,2).join(' ')]].map(([k,v]) => (
                <div key={k} style={{ background: S1, padding:'0.85rem 1rem' }}>
                  <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.52rem', color: W3, letterSpacing:'0.12em', marginBottom:4 }}>{k}</div>
                  <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.72rem', color:'#fff', fontWeight:600 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Mini grid — all 12 at a glance */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:1, background: W1, borderRadius:6, overflow:'hidden', border:`1px solid ${W1}` }}>
            {techs.map((tech, i) => (
              <button key={i} onClick={() => setActive(i)} className="tech-btn" style={{
                position:'relative', overflow:'hidden',
                background: active === i ? G3 : S2, padding:'1rem 0.85rem',
                borderBottom:'none', textAlign:'left',
                outline: active === i ? `1px solid ${GB}` : 'none',
                minHeight:80,
              }}>
                {/* bg image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={tech.img} alt="" aria-hidden
                  style={{ position:'absolute', inset:0, width:'100%', height:'100%',
                    objectFit:'cover', opacity: active === i ? 0.18 : 0.07, transition:'opacity 0.2s',
                    pointerEvents:'none' }}
                  onError={e => { (e.currentTarget as HTMLImageElement).style.display='none'; }}
                />
                <div style={{ position:'relative', zIndex:1 }}>
                  <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.72rem',
                    fontWeight:700, color: active === i ? tech.color : W6, marginBottom:3 }}>{tech.id}</div>
                  <div style={{ fontFamily:'Inter, sans-serif', fontSize:'0.6rem', color: W3,
                    lineHeight:1.4, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                    {tech.tag.split(' ').slice(0,3).join(' ')}
                  </div>
                  <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.58rem',
                    color: active === i ? tech.color : W3, marginTop:4 }}>{tech.micron}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </Wrap>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 04 — PRODUCT LINES
// ═══════════════════════════════════════════════════════════════════════════════
function ProductLines() {
  useReveal();
  const lines = [
    { code:'AF', name:'Air Filtration',             spec:'ISO 5011 · 0.3 µm',    desc:'Primary and safety air elements for turbocharged engines, compressors and HVAC. DRYCORE gradient-density media for maximum dust-hold capacity.', ind:'Mining · Agriculture · Construction · Marine' },
    { code:'FF', name:'Fuel Filtration',            spec:'ISO 19438 · 2 µm',     desc:'Primary, secondary and pre-filter fuel elements with integrated water separation. Protects high-pressure common-rail injectors from abrasive contamination.', ind:'Oil & Gas · Agriculture · Fleet · Marine' },
    { code:'HF', name:'Hydraulic Filtration',       spec:'ISO 16889 · 1 µm',     desc:'Return-line, pressure and suction elements. MACROCORE glass-fibre composite with wire mesh support rated to 350 bar collapse pressure.', ind:'Mining · Construction · Manufacturing · Utilities' },
    { code:'OF', name:'Oil / Lube Filtration',      spec:'API SN · 5 µm',        desc:'Full-flow and bypass lube oil elements with SYNTRAX media. Engineered for extended drain intervals up to 1,000 machine hours under severe duty cycles.', ind:'Fleet · Mining · Power Gen · Agriculture' },
    { code:'CF', name:'Coolant Filtration',         spec:'ASTM D6922',           desc:'SCA dosing and bypass units. Prevents scale, corrosion and liner pitting in wet-sleeve engine blocks across all climate zones and seasonal extremes.', ind:'Fleet · Power Gen · Marine · Construction' },
    { code:'DP', name:'Differential Protection',    spec:'API GL-5 · 10 µm',     desc:'Axle and gearbox protection elements for differentials under extreme load, high torque and continuous vibration. Extended drain rated.', ind:'Mining · Agriculture · Construction · Fleet' },
    { code:'CA', name:'Cabin Air Filtration',       spec:'EN 779 · BFE ≥ 99.9%', desc:'Operator cabin air elements using BIOSHIELD anti-microbial treatment. Removes dust, pollen, diesel particulates and bio-hazardous aerosols.', ind:'Mining · Agriculture · Construction · Fleet' },
    { code:'WS', name:'Water Separation',           spec:'ISO 19438 · WR ≥ 99%', desc:'AQUAGUARD coalescing elements for free and emulsified water removal from diesel, biodiesel and HVO fuel streams. Mandatory for offshore applications.', ind:'Marine · Offshore · Fuel Storage · Oil & Gas' },
    { code:'GA', name:'Gas & Compressed Air',       spec:'ISO 8573-1 Class 1',   desc:'Compressed air inline elements removing particulates, water and oil aerosols. SYNTEPORE hydrophobic membrane for ISO 8573-1 Class 1 certification.', ind:'Manufacturing · Pharma · Food & Bev · Power Gen' },
    { code:'TR', name:'Transmission Filtration',    spec:'ISO 16889 · 6 µm',     desc:'Suction and return elements for automatic, powershift and hydrostatic transmissions. Designed for shared sump circuits and high-cycle shift duty.', ind:'Mining · Agriculture · Construction · Fleet' },
    { code:'BR', name:'Breathers & Venting',        spec:'ISO 5011 · 3 µm',      desc:'Reservoir and gearbox breather elements preventing ingressed contamination during thermal breathing cycles. DRYCORE media, stainless mesh pre-filter.', ind:'All Industries · Reservoirs · Gearboxes' },
    { code:'DS', name:'Dust Separation Systems',    spec:'ISO 11057 · 0.3 µm',   desc:'Industrial dust collector cartridges with PULSECORE reverse-pulse jet cleaning. Continuous operation at rated flow with ΔP below 1.2 kPa.', ind:'Cement · Mining · Steel · Grain · Pharma' },
    { code:'MR', name:'Marine Filter Systems',      spec:'ISO 8573-1 · IMO MSC', desc:'Complete marine filtration sets — engine room, fuel polishing, deck machinery and offshore — built with MARINECLEAN corrosion-proof media. Certified for continuous saltwater and bio-fouling exposure.', ind:'Commercial Marine · Offshore · Coastal Diesel · Shipbuilding' },
    { code:'KT', name:'Maintenance Kit Sets',       spec:'ISO 19438 · OEM Spec',  desc:'Pre-engineered multi-filter maintenance kits grouping air, oil, fuel and hydraulic elements per equipment model and service interval. DURATECH extended-life media reduces drain intervals by 50%.', ind:'Agriculture · Fleet · Mining · Construction · Bus & Coach' },
  ];
  return (
    <section id="products" style={{ background: S1, padding:'8rem 0', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', left:'-2%', top:'50%', transform:'translateY(-50%)',
        fontFamily:'Outfit, sans-serif', fontSize:'clamp(14rem,22vw,28rem)', fontWeight:700,
        color:'rgba(255,255,255,0.013)', lineHeight:1, userSelect:'none', letterSpacing:'-0.06em' }}>PL</div>

      <Wrap style={{ position:'relative', zIndex:1 }}>
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between',
          marginBottom:'4rem', flexWrap:'wrap', gap:'1.5rem' }}>
          <div className="reveal-left">
            <Eyebrow>PRODUCT LINES</Eyebrow>
            <H2>14 systems.<br /><span style={{ color: G }}>One ecosystem.</span></H2>
          </div>
          <div className="reveal-right" style={{ fontFamily:'Inter, sans-serif', fontSize:'0.82rem',
            color: W3, maxWidth:280, lineHeight:1.75, textAlign:'right' }}>
            All 14 systems engineered around a shared cross-reference database.
            One part number resolves across every system.
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(340px,1fr))',
          gap:1, background: W1, borderRadius:8, overflow:'hidden', border:`1px solid ${W1}` }}>
          {lines.map((l, i) => (
            <div key={i} className={`pl-card reveal stagger-${Math.min(i+1,6)}`}
              style={{ padding:'2.25rem 2rem' }}>
              <div style={{ display:'flex', alignItems:'flex-start',
                justifyContent:'space-between', marginBottom:'1.5rem' }}>
                <span className="pl-code" style={{ fontFamily:'JetBrains Mono, monospace',
                  fontSize:'2rem', fontWeight:700, color:'rgba(255,255,255,0.18)',
                  letterSpacing:'-0.03em', transition:'color 0.22s' }}>{l.code}</span>
                <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.56rem',
                  color: W3, padding:'4px 9px', border:`1px solid ${W1}`,
                  borderRadius:2, letterSpacing:'0.1em', whiteSpace:'nowrap' }}>{l.spec}</span>
              </div>
              <h3 style={{ fontFamily:'Outfit, sans-serif', fontSize:'1.12rem',
                fontWeight:700, color:'#fff', marginBottom:'0.85rem' }}>{l.name}</h3>
              <p style={{ fontFamily:'Inter, sans-serif', fontSize:'0.78rem',
                color: W3, lineHeight:1.75, marginBottom:'1.5rem' }}>{l.desc}</p>
              <div style={{ borderTop:`1px solid ${W1}`, paddingTop:'1rem' }}>
                <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.54rem',
                  color:'rgba(255,255,255,0.18)', letterSpacing:'0.16em', marginBottom:'0.35rem' }}>INDUSTRIES</div>
                <div style={{ fontFamily:'Inter, sans-serif', fontSize:'0.72rem', color: W3 }}>{l.ind}</div>
              </div>
            </div>
          ))}
        </div>
      </Wrap>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 05 — TECHNICAL STANDARDS
// ═══════════════════════════════════════════════════════════════════════════════
function Standards() {
  useReveal();

  const specs = [
    { label:'Media Technology', value:'4 proprietary platforms', sub:'SYNTRAX · NANOFORCE · AQUAGUARD · PULSECORE' },
    { label:'Best Beta Ratio', value:'β₁(c) = 1000', sub:'ISO 16889 multi-pass test validated' },
    { label:'Absolute Rating', value:'1 µm', sub:'Finest particle capture in class' },
    { label:'Collapse Pressure', value:'≥ 350 bar', sub:'Engineered for high-pressure hydraulic circuits' },
    { label:'Temperature Range', value:'−40 °C → +150 °C', sub:'Extended arctic and tropical performance' },
    { label:'OEM Cross-References', value:'20,000+', sub:'VIN & machine-hour lookup integrated' },
    { label:'Industry Coverage', value:'12 industries', sub:'Mining · Marine · Agriculture · Construction · and more' },
    { label:'VIN / Machine Search', value:'Native support', sub:'Real-time lookup by asset identifier' },
    { label:'Knowledge Base', value:'26 articles · 6 domains', sub:'Engineering guides, sizing calculators, field reports' },
    { label:'Distributor Portal', value:'Territory + co-marketing', sub:'Exclusive territory agreements, launch support' },
    { label:'ISO 16889', value:'Certified', sub:'Multi-pass filtration efficiency' },
    { label:'ISO 4406', value:'Certified', sub:'Fluid cleanliness classification' },
  ];

  return (
    <section id="knowledge" style={{ background: S2, padding:'8rem 0', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', right:'-3%', top:'50%', transform:'translateY(-50%)',
        fontFamily:'Outfit, sans-serif', fontSize:'clamp(16rem,25vw,32rem)', fontWeight:700,
        color:'rgba(255,255,255,0.016)', lineHeight:1, userSelect:'none', letterSpacing:'-0.06em' }}>04</div>

      <Wrap style={{ position:'relative', zIndex:1 }}>
        <div className="reveal" style={{ textAlign:'center', marginBottom:'4rem' }}>
          <Eyebrow>TECHNICAL STANDARDS</Eyebrow>
          <H2>Engineered to the<br /><span style={{ color: G }}>Highest Specification.</span></H2>
          <p style={{ fontFamily:'Inter, sans-serif', fontSize:'1rem', color: W6,
            lineHeight:1.8, marginTop:'1.25rem', maxWidth:520, margin:'1.25rem auto 0' }}>
            Every ELIMFILTERS® product is validated against international standards
            and built on proprietary media technology developed in-house.
          </p>
        </div>

        <div className="reveal" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))',
          gap:1, background: W1, border:`1px solid ${W1}`, borderRadius:8, overflow:'hidden' }}>
          {specs.map((s, i) => (
            <div key={i} style={{
              background: S2, padding:'1.5rem 1.75rem',
              borderLeft: i % 2 === 0 ? `3px solid ${G}` : `3px solid rgba(255,241,45,0.22)`,
            }}>
              <div style={{ fontFamily:'Inter, sans-serif', fontSize:'0.72rem',
                color: W3, letterSpacing:'0.08em', marginBottom:'0.4rem', textTransform:'uppercase' }}>{s.label}</div>
              <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'1.05rem',
                fontWeight:700, color: i % 2 === 0 ? G : '#fff', marginBottom:'0.3rem' }}>{s.value}</div>
              <div style={{ fontFamily:'Inter, sans-serif', fontSize:'0.73rem', color: W3, lineHeight:1.5 }}>{s.sub}</div>
            </div>
          ))}
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
    { code:'MI', name:'Mining',            video:'/images/Mina-Video-1.mp4',          color:'rgba(245,158,11,0.9)',  kpis:['4,000h service life','ISO 4406: 17/15/12','350 bar collapse'] },
    { code:'AG', name:'Agriculture',       video:'/images/Agriculture-2.mp4',         color:'rgba(74,222,128,0.9)', kpis:['Seasonal dust management','Water-rejection fuel media','Cabin air protection'] },
    { code:'MR', name:'Marine',            video:'/images/Marino-1.mp4',              color:'rgba(96,165,250,0.9)', kpis:['Salt-corrosion resistant','Bio-fouling prevention','99.5% water rejection'] },
    { code:'CO', name:'Construction',      video:'/images/construction-2.mp4',        color:'rgba(251,113,133,0.9)',kpis:['350 bar hydraulic rated','Mixed application fleets','OEM cross-ref library'] },
    { code:'OG', name:'Oil & Gas',         video:'/images/Petro&Gas-1.mp4',           color: G,                    kpis:['β₁(c) = 1000 lube','H₂S resistant housings','+200°C temperature range'] },
    { code:'FL', name:'Fleet & Transport', video:'/images/Trucks&Feel-1.mp4',         color:'rgba(192,132,252,0.9)',kpis:['+45% engine lifespan','20k+ OEM cross-refs','VIN search integration'] },
    { code:'PG', name:'Power Generation',  video:'/images/powergenerator-Video-1.mp4',color:'rgba(45,212,191,0.9)',kpis:['Turbine lube circuits','High-temp lube oil','Continuous duty rated'] },
    { code:'MF', name:'Manufacturing',     video:'/images/Manufacture-1.mp4',         color:'rgba(251,146,60,0.9)',kpis:['ISO 4406: 14/12/9','Servo valve protection','CNC hydraulic circuits'] },
    { code:'BU', name:'Bus & Coach',       video:'/images/buses-2.mp4',               color:'rgba(251,191,36,0.9)',kpis:['Extended oil drain','Cabin air HEPA','Fleet cross-ref tool'] },
    { code:'RW', name:'Railway',           video:'/images/Train.mp4',                 color:'rgba(129,140,248,0.9)',kpis:['Diesel loco certified','High-vibration housing','24/7 continuous duty'] },
    { code:'AU', name:'Automotive',        video:'/images/Autos-Vin4.mp4',            color:'rgba(244,114,182,0.9)',kpis:['OEM-grade media','VIN lookup','20k+ cross-refs'] },
    { code:'WU', name:'Water & Utilities', video:'/images/wasted-2.mp4',              color:'rgba(125,211,252,0.9)',kpis:['Pump protection media','NSF-rated options','Continuous operation'] },
  ];

  return (
    <section id="industries" style={{ background: S1, padding:'8rem 0', position:'relative', overflow:'hidden' }}>
      <Wrap style={{ position:'relative', zIndex:1 }}>
        <div className="reveal" style={{ display:'flex', justifyContent:'space-between',
          alignItems:'flex-end', marginBottom:'4rem', flexWrap:'wrap', gap:'2rem' }}>
          <div>
            <Eyebrow>INDUSTRY COVERAGE</Eyebrow>
            <H2>Built for the<br /><span style={{ color: G }}>World's Hardest Jobs.</span></H2>
          </div>
          <p style={{ fontFamily:'Inter, sans-serif', fontSize:'0.95rem', color: W6,
            maxWidth:340, lineHeight:1.75 }}>
            12 industries. One filtration standard. Every product specified for
            your exact operating environment.
          </p>
        </div>

        {/* Video cards grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:2 }}>
          {industries.map((ind, i) => (
            <div key={i} style={{
              position:'relative', overflow:'hidden', borderRadius:4,
              height:220, background:'#0a0a0a',
              border:`1px solid rgba(255,255,255,0.05)`,
            }}
              onMouseEnter={e => { const v = e.currentTarget.querySelector('video') as HTMLVideoElement; if (v) v.style.opacity = '0.55'; }}
              onMouseLeave={e => { const v = e.currentTarget.querySelector('video') as HTMLVideoElement; if (v) v.style.opacity = '0.28'; }}
            >
              <IndustryVideo src={ind.video} />

              {/* gradient overlay */}
              <div style={{ position:'absolute', inset:0,
                background:'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%)' }} />

              {/* colored top line */}
              <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background: ind.color }} />

              {/* content */}
              <div style={{ position:'absolute', inset:0, padding:'1.1rem', display:'flex',
                flexDirection:'column', justifyContent:'space-between' }}>
                <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.54rem',
                  color:'rgba(255,255,255,0.3)', letterSpacing:'0.14em' }}>
                  IND-{String(i+1).padStart(2,'0')}
                </span>
                <div>
                  <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'1.3rem',
                    fontWeight:700, color: ind.color, letterSpacing:'-0.02em', lineHeight:1,
                    marginBottom:'0.3rem' }}>{ind.code}</div>
                  <div style={{ fontFamily:'Outfit, sans-serif', fontSize:'0.88rem',
                    fontWeight:700, color:'#fff', marginBottom:'0.6rem' }}>{ind.name}</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
                    {ind.kpis.map(k => (
                      <div key={k} style={{ display:'flex', alignItems:'center', gap:5 }}>
                        <div style={{ width:2, height:2, borderRadius:'50%', background: ind.color, flexShrink:0 }} />
                        <span style={{ fontFamily:'Inter, sans-serif', fontSize:'0.62rem',
                          color:'rgba(255,255,255,0.5)', lineHeight:1.3 }}>{k}</span>
                      </div>
                    ))}
                  </div>
                </div>
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
    <section id="contact" style={{ background: S1, padding:'8rem 0 10rem', position:'relative', overflow:'hidden' }}>
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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/elimfilters-logo.png" alt="ELIMFILTERS®"
                  style={{ height:32, width:'auto', objectFit:'contain', marginBottom:'1rem', display:'block' }}
                  onError={e => { (e.currentTarget as HTMLImageElement).style.display='none'; }}
                />
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
  { id:'industries', label:'Industries' },
  { id:'products',   label:'Systems' },
  { id:'technology', label:'Technologies' },
  { id:'knowledge',  label:'Knowledge' },
  { id:'contact',    label:'Contact' },
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
        <Link href="/" style={{ marginRight:'1.5rem', flexShrink:0, textDecoration:'none', display:'flex', alignItems:'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo-elimfilters.png" alt="ELIMFILTERS®"
            style={{ height:28, width:'auto', objectFit:'contain' }}
            onError={e => { (e.currentTarget as HTMLImageElement).style.display='none'; (e.currentTarget.nextSibling as HTMLElement).style.display='inline'; }}
          />
          <span style={{ display:'none', fontFamily:'JetBrains Mono, monospace', fontSize:'0.7rem',
            color: G, fontWeight:600, letterSpacing:'0.16em' }}>ELIMFILTERS®</span>
        </Link>
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
          <a href="/about" style={{
            fontFamily:'Inter, sans-serif', fontSize:'0.7rem',
            color: W3, textDecoration:'none',
            padding:'5px 11px', borderRadius:3, whiteSpace:'nowrap',
            transition:'all 0.15s',
          }}>About Us</a>
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
      <Cursor />
      <Nav />
      <ScrollProgress />
      <div style={{ paddingTop:52 }}>
        <Hero />
        <Ticker />
        <Contamination />
        <Technology />
        <ProductLines />
        <Standards />
        <ROI />
        <Industries />
        <Distributor />
        <Footer />
      </div>
    </main>
  );
}
