import Link from 'next/link';
import type { CSSProperties } from 'react';
import type { ApplicationCard } from '@/lib/macrocore-applications';

const wrapper: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  width: '100%',
};

const row: CSSProperties = {
  display: 'grid',
  gap: '1rem',
  width: '100%',
};

const topRow: CSSProperties = {
  ...row,
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
};

const bottomRow: CSSProperties = {
  ...row,
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  width: '75%',
  margin: '0 auto',
};

const fallbackGrid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: '1rem',
};

const card: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: '220px',
  padding: '1.6rem',
  background: 'linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.012))',
  border: '1px solid rgba(255,255,255,0.11)',
  textDecoration: 'none',
  color: '#fff',
};

const cardLabel: CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontWeight: 700,
  fontSize: 'clamp(0.95rem, 1.2vw, 1.15rem)',
  textTransform: 'uppercase',
  letterSpacing: '0.005em',
  margin: 0,
};

const cardDesc: CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '0.9rem',
  lineHeight: 1.62,
  color: 'rgba(255,255,255,0.62)',
  margin: '0.75rem 0 0',
};

const cardCta: CSSProperties = {
  display: 'block',
  color: '#FFF12D',
  fontFamily: 'var(--font-mono)',
  fontWeight: 700,
  letterSpacing: '0.1em',
  fontSize: '0.66rem',
  marginTop: 'auto',
  paddingTop: '1.35rem',
  textTransform: 'uppercase',
};

function renderCard(app: ApplicationCard) {
  if (app.route) {
    return (
      <Link key={app.id} href={app.route} style={card}>
        <h3 style={cardLabel}>{app.label}</h3>
        {app.description && <p style={cardDesc}>{app.description}</p>}
        <span style={cardCta}>VIEW INDUSTRY →</span>
      </Link>
    );
  }

  return (
    <div key={app.id} style={{ ...card, opacity: 0.6 }}>
      <h3 style={cardLabel}>{app.label}</h3>
      {app.description && <p style={cardDesc}>{app.description}</p>}
    </div>
  );
}

export function ApplicationCards({ applications }: { applications: readonly ApplicationCard[] }) {
  const pyramid = applications.length === 7;

  return (
    <>
      {pyramid ? (
        <div style={wrapper} className="application-card-pyramid">
          <div style={topRow} className="application-card-top-row">
            {applications.slice(0, 4).map(renderCard)}
          </div>
          <div style={bottomRow} className="application-card-bottom-row">
            {applications.slice(4, 7).map(renderCard)}
          </div>
        </div>
      ) : (
        <div style={fallbackGrid}>{applications.map(renderCard)}</div>
      )}

      <style>{`
        @media (max-width: 1050px) {
          .application-card-top-row,
          .application-card-bottom-row {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            width: 100% !important;
          }
        }
        @media (max-width: 620px) {
          .application-card-top-row,
          .application-card-bottom-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
