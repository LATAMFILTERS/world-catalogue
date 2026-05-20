'use client';

import { useRef, useEffect } from 'react';
import { motion, useInView } from 'motion/react';
import { CatalogueItem, CATEGORY_LABELS, CATEGORY_URLS } from '@/lib/catalogue';
import { Hero } from './Hero';
import { FeatureList } from './FeatureList';
import { StatCounter } from './StatCounter';
import { CTASection } from './CTASection';
import { AnimateIn, StaggerContainer, itemVariants } from './AnimateIn';

interface CategoryPageProps {
  item: CatalogueItem;
  category: 'industries' | 'products' | 'technologies';
  industryImage?: string;
  industryVideo?: string;
  technologyLogo?: string;
}

function InlineVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const inView = useInView(ref, { once: false, margin: '-10%' });

  useEffect(() => {
    if (!ref.current) return;
    if (inView) {
      ref.current.play().catch(() => {});
    } else {
      ref.current.pause();
    }
  }, [inView]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        paddingBottom: '56.25%',
        height: 0,
        overflow: 'hidden',
        borderRadius: '12px',
        border: '1px solid rgba(255,241,45,0.2)',
      }}
    >
      <video
        ref={ref}
        playsInline
        muted
        loop
        preload="metadata"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      >
        <source src={src} type="video/mp4" />
      </video>
    </div>
  );
}

const CATEGORY_BG: Record<string, string> = {
  industries: '/images/elimfilters_back2.jpg',
  products: '/images/fondomotor.PNG',
  technologies: '/images/media-filtrante.png',
};

export function CategoryPage({ item, category, industryImage, industryVideo, technologyLogo }: CategoryPageProps) {
  const bgImage = CATEGORY_BG[category];
  const categoryLabel = CATEGORY_LABELS[category];

  // Determine button href based on CTA text
  let buttonHref = 'https://part-search.elimfilters.com';
  if (item.cta?.includes('MACROCORE')) {
    buttonHref = '/technologies/macrocore';
  } else if (item.cta?.includes('TECHNOLOGY')) {
    buttonHref = '/technologies';
  } else if (item.cta?.includes('SPECIFICATIONS')) {
    buttonHref = '#technical-specs';
  }

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
      <main>
        {/* Breadcrumb */}
        <div
          style={{
            position: 'relative',
            zIndex: 20,
            background: 'rgba(0,0,0,0.6)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            padding: '0.75rem 2rem',
          }}
        >
          <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <a
              href="/"
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.62rem',
                letterSpacing: '0.1em',
                color: 'rgba(255,255,255,0.4)',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#FFF12D')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
            >
              HOME
            </a>
            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.6rem' }}>→</span>
            <a
              href={CATEGORY_URLS[category]}
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.62rem',
                letterSpacing: '0.1em',
                color: 'rgba(255,255,255,0.4)',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#FFF12D')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
            >
              {categoryLabel.toUpperCase()}
            </a>
            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.6rem' }}>→</span>
            <span
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.62rem',
                letterSpacing: '0.1em',
                color: '#FFF12D',
              }}
            >
              {item.title}
            </span>
          </div>
        </div>

        {/* Hero */}
        <Hero
          title={item.title}
          subtitle={item.subtitle || undefined}
          tagline={item.description}
          ctaText={item.cta}
          backgroundImage={industryImage || bgImage}
          category={`// ${categoryLabel}_ENGINEERING`}
        />

        {/* Video Section */}
        {industryVideo && (
          <section
            style={{
              padding: '5rem 2rem',
              background: '#000',
              borderTop: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <div className="product-desc-grid" style={{ display: 'grid', gridTemplateColumns: '60% 40%', gap: '3rem', alignItems: 'center' }}>
                {/* Left: Description */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ width: '32px', height: '2px', background: '#FFF12D' }} />
                    <span
                      style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '0.6rem',
                        letterSpacing: '0.2em',
                        color: '#FFF12D',
                      }}
                    >
                      FILTRATION MEDIA IMPORTANCE
                    </span>
                  </div>
                  <h3
                    style={{
                      fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                      fontWeight: 700,
                      fontFamily: 'Space Grotesk, sans-serif',
                      color: 'rgba(255,255,255,0.75)',
                      marginBottom: '1.5rem',
                      lineHeight: 1.2,
                    }}
                  >
                    ENGINEERED PROTECTION
                  </h3>
                  <p
                    style={{
                      fontSize: '1rem',
                      lineHeight: 1.8,
                      color: 'rgba(255,255,255,0.8)',
                      fontFamily: 'Outfit, sans-serif',
                      marginBottom: '1rem',
                    }}
                  >
                    The filtration media is the heart of every ELIMFILTERS system. In {item.name} operations, specialized media must handle extreme conditions: constant stop-and-go cycles, urban pollution, soot accumulation, and thermal stress. Our proprietary hybrid media formulation combines synthetic and cellulose fibers engineered through AI algorithms to achieve maximum dirt capacity while maintaining zero bypass protection.
                  </p>
                  <p
                    style={{
                      fontSize: '0.95rem',
                      lineHeight: 1.8,
                      color: 'rgba(255,255,255,0.7)',
                      fontFamily: 'Outfit, sans-serif',
                    }}
                  >
                    Every micron matters. Our media technology ensures {item.name} fleets stay operational 24/7 with extended service intervals, reduced maintenance costs, and guaranteed engine protection against contamination failure.
                  </p>
                </div>

                {/* Right: Video */}
                <InlineVideo src={industryVideo} />
              </div>
            </div>
          </section>
        )}

        {/* Technology Logo Section */}
        {technologyLogo && (
          <section
            style={{
              padding: '6rem 2rem',
              background: 'linear-gradient(135deg, rgba(255,241,45,0.08) 0%, rgba(0,0,0,0.5) 100%)',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <div style={{ maxWidth: '400px' }}>
              <img
                src={technologyLogo}
                alt={`${item.name} Logo`}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                }}
              />
            </div>
          </section>
        )}

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
            <AnimateIn direction="up">
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
            </AnimateIn>

            <AnimateIn direction="up" delay={0.15}>
              <FeatureList features={item.features} title="Core Capabilities" />
            </AnimateIn>
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
            <AnimateIn direction="up">
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
            </AnimateIn>

            {/* Specs Card */}
            <AnimateIn direction="up" delay={0.15}>
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

                <StaggerContainer style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {item.features.map((feature, i) => (
                    <motion.div
                      key={i}
                      variants={itemVariants}
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
                    </motion.div>
                  ))}
                </StaggerContainer>
              </div>
            </AnimateIn>
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
            <AnimateIn direction="up">
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
                  OPERATIONAL ADVANTAGES
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
                WHY ELIMFILTERS
              </h2>
              <StaggerContainer style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  'Extended service intervals reduce downtime',
                  'Superior contamination retention extends asset life',
                  'German engineering precision and reliability',
                  'Cost-effective protection across all duty cycles',
                  'Proven performance in extreme environments',
                  'Industry-leading filtration efficiency',
                ].map((benefit, i) => (
                  <motion.div key={i} variants={itemVariants} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <span
                      style={{
                        color: '#FFF12D',
                        fontWeight: 'bold',
                        marginTop: '0.2rem',
                      }}
                    >
                      ✓
                    </span>
                    <span
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '0.9rem',
                        color: 'rgba(255,255,255,0.8)',
                        lineHeight: 1.6,
                      }}
                    >
                      {benefit}
                    </span>
                  </motion.div>
                ))}
              </StaggerContainer>
            </AnimateIn>

            {/* Technologies card */}
            <AnimateIn direction="up" delay={0.15}>
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
            </AnimateIn>
          </div>
        </section>

        {/* Technical Specifications - Macrocore */}
        {item.name === 'Macrocore' && (
          <section
            id="technical-specs"
            style={{
              padding: '6rem 2rem',
              background: 'linear-gradient(135deg, rgba(255,241,45,0.05) 0%, rgba(0,0,0,0.3) 100%)',
              borderTop: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
              <div style={{ marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '32px', height: '2px', background: '#FFF12D' }} />
                <h2
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    letterSpacing: '0.2em',
                    color: '#FFF12D',
                    fontFamily: 'JetBrains Mono, monospace',
                    margin: 0,
                  }}
                >
                  TECHNICAL SPECIFICATIONS
                </h2>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '2rem',
                }}
              >
                <div style={{ border: '1px solid rgba(255,241,45,0.2)', padding: '2rem', borderRadius: '8px' }}>
                  <h3 style={{ color: '#FFF12D', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 700 }}>
                    FILTRATION EFFICIENCY
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                    99.9% - 99.98% efficiency per ISO 5011 industrial standards. Progressive Density Gradient matrix
                    captures macro-contaminants on external layers while sub-micron particles are detained internally.
                  </p>
                </div>

                <div style={{ border: '1px solid rgba(255,241,45,0.2)', padding: '2rem', borderRadius: '8px' }}>
                  <h3 style={{ color: '#FFF12D', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 700 }}>
                    PRESSURE RATING & STABILITY
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                    62 PSI anti-collapse rated construction. Prevents blind pleating and structural degradation under
                    flow pulsations. Engineered equidistant pleating geometry maintains effective filtration area.
                  </p>
                </div>

                <div style={{ border: '1px solid rgba(255,241,45,0.2)', padding: '2rem', borderRadius: '8px' }}>
                  <h3 style={{ color: '#FFF12D', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 700 }}>
                    THERMAL PERFORMANCE
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                    Continuous operation rated to 120°C. High-purity cellulose fibers reinforced with synthetic resins
                    guarantee structural stability under humidity and thermal cycling in heavy-duty applications.
                  </p>
                </div>

                <div style={{ border: '1px solid rgba(255,241,45,0.2)', padding: '2rem', borderRadius: '8px' }}>
                  <h3 style={{ color: '#FFF12D', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 700 }}>
                    CAPTURE MECHANISM
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                    Multi-mode capture: interception, inertial impact, and diffusion. Macro-contaminants lodge in
                    external layers; sub-micron contaminants trapped in internal matrix. Zero bypass technology.
                  </p>
                </div>

                <div style={{ border: '1px solid rgba(255,241,45,0.2)', padding: '2rem', borderRadius: '8px' }}>
                  <h3 style={{ color: '#FFF12D', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 700 }}>
                    INDUSTRIAL APPLICATIONS
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                    On-road vehicles, mining equipment, agricultural machinery, stationary power generation, industrial
                    compressors, and heavy construction equipment. Optimized for every motor type.
                  </p>
                </div>

                <div style={{ border: '1px solid rgba(255,241,45,0.2)', padding: '2rem', borderRadius: '8px' }}>
                  <h3 style={{ color: '#FFF12D', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 700 }}>
                    REGULATORY COMPLIANCE
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                    ISO 5011 (Filtration Efficiency), SAE J726 (DHC - Dust Holding Capacity), ASTM D202 (Thermal
                    Resistance). Meets international standards for heavy-duty industrial filtration.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <CTASection
          title="Ready to Upgrade?"
          description={`Find the exact ${categoryLabel.toLowerCase()} filter for your application. Cross-reference 500,000+ parts.`}
          buttonText={item.cta}
          buttonHref={buttonHref}
        />
      </main>
    </>
  );
}
