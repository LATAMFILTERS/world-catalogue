'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import {
  PROBLEM_STUBS,
  PROBLEM_CATEGORY_LABELS,
  PROBLEM_SEVERITY_COLORS,
} from '@/lib/knowledge-center';
import type { ProblemStub } from '@/lib/knowledge-center';
import {
  ArticleBreadcrumb,
  WarningBox,
  SpecificationTable,
  ArticleSchema,
} from '@/components/knowledge-center';

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

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <WarningBox variant="draft">
            This Problem Graph entity is registered with permanent identifier{' '}
            <span style={{ fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
              {problem.id}
            </span>
            . Engineering content — definition, failure progression, affected components, contamination sources,
            and technology recommendations — is scheduled for the Phase 3 Engineering Data Layer.
          </WarningBox>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <SpecificationTable
            title="KC-00 Governance Metadata"
            labelWidth="200px"
            rows={[
              { label: 'Permanent ID', value: problem.id },
              { label: 'Entity Type', value: 'Problem (PROB-xxx)' },
              { label: 'Category', value: PROBLEM_CATEGORY_LABELS[problem.category] },
              { label: 'Severity', value: problem.severity.charAt(0).toUpperCase() + problem.severity.slice(1) },
              { label: 'Status', value: 'Draft' },
              { label: 'Content Phase', value: 'Phase 3 — Engineering Data Layer' },
            ]}
          />
        </motion.div>

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
