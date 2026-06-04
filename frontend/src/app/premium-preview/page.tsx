'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

// ─── Tokens ───────────────────────────────────────────────────────────────────
const G = '#FFF12D';
const G2 = 'rgba(255,241,45,0.12)';
const G3 = 'rgba(255,241,45,0.06)';
const GB = 'rgba(255,241,45,0.18)';
const W = '#fff';
const W6 = 'rgba(255,255,255,0.6)';
const W3 = 'rgba(255,255,255,0.3)';
const W1 = 'rgba(255,255,255,0.08)';
const S1 = '#0a0a0a';
const S2 = '#111';
const S3 = '#181818';

// ─── Particle canvas ──────────────────────────────────────────────────────────
function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d')!;
    let raf: number;
    type P = { x:number; y:number; vx:number; vy:number; r:number; a:number };
    let pts: P[] = [];

    function init() {
      c!.width = c!.offsetWidth;
      c!.height = c!.offsetHeight;
      pts = Array.from({ length: 80 }, () => ({
        x: Math.random() * c!.width,
        y: Math.random() * c!.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5,
        a: Math.random() * 0.4 + 0.1,
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, c!.width, c!.height);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = c!.width;
        if (p.x > c!.width) p.x = 0;
        if (p.y < 0) p.y = c!.height;
        if (p.y > c!.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,241,45,${p.a})`;
        ctx.fill();
      });
      pts.forEach((a, i) => pts.slice(i + 1).forEach(b => {
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 120) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(255,241,45,${0.06 * (1 - d / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }));
      raf = requestAnimationFrame(draw);
    }
    init();
    window.addEventListener('resize', init);
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', init); };
  }, []);
  return <canvas ref={ref} style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none' }} />;
}

// ─── Animated counter ─────────────────────────────────────────────────────────
function Counter({ to, suffix = '', prefix = '', decimals = 0 }: { to: number; suffix?: string; prefix?: string; decimals?: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let start = 0;
      const dur = 1800;
      const t0 = performance.now();
      function tick(now: number) {
        const p = Math.min((now - t0) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        setVal(parseFloat((ease * to).toFixed(decimals)));
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [to, decimals]);
  return <span ref={ref}>{prefix}{val.toFixed(decimals)}{suffix}</span>;
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ id, bg, children, style }: { id: string; bg?: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <section id={id} style={{ background: bg || S1, position:'relative', overflow:'hidden', ...style }}>
      {children}
    </section>
  );
}

function Container({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ maxWidth: 1160, margin:'0 auto', padding:'0 2rem', ...style }}>{children}</div>;
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.62rem', letterSpacing:'0.22em',
      color: G, opacity:0.75, marginBottom:'1.25rem', textTransform:'uppercase' }}>
      ▸ {children}
    </p>
  );
}

function H2({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <h2 style={{ fontFamily:'Outfit, sans-serif', fontSize:'clamp(2.2rem,5vw,3.8rem)',
      fontWeight:700, letterSpacing:'-0.03em', lineHeight:1.05, color: W, ...style }}>
      {children}
    </h2>
  );
}

function Body({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <p style={{ fontFamily:'Inter, sans-serif', fontSize:'1rem', color: W6,
      lineHeight:1.8, ...style }}>
      {children}
    </p>
  );
}

// ─── 01 HERO ──────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <Section id="hero" style={{ minHeight:'100vh', display:'flex', alignItems:'center' }}>
      <ParticleCanvas />
      <div style={{ position:'absolute', inset:0,
        background:'radial-gradient(ellipse 80% 60% at 60% 40%, rgba(255,241,45,0.03) 0%, transparent 70%)' }} />

      <Container style={{ position:'relative', zIndex:2, paddingTop:'8rem', paddingBottom:'6rem' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 420px', gap:'4rem', alignItems:'center' }}>
          {/* Left */}
          <div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:'2rem' }}>
              {['ISO 16889 CERTIFIED','β₁₀(c) ≥ 1000','12 INDUSTRIES'].map(t => (
                <span key={t} style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.6rem',
                  letterSpacing:'0.15em', color: G, padding:'5px 12px',
                  border:`1px solid ${GB}`, borderRadius:2, background: G3 }}>
                  {t}
                </span>
              ))}
            </div>

            <h1 style={{ fontFamily:'Outfit, sans-serif',
              fontSize:'clamp(3rem,7vw,5.5rem)', fontWeight:700,
              letterSpacing:'-0.04em', lineHeight:1.0, marginBottom:'2rem' }}>
              The Filter That<br />
              <span style={{ color: G }}>Protects What</span><br />
              Moves the World.
            </h1>

            <Body style={{ maxWidth:520, marginBottom:'3rem', fontSize:'1.1rem' }}>
              ELIMFILTERS® engineers asset-protection filtration for the most demanding
              industrial environments on earth — from open-pit mining to deep-sea marine,
              from precision hydraulics to high-cycle fleet engines.
            </Body>

            <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap' }}>
              <Link href="/distributor-application" style={{
                padding:'15px 36px', background: G, color:'#000',
                fontFamily:'Outfit, sans-serif', fontWeight:700, fontSize:'0.9rem',
                letterSpacing:'0.08em', borderRadius:3, textDecoration:'none',
                display:'inline-block',
              }}>
                BECOME A DISTRIBUTOR
              </Link>
              <Link href="https://part-search.elimfilters.com" style={{
                padding:'15px 36px', background:'transparent', color: G,
                fontFamily:'Outfit, sans-serif', fontWeight:700, fontSize:'0.9rem',
                letterSpacing:'0.08em', borderRadius:3, textDecoration:'none',
                display:'inline-block', border:`1.5px solid ${GB}`,
              }}>
                SEARCH CATALOGUE
              </Link>
            </div>
          </div>

          {/* Right — spec card */}
          <div style={{
            background: S2, border:`1px solid ${GB}`,
            borderRadius:8, overflow:'hidden',
            boxShadow:'0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,241,45,0.08)',
          }}>
            <div style={{ background:`linear-gradient(135deg, ${S3}, ${S2})`,
              borderBottom:`1px solid ${W1}`, padding:'1.25rem 1.5rem',
              display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.75rem', color: G, fontWeight:600 }}>
                NANOCORE-H1000
              </span>
              <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.6rem', color:'rgba(34,197,94,0.9)',
                padding:'3px 8px', border:'1px solid rgba(34,197,94,0.2)', borderRadius:2, background:'rgba(34,197,94,0.06)' }}>
                IN STOCK
              </span>
            </div>
            <div style={{ padding:'1.5rem' }}>
              <p style={{ fontFamily:'Outfit, sans-serif', fontSize:'1rem', fontWeight:600, color: W, marginBottom:'0.4rem' }}>
                High-Pressure Hydraulic Filter Element
              </p>
              <p style={{ fontFamily:'Inter, sans-serif', fontSize:'0.8rem', color: W6, marginBottom:'1.5rem' }}>
                DURATECH glass-fibre media · Wire mesh support
              </p>
              {[
                ['Efficiency','β₁₀(c) = 1000'],
                ['Absolute Rating','10 µm'],
                ['Collapse ΔP','350 bar'],
                ['Flow Rate','Up to 400 L/min'],
                ['Temp Range','-30°C to +120°C'],
                ['Standard','ISO 16889'],
                ['OEM Cross-Ref','P550048 · LF3000 · W719/30'],
              ].map(([k,v]) => (
                <div key={k} style={{ display:'flex', justifyContent:'space-between',
                  padding:'8px 0', borderBottom:`1px solid ${W1}` }}>
                  <span style={{ fontFamily:'Inter, sans-serif', fontSize:'0.78rem', color: W6 }}>{k}</span>
                  <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.78rem', color: W, fontWeight:600 }}>{v}</span>
                </div>
              ))}
              <div style={{ marginTop:'1.5rem', padding:'1rem', background: G3,
                border:`1px solid ${GB}`, borderRadius:4, display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'1.4rem', color: G, fontWeight:700 }}>20k+</span>
                <span style={{ fontFamily:'Inter, sans-serif', fontSize:'0.78rem', color: W6 }}>OEM cross-references indexed in the ELIMFILTERS® catalogue</span>
              </div>
            </div>
          </div>
        </div>

        {/* KPI strip */}
        <div style={{ marginTop:'5rem', display:'grid', gridTemplateColumns:'repeat(4,1fr)',
          gap:1, background: W1, border:`1px solid ${W1}`, borderRadius:6, overflow:'hidden' }}>
          {[
            { n: 99.9, s:'%', label:'Media Filtration Efficiency', dec:1 },
            { n: 2000, s:'+', label:'Active SKUs in Catalogue', dec:0 },
            { n: 4000, s:'h', label:'Proven Service Life', dec:0 },
            { n: 45, s:'%', label:'Extended Engine Life vs Standard', dec:0 },
          ].map((k, i) => (
            <div key={i} style={{ background: S1, padding:'2rem 1.5rem', textAlign:'center' }}>
              <div style={{ fontFamily:'Outfit, sans-serif', fontSize:'clamp(2rem,4vw,3rem)',
                fontWeight:700, color: G, lineHeight:1, marginBottom:'0.5rem' }}>
                <Counter to={k.n} suffix={k.s} decimals={k.dec} />
              </div>
              <div style={{ fontFamily:'Inter, sans-serif', fontSize:'0.75rem', color: W6, lineHeight:1.4 }}>
                {k.label}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── 02 COST OF FAILURE ───────────────────────────────────────────────────────
function CostOfFailure() {
  const failures = [
    { code:'F-01', system:'Hydraulic Circuit', particle:'≥ 10 µm', damage:'Valve silting · Seal erosion · Pump cavitation',
      cost:'$38,000', downtime:'72 hrs', icon:'⚡' },
    { code:'F-02', system:'Lube Oil System', particle:'≥ 5 µm', damage:'Bearing fatigue · Crankshaft journal wear · Oil degradation',
      cost:'$62,000', downtime:'5–14 days', icon:'🔩' },
    { code:'F-03', system:'Fuel Injection', particle:'≥ 4 µm', damage:'Injector tip erosion · Spray pattern distortion · ECU faults',
      cost:'$24,000', downtime:'36 hrs', icon:'💉' },
    { code:'F-04', system:'Air Intake', particle:'≥ 20 µm', damage:'Turbocharger blade erosion · Cylinder wall scoring · Piston wear',
      cost:'$91,000', downtime:'7–21 days', icon:'🌀' },
  ];

  return (
    <Section id="contamination" bg={S2} style={{ padding:'8rem 0' }}>
      <Container>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'5rem', alignItems:'start' }}>
          <div style={{ position:'sticky', top:'6rem' }}>
            <Label>THE COST OF CONTAMINATION</Label>
            <H2>One Particle.<br /><span style={{ color: G }}>One Failure.</span><br />$91,000 Gone.</H2>
            <Body style={{ marginTop:'1.5rem', maxWidth:420 }}>
              Contamination-induced failure is the leading cause of unplanned downtime in
              industrial fleets. Sub-10µm particles — invisible to the naked eye — cause
              progressive damage that compounds over thousands of operating hours.
            </Body>

            <div style={{ marginTop:'2.5rem', padding:'1.5rem',
              background: S1, border:`1px solid rgba(239,68,68,0.2)`,
              borderLeft:`3px solid rgba(239,68,68,0.6)`, borderRadius:4 }}>
              <p style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.65rem',
                color:'rgba(239,68,68,0.8)', letterSpacing:'0.15em', marginBottom:'0.75rem' }}>
                INDUSTRY BENCHMARK
              </p>
              <p style={{ fontFamily:'Outfit, sans-serif', fontSize:'1.6rem', fontWeight:700, color: W, lineHeight:1.2 }}>
                70% of hydraulic failures are contamination-related.
              </p>
              <p style={{ fontFamily:'Inter, sans-serif', fontSize:'0.8rem', color: W6, marginTop:'0.75rem' }}>
                Source: NFPA / ISO 4406 industry data
              </p>
            </div>

            <div style={{ marginTop:'1.5rem', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
              {[['$180k+','Avg annual contamination cost per fleet'],['3.2×','More downtime with substandard filtration']].map(([n,l]) => (
                <div key={n} style={{ padding:'1.25rem', background: S1, border:`1px solid ${W1}`, borderRadius:4 }}>
                  <div style={{ fontFamily:'Outfit, sans-serif', fontSize:'1.8rem', fontWeight:700, color: G }}>{n}</div>
                  <div style={{ fontFamily:'Inter, sans-serif', fontSize:'0.75rem', color: W6, marginTop:4, lineHeight:1.4 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display:'grid', gap:'1rem' }}>
            {failures.map((f, i) => (
              <div key={i} style={{
                background: S1, border:`1px solid ${W1}`,
                borderRadius:6, overflow:'hidden',
              }}>
                <div style={{ display:'grid', gridTemplateColumns:'auto 1fr auto',
                  gap:'1rem', alignItems:'center', padding:'1.25rem 1.5rem',
                  borderBottom:`1px solid ${W1}` }}>
                  <span style={{ fontSize:'1.5rem' }}>{f.icon}</span>
                  <div>
                    <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.6rem',
                      color: W3, display:'block', marginBottom:3 }}>{f.code}</span>
                    <span style={{ fontFamily:'Outfit, sans-serif', fontSize:'1rem',
                      fontWeight:700, color: W }}>{f.system}</span>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontFamily:'Outfit, sans-serif', fontSize:'1.3rem',
                      fontWeight:700, color:'rgba(239,68,68,0.9)' }}>{f.cost}</div>
                    <div style={{ fontFamily:'Inter, sans-serif', fontSize:'0.7rem', color: W6 }}>avg repair</div>
                  </div>
                </div>
                <div style={{ padding:'1rem 1.5rem', display:'grid',
                  gridTemplateColumns:'1fr 1fr 1fr', gap:'1rem' }}>
                  <div>
                    <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.6rem',
                      color: W3, marginBottom:3 }}>TRIGGER SIZE</div>
                    <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.85rem',
                      color:'rgba(245,158,11,0.9)', fontWeight:600 }}>{f.particle}</div>
                  </div>
                  <div>
                    <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.6rem',
                      color: W3, marginBottom:3 }}>DOWNTIME</div>
                    <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.85rem',
                      color: W, fontWeight:600 }}>{f.downtime}</div>
                  </div>
                  <div>
                    <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.6rem',
                      color: W3, marginBottom:3 }}>DAMAGE</div>
                    <div style={{ fontFamily:'Inter, sans-serif', fontSize:'0.72rem',
                      color: W6, lineHeight:1.4 }}>{f.damage}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── 03 COMPETITOR COMPARISON ─────────────────────────────────────────────────
function ComparisonTable() {
  const rows = [
    { feature:'Media Technology', elim:'Proprietary NANOCORE / MACROCORE / SYNTEPORE / DRYCORE', d:'Standard glass fibre + cellulose', f:'Standard glass fibre', m:'Standard cellulose/synthetic' },
    { feature:'β₁₀(c) Efficiency', elim:'≥ 1000 (NANOCORE)', d:'≥ 200', f:'≥ 200', m:'≥ 200' },
    { feature:'Absolute Micron Rating', elim:'1 µm (NANOCORE)', d:'6 µm', f:'10 µm', m:'7 µm' },
    { feature:'Collapse Pressure', elim:'≥ 350 bar', d:'≥ 250 bar', f:'≥ 210 bar', m:'≥ 250 bar' },
    { feature:'OEM Cross-Reference', elim:'20,000+', d:'15,000+', f:'12,000+', m:'14,000+' },
    { feature:'Industry Coverage', elim:'12 industries', d:'8 industries', f:'Fleet / OTR focus', m:'Automotive / industrial' },
    { feature:'ISO 16889 Certified', elim:'✓', d:'✓', f:'✓', m:'✓' },
    { feature:'VIN Search Tool', elim:'✓', d:'✗', f:'✗', m:'✗' },
    { feature:'Technical Knowledge Base', elim:'26 articles · 6 domains', d:'Product datasheets only', f:'Product datasheets only', m:'Product datasheets only' },
    { feature:'Distributor Portal', elim:'Territory · Stock · Co-marketing', d:'Standard dealer program', f:'Standard dealer program', m:'Standard dealer program' },
  ];

  const cols = ['ELIMFILTERS®','Donaldson','Fleetguard','Mann+Hummel'];

  return (
    <Section id="comparison" style={{ padding:'8rem 0' }}>
      <Container>
        <div style={{ textAlign:'center', marginBottom:'4rem' }}>
          <Label>COMPETITIVE BENCHMARK</Label>
          <H2>How We Compare<br /><span style={{ color: G }}>to Industry Leaders.</span></H2>
          <Body style={{ marginTop:'1rem', maxWidth:560, margin:'1rem auto 0' }}>
            A direct, technical comparison against the three largest filtration brands globally.
          </Body>
        </div>

        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', minWidth:720 }}>
            <thead>
              <tr>
                <th style={{ padding:'1rem 1.25rem', textAlign:'left', fontFamily:'Inter, sans-serif',
                  fontSize:'0.78rem', color: W3, fontWeight:500, borderBottom:`1px solid ${W1}`,
                  width:'28%' }}>
                  SPECIFICATION
                </th>
                {cols.map((c, i) => (
                  <th key={c} style={{ padding:'1rem 1.25rem', textAlign:'center',
                    fontFamily:'Outfit, sans-serif', fontSize:'0.85rem', fontWeight:700,
                    color: i === 0 ? G : W6,
                    background: i === 0 ? G3 : 'transparent',
                    borderBottom: i === 0 ? `2px solid ${GB}` : `1px solid ${W1}`,
                    borderTop: i === 0 ? `2px solid ${GB}` : 'none',
                    borderLeft: i === 0 ? `1px solid ${GB}` : 'none',
                    borderRight: i === 0 ? `1px solid ${GB}` : 'none',
                  }}>
                    {c}
                    {i === 0 && <div style={{ fontFamily:'JetBrains Mono, monospace',
                      fontSize:'0.55rem', color: G, opacity:0.7, marginTop:3, letterSpacing:'0.1em' }}>
                      WORLD CATALOGUE
                    </div>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={ri} style={{ background: ri % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                  <td style={{ padding:'0.9rem 1.25rem', fontFamily:'Inter, sans-serif',
                    fontSize:'0.82rem', color: W6, borderBottom:`1px solid ${W1}` }}>
                    {r.feature}
                  </td>
                  {[r.elim, r.d, r.f, r.m].map((v, vi) => (
                    <td key={vi} style={{ padding:'0.9rem 1.25rem', textAlign:'center',
                      fontFamily: vi === 0 ? 'JetBrains Mono, monospace' : 'Inter, sans-serif',
                      fontSize:'0.82rem',
                      color: vi === 0 ? (v === '✓' ? 'rgba(34,197,94,0.9)' : G) : (v === '✗' ? 'rgba(239,68,68,0.5)' : W3),
                      fontWeight: vi === 0 ? 600 : 400,
                      background: vi === 0 ? G3 : 'transparent',
                      borderBottom:`1px solid ${W1}`,
                      borderLeft: vi === 0 ? `1px solid ${GB}` : 'none',
                      borderRight: vi === 0 ? `1px solid ${GB}` : 'none',
                    }}>
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </Section>
  );
}

// ─── 04 TECHNOLOGY ────────────────────────────────────────────────────────────
function Technology() {
  const [active, setActive] = useState(0);
  const techs = [
    {
      id:'NANOCORE', tag:'Sub-Micron Precision',
      color:'rgba(255,241,45,0.85)',
      media:'Electrospun PTFE nanofiber on nonwoven substrate',
      beta:'β₁(c) = 1000', micron:'1 µm', collapse:'350 bar', temp:'+200°C',
      std:'ISO 16889 / ISO 4406', apps:['Lube Oil','Turbines','Precision Hydraulics'],
      desc:'Absolute filtration at 1µm. When ISO 4406 code 14/12/9 is required and failure is not an option. NANOCORE achieves cleanliness levels beyond what standard glass fibre media can reach — validated on 210-bar turbine lube circuits.',
      bar: 100,
    },
    {
      id:'MACROCORE', tag:'High-Collapse Hydraulic',
      color:'rgba(59,130,246,0.85)',
      media:'Borosilicate glass fibre + stainless wire mesh support',
      beta:'β₁₀(c) = 1000', micron:'10 µm', collapse:'350 bar', temp:'+120°C',
      std:'ISO 16889', apps:['Mobile Hydraulics','Construction','Mining'],
      desc:'Wire-mesh reinforced glass fibre for the harshest high-pressure circuits. Rated to 350 bar collapse differential. The standard for mining and construction hydraulic systems where filter element failure causes catastrophic actuator damage.',
      bar: 92,
    },
    {
      id:'SYNTEPORE', tag:'Synthetic Membrane',
      color:'rgba(168,85,247,0.85)',
      media:'Nanofiber membrane on polyester nonwoven',
      beta:'β₁(c) ≥ 200', micron:'1 µm', collapse:'120 kPa', temp:'+90°C',
      std:'ISO 8573-1 / ASTM D6304', apps:['Fuel Systems','Compressed Air','Marine'],
      desc:'Hydrophobic membrane technology. 99.5% water-phase rejection. Critical in marine diesel systems where bio-fouling and water contamination in fuel cause injector failure within 500 operating hours. ISO 8573-1 Class 1 air quality certified.',
      bar: 88,
    },
    {
      id:'DRYCORE', tag:'Multi-Layer Cellulose Matrix',
      color:'rgba(34,197,94,0.85)',
      media:'Gradient-density cellulose/synthetic composite',
      beta:'β₁₀(c) ≥ 200', micron:'10 µm', collapse:'250 kPa', temp:'+120°C',
      std:'ISO 5011 / SAE J726', apps:['Air Intake','Cabin Air','Agriculture'],
      desc:'Three-layer gradient density media. Coarse outer captures macro-particles; fine inner retains sub-10µm contamination. Designed for high dust-load air intake in mining and agriculture. ISO 5011 collapse resistance exceeds SAE J726 specification.',
      bar: 80,
    },
  ];

  const t = techs[active];

  return (
    <Section id="technology" bg={S2} style={{ padding:'8rem 0' }}>
      <Container>
        <Label>PROPRIETARY MEDIA TECHNOLOGY</Label>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4rem', alignItems:'start' }}>
          <div>
            <H2>Four Technologies.<br /><span style={{ color: G }}>One Standard<br />of Excellence.</span></H2>
            <Body style={{ marginTop:'1.5rem', marginBottom:'2.5rem' }}>
              Every ELIMFILTERS® product is built on a proprietary media platform —
              not commodity glass fibre — engineered for specific contamination
              environments and validated against international test standards.
            </Body>

            <div style={{ display:'grid', gap:'0.5rem' }}>
              {techs.map((tech, i) => (
                <button key={i} onClick={() => setActive(i)} style={{
                  display:'flex', alignItems:'center', gap:'1rem',
                  padding:'1rem 1.25rem', background: active === i ? G3 : 'transparent',
                  border:`1px solid ${active === i ? GB : W1}`,
                  borderRadius:5, cursor:'pointer', textAlign:'left', width:'100%',
                  transition:'all 0.2s',
                }}>
                  <div style={{ width:6, height:6, borderRadius:'50%',
                    background: active === i ? tech.color : W3, flexShrink:0 }} />
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.82rem',
                      fontWeight:600, color: active === i ? tech.color : W6 }}>
                      {tech.id}
                    </div>
                    <div style={{ fontFamily:'Inter, sans-serif', fontSize:'0.72rem', color: W3, marginTop:2 }}>
                      {tech.tag}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.75rem',
                      color: active === i ? tech.color : W3 }}>{tech.beta}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Detail panel */}
          <div style={{ background: S1, border:`1px solid ${GB}`,
            borderTop:`3px solid ${t.color}`, borderRadius:8, overflow:'hidden' }}>
            <div style={{ padding:'2rem 2rem 1.5rem' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.5rem' }}>
                <span style={{ fontFamily:'Outfit, sans-serif', fontSize:'2rem', fontWeight:700, color: t.color }}>
                  {t.id}
                </span>
                <div style={{ display:'flex', gap:6 }}>
                  {t.apps.map(a => (
                    <span key={a} style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.6rem',
                      color: W3, padding:'3px 8px', border:`1px solid ${W1}`, borderRadius:2 }}>{a}</span>
                  ))}
                </div>
              </div>
              <p style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.65rem',
                color: t.color, opacity:0.75, letterSpacing:'0.1em', marginBottom:'1rem' }}>{t.tag}</p>

              {/* Efficiency bar */}
              <div style={{ marginBottom:'1.5rem' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <span style={{ fontFamily:'Inter, sans-serif', fontSize:'0.72rem', color: W6 }}>Filtration Performance Index</span>
                  <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.72rem', color: t.color }}>{t.bar}%</span>
                </div>
                <div style={{ height:4, background: W1, borderRadius:2 }}>
                  <div style={{ height:'100%', width:`${t.bar}%`, background: t.color, borderRadius:2 }} />
                </div>
              </div>

              <p style={{ fontFamily:'Inter, sans-serif', fontSize:'0.88rem', color: W6,
                lineHeight:1.75, marginBottom:'1.5rem' }}>{t.desc}</p>
            </div>

            <div style={{ borderTop:`1px solid ${W1}`, display:'grid',
              gridTemplateColumns:'repeat(3,1fr)', gap:1, background: W1 }}>
              {[
                ['MEDIA',t.media],
                ['BETA RATIO',t.beta],
                ['ABS. RATING',t.micron],
                ['COLLAPSE ΔP',t.collapse],
                ['MAX TEMP',t.temp],
                ['STANDARD',t.std],
              ].map(([k,v]) => (
                <div key={k} style={{ background: S1, padding:'1rem' }}>
                  <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.55rem',
                    color: W3, letterSpacing:'0.12em', marginBottom:4 }}>{k}</div>
                  <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.75rem',
                    color: W, fontWeight:600, lineHeight:1.4 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── 05 ROI CALCULATOR ────────────────────────────────────────────────────────
function ROICalculator() {
  const [fleet, setFleet] = useState(50);
  const [interval, setInterval] = useState(500);
  const [incidents, setIncidents] = useState(2);

  const repairCost = 38000;
  const downtimeCostPerHr = 1200;
  const downtimeHrs = 48;
  const filterSavingPct = 0.65;

  const annualFailures = Math.round(fleet * (incidents / 10));
  const currentLoss = annualFailures * (repairCost + downtimeCostPerHr * downtimeHrs);
  const savedLoss = Math.round(currentLoss * filterSavingPct);
  const filterInvestment = Math.round(fleet * (8760 / interval) * 180);
  const netROI = savedLoss - filterInvestment;
  const roiPct = filterInvestment > 0 ? Math.round((netROI / filterInvestment) * 100) : 0;

  const fmt = (n: number) => n >= 1000000
    ? `$${(n/1000000).toFixed(1)}M`
    : `$${Math.round(n/1000)}k`;

  return (
    <Section id="roi" style={{ padding:'8rem 0' }}>
      <div style={{ position:'absolute', inset:0,
        background:'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,241,45,0.025) 0%, transparent 70%)' }} />
      <Container style={{ position:'relative', zIndex:1 }}>
        <div style={{ textAlign:'center', marginBottom:'4rem' }}>
          <Label>ROI CALCULATOR</Label>
          <H2>Calculate Your Fleet's<br /><span style={{ color: G }}>Contamination Cost.</span></H2>
          <Body style={{ marginTop:'1rem', maxWidth:520, margin:'1rem auto 0' }}>
            Enter your fleet parameters. See the real cost of substandard filtration — and what ELIMFILTERS® returns to your bottom line.
          </Body>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'3rem' }}>
          {/* Inputs */}
          <div style={{ background: S2, border:`1px solid ${W1}`, borderRadius:8, padding:'2.5rem' }}>
            <p style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.65rem',
              color: G, letterSpacing:'0.15em', marginBottom:'2rem' }}>FLEET PARAMETERS</p>

            {[
              { label:'Fleet Size (vehicles / machines)', val:fleet, set:setFleet, min:1, max:500, step:5, unit:'units' },
              { label:'Filter Service Interval', val:interval, set:setInterval, min:250, max:2000, step:50, unit:'hours' },
              { label:'Contamination Incidents per 10 units/year', val:incidents, set:setIncidents, min:0, max:10, step:1, unit:'incidents' },
            ].map(({ label, val, set, min, max, step, unit }) => (
              <div key={label} style={{ marginBottom:'2rem' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.75rem' }}>
                  <label style={{ fontFamily:'Inter, sans-serif', fontSize:'0.82rem', color: W6 }}>{label}</label>
                  <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.85rem',
                    color: G, fontWeight:600 }}>{val} {unit}</span>
                </div>
                <input type="range" min={min} max={max} step={step} value={val}
                  onChange={e => set(Number(e.target.value))}
                  style={{ width:'100%', accentColor: G, cursor:'pointer' }} />
                <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
                  <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.6rem', color: W3 }}>{min}</span>
                  <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.6rem', color: W3 }}>{max}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Results */}
          <div style={{ display:'grid', gap:'1rem', alignContent:'start' }}>
            <div style={{ background:`linear-gradient(135deg, rgba(255,241,45,0.06), rgba(255,241,45,0.02))`,
              border:`1px solid ${GB}`, borderRadius:8, padding:'2rem', textAlign:'center' }}>
              <p style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.62rem',
                color: G, letterSpacing:'0.15em', marginBottom:'0.75rem' }}>ANNUAL NET SAVINGS</p>
              <div style={{ fontFamily:'Outfit, sans-serif', fontSize:'3.5rem', fontWeight:700,
                color: netROI >= 0 ? G : 'rgba(239,68,68,0.9)', lineHeight:1 }}>
                {fmt(Math.abs(netROI))}
              </div>
              <p style={{ fontFamily:'Inter, sans-serif', fontSize:'0.8rem', color: W6, marginTop:'0.5rem' }}>
                {netROI >= 0 ? 'estimated return above filter investment' : 'additional investment required'}
              </p>
            </div>

            {[
              { label:'Current Annual Failure Cost', val:fmt(currentLoss), color:'rgba(239,68,68,0.9)', sub:'unfiltered fleet losses' },
              { label:'Losses Prevented by ELIMFILTERS®', val:fmt(savedLoss), color:'rgba(34,197,94,0.9)', sub:'65% contamination incident reduction' },
              { label:'Annual Filter Investment', val:fmt(filterInvestment), color: W6, sub:`${fleet} units · ${Math.round(8760/interval)} changes/yr` },
              { label:'Return on Investment', val:`${roiPct}%`, color: G, sub:'net ROI on filter spend' },
            ].map(row => (
              <div key={row.label} style={{ background: S2, border:`1px solid ${W1}`,
                borderRadius:6, padding:'1.25rem 1.5rem',
                display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div>
                  <div style={{ fontFamily:'Inter, sans-serif', fontSize:'0.8rem', color: W6 }}>{row.label}</div>
                  <div style={{ fontFamily:'Inter, sans-serif', fontSize:'0.7rem', color: W3, marginTop:2 }}>{row.sub}</div>
                </div>
                <div style={{ fontFamily:'Outfit, sans-serif', fontSize:'1.4rem',
                  fontWeight:700, color: row.color }}>{row.val}</div>
              </div>
            ))}

            <p style={{ fontFamily:'Inter, sans-serif', fontSize:'0.7rem', color: W3, lineHeight:1.5 }}>
              * Estimates based on NFPA / ISO industry averages. Actual savings vary by application, operating conditions, and current filter quality. ELIMFILTERS® 65% incident reduction is based on β₁₀(c) = 1000 media vs standard β₁₀(c) = 200 media in controlled fleet studies.
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── 06 INDUSTRIES ────────────────────────────────────────────────────────────
function Industries() {
  const industries = [
    { icon:'⛏', name:'Mining', code:'IND-01',
      stat:'4,000h service life', color:'rgba(245,158,11,0.8)',
      kpis:['ISO 4406: 17/15/12','350 bar collapse','DRYCORE + MACROCORE'] },
    { icon:'🚜', name:'Agriculture', code:'IND-02',
      stat:'99.5% water rejection', color:'rgba(34,197,94,0.8)',
      kpis:['Seasonal field dust','SYNTEPORE fuel','DRYCORE cabin'] },
    { icon:'⚓', name:'Marine', code:'IND-03',
      stat:'Salt corrosion resistant', color:'rgba(59,130,246,0.8)',
      kpis:['Bio-fouling prevention','NANOCORE lube','Deep-sea rated'] },
    { icon:'🏗', name:'Construction', code:'IND-04',
      stat:'350 bar hydraulic', color:'rgba(239,68,68,0.8)',
      kpis:['Mixed application fleet','MACROCORE hydraulic','OEM cross-ref library'] },
    { icon:'🛢', name:'Oil & Gas', code:'IND-05',
      stat:'β₁(c) = 1000', color: G,
      kpis:['Turbine lube circuits','H₂S resistant','+200°C rated'] },
    { icon:'🚚', name:'Fleet & Transport', code:'IND-06',
      stat:'+45% engine lifespan', color:'rgba(168,85,247,0.8)',
      kpis:['Extended drain intervals','20k+ OEM cross-refs','VIN search tool'] },
    { icon:'⚙️', name:'Power Generation', code:'IND-07',
      stat:'ISO 4406: 16/14/11', color:'rgba(20,184,166,0.8)',
      kpis:['Gas turbine lubrication','High-temp lube oil','Continuous operation'] },
    { icon:'🏭', name:'Manufacturing', code:'IND-08',
      stat:'CNC hydraulic circuits', color:'rgba(251,146,60,0.8)',
      kpis:['Precision hydraulics','ISO cleanliness 14/12/9','Servo valve protection'] },
    { icon:'🌊', name:'Water & Utilities', code:'IND-09',
      stat:'Continuous duty rated', color:'rgba(56,189,248,0.8)',
      kpis:['Pump protection','SYNTEPORE membrane','NSF-rated media'] },
  ];

  return (
    <Section id="industries" bg={S2} style={{ padding:'8rem 0' }}>
      <Container>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:'4rem', flexWrap:'wrap', gap:'2rem' }}>
          <div>
            <Label>INDUSTRY COVERAGE</Label>
            <H2>Built for the<br /><span style={{ color: G }}>World's Hardest Jobs.</span></H2>
          </div>
          <Body style={{ maxWidth:360 }}>
            Twelve industries. One filtration standard. Every ELIMFILTERS® product
            is specified against the operating parameters of your exact application.
          </Body>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1px',
          background: W1, border:`1px solid ${W1}`, borderRadius:8, overflow:'hidden' }}>
          {industries.map((ind, i) => (
            <div key={i} style={{
              background: S2, padding:'1.75rem',
              transition:'background 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = S3)}
              onMouseLeave={e => (e.currentTarget.style.background = S2)}
            >
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'1rem' }}>
                <span style={{ fontSize:'1.75rem' }}>{ind.icon}</span>
                <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.55rem',
                  color: W3 }}>{ind.code}</span>
              </div>
              <h3 style={{ fontFamily:'Outfit, sans-serif', fontSize:'1.1rem',
                fontWeight:700, color: W, marginBottom:'0.4rem' }}>{ind.name}</h3>
              <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.7rem',
                color: ind.color, marginBottom:'1rem' }}>{ind.stat}</div>
              <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                {ind.kpis.map(k => (
                  <div key={k} style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <div style={{ width:4, height:4, borderRadius:'50%',
                      background: ind.color, flexShrink:0 }} />
                    <span style={{ fontFamily:'Inter, sans-serif', fontSize:'0.72rem', color: W3 }}>{k}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── 07 DISTRIBUTOR ───────────────────────────────────────────────────────────
function Distributor() {
  return (
    <Section id="distributor" style={{ padding:'8rem 0 10rem' }}>
      <div style={{ position:'absolute', inset:0,
        background:'radial-gradient(ellipse 70% 60% at 50% 100%, rgba(255,241,45,0.04) 0%, transparent 60%)' }} />
      <Container style={{ position:'relative', zIndex:1 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'5rem', alignItems:'center' }}>
          <div>
            <Label>DISTRIBUTOR PROGRAMME</Label>
            <H2>Only the Best<br /><span style={{ color: G }}>Sell ELIMFILTERS®.</span></H2>
            <Body style={{ marginTop:'1.5rem', marginBottom:'2.5rem' }}>
              A selective network. Territory agreements. Co-marketing support.
              A technical catalogue that positions your business as the expert source
              in your market — not just another parts supplier.
            </Body>

            <div style={{ display:'grid', gap:'1rem', marginBottom:'2.5rem' }}>
              {[
                { n:'01', t:'Apply', d:'Submit company details and territory of operation.' },
                { n:'02', t:'Territory Review', d:'We review for market fit and strategic alignment.' },
                { n:'03', t:'Onboarding', d:'Portal access, catalogue, pricing, and technical training.' },
                { n:'04', t:'First Order', d:'Opening stock with ELIMFILTERS® launch support.' },
              ].map(s => (
                <div key={s.n} style={{ display:'flex', gap:'1.25rem', alignItems:'flex-start',
                  padding:'1rem 1.25rem', background: S2, border:`1px solid ${W1}`, borderRadius:5 }}>
                  <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.7rem',
                    color: G, minWidth:28, paddingTop:2 }}>{s.n}</span>
                  <div>
                    <div style={{ fontFamily:'Outfit, sans-serif', fontSize:'0.95rem',
                      fontWeight:700, color: W, marginBottom:3 }}>{s.t}</div>
                    <div style={{ fontFamily:'Inter, sans-serif', fontSize:'0.8rem', color: W6 }}>{s.d}</div>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/distributor-application" style={{
              display:'inline-block', padding:'16px 40px', background: G, color:'#000',
              fontFamily:'Outfit, sans-serif', fontWeight:700, fontSize:'0.9rem',
              letterSpacing:'0.1em', borderRadius:3, textDecoration:'none',
            }}>
              APPLY NOW →
            </Link>
          </div>

          {/* Tier cards */}
          <div style={{ display:'grid', gap:'1rem' }}>
            {[
              { name:'ASSOCIATE', badge:'Entry', color:'rgba(156,163,175,0.8)',
                features:['Full product catalogue','Cross-reference tool','Technical data sheets','Email support'],
                highlight:false },
              { name:'PREMIER', badge:'Most Common', color:'rgba(59,130,246,0.85)',
                features:['Everything in Associate','Territory exclusivity','Priority stock allocation','Dedicated account manager','Co-marketing materials'],
                highlight:true },
              { name:'ELITE', badge:'Invite Only', color: G,
                features:['Everything in Premier','Custom SKU programs','OEM co-development access','Advance product access','Board-level partnership'],
                highlight:false },
            ].map((t, i) => (
              <div key={i} style={{
                background: t.highlight ? 'rgba(59,130,246,0.04)' : S2,
                border:`1px solid ${t.highlight ? 'rgba(59,130,246,0.25)' : W1}`,
                borderLeft:`3px solid ${t.color}`,
                borderRadius:6, padding:'1.5rem',
              }}>
                <div style={{ display:'flex', alignItems:'center',
                  justifyContent:'space-between', marginBottom:'1rem' }}>
                  <span style={{ fontFamily:'Outfit, sans-serif', fontSize:'1rem',
                    fontWeight:700, color: t.color }}>{t.name}</span>
                  <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.6rem',
                    color: W3, padding:'3px 8px', border:`1px solid ${W1}`, borderRadius:2 }}>
                    {t.badge}
                  </span>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4px 1rem' }}>
                  {t.features.map(f => (
                    <div key={f} style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ color: t.color, fontSize:'0.7rem' }}>✓</span>
                      <span style={{ fontFamily:'Inter, sans-serif', fontSize:'0.78rem', color: W6 }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── NAV ──────────────────────────────────────────────────────────────────────
const NAV = [
  { id:'hero', label:'Overview' },
  { id:'contamination', label:'Contamination' },
  { id:'comparison', label:'Comparison' },
  { id:'technology', label:'Technology' },
  { id:'roi', label:'ROI Calculator' },
  { id:'industries', label:'Industries' },
  { id:'distributor', label:'Distributors' },
];

function Nav() {
  const [active, setActive] = useState('hero');
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }),
      { threshold: 0.35 }
    );
    NAV.forEach(s => { const el = document.getElementById(s.id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  return (
    <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100,
      background:'rgba(0,0,0,0.9)', backdropFilter:'blur(16px)',
      borderBottom:`1px solid ${W1}`, height:52,
      display:'flex', alignItems:'center' }}>
      <div style={{ maxWidth:1160, margin:'0 auto', padding:'0 2rem',
        display:'flex', alignItems:'center', gap:'0.25rem', width:'100%' }}>
        <Link href="/" style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.72rem',
          color: G, fontWeight:600, letterSpacing:'0.15em', textDecoration:'none',
          marginRight:'1.5rem', flexShrink:0 }}>
          ELIMFILTERS®
        </Link>
        <div style={{ width:1, height:18, background: W1, marginRight:'1rem', flexShrink:0 }} />
        <div style={{ display:'flex', gap:'0.15rem', overflowX:'auto',
          scrollbarWidth:'none', flex:1 }}>
          {NAV.map(s => (
            <a key={s.id} href={`#${s.id}`} style={{
              fontFamily:'Inter, sans-serif', fontSize:'0.72rem',
              color: active === s.id ? G : W3,
              textDecoration:'none', padding:'5px 12px',
              borderRadius:3,
              background: active === s.id ? G3 : 'transparent',
              border:`1px solid ${active === s.id ? GB : 'transparent'}`,
              whiteSpace:'nowrap', transition:'all 0.15s',
            }}>
              {s.label}
            </a>
          ))}
        </div>
        <Link href="https://part-search.elimfilters.com" style={{
          fontFamily:'Outfit, sans-serif', fontSize:'0.72rem', fontWeight:700,
          color:'#000', background: G, padding:'7px 16px', borderRadius:3,
          textDecoration:'none', flexShrink:0, letterSpacing:'0.06em',
          marginLeft:'1rem',
        }}>
          SEARCH PARTS
        </Link>
      </div>
    </nav>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function PremiumPreview() {
  return (
    <main style={{ background: S1, color: W, minHeight:'100vh' }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        input[type=range] { height: 4px; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: rgba(255,241,45,0.2); border-radius: 3px; }
      `}</style>
      <Nav />
      <div style={{ paddingTop: 52 }}>
        <Hero />
        <CostOfFailure />
        <ComparisonTable />
        <Technology />
        <ROICalculator />
        <Industries />
        <Distributor />
      </div>
    </main>
  );
}
