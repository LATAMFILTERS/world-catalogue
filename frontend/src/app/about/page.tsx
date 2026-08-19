import Link from 'next/link';

const FAILURE_CHAIN = [
  {
    step: '01',
    title: 'Contamination Enters The System',
    body: 'Particles, water, heat, and degraded fluids enter critical systems through ingestion, wear generation, service events, and operating environment exposure.',
  },
  {
    step: '02',
    title: 'Wear Accelerates',
    body: 'Contamination attacks bearings, injectors, pumps, valves, seals, turbochargers, and fluid passages where clearances are measured in microns.',
  },
  {
    step: '03',
    title: 'Damage Becomes Operational',
    body: 'Once wear exceeds tolerance, performance drops, pressure stability changes, efficiency declines, and maintenance moves from planned service to emergency repair.',
  },
  {
    step: '04',
    title: 'Downtime Destroys Value',
    body: 'The true cost is not the filter. The true cost is stopped equipment, lost production, urgent labor, failed components, and asset life reduction.',
  },
];

const PLATFORM = [
  {
    label: 'Asset Protection Strategy',
    body: 'We define filtration around the asset, the operating environment, the contamination risk, and the system failure mode.',
  },
  {
    label: 'Technology Architecture',
    body: 'Each ELIMFILTERS technology is mapped to a protection role: air intake, fuel cleanliness, lubrication, hydraulic control, coolant stability, cabin safety, and compressed air.',
  },
  {
    label: 'Industrial Application Logic',
    body: 'Mining, agriculture, construction, marine, oil and gas, power generation, railway, trucking, and manufacturing do not fail under the same contamination profile.',
  },
  {
    label: 'Knowledge-Driven Support',
    body: 'The platform connects products, systems, cross references, standards, contamination modes, and technical decision logic into one industrial support experience.',
  },
];

const TECHNOLOGIES = [
  { name: 'MACROCORE', domain: 'Air Intake Protection', href: '/technologies/macrocore' },
  { name: 'SYNTEPORE', domain: 'Fuel Cleanliness Protection', href: '/technologies/syntepore' },
  { name: 'HYDROCORE', domain: 'Fuel / Water Separation', href: '/technologies/hydrocore' },
  { name: 'SYNTRAX', domain: 'Lubrication Protection', href: '/technologies/syntrax' },
  { name: 'NANOFORCE', domain: 'Hydraulic Protection', href: '/technologies/nanoforce' },
  { name: 'THERMACORE', domain: 'Cooling System Protection', href: '/technologies/thermacore' },
  { name: 'MICROKAPPA', domain: 'Cabin Air Protection', href: '/technologies/microkappa' },
  { name: 'DRYCORE', domain: 'Compressed Air Protection', href: '/technologies/drycore' },
  { name: 'INTEKCORE', domain: 'Housing Architecture', href: '/technologies/intekcore' },
  { name: 'TURBOCORE', domain: 'Bulk Fuel Protection', href: '/technologies/turbocore-series' },
];

const MARKETS = [
  'Mining',
  'Agriculture',
  'Construction',
  'Marine',
  'Oil & Gas',
  'Power Generation',
  'Truck Fleets',
  'Manufacturing',
  'Railway',
  'Waste Municipal',
  'Bus & Coach',
  'Automotive',
];

export const metadata = {
  title: 'About ELIMFILTERS | Industrial Asset Protection Company',
  description:
    'ELIMFILTERS is an industrial asset protection platform focused on contamination control, severe-duty filtration technologies, and equipment reliability across global industrial markets.',
};

export default function AboutPage() {
  const schemaOrganization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ELIMFILTERS',
    legalName: 'Kleo Technologies LLC',
    url: 'https://elimfilters.com',
    logo: 'https://elimfilters.com/assets/logo-elimfilters.png',
    email: 'info@elimfilters.com',
    areaServed: 'Worldwide',
    description:
      'ELIMFILTERS is an industrial asset protection company focused on contamination control, severe-duty filtration technologies, and system-level reliability support across global industrial markets.',
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
    name: 'About ELIMFILTERS',
    description:
      'ELIMFILTERS protects industrial assets through contamination control, filtration technology, and system-level reliability architecture.',
    url: 'https://elimfilters.com/about',
    author: { '@type': 'Organization', name: 'ELIMFILTERS' },
  };

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh', fontFamily: 'var(--font-body)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrganization) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaAboutPage) }} />

      <Link
        href="/"
        style={{
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
        }}
      >
        HOME
      </Link>

      <section
        style={{
          minHeight: '92vh',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          padding: 'clamp(6rem, 10vw, 9rem) clamp(1.25rem, 6vw, 6rem)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url(/images/grupo-filters.avif)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.34,
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(90deg, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.76) 46%, rgba(0,0,0,0.34) 100%), radial-gradient(circle at top right, rgba(255,241,45,0.24), transparent 36%)',
          }}
        />

        <div style={{ maxWidth: '1180px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 2 }}>
          <p
            style={{
              color: '#FFF12D',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              letterSpacing: '0.46em',
              fontSize: 'clamp(0.72rem, 1vw, 0.86rem)',
              marginBottom: '1.6rem',
            }}
          >
            ABOUT ELIMFILTERS
          </p>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              letterSpacing: '-0.055em',
              lineHeight: 0.88,
              fontSize: 'clamp(3.1rem, 7.5vw, 7.2rem)',
              maxWidth: '980px',
              margin: 0,
              textTransform: 'uppercase',
            }}
          >
            We Protect
            <br />
            Industrial Assets
          </h1>

          <p
            style={{
              marginTop: '2rem',
              maxWidth: '760px',
              color: 'rgba(255,255,255,0.78)',
              fontSize: 'clamp(1rem, 1.6vw, 1.28rem)',
              lineHeight: 1.75,
              fontWeight: 600,
            }}
          >
            ELIMFILTERS was built around one operating truth: equipment does not fail because a filter exists.
            Equipment fails when contamination is not controlled before it becomes wear, damage, downtime, and asset loss.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', marginTop: '2.2rem' }}>
            {['CONTAMINATION CONTROL', 'SEVERE-DUTY SYSTEMS', 'GLOBAL INDUSTRIAL MARKETS'].map((item) => (
              <span
                key={item}
                style={{
                  border: '1px solid rgba(255,255,255,0.18)',
                  padding: '0.82rem 1rem',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.74rem',
                  letterSpacing: '0.16em',
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.88)',
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1.1fr)', gap: 'clamp(2rem, 6vw, 5rem)' }}>
          <div>
            <p style={eyebrow}>THE BELIEF</p>
            <h2 style={sectionTitle}>The problem is contamination. Not filters.</h2>
          </div>

          <div>
            <p style={leadText}>
              Traditional filtration starts with a product. ELIMFILTERS starts with the failure mechanism. That changes the entire conversation: from replacement parts to asset protection, from filter sales to operational reliability, from matching a number to protecting a machine.
            </p>
            <p style={bodyText}>
              Our platform connects severe-duty filtration technologies, industrial application knowledge, cross-reference intelligence, and contamination control logic into a system built to support distributors, fleets, maintenance teams, and industrial operators.
            </p>
          </div>
        </div>
      </section>

      <section style={{ padding: '0 clamp(1.25rem, 6vw, 6rem) clamp(4rem, 8vw, 7rem)' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          {FAILURE_CHAIN.map((item) => (
            <div
              key={item.step}
              style={{
                display: 'grid',
                gridTemplateColumns: '90px minmax(220px, 0.7fr) minmax(0, 1fr)',
                gap: '1.5rem',
                padding: '1.65rem 0',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                alignItems: 'start',
              }}
            >
              <div style={{ color: '#FFF12D', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.16em' }}>{item.step}</div>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 'clamp(1.1rem, 2vw, 1.6rem)', lineHeight: 1.1 }}>{item.title}</h3>
              <p style={{ ...bodyText, margin: 0 }}>{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: 'linear-gradient(180deg, rgba(255,241,45,0.04), rgba(255,241,45,0.01))', borderTop: '1px solid rgba(255,241,45,0.16)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <p style={eyebrow}>THE PLATFORM</p>
          <h2 style={sectionTitle}>Asset protection is a system.</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(245px, 1fr))', gap: '1rem', marginTop: '2.4rem' }}>
            {PLATFORM.map((item) => (
              <div
                key={item.label}
                style={{
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(0,0,0,0.44)',
                  padding: '1.5rem',
                  minHeight: '230px',
                }}
              >
                <h3 style={{ fontFamily: 'var(--font-display)', margin: 0, fontSize: '1.3rem', lineHeight: 1.1 }}>{item.label}</h3>
                <p style={{ ...bodyText, marginTop: '1.2rem' }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 0.85fr) minmax(0, 1.15fr)', gap: 'clamp(2rem, 6vw, 5rem)' }}>
          <div>
            <p style={eyebrow}>TECHNOLOGY PORTFOLIO</p>
            <h2 style={sectionTitle}>Built around protection domains.</h2>
            <p style={bodyText}>
              Each technology name represents a protection architecture, not a decorative product label.
            </p>
            <Link href="/technologies" style={yellowButton}>EXPLORE TECHNOLOGIES</Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '0.75rem' }}>
            {TECHNOLOGIES.map((technology) => (
              <Link
                key={technology.name}
                href={technology.href}
                style={{
                  textDecoration: 'none',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '1rem',
                  background: 'rgba(255,255,255,0.025)',
                }}
              >
                <strong style={{ display: 'block', fontFamily: 'var(--font-display)', color: '#FFF12D', letterSpacing: '0.08em', fontSize: '0.9rem' }}>{technology.name}™</strong>
                <span style={{ display: 'block', color: 'rgba(255,255,255,0.54)', fontSize: '0.88rem', marginTop: '0.4rem' }}>{technology.domain}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '0 clamp(1.25rem, 6vw, 6rem) clamp(4rem, 8vw, 7rem)' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <p style={eyebrow}>INDUSTRIAL COVERAGE</p>
          <h2 style={sectionTitle}>Engineered for severe-duty markets.</h2>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.7rem', marginTop: '2rem' }}>
            {MARKETS.map((market) => (
              <Link
                key={market}
                href="/industries"
                style={{
                  color: 'rgba(255,255,255,0.86)',
                  textDecoration: 'none',
                  border: '1px solid rgba(255,255,255,0.12)',
                  padding: '0.85rem 1rem',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  fontSize: '0.82rem',
                  background: 'rgba(255,255,255,0.025)',
                }}
              >
                {market}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)', borderTop: '1px solid rgba(255,241,45,0.2)', background: 'radial-gradient(circle at 50% 0%, rgba(255,241,45,0.16), transparent 34%)' }}>
        <div style={{ maxWidth: '980px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ ...eyebrow, textAlign: 'center' }}>TOTAL ASSET PROTECTION</p>
          <h2 style={{ ...sectionTitle, textAlign: 'center', maxWidth: '900px', marginLeft: 'auto', marginRight: 'auto' }}>
            We are not building another filter catalog. We are building the industrial protection platform behind the catalog.
          </h2>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.9rem', marginTop: '2rem' }}>
            <Link href="/contact" style={yellowButton}>CONTACT ELIMFILTERS</Link>
            <Link href="/distributor-application" style={darkButton}>DISTRIBUTOR REVIEW</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

const eyebrow: React.CSSProperties = {
  color: '#FFF12D',
  fontFamily: 'var(--font-display)',
  fontSize: '0.78rem',
  fontWeight: 700,
  letterSpacing: '0.28em',
  margin: '0 0 1rem',
};

const sectionTitle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 'clamp(2rem, 4vw, 3.6rem)',
  lineHeight: 0.95,
  letterSpacing: '-0.02em',
  margin: 0,
  textTransform: 'uppercase',
};

const leadText: React.CSSProperties = {
  color: 'rgba(255,255,255,0.8)',
  fontSize: 'clamp(1.08rem, 1.7vw, 1.35rem)',
  lineHeight: 1.72,
  fontWeight: 600,
  margin: 0,
};

const bodyText: React.CSSProperties = {
  color: 'rgba(255,255,255,0.58)',
  fontSize: '1rem',
  lineHeight: 1.78,
};

const yellowButton: React.CSSProperties = {
  display: 'inline-block',
  marginTop: '1.8rem',
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
