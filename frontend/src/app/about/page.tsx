'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/PageHeader';
import '@/i18n';

const ENGINEERING_METHOD = [
  { step: '01', titleKey: 'about.engineeringMethod01Title', bodyKey: 'about.engineeringMethod01Body' },
  { step: '02', titleKey: 'about.engineeringMethod02Title', bodyKey: 'about.engineeringMethod02Body' },
  { step: '03', titleKey: 'about.engineeringMethod03Title', bodyKey: 'about.engineeringMethod03Body' },
  { step: '04', titleKey: 'about.engineeringMethod04Title', bodyKey: 'about.engineeringMethod04Body' },
];

const PRINCIPLES = [
  { titleKey: 'about.principle01Title', bodyKey: 'about.principle01Body' },
  { titleKey: 'about.principle02Title', bodyKey: 'about.principle02Body' },
  { titleKey: 'about.principle03Title', bodyKey: 'about.principle03Body' },
];

export default function AboutPage() {
  const { t } = useTranslation();
  const schemaOrganization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://elimfilters.com/#organization',
    name: 'ELIMFILTERS®',
    alternateName: 'ELIMFILTERS',
    legalName: 'Kleo Technology LLC',
    url: 'https://elimfilters.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://elimfilters.com/images/logo-sin-fondo.avif',
    },
    email: 'info@elimfilters.com',
    areaServed: 'Worldwide',
    slogan: 'Global Industrial Filtration Brand',
    description:
      'ELIMFILTERS® is Kleo Technology LLC\'s global industrial filtration brand. We develop advanced contamination-control technologies through mathematical engineering models, AI-assisted simulation, controlled testing, and field validation. Products are available exclusively through authorized distributors.',
    knowsAbout: [
      'Industrial asset protection',
      'Contamination control',
      'Filtration engineering',
      'AI-assisted engineering simulation',
      'Particle and fluid behavior',
      'Severe-duty equipment reliability',
      'Field validation of filtration systems',
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Frisco',
      addressRegion: 'TX',
      addressCountry: 'US',
      addressType: 'Legal Headquarters',
    },
  };

  const schemaAboutPage = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': 'https://elimfilters.com/about/#webpage',
    name: 'About ELIMFILTERS®',
    headline: 'Industrial asset protection engineered from contamination risk',
    description:
      'ELIMFILTERS® explains its purpose, engineering methodology, use of mathematical and AI-assisted simulation, and requirement for real-world field validation.',
    url: 'https://elimfilters.com/about/',
    mainEntity: { '@id': 'https://elimfilters.com/#organization' },
    isPartOf: {
      '@type': 'WebSite',
      '@id': 'https://elimfilters.com/#website',
      name: 'ELIMFILTERS®',
      url: 'https://elimfilters.com',
    },
  };

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh', fontFamily: 'var(--font-body)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrganization) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaAboutPage) }} />

      <PageHeader currentPage="About" />

      <section style={heroSection}>
        <div aria-hidden="true" style={heroImage} />
        <div aria-hidden="true" style={heroOverlay} />

        <div style={{ maxWidth: '1180px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 2 }}>
          <h1 style={heroTitle}>
            {t('about.heroTitle')}
          </h1>
          <p style={heroLead}>
            {t('about.heroLead')}
          </p>
        </div>
      </section>

      <section style={sectionSpacing}>
        <div style={twoColumnGrid}>
          <div>
            <h2
              style={{
                ...sectionTitle,
                fontSize: 'clamp(2.6rem, 5.2vw, 4.8rem)',
                lineHeight: 0.94,
                maxWidth: '720px',
              }}
            >
              {t('about.section1Title')}
            </h2>
          </div>
          <div>
            <p style={leadText}>
              {t('about.section1Lead')}
            </p>
            <p style={bodyText}>
              {t('about.section1Body')}
            </p>
          </div>
        </div>
      </section>

      <section style={purposeSection}>
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <h2 style={{ ...sectionTitle, maxWidth: '960px' }}>{t('about.section2Title')}</h2>
          <p style={{ ...leadText, maxWidth: '850px', marginTop: '2rem' }}>
            {t('about.section2Lead')}
          </p>
        </div>
      </section>

      <section style={sectionSpacing}>
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <h2 style={{ ...sectionTitle, maxWidth: '980px' }}>{t('about.section3Title')}</h2>
          <p style={{ ...bodyText, maxWidth: '850px', marginTop: '1.8rem' }}>
            {t('about.section3Body')}
          </p>

          <div style={{ marginTop: '3rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            {ENGINEERING_METHOD.map((item) => (
              <div key={item.step} style={methodRow}>
                <div style={stepNumber}>{item.step}</div>
                <h3 style={methodTitle}>{t(item.titleKey)}</h3>
                <p style={{ ...bodyText, margin: 0 }}>{t(item.bodyKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={principlesSection}>
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <h2 style={sectionTitle}>{t('about.section4Title')}</h2>
          <div style={principlesGrid}>
            {PRINCIPLES.map((item, idx) => (
              <article key={idx} style={principleCard}>
                <h3 style={principleTitle}>{t(item.titleKey)}</h3>
                <p style={{ ...bodyText, margin: '1.1rem 0 0' }}>{t(item.bodyKey)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Kleo Technology & Distributors Section */}
      <section style={{ padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)', borderTop: '1px solid rgba(255,241,45,0.15)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'clamp(2rem, 4vw, 3.5rem)' }}>
          <div>
            <p style={{ ...sectionTitle, marginBottom: '1.5rem' }}>Corporate Structure</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <li style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', lineHeight: 1.6 }}>
                <strong style={{ color: '#FFF12D' }}>Brand Owner:</strong> Kleo Technology LLC
              </li>
              <li style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', lineHeight: 1.6 }}>
                <strong style={{ color: '#FFF12D' }}>Legal Headquarters:</strong> Frisco, Texas, USA
              </li>
              <li style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', lineHeight: 1.6 }}>
                <strong style={{ color: '#FFF12D' }}>Operating Model:</strong> 100% distributor-based (no direct sales)
              </li>
            </ul>
          </div>

          <div>
            <p style={{ ...sectionTitle, marginBottom: '1.5rem' }}>Distributor Network</p>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', lineHeight: 1.7, margin: '0 0 1rem 0' }}>
              ELIMFILTERS products are available exclusively through authorized distributors across the Americas and other regions.
            </p>
            <Link href="/distributors" style={{ display: 'inline-block', color: '#FFF12D', textDecoration: 'none', fontWeight: 600, transition: 'opacity 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              Find a Distributor →
            </Link>
          </div>

          <div>
            <p style={{ ...sectionTitle, marginBottom: '1.5rem' }}>Knowledge Resources</p>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', lineHeight: 1.7, margin: '0 0 1rem 0' }}>
              Comprehensive technical documentation on filtration standards, contamination control, and industrial applications.
            </p>
            <Link href="/knowledge-system" style={{ display: 'inline-block', color: '#FFF12D', textDecoration: 'none', fontWeight: 600, transition: 'opacity 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              Access Knowledge Center →
            </Link>
          </div>
        </div>
      </section>

      <section style={closingSection}>
        <div style={{ maxWidth: '980px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ ...sectionTitle, textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
            {t('about.closingTitle')}
          </h2>
          <p style={{ ...bodyText, maxWidth: '760px', margin: '1.8rem auto 0' }}>
            {t('about.closingDesc')}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.9rem', marginTop: '2rem' }}>
            <Link href="/contact" style={yellowButton}>{t('about.contactButton')}</Link>
            <Link href="/knowledge-system" style={darkButton}>{t('about.knowledgeButton')}</Link>
          </div>
        </div>
      </section>
    </main>
  );
}


const heroSection: React.CSSProperties = {
  minHeight: '92vh',
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  padding: 'clamp(6rem, 10vw, 9rem) clamp(1.25rem, 6vw, 6rem)',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
};

const heroImage: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  backgroundImage: 'url(/images/grupo-filters.avif)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  opacity: 0.48,
};

const heroOverlay: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  background:
    'linear-gradient(90deg, rgba(0,0,0,0.44) 0%, rgba(0,0,0,0.32) 48%, rgba(0,0,0,0.12) 100%), radial-gradient(circle at top right, rgba(255,241,45,0.26), transparent 38%)',
};

const heroTitle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontWeight: 700,
  letterSpacing: '-0.055em',
  lineHeight: 0.9,
  fontSize: 'clamp(3rem, 7vw, 6.8rem)',
  maxWidth: '1050px',
  margin: 0,
  textTransform: 'uppercase',
};

const heroLead: React.CSSProperties = {
  marginTop: '2rem',
  maxWidth: '790px',
  color: 'rgba(255,255,255,0.8)',
  fontSize: 'clamp(1rem, 1.6vw, 1.26rem)',
  lineHeight: 1.72,
  fontWeight: 600,
};

const sectionSpacing: React.CSSProperties = {
  padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)',
};

const purposeSection: React.CSSProperties = {
  padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)',
  borderTop: '1px solid rgba(255,241,45,0.26)',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  background: 'linear-gradient(180deg, rgba(255,241,45,0.05), rgba(255,241,45,0.012))',
};

const principlesSection: React.CSSProperties = {
  padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)',
  borderTop: '1px solid rgba(255,255,255,0.08)',
  background: '#050505',
};

const closingSection: React.CSSProperties = {
  padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)',
  borderTop: '1px solid rgba(255,241,45,0.2)',
  background: 'radial-gradient(circle at 50% 0%, rgba(255,241,45,0.26), transparent 34%)',
};

const twoColumnGrid: React.CSSProperties = {
  maxWidth: '1180px',
  margin: '0 auto',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: 'clamp(2rem, 6vw, 5rem)',
};

const methodRow: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '70px minmax(220px, 0.72fr) minmax(0, 1fr)',
  gap: '1.5rem',
  padding: '1.8rem 0',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  alignItems: 'start',
};

const stepNumber: React.CSSProperties = {
  color: '#FFF12D',
  fontFamily: 'var(--font-display)',
  fontWeight: 700,
  letterSpacing: '0.16em',
};

const methodTitle: React.CSSProperties = {
  margin: 0,
  fontFamily: 'var(--font-display)',
  fontSize: 'clamp(1.1rem, 2vw, 1.55rem)',
  lineHeight: 1.1,
  textTransform: 'uppercase',
};

const principlesGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: '1rem',
  marginTop: '2.5rem',
};

const principleCard: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(0,0,0,0.44)',
  padding: '1.6rem',
  minHeight: '230px',
};

const principleTitle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  margin: 0,
  fontSize: '1.3rem',
  lineHeight: 1.12,
  textTransform: 'uppercase',
};

const sectionTitle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 'clamp(2rem, 4vw, 3.6rem)',
  lineHeight: 0.98,
  letterSpacing: '-0.02em',
  margin: 0,
  textTransform: 'uppercase',
};

const leadText: React.CSSProperties = {
  color: 'rgba(255,255,255,0.82)',
  fontSize: 'clamp(1.08rem, 1.7vw, 1.35rem)',
  lineHeight: 1.72,
  fontWeight: 600,
  margin: 0,
};

const bodyText: React.CSSProperties = {
  color: 'rgba(255,255,255,0.6)',
  fontSize: '1rem',
  lineHeight: 1.78,
};

const yellowButton: React.CSSProperties = {
  display: 'inline-block',
  background: '#FFF12D',
  color: '#000',
  textDecoration: 'none',
  fontFamily: 'var(--font-display)',
  fontWeight: 700,
  letterSpacing: '0.12em',
  fontSize: '0.82rem',
  padding: '1rem 1.25rem',
};

const darkButton: React.CSSProperties = {
  display: 'inline-block',
  background: 'rgba(0,0,0,0.5)',
  color: '#FFF12D',
  textDecoration: 'none',
  fontFamily: 'var(--font-display)',
  fontWeight: 700,
  letterSpacing: '0.12em',
  fontSize: '0.82rem',
  padding: '1rem 1.25rem',
  border: '1px solid rgba(255,241,45,0.4)',
};
