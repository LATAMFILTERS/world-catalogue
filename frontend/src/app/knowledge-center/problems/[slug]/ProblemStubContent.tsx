'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  PROBLEM_STUBS,
  PROBLEM_CATEGORY_LABELS,
  PROBLEM_SEVERITY_COLORS,
} from '@/lib/knowledge-center';
import type { ProblemStub } from '@/lib/knowledge-center';
import type { ProblemFaqItem } from '@/lib/knowledge-center/article-registry';
import {
  ArticleBreadcrumb,
  WarningBox,
  SpecificationTable,
  ArticleSchema,
} from '@/components/knowledge-center';

function FaqAccordion({ faqs }: { faqs: ProblemFaqItem[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {faqs.map((faq, i) => (
        <div key={i} style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.015)' }}>
          <button
            onClick={() => setOpenIdx(openIdx === i ? null : i)}
            style={{
              width: '100%', background: 'none', border: 'none', padding: '1rem 1.25rem',
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              cursor: 'pointer', textAlign: 'left', gap: '1rem',
            }}
          >
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', fontWeight: 500, color: '#fff', lineHeight: 1.4 }}>
              {faq.question}
            </span>
            <span style={{ color: '#FFF12D', fontSize: '1.1rem', flexShrink: 0, marginTop: '1px' }}>
              {openIdx === i ? '−' : '+'}
            </span>
          </button>
          {openIdx === i && (
            <div style={{ padding: '0 1.25rem 1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', lineHeight: 1.75, color: 'rgba(255,255,255,0.65)', textAlign: 'justify', marginTop: '0.75rem' }}>
                {faq.answer}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const CATEGORY_ORDER_INDEX: Record<string, number> = {
  'mechanical-wear': 0,
  'contamination': 1,
  'structural-failure': 2,
  'chemical-degradation': 3,
  'biological': 4,
};
void CATEGORY_ORDER_INDEX;

export default function ProblemStubContent({ problem }: { problem: ProblemStub }) {
  const severityColor = PROBLEM_SEVERITY_COLORS[problem.severity];

  const relatedProblems = PROBLEM_STUBS.filter(
    (p) => p.slug !== problem.slug && p.category === problem.category
  ).slice(0, 3);

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

      <ArticleBreadcrumb items={[
        { label: 'Knowledge Center', href: '/knowledge-center' },
        { label: 'Problem Graph', href: '/knowledge-center/problems' },
        { label: problem.name },
      ]} />

      {/* Hero */}
      <section style={{
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 5vw, 4rem)',
      }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.65rem',
                letterSpacing: '0.1em',
                color: '#FFF12D',
                textTransform: 'uppercase',
              }}>
                {PROBLEM_CATEGORY_LABELS[problem.category]}
              </span>
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.65rem',
                color: 'rgba(255,255,255,0.25)',
                letterSpacing: '0.06em',
              }}>
                {problem.id}
              </span>
            </div>

            <h1 style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
              lineHeight: 1.15,
              marginBottom: '1.5rem',
              color: '#fff',
            }}>
              {problem.name}
            </h1>

            <span style={{
              display: 'inline-block',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.65rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: severityColor,
              border: `1px solid ${severityColor}50`,
              borderRadius: '4px',
              padding: '3px 10px',
            }}>
              {problem.severity} severity
            </span>
          </motion.div>
        </div>
      </section>

      <div style={{
        maxWidth: '860px',
        margin: '0 auto',
        padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 5vw, 4rem)',
      }}>

        {/* Definition section */}
        {problem.definition && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            style={{ marginBottom: '2.5rem' }}
          >
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.65rem',
              letterSpacing: '0.1em',
              color: 'rgba(255,241,45,0.5)',
              marginBottom: '0.75rem',
            }}>
              DEFINITION
            </p>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.95rem',
              lineHeight: 1.8,
              color: 'rgba(255,255,255,0.68)',
              textAlign: 'justify',
            }}>
              {problem.definition}
            </p>
          </motion.div>
        )}

        {/* Key Parameters */}
        {problem.keyParameters && problem.keyParameters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12 }}
            style={{ marginBottom: '3rem' }}
          >
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.65rem',
              letterSpacing: '0.1em',
              color: 'rgba(255,255,255,0.3)',
              marginBottom: '1rem',
            }}>
              KEY PARAMETERS
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1px',
              background: 'rgba(255,241,45,0.08)',
              border: '1px solid rgba(255,241,45,0.12)',
            }}>
              {problem.keyParameters.map((param) => (
                <div key={param.label} style={{ background: '#000', padding: '1.1rem 1.25rem' }}>
                  <p style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    color: '#FFF12D',
                    marginBottom: '0.2rem',
                  }}>
                    {param.value}
                  </p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>
                    {param.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Sections */}
        {problem.sections && problem.sections.map((section, i) => (
          <motion.section
            key={section.heading}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.14 + i * 0.06 }}
            style={{ marginBottom: '2.5rem' }}
          >
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.6rem',
              letterSpacing: '0.1em',
              color: 'rgba(255,241,45,0.5)',
              marginBottom: '0.5rem',
            }}>
              {String(i + 1).padStart(2, '0')} /
            </p>
            <h2 style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 600,
              fontSize: '1.2rem',
              color: '#fff',
              marginBottom: '0.875rem',
              lineHeight: 1.2,
              textAlign: 'justify',
            }}>
              {section.heading}
            </h2>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.93rem',
              lineHeight: 1.8,
              color: 'rgba(255,255,255,0.68)',
              textAlign: 'justify',
            }}>
              {section.body}
            </p>
          </motion.section>
        ))}

        {/* FAQ Section */}
        {problem.faqs && problem.faqs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{ marginBottom: '3rem' }}
          >
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.12em', color: 'rgba(255,241,45,0.5)', marginBottom: '1.25rem' }}>
              FREQUENTLY ASKED QUESTIONS
            </p>
            <FaqAccordion faqs={problem.faqs} />
          </motion.div>
        )}

        {/* Related problems — pill links (same category) */}
        {relatedProblems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.65rem',
              color: 'rgba(255,255,255,0.3)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}>
              Related Problems — {PROBLEM_CATEGORY_LABELS[problem.category]}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {relatedProblems.map((p) => (
                <Link
                  key={p.slug}
                  href={`/knowledge-center/problems/${p.slug}`}
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.7rem',
                    color: 'rgba(255,255,255,0.45)',
                    textDecoration: 'none',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '4px',
                    padding: '4px 10px',
                  }}
                >
                  {p.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <ArticleSchema data={{
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        '@id': `https://elimfilters.com/knowledge-center/problems/${problem.slug}`,
        name: problem.name,
        description: `${problem.id}: ${problem.name} — a ${problem.severity}-severity industrial failure problem in the ${PROBLEM_CATEGORY_LABELS[problem.category]} category.`,
        url: `https://elimfilters.com/knowledge-center/problems/${problem.slug}`,
        isPartOf: { '@id': 'https://elimfilters.com/knowledge-center/problems' },
        author: { '@id': 'https://elimfilters.com/#organization' },
        identifier: problem.id,
      }} />
    </main>
  );
}
