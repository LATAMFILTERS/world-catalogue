import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ELIMFILTERS | Total Asset Protection',
  description:
    'Find your ELIMFILTERS part, become a distributor, or contact our team.',
};

const links = [
  {
    label: 'Find Your Part',
    description: 'Search by ELIMFILTERS, OEM, or competitor reference.',
    href: 'https://part-search.elimfilters.com',
    external: true,
    primary: true,
  },
  {
    label: 'Become a Distributor',
    description: 'Commercial opportunities for qualified industrial partners.',
    href: '/distributors',
    external: false,
    primary: false,
  },
  {
    label: 'Contact ELIMFILTERS',
    description: 'Send a commercial or technical inquiry.',
    href: '/contact',
    external: false,
    primary: false,
  },
  {
    label: 'Visit ELIMFILTERS.com',
    description: 'Explore systems, technologies, and industries.',
    href: '/',
    external: false,
    primary: false,
  },
];

export default function InstagramLandingPage() {
  return (
    <main
      style={{
        minHeight: '100svh',
        background: '#050505',
        color: '#fff',
        padding: '28px 18px 40px',
        fontFamily: 'Inter, Arial, sans-serif',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 520,
          margin: '0 auto',
        }}
      >
        <header style={{ textAlign: 'center', padding: '10px 8px 28px' }}>
          <div
            style={{
              width: 64,
              height: 64,
              margin: '0 auto 18px',
              borderRadius: '18px',
              background: '#111',
              border: '1px solid rgba(255,241,45,0.28)',
              display: 'grid',
              placeItems: 'center',
              color: '#FFF12D',
              fontFamily: 'Titillium Web, Arial, sans-serif',
              fontSize: 34,
              fontWeight: 800,
              letterSpacing: '-0.08em',
            }}
          >
            E
          </div>

          <p
            style={{
              margin: 0,
              color: '#FFF12D',
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            ELIMFILTERS®
          </p>

          <h1
            style={{
              margin: '12px 0 10px',
              fontFamily: 'Titillium Web, Arial, sans-serif',
              fontSize: 'clamp(2rem, 9vw, 3.1rem)',
              lineHeight: 1,
              fontWeight: 800,
              letterSpacing: '-0.04em',
            }}
          >
            Total Asset Protection
          </h1>

          <p
            style={{
              maxWidth: 420,
              margin: '0 auto',
              color: 'rgba(255,255,255,0.62)',
              fontSize: 15,
              lineHeight: 1.55,
            }}
          >
            Protecting engines, hydraulics, fuel, air, and cooling systems from contamination, failures, and downtime.
          </p>
        </header>

        <section
          aria-label="ELIMFILTERS links"
          style={{ display: 'grid', gap: 12 }}
        >
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noreferrer' : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                minHeight: 78,
                padding: '16px 18px',
                borderRadius: 14,
                border: link.primary
                  ? '1px solid #FFF12D'
                  : '1px solid rgba(255,255,255,0.12)',
                background: link.primary ? '#FFF12D' : '#111',
                color: link.primary ? '#000' : '#fff',
                textDecoration: 'none',
                boxShadow: link.primary
                  ? '0 10px 30px rgba(255,241,45,0.12)'
                  : 'none',
              }}
            >
              <span style={{ minWidth: 0 }}>
                <span
                  style={{
                    display: 'block',
                    fontFamily: 'Titillium Web, Arial, sans-serif',
                    fontSize: 18,
                    fontWeight: 800,
                    lineHeight: 1.1,
                  }}
                >
                  {link.label}
                </span>
                <span
                  style={{
                    display: 'block',
                    marginTop: 5,
                    color: link.primary
                      ? 'rgba(0,0,0,0.62)'
                      : 'rgba(255,255,255,0.5)',
                    fontSize: 12,
                    lineHeight: 1.4,
                  }}
                >
                  {link.description}
                </span>
              </span>

              <span
                aria-hidden="true"
                style={{
                  flex: '0 0 auto',
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  background: link.primary
                    ? 'rgba(0,0,0,0.1)'
                    : 'rgba(255,255,255,0.06)',
                  fontSize: 18,
                }}
              >
                →
              </span>
            </a>
          ))}
        </section>

        <footer
          style={{
            padding: '26px 12px 0',
            textAlign: 'center',
            color: 'rgba(255,255,255,0.34)',
            fontSize: 11,
            lineHeight: 1.5,
          }}
        >
          ELIMFILTERS® · Every Micron Matters.
        </footer>
      </div>
    </main>
  );
}
