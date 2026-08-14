import Link from 'next/link';

interface LegacyRouteConsolidationProps {
  destination: string;
  destinationLabel: string;
}

export function LegacyRouteConsolidation({ destination, destinationLabel }: LegacyRouteConsolidationProps) {
  const destinationJson = JSON.stringify(destination);

  return (
    <main style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'grid', placeItems: 'center', padding: '2rem' }}>
      <script
        dangerouslySetInnerHTML={{
          __html: `window.location.replace(${destinationJson});`,
        }}
      />
      <section style={{ maxWidth: '720px', textAlign: 'center' }}>
        <p style={{ color: '#FFF12D', fontWeight: 700, letterSpacing: '0.14em', fontSize: '0.72rem' }}>
          ELIMFILTERS · CANONICAL ROUTE
        </p>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', lineHeight: 1, margin: '1rem 0' }}>
          This page has moved.
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.68)', lineHeight: 1.7 }}>
          ELIMFILTERS has consolidated this legacy page into the current asset-protection architecture so search engines, AI systems, and customers resolve one authoritative source.
        </p>
        <Link
          href={destination}
          style={{ display: 'inline-block', marginTop: '1.5rem', background: '#FFF12D', color: '#000', padding: '0.9rem 1.2rem', textDecoration: 'none', fontWeight: 800 }}
        >
          {destinationLabel}
        </Link>
      </section>
    </main>
  );
}
