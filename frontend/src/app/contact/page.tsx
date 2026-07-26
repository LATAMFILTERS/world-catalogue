import Link from 'next/link';
import ContactEmailActions from './ContactEmailActions';

const CONTACT_CHANNELS = [
  {
    label: 'Commercial Inquiries',
    title: 'Global Sales Contact',
    description:
      'For industrial buyers, fleets, importers and regional partners looking to evaluate ELIMFILTERS coverage, availability and commercial opportunities.',
    email: 'info@elimfilters.com',
    subject: 'Commercial Inquiry - ELIMFILTERS',
  },
  {
    label: 'Distributor Network',
    title: 'Authorized Partner Review',
    description:
      'For companies seeking distributor status, regional representation, territory development or severe-duty market coverage.',
    email: 'distribution_network@elimfilters.com',
    subject: 'Distributor Network Inquiry',
  },
  {
    label: 'Technical Support',
    title: 'Application And Cross Reference',
    description:
      'For OEM cross-reference validation, product application questions, technical specifications and industrial asset protection support.',
    email: 'support@elimfilters.com',
    subject: 'Technical Support Request',
  },
];

const CONTACT_PRIORITIES = [
  'OEM cross-reference validation',
  'Fleet and equipment coverage',
  'Distributor qualification',
  'Industrial sector alignment',
  'Contamination control support',
  'Regional availability planning',
];

const INDUSTRIAL_SECTORS = [
  'Mining',
  'Construction',
  'Agriculture',
  'Truck Fleets',
  'Marine',
  'Oil And Gas',
  'Power Generation',
  'Industrial Equipment',
];

const schemaContact = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contact ELIMFILTERS',
  url: 'https://elimfilters.com/contact/',
  description:
    'Contact ELIMFILTERS for industrial filtration, asset protection, distributor opportunities, OEM cross-reference support and technical inquiries.',
  mainEntity: {
    '@type': 'Organization',
    name: 'ELIMFILTERS',
    legalName: 'Kleo Technologies LLC',
    url: 'https://elimfilters.com',
    email: 'info@elimfilters.com',
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'Commercial inquiries',
        email: 'info@elimfilters.com',
        availableLanguage: ['English', 'Spanish'],
      },
      {
        '@type': 'ContactPoint',
        contactType: 'Technical support',
        email: 'support@elimfilters.com',
        availableLanguage: ['English', 'Spanish'],
      },
      {
        '@type': 'ContactPoint',
        contactType: 'Distributor network',
        email: 'distribution_network@elimfilters.com',
        availableLanguage: ['English', 'Spanish'],
      },
    ],
  },
};

const schemaBreadcrumb = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://elimfilters.com' },
    { '@type': 'ListItem', position: 2, name: 'Contact', item: 'https://elimfilters.com/contact/' },
  ],
};

export default function ContactPage() {
  return (
    <main
      style={{
        background: '#000',
        color: '#fff',
        minHeight: '100vh',
        fontFamily: 'Barlow, Arial, sans-serif',
        overflowX: 'hidden',
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800;900&family=Chakra+Petch:wght@500;600;700&display=swap');`}</style>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaContact) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaBreadcrumb) }}
      />

      <Link
        href="/"
        style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          zIndex: 9999,
          border: '1px solid rgba(255,241,45,0.45)',
          padding: '0.55rem 1rem',
          color: '#FFF12D',
          background: 'rgba(0,0,0,0.88)',
          textDecoration: 'none',
          fontFamily: 'Chakra Petch, Arial Narrow, monospace',
          fontWeight: 700,
          fontSize: '0.72rem',
          letterSpacing: '0.18em',
        }}
      >
        HOME
      </Link>

      <section
        style={{
          minHeight: '88vh',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          background:
            'radial-gradient(circle at top right, rgba(255,241,45,0.17), transparent 32%), linear-gradient(135deg, rgba(255,255,255,0.065) 0%, transparent 38%, rgba(255,241,45,0.075) 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '6rem clamp(1.25rem,5vw,2rem) 4rem',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url(/images/contacto-papa.avif)',
            backgroundSize: 'cover',
            backgroundPosition: 'center 50%',
            opacity: 0.38,
            zIndex: 0,
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(90deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.68) 46%, rgba(0,0,0,0.24) 100%), radial-gradient(circle at top right, rgba(255,241,45,0.26), transparent 36%)',
            zIndex: 1,
          }}
        />
        <div style={{ maxWidth: '1180px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 2 }}>
          <p
            style={{
              color: '#FFF12D',
              fontFamily: 'Chakra Petch, Arial Narrow, monospace',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.34em',
              textTransform: 'uppercase',
              marginBottom: '1.25rem',
            }}
          >
            Contact ELIMFILTERS
          </p>

          <h1
            style={{
              maxWidth: '980px',
              fontFamily: 'Chakra Petch, Arial Narrow, monospace',
              fontSize: 'clamp(3.1rem, 7.5vw, 7.2rem)',
              lineHeight: 0.88,
              letterSpacing: '-0.055em',
              textTransform: 'uppercase',
              marginBottom: '1.5rem',
            }}
          >
            Industrial Support
            <span style={{ display: 'block', color: '#FFF12D' }}>Starts Here</span>
          </h1>

          <p
            style={{
              maxWidth: '770px',
              color: 'rgba(255,255,255,0.76)',
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              lineHeight: 1.65,
              fontWeight: 600,
              marginBottom: '2rem',
            }}
          >
            Contact our team for commercial inquiries, distributor opportunities,
            OEM cross-reference validation and technical support across severe-duty
            industrial filtration applications.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
            {['Commercial', 'Distributor Network', 'Technical Support'].map((item) => (
              <span
                key={item}
                style={{
                  border: '1px solid rgba(255,255,255,0.14)',
                  background: 'rgba(255,255,255,0.04)',
                  padding: '0.75rem 1rem',
                  fontFamily: 'Chakra Petch, Arial Narrow, monospace',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.72)',
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '4rem clamp(1.25rem,5vw,2rem)', background: '#000' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1rem',
            }}
          >
            {CONTACT_CHANNELS.map((channel) => (
              <article
                key={channel.email}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background:
                    channel.label === 'Distributor Network'
                      ? 'rgba(255,241,45,0.045)'
                      : '#050505',
                  padding: '1.6rem',
                  minHeight: '300px',
                }}
              >
                <p
                  style={{
                    color: '#FFF12D',
                    fontFamily: 'Chakra Petch, Arial Narrow, monospace',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    marginBottom: '1rem',
                  }}
                >
                  {channel.label}
                </p>

                <h2
                  style={{
                    color: '#fff',
                    fontFamily: 'Chakra Petch, Arial Narrow, monospace',
                    fontSize: '1.65rem',
                    lineHeight: 1,
                    textTransform: 'uppercase',
                    marginBottom: '1rem',
                  }}
                >
                  {channel.title}
                </h2>

                <p
                  style={{
                    color: 'rgba(255,255,255,0.64)',
                    lineHeight: 1.65,
                    marginBottom: '1.5rem',
                  }}
                >
                  {channel.description}
                </p>

                <ContactEmailActions email={channel.email} subject={channel.subject} />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        style={{
          padding: '4rem clamp(1.25rem,5vw,2rem)',
          background: '#050505',
          borderTop: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div
          style={{
            maxWidth: '1180px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3rem',
            alignItems: 'start',
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: 'Chakra Petch, Arial Narrow, monospace',
                fontSize: 'clamp(2rem, 4vw, 3.6rem)',
                lineHeight: 0.95,
                textTransform: 'uppercase',
                marginBottom: '1.2rem',
              }}
            >
              What To Include
            </h2>

            <p
              style={{
                color: 'rgba(255,255,255,0.66)',
                lineHeight: 1.7,
                maxWidth: '560px',
              }}
            >
              The more technical context you provide, the faster our team can route
              your request to the right commercial or engineering contact.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '0.75rem',
            }}
          >
            {CONTACT_PRIORITIES.map((item) => (
              <div
                key={item}
                style={{
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.035)',
                  padding: '1rem',
                  color: 'rgba(255,255,255,0.72)',
                  lineHeight: 1.55,
                  fontWeight: 600,
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '4rem clamp(1.25rem,5vw,2rem)', background: '#000' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <h2
            style={{
              fontFamily: 'Chakra Petch, Arial Narrow, monospace',
              fontSize: 'clamp(2rem, 4vw, 3.6rem)',
              lineHeight: 0.95,
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}
          >
            Severe-Duty Markets
          </h2>

          <p
            style={{
              maxWidth: '720px',
              color: 'rgba(255,255,255,0.62)',
              lineHeight: 1.65,
              marginBottom: '2rem',
            }}
          >
            ELIMFILTERS supports industrial operators, fleets and distributors
            serving critical equipment markets where uptime and contamination control matter.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.75rem',
            }}
          >
            {INDUSTRIAL_SECTORS.map((sector) => (
              <div
                key={sector}
                style={{
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.035)',
                  padding: '1rem',
                  fontFamily: 'Chakra Petch, Arial Narrow, monospace',
                  color: 'rgba(255,255,255,0.78)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                {sector}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        style={{
          padding: '4rem clamp(1.25rem,5vw,2rem) 5rem',
          background: '#050505',
          borderTop: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div
          style={{
            maxWidth: '1180px',
            margin: '0 auto',
            border: '1px solid rgba(255,241,45,0.28)',
            background:
              'linear-gradient(135deg, rgba(255,241,45,0.07), rgba(255,255,255,0.025))',
            padding: 'clamp(1.5rem,4vw,2.5rem)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
            alignItems: 'center',
          }}
        >
          <div>
            <p
              style={{
                color: '#FFF12D',
                fontFamily: 'Chakra Petch, Arial Narrow, monospace',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                marginBottom: '0.8rem',
              }}
            >
              Authorized Partner Program
            </p>

            <h2
              style={{
                fontFamily: 'Chakra Petch, Arial Narrow, monospace',
                fontSize: 'clamp(1.9rem, 4vw, 3.2rem)',
                lineHeight: 0.95,
                textTransform: 'uppercase',
                marginBottom: '1rem',
              }}
            >
              Seeking Distributor Status?
            </h2>

            <p style={{ color: 'rgba(255,255,255,0.66)', lineHeight: 1.7, margin: 0 }}>
              Use the distributor application to submit territory, sector and company
              information for commercial review.
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <Link
              href="/distributor-application"
              style={{
                display: 'inline-block',
                background: '#FFF12D',
                color: '#000',
                padding: '1rem 1.25rem',
                textDecoration: 'none',
                fontFamily: 'Chakra Petch, Arial Narrow, monospace',
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
              }}
            >
              Apply For Review
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

