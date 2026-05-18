'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView, animate } from 'motion/react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

const PROBLEM_IMAGE = '/images/mecanico-fn.avif';

const FAILURE_MODES = [
  {
    num: '01',
    title: 'Injector Erosion',
    desc: 'Micronic particles deform spray orifices, causing immediate power loss and poor combustion.',
  },
  {
    num: '02',
    title: 'Critical Bearing Friction',
    desc: 'Contaminated oil accelerates metal wear, reducing engine block life by up to 40%.',
  },
  {
    num: '03',
    title: 'Fuel Drainage',
    desc: 'A restricted engine consumes up to 8% more diesel just to maintain the same torque levels.',
  },
];

const STATS = [
  { value: 99.9, suffix: '%', label: 'Media Efficiency' },
  { value: 45, prefix: '+', suffix: '%', label: 'Engine Life Span' },
  { value: 20, suffix: 'k+', label: 'OEM Cross-Refs' },
  { value: null, display: 'GLOBAL', label: 'Texas, USA' },
];

const CTA_SLIDES = [
  {
    tag: '// DEALER NETWORK',
    title: 'ONLY THE BEST',
    highlight: 'SELL ELIMFILTERS.',
    buttonText: 'BECOME A DEALER',
    href: 'https://elimfilters.com/app-dealer-01/',
  },
  {
    tag: '// TECHNICAL SEARCH',
    title: 'THE RIGHT FILTER.',
    highlight: 'SEARCH LIKE A PRO.',
    buttonText: 'FIND MY PART',
    href: 'https://part-search.elimfilters.com',
  },
];

const SLIDE_DURATION = 5000;

// ─── Animation variants ───────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

const fadeLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0 },
};

const fadeRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0 },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const staggerFast = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

// ─── Animated counter ─────────────────────────────────────────────────────────

function Counter({ to, prefix = '', suffix = '' }: { to: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  useEffect(() => {
    if (!inView || !ref.current) return;
    const controls = animate(0, to, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(v) {
        if (ref.current) {
          ref.current.textContent =
            prefix + (Number.isInteger(to) ? Math.round(v).toString() : v.toFixed(1)) + suffix;
        }
      },
    });
    return () => controls.stop();
  }, [inView, to, prefix, suffix]);

  return (
    <span ref={ref} style={{ display: 'inline' }}>
      {prefix}0{suffix}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [progress, setProgress] = useState(0);

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
        setActiveSlide((p) => (p + 1) % CTA_SLIDES.length);
      }
    };
    raf.id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.id);
  }, [activeSlide]);

  return (
    <>
      <Navigation />
      <main>
        <style>{`
          @media (max-width: 768px) {
            .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
            .problem-grid { grid-template-columns: 1fr !important; }
            .problem-badge { display: none !important; }
            .hero-bottom { flex-direction: column !important; }
            .why-grid { grid-template-columns: 1fr !important; }
            .tech-grid { grid-template-columns: 1fr !important; }
          }
          @media (max-width: 480px) {
            .stats-grid { grid-template-columns: 1fr 1fr !important; }
          }
        `}</style>

        {/* ── HERO ── */}
        <section
          style={{
            position: 'relative',
            minHeight: '90vh',
            display: 'flex',
            alignItems: 'flex-end',
            padding: '0 5% 60px',
            backgroundImage:
              'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,1) 100%), url(/images/hero-bg.jpg)',
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          }}
        >
          <div
            style={{
              maxWidth: '1400px',
              margin: '0 auto',
              width: '100%',
              position: 'relative',
              zIndex: 10,
            }}
          >
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
            >
              <motion.p
                variants={fadeUp}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.7rem',
                  letterSpacing: '0.25em',
                  color: '#FFF12D',
                  opacity: 0.9,
                  textTransform: 'uppercase',
                  marginBottom: '1rem',
                }}
              >
                ELIMFILTERS | TOTAL PROTECTION SYSTEMS
              </motion.p>

              <motion.h1
                variants={fadeUp}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 900,
                  fontSize: 'clamp(3rem, 9vw, 7rem)',
                  lineHeight: 1.0,
                  letterSpacing: '0.01em',
                  color: '#FFF12D',
                  textTransform: 'uppercase',
                  marginBottom: '0.5rem',
                }}
              >
                ENGINE FILTRATION
              </motion.h1>

              <motion.h2
                variants={fadeUp}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: 400,
                  fontSize: 'clamp(1.5rem, 4vw, 3.5rem)',
                  lineHeight: 1.1,
                  color: 'rgba(255,255,255,0.75)',
                  textTransform: 'uppercase',
                  marginBottom: '2.5rem',
                }}
              >
                HEAVY-DUTY AND LIGHT-DUTY
              </motion.h2>

              <motion.div
                variants={fadeUp}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="hero-bottom"
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  gap: '2rem',
                }}
              >
                <p
                  style={{
                    maxWidth: '560px',
                    color: 'rgba(255,255,255,0.75)',
                    fontStyle: 'italic',
                    borderLeft: '4px solid #FFF12D',
                    paddingLeft: '1.5rem',
                    fontSize: '1.1rem',
                    lineHeight: 1.65,
                    fontFamily: 'Outfit, sans-serif',
                  }}
                >
                  Engineering filtration designed for those who cannot afford a stalled engine or a
                  fleet out of action.
                </p>
                <motion.a
                  href="https://part-search.elimfilters.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.03, boxShadow: '0 0 32px rgba(255,241,45,0.5)' }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: 'inline-block',
                    background: '#FFF12D',
                    color: '#000',
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    letterSpacing: '0.15em',
                    padding: '1rem 2.5rem',
                    textDecoration: 'none',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                  }}
                >
                  FIND MY FILTER
                </motion.a>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── STATS ── */}
        <section
          style={{
            background: '#000',
            padding: '5rem 8%',
            borderBottom: '1px solid #111',
          }}
        >
          <motion.div
            className="stats-grid"
            variants={staggerFast}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            style={{
              maxWidth: '1400px',
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '2.5rem',
            }}
          >
            {STATS.map((s) => (
              <motion.div
                key={s.label}
                variants={fadeUp}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{ textAlign: 'center' }}
              >
                <div
                  style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 700,
                    fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                    color: '#FFF12D',
                    lineHeight: 1,
                    marginBottom: '0.6rem',
                  }}
                >
                  {s.value !== null ? (
                    <Counter to={s.value} prefix={s.prefix} suffix={s.suffix} />
                  ) : (
                    s.display
                  )}
                </div>
                <p
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    color: '#888',
                    fontSize: '0.7rem',
                  }}
                >
                  {s.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── PROBLEM SECTION ── */}
        <section
          style={{
            padding: '5rem 8%',
            borderBottom: '1px solid rgba(255,255,255,0.03)',
          }}
        >
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
            >
              <motion.p
                variants={fadeUp}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.65rem',
                  letterSpacing: '0.25em',
                  color: '#FFF12D',
                  textTransform: 'uppercase',
                  marginBottom: '0.5rem',
                }}
              >
                // OPERATIONAL RISK DIAGNOSIS
              </motion.p>
              <motion.h2
                variants={fadeUp}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: 700,
                  fontSize: 'clamp(2rem, 5vw, 3.75rem)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em',
                  lineHeight: 1.1,
                  color: 'rgba(255,255,255,0.75)',
                  marginBottom: '3rem',
                }}
              >
                WHAT YOU CAN&apos;T SEE,
                <br />
                <span style={{ color: '#FFF12D' }}>IS STOPPING YOUR FLEET.</span>
              </motion.h2>
            </motion.div>

            <div
              className="problem-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '4rem',
                background: '#050505',
                padding: '3.5rem',
                border: '1px solid #1a1a1a',
                borderRadius: '12px',
                position: 'relative',
              }}
            >
              {/* Left: failure modes */}
              <motion.div
                variants={stagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-80px' }}
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
              >
                <motion.p
                  variants={fadeLeft}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    color: 'rgba(255,255,255,0.75)',
                    fontSize: '1.05rem',
                    marginBottom: '2rem',
                    lineHeight: 1.7,
                    fontFamily: 'Outfit, sans-serif',
                  }}
                >
                  A low-quality filter is an economic decision that ends up costing thousands at
                  the shop. Inefficient filtration allows invisible contaminants to act like
                  sandpaper inside critical components.
                </motion.p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {FAILURE_MODES.map((item) => (
                    <motion.div
                      key={item.num}
                      variants={fadeLeft}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      style={{ display: 'flex', gap: '1.25rem' }}
                    >
                      <div
                        style={{
                          flexShrink: 0,
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          border: '1px solid rgba(180,0,0,0.35)',
                          background: 'rgba(100,0,0,0.12)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <span
                          style={{
                            color: '#f87171',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            fontFamily: 'Outfit, sans-serif',
                          }}
                        >
                          {item.num}
                        </span>
                      </div>
                      <div>
                        <h3
                          style={{
                            color: 'rgba(255,255,255,0.75)',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            fontSize: '0.82rem',
                            marginBottom: '0.3rem',
                            fontFamily: 'Outfit, sans-serif',
                          }}
                        >
                          {item.title}
                        </h3>
                        <p
                          style={{
                            color: 'rgba(255,255,255,0.75)',
                            fontSize: '0.875rem',
                            lineHeight: 1.6,
                            fontFamily: 'Outfit, sans-serif',
                          }}
                        >
                          {item.desc}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Right: image */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                style={{ position: 'relative' }}
              >
                <div
                  style={{
                    position: 'relative',
                    height: '100%',
                    minHeight: '500px',
                    overflow: 'hidden',
                    background: '#000',
                    backgroundImage: `url(${PROBLEM_IMAGE})`,
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                  }}
                />
                <motion.div
                  className="problem-badge"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    position: 'absolute',
                    bottom: '-20px',
                    right: '-20px',
                    background: '#FFF12D',
                    color: '#000',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    maxWidth: '180px',
                    boxShadow: '0 8px 32px rgba(255,241,45,0.3)',
                  }}
                >
                  <p
                    style={{
                      fontSize: '1.75rem',
                      fontWeight: 900,
                      lineHeight: 1,
                      fontFamily: 'Outfit, sans-serif',
                    }}
                  >
                    80%
                  </p>
                  <p
                    style={{
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      marginTop: '0.5rem',
                      lineHeight: 1.4,
                      fontFamily: 'Outfit, sans-serif',
                    }}
                  >
                    Of premature failures are caused by contamination.
                  </p>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── WHY ELIMFILTERS ── */}
        <section style={{ padding: '5rem 8%', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={fadeUp}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 700,
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
                lineHeight: 1.1,
                color: 'rgba(255,255,255,0.75)',
                marginBottom: '3rem',
              }}
            >
              WHY CHOOSE{' '}
              <span style={{ color: '#FFF12D' }}>ELIMFILTERS</span>
            </motion.h2>

            <div
              className="why-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '4rem',
                alignItems: 'center',
              }}
            >
              <motion.div
                variants={stagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
              >
                <motion.p
                  variants={fadeLeft}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '1.1rem',
                    lineHeight: 1.8,
                    color: 'rgba(255,255,255,0.75)',
                    marginBottom: '2rem',
                    textAlign: 'justify',
                  }}
                >
                  ELIMFILTERS is more than a filter manufacturer. We are a company specialized in{' '}
                  <strong style={{ color: '#FFF12D' }}>Asset Protection Technology</strong>, designing
                  solutions that preserve the value and operability of your equipment in the most
                  demanding environments.
                </motion.p>

                <motion.p
                  variants={fadeLeft}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '1rem',
                    lineHeight: 1.8,
                    color: 'rgba(255,255,255,0.75)',
                    marginBottom: '2rem',
                    textAlign: 'justify',
                  }}
                >
                  Every product we develop responds to one reality: the equipment that stops your
                  operation costs hundreds of thousands to repair. A filter is the guardian of that
                  investment.
                </motion.p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[
                    'German engineering in industrial filtration',
                    '25+ years protecting fleets and critical equipment',
                    'Compliance with international ISO standards',
                    'Technical support across 12+ industries',
                  ].map((item, i) => (
                    <motion.div
                      key={item}
                      variants={fadeLeft}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: i * 0.06 }}
                      style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}
                    >
                      <span
                        style={{
                          color: '#FFF12D',
                          fontWeight: 700,
                          fontSize: '1.2rem',
                          marginTop: '-2px',
                        }}
                      >
                        ✓
                      </span>
                      <span
                        style={{
                          fontFamily: 'Outfit, sans-serif',
                          color: 'rgba(255,255,255,0.75)',
                          fontSize: '0.95rem',
                        }}
                      >
                        {item}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                variants={fadeRight}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                <div
                  style={{
                    background: '#050505',
                    padding: '2.5rem',
                    border: '1px solid #1a1a1a',
                    borderRadius: '8px',
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.65rem',
                      letterSpacing: '0.25em',
                      color: '#FFF12D',
                      textTransform: 'uppercase',
                      marginBottom: '1.5rem',
                    }}
                  >
                    // OUR DIFFERENCE
                  </p>
                  <h3
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontWeight: 700,
                      fontSize: '1.3rem',
                      color: 'rgba(255,255,255,0.75)',
                      marginBottom: '1.5rem',
                      lineHeight: 1.3,
                    }}
                  >
                    We don&apos;t sell filters. We protect assets.
                  </h3>
                  <p
                    style={{
                      fontFamily: 'Outfit, sans-serif',
                      fontSize: '0.95rem',
                      lineHeight: 1.7,
                      color: 'rgba(255,255,255,0.75)',
                      marginBottom: '2rem',
                      textAlign: 'justify',
                    }}
                  >
                    While others compete on price, we compete on reliability. Every specification
                    of our products is designed to:
                  </p>
                  <ul
                    style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                    }}
                  >
                    {[
                      'Maximize the lifespan of your equipment',
                      'Minimize total cost of operation',
                      'Guarantee zero downtime from filtration',
                      'Meet environmental standards',
                    ].map((item) => (
                      <li
                        key={item}
                        style={{
                          fontFamily: 'Outfit, sans-serif',
                          fontSize: '0.9rem',
                          color: 'rgba(255,255,255,0.75)',
                          paddingLeft: '1.5rem',
                          position: 'relative',
                        }}
                      >
                        <span
                          style={{
                            position: 'absolute',
                            left: 0,
                            color: '#FFF12D',
                            fontWeight: 700,
                          }}
                        >
                          ◆
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── TECHNOLOGY ADVANTAGE ── */}
        <section style={{ padding: '5rem 8%', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
            >
              <motion.p
                variants={fadeUp}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.65rem',
                  letterSpacing: '0.25em',
                  color: '#FFF12D',
                  textTransform: 'uppercase',
                  marginBottom: '1rem',
                }}
              >
                // PROVEN TECHNOLOGY
              </motion.p>
              <motion.h2
                variants={fadeUp}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: 700,
                  fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em',
                  lineHeight: 1.1,
                  color: 'rgba(255,255,255,0.75)',
                  marginBottom: '3rem',
                }}
              >
                Asset Protection{' '}
                <span style={{ color: '#FFF12D' }}>Technology</span>
              </motion.h2>

              <motion.div
                className="tech-grid"
                variants={stagger}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '2rem',
                }}
              >
                {[
                  {
                    title: 'AI-Formulated Hybrid Media',
                    desc: 'Proprietary media technology developed using mathematical algorithms and laboratory-tested scenarios. Unique formulation delivers exceptional performance that cannot be replicated. Captures microscopic contaminants while maintaining optimal flow efficiency.',
                  },
                  {
                    title: 'Hydrophobic Separation Systems',
                    desc: 'Advanced water and moisture elimination from fuels and lubricants. Prevents corrosion, oxidation, and viscosity degradation. Extends equipment lifespan and reduces maintenance costs while ensuring reliable operation.',
                  },
                  {
                    title: 'Anti-Bypass Structures',
                    desc: '100% guaranteed safety: if bypass occurs, the filter fails safely. Zero risk of sudden contamination events. Ensures absolute protection of critical equipment from particulate and water contamination.',
                  },
                ].map((tech, i) => (
                  <motion.div
                    key={tech.title}
                    variants={fadeUp}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 }}
                    whileHover={{
                      borderColor: 'rgba(255,241,45,0.4)',
                      background: '#0a0a0a',
                      y: -4,
                    }}
                    style={{
                      background: '#050505',
                      padding: '2rem',
                      border: '1px solid #1a1a1a',
                      borderRadius: '8px',
                      transition: 'border-color 0.3s, background 0.3s',
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: 'Space Grotesk, sans-serif',
                        fontWeight: 700,
                        fontSize: '1.05rem',
                        color: '#FFF12D',
                        marginBottom: '1rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {tech.title}
                    </h3>
                    <p
                      style={{
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: '0.9rem',
                        lineHeight: 1.7,
                        color: 'rgba(255,255,255,0.75)',
                        textAlign: 'justify',
                      }}
                    >
                      {tech.desc}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── CTA SLIDES ── */}
        <div
          style={{
            position: 'relative',
            background: '#000',
            borderTop: '1px solid #111',
            overflow: 'hidden',
          }}
        >
          {CTA_SLIDES.map((slide, i) => (
            <div
              key={i}
              style={{
                position: i === activeSlide ? 'relative' : 'absolute',
                top: i === activeSlide ? undefined : 0,
                left: i === activeSlide ? undefined : 0,
                width: '100%',
                opacity: i === activeSlide ? 1 : 0,
                transition: 'opacity 0.8s ease',
                pointerEvents: i === activeSlide ? 'all' : 'none',
                padding: '5rem 8%',
              }}
            >
              <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <p
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.65rem',
                    letterSpacing: '0.25em',
                    color: '#FFF12D',
                    textTransform: 'uppercase',
                    marginBottom: '1.25rem',
                  }}
                >
                  {slide.tag}
                </p>
                <h2
                  style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 700,
                    fontSize: 'clamp(2.25rem, 4.5vw, 4rem)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em',
                    lineHeight: 1.1,
                    color: 'rgba(255,255,255,0.75)',
                    marginBottom: '1.5rem',
                  }}
                >
                  {slide.title}
                  <br />
                  <span style={{ color: '#FFF12D' }}>{slide.highlight}</span>
                </h2>
                <motion.a
                  href={slide.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.03, boxShadow: '0 0 32px rgba(255,241,45,0.5)' }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: 'inline-block',
                    background: '#FFF12D',
                    color: '#000',
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    letterSpacing: '0.15em',
                    padding: '1rem 2.5rem',
                    textDecoration: 'none',
                    textTransform: 'uppercase',
                  }}
                >
                  {slide.buttonText}
                </motion.a>
              </div>
            </div>
          ))}

          {/* dots */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '0.625rem',
              padding: '1rem 0 2.5rem',
              position: 'relative',
              zIndex: 10,
            }}
          >
            {CTA_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveSlide(i)}
                style={{
                  width: '28px',
                  height: '3px',
                  background: i === activeSlide ? '#FFF12D' : '#333',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'background 0.3s ease',
                }}
              />
            ))}
          </div>

          {/* progress bar */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              height: '2px',
              background: '#FFF12D',
              width: `${progress}%`,
            }}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
