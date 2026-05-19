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

        {/* ── HERO: dark, logo-first, no background image ── */}
        <section style={{
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
          background: '#000',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Background grid lines */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 0,
            backgroundImage: 'linear-gradient(rgba(255,241,45,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,241,45,0.03) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }} />
          {/* Glow */}
          <div style={{ position: 'absolute', top: '-20%', right: '10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,241,45,0.05) 0%, transparent 70%)', zIndex: 0 }} />

          <div style={{ position: 'relative', zIndex: 2, maxWidth: '1200px', margin: '0 auto', padding: '5rem 2rem 4rem', width: '100%' }}>
            <div className="product-desc-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>

              {/* Left: text */}
              <div>
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                  <span style={{ display: 'inline-block', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.28em', color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace', marginBottom: '2rem', padding: '0.35rem 0.85rem', border: '1px solid rgba(255,241,45,0.3)', borderRadius: '2px' }}>
                    {data.categoryTag}
                  </span>
                </motion.div>
                <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.1 }}
                  style={{ fontSize: 'clamp(2.8rem, 6vw, 4.5rem)', fontWeight: 900, fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.0, marginBottom: '0.4rem' }}>
                  {data.heroTitle}
                </motion.h1>
                {data.heroSubtitle && (
                  <motion.h2 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.18 }}
                    style={{ fontSize: 'clamp(1.2rem, 3vw, 2.2rem)', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', color: '#FFF12D', marginBottom: '2rem' }}>
                    {data.heroSubtitle}
                  </motion.h2>
                )}
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.55, delay: 0.28 }}
                  style={{ fontSize: '0.95rem', maxWidth: '480px', lineHeight: 1.8, color: 'rgba(255,255,255,0.6)', fontFamily: 'Outfit, sans-serif', borderLeft: '2px solid #FFF12D', paddingLeft: '1rem', marginTop: data.heroSubtitle ? 0 : '2rem' }}>
                  {data.heroTagline}
                </motion.p>
                {data.heroStats && data.heroStats.length > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.42 }}
                    style={{ display: 'flex', gap: '2.5rem', marginTop: '2.5rem', flexWrap: 'wrap', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                    {data.heroStats.map(({ key, value }) => (
                      <div key={key}>
                        <div style={{ fontSize: '0.55rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.35)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.3rem' }}>{key}</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFF12D', fontFamily: 'Space Grotesk, sans-serif' }}>{value}</div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Right: logo on dark panel */}
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }}>
                <div style={{
                  background: '#050505',
                  border: '1px solid rgba(255,241,45,0.12)',
                  borderRadius: '4px',
                  padding: '4rem 3rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2rem',
                }}>
                  <img
                    src={data.logoSrc}
                    alt={data.heroTitle}
                    style={{ width: '100%', maxWidth: '280px', height: 'auto', display: 'block', filter: 'brightness(1.1)' }}
                  />
                  {/* Layer indicator */}
                  <div style={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {data.stages.slice(0, 3).map((s, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: `${100 - i * 22}%`, height: '4px', background: `rgba(255,241,45,${0.9 - i * 0.25})`, borderRadius: '2px', transition: 'width 0.3s' }} />
                        <span style={{ fontSize: '0.55rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>{s.tag}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── SYSTEM OVERVIEW ── */}
        <section style={{ padding: '6rem 2rem', background: '#000', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="product-desc-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'start' }}>
              <AnimateIn direction="left">
                <span style={{ display: 'block', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.25em', color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace', marginBottom: '1.5rem' }}>
                  // SYSTEM OVERVIEW
                </span>
                <h2 style={{ fontSize: 'clamp(1.5rem, 2.8vw, 2.2rem)', fontWeight: 900, fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.15, marginBottom: '1.5rem', whiteSpace: 'pre-line' }}>
                  {data.systemHeadline}
                </h2>
                {data.systemParagraphs.map((para, i) => (
                  <p key={i} style={{ fontSize: '0.92rem', lineHeight: 1.85, color: 'rgba(255,255,255,0.6)', fontFamily: 'Outfit, sans-serif', marginBottom: '1.25rem' }}>
                    {para}
                  </p>
                ))}
              </AnimateIn>

              {/* Lab Results */}
              <AnimateIn direction="right">
                {data.labResults && data.labResults.length > 0 ? (
                  <div style={{ background: '#050505', border: '1px solid rgba(255,241,45,0.12)', padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FFF12D', boxShadow: '0 0 8px rgba(255,241,45,0.6)' }} />
                      <span style={{ fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.4)' }}>
                        SIMULATION — AI LAB RESULTS
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                      {data.labResults.map((r, i) => (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'center', padding: '0.9rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <div>
                            <div style={{ fontSize: '0.7rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.55)', marginBottom: '0.2rem' }}>{r.test}</div>
                            <div style={{ fontSize: '0.58rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em' }}>{r.standard}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#FFF12D', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1 }}>{r.result}</span>
                            <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)', fontFamily: 'JetBrains Mono, monospace', marginLeft: '0.3rem' }}>{r.unit}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: '1.25rem', padding: '0.75rem', background: 'rgba(255,241,45,0.04)', border: '1px solid rgba(255,241,45,0.08)' }}>
                      <span style={{ fontSize: '0.58rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em' }}>
                        ∷ RESULTS SIMULATED UNDER ISO-CONTROLLED CONDITIONS · AI-ASSISTED ANALYSIS
                      </span>
                    </div>
                  </div>
                ) : (
                  <div style={{ position: 'sticky', top: '6rem' }}>
                    <img src={data.productImageSrc} alt={data.heroTitle}
                      style={{ width: '100%', borderRadius: '4px', border: '1px solid rgba(255,241,45,0.12)', display: 'block' }} />
                    <p style={{ fontSize: '0.62rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.15em', marginTop: '0.75rem', textAlign: 'center' }}>
                      {data.productImageCaption}
                    </p>
                  </div>
                )}
              </AnimateIn>
            </div>
          </div>
        </section>

        {/* ── PROTECTION ARCHITECTURE (layer diagram) ── */}
        <section style={{ padding: '6rem 2rem', background: '#050505', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <AnimateIn direction="up">
              <span style={{ display: 'block', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.25em', color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.75rem' }}>
                // PROTECTION ARCHITECTURE
              </span>
              <h2 style={{ fontSize: 'clamp(1.5rem, 2.8vw, 2.2rem)', fontWeight: 900, fontFamily: 'Space Grotesk, sans-serif', marginBottom: '4rem', lineHeight: 1.15 }}>
                {data.stagesHeading || 'EACH LAYER STOPS WHAT THE PREVIOUS CANNOT.'}
              </h2>
            </AnimateIn>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {data.stages.map((stage, idx) => (
                <AnimateIn key={idx} direction="up">
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '72px 1fr auto',
                    gap: '2.5rem',
                    alignItems: 'start',
                    padding: '2.5rem 2rem',
                    background: '#000',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderLeft: `3px solid rgba(255,241,45,${1 - idx * 0.25})`,
                    borderRadius: '1px',
                  }}>
                    <div style={{ paddingTop: '0.25rem' }}>
                      <div style={{ fontSize: '0.55rem', letterSpacing: '0.2em', color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.4rem' }}>{stage.tag}</div>
                      <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'rgba(255,255,255,0.06)', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1 }}>{stage.number}</div>
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', color: '#fff', marginBottom: '0.85rem', letterSpacing: '0.03em' }}>
                        {stage.title}
                      </h3>
                      <p style={{ fontSize: '0.87rem', lineHeight: 1.85, color: 'rgba(255,255,255,0.55)', fontFamily: 'Outfit, sans-serif', margin: 0, maxWidth: '580px' }}>
                        {stage.body}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', minWidth: '90px', paddingTop: '0.25rem' }}>
                      <div style={{ fontSize: '2rem', fontWeight: 900, color: '#FFF12D', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1 }}>{stage.stat}</div>
                      <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)', fontFamily: 'Outfit, sans-serif', marginTop: '0.35rem', maxWidth: '100px', textAlign: 'right', lineHeight: 1.4 }}>{stage.statLabel}</div>
                    </div>
                  </div>
                </AnimateIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── FIELD SPECS ── */}
        {data.specs.length > 0 && (
          <section style={{ padding: '5rem 2rem', background: '#000', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <AnimateIn direction="up">
                <span style={{ display: 'block', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.25em', color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.75rem' }}>
                  // PROTECTION PARAMETERS
                </span>
                <h2 style={{ fontSize: 'clamp(1.3rem, 2.2vw, 1.8rem)', fontWeight: 900, fontFamily: 'Space Grotesk, sans-serif', marginBottom: '3rem' }}>
                  {data.specsHeading || 'FIELD SPECIFICATIONS'}
                </h2>
              </AnimateIn>
              <StaggerContainer style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.04)' }}>
                {data.specs.map((spec, idx) => (
                  <motion.div key={idx} variants={itemVariants} style={{ background: '#000', padding: '1.75rem 1.5rem' }}>
                    <div style={{ fontSize: '0.55rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.65rem' }}>{spec.label}</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#FFF12D', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1, marginBottom: '0.4rem' }}>{spec.value}</div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit, sans-serif', lineHeight: 1.5 }}>{spec.sub}</div>
                  </motion.div>
                ))}
              </StaggerContainer>
            </div>
          </section>
        )}

        {/* ── TESTIMONIAL ── */}
        {data.testimonial && (
          <section style={{ padding: '5rem 2rem', background: '#050505', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <AnimateIn direction="up">
                <span style={{ display: 'block', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.25em', color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace', marginBottom: '2.5rem' }}>
                  // FIELD REPORT
                </span>
                <blockquote style={{ margin: 0, padding: '2.5rem', background: '#000', border: '1px solid rgba(255,255,255,0.07)', borderLeft: '3px solid #FFF12D' }}>
                  <p style={{ fontSize: '1.05rem', lineHeight: 1.85, color: 'rgba(255,255,255,0.75)', fontFamily: 'Outfit, sans-serif', fontStyle: 'italic', margin: '0 0 1.5rem' }}>
                    &ldquo;{data.testimonial.quote}&rdquo;
                  </p>
                  <footer style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '32px', height: '1px', background: '#FFF12D' }} />
                    <span style={{ fontSize: '0.65rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em' }}>
                      {data.testimonial.role} · {data.testimonial.sector}
                    </span>
                  </footer>
                </blockquote>
              </AnimateIn>
            </div>
          </section>
        )}

        {/* ── APPLICATIONS ── */}
        <section style={{ padding: '6rem 2rem', background: '#000', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <AnimateIn direction="up">
              <span style={{ display: 'block', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.25em', color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.75rem' }}>
                // ASSET APPLICATIONS
              </span>
              <h2 style={{ fontSize: 'clamp(1.3rem, 2.2vw, 1.8rem)', fontWeight: 900, fontFamily: 'Space Grotesk, sans-serif', marginBottom: '0.75rem' }}>
                {data.applicationsHeading}
              </h2>
              {data.applicationsSubtext && (
                <p style={{ fontSize: '0.87rem', color: 'rgba(255,255,255,0.45)', fontFamily: 'Outfit, sans-serif', marginBottom: '3rem', maxWidth: '560px', lineHeight: 1.7 }}>
                  {data.applicationsSubtext}
                </p>
              )}
              {!data.applicationsSubtext && <div style={{ marginBottom: '3rem' }} />}
            </AnimateIn>
            <StaggerContainer style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.04)' }}>
              {data.applications.map((app, idx) => (
                <motion.div key={idx} variants={itemVariants} style={{ background: '#000', padding: '2.25rem 2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.9rem' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FFF12D', flexShrink: 0 }} />
                    <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.18em', color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace' }}>
                      {app.sector}
                    </div>
                  </div>
                  <p style={{ fontSize: '0.85rem', lineHeight: 1.85, color: 'rgba(255,255,255,0.55)', fontFamily: 'Outfit, sans-serif', margin: 0 }}>
                    {app.detail}
                  </p>
                </motion.div>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ padding: '5rem 2rem', background: '#FFF12D', textAlign: 'center' }}>
          <AnimateIn direction="up">
            <div style={{ maxWidth: '680px', margin: '0 auto' }}>
              <span style={{ display: 'block', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.25em', color: 'rgba(0,0,0,0.45)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '1rem' }}>
                {data.ctaTag}
              </span>
              <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 900, fontFamily: 'Space Grotesk, sans-serif', color: '#000', marginBottom: '1rem', lineHeight: 1.1 }}>
                {data.ctaHeading}
              </h2>
              <p style={{ fontSize: '0.95rem', color: 'rgba(0,0,0,0.6)', fontFamily: 'Outfit, sans-serif', marginBottom: '2.5rem', lineHeight: 1.65 }}>
                {data.ctaBody}
              </p>
              <motion.a
                href="https://part-search.elimfilters.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.03, boxShadow: '0 0 36px rgba(0,0,0,0.3)' }}
                style={{ display: 'inline-block', background: '#000', color: '#FFF12D', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.15em', padding: '1rem 3rem', textDecoration: 'none', borderRadius: '4px' }}>
                IDENTIFY SKU →
              </motion.a>
            </div>
          </AnimateIn>
        </section>

      </main>
    </>
  );
}
