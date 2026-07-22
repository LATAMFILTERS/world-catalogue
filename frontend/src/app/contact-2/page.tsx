const DESTINATION = '/contact/';

export const metadata = {
  title: 'Redirecting to ELIMFILTERS',
  alternates: {
    canonical: `https://elimfilters.com${DESTINATION}`,
  },
};

export default function LegacyRedirect() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh', display: 'grid', placeItems: 'center', fontFamily: 'Arial, sans-serif', padding: '2rem' }}>
      <script dangerouslySetInnerHTML={{ __html: `window.location.replace('${DESTINATION}');` }} />
      <meta httpEquiv="refresh" content={`0;url=${DESTINATION}`} />
      <section style={{ maxWidth: 720, textAlign: 'center' }}>
        <p style={{ color: '#FFF12D', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>ELIMFILTERS</p>
        <h1 style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', lineHeight: 1, margin: '1rem 0' }}>This page has moved.</h1>
        <p style={{ color: 'rgba(255,255,255,0.72)', lineHeight: 1.6 }}>This legacy page now points to its current location.</p>
        <a href={DESTINATION} style={{ color: '#FFF12D', fontWeight: 700 }}>Continue</a>
      </section>
    </main>
  );
}
