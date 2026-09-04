'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { useState } from 'react';
import { KCArticle } from '@/lib/knowledge-center-data';
import {
  ArticleBreadcrumb,
  ArticleHero,
  ArticleLayout,
  EngineeringNote,
  ISOStandardCard,
  KCTechnologyCard,
  RelatedArticles,
  ArticleSchema,
  CitationBlock,
} from '@/components/knowledge-center';
import DiagramBlock from '@/components/knowledge-center/DiagramBlock';
import { getArticleSidebarData } from '@/lib/knowledge-center/navigation-index';
import { getDiagramsForArticle } from '@/lib/knowledge-center-data';
import type { KCDecisionNode } from '@/lib/knowledge-center-data';

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#ff4444',
  high:     '#ff8c00',
  medium:   '#FFF12D',
  low:      '#44ff88',
};

const CONTENT_LEVEL_LABEL: Record<string, string> = {
  introductory: 'INTRODUCTORY',
  intermediate: 'INTERMEDIATE',
  advanced:     'ADVANCED',
  expert:       'EXPERT',
};

const CONTENT_LEVEL_COLOR: Record<string, string> = {
  introductory: '#44ff88',
  intermediate: '#FFF12D',
  advanced:     '#ff8c00',
  expert:       '#ff4444',
};

const REF_CATEGORY_LABEL: Record<string, string> = {
  standard:     'STANDARD',
  specification: 'SPECIFICATION',
  research:     'RESEARCH',
  handbook:     'HANDBOOK',
  regulation:   'REGULATION',
  'test-method': 'TEST METHOD',
};

function FaqAccordion({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: '#000' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          padding: '1rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          cursor: 'pointer',
          gap: '1rem',
          textAlign: 'left',
        }}
      >
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: '0.9rem',
          color: open ? '#fff' : 'rgba(255,255,255,0.7)',
          lineHeight: 1.5,
          margin: 0,
          transition: 'color 0.2s',
        }}>
          {question}
        </p>
        <span style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.85rem',
          color: 'rgba(255,241,45,0.5)',
          minWidth: '1rem',
          transition: 'transform 0.2s',
          transform: open ? 'rotate(45deg)' : 'none',
        }}>
          +
        </span>
      </button>
      {open && (
        <div style={{ padding: '0 1.25rem 1rem', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.88rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.55)',
            margin: '0.75rem 0 0',
          }}>
            {answer}
          </p>
        </div>
      )}
    </div>
  );
}

function DecisionGuideWidget({ nodes, startNode }: { nodes: KCDecisionNode[]; startNode: string }) {
  const [currentId, setCurrentId] = useState(startNode);
  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const current = nodeMap[currentId];
  if (!current) return null;

  return (
    <div>
      <motion.div
        key={currentId}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        style={{
          border: '1px solid rgba(255,241,45,0.15)',
          background: 'rgba(255,241,45,0.02)',
          padding: '1.25rem 1.5rem',
          marginBottom: '0.75rem',
        }}
      >
        {current.result ? (
          <>
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.6rem',
              letterSpacing: '0.1em',
              color: '#44ff88',
              marginBottom: '0.5rem',
            }}>
              RECOMMENDATION
            </p>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.92rem',
              lineHeight: 1.75,
              color: 'rgba(255,255,255,0.8)',
              marginBottom: current.note ? '0.75rem' : 0,
            }}>
              {current.result}
            </p>
            {current.note && (
              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.8rem',
                lineHeight: 1.65,
                color: 'rgba(255,255,255,0.45)',
                marginTop: '0.5rem',
                fontStyle: 'italic',
              }}>
                {current.note}
              </p>
            )}
          </>
        ) : (
          <>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.95rem',
              fontWeight: 500,
              lineHeight: 1.65,
              color: '#fff',
              marginBottom: current.note ? '0.5rem' : '1rem',
            }}>
              {current.question}
            </p>
            {current.note && (
              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.8rem',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.45)',
                marginBottom: '1rem',
                fontStyle: 'italic',
              }}>
                {current.note}
              </p>
            )}
          </>
        )}
      </motion.div>

      {!current.result && (
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {current.yes && (
            <motion.button
              whileHover={{ borderColor: 'rgba(68,255,136,0.5)', color: '#44ff88' }}
              onClick={() => setCurrentId(current.yes!)}
              style={{
                background: 'rgba(68,255,136,0.04)',
                border: '1px solid rgba(68,255,136,0.2)',
                color: 'rgba(68,255,136,0.7)',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.7rem',
                letterSpacing: '0.08em',
                padding: '0.5rem 1.25rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              YES →
            </motion.button>
          )}
          {current.no && (
            <motion.button
              whileHover={{ borderColor: 'rgba(255,140,0,0.5)', color: '#ff8c00' }}
              onClick={() => setCurrentId(current.no!)}
              style={{
                background: 'rgba(255,140,0,0.04)',
                border: '1px solid rgba(255,140,0,0.2)',
                color: 'rgba(255,140,0,0.7)',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.7rem',
                letterSpacing: '0.08em',
                padding: '0.5rem 1.25rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              NO →
            </motion.button>
          )}
        </div>
      )}

      {current.result && (
        <button
          onClick={() => setCurrentId(startNode)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,241,45,0.4)',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            letterSpacing: '0.1em',
            cursor: 'pointer',
            padding: '0.25rem 0',
          }}
        >
          ↩ RESTART
        </button>
      )}
    </div>
  );
}

export default function ArticleContent({ article }: { article: KCArticle }) {
  const sidebarData = getArticleSidebarData(article.slug);
  const relatedDiagrams = getDiagramsForArticle(article.slug);

  const sidebar = (
    <>
      {sidebarData.relatedStandards.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.3)',
            marginBottom: '0.75rem',
          }}>
            RELEVANT STANDARDS
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {sidebarData.relatedStandards.map((std) => (
              <ISOStandardCard
                key={std.permanentId}
                code={std.code}
                href={std.slug ? `/knowledge-center/standards/${std.slug}` : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {sidebarData.relatedTechnologies.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.3)',
            marginBottom: '0.75rem',
          }}>
            ELIMFILTERS TECHNOLOGIES
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {sidebarData.relatedTechnologies.map((tech) => (
              <KCTechnologyCard key={tech.permanentId} name={tech.name} />
            ))}
          </div>
        </div>
      )}

      {sidebarData.relatedSystems.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.3)',
            marginBottom: '0.75rem',
          }}>
            PROTECTION SYSTEMS
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {sidebarData.relatedSystems.map((sys) => (
              <Link key={sys.permanentId} href={`/knowledge-center/systems/${sys.slug}`} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,241,45,0.2)' }}
                  style={{
                    border: '1px solid rgba(255,255,255,0.07)',
                    padding: '0.6rem 0.875rem',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.78rem',
                    color: 'rgba(255,255,255,0.5)',
                    transition: 'all 0.2s',
                  }}
                >
                  {sys.title}
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {sidebarData.relatedProblems.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.3)',
            marginBottom: '0.75rem',
          }}>
            RELATED FAILURE MODES
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {sidebarData.relatedProblems.map((prob) => (
              <Link key={prob.permanentId} href={`/knowledge-center/problems/${prob.slug}`} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ background: 'rgba(255,255,255,0.04)' }}
                  style={{
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderLeft: `2px solid ${SEVERITY_COLORS[prob.severity]}`,
                    padding: '0.5rem 0.75rem',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.75rem',
                    color: 'rgba(255,255,255,0.5)',
                    transition: 'background 0.2s',
                  }}
                >
                  {prob.name}
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {sidebarData.relatedArticles.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.3)',
            marginBottom: '0.75rem',
          }}>
            RELATED ARTICLES
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {sidebarData.relatedArticles.map((rel) => (
              <Link key={rel.permanentId} href={`/knowledge-center/engineering/${rel.slug}`} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.65)' }}
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderLeft: '2px solid transparent',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.73rem',
                    color: 'rgba(255,255,255,0.4)',
                    lineHeight: 1.4,
                    transition: 'all 0.15s',
                  }}
                >
                  {rel.title}
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {article.keywords.length > 0 && (
        <div>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.3)',
            marginBottom: '0.75rem',
          }}>
            TOPICS
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {article.keywords.map((kw) => (
              <span key={kw} style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.7rem',
                color: 'rgba(255,255,255,0.35)',
                background: 'rgba(255,255,255,0.04)',
                padding: '0.2rem 0.5rem',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

      <ArticleBreadcrumb items={[
        { label: 'Knowledge Center', href: '/knowledge-center' },
        { label: 'Engineering', href: '/knowledge-center/engineering' },
        { label: article.title },
      ]} />

      <ArticleHero
        overline={`${article.category} · ${article.readTime}`}
        title={article.title}
        subtitle={article.subtitle}
        intro={article.intro}
      />

      {/* EEAT Metadata Panel */}
      {article.eeat && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            padding: '0 2rem',
          }}
        >
          <div style={{
            border: '1px solid rgba(255,255,255,0.06)',
            borderLeft: '2px solid rgba(255,241,45,0.3)',
            background: 'rgba(255,255,255,0.02)',
            padding: '1rem 1.25rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            marginBottom: '0.5rem',
          }}>
            <div>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.55rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.25)', marginBottom: '0.2rem' }}>REVIEWED BY</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.3 }}>
                {article.eeat.reviewerName}
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.3, marginTop: '0.1rem' }}>
                {article.eeat.reviewerTitle}
              </p>
            </div>
            <div>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.55rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.25)', marginBottom: '0.2rem' }}>DISCIPLINE</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)' }}>{article.eeat.discipline}</p>
            </div>
            <div>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.55rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.25)', marginBottom: '0.2rem' }}>LEVEL</p>
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.6rem',
                letterSpacing: '0.08em',
                color: CONTENT_LEVEL_COLOR[article.eeat.contentLevel],
                border: `1px solid ${CONTENT_LEVEL_COLOR[article.eeat.contentLevel]}30`,
                padding: '0.15rem 0.5rem',
                background: `${CONTENT_LEVEL_COLOR[article.eeat.contentLevel]}0a`,
              }}>
                {CONTENT_LEVEL_LABEL[article.eeat.contentLevel]}
              </span>
            </div>
            <div>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.55rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.25)', marginBottom: '0.2rem' }}>LAST REVIEW</p>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{article.eeat.lastReviewDate}</p>
            </div>
            <div>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.55rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.25)', marginBottom: '0.2rem' }}>NEXT REVIEW</p>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{article.eeat.nextReviewDate}</p>
            </div>
            <div>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.55rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.25)', marginBottom: '0.2rem' }}>VERSION</p>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>v{article.eeat.version}</p>
            </div>
          </div>
        </motion.div>
      )}

      <ArticleLayout sidebar={sidebar}>

        {article.keyMetrics.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <EngineeringNote
              items={article.keyMetrics}
              valueSize="clamp(1.2rem, 2.5vw, 1.6rem)"
            />
            <div style={{ marginBottom: '3rem' }} />
          </motion.div>
        )}

        {article.sections.map((section, i) => (
          <motion.section
            key={section.heading}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 + i * 0.07 }}
            style={{ marginBottom: '3rem' }}
          >
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.6rem',
              letterSpacing: '0.1em',
              color: 'rgba(255,241,45,0.6)',
              marginBottom: '0.6rem',
            }}>
              {String(i + 1).padStart(2, '0')} /
            </p>
            <h2 style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 600,
              fontSize: '1.3rem',
              color: '#fff',
              marginBottom: '1rem',
              lineHeight: 1.2,
              textWrap: 'balance',
            }}>
              {section.heading}
            </h2>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.95rem',
              lineHeight: 1.8,
              color: 'rgba(255,255,255,0.7)',
            }}>
              {section.body}
            </p>

            {section.callout && section.callout.length > 0 && (
              <EngineeringNote items={section.callout} variant="white" />
            )}
          </motion.section>
        ))}

        {relatedDiagrams.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            style={{ marginBottom: '3rem' }}
          >
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.6rem',
              letterSpacing: '0.1em',
              color: 'rgba(255,241,45,0.5)',
              marginBottom: '1.25rem',
            }}>
              ENGINEERING DIAGRAMS
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {relatedDiagrams.map((diagram) => (
                <div key={diagram.entityId}>
                  <DiagramBlock
                    id={diagram.svgComponentId}
                    caption={`${diagram.title} — ${diagram.accessibility.desc.slice(0, 120)}…`}
                    aspectRatio="unset"
                  />
                  <Link
                    href={`/knowledge-center/diagrams/${diagram.slug}`}
                    style={{
                      display: 'inline-block',
                      marginTop: '0.5rem',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.65rem',
                      letterSpacing: '0.08em',
                      color: 'rgba(255,241,45,0.5)',
                      textDecoration: 'none',
                    }}
                  >
                    VIEW FULL DIAGRAM →
                  </Link>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Common Engineering Mistakes */}
        {article.commonMistakes && article.commonMistakes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.45 }}
            style={{ marginBottom: '3rem' }}
          >
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.6rem',
              letterSpacing: '0.1em',
              color: 'rgba(255,255,255,0.3)',
              marginBottom: '1rem',
            }}>
              COMMON ENGINEERING MISTAKES
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {article.commonMistakes.map((mistake, i) => (
                <div key={i} style={{
                  padding: '0.875rem 1rem 0.875rem 1.25rem',
                  border: '1px solid rgba(255,140,0,0.1)',
                  borderLeft: '2px solid rgba(255,140,0,0.5)',
                  background: 'rgba(255,140,0,0.04)',
                }}>
                  <p style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.88rem',
                    lineHeight: 1.7,
                    color: 'rgba(255,255,255,0.62)',
                    margin: 0,
                  }}>
                    {mistake}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Engineering Decision Guide */}
        {article.decisionGuide && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            style={{ marginBottom: '3rem' }}
          >
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.6rem',
              letterSpacing: '0.1em',
              color: 'rgba(255,241,45,0.5)',
              marginBottom: '0.5rem',
            }}>
              ENGINEERING DECISION GUIDE
            </p>
            <h3 style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 600,
              fontSize: '1.1rem',
              color: '#fff',
              marginBottom: '0.4rem',
            }}>
              {article.decisionGuide.title}
            </h3>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.85rem',
              color: 'rgba(255,255,255,0.45)',
              marginBottom: '1.25rem',
              lineHeight: 1.65,
            }}>
              {article.decisionGuide.description}
            </p>
            <DecisionGuideWidget
              nodes={article.decisionGuide.nodes}
              startNode={article.decisionGuide.startNode}
            />
          </motion.div>
        )}

        {/* Engineering References */}
        {article.engineeringReferences && article.engineeringReferences.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.52 }}
            style={{ marginBottom: '3rem' }}
          >
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.6rem',
              letterSpacing: '0.1em',
              color: 'rgba(255,255,255,0.3)',
              marginBottom: '1rem',
            }}>
              ENGINEERING REFERENCES
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {article.engineeringReferences.map((ref, i) => (
                <div key={i} style={{
                  padding: '0.75rem 1rem 0.75rem 1.25rem',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderLeft: '2px solid rgba(255,255,255,0.12)',
                  background: 'rgba(255,255,255,0.015)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                    <span style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.55rem',
                      letterSpacing: '0.08em',
                      color: 'rgba(255,241,45,0.5)',
                      border: '1px solid rgba(255,241,45,0.12)',
                      padding: '0.1rem 0.4rem',
                      background: 'rgba(255,241,45,0.04)',
                    }}>
                      {REF_CATEGORY_LABEL[ref.category] ?? ref.category.toUpperCase()}
                    </span>
                  </div>
                  <p style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.78rem',
                    color: 'rgba(255,255,255,0.65)',
                    marginBottom: '0.25rem',
                    lineHeight: 1.5,
                  }}>
                    {ref.citation}
                  </p>
                  <p style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.8rem',
                    color: 'rgba(255,255,255,0.38)',
                    lineHeight: 1.55,
                    margin: 0,
                  }}>
                    {ref.relevance}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Frequently Asked Questions */}
        {article.faqs && article.faqs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.54 }}
            style={{ marginBottom: '3rem' }}
          >
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.6rem',
              letterSpacing: '0.1em',
              color: 'rgba(255,255,255,0.3)',
              marginBottom: '1rem',
            }}>
              FREQUENTLY ASKED QUESTIONS
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(255,255,255,0.04)' }}>
              {article.faqs.map((faq, i) => (
                <FaqAccordion key={i} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </motion.div>
        )}

        <RelatedArticles
          title="RELATED ENGINEERING TOPICS"
          items={sidebarData.relatedArticles.map((rel) => ({
            title: rel.title,
            href: `/knowledge-center/engineering/${rel.slug}`,
            description: rel.category,
          }))}
        />

        {/* Citation block */}
        <CitationBlock
          title={article.title}
          url={`/knowledge-center/engineering/${article.slug}`}
          entityType="article"
        />
      </ArticleLayout>

      {/* TechArticle + BreadcrumbList JSON-LD */}
      <ArticleSchema data={{
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: article.title,
        description: article.metaDescription,
        url: `https://elimfilters.com/knowledge-center/engineering/${article.slug}`,
        author: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        publisher: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        keywords: article.keywords.join(', '),
        about: { '@type': 'Thing', name: article.title, description: article.intro },
        ...(article.eeat ? {
          dateModified: article.eeat.lastReviewDate,
          version: article.eeat.version,
          teaches: article.eeat.discipline,
          educationalLevel: article.eeat.contentLevel,
        } : {}),
      }} />

      {/* BreadcrumbList JSON-LD */}
      <ArticleSchema data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Knowledge Center', item: 'https://elimfilters.com/knowledge-center' },
          { '@type': 'ListItem', position: 2, name: 'Engineering', item: 'https://elimfilters.com/knowledge-center/engineering' },
          { '@type': 'ListItem', position: 3, name: article.title, item: `https://elimfilters.com/knowledge-center/engineering/${article.slug}` },
        ],
      }} />

      {/* FAQPage JSON-LD */}
      {article.faqs && article.faqs.length > 0 && (
        <ArticleSchema data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: article.faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: { '@type': 'Answer', text: faq.answer },
          })),
        }} />
      )}

      {/* HowTo JSON-LD */}
      {article.howTo && (
        <ArticleSchema data={{
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: article.howTo.name,
          description: article.howTo.description,
          ...(article.howTo.totalTime ? { totalTime: article.howTo.totalTime } : {}),
          ...(article.howTo.supply ? { supply: article.howTo.supply.map((s) => ({ '@type': 'HowToSupply', name: s })) } : {}),
          ...(article.howTo.tool ? { tool: article.howTo.tool.map((t) => ({ '@type': 'HowToTool', name: t })) } : {}),
          step: article.howTo.steps.map((step, i) => ({
            '@type': 'HowToStep',
            position: i + 1,
            name: step.name,
            text: step.text,
            ...(step.tool ? { tool: { '@type': 'HowToTool', name: step.tool } } : {}),
            ...(step.supply ? { supply: { '@type': 'HowToSupply', name: step.supply } } : {}),
          })),
        }} />
      )}
    </main>
  );
}
