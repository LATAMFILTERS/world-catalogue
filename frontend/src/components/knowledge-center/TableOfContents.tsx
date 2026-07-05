'use client';

export interface TOCSection {
  id: string;
  title: string;
  number?: string;
}

export interface TableOfContentsProps {
  sections: TOCSection[];
  title?: string;
}

export default function TableOfContents({ sections, title = 'CONTENTS' }: TableOfContentsProps) {
  if (sections.length === 0) return null;

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <p style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '0.6rem',
        letterSpacing: '0.1em',
        color: 'rgba(255,255,255,0.3)',
        marginBottom: '0.75rem',
      }}>
        {title}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            style={{
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'baseline',
              padding: '0.45rem 0',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
              textDecoration: 'none',
            }}
          >
            {section.number && (
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.55rem',
                color: 'rgba(255,241,45,0.4)',
                minWidth: '1.5rem',
                flexShrink: 0,
              }}>
                {section.number}
              </span>
            )}
            <span style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.75rem',
              color: 'rgba(255,255,255,0.4)',
              lineHeight: 1.4,
            }}>
              {section.title}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
