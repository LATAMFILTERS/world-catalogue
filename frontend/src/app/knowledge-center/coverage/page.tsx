import type { Metadata } from 'next';
import { EDL_PROBLEMS, EDL_STANDARDS, EDL_TECHNOLOGIES } from '@/lib/knowledge-center/edl';
import { TERMINOLOGY_REGISTRY } from '@/lib/knowledge-center';
import { ENGINEERING_ARTICLES } from '@/lib/knowledge-center-data';
import { ERL_SECTIONS } from '@/lib/engineering-reference-data';
import type { EntityStatus } from '@/lib/knowledge-center';

export const metadata: Metadata = {
  title: 'KC Coverage Dashboard — Internal | ELIMFILTERS',
  robots: { index: false, follow: false },
};

function countByStatus(entities: Array<{ status: string }>) {
  const counts: Record<string, number> = {};
  for (const e of entities) {
    counts[e.status] = (counts[e.status] ?? 0) + 1;
  }
  return counts;
}

const STATUS_ORDER: EntityStatus[] = [
  'published',
  'engineering-approved',
  'technical-review',
  'draft',
  'superseded',
  'deprecated',
  'archived',
];

const STATUS_COLORS: Record<string, string> = {
  published: '#44ff88',
  'engineering-approved': '#66ccff',
  'technical-review': '#FFF12D',
  draft: 'rgba(255,255,255,0.35)',
  superseded: 'rgba(255,255,255,0.2)',
  deprecated: '#ff4444',
  archived: 'rgba(255,255,255,0.15)',
};

export default function CoverageDashboard() {
  const termEntries = Object.values(TERMINOLOGY_REGISTRY);

  const sections = [
    {
      label: 'Problems',
      idPrefix: 'PROB',
      entities: Object.values(EDL_PROBLEMS),
      route: '/knowledge-center/problems',
    },
    {
      label: 'Glossary Terms',
      idPrefix: 'TERM',
      entities: termEntries,
      route: '/knowledge-center/glossary',
    },
    {
      label: 'Standards',
      idPrefix: 'STD',
      entities: Object.values(EDL_STANDARDS),
      route: '/knowledge-center/standards',
    },
    {
      label: 'Technologies',
      idPrefix: 'TECH',
      entities: Object.values(EDL_TECHNOLOGIES),
      route: '/knowledge-center/technologies',
    },
    {
      label: 'Engineering Articles',
      idPrefix: 'ARTICLE',
      entities: ENGINEERING_ARTICLES.map(() => ({ status: 'published' as const })),
      route: '/knowledge-center/engineering',
    },
    {
      label: 'ERL Sections',
      idPrefix: 'ARTICLE',
      entities: ERL_SECTIONS.map(() => ({ status: 'published' as const })),
      route: '/knowledge-center/engineering-reference',
    },
  ];

  const totalEntities = sections.reduce((sum, s) => sum + s.entities.length, 0);
  const totalPublished = sections.reduce(
    (sum, s) => sum + s.entities.filter((e) => e.status === 'published' || e.status === 'engineering-approved').length,
    0
  );

  const coveragePct = totalEntities > 0 ? Math.round((totalPublished / totalEntities) * 100) : 0;

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh', fontFamily: 'JetBrains Mono, monospace' }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid rgba(255,241,45,0.2)',
        padding: '1.5rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <p style={{ fontSize: '0.6rem', color: 'rgba(255,241,45,0.6)', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>
            INTERNAL — NOT PUBLIC
          </p>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.5rem', color: '#fff', margin: 0 }}>
            Knowledge Coverage Dashboard
          </h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', marginBottom: '0.25rem' }}>OVERALL COVERAGE</p>
          <p style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: '2rem',
            fontWeight: 700,
            color: coveragePct >= 80 ? '#44ff88' : coveragePct >= 50 ? '#FFF12D' : '#ff8c00',
          }}>
            {coveragePct}%
          </p>
          <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>
            {totalPublished} / {totalEntities} entities published
          </p>
        </div>
      </div>

      {/* Coverage table */}
      <div style={{ padding: '2rem', overflowX: 'auto' }}>
        <table style={{
          borderCollapse: 'collapse',
          width: '100%',
          fontSize: '0.75rem',
          minWidth: '640px',
        }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              {['Section', 'ID Prefix', 'Total', 'Published', 'Draft', 'Other', 'Coverage'].map((h) => (
                <th key={h} style={{
                  textAlign: h === 'Section' || h === 'ID Prefix' ? 'left' : 'right',
                  padding: '0.5rem 1rem 0.75rem',
                  color: 'rgba(255,255,255,0.4)',
                  letterSpacing: '0.06em',
                  fontWeight: 400,
                  fontSize: '0.6rem',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sections.map((section) => {
              const counts = countByStatus(section.entities);
              const published = (counts.published ?? 0) + (counts['engineering-approved'] ?? 0);
              const draft = counts.draft ?? 0;
              const other = section.entities.length - published - draft;
              const pct = section.entities.length > 0
                ? Math.round((published / section.entities.length) * 100)
                : 0;

              return (
                <tr key={section.label} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.75rem 1rem', color: '#fff', fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '0.85rem' }}>
                    {section.label}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: 'rgba(255,255,255,0.35)', fontSize: '0.65rem' }}>
                    {section.idPrefix}-xxx
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: 'rgba(255,255,255,0.7)' }}>
                    {section.entities.length}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#44ff88' }}>
                    {published}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: 'rgba(255,255,255,0.35)' }}>
                    {draft}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: 'rgba(255,255,255,0.2)' }}>
                    {other}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                    <span style={{
                      color: pct >= 80 ? '#44ff88' : pct >= 40 ? '#FFF12D' : '#ff8c00',
                      fontWeight: 600,
                    }}>
                      {pct}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <td colSpan={2} style={{ padding: '0.75rem 1rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem' }}>
                TOTAL
              </td>
              <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#fff', fontWeight: 600 }}>
                {totalEntities}
              </td>
              <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#44ff88', fontWeight: 600 }}>
                {totalPublished}
              </td>
              <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>
                {totalEntities - totalPublished}
              </td>
              <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: 'rgba(255,255,255,0.2)' }}>
                —
              </td>
              <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600 }}>
                <span style={{ color: coveragePct >= 80 ? '#44ff88' : coveragePct >= 40 ? '#FFF12D' : '#ff8c00' }}>
                  {coveragePct}%
                </span>
              </td>
            </tr>
          </tfoot>
        </table>

        {/* Status legend */}
        <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px' }}>
          <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
            STATUS LEGEND
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {STATUS_ORDER.map((s) => (
              <span key={s} style={{ fontSize: '0.65rem', color: STATUS_COLORS[s] ?? 'rgba(255,255,255,0.4)' }}>
                ● {s}
              </span>
            ))}
          </div>
        </div>

        {/* Knowledge Graph summary */}
        <div style={{ marginTop: '2rem' }}>
          <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', marginBottom: '1rem' }}>
            KNOWLEDGE GRAPH ENTITY COUNTS
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '0.5rem',
          }}>
            {[
              { label: 'PROB-xxx Problems', count: Object.keys(EDL_PROBLEMS).length },
              { label: 'TERM-xxx Terms', count: Object.keys(TERMINOLOGY_REGISTRY).length },
              { label: 'STD-xxx Standards', count: Object.keys(EDL_STANDARDS).length },
              { label: 'TECH-xxx Technologies', count: Object.keys(EDL_TECHNOLOGIES).length },
              { label: 'ARTICLE-xxx Articles', count: ENGINEERING_ARTICLES.length },
              { label: 'ERL Sections', count: ERL_SECTIONS.length },
            ].map((item) => (
              <div key={item.label} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '4px',
                padding: '0.75rem 1rem',
              }}>
                <p style={{ fontSize: '2rem', fontWeight: 700, color: '#FFF12D', fontFamily: 'Outfit, sans-serif', margin: 0 }}>
                  {item.count}
                </p>
                <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.25rem' }}>
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '3rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}>
          <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.04em' }}>
            KC-PLAN-002 v1.2 — Engineering Governance Dashboard — Internal Use Only
          </p>
        </div>
      </div>
    </main>
  );
}
