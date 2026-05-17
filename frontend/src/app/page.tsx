import { Navigation } from '@/components/Navigation';
import { Hero } from '@/components/Hero';
import { CategoryGrid } from '@/components/CategoryGrid';
import { TechShowcase } from '@/components/TechCard';
import { StatCounter } from '@/components/StatCounter';
import { CTASection } from '@/components/CTASection';
import { Footer } from '@/components/Footer';
import { catalogue } from '@/lib/catalogue';

const HOME_STATS = [
  { value: '99.9%', label: 'Filtration Efficiency' },
  { value: '500K+', label: 'Parts Cross-Referenced' },
  { value: '12', label: 'Industries Served' },
];

const PERF_STATS = [
  { value: '99.9%', label: 'Silica Retention' },
  { value: '100%', label: 'Bypass Prevention' },
  { value: '500K+', label: 'Parts in Database' },
  { value: '0%', label: 'Downtime Tolerance' },
];

export default function Home() {
  return (
    <>
      <Navigation />
      <main>
        {/* Hero */}
        <Hero
          title="TOTAL ENGINE"
          subtitle="PROTECTION."
          tagline="Industrial-grade filtration systems engineered for maximum performance under the harshest conditions. Zero compromise. Zero bypass."
          ctaText="FIND MY FILTER"
          ctaHref="https://part-search.elimfilters.com"
          backgroundImage="/images/fondomotor.PNG"
          stats={HOME_STATS}
        />

        {/* Industries Grid */}
        <CategoryGrid
          items={catalogue.industries}
          category="industries"
          title="12 INDUSTRY VERTICALS"
          description="Specialized filtration architectures engineered for every sector — from agriculture to offshore oil & gas."
        />

        {/* Stats Section */}
        <StatCounter
          stats={PERF_STATS}
          title="PERFORMANCE BY THE NUMBERS"
        />

        {/* Products Grid */}
        <CategoryGrid
          items={catalogue.products}
          category="products"
          title="12 PRODUCT SYSTEMS"
          description="Complete filtration product lines covering air, fuel, hydraulic, cabin, coolant, oil and more."
        />

        {/* Technology Showcase */}
        <TechShowcase technologies={catalogue.technologies} />

        {/* Brand Statement */}
        <section
          style={{
            padding: '8rem 2rem',
            background: '#000',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            textAlign: 'center',
          }}
        >
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.65rem',
                letterSpacing: '0.2em',
                color: 'rgba(255,241,45,0.5)',
                marginBottom: '2rem',
              }}
            >
              // ELIMFILTERS PHILOSOPHY
            </div>
            <blockquote
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 900,
                fontSize: 'clamp(1.8rem, 4vw, 3rem)',
                color: '#fff',
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
                marginBottom: '2rem',
              }}
            >
              &ldquo;THE MOST EXPENSIVE FILTER
              <br />
              IS THE ONE{' '}
              <span style={{ color: '#FFF12D' }}>THAT FAILS.</span>&rdquo;
            </blockquote>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '1rem',
                color: 'rgba(255,255,255,0.4)',
                lineHeight: 1.7,
                maxWidth: '560px',
                margin: '0 auto 3rem',
              }}
            >
              Every ELIMFILTERS product is engineered with the assumption that failure is not an option. German engineering discipline meets industrial necessity.
            </p>
            <div
              style={{
                display: 'flex',
                gap: '2rem',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              {[
                { label: 'ISO 5011', desc: 'Air Filtration' },
                { label: 'ISO 16332', desc: 'Fuel Systems' },
                { label: 'ISO 16889', desc: 'Hydraulic Systems' },
                { label: 'ISO 19438', desc: 'Oil Systems' },
              ].map((cert) => (
                <div
                  key={cert.label}
                  style={{
                    padding: '1rem 1.5rem',
                    border: '1px solid rgba(255,255,255,0.08)',
                    textAlign: 'center',
                    minWidth: '120px',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      color: '#FFF12D',
                      marginBottom: '0.25rem',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {cert.label}
                  </div>
                  <div
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.6rem',
                      letterSpacing: '0.08em',
                      color: 'rgba(255,255,255,0.3)',
                    }}
                  >
                    {cert.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <CTASection
          title="Find Your Filter Now"
          description="Cross-reference 500,000+ parts across every major OEM. Find the exact filter for your application in seconds."
          buttonText="FIND MY FILTER"
        />
      </main>
      <Footer />
    </>
  );
}
