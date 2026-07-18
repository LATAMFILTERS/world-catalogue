import Link from 'next/link';

export const metadata = {
  title: 'About ELIMFILTERS® | Industrial Asset Protection Engineering',
  description:
    'Learn how ELIMFILTERS® develops industrial asset protection systems through contamination analysis, mathematical engineering models, AI-assisted simulation, and field validation for severe-duty equipment.',
  keywords: [
    'ELIMFILTERS',
    'industrial asset protection',
    'contamination control engineering',
    'AI-assisted filtration engineering',
    'field-validated filtration technology',
    'severe-duty equipment reliability',
  ],
  alternates: {
    canonical: 'https://elimfilters.com/about/',
  },
  openGraph: {
    title: 'About ELIMFILTERS® | Industrial Asset Protection Engineering',
    description:
      'ELIMFILTERS® combines mathematical engineering, AI-assisted simulation, contamination intelligence, and field validation to protect industrial assets.',
    url: 'https://elimfilters.com/about/',
    siteName: 'ELIMFILTERS®',
    type: 'website',
  },
};

const ENGINEERING_METHOD = [
  {
    step: '01',
    title: 'Understand the asset',
    body: 'We begin with the machine, its operating environment, duty cycle, fluid system, contamination exposure, component tolerances, and failure consequences.',
  },
  {
    step: '02',
    title: 'Model the contamination risk',
    body: 'Mathematical models and AI-assisted simulations are used to analyze particle behavior, flow conditions, pressure changes, thermal cycles, and expected contaminant loading.',
  },
  {
    step: '03',
    title: 'Engineer the protection architecture',
    body: 'Media, geometry, sealing, structural materials, pressure response, and service requirements are defined as one integrated protection system rather than isolated product features.',
  },
  {
    step: '04',
    title: 'Validate under real operating conditions',
    body: 'A technology is not considered complete at the simulation stage. Production designs must be confirmed through controlled testing and field validation before they become part of the ELIMFILTERS® platform.',
  },
];

const PRINCIPLES = [
  {
    title: 'Protect the asset, not the replacement part',
    body: 'The value of filtration is measured by the component damage, downtime, labor, production loss, and asset-life reduction it prevents.',
  },
  {
    title: 'Engineer from the failure mechanism',
    body: 'We study how contamination reaches critical clearances and how wear develops before deciding what protection architecture the system requires.',
  },
  {
    title: 'Connect engineering with operating reality',
    body: 'Laboratory data establishes control. Field validation establishes relevance. Both are required to support a severe-duty industrial application.',
  },
];

export default function AboutPage() {
  const schemaOrganization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://elimfilters.com/#organization',
    name: 'ELIMFILTERS®',
    alternateName: 'ELIMFILTERS',
    legalName: 'Kleo Technologies LLC',
    url: 'https://elimfilters.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://elimfilters.com/images/logo-sin-fondo.avif',
    },
    email: 'info@elimfilters.com',
    areaServed: 'Worldwide',
    slogan: 'Industrial Asset Protection Systems',
    description:
      'ELIMFILTERS® is an industrial asset protection company that develops contamination-control technologies through mathematical engineering models, AI-assisted simulation, controlled testing, and field validation.',
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

      <Link href="/" style={homeButton}>HOME</Link>

      <section style={heroSection}>
        <div aria-hidden="true" style={heroImage} />
        <div aria-hidden="true" style={heroOverlay} />

        <div style={{ maxWidth: '1180px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 2 }}>
          <h1 style={heroTitle}>
            Engineering protection
            <br />
            around the asset.
          </h1>
          <p style={heroLead}>
            ELIMFILTERS® is an industrial asset protection company. We develop filtration and contamination-control systems to reduce wear, prevent avoidable failure, extend equipment life, and protect the economic value of severe-duty machinery.
          </p>
        </div>
      </section>

      <section style={sectionSpacing}>
        <div style={twoColumnGrid}>
          <div>
            <h2 style={sectionTitle}>A protection company built around equipment reliability.</h2>
          </div>
          <div>
            <p style={leadText}>
              ELIMFILTERS® was created from direct experience with industrial filtration, equipment maintenance, distribution, and the operational consequences of contamination. That experience established a simple principle: the filter is not the final objective; the protected asset is.
            </p>
            <p style={bodyText}>
              Our role is to connect product engineering, contamination intelligence, technical standards, cross-reference data, application knowledge, and field evidence into a system that helps distributors, fleets, maintenance teams, and industrial operators make better protection decisions.
            </p>
          </div>
        </div>
      </section>

      <section style={purposeSection}>
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <h2 style={{ ...sectionTitle, maxWidth: '960px' }}>Reduce the distance between contamination and failure.</h2>
          <p style={{ ...leadText, maxWidth: '850px', marginTop: '2rem' }}>
            Contamination becomes expensive long before a machine stops. It changes clearances, damages surfaces, destabilizes pressure, degrades fluids, reduces efficiency, and shortens component life. Our objective is to identify that risk early and engineer protection before the damage becomes operational.
          </p>
        </div>
      </section>

      <section style={sectionSpacing}>
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <h2 style={{ ...sectionTitle, maxWidth: '980px' }}>Mathematical modeling. AI-assisted simulation. Field validation.</h2>
          <p style={{ ...bodyText, maxWidth: '850px', marginTop: '1.8rem' }}>
            ELIMFILTERS® technologies are not created as marketing labels. Each one represents an engineering architecture derived from the behavior of contamination inside a specific protection domain. Mathematical analysis and AI-assisted simulation help us evaluate variables that cannot be understood from a part number alone, while controlled testing and field validation confirm whether the design performs under real operating conditions.
          </p>

          <div style={{ marginTop: '3rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            {ENGINEERING_METHOD.map((item) => (
              <div key={item.step} style={methodRow}>
                <div style={stepNumber}>{item.step}</div>
                <h3 style={methodTitle}>{item.title}</h3>
                <p style={{ ...bodyText, margin: 0 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={principlesSection}>
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <h2 style={sectionTitle}>Engineering decisions must protect real operating value.</h2>
          <div style={principlesGrid}>
            {PRINCIPLES.map((item) => (
              <article key={item.title} style={principleCard}>
                <h3 style={principleTitle}>{item.title}</h3>
                <p style={{ ...bodyText, margin: '1.1rem 0 0' }}>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={closingSection}>
        <div style={{ maxWidth: '980px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ ...sectionTitle, textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
            We do not begin with a filter. We begin with the asset that cannot afford to fail.
          </h2>
          <p style={{ ...bodyText, maxWidth: '760px', margin: '1.8rem auto 0' }}>
            The result is a growing industrial protection platform designed to turn engineering knowledge, validated technology, and product intelligence into measurable reliability support.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.9rem', marginTop: '2rem' }}>
            <Link href="/contact" style={yellowButton}>CONTACT ELIMFILTERS</Link>
            <Link href="/knowledge-system" style={darkButton}>EXPLORE OUR KNOWLEDGE SYSTEM</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

const homeButton: React.CSSProperties = {
  position: 'fixed',
  top: '1.1rem',
  right: '1.35rem',
  zIndex: 50,
  background: 'rgba(0,0,0,0.78)',
  border: '1px solid rgba(255,241,45,0.45)',
  color: '#FFF12D',
  textDecoration: 'none',
  fontFamily: 'var(--font-display)',
  fontWeight: 700,
  letterSpacing: '0.16em',
  fontSize: '0.78rem',
  padding: '0.8rem 1.15rem',
  backdropFilter: 'blur(14px)',
};

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
  opacity: 0.32,
};

const heroOverlay: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  background:
    'linear-gradient(90deg, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.78) 48%, rgba(0,0,0,0.38) 100%), radial-gradient(circle at top right, rgba(255,241,45,0.22), transparent 38%)',
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
  borderTop: '1px solid rgba(255,241,45,0.16)',
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
  background: 'radial-gradient(circle at 50% 0%, rgba(255,241,45,0.16), transparent 34%)',
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
