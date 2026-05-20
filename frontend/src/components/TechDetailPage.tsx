'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { AnimateIn, StaggerContainer, itemVariants } from './AnimateIn';

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

export function TechDetailPage({ data }: Props) {
  return (
    <>
      <Link href="/" style={{
        position: 'fixed', top: '1rem', right: '1.5rem', zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,241,45,0.35)',
        borderRadius: '4px', padding: '0.45rem 1rem',
        fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.72rem',
        letterSpacing: '0.12em', color: '#FFF12D', textDecoration: 'none',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
      }}>← HOME</Link>

      <main style={{ background: '#000', color: '#fff' }}>

        {/* ══════════════════════════════════════════════
            SECTION 1 — LOGO IDENTITY BLOCK
            Centered, full-width, logo as primary element
        ══════════════════════════════════════════════ */}
        <section style={{
          background: '#000',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '5rem 2rem 0',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Subtle dot matrix — different from Systems grid lines */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 0,
            backgroundImage: 'radial-gradient(rgba(255,241,45,0.07) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }} />
          {/* Radial fade so dots disappear toward edges */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 1,
            background: 'radial-gradient(ellipse 80% 70% at 50% 40%, transparent 30%, #000 100%)',
          }} />

          <div style={{ position: 'relative', zIndex: 2, maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>

            {/* Category tag */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <span style={{
                display: 'inline-block', fontSize: '0.6rem', fontWeight: 700,
                letterSpacing: '0.28em', color: '#FFF12D',
                fontFamily: 'JetBrains Mono, monospace',
                marginBottom: '3rem',
                padding: '0.35rem 0.85rem',
                border: '1px solid rgba(255,241,45,0.25)',
                borderRadius: '2px',
              }}>
                {data.categoryTag}
              </span>
            </motion.div>

            {/* Logo — the protagonist */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.65, delay: 0.1 }}
              style={{ marginBottom: '1rem' }}
            >
              <img
                src={data.logoSrc}
                alt={data.heroTitle}
                style={{
                  display: 'block',
                  margin: '0 auto',
                  width: 'clamp(300px, 38vw, 560px)',
                  height: 'auto',
                  mixBlendMode: 'screen',
                  filter: 'brightness(1.15) contrast(1.1)',
                }}
              />
            </motion.div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.55, delay: 0.38 }}
              style={{
                fontSize: 'clamp(0.85rem, 1.4vw, 1rem)',
                maxWidth: '640px',
                margin: '0 auto',
                lineHeight: 1.85,
                color: 'rgba(255,255,255,0.5)',
                fontFamily: 'Outfit, sans-serif',
                fontStyle: 'italic',
              }}
            >
              {data.heroTagline}
            </motion.p>

            {/* Stats strip — horizontal, full width, below tagline */}
            {data.heroStats && data.heroStats.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '0',
                  marginTop: '4rem',
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {data.heroStats.map(({ key, value }, i) => (
                  <div key={key} style={{
                    flex: '1',
                    maxWidth: '220px',
                    padding: '1.75rem 1.5rem',
                    borderRight: i < data.heroStats!.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '0.52rem', letterSpacing: '0.22em', color: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.5rem' }}>{key}</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#FFF12D', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1 }}>{value}</div>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            SECTION 2 — TECHNICAL OVERVIEW
            Full prose left, lab results right (terminal)
        ══════════════════════════════════════════════ */}
        <section style={{ padding: '6rem 2rem', background: '#050505', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="product-desc-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'start' }}>
              <AnimateIn direction="left">
                <span style={{ display: 'block', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.25em', color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace', marginBottom: '1.5rem' }}>
                  // TECHNICAL OVERVIEW
                </span>
                <h2 style={{ fontSize: 'clamp(1.4rem, 2.6vw, 2rem)', fontWeight: 900, fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.15, marginBottom: '2rem', whiteSpace: 'pre-line' }}>
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
                        AI LAB SIMULATION — ISO CERTIFIED
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
                        ∷ RESULTS SIMULATED UNDER ISO-CONTROLLED CONDITIONS
                      </span>
                    </div>
                  </div>
                ) : (
                  <div style={{ position: 'sticky', top: '5rem' }}>
                    <img src={data.productImageSrc} alt={data.heroTitle}
                      style={{ width: '100%', borderRadius: '4px', border: '1px solid rgba(255,241,45,0.12)', display: 'block' }} />
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
            Vertical layer stack — numbered, opacity-graduated
        ══════════════════════════════════════════════ */}
        <section style={{ padding: '6rem 2rem', background: '#000', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <AnimateIn direction="up">
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '2rem', marginBottom: '4rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.25em', color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace', flexShrink: 0 }}>
                  // PROTECTION ARCHITECTURE
                </span>
                <h2 style={{ fontSize: 'clamp(1.3rem, 2.4vw, 1.9rem)', fontWeight: 900, fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.15, margin: 0 }}>
                  {data.stagesHeading || 'EACH LAYER STOPS WHAT THE PREVIOUS CANNOT.'}
                </h2>
              </div>
            </AnimateIn>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {data.stages.map((stage, idx) => (
                <AnimateIn key={idx} direction="up">
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '56px 1fr auto',
                    gap: '2rem',
                    alignItems: 'start',
                    padding: '2.25rem 2rem',
                    background: `rgba(255,255,255,${0.018 - idx * 0.002})`,
                    border: '1px solid rgba(255,255,255,0.04)',
                    borderLeft: `3px solid rgba(255,241,45,${1 - idx * 0.22})`,
                  }}>
                    <div style={{ paddingTop: '0.15rem' }}>
                      <div style={{ fontSize: '0.5rem', letterSpacing: '0.2em', color: `rgba(255,241,45,${1 - idx * 0.22})`, fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.5rem' }}>{stage.tag}</div>
                      <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'rgba(255,255,255,0.05)', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1 }}>{stage.number}</div>
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', color: '#fff', marginBottom: '0.75rem', letterSpacing: '0.02em' }}>
                        {stage.title}
                      </h3>
                      <p style={{ fontSize: '0.86rem', lineHeight: 1.9, color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit, sans-serif', margin: 0, maxWidth: '600px' }}>
                        {stage.body}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', minWidth: '80px', paddingTop: '0.15rem' }}>
                      <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#FFF12D', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1 }}>{stage.stat}</div>
                      <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'Outfit, sans-serif', marginTop: '0.3rem', maxWidth: '90px', textAlign: 'right', lineHeight: 1.4 }}>{stage.statLabel}</div>
                    </div>
                  </div>
                </AnimateIn>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            SECTION 4 — FIELD SPECIFICATIONS
            Dense data grid — technical datasheet style
        ══════════════════════════════════════════════ */}
        {data.specs.length > 0 && (
          <section style={{ padding: '5rem 2rem', background: '#050505', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <AnimateIn direction="up">
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '2rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.25em', color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace', flexShrink: 0 }}>
                    // PROTECTION PARAMETERS
                  </span>
                  <h2 style={{ fontSize: 'clamp(1.1rem, 2vw, 1.55rem)', fontWeight: 900, fontFamily: 'Space Grotesk, sans-serif', margin: 0 }}>
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
                <h2 style={{ fontSize: 'clamp(1.1rem, 2vw, 1.55rem)', fontWeight: 900, fontFamily: 'Space Grotesk, sans-serif', margin: 0 }}>
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
                style={{ display: 'inline-block', background: '#000', color: '#FFF12D', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.15em', padding: '1rem 3rem', textDecoration: 'none', borderRadius: '4px' }}>
                IDENTIFY SKU →
              </motion.a>
            </div>
          </AnimateIn>
        </section>

      </main>

      <style>{`
        @media (max-width: 768px) {
          .product-desc-grid {
            grid-template-columns: 1fr !important;
            gap: 2.5rem !important;
          }
        }
      `}</style>
    </>
  );
}
