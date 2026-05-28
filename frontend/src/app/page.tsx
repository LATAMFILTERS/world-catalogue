'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView, useScroll, useTransform, useSpring, animate } from 'motion/react';
import { useTranslation } from 'react-i18next';
import '@/i18n';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

// ─── Data ─────────────────────────────────────────────────────────────────────

const STATS = [
  { value: 99.9, prefix: '', suffix: '%', label: 'MEDIA EFFICIENCY' },
  { value: 45,   prefix: '+', suffix: '%', label: 'ENGINE LIFESPAN' },
  { value: 20,   prefix: '', suffix: 'K+', label: 'OEM CROSS-REFS' },
  { value: 12,   prefix: '', suffix: '',   label: 'INDUSTRIES' },
];

const TECHNOLOGIES = [
  { code: 'MACROCORE™',  role: 'Particulate Capture',    spec: '18µm absolute',    std: 'ISO 16889 β18[c] ≥ 1000', n: '01' },
  { code: 'NANOFORCE™',  role: 'Sub-Micron Filtration',  spec: '1µm efficiency',   std: 'ISO 16889 β1[c] ≥ 200',  n: '02' },
  { code: 'SYNTRAX™',    role: 'Synthetic Media Matrix', spec: 'High dirt capacity',std: 'SAE J1239 Grade 4',       n: '03' },
  { code: 'AQUAGUARD™',  role: 'Water Separation',       spec: '99.8% efficiency', std: 'ISO 16332',               n: '04' },
  { code: 'DURATECH™',   role: 'Extended Lifecycle',     spec: '2× service interval',std: 'ISO 4548-12',           n: '05' },
  { code: 'IONSHIELD™',  role: 'Cabin Air Protection',   spec: 'PM10 removal',     std: 'ISO 11155-1',             n: '06' },
];

const FAILURE_MODES = [
  { num: '01', title: 'INJECTOR WEAR',   desc: 'Fuel contamination above ISO 18/16/13 degrades injector nozzles in 500–2,000 hours. Each replacement: $800–$4,000 per cylinder.' },
  { num: '02', title: 'BEARING FAILURE', desc: 'Particles larger than oil film thickness cause abrasive wear. ISO 16/14/11 target extends bearing life 3–5× vs. commodity filtration.' },
  { num: '03', title: 'HYDRAULIC LOSS',  desc: 'Proportional valve spools require ISO 17/15/12. Above ISO 20/18/15, spool stiction increases 40–60% within 1,000 operating hours.' },
];

const SLIDE_DURATION = 5000;
const CTA_SLIDES = [
  { tag: '// BECOME A PARTNER', title: 'AUTHORIZED DEALER', highlight: 'NETWORK',button: 'APPLY NOW',    href: '/distributor-application' },
  { tag: '// FIND YOUR FILTER', title: 'PART NUMBER',       highlight: 'SEARCH', button: 'SEARCH PARTS', href: 'https://part-search.elimfilters.com' },
];

const MARQUEE_ITEMS = ['AIR FILTRATION','FUEL SYSTEMS','HYDRAULIC CONTROL','CABIN SAFETY','LUBE OIL','COMPRESSED AIR','ISO 16889','ISO 5011','SAE J1539','MINING','AGRICULTURE','MARINE','POWER GENERATION','GERMAN ENGINEERING'];

// ─── Counter ─────────────────────────────────────────────────────────────────

function Counter({ to, prefix = '', suffix = '' }: { to: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  useEffect(() => {
    if (!inView || !ref.current) return;
    const ctrl = animate(0, to, {
      duration: 2.4,
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

// ─── Magnetic button ─────────────────────────────────────────────────────────

function MagneticBtn({ children, href, style }: { children: React.ReactNode; href: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [xy, setXY] = useState({ x: 0, y: 0 });
  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setXY({ x: (e.clientX - r.left - r.width / 2) * 0.3, y: (e.clientY - r.top - r.height / 2) * 0.3 });
  };
  return (
    <a
      ref={ref} href={href} target="_blank" rel="noopener noreferrer"
      onMouseMove={onMove} onMouseLeave={() => setXY({ x: 0, y: 0 })}
      style={{
        display: 'inline-block', background: '#FFF12D', color: '#000',
        fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '0.72rem',
        letterSpacing: '0.2em', padding: '1.1rem 2.75rem', textDecoration: 'none',
        textTransform: 'uppercase', cursor: 'pointer',
        transform: `translate(${xy.x}px,${xy.y}px)`,
        transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s ease',
        boxShadow: xy.x !== 0 ? '0 8px 48px rgba(255,241,45,0.45)' : 'none',
        ...style,
      }}
    >
      {children}
    </a>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const { t } = useTranslation();
  const [activeSlide, setActiveSlide] = useState(0);
  const [progress, setProgress] = useState(0);

  // ── Hero scroll parallax ───────────────────────────────────────────────────
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroP } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });

  // ELIM slides left, FILTERS slides right — they split apart
  const elimX   = useTransform(heroP, [0, 1], ['0%', '-25%']);
  const filtersX = useTransform(heroP, [0, 1], ['0%',  '20%']);
  const heroOpacity = useTransform(heroP, [0, 0.6], [1, 0]);
  const bgScale  = useTransform(heroP, [0, 1], [1, 1.18]);
  const bgY      = useTransform(heroP, [0, 1], ['0%', '20%']);

  // Smooth spring for scale
  const bgScaleSpring = useSpring(bgScale, { stiffness: 60, damping: 20 });

  // ── Tech horizontal scroll ─────────────────────────────────────────────────
  const techWrapRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: techP } = useScroll({ target: techWrapRef, offset: ['start start', 'end start'] });
  const techX = useTransform(techP, [0, 1], ['0%', '-62%']);

  // ── CTA timer ─────────────────────────────────────────────────────────────
  useEffect(() => {
    setProgress(0);
    const start = Date.now();
    const raf = { id: 0 };
    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / SLIDE_DURATION) * 100, 100);
      setProgress(pct);
      if (elapsed < SLIDE_DURATION) {
        raf.id = requestAnimationFrame(tick);
      } else {
        setActiveSlide(p => (p + 1) % CTA_SLIDES.length);
      }
    };
    raf.id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.id);
  }, [activeSlide]);

  return (
    <>
      <Navigation />
      <main style={{ background: '#000', color: '#fff', overflowX: 'hidden' }}>

        <div style={{ display: 'none' }}>
          ELIMFILTERS® industrial filtration manufacturer Frisco Texas. ISO 16889, ISO 5011, ISO 19438.
          Air fuel hydraulic cabin lube oil filtration. 20000+ OEM cross references. Mining agriculture marine.
        </div>

        <style>{`
          ::selection { background: #FFF12D; color: #000; }
          * { box-sizing: border-box; margin: 0; }
          @media (max-width: 768px) {
            .hero-elim    { font-size: clamp(4.5rem, 22vw, 7rem) !important; }
            .hero-filters { font-size: clamp(4.5rem, 22vw, 7rem) !important; }
            .stats-grid   { grid-template-columns: repeat(2,1fr) !important; }
            .problem-grid { grid-template-columns: 1fr !important; }
            .why-grid     { grid-template-columns: 1fr !important; }
            .cta-h2       { font-size: clamp(2.5rem,12vw,5rem) !important; }
            .faq-grid     { grid-template-columns: 1fr !important; }
            .problem-badge { display: none !important; }
          }
        `}</style>

        {/* ── HERO ──────────────────────────────────────────────────────────── */}
        <section
          ref={heroRef}
          style={{ position: 'relative', height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
        >
          {/* Parallax BG */}
          <motion.div style={{
            position: 'absolute', inset: '-20%',
            backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.75) 55%, rgba(0,0,0,1) 100%), url(/images/hero-bg.jpg)',
            backgroundSize: 'cover', backgroundPosition: 'center',
            scale: bgScaleSpring, y: bgY, zIndex: 0,
          }} />

          {/* Grid lines overlay */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
            backgroundImage: 'linear-gradient(rgba(255,241,45,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,241,45,0.04) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }} />

          <motion.div style={{ position: 'relative', zIndex: 10, padding: '0 5% 5rem', opacity: heroOpacity }}>

            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.28em', color: '#FFF12D', textTransform: 'uppercase', marginBottom: '0.75rem' }}
            >
              // INDUSTRIAL ASSET PROTECTION · FRISCO, TX
            </motion.p>

            {/* Split headline — ELIM goes left, FILTERS goes right on scroll */}
            <div style={{ overflow: 'hidden', lineHeight: 0.88 }}>
              <motion.div
                className="hero-elim"
                style={{
                  fontFamily: 'Outfit, sans-serif', fontWeight: 900,
                  fontSize: 'clamp(5rem, 16vw, 13rem)',
                  textTransform: 'uppercase', color: '#FFF12D',
                  letterSpacing: '-0.03em', display: 'block',
                  x: elimX,
                }}
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                transition={{ duration: 1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                ELIM
              </motion.div>
              <motion.div
                className="hero-filters"
                style={{
                  fontFamily: 'Outfit, sans-serif', fontWeight: 900,
                  fontSize: 'clamp(5rem, 16vw, 13rem)',
                  textTransform: 'uppercase', color: '#fff',
                  letterSpacing: '-0.03em', display: 'block',
                  WebkitTextStroke: '2px rgba(255,255,255,0.15)',
                  x: filtersX,
                }}
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                transition={{ duration: 1, delay: 0.48, ease: [0.16, 1, 0.3, 1] }}
              >
                FILTERS
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.0 }}
              style={{ display: 'flex', alignItems: 'center', gap: '3rem', flexWrap: 'wrap', marginTop: '2.5rem' }}
            >
              <MagneticBtn href="https://part-search.elimfilters.com">Find My Filter →</MagneticBtn>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', maxWidth: '320px', lineHeight: 1.65, borderLeft: '2px solid rgba(255,241,45,0.3)', paddingLeft: '1.25rem' }}>
                20,000+ OEM cross-references. ISO 16889 · ISO 5011 · ISO 19438.
              </p>
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
            style={{ position: 'absolute', bottom: '2rem', right: '5%', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
          >
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.5rem', letterSpacing: '0.25em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', writingMode: 'vertical-rl' }}>SCROLL</span>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              style={{ width: 1, height: '48px', background: 'linear-gradient(to bottom, rgba(255,241,45,0.6), transparent)' }}
            />
          </motion.div>
        </section>

        {/* ── MARQUEE ───────────────────────────────────────────────────────── */}
        <div style={{ background: '#FFF12D', overflow: 'hidden', padding: '0.85rem 0' }}>
          <motion.div
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 25, ease: 'linear', repeat: Infinity }}
            style={{ display: 'inline-flex', gap: '3rem', whiteSpace: 'nowrap' }}
          >
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
              <span key={i} style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.2em', color: '#000', textTransform: 'uppercase' }}>
                {item} <span style={{ opacity: 0.4 }}>◆</span>
              </span>
            ))}
          </motion.div>
        </div>

        {/* ── STATS ─────────────────────────────────────────────────────────── */}
        <section style={{ padding: '5rem 5%', background: '#000' }}>
          <div className="stats-grid" style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderTop: '1px solid #1a1a1a' }}>
            {STATS.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                style={{ padding: '3rem 2rem', borderRight: i < 3 ? '1px solid #1a1a1a' : 'none', borderBottom: '1px solid #1a1a1a' }}
              >
                <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 'clamp(2.5rem, 4vw, 4.5rem)', color: '#FFF12D', lineHeight: 1, marginBottom: '0.5rem' }}>
                  <Counter to={s.value} prefix={s.prefix} suffix={s.suffix} />
                </div>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>
                  {s.label}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── PROBLEM ───────────────────────────────────────────────────────── */}
        <section style={{ padding: '8rem 5%', background: '#050505', borderTop: '1px solid #111' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.28em', color: '#FFF12D', textTransform: 'uppercase', marginBottom: '1.25rem' }}
            >
              // OPERATIONAL RISK DIAGNOSIS
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontFamily: 'Outfit, sans-serif', fontWeight: 900,
                fontSize: 'clamp(2.5rem, 6vw, 5.5rem)',
                textTransform: 'uppercase', lineHeight: 0.95,
                letterSpacing: '-0.01em', marginBottom: '5rem',
              }}
            >
              WHAT YOU CAN'T SEE<br />
              <span style={{ color: '#FFF12D' }}>IS STOPPING</span><br />
              <span style={{ color: 'rgba(255,255,255,0.15)', fontWeight: 300 }}>YOUR FLEET.</span>
            </motion.h2>

            <div className="problem-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'start' }}>
              <div>
                {FAILURE_MODES.map((item, i) => (
                  <motion.div
                    key={item.num}
                    initial={{ opacity: 0, x: -32 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.6, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                    style={{ padding: '2rem 0', borderBottom: '1px solid #1a1a1a', display: 'grid', gridTemplateColumns: '3rem 1fr', gap: '1.5rem' }}
                  >
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', color: 'rgba(248,113,113,0.7)', paddingTop: '0.15rem' }}>{item.num}</span>
                    <div>
                      <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.15em', color: '#fff', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{item.title}</h3>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                style={{ position: 'relative' }}
              >
                <div style={{ aspectRatio: '3/4', backgroundImage: 'url(/images/mecanico-fn.avif)', backgroundSize: 'cover', backgroundPosition: 'center top', filter: 'grayscale(15%)' }} />
                <motion.div
                  className="problem-badge"
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  style={{ position: 'absolute', bottom: '-1.5rem', left: '-1.5rem', background: '#FFF12D', color: '#000', padding: '1.75rem 2rem', boxShadow: '0 12px 60px rgba(255,241,45,0.4)' }}
                >
                  <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '2.5rem', lineHeight: 1 }}>80%</p>
                  <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.4rem', lineHeight: 1.4 }}>
                    Of premature failures<br />caused by contamination
                  </p>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── TECHNOLOGIES — horizontal scroll ──────────────────────────────── */}
        {/* Outer wrapper is tall so the sticky section gets scroll room */}
        <div ref={techWrapRef} style={{ position: 'relative', height: '400vh', background: '#000', borderTop: '1px solid #111' }}>
          <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

            {/* Header */}
            <div style={{ padding: '0 5%', marginBottom: '3rem' }}>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.28em', color: '#FFF12D', textTransform: 'uppercase', marginBottom: '0.75rem' }}
              >
                // PROPRIETARY TECHNOLOGY STACK — DRAG OR SCROLL
              </motion.p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 'clamp(2rem, 5vw, 4rem)', textTransform: 'uppercase', lineHeight: 0.95, letterSpacing: '-0.01em' }}>
                  ASSET <span style={{ color: '#FFF12D' }}>PROTECTION</span> TECHNOLOGIES
                </h2>
                <a href="/technologies" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.35)', textDecoration: 'none', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.12)', paddingBottom: '0.2rem', whiteSpace: 'nowrap' }}>
                  ALL →
                </a>
              </div>
            </div>

            {/* Horizontally scrolling cards */}
            <div style={{ overflow: 'hidden', paddingLeft: '5%' }}>
              <motion.div
                style={{ display: 'flex', gap: '1px', x: techX, width: 'max-content' }}
              >
                {TECHNOLOGIES.map((tech, i) => (
                  <motion.div
                    key={tech.code}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.08 }}
                    whileHover={{ background: '#0a0a0a' }}
                    style={{
                      width: '360px', flexShrink: 0,
                      background: '#000', border: '1px solid #1a1a1a',
                      padding: '2.5rem', cursor: 'default',
                      position: 'relative', overflow: 'hidden',
                    }}
                  >
                    <motion.div
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      style={{ position: 'absolute', bottom: 0, left: 0, height: '2px', background: '#FFF12D', width: '100%', transformOrigin: 'left' }}
                    />
                    <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.18)', marginBottom: '2rem' }}>
                      {tech.n}
                    </p>
                    <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.6rem', color: '#FFF12D', marginBottom: '0.5rem', letterSpacing: '0.01em' }}>
                      {tech.code}
                    </h3>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '2rem' }}>
                      {tech.role}
                    </p>
                    <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: '1.5rem' }}>
                      <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#fff', marginBottom: '0.25rem' }}>{tech.spec}</p>
                      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,241,45,0.5)' }}>{tech.std}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Progress dots */}
            <div style={{ padding: '2rem 5% 0', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <motion.div style={{ height: '2px', background: '#1a1a1a', flex: 1, maxWidth: '200px', position: 'relative' }}>
                <motion.div style={{ position: 'absolute', left: 0, top: 0, height: '100%', background: '#FFF12D', scaleX: techP, transformOrigin: 'left', width: '100%' }} />
              </motion.div>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.55rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase' }}>SCROLL</span>
            </div>
          </div>
        </div>

        {/* ── WHY ELIMFILTERS ───────────────────────────────────────────────── */}
        <section style={{ padding: '8rem 5%', background: '#050505', borderTop: '1px solid #111' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div className="why-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6rem', alignItems: 'center' }}>
              <div>
                <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
                  style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.28em', color: '#FFF12D', textTransform: 'uppercase', marginBottom: '1rem' }}>
                  // ABOUT ELIMFILTERS®
                </motion.p>
                <motion.h2 initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 'clamp(2rem, 4vw, 3.75rem)', textTransform: 'uppercase', lineHeight: 0.95, letterSpacing: '-0.01em', marginBottom: '2.5rem' }}>
                  NOT A FILTER<br />BRAND.<br /><span style={{ color: '#FFF12D' }}>A PROTECTION</span><br />SYSTEM.
                </motion.h2>
                <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.15 }}
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
                  Filtration is not a product selection problem. It is a contamination control system problem.
                  Equipment reliability is determined by how effectively the total filtration system controls
                  contamination across all critical domains.
                </motion.p>
                <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.25 }}
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.75, borderLeft: '2px solid #FFF12D', paddingLeft: '1.25rem' }}>
                  25+ years protecting mining, agricultural, marine, and power generation fleets. German engineering. Frisco, Texas.
                </motion.p>
              </div>

              <div style={{ background: 'rgba(255,241,45,0.02)', border: '1px solid rgba(255,241,45,0.08)', padding: '3rem' }}>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.2em', color: 'rgba(255,241,45,0.4)', textTransform: 'uppercase', marginBottom: '2rem' }}>
                  CONTAMINATION → PROTECTION HIERARCHY
                </p>
                {[
                  { label: 'Contamination',           sub: 'Root cause identification' },
                  { label: 'Asset Degradation',        sub: 'Failure mechanism mapping' },
                  { label: 'Standards & Measurement',  sub: 'ISO / SAE / ASTM benchmarks' },
                  { label: 'Protection Technologies',  sub: 'Engineered control systems' },
                  { label: 'Product Implementation',   sub: 'Specification & deployment' },
                  { label: 'Fleet Optimization',       sub: 'Interval & TCO management' },
                  { label: 'Sustainability Impact',    sub: 'Long-term asset preservation' },
                ].map((item, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.06 }}
                    style={{ display: 'grid', gridTemplateColumns: '2rem 1fr 1rem', alignItems: 'center', gap: '1rem', padding: '0.85rem 0', borderBottom: i < 6 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                  >
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.55rem', color: 'rgba(255,241,45,0.35)' }}>{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: '0.1rem' }}>{item.label}</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', color: 'rgba(255,255,255,0.22)' }}>{item.sub}</p>
                    </div>
                    <div style={{ width: 5, height: 5, background: '#FFF12D', opacity: 0.4 }} />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────────────── */}
        <section style={{ position: 'relative', overflow: 'hidden', borderTop: '1px solid #111' }}>
          {CTA_SLIDES.map((slide, i) => (
            <div key={i} style={{
              position: i === activeSlide ? 'relative' : 'absolute',
              top: 0, left: 0, width: '100%',
              opacity: i === activeSlide ? 1 : 0,
              transition: 'opacity 0.9s ease',
              pointerEvents: i === activeSlide ? 'all' : 'none',
              padding: '7rem 5%', background: '#000',
            }}>
              <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.28em', color: '#FFF12D', textTransform: 'uppercase', marginBottom: '1.5rem' }}>{slide.tag}</p>
                <h2 className="cta-h2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 'clamp(3rem, 9vw, 8rem)', textTransform: 'uppercase', lineHeight: 0.88, letterSpacing: '-0.02em', color: '#fff', marginBottom: '3rem' }}>
                  {slide.title}<br /><span style={{ color: '#FFF12D' }}>{slide.highlight}</span>
                </h2>
                <MagneticBtn href={slide.href}>{slide.button} →</MagneticBtn>
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', gap: '0.75rem', padding: '0 5% 3rem', position: 'relative', zIndex: 10 }}>
            {CTA_SLIDES.map((_, i) => (
              <button key={i} onClick={() => setActiveSlide(i)}
                style={{ width: i === activeSlide ? '40px' : '8px', height: '2px', background: i === activeSlide ? '#FFF12D' : '#333', border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.4s ease' }} />
            ))}
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, height: '1px', background: '#FFF12D', width: `${progress}%`, transition: 'width 0.1s linear' }} />
        </section>

        {/* ── FAQ ───────────────────────────────────────────────────────────── */}
        <section style={{ padding: '7rem 5%', background: '#050505', borderTop: '1px solid #111' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ marginBottom: '4rem' }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.28em', color: '#FFF12D', textTransform: 'uppercase', marginBottom: '1rem' }}>// TECHNICAL REFERENCE</p>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 'clamp(2rem, 4vw, 3.5rem)', textTransform: 'uppercase', lineHeight: 0.95, letterSpacing: '-0.01em' }}>COMMON QUESTIONS</h2>
            </motion.div>
            <div className="faq-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: '#1a1a1a' }}>
              {[
                { q: 'What is the best air filter for mining equipment?', a: 'MACROCORE™ and NANOFORCE™ achieve 99.9% particulate capture for mining air intake, meeting SAE J1539 and ISO 5011. Selection depends on engine displacement and dust load.' },
                { q: 'How often should industrial fuel filters be changed?', a: 'ELIMFILTERS® recommends 500–1,000 hour intervals for heavy diesel engines, 250–500 hours in high-contamination environments. AQUAGUARD™ extends intervals through 99.8% water separation.' },
                { q: 'What ISO cleanliness code should a hydraulic system target?', a: 'Most industrial hydraulic systems require ISO 17/15/12 to protect proportional valve spools. Critical systems may specify ISO 15/13/10. Target measured cleanliness codes, not product brand.' },
                { q: 'Why does contamination cause engine failure?', a: 'Particles wear bearing surfaces, restrict injectors, and degrade seals. Uncontrolled contamination reduces bearing life from 15,000+ hours to 2,000–3,000 hours.' },
              ].map((item, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.5, delay: i * 0.08 }}
                  style={{ background: '#000', padding: '2.5rem' }}
                >
                  <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', fontWeight: 700, color: '#FFF12D', marginBottom: '1rem', lineHeight: 1.4 }}>{item.q}</h3>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.75 }}>{item.a}</p>
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
