import type { CSSProperties } from 'react';

interface ProcessStep {
  step: string;
  title: string;
  body: string;
}

interface AboutEngineeringProcessProps {
  title: string;
  description: string;
  steps: ProcessStep[];
}

export function AboutEngineeringProcess({ title, description, steps }: AboutEngineeringProcessProps) {
  return (
    <div style={wrapStyle}>
      <style>{`
        .aep-list {
          display: flex;
          flex-direction: column;
          gap: 2.25rem;
          list-style: none;
          margin: 2.75rem 0 0;
          padding: 0;
          width: 100%;
        }
        .aep-item {
          display: flex;
          align-items: flex-start;
          gap: 1.1rem;
          position: relative;
        }
        .aep-marker {
          flex: 0 0 auto;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #FFF12D;
          color: #000;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 0.72rem;
          letter-spacing: 0.02em;
          position: relative;
          z-index: 1;
        }
        .aep-copy { flex: 1 1 auto; min-width: 0; }
        .aep-item:not(:last-child)::after {
          content: '';
          position: absolute;
          top: 36px;
          left: 17px;
          bottom: -2.25rem;
          width: 1px;
          background: linear-gradient(180deg, rgba(255,241,45,0.45), rgba(255,241,45,0.1));
        }

        @media (min-width: 861px) {
          .aep-list {
            flex-direction: row;
            gap: 1.75rem;
          }
          .aep-item {
            flex: 1 1 0;
            flex-direction: column;
            align-items: flex-start;
            gap: 1.1rem;
          }
          .aep-item:not(:last-child)::after {
            top: 17px;
            left: 36px;
            right: -1.75rem;
            bottom: auto;
            width: auto;
            height: 1px;
            background: linear-gradient(90deg, rgba(255,241,45,0.45), rgba(255,241,45,0.1));
          }
        }

        @media (prefers-reduced-motion: no-preference) {
          .aep-item { transition: opacity 0.2s ease; }
        }
        @media (prefers-reduced-motion: reduce) {
          .aep-item { transition: none; }
        }
      `}</style>

      <h3 style={diagramTitleStyle}>{title}</h3>
      <p style={diagramDescStyle}>{description}</p>

      <ol className="aep-list" aria-label={title}>
        {steps.map((item) => (
          <li key={item.step} className="aep-item">
            <span aria-hidden="true" className="aep-marker">{item.step}</span>
            <div className="aep-copy">
              <h4 style={itemTitleStyle}>{item.title}</h4>
              <p style={itemBodyStyle}>{item.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

const wrapStyle: CSSProperties = {
  width: '100%',
  marginTop: '3rem',
  paddingTop: '2.5rem',
  borderTop: '1px solid rgba(255,255,255,0.1)',
};

const diagramTitleStyle: CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 'clamp(1.3rem, 2.6vw, 1.9rem)',
  lineHeight: 1.15,
  letterSpacing: '-0.01em',
  margin: 0,
  textTransform: 'uppercase',
  color: '#fff',
};

const diagramDescStyle: CSSProperties = {
  color: 'rgba(255,255,255,0.6)',
  fontSize: '1rem',
  lineHeight: 1.78,
  maxWidth: '760px',
  margin: '1rem 0 0',
  textAlign: 'left',
};

const itemTitleStyle: CSSProperties = {
  margin: '0.35rem 0 0.6rem',
  fontFamily: 'var(--font-display)',
  fontSize: 'clamp(1rem, 1.8vw, 1.2rem)',
  lineHeight: 1.15,
  textTransform: 'uppercase',
  color: '#fff',
};

const itemBodyStyle: CSSProperties = {
  margin: 0,
  color: 'rgba(255,255,255,0.6)',
  fontSize: '0.94rem',
  lineHeight: 1.7,
  textAlign: 'left',
};
