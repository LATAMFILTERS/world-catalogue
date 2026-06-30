'use client';

import '@/i18n';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

const SECTIONS = [
  {
    title: '1. Purpose and Scope',
    body: `This Privacy Policy defines how ELIMFILTERS collects, uses, protects, and governs personal and operational data across all ELIMFILTERS digital platforms, including elimfilters.com, the Part Search platform, the Knowledge System, distributor tools, and any APIs or services operated by ELIMFILTERS.

The core principle of this policy is that data must be collected with purpose, protected with discipline, and used responsibly to improve asset protection outcomes — not to exploit users or generate revenue through data resale.`,
  },
  {
    title: '2. Data We Collect',
    body: `ELIMFILTERS may collect the following categories of data depending on how you interact with our platforms:

Contact and identity data: name, email address, company name, job title, country, and phone number, collected when you submit forms, register an account, or request distributor information.

Equipment and asset data: equipment type, OEM references, operating environment, and maintenance parameters, collected when you use Part Search or submit technical inquiries.

Search and usage data: search queries, pages visited, filter selections, and interaction patterns, collected automatically through platform analytics to improve search accuracy and content relevance.

AI interaction data: queries submitted to AI-assisted features, technical questions, and recommendation requests.

Distributor business data: sales data, territory information, and account credentials, collected as part of distributor partner programs.`,
  },
  {
    title: '3. How We Use Your Data',
    body: `Data collected by ELIMFILTERS is used to:

— Respond to technical inquiries, warranty claims, and distributor support requests
— Improve Part Search accuracy and product recommendation quality
— Deliver relevant Knowledge System content and technical documentation
— Build and refine asset protection recommendations for industrial equipment
— Operate and improve platform performance, security, and reliability
— Support distributor network management and territory reporting
— Comply with applicable legal obligations

ELIMFILTERS does not sell, rent, or trade personal data to third parties for advertising or marketing purposes.`,
  },
  {
    title: '4. AI and Machine Learning Systems',
    body: `ELIMFILTERS operates AI systems for product recommendations, knowledge retrieval, and technical guidance. These systems process search queries, equipment data, and usage patterns to improve recommendation quality.

AI systems must not expose private customer data in their outputs. AI training processes are governed by internal data classification standards that restrict access to personally identifiable information.

Interactions with AI-assisted features may be retained to improve model performance. Users may request deletion of interaction history under the rights described in Section 7.`,
  },
  {
    title: '5. Data Sharing',
    body: `ELIMFILTERS shares data only under the following conditions:

Service providers: Third-party providers operating hosting, analytics, email delivery, or CRM infrastructure under contractual data processing agreements requiring equivalent protection standards.

Distributors: Equipment and product inquiry data may be shared with authorized ELIMFILTERS distributors in your region to facilitate local support. Distributor partners are bound by confidentiality obligations.

Legal requirements: Data may be disclosed when required by applicable law, court order, or governmental authority. ELIMFILTERS will notify affected users where legally permitted to do so.

ELIMFILTERS does not share data with advertising networks, data brokers, or social media platforms for targeting purposes.`,
  },
  {
    title: '6. Data Protection',
    body: `ELIMFILTERS implements technical and organizational measures to protect collected data against unauthorized access, disclosure, alteration, or destruction:

— Encrypted transmission (TLS) for all platform communications
— Access control for internal systems handling customer data
— Audit logging for administrative access to customer records
— Secure credential storage following industry-standard hashing practices
— Regular security review of data handling processes

No transmission method over the internet or electronic storage is 100% secure. ELIMFILTERS applies reasonable protection measures consistent with the sensitivity of the data collected.`,
  },
  {
    title: '7. Your Rights',
    body: `Where applicable under local privacy regulations, you have the right to:

Access: Request a copy of personal data ELIMFILTERS holds about you.
Correction: Request correction of inaccurate or incomplete data.
Deletion: Request deletion of your personal data, subject to legal retention requirements.
Export: Request a portable copy of your data in a standard format.
Restriction: Request that processing of your data be restricted in certain circumstances.
Objection: Object to processing based on legitimate interests.

To exercise any of these rights, contact ELIMFILTERS at info@elimfilters.com with your request. ELIMFILTERS will respond within a reasonable timeframe consistent with applicable law.`,
  },
  {
    title: '8. Data Retention',
    body: `ELIMFILTERS retains data for as long as necessary to fulfil the purpose for which it was collected, to maintain platform functionality, or to comply with applicable legal requirements. When data is no longer needed, it is securely deleted or anonymized.

Distributor data is retained for the duration of the distributor relationship and for applicable post-termination periods required by law or contract.`,
  },
  {
    title: '9. Cookies and Analytics',
    body: `ELIMFILTERS platforms use cookies and similar technologies to maintain session state, analyze traffic patterns, and improve user experience. Analytics tools may collect aggregated data about page visits, search queries, and feature usage.

Users may manage cookie preferences through their browser settings. Disabling cookies may limit certain platform functionality.`,
  },
  {
    title: '10. Updates to This Policy',
    body: `ELIMFILTERS may update this Privacy Policy to reflect changes in platform functionality, data handling practices, or applicable regulations. Material changes will be indicated by an updated effective date. Continued use of ELIMFILTERS platforms following a policy update constitutes acceptance of the revised policy.`,
  },
  {
    title: '11. Contact',
    body: `For privacy-related inquiries, data subject requests, or concerns about data handling practices, contact ELIMFILTERS at info@elimfilters.com.`,
  },
];

const RELATED = [
  { label: 'Terms of Service', href: '/legal/terms' },
  { label: 'AI Use Policy', href: '/legal/ai-policy' },
  { label: 'Copyright & DMCA Policy', href: '/legal/copyright' },
  { label: 'Cross Reference Policy', href: '/legal/cross-reference' },
  { label: 'Legal Disclaimer', href: '/legal/disclaimer' },
];

export default function PrivacyPolicyPage() {
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
              // Legal · Privacy
            </p>
            <h1 style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#fff', margin: '0 0 1rem', lineHeight: 1.15, textAlign: 'justify' }}>
              Privacy Policy
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
