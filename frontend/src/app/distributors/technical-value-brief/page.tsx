import { PageHeader } from '@/components/PageHeader';

const PDF_URL = '/commercial/distributor-acquisition/technical-value-brief/es/ELIMFILTERS_Technical_Value_Brief_ES_v1.pdf';

export default function TechnicalValueBriefPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: 'Barlow, Arial, sans-serif' }}>
      <PageHeader breadcrumbs={[{ label: 'Distributors', href: '/distributors/' }]} currentPage="Technical Value Brief" />

      <section
        style={{
          minHeight: 'calc(100vh - 80px)',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.05fr) minmax(320px, 0.95fr)',
          gap: 'clamp(2rem, 6vw, 6rem)',
          alignItems: 'center',
          padding: 'clamp(5rem, 9vw, 8rem) clamp(1.25rem, 6vw, 6rem)',
          background:
            'radial-gradient(circle at 78% 20%, rgba(255,212,0,0.16), transparent 28%), linear-gradient(135deg, #050505 0%, #000 68%)',
        }}
      >
        <div style={{ maxWidth: '760px' }}>
          <p
            style={{
              color: '#FFD400',
              fontFamily: 'Chakra Petch, Arial Narrow, monospace',
              fontWeight: 800,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              fontSize: '0.76rem',
              margin: 0,
            }}
          >
            // TECHNICAL VALUE BRIEF
          </p>
          <h1
            style={{
              margin: '1.2rem 0 0',
              fontFamily: 'Chakra Petch, Arial Narrow, monospace',
              fontSize: 'clamp(3rem, 7vw, 6.7rem)',
              lineHeight: 0.92,
              letterSpacing: '-0.05em',
              textTransform: 'uppercase',
            }}
          >
            No somos otra
            <span style={{ display: 'block', color: '#FFD400' }}>línea de filtros.</span>
          </h1>
          <p style={{ marginTop: '2rem', maxWidth: '690px', color: 'rgba(255,255,255,0.76)', fontSize: '1.18rem', lineHeight: 1.7, fontWeight: 600 }}>
            ELIMFILTERS combina producto, arquitectura técnica, conocimiento de aplicación y herramientas comerciales para convertir la filtración en una conversación de protección de activos.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '2rem' }}>
            {['5 sistemas de protección', '10 tecnologías', 'Product Intelligence', 'Knowledge Center'].map((item) => (
              <span
                key={item}
                style={{
                  border: '1px solid rgba(255,255,255,0.16)',
                  padding: '0.75rem 0.95rem',
                  fontFamily: 'Chakra Petch, Arial Narrow, monospace',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.09em',
                  textTransform: 'uppercase',
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <aside
          style={{
            position: 'relative',
            border: '1px solid rgba(255,212,0,0.32)',
            background: 'linear-gradient(145deg, rgba(255,212,0,0.07), rgba(255,255,255,0.025))',
            padding: 'clamp(1.5rem, 4vw, 2.6rem)',
            overflow: 'hidden',
          }}
        >
          <img
            src="/assets/elimfilters-e.png"
            alt=""
            aria-hidden="true"
            style={{ position: 'absolute', right: '-3rem', top: '-1rem', width: '16rem', opacity: 0.08, filter: 'brightness(0) invert(1)' }}
          />
          <img src="/assets/elimfilters-logo-white.png" alt="ELIMFILTERS" style={{ width: 'min(300px, 72%)', height: 'auto' }} />
          <div style={{ width: '3.2rem', height: '4px', background: '#FFD400', marginTop: '2.3rem' }} />
          <h2 style={{ fontFamily: 'Chakra Petch, Arial Narrow, monospace', fontSize: 'clamp(1.8rem, 4vw, 3rem)', lineHeight: 1, textTransform: 'uppercase', margin: '1rem 0 0' }}>
            Ingeniería de filtración para la protección de activos.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.64)', lineHeight: 1.65, marginTop: '1.25rem' }}>
            Lea el brief técnico comercial y conozca la lógica de plataforma detrás de ELIMFILTERS.
          </p>
          <a
            href={PDF_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-analytics-event="technical_value_brief_downloaded"
            data-analytics-label="Abrir Technical Value Brief"
            style={{
              display: 'inline-flex',
              marginTop: '1.5rem',
              padding: '1rem 1.25rem',
              background: '#FFD400',
              color: '#000',
              textDecoration: 'none',
              fontFamily: 'Chakra Petch, Arial Narrow, monospace',
              fontSize: '0.82rem',
              fontWeight: 900,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Abrir Technical Value Brief
          </a>
          <p style={{ marginTop: '1rem', color: 'rgba(255,255,255,0.42)', fontSize: '0.78rem', lineHeight: 1.5 }}>
            El contenido y el idioma de cada entrega comercial son resueltos por el flujo de adquisición antes de cualquier contacto autorizado.
          </p>
        </aside>
      </section>
    </main>
  );
}
