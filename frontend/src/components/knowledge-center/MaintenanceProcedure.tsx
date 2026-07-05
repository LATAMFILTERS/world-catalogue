'use client';

export interface ProcedureStep {
  title: string;
  description: string;
  warning?: string;
}

export interface MaintenanceProcedureProps {
  title?: string;
  steps: ProcedureStep[];
}

export default function MaintenanceProcedure({ title, steps }: MaintenanceProcedureProps) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      {title && (
        <p style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.65rem',
          letterSpacing: '0.1em',
          color: 'rgba(255,255,255,0.3)',
          textTransform: 'uppercase',
          marginBottom: '1.25rem',
        }}>
          {title}
        </p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {steps.map((step, i) => (
          <div key={i} style={{
            display: 'flex',
            gap: '1rem',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            paddingBottom: '1.25rem',
            marginBottom: '1.25rem',
          }}>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 700,
              fontSize: '0.7rem',
              color: '#FFF12D',
              minWidth: '1.75rem',
              paddingTop: '0.1rem',
              flexShrink: 0,
            }}>
              {String(i + 1).padStart(2, '0')}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 600,
                fontSize: '0.9rem',
                color: '#fff',
                marginBottom: '0.35rem',
                lineHeight: 1.25,
              }}>
                {step.title}
              </p>
              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.83rem',
                color: 'rgba(255,255,255,0.55)',
                lineHeight: 1.65,
              }}>
                {step.description}
              </p>
              {step.warning && (
                <p style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.75rem',
                  color: 'rgba(255,160,60,0.7)',
                  marginTop: '0.5rem',
                  lineHeight: 1.5,
                }}>
                  ⚠ {step.warning}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
