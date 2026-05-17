'use client';

import { CatalogueItem, CATEGORY_LABELS } from '@/lib/catalogue';
import { Navigation } from './Navigation';
import { Hero } from './Hero';
import { FeatureList } from './FeatureList';
import { StatCounter } from './StatCounter';
import { CTASection } from './CTASection';
import { Footer } from './Footer';

interface CategoryPageProps {
  item: CatalogueItem;
  category: 'industries' | 'products' | 'technologies';
}

const CATEGORY_BG: Record<string, string> = {
  industries: '/images/elimfilters_back2.jpg',
  products: '/images/fondomotor.PNG',
  technologies: '/images/media-filtrante.png',
};

export function CategoryPage({ item, category }: CategoryPageProps) {
  const bgImage = CATEGORY_BG[category];
  const categoryLabel = CATEGORY_LABELS[category];

  // Build stats from item.stats
  const stats: { value: string; label: string }[] = [];
  if (item.stats.percentages) {
    const labels = ['Efficiency', 'Retention', 'Uptime', 'Performance'];
    item.stats.percentages.forEach((p, i) => {
      stats.push({ value: p, label: labels[i] || `Metric ${i + 1}` });
    });
  }
  if (item.stats.ratings) {
    const labels = ['Rating', 'Standard', 'Spec', 'Class'];
    item.stats.ratings.forEach((r, i) => {
      stats.push({ value: r, label: labels[i] || `Rating ${i + 1}` });
    });
  }

  return (
    <>
      <Navigation />
      <main>
        {/* Hero */}
        <Hero
          title={item.title}
          subtitle={item.subtitle || undefined}
          tagline={item.description}
          ctaText={item.cta}
          backgroundImage={bgImage}
          category={`// ${categoryLabel}_ENGINEERING`}
        />

        {/* Key Advantages */}
        <section
          id="features"
          style={{
            padding: '6rem 0',
            background: '#000',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '0 2rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '4rem',
              alignItems: 'start',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ width: '32px', height: '2px', background: '#FFF12D' }} />
                <span
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.6rem',
                    letterSpacing: '0.2em',
                    color: '#FFF12D',
                  }}
                >
                  KEY ADVANTAGES
                </span>
              </div>
              <h2
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 900,
                  fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
                  color: '#fff',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.1,
                  marginBottom: '2rem',
                }}
              >
                ENGINEERED
                <br />
                <span style={{ color: '#FFF12D' }}>ADVANTAGES</span>
              </h2>
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.9rem',
                  color: 'rgba(255,255,255,0.5)',
                  lineHeight: 1.7,
                  maxWidth: '420px',
                }}
              >
                {item.description}
              </p>
            </div>

            <div>
              <FeatureList features={item.features} title="Core Capabilities" />
            </div>
          </div>
        </section>

        {/* Engineering Excellence */}
        <section
          style={{
            padding: '6rem 0',
            background: '#050505',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '0 2rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '4rem',
              alignItems: 'start',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ width: '32px', height: '2px', background: '#FFF12D' }} />
                <span
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.6rem',
                    letterSpacing: '0.2em',
                    color: '#FFF12D',
                  }}
                >
                  ENGINEERING EXCELLENCE
                </span>
              </div>
              <h2
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 900,
                  fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
                  color: '#fff',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.1,
                  marginBottom: '1.5rem',
                }}
              >
                PRECISION
                <br />
                <span style={{ color: '#FFF12D' }}>ENGINEERING</span>
              </h2>
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.9rem',
                  color: 'rgba(255,255,255,0.5)',
                  lineHeight: 1.8,
                }}
              >
                ELIMFILTERS engineering applies German-grade quality standards to every component. Our filtration systems are designed to exceed OEM specifications, ensuring maximum protection and performance across demanding duty cycles.
              </p>
            </div>

            {/* Specs Card */}
            <div
              style={{
                background: '#000',
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '2rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#FFF12D',
                    boxShadow: '0 0 8px rgba(255,241,45,0.6)',
                  }}
                />
                <span
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.65rem',
                    letterSpacing: '0.15em',
                    color: 'rgba(255,255,255,0.5)',
                  }}
                >
                  SYSTEM SPECIFICATIONS
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {item.features.map((feature, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem 0',
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '0.82rem',
                        color: 'rgba(255,255,255,0.5)',
                      }}
                    >
                      {feature}
                    </span>
                    <span
                      style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '0.7rem',
                        color: '#FFF12D',
                        letterSpacing: '0.05em',
                      }}
                    >
                      ✓ ACTIVE
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        {stats.length > 0 && (
          <StatCounter
            stats={stats}
            title="PERFORMANCE METRICS"
          />
        )}

        {/* Recommended Applications */}
        <section
          style={{
            padding: '6rem 0',
            background: '#000',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '0 2rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '4rem',
              alignItems: 'start',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ width: '32px', height: '2px', background: '#FFF12D' }} />
                <span
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.6rem',
                    letterSpacing: '0.2em',
                    color: '#FFF12D',
                  }}
                >
                  RECOMMENDED APPLICATIONS
                </span>
              </div>
              <h2
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 900,
                  fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                  color: '#fff',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.1,
                  marginBottom: '2rem',
                }}
              >
                PRIMARY USE CASES
              </h2>
              <FeatureList features={item.features} />
            </div>

            {/* Technologies card */}
            <div
              style={{
                background: '#050505',
                border: '1px solid rgba(255,255,255,0.07)',
                padding: '2rem',
              }}
            >
              <h3
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  letterSpacing: '0.15em',
                  color: 'rgba(255,255,255,0.35)',
                  textTransform: 'uppercase',
                  marginBottom: '1.5rem',
                }}
              >
                Technologies Included
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {['SYNTRAX™', 'NANOFORCE™', 'AQUAGUARD™', 'MACROCORE™', 'SYNTEPORE™', 'INTEKCORE™'].map((tech) => (
                  <span
                    key={tech}
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.62rem',
                      letterSpacing: '0.05em',
                      padding: '0.3rem 0.7rem',
                      border: '1px solid rgba(255,241,45,0.25)',
                      color: 'rgba(255,241,45,0.75)',
                      background: 'rgba(255,241,45,0.04)',
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Quote */}
              <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.85rem',
                    color: 'rgba(255,255,255,0.4)',
                    lineHeight: 1.7,
                    fontStyle: 'italic',
                  }}
                >
                  &ldquo;The most expensive filter is the one that fails — ELIMFILTERS engineering ensures it never does.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <CTASection
          title="Ready to Upgrade?"
          description={`Find the exact ${categoryLabel.toLowerCase()} filter for your application. Cross-reference 500,000+ parts.`}
          buttonText={item.cta}
        />
      </main>
      <Footer />
    </>
  );
}
