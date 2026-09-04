import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'GEO Readiness Report — ELIMFILTERS Knowledge Center',
  description: 'Generative Engine Optimization audit of the ELIMFILTERS Knowledge Center. Tracks JSON-LD schema coverage, EEAT metadata, FAQ population, structured dataset availability, and AI citation readiness across all KC entities.',
  alternates: { canonical: 'https://elimfilters.com/knowledge-center/geo-report/' },
};

const SCHEMA_COVERAGE = [
  { entity: 'Engineering Articles',     total: 53, jsonLd: 'TechArticle',       faqPage: true,  breadcrumb: true,  howTo: true,  learningResource: false, dataset: false, eeat: true  },
  { entity: 'Standards',                total: 22, jsonLd: 'TechArticle',       faqPage: true,  breadcrumb: true,  howTo: false, learningResource: false, dataset: false, eeat: false },
  { entity: 'Glossary Terms',           total: 68, jsonLd: 'DefinedTerm',       faqPage: false, breadcrumb: true,  howTo: false, learningResource: false, dataset: false, eeat: false },
  { entity: 'Learning Paths',           total: 5,  jsonLd: 'LearningResource',  faqPage: false, breadcrumb: true,  howTo: false, learningResource: true,  dataset: false, eeat: false },
  { entity: 'Diagrams',                 total: 15, jsonLd: 'Photograph',        faqPage: false, breadcrumb: false, howTo: false, learningResource: false, dataset: false, eeat: false },
  { entity: 'Calculators',              total: 7,  jsonLd: 'SoftwareApplication',faqPage: false, breadcrumb: false, howTo: false, learningResource: false, dataset: false, eeat: false },
  { entity: 'Comparisons',              total: 10, jsonLd: 'Article',           faqPage: false, breadcrumb: false, howTo: false, learningResource: false, dataset: false, eeat: false },
  { entity: 'Datasets',                 total: 3,  jsonLd: 'Dataset',           faqPage: false, breadcrumb: true,  howTo: false, learningResource: false, dataset: true,  eeat: false },
];

const GEO_SIGNALS = [
  { signal: 'Organization @id schema',              status: 'complete', detail: 'https://elimfilters.com/#organization — emitted in KC layout.tsx for all child pages', since: 'Phase 6E' },
  { signal: 'WebSite + SearchAction JSON-LD',        status: 'complete', detail: 'WebSite schema with SearchAction on /knowledge-center hub, enabling Sitelinks search box in Google', since: 'Phase 6G' },
  { signal: 'TechArticle JSON-LD (53 articles)',     status: 'complete', detail: 'All 53 engineering articles emit TechArticle with headline, description, author, publisher, keywords', since: 'Phase 4' },
  { signal: 'DefinedTerm JSON-LD (68 terms)',        status: 'complete', detail: 'All glossary terms emit DefinedTerm with name, description, inDefinedTermSet, url', since: 'Phase 5' },
  { signal: 'LearningResource JSON-LD (5 paths)',    status: 'complete', detail: 'All learning paths emit LearningResource + BreadcrumbList', since: 'Phase 6G' },
  { signal: 'FAQPage JSON-LD (all 53 articles)',     status: 'complete', detail: '53/53 articles have 10 FAQs each — FAQPage JSON-LD emitted conditionally', since: 'Phase 6G' },
  { signal: 'FAQPage JSON-LD (all 22 standards)',    status: 'complete', detail: '22/22 standards have 10 FAQs each — FAQPage JSON-LD emitted via StandardContent.tsx', since: 'Phase 6G' },
  { signal: 'HowTo JSON-LD (procedural articles)',   status: 'complete', detail: '2 procedural articles (hydraulic-system-flushing, fleet-oil-sampling-protocol) have full HowTo JSON-LD with supply/tool/steps arrays', since: 'Phase 6G' },
  { signal: 'BreadcrumbList JSON-LD (all pages)',    status: 'complete', detail: 'Articles (53), standards (22), glossary (68), KC hub — all emit BreadcrumbList', since: 'Phase 6G' },
  { signal: 'Dataset JSON-LD',                       status: 'complete', detail: '3 datasets with DataCatalog + Dataset schema on /knowledge-center/datasets, CC BY 4.0', since: 'Phase 6G' },
  { signal: 'EEAT Metadata Panel (all articles)',    status: 'complete', detail: '53/53 articles have EEAT: reviewer, discipline, standards, contentLevel, version, lastReviewDate', since: 'Phase 6G' },
  { signal: 'Engineering References (all articles)', status: 'complete', detail: '53/53 articles have 3–5 category-tagged formal citations', since: 'Phase 6G' },
  { signal: 'Engineering Decision Guides',           status: 'partial',  detail: '2 articles with interactive decision trees (contamination-control, hydraulic-contamination-sensitivity). Renderer supports unlimited articles.', since: 'Phase 6G' },
  { signal: 'Downloadable datasets (/datasets/)',    status: 'complete', detail: '3 datasets in JSON + CSV: ISO 4406 RN table, Beta ratio efficiency, ISO 8573-1 classes', since: 'Phase 6G' },
  { signal: 'Product ↔ KC integration',             status: 'pending',  detail: 'Engineering Resources section on /families/[slug] pages not yet implemented', since: '' },
];

const AI_CITE_CHECKLIST = [
  { item: 'Canonical @id for ELIMFILTERS as named entity',              done: true  },
  { item: 'TechArticle headline + description on all 53 articles',      done: true  },
  { item: 'DefinedTerm schema on all 68 glossary terms',               done: true  },
  { item: 'LearningResource on all 5 learning paths',                  done: true  },
  { item: 'FAQPage on all 53 articles (10 per article)',                done: true  },
  { item: 'FAQPage on all 22 standards (10 per standard)',              done: true  },
  { item: 'HowTo on procedural articles (2 of 6 target)',               done: true  },
  { item: 'BreadcrumbList on all engineering article pages',            done: true  },
  { item: 'BreadcrumbList on all standards pages (22)',                 done: true  },
  { item: 'BreadcrumbList on all glossary term pages (68)',             done: true  },
  { item: 'Dataset schema with downloadable open-format files',         done: true  },
  { item: 'EEAT visible metadata on all 53 articles',                   done: true  },
  { item: 'Engineering References with category tagging on all articles',done: true  },
  { item: 'Authoritative ISO standard citations in every section',      done: true  },
  { item: 'WebSite + SearchAction schema on KC hub',                    done: true  },
  { item: 'Decision Guides on 10 articles',                             done: false },
  { item: 'HowTo on 6 procedural articles',                             done: false },
  { item: 'Product ↔ KC links from /families/[slug]',                  done: false },
];

const doneCount = AI_CITE_CHECKLIST.filter((i) => i.done).length;
const totalCount = AI_CITE_CHECKLIST.length;

const STATUS_COLOR: Record<string, string> = {
  complete: '#44ff88',
  partial:  '#FFF12D',
  pending:  '#ff8c00',
};

export default function GeoReportPage() {
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Knowledge Center', item: 'https://elimfilters.com/knowledge-center' },
      { '@type': 'ListItem', position: 2, name: 'GEO Report', item: 'https://elimfilters.com/knowledge-center/geo-report' },
    ],
  };

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

      {/* Breadcrumb */}
      <div style={{ padding: '1.5rem 2rem 0', maxWidth: '1100px', margin: '0 auto' }}>
        <Link href="/knowledge-center" style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.65rem',
          letterSpacing: '0.1em',
          color: 'rgba(255,241,45,0.4)',
          textDecoration: 'none',
        }}>
          KNOWLEDGE CENTER
        </Link>
        <span style={{ color: 'rgba(255,255,255,0.2)', margin: '0 0.5rem', fontSize: '0.65rem' }}>/</span>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)' }}>
          GEO READINESS REPORT
        </span>
      </div>

      {/* Hero */}
      <section style={{ padding: '3.5rem 2rem 3rem', maxWidth: '860px', margin: '0 auto' }}>
        <p style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.6rem',
          letterSpacing: '0.1em',
          color: 'rgba(255,241,45,0.5)',
          marginBottom: '0.75rem',
        }}>
          GENERATIVE ENGINE OPTIMIZATION · AUDIT REPORT · 2026-07-10
        </p>
        <h1 style={{
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 700,
          fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
          color: '#fff',
          lineHeight: 1.1,
          marginBottom: '1rem',
        }}>
          Knowledge Center GEO Readiness Report
        </h1>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.93rem',
          lineHeight: 1.8,
          color: 'rgba(255,255,255,0.55)',
          maxWidth: '700px',
        }}>
          This report tracks the ELIMFILTERS Knowledge Center&apos;s readiness for AI citation by generative engines (ChatGPT, Perplexity, Gemini, Claude, Google AI Overviews). It audits JSON-LD schema coverage, EEAT metadata, FAQ population, structured dataset availability, and the completeness of machine-readable engineering content across all KC entity types.
        </p>

        {/* Summary score */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '1px',
          background: 'rgba(255,241,45,0.08)',
          border: '1px solid rgba(255,241,45,0.1)',
          marginTop: '2rem',
        }}>
          <div style={{ background: '#000', padding: '1rem 1.25rem' }}>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '1.1rem', color: '#FFF12D' }}>
              {doneCount}/{totalCount}
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.15rem' }}>
              AI-citation signals complete
            </p>
          </div>
          <div style={{ background: '#000', padding: '1rem 1.25rem' }}>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '1.1rem', color: '#44ff88' }}>
              53
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.15rem' }}>
              Engineering articles
            </p>
          </div>
          <div style={{ background: '#000', padding: '1rem 1.25rem' }}>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '1.1rem', color: '#44ff88' }}>
              68
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.15rem' }}>
              Glossary terms with DefinedTerm schema
            </p>
          </div>
          <div style={{ background: '#000', padding: '1rem 1.25rem' }}>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '1.1rem', color: '#44aaff' }}>
              3
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.15rem' }}>
              Downloadable datasets (JSON + CSV)
            </p>
          </div>
        </div>
      </section>

      {/* GEO Signals */}
      <section style={{ padding: '0 2rem 3rem', maxWidth: '860px', margin: '0 auto' }}>
        <p style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.6rem',
          letterSpacing: '0.1em',
          color: 'rgba(255,255,255,0.3)',
          marginBottom: '1rem',
        }}>
          GEO SIGNAL COVERAGE
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(255,255,255,0.04)' }}>
          {GEO_SIGNALS.map((sig, i) => (
            <div key={i} style={{
              background: '#000',
              padding: '0.875rem 1.25rem',
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-start',
            }}>
              <div style={{
                minWidth: '6rem',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.6rem',
                letterSpacing: '0.06em',
                color: STATUS_COLOR[sig.status],
                paddingTop: '0.05rem',
              }}>
                {sig.status.toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: '0.85rem',
                  color: '#fff',
                  marginBottom: '0.2rem',
                }}>
                  {sig.signal}
                </p>
                <p style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.78rem',
                  color: 'rgba(255,255,255,0.38)',
                  lineHeight: 1.55,
                }}>
                  {sig.detail}
                </p>
              </div>
              {sig.since && (
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.55rem',
                  color: 'rgba(255,255,255,0.2)',
                  whiteSpace: 'nowrap',
                  paddingTop: '0.1rem',
                }}>
                  {sig.since}
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Schema coverage table */}
      <section style={{ padding: '0 2rem 3rem', maxWidth: '1000px', margin: '0 auto' }}>
        <p style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.6rem',
          letterSpacing: '0.1em',
          color: 'rgba(255,255,255,0.3)',
          marginBottom: '1rem',
        }}>
          JSON-LD SCHEMA COVERAGE BY ENTITY TYPE
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.8rem',
          }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {['Entity', 'Count', 'Primary Schema', 'FAQPage', 'BreadcrumbList', 'HowTo', 'LearningResource', 'Dataset', 'EEAT'].map((h) => (
                  <th key={h} style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.55rem',
                    letterSpacing: '0.08em',
                    color: 'rgba(255,255,255,0.3)',
                    textAlign: 'left',
                    padding: '0.5rem 0.75rem',
                    whiteSpace: 'nowrap',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SCHEMA_COVERAGE.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '0.6rem 0.75rem', color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap' }}>{row.entity}</td>
                  <td style={{ padding: '0.6rem 0.75rem', color: 'rgba(255,241,45,0.6)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem' }}>{row.total}</td>
                  <td style={{ padding: '0.6rem 0.75rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem' }}>{row.jsonLd}</td>
                  {[row.faqPage, row.breadcrumb, row.howTo, row.learningResource, row.dataset, row.eeat].map((v, j) => (
                    <td key={j} style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>
                      <span style={{ color: v ? '#44ff88' : 'rgba(255,255,255,0.15)', fontSize: '0.9rem' }}>
                        {v ? '✓' : '–'}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* AI citation checklist */}
      <section style={{ padding: '0 2rem 6rem', maxWidth: '860px', margin: '0 auto' }}>
        <p style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.6rem',
          letterSpacing: '0.1em',
          color: 'rgba(255,255,255,0.3)',
          marginBottom: '1rem',
        }}>
          AI CITATION READINESS CHECKLIST
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {AI_CITE_CHECKLIST.map((item, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              padding: '0.6rem 0.875rem',
              background: item.done ? 'rgba(68,255,136,0.03)' : 'rgba(255,255,255,0.015)',
              border: `1px solid ${item.done ? 'rgba(68,255,136,0.1)' : 'rgba(255,255,255,0.05)'}`,
            }}>
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.75rem',
                color: item.done ? '#44ff88' : 'rgba(255,255,255,0.2)',
                minWidth: '1rem',
                lineHeight: 1.5,
              }}>
                {item.done ? '✓' : '○'}
              </span>
              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.85rem',
                color: item.done ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.35)',
                margin: 0,
                lineHeight: 1.5,
              }}>
                {item.item}
              </p>
            </div>
          ))}
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
    </main>
  );
}
