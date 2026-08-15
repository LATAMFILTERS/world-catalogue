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

const MICRO_LABELS: Record<EditorialKey, readonly string[]> = {
  problem: ['WHAT SHOWS UP FIRST', 'THE OPERATING PROBLEM', 'WHERE THE TROUBLE STARTS'],
  applications: ['WHERE THIS SHOWS UP', 'IN THE FIELD', 'TYPICAL DUTY'],
  contamination: ['WHAT IS MOVING THROUGH THE SYSTEM', 'CONTAMINATION PATH', 'WHAT THE SYSTEM IS FIGHTING'],
  mechanism: ['WHAT IS HAPPENING INSIDE', 'ENGINEERING LOGIC', 'HOW THE PROTECTION WORKS'],
  protectedAssets: ['WHAT IS REALLY AT RISK', 'DOWNSTREAM OF THE FILTER', 'COMPONENTS WE ARE PROTECTING'],
  selection: ['BEFORE SPECIFYING', 'SELECTION CHECKPOINT', 'WHAT WE CHECK FIRST'],
  parameters: ['NUMBERS THAT ACTUALLY MATTER', 'ENGINEERING VARIABLES', 'WHAT CHANGES THE DECISION'],
  conditions: ['WHEN DUTY CHANGES THE ANSWER', 'REAL OPERATING CONDITIONS', 'SEVERE-DUTY CHECK'],
  service: ['WHAT MAINTENANCE SEES', 'SERVICE REALITY', 'WHEN THE TREND CHANGES'],
  mistakes: ['WHAT GOES WRONG IN PRACTICE', 'COMMON FIELD MISS', 'WHERE SELECTION FAILS'],
  standards: ['ENGINEERING REFERENCE', 'TEST BASIS', 'HOW PERFORMANCE SHOULD BE READ'],
  families: ['HOW IT CONNECTS TO THE PRODUCT', 'PORTFOLIO CONNECTION', 'FROM TECHNOLOGY TO APPLICATION'],
  industries: ['WHERE THE DUTY GETS EXPENSIVE', 'OPERATING ENVIRONMENTS', 'WHERE THIS MATTERS MOST'],
  faq: ['QUESTIONS WE HEAR IN THE FIELD', 'WHAT MAINTENANCE USUALLY ASKS', 'TECHNICAL REVIEW QUESTIONS'],
  commercialDecision: ['WHEN IT STOPS BEING A PART-NUMBER QUESTION', 'BEFORE THE NEXT PURCHASE', 'WHEN A TECHNICAL REVIEW MAKES SENSE'],
  fieldNote: ['FIELD NOTE', 'FROM THE SHOP FLOOR', 'WHAT EXPERIENCE TEACHES'],
};

function microLabel(key: EditorialKey, index: number) {
  const choices = MICRO_LABELS[key];
  return choices[index % choices.length];
}

function highValueClose(editorial: Editorial) {
  const problem = editorial.problem.title;

  if (problem.startsWith('Dust does not need to be dramatic')) {
    return 'For an intake review, the useful inputs are the engine and housing, current element, actual duty cycle, restriction history, service interval and any evidence of dust on the clean side. That keeps the decision focused on airflow, sealing and contamination control rather than on a familiar label or a cross-reference alone.';
  }

  if (problem.startsWith('Hydraulic components fail in clear oil')) {
    return 'A useful hydraulic review starts with the circuit, filter location, normal and peak flow, fluid and temperature range, current housing and element, sensitive components, failure history and any available cleanliness data. With that information, the discussion can move from replacement filters to a measurable cleanliness strategy.';
  }

  if (problem.startsWith('Water in fuel')) {
    return 'For a recurring water-in-fuel problem, the separator reference is only one input. Tank condition, fuel source, transfer practice, drain history, equipment duty and downstream failures help determine whether the real issue is at the element, the installation or farther upstream in the fuel-handling chain.';
  }

  return null;
}

function TextBlock({ keyName, title, body, index, editorial }: { keyName: EditorialKey; title: string; body: string; index: number; editorial: Editorial }) {
  const reverse = index % 2 === 1;
  const close = keyName === 'commercialDecision' ? highValueClose(editorial) : null;

  return (
    <section style={{ padding: keyName === 'commercialDecision' ? '5.25rem 2rem' : '4.5rem 2rem', borderTop: '1px solid rgba(255,255,255,0.07)', background: keyName === 'commercialDecision' ? 'linear-gradient(180deg, rgba(255,241,45,0.035), #000)' : index % 3 === 1 ? '#050505' : '#000' }}>
      <div className="technology-editorial-split" style={{ maxWidth: '1240px', margin: '0 auto', display: 'grid', gridTemplateColumns: reverse ? '1.15fr 0.85fr' : '0.85fr 1.15fr', gap: 'clamp(2.5rem, 7vw, 7rem)', alignItems: 'start' }}>
        {reverse ? (
          <div>
            <p style={{ ...copy, fontSize: 'clamp(1.05rem,1.5vw,1.2rem)', margin: 0 }}>{body}</p>
            {close && <p style={{ ...copy, margin: '1.25rem 0 0', color: 'rgba(255,255,255,0.92)' }}>{close}</p>}
          </div>
        ) : null}
        <div>
          <div style={label}>{microLabel(keyName, index)}</div>
          <h2 style={heading}>{title}</h2>
        </div>
        {!reverse ? (
          <div>
            <p style={{ ...copy, fontSize: 'clamp(1.05rem,1.5vw,1.2rem)', margin: 0 }}>{body}</p>
            {close && <p style={{ ...copy, margin: '1.25rem 0 0', color: 'rgba(255,255,255,0.92)' }}>{close}</p>}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ListBlock({ keyName, title, items, index }: { keyName: EditorialKey; title: string; items: readonly string[]; index: number }) {
  return (
    <section style={{ padding: '4.75rem 2rem', borderTop: '1px solid rgba(255,255,255,0.07)', background: index % 3 === 2 ? '#050505' : '#000' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        <div style={label}>{microLabel(keyName, index)}</div>
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

function FAQBlock({ editorial, index }: { editorial: Editorial; index: number }) {
  return (
    <section style={{ padding: '5rem 2rem', borderTop: '1px solid rgba(255,255,255,0.07)', background: '#050505' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={label}>{microLabel('faq', index)}</div>
        <h2 style={heading}>Questions that come up when the application is reviewed properly.</h2>
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
  if (key === 'faq') return <FAQBlock key={key} editorial={editorial} index={index} />;
  const value = editorial[key];
  if (!value) return null;
  if ('items' in value) return <ListBlock key={key} keyName={key} title={value.title} items={value.items} index={index} />;
  return <TextBlock key={key} keyName={key} title={value.title} body={value.copy} index={index} editorial={editorial} />;
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
