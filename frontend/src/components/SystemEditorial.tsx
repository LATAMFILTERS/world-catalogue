import type { CSSProperties } from 'react';
import type { SystemEditorial } from '@/lib/system-editorial';

interface Props {
  editorial: SystemEditorial;
}

const displayFont = 'Chakra Petch, Arial Narrow, monospace';
const bodyFont = 'Barlow, Arial, sans-serif';

const sectionStyle: CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: 'clamp(2.8rem, 5vw, 4.4rem) clamp(1.5rem, 5vw, 4rem)',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
};

const eyebrow: CSSProperties = {
  fontFamily: displayFont,
  fontSize: '0.66rem',
  fontWeight: 700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: '#FFF12D',
  marginBottom: '0.8rem',
};

const heading: CSSProperties = {
  fontFamily: displayFont,
  fontWeight: 700,
  fontSize: 'clamp(1.55rem, 3vw, 2.35rem)',
  lineHeight: 1.04,
  letterSpacing: '-0.035em',
  textTransform: 'uppercase',
  marginBottom: '1rem',
};

const body: CSSProperties = {
  fontFamily: bodyFont,
  fontSize: 'clamp(0.98rem, 1.35vw, 1.08rem)',
  lineHeight: 1.75,
  color: 'rgba(255,255,255,0.72)',
  fontWeight: 500,
};

const grid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '1px',
  background: 'rgba(255,255,255,0.07)',
};

const card: CSSProperties = {
  background: '#000',
  padding: '1.35rem 1.45rem',
};

function CopyBlock({
  title,
  copy,
  image,
  imageAlt,
  imageSide = 'right',
}: {
  title: string;
  copy: string;
  image?: string;
  imageAlt?: string;
  imageSide?: 'left' | 'right';
}) {
  const paragraphs = copy.split('\n\n');
  const text = (
    <div>
      <h2 style={heading}>{title}</h2>
      {paragraphs.map((para, i) => (
        <p key={i} style={{ ...body, maxWidth: image ? undefined : '980px', marginTop: i > 0 ? '1rem' : 0 }}>{para}</p>
      ))}
    </div>
  );

  if (!image) {
    return <section style={sectionStyle}>{text}</section>;
  }

  const photo = (
    <div>
      <img
        src={image}
        alt={imageAlt || title}
        style={{ width: '100%', display: 'block', border: '1px solid rgba(255,255,255,0.1)' }}
      />
    </div>
  );

  return (
    <section style={sectionStyle}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
          gap: 'clamp(2rem, 6vw, 4rem)',
          alignItems: 'center',
        }}
      >
        {imageSide === 'left' ? (
          <>
            {photo}
            {text}
          </>
        ) : (
          <>
            {text}
            {photo}
          </>
        )}
      </div>
    </section>
  );
}

function ListBlock({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <section style={sectionStyle}>
      <h2 style={heading}>{title}</h2>
      <div style={grid}>
        {items.map((item) => (
          <div key={item} style={card}>
            <p style={{ ...body, fontSize: '0.94rem', color: 'rgba(255,255,255,0.66)' }}>{item}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FAQBlock({ editorial }: { editorial: SystemEditorial }) {
  return (
    <section style={sectionStyle}>
      <h2 style={heading}>Questions engineers and fleet teams usually ask</h2>
      <div style={{ display: 'grid', gap: '1px', background: 'rgba(255,255,255,0.07)' }}>
        {editorial.faq.map((entry) => (
          <article key={entry.question} style={card}>
            <h3 style={{ ...heading, fontSize: '1rem', marginBottom: '0.55rem' }}>{entry.question}</h3>
            <p style={{ ...body, fontSize: '0.94rem' }}>{entry.answer}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function SystemEditorialContent({ editorial }: Props) {
  return (
    <>
      {editorial.flow.map((key) => {
        if (key === 'faq') return <FAQBlock key={key} editorial={editorial} />;

        const value = editorial[key];
        if ('copy' in value) {
          return (
            <CopyBlock
              key={key}
              title={value.title}
              copy={value.copy}
              image={value.image}
              imageAlt={value.imageAlt}
              imageSide={value.imageSide}
            />
          );
        }

        return <ListBlock key={key} title={value.title} items={value.items} />;
      })}
    </>
  );
}
