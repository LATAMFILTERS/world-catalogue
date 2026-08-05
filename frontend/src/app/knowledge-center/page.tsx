'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import '@/i18n';
import { useTranslation } from 'react-i18next';

const KNOWLEDGE_SECTIONS = [
  {
    id: 'standards',
    title: 'Industrial Standards',
    description: 'Technical standards for industrial filtration systems (ISO, ASTM, SAE, NFPA)',
    icon: '📋',
    href: '/knowledge-system/standards',
    count: '6 domains',
    color: 'rgba(63,81,181,0.1)',
  },
  {
    id: 'contamination',
    title: 'Contamination Control',
    description: 'Case studies and root cause analysis of contamination in industrial systems',
    icon: '🔬',
    href: '/knowledge-system/contamination',
    count: '3+ case studies',
    color: 'rgba(255,152,0,0.1)',
  },
  {
    id: 'technologies',
    title: 'Filtration Technologies',
    description: 'ELIMFILTERS proprietary technologies and their engineering applications',
    icon: '⚙️',
    href: '/technologies',
    count: '12 technologies',
    color: 'rgba(76,175,80,0.1)',
  },
  {
    id: 'fleet',
    title: 'Fleet Optimization',
    description: 'Total cost of ownership analysis and fleet management strategies',
    icon: '🚛',
    href: '/knowledge-system/fleet',
    count: '5+ strategies',
    color: 'rgba(33,150,243,0.1)',
  },
  {
    id: 'industries',
    title: 'Industry-Specific Guides',
    description: 'Tailored filtration solutions for agriculture, mining, energy, marine, and more',
    icon: '🏭',
    href: '/industries',
    count: '12 industries',
    color: 'rgba(233,30,99,0.1)',
  },
  {
    id: 'glossary',
    title: 'Technical Glossary',
    description: 'Definitions and technical terms for industrial filtration and asset protection',
    icon: '📖',
    href: '/knowledge-system/glossary',
    count: '100+ terms',
    color: 'rgba(121,85,72,0.1)',
  },
];

export default function KnowledgeCenterPage() {
  const { t } = useTranslation();

  return (
    <>
      <Navigation />

      <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
        {/* Hero Section */}
        <section style={{
          padding: 'clamp(6rem, 12vw, 10rem) clamp(1.25rem, 5vw, 4rem)',
          background: 'linear-gradient(135deg, rgba(255,241,45,0.08) 0%, rgba(0,0,0,0.5) 100%), linear-gradient(180deg, rgba(63,81,181,0.1) 0%, transparent 50%)',
          borderBottom: '1px solid rgba(255,241,45,0.1)',
        }}>
          <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <p style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 'clamp(0.7rem, 1.5vw, 0.85rem)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#FFF12D',
                marginBottom: '1.5rem',
                fontWeight: 600,
              }}>
                // TECHNICAL RESOURCES FOR INDUSTRIAL ASSET PROTECTION
              </p>

              <h1 style={{
                fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif',
                fontWeight: 700,
                fontSize: 'clamp(2.5rem, 5vw, 4.2rem)',
                textTransform: 'uppercase',
                letterSpacing: '0.01em',
                lineHeight: 1.05,
                color: '#fff',
                marginBottom: '2rem',
                maxWidth: '900px',
              }}>
                Knowledge Center
              </h1>

              <p style={{
                fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif',
                fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.8)',
                maxWidth: '800px',
                marginBottom: '2rem',
              }}>
                Comprehensive technical resources on industrial filtration standards, contamination control, asset protection engineering, and fleet optimization.
              </p>

              <p style={{
                fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
                lineHeight: 1.7,
                color: 'rgba(255,255,255,0.65)',
                maxWidth: '850px',
              }}>
                ELIMFILTERS Knowledge Center provides engineering-grade documentation for industrial professionals, fleet managers, equipment designers, and procurement specialists.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Knowledge Sections Grid */}
        <section style={{
          padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 5vw, 4rem)',
          maxWidth: '1400px',
          margin: '0 auto',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'clamp(2rem, 3vw, 2.5rem)',
          }}>
            {KNOWLEDGE_SECTIONS.map((section, idx) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6, delay: idx * 0.05 }}
                style={{
                  background: section.color,
                  border: '1px solid rgba(255,241,45,0.15)',
                  borderRadius: '8px',
                  padding: 'clamp(2rem, 4vw, 2.5rem)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.5rem',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,241,45,0.35)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(255,241,45,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,241,45,0.15)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)' }}>
                    {section.icon}
                  </div>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.7rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#FFF12D',
                    fontWeight: 600,
                  }}>
                    {section.count}
                  </span>
                </div>

                <div>
                  <h3 style={{
                    fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif',
                    fontSize: 'clamp(1.3rem, 2vw, 1.6rem)',
                    fontWeight: 700,
                    color: '#fff',
                    marginBottom: '0.75rem',
                    lineHeight: 1.2,
                  }}>
                    {section.title}
                  </h3>
                  <p style={{
                    fontSize: 'clamp(0.95rem, 1.5vw, 1rem)',
                    lineHeight: 1.6,
                    color: 'rgba(255,255,255,0.7)',
                    margin: 0,
                  }}>
                    {section.description}
                  </p>
                </div>

                <Link href={section.href} style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#FFF12D',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  marginTop: 'auto',
                  transition: 'all 0.2s ease',
                }}>
                  Explore →
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Featured Resources */}
        <section style={{
          padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 5vw, 4rem)',
          background: 'rgba(255,241,45,0.02)',
          borderTop: '1px solid rgba(255,241,45,0.1)',
          borderBottom: '1px solid rgba(255,241,45,0.1)',
          maxWidth: '1400px',
          margin: '0 auto',
        }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
          >
            <h2 style={{
              fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif',
              fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.01em',
              color: '#fff',
              marginBottom: '3rem',
              lineHeight: 1.2,
            }}>
              Get Started
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem',
            }}>
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6, delay: 0.1 }}
                style={{
                  background: 'rgba(33,150,243,0.08)',
                  border: '1px solid rgba(33,150,243,0.2)',
                  borderRadius: '8px',
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <h3 style={{
                  fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif',
                  fontSize: '1.3rem',
                  fontWeight: 700,
                  color: '#fff',
                  margin: 0,
                }}>
                  New to Filtration?
                </h3>
                <p style={{
                  fontSize: '1rem',
                  color: 'rgba(255,255,255,0.65)',
                  lineHeight: 1.6,
                  margin: 0,
                }}>
                  Start with industry guides and fundamental concepts for asset protection systems.
                </p>
                <Link href="/industries" style={{
                  display: 'inline-block',
                  color: '#FFF12D',
                  textDecoration: 'none',
                  fontWeight: 600,
                }}>
                  Browse Industries →
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6, delay: 0.2 }}
                style={{
                  background: 'rgba(76,175,80,0.08)',
                  border: '1px solid rgba(76,175,80,0.2)',
                  borderRadius: '8px',
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <h3 style={{
                  fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif',
                  fontSize: '1.3rem',
                  fontWeight: 700,
                  color: '#fff',
                  margin: 0,
                }}>
                  Technical Standards?
                </h3>
                <p style={{
                  fontSize: '1rem',
                  color: 'rgba(255,255,255,0.65)',
                  lineHeight: 1.6,
                  margin: 0,
                }}>
                  Access ISO, ASTM, and SAE standards documentation for filtration system design.
                </p>
                <Link href="/knowledge-system/standards" style={{
                  display: 'inline-block',
                  color: '#FFF12D',
                  textDecoration: 'none',
                  fontWeight: 600,
                }}>
                  View Standards →
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6, delay: 0.3 }}
                style={{
                  background: 'rgba(255,152,0,0.08)',
                  border: '1px solid rgba(255,152,0,0.2)',
                  borderRadius: '8px',
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <h3 style={{
                  fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif',
                  fontSize: '1.3rem',
                  fontWeight: 700,
                  color: '#fff',
                  margin: 0,
                }}>
                  Contamination Issues?
                </h3>
                <p style={{
                  fontSize: '1rem',
                  color: 'rgba(255,255,255,0.65)',
                  lineHeight: 1.6,
                  margin: 0,
                }}>
                  Explore root cause analysis and case studies for equipment contamination problems.
                </p>
                <Link href="/knowledge-system/contamination" style={{
                  display: 'inline-block',
                  color: '#FFF12D',
                  textDecoration: 'none',
                  fontWeight: 600,
                }}>
                  View Case Studies →
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* CTA Section */}
        <section style={{
          padding: 'clamp(4rem, 8vw, 6rem) clamp(1.25rem, 5vw, 4rem)',
          maxWidth: '1400px',
          margin: '0 auto',
          textAlign: 'center',
        }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
          >
            <h2 style={{
              fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif',
              fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.01em',
              color: '#fff',
              marginBottom: '1.5rem',
              lineHeight: 1.2,
            }}>
              Ready to Optimize Your Filtration System?
            </h2>

            <p style={{
              fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.7)',
              marginBottom: '2.5rem',
              maxWidth: '700px',
              margin: '0 auto 2.5rem auto',
            }}>
              Connect with an authorized ELIMFILTERS distributor in your region to implement industrial asset protection solutions tailored to your equipment.
            </p>

            <Link href="/distributors" style={{
              display: 'inline-block',
              background: '#FFF12D',
              color: '#000',
              textDecoration: 'none',
              fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif',
              fontWeight: 700,
              letterSpacing: '0.1em',
              fontSize: '0.9rem',
              padding: '1rem 2.5rem',
              textTransform: 'uppercase',
              borderRadius: '2px',
              transition: 'all 0.2s ease',
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 0 28px rgba(255,241,45,0.55)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Find a Distributor
            </Link>
          </motion.div>
        </section>
      </main>

      <Footer />

      {/* Schema Markup */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "ELIMFILTERS Knowledge Center",
          "description": "Comprehensive technical resources on industrial filtration standards, contamination control, and asset protection engineering",
          "url": "https://elimfilters.com/knowledge-center",
          "publisher": {
            "@type": "Organization",
            "@id": "https://elimfilters.com/#organization",
            "name": "ELIMFILTERS",
            "owner": {
              "@type": "Organization",
              "name": "Kleo Technology LLC"
            }
          }
        })}
      </script>
    </>
  );
}
