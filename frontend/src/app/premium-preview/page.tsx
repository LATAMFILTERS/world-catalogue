'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'motion/react';
import Link from 'next/link';

// ─── Design tokens ────────────────────────────────────────────────────────────
const GOLD = '#FFF12D';
const GOLD_DIM = 'rgba(255,241,45,0.6)';
const GOLD_FAINT = 'rgba(255,241,45,0.08)';
const GOLD_BORDER = 'rgba(255,241,45,0.2)';
const SURFACE = '#0d0d0d';
const ELEVATED = '#141414';
const TEXT_PRIMARY = '#fff';
const TEXT_MUTED = 'rgba(255,255,255,0.55)';
const TEXT_DIM = 'rgba(255,255,255,0.35)';

// ─── Section nav ──────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'hero',          label: 'Hero' },
  { id: 'contamination', label: 'Contamination' },
  { id: 'technologies',  label: 'Technology' },
  { id: 'industries',    label: 'Industries' },
  { id: 'knowledge',     label: 'Knowledge' },
  { id: 'distributor',   label: 'Distributor' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Tag({ children, color = GOLD }: { children: React.ReactNode; color?: string }) {
  return (
    <span style={{
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '0.65rem',
      letterSpacing: '0.15em',
      color,
      padding: '3px 8px',
      border: `1px solid ${color === GOLD ? GOLD_BORDER : 'rgba(255,255,255,0.15)'}`,
      borderRadius: 3,
    }}>
      {children}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '0.65rem',
      letterSpacing: '0.2em',
      color: GOLD,
      opacity: 0.8,
      marginBottom: '1.2rem',
      textTransform: 'uppercase',
    }}>
      // {children}
    </p>
  );
}

function Divider() {
  return (
    <div style={{
      height: 1,
      background: 'linear-gradient(90deg, transparent, rgba(255,241,45,0.15), transparent)',
      margin: '0',
    }} />
  );
}

// ─── Wave canvas ──────────────────────────────────────────────────────────────
function WaveCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let raf: number;

    function resize() {
      canvas!.width = canvas!.offsetWidth;
      canvas!.height = canvas!.offsetHeight;
    }

    function drawWave(t: number, yR: number, aR: number, freq: number, speed: number, phase: number, alpha: number, lw: number) {
      const W = canvas!.width, H = canvas!.height;
      ctx.beginPath();
      ctx.strokeStyle = `rgba(255,241,45,${alpha})`;
      ctx.lineWidth = lw;
      for (let x = 0; x <= W; x += 3) {
        const r = x / W;
        const y = H * yR
          + H * aR * Math.sin(r * Math.PI * 2 * freq + t * speed + phase)
          + H * aR * 0.35 * Math.sin(r * Math.PI * 2 * freq * 1.7 + t * speed * 1.4 + phase + 1.2);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    function animate(now: number) {
      const t = now * 0.001;
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);
      drawWave(t, 0.30, 0.07, 1.4, 0.38, 0.0, 0.45, 2.0);
      drawWave(t, 0.50, 0.06, 1.8, 0.52, 1.8, 0.30, 1.5);
      drawWave(t, 0.68, 0.08, 1.2, 0.30, 3.4, 0.20, 1.2);
      drawWave(t, 0.82, 0.05, 2.2, 0.65, 5.1, 0.12, 1.0);
      raf = requestAnimationFrame(animate);
    }

    resize();
    window.addEventListener('resize', resize);
    raf = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.35, pointerEvents: 'none' }}
    />
  );
}

// ─── Scroll-reveal wrapper ────────────────────────────────────────────────────
function Reveal({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      style={style}
    >
      {children}
    </motion.div>
  );
}

// ─── Section 1: Homepage Hero ─────────────────────────────────────────────────
function HeroSection() {
  const [searchVal, setSearchVal] = useState('');
  const [focused, setFocused] = useState(false);

  const stats = [
    { num: '2,000+', label: 'Active SKUs' },
    { num: '20k+',   label: 'OEM Cross-Refs' },
    { num: '12',     label: 'Industries' },
    { num: '99.9%',  label: 'Media Efficiency' },
  ];

  return (
    <section id="hero" style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden', background: '#000' }}>
      <WaveCanvas />

      {/* Radial glow */}
      <div style={{
        position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 600,
        background: 'radial-gradient(circle, rgba(255,241,45,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 2, maxWidth: 900, margin: '0 auto', padding: 'clamp(5rem,10vw,8rem) 2rem 4rem' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <SectionLabel>HOMEPAGE HERO — SCREEN 01</SectionLabel>

          {/* Eyebrow */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <Tag>ASSET PROTECTION</Tag>
            <Tag>INDUSTRIAL FILTRATION</Tag>
            <Tag color="rgba(255,255,255,0.4)">12 INDUSTRIES</Tag>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(2.6rem, 7vw, 5.2rem)',
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            marginBottom: '1.5rem',
          }}>
            Industrial Filtration.<br />
            <span style={{ color: GOLD }}>Zero Compromise.</span>
          </h1>

          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 'clamp(1rem, 2vw, 1.15rem)',
            color: TEXT_MUTED,
            maxWidth: 560,
            lineHeight: 1.7,
            marginBottom: '3rem',
          }}>
            Engineered filter systems for mining, agriculture, marine and heavy industry.
            OEM-matched specs. 99.9% efficiency. Global catalogue.
          </p>

          {/* Search UI */}
          <div style={{
            display: 'flex',
            gap: 0,
            maxWidth: 560,
            marginBottom: '3.5rem',
          }}>
            <div style={{
              flex: 1,
              position: 'relative',
              border: `1.5px solid ${focused ? GOLD : GOLD_BORDER}`,
              borderRight: 'none',
              borderRadius: '4px 0 0 4px',
              background: 'rgba(0,0,0,0.8)',
              transition: 'border-color 0.2s',
              boxShadow: focused ? `0 0 20px rgba(255,241,45,0.12)` : 'none',
            }}>
              <input
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Search by part number, OEM, or application..."
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>
            <button style={{
              padding: '14px 24px',
              background: GOLD,
              color: '#000',
              border: 'none',
              borderRadius: '0 4px 4px 0',
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              fontSize: '0.8rem',
              letterSpacing: '0.1em',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}>
              FIND FILTER
            </button>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap' }}>
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
              >
                <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.6rem', fontWeight: 700, color: GOLD, lineHeight: 1 }}>
                  {s.num}
                </div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: TEXT_MUTED, marginTop: 4, letterSpacing: '0.05em' }}>
                  {s.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', zIndex: 2 }}
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <div style={{ width: 1, height: 40, background: `linear-gradient(180deg, ${GOLD}, transparent)`, margin: '0 auto' }} />
      </motion.div>
    </section>
  );
}

// ─── Section 2: Contamination Story ──────────────────────────────────────────
function ContaminationSection() {
  const particles = [
    { size: '100 µm', label: 'Visible to naked eye', example: 'Human hair cross-section', color: 'rgba(239,68,68,0.7)' },
    { size: '40 µm',  label: 'Hydraulic damage zone', example: 'ISO code ≥ 20/18/15', color: 'rgba(245,158,11,0.7)' },
    { size: '10 µm',  label: 'Critical wear range', example: 'Most component clearances', color: 'rgba(255,241,45,0.7)' },
    { size: '4 µm',   label: 'Silting / stiction', example: 'Control valve orifices', color: 'rgba(34,197,94,0.7)' },
    { size: '1 µm',   label: 'ELIMFILTERS® capture', example: 'NANOCORE β₁(c) = 1000', color: GOLD },
  ];

  const failures = [
    { num: '01', title: 'Injector Erosion', desc: 'Micronic particles deform spray orifices, causing immediate power loss and poor combustion efficiency.', stat: '8% MORE FUEL' },
    { num: '02', title: 'Bearing Failure', desc: 'Sub-10µm particles in the oil film accelerate metal fatigue, reducing component life.', stat: '40% SHORTER LIFE' },
    { num: '03', title: 'Valve Silting', desc: 'Particles smaller than 5µm accumulate in proportional valve orifices, causing drift and instability.', stat: '3× DOWNTIME' },
  ];

  return (
    <section id="contamination" style={{ background: '#000', padding: '7rem 2rem' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <Reveal>
          <SectionLabel>CONTAMINATION STORY — SCREEN 02</SectionLabel>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            marginBottom: '1rem',
          }}>
            Invisible Particles.<br />
            <span style={{ color: GOLD }}>Catastrophic Damage.</span>
          </h2>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', color: TEXT_MUTED, maxWidth: 580, lineHeight: 1.75, marginBottom: '4rem' }}>
            Most contamination is invisible to the naked eye. A single particle at 10µm — one tenth of a millimetre — is enough to trigger progressive wear in hydraulic systems operating at 350 bar.
          </p>
        </Reveal>

        {/* Particle scale */}
        <Reveal delay={0.1}>
          <div style={{
            background: SURFACE,
            border: `1px solid ${GOLD_BORDER}`,
            borderRadius: 8,
            overflow: 'hidden',
            marginBottom: '4rem',
          }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', letterSpacing: '0.15em', color: GOLD_DIM }}>
                PARTICLE SIZE SPECTRUM — ISO 4406 REFERENCE
              </p>
            </div>
            {particles.map((p, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                padding: '1rem 2rem',
                borderBottom: i < particles.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}>
                {/* Size indicator bar */}
                <div style={{ width: 160, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    height: 6,
                    width: `${Math.max(20, 100 - i * 18)}%`,
                    background: p.color,
                    borderRadius: 3,
                    transition: 'width 0.3s',
                  }} />
                </div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem', fontWeight: 600, color: p.color, width: 60, flexShrink: 0 }}>
                  {p.size}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem', fontWeight: 600, color: '#fff', marginBottom: 2 }}>{p.label}</div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: TEXT_DIM }}>{p.example}</div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Failure mode cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {failures.map((f, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div style={{
                background: SURFACE,
                border: `1px solid rgba(255,255,255,0.06)`,
                borderTop: `3px solid ${i === 0 ? 'rgba(239,68,68,0.6)' : i === 1 ? 'rgba(245,158,11,0.6)' : GOLD_BORDER}`,
                borderRadius: 8,
                padding: '1.75rem',
              }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: TEXT_DIM, marginBottom: '0.75rem' }}>{f.num}</div>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem' }}>{f.title}</h3>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: TEXT_MUTED, lineHeight: 1.7, marginBottom: '1.5rem' }}>{f.desc}</p>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: GOLD,
                  padding: '8px 12px',
                  background: GOLD_FAINT,
                  border: `1px solid ${GOLD_BORDER}`,
                  borderRadius: 4,
                  display: 'inline-block',
                }}>
                  {f.stat}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section 3: Technology Gallery ───────────────────────────────────────────
function TechnologySection() {
  const [active, setActive] = useState(0);

  const techs = [
    {
      id: 'DRYCORE',
      tagline: 'Multi-Layer Cellulose Matrix',
      desc: 'Three-layer gradient density media. Coarse outer layer captures macro-particles; fine inner layer retains sub-10µm contamination. Optimized for air intake systems in dusty mining and agriculture environments.',
      specs: [
        { k: 'Media Type', v: 'Cellulose/Synthetic' },
        { k: 'Efficiency', v: 'β₁₀(c) ≥ 200' },
        { k: 'Collapse ΔP', v: '≥ 250 kPa' },
        { k: 'Temp Range', v: '-40°C to +120°C' },
        { k: 'Standard', v: 'ISO 5011' },
        { k: 'Applications', v: 'Air Intake, Cabins' },
      ],
      color: 'rgba(34,197,94,0.7)',
    },
    {
      id: 'MACROCORE',
      tagline: 'High-Collapse Hydraulic Media',
      desc: 'Wire-mesh reinforced synthetic media for high-pressure hydraulic circuits. Designed for collapse pressures exceeding 350 bar differential. Standard in construction and industrial hydraulics.',
      specs: [
        { k: 'Media Type', v: 'Glass Fibre / Wire Mesh' },
        { k: 'Efficiency', v: 'β₁₀(c) ≥ 1000' },
        { k: 'Collapse ΔP', v: '≥ 350 bar' },
        { k: 'Flow Rate', v: 'Up to 400 L/min' },
        { k: 'Standard', v: 'ISO 16889' },
        { k: 'Applications', v: 'Hydraulic, Transmission' },
      ],
      color: 'rgba(59,130,246,0.7)',
    },
    {
      id: 'SYNTEPORE',
      tagline: 'Synthetic Membrane Filtration',
      desc: 'Electrospun nanofiber membrane on a nonwoven substrate. Sub-micron particle retention for fuel systems, compressors, and pneumatic circuits. Resists moisture saturation.',
      specs: [
        { k: 'Media Type', v: 'Nanofiber Membrane' },
        { k: 'Efficiency', v: 'β₁(c) ≥ 200' },
        { k: 'Water Rejection', v: '> 99.5%' },
        { k: 'Pressure Drop', v: '< 15 kPa nominal' },
        { k: 'Standard', v: 'ISO 8573-1' },
        { k: 'Applications', v: 'Fuel, Compressed Air' },
      ],
      color: 'rgba(245,158,11,0.7)',
    },
    {
      id: 'NANOCORE',
      tagline: 'Sub-Micron Precision Filtration',
      desc: 'Proprietary electrospun PTFE nanofiber matrix. Absolute filtration at 1µm. Designed for critical lube oil circuits, turbine applications, and precision hydraulics where cleanliness codes of 14/12/9 are required.',
      specs: [
        { k: 'Media Type', v: 'PTFE Nanofiber' },
        { k: 'Efficiency', v: 'β₁(c) = 1000' },
        { k: 'Absolute Rating', v: '1 µm' },
        { k: 'Temp Resistance', v: 'Up to +200°C' },
        { k: 'Standard', v: 'ISO 16889 / ISO 4406' },
        { k: 'Applications', v: 'Lube Oil, Turbines' },
      ],
      color: GOLD,
    },
  ];

  const tech = techs[active];

  return (
    <section id="technologies" style={{ background: '#060606', padding: '7rem 2rem' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <Reveal>
          <SectionLabel>TECHNOLOGY GALLERY — SCREEN 03</SectionLabel>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            marginBottom: '1rem',
          }}>
            Proprietary<br /><span style={{ color: GOLD }}>Filter Media.</span>
          </h2>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', color: TEXT_MUTED, maxWidth: 540, lineHeight: 1.75, marginBottom: '3rem' }}>
            Four filtration technologies, each engineered for a specific contamination challenge. Every technology meets or exceeds relevant ISO and SAE standards.
          </p>
        </Reveal>

        {/* Tech selector tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: '2rem', flexWrap: 'wrap' }}>
          {techs.map((t, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              style={{
                padding: '10px 20px',
                background: active === i ? GOLD_FAINT : 'transparent',
                border: `1px solid ${active === i ? GOLD_BORDER : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 4,
                color: active === i ? GOLD : TEXT_MUTED,
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.75rem',
                letterSpacing: '0.1em',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {t.id}
            </button>
          ))}
        </div>

        {/* Active tech panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '2rem',
              background: SURFACE,
              border: `1px solid ${GOLD_BORDER}`,
              borderTop: `3px solid ${tech.color}`,
              borderRadius: 8,
              padding: '2.5rem',
            }}
          >
            {/* Left: description */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}>
                <span style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '1.8rem',
                  fontWeight: 700,
                  color: tech.color,
                }}>
                  {tech.id}
                </span>
                <div style={{
                  height: 1,
                  flex: 1,
                  background: `linear-gradient(90deg, ${tech.color}40, transparent)`,
                }} />
              </div>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: tech.color, opacity: 0.8, marginBottom: '1rem', letterSpacing: '0.1em' }}>
                {tech.tagline}
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: TEXT_MUTED, lineHeight: 1.75 }}>
                {tech.desc}
              </p>
            </div>

            {/* Right: specs */}
            <div>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.15em', color: TEXT_DIM, marginBottom: '1rem' }}>
                TECHNICAL SPECIFICATIONS
              </p>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {tech.specs.map((s, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBottom: '0.75rem',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                  }}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: TEXT_MUTED }}>{s.k}</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: '#fff', fontWeight: 600 }}>{s.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

// ─── Section 4: Industry Experience ──────────────────────────────────────────
function IndustriesSection() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const industries = [
    {
      icon: '⛏',
      name: 'Mining',
      challenge: 'Extreme dust loads, abrasive slurry, high-cycle hydraulics.',
      filters: ['DRYCORE Air', 'MACROCORE Hydraulic', 'NANOCORE Lube'],
      stat: '4,000+ hr service life',
      color: 'rgba(245,158,11,0.8)',
    },
    {
      icon: '🚜',
      name: 'Agriculture',
      challenge: 'Seasonal field dust, high vibration, rapid filter cycling.',
      filters: ['DRYCORE Cabin', 'SYNTEPORE Fuel', 'MACROCORE Hydraulic'],
      stat: 'ISO 4406: 17/15/12',
      color: 'rgba(34,197,94,0.8)',
    },
    {
      icon: '⚓',
      name: 'Marine',
      challenge: 'Salt corrosion, water contamination, fuel bio-fouling.',
      filters: ['SYNTEPORE Fuel', 'NANOCORE Lube', 'MACROCORE Hydraulic'],
      stat: '> 99.5% water rejection',
      color: 'rgba(59,130,246,0.8)',
    },
    {
      icon: '🏗',
      name: 'Construction',
      challenge: 'High-pressure hydraulics, mixed application fleets.',
      filters: ['MACROCORE Hydraulic', 'DRYCORE Air', 'SYNTEPORE Fuel'],
      stat: '350 bar collapse ΔP',
      color: 'rgba(239,68,68,0.8)',
    },
    {
      icon: '🛢',
      name: 'Oil & Gas',
      challenge: 'High-temp lube, critical turbine protection, H₂S resistance.',
      filters: ['NANOCORE Lube', 'SYNTEPORE Gas', 'MACROCORE Hydraulic'],
      stat: 'β₁(c) = 1000',
      color: GOLD,
    },
    {
      icon: '🚚',
      name: 'Fleet & Transport',
      challenge: 'Fuel economy, extended drain intervals, mixed engine types.',
      filters: ['DRYCORE Air', 'SYNTEPORE Fuel', 'NANOCORE Lube'],
      stat: '+45% engine life span',
      color: 'rgba(168,85,247,0.8)',
    },
  ];

  return (
    <section id="industries" style={{ background: '#000', padding: '7rem 2rem' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <Reveal>
          <SectionLabel>INDUSTRY EXPERIENCE — SCREEN 04</SectionLabel>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            marginBottom: '1rem',
          }}>
            12 Industries.<br /><span style={{ color: GOLD }}>One Standard.</span>
          </h2>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', color: TEXT_MUTED, maxWidth: 540, lineHeight: 1.75, marginBottom: '3.5rem' }}>
            Each industry faces distinct contamination challenges. ELIMFILTERS® maps the right technology to each application.
          </p>
        </Reveal>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.25rem' }}>
          {industries.map((ind, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <motion.div
                onHoverStart={() => setHoveredIdx(i)}
                onHoverEnd={() => setHoveredIdx(null)}
                style={{
                  background: hoveredIdx === i ? ELEVATED : SURFACE,
                  border: `1px solid ${hoveredIdx === i ? ind.color.replace('0.8)', '0.35)') : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: 8,
                  padding: '1.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  boxShadow: hoveredIdx === i ? `0 8px 32px ${ind.color.replace('0.8)', '0.1)')}` : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1.8rem' }}>{ind.icon}</span>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.7rem',
                    color: ind.color,
                    padding: '4px 10px',
                    border: `1px solid ${ind.color.replace('0.8)', '0.25)')}`,
                    borderRadius: 3,
                    background: ind.color.replace('0.8)', '0.06)'),
                  }}>
                    {ind.stat}
                  </span>
                </div>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
                  {ind.name}
                </h3>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: TEXT_MUTED, lineHeight: 1.65, marginBottom: '1.25rem' }}>
                  {ind.challenge}
                </p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {ind.filters.map((f, j) => (
                    <span key={j} style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.65rem',
                      color: TEXT_DIM,
                      padding: '3px 8px',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 3,
                    }}>
                      {f}
                    </span>
                  ))}
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section 5: Knowledge System Experience ───────────────────────────────────
function KnowledgeSection() {
  const domains = [
    {
      path: '/knowledge-system/standards',
      label: 'Standards',
      desc: 'ISO 16889, ISO 4406, ISO 5011, SAE J1211. Full test method library.',
      count: '9 articles',
      icon: '◈',
      color: 'rgba(59,130,246,0.8)',
    },
    {
      path: '/knowledge-system/contamination',
      label: 'Contamination',
      desc: 'Particle wear mechanisms, diesel water contamination, hydraulic system failure.',
      count: '4 articles',
      icon: '◉',
      color: 'rgba(239,68,68,0.8)',
    },
    {
      path: '/knowledge-system/fleet',
      label: 'Fleet Management',
      desc: 'Total cost of ownership, downtime reduction, fuel efficiency optimisation.',
      count: '4 articles',
      icon: '◎',
      color: 'rgba(34,197,94,0.8)',
    },
    {
      path: '/knowledge-system/compare',
      label: 'Comparisons',
      desc: 'OEM vs aftermarket, system vs commodity filters, evaluation frameworks.',
      count: '4 articles',
      icon: '◐',
      color: 'rgba(168,85,247,0.8)',
    },
    {
      path: '/knowledge-system/bridges',
      label: 'Application Guides',
      desc: 'Industry-specific selection guides from oem replacement to fleet solutions.',
      count: '4 articles',
      icon: '◑',
      color: 'rgba(245,158,11,0.8)',
    },
    {
      path: '/knowledge-system/science',
      label: 'Filtration Science',
      desc: 'Media physics, Beta ratio mathematics, filter loading curves and theory.',
      count: '1 article',
      icon: '◒',
      color: GOLD,
    },
  ];

  return (
    <section id="knowledge" style={{ background: '#060606', padding: '7rem 2rem' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <Reveal>
          <SectionLabel>KNOWLEDGE SYSTEM — SCREEN 05</SectionLabel>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            marginBottom: '1rem',
          }}>
            The Reference<br /><span style={{ color: GOLD }}>Engineers Use.</span>
          </h2>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', color: TEXT_MUTED, maxWidth: 540, lineHeight: 1.75, marginBottom: '3.5rem' }}>
            Deep technical content across filtration standards, contamination science, fleet economics, and application engineering — built for engineers and procurement teams.
          </p>
        </Reveal>

        {/* Hub card + domain grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Hub entry point */}
          <Reveal delay={0.1}>
            <div style={{
              background: SURFACE,
              border: `1px solid ${GOLD_BORDER}`,
              borderRadius: 8,
              padding: '2rem',
              position: 'sticky',
              top: 120,
            }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: GOLD_DIM, marginBottom: '1rem', letterSpacing: '0.15em' }}>
                KNOWLEDGE HUB
              </p>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem' }}>
                26 Technical Articles
              </h3>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: TEXT_MUTED, lineHeight: 1.7, marginBottom: '1.5rem' }}>
                Structured knowledge architecture covering every dimension of industrial filtration — from particle physics to procurement strategy.
              </p>
              <div style={{ display: 'grid', gap: 8, marginBottom: '1.5rem' }}>
                {[
                  { label: 'Standards Referenced', val: '12+' },
                  { label: 'ISO Standards', val: '5' },
                  { label: 'Industry Domains', val: '6' },
                  { label: 'Languages', val: 'EN · ES' },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: TEXT_MUTED }}>{row.label}</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: GOLD, fontWeight: 600 }}>{row.val}</span>
                  </div>
                ))}
              </div>
              <Link href="/knowledge-system" style={{
                display: 'block',
                textAlign: 'center',
                padding: '12px',
                background: GOLD_FAINT,
                border: `1px solid ${GOLD_BORDER}`,
                borderRadius: 4,
                color: GOLD,
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 700,
                fontSize: '0.8rem',
                letterSpacing: '0.1em',
                textDecoration: 'none',
              }}>
                EXPLORE KNOWLEDGE SYSTEM →
              </Link>
            </div>
          </Reveal>

          {/* Domain list */}
          <div style={{ display: 'grid', gap: '1rem' }}>
            {domains.map((d, i) => (
              <Reveal key={i} delay={i * 0.07}>
                <Link href={d.path} style={{ textDecoration: 'none' }}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1.5rem',
                      background: SURFACE,
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 8,
                      padding: '1.25rem 1.5rem',
                    }}
                  >
                    <span style={{ fontSize: '1.5rem', color: d.color, flexShrink: 0 }}>{d.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 700, color: '#fff' }}>{d.label}</span>
                        <span style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: '0.6rem',
                          color: d.color,
                          padding: '2px 7px',
                          border: `1px solid ${d.color.replace('0.8)', '0.2)')}`,
                          borderRadius: 3,
                        }}>
                          {d.count}
                        </span>
                      </div>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: TEXT_MUTED, lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {d.desc}
                      </p>
                    </div>
                    <span style={{ color: TEXT_DIM, flexShrink: 0 }}>→</span>
                  </motion.div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section 6: Distributor Experience ───────────────────────────────────────
function DistributorSection() {
  const tiers = [
    {
      name: 'ASSOCIATE',
      desc: 'Entry-level distribution. Access to full catalogue and cross-reference tools.',
      features: ['Full product catalogue', 'Cross-reference lookup', 'Technical data sheets', 'Email support'],
      badge: 'Entry',
      color: 'rgba(156,163,175,0.8)',
    },
    {
      name: 'PREMIER',
      desc: 'Established distributors with territory agreements and volume commitments.',
      features: ['Everything in Associate', 'Territory exclusivity', 'Priority stock allocation', 'Dedicated account manager', 'Co-marketing support'],
      badge: 'Featured',
      color: 'rgba(59,130,246,0.8)',
      highlighted: true,
    },
    {
      name: 'ELITE',
      desc: 'Strategic partners. Custom pricing, advanced tooling, and co-development access.',
      features: ['Everything in Premier', 'Custom SKU programs', 'OEM co-development', 'Advance product access', 'Board-level relationship'],
      badge: 'Invite Only',
      color: GOLD,
    },
  ];

  const steps = [
    { num: '01', title: 'Apply Online', desc: 'Submit the distributor application with company details and intended territory.' },
    { num: '02', title: 'Territory Review', desc: 'Our team reviews the application for territory fit and strategic alignment.' },
    { num: '03', title: 'Onboarding', desc: 'Access granted to the distributor portal, catalogue, and technical training.' },
    { num: '04', title: 'First Order', desc: 'Place the opening stock order and launch with ELIMFILTERS® marketing support.' },
  ];

  return (
    <section id="distributor" style={{ background: '#000', padding: '7rem 2rem 10rem' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <Reveal>
          <SectionLabel>DISTRIBUTOR EXPERIENCE — SCREEN 06</SectionLabel>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            marginBottom: '1rem',
          }}>
            Only the Best<br /><span style={{ color: GOLD }}>Sell ELIMFILTERS®.</span>
          </h2>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', color: TEXT_MUTED, maxWidth: 540, lineHeight: 1.75, marginBottom: '3.5rem' }}>
            A selective distribution network built for companies that serve the industrial sector seriously. Territory agreements, co-marketing support, and a catalogue that sells itself.
          </p>
        </Reveal>

        {/* Process steps */}
        <Reveal delay={0.1}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 0,
            background: SURFACE,
            border: `1px solid ${GOLD_BORDER}`,
            borderRadius: 8,
            overflow: 'hidden',
            marginBottom: '3rem',
          }}>
            {steps.map((s, i) => (
              <div key={i} style={{
                padding: '1.5rem',
                borderRight: i < steps.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: GOLD_DIM, marginBottom: '0.75rem' }}>{s.num}</div>
                <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>{s.title}</h4>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: TEXT_MUTED, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Tier cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {tiers.map((t, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div style={{
                background: t.highlighted ? 'rgba(59,130,246,0.04)' : SURFACE,
                border: `1px solid ${t.highlighted ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.06)'}`,
                borderTop: `3px solid ${t.color}`,
                borderRadius: 8,
                padding: '2rem',
                position: 'relative',
              }}>
                {t.highlighted && (
                  <div style={{
                    position: 'absolute',
                    top: -1,
                    right: 16,
                    background: 'rgba(59,130,246,0.9)',
                    color: '#fff',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.6rem',
                    letterSpacing: '0.1em',
                    padding: '4px 10px',
                    borderRadius: '0 0 4px 4px',
                  }}>
                    MOST COMMON
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.75rem' }}>
                  <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: 700, color: t.color }}>{t.name}</h3>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.6rem',
                    color: TEXT_DIM,
                    padding: '2px 8px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 3,
                  }}>
                    {t.badge}
                  </span>
                </div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: TEXT_MUTED, lineHeight: 1.65, marginBottom: '1.5rem' }}>{t.desc}</p>
                <ul style={{ listStyle: 'none', display: 'grid', gap: 8 }}>
                  {t.features.map((f, j) => (
                    <li key={j} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: t.color, fontSize: '0.75rem' }}>✓</span>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: TEXT_MUTED }}>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        {/* CTA */}
        <Reveal delay={0.3}>
          <div style={{
            marginTop: '3rem',
            textAlign: 'center',
            padding: '3rem',
            background: GOLD_FAINT,
            border: `1px solid ${GOLD_BORDER}`,
            borderRadius: 8,
          }}>
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.8rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem' }}>
              Ready to Apply?
            </h3>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', color: TEXT_MUTED, marginBottom: '1.75rem', lineHeight: 1.7 }}>
              Join a selective network of distributors serving industrial markets globally.
            </p>
            <Link href="/distributor-application" style={{
              display: 'inline-block',
              padding: '14px 40px',
              background: GOLD,
              color: '#000',
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              fontSize: '0.9rem',
              letterSpacing: '0.1em',
              borderRadius: 4,
              textDecoration: 'none',
            }}>
              APPLY NOW →
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Sticky section nav ───────────────────────────────────────────────────────
function SectionNav({ active }: { active: string }) {
  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      background: 'rgba(0,0,0,0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${GOLD_BORDER}`,
      display: 'flex',
      alignItems: 'center',
      padding: '0 2rem',
      height: 52,
      gap: '0.25rem',
    }}>
      <Link href="/" style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '0.7rem',
        color: GOLD,
        fontWeight: 600,
        letterSpacing: '0.15em',
        textDecoration: 'none',
        marginRight: '1.5rem',
        flexShrink: 0,
      }}>
        ELIMFILTERS®
      </Link>
      <div style={{ width: 1, height: 20, background: GOLD_BORDER, marginRight: '1rem' }} />
      <div style={{ display: 'flex', gap: '0.25rem', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {SECTIONS.map(s => (
          <a
            key={s.id}
            href={`#${s.id}`}
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.75rem',
              color: active === s.id ? GOLD : TEXT_DIM,
              textDecoration: 'none',
              padding: '6px 12px',
              borderRadius: 4,
              background: active === s.id ? GOLD_FAINT : 'transparent',
              border: `1px solid ${active === s.id ? GOLD_BORDER : 'transparent'}`,
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
            }}
          >
            {s.label}
          </a>
        ))}
      </div>
      <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
        <span style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.6rem',
          color: TEXT_DIM,
          padding: '4px 8px',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 3,
        }}>
          PREVIEW DRAFT
        </span>
      </div>
    </nav>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function PremiumPreviewPage() {
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { threshold: 0.3 }
    );
    SECTIONS.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <main style={{ background: '#000', color: TEXT_PRIMARY, minHeight: '100vh' }}>
      <SectionNav active={activeSection} />
      <div style={{ paddingTop: 52 }}>
        <HeroSection />
        <Divider />
        <ContaminationSection />
        <Divider />
        <TechnologySection />
        <Divider />
        <IndustriesSection />
        <Divider />
        <KnowledgeSection />
        <Divider />
        <DistributorSection />
      </div>
    </main>
  );
}
