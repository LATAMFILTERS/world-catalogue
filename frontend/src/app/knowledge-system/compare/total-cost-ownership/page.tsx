'use client';

import Link from 'next/link';

import { motion } from 'motion/react';

export default function TCOPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

      <Link href="/knowledge-system/compare"
        className="back-nav-btn" style={{
        position: 'fixed', top: '1rem', right: '1.5rem', zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,241,45,0.35)',
        borderRadius: '4px', padding: '0.45rem 1rem',
        fontFamily: 'Titillium Web, sans-serif', fontWeight: 700, fontSize: '0.72rem',
        letterSpacing: '0.12em', color: '#FFF12D', textDecoration: 'none',
        backdropFilter: 'blur(8px)',
      }}>← COMPARISON</Link>

      {/* Hero Section */}
      <section style={{
        paddingTop: '5rem',
        paddingBottom: '5rem',
        background: 'linear-gradient(135deg, rgba(255,241,45,0.08) 0%, rgba(0,0,0,0.3) 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <motion.h1
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 900,
              fontFamily: 'Titillium Web, sans-serif',
              marginBottom: '1.5rem',
              lineHeight: 1.1,
              textAlign: 'justify',
              color: 'rgba(255,255,255,0.9)',
            }}
          >
            Total Cost of Ownership
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.1rem)',
              lineHeight: 1.7,
              textAlign: 'justify',
              color: 'rgba(255,255,255,0.75)',
              fontFamily: 'Titillium Web, sans-serif',
              maxWidth: '700px',
              borderLeft: '3px solid #FFF12D',
              paddingLeft: '1.25rem',
            }}
          >
            Why system-level filtration economics eliminate preventable equipment costs.
          </motion.p>
        </div>
      </section>

      {/* Content Sections */}
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '4rem 2rem' }}>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{ marginBottom: '4rem' }}
        >

          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
            fontWeight: 700,
            fontFamily: 'Titillium Web, sans-serif',
            marginBottom: '1.5rem',
            lineHeight: 1.2,
            textAlign: 'justify',
          }}>
            Purchase Price vs Operating Reality
          </h2>
          <p style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            textAlign: 'justify',
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '1rem',
          }}>
            Commodity filtration purchasing focuses on per-unit filter cost. A Donaldson, Fleetguard, or Mann filter might cost $35-$75 depending on type. Aftermarket alternatives cost $15-$35. Price competition drives purchasing decisions.
          </p>
          <p style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            textAlign: 'justify',
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '1rem',
          }}>
            But total cost of ownership includes hidden costs that commodity pricing completely ignores. The foundations of a sound TCO model are explained through the lens of <Link href="/knowledge-system/bridges/industrial-filtration" style={{ color: '#FFF12D', textDecoration: 'underline' }}>industrial filtration system design</Link>, where contamination control is treated as an engineering measurable rather than a procurement variable:
          </p>
          <div style={{
            background: 'rgba(255,0,0,0.08)',
            border: '1px solid rgba(255,0,0,0.15)',
            borderRadius: '8px',
            padding: '1.5rem',
            marginTop: '1rem',
          }}>
            <p style={{
              fontSize: '0.9rem',
              lineHeight: 1.8,
              textAlign: 'justify',
              color: 'rgba(255,255,255,0.7)',
              margin: 0,
            }}>
              <strong style={{ color: '#FF6B6B' }}>Unscheduled Downtime:</strong> When filter bypass occurs or contamination accelerates wear, equipment stops. The mechanisms and cost multipliers are documented in the <Link href="/knowledge-system/fleet/reducing-downtime" style={{ color: '#FFF12D', textDecoration: 'underline' }}>fleet downtime reduction analysis</Link>. Downtime costs are typically <strong>3-5x higher than filter replacement cost</strong>.
            </p>
          </div>
          <div style={{
            background: 'rgba(255,0,0,0.08)',
            border: '1px solid rgba(255,0,0,0.15)',
            borderRadius: '8px',
            padding: '1.5rem',
            marginTop: '0.5rem',
          }}>
            <p style={{
              fontSize: '0.9rem',
              lineHeight: 1.8,
              textAlign: 'justify',
              color: 'rgba(255,255,255,0.7)',
              margin: 0,
            }}>
              <strong style={{ color: '#FF6B6B' }}>Accelerated Wear:</strong> Contamination bypass (as low as 10% bypass) increases engine wear 50-80%, hydraulic varnish causes 20-50% efficiency loss. The particle-level failure mechanisms are documented in the <Link href="/knowledge-system/contamination/particle-wear" style={{ color: '#FFF12D', textDecoration: 'underline' }}>particle wear contamination case study</Link>. Component replacement occurs <strong>30-50% earlier than design life</strong>.
            </p>
          </div>
          <div style={{
            background: 'rgba(255,0,0,0.08)',
            border: '1px solid rgba(255,0,0,0.15)',
            borderRadius: '8px',
            padding: '1.5rem',
            marginTop: '0.5rem',
          }}>
            <p style={{
              fontSize: '0.9rem',
              lineHeight: 1.8,
              textAlign: 'justify',
              color: 'rgba(255,255,255,0.7)',
              margin: 0,
            }}>
              <strong style={{ color: '#FF6B6B' }}>Operational Degradation:</strong> Fuel injector stiction reduces efficiency 15-40%, hydraulic varnish causes proportional valve drift, engine blow-by increases oil consumption. <strong>Every percent efficiency loss multiplies over fleet lifespan</strong>.
            </p>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          style={{ marginBottom: '4rem' }}
        >

          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
            fontWeight: 700,
            fontFamily: 'Titillium Web, sans-serif',
            marginBottom: '1.5rem',
            lineHeight: 1.2,
            textAlign: 'justify',
          }}>
            System-Level Cost Analysis
          </h2>
          <p style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            textAlign: 'justify',
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '1.5rem',
          }}>
            Total cost of ownership includes all costs associated with equipment operation over its useful life:
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem',
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '1.5rem',
              borderRadius: '8px',
            }}>
              <p style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#FFF12D',
                marginBottom: '0.75rem',
                textTransform: 'uppercase',
              }}>
                Filter Cost
              </p>
              <p style={{
                fontSize: '0.9rem',
                lineHeight: 1.6,
                textAlign: 'justify',
                color: 'rgba(255,255,255,0.7)',
                marginBottom: '0.5rem',
              }}>
                Purchase price × number of replacements over equipment life
              </p>
              <p style={{
                fontSize: '0.8rem',
                lineHeight: 1.4,
                textAlign: 'justify',
                color: 'rgba(255,255,255,0.5)',
              }}>
                Commodity approach: lowest per-unit cost
              </p>
            </div>
            <div style={{
              background: 'rgba(255,241,45,0.06)',
              border: '1px solid rgba(255,241,45,0.15)',
              padding: '1.5rem',
              borderRadius: '8px',
            }}>
              <p style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#FFF12D',
                marginBottom: '0.75rem',
                textTransform: 'uppercase',
              }}>
                Maintenance Cost
              </p>
              <p style={{
                fontSize: '0.9rem',
                lineHeight: 1.6,
                textAlign: 'justify',
                color: 'rgba(255,255,255,0.7)',
                marginBottom: '0.5rem',
              }}>
                Scheduled service labor, filter element disposal, system flushing
              </p>
              <p style={{
                fontSize: '0.8rem',
                lineHeight: 1.4,
                textAlign: 'justify',
                color: 'rgba(255,255,255,0.5)',
              }}>
                System approach: optimized interval reduces frequency
              </p>
            </div>
            <div style={{
              background: 'rgba(255,0,0,0.06)',
              border: '1px solid rgba(255,0,0,0.15)',
              padding: '1.5rem',
              borderRadius: '8px',
            }}>
              <p style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#FF6B6B',
                marginBottom: '0.75rem',
                textTransform: 'uppercase',
              }}>
                Downtime Cost
              </p>
              <p style={{
                fontSize: '0.9rem',
                lineHeight: 1.6,
                textAlign: 'justify',
                color: 'rgba(255,255,255,0.7)',
                marginBottom: '0.5rem',
              }}>
                Unscheduled maintenance, production loss, emergency repairs
              </p>
              <p style={{
                fontSize: '0.8rem',
                lineHeight: 1.4,
                textAlign: 'justify',
                color: 'rgba(255,255,255,0.5)',
              }}>
                Commodity approach: ignores; System approach: eliminated via prevention
              </p>
            </div>
            <div style={{
              background: 'rgba(255,0,0,0.06)',
              border: '1px solid rgba(255,0,0,0.15)',
              padding: '1.5rem',
              borderRadius: '8px',
            }}>
              <p style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#FF6B6B',
                marginBottom: '0.75rem',
                textTransform: 'uppercase',
              }}>
                Component Replacement
              </p>
              <p style={{
                fontSize: '0.9rem',
                lineHeight: 1.6,
                textAlign: 'justify',
                color: 'rgba(255,255,255,0.7)',
                marginBottom: '0.5rem',
              }}>
                Engine, transmission, hydraulic system premature failure due to contamination
              </p>
              <p style={{
                fontSize: '0.8rem',
                lineHeight: 1.4,
                textAlign: 'justify',
                color: 'rgba(255,255,255,0.5)',
              }}>
                Commodity approach: not prevented; System approach: eliminated or deferred
              </p>
            </div>
            <div style={{
              background: 'rgba(255,0,0,0.06)',
              border: '1px solid rgba(255,0,0,0.15)',
              padding: '1.5rem',
              borderRadius: '8px',
            }}>
              <p style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#FF6B6B',
                marginBottom: '0.75rem',
                textTransform: 'uppercase',
              }}>
                Operational Degradation
              </p>
              <p style={{
                fontSize: '0.9rem',
                lineHeight: 1.6,
                textAlign: 'justify',
                color: 'rgba(255,255,255,0.7)',
                marginBottom: '0.5rem',
              }}>
                Fuel consumption increase (15-40%), hydraulic efficiency loss (20-50%), extended service intervals
              </p>
              <p style={{
                fontSize: '0.8rem',
                lineHeight: 1.4,
                textAlign: 'justify',
                color: 'rgba(255,255,255,0.5)',
              }}>
                Commodity approach: not prevented; System approach: eliminated via cleanliness
              </p>
            </div>
            <div style={{
              background: 'rgba(255,0,0,0.06)',
              border: '1px solid rgba(255,0,0,0.15)',
              padding: '1.5rem',
              borderRadius: '8px',
            }}>
              <p style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#FF6B6B',
                marginBottom: '0.75rem',
                textTransform: 'uppercase',
              }}>
                Equipment Replacement
              </p>
              <p style={{
                fontSize: '0.9rem',
                lineHeight: 1.6,
                textAlign: 'justify',
                color: 'rgba(255,255,255,0.7)',
                marginBottom: '0.5rem',
              }}>
                Full vehicle/system replacement when accelerated wear reaches end-of-life
              </p>
              <p style={{
                fontSize: '0.8rem',
                lineHeight: 1.4,
                textAlign: 'justify',
                color: 'rgba(255,255,255,0.5)',
              }}>
                Commodity approach: occurs early; System approach: deferred 30-50%
              </p>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{ marginBottom: '4rem' }}
        >

          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
            fontWeight: 700,
            fontFamily: 'Titillium Web, sans-serif',
            marginBottom: '1.5rem',
            lineHeight: 1.2,
            textAlign: 'justify',
          }}>
            Heavy-Duty Diesel Engine Over 10-Year Lifespan
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '2rem',
            marginBottom: '2rem',
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '1.5rem',
              borderRadius: '8px',
            }}>
              <p style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#fff',
                marginBottom: '1rem',
              }}>
                COMMODITY APPROACH
              </p>
              <ul style={{
                fontSize: '0.85rem',
                lineHeight: 1.6,
                textAlign: 'justify',
                color: 'rgba(255,255,255,0.7)',
                listStyle: 'none',
                padding: 0,
                margin: 0,
              }}>
                <li style={{ marginBottom: '0.5rem' }}>Filter cost: $50 × 10 intervals = <strong>$500</strong></li>
                <li style={{ marginBottom: '0.5rem' }}>Maintenance labor: <strong>$2,000</strong></li>
                <li style={{ marginBottom: '0.5rem' }}>Oil degradation, 2-3 emergency repairs = <strong>$8,000</strong></li>
                <li style={{ marginBottom: '0.5rem' }}>Fuel consumption increase 20% = <strong>$12,000</strong></li>
                <li style={{ marginBottom: '0.5rem' }}>Engine replacement at 5 years (wear) = <strong>$35,000</strong></li>
                <li style={{ marginBottom: '0.5rem' }}>Total: <strong style={{ color: '#FF6B6B' }}>$57,500</strong></li>
              </ul>
            </div>
            <div style={{
              background: 'rgba(255,241,45,0.08)',
              border: '1px solid rgba(255,241,45,0.15)',
              padding: '1.5rem',
              borderRadius: '8px',
            }}>
              <p style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#FFF12D',
                marginBottom: '1rem',
              }}>
                SYSTEM APPROACH (ELIMFILTERS)
              </p>
              <ul style={{
                fontSize: '0.85rem',
                lineHeight: 1.6,
                textAlign: 'justify',
                color: 'rgba(255,255,255,0.7)',
                listStyle: 'none',
                padding: 0,
                margin: 0,
              }}>
                <li style={{ marginBottom: '0.5rem' }}>Filter cost: $65 × 12 intervals = <strong>$780</strong></li>
                <li style={{ marginBottom: '0.5rem' }}>Maintenance labor: <strong>$3,600</strong></li>
                <li style={{ marginBottom: '0.5rem' }}>Preventive particle monitoring = <strong>$1,200</strong></li>
                <li style={{ marginBottom: '0.5rem' }}>Fuel consumption baseline = <strong>$600</strong> (no increase)</li>
                <li style={{ marginBottom: '0.5rem' }}>Engine continues to design life = <strong>$0</strong> (no premature replacement)</li>
                <li style={{ marginBottom: '0.5rem' }}>Total: <strong style={{ color: '#FFF12D' }}>$6,180</strong></li>
              </ul>
            </div>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,241,45,0.08) 0%, rgba(0,255,0,0.03) 100%)',
            border: '1px solid rgba(255,241,45,0.15)',
            borderRadius: '8px',
            padding: '1.5rem',
          }}>
            <p style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: '#FFF12D',
              marginBottom: '0.75rem',
            }}>
              Cost Difference: $51,320
            </p>
            <p style={{
              fontSize: '0.95rem',
              lineHeight: 1.7,
              textAlign: 'justify',
              color: 'rgba(255,255,255,0.7)',
            }}>
              System-level filtration costs 10% more per service cycle but saves 89% in total equipment ownership cost. The difference is generated by preventing contamination-driven failures before they occur.
            </p>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
        >

          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
            fontWeight: 700,
            fontFamily: 'Titillium Web, sans-serif',
            marginBottom: '1.5rem',
            lineHeight: 1.2,
            textAlign: 'justify',
          }}>
            Why TCO Analysis Changes Everything
          </h2>
          <ul style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            textAlign: 'justify',
            color: 'rgba(255,255,255,0.7)',
            marginLeft: '1.5rem',
          }}>
            <li style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#FFF12D' }}>Filter cost is trivial:</strong> 1-5% of total ownership cost. Price competition among brands is irrelevant to actual operating economics.
            </li>
            <li style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#FFF12D' }}>Downtime is critical:</strong> Unscheduled maintenance and equipment replacement dominate costs. System design prevents these through contamination control.
            </li>
            <li style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#FFF12D' }}>Measurement enables optimization:</strong> Particle count data reveals actual contamination loads. Intervals can be adjusted for cost efficiency without compromising equipment protection.
            </li>
            <li style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#FFF12D' }}>Component lifespan is extended:</strong> Maintaining cleanliness targets extends equipment life 30-50%. This single factor typically justifies system investment.
            </li>
            <li style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#FFF12D' }}>Operational efficiency is preserved:</strong> Fuel consumption, engine performance, and hydraulic responsiveness are maintained at design specification when contamination is controlled.
            </li>
          </ul>
        </motion.section>

      </div>


      {/* JSON-LD Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: 'Total Cost of Ownership',
        description: 'Total cost of ownership analysis showing how system-level filtration reduces equipment lifecycle costs through contamination control, extended component life, and reduced unplanned downtime.',
        author: { '@type': 'Organization', name: 'ELIMFILTERS' },
        publisher: { '@type': 'Organization', name: 'ELIMFILTERS' },
        dateModified: '2026-06-11',
        keywords: ['total cost of ownership', 'filtration TCO', 'contamination control', 'fleet economics', 'ISO 16889', 'ISO 4406', 'asset protection', 'equipment lifecycle cost'],
        about: { '@type': 'Thing', name: 'Filtration Total Cost of Ownership', description: 'Economic framework for evaluating filtration decisions based on equipment lifecycle cost rather than filter purchase price.' },
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://elimfilters.com' },
          { '@type': 'ListItem', position: 2, name: 'Knowledge System', item: 'https://elimfilters.com/knowledge-system' },
          { '@type': 'ListItem', position: 3, name: 'Compare', item: 'https://elimfilters.com/knowledge-system/compare' },
          { '@type': 'ListItem', position: 4, name: 'Total Cost of Ownership', item: 'https://elimfilters.com/knowledge-system/compare/total-cost-ownership' },
        ],
      }) }} />
    </main>
  );
}
