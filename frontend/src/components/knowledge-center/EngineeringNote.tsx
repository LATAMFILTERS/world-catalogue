'use client';

export interface EngineeringNoteItem {
  label: string;
  value: string;
}

export interface EngineeringNoteProps {
  items: EngineeringNoteItem[];
  variant?: 'yellow' | 'white';
  valueSize?: string;
}

export default function EngineeringNote({
  items,
  variant = 'yellow',
  valueSize = '1.3rem',
}: EngineeringNoteProps) {
  const isYellow = variant === 'yellow';

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '1px',
      background: isYellow ? 'rgba(255,241,45,0.08)' : 'rgba(255,255,255,0.05)',
      border: `1px solid ${isYellow ? 'rgba(255,241,45,0.15)' : 'rgba(255,255,255,0.06)'}`,
      marginTop: '1.5rem',
    }}>
      {items.map((item) => (
        <div key={item.label} style={{ background: '#000', padding: '1rem 1.25rem', minWidth: 0 }}>
          <p style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 700,
            fontSize: valueSize,
            color: '#FFF12D',
            lineHeight: 1.25,
            marginBottom: '0.3rem',
            overflowWrap: 'break-word',
          }}>
            {item.value}
          </p>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.72rem',
            lineHeight: 1.4,
            color: 'rgba(255,255,255,0.4)',
          }}>
            {item.label}
          </p>
        </div>
      ))}
    </div>
  );
}
