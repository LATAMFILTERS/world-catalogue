import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Engineering Datasets — ELIMFILTERS Knowledge Center',
  description: 'Downloadable engineering datasets for industrial filtration: ISO 4406 Range Number table, ISO 16889 Beta ratio to efficiency conversion, ISO 8573-1 compressed air purity classes, and component clearance data.',
  alternates: { canonical: 'https://elimfilters.com/knowledge-center/datasets/' },
};

const DATASETS = [
  {
    id: 'iso-4406-range-numbers',
    title: 'ISO 4406 Range Number Table',
    subtitle: 'Particle count brackets for all 24 Range Numbers per ISO 4406:2021',
    description: 'Complete Range Number (RN) to particle count per millilitre conversion table with component-specific cleanliness targets (servo valve, piston pump, gear pump, engine bearing). Essential for interpreting oil analysis reports and setting filtration specifications.',
    governingStandard: 'ISO 4406:2021',
    category: 'Fluid Cleanliness',
    rows: 24,
    formats: ['json', 'csv'],
  },
  {
    id: 'beta-ratio-efficiency',
    title: 'Beta Ratio to Filtration Efficiency Conversion',
    subtitle: 'ISO 16889 β_x(c) values and their equivalent single-pass efficiency percentages',
    description: 'Conversion table from ISO 16889:2022 Beta ratio β_x(c) to filtration efficiency percentage, including typical application specifications for servo valve circuits (β₃(c) ≥ 200), proportional valve circuits (β₆(c) ≥ 75), mobile hydraulic systems, and kidney-loop polishing filters.',
    governingStandard: 'ISO 16889:2022',
    category: 'Filter Performance',
    rows: 16,
    formats: ['json', 'csv'],
  },
  {
    id: 'iso-8573-1-compressed-air-classes',
    title: 'ISO 8573-1 Compressed Air Purity Classes',
    subtitle: 'Particle, water (dew point), and oil content limits for Classes 0–X',
    description: 'Complete ISO 8573-1:2010 purity class table for compressed air quality — solid particle concentration by size band, pressure dew point by class, and total oil aerosol limits. Includes typical application specifications for food, pharmaceutical, painting, instrument air, and mining pneumatic systems.',
    governingStandard: 'ISO 8573-1:2010',
    category: 'Compressed Air',
    rows: 6,
    formats: ['json', 'csv'],
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  'Fluid Cleanliness': '#FFF12D',
  'Filter Performance': '#44aaff',
  'Compressed Air':    '#44ff88',
};

export default function DatasetsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DataCatalog',
    name: 'ELIMFILTERS Engineering Datasets',
    description: 'Downloadable engineering reference datasets for industrial filtration: ISO 4406 particle count codes, ISO 16889 Beta ratio, ISO 8573-1 compressed air classes.',
    url: 'https://elimfilters.com/knowledge-center/datasets',
    publisher: {
      '@type': 'Organization',
      '@id': 'https://elimfilters.com/#organization',
      name: 'ELIMFILTERS',
    },
    dataset: DATASETS.map((d) => ({
      '@type': 'Dataset',
      name: d.title,
      description: d.description,
      url: `https://elimfilters.com/datasets/${d.id}.json`,
      creator: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
      license: 'https://creativecommons.org/licenses/by/4.0/',
      citation: d.governingStandard,
    })),
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Knowledge Center', item: 'https://elimfilters.com/knowledge-center' },
      { '@type': 'ListItem', position: 2, name: 'Datasets', item: 'https://elimfilters.com/knowledge-center/datasets' },
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
        <span style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.65rem',
          color: 'rgba(255,255,255,0.35)',
        }}>
          DATASETS
        </span>
      </div>

      {/* Hero */}
      <section style={{ padding: '3.5rem 2rem 3rem', maxWidth: '1100px', margin: '0 auto' }}>
        <p style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.6rem',
          letterSpacing: '0.1em',
          color: 'rgba(255,241,45,0.5)',
          marginBottom: '0.75rem',
        }}>
          ENGINEERING DATASETS · OPEN ACCESS
        </p>
        <h1 style={{
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 700,
          fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
          color: '#fff',
          lineHeight: 1.1,
          marginBottom: '1rem',
        }}>
          Filtration Engineering Reference Datasets
        </h1>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.93rem',
          lineHeight: 1.8,
          color: 'rgba(255,255,255,0.55)',
          maxWidth: '820px',
        }}>
          Downloadable datasets derived from ISO, ASTM, and SAE engineering standards. Available in JSON and CSV formats for use in fluid analysis software, maintenance management systems, and engineering calculations. All data is traceable to the governing standard cited for each dataset.
        </p>
        <div style={{
          display: 'inline-block',
          marginTop: '1.25rem',
          padding: '0.5rem 0.875rem',
          border: '1px solid rgba(255,241,45,0.2)',
          background: 'rgba(255,241,45,0.04)',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.65rem',
          letterSpacing: '0.08em',
          color: 'rgba(255,241,45,0.6)',
        }}>
          CC BY 4.0 · Free to use with attribution · Data traceable to governing standards
        </div>
      </section>

      {/* Datasets */}
      <section style={{ padding: '0 2rem 6rem', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {DATASETS.map((dataset) => (
            <div key={dataset.id} style={{
              border: '1px solid rgba(255,255,255,0.07)',
              background: 'rgba(255,255,255,0.015)',
            }}>
              <div style={{ padding: '1.5rem 1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.55rem',
                    letterSpacing: '0.08em',
                    color: CATEGORY_COLORS[dataset.category] ?? '#fff',
                    border: `1px solid ${CATEGORY_COLORS[dataset.category] ?? '#fff'}30`,
                    padding: '0.15rem 0.45rem',
                    background: `${CATEGORY_COLORS[dataset.category] ?? '#fff'}08`,
                  }}>
                    {dataset.category.toUpperCase()}
                  </span>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.55rem',
                    color: 'rgba(255,255,255,0.25)',
                  }}>
                    {dataset.rows} rows · {dataset.formats.join(', ').toUpperCase()}
                  </span>
                </div>

                <h2 style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  color: '#fff',
                  marginBottom: '0.3rem',
                  lineHeight: 1.2,
                }}>
                  {dataset.title}
                </h2>
                <p style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.8rem',
                  color: 'rgba(255,241,45,0.55)',
                  marginBottom: '0.75rem',
                }}>
                  {dataset.subtitle}
                </p>
                <p style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.88rem',
                  lineHeight: 1.75,
                  color: 'rgba(255,255,255,0.55)',
                  marginBottom: '1.25rem',
                }}>
                  {dataset.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.62rem',
                    color: 'rgba(255,255,255,0.3)',
                    marginRight: '0.25rem',
                  }}>
                    GOVERNING: {dataset.governingStandard}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                  <a
                    href={`/datasets/${dataset.id}.json`}
                    download
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.65rem',
                      letterSpacing: '0.08em',
                      color: '#FFF12D',
                      border: '1px solid rgba(255,241,45,0.3)',
                      background: 'rgba(255,241,45,0.04)',
                      padding: '0.45rem 0.875rem',
                      textDecoration: 'none',
                      transition: 'all 0.2s',
                    }}
                  >
                    ↓ DOWNLOAD JSON
                  </a>
                  <a
                    href={`/datasets/${dataset.id}.csv`}
                    download
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.65rem',
                      letterSpacing: '0.08em',
                      color: 'rgba(255,255,255,0.5)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      background: 'rgba(255,255,255,0.025)',
                      padding: '0.45rem 0.875rem',
                      textDecoration: 'none',
                      transition: 'all 0.2s',
                    }}
                  >
                    ↓ DOWNLOAD CSV
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: '3rem',
          padding: '1.25rem 1.5rem',
          border: '1px solid rgba(255,255,255,0.05)',
          borderLeft: '2px solid rgba(255,255,255,0.15)',
        }}>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.3)',
            marginBottom: '0.5rem',
          }}>
            DATASET INTEGRITY
          </p>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.85rem',
            lineHeight: 1.75,
            color: 'rgba(255,255,255,0.45)',
          }}>
            All datasets are compiled directly from the governing standard text. No extrapolation, no interpolation beyond values stated in the standard. Range boundary values are as defined in the original published standard. If a value appears to differ from another published source, verify against the primary standard document — ELIMFILTERS does not modify published standard data.
          </p>
        </div>
      </section>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
    </main>
  );
}
