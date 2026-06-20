'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: `By accessing or using any ELIMFILTERS digital platform, including elimfilters.com, the Part Search platform, the Knowledge System, and any associated APIs or services, you agree to be bound by these Terms of Service. If you do not agree to these terms, you must discontinue use immediately.

These terms apply to all visitors, users, distributors, and technical personnel accessing ELIMFILTERS platforms for any purpose.`,
  },
  {
    title: '2. Platform Purpose',
    body: `ELIMFILTERS digital platforms are designed to support industrial asset protection through contamination control education, product information, part search, and distributor support.

All content — including Knowledge System articles, technical specifications, cross-reference data, and AI-generated recommendations — is provided for informational purposes in support of engineering and purchasing decisions. Content does not constitute professional engineering advice and must be validated by qualified engineers before implementation.`,
  },
  {
    title: '3. Intellectual Property',
    body: `All content published on ELIMFILTERS platforms — including text, technical documentation, product data, filtration system architectures, technology descriptions, proprietary technology names (MACROCORE™, NANOFORCE™, SYNTRAX™, DURATECH™, MARINECLEAN™, and others), imagery, and code — is the exclusive property of ELIMFILTERS or its licensors.

Unauthorized reproduction, redistribution, scraping, or commercial use of any ELIMFILTERS content without express written permission is prohibited. Educational and research use with proper attribution is permitted under the conditions defined in the Copyright & DMCA Policy.`,
  },
  {
    title: '4. Cross-Reference Data',
    body: `Cross-reference data on ELIMFILTERS platforms identifies compatible or equivalent filtration products for equipment maintenance purposes. Cross-reference relationships are not warranties of identical performance, media technology, or lifecycle.

OEM part numbers referenced on this platform are the property of their respective manufacturers. Their use is for identification purposes only and does not imply any affiliation, endorsement, or partnership between ELIMFILTERS and any OEM manufacturer.

Users are responsible for validating fitment, function, and performance requirements before installation. See the Cross Reference Policy for detailed classification rules.`,
  },
  {
    title: '5. AI-Generated Content',
    body: `ELIMFILTERS platforms may include AI-assisted features for product recommendations, knowledge retrieval, and technical guidance. All AI outputs are generated based on ELIMFILTERS engineering data and industry standards.

AI recommendations are advisory only. Critical filtration decisions — particularly for high-value industrial assets, hazardous operating environments, or warranty-sensitive applications — must be reviewed and validated by qualified personnel before implementation.

See the AI Use Policy for full terms governing AI interactions on this platform.`,
  },
  {
    title: '6. Distributor and Account Obligations',
    body: `Distributors and authorized partners accessing ELIMFILTERS platform tools, pricing data, or inventory systems agree to maintain the confidentiality of access credentials and business data. Account sharing, resale of platform access, or unauthorized extraction of catalog data is prohibited.

Distributor obligations are additionally governed by the applicable Distributor Agreement.`,
  },
  {
    title: '7. Limitation of Liability',
    body: `ELIMFILTERS provides platforms and content on an "as available" basis. To the fullest extent permitted by applicable law, ELIMFILTERS disclaims liability for:

— Equipment failures resulting from incorrect product selection based on platform data
— Downtime, operational loss, or consequential damages arising from reliance on platform content
— Inaccuracies in third-party cross-reference data
— Service interruptions or data loss

Users accept full responsibility for validating product selections against their specific equipment and operating conditions.`,
  },
  {
    title: '8. Modifications',
    body: `ELIMFILTERS reserves the right to modify these Terms of Service at any time. Continued use of the platform following modification constitutes acceptance of the updated terms. Material changes will be communicated through platform notices where feasible.`,
  },
  {
    title: '9. Governing Law',
    body: `These Terms of Service are governed by applicable law in the jurisdiction of ELIMFILTERS's principal place of business. Disputes shall be resolved through good-faith negotiation before any formal proceedings are initiated.`,
  },
  {
    title: '10. Contact',
    body: `For questions regarding these Terms of Service, contact ELIMFILTERS at info@elimfilters.com.`,
  },
];

const RELATED: { label: string; href: string }[] = [
  { label: 'Privacy Policy', href: '/legal/privacy' },
  { label: 'AI Use Policy', href: '/legal/ai-policy' },
  { label: 'Copyright & DMCA Policy', href: '/legal/copyright' },
  { label: 'Cross Reference Policy', href: '/legal/cross-reference' },
  { label: 'Legal Disclaimer', href: '/legal/disclaimer' },
];

export default function TermsOfServicePage() {
  return (
    <>
      <Navigation />
      <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

        {/* Back nav */}
        <div style={{ padding: '1.5rem 8%', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <Link href="/" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>
            ← ELIMFILTERS
          </Link>
        </div>

        {/* Hero */}
        <section style={{ padding: '4rem 8% 3rem', borderBottom: '1px solid rgba(255,241,45,0.08)' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', letterSpacing: '0.18em', color: '#FFF12D', opacity: 0.8, marginBottom: '1rem', textTransform: 'uppercase' }}>
              // Legal · Terms
            </p>
            <h1 style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#fff', margin: '0 0 1rem', lineHeight: 1.15 }}>
              Terms of Service
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
              Last updated: June 2026
            </p>
          </motion.div>
        </section>

        {/* Content */}
        <div style={{ maxWidth: '820px', margin: '0 auto', padding: '4rem 8%' }}>
          {SECTIONS.map((s, i) => (
            <motion.section
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: i * 0.04 }}
              viewport={{ once: true, margin: '-40px' }}
              style={{ marginBottom: '2.5rem', paddingBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
            >
              <h2 style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '1.05rem', color: '#FFF12D', marginBottom: '0.9rem', lineHeight: 1.3 }}>
                {s.title}
              </h2>
              {s.body.split('\n\n').map((para, j) => (
                <p key={j} style={{ fontFamily: 'var(--font-body)', fontSize: '0.92rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, marginBottom: '0.75rem' }}>
                  {para}
                </p>
              ))}
            </motion.section>
          ))}

          {/* Related legal links */}
          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,241,45,0.12)' }}>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.3)', marginBottom: '1rem', textTransform: 'uppercase' }}>
              Related Legal Documents
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {RELATED.map((r) => (
                <Link key={r.href} href={r.href} style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', padding: '0.4rem 0.85rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', transition: 'color 0.2s, border-color 0.2s' }}
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
