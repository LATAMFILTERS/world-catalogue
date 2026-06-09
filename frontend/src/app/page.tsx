'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, animate, useInView } from 'motion/react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

// ─── Data ─────────────────────────────────────────────────────────────────────

const STATS = [
  { value: 99.9, prefix: '', suffix: '%', label: 'Filtration Efficiency', sub: 'β₁₀(c) ≥ 200 · ISO 16889' },
  { value: 45,   prefix: '+', suffix: '%', label: 'Engine Life Extension', sub: '8,000 → 11,600+ hrs' },
  { value: 20,   prefix: '', suffix: 'k+', label: 'OEM Cross-References',  sub: 'All systems · Verified' },
  { value: null, display: 'GLOBAL', label: 'Distribution Network', sub: 'LATAM · NA · Europe' },
];

const FAILURE_MODES = [
  { num: '01', metric: '−12% POWER OUTPUT', title: 'Injector Erosion', desc: 'Micronic particles deform spray orifices, causing immediate power loss and poor combustion.' },
  { num: '02', metric: '−40% ENGINE LIFESPAN', title: 'Bearing Wear', desc: 'Contaminated oil accelerates metal wear, reducing engine block life by up to 40%.' },
  { num: '03', metric: '+8% FUEL CONSUMPTION', title: 'Fuel Efficiency Loss', desc: 'A restricted engine consumes up to 8% more diesel to maintain the same torque levels.' },
];

const TECHNOLOGIES = [
  { code: 'MACROCORE™',  slug: 'macrocore',  domain: 'Air Intake',     spec: 'β₁₀(c) ≥ 200',    logo: '/assets/MACROCORE.avif',  desc: 'AI-formulated hybrid media capturing 99.9% of particulate matter at 10µm absolute. Engineered for mining, construction and agriculture where ambient dust is the primary asset killer.' },
  { code: 'MICROKAPPA™', slug: 'microkappa', domain: 'Cabin Safety',   spec: 'ISO 11155',        logo: '/assets/MICROKAPPA.avif', desc: 'Multilayer cabin air filtration blocking PM10, PM2.5, allergens and chemical vapors. Protects operator health in mining, agriculture and construction environments.' },
  { code: 'DRYCORE™',    slug: 'drycore',    domain: 'Compressed Air', spec: 'ISO 8573-1',       logo: '/assets/DRYCORE.avif',    desc: 'Molecular sieve desiccant technology removing moisture from pneumatic systems. Corrosion prevention and extended service life for air brake, suspension and control circuits.' },
  { code: 'INTEKCORE™',  slug: 'intekcore',  domain: 'Air Intake',     spec: 'ISO 5011',         logo: '/assets/INTEKCORE.avif',  desc: 'High-pressure filter housing architecture with precision-formed sealing surfaces delivering zero-bypass performance under peak system pressure, cold starts and load spikes.' },
  { code: 'HYDROCORE™',  slug: 'hydrocore',  domain: 'Fuel Systems',   spec: '99.8% H₂O SEP.',   logo: '/assets/HYDROCORE.avif',  desc: 'Three-phase water interception — free, emulsified, dissolved — before contamination reaches the injection circuit. Validated at ISO 16332.' },
  { code: 'SYNTEPORE™',  slug: 'syntepore',  domain: 'Air Intake',     spec: 'ISO 5011',         logo: '/assets/SYNTEPORE.avif',  desc: 'All-synthetic intake protection architecture maintaining structural integrity under high-humidity, coastal and marine moisture exposure conditions that degrade cellulose-based media.' },
  { code: 'SYNTRAX™',    slug: 'syntrax',    domain: 'Lube / Oil',     spec: 'ISO 16/14/11',     logo: '/assets/SYNTRAX.avif',    desc: 'Synthetic media lube oil filtration delivering ISO 16/14/11 cleanliness targets. Extends bearing life 3–5× versus commodity filtration in continuous heavy-duty operation.' },
  { code: 'NANOFORCE™',  slug: 'nanoforce',  domain: 'Hydraulic',      spec: 'ISO 17/15/12',     logo: '/assets/NANOFORCE.avif',  desc: 'Sub-micron filtration protecting proportional valve spools and servo cylinders in high-precision hydraulic circuits operating above 3,000 PSI.' },
  { code: 'THERMACORE™', slug: 'thermocore', domain: 'Cooling',        spec: 'SCA RELEASE',      logo: '/assets/THERMACORE.avif', desc: 'Controlled gradual additive release maintaining SCA chemistry within the protection corridor across the full service interval. Eliminates cavitation erosion on cylinder liners.' },
  { code: 'TURBOCORE™',  slug: 'turbocore',  href: '/technologies', domain: 'Turbo Protection', spec: 'INGRESS REDUCTION', logo: '/assets/TURBOCORE.avif', desc: 'Pre-compression intake protection layer designed to shield turbocharger assemblies from abrasive ingress, extending turbo service life under continuous high-load cycles.' },
];

const FAQS = [
  { q: 'What is the best air filter for mining equipment?', a: 'ELIMFILTERS® MACROCORE™ and NANOFORCE™ technologies achieve 99.9% particulate capture efficiency for mining air intake systems, meeting SAE J1539 and ISO 5011 standards. Selection depends on engine displacement and operating environment.' },
  { q: 'How often should industrial fuel filters be changed?', a: 'ELIMFILTERS® recommends fuel filter replacement intervals of 500–1,000 operating hours for heavy-duty diesel engines, or 250–500 hours in high-contamination environments. HYDROCORE™ fuel filters extend change intervals through superior water separation (99.8% efficiency).' },
  { q: 'What ISO cleanliness code should a hydraulic system target?', a: 'Most industrial hydraulic systems require ISO 17/15/12 cleanliness code to protect proportional valve spools. Critical systems may specify ISO 15/13/10. ELIMFILTERS® filtration strategies target measured cleanliness codes, not product brand.' },
  { q: 'Why does contamination cause engine failure?', a: 'Contamination particles wear bearing surfaces, restrict fuel injectors, and degrade seal integrity. Uncontrolled contamination reduces engine bearing life from 15,000+ hours to 2,000–3,000 hours. ELIMFILTERS® system-level contamination control prevents these failure modes.' },
];

// ─── Counter ─────────────────────────────────────────────────────────────────

function Counter({ to, prefix = '', suffix = '' }: { to: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  useEffect(() => {
    if (!inView || !ref.current) return;
    const ctrl = animate(0, to, {
      duration: 2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(v) {
        if (ref.current)
          ref.current.textContent = prefix + (Number.isInteger(to) ? Math.round(v).toString() : v.toFixed(1)) + suffix;
      },
    });
    return () => ctrl.stop();
  }, [inView, to, prefix, suffix]);
  return <span ref={ref}>{prefix}{Number.isInteger(to) ? Math.round(to) : to.toFixed(1)}{suffix}</span>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [activeTech, setActiveTech] = useState(0);

  const heroRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();
  const rawBgY = useTransform(scrollY, [0, 900], [0, 220]);
  const bgY = useSpring(rawBgY, { stiffness: 60, damping: 18 });

  // Parallax for contamination section
  const contaminationRef = useRef<HTMLElement>(null);
  const { scrollYProgress: contaminationProgress } = useScroll({
    target: contaminationRef,
    offset: ['start end', 'end start'],
  });
  const contaminationY = useTransform(contaminationProgress, [0, 1], ['-8%', '8%']);

  return (
    <>
      <Navigation />
      <main style={{ background: '#000', color: '#fff', overflowX: 'hidden' }}>

        {/* ── SEO / AI DIRECT ANSWER (hidden) ────────────────────────────── */}
        <div style={{ display: 'none', visibility: 'hidden' }}>
          <p>ELIMFILTERS® is an industrial asset protection filtration manufacturer based in Frisco, Texas, engineering heavy-duty air, fuel, hydraulic, oil, and cabin filtration systems for 12 industries including mining, agriculture, marine, and power generation. ELIMFILTERS® products comply with ISO 5011, ISO 16889, and ISO 19438 standards and are cross-referenced to 20,000+ OEM specifications, backed by 25+ years of industrial field deployment.</p>
        </div>

        <style>{`
          @media (max-width: 900px) {
            .hero-h1 { font-size: clamp(3.5rem, 16vw, 8rem) !important; line-height: 0.88 !important; }
            .hero-subtitle { font-size: clamp(1rem, 4vw, 1.5rem) !important; }
            .signal-grid { grid-template-columns: repeat(2, 1fr) !important; }
            .failure-list { gap: 0 !important; }
            .tech-selector { flex-direction: column !important; gap: 1rem !important; }
            .tech-tabs { flex-direction: row !important; overflow-x: auto !important; }
            .faq-grid { grid-template-columns: 1fr !important; }
            .hero-actions { flex-direction: column !important; gap: 1rem !important; }
          }
          @keyframes drift {
            0%   { transform: translate(0,0); opacity: 0; }
            10%  { opacity: var(--op); }
            90%  { opacity: var(--op); }
            100% { transform: translate(120px,-45px); opacity: 0; }
          }
          .particle {
            position: absolute;
            width: var(--sz); height: var(--sz);
            background: rgba(255,220,140,0.5);
            border-radius: 50%;
            animation: drift var(--dur) ease-in-out infinite var(--delay);
            pointer-events: none;
          }
        `}</style>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/*  01 · HERO — FULL VIEWPORT · EDITORIAL SCALE TYPOGRAPHY        */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <section ref={heroRef} style={{
          position: 'relative',
          height: '100vh',
          minHeight: '600px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}>
          {/* Parallax background — video */}
          <motion.div style={{ position: 'absolute', inset: 0, zIndex: 0, y: bgY }}>
            <video
              autoPlay
              muted
              loop
              playsInline
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                objectFit: 'cover',
                objectPosition: 'center center',
              }}
            >
              <source src="/images/moleculas.mp4" type="video/mp4" />
            </video>
            {/* Gradient overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.90) 100%)',
            }} />
          </motion.div>

          {/* Left edge mark */}
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 1.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'absolute', left: 0, top: '12%', bottom: '12%',
              width: '3px',
              background: 'linear-gradient(to bottom, transparent, #FFF12D 25%, #FFF12D 75%, transparent)',
              transformOrigin: 'top', zIndex: 3,
            }}
          />

          {/* Contamination particles */}
          {[
            { t: '14%', l: '6%',  sz: '3px', dur: '7s',  dl: '0s',    op: '0.35' },
            { t: '28%', l: '15%', sz: '2px', dur: '9s',  dl: '1.3s',  op: '0.25' },
            { t: '42%', l: '4%',  sz: '4px', dur: '12s', dl: '2.5s',  op: '0.4'  },
            { t: '60%', l: '21%', sz: '2px', dur: '8s',  dl: '0.7s',  op: '0.3'  },
            { t: '75%', l: '11%', sz: '3px', dur: '14s', dl: '3.2s',  op: '0.35' },
            { t: '20%', l: '34%', sz: '2px', dur: '10s', dl: '1.8s',  op: '0.2'  },
            { t: '50%', l: '39%', sz: '3px', dur: '8s',  dl: '4s',    op: '0.25' },
            { t: '8%',  l: '53%', sz: '2px', dur: '11s', dl: '0.4s',  op: '0.2'  },
            { t: '35%', l: '63%', sz: '3px', dur: '9s',  dl: '5s',    op: '0.25' },
            { t: '65%', l: '57%', sz: '4px', dur: '7s',  dl: '1.6s',  op: '0.3'  },
          ].map((p, i) => (
            <div key={i} className="particle" style={{
              top: p.t, left: p.l, zIndex: 2,
              '--sz': p.sz, '--dur': p.dur, '--delay': p.dl, '--op': p.op,
            } as React.CSSProperties} />
          ))}

          {/* Hero content */}
          <div style={{ position: 'relative', zIndex: 10, padding: '0 8% clamp(2rem, 5vh, 3.5rem)' }}>

            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: 'clamp(0.75rem, 1.5vh, 1.25rem)' }}
            >
              <div style={{ width: '28px', height: '2px', background: '#FFF12D', flexShrink: 0 }} />
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.62rem',
                letterSpacing: '0.3em',
                color: '#FFF12D',
                textTransform: 'uppercase',
              }}>INDUSTRIAL FILTRATION SYSTEMS · ASSET PROTECTION</span>
            </motion.div>

            {/* H1 — editorial scale, two lines */}
            <h1 style={{ margin: 0, padding: 0, lineHeight: 0.9 }}>
              <motion.div
                className="hero-h1"
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 900,
                  fontSize: 'clamp(2.5rem, 6vw, 6rem)',
                  lineHeight: 0.9,
                  letterSpacing: '-0.02em',
                  color: '#fff',
                  textTransform: 'uppercase',
                  display: 'block',
                }}
              >PROTECTING</motion.div>
              <motion.div
                className="hero-h1"
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 900,
                  fontSize: 'clamp(2.5rem, 6vw, 6rem)',
                  lineHeight: 0.9,
                  letterSpacing: '-0.02em',
                  color: '#FFF12D',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: 'clamp(1.25rem, 2.5vh, 2rem)',
                }}
              >INDUSTRIAL ASSETS</motion.div>
            </h1>

            {/* Bottom row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
              className="hero-actions"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2.5rem',
                paddingTop: 'clamp(1rem, 2vh, 1.5rem)',
                borderTop: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 'clamp(0.85rem, 1.1vw, 1rem)',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.6)',
                maxWidth: '420px',
                margin: 0,
              }}>
                Through contamination control across 12 industries.
                When equipment fails, operations stop.
              </p>

            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/*  02 · SIGNAL STRIP — 4 FLOATING NUMBERS, NO BOXES              */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <section style={{
          background: '#000',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <motion.div
            className="signal-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}
          >
            {STATS.map((s, i) => (
              <motion.div
                key={i}
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  padding: 'clamp(1.75rem, 3vw, 2.75rem) clamp(1.5rem, 4%, 3.5rem)',
                  borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  position: 'relative',
                }}
              >
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.52rem', letterSpacing: '0.15em',
                  color: 'rgba(255,255,255,0.18)',
                  marginBottom: '0.35rem',
                }}>SYS·{String(i + 1).padStart(2, '0')}</div>

                <div style={{
                  fontFamily: 'Outfit, sans-serif', fontWeight: 800,
                  fontSize: 'clamp(2.25rem, 4.5vw, 4rem)',
                  color: '#FFF12D', lineHeight: 1,
                  letterSpacing: '-0.025em',
                  marginBottom: '0.4rem',
                }}>
                  {s.value !== null
                    ? <Counter to={s.value} prefix={s.prefix} suffix={s.suffix} />
                    : s.display}
                </div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>{s.label}</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.56rem', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.2)' }}>{s.sub}</div>

                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.25 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    position: 'absolute', bottom: 0, left: 0, right: i < 3 ? 0 : 0,
                    height: '2px',
                    background: `linear-gradient(to right, #FFF12D, rgba(255,241,45,${0.12 - i * 0.02}))`,
                    transformOrigin: 'left',
                  }}
                />
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/*  03 · CONTAMINATION — FULL VIEWPORT · PHOTO + ONE NUMBER       */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <section ref={contaminationRef} style={{
          position: 'relative',
          height: '100vh',
          minHeight: '600px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'flex-end',
        }}>
          {/* Full-bleed mechanic photo */}
          <motion.div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'url(/images/mecanico-fn.avif)',
            backgroundSize: '35%',
            backgroundPosition: '72% 40%',
            backgroundRepeat: 'no-repeat',
            backgroundColor: '#000',
            y: contaminationY,
            zIndex: 0,
          }} />

          {/* Heavy dark overlay — stronger at top and bottom */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 1,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.85) 100%)',
          }} />
          {/* Left-side dark vignette */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 1,
            background: 'linear-gradient(to right, rgba(0,0,0,0.82) 0%, transparent 50%)',
          }} />

          {/* Giant background number */}
          <motion.div
            initial={{ opacity: 0, scale: 1.08 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'absolute',
              right: '-2%',
              top: '50%',
              transform: 'translateY(-50%)',
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 900,
              fontSize: 'clamp(14rem, 32vw, 30rem)',
              lineHeight: 1,
              color: 'rgba(255,241,45,0.08)',
              letterSpacing: '-0.04em',
              zIndex: 2,
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          >80%</motion.div>

          {/* Content */}
          <div style={{
            position: 'relative', zIndex: 10,
            padding: '0 8% clamp(3rem, 6vh, 5rem)',
            maxWidth: '780px',
          }}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: 'clamp(1rem, 2vh, 1.5rem)' }}
            >
              <div style={{ width: '28px', height: '2px', background: '#FFF12D' }} />
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.28em', color: '#FFF12D', textTransform: 'uppercase' }}>
                OPERATIONAL RISK DIAGNOSIS
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.85, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <div style={{
                fontFamily: 'Outfit, sans-serif', fontWeight: 900,
                fontSize: 'clamp(3.5rem, 9vw, 8rem)',
                lineHeight: 0.9, letterSpacing: '-0.02em',
                color: '#FFF12D',
                marginBottom: '0.3rem',
              }}>80%</div>
              <div style={{
                fontFamily: 'Outfit, sans-serif', fontWeight: 900,
                fontSize: 'clamp(1.5rem, 3.5vw, 3rem)',
                lineHeight: 1.05, letterSpacing: '-0.01em',
                color: '#fff',
                marginBottom: 'clamp(1rem, 2vh, 1.5rem)',
                textTransform: 'uppercase',
              }}>
                Of premature failures are caused<br />
                by preventable contamination.
              </div>
              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 'clamp(0.85rem, 1.1vw, 1rem)',
                color: 'rgba(255,255,255,0.55)',
                lineHeight: 1.7,
                maxWidth: '480px',
                margin: 0,
              }}>
                A low-quality filter is an economic decision that ends up costing thousands at the shop. Inefficient filtration allows invisible contaminants to act like sandpaper inside critical components.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/*  04 · FAILURE MODES — TYPOGRAPHIC LIST, NO CARDS               */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <section style={{
          padding: 'clamp(4rem, 8vh, 7rem) 8%',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: 'clamp(2.5rem, 5vh, 4rem)' }}
            >
              <div style={{ width: '28px', height: '2px', background: '#FFF12D' }} />
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.28em', color: '#FFF12D', textTransform: 'uppercase' }}>
                WHAT CONTAMINATION DOES TO YOUR EQUIPMENT
              </span>
            </motion.div>

            {/* Typographic list — no cards */}
            <div className="failure-list" style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {FAILURE_MODES.map((item, i) => (
                <motion.div
                  key={item.num}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.65, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '5rem 1fr auto',
                    gap: '2.5rem',
                    alignItems: 'center',
                    padding: 'clamp(2rem, 4vh, 3rem) 0',
                    borderTop: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  {/* Number */}
                  <div style={{
                    fontFamily: 'Outfit, sans-serif', fontWeight: 900,
                    fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
                    color: 'rgba(255,255,255,0.08)',
                    letterSpacing: '-0.03em',
                    lineHeight: 1,
                    userSelect: 'none',
                  }}>{item.num}</div>

                  {/* Content */}
                  <div>
                    <h3 style={{
                      fontFamily: 'Outfit, sans-serif', fontWeight: 800,
                      fontSize: 'clamp(1.4rem, 2.8vw, 2.25rem)',
                      color: '#fff', textTransform: 'uppercase',
                      letterSpacing: '-0.01em',
                      margin: '0 0 0.5rem',
                      lineHeight: 1.1,
                    }}>{item.title}</h3>
                    <p style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 'clamp(0.85rem, 1vw, 0.95rem)',
                      color: 'rgba(255,255,255,0.5)',
                      lineHeight: 1.65,
                      margin: 0,
                      maxWidth: '560px',
                    }}>{item.desc}</p>
                  </div>

                  {/* Metric — right side */}
                  <div style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 'clamp(0.75rem, 1.5vw, 1.1rem)',
                    fontWeight: 700,
                    color: 'rgba(200, 60, 60, 0.9)',
                    letterSpacing: '0.08em',
                    textAlign: 'right',
                    flexShrink: 0,
                  }}>{item.metric}</div>
                </motion.div>
              ))}
              {/* Close border */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }} />
            </div>
          </div>
        </section>

        {/* TECHNOLOGY SECTION REMOVED */}
        {false && <section style={{ display: 'none' }}>
          <div style={{ maxWidth: '1300px', margin: '0 auto' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'clamp(2.5rem, 5vh, 4rem)', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
                  <div style={{ width: '28px', height: '2px', background: '#FFF12D' }} />
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.28em', color: '#FFF12D', textTransform: 'uppercase' }}>PROTECTION TECHNOLOGIES</span>
                </div>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    fontFamily: 'Outfit, sans-serif', fontWeight: 900,
                    fontSize: 'clamp(2rem, 5vw, 4rem)',
                    textTransform: 'uppercase', lineHeight: 0.95,
                    letterSpacing: '-0.02em', color: '#fff', margin: 0,
                  }}
                >
                  Asset Protection<br /><span style={{ color: '#FFF12D' }}>Technology</span>
                </motion.h2>
              </div>
              <motion.a
                href="/technologies"
                whileHover={{ color: '#000', background: '#FFF12D' }}
                transition={{ duration: 0.15 }}
                style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem',
                  letterSpacing: '0.18em', color: 'rgba(255,255,255,0.4)',
                  textDecoration: 'none', textTransform: 'uppercase',
                  padding: '0.65rem 1.25rem',
                  border: '1px solid rgba(255,255,255,0.12)',
                  transition: 'color 0.15s, background 0.15s',
                  flexShrink: 0,
                }}
              >ALL TECHNOLOGIES →</motion.a>
            </div>

            {/* Selector layout */}
            <div className="tech-selector" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '0' }}>

              {/* Tab list */}
              <div className="tech-tabs" style={{
                display: 'flex', flexDirection: 'column',
                borderRight: '1px solid rgba(255,255,255,0.07)',
              }}>
                {TECHNOLOGIES.map((tech, i) => (
                  <button
                    key={tech.code}
                    onClick={() => setActiveTech(i)}
                    style={{
                      background: activeTech === i ? 'rgba(255,241,45,0.06)' : 'transparent',
                      border: 'none',
                      borderLeft: activeTech === i ? '2px solid #FFF12D' : '2px solid transparent',
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                      padding: '1.5rem 1.75rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'background 0.2s, border-color 0.2s',
                    }}
                  >
                    <div style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.55rem', letterSpacing: '0.15em',
                      color: activeTech === i ? '#FFF12D' : 'rgba(255,255,255,0.25)',
                      textTransform: 'uppercase', marginBottom: '0.35rem',
                      transition: 'color 0.2s',
                    }}>{tech.domain}</div>
                    <div style={{
                      fontFamily: 'Outfit, sans-serif', fontWeight: 800,
                      fontSize: '1rem',
                      color: activeTech === i ? '#fff' : 'rgba(255,255,255,0.5)',
                      letterSpacing: '0.02em',
                      transition: 'color 0.2s',
                    }}>{tech.code}</div>
                  </button>
                ))}
              </div>

              {/* Content panel */}
              <motion.div
                key={activeTech}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '420px' }}
              >
                {/* Logo — columna izquierda, grande */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '3rem 2.5rem',
                  borderRight: '1px solid rgba(255,255,255,0.06)',
                  background: 'rgba(255,255,255,0.015)',
                }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={TECHNOLOGIES[activeTech].logo}
                    alt={TECHNOLOGIES[activeTech].code}
                    style={{
                      width: '100%',
                      maxWidth: '300px',
                      height: 'auto',
                      objectFit: 'contain',
                      display: 'block',
                    }}
                  />
                </div>

                {/* Detalles — columna derecha */}
                <div style={{ padding: 'clamp(2rem, 4vw, 3rem)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.58rem', letterSpacing: '0.2em',
                  color: 'rgba(255,241,45,0.6)',
                  textTransform: 'uppercase', marginBottom: '1rem',
                }}>{TECHNOLOGIES[activeTech].domain}</div>

                <p style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 'clamp(0.9rem, 1.1vw, 1.05rem)',
                  color: 'rgba(255,255,255,0.65)',
                  lineHeight: 1.8, margin: '0 0 2.5rem',
                }}>{TECHNOLOGIES[activeTech].desc}</p>

                <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.55rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', marginBottom: '0.3rem' }}>PERFORMANCE SPEC</div>
                    <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#FFF12D', letterSpacing: '-0.01em' }}>
                      {TECHNOLOGIES[activeTech].spec}
                    </div>
                  </div>
                  <motion.a
                    href={TECHNOLOGIES[activeTech].href ?? `/technologies/${TECHNOLOGIES[activeTech].slug}`}
                    whileHover={{ background: '#fff', boxShadow: '0 0 40px rgba(255,241,45,0.3)' }}
                    transition={{ duration: 0.15 }}
                    style={{
                      background: '#FFF12D', color: '#000',
                      fontFamily: 'Outfit, sans-serif', fontWeight: 800,
                      fontSize: '0.7rem', letterSpacing: '0.18em',
                      padding: '0.8rem 1.75rem',
                      textDecoration: 'none', textTransform: 'uppercase',
                    }}
                  >EXPLORE TECHNOLOGY →</motion.a>
                </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/*  06 · WHY ELIMFILTERS — STRIPPED DOWN                          */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <section style={{ padding: 'clamp(4rem, 8vh, 7rem) 8%', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(3rem, 7vw, 7rem)' }} className="why-grid">

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ width: '28px', height: '2px', background: '#FFF12D' }} />
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.28em', color: '#FFF12D', textTransform: 'uppercase' }}>ASSET PROTECTION STRATEGY</span>
              </div>
              <h2 style={{
                fontFamily: 'Outfit, sans-serif', fontWeight: 900,
                fontSize: 'clamp(2rem, 4.5vw, 3.75rem)',
                textTransform: 'uppercase', lineHeight: 0.95,
                letterSpacing: '-0.02em', color: '#fff',
                margin: '0 0 clamp(1.5rem, 3vh, 2.5rem)',
              }}>
                WHY CHOOSE<br /><span style={{ color: '#FFF12D' }}>ELIMFILTERS<sup style={{ fontSize: '0.4em', fontWeight: 400, marginLeft: '0.15em' }}>®</sup></span>
              </h2>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.6)', margin: '0 0 1.25rem' }}>
                ELIMFILTERS® is more than a filter manufacturer. We are a company specialized in{' '}
                <strong style={{ color: '#FFF12D', fontWeight: 600 }}>Asset Protection Technology</strong>,
                designing solutions that preserve the value and operability of your equipment in the most demanding environments.
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', lineHeight: 1.75, color: 'rgba(255,255,255,0.45)', margin: 0, paddingLeft: '1.25rem', borderLeft: '2px solid rgba(255,241,45,0.3)' }}>
                The equipment that stops your operation costs hundreds of thousands to repair. A filter is the guardian of that investment.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              {[
                { code: 'ISO 5011 · 16889', text: 'Certified to international industrial filtration standards' },
                { code: '25+ YEARS', text: 'Field-deployed across critical heavy-duty operations globally' },
                { code: '12 INDUSTRIES', text: 'Mining · Agriculture · Marine · Power Generation · Transport' },
                { code: 'ZERO BYPASS', text: 'Anti-bypass architecture on every protection system' },
                { code: '20,000+ OEM', text: 'Cross-referenced to OEM specifications across all systems' },
              ].map((item, i) => (
                <div key={item.code} style={{
                  display: 'grid',
                  gridTemplateColumns: '7rem 1px 1fr',
                  gap: '1.25rem',
                  alignItems: 'center',
                  padding: 'clamp(1rem, 2vh, 1.25rem) 0',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', letterSpacing: '0.1em', color: '#FFF12D', textAlign: 'right' }}>{item.code}</div>
                  <div style={{ width: '1px', height: '28px', background: 'rgba(255,241,45,0.25)', flexShrink: 0 }} />
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{item.text}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/*  07 · CTA STRIP                                                */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <section style={{
          padding: 'clamp(4rem, 8vh, 6rem) 8%',
          background: '#FFF12D',
        }}>
          <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
            <div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.25em', color: 'rgba(0,0,0,0.45)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>// DEALER NETWORK</div>
              <h2 style={{
                fontFamily: 'Outfit, sans-serif', fontWeight: 900,
                fontSize: 'clamp(1.75rem, 4vw, 3.25rem)',
                textTransform: 'uppercase', lineHeight: 0.95,
                letterSpacing: '-0.02em', color: '#000', margin: 0,
              }}>
                ONLY THE BEST<br />SELL ELIMFILTERS<sup style={{ fontSize: '0.4em', fontWeight: 400, marginLeft: '0.15em' }}>®</sup>.
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <motion.a
                href="/distributor-application"
                whileHover={{ background: '#000', color: '#FFF12D' }}
                transition={{ duration: 0.15 }}
                style={{
                  background: '#000', color: '#FFF12D',
                  fontFamily: 'Outfit, sans-serif', fontWeight: 800,
                  fontSize: '0.72rem', letterSpacing: '0.18em',
                  padding: '0.9rem 2rem',
                  textDecoration: 'none', textTransform: 'uppercase',
                  transition: 'background 0.15s, color 0.15s',
                }}
              >BECOME A DEALER →</motion.a>
              <motion.a
                href="https://part-search.elimfilters.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ background: 'rgba(0,0,0,0.08)' }}
                transition={{ duration: 0.15 }}
                style={{
                  background: 'transparent', color: '#000',
                  fontFamily: 'Outfit, sans-serif', fontWeight: 700,
                  fontSize: '0.72rem', letterSpacing: '0.18em',
                  padding: '0.9rem 2rem',
                  textDecoration: 'none', textTransform: 'uppercase',
                  border: '1px solid rgba(0,0,0,0.25)',
                  transition: 'background 0.15s',
                }}
              >FIND MY FILTER →</motion.a>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/*  08 · FAQ                                                      */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <section style={{ padding: 'clamp(4rem, 8vh, 6rem) 8%', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: 'clamp(2.5rem, 5vh, 4rem)' }}>
              <div style={{ width: '28px', height: '2px', background: '#FFF12D' }} />
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.28em', color: '#FFF12D', textTransform: 'uppercase' }}>
                FREQUENTLY ASKED QUESTIONS
              </span>
            </div>
            <h2 style={{
              fontFamily: 'Outfit, sans-serif', fontWeight: 900,
              fontSize: 'clamp(1.75rem, 4vw, 3rem)',
              textTransform: 'uppercase', lineHeight: 1.0,
              letterSpacing: '-0.015em', color: '#fff',
              margin: '0 0 clamp(2.5rem, 5vh, 4rem)',
            }}>
              Common Questions About<br />
              <span style={{ color: '#FFF12D' }}>Industrial Filtration</span>
            </h2>

            <div className="faq-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'rgba(255,255,255,0.06)' }}>
              {FAQS.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  style={{ background: '#050505', padding: 'clamp(1.75rem, 3vw, 2.5rem)' }}
                >
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.52rem', letterSpacing: '0.15em', color: 'rgba(255,241,45,0.35)', marginBottom: '0.75rem' }}>FAQ·{String(i + 1).padStart(2, '0')}</div>
                  <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', fontWeight: 700, color: '#fff', margin: '0 0 0.875rem', lineHeight: 1.45 }}>{item.q}</h3>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, margin: 0 }}>{item.a}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
