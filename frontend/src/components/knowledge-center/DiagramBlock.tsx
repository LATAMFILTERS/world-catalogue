'use client';

export interface DiagramBlockProps {
  id: string;
  caption?: string;
  aspectRatio?: string;
}

export default function DiagramBlock({
  id,
  caption,
  aspectRatio = '16 / 9',
}: DiagramBlockProps) {
  return (
    <figure style={{ margin: '0 0 2rem 0' }}>
      <div style={{
        aspectRatio,
        border: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(255,255,255,0.02)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
      }}>
        <p style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.65rem',
          letterSpacing: '0.1em',
          color: 'rgba(255,255,255,0.15)',
        }}>
          DIAGRAM
        </p>
        <p style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.7rem',
          fontWeight: 700,
          color: 'rgba(255,241,45,0.3)',
        }}>
          {id}
        </p>
      </div>
      {caption && (
        <figcaption style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.75rem',
          color: 'rgba(255,255,255,0.3)',
          marginTop: '0.5rem',
          textAlign: 'center',
          fontStyle: 'italic',
        }}>
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
