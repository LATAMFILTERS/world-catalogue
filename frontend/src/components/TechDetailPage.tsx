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

function ProtectionDiagram({ stages }: { stages: TechStage[] }) {
  return (
    <div style={{ fontFamily: 'JetBrains Mono, monospace' }}>
      <div style={{ fontSize: '0.52rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.2)', marginBottom: '1.5rem' }}>
        ∷ CROSS-SECTION — PROTECTION MATRIX
      </div>

      {/* Flow direction header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.5rem', color: 'rgba(255,241,45,0.4)', letterSpacing: '0.15em' }}>CONTAMINATED FLOW</div>
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(255,241,45,0.3), transparent)' }} />
        <div style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.15)', letterSpacing: '0.15em' }}>CLEAN OUTPUT</div>
      </div>

      {/* Layer rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {stages.map((stage, idx) => {
          const opacity = 1 - idx * 0.22;
          const particleCount = Math.max(1, stages.length - idx);
          const particleSize = Math.max(4, 9 - idx * 1.5);
          return (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {/* Contamination particles */}
              <div style={{ width: '44px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
                {Array.from({ length: particleCount }).map((_, i) => (
                  <div key={i} style={{
                    width: `${particleSize - i}px`,
                    height: `${particleSize - i}px`,
                    borderRadius: '50%',
                    background: `rgba(255,241,45,${opacity})`,
                    flexShrink: 0,
                  }} />
                ))}
              </div>

              {/* Layer bar */}
              <div style={{
                flex: 1,
                height: '28px',
                background: `rgba(255,241,45,${0.05 + (stages.length - idx) * 0.015})`,
                borderTop: `1px solid rgba(255,241,45,${opacity * 0.4})`,
                borderBottom: `1px solid rgba(255,241,45,${opacity * 0.15})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 0.75rem',
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Texture lines */}
                <div style={{
                  position: 'absolute', inset: 0,
                  backgroundImage: `repeating-linear-gradient(90deg, rgba(255,241,45,${opacity * 0.04}) 0px, rgba(255,241,45,${opacity * 0.04}) 1px, transparent 1px, transparent ${6 + idx * 2}px)`,
                }} />
                <span style={{ fontSize: '0.5rem', color: `rgba(255,241,45,${opacity})`, letterSpacing: '0.12em', zIndex: 1 }}>
                  {stage.tag}
                </span>
                <span style={{ fontSize: '0.48rem', color: 'rgba(255,255,255,0.3)', zIndex: 1 }}>
                  {stage.title.split(' ').slice(0, 2).join(' ')}
                </span>
              </div>

              {/* Stat */}
              <div style={{ width: '52px', textAlign: 'right', fontSize: '0.78rem', fontWeight: 900, color: '#FFF12D', flexShrink: 0 }}>
                {stage.stat}
              </div>
            </div>
          );
        })}
      </div>

      {/* Clean output bar */}
      <div style={{
        marginTop: '8px',
        height: '24px',
        background: 'rgba(255,241,45,0.04)',
        border: '1px solid rgba(255,241,45,0.18)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
      }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FFF12D', boxShadow: '0 0 8px rgba(255,241,45,0.8)' }} />
        <span style={{ fontSize: '0.5rem', letterSpacing: '0.2em', color: 'rgba(255,241,45,0.7)' }}>VERIFIED CLEAN — ASSET PROTECTED</span>
      </div>
    </div>
  );
}

function SpecBar({ value, max = 100 }: { value: string; max?: number }) {
  const num = parseFloat(value.replace(/[^0-9.]/g, ''));
  const pct = isNaN(num) ? 100 : Math.min(100, (num / max) * 100);
  const chars = Math.round(pct / 5);
  return (
    <span style={{ color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem' }}>
      [{Array.from({ length: 20 }).map((_, i) => i < chars ? '█' : '░').join('')}]
    </span>
  );
}

export function TechDetailPage({ data }: Props) {
  return (
    <>
      <Link href="/" style={{
        position: 'fixed', top: '1rem', right: '1.5rem', zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        background: 'rgba(0,0,0,0.9)', border: '1px solid rgba(255,241,45,0.35)',
        borderRadius: '4px', padding: '0.45rem 1rem',
        fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.72rem',
        letterSpacing: '0.12em', color: '#FFF12D', textDecoration: 'none',
        backdropFilter: 'blur(8px)',
      }}>← HOME</Link>

      <main style={{ background: '#000', color: '#fff' }}>

        {/* ══════════════════════════════════════════════════
            01 — SPLIT HERO
            Logo left · Technical file right
        ══════════════════════════════════════════════════ */}
        <section style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '55% 45%' }} className="tech-hero-grid">

          {/* LEFT — Identity */}
          <div style={{
            background: '#000',
            display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'flex-start',
            padding: '8rem 5rem 6rem',
            borderRight: '1px solid rgba(255,241,45,0.08)',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Faint dot matrix — stays behind logo */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'radial-gradient(rgba(255,241,45,0.04) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
              pointerEvents: 'none',
            }} />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse 90% 80% at 30% 50%, transparent 40%, #000 100%)',
              pointerEvents: 'none',
            }} />

            <div style={{ position: 'relative', zIndex: 2, width: '100%' }}>
              {/* Category tag */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <span style={{
                  display: 'inline-block', fontSize: '0.58rem', fontWeight: 700,
                  letterSpacing: '0.26em', color: '#FFF12D',
                  fontFamily: 'JetBrains Mono, monospace',
                  marginBottom: '3rem',
                  padding: '0.3rem 0.75rem',
                  border: '1px solid rgba(255,241,45,0.22)',
                  borderRadius: '2px',
                }}>
                  {data.categoryTag}
                </span>
              </motion.div>

              {/* Logo — screen blend, large, clean */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                style={{ marginBottom: '3rem' }}
              >
                <img
                  src={data.logoSrc}
                  alt={data.heroTitle}
                  style={{
                    display: 'block',
                    width: '100%',
                    maxWidth: '400px',
                    height: 'auto',
                    mixBlendMode: 'screen',
                    filter: 'brightness(1.15) contrast(1.1) saturate(1.05)',
                  }}
                />
              </motion.div>

              {/* Name + subtitle */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.25 }}>
                <h1 style={{
                  fontSize: 'clamp(2.4rem, 5vw, 4rem)',
                  fontWeight: 900,
                  fontFamily: 'Space Grotesk, sans-serif',
                  lineHeight: 1.0, letterSpacing: '-0.02em',
                  marginBottom: data.heroSubtitle ? '0.3rem' : '1.25rem',
                }}>
                  {data.heroTitle}
                </h1>
                {data.heroSubtitle && (
                  <div style={{
                    fontSize: 'clamp(0.85rem, 1.8vw, 1.2rem)',
                    fontWeight: 700,
                    fontFamily: 'Space Grotesk, sans-serif',
                    color: '#FFF12D',
                    letterSpacing: '0.08em',
                    marginBottom: '1.5rem',
                  }}>
                    {data.heroSubtitle}
                  </div>
                )}
              </motion.div>

              {/* Tagline */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.55, delay: 0.4 }}
                style={{
                  fontSize: '0.9rem', maxWidth: '480px',
                  lineHeight: 1.85, color: 'rgba(255,255,255,0.45)',
                  fontFamily: 'Outfit, sans-serif', fontStyle: 'italic',
                  borderLeft: '2px solid rgba(255,241,45,0.3)',
                  paddingLeft: '1rem',
                }}
              >
                {data.heroTagline}
              </motion.p>
            </div>
          </div>

          {/* RIGHT — Technical file */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              background: '#060606',
              display: 'flex', flexDirection: 'column',
              justifyContent: 'center',
              padding: '8rem 4rem 6rem',
              fontFamily: 'JetBrains Mono, monospace',
              position: 'relative', overflow: 'hidden',
            }}
          >
            {/* Scanlines effect */}
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
              backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 1px, transparent 1px, transparent 3px)',
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              {/* File header */}
              <div style={{
                fontSize: '0.52rem', letterSpacing: '0.2em',
                color: 'rgba(255,241,45,0.5)', marginBottom: '2.5rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid rgba(255,241,45,0.1)',
              }}>
                ∷ ELIMFILTERS — ARCHIVO TÉCNICO / {data.heroTitle}
              </div>

              {/* Hero stats as instrument readouts */}
              {data.heroStats && data.heroStats.map(({ key, value }, i) => (
                <motion.div key={key}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                  style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'baseline', gap: '1rem',
                    padding: '1.1rem 0',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  <span style={{ fontSize: '0.52rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.25)' }}>
                    {key}
                  </span>
                  <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#FFF12D', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1 }}>
                    {value}
                  </span>
                </motion.div>
              ))}

              {/* Protection doctrine */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.65 }}
                style={{ marginTop: '3rem' }}
              >
                <div style={{ fontSize: '0.5rem', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.18)', marginBottom: '1.25rem' }}>
                  — DOCTRINA DE PROTECCIÓN
                </div>
                <h2 style={{
                  fontSize: 'clamp(0.95rem, 1.8vw, 1.3rem)',
                  fontWeight: 900,
                  fontFamily: 'Space Grotesk, sans-serif',
                  lineHeight: 1.25, whiteSpace: 'pre-line',
                  color: 'rgba(255,255,255,0.85)',
                }}>
                  {data.systemHeadline}
                </h2>
              </motion.div>

              {/* Stage count indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                style={{
                  marginTop: '2.5rem',
                  padding: '1rem',
                  background: 'rgba(255,241,45,0.04)',
                  border: '1px solid rgba(255,241,45,0.1)',
                  display: 'flex', alignItems: 'center', gap: '1rem',
                }}
              >
                <span style={{ fontSize: '2rem', fontWeight: 900, color: '#FFF12D', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1 }}>
                  {data.stages.length}
                </span>
                <div>
                  <div style={{ fontSize: '0.5rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', marginBottom: '0.25rem' }}>
                    CAPAS DE PROTECCIÓN ACTIVAS
                  </div>
                  <div style={{ fontSize: '0.5rem', letterSpacing: '0.12em', color: 'rgba(255,241,45,0.5)' }}>
                    ARQUITECTURA CERTIFICADA ISO
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* ══════════════════════════════════════════════════
            02 — DOCTRINE STATEMENT
            La verdad técnica de por qué existe esta tecnología
        ══════════════════════════════════════════════════ */}
        <section style={{
          padding: '5rem 3rem',
          background: '#050505',
          borderTop: '1px solid rgba(255,241,45,0.1)',
          borderBottom: '1px solid rgba(255,241,45,0.1)',
        }}>
          <AnimateIn direction="up">
            <div style={{ maxWidth: '880px', margin: '0 auto', textAlign: 'center' }}>
              <div style={{
                display: 'inline-block',
                fontSize: '0.52rem', letterSpacing: '0.22em',
                color: 'rgba(255,241,45,0.5)',
                fontFamily: 'JetBrains Mono, monospace',
                marginBottom: '2rem',
              }}>
                // POR QUÉ EXISTE {data.heroTitle}
              </div>
              <p style={{
                fontSize: 'clamp(1.05rem, 2.2vw, 1.5rem)',
                lineHeight: 1.75,
                color: 'rgba(255,255,255,0.82)',
                fontFamily: 'Outfit, sans-serif',
                fontStyle: 'italic',
                margin: 0,
              }}>
                &ldquo;{data.heroTagline}&rdquo;
              </p>
            </div>
          </AnimateIn>
        </section>

        {/* ══════════════════════════════════════════════════
            03 — OVERVIEW TÉCNICO + DIAGRAMA DE SECCIÓN
        ══════════════════════════════════════════════════ */}
        <section style={{ padding: '7rem 2rem', background: '#000', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
            <div className="tech-overview-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6rem', alignItems: 'start' }}>

              <AnimateIn direction="left">
                <span style={{
                  display: 'block', fontSize: '0.58rem', fontWeight: 700,
                  letterSpacing: '0.24em', color: '#FFF12D',
                  fontFamily: 'JetBrains Mono, monospace', marginBottom: '2rem',
                }}>
                  // OVERVIEW TÉCNICO
                </span>
                <h2 style={{
                  fontSize: 'clamp(1.4rem, 2.6vw, 2rem)',
                  fontWeight: 900, fontFamily: 'Space Grotesk, sans-serif',
                  lineHeight: 1.15, marginBottom: '2.5rem', whiteSpace: 'pre-line',
                }}>
                  {data.systemHeadline}
                </h2>
                {data.systemParagraphs.map((para, i) => (
                  <p key={i} style={{
                    fontSize: '0.91rem', lineHeight: 1.95,
                    color: 'rgba(255,255,255,0.55)',
                    fontFamily: 'Outfit, sans-serif', marginBottom: '1.35rem',
                  }}>
                    {para}
                  </p>
                ))}
              </AnimateIn>

              <AnimateIn direction="right">
                <div style={{
                  background: '#060606',
                  border: '1px solid rgba(255,241,45,0.1)',
                  padding: '2rem 2rem 1.5rem',
                  position: 'sticky', top: '5rem',
                }}>
                  <ProtectionDiagram stages={data.stages} />
                </div>
              </AnimateIn>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            04 — STACK DE PROTECCIÓN
            Cada capa como fila de ingeniería
        ══════════════════════════════════════════════════ */}
        <section style={{ padding: '7rem 2rem', background: '#050505', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
            <AnimateIn direction="up">
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '2rem', marginBottom: '5rem', flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.24em',
                  color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace', flexShrink: 0,
                }}>
                  // ARQUITECTURA DE PROTECCIÓN
                </span>
                <h2 style={{
                  fontSize: 'clamp(1.2rem, 2.3vw, 1.75rem)',
                  fontWeight: 900, fontFamily: 'Space Grotesk, sans-serif',
                  lineHeight: 1.15, margin: 0,
                }}>
                  {data.stagesHeading || 'CADA CAPA DETIENE LO QUE LA ANTERIOR NO PUEDE.'}
                </h2>
              </div>
            </AnimateIn>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {data.stages.map((stage, idx) => {
                const borderOpacity = 1 - idx * 0.22;
                return (
                  <AnimateIn key={idx} direction="up">
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '88px 1fr 110px',
                      gap: '0',
                      alignItems: 'stretch',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                    }}>
                      {/* Number column */}
                      <div style={{
                        padding: '2.5rem 1.5rem',
                        borderRight: `3px solid rgba(255,241,45,${borderOpacity})`,
                        display: 'flex', flexDirection: 'column', justifyContent: 'center',
                        background: 'rgba(0,0,0,0.3)',
                      }}>
                        <div style={{
                          fontSize: '0.48rem', letterSpacing: '0.18em',
                          color: `rgba(255,241,45,${borderOpacity})`,
                          fontFamily: 'JetBrains Mono, monospace',
                          marginBottom: '0.5rem',
                        }}>
                          {stage.tag}
                        </div>
                        <div style={{
                          fontSize: '3rem', fontWeight: 900,
                          color: 'rgba(255,255,255,0.04)',
                          fontFamily: 'Space Grotesk, sans-serif',
                          lineHeight: 1,
                        }}>
                          {stage.number}
                        </div>
                      </div>

                      {/* Content column */}
                      <div style={{ padding: '2.5rem 3rem' }}>
                        <h3 style={{
                          fontSize: '0.95rem', fontWeight: 700,
                          fontFamily: 'Space Grotesk, sans-serif',
                          color: '#fff', marginBottom: '1rem', letterSpacing: '0.03em',
                        }}>
                          {stage.title}
                        </h3>
                        <p style={{
                          fontSize: '0.85rem', lineHeight: 1.95,
                          color: 'rgba(255,255,255,0.48)',
                          fontFamily: 'Outfit, sans-serif', margin: 0,
                        }}>
                          {stage.body}
                        </p>
                      </div>

                      {/* Stat column */}
                      <div style={{
                        padding: '2.5rem 1.5rem',
                        borderLeft: '1px solid rgba(255,255,255,0.04)',
                        display: 'flex', flexDirection: 'column',
                        justifyContent: 'center', alignItems: 'flex-end',
                      }}>
                        <div style={{
                          fontSize: 'clamp(1.4rem, 2vw, 1.9rem)',
                          fontWeight: 900, color: '#FFF12D',
                          fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1,
                          marginBottom: '0.4rem', textAlign: 'right',
                        }}>
                          {stage.stat}
                        </div>
                        <div style={{
                          fontSize: '0.58rem', color: 'rgba(255,255,255,0.25)',
                          fontFamily: 'JetBrains Mono, monospace',
                          lineHeight: 1.5, textAlign: 'right', maxWidth: '90px',
                        }}>
                          {stage.statLabel}
                        </div>
                      </div>
                    </div>
                  </AnimateIn>
                );
              })}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            05 — TERMINAL DE ESPECIFICACIONES
            CLI-style readout con progress bars
        ══════════════════════════════════════════════════ */}
        {data.specs.length > 0 && (
          <section style={{ padding: '6rem 2rem', background: '#000', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
              <AnimateIn direction="up">
                <div style={{
                  background: '#060606',
                  border: '1px solid rgba(255,241,45,0.12)',
                  fontFamily: 'JetBrains Mono, monospace',
                  overflow: 'hidden',
                }}>
                  {/* Terminal header */}
                  <div style={{
                    padding: '1rem 1.75rem',
                    background: 'rgba(255,241,45,0.05)',
                    borderBottom: '1px solid rgba(255,241,45,0.1)',
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                  }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {['rgba(255,80,80,0.6)', 'rgba(255,180,0,0.6)', 'rgba(80,200,80,0.6)'].map((c, i) => (
                        <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c }} />
                      ))}
                    </div>
                    <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.15em', marginLeft: '0.5rem' }}>
                      elimfilters-spec-protocol — {data.heroTitle}
                    </span>
                  </div>

                  {/* Terminal body */}
                  <div style={{ padding: '1.75rem 2rem' }}>
                    <div style={{ fontSize: '0.6rem', color: 'rgba(255,241,45,0.6)', marginBottom: '0.4rem' }}>
                      $ elimfilters verify --tech={data.heroTitle.toLowerCase().replace(/[™®]/g, '')} --protocol=ISO
                    </div>
                    <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', marginBottom: '1.5rem' }}>
                      › Cargando protocolo de verificación... OK
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem' }}>
                      {data.specs.map((spec, idx) => (
                        <StaggerContainer key={idx} style={{ marginBottom: '1.1rem' }}>
                          <motion.div variants={itemVariants} style={{
                            display: 'grid',
                            gridTemplateColumns: '180px 1fr auto',
                            gap: '1rem',
                            alignItems: 'center',
                          }}>
                            <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em' }}>
                              {spec.label}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#FFF12D', fontFamily: 'Space Grotesk, sans-serif' }}>
                                {spec.value}
                              </span>
                              <span style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em' }}>
                                {spec.sub}
                              </span>
                            </div>
                            <SpecBar value={spec.value} />
                          </motion.div>
                        </StaggerContainer>
                      ))}
                    </div>

                    <div style={{
                      marginTop: '1.5rem', paddingTop: '1.25rem',
                      borderTop: '1px solid rgba(255,255,255,0.06)',
                      fontSize: '0.58rem', color: 'rgba(255,241,45,0.5)',
                    }}>
                      › STATUS: <span style={{ color: '#FFF12D' }}>CERTIFICADO</span> — {data.heroTitle} cumple todos los parámetros de protección
                    </div>
                  </div>
                </div>
              </AnimateIn>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════
            06 — PANEL DE RESULTADOS DE LABORATORIO
        ══════════════════════════════════════════════════ */}
        {data.labResults && data.labResults.length > 0 && (
          <section style={{ padding: '6rem 2rem', background: '#050505', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
              <AnimateIn direction="up">
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '2rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.24em', color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace', flexShrink: 0 }}>
                    // RESULTADOS DE LABORATORIO
                  </span>
                  <h2 style={{ fontSize: 'clamp(1rem, 1.8vw, 1.4rem)', fontWeight: 900, fontFamily: 'Space Grotesk, sans-serif', margin: 0 }}>
                    SIMULACIÓN IA — CONDICIONES ISO
                  </h2>
                </div>
              </AnimateIn>

              <div className="tech-overview-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', background: 'rgba(255,255,255,0.03)' }}>
                {data.labResults.map((r, i) => (
                  <AnimateIn key={i} direction="up">
                    <div style={{
                      background: '#050505',
                      padding: '2.25rem 2.5rem',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem',
                    }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.6)', marginBottom: '0.4rem' }}>
                          {r.test}
                        </div>
                        <div style={{ fontSize: '0.55rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }}>
                          {r.standard}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#FFF12D', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1 }}>
                          {r.result}
                        </span>
                        <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono, monospace', marginLeft: '0.3rem' }}>
                          {r.unit}
                        </span>
                      </div>
                    </div>
                  </AnimateIn>
                ))}
              </div>

              <div style={{
                marginTop: '1px', background: '#050505',
                padding: '1rem 2.5rem',
                borderTop: '1px solid rgba(255,241,45,0.07)',
              }}>
                <span style={{ fontSize: '0.52rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.18)', letterSpacing: '0.08em' }}>
                  ∷ RESULTADOS SIMULADOS BAJO CONDICIONES CONTROLADAS ISO · ANÁLISIS ASISTIDO POR IA
                </span>
              </div>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════
            07 — REGISTRO DE CAMPO
            Testimonial como documento oficial
        ══════════════════════════════════════════════════ */}
        {data.testimonial && (
          <section style={{ padding: '6rem 2rem', background: '#000', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <AnimateIn direction="up">
                {/* Document header */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                  marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem',
                }}>
                  <div>
                    <div style={{ fontSize: '0.52rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,241,45,0.6)', letterSpacing: '0.2em', marginBottom: '0.35rem' }}>
                      // REGISTRO DE CAMPO
                    </div>
                    <div style={{ fontSize: '0.5rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.15em' }}>
                      {data.heroTitle} · VERIFICADO · OPERACIÓN REAL
                    </div>
                  </div>
                  <div style={{
                    padding: '0.3rem 0.75rem',
                    border: '1px solid rgba(255,241,45,0.25)',
                    fontSize: '0.5rem', fontFamily: 'JetBrains Mono, monospace',
                    color: '#FFF12D', letterSpacing: '0.15em',
                  }}>
                    FIELD VERIFIED
                  </div>
                </div>

                {/* Document body */}
                <div style={{
                  background: '#050505',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderLeft: '4px solid #FFF12D',
                  padding: '2.5rem 3rem',
                }}>
                  <div style={{
                    fontSize: '0.5rem', fontFamily: 'JetBrains Mono, monospace',
                    color: 'rgba(255,255,255,0.2)', letterSpacing: '0.12em',
                    marginBottom: '1.25rem',
                  }}>
                    RESULTADO REPORTADO:
                  </div>
                  <p style={{
                    fontSize: '1rem', lineHeight: 1.9,
                    color: 'rgba(255,255,255,0.78)',
                    fontFamily: 'Outfit, sans-serif',
                    fontStyle: 'italic', margin: '0 0 2rem',
                  }}>
                    &ldquo;{data.testimonial.quote}&rdquo;
                  </p>
                  <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: '0.48rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.12em', marginBottom: '0.25rem' }}>OPERADOR</div>
                      <div style={{ fontSize: '0.65rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.55)' }}>{data.testimonial.role}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.48rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.12em', marginBottom: '0.25rem' }}>SECTOR</div>
                      <div style={{ fontSize: '0.65rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.55)' }}>{data.testimonial.sector}</div>
                    </div>
                  </div>
                </div>
              </AnimateIn>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════
            08 — DESPLIEGUE DE ACTIVOS
            Applications como deployment grid numerado
        ══════════════════════════════════════════════════ */}
        <section style={{ padding: '7rem 2rem', background: '#050505', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
            <AnimateIn direction="up">
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '2rem', flexWrap: 'wrap', marginBottom: data.applicationsSubtext ? '1rem' : '4rem' }}>
                <span style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.24em', color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace', flexShrink: 0 }}>
                  // DESPLIEGUE DE ACTIVOS
                </span>
                <h2 style={{ fontSize: 'clamp(1.1rem, 1.9vw, 1.5rem)', fontWeight: 900, fontFamily: 'Space Grotesk, sans-serif', margin: 0 }}>
                  {data.applicationsHeading}
                </h2>
              </div>
              {data.applicationsSubtext && (
                <p style={{ fontSize: '0.86rem', color: 'rgba(255,255,255,0.38)', fontFamily: 'Outfit, sans-serif', marginBottom: '4rem', maxWidth: '560px', lineHeight: 1.75 }}>
                  {data.applicationsSubtext}
                </p>
              )}
            </AnimateIn>

            <StaggerContainer style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.04)' }}>
              {data.applications.map((app, idx) => (
                <motion.div key={idx} variants={itemVariants} style={{ background: '#050505', padding: '2.25rem 2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{
                        fontSize: '0.48rem', color: 'rgba(255,255,255,0.15)',
                        fontFamily: 'JetBrains Mono, monospace',
                      }}>
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#FFF12D', flexShrink: 0 }} />
                      <div style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.16em', color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace' }}>
                        {app.sector}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '0.45rem', fontFamily: 'JetBrains Mono, monospace',
                      color: 'rgba(255,241,45,0.5)', letterSpacing: '0.1em',
                      padding: '0.2rem 0.5rem',
                      border: '1px solid rgba(255,241,45,0.15)',
                    }}>
                      ACTIVE
                    </div>
                  </div>
                  <p style={{ fontSize: '0.83rem', lineHeight: 1.9, color: 'rgba(255,255,255,0.48)', fontFamily: 'Outfit, sans-serif', margin: 0 }}>
                    {app.detail}
                  </p>
                </motion.div>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            09 — CTA
        ══════════════════════════════════════════════════ */}
        <section style={{ padding: '6rem 2rem', background: '#FFF12D', textAlign: 'center' }}>
          <AnimateIn direction="up">
            <div style={{ maxWidth: '680px', margin: '0 auto' }}>
              <span style={{ display: 'block', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.24em', color: 'rgba(0,0,0,0.4)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '1rem' }}>
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
                whileHover={{ scale: 1.03 }}
                style={{ display: 'inline-block', background: '#000', color: '#FFF12D', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.15em', padding: '1rem 3rem', textDecoration: 'none', borderRadius: '4px' }}
              >
                IDENTIFICAR SKU →
              </motion.a>
            </div>
          </AnimateIn>
        </section>

      </main>

      <style>{`
        @media (max-width: 900px) {
          .tech-hero-grid { grid-template-columns: 1fr !important; }
          .tech-overview-grid { grid-template-columns: 1fr !important; gap: 2.5rem !important; }
        }
        @media (max-width: 640px) {
          .tech-hero-grid > div:first-child { padding: 6rem 2rem 4rem !important; }
          .tech-hero-grid > div:last-child { padding: 4rem 2rem !important; }
        }
      `}</style>
    </>
  );
}
