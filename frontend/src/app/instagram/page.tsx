import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ELIMFILTERS | Total Asset Protection',
  description:
    'Find your ELIMFILTERS part, become a distributor, or contact our team.',
};

const links = [
  {
    index: '01',
    label: 'FIND YOUR PART',
    description: 'Search by ELIMFILTERS, OEM, or competitor reference.',
    href: 'https://part-search.elimfilters.com',
    external: true,
  },
  {
    index: '02',
    label: 'BECOME A DISTRIBUTOR',
    description: 'Commercial opportunities for qualified industrial partners.',
    href: '/distributors',
    external: false,
  },
  {
    index: '03',
    label: 'VISIT ELIMFILTERS.COM',
    description: 'Explore systems, industries and technologies.',
    href: '/',
    external: false,
  },
  {
    index: '04',
    label: 'CONTACT ELIMFILTERS',
    description: 'Send a commercial or technical inquiry.',
    href: '/contact',
    external: false,
  },
];

const systems = ['AIR', 'FUEL', 'LUBE', 'HYDRAULIC', 'COOLING'];

export default function InstagramLandingPage() {
  return (
    <main
      style={{
        position: 'relative',
        minHeight: '100svh',
        overflow: 'hidden',
        background: '#000',
        color: '#fff',
        fontFamily: 'Inter, Arial, sans-serif',
        padding: '28px 18px 42px',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(rgba(255,255,255,0.026) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.026) 1px, transparent 1px), radial-gradient(circle at 82% 10%, rgba(255,241,45,0.11), transparent 24%)',
          backgroundSize: '38px 38px, 38px 38px, auto',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 640, margin: '0 auto' }}>
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 20,
            paddingBottom: 22,
            borderBottom: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ width: 34, height: 4, background: '#FFF12D', display: 'inline-block' }} />
              <span
                style={{
                  color: '#FFF12D',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.22em',
                }}
              >
                ELIMFILTERS®
              </span>
            </div>
            <p
              style={{
                margin: 0,
                color: 'rgba(255,255,255,0.48)',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 10,
                letterSpacing: '0.14em',
              }}
            >
              TOTAL ASSET PROTECTION SYSTEMS
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                color: '#FFF12D',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 10,
                letterSpacing: '0.18em',
              }}
            >
              SOCIAL ENTRY
            </div>
            <div style={{ marginTop: 5, color: 'rgba(255,255,255,0.35)', fontSize: 10 }}>ROUTE: /INSTAGRAM</div>
          </div>
        </header>

        <section style={{ padding: '38px 0 30px' }}>
          <p
            style={{
              margin: '0 0 12px',
              color: '#FFF12D',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 11,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
            }}
          >
            INDUSTRIAL PROTECTION NETWORK
          </p>

          <h1
            style={{
              margin: 0,
              maxWidth: 570,
              fontFamily: 'Titillium Web, Arial, sans-serif',
              fontSize: 'clamp(2.65rem, 11vw, 5.2rem)',
              fontWeight: 800,
              lineHeight: 0.9,
              letterSpacing: '-0.055em',
              textTransform: 'uppercase',
            }}
          >
            KEEP ASSETS
            <br />
            <span style={{ color: '#FFF12D' }}>WORKING.</span>
          </h1>

          <p
            style={{
              margin: '22px 0 0',
              maxWidth: 540,
              color: 'rgba(255,255,255,0.62)',
              fontSize: 15,
              lineHeight: 1.65,
            }}
          >
            Protection for engines, hydraulics, fuel, air and cooling systems against contamination, failures and downtime.
          </p>
        </section>

        <div
          aria-label="ELIMFILTERS protection systems"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
            gap: 1,
            marginBottom: 28,
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {systems.map((system) => (
            <div
              key={system}
              style={{
                background: '#050505',
                padding: '11px 4px',
                textAlign: 'center',
                color: 'rgba(255,255,255,0.55)',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 8,
                letterSpacing: '0.08em',
              }}
            >
              {system}
            </div>
          ))}
        </div>

        <section aria-label="ELIMFILTERS links" style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}>
          {links.map((link) => (
            <a
              key={link.index}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noreferrer' : undefined}
              style={{
                display: 'grid',
                gridTemplateColumns: '44px 1fr auto',
                gap: 14,
                alignItems: 'center',
                padding: '18px 0',
                borderBottom: '1px solid rgba(255,255,255,0.12)',
                color: '#fff',
                textDecoration: 'none',
              }}
            >
              <span
                style={{
                  color: '#FFF12D',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 11,
                  letterSpacing: '0.1em',
                }}
              >
                {link.index}
              </span>

              <span>
                <span
                  style={{
                    display: 'block',
                    fontFamily: 'Titillium Web, Arial, sans-serif',
                    fontSize: 16,
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                  }}
                >
                  {link.label}
                </span>
                <span
                  style={{
                    display: 'block',
                    marginTop: 4,
                    color: 'rgba(255,255,255,0.46)',
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
                  color: '#FFF12D',
                  fontSize: 21,
                  fontWeight: 300,
                }}
              >
                ↗
              </span>
            </a>
          ))}
        </section>

        <footer
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 16,
            marginTop: 26,
            color: 'rgba(255,255,255,0.34)',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 9,
            letterSpacing: '0.08em',
            lineHeight: 1.5,
          }}
        >
          <span>EVERY MICRON MATTERS.</span>
          <span style={{ textAlign: 'right' }}>ELIMFILTERS.COM</span>
        </footer>
      </div>
    </main>
  );
}
