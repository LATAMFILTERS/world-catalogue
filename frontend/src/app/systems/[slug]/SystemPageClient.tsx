'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { catalogue, getSlug } from '@/lib/catalogue';

interface SystemPageClientProps {
  product: (typeof catalogue.products)[number];
  displayName: string;
  industries: string[];
  slug: string;
}

const systemCategories: Record<string, string[]> = {
  'Airfilter': ['Mining', 'Agriculture', 'Construction', 'Oil Gas'],
  'TURBOCORE': ['Oil Gas', 'Marine', 'Power Generation'],
  'Cabin': ['Automotive', 'Bus Coach', 'Trucks Fleets'],
  'Coolant': ['Automotive', 'Manufacturing', 'Power Generation'],
  'Dryer': ['Manufacturing', 'Power Generation', 'Railway'],
  'Fuel': ['Trucks Fleets', 'Automotive', 'Oil Gas'],
  'Housing': ['Mining', 'Agriculture', 'Construction'],
  'Hydraulic': ['Construction', 'Manufacturing', 'Mining'],
  'Kits': ['Trucks Fleets', 'Automotive'],
  'Marine': ['Marine', 'Oil Gas'],
  'Oil': ['Trucks Fleets', 'Automotive', 'Power Generation'],
  'Water': ['Marine', 'Oil Gas', 'Power Generation'],
};

export default function SystemPageClient({ product, displayName, industries, slug }: SystemPageClientProps) {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <Link href="/systems"
        className="back-nav-btn" style={{
        position: 'fixed', top: '1rem', right: '1.5rem', zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,241,45,0.35)',
        borderRadius: '4px', padding: '0.45rem 1rem',
        fontFamily: 'Titillium Web, sans-serif', fontWeight: 700, fontSize: '0.72rem',
        letterSpacing: '0.12em', color: '#FFF12D', textDecoration: 'none',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        transition: 'background 0.2s, border-color 0.2s',
      }}>← SYSTEMS</Link>

      {/* Hero Section */}
      <section style={{
        paddingTop: '5rem',
        paddingBottom: '4rem',
        background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(255,241,45,0.05) 100%)',
        borderBottom: '1px solid rgba(255,241,45,0.15)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 style={{
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              fontWeight: 900,
              fontFamily: 'Titillium Web, sans-serif',
              marginBottom: '1.5rem',
              lineHeight: 1.1,
              color: 'rgba(255,255,255,0.95)',
            }}>
              {displayName} Systems
            </h1>

            <p style={{
              fontSize: 'clamp(0.95rem, 2vw, 1.05rem)',
              lineHeight: 1.7,
              textAlign: 'justify',
              color: 'rgba(255,255,255,0.75)',
              fontFamily: 'Titillium Web, sans-serif',
              maxWidth: '800px',
            }}
              dangerouslySetInnerHTML={{ __html: product.description.replace(/®/g, '<sup style="font-size:0.55em;vertical-align:super;line-height:0">®</sup>') }}
            />
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section style={{ padding: '4rem 2rem', background: '#000' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
            {/* Features */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                color: '#FFF12D',
                marginBottom: '1.5rem',
                fontFamily: 'Titillium Web, sans-serif',
              }}>
                Key Features
              </h2>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.8rem',
              }}>
                {(product.features || []).map((feature, i) => (
                  <li key={i} style={{
                    fontSize: '0.9rem',
                    color: 'rgba(255,255,255,0.75)',
                    fontFamily: 'Titillium Web, sans-serif',
                    paddingLeft: '1.5rem',
                    position: 'relative',
                  }}>
                    <span style={{
                      position: 'absolute',
                      left: 0,
                      color: '#FFF12D',
                    }}>
                      ✓
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Benefits */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
              <h2 style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                color: '#FFF12D',
                marginBottom: '1.5rem',
                fontFamily: 'Titillium Web, sans-serif',
              }}>
                Operational Benefits
              </h2>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.8rem',
              }}>
                {(product.benefits || []).map((benefit, i) => (
                  <li key={i} style={{
                    fontSize: '0.9rem',
                    color: 'rgba(255,255,255,0.75)',
                    fontFamily: 'Titillium Web, sans-serif',
                    paddingLeft: '1.5rem',
                    position: 'relative',
                  }}>
                    <span style={{
                      position: 'absolute',
                      left: 0,
                      color: '#FFF12D',
                    }}>
                      ▸
                    </span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Technologies */}
          {(product.techTags || []).length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: '4rem' }}>
              <h2 style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                color: '#FFF12D',
                marginBottom: '1.5rem',
                fontFamily: 'Titillium Web, sans-serif',
              }}>
                Core Technologies
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
              }}>
                {(product.techTags || []).map((tech, i) => (
                  <div key={i} style={{
                    padding: '1.5rem',
                    background: 'rgba(255,241,45,0.05)',
                    border: '1px solid rgba(255,241,45,0.2)',
                    borderRadius: '4px',
                    textAlign: 'center',
                  }}>
                    <p style={{
                      margin: 0,
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      color: '#FFF12D',
                      fontFamily: 'Titillium Web, sans-serif',
                    }}>
                      {tech}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Industries */}
          {industries.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                color: '#FFF12D',
                marginBottom: '1.5rem',
                fontFamily: 'Titillium Web, sans-serif',
              }}>
                Industries Served
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1rem',
              }}>
                {industries.map((industry) => {
                  const industryObj = catalogue.industries.find(ind => ind.name === industry);
                  return (
                    <Link
                      key={industry}
                      href={`/industries/${getSlug(industry)}`}
                      style={{
                        padding: '1.5rem',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '4px',
                        textDecoration: 'none',
                        transition: 'all 0.3s ease',
                      }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.borderColor = 'rgba(255,241,45,0.35)';
                        el.style.background = 'rgba(255,241,45,0.05)';
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.borderColor = 'rgba(255,255,255,0.08)';
                        el.style.background = 'rgba(255,255,255,0.03)';
                      }}
                    >
                      <p style={{
                        margin: 0,
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        color: '#fff',
                        fontFamily: 'Titillium Web, sans-serif',
                        marginBottom: '0.5rem',
                      }}>
                        {industryObj?.title || industry}
                      </p>
                      <p style={{
                        margin: 0,
                        fontSize: '0.8rem',
                        color: 'rgba(255,255,255,0.55)',
                        fontFamily: 'Titillium Web, sans-serif',
                      }}>
                        Explore industry ▸
                      </p>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Back to Systems CTA */}
      <section style={{ padding: '3rem 2rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <Link href="/systems" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.8rem 1.5rem',
            border: '1px solid rgba(255,241,45,0.35)',
            borderRadius: '4px',
            color: '#FFF12D',
            textDecoration: 'none',
            fontFamily: 'Titillium Web, sans-serif',
            fontSize: '0.85rem',
            fontWeight: 600,
            transition: 'all 0.3s ease',
          }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = 'rgba(255,241,45,0.6)';
              el.style.background = 'rgba(255,241,45,0.1)';
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = 'rgba(255,241,45,0.35)';
              el.style.background = 'transparent';
            }}
          >
            ← BACK TO ALL SYSTEMS
          </Link>
        </motion.div>
      </section>
    </main>
  );
}
