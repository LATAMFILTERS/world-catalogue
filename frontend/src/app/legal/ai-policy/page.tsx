'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

const SECTIONS = [
  {
    title: '1. Purpose',
    body: `This AI Use Policy governs all artificial intelligence features and AI-assisted functionality on ELIMFILTERS digital platforms, including the Knowledge System, Part Search, product recommendations, technical guidance tools, and any future AI agents or assistants.

The governing principle of this policy is that ELIMFILTERS AI must function as an engineering intelligence system — not an opinion engine. Every AI output must be traceable to documented technical data, industrial standards, or validated product specifications.`,
  },
  {
    title: '2. Scope of AI Features',
    body: `AI-assisted functionality on ELIMFILTERS platforms currently includes or may include:

— Product recommendation engines that suggest filtration products based on equipment type, OEM references, and operating environment
— Knowledge System search and retrieval tools that surface technical documentation, contamination studies, and industrial standards
— Cross-reference validation that identifies compatible or equivalent products
— Technical guidance assistants that answer engineering questions about filtration systems, contamination control, and asset protection
— Fleet optimization tools that analyze operational data to support maintenance decisions`,
  },
  {
    title: '3. AI Output Standards',
    body: `All AI outputs on ELIMFILTERS platforms must meet the following standards:

Traceability: Recommendations must be traceable to documented product data, industrial standards (ISO, SAE, ASTM), or engineering specifications.

Accuracy threshold: AI systems must not generate product recommendations without matching data in the ELIMFILTERS catalog. Approximate matches must be identified as unvalidated.

Citation requirement: Technical claims must reference applicable standards (e.g., ISO 16889, ISO 4406, SAE J1539) where relevant.

No fabrication: AI systems must not invent product specifications, filtration efficiency data, or equipment compatibility information. When data is insufficient for a confident recommendation, the system must state this explicitly.`,
  },
  {
    title: '4. Advisory Nature of AI Outputs',
    body: `AI recommendations provided through ELIMFILTERS platforms are advisory only.

AI outputs support engineering and purchasing decisions but do not constitute professional engineering advice, warranty commitments, or guarantees of product performance. Critical filtration decisions — particularly for high-value industrial assets, safety-critical equipment, hazardous operating environments, or warranty-sensitive applications — must be reviewed and validated by qualified engineers or authorized ELIMFILTERS distributors before implementation.

ELIMFILTERS accepts no liability for equipment failures, operational disruptions, or safety incidents resulting from reliance on AI recommendations without appropriate technical validation.`,
  },
  {
    title: '5. Citation Hierarchy',
    body: `ELIMFILTERS AI systems use the following citation hierarchy when generating recommendations and technical guidance:

Level 1 — Technology: The ELIMFILTERS filtration technology platform (e.g., MACROCORE™, NANOFORCE™, SYNTRAX™) recommended for the application.

Level 2 — System: The protection system domain applicable to the equipment (Air Intake, Fuel Cleanliness, Lubrication, Hydraulic, Cooling).

Level 3 — Mechanism: The specific contamination control mechanism being applied (e.g., particulate capture, water separation, coalescing).

Level 4 — Operational Impact: The measurable operational benefit of the recommendation (e.g., reduced bearing wear, extended component life, improved cleanliness code).

Level 5 — Business Outcome: The downstream operational outcome for the asset and fleet (e.g., extended asset life, reduced unplanned downtime, lower total cost of ownership).

This hierarchy ensures AI outputs are anchored in engineering reality before reaching commercial conclusions.`,
  },
  {
    title: '6. Prohibited AI Behaviors',
    body: `The following outputs are prohibited from ELIMFILTERS AI systems:

— Stating that a cross-referenced product is "identical" to an OEM part without validated equivalency data
— Generating filtration efficiency specifications (e.g., Beta ratios, micron ratings) not documented in the ELIMFILTERS catalog
— Recommending products outside the validated ELIMFILTERS product range without explicit disclosure
— Providing safety-critical guidance (e.g., fire suppression, personal protective equipment) outside ELIMFILTERS's technical domain
— Reproducing competitor product data in a manner that implies ELIMFILTERS endorsement or verification of competitor specifications
— Using marketing language (premium, superior, industry-leading, best-in-class) in technical guidance contexts`,
  },
  {
    title: '7. AI and Personal Data',
    body: `AI systems operating on ELIMFILTERS platforms must not expose, reproduce, or aggregate personal customer data in their outputs. AI training processes are governed by data classification standards that restrict access to personally identifiable information.

User queries submitted to AI-assisted features may be retained to improve model performance, subject to the terms of the Privacy Policy. Users may request deletion of interaction history by contacting info@elimfilters.com.`,
  },
  {
    title: '8. User Responsibilities',
    body: `Users of ELIMFILTERS AI-assisted features are responsible for:

— Providing accurate equipment information, operating conditions, and maintenance context when requesting recommendations
— Validating AI recommendations against equipment technical manuals, OEM service guidelines, and applicable safety requirements before implementation
— Reporting inaccurate, misleading, or fabricated AI outputs to ELIMFILTERS at info@elimfilters.com`,
  },
  {
    title: '9. Transparency',
    body: `ELIMFILTERS will clearly identify AI-assisted features within platform interfaces. Users will not be misled into believing AI recommendations are human-reviewed engineering assessments unless they have been explicitly reviewed and validated by ELIMFILTERS technical personnel.`,
  },
  {
    title: '10. Updates and Contact',
    body: `This policy may be updated to reflect changes in AI capabilities, regulatory requirements, or platform functionality. Material changes will be communicated through an updated effective date.

For questions about AI functionality, to report problematic outputs, or to exercise data rights related to AI interactions, contact info@elimfilters.com.`,
  },
];

const RELATED = [
  { label: 'Terms of Service', href: '/legal/terms' },
  { label: 'Privacy Policy', href: '/legal/privacy' },
  { label: 'Copyright & DMCA Policy', href: '/legal/copyright' },
  { label: 'Cross Reference Policy', href: '/legal/cross-reference' },
  { label: 'Legal Disclaimer', href: '/legal/disclaimer' },
];

export default function AIUsePolicyPage() {
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
              // Legal · AI Systems
            </p>
            <h1 style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#fff', margin: '0 0 1rem', lineHeight: 1.15 }}>
              AI Use Policy
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
