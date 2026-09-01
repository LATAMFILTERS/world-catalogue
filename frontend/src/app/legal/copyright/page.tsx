'use client';

import '@/i18n';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Footer } from '@/components/Footer';

const SECTIONS = [
  {
    title: '1. Ownership of Content',
    body: `All content published on ELIMFILTERS digital platforms — including but not limited to technical documentation, Knowledge System articles, filtration system architecture descriptions, product specifications, contamination analysis, industrial standards interpretations, proprietary technology descriptions, imagery, diagrams, code, and data structures — is the exclusive intellectual property of ELIMFILTERS or its licensors.

Proprietary technology names including MACROCORE™, MICROKAPPA™, DRYCORE™, INTEKCORE™, SYNTAPORE™, SYNTRAX™, NANOFORCE™, HYDROCORE™, THERMACORE™, DURATECH™, and MARINECLEAN™ are trademarks of ELIMFILTERS. These marks may not be used without express written permission.`,
  },
  {
    title: '2. Permitted Uses',
    body: `The following uses of ELIMFILTERS content are permitted without prior written approval:

Educational and research use: Content may be quoted, cited, or referenced in academic research, technical education, or industrial training materials, provided the source is clearly attributed as "ELIMFILTERS (elimfilters.com)" and the content is reproduced accurately without modification.

Internal business use: Distributors, customers, and authorized partners may reproduce limited portions of technical documentation for internal maintenance planning, training, or procurement purposes.

Journalistic and editorial coverage: Media organizations may reference ELIMFILTERS content in factual reporting with appropriate attribution.

All permitted uses require accurate attribution. Modified or decontextualized use of ELIMFILTERS technical content is not permitted.`,
  },
  {
    title: '3. Prohibited Uses',
    body: `The following uses of ELIMFILTERS content are prohibited without prior written authorization:

— Reproduction, redistribution, or publication of substantial portions of ELIMFILTERS technical documentation on third-party websites, platforms, or publications
— Commercial use of ELIMFILTERS content, including resale, licensing, or integration into paid products or services
— Automated scraping, crawling, or harvesting of ELIMFILTERS platform content for AI training, competitive intelligence, or data aggregation purposes
— Removal or alteration of copyright notices, attribution statements, or proprietary marks
— Reproduction of ELIMFILTERS cross-reference data in competing catalogs, databases, or part search platforms
— Use of ELIMFILTERS proprietary technology names in a manner that suggests product equivalence with third-party products`,
  },
  {
    title: '4. Cross-Reference Data',
    body: `Cross-reference data published on ELIMFILTERS platforms — including OEM reference numbers, competitor cross-reference numbers, and ELIMFILTERS product matches — is compiled from publicly available sources and validated internal data.

OEM part numbers referenced are the property of their respective manufacturers (Caterpillar, Cummins, Komatsu, Volvo, Deutz, John Deere, and others) and are used for identification purposes only. Reference to OEM numbers does not imply affiliation, endorsement, or certification by OEM manufacturers.

Competitor cross-reference numbers are referenced for product identification purposes only and do not imply certification, endorsement, or verified equivalence by ELIMFILTERS.`,
  },
  {
    title: '5. DMCA Notice and Takedown Procedure',
    body: `ELIMFILTERS respects the intellectual property rights of others and complies with the Digital Millennium Copyright Act (DMCA) and equivalent international copyright frameworks.

If you believe that content on an ELIMFILTERS platform infringes your copyright, submit a written notice to info@elimfilters.com containing:

1. Your name and contact information (email, address, phone number)
2. Identification of the copyrighted work you claim has been infringed
3. Identification of the infringing material and its URL on the ELIMFILTERS platform
4. A statement that you have a good-faith belief that the use is not authorized by the copyright owner, its agent, or applicable law
5. A statement that the information in the notice is accurate and, under penalty of perjury, that you are authorized to act on behalf of the copyright owner
6. Your physical or electronic signature

ELIMFILTERS will review valid DMCA notices and take appropriate action, which may include removal of the disputed content while the claim is investigated.`,
  },
  {
    title: '6. Counter-Notification',
    body: `If you believe content removed in response to a DMCA notice was removed in error or misidentification, you may submit a counter-notification to info@elimfilters.com containing:

1. Your name and contact information
2. Identification of the removed material and its former location
3. A statement under penalty of perjury that you have a good-faith belief the material was removed as a result of mistake or misidentification
4. Your consent to the jurisdiction of the relevant federal district court, or if outside the United States, to the jurisdiction of the courts where your address is located
5. Your physical or electronic signature

Upon receipt of a valid counter-notification, ELIMFILTERS will notify the original complainant and may restore the removed content within the timeframes required by applicable law.`,
  },
  {
    title: '7. Repeat Infringement',
    body: `ELIMFILTERS maintains a policy of terminating access for users or entities that are found to be repeat copyright infringers following proper notification processes.`,
  },
  {
    title: '8. License Requests',
    body: `Organizations seeking permission to reproduce, republish, or commercially use ELIMFILTERS content beyond the permitted uses described above should contact info@elimfilters.com with:

— A description of the intended use
— The specific content to be used
— The platform or publication where it will appear
— The proposed duration and geographic scope of use

ELIMFILTERS will review license requests on a case-by-case basis.`,
  },
  {
    title: '9. Contact',
    body: `For copyright inquiries, DMCA notices, counter-notifications, or license requests, contact ELIMFILTERS at info@elimfilters.com.`,
  },
];

const RELATED = [
  { label: 'Terms of Service', href: '/legal/terms' },
  { label: 'Privacy Policy', href: '/legal/privacy' },
  { label: 'AI Use Policy', href: '/legal/ai-policy' },
  { label: 'Cross Reference Policy', href: '/legal/cross-reference' },
  { label: 'Legal Disclaimer', href: '/legal/disclaimer' },
];

export default function CopyrightDMCAPage() {
  return (
    <>
      <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

        <div style={{ padding: '1.5rem 8%', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <Link href="/" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>
            ← ELIMFILTERS
          </Link>
        </div>

        <section style={{ padding: '4rem 8% 3rem', borderBottom: '1px solid rgba(255,241,45,0.08)' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', letterSpacing: '0.18em', color: '#FFF12D', opacity: 0.8, marginBottom: '1rem', textTransform: 'uppercase' }}>
              {'Legal · Copyright'}
            </p>
            <h1 style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#fff', margin: '0 0 1rem', lineHeight: 1.15, textAlign: 'justify' }}>
              Copyright & DMCA Policy
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
