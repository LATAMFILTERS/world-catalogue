'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import '@/i18n';
import { useTranslation } from 'react-i18next';
import { useInView } from 'motion/react';
import { CatalogueItem, CATEGORY_LABELS, CATEGORY_URLS } from '@/lib/catalogue';
import { Hero } from './Hero';
import { FeatureList } from './FeatureList';
import { CTASection } from './CTASection';
import { AnimateIn } from './AnimateIn';

interface CategoryPageProps {
  item: CatalogueItem;
  category: 'industries' | 'products' | 'technologies';
  industryImage?: string;
  industryVideo?: string;
  technologyLogo?: string;
  geoData?: {
    directAnswer?: string;
    faq?: { q: string; a: string }[];
    lastUpdated?: string;
    schemas?: object[];
    ctaTitle?: string;
    ctaDescription?: string;
    protectionLabel?: string;
    videoSectionName?: string;
    protectedAssets?: string[];
    protectionSystems?: string[];
    techFocus?: string;
    knowledgeLinks?: { label: string; href?: string }[];
    preCtaQuote?: { line1: string; line2: string };
    operationalObjective?: { headline: string; lines: string[] };
  };
  industryLinks?: {
    contamination?: { href: string; label: string }[];
    systems?: { href: string; label: string }[];
    knowledge?: { href: string; label: string }[];
  };
}

function InlineVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const inView = useInView(ref, { once: false, margin: '-10%' });

  useEffect(() => {
    if (!ref.current) return;
    if (inView) {
      ref.current.play().catch(() => {});
    } else {
      ref.current.pause();
    }
  }, [inView]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        paddingBottom: '56.25%',
        height: 0,
        overflow: 'hidden',
        borderRadius: '12px',
        border: '1px solid rgba(255,241,45,0.2)',
      }}
    >
      <video
        ref={ref}
        playsInline
        muted
        loop
        preload="metadata"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      >
        <source src={src} type="video/mp4" />
      </video>
    </div>
  );
}

const CATEGORY_BG: Record<string, string> = {
  industries: '/images/elimfilters_back2.jpg',
  products: '/images/fondomotor.PNG',
  technologies: '/images/media-filtrante.png',
};

const labelStyle = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.65rem',
  letterSpacing: '0.2em',
  color: '#FFF12D',
  textTransform: 'uppercase' as const,
};

const bodyText = {
  fontFamily: 'var(--font-body)',
  fontSize: '0.95rem',
  lineHeight: 1.75,
  color: 'rgba(255,255,255,0.65)',
};

export function CategoryPage({ item, category, industryImage, industryVideo, technologyLogo, geoData, industryLinks }: CategoryPageProps) {
  const { t } = useTranslation();
  const bgImage = CATEGORY_BG[category];
  const categoryLabel = CATEGORY_LABELS[category];

  let buttonHref = 'https://part-search.elimfilters.com';
  if (item.cta?.includes('MACROCORE')) {
    buttonHref = '/technologies/macrocore';
  } else if (item.cta?.includes('TECHNOLOGY')) {
    buttonHref = '/technologies';
  } else if (item.cta?.includes('SPECIFICATIONS')) {
    buttonHref = '#technical-specs';
  }

  return (
    <>
      <main>
        {geoData?.schemas && geoData.schemas.map((schema, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}

        <div
          style={{
            position: 'relative',
            zIndex: 20,
            background: 'rgba(0,0,0,0.6)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            padding: '0.75rem 2rem',
          }}
        >
          <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Link href="/" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>
              {t('category.home', 'HOME')}
            </Link>
            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.6rem' }}>→</span>
            <Link href={CATEGORY_URLS[category]} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>
              {categoryLabel.toUpperCase()}
            </Link>
            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.6rem' }}>→</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', color: '#FFF12D' }}>
              {item.title}
            </span>
          </div>
        </div>

        <Hero
          title={item.title}
          subtitle={item.subtitle || undefined}
          tagline={item.description}
          ctaText={item.cta}
          backgroundImage={industryImage || bgImage}
          category={`${categoryLabel} ENGINEERING`}
        />

        {geoData?.directAnswer && (
          <section style={{ padding: '3rem 2rem', background: '#000', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ maxWidth: '860px', margin: '0 auto' }}>
              <p style={{ ...labelStyle, marginBottom: '1rem' }}>INDUSTRIAL CONTEXT</p>
              <p style={{ fontSize: 'clamp(0.95rem, 1.8vw, 1.05rem)', lineHeight: 1.85, color: 'rgba(255,255,255,0.82)', fontFamily: 'var(--font-body)', width: '100%' }}>
                {geoData.directAnswer}
              </p>
            </div>
          </section>
        )}

        {geoData?.operationalObjective && (
          <section style={{ padding: '2.5rem 2rem', background: 'rgba(255,241,45,0.03)', borderBottom: '1px solid rgba(255,241,45,0.1)' }}>
            <div style={{ maxWidth: '860px', margin: '0 auto' }}>
              <AnimateIn>
                <p style={{ ...labelStyle, marginBottom: '0.75rem' }}>OPERATIONAL OBJECTIVE</p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1rem, 2vw, 1.15rem)', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>
                  {geoData.operationalObjective.headline}
                </p>
                {geoData.operationalObjective.lines.map((line, i) => (
                  <p key={i} style={{ ...bodyText, marginBottom: i < geoData.operationalObjective!.lines.length - 1 ? '0.5rem' : 0 }}>
                    {line}
                  </p>
                ))}
              </AnimateIn>
            </div>
          </section>
        )}

        {industryVideo && (
          <section style={{ padding: '5rem 2rem', background: '#000', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <div className="product-desc-grid" style={{ display: 'grid', gridTemplateColumns: '60% 40%', gap: '3rem', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ width: '32px', height: '2px', background: '#FFF12D' }} />
                    <span style={labelStyle}>
                      {geoData?.videoSectionName ?? item.name.toUpperCase()} ASSET PROTECTION {geoData?.protectionLabel ?? 'SYSTEM'}
                    </span>
                  </div>
                  <h3 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'rgba(255,255,255,0.75)', marginBottom: '1.5rem', lineHeight: 1.2 }}>
                    ENGINEERED FOR {item.name.toUpperCase()}
                  </h3>
                  {geoData?.protectedAssets && geoData.protectedAssets.length > 0 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <p style={{ ...labelStyle, fontSize: '0.62rem', letterSpacing: '0.15em', marginBottom: '0.6rem' }}>PROTECTED ASSETS</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {geoData.protectedAssets.map((asset) => (
                          <span key={asset} style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                            · {asset}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {(item.videoBody && item.videoBody.length > 0 ? item.videoBody : [
                    `The protection media is the core of every ELIMFILTERS system. In ${item.name} applications, protection systems must perform under the specific contamination conditions, thermal demands, and operational duty cycles of that environment.`,
                    `Every micron of contamination matters. ELIMFILTERS systems help ${item.name} operations maintain productivity, reduce maintenance interruptions, and protect critical equipment from contamination-related failure.`,
                  ]).map((para, i) => (
                    <p key={i} style={{ ...bodyText, color: i === 0 ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.7)', marginBottom: '1rem' }}>
                      {para}
                    </p>
                  ))}
                </div>
                <InlineVideo src={industryVideo} />
              </div>
            </div>
          </section>
        )}

        {technologyLogo && (
          <section style={{ padding: '6rem 2rem', background: 'linear-gradient(135deg, rgba(255,241,45,0.08) 0%, rgba(0,0,0,0.5) 100%)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ maxWidth: '400px' }}>
              <img src={technologyLogo} alt={`${item.name} Logo`} style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>
          </section>
        )}

        <section id="features" style={{ padding: '6rem 0', background: '#000', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'start' }}>
            <AnimateIn direction="up">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ width: '32px', height: '2px', background: '#FFF12D' }} />
                <span style={labelStyle}>PROTECTION LOGIC</span>
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', color: '#fff', letterSpacing: '-0.01em', lineHeight: 1.1, marginBottom: '2rem' }}>
                ASSET PROTECTION
                <br />
                <span style={{ color: '#FFF12D' }}>OPERATING ADVANTAGES</span>
              </h2>
              <p style={{ ...bodyText, maxWidth: '420px' }}>{item.description}</p>
            </AnimateIn>

            <AnimateIn direction="up" delay={0.15}>
              <FeatureList features={item.features} title="Core Capabilities" />
            </AnimateIn>
          </div>
        </section>

        <section style={{ padding: '6rem 0', background: '#050505', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'start' }}>
            <AnimateIn direction="up">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ width: '32px', height: '2px', background: '#FFF12D' }} />
                <span style={labelStyle}>ENGINEERING EXCELLENCE</span>
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', color: '#fff', letterSpacing: '-0.01em', lineHeight: 1.1, marginBottom: '1.5rem' }}>
                PRECISION ENGINEERING
                <br />
                <span style={{ color: '#FFF12D' }}>CONTAMINATION CONTROL</span>
              </h2>
              <p style={bodyText}>
                {item.engineeringBody ?? 'ELIMFILTERS engineering is built around Total Asset Protection — controlling contamination at the source to prevent degradation, extend equipment lifespan and reduce the total cost of ownership across critical industrial systems.'}
              </p>
            </AnimateIn>

            <AnimateIn direction="up" delay={0.15}>
              <div style={{ background: '#000', border: '1px solid rgba(255,255,255,0.08)', padding: '2rem' }}>
                <p style={{ ...labelStyle, color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem' }}>SYSTEM SPECIFICATIONS</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {item.features.map((feature, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>{feature}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#FFF12D', letterSpacing: '0.05em' }}>ACTIVE</span>
                    </div>
                  ))}
                </div>
              </div>
            </AnimateIn>
          </div>
        </section>

        <section style={{ padding: '6rem 0', background: '#000', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '4rem', alignItems: 'start' }}>
            <AnimateIn direction="up">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ width: '32px', height: '2px', background: '#FFF12D' }} />
                <span style={labelStyle}>OPERATIONAL ADVANTAGES</span>
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: '#fff', letterSpacing: '-0.01em', lineHeight: 1.1, marginBottom: '2rem' }}>
                WHY ELIMFILTERS
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {(item.benefits || [
                  'Extended service intervals reduce downtime',
                  'Contamination retention extends asset life',
                  'Total Asset Protection across critical systems',
                  'Cost-effective protection across duty cycles',
                ]).map((benefit, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <span style={{ color: '#FFF12D', fontWeight: 'bold', marginTop: '0.2rem' }}>•</span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>{benefit}</span>
                  </div>
                ))}
              </div>
            </AnimateIn>

            <AnimateIn direction="up" delay={0.15}>
              <div style={{ background: '#050505', border: '1px solid rgba(255,255,255,0.07)', padding: '2rem' }}>
                {geoData?.protectionSystems && geoData.protectionSystems.length > 0 && (
                  <div style={{ marginBottom: '1.75rem' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                      PROTECTION SYSTEMS
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.25rem' }}>
                      {geoData.protectionSystems.map((ps) => (
                        <span key={ps} style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
                          · {ps}
                        </span>
                      ))}
                    </div>
                    <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.07)', margin: '1.25rem 0' }} />
                  </div>
                )}
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                  TECHNOLOGIES INCLUDED
                </h3>
                {geoData?.techFocus && (
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', marginBottom: '1rem', lineHeight: 1.5 }}>
                    {geoData.techFocus}
                  </p>
                )}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {(item.techTags || ['SYNTRAX™', 'NANOFORCE™', 'MACROCORE™', 'SYNTEPORE™', 'INTEKCORE™']).map((tech) => {
                    const slug = tech.toLowerCase().replace(/™|®/g, '').replace(/\//g, '-').replace(/\s+/g, '-');
                    return (
                      <Link key={tech} href={`/technologies/${slug}`} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.05em', padding: '0.3rem 0.7rem', border: '1px solid rgba(255,241,45,0.25)', color: 'rgba(255,241,45,0.75)', background: 'rgba(255,241,45,0.04)', textDecoration: 'none' }}>
                        {tech}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </AnimateIn>
          </div>
        </section>

        {geoData?.knowledgeLinks && geoData.knowledgeLinks.length > 0 && (
          <section style={{ padding: '4rem 2rem', background: '#050505', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <AnimateIn>
                <p style={{ ...labelStyle, marginBottom: '1rem' }}>KNOWLEDGE NETWORK</p>
                <h2 style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)', fontWeight: 700, fontFamily: 'var(--font-display)', color: '#fff', marginBottom: '2rem' }}>
                  Protection Systems Applied
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                  {geoData.knowledgeLinks.map(({ label, href }) => {
                    const inner = (
                      <div style={{ padding: '1rem 1.25rem', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '4px', background: '#000' }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', display: 'block' }}>
                          {label} {href ? '→' : ''}
                        </span>
                      </div>
                    );
                    return href ? <Link key={label} href={href} style={{ textDecoration: 'none', display: 'block' }}>{inner}</Link> : <div key={label}>{inner}</div>;
                  })}
                </div>
              </AnimateIn>
            </div>
          </section>
        )}

        {geoData?.preCtaQuote && (
          <section style={{ padding: '3rem 2rem', background: '#000', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ maxWidth: '860px', margin: '0 auto', textAlign: 'center' }}>
              <AnimateIn>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', fontWeight: 600, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, marginBottom: '0.5rem' }}>
                  {geoData.preCtaQuote.line1}
                </p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', fontWeight: 600, color: '#FFF12D', lineHeight: 1.6 }}>
                  {geoData.preCtaQuote.line2}
                </p>
              </AnimateIn>
            </div>
          </section>
        )}

        <CTASection
          title={geoData?.ctaTitle ?? 'Ready to Protect Your Equipment?'}
          description={geoData?.ctaDescription ?? `Find the right asset protection system for your ${item.name.toLowerCase()} application. Cross-reference 500,000+ parts.`}
          buttonText={item.cta}
          buttonHref={buttonHref}
        />

        {industryLinks && (
          <section style={{ padding: '3rem 2rem', background: '#000', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ maxWidth: '860px', margin: '0 auto' }}>
              <p style={{ ...labelStyle, marginBottom: '2rem' }}>KNOWLEDGE NETWORK</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem' }}>
                {industryLinks.contamination && industryLinks.contamination.length > 0 && (
                  <div>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.28)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Contamination Threats</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                      {industryLinks.contamination.map((link) => (
                        <Link key={link.href} href={link.href} style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>→ {link.label}</Link>
                      ))}
                    </div>
                  </div>
                )}
                {industryLinks.systems && industryLinks.systems.length > 0 && (
                  <div>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.28)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Protection Systems</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                      {industryLinks.systems.map((link) => (
                        <Link key={link.href} href={link.href} style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>→ {link.label}</Link>
                      ))}
                    </div>
                  </div>
                )}
                {industryLinks.knowledge && industryLinks.knowledge.length > 0 && (
                  <div>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.28)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Knowledge System</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                      {industryLinks.knowledge.map((link) => (
                        <Link key={link.href} href={link.href} style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>→ {link.label}</Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {geoData?.faq && geoData.faq.length > 0 && (
          <section style={{ padding: '5rem 2rem', background: '#050505', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: geoData.faq.map(({ q, a }) => ({
                  '@type': 'Question',
                  name: q,
                  acceptedAnswer: { '@type': 'Answer', text: a },
                })),
              })}}
            />
            <div style={{ maxWidth: '860px', margin: '0 auto' }}>
              <p style={{ ...labelStyle, marginBottom: '1rem' }}>COMMON QUESTIONS</p>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, fontFamily: 'var(--font-display)', color: '#fff', marginBottom: '3rem' }}>
                Frequently Asked Questions
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {geoData.faq.map(({ q, a }) => (
                  <div key={q} style={{ padding: '1.75rem', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', background: '#000' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'rgba(255,255,255,0.9)', marginBottom: '0.75rem' }}>{q}</h3>
                    <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-body)', margin: 0 }}>{a}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
