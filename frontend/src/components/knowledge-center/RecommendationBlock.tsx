'use client';

/**
 * RecommendationBlock.tsx
 * ELIMFILTERS Knowledge Center — Recommendation Engine UI
 *
 * Phase 6D: Engineering Recommendation Engine
 *
 * Renders deterministic BFS recommendations for any KC entity.
 * Accepts a sourceKey of the form "${type}:${slug}" and produces
 * a list of related entities with full explanation.
 *
 * No LLM, no inference — all recommendations are derived from
 * explicit graph relationships via getRecommendations().
 */

import Link from '@/components/LocalizedLink';
import { getRecommendations } from '@/lib/knowledge-center/recommendation-engine';
import { getKCRecommendationGraph, makeKey } from '@/lib/knowledge-center/recommendation-graph';
import type { KCNodeType, KCReasonType, KCRecommendation } from '@/lib/knowledge-center/recommendation-types';
import { useReviewed } from '@/components/ReviewedText';
import { useTranslation } from 'react-i18next';
import { siteLangFromTag, type SiteLang } from '@/lib/language-preference';
import { articleTitle, systemTitle, termTitle } from '@/lib/knowledge-center-data/i18n/titles';

// ── Colour palette for node types ─────────────────────────────────────────────

const TYPE_COLORS: Record<KCNodeType, string> = {
  article:     'rgba(100,180,255,0.75)',
  standard:    'rgba(255,241,45,0.75)',
  technology:  'rgba(100,220,120,0.75)',
  system:      'rgba(255,180,80,0.75)',
  term:        'rgba(200,160,255,0.75)',
  diagram:     'rgba(80,220,220,0.75)',
  calculator:  'rgba(255,130,130,0.75)',
  comparison:  'rgba(255,200,80,0.75)',
};

const TYPE_LABELS: Record<KCNodeType, string> = {
  article:     'ARTICLE',
  standard:    'STANDARD',
  technology:  'TECHNOLOGY',
  system:      'SYSTEM',
  term:        'TERM',
  diagram:     'DIAGRAM',
  calculator:  'CALCULATOR',
  comparison:  'COMPARISON',
};

// ── Reason descriptions ────────────────────────────────────────────────────────

function reasonLabel(r: KCRecommendation, tr: (text: string) => string): string {
  const via = (fallback: string) => `${tr('Via')} ${r.viaLabel ?? tr(fallback)}`;
  switch (r.reasonType) {
    case 'related-standard':    return tr('Shared standard reference');
    case 'related-technology':  return tr('Shared technology');
    case 'related-system':      return tr('Shared filtration system');
    case 'related-term':        return tr('Related engineering term');
    case 'related-article':     return tr('Related article');
    case 'related-diagram':     return tr('Related diagram');
    case 'related-calculator':  return tr('Related calculator');
    case 'related-comparison':  return tr('Related comparison');
    case 'shared-standard':     return via('shared standard');
    case 'shared-technology':   return via('shared technology');
    case 'shared-system':       return via('shared system');
    case 'shared-term':         return via('shared term');
    case 'shared-article':      return via('shared article');
    case 'shared-diagram':      return via('shared diagram');
    case 'shared-calculator':   return via('shared calculator');
    case 'shared-comparison':   return via('shared comparison');
  }
}

// ── Card component ────────────────────────────────────────────────────────────

/** Recommendation title in the visitor's language where a reviewed title exists. */
function localLabel(rec: KCRecommendation, lang: SiteLang): string {
  if (rec.type === 'article') return articleTitle(rec.slug, lang, rec.label);
  if (rec.type === 'system') return systemTitle(rec.slug, lang, rec.label);
  if (rec.type === 'term') return termTitle(rec.slug, lang, rec.label);
  return rec.label;
}

function RecommendationCard({ rec }: { rec: KCRecommendation }) {
  const color = TYPE_COLORS[rec.type];
  const tr = useReviewed();
  const { i18n } = useTranslation();
  const lang = siteLangFromTag(i18n.resolvedLanguage || i18n.language);

  return (
    <Link
      href={rec.href}
      style={{ textDecoration: 'none', display: 'block' }}
    >
      <div
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: `1px solid rgba(255,255,255,0.06)`,
          padding: '0.85rem 1rem',
          transition: 'background 0.15s, border-color 0.15s',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.05)';
          (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.14)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.02)';
          (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.06)';
        }}
      >
        {/* Type badge + depth indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
          <span style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.55rem',
            color: color,
            border: `1px solid ${color.replace('0.75', '0.3')}`,
            padding: '0.1rem 0.35rem',
            borderRadius: '2px',
            letterSpacing: '0.08em',
          }}>
            {tr(TYPE_LABELS[rec.type])}
          </span>
          <span style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.55rem',
            color: rec.depth === 1 ? 'rgba(255,241,45,0.45)' : 'rgba(255,255,255,0.2)',
          }}>
            {tr(rec.depth === 1 ? 'DIRECT' : 'INDIRECT')}
          </span>
        </div>

        {/* Label */}
        <div style={{
          fontFamily: 'Outfit, sans-serif',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: '#fff',
          lineHeight: 1.3,
          marginBottom: '0.25rem',
        }}>
          {localLabel(rec, lang)}
        </div>

        {/* Reason */}
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.6rem',
          color: 'rgba(255,255,255,0.35)',
          lineHeight: 1.4,
        }}>
          {reasonLabel(rec, tr)}
        </div>
      </div>
    </Link>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface RecommendationBlockProps {
  sourceType:    KCNodeType;
  sourceSlug:    string;
  maxResults?:   number;
  excludeTypes?: KCNodeType[];
  title?:        string;
}

export default function RecommendationBlock({
  sourceType,
  sourceSlug,
  maxResults    = 12,
  excludeTypes  = [],
  title         = 'Related Engineering Content',
}: RecommendationBlockProps) {
  const graph       = getKCRecommendationGraph();
  const sourceKey   = makeKey(sourceType, sourceSlug);
  const recs        = getRecommendations(graph, sourceKey, { maxDepth: 2, maxResults, excludeTypes });

  if (recs.length === 0) return null;

  // Count direct vs indirect for summary
  const directCount   = recs.filter(r => r.depth === 1).length;
  const indirectCount = recs.filter(r => r.depth === 2).length;

  return (
    <section style={{ marginTop: '3rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: '1rem',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        paddingBottom: '0.75rem',
        marginBottom: '1rem',
        flexWrap: 'wrap',
      }}>
        <h3 style={{
          fontFamily: 'Outfit, sans-serif',
          fontSize: '0.85rem',
          fontWeight: 700,
          color: '#fff',
          margin: 0,
          letterSpacing: '0.02em',
        }}>
          {title}
        </h3>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.6rem',
          color: 'rgba(255,255,255,0.2)',
          letterSpacing: '0.06em',
        }}>
          {directCount > 0 && `${directCount} DIRECT`}
          {directCount > 0 && indirectCount > 0 && ' · '}
          {indirectCount > 0 && `${indirectCount} INDIRECT`}
          {' · BFS GRAPH TRAVERSAL · DEPTH 2'}
        </div>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '1px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.04)',
      }}>
        {recs.map(rec => (
          <RecommendationCard key={rec.nodeKey} rec={rec} />
        ))}
      </div>

      {/* Engine attribution */}
      <div style={{
        marginTop: '0.6rem',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '0.55rem',
        color: 'rgba(255,255,255,0.12)',
        letterSpacing: '0.04em',
      }}>
        RECOMMENDATION ENGINE — DETERMINISTIC BFS · NO LLM · NO INFERENCE · GRAPH RELATIONSHIPS ONLY
      </div>
    </section>
  );
}
