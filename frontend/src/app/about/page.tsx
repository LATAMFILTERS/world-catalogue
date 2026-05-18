'use client';

import { motion } from 'motion/react';
import { Navigation } from '@/components/Navigation';

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

export default function About() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <Navigation />

      {/* ── HERO ── */}
      <section
        style={{
          marginTop: '72px',
          paddingTop: '6rem',
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
              // ABOUT ELIMFILTERS
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
              ELIMFILTERS specializes in protecting critical assets through advanced filtration
              engineering. We design systems that prevent contamination before it damages.
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
                Every ELIMFILTERS system is engineered with one core principle: protect against
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
                  }}
                >
                  Media Efficiency Rating
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
                  All ELIMFILTERS systems undergo rigorous testing and validation before
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
              },
              {
                title: 'AI-Formulated Media',
                description:
                  'Hybrid filtration media engineered using mathematical algorithms and proven in 10,000+ lab scenarios.',
              },
              {
                title: 'Global Engineering',
                description:
                  'Headquartered in Frisco, Texas with operations across North America, Latin America, and beyond.',
              },
              {
                title: 'Industry Expertise',
                description:
                  'Serving Agriculture, Mining, Marine, Aerospace, Automotive, and 7 additional industrial verticals.',
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
                  }}
                >
                  {item.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
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
            ELIMFILTERS protects critical assets.
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
    </main>
  );
}
