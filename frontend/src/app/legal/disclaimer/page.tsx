'use client';

import '@/i18n';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

const SECTIONS = [
  {
    title: '1. General Disclaimer',
    body: `The content published on ELIMFILTERS digital platforms — including elimfilters.com, the Knowledge System, Part Search, AI-assisted features, and associated APIs — is provided for informational purposes only.

ELIMFILTERS makes reasonable efforts to ensure the accuracy, completeness, and currency of platform content. However, ELIMFILTERS does not warrant that all information is free from error, that all product data reflects current catalog status, or that all cross-reference relationships have been validated for every equipment application.

Users must independently verify product selection, fitment, and performance against their specific equipment, operating environment, and applicable technical standards before installation.`,
  },
  {
    title: '2. No Engineering Advice',
    body: `Content published on ELIMFILTERS platforms — including Knowledge System articles, contamination studies, filtration system architectures, AI recommendations, and technical guidance — does not constitute professional engineering advice.

ELIMFILTERS is a filtration product and contamination control knowledge platform. Technical content on this platform is educational in nature and is designed to support informed decision-making by qualified industrial personnel.

For safety-critical applications, high-value industrial assets, or situations where incorrect filtration selection could result in equipment failure, personal injury, or environmental harm, ELIMFILTERS recommends consultation with a qualified engineer or authorized ELIMFILTERS distributor.`,
  },
  {
    title: '3. Product Performance Disclaimer',
    body: `Product specifications, filtration efficiency ratings, Beta ratios, service intervals, and operational metrics published on ELIMFILTERS platforms reflect documented engineering data for products under standard test conditions.

Actual performance in field conditions may vary based on:

— Operating environment contamination levels and particle types
— Actual duty cycle and load conditions
— Maintenance practices and installation quality
— Equipment condition and system health
— Deviation from recommended operating parameters

ELIMFILTERS product specifications are provided as engineering references. Field performance validation is the responsibility of the user and the installing technician.`,
  },
  {
    title: '4. Cross-Reference Disclaimer',
    body: `Cross-reference data provided on ELIMFILTERS platforms identifies products with similar or compatible applications. A cross-reference match does not constitute a warranty of identical performance, media equivalency, or guaranteed fitment for all configurations of the referenced equipment.

OEM part numbers are used for identification purposes only. ELIMFILTERS is not affiliated with, certified by, or endorsed by any OEM manufacturer. Users should verify that non-OEM product selection does not affect equipment warranty coverage before installation.

See the Cross Reference Policy for full classification definitions.`,
  },
  {
    title: '5. AI Output Disclaimer',
    body: `AI-assisted recommendations and technical guidance provided through ELIMFILTERS platforms are generated from engineering data and are advisory in nature. AI outputs do not constitute professional engineering assessments and should not be treated as warranties or performance guarantees.

ELIMFILTERS AI systems are designed to support — not replace — human technical judgment. For applications involving safety-critical equipment, hazardous environments, or high-value assets, AI recommendations must be reviewed and validated by qualified personnel before implementation.`,
  },
  {
    title: '6. Third-Party Content',
    body: `ELIMFILTERS platforms may reference industry standards (ISO, SAE, ASTM, DIN, NFPA), OEM technical documentation, and third-party technical sources. References to third-party content are for educational and contextual purposes.

ELIMFILTERS does not guarantee the accuracy, completeness, or current validity of third-party standards or documentation referenced on this platform. Users should obtain standards documents directly from the issuing standards organization for authoritative technical requirements.`,
  },
  {
    title: '7. Availability Disclaimer',
    body: `ELIMFILTERS does not warrant that platform services will be available without interruption. Platform access may be interrupted for maintenance, infrastructure upgrades, security responses, or circumstances beyond ELIMFILTERS's control.

Product availability, pricing, and catalog status reflected in platform data may not reflect real-time inventory or regional availability. Contact an authorized ELIMFILTERS distributor for current product availability and pricing.`,
  },
  {
    title: '8. Limitation of Liability',
    body: `To the maximum extent permitted by applicable law, ELIMFILTERS and its officers, employees, distributors, and licensors shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising from:

— Reliance on platform content, product specifications, or AI recommendations without independent validation
— Equipment failures, operational disruption, or downtime resulting from product selection based on platform data
— Inaccuracies in cross-reference data or AI-generated recommendations
— Service interruptions, data loss, or platform unavailability
— Decisions made without consultation with qualified engineering or maintenance personnel

Users accept full responsibility for validating product selections and technical recommendations against their specific operational requirements.`,
  },
  {
    title: '9. Applicable Law',
    body: `This disclaimer is governed by applicable law in the jurisdiction of ELIMFILTERS's principal place of business. If any provision of this disclaimer is found to be unenforceable, the remaining provisions continue in full effect.`,
  },
  {
    title: '10. Contact',
    body: `For questions about the scope of this disclaimer or to report potentially inaccurate platform content, contact ELIMFILTERS at info@elimfilters.com.`,
  },
];

const RELATED = [
  { label: 'Terms of Service', href: '/legal/terms' },
  { label: 'Privacy Policy', href: '/legal/privacy' },
  { label: 'AI Use Policy', href: '/legal/ai-policy' },
  { label: 'Copyright & DMCA Policy', href: '/legal/copyright' },
  { label: 'Cross Reference Policy', href: '/legal/cross-reference' },
];

export default function LegalDisclaimerPage() {
  return (
    <>
      <Navigation />
      <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

        <div style={{ padding: '1.5rem 8%', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <Link href="/" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>
            ← ELIMFILTERS
          </Link>
        </div>

        <section style={{ padding: '4rem 8% 3rem', borderBottom: '1px solid rgba(255,241,45,0.08)' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', letterSpacing: '0.18em', color: '#FFF12D', opacity: 0.8, marginBottom: '1rem', textTransform: 'uppercase' }}>
              {'Legal · Disclaimer'}
            </p>
            <h1 style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#fff', margin: '0 0 1rem', lineHeight: 1.15, textAlign: 'justify' }}>
              Legal Disclaimer
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
              Last updated: June 2026
            </p>
          </motion.div>
        </section>

        <div style={{ maxWidth: '820px', margin: '0 auto', padding: '4rem 8%' }}>
          {SECTIONS.map((s, i) => (
            <motion.section
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              style={{ marginBottom: '2.5rem', paddingBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
            >
              <h2 style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '1.05rem', color: '#FFF12D', marginBottom: '0.9rem', lineHeight: 1.3, textAlign: 'justify' }}>
                {s.title}
              </h2>
              {s.body.split('\n\n').map((para, j) => (
                <p key={j} style={{ fontFamily: 'var(--font-body)', fontSize: '0.92rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, marginBottom: '0.75rem' }}>
                  {para}
                </p>
              ))}
            </motion.section>
          ))}

          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,241,45,0.12)' }}>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.3)', marginBottom: '1rem', textTransform: 'uppercase' }}>
              Related Legal Documents
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {RELATED.map((r) => (
                <Link key={r.href} href={r.href} style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', padding: '0.4rem 0.85rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#FFF12D'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,241,45,0.4)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.5)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}
                >
                  {r.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </>
  );
}
