'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { AnimateIn, StaggerContainer, itemVariants } from './AnimateIn';
import { StagesAccordion } from './ui/stages-accordion';

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
  breadcrumbParent?: { label: string; href: string };
  systemHeadline: string;
  systemParagraphs: string[];
  productImageSrc: string;
  productImageCaption: string;
  productImageFit?: 'cover' | 'contain';
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
      {/* Breadcrumb â€” HOME â†’ TECHNOLOGY â†’ [name] */}
      <div style={{
        position: 'relative', zIndex: 20,
        background: 'rgba(0,0,0,0.6)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '0.75rem 2rem',
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Link
            href="/"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#FFF12D')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
          >HOME</Link>
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.6rem' }}>â†’</span>
          <Link
            href={data.breadcrumbParent?.href ?? '/technologies'}
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#FFF12D')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
          >{data.breadcrumbParent?.label ?? 'TECHNOLOGY'}</Link>
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.6rem' }}>â†’</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', color: '#FFF12D' }}>
            {data.heroTitle}
          </span>
        </div>
      </div>

      <main style={{ background: '#000', color: '#fff' }}>

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
            SECTION 1 â€” HERO: full-bleed image + logo
        â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        <section style={{
          position: 'relative',
          width: '100%',
          height: data.heroImage ? '100vh' : 'auto',
          minHeight: data.heroImage ? '100vh' : 'auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          /* Logo is layer 0 (screen blend), gradient is layer 1, photo is layer 2.
             All rendered together â€” no flash from separate img element. */
          backgroundImage: data.heroImage && data.logoSrc
            ? `url('${data.logoSrc}'), linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.85) 100%), url('${data.heroImage}')`
            : data.heroImage
              ? `linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.85) 100%), url('${data.heroImage}')`
              : undefined,
          backgroundBlendMode: data.logoSrc ? 'screen, normal, normal' : undefined,
          backgroundSize: data.logoSrc
            ? 'clamp(260px, 32vw, 480px) auto, cover, cover'
            : 'cover',
          backgroundPosition: data.logoSrc ? 'center 38%, center, center' : 'center',
          backgroundRepeat: data.logoSrc ? 'no-repeat, no-repeat, no-repeat' : 'no-repeat',
          backgroundColor: '#000',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>

          {/* Content over image */}
          <div style={{ position: 'relative', zIndex: 2, maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '0 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>


            {/* Spacer matching logo height so text content sits below logo in background */}
            {data.logoSrc && (
              <div style={{
                width: 'clamp(260px, 32vw, 480px)',
                /* height = width / 1.5 (logo images are 1536Ã—1024, 3:2 ratio) */
                height: 'clamp(173px, 21.3vw, 320px)',
                marginBottom: '2rem',
                flexShrink: 0,
              }} />
            )}

            {/* Tagline + Stats together as unified subtitle block */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.3 }}
              style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0' }}
            >
              <p style={{
                fontSize: 'clamp(0.85rem, 1.3vw, 1rem)',
                maxWidth: '600px',
                lineHeight: 1.8,
                color: 'rgba(255,255,255,0.65)',
                fontFamily: 'var(--font-display)',
                margin: '0 0 2rem',
              }}>
                {data.heroTagline}
              </p>

              {data.heroStats && data.heroStats.length > 0 && (
                <div
                  style={{
                    width: '100%',
                    borderTop: '1px solid rgba(255,255,255,0.12)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: '0',
                  }}
                >
                  {data.heroStats.map(({ key, value }, i) => (
                    <div key={key} style={{
                      flex: '1',
                      minWidth: '100px',
                      padding: '1.25rem 2rem',
                      borderRight: i < data.heroStats!.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                      textAlign: 'center',
                    }}>
                      <div style={{ fontSize: '0.5rem', letterSpacing: '0.22em', color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-mono)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>{key}</div>
                      <div style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', fontWeight: 900, color: '#FFF12D', fontFamily: 'var(--font-display)', lineHeight: 1 }}>{value}</div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
            SECTION 2 â€” TECHNICAL OVERVIEW
            Full prose left, lab results right (terminal)
        â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        <section style={{ padding: '6rem 2rem', background: '#050505', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="product-desc-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'start' }}>
              <AnimateIn direction="left">
                <h2 style={{ fontSize: 'clamp(1.4rem, 2.6vw, 2rem)', fontWeight: 900, fontFamily: 'var(--font-display)', lineHeight: 1.15, marginBottom: '2rem', whiteSpace: 'pre-line' }}>
                  {data.systemHeadline}
                </h2>
                {data.systemParagraphs.map((para, i) => (
                  <p key={i} style={{ fontSize: '0.92rem', lineHeight: 1.9, color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-display)', marginBottom: '1.35rem' }}>
                    {para}
                  </p>
                ))}
              </AnimateIn>

              <AnimateIn direction="right">
                {data.labResults && data.labResults.length > 0 ? (
                  <div style={{ position: 'sticky', top: '5rem', background: '#000', border: '1px solid rgba(255,241,45,0.12)' }}>
                    <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#FFF12D', boxShadow: '0 0 8px rgba(255,241,45,0.7)' }} />
                      <span style={{ fontSize: '0.58rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.35)' }}>
                        AI LAB SIMULATION â€” ISO CERTIFIED
                      </span>
                    </div>
                    <div style={{ padding: '0 1.75rem' }}>
                      {data.labResults.map((r, i) => (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <div>
                            <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.55)', marginBottom: '0.25rem' }}>{r.test}</div>
                            <div style={{ fontSize: '0.56rem', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.22)', letterSpacing: '0.08em' }}>{r.standard}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#FFF12D', fontFamily: 'var(--font-display)', lineHeight: 1 }}>{r.result}</span>
                            <span style={{ fontSize: '0.56rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)', marginLeft: '0.25rem' }}>{r.unit}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ padding: '0.9rem 1.75rem', background: 'rgba(255,241,45,0.03)', borderTop: '1px solid rgba(255,241,45,0.07)' }}>
                      <span style={{ fontSize: '0.55rem', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.07em' }}>
                        âˆ· RESULTS SIMULATED UNDER ISO-CONTROLLED CONDITIONS
                      </span>
                    </div>
                  </div>
                ) : (
                  <div style={{ position: 'sticky', top: '5rem' }}>
                    <img src={data.productImageSrc} alt={data.heroTitle}
                      style={{ width: '100%', maxHeight: data.productImageFit === 'contain' ? '520px' : '480px', objectFit: data.productImageFit ?? 'cover', objectPosition: 'center', borderRadius: '4px', border: '1px solid rgba(255,241,45,0.12)', display: 'block', background: data.productImageFit === 'contain' ? 'rgba(255,255,255,0.04)' : 'transparent' }} />
                    <p style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.22)', letterSpacing: '0.15em', marginTop: '0.75rem', textAlign: 'center' }}>
                      {data.productImageCaption}
                    </p>
                  </div>
                )}
              </AnimateIn>
            </div>
          </div>
        </section>

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
            SECTION 3 â€” PROTECTION ARCHITECTURE
            Vertical layer stack â€” numbered, opacity-graduated
        â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        <section style={{ padding: '6rem 2rem', background: '#000', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <AnimateIn direction="up">
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '2rem', marginBottom: '4rem', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: 'clamp(1.3rem, 2.4vw, 1.9rem)', fontWeight: 900, fontFamily: 'var(--font-display)', lineHeight: 1.15, margin: 0 }}>
                  {data.stagesHeading || 'EACH LAYER STOPS WHAT THE PREVIOUS CANNOT.'}
                </h2>
              </div>
            </AnimateIn>

            <StagesAccordion stages={data.stages} />
          </div>
        </section>

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
            SECTION 4 â€” FIELD SPECIFICATIONS
            Dense data grid â€” technical datasheet style
        â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {data.specs.length > 0 && (
          <section style={{ padding: '5rem 2rem', background: '#050505', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <StaggerContainer style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'rgba(255,255,255,0.05)' }}>
                {data.specs.map((spec, idx) => (
                  <motion.div key={idx} variants={itemVariants} style={{
                    background: '#050505',
                    padding: '2.25rem 2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}>
                    {/* Large value */}
                    <div style={{
                      fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
                      fontWeight: 900,
                      color: '#FFF12D',
                      fontFamily: 'var(--font-display)',
                      lineHeight: 1,
                      letterSpacing: '-0.01em',
                    }}>
                      {spec.value}
                    </div>
                    {/* Label */}
                    <div style={{
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      color: 'rgba(255,255,255,0.75)',
                      fontFamily: 'var(--font-body)',
                      textTransform: 'uppercase',
                    }}>
                      {spec.label}
                    </div>
                    {/* Description */}
                    <div style={{
                      fontSize: '0.85rem',
                      color: 'rgba(255,255,255,0.45)',
                      fontFamily: 'var(--font-body)',
                      lineHeight: 1.65,
                      borderTop: '1px solid rgba(255,255,255,0.07)',
                      paddingTop: '0.75rem',
                    }}>
                      {spec.sub}
                    </div>
                  </motion.div>
                ))}
              </StaggerContainer>
            </div>
          </section>
        )}

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
            SECTION 5 â€” FIELD REPORT (testimonial)
        â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {data.testimonial && (
          <section style={{ padding: '5rem 2rem', background: '#000', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <AnimateIn direction="up">
                <blockquote style={{
                  margin: 0,
                  padding: 'clamp(2.5rem, 5vw, 4rem) clamp(2rem, 5vw, 4rem)',
                  background: '#080808',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderLeft: '4px solid #FFF12D',
                }}>
                  <p style={{
                    fontSize: 'clamp(1.2rem, 2.2vw, 1.65rem)',
                    lineHeight: 1.75,
                    color: 'rgba(255,255,255,0.88)',
                    fontFamily: 'var(--font-display)',
                    fontStyle: 'italic',
                    fontWeight: 400,
                    margin: '0 0 2.5rem',
                  }}>
                    &ldquo;{data.testimonial.quote}&rdquo;
                  </p>
                  <footer style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ width: '36px', height: '2px', background: '#FFF12D', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-body)', fontWeight: 600, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.04em' }}>
                      {data.testimonial.role} Â· {data.testimonial.sector}
                    </span>
                  </footer>
                </blockquote>
              </AnimateIn>
            </div>
          </section>
        )}

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
            SECTION 6 â€” ASSET APPLICATIONS
        â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        <section style={{ padding: '6rem 2rem', background: '#050505', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <AnimateIn direction="up">
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '2rem', flexWrap: 'wrap', marginBottom: data.applicationsSubtext ? '1rem' : '3rem' }}>
                <h2 style={{ fontSize: 'clamp(1.1rem, 2vw, 1.55rem)', fontWeight: 900, fontFamily: 'var(--font-display)', margin: 0 }}>
                  {data.applicationsHeading}
                </h2>
              </div>
              {data.applicationsSubtext && (
                <p style={{ fontSize: '0.87rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-display)', marginBottom: '3rem', maxWidth: '560px', lineHeight: 1.7 }}>
                  {data.applicationsSubtext}
                </p>
              )}
            </AnimateIn>
            <StaggerContainer style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.04)' }}>
              {data.applications.map((app, idx) => (
                <motion.div key={idx} variants={itemVariants} style={{ background: '#050505', padding: '2rem 1.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
                    <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#FFF12D', flexShrink: 0 }} />
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.12em', color: '#FFF12D', fontFamily: 'var(--font-mono)' }}>
                      {app.sector}
                    </div>
                  </div>
                  <p style={{ fontSize: '0.97rem', lineHeight: 1.85, color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-display)', margin: 0, textAlign: 'justify' }}>
                    {app.detail}
                  </p>
                </motion.div>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
            SECTION 7 â€” CTA
        â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        <section style={{ padding: '5rem 2rem', background: '#FFF12D', textAlign: 'center' }}>
          <AnimateIn direction="up">
            <div style={{ maxWidth: '680px', margin: '0 auto' }}>
              <span style={{ display: 'block', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.25em', color: 'rgba(0,0,0,0.4)', fontFamily: 'var(--font-mono)', marginBottom: '1rem' }}>
                {data.ctaTag}
              </span>
              <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 900, fontFamily: 'var(--font-display)', color: '#000', marginBottom: '1rem', lineHeight: 1.1 }}>
                {data.ctaHeading}
              </h2>
              <p style={{ fontSize: '0.95rem', color: 'rgba(0,0,0,0.55)', fontFamily: 'var(--font-display)', marginBottom: '2.5rem', lineHeight: 1.65 }}>
                {data.ctaBody}
              </p>
              <motion.a
                href="https://part-search.elimfilters.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.03, boxShadow: '0 0 36px rgba(0,0,0,0.25)' }}
                style={{ display: 'inline-block', background: '#000', color: '#FFF12D', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.15em', padding: '1rem 3rem', textDecoration: 'none', borderRadius: '4px' }}>
                IDENTIFY SKU â†’
              </motion.a>
            </div>
          </AnimateIn>
        </section>

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
            SECTION 8 â€” RELATED KNOWLEDGE
        â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        <section style={{ padding: '5rem 2rem', background: 'linear-gradient(180deg, rgba(255,241,45,0.03) 0%, transparent 100%)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <AnimateIn direction="up">
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, fontFamily: 'var(--font-display)', color: '#FFF12D', marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>
                Related Knowledge
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-body)', marginBottom: '3rem', maxWidth: '560px' }}>
                Explore complementary resources from our engineering knowledge base.
              </p>
            </AnimateIn>
            <StaggerContainer style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {/* Standards */}
              <motion.div variants={itemVariants}>
                <Link href="/knowledge-system/standards" style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
                  <motion.div
                    whileHover={{ borderColor: 'rgba(255,241,45,0.4)', y: -3 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      padding: '2rem',
                      cursor: 'pointer',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                      borderRadius: '2px',
                    }}
                  >
                    <div style={{
                      width: '36px',
                      height: '36px',
                      border: '1px solid rgba(255,241,45,0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFF12D',
                      fontSize: '1rem',
                    }}>
                      â¬¡
                    </div>
                    <div>
                      <h3 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: '#fff',
                        marginBottom: '0.5rem',
                      }}>
                        International Standards
                      </h3>
                      <p style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.85rem',
                        color: 'rgba(255,255,255,0.45)',
                        lineHeight: 1.5,
                        margin: 0,
                      }}>
                        ISO cleanliness codes, particle counting, and filter integrity testing.
                      </p>
                    </div>
                    <div style={{
                      fontSize: '0.7rem',
                      color: 'rgba(255,241,45,0.4)',
                      fontFamily: 'var(--font-mono)',
                      letterSpacing: '0.08em',
                      marginTop: 'auto',
                    }}>
                      LEARN MORE â†’
                    </div>
                  </motion.div>
                </Link>
              </motion.div>

              {/* Contamination & Failure Modes */}
              <motion.div variants={itemVariants}>
                <Link href="/knowledge-system/contamination" style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
                  <motion.div
                    whileHover={{ borderColor: 'rgba(255,241,45,0.4)', y: -3 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      padding: '2rem',
                      cursor: 'pointer',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                      borderRadius: '2px',
                    }}
                  >
                    <div style={{
                      width: '36px',
                      height: '36px',
                      border: '1px solid rgba(255,241,45,0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFF12D',
                      fontSize: '1rem',
                    }}>
                      âš 
                    </div>
                    <div>
                      <h3 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: '#fff',
                        marginBottom: '0.5rem',
                      }}>
                        Contamination & Failure
                      </h3>
                      <p style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.85rem',
                        color: 'rgba(255,255,255,0.45)',
                        lineHeight: 1.5,
                        margin: 0,
                      }}>
                        Root causes, degradation mechanisms, and failure prevention.
                      </p>
                    </div>
                    <div style={{
                      fontSize: '0.7rem',
                      color: 'rgba(255,241,45,0.4)',
                      fontFamily: 'var(--font-mono)',
                      letterSpacing: '0.08em',
                      marginTop: 'auto',
                    }}>
                      LEARN MORE â†’
                    </div>
                  </motion.div>
                </Link>
              </motion.div>

              {/* Fleet Optimization */}
              <motion.div variants={itemVariants}>
                <Link href="/knowledge-system/fleet" style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
                  <motion.div
                    whileHover={{ borderColor: 'rgba(255,241,45,0.4)', y: -3 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      padding: '2rem',
                      cursor: 'pointer',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                      borderRadius: '2px',
                    }}
                  >
                    <div style={{
                      width: '36px',
                      height: '36px',
                      border: '1px solid rgba(255,241,45,0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFF12D',
                      fontSize: '1rem',
                    }}>
                      ðŸš›
                    </div>
                    <div>
                      <h3 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: '#fff',
                        marginBottom: '0.5rem',
                      }}>
                        Fleet Optimization
                      </h3>
                      <p style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.85rem',
                        color: 'rgba(255,255,255,0.45)',
                        lineHeight: 1.5,
                        margin: 0,
                      }}>
                        Maintenance strategies, performance tracking, and operational efficiency.
                      </p>
                    </div>
                    <div style={{
                      fontSize: '0.7rem',
                      color: 'rgba(255,241,45,0.4)',
                      fontFamily: 'var(--font-mono)',
                      letterSpacing: '0.08em',
                      marginTop: 'auto',
                    }}>
                      LEARN MORE â†’
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            </StaggerContainer>
          </div>
        </section>

      </main>

      <style>{`
        @media (max-width: 768px) {
          .product-desc-grid {
            grid-template-columns: 1fr !important;
            gap: 2.5rem !important;
          }
        }
        @media (max-width: 480px) {
          .category-tag {
            letter-spacing: 0.1em !important;
            font-size: 0.55rem !important;
            padding: 0.3rem 0.65rem !important;
            word-break: break-word !important;
            white-space: normal !important;
            max-width: 90vw !important;
          }
          .hero-stats-strip {
            justify-content: flex-start !important;
          }
          .hero-stat-item {
            flex: 1 1 45% !important;
            max-width: 50% !important;
            border-right: none !important;
            border-bottom: 1px solid rgba(255,255,255,0.06) !important;
            padding: 1.25rem 1rem !important;
          }
        }
        @media (max-width: 600px) {
          .stage-row {
            grid-template-columns: 40px 1fr !important;
            gap: 1rem 1.25rem !important;
            padding: 1.5rem 1rem !important;
          }
          .stage-stat {
            grid-column: 2 !important;
            text-align: left !important;
            min-width: unset !important;
            padding-top: 0.75rem !important;
            border-top: 1px solid rgba(255,255,255,0.05) !important;
          }
          .stage-stat div:last-child {
            max-width: unset !important;
            text-align: left !important;
          }
        }
      `}</style>
    </>
  );
}

