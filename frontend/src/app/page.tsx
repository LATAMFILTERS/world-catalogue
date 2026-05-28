'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView, useScroll, useTransform, animate } from 'motion/react';
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
  { code: 'MACROCORE™',  role: 'Particulate Capture',     spec: '18µm absolute',      std: 'ISO 16889 β18[c] ≥ 1000', n: '01', href: '/technologies/macrocore' },
  { code: 'NANOFORCE™',  role: 'Sub-Micron Filtration',   spec: '1µm efficiency',     std: 'ISO 16889 β1[c] ≥ 200',   n: '02', href: '/technologies/nanoforce' },
  { code: 'SYNTRAX™',    role: 'Synthetic Media Matrix',  spec: 'High dirt capacity', std: 'SAE J1239 Grade 4',        n: '03', href: '/technologies/syntrax' },
  { code: 'AQUAGUARD™',  role: 'Water Separation',        spec: '99.8% efficiency',   std: 'ISO 16332',                n: '04', href: '/technologies/aquaguard' },
  { code: 'DURATECH™',   role: 'Extended Lifecycle',      spec: '2× service interval',std: 'ISO 4548-12',              n: '05', href: '/technologies/duratech' },
  { code: 'IONSHIELD™',  role: 'Cabin Air Protection',    spec: 'PM10 removal',       std: 'ISO 11155-1',              n: '06', href: '/technologies/ionshield' },
];

const FAILURE_MODES = [
  { num: '01', title: 'INJECTOR WEAR',   desc: 'Fuel contamination above ISO 18/16/13 degrades injector nozzles in 500–2,000 hours. Each replacement: $800–$4,000 per cylinder.' },
  { num: '02', title: 'BEARING FAILURE', desc: 'Particles larger than oil film thickness cause abrasive wear. ISO 16/14/11 target extends bearing life 3–5× vs. commodity filtration.' },
  { num: '03', title: 'HYDRAULIC LOSS',  desc: 'Proportional valve spools require ISO 17/15/12. Above target, spool stiction increases 40–60% within 1,000 operating hours.' },
];

const MARQUEE_ITEMS = [
  'AIR FILTRATION','FUEL SYSTEMS','HYDRAULIC CONTROL','CABIN SAFETY',
  'LUBE OIL','COMPRESSED AIR','ISO 16889','ISO 5011','SAE J1539',
  'MINING','AGRICULTURE','MARINE','POWER GENERATION',
];

// ─── Counter ──────────────────────────────────────────────────────────────────

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
          ref.current.textContent =
            prefix + (Number.isInteger(to) ? Math.round(v).toString() : v.toFixed(1)) + suffix;
      },
    });
    return () => ctrl.stop();
  }, [inView, to, prefix, suffix]);
  return <span ref={ref}>{prefix}{Number.isInteger(to) ? to : to.toFixed(1)}{suffix}</span>;
}

// ─── Line reveal ──────────────────────────────────────────────────────────────

function RevealLine({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <div ref={ref} style={{ overflow: 'hidden' }}>
      <motion.div
        initial={{ y: '105%', opacity: 0 }}
        animate={inView ? { y: '0%', opacity: 1 } : {}}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const heroRef    = useRef<HTMLDivElement>(null);
  const techWrapRef = useRef<HTMLDivElement>(null);
  const [cursor, setCursor] = useState({ x: 0.5, y: 0.5 });
  const [inHero, setInHero] = useState(false);

  // Parallax on hero scroll
  const { scrollYProgress: heroP } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const bgY         = useTransform(heroP, [0, 1], ['0%', '35%']);
  const heroOpacity = useTransform(heroP, [0, 0.75], [1, 0]);
  const titleY      = useTransform(heroP, [0, 1], ['0%', '-12%']);

  // Horizontal tech scroll
  const { scrollYProgress: techP } = useScroll({
    target: techWrapRef,
    offset: ['start start', 'end start'],
  });
  const techX = useTransform(techP, [0, 1], ['0%', '-62%']);

  // Cursor spotlight
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const onMove = (e: MouseEvent) => {
      const r = hero.getBoundingClientRect();
      setCursor({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height });
    };
    hero.addEventListener('mousemove', onMove);
    hero.addEventListener('mouseenter', () => setInHero(true));
    hero.addEventListener('mouseleave', () => setInHero(false));
    return () => {
      hero.removeEventListener('mousemove', onMove);
      hero.removeEventListener('mouseenter', () => setInHero(true));
      hero.removeEventListener('mouseleave', () => setInHero(false));
    };
  }, []);

  return (
    <main style={{ background: '#000', color: '#fff', overflowX: 'hidden' }}>
      <Navigation />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div ref={heroRef} style={{ position: 'relative', height: '100vh', overflow: 'hidden', cursor: 'none' }}>

        {/* Parallax background image */}
        <motion.div
          style={{
            position: 'absolute', top: '-20%', left: 0, right: 0, bottom: '-20%',
            backgroundImage: 'url(/images/hero-engine.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            y: bgY,
          }}
        />

        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(160deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.75) 70%, rgba(0,0,0,0.95) 100%)',
        }} />

        {/* Cursor spotlight */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          opacity: inHero ? 1 : 0,
          transition: 'opacity 0.4s ease',
          background: `radial-gradient(700px circle at ${cursor.x * 100}% ${cursor.y * 100}%, rgba(255,241,45,0.07) 0%, transparent 65%)`,
        }} />

        {/* Custom cursor dot */}
        {inHero && (
          <motion.div
            style={{
              position: 'fixed',
              left: 0, top: 0,
              width: 10, height: 10,
              borderRadius: '50%',
              background: '#FFF12D',
              pointerEvents: 'none',
              zIndex: 9999,
              x: cursor.x * (heroRef.current?.getBoundingClientRect().width ?? 0) + (heroRef.current?.getBoundingClientRect().left ?? 0) - 5,
              y: cursor.y * (heroRef.current?.getBoundingClientRect().height ?? 0) + (heroRef.current?.getBoundingClientRect().top ?? 0) - 5,
            }}
          />
        )}

        {/* Hero content */}
        <motion.div
          style={{
            position: 'relative', zIndex: 2,
            height: '100%',
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
            padding: 'clamp(2rem, 5vw, 5rem)',
            y: titleY,
            opacity: heroOpacity,
          }}
        >
          <motion.p
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.7rem', letterSpacing: '0.25em',
              color: '#FFF12D', marginBottom: '1.5rem',
            }}
          >
            // INDUSTRIAL ASSET PROTECTION · FRISCO, TX
          </motion.p>

          {/* Brand name — one intact word */}
          <div style={{ overflow: 'hidden' }}>
            <motion.h1
              initial={{ y: '108%' }}
              animate={{ y: '0%' }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 900,
                fontSize: 'clamp(4.5rem, 13.5vw, 13rem)',
                lineHeight: 0.88,
                letterSpacing: '-0.03em',
                color: '#fff',
                margin: 0,
              }}
            >
              ELIMFILTERS
            </motion.h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '3rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
            <motion.a
              href="https://part-search.elimfilters.com"
              target="_blank" rel="noopener noreferrer"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              whileHover={{ scale: 1.04, background: '#ffe600' }}
              style={{
                display: 'inline-block',
                background: '#FFF12D', color: '#000',
                fontFamily: 'Outfit, sans-serif', fontWeight: 800,
                fontSize: '0.72rem', letterSpacing: '0.2em',
                padding: '1.1rem 2.75rem',
                textDecoration: 'none', textTransform: 'uppercase',
              }}
            >
              FIND MY FILTER →
            </motion.a>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              style={{
                fontFamily: 'Inter, sans-serif', fontSize: '0.8rem',
                color: 'rgba(255,255,255,0.45)',
                borderLeft: '1px solid rgba(255,255,255,0.12)',
                paddingLeft: '2rem',
                maxWidth: '220px', lineHeight: 1.7, margin: 0,
              }}
            >
              20,000+ OEM cross-references.<br />ISO 16889 · ISO 5011 · ISO 19438.
            </motion.p>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          style={{
            position: 'absolute', bottom: '2.5rem', right: '2.5rem', zIndex: 3,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
          }}
        >
          <div style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem',
            letterSpacing: '0.2em', color: 'rgba(255,255,255,0.25)',
            writingMode: 'vertical-rl',
          }}>
            SCROLL
          </div>
          <motion.div
            animate={{ scaleY: [0, 1, 0], originY: 0 }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: 1, height: 48, background: 'rgba(255,255,255,0.2)' }}
          />
        </motion.div>
      </div>

      {/* ── MARQUEE ───────────────────────────────────────────────────────── */}
      <div style={{ background: '#FFF12D', overflow: 'hidden', padding: '0.9rem 0' }}>
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 30, ease: 'linear', repeat: Infinity }}
          style={{ display: 'flex', gap: '2.5rem', width: 'max-content', alignItems: 'center' }}
        >
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span
              key={i}
              style={{
                fontFamily: 'Outfit, sans-serif', fontWeight: 700,
                fontSize: '0.72rem', letterSpacing: '0.22em',
                color: '#000', whiteSpace: 'nowrap',
              }}
            >
              {item}
              <span style={{ marginLeft: '2.5rem', opacity: 0.3 }}>·</span>
            </span>
          ))}
        </motion.div>
      </div>

      {/* ── STATS ─────────────────────────────────────────────────────────── */}
      <section style={{
        padding: 'clamp(5rem, 10vw, 9rem) clamp(1.5rem, 5vw, 5rem)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '3rem',
        }}>
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <div style={{
                fontFamily: 'Outfit, sans-serif', fontWeight: 800,
                fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: '#fff', lineHeight: 1,
              }}>
                <Counter to={s.value} prefix={s.prefix} suffix={s.suffix} />
              </div>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
                letterSpacing: '0.2em', color: '#FFF12D', marginTop: '0.75rem',
              }}>
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FAILURE MODES ─────────────────────────────────────────────────── */}
      <section style={{
        padding: 'clamp(5rem, 10vw, 9rem) clamp(1.5rem, 5vw, 5rem)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <RevealLine>
            <p style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem',
              letterSpacing: '0.2em', color: '#FFF12D', marginBottom: '1.5rem',
            }}>
              // FAILURE MODES — CONTAMINATION IMPACT
            </p>
          </RevealLine>
          <RevealLine delay={0.08}>
            <h2 style={{
              fontFamily: 'Outfit, sans-serif', fontWeight: 800,
              fontSize: 'clamp(1.8rem, 4vw, 3.5rem)', lineHeight: 1.1,
              marginBottom: '3.5rem', maxWidth: '700px',
            }}>
              Equipment fails when contamination&nbsp;control&nbsp;fails.
            </h2>
          </RevealLine>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1px', background: 'rgba(255,255,255,0.06)',
          }}>
            {FAILURE_MODES.map((fm, i) => (
              <motion.div
                key={fm.num}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                style={{ padding: '2.5rem', background: '#000' }}
              >
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
                  color: 'rgba(255,255,255,0.2)', marginBottom: '1.25rem',
                }}>{fm.num}</div>
                <h3 style={{
                  fontFamily: 'Outfit, sans-serif', fontWeight: 700,
                  fontSize: '1.05rem', color: '#FFF12D',
                  marginBottom: '0.9rem', letterSpacing: '0.05em',
                }}>{fm.title}</h3>
                <p style={{
                  fontFamily: 'Inter, sans-serif', fontSize: '0.85rem',
                  color: 'rgba(255,255,255,0.5)', lineHeight: 1.75,
                }}>{fm.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HORIZONTAL TECH SCROLL ────────────────────────────────────────── */}
      <div ref={techWrapRef} style={{ position: 'relative', height: '400vh' }}>
        <div style={{
          position: 'sticky', top: 0, height: '100vh', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          background: '#000',
        }}>
          <div style={{ padding: '0 clamp(1.5rem, 5vw, 5rem)', marginBottom: '2rem' }}>
            <RevealLine>
              <p style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem',
                letterSpacing: '0.2em', color: '#FFF12D',
              }}>
                // PROTECTION TECHNOLOGIES — SCROLL TO EXPLORE
              </p>
            </RevealLine>
          </div>
          <div style={{ overflow: 'hidden', paddingLeft: 'clamp(1.5rem, 5vw, 5rem)' }}>
            <motion.div style={{ display: 'flex', gap: '1px', x: techX, width: 'max-content' }}>
              {TECHNOLOGIES.map((t) => (
                <motion.a
                  key={t.code}
                  href={t.href}
                  whileHover={{ background: 'rgba(255,241,45,0.04)', borderColor: 'rgba(255,241,45,0.2)' }}
                  style={{
                    display: 'block',
                    width: 'clamp(260px, 28vw, 360px)',
                    padding: '2.5rem 2rem',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    textDecoration: 'none', color: 'inherit', flexShrink: 0,
                    transition: 'border-color 0.25s ease, background 0.25s ease',
                  }}
                >
                  <div style={{
                    fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem',
                    color: 'rgba(255,255,255,0.18)', marginBottom: '2rem',
                  }}>{t.n}</div>
                  <div style={{
                    fontFamily: 'Outfit, sans-serif', fontWeight: 800,
                    fontSize: 'clamp(1.1rem, 2vw, 1.45rem)',
                    color: '#FFF12D', marginBottom: '0.5rem', letterSpacing: '-0.01em',
                  }}>{t.code}</div>
                  <div style={{
                    fontFamily: 'Inter, sans-serif', fontSize: '0.8rem',
                    color: 'rgba(255,255,255,0.4)', marginBottom: '2.5rem',
                  }}>{t.role}</div>
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.25rem' }}>
                    <div style={{
                      fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
                      color: 'rgba(255,255,255,0.28)', marginBottom: '0.4rem',
                    }}>{t.spec}</div>
                    <div style={{
                      fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem',
                      color: 'rgba(255,241,45,0.35)',
                    }}>{t.std}</div>
                  </div>
                </motion.a>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── ASSET PROTECTION NARRATIVE ────────────────────────────────────── */}
      <section style={{
        padding: 'clamp(5rem, 10vw, 9rem) clamp(1.5rem, 5vw, 5rem)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6rem', alignItems: 'center' }}>
          <div>
            <RevealLine>
              <p style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem',
                letterSpacing: '0.2em', color: '#FFF12D', marginBottom: '1.5rem',
              }}>
                // ASSET PROTECTION FRAMEWORK
              </p>
            </RevealLine>
            <RevealLine delay={0.08}>
              <h2 style={{
                fontFamily: 'Outfit, sans-serif', fontWeight: 800,
                fontSize: 'clamp(1.6rem, 3vw, 2.8rem)', lineHeight: 1.15,
                marginBottom: '1.5rem',
              }}>
                Filtration is not a product decision. It&apos;s a system decision.
              </h2>
            </RevealLine>
            <RevealLine delay={0.16}>
              <p style={{
                fontFamily: 'Inter, sans-serif', fontSize: '0.9rem',
                color: 'rgba(255,255,255,0.5)', lineHeight: 1.8,
                marginBottom: '2rem',
              }}>
                Equipment reliability is determined by how effectively the total filtration
                system controls contamination across air, fuel, hydraulic, cabin, lube, and
                compressed air domains — not by brand selection.
              </p>
            </RevealLine>
            <motion.a
              href="/knowledge-system"
              whileHover={{ x: 4 }}
              style={{
                fontFamily: 'Outfit, sans-serif', fontWeight: 700,
                fontSize: '0.75rem', letterSpacing: '0.15em',
                color: '#FFF12D', textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              }}
            >
              EXPLORE KNOWLEDGE SYSTEM →
            </motion.a>
          </div>
          <div>
            {[
              'Contamination',
              'Asset Degradation',
              'Standards & Measurement',
              'Protection Technologies',
              'Product Implementation',
              'Fleet Optimization',
            ].map((step, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.5 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '1.25rem',
                  padding: '1rem 0',
                  borderBottom: i < 5 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                }}
              >
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: i === 0 ? '#FFF12D' : 'rgba(255,255,255,0.15)',
                  flexShrink: 0,
                }} />
                <span style={{
                  fontFamily: 'Inter, sans-serif', fontSize: '0.85rem',
                  color: i === 0 ? '#fff' : 'rgba(255,255,255,0.4)',
                }}>
                  {step}
                </span>
                {i < 5 && (
                  <div style={{
                    marginLeft: 'auto',
                    fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem',
                    color: 'rgba(255,255,255,0.15)',
                  }}>
                    ↓
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BLOCK ─────────────────────────────────────────────────────── */}
      <section style={{ background: '#FFF12D', padding: 'clamp(5rem, 10vw, 8rem) clamp(1.5rem, 5vw, 5rem)' }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: '2.5rem',
        }}>
          <div>
            <RevealLine>
              <h2 style={{
                fontFamily: 'Outfit, sans-serif', fontWeight: 900,
                fontSize: 'clamp(2rem, 5vw, 4rem)',
                color: '#000', margin: 0, lineHeight: 1,
              }}>
                Find your filter.
              </h2>
            </RevealLine>
            <RevealLine delay={0.1}>
              <p style={{
                fontFamily: 'Inter, sans-serif', fontSize: '0.9rem',
                color: 'rgba(0,0,0,0.55)', marginTop: '1rem', margin: 0,
              }}>
                20,000+ cross-references. Search by OEM part number.
              </p>
            </RevealLine>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <motion.a
              href="https://part-search.elimfilters.com"
              target="_blank" rel="noopener noreferrer"
              whileHover={{ scale: 1.04 }}
              style={{
                display: 'inline-block', background: '#000', color: '#FFF12D',
                fontFamily: 'Outfit, sans-serif', fontWeight: 800,
                fontSize: '0.72rem', letterSpacing: '0.2em',
                padding: '1.2rem 3rem', textDecoration: 'none',
                textTransform: 'uppercase',
              }}
            >
              SEARCH PARTS →
            </motion.a>
            <motion.a
              href="/distributor-application"
              whileHover={{ scale: 1.04 }}
              style={{
                display: 'inline-block',
                background: 'transparent', color: '#000',
                fontFamily: 'Outfit, sans-serif', fontWeight: 800,
                fontSize: '0.72rem', letterSpacing: '0.2em',
                padding: '1.2rem 3rem', textDecoration: 'none',
                textTransform: 'uppercase',
                border: '2px solid rgba(0,0,0,0.25)',
              }}
            >
              BECOME A DEALER →
            </motion.a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
