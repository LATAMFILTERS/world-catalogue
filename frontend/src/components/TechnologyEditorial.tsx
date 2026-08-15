import type { CSSProperties } from 'react';
import type { TechnologyEditorial as Editorial, EditorialKey } from '@/lib/technology-editorial';

const heading: CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 'clamp(1.7rem, 3vw, 2.7rem)',
  lineHeight: 1.08,
  letterSpacing: '-0.025em',
  color: '#fff',
  margin: 0,
};

const copy: CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '1rem',
  lineHeight: 1.8,
  color: 'rgba(255,255,255,0.76)',
};

const label: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.68rem',
  letterSpacing: '0.16em',
  color: '#FFF12D',
  textTransform: 'uppercase',
  marginBottom: '0.85rem',
};

function TextBlock({ title, body, index }: { title: string; body: string; index: number }) {
  const reverse = index % 2 === 1;
  return (
    <section style={{ padding: '4.5rem 2rem', borderTop: '1px solid rgba(255,255,255,0.07)', background: index % 3 === 1 ? '#050505' : '#000' }}>
      <div className="technology-editorial-split" style={{ maxWidth: '1240px', margin: '0 auto', display: 'grid', gridTemplateColumns: reverse ? '1.15fr 0.85fr' : '0.85fr 1.15fr', gap: 'clamp(2.5rem, 7vw, 7rem)', alignItems: 'start' }}>
        {reverse ? <p style={{ ...copy, fontSize: 'clamp(1.05rem,1.5vw,1.2rem)', margin: 0 }}>{body}</p> : null}
        <div>
          <div style={label}>APPLICATION ENGINEERING</div>
          <h2 style={heading}>{title}</h2>
        </div>
        {!reverse ? <p style={{ ...copy, fontSize: 'clamp(1.05rem,1.5vw,1.2rem)', margin: 0 }}>{body}</p> : null}
      </div>
    </section>
  );
}

function ListBlock({ title, items, index }: { title: string; items: readonly string[]; index: number }) {
  return (
    <section style={{ padding: '4.75rem 2rem', borderTop: '1px solid rgba(255,255,255,0.07)', background: index % 3 === 2 ? '#050505' : '#000' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        <div style={label}>FIELD DECISION</div>
        <h2 style={{ ...heading, maxWidth: '850px' }}>{title}</h2>
        <div className="technology-editorial-list" style={{ marginTop: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '1px', background: 'rgba(255,255,255,0.09)' }}>
          {items.map((item, i) => (
            <div key={item} style={{ background: '#080808', padding: '1.4rem 1.5rem', display: 'grid', gridTemplateColumns: '38px 1fr', gap: '0.8rem', alignItems: 'start' }}>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,241,45,0.72)', fontSize: '0.7rem' }}>{String(i + 1).padStart(2, '0')}</span>
              <span style={{ ...copy, margin: 0, fontSize: '0.96rem', color: 'rgba(255,255,255,0.88)' }}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQBlock({ editorial }: { editorial: Editorial }) {
  return (
    <section style={{ padding: '5rem 2rem', borderTop: '1px solid rgba(255,255,255,0.07)', background: '#050505' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={label}>QUESTIONS FROM THE FIELD</div>
        <h2 style={heading}>Questions we would expect in a technical review.</h2>
        <div style={{ marginTop: '2.4rem', borderTop: '1px solid rgba(255,255,255,0.12)' }}>
          {editorial.faq.map((item) => (
            <details key={item.question} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '1.15rem 0' }}>
              <summary style={{ cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '1.02rem', color: '#fff', lineHeight: 1.4 }}>{item.question}</summary>
              <p style={{ ...copy, margin: '0.9rem 0 0', maxWidth: '880px' }}>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function renderKey(key: EditorialKey, editorial: Editorial, index: number) {
  if (key === 'faq') return <FAQBlock key={key} editorial={editorial} />;
  const value = editorial[key];
  if (!value) return null;
  if ('items' in value) return <ListBlock key={key} title={value.title} items={value.items} index={index} />;
  return <TextBlock key={key} title={value.title} body={value.copy} index={index} />;
}

export default function TechnologyEditorial({ editorial }: { editorial: Editorial }) {
  return (
    <div>
      {editorial.flow.map((key, index) => renderKey(key, editorial, index))}
      <style>{`
        @media (max-width: 860px) {
          .technology-editorial-split,
          .technology-editorial-list { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
