'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent } from 'motion/react';
import { AnimateIn, StaggerContainer, itemVariants } from './AnimateIn';
import { CinematicIntro } from './CinematicIntro';

export interface TechStage {
  number: string;
  tag: string;
  title: string;
  body: string;
  stat: string;
  statLabel: string;
}

export interface TechSpec {
  label: string;
  value: string;
  sub: string;
}

export interface TechApplication {
  sector: string;
  detail: string;
}

export interface TechLabResult {
  test: string;
  standard: string;
  result: string;
  unit: string;
}

export interface TechTestimonial {
  quote: string;
  role: string;
  sector: string;
}

export interface TechDetailData {
  categoryTag: string;
  heroTitle: string;
  heroSubtitle?: string;
  heroTagline: string;
  heroImage: string;
  heroStats?: { key: string; value: string }[];
  logoSrc: string;
  systemHeadline: string;
  systemParagraphs: string[];
  productImageSrc: string;
  productImageCaption: string;
  stagesHeading?: string;
  stages: TechStage[];
  specsHeading?: string;
  specs: TechSpec[];
  labResults?: TechLabResult[];
  testimonial?: TechTestimonial;
  applicationsHeading: string;
  applicationsSubtext?: string;
  applications: TechApplication[];
  ctaTag: string;
  ctaHeading: string;
  ctaBody: string;
}

interface Props {
  data: TechDetailData;
}

/* ─────────────────────────────────────────────────────────────
   SCROLL-DRIVEN STAGES SECTION
   320vh container, sticky inner panel, each stage activates
   as the user scrolls through the tall container.
───────────────────────────────────────────────────────────── */
function StagesSection({ stages, heading }: { stages: TechStage[]; heading?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStage, setActiveStage] = useState(-1);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 50, damping: 20 });
  const lineHeight = useTransform(smooth, [0, 0.88], ['0%', '100%']);

  const thresholds = stages.map((_, i) => (i * 0.85) / stages.length + 0.08);

  useMotionValueEvent(smooth, 'change', (v) => {
    let active = -1;
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (v >= thresholds[i]) { active = i; break; }
    }
    setActiveStage(active);
  });

  const totalVh = stages.length * 100 + 60;

  return (
    <section
      style={{ background: '#000', borderTop: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Section label above */}
      <div style={{ padding: '4rem 2rem 0', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '2rem', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.25em',
            color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace', flexShrink: 0,
          }}>
            // PROTECTION ARCHITECTURE
          </span>
          <h2 style={{
            fontSize: 'clamp(1.1rem, 2vw, 1.55rem)', fontWeight: 900,
            fontFamily: 'Space Grotesk, sans-serif', margin: 0, color: '#fff',
          }}>
            {heading || 'EACH LAYER STOPS WHAT THE PREVIOUS CANNOT.'}
          </h2>
        </div>
      </div>

      {/* Scroll container */}
      <div
        ref={containerRef}
        style={{ position: 'relative', height: `${totalVh}vh` }}
      >
        <div style={{
          position: 'sticky', top: 0, height: '100vh', overflow: 'hidden',
          display: 'grid', gridTemplateColumns: '1fr 1fr',
        }}>

          {/* LEFT — stage list with progress line */}
          <div style={{
            padding: 'clamp(3rem, 6vw, 6rem)',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            position: 'relative', borderRight: '1px solid rgba(255,255,255,0.06)',
          }}>
            {/* Vertical progress line */}
            <div style={{
              position: 'absolute',
              left: 'clamp(3rem, 6vw, 6rem)',
              top: '50%', transform: 'translateY(-50%)',
              height: `${stages.length * 90}px`,
              width: '1px', background: 'rgba(255,255,255,0.06)',
            }}>
              <motion.div style={{
                position: 'absolute', top: 0, left: 0,
                width: '100%', background: '#FFF12D', height: lineHeight,
              }} />
            </div>

            <div style={{ paddingLeft: 'clamp(2rem, 3.5vw, 3.5rem)', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              {stages.map((stage, i) => {
                const isActive = i <= activeStage;
                return (
                  <div key={i} style={{ transition: 'opacity 0.6s ease', opacity: isActive ? 1 : 0.22 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                      <span style={{
                        fontFamily: 'JetBrains Mono, monospace', fontSize: '0.52rem',
                        letterSpacing: '0.25em', color: isActive ? '#FFF12D' : 'rgba(255,255,255,0.3)',
                        transition: 'color 0.6s ease',
                      }}>
                        {stage.number}
                      </span>
                      <span style={{
                        fontFamily: 'JetBrains Mono, monospace', fontSize: '0.52rem',
                        letterSpacing: '0.15em', color: isActive ? 'rgba(255,241,45,0.55)' : 'rgba(255,255,255,0.2)',
                        transition: 'color 0.6s ease',
                      }}>
                        {stage.tag}
                      </span>
                    </div>
                    <h3 style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontSize: 'clamp(0.9rem, 1.4vw, 1.15rem)',
                      fontWeight: 700, margin: 0,
                      color: isActive ? '#fff' : 'rgba(255,255,255,0.28)',
                      transition: 'color 0.6s ease',
                      lineHeight: 1.3,
                    }}>
                      {stage.title}
                    </h3>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT — active stage detail */}
          <div style={{
            padding: 'clamp(3rem, 6vw, 6rem)',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            background: '#050505',
          }}>
            {activeStage >= 0 ? (
              <motion.div
                key={activeStage}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <div style={{ marginBottom: '3rem' }}>
                  <span style={{
                    display: 'block',
                    fontFamily: 'JetBrains Mono, monospace', fontSize: '0.55rem',
                    letterSpacing: '0.25em', color: 'rgba(255,241,45,0.6)',
                    marginBottom: '0.75rem',
                  }}>
                    {stages[activeStage].tag} · {stages[activeStage].number}
                  </span>
                  <h3 style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: 'clamp(1.3rem, 2.2vw, 1.85rem)',
                    fontWeight: 700, color: '#fff',
                    margin: '0 0 1.5rem', lineHeight: 1.2,
                  }}>
                    {stages[activeStage].title}
                  </h3>
                  <p style={{
                    fontFamily: 'Outfit, sans-serif', fontSize: '0.92rem',
                    lineHeight: 1.9, color: 'rgba(255,255,255,0.6)',
                    maxWidth: '480px', margin: 0,
                  }}>
                    {stages[activeStage].body}
                  </p>
                </div>

                <div style={{
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  paddingTop: '2rem',
                }}>
                  <div style={{
                    fontSize: 'clamp(2.8rem, 5vw, 4.5rem)',
                    fontWeight: 900, fontFamily: 'Space Grotesk, sans-serif',
                    color: '#FFF12D', lineHeight: 1, letterSpacing: '-0.02em',
                  }}>
                    {stages[activeStage].stat}
                  </div>
                  <div style={{
                    fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem',
                    letterSpacing: '0.15em', color: 'rgba(255,255,255,0.35)',
                    marginTop: '0.6rem', textTransform: 'uppercase',
                  }}>
                    {stages[activeStage].statLabel}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div style={{ opacity: 0.2 }}>
                <p style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
                  letterSpacing: '0.2em', color: '#fff',
                }}>
                  ↓ SCROLL TO TRACE EACH STAGE
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE COMPONENT
───────────────────────────────────────────────────────────── */
export function TechDetailPage({ data }: Props) {
  return (
    <>
      <CinematicIntro
        logoSrc={data.logoSrc}
        heroTitle={data.heroTitle}
        categoryTag={data.categoryTag}
      />

      {/* Breadcrumb */}
      <div style={{
        position: 'relative', zIndex: 20,
        background: 'rgba(0,0,0,0.85)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '0.75rem 2rem',
        backdropFilter: 'blur(8px)',
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Link
            href="/"
            style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#FFF12D')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
          >HOME</Link>
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.6rem' }}>→</span>
          <Link
            href="/technologies"
            style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#FFF12D')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
          >TECHNOLOGY</Link>
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.6rem' }}>→</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', letterSpacing: '0.1em', color: '#FFF12D' }}>
            {data.heroTitle}
          </span>
        </div>
      </div>

      <main style={{ background: '#000', color: '#fff' }}>

        {/* ══════════════════════════════════════════════
            SECTION 1 — FULL VIEWPORT HERO
            Background image + overlay, title bottom-left,
            stats bottom-right.
        ══════════════════════════════════════════════ */}
        <section style={{
          position: 'relative',
          height: '100vh',
          minHeight: '560px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          overflow: 'hidden',
        }}>
          {/* Background image */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 0,
            backgroundImage: `url(${data.heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }} />
          {/* Gradient overlay */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 1,
            background: 'linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.75) 100%)',
          }} />
          {/* Noise grain */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 2, opacity: 0.03,
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
          }} />

          {/* Content overlay */}
          <div style={{ position: 'relative', zIndex: 3, width: '100%', padding: 'clamp(2rem, 5vw, 4rem)' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr auto',
              gap: '2rem', alignItems: 'flex-end', maxWidth: '1400px', margin: '0 auto',
            }}>
              {/* Left — title block */}
              <div>
                <motion.span
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  style={{
                    display: 'block',
                    fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem',
                    letterSpacing: '0.28em', color: '#FFF12D', marginBottom: '1.5rem',
                  }}
                >
                  {data.categoryTag}
                </motion.span>

                <div style={{ overflow: 'hidden' }}>
                  <motion.h1
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: '0%', opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      fontFamily: 'Barlow Condensed, sans-serif',
                      fontSize: 'clamp(2.8rem, 6.5vw, 6rem)',
                      fontWeight: 700, color: '#fff',
                      letterSpacing: '0.03em', lineHeight: 0.95, margin: 0,
                    }}
                  >
                    {data.heroTitle}
                    {data.heroSubtitle && (
                      <span style={{
                        color: '#FFF12D', display: 'block',
                        fontSize: 'clamp(1.2rem, 2.4vw, 2rem)',
                        letterSpacing: '0.1em',
                        fontWeight: 600,
                        marginTop: '0.25rem',
                      }}>
                        {data.heroSubtitle}
                      </span>
                    )}
                  </motion.h1>
                </div>

                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.5 }}
                  style={{
                    fontSize: 'clamp(0.85rem, 1.4vw, 1rem)',
                    maxWidth: '520px', margin: '1.5rem 0 0',
                    lineHeight: 1.8, color: 'rgba(255,255,255,0.5)',
                    fontFamily: 'Outfit, sans-serif', fontStyle: 'italic',
                  }}
                >
                  {data.heroTagline}
                </motion.p>
              </div>

              {/* Right — stats strip */}
              {data.heroStats && data.heroStats.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  style={{
                    display: 'flex', flexDirection: 'column', gap: '0',
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(0,0,0,0.45)',
                    backdropFilter: 'blur(12px)',
                    minWidth: '140px',
                  }}
                >
                  {data.heroStats.map(({ key, value }, i) => (
                    <div key={key} style={{
                      padding: '1.25rem 1.5rem',
                      borderBottom: i < data.heroStats!.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                    }}>
                      <div style={{
                        fontSize: '0.5rem', letterSpacing: '0.22em',
                        color: 'rgba(255,255,255,0.28)', fontFamily: 'JetBrains Mono, monospace',
                        marginBottom: '0.4rem',
                      }}>{key}</div>
                      <div style={{
                        fontSize: '1.5rem', fontWeight: 900, color: '#FFF12D',
                        fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1,
                      }}>{value}</div>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Scroll indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              style={{
                position: 'absolute', bottom: 'clamp(2rem, 4vw, 3rem)',
                left: '50%', transform: 'translateX(-50%)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
              }}
            >
              <span style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: '0.5rem',
                letterSpacing: '0.2em', color: 'rgba(255,255,255,0.25)',
              }}>
                SCROLL
              </span>
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                style={{ width: '1px', height: '24px', background: 'rgba(255,241,45,0.4)' }}
              />
            </motion.div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            SECTION 2 — TECHNICAL OVERVIEW
            Prose left, lab results / product image right
        ══════════════════════════════════════════════ */}
        <section style={{ padding: '6rem 2rem', background: '#050505', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="product-desc-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'start' }}>
              <AnimateIn direction="left">
                <span style={{ display: 'block', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.25em', color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace', marginBottom: '1.5rem' }}>
                  // TECHNICAL OVERVIEW
                </span>
                <h2 style={{ fontSize: 'clamp(1.4rem, 2.6vw, 2rem)', fontWeight: 900, fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.15, marginBottom: '2rem', whiteSpace: 'pre-line', color: '#fff' }}>
                  {data.systemHeadline}
                </h2>
                {data.systemParagraphs.map((para, i) => (
                  <p key={i} style={{ fontSize: '0.92rem', lineHeight: 1.9, color: 'rgba(255,255,255,0.55)', fontFamily: 'Outfit, sans-serif', marginBottom: '1.35rem' }}>
                    {para}
                  </p>
                ))}
              </AnimateIn>

              <AnimateIn direction="right">
                {data.labResults && data.labResults.length > 0 ? (
                  <div style={{ position: 'sticky', top: '5rem', background: '#000', border: '1px solid rgba(255,241,45,0.12)' }}>
                    <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#FFF12D', boxShadow: '0 0 8px rgba(255,241,45,0.7)' }} />
                      <span style={{ fontSize: '0.58rem', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.35)' }}>
                        LAB RESULTS — ISO CERTIFIED
                      </span>
                    </div>
                    <div style={{ padding: '0 1.75rem' }}>
                      {data.labResults.map((r, i) => (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <div>
                            <div style={{ fontSize: '0.72rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.55)', marginBottom: '0.25rem' }}>{r.test}</div>
                            <div style={{ fontSize: '0.56rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.22)', letterSpacing: '0.08em' }}>{r.standard}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#FFF12D', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1 }}>{r.result}</span>
                            <span style={{ fontSize: '0.56rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono, monospace', marginLeft: '0.25rem' }}>{r.unit}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ padding: '0.9rem 1.75rem', background: 'rgba(255,241,45,0.03)', borderTop: '1px solid rgba(255,241,45,0.07)' }}>
                      <span style={{ fontSize: '0.55rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.07em' }}>
                        ∷ RESULTS UNDER ISO-CONTROLLED CONDITIONS
                      </span>
                    </div>
                  </div>
                ) : (
                  <div style={{ position: 'sticky', top: '5rem' }}>
                    <img
                      src={data.productImageSrc}
                      alt={data.heroTitle}
                      style={{ width: '100%', borderRadius: '4px', border: '1px solid rgba(255,241,45,0.12)', display: 'block' }}
                    />
                    <p style={{ fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.22)', letterSpacing: '0.15em', marginTop: '0.75rem', textAlign: 'center' }}>
                      {data.productImageCaption}
                    </p>
                  </div>
                )}
              </AnimateIn>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            SECTION 3 — PROTECTION ARCHITECTURE
            Scroll-driven sticky: left panel shows stage list,
            right panel reveals each stage detail as user scrolls.
        ══════════════════════════════════════════════ */}
        <StagesSection stages={data.stages} heading={data.stagesHeading} />

        {/* ══════════════════════════════════════════════
            SECTION 4 — FIELD SPECIFICATIONS
        ══════════════════════════════════════════════ */}
        {data.specs.length > 0 && (
          <section style={{ padding: '5rem 2rem', background: '#050505', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <AnimateIn direction="up">
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '2rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.25em', color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace', flexShrink: 0 }}>
                    // PROTECTION PARAMETERS
                  </span>
                  <h2 style={{ fontSize: 'clamp(1.1rem, 2vw, 1.55rem)', fontWeight: 900, fontFamily: 'Space Grotesk, sans-serif', margin: 0, color: '#fff' }}>
                    {data.specsHeading || 'FIELD SPECIFICATIONS'}
                  </h2>
                </div>
              </AnimateIn>
              <StaggerContainer style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.04)' }}>
                {data.specs.map((spec, idx) => (
                  <motion.div key={idx} variants={itemVariants} style={{ background: '#050505', padding: '1.65rem 1.4rem' }}>
                    <div style={{ fontSize: '0.52rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.28)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.6rem' }}>{spec.label}</div>
                    <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#FFF12D', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1, marginBottom: '0.4rem' }}>{spec.value}</div>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.38)', fontFamily: 'Outfit, sans-serif', lineHeight: 1.5 }}>{spec.sub}</div>
                  </motion.div>
                ))}
              </StaggerContainer>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════
            SECTION 5 — FIELD REPORT (testimonial)
        ══════════════════════════════════════════════ */}
        {data.testimonial && (
          <section style={{ padding: '5rem 2rem', background: '#000', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <AnimateIn direction="up">
                <span style={{ display: 'block', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.25em', color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace', marginBottom: '2.5rem' }}>
                  // FIELD REPORT
                </span>
                <blockquote style={{ margin: 0, padding: '2.5rem', background: '#050505', border: '1px solid rgba(255,255,255,0.06)', borderLeft: '3px solid #FFF12D' }}>
                  <p style={{ fontSize: '1.05rem', lineHeight: 1.9, color: 'rgba(255,255,255,0.7)', fontFamily: 'Outfit, sans-serif', fontStyle: 'italic', margin: '0 0 1.5rem' }}>
                    &ldquo;{data.testimonial.quote}&rdquo;
                  </p>
                  <footer style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '28px', height: '1px', background: '#FFF12D', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.62rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em' }}>
                      {data.testimonial.role} · {data.testimonial.sector}
                    </span>
                  </footer>
                </blockquote>
              </AnimateIn>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════
            SECTION 6 — ASSET APPLICATIONS
        ══════════════════════════════════════════════ */}
        <section style={{ padding: '6rem 2rem', background: '#050505', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <AnimateIn direction="up">
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '2rem', flexWrap: 'wrap', marginBottom: data.applicationsSubtext ? '1rem' : '3rem' }}>
                <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.25em', color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace', flexShrink: 0 }}>
                  // ASSET APPLICATIONS
                </span>
                <h2 style={{ fontSize: 'clamp(1.1rem, 2vw, 1.55rem)', fontWeight: 900, fontFamily: 'Space Grotesk, sans-serif', margin: 0, color: '#fff' }}>
                  {data.applicationsHeading}
                </h2>
              </div>
              {data.applicationsSubtext && (
                <p style={{ fontSize: '0.87rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit, sans-serif', marginBottom: '3rem', maxWidth: '560px', lineHeight: 1.7 }}>
                  {data.applicationsSubtext}
                </p>
              )}
            </AnimateIn>
            <StaggerContainer style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.04)' }}>
              {data.applications.map((app, idx) => (
                <motion.div key={idx} variants={itemVariants} style={{ background: '#050505', padding: '2rem 1.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
                    <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#FFF12D', flexShrink: 0 }} />
                    <div style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.18em', color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace' }}>
                      {app.sector}
                    </div>
                  </div>
                  <p style={{ fontSize: '0.84rem', lineHeight: 1.9, color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit, sans-serif', margin: 0 }}>
                    {app.detail}
                  </p>
                </motion.div>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            SECTION 7 — CTA
        ══════════════════════════════════════════════ */}
        <section style={{ padding: '5rem 2rem', background: '#FFF12D', textAlign: 'center' }}>
          <AnimateIn direction="up">
            <div style={{ maxWidth: '680px', margin: '0 auto' }}>
              <span style={{ display: 'block', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.25em', color: 'rgba(0,0,0,0.4)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '1rem' }}>
                {data.ctaTag}
              </span>
              <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 900, fontFamily: 'Space Grotesk, sans-serif', color: '#000', marginBottom: '1rem', lineHeight: 1.1 }}>
                {data.ctaHeading}
              </h2>
              <p style={{ fontSize: '0.95rem', color: 'rgba(0,0,0,0.55)', fontFamily: 'Outfit, sans-serif', marginBottom: '2.5rem', lineHeight: 1.65 }}>
                {data.ctaBody}
              </p>
              <motion.a
                href="https://part-search.elimfilters.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.03, boxShadow: '0 0 36px rgba(0,0,0,0.25)' }}
                style={{ display: 'inline-block', background: '#000', color: '#FFF12D', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.15em', padding: '1rem 3rem', textDecoration: 'none', borderRadius: '4px' }}
              >
                IDENTIFY SKU →
              </motion.a>
            </div>
          </AnimateIn>
        </section>

        {/* ══════════════════════════════════════════════
            SECTION 8 — RELATED KNOWLEDGE
        ══════════════════════════════════════════════ */}
        <section style={{ padding: '5rem 2rem', background: 'linear-gradient(180deg, rgba(255,241,45,0.03) 0%, transparent 100%)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <AnimateIn direction="up">
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, fontFamily: 'Outfit, sans-serif', color: '#FFF12D', marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>
                Related Knowledge
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter, sans-serif', marginBottom: '3rem', maxWidth: '560px' }}>
                Engineering knowledge base — standards, contamination modes, fleet strategy.
              </p>
            </AnimateIn>
            <StaggerContainer style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {[
                { href: '/knowledge-system/standards', icon: '⬡', title: 'International Standards', desc: 'ISO cleanliness codes, particle counting, and filter integrity testing.' },
                { href: '/knowledge-system/contamination', icon: '⚠', title: 'Contamination & Failure', desc: 'Root causes, degradation mechanisms, and failure prevention.' },
                { href: '/knowledge-system/fleet', icon: '◈', title: 'Fleet Optimization', desc: 'Maintenance intervals, TCO analysis, and operational strategy.' },
              ].map(({ href, icon, title, desc }) => (
                <motion.div key={href} variants={itemVariants}>
                  <Link href={href} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
                    <motion.div
                      whileHover={{ borderColor: 'rgba(255,241,45,0.4)', y: -3 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        padding: '2rem', cursor: 'pointer', height: '100%',
                        display: 'flex', flexDirection: 'column', gap: '1rem', borderRadius: '2px',
                      }}
                    >
                      <div style={{ width: '36px', height: '36px', border: '1px solid rgba(255,241,45,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF12D', fontSize: '1rem' }}>
                        {icon}
                      </div>
                      <div>
                        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>{title}</h3>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5, margin: 0 }}>{desc}</p>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'rgba(255,241,45,0.4)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em', marginTop: 'auto' }}>
                        LEARN MORE →
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </StaggerContainer>
          </div>
        </section>

      </main>
    </>
  );
}
