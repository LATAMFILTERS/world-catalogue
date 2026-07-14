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

function cleanText(value: string) {
  return value
    .replace(/â„¢/g, '™')
    .replace(/Â®/g, '®')
    .replace(/Â·/g, '·')
    .replace(/â€”/g, '-')
    .replace(/â†’/g, '')
    .replace(/âˆ·/g, '')
    .replace(/Ã—/g, '×');
}

const breadcrumbLink = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.62rem',
  letterSpacing: '0.1em',
  color: 'rgba(255,255,255,0.4)',
  textDecoration: 'none',
  transition: 'color 0.2s',
} as const;

const breadcrumbDivider = {
  color: 'rgba(255,255,255,0.22)',
  fontSize: '0.62rem',
} as const;

const breadcrumbCurrent = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.62rem',
  letterSpacing: '0.1em',
  color: '#FFF12D',
} as const;

const sectionBase = {
  padding: '6rem 2rem',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
} as const;

const sectionHeadline = {
  fontSize: 'clamp(1.4rem, 2.6vw, 2rem)',
  fontWeight: 900,
  fontFamily: 'var(--font-display)',
  lineHeight: 1.15,
  marginBottom: '2rem',
  whiteSpace: 'pre-line',
} as const;

const bodyCopy = {
  fontSize: '0.92rem',
  lineHeight: 1.9,
  color: 'rgba(255,255,255,0.58)',
  fontFamily: 'var(--font-display)',
  marginBottom: '1.35rem',
} as const;

const smallLabel = {
  fontSize: '0.58rem',
  fontFamily: 'var(--font-mono)',
  letterSpacing: '0.18em',
  color: 'rgba(255,255,255,0.35)',
  textTransform: 'uppercase',
} as const;

export function TechDetailPage({ data }: Props) {
  const title = cleanText(data.heroTitle);

  return (
    <>
      <div style={{ position: 'relative', zIndex: 20, background: 'rgba(0,0,0,0.6)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '0.75rem 2rem' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link href="/" style={breadcrumbLink}>HOME</Link>
          <span style={breadcrumbDivider}>/</span>
          <Link href={data.breadcrumbParent?.href ?? '/technologies'} style={breadcrumbLink}>{data.breadcrumbParent?.label ?? 'TECHNOLOGY'}</Link>
          <span style={breadcrumbDivider}>/</span>
          <span style={breadcrumbCurrent}>{title}</span>
        </div>
      </div>

      <main id="main-content" style={{ background: '#000', color: '#fff' }}>
        <section
          style={{
            position: 'relative',
            width: '100%',
            minHeight: data.heroImage ? '100vh' : 'auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            backgroundImage: data.heroImage
              ? `linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.85) 100%), url('${data.heroImage}')`
              : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundColor: '#000',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '0 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {data.logoSrc && (
              <img
                src={data.logoSrc}
                alt={title}
                style={{
                  width: 'clamp(260px, 32vw, 480px)',
                  height: 'auto',
                  marginBottom: '2rem',
                  flexShrink: 0,
                  mixBlendMode: 'screen',
                }}
              />
            )}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.3 }} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <p style={{ fontSize: 'clamp(0.85rem, 1.3vw, 1rem)', maxWidth: '600px', lineHeight: 1.8, color: 'rgba(255,255,255,0.65)', fontFamily: 'var(--font-display)', margin: '0 0 2rem' }}>
                {cleanText(data.heroTagline)}
              </p>
              {data.heroStats && data.heroStats.length > 0 && (
                <div style={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.12)', display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {data.heroStats.map(({ key, value }, i) => (
                    <div key={key} style={{ flex: '1', minWidth: '100px', padding: '1.25rem 2rem', borderRight: i < data.heroStats!.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.5rem', letterSpacing: '0.22em', color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-mono)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>{cleanText(key)}</div>
                      <div style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', fontWeight: 900, color: '#FFF12D', fontFamily: 'var(--font-display)', lineHeight: 1 }}>{cleanText(value)}</div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </section>

        <section style={{ ...sectionBase, background: '#050505' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="product-desc-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'start' }}>
              <AnimateIn direction="left">
                <h2 style={sectionHeadline}>{cleanText(data.systemHeadline)}</h2>
                {data.systemParagraphs.map((para, i) => <p key={i} style={bodyCopy}>{cleanText(para)}</p>)}
              </AnimateIn>

              <AnimateIn direction="right">
                {data.labResults && data.labResults.length > 0 ? (
                  <div style={{ position: 'sticky', top: '5rem', background: '#000', border: '1px solid rgba(255,241,45,0.12)' }}>
                    <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#FFF12D', boxShadow: '0 0 8px rgba(255,241,45,0.7)' }} />
                      <span style={smallLabel}>AI LAB SIMULATION - ISO CERTIFIED</span>
                    </div>
                    <div style={{ padding: '0 1.75rem' }}>
                      {data.labResults.map((r, i) => (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <div>
                            <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.55)', marginBottom: '0.25rem' }}>{cleanText(r.test)}</div>
                            <div style={{ fontSize: '0.56rem', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.22)', letterSpacing: '0.08em' }}>{cleanText(r.standard)}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#FFF12D', fontFamily: 'var(--font-display)', lineHeight: 1 }}>{cleanText(r.result)}</span>
                            <span style={{ fontSize: '0.56rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)', marginLeft: '0.25rem' }}>{cleanText(r.unit)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ padding: '0.9rem 1.75rem', background: 'rgba(255,241,45,0.03)', borderTop: '1px solid rgba(255,241,45,0.07)' }}>
                      <span style={{ ...smallLabel, color: 'rgba(255,255,255,0.24)' }}>RESULTS SIMULATED UNDER ISO-CONTROLLED CONDITIONS</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ position: 'sticky', top: '5rem' }}>
                    <img src={data.productImageSrc} alt={title} style={{ width: '100%', maxHeight: data.productImageFit === 'contain' ? '520px' : '480px', objectFit: data.productImageFit ?? 'cover', objectPosition: 'center', borderRadius: '4px', border: '1px solid rgba(255,241,45,0.12)', display: 'block', background: data.productImageFit === 'contain' ? 'rgba(255,255,255,0.04)' : 'transparent' }} />
                    <p style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.22)', letterSpacing: '0.15em', marginTop: '0.75rem', textAlign: 'center' }}>{cleanText(data.productImageCaption)}</p>
                  </div>
                )}
              </AnimateIn>
            </div>
          </div>
        </section>

        <section style={{ ...sectionBase, background: '#000' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <AnimateIn direction="up">
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '2rem', marginBottom: '4rem', flexWrap: 'wrap' }}>
                <h2 style={sectionHeadline}>{data.stagesHeading ? cleanText(data.stagesHeading) : 'EACH LAYER STOPS WHAT THE PREVIOUS CANNOT.'}</h2>
              </div>
            </AnimateIn>
            <StagesAccordion stages={data.stages.map((stage) => ({ ...stage, tag: cleanText(stage.tag), title: cleanText(stage.title), body: cleanText(stage.body), stat: cleanText(stage.stat), statLabel: cleanText(stage.statLabel) }))} />
          </div>
        </section>

        {data.specs.length > 0 && (
          <section style={{ ...sectionBase, background: '#050505' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <StaggerContainer style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.05)' }}>
                {data.specs.map((spec, idx) => (
                  <motion.div key={idx} variants={itemVariants} style={{ background: '#050505', padding: '2.25rem 2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: 900, color: '#FFF12D', fontFamily: 'var(--font-display)', lineHeight: 1 }}>{cleanText(spec.value)}</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.75)', fontFamily: 'var(--font-body)', textTransform: 'uppercase' }}>{cleanText(spec.label)}</div>
                    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-body)', lineHeight: 1.65, borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '0.75rem' }}>{cleanText(spec.sub)}</div>
                  </motion.div>
                ))}
              </StaggerContainer>
            </div>
          </section>
        )}

        {data.testimonial && (
          <section style={{ ...sectionBase, background: '#000' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <AnimateIn direction="up">
                <blockquote style={{ margin: 0, padding: 'clamp(2.5rem, 5vw, 4rem) clamp(2rem, 5vw, 4rem)', background: '#080808', border: '1px solid rgba(255,255,255,0.07)', borderLeft: '4px solid #FFF12D' }}>
                  <p style={{ fontSize: 'clamp(1.2rem, 2.2vw, 1.65rem)', lineHeight: 1.75, color: 'rgba(255,255,255,0.88)', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 400, margin: '0 0 2.5rem' }}>
                    &ldquo;{cleanText(data.testimonial.quote)}&rdquo;
                  </p>
                  <footer style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ width: '36px', height: '2px', background: '#FFF12D', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-body)', fontWeight: 600, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.04em' }}>
                      {cleanText(data.testimonial.role)} · {cleanText(data.testimonial.sector)}
                    </span>
                  </footer>
                </blockquote>
              </AnimateIn>
            </div>
          </section>
        )}

        <section style={{ ...sectionBase, background: '#050505' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <AnimateIn direction="up">
              <h2 style={{ ...sectionHeadline, marginBottom: '0.5rem' }}>{cleanText(data.applicationsHeading)}</h2>
              {data.applicationsSubtext && <p style={{ ...bodyCopy, maxWidth: '720px' }}>{cleanText(data.applicationsSubtext)}</p>}
            </AnimateIn>
            <StaggerContainer style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
              {data.applications.map((app) => (
                <motion.div key={app.sector} variants={itemVariants} style={{ background: '#000', border: '1px solid rgba(255,255,255,0.08)', padding: '1.75rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: '#FFF12D', marginBottom: '1rem', textTransform: 'uppercase' }}>{cleanText(app.sector)}</h3>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'rgba(255,255,255,0.62)', lineHeight: 1.65 }}>{cleanText(app.detail)}</p>
                </motion.div>
              ))}
            </StaggerContainer>
          </div>
        </section>

        <section style={{ padding: '5rem 2rem', background: 'linear-gradient(135deg, #FFF12D 0%, #d9cc00 100%)', color: '#000' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
            <AnimateIn direction="up">
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.2em', fontWeight: 700, marginBottom: '1rem' }}>{cleanText(data.ctaTag)}</p>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 900, fontFamily: 'var(--font-display)', lineHeight: 1.05, marginBottom: '1rem' }}>{cleanText(data.ctaHeading)}</h2>
              <p style={{ fontSize: '1rem', fontFamily: 'var(--font-body)', lineHeight: 1.7, maxWidth: '700px', margin: '0 auto 2rem', opacity: 0.82 }}>{cleanText(data.ctaBody)}</p>
              <motion.a href="https://part-search.elimfilters.com" target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.03, boxShadow: '0 0 36px rgba(0,0,0,0.25)' }} style={{ display: 'inline-block', background: '#000', color: '#FFF12D', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.15em', padding: '1rem 3rem', textDecoration: 'none', borderRadius: '4px' }}>
                IDENTIFY SKU
              </motion.a>
            </AnimateIn>
          </div>
        </section>

        <section style={{ padding: '5rem 2rem', background: 'linear-gradient(180deg, rgba(255,241,45,0.03) 0%, transparent 100%)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <AnimateIn direction="up">
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, fontFamily: 'var(--font-display)', color: '#FFF12D', marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>Related Knowledge</h2>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-body)', marginBottom: '3rem', maxWidth: '560px' }}>Explore complementary resources from our engineering knowledge base.</p>
            </AnimateIn>
            <StaggerContainer style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {[
                { href: '/knowledge-system/standards', code: 'STD', title: 'International Standards', text: 'ISO cleanliness codes, particle counting, and filter integrity testing.' },
                { href: '/knowledge-system/contamination', code: 'FAIL', title: 'Contamination & Failure', text: 'Root causes, degradation mechanisms, and failure prevention.' },
                { href: '/knowledge-system/fleet', code: 'FLEET', title: 'Fleet Optimization', text: 'Maintenance strategies, performance tracking, and operational efficiency.' },
              ].map((item) => (
                <motion.div key={item.href} variants={itemVariants}>
                  <Link href={item.href} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
                    <motion.div whileHover={{ borderColor: 'rgba(255,241,45,0.4)', y: -3 }} transition={{ duration: 0.2 }} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', padding: '2rem', cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column', gap: '1rem', borderRadius: '2px' }}>
                      <div style={{ width: '44px', height: '36px', border: '1px solid rgba(255,241,45,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF12D', fontSize: '0.62rem', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.08em' }}>{item.code}</div>
                      <div>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>{item.title}</h3>
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5, margin: 0 }}>{item.text}</p>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'rgba(255,241,45,0.55)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginTop: 'auto' }}>LEARN MORE</div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
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
      `}</style>
    </>
  );
}
