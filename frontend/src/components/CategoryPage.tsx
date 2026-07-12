'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import '@/i18n';
import { useTranslation } from 'react-i18next';
import { useInView } from 'motion/react';
import { CatalogueItem, CATEGORY_LABELS, CATEGORY_URLS } from '@/lib/catalogue';
import { Hero } from './Hero';
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

const bodyText = {
  fontFamily: 'var(--font-body)',
  fontSize: '0.95rem',
  lineHeight: 1.75,
  color: 'rgba(255,255,255,0.72)',
};

const sectionTitle = {
  fontFamily: 'var(--font-display)',
  fontWeight: 700,
  fontSize: 'clamp(1.7rem, 3.2vw, 2.45rem)',
  color: '#fff',
  letterSpacing: '-0.02em',
  lineHeight: 1.1,
  marginBottom: '1.5rem',
};

export function CategoryPage({ item, category, industryImage, industryVideo, technologyLogo, geoData }: CategoryPageProps) {
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

  const advantages = item.benefits || [
    'Extended service intervals reduce downtime',
    'Contamination retention extends asset life',
    'Total Asset Protection across critical systems',
    'Cost-effective protection across duty cycles',
  ];

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
        />

        {geoData?.directAnswer && (
          <section style={{ padding: '4rem 2rem', background: '#000', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <p style={{ fontSize: 'clamp(1rem, 1.8vw, 1.1rem)', lineHeight: 1.85, color: 'rgba(255,255,255,0.82)', fontFamily: 'var(--font-body)', width: '100%' }}>
                {geoData.directAnswer}
              </p>
            </div>
          </section>
        )}

        {geoData?.operationalObjective && (
          <section style={{ padding: '3.5rem 2rem', background: 'rgba(255,241,45,0.025)', borderBottom: '1px solid rgba(255,241,45,0.09)' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <AnimateIn>
                <h2 style={sectionTitle}>{geoData.operationalObjective.headline}</h2>
                {geoData.operationalObjective.lines.map((line, i) => (
                  <p key={i} style={{ ...bodyText, marginBottom: i < geoData.operationalObjective!.lines.length - 1 ? '0.65rem' : 0 }}>
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
                  <h2 style={sectionTitle}>{item.name} Asset Protection</h2>
                  {geoData?.protectedAssets && geoData.protectedAssets.length > 0 && (
                    <div style={{ marginBottom: '1.5rem', display: 'grid', gap: '0.35rem' }}>
                      {geoData.protectedAssets.map((asset) => (
                        <span key={asset} style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>
                          · {asset}
                        </span>
                      ))}
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
              <h2 style={sectionTitle}>Why ELIMFILTERS</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {advantages.map((benefit, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <span style={{ color: '#FFF12D', fontWeight: 'bold', marginTop: '0.2rem' }}>•</span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>{benefit}</span>
                  </div>
                ))}
              </div>
            </AnimateIn>

            <AnimateIn direction="up" delay={0.15}>
              <div style={{ background: '#050505', border: '1px solid rgba(255,255,255,0.07)', padding: '2rem' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: '#fff', marginBottom: '1rem' }}>
                  Technologies Applied
                </h3>
                {geoData?.techFocus && (
                  <p style={{ ...bodyText, marginBottom: '1.1rem' }}>{geoData.techFocus}</p>
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
              <h2 style={sectionTitle}>Common Questions</h2>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {geoData.faq.map(({ q, a }) => (
                  <details key={q} style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '1rem 1.25rem', background: '#000' }}>
                    <summary style={{ cursor: 'pointer', fontFamily: 'var(--font-display)', color: '#fff', fontWeight: 600 }}>{q}</summary>
                    <p style={{ ...bodyText, marginTop: '0.8rem' }}>{a}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
