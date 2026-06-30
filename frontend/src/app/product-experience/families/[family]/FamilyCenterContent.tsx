'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { PEPFamily, PEPSystem } from '@/lib/pep-data';
import { KC_TECHNOLOGIES, ENGINEERING_ARTICLES } from '@/lib/knowledge-center-data';

interface Props {
  family: PEPFamily;
  system: PEPSystem;
  prev: PEPFamily | null;
  next: PEPFamily | null;
}

export default function FamilyCenterContent({ family, system, prev, next }: Props) {
  const technologies = KC_TECHNOLOGIES.filter((t) => family.technologySlugs.includes(t.slug));
  const relatedArticles = ENGINEERING_ARTICLES.filter((a) =>
    family.relatedKCArticleSlugs.includes(a.slug)
  );

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

      {/* Breadcrumb */}
      <div style={{
        padding: '1rem clamp(1.5rem, 4vw, 4rem)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        <Link href="/product-experience" style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.65rem',
          color: 'rgba(255,255,255,0.3)',
          textDecoration: 'none',
          letterSpacing: '0.08em',
        }}>PRODUCT EXPERIENCE</Link>
        <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '0.65rem' }}>/</span>
        <Link href="/product-experience/families" style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.65rem',
          color: 'rgba(255,255,255,0.3)',
          textDecoration: 'none',
          letterSpacing: '0.08em',
        }}>FAMILIES</Link>
        <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '0.65rem' }}>/</span>
        <Link href={`/product-experience/systems/${system.slug}`} style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.65rem',
          color: 'rgba(255,241,45,0.5)',
          textDecoration: 'none',
          letterSpacing: '0.08em',
        }}>{system.name.toUpperCase()}</Link>
        <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '0.65rem' }}>/</span>
        <span style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.65rem',
          color: 'rgba(255,255,255,0.6)',
          letterSpacing: '0.08em',
        }}>{family.name.toUpperCase()}</span>
      </div>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(160deg, #0a0a0a 0%, #000 60%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: 'clamp(4rem, 8vw, 7rem) clamp(1.5rem, 4vw, 4rem)',
      }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.7rem',
              letterSpacing: '0.12em',
              color: '#FFF12D',
              marginBottom: '1.5rem',
              textTransform: 'uppercase',
            }}
          >
            {system.number} / {system.name} / Product Family Center
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(2rem, 5vw, 3.2rem)',
              lineHeight: 1.1,
              textAlign: 'justify',
              marginBottom: '1.5rem',
            }}
          >
            {family.name}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '1.05rem',
              lineHeight: 1.75,
              textAlign: 'justify',
              color: 'rgba(255,255,255,0.65)',
              maxWidth: '640px',
            }}
          >
            {family.purpose}
          </motion.p>

          {/* HD/LD badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem', flexWrap: 'wrap', alignItems: 'center' }}
          >
            {family.hdPrefix && (
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.7rem',
                fontWeight: 700,
                color: '#FFF12D',
                border: '1px solid rgba(255,241,45,0.5)',
                padding: '0.25rem 0.6rem',
                letterSpacing: '0.08em',
              }}>
                HD SERIES — {family.hdPrefix}XXXX
              </span>
            )}
            {family.ldPrefix && (
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.7rem',
                color: 'rgba(255,255,255,0.6)',
                border: '1px solid rgba(255,255,255,0.2)',
                padding: '0.25rem 0.6rem',
                letterSpacing: '0.08em',
              }}>
                LD SERIES — {family.ldPrefix}XXXX
              </span>
            )}
            {!family.ldPrefix && (
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.65rem',
                color: 'rgba(255,255,255,0.25)',
                letterSpacing: '0.06em',
              }}>
                Heavy Duty only
              </span>
            )}
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 4vw, 4rem)' }}>

        {/* 01 PURPOSE */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          style={{ marginBottom: '4rem' }}
        >
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 600,
            fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)',
            marginBottom: '1.25rem',
            lineHeight: 1.2,
            textAlign: 'justify',
          }}>
            Filtration Role in {system.name}
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.95rem',
            lineHeight: 1.8,
            textAlign: 'justify',
            color: 'rgba(255,255,255,0.75)',
          }}>
            {family.purpose}
          </p>
        </motion.section>

        {/* 02 ENGINEERING */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          style={{ marginBottom: '4rem' }}
        >
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 600,
            fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)',
            marginBottom: '1.25rem',
            lineHeight: 1.2,
            textAlign: 'justify',
          }}>
            Media Architecture and Construction Principles
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.95rem',
            lineHeight: 1.8,
            textAlign: 'justify',
            color: 'rgba(255,255,255,0.75)',
          }}>
            {family.engineering}
          </p>
        </motion.section>

        {/* 03 APPLICATIONS */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          style={{ marginBottom: '4rem' }}
        >
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 600,
            fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)',
            marginBottom: '1.5rem',
            lineHeight: 1.2,
            textAlign: 'justify',
          }}>
            Primary Equipment Applications
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {family.applications.map((app, i) => (
              <div key={i} style={{
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start',
                padding: '0.875rem 1.25rem',
                background: 'rgba(255,255,255,0.02)',
                borderLeft: '2px solid rgba(255,241,45,0.2)',
              }}>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.6rem',
                  color: 'rgba(255,241,45,0.5)',
                  marginTop: '0.1rem',
                  flexShrink: 0,
                }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                  textAlign: 'justify',
                  color: 'rgba(255,255,255,0.75)',
                }}>
                  {app}
                </span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* 04 CONSTRUCTION */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          style={{ marginBottom: '4rem' }}
        >
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 600,
            fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)',
            marginBottom: '1.25rem',
            lineHeight: 1.2,
            textAlign: 'justify',
          }}>
            Physical Construction and Materials
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.95rem',
            lineHeight: 1.8,
            textAlign: 'justify',
            color: 'rgba(255,255,255,0.75)',
          }}>
            {family.construction}
          </p>
        </motion.section>

        {/* 05 TECHNOLOGIES */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          style={{ marginBottom: '4rem' }}
        >
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 600,
            fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)',
            marginBottom: '1.5rem',
            lineHeight: 1.2,
            textAlign: 'justify',
          }}>
            Filtration Technologies Applied
          </h2>
          {technologies.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(255,255,255,0.06)' }}>
              {technologies.map((tech) => (
                <Link
                  key={tech.slug}
                  href={`/product-experience/technologies/${tech.slug}`}
                  style={{ textDecoration: 'none', display: 'block' }}
                >
                  <motion.div
                    whileHover={{ background: 'rgba(255,241,45,0.04)' }}
                    style={{
                      background: '#000',
                      padding: '1.5rem',
                      borderLeft: '3px solid transparent',
                      transition: 'border-color 0.2s',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.borderLeftColor = '#FFF12D';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.borderLeftColor = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                      <div>
                        <h3 style={{
                          fontFamily: 'Outfit, sans-serif',
                          fontWeight: 600,
                          fontSize: '1rem',
                          color: '#FFF12D',
                          marginBottom: '0.35rem',
                        }}>
                          {tech.name}
                        </h3>
                        <p style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: '0.6rem',
                          color: 'rgba(255,255,255,0.35)',
                          letterSpacing: '0.08em',
                          marginBottom: '0.75rem',
                        }}>
                          {tech.domain}
                        </p>
                        <p style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '0.85rem',
                          lineHeight: 1.65,
                          textAlign: 'justify',
                          color: 'rgba(255,255,255,0.6)',
                        }}>
                          {tech.engineeringPrinciple}
                        </p>
                      </div>
                      <span style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '0.6rem',
                        color: 'rgba(255,241,45,0.4)',
                        flexShrink: 0,
                      }}>
                        CENTER →
                      </span>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{
              padding: '2rem',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.75rem',
              color: 'rgba(255,255,255,0.3)',
              letterSpacing: '0.06em',
            }}>
              DOCUMENTATION PENDING
            </div>
          )}
        </motion.section>

        {/* 06 STANDARDS */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          style={{ marginBottom: '4rem' }}
        >
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 600,
            fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)',
            marginBottom: '1.5rem',
            lineHeight: 1.2,
            textAlign: 'justify',
          }}>
            Testing and Classification Standards
          </h2>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {family.standards.map((std) => (
              <span key={std} style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.7rem',
                color: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(255,255,255,0.15)',
                padding: '0.3rem 0.7rem',
                letterSpacing: '0.06em',
              }}>
                {std}
              </span>
            ))}
          </div>
        </motion.section>

        {/* 07 HD PRODUCTS */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          style={{ marginBottom: '4rem' }}
        >
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 600,
            fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)',
            marginBottom: '1.5rem',
            lineHeight: 1.2,
            textAlign: 'justify',
          }}>
            HD Series — {family.hdPrefix ? `${family.hdPrefix}XXXX` : 'Not Available'}
          </h2>
          {family.hdPrefix ? (
            <div style={{
              padding: '2rem',
              background: 'rgba(255,241,45,0.03)',
              border: '1px solid rgba(255,241,45,0.12)',
            }}>
              <p style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.75rem',
                color: 'rgba(255,241,45,0.6)',
                letterSpacing: '0.08em',
                marginBottom: '0.5rem',
              }}>
                DOCUMENTATION PENDING — {family.hdPrefix}XXXX SERIES
              </p>
              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.85rem',
                color: 'rgba(255,255,255,0.4)',
                lineHeight: 1.6,
                textAlign: 'justify',
              }}>
                Individual Heavy Duty product specifications, dimensions, cross-references, and vehicle application listings are not yet available in this documentation system. Use the product search to find specific {family.hdPrefix} part numbers.
              </p>
              <Link href={`https://part-search.elimfilters.com?prefix=${family.hdPrefix}`} style={{
                display: 'inline-block',
                marginTop: '1.25rem',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.65rem',
                color: '#FFF12D',
                textDecoration: 'none',
                border: '1px solid rgba(255,241,45,0.3)',
                padding: '0.4rem 0.8rem',
                letterSpacing: '0.06em',
              }}>
                SEARCH {family.hdPrefix} PRODUCTS →
              </Link>
            </div>
          ) : (
            <div style={{
              padding: '2rem',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.75rem',
              color: 'rgba(255,255,255,0.3)',
              letterSpacing: '0.06em',
            }}>
              NOT AVAILABLE IN HEAVY DUTY CLASSIFICATION
            </div>
          )}
        </motion.section>

        {/* 08 LD PRODUCTS */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          style={{ marginBottom: '4rem' }}
        >
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 600,
            fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)',
            marginBottom: '1.5rem',
            lineHeight: 1.2,
            textAlign: 'justify',
          }}>
            LD Series — {family.ldPrefix ? `${family.ldPrefix}XXXX` : 'Not Available'}
          </h2>
          {family.ldPrefix ? (
            <div style={{
              padding: '2rem',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <p style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.75rem',
                color: 'rgba(255,255,255,0.4)',
                letterSpacing: '0.08em',
                marginBottom: '0.5rem',
              }}>
                DOCUMENTATION PENDING — {family.ldPrefix}XXXX SERIES
              </p>
              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.85rem',
                color: 'rgba(255,255,255,0.4)',
                lineHeight: 1.6,
                textAlign: 'justify',
              }}>
                Individual Light Duty product specifications, dimensions, cross-references, and vehicle application listings are not yet available in this documentation system. Use the product search to find specific {family.ldPrefix} part numbers.
              </p>
              <Link href={`https://part-search.elimfilters.com?prefix=${family.ldPrefix}`} style={{
                display: 'inline-block',
                marginTop: '1.25rem',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.65rem',
                color: 'rgba(255,255,255,0.6)',
                textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.2)',
                padding: '0.4rem 0.8rem',
                letterSpacing: '0.06em',
              }}>
                SEARCH {family.ldPrefix} PRODUCTS →
              </Link>
            </div>
          ) : (
            <div style={{
              padding: '2rem',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <p style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.75rem',
                color: 'rgba(255,255,255,0.3)',
                letterSpacing: '0.06em',
                marginBottom: '0.5rem',
              }}>
                NOT AVAILABLE IN LIGHT DUTY CLASSIFICATION
              </p>
              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.85rem',
                color: 'rgba(255,255,255,0.25)',
                lineHeight: 1.6,
                textAlign: 'justify',
              }}>
                The {family.name} family is a Heavy Duty classification only. Light Duty equivalents in this category are not documented in the ELIMFILTERS product range.
              </p>
            </div>
          )}
        </motion.section>

        {/* Related Engineering Articles */}
        {relatedArticles.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
            style={{ marginBottom: '4rem' }}
          >
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.65rem',
              color: 'rgba(255,255,255,0.3)',
              letterSpacing: '0.12em',
              marginBottom: '1rem',
            }}>RELATED ENGINEERING LIBRARY</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(255,255,255,0.06)' }}>
              {relatedArticles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/knowledge-center/articles/${article.slug}`}
                  style={{ textDecoration: 'none', display: 'block' }}
                >
                  <motion.div
                    whileHover={{ background: 'rgba(255,255,255,0.02)' }}
                    style={{
                      background: '#000',
                      padding: '1.25rem 1.5rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <div>
                      <p style={{
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 500,
                        fontSize: '0.9rem',
                        color: '#fff',
                        marginBottom: '0.25rem',
                      }}>
                        {article.title}
                      </p>
                      <p style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '0.6rem',
                        color: 'rgba(255,255,255,0.25)',
                        letterSpacing: '0.06em',
                      }}>
                        {article.category}
                      </p>
                    </div>
                    <span style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.6rem',
                      color: 'rgba(255,255,255,0.2)',
                    }}>→</span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.section>
        )}

        {/* Back to system */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          style={{
            paddingTop: '2rem',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <Link href={`/product-experience/systems/${system.slug}`} style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.65rem',
            color: 'rgba(255,241,45,0.6)',
            textDecoration: 'none',
            letterSpacing: '0.08em',
          }}>
            ← {system.name.toUpperCase()} ENGINEERING CENTER
          </Link>
          <Link href="/product-experience/families" style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.65rem',
            color: 'rgba(255,255,255,0.3)',
            textDecoration: 'none',
            letterSpacing: '0.08em',
          }}>
            ← ALL PRODUCT FAMILIES
          </Link>
        </motion.div>

        {/* Prev/Next in system */}
        {(prev || next) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
            style={{
              marginTop: '3rem',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1px',
              background: 'rgba(255,255,255,0.06)',
            }}
          >
            {prev ? (
              <Link href={`/product-experience/families/${prev.slug}`} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ background: 'rgba(255,255,255,0.02)' }}
                  style={{ background: '#000', padding: '1.5rem', cursor: 'pointer' }}
                >
                  <p style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.55rem',
                    color: 'rgba(255,255,255,0.25)',
                    letterSpacing: '0.08em',
                    marginBottom: '0.5rem',
                  }}>← PREVIOUS</p>
                  <p style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 500,
                    fontSize: '0.9rem',
                    color: 'rgba(255,255,255,0.7)',
                  }}>{prev.name}</p>
                </motion.div>
              </Link>
            ) : <div style={{ background: '#000' }} />}

            {next ? (
              <Link href={`/product-experience/families/${next.slug}`} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ background: 'rgba(255,255,255,0.02)' }}
                  style={{ background: '#000', padding: '1.5rem', textAlign: 'right', cursor: 'pointer' }}
                >
                  <p style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.55rem',
                    color: 'rgba(255,255,255,0.25)',
                    letterSpacing: '0.08em',
                    marginBottom: '0.5rem',
                  }}>NEXT →</p>
                  <p style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 500,
                    fontSize: '0.9rem',
                    color: 'rgba(255,255,255,0.7)',
                  }}>{next.name}</p>
                </motion.div>
              </Link>
            ) : <div style={{ background: '#000' }} />}
          </motion.div>
        )}
      </div>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        name: `${family.name} | ELIMFILTERS Product Family Center`,
        description: family.purpose.slice(0, 200),
        url: `https://elimfilters.com/product-experience/families/${family.slug}`,
        author: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        publisher: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        isPartOf: {
          '@type': 'CollectionPage',
          url: 'https://elimfilters.com/product-experience',
          name: 'ELIMFILTERS Product Experience Platform',
        },
        about: {
          '@type': 'Thing',
          name: family.name,
          description: `${system.name} filtration family. ${family.hdPrefix ? `HD series: ${family.hdPrefix}XXXX.` : ''} ${family.ldPrefix ? `LD series: ${family.ldPrefix}XXXX.` : ''}`,
        },
        keywords: [family.name, system.name, 'industrial filtration', 'contamination control', ...family.standards, ...family.technologySlugs.map((s) => s.toUpperCase())],
      })}} />
    </main>
  );
}
