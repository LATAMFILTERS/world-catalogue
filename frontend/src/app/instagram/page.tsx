import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ELIMFILTERS | Total Asset Protection',
  description:
    'Find your ELIMFILTERS part, become a distributor, or contact our team.',
};

const links = [
  {
    label: 'FIND YOUR PART',
    description: 'Search by ELIMFILTERS, OEM, or competitor reference.',
    href: 'https://part-search.elimfilters.com',
    external: true,
  },
  {
    label: 'BECOME A DISTRIBUTOR',
    description: 'Commercial opportunities for qualified industrial partners.',
    href: '/distributors',
    external: false,
  },
  {
    label: 'VISIT ELIMFILTERS.COM',
    description: 'Explore our asset protection systems and industries.',
    href: '/',
    external: false,
  },
  {
    label: 'CONTACT ELIMFILTERS',
    description: 'Send a commercial or technical inquiry.',
    href: '/contact',
    external: false,
  },
];

export default function InstagramLandingPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#000',
        color: '#fff',
        fontFamily: 'Arial, Helvetica, sans-serif',
        padding: '32px 20px 48px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 620, margin: '0 auto' }}>
        <div
          aria-hidden="true"
          style={{
            width: 74,
            height: 5,
            background: '#FFF12D',
            marginBottom: 28,
          }}
        />

        <p
          style={{
            margin: 0,
            color: '#FFF12D',
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.26em',
          }}
        >
          ELIMFILTERS®
        </p>

        <h1
          style={{
            margin: '12px 0 14px',
            fontSize: 'clamp(2rem, 8vw, 4rem)',
            lineHeight: 0.98,
            letterSpacing: '-0.045em',
          }}
        >
          TOTAL ASSET
          <br />
          PROTECTION
        </h1>

        <p
          style={{
            margin: '0 0 34px',
            color: 'rgba(255,255,255,0.66)',
            fontSize: 16,
            lineHeight: 1.65,
          }}
        >
          Protecting engines, hydraulics, fuel, air and cooling systems from
          contamination, failures and downtime.
        </p>

        <section aria-label="ELIMFILTERS links" style={{ display: 'grid', gap: 14 }}>
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noreferrer' : undefined}
              style={{
                display: 'block',
                padding: '20px 20px 18px',
                border: '1px solid rgba(255,241,45,0.34)',
                background: 'linear-gradient(135deg, rgba(255,241,45,0.08), rgba(255,255,255,0.015))',
                color: '#fff',
                textDecoration: 'none',
              }}
            >
              <span
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 16,
                  color: '#FFF12D',
                  fontSize: 14,
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                }}
              >
                {link.label}
                <span aria-hidden="true">→</span>
              </span>
              <span
                style={{
                  display: 'block',
                  marginTop: 8,
                  color: 'rgba(255,255,255,0.58)',
                  fontSize: 14,
                  lineHeight: 1.45,
                }}
              >
                {link.description}
              </span>
            </a>
          ))}
        </section>

        <footer
          style={{
            marginTop: 38,
            paddingTop: 22,
            borderTop: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.42)',
            fontSize: 12,
            lineHeight: 1.6,
          }}
        >
          ELIMFILTERS® · Total Asset Protection Systems
        </footer>
      </div>
    </main>
  );
}
