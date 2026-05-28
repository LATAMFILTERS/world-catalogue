'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView, useScroll, useTransform, useSpring, animate, MotionValue } from 'motion/react';
import { useTranslation } from 'react-i18next';
import '@/i18n';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const STATS = [
  { value: 99.9, prefix: '', suffix: '%', label: 'MEDIA EFFICIENCY' },
  { value: 45,   prefix: '+', suffix: '%', label: 'ENGINE LIFESPAN' },
  { value: 20,   prefix: '', suffix: 'K+', label: 'OEM CROSS-REFS' },
  { value: 12,   prefix: '', suffix: '',   label: 'INDUSTRIES' },
];

const TECHNOLOGIES = [
  { code: 'MACROCORE™',  role: 'Particulate Capture',       spec: '18µm absolute — ISO 16889 β18[c] ≥ 1000' },
  { code: 'NANOFORCE™',  role: 'Sub-Micron Filtration',     spec: '1µm efficiency — ISO 16889 β1[c] ≥ 200' },
  { code: 'SYNTRAX™',    role: 'Synthetic Media Matrix',    spec: 'High dirt capacity — SAE J1239 Grade 4' },
  { code: 'AQUAGUARD™',  role: 'Water Separation',          spec: '99.8% efficiency — ISO 16332' },
  { code: 'DURATECH™',   role: 'Extended Lifecycle',        spec: '2× interval — ISO 4548-12 compliant' },
  { code: 'IONSHIELD™',  role: 'Cabin Air Protection',      spec: 'PM10 removal — ISO 11155-1' },
];

const FAILURE_MODES = [
  { num: '01', title: 'INJECTOR WEAR',  desc: 'Fuel contamination above ISO 18/16/13 degrades injector nozzles in 500–2,000 hours. Each replacement: $800–$4,000 per cylinder.' },
  { num: '02', title: 'BEARING FAILURE', desc: 'Particles larger than oil film thickness cause abrasive wear. ISO 16/14/11 target extends bearing life 3–5× vs. commodity filtration.' },
  { num: '03', title: 'HYDRAULIC LOSS', desc: 'Proportional valve spools require ISO 17/15/12. Above ISO 20/18/15, spool stiction increases 40–60% within 1,000 operating hours.' },
];

const SLIDE_DURATION = 5000;
const CTA_SLIDES = [
  { tag: '// BECOME A PARTNER', title: 'AUTHORIZED DEALER', highlight: 'NETWORK', button: 'APPLY NOW', href: '/distributor-application' },
  { tag: '// FIND YOUR FILTER', title: 'PART NUMBER', highlight: 'SEARCH', button: 'SEARCH PARTS', href: 'https://part-search.elimfilters.com' },
];

// ─── Lenis smooth scroll ───────────────────────────────────────────────────────

function useLenis() {
  useEffect(() => {
    let lenis: any;
    async function init() {
      const { default: Lenis } = await import('lenis');
      lenis = new Lenis({ duration: 1.2, easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
      function raf(time: number) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }
    init();
    return () => {
      if (lenis) { lenis.destroy(); gsap.ticker.remove((time: number) => lenis.raf(time * 1000)); }
    };
  }, []);
}

// ─── Counter ─────────────────────────────────────────────────────────────────

function Counter({ to, prefix = '', suffix = '' }: { to: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  useEffect(() => {
    if (!inView || !ref.current) return;
    const ctrl = animate(0, to, {
      duration: 2.2,
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

function MagneticButton({ children, href, onClick, style }: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLAnchorElement & HTMLButtonElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setPos({ x: (e.clientX - cx) * 0.35, y: (e.clientY - cy) * 0.35 });
  };
  const onLeave = () => setPos({ x: 0, y: 0 });

  const shared = {
    ref,
    onMouseMove: onMove,
    onMouseLeave: onLeave,
    style: {
      display: 'inline-block',
      background: '#FFF12D',
      color: '#000',
      fontFamily: 'Outfit, sans-serif',
      fontWeight: 800,
      fontSize: '0.72rem',
      letterSpacing: '0.2em',
      padding: '1.1rem 2.75rem',
      textDecoration: 'none',
      textTransform: 'uppercase' as const,
      cursor: 'pointer',
      border: 'none',
      transform: `translate(${pos.x}px, ${pos.y}px)`,
      transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s ease',
      boxShadow: pos.x !== 0 ? '0 8px 48px rgba(255,241,45,0.5)' : '0 0 0 rgba(255,241,45,0)',
      ...style,
    },
  };

  if (href) return <a href={href} target="_blank" rel="noopener noreferrer" {...shared}>{children}</a>;
  return <button onClick={onClick} {...shared}>{children}</button>;
}

// ─── Horizontal marquee ───────────────────────────────────────────────────────

function Marquee({ items }: { items: string[] }) {
  const text = items.join('  ·  ') + '  ·  ';
  return (
    <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', borderTop: '1px solid #1a1a1a', borderBottom: '1px solid #1a1a1a', padding: '1rem 0' }}>
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 22, ease: 'linear', repeat: Infinity }}
        style={{ display: 'inline-block', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase' }}
      >
        {text}{text}
      </motion.div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const { t } = useTranslation();
  useLenis();

  const [activeSlide, setActiveSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [hoveredTech, setHoveredTech] = useState<number | null>(null);

  // Hero parallax
  const { scrollY } = useScroll();
  const rawBgY  = useTransform(scrollY, [0, 800], [0, 220]);
  const bgY     = useSpring(rawBgY, { stiffness: 60, damping: 18 });
  const heroTextY = useTransform(scrollY, [0, 600], [0, 100]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);

  // GSAP: problem section horizontal reveal
  const problemRef = useRef<HTMLElement>(null);
  const problemImgRef = useRef<HTMLDivElement>(null);
  const problemTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!problemRef.current || !problemImgRef.current || !problemTextRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(problemImgRef.current, {
        xPercent: 12,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: problemRef.current,
          start: 'top 75%',
          end: 'top 30%',
          scrub: 1,
        },
      });
      const lines = problemTextRef.current!.querySelectorAll('.reveal-line');
      gsap.from(lines, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: problemTextRef.current,
          start: 'top 70%',
        },
      });
    });
    return () => ctx.revert();
  }, []);

  // GSAP: tech cards cascade
  const techRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!techRef.current) return;
    const ctx = gsap.context(() => {
      const cards = techRef.current!.querySelectorAll('.tech-card');
      gsap.from(cards, {
        y: 60,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: techRef.current,
          start: 'top 70%',
        },
      });
    });
    return () => ctx.revert();
  }, []);

  // CTA slide timer
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

        {/* AI crawler block */}
        <div style={{ display: 'none', visibility: 'hidden' }}>
          ELIMFILTERS® is an industrial asset protection filtration manufacturer based in Frisco, Texas,
          engineering heavy-duty air, fuel, hydraulic, oil, and cabin filtration systems for 12 industries.
          ISO 5011, ISO 16889, ISO 19438 compliant. 20,000+ OEM cross-references.
        </div>

        <style>{`
          @media (max-width: 768px) {
            .hero-h1 { font-size: clamp(3rem, 18vw, 6rem) !important; }
            .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
            .problem-grid { grid-template-columns: 1fr !important; }
            .tech-grid { grid-template-columns: 1fr !important; }
            .cta-h2 { font-size: clamp(2.5rem, 12vw, 4rem) !important; }
            .faq-grid { grid-template-columns: 1fr !important; }
            .why-grid { grid-template-columns: 1fr !important; }
            .asset-grid { grid-template-columns: 1fr !important; }
            .hero-cta-row { flex-direction: column !important; gap: 1.5rem !important; align-items: flex-start !important; }
            .problem-badge { display: none !important; }
          }
          * { box-sizing: border-box; }
          ::selection { background: #FFF12D; color: #000; }
        `}</style>

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', overflow: 'hidden' }}>

          {/* Parallax background */}
          <motion.div style={{
            position: 'absolute', inset: '-30%',
            backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,1) 100%), url(/images/hero-bg.jpg)',
            backgroundSize: 'cover', backgroundPosition: 'center',
            y: bgY, zIndex: 0,
          }} />

          {/* Noise overlay */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 1,
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.04\'/%3E%3C/svg%3E")',
            opacity: 0.4, pointerEvents: 'none',
          }} />

          <motion.div
            style={{ position: 'relative', zIndex: 10, padding: '0 6% 6rem', y: heroTextY, opacity: heroOpacity }}
          >
            {/* Tag */}
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.68rem', letterSpacing: '0.28em', color: '#FFF12D', textTransform: 'uppercase', marginBottom: '1.5rem' }}
            >
              // INDUSTRIAL ASSET PROTECTION · FRISCO, TX
            </motion.p>

            {/* Giant headline */}
            <h1
              className="hero-h1"
              style={{
                fontFamily: 'Outfit, sans-serif', fontWeight: 900,
                fontSize: 'clamp(4rem, 13vw, 11rem)',
                lineHeight: 0.92, letterSpacing: '-0.02em',
                textTransform: 'uppercase', color: '#FFF12D',
                marginBottom: '2rem', overflow: 'hidden',
              }}
            >
              {['ELIM', 'FILTERS'].map((word, wi) => (
                <div key={wi} style={{ overflow: 'hidden' }}>
                  <motion.span
                    initial={{ y: '110%' }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.9, delay: 0.4 + wi * 0.12, ease: [0.16, 1, 0.3, 1] }}
                    style={{ display: 'block' }}
                  >
                    {word}
                  </motion.span>
                </div>
              ))}
            </h1>

            {/* Subline */}
            <div style={{ overflow: 'hidden', marginBottom: '3rem' }}>
              <motion.p
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontFamily: 'Space Grotesk, sans-serif', fontWeight: 300,
                  fontSize: 'clamp(1rem, 3vw, 2rem)',
                  color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase',
                  letterSpacing: '0.12em', maxWidth: '700px',
                }}
              >
                Contamination control for heavy industry
              </motion.p>
            </div>

            {/* CTA row */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.0 }}
              className="hero-cta-row"
              style={{ display: 'flex', alignItems: 'center', gap: '3rem', flexWrap: 'wrap' }}
            >
              <MagneticButton href="https://part-search.elimfilters.com">
                Find My Filter →
              </MagneticButton>
              <p style={{
                fontFamily: 'Inter, sans-serif', fontSize: '0.85rem',
                color: 'rgba(255,255,255,0.45)', maxWidth: '340px', lineHeight: 1.65,
                borderLeft: '2px solid rgba(255,241,45,0.3)', paddingLeft: '1.25rem',
              }}>
                20,000+ OEM cross-references. ISO 16889, ISO 5011, ISO 19438 certified.
              </p>
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
            style={{ position: 'absolute', bottom: '2.5rem', right: '6%', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
          >
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.55rem', letterSpacing: '0.25em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', writingMode: 'vertical-rl' }}>SCROLL</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              style={{ width: 1, height: '40px', background: 'linear-gradient(to bottom, rgba(255,241,45,0.6), transparent)' }}
            />
          </motion.div>
        </section>

        {/* ── MARQUEE ───────────────────────────────────────────────────────── */}
        <Marquee items={['Air Filtration', 'Fuel Systems', 'Hydraulic Control', 'Cabin Safety', 'Lube Oil', 'Compressed Air', 'ISO 16889', 'ISO 5011', 'SAE J1539', 'Mining', 'Agriculture', 'Marine', 'Power Generation']} />

        {/* ── STATS ─────────────────────────────────────────────────────────── */}
        <section style={{ padding: '6rem 6%', background: '#000' }}>
          <div
            className="stats-grid"
            style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0', borderTop: '1px solid #1a1a1a' }}
          >
            {STATS.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.65, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  padding: '3rem 2rem',
                  borderRight: i < 3 ? '1px solid #1a1a1a' : 'none',
                  borderBottom: '1px solid #1a1a1a',
                  position: 'relative', overflow: 'hidden',
                }}
              >
                <motion.div
                  style={{ position: 'absolute', inset: 0, background: 'rgba(255,241,45,0.03)', originX: 0 }}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: i * 0.1 + 0.3 }}
                />
                <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 'clamp(2.5rem, 4vw, 4rem)', color: '#FFF12D', lineHeight: 1, marginBottom: '0.5rem', position: 'relative' }}>
                  <Counter to={s.value} prefix={s.prefix} suffix={s.suffix} />
                </div>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', position: 'relative' }}>
                  {s.label}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── PROBLEM ───────────────────────────────────────────────────────── */}
        <section ref={problemRef} style={{ padding: '8rem 6%', background: '#050505', borderTop: '1px solid #111' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

            <div ref={problemTextRef}>
              <p className="reveal-line" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.28em', color: '#FFF12D', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
                // OPERATIONAL RISK DIAGNOSIS
              </p>
              <h2
                className="reveal-line"
                style={{
                  fontFamily: 'Outfit, sans-serif', fontWeight: 900,
                  fontSize: 'clamp(2.5rem, 6vw, 5.5rem)',
                  textTransform: 'uppercase', lineHeight: 0.95,
                  letterSpacing: '-0.01em', color: '#fff',
                  marginBottom: '4rem',
                }}
              >
                WHAT YOU CAN'T SEE<br />
                <span style={{ color: '#FFF12D', WebkitTextStroke: '0px' }}>IS STOPPING</span><br />
                <span style={{ color: 'rgba(255,255,255,0.18)', fontWeight: 300 }}>YOUR FLEET.</span>
              </h2>
            </div>

            <div className="problem-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'start' }}>

              {/* Left: failure modes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {FAILURE_MODES.map((item, i) => (
                  <motion.div
                    key={item.num}
                    initial={{ opacity: 0, x: -32 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.6, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      padding: '2rem 0',
                      borderBottom: '1px solid #1a1a1a',
                      display: 'grid', gridTemplateColumns: '3rem 1fr', gap: '1.5rem',
                    }}
                  >
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(248,113,113,0.7)', paddingTop: '0.2rem' }}>
                      {item.num}
                    </span>
                    <div>
                      <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.15em', color: '#fff', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                        {item.title}
                      </h3>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
                        {item.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Right: image */}
              <div ref={problemImgRef} style={{ position: 'relative' }}>
                <div style={{
                  aspectRatio: '3/4',
                  backgroundImage: 'url(/images/mecanico-fn.avif)',
                  backgroundSize: 'cover', backgroundPosition: 'center top',
                  filter: 'grayscale(20%)',
                }} />
                {/* Badge */}
                <motion.div
                  className="problem-badge"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  style={{
                    position: 'absolute', bottom: '-1.5rem', left: '-1.5rem',
                    background: '#FFF12D', color: '#000',
                    padding: '1.75rem 2rem',
                    boxShadow: '0 12px 60px rgba(255,241,45,0.4)',
                  }}
                >
                  <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '2.5rem', lineHeight: 1 }}>80%</p>
                  <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.4rem', lineHeight: 1.4 }}>
                    Of premature failures<br />caused by contamination
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* ── TECHNOLOGIES ──────────────────────────────────────────────────── */}
        <section style={{ padding: '8rem 6%', background: '#000', borderTop: '1px solid #111' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem', flexWrap: 'wrap', gap: '2rem' }}>
              <div>
                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.28em', color: '#FFF12D', textTransform: 'uppercase', marginBottom: '1rem' }}
                >
                  // PROPRIETARY TECHNOLOGY STACK
                </motion.p>
                <motion.h2
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    fontFamily: 'Outfit, sans-serif', fontWeight: 900,
                    fontSize: 'clamp(2rem, 5vw, 4rem)',
                    textTransform: 'uppercase', lineHeight: 0.95,
                    color: '#fff', letterSpacing: '-0.01em',
                  }}
                >
                  ASSET<br /><span style={{ color: '#FFF12D' }}>PROTECTION</span><br />TECHNOLOGIES
                </motion.h2>
              </div>
              <motion.a
                href="/technologies"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '0.25rem' }}
              >
                ALL TECHNOLOGIES →
              </motion.a>
            </div>

            <div
              ref={techRef}
              className="tech-grid"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: '#1a1a1a' }}
            >
              {TECHNOLOGIES.map((tech, i) => (
                <div
                  key={tech.code}
                  className="tech-card"
                  onMouseEnter={() => setHoveredTech(i)}
                  onMouseLeave={() => setHoveredTech(null)}
                  style={{
                    background: hoveredTech === i ? '#0a0a0a' : '#000',
                    padding: '2.5rem',
                    cursor: 'default',
                    transition: 'background 0.25s ease',
                    position: 'relative', overflow: 'hidden',
                  }}
                >
                  <motion.div
                    style={{
                      position: 'absolute', bottom: 0, left: 0, height: '2px',
                      background: '#FFF12D', width: hoveredTech === i ? '100%' : '0%',
                      transition: 'width 0.35s cubic-bezier(0.16,1,0.3,1)',
                    }}
                  />
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.2)', marginBottom: '1rem', textTransform: 'uppercase' }}>
                    {String(i + 1).padStart(2, '0')}
                  </p>
                  <h3 style={{
                    fontFamily: 'Outfit, sans-serif', fontWeight: 900,
                    fontSize: '1.3rem', color: hoveredTech === i ? '#FFF12D' : '#fff',
                    marginBottom: '0.5rem', letterSpacing: '0.02em',
                    transition: 'color 0.25s ease',
                  }}>
                    {tech.code}
                  </h3>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '1.5rem' }}>
                    {tech.role}
                  </p>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', color: hoveredTech === i ? 'rgba(255,241,45,0.7)' : 'rgba(255,255,255,0.25)', lineHeight: 1.6, transition: 'color 0.25s ease' }}>
                    {tech.spec}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHY ELIMFILTERS ───────────────────────────────────────────────── */}
        <section style={{ padding: '8rem 6%', background: '#050505', borderTop: '1px solid #111' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div className="why-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6rem', alignItems: 'center' }}>

              {/* Left */}
              <div>
                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.28em', color: '#FFF12D', textTransform: 'uppercase', marginBottom: '1rem' }}
                >
                  // ABOUT ELIMFILTERS®
                </motion.p>
                <motion.h2
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 'clamp(2rem, 4vw, 3.5rem)', textTransform: 'uppercase', lineHeight: 0.95, color: '#fff', letterSpacing: '-0.01em', marginBottom: '2.5rem' }}
                >
                  NOT A FILTER<br />BRAND.<br /><span style={{ color: '#FFF12D' }}>A PROTECTION</span><br />SYSTEM.
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, marginBottom: '1.5rem' }}
                >
                  Filtration is not a product selection problem. It is a contamination control system problem.
                  Equipment reliability is determined by how effectively the total filtration system controls
                  contamination across all critical domains.
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.25 }}
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.75, borderLeft: '2px solid #FFF12D', paddingLeft: '1.25rem' }}
                >
                  25+ years protecting mining, agricultural, marine, and power generation fleets.
                  German engineering. ISO-certified technologies. Frisco, Texas.
                </motion.p>
              </div>

              {/* Right: info architecture */}
              <div>
                <div style={{ background: 'rgba(255,241,45,0.03)', border: '1px solid rgba(255,241,45,0.1)', padding: '3rem' }}>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', letterSpacing: '0.2em', color: 'rgba(255,241,45,0.5)', textTransform: 'uppercase', marginBottom: '2rem' }}>
                    INFORMATION HIERARCHY
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                    {[
                      { label: 'Contamination',          sub: 'Root cause identification' },
                      { label: 'Asset Degradation',      sub: 'Failure mechanism mapping' },
                      { label: 'Standards & Measurement', sub: 'ISO / SAE / ASTM benchmarks' },
                      { label: 'Protection Technologies', sub: 'Engineered control systems' },
                      { label: 'Product Implementation',  sub: 'Specification & deployment' },
                      { label: 'Fleet Optimization',      sub: 'Interval & TCO management' },
                      { label: 'Sustainability Impact',   sub: 'Long-term asset preservation' },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: i * 0.07 }}
                        style={{
                          display: 'grid', gridTemplateColumns: '1.5rem 1fr auto',
                          alignItems: 'center', gap: '1rem',
                          padding: '1rem 0',
                          borderBottom: i < 6 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                        }}
                      >
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.55rem', color: 'rgba(255,241,45,0.4)' }}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <div>
                          <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.75)', margin: 0 }}>{item.label}</p>
                          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', color: 'rgba(255,255,255,0.25)', margin: 0, marginTop: '0.15rem' }}>{item.sub}</p>
                        </div>
                        <div style={{ width: '6px', height: '6px', background: '#FFF12D', opacity: 0.5 }} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────────────── */}
        <section style={{ position: 'relative', overflow: 'hidden', borderTop: '1px solid #111' }}>
          {CTA_SLIDES.map((slide, i) => (
            <div
              key={i}
              style={{
                position: i === activeSlide ? 'relative' : 'absolute',
                top: 0, left: 0, width: '100%',
                opacity: i === activeSlide ? 1 : 0,
                transition: 'opacity 0.9s ease',
                pointerEvents: i === activeSlide ? 'all' : 'none',
                padding: '7rem 6%',
                background: '#000',
              }}
            >
              <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.28em', color: '#FFF12D', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                  {slide.tag}
                </p>
                <h2
                  className="cta-h2"
                  style={{
                    fontFamily: 'Outfit, sans-serif', fontWeight: 900,
                    fontSize: 'clamp(3rem, 8vw, 7rem)',
                    textTransform: 'uppercase', lineHeight: 0.92,
                    letterSpacing: '-0.02em', color: '#fff',
                    marginBottom: '3rem',
                  }}
                >
                  {slide.title}<br />
                  <span style={{ color: '#FFF12D' }}>{slide.highlight}</span>
                </h2>
                <MagneticButton href={slide.href}>{slide.button} →</MagneticButton>
              </div>
            </div>
          ))}

          {/* Dots + progress */}
          <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '0.75rem', padding: '0 6% 3rem', position: 'relative', zIndex: 10 }}>
            {CTA_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveSlide(i)}
                style={{ width: i === activeSlide ? '40px' : '8px', height: '2px', background: i === activeSlide ? '#FFF12D' : '#333', border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.4s ease' }}
              />
            ))}
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, height: '1px', background: '#FFF12D', width: `${progress}%`, transition: 'width 0.1s linear' }} />
        </section>

        {/* ── FAQ ───────────────────────────────────────────────────────────── */}
        <section style={{ padding: '7rem 6%', background: '#050505', borderTop: '1px solid #111' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              style={{ marginBottom: '4rem' }}
            >
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.28em', color: '#FFF12D', textTransform: 'uppercase', marginBottom: '1rem' }}>
                // TECHNICAL REFERENCE
              </p>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 'clamp(2rem, 4vw, 3.5rem)', textTransform: 'uppercase', lineHeight: 0.95, color: '#fff', letterSpacing: '-0.01em' }}>
                COMMON QUESTIONS
              </h2>
            </motion.div>

            <div className="faq-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: '#1a1a1a' }}>
              {[
                {
                  q: 'What is the best air filter for mining equipment?',
                  a: 'MACROCORE™ and NANOFORCE™ technologies achieve 99.9% particulate capture for mining air intake, meeting SAE J1539 and ISO 5011. Selection depends on engine displacement and dust load.',
                },
                {
                  q: 'How often should industrial fuel filters be changed?',
                  a: 'ELIMFILTERS® recommends 500–1,000 hour intervals for heavy diesel engines, 250–500 hours in high-contamination environments. AQUAGUARD™ extends intervals through 99.8% water separation efficiency.',
                },
                {
                  q: 'What ISO cleanliness code should a hydraulic system target?',
                  a: 'Most industrial hydraulic systems require ISO 17/15/12 to protect proportional valve spools. Critical systems may specify ISO 15/13/10. ELIMFILTERS® targets measured cleanliness codes, not product brand.',
                },
                {
                  q: 'Why does contamination cause engine failure?',
                  a: 'Particles wear bearing surfaces, restrict injectors, and degrade seals. Uncontrolled contamination reduces bearing life from 15,000+ hours to 2,000–3,000 hours. System-level control prevents this.',
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  style={{ background: '#000', padding: '2.5rem' }}
                >
                  <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', fontWeight: 700, color: '#FFF12D', marginBottom: '1rem', lineHeight: 1.4 }}>
                    {item.q}
                  </h3>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, margin: 0 }}>
                    {item.a}
                  </p>
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
