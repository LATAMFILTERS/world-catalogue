'use client';

export interface FailureAnalysisProps {
  title?: string;
  chain: string[];
  impact?: string;
  standards?: string[];
}

export default function FailureAnalysis({ title, chain, impact, standards }: FailureAnalysisProps) {
  return (
    <div style={{
      border: '1px solid rgba(255,255,255,0.07)',
      padding: '1.5rem',
      marginBottom: '2rem',
    }}>
      {title && (
        <p style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.6rem',
          letterSpacing: '0.1em',
          color: 'rgba(255,255,255,0.3)',
          marginBottom: '1rem',
          textTransform: 'uppercase',
        }}>
          {title}
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {chain.map((step, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flexShrink: 0,
            }}>
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                marginTop: '0.35rem',
                background: i === 0
                  ? 'rgba(255,80,80,0.7)'
                  : i === chain.length - 1
                    ? 'rgba(255,241,45,0.8)'
                    : 'rgba(255,255,255,0.2)',
              }} />
              {i < chain.length - 1 && (
                <div style={{
                  width: '1px',
                  flex: 1,
                  background: 'rgba(255,255,255,0.07)',
                  minHeight: '1.5rem',
                  marginTop: '0.25rem',
                }} />
              )}
            </div>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.83rem',
              lineHeight: 1.5,
              paddingBottom: '0.75rem',
              color: i === 0
                ? 'rgba(255,255,255,0.75)'
                : i === chain.length - 1
                  ? 'rgba(255,241,45,0.8)'
                  : 'rgba(255,255,255,0.5)',
            }}>
              {step}
            </p>
          </div>
        ))}
      </div>

      {impact && (
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          marginTop: '0.5rem',
          paddingTop: '0.875rem',
        }}>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            letterSpacing: '0.08em',
            color: 'rgba(255,241,45,0.5)',
            marginBottom: '0.3rem',
          }}>
            OPERATIONAL IMPACT
          </p>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.82rem',
            color: 'rgba(255,255,255,0.55)',
            lineHeight: 1.5,
          }}>
            {impact}
          </p>
        </div>
      )}

      {standards && standards.length > 0 && (
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          marginTop: '0.75rem',
          paddingTop: '0.75rem',
          display: 'flex',
          gap: '0.4rem',
          flexWrap: 'wrap',
        }}>
          {standards.map((s) => (
            <span key={s} style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.6rem',
              color: '#FFF12D',
              border: '1px solid rgba(255,241,45,0.2)',
              padding: '0.15rem 0.4rem',
            }}>
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
