'use client';

export interface FAQItem {
  q: string;
  a: string;
}

export interface FAQSectionProps {
  items: FAQItem[];
  title?: string;
}

export default function FAQSection({
  items,
  title = 'FREQUENTLY ASKED QUESTIONS',
}: FAQSectionProps) {
  if (items.length === 0) return null;

  return (
    <section style={{ marginBottom: '2rem' }}>
      <p style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '0.65rem',
        letterSpacing: '0.1em',
        color: 'rgba(255,255,255,0.3)',
        textTransform: 'uppercase',
        marginBottom: '1.5rem',
      }}>
        {title}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {items.map((item, i) => (
          <div key={i} style={{
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            paddingBottom: '1.25rem',
            marginBottom: '1.25rem',
          }}>
            <p style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 600,
              fontSize: '0.95rem',
              color: '#fff',
              marginBottom: '0.6rem',
              lineHeight: 1.35,
              textAlign: 'justify',
            }}>
              {item.q}
            </p>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.88rem',
              color: 'rgba(255,255,255,0.55)',
              lineHeight: 1.75,
              textAlign: 'justify',
            }}>
              {item.a}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
