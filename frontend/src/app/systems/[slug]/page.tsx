import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  PROTECTION_SYSTEM_LIST,
  getProtectionSystemBySlug,
} from '@/lib/protection-systems-data';
import { getFamiliesByProtectionSystem } from '@/lib/product-families-data';
import { CoreSystemProtectionNarrative } from './CoreSystemProtectionNarrative';
import { PageHeader } from '@/components/PageHeader';
import { Hero } from '@/components/Hero';

const BASE_URL = 'https://elimfilters.com';
const displayFont = 'Chakra Petch, Arial Narrow, monospace';

const SYSTEM_TAGS: Record<string, string> = {
  'air-intake': 'AIR INTAKE & AIRFLOW',
  'fuel-cleanliness': 'FUEL',
  lubrication: 'LUBRICATION',
  hydraulic: 'HYDRAULIC',
  'cooling-system': 'COOLING',
};
const bodyFont = 'Barlow, Arial, sans-serif';

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return PROTECTION_SYSTEM_LIST.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const sys = getProtectionSystemBySlug(params.slug);
  if (!sys) return { title: 'Not Found' };
  const url = `${BASE_URL}/systems/${sys.slug}/`;
  const title = sys.name;
  const socialTitle = `${sys.name} | ELIMFILTERS`;
  return {
    title,
    description: sys.tagline,
    alternates: { canonical: url },
    openGraph: {
      title: socialTitle,
      description: sys.tagline,
      url,
      type: 'website',
      siteName: 'ELIMFILTERS',
      images: [{ url: `${BASE_URL}${sys.heroImage}`, width: 1200, height: 630, alt: sys.name }],
    },
    twitter: { card: 'summary_large_image', title: socialTitle, description: sys.tagline },
  };
}

const main: CSSProperties = {
  background: '#000',
  color: '#fff',
  minHeight: '100vh',
  fontFamily: bodyFont,
};

const section: CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: 'clamp(2.8rem, 5vw, 4.4rem) clamp(1.5rem, 5vw, 4rem)',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
};

const h2Style: CSSProperties = {
  fontFamily: displayFont,
  fontWeight: 700,
  fontSize: 'clamp(1.8rem, 3.8vw, 3.1rem)',
  lineHeight: 0.95,
  letterSpacing: '-0.04em',
  textTransform: 'uppercase',
  marginBottom: '1.25rem',
};

const prose: CSSProperties = {
  fontFamily: bodyFont,
  fontSize: 'clamp(0.98rem, 1.5vw, 1.08rem)',
  color: 'rgba(255,255,255,0.68)',
  lineHeight: 1.75,
  fontWeight: 500,
  textAlign: 'left',
};

const labelStyle: CSSProperties = {
  fontFamily: displayFont,
  fontSize: '0.68rem',
  fontWeight: 700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
};

const cardTitle: CSSProperties = {
  fontFamily: displayFont,
  fontWeight: 700,
  fontSize: '1rem',
  color: '#fff',
  letterSpacing: '-0.02em',
  textTransform: 'uppercase',
};

const mutedLinkLabel: CSSProperties = {
  fontFamily: displayFont,
  fontSize: '0.66rem',
  fontWeight: 700,
  color: 'rgba(255,255,255,0.34)',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
};

export default function ProtectionSystemPage({ params }: Props) {
  const sys = getProtectionSystemBySlug(params.slug);
  if (!sys) notFound();

  const families = getFamiliesByProtectionSystem(sys.slug);
  const systemUrl = `${BASE_URL}/systems/${sys.slug}/`;

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Systems', item: `${BASE_URL}/systems/` },
      { '@type': 'ListItem', position: 3, name: sys.name, item: systemUrl },
    ],
  };

  const systemSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${systemUrl}#service`,
    name: sys.name,
    description: sys.overview,
    url: systemUrl,
    serviceType: 'Industrial Asset Protection',
    provider: {
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
      name: 'ELIMFILTERS',
    },
    areaServed: 'Worldwide',
    category: 'Industrial Filtration',
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(systemSchema) }} />

      <main style={main}>
        <PageHeader breadcrumbs={[{ label: 'Systems', href: '/systems/' }]} currentPage={sys.name} />

        <Hero
          title={sys.name.replace(/\s*Protection$/, '')}
          subtitle="Protection"
          tagline={sys.tagline}
          backgroundImage={sys.heroImage}
          backgroundPosition={sys.heroPosition}
          industryChrome
          tags={PROTECTION_SYSTEM_LIST.map((s) => ({
            label: SYSTEM_TAGS[s.slug] || s.name,
            href: `/systems/${s.slug}/`,
            active: s.slug === sys.slug,
          }))}
        />

        <section style={section}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
            <p style={prose}>{sys.overview}</p>
            <div>
              <p style={{ ...labelStyle, color: '#FFF12D', marginBottom: '0.75rem' }}>ENGINEERING PRINCIPLE</p>
              <p style={prose}>{sys.engineeringPrinciple}</p>
            </div>
          </div>
        </section>

        <CoreSystemProtectionNarrative slug={sys.slug} />

        <section style={section}>
          <h2 style={h2Style}>Primary Technologies</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.06)' }}>
            {sys.primaryTechnologies.map((slug) => (
              <Link key={slug} href={`/technologies/${slug}/`} style={{ textDecoration: 'none', background: '#000', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.55rem', transition: 'background 0.2s' }}>
                <p style={{ ...labelStyle, color: '#FFF12D' }}>Primary</p>
                <p style={cardTitle}>{slug.replace(/-/g, ' ')}</p>
                <p style={mutedLinkLabel}>View Technology →</p>
              </Link>
            ))}
            {sys.supportingTechnologies.map((slug) => (
              <Link key={slug} href={`/technologies/${slug}/`} style={{ textDecoration: 'none', background: '#000', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                <p style={{ ...labelStyle, color: 'rgba(255,255,255,0.44)' }}>Supporting</p>
                <p style={{ ...cardTitle, color: 'rgba(255,255,255,0.75)' }}>{slug.replace(/-/g, ' ')}</p>
                <p style={mutedLinkLabel}>View Technology →</p>
              </Link>
            ))}
          </div>
        </section>

        <section style={{ ...section, borderBottom: 'none' }}>
          <h2 style={h2Style}>Product Families</h2>
          {families.length === 0 ? (
            <p style={prose}>DOCUMENTATION PENDING</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.04)' }}>
              {families.map((fam) => (
                <Link key={fam.key} href={`/families/${fam.slug}/`} style={{ textDecoration: 'none', background: '#000', padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' as const }}>
                    {fam.hdPrefix && <span style={{ ...labelStyle, fontSize: '0.58rem', color: '#FFF12D', background: 'rgba(255,241,45,0.08)', padding: '0.2rem 0.5rem', borderRadius: '2px' }}>HD</span>}
                    {fam.ldPrefix && <span style={{ ...labelStyle, fontSize: '0.58rem', color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '2px' }}>LD</span>}
                  </div>
                  <p style={cardTitle}>{fam.name}</p>
                  <p style={{ fontFamily: bodyFont, fontSize: '0.86rem', color: 'rgba(255,255,255,0.48)', lineHeight: 1.55, textAlign: 'left' }}>
                    {fam.purpose.slice(0, 100)}…
                  </p>
                  <p style={mutedLinkLabel}>View Family →</p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
