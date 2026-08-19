import type { CSSProperties } from 'react';
import type { TechnologyEditorial as Editorial, EditorialKey } from '@/lib/technology-editorial';

const heading: CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 'clamp(2rem, 3.6vw, 3.2rem)',
  lineHeight: 1.05,
  letterSpacing: '-0.03em',
  color: '#fff',
  margin: 0,
};

const subheading: CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 'clamp(1.15rem, 2vw, 1.45rem)',
  lineHeight: 1.25,
  color: '#fff',
  margin: '0 0 0.8rem',
};

const copy: CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'clamp(1rem, 1.25vw, 1.08rem)',
  lineHeight: 1.82,
  color: 'rgba(255,255,255,0.78)',
};

const eyebrow: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.68rem',
  letterSpacing: '0.16em',
  color: '#FFF12D',
  textTransform: 'uppercase',
  marginBottom: '0.9rem',
};

type Chapter = {
  id: string;
  label: string;
  keys: readonly EditorialKey[];
};

const CHAPTERS: readonly Chapter[] = [
  { id: 'operating-reality', label: 'OPERATING REALITY', keys: ['problem', 'fieldNote', 'contamination'] },
  { id: 'engineering', label: 'HOW THE SYSTEM BEHAVES', keys: ['mechanism', 'protectedAssets'] },
  { id: 'application', label: 'APPLICATION ENVIRONMENT', keys: ['applications', 'conditions', 'industries'] },
  { id: 'selection', label: 'SPECIFICATION & SELECTION', keys: ['selection', 'parameters', 'mistakes'] },
  { id: 'service', label: 'SERVICE & DIAGNOSIS', keys: ['service'] },
  { id: 'technical-basis', label: 'TECHNICAL BASIS', keys: ['standards', 'families'] },
  { id: 'faq', label: 'QUESTIONS FROM THE FIELD', keys: ['faq'] },
  { id: 'decision', label: 'WHEN A TECHNICAL REVIEW MAKES SENSE', keys: ['commercialDecision'] },
];

function highValueClose(editorial: Editorial) {
  const problem = editorial.problem.title;

  if (problem.startsWith('Dust does not need to be dramatic')) {
    return 'For an intake review, the useful inputs are the engine and housing, current element, actual duty cycle, restriction history, service interval and any evidence of dust on the clean side. That keeps the decision focused on airflow, sealing and contamination control rather than on a familiar label or a cross-reference alone.';
  }
  if (problem.startsWith('Cabin filtration is an operating-environment issue')) {
    return 'For a cabin-air review, the useful evidence is practical: equipment model, housing arrangement, airflow direction, operator complaints, dust environment, current service interval and any recurring evaporator or blower issues.';
  }
  if (problem.startsWith('Water in compressed air')) {
    return 'A fleet review should include dryer model, cartridge history, compressor duty, purge behavior, reservoir findings, climate and any recurring pneumatic or cold-weather events. Those inputs reveal whether the cartridge is the root cause or only the component receiving the symptom.';
  }
  if (problem.startsWith('A perfect element cannot compensate')) {
    return 'For an intake-package review, the useful inputs are engine airflow, housing and element references, inlet and outlet geometry, installation envelope, service clearance, vibration exposure and any dust-track evidence.';
  }
  if (problem.startsWith('Modern fuel systems do not tolerate casual contamination control')) {
    return 'A useful fuel-filtration review starts with the filter position, engine and equipment, current element, fuel source, service interval, restriction history and any injector or pump events.';
  }
  if (problem.startsWith('Water is not just another contaminant')) {
    return 'For a recurring water-in-fuel problem, the separator reference is only one input. Tank condition, fuel source, transfer practice, drain history, equipment duty and downstream failures help determine whether the real issue is at the element, the installation or farther upstream in the fuel-handling chain.';
  }
  if (problem.startsWith('Turbine-style fuel conditioning is an architecture')) {
    return 'For a staged separator review, the assembly size, element position, required flow, current rating, drain arrangement, installation access and fuel-quality history all matter. The goal is to preserve the intended sequence of separation and filtration.';
  }
  if (problem.startsWith('Oil carries evidence')) {
    return 'A lubrication review becomes useful when the engine, current filter, oil grade, drain interval, duty cycle, oil-analysis trend and any bearing or turbocharger history are considered together.';
  }
  if (problem.startsWith('Hydraulic components fail in clear oil')) {
    return 'A useful hydraulic review starts with the circuit, filter location, normal and peak flow, fluid and temperature range, current housing and element, sensitive components, failure history and any available cleanliness data.';
  }
  if (problem.startsWith('Cooling-system deposits do not have to block')) {
    return 'For a cooling-system review, the engine or equipment, coolant type, current filter, service interval, repair history, contamination findings and any coolant-analysis data should be considered together.';
  }
  return null;
}

function faqHeading(editorial: Editorial) {
  const problem = editorial.problem.title;
  if (problem.startsWith('Cabin filtration')) return 'What maintenance teams usually ask when airflow and contamination are reviewed together.';
  if (problem.startsWith('Water in compressed air')) return 'What needs to be answered when moisture keeps showing up downstream.';
  if (problem.startsWith('A perfect element')) return 'What to check when the element looks correct but the intake still fails.';
  if (problem.startsWith('Modern fuel systems')) return 'What to clarify before treating every fuel-filter position the same way.';
  if (problem.startsWith('Water is not just another contaminant')) return 'What to investigate when water keeps returning to the fuel system.';
  if (problem.startsWith('Turbine-style fuel conditioning')) return 'What to verify before changing an element inside a staged assembly.';
  if (problem.startsWith('Oil carries evidence')) return 'What to ask when filter life is evaluated together with oil condition and engine duty.';
  if (problem.startsWith('Hydraulic components fail in clear oil')) return 'What to establish when cleanliness targets replace visual judgment.';
  if (problem.startsWith('Cooling-system deposits')) return 'What to separate clearly between coolant cleanliness and coolant chemistry.';
  if (problem.startsWith('Dust does not need to be dramatic')) return 'What to verify when restriction, sealing and dust loading are reviewed together.';
  return 'Questions that matter during a technical application review.';
}

function TextFacet({ title, body, emphasize = false }: { title: string; body: string; emphasize?: boolean }) {
  return (
    <div style={{ padding: '1.45rem 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <h3 style={subheading}>{title}</h3>
      <p style={{ ...copy, margin: 0, color: emphasize ? 'rgba(255,255,255,0.93)' : copy.color }}>{body}</p>
    </div>
  );
}

function ListFacet({ title, items, showTitle = true }: { title: string; items: readonly string[]; showTitle?: boolean }) {
  return (
    <div style={{ padding: '1.45rem 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      {showTitle && <h3 style={subheading}>{title}</h3>}
      <ul style={{ margin: showTitle ? '0.85rem 0 0' : 0, padding: 0, listStyle: 'none', display: 'grid', gap: '0.7rem' }}>
        {items.map((item) => (
          <li key={item} style={{ ...copy, margin: 0, display: 'grid', gridTemplateColumns: '18px 1fr', gap: '0.7rem', alignItems: 'start' }}>
            <span aria-hidden="true" style={{ color: '#FFF12D', lineHeight: 1.8 }}>—</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FAQFacet({ editorial }: { editorial: Editorial }) {
  return (
    <div style={{ marginTop: '1.8rem', borderTop: '1px solid rgba(255,255,255,0.12)' }}>
      {editorial.faq.map((item) => (
        <details key={item.question} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '1.1rem 0' }}>
          <summary style={{ cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '1.02rem', color: '#fff', lineHeight: 1.4 }}>{item.question}</summary>
          <p style={{ ...copy, margin: '0.85rem 0 0', maxWidth: '900px' }}>{item.answer}</p>
        </details>
      ))}
    </div>
  );
}

function renderFacet(key: EditorialKey, editorial: Editorial) {
  if (key === 'faq') return <FAQFacet key={key} editorial={editorial} />;
  const value = editorial[key];
  if (!value) return null;
  if ('items' in value) return <ListFacet key={key} title={value.title} items={value.items} />;
  return <TextFacet key={key} title={value.title} body={value.copy} emphasize={key === 'fieldNote' || key === 'commercialDecision'} />;
}

function chapterHeading(chapter: Chapter, editorial: Editorial) {
  if (chapter.id === 'faq') return faqHeading(editorial);
  const firstAvailable = chapter.keys.find((key) => editorial.flow.includes(key));
  if (!firstAvailable) return chapter.label;
  const value = editorial[firstAvailable];
  if (firstAvailable === 'faq') return faqHeading(editorial);
  return 'title' in value ? value.title : chapter.label;
}

function chapterOrder(editorial: Editorial) {
  return [...CHAPTERS]
    .map((chapter) => ({
      chapter,
      position: Math.min(...chapter.keys.map((key) => {
        const idx = editorial.flow.indexOf(key);
        return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
      })),
    }))
    .filter(({ position }) => position !== Number.MAX_SAFE_INTEGER)
    .sort((a, b) => a.position - b.position)
    .map(({ chapter }) => chapter);
}

export default function TechnologyEditorial({ editorial }: { editorial: Editorial }) {
  const chapters = chapterOrder(editorial);
  const close = highValueClose(editorial);

  return (
    <div>
      {chapters.map((chapter, index) => {
        const keys = chapter.keys.filter((key) => editorial.flow.includes(key));
        const primary = keys[0];
        const secondaryKeys = keys.slice(1);
        const isDecision = chapter.id === 'decision';

        return (
          <section
            key={chapter.id}
            style={{
              padding: isDecision ? '5.5rem 2rem' : '5rem 2rem',
              borderTop: '1px solid rgba(255,255,255,0.07)',
              background: isDecision
                ? 'linear-gradient(180deg, rgba(255,241,45,0.035), #000)'
                : index % 2 === 1 ? '#050505' : '#000',
            }}
          >
            <div className="technology-editorial-chapter" style={{ maxWidth: '1240px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0,0.72fr) minmax(0,1.28fr)', gap: 'clamp(2.5rem, 7vw, 7rem)', alignItems: 'start' }}>
              <div>
                <div style={eyebrow}>{chapter.label}</div>
                <h2 style={heading}>{chapterHeading(chapter, editorial)}</h2>
              </div>

              <div>
                {primary && primary !== 'faq' ? (() => {
                  const value = editorial[primary];
                  if ('items' in value) return <ListFacet title={value.title} items={value.items} showTitle={false} />;
                  return <p style={{ ...copy, margin: 0, fontSize: 'clamp(1.08rem,1.55vw,1.22rem)', color: 'rgba(255,255,255,0.91)' }}>{value.copy}</p>;
                })() : primary === 'faq' ? <FAQFacet editorial={editorial} /> : null}

                {secondaryKeys.map((key) => renderFacet(key, editorial))}

                {isDecision && close ? (
                  <p style={{ ...copy, margin: '1.5rem 0 0', color: 'rgba(255,255,255,0.94)', fontSize: '1.06rem' }}>{close}</p>
                ) : null}
              </div>
            </div>
          </section>
        );
      })}

      <style>{`
        @media (max-width: 860px) {
          .technology-editorial-chapter { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
