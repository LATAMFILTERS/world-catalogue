import Link from 'next/link';
import type { CSSProperties } from 'react';
import type { ApplicationCard } from '@/lib/macrocore-applications';

const grid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '1rem',
};

const card: CSSProperties = {
  display: 'block',
  padding: '1.5rem',
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid rgba(255,255,255,0.1)',
  textDecoration: 'none',
  color: '#fff',
};

const cardLabel: CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontWeight: 700,
  fontSize: 'clamp(0.82rem, 1.1vw, 1.05rem)',
  textTransform: 'uppercase',
  letterSpacing: '0.005em',
  margin: 0,
  whiteSpace: 'nowrap',
  overflowWrap: 'normal',
  wordBreak: 'keep-all',
  hyphens: 'none',
};

const cardDesc: CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '0.85rem',
  lineHeight: 1.6,
  color: 'rgba(255,255,255,0.55)',
  margin: '0.6rem 0 0',
};

const cardCta: CSSProperties = {
  display: 'block',
  color: '#FFF12D',
  fontFamily: 'var(--font-mono)',
  fontWeight: 700,
  letterSpacing: '0.1em',
  fontSize: '0.66rem',
  marginTop: '1rem',
  textTransform: 'uppercase',
};

export function ApplicationCards({ applications }: { applications: readonly ApplicationCard[] }) {
  return (
    <div style={grid}>
      {applications.map((app) =>
        app.route ? (
          <Link key={app.id} href={app.route} style={card}>
            <h3 style={cardLabel}>{app.label}</h3>
            {app.description && <p style={cardDesc}>{app.description}</p>}
            <span style={cardCta}>VIEW INDUSTRY →</span>
          </Link>
        ) : (
          <div key={app.id} style={{ ...card, opacity: 0.6 }}>
            <h3 style={cardLabel}>{app.label}</h3>
            {app.description && <p style={cardDesc}>{app.description}</p>}
          </div>
        )
      )}
    </div>
  );
}
