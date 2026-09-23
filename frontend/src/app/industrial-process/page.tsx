import type { Metadata } from 'next';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { VIDEO_HERO_TREATMENT } from '@/lib/hero-media';
import { INDUSTRIAL_PROCESS_PLATFORMS, industrialProcessPlatformUrl, industrialProcessTechnologyUrl } from '@/lib/industrial-process-architecture';
import { getCanonicalKnowledgeBySlug } from '@/lib/services/canonical-knowledge-service';

const BASE_URL = 'https://elimfilters.com';

export const metadata: Metadata = {
  title: 'Industrial & Process Filtration | ELIMFILTERS',
  description:
    'ELIMFILTERS Industrial & Process is the engineering entry point for high-value filtration, separation, fluid conditioning, gas conditioning, air treatment and industrial water projects.',
  alternates: { canonical: '/industrial-process/' },
  openGraph: {
    title: 'Industrial & Process Filtration | ELIMFILTERS',
    description:
      'Engineering-led filtration and process protection for industrial air, dust and fume, gas, fluids and water.',
    url: 'https://elimfilters.com/industrial-process/',
    type: 'website',
    siteName: 'ELIMFILTERS',
    images: [{ url: '/images/planta_converted.avif', width: 1200, height: 630, alt: 'ELIMFILTERS Industrial & Process filtration' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Industrial & Process Filtration | ELIMFILTERS',
    description: 'Engineering-led filtration and process protection for industrial air, dust and fume, gas, fluids and water.',
    images: ['/images/planta_converted.avif'],
  },
};

const projectInputs = [
  'Process fluid or gas',
  'Contaminant / treatment objective',
  'Flow rate',
  'Operating and design pressure',
  'Temperature',
  'Required efficiency / quality target',
  'Applicable standard / test method / target class',
  'Materials and chemical compatibility',
  'Existing housing, vessel or system',
];

const productIdentity = [
  'ELIMFILTERS master brand',
  'Canonical SKU + product name',
  'Industrial & Process',
  'Platform',
  'Technology family',
  'Application / duty',
  'Validated performance',
];

const datasheetBlocks = [
  'Product identity',
  'Application / duty',
  'Treatment mechanism',
  'Performance',
  'Operating envelope',
  'Materials / construction',
  'Dimensions / connections',
  'Compatibility',
  'Standards / test methods',
  'Ordering information',
];

export default function IndustrialProcessPage() {
  const rootCanonicalKnowledge = getCanonicalKnowledgeBySlug('ip-industrial-process-architecture');
  const videoSchema = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    '@id': `${BASE_URL}/industrial-process/#hero-video`,
    name: 'Industrial & Process Filtration | ELIMFILTERS',
    description: 'Engineering-led filtration and process protection for industrial air, dust and fume, gas, fluids and water.',
    contentUrl: `${BASE_URL}/images/presentacion.mp4`,
    thumbnailUrl: [`${BASE_URL}/images/planta_converted.avif`],
    isPartOf: { '@id': `${BASE_URL}/industrial-process/#page` },
    publisher: { '@id': `${BASE_URL}/#organization` },
  };
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${BASE_URL}/industrial-process/#page`,
    url: `${BASE_URL}/industrial-process/`,
    name: 'Industrial & Process Filtration | ELIMFILTERS',
    description: metadata.description,
    isPartOf: { '@id': `${BASE_URL}/#website` },
    publisher: { '@id': `${BASE_URL}/#organization` },
    about: INDUSTRIAL_PROCESS_PLATFORMS.map((platform) => ({ '@type': 'DefinedTerm', name: platform.name })),
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: INDUSTRIAL_PROCESS_PLATFORMS.length,
      itemListElement: INDUSTRIAL_PROCESS_PLATFORMS.map((platform, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: platform.name,
        url: `${BASE_URL}${industrialProcessPlatformUrl(platform.slug)}`,
      })),
    },
  };
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Industrial & Process', item: `${BASE_URL}/industrial-process/` },
    ],
  };
  const platformStandards = INDUSTRIAL_PROCESS_PLATFORMS.map((platform) => ({
    platform,
    standards: platform.knowledgeCenterSlug ? (getCanonicalKnowledgeBySlug(platform.knowledgeCenterSlug)?.standards ?? []) : [],
  })).filter((item) => item.standards.length > 0);
  const inquiryHref =
    'mailto:info@elimfilters.com?subject=Industrial%20%26%20Process%20Engineering%20Review&body=Company%3A%0ACountry%3A%0AIndustry%20%2F%20process%3A%0AApplication%3A%0AFluid%20or%20gas%3A%0AFlow%3A%0APressure%3A%0ATemperature%3A%0AContaminant%20or%20treatment%20objective%3A%0AExisting%20equipment%20%2F%20reference%3A%0AProject%20timing%3A';

  return (
    <>
      <Navigation />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }} />
      <main style={{ background: '#000', color: '#fff', minHeight: '100vh', fontFamily: 'var(--font-body)' }}>
        <section
          style={{
            position: 'relative',
            minHeight: '82vh',
            display: 'flex',
            alignItems: 'end',
            overflow: 'hidden',
            padding: 'clamp(8rem, 16vw, 13rem) var(--section-px) clamp(4.5rem, 9vw, 7rem)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            background:
              'radial-gradient(circle at 82% 22%, rgba(255,241,45,0.12), transparent 27%), linear-gradient(145deg,#000 0%,#050505 62%,#0b0b0b 100%)',
          }}
        >
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              opacity: VIDEO_HERO_TREATMENT.opacity,
              zIndex: 0,
            }}
          >
            <source src="/images/presentacion.mp4" type="video/mp4" />
          </video>

          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              background: VIDEO_HERO_TREATMENT.overlayBackground,
              zIndex: 1,
            }}
          />

          <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 1400, margin: '0 auto' }}>
            <p style={eyebrow}>INDUSTRIAL & PROCESS</p>
            <h1 style={heroTitle}>
              ENGINEER THE PROCESS.
              <span style={{ display: 'block', color: '#FFF12D' }}>PROTECT THE ASSET.</span>
            </h1>
            <p style={heroCopy}>
              A dedicated engineering entry point for industrial filtration, separation and process conditioning projects. Start with the operating problem, process conditions and required outcome — not with a generic filter list.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 28 }}>
              <a href={inquiryHref} data-conversion-action="industrial-engineering-review" style={primaryButton}>
                REQUEST ENGINEERING REVIEW
              </a>
              <a href="#platforms" style={secondaryButton}>EXPLORE TECHNOLOGIES</a>
            </div>
          </div>
        </section>

        <section style={section} aria-labelledby="industrial-entry-title">
          <div style={container}>
            <div style={twoCol}>
              <div>
                <p style={eyebrow}>HIGH-VALUE INDUSTRIAL PROJECTS</p>
                <h2 id="industrial-entry-title" style={sectionTitle}>A different entry path from heavy-duty replacement filtration.</h2>
              </div>
              <div>
                <p style={lead}>
                  Industrial & Process projects are qualified by duty, operating envelope, contamination mechanism, process risk and system compatibility. This page is the commercial and technical front door for plants, OEMs, EPCs, integrators, operators and industrial distributors.
                </p>
                <p style={bodyCopy}>
                  Product selection is resolved through validated technology cores and application evidence. Supplier claims are not presented as ELIMFILTERS performance until approved.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section style={section} aria-labelledby="industrial-direct-answer-title">
          <div style={container}>
            <div style={twoCol}>
              <div>
                <p style={eyebrow}>DIRECT ANSWER</p>
                <h2 id="industrial-direct-answer-title" style={sectionTitle}>What is ELIMFILTERS Industrial &amp; Process?</h2>
              </div>
              <div>
                <p style={lead}>
                  ELIMFILTERS Industrial &amp; Process is the commercial engineering division for replacement filtration, separation and treatment media used in industrial air, dust and fume, gas, fluid-conditioning and water-treatment applications.
                </p>
                <h3 style={{ ...sectionTitle, fontSize: 'clamp(1.4rem,2.3vw,2.2rem)', marginTop: 28 }}>Does ELIMFILTERS sell complete process equipment?</h3>
                <p style={bodyCopy}>
                  No. The commercial scope is centered on validated replacement media and filtration, separation or treatment elements. Housings, vessels, collectors, skids, pumps, fans, ductwork and controls are application context unless a separate ELIMFILTERS system scope is explicitly approved.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section style={{ ...section, background: '#050505' }} aria-labelledby="scope-title">
          <div style={container}>
            <div style={twoCol}>
              <div>
                <p style={eyebrow}>GOVERNED TREATMENT ARCHITECTURE</p>
                <h2 id="scope-title" style={sectionTitle}>Select the mechanism first. Keep the element separate from the equipment.</h2>
              </div>
              <div>
                <p style={lead}>
                  Industrial &amp; Process selection starts with the carrier medium, contaminant phase, operating envelope and required downstream condition. Mixed contamination can require staged treatment rather than one universal filter family.
                </p>
                <p style={bodyCopy}>
                  ELIMFILTERS commercial scope is centered on validated filtration, separation and treatment media and replacement elements. Housings, pressure vessels, collectors, skids, pumps, fans, ductwork, controls and other process equipment are application context unless a separate ELIMFILTERS system scope is explicitly approved.
                </p>
                {rootCanonicalKnowledge ? (
                  <div style={{ marginTop: 20 }}>
                    <Link href="/knowledge-center/canonical/ip-industrial-process-architecture/" style={{ color: '#FFF12D', fontWeight: 700, textDecoration: 'none' }}>
                      OPEN INDUSTRIAL &amp; PROCESS ENGINEERING REFERENCE →
                    </Link>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <section id="platforms" style={{ ...section, background: '#050505' }} aria-labelledby="platform-title">
          <div style={container}>
            <p style={eyebrow}>FIVE COMMERCIAL TECHNOLOGY PLATFORMS</p>
            <h2 id="platform-title" style={sectionTitle}>Navigate by treatment function.</h2>
            <div style={platformGrid}>
              {INDUSTRIAL_PROCESS_PLATFORMS.map((platform, index) => (
                <article key={platform.slug} style={platformCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'baseline' }}>
                    <span style={numberStyle}>{String(index + 1).padStart(2, '0')}</span>
                    <span style={platformDescriptor}>{platform.descriptor}</span>
                  </div>
                  <Link href={industrialProcessPlatformUrl(platform.slug)} style={{ color: '#fff', textDecoration: 'none' }}>
                    <h3 style={platformMark}>{platform.name}</h3>
                  </Link>
                  <p style={bodyCopy}>{platform.summary}</p>
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 22, paddingTop: 16 }}>
                    {platform.technologies.map((technology) => (
                      <Link
                        key={technology.slug}
                        href={industrialProcessTechnologyUrl(platform.slug, technology.slug)}
                        style={{ ...familyRow, display: 'block', textDecoration: 'none' }}
                      >
                        {technology.name === technology.title ? technology.name : `${technology.name} — ${technology.title}`}
                      </Link>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section style={{ ...section, background: '#050505' }} aria-labelledby="standards-title">
          <div style={container}>
            <p style={eyebrow}>STANDARDS & TEST GOVERNANCE</p>
            <h2 id="standards-title" style={sectionTitle}>Industrial elements are specified against the applicable test method.</h2>
            <p style={{ ...lead, maxWidth: 980 }}>
              ELIMFILTERS Industrial &amp; Process links each platform and treatment family to the governed ISO, ASTM and other test methods that actually apply to that mechanism. Standards are engineering references, not blanket certification claims.
            </p>
            <div style={platformGrid}>
              {platformStandards.map(({ platform, standards }) => (
                <article key={platform.slug} style={platformCard}>
                  <Link href={industrialProcessPlatformUrl(platform.slug)} style={{ color: '#fff', textDecoration: 'none' }}>
                    <h3 style={{ ...platformMark, marginTop: 0 }}>{platform.name}</h3>
                  </Link>
                  <p style={bodyCopy}>{platform.descriptor}</p>
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 18, paddingTop: 12 }}>
                    {standards.map((standard) => (
                      <div key={standard} style={specRow}><span>—</span><span>{standard}</span></div>
                    ))}
                  </div>
                  {platform.knowledgeCenterSlug ? (
                    <div style={{ marginTop: 18 }}>
                      <Link href={`/knowledge-center/canonical/${platform.knowledgeCenterSlug}/`} style={{ color: '#FFF12D', fontWeight: 700, textDecoration: 'none' }}>
                        OPEN GOVERNED ENGINEERING REFERENCE →
                      </Link>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section style={section} aria-labelledby="qualification-title">
          <div style={container}>
            <div style={twoCol}>
              <div>
                <p style={eyebrow}>ENGINEERING QUALIFICATION</p>
                <h2 id="qualification-title" style={sectionTitle}>What we need to evaluate an industrial project.</h2>
              </div>
              <div style={{ display: 'grid', gap: 0 }}>
                {projectInputs.map((item, index) => (
                  <div key={item} style={requirementRow}>
                    <span style={numberStyle}>{String(index + 1).padStart(2, '0')}</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section style={{ ...section, borderTop: '1px solid rgba(255,241,45,0.22)' }}>
          <div style={{ ...container, textAlign: 'center' }}>
            <p style={{ ...eyebrow, textAlign: 'center' }}>INDUSTRIAL PROJECT INTAKE</p>
            <h2 style={{ ...sectionTitle, maxWidth: 900, margin: '0 auto 20px' }}>Bring us the operating conditions. We resolve the filtration architecture.</h2>
            <p style={{ ...lead, maxWidth: 820, margin: '0 auto 28px', textAlign: 'center' }}>
              For new installations, difficult contamination problems, retrofit programs, OEM requirements and recurring industrial supply opportunities.
            </p>
            <a href={inquiryHref} data-conversion-action="industrial-engineering-review" style={primaryButton}>
              START INDUSTRIAL ENGINEERING REVIEW
            </a>
            <div style={{ marginTop: 18 }}>
              <Link href="/contact/" style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14 }}>
                General contact
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

const container: React.CSSProperties = { maxWidth: 1400, margin: '0 auto' };
const section: React.CSSProperties = { padding: 'var(--section-py) var(--section-px)', borderBottom: '1px solid rgba(255,255,255,0.07)' };
const eyebrow: React.CSSProperties = { color: '#FFF12D', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.2em', fontSize: '0.73rem', textTransform: 'uppercase', margin: '0 0 14px' };
const heroTitle: React.CSSProperties = { maxWidth: 1120, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(3.2rem,8vw,7.8rem)', lineHeight: 0.88, letterSpacing: '-0.055em', textTransform: 'uppercase', margin: 0 };
const heroCopy: React.CSSProperties = { maxWidth: 850, color: 'rgba(255,255,255,0.72)', fontSize: 'clamp(1.05rem,2vw,1.35rem)', lineHeight: 1.65, marginTop: 28 };
const sectionTitle: React.CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(2rem,4vw,4rem)', lineHeight: 0.98, letterSpacing: '-0.04em', textTransform: 'uppercase', margin: '0 0 24px' };
const lead: React.CSSProperties = { color: 'rgba(255,255,255,0.82)', fontSize: 'clamp(1.05rem,1.7vw,1.24rem)', lineHeight: 1.7, fontWeight: 600, marginTop: 0 };
const bodyCopy: React.CSSProperties = { color: 'rgba(255,255,255,0.62)', lineHeight: 1.7 };
const twoCol: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'minmax(0,0.9fr) minmax(0,1.1fr)', gap: 'clamp(2.5rem,7vw,7rem)', alignItems: 'start' };
const threeCol: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 };
const platformGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 16, marginTop: 34 };
const platformCard: React.CSSProperties = { border: '1px solid rgba(255,255,255,0.1)', background: '#090909', padding: 'clamp(1.4rem,3vw,2rem)', minHeight: 360 };
const platformMark: React.CSSProperties = { fontFamily: 'var(--font-display)', color: '#fff', fontSize: 'clamp(2rem,4vw,3.4rem)', textTransform: 'uppercase', margin: '22px 0 12px' };
const platformDescriptor: React.CSSProperties = { color: 'rgba(255,255,255,0.48)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.11em', textAlign: 'right' };
const numberStyle: React.CSSProperties = { color: '#FFF12D', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.12em' };
const familyRow: React.CSSProperties = { padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.055)', color: 'rgba(255,255,255,0.78)', fontWeight: 600 };
const requirementRow: React.CSSProperties = { display: 'grid', gridTemplateColumns: '48px 1fr', gap: 16, padding: '15px 0', borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.78)' };
const specCard: React.CSSProperties = { border: '1px solid rgba(255,255,255,0.1)', background: '#090909', padding: 24 };
const cardLabel: React.CSSProperties = { color: '#FFF12D', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 16 };
const specRow: React.CSSProperties = { display: 'grid', gridTemplateColumns: '38px 1fr', gap: 10, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.68)', fontSize: '0.9rem' };
const primaryButton: React.CSSProperties = { display: 'inline-block', background: '#FFF12D', color: '#000', textDecoration: 'none', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.1em', padding: '0.9rem 1.4rem', textTransform: 'uppercase' };
const secondaryButton: React.CSSProperties = { display: 'inline-block', border: '1px solid rgba(255,255,255,0.18)', color: '#fff', textDecoration: 'none', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.1em', padding: '0.9rem 1.4rem', textTransform: 'uppercase' };
