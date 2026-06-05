'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const staggerCards = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};

const FAQS = [
  {
    q: 'What is ELIMFILTERS®?',
    a: 'ELIMFILTERS® is a Frisco, Texas-based industrial filtration engineering company specialising in multi-layer asset protection systems. The company designs proprietary filtration technologies — including MACROCORE™, NANOFORCE™, AQUAGUARD™, SYNTRAX™, and MICROKAPPA™ — for mining, agriculture, marine, oil & gas, construction, and other heavy-industry sectors across North America and Latin America.',
  },
  {
    q: 'Where is ELIMFILTERS® headquartered?',
    a: 'ELIMFILTERS® is headquartered in Frisco, Texas, USA, with sales and technical support operations serving customers across North America and Latin America.',
  },
  {
    q: 'What industries does ELIMFILTERS® serve?',
    a: 'ELIMFILTERS® serves 12 industrial sectors: Mining, Agriculture, Marine, Oil & Gas, Automotive, Construction, Power Generation, Bus & Coach, Manufacturing, Railway, Trucks & Fleets, and Municipal & Waste. Each sector has purpose-built asset protection filtration systems engineered for the contamination threats specific to that industry’s operating environment.',
  },
  {
    q: 'What makes ELIMFILTERS® different from OEM filter suppliers?',
    a: 'ELIMFILTERS® is an asset protection engineering company, not a parts supplier. Each system is designed to a specific contamination control target — ISO cleanliness code, Beta ratio, ingression rate — for the application. Proprietary media technologies validated under ISO 5011, ISO 16889, and ISO 4406 achieve up to 99.9% filtration efficiency across air, fuel, hydraulic, and lubrication systems.',
  },
  {
    q: 'What proprietary technologies does ELIMFILTERS® offer?',
    a: 'ELIMFILTERS® offers 12 proprietary filtration technologies, including MACROCORE™ (multi-layer air filtration), NANOFORCE™ (nanofibre hydraulic and fuel filtration), AQUAGUARD™ (water separation for fuel systems), SYNTRAX™ (synthetic media for high-temperature lube systems), and MICROKAPPA™ (cabin air filtration). Each technology is validated to ISO industry standards and engineered for a specific contamination control target.',
  },
];

const BASE_URL = 'https://elimfilters.com';

export default function About() {
  const aboutPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About ELIMFILTERS®',
    url: `${BASE_URL}/about/`,
    dateModified: '2026-05-30',
    description: 'ELIMFILTERS® is an industrial filtration engineering company specialising in asset protection filtration for mining, agriculture, marine, and heavy industry.',
    publisher: {
      '@type': 'Organization',
      name: 'ELIMFILTERS®',
      url: BASE_URL,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Frisco',
        addressRegion: 'TX',
        addressCountry: 'US',
      },
      areaServed: ['North America', 'Latin America'],
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'About', item: `${BASE_URL}/about/` },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  };

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <Navigation />

      {/* ── HERO ── */}
      <section
        style={{
          marginTop: 0,
          paddingTop: '9rem',
          paddingBottom: '6rem',
          backgroundImage:
            'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.75) 60%, rgba(0,0,0,1) 100%), url(/images/grupo-filters.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'scroll',
          position: 'relative',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            <motion.span
              variants={fadeUp}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{
                display: 'block',
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.25em',
                color: '#FFF12D',
                fontFamily: 'JetBrains Mono, monospace',
                marginBottom: '1.5rem',
              }}
            >
              // ABOUT ELIMFILTERS®
            </motion.span>

            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                fontWeight: 900,
                fontFamily: 'Space Grotesk, sans-serif',
                marginBottom: '1rem',
                lineHeight: 1.05,
                color: '#fff',
              }}
            >
              ENGINEERING OF CERTAINTY
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: '1.2rem',
                fontWeight: 600,
                fontFamily: 'Outfit, sans-serif',
                color: '#FFF12D',
                marginBottom: '2rem',
              }}
            >
              Asset Protection Engineering Company
            </motion.p>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: 'clamp(1rem, 2vw, 1.1rem)',
                lineHeight: 1.7,
                color: 'rgba(255,255,255,0.8)',
                fontFamily: 'Outfit, sans-serif',
                maxWidth: '680px',
                borderLeft: '3px solid #FFF12D',
                paddingLeft: '1.25rem',
              }}
            >
              ELIMFILTERS® is a Frisco, Texas-based industrial filtration engineering company
              specialising in multi-layer asset protection systems for mining, agriculture, marine,
              oil & gas, and heavy industry across North America and Latin America — with proprietary
              technologies validated to ISO 5011, ISO 16889, and ISO 4406.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── RISK FIRST ── */}
      <section style={{ padding: '5rem 2rem', background: '#000' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '3rem',
              alignItems: 'center',
            }}
          >
            <motion.div
              initial={{ opacity: 0, x: -36 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2
                style={{
                  fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                  fontWeight: 900,
                  fontFamily: 'Space Grotesk, sans-serif',
                  marginBottom: '1.5rem',
                  lineHeight: 1.2,
                }}
              >
                RISK FIRST.
                <br />
                ALWAYS.
              </h2>
              <p
                style={{
                  fontSize: '1rem',
                  lineHeight: 1.7,
                  color: 'rgba(255,255,255,0.75)',
                  fontFamily: 'Outfit, sans-serif',
                  marginBottom: '1.5rem',
                }}
              >
                Every ELIMFILTERS® system is engineered with one core principle: protect against
                catastrophic failure first, optimize efficiency second. We believe that in industrial
                filtration, certainty isn't optional—it's mandatory.
              </p>
              <p
                style={{
                  fontSize: '1rem',
                  lineHeight: 1.7,
                  color: 'rgba(255,255,255,0.75)',
                  fontFamily: 'Outfit, sans-serif',
                }}
              >
                Our Asset Protection Technology combines AI-formulated hybrid media, hydrophobic
                separation systems, and anti-bypass structures to eliminate contamination events
                before they happen.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 36 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: 'linear-gradient(135deg, rgba(255,241,45,0.1) 0%, rgba(255,241,45,0.02) 100%)',
                border: '1px solid rgba(255,241,45,0.2)',
                borderRadius: '12px',
                padding: '2.5rem',
                textAlign: 'center',
              }}
            >
              <div style={{ marginBottom: '2rem' }}>
                <div
                  style={{
                    fontSize: '3.5rem',
                    fontWeight: 900,
                    color: '#FFF12D',
                    fontFamily: 'Space Grotesk, sans-serif',
                    marginBottom: '0.5rem',
                  }}
                >
                  99.9%
                </div>
                <p
                  style={{
                    fontSize: '0.95rem',
                    color: 'rgba(255,255,255,0.75)',
                    fontFamily: 'Outfit, sans-serif',
                    marginBottom: '0.5rem',
                  }}
                >
                  Media Efficiency Rating
                </p>
                <p
                  style={{
                    fontSize: '0.72rem',
                    color: 'rgba(255,255,255,0.4)',
                    fontFamily: 'JetBrains Mono, monospace',
                    letterSpacing: '0.06em',
                  }}
                >
                  validated under ISO 5011 test conditions
                </p>
              </div>
              <div
                style={{
                  borderTop: '1px solid rgba(255,241,45,0.2)',
                  paddingTop: '2rem',
                  marginTop: '2rem',
                }}
              >
                <p
                  style={{
                    fontSize: '0.9rem',
                    color: 'rgba(255,255,255,0.75)',
                    fontFamily: 'Outfit, sans-serif',
                    lineHeight: 1.6,
                  }}
                >
                  All ELIMFILTERS® systems undergo rigorous testing and validation before
                  deployment. We guarantee certainty through engineering.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── PROVEN PROTECTION ── */}
      <section
        style={{
          padding: '5rem 2rem',
          background: 'linear-gradient(135deg, rgba(255,241,45,0.03) 0%, rgba(0,0,0,0.5) 100%)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeUp}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: 900,
              fontFamily: 'Space Grotesk, sans-serif',
              marginBottom: '3rem',
              textAlign: 'center',
              lineHeight: 1.2,
            }}
          >
            PROVEN PROTECTION. EVERY TIME.
          </motion.h2>

          <motion.div
            variants={staggerCards}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '2rem',
            }}
          >
            {[
              {
                title: 'Asset Protection Technology',
                description:
                  'Proprietary systems designed to eliminate contamination events before they damage critical equipment.',
                href: '/technologies/',
              },
              {
                title: 'AI-Formulated Media',
                description:
                  'Hybrid filtration media engineered using mathematical algorithms and proven in 10,000+ lab scenarios.',
                href: '/knowledge-system/science/',
              },
              {
                title: 'Global Engineering',
                description:
                  'Headquartered in Frisco, Texas with operations across North America, Latin America, and beyond.',
                href: '/contact/',
              },
              {
                title: 'Industry Expertise',
                description:
                  'Serving Mining, Agriculture, Marine, Oil & Gas, Automotive, Construction, Power Generation, Bus & Coach, Manufacturing, Railway, Trucks & Fleets, and Municipal sectors.',
                href: '/industries/',
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                variants={fadeUp}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ borderColor: 'rgba(255,241,45,0.35)', background: 'rgba(255,241,45,0.05)', y: -4 }}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '8px',
                  padding: '2rem',
                  transition: 'border-color 0.3s, background 0.3s',
                }}
              >
                <h3
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    fontFamily: 'Space Grotesk, sans-serif',
                    marginBottom: '1rem',
                    color: '#FFF12D',
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    fontSize: '0.95rem',
                    lineHeight: 1.6,
                    color: 'rgba(255,255,255,0.75)',
                    fontFamily: 'Outfit, sans-serif',
                    marginBottom: '1rem',
                  }}
                >
                  {item.description}
                </p>
                <Link
                  href={item.href}
                  style={{
                    fontSize: '0.7rem',
                    color: 'rgba(255,241,45,0.55)',
                    fontFamily: 'JetBrains Mono, monospace',
                    letterSpacing: '0.1em',
                    textDecoration: 'none',
                  }}
                >
                  EXPLORE →
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: '5rem 2rem', background: '#000', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ marginBottom: '3rem' }}
          >
            <span style={{
              display: 'block', fontSize: '0.7rem', fontWeight: 700,
              letterSpacing: '0.25em', color: '#FFF12D',
              fontFamily: 'JetBrains Mono, monospace', marginBottom: '1rem',
            }}>
              // FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 style={{
              fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800,
              fontFamily: 'Space Grotesk, sans-serif', color: '#fff', margin: '0',
            }}>
              About ELIMFILTERS® — Brand FAQ
            </h2>
          </motion.div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {FAQS.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.05 }}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '6px',
                  padding: '1.75rem 2rem',
                }}
              >
                <h3 style={{
                  fontSize: '0.975rem', fontWeight: 700,
                  fontFamily: 'Outfit, sans-serif', color: '#fff',
                  margin: '0 0 0.875rem', lineHeight: 1.5,
                }}>
                  {faq.q}
                </h3>
                <p style={{
                  fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)',
                  fontFamily: 'Inter, sans-serif', lineHeight: 1.85, margin: '0',
                }}>
                  {faq.a}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '4rem 2rem', background: '#FFF12D', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ maxWidth: '900px', margin: '0 auto' }}
        >
          <h2
            style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
              fontWeight: 900,
              fontFamily: 'Space Grotesk, sans-serif',
              marginBottom: '1.5rem',
              color: '#000',
              lineHeight: 1.2,
            }}
          >
            READY TO PROTECT YOUR ASSETS?
          </h2>
          <p
            style={{
              fontSize: '1.05rem',
              marginBottom: '2rem',
              color: '#000',
              fontFamily: 'Outfit, sans-serif',
              lineHeight: 1.6,
            }}
          >
            Contact our engineering team to discuss your filtration requirements and discover how
            ELIMFILTERS® protects critical assets.
          </p>
          <motion.a
            href="/contact"
            whileHover={{ scale: 1.04, boxShadow: '0 8px 32px rgba(0,0,0,0.35)' }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: 'inline-block',
              background: '#000',
              color: '#FFF12D',
              padding: '0.875rem 2.5rem',
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              fontSize: '0.85rem',
              letterSpacing: '0.12em',
              textDecoration: 'none',
              borderRadius: '4px',
            }}
          >
            CONTACT US
          </motion.a>
        </motion.div>
      </section>

      <Footer />
    </main>
  );
}
