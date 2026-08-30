/**
 * search-engine.ts
 * ELIMFILTERS Knowledge Center — Deterministic Search Engine
 *
 * Phase 6E: Engineering Search
 *
 * Pure deterministic scoring function — no external libraries, no runtime APIs.
 * Identical query + identical index → identical ranked output.
 *
 * Scoring schema (additive per matched field, per token):
 *
 *   Field        | Exact | Prefix | Contains
 *   -------------|-------|--------|----------
 *   code         |  200  |   150  |    80
 *   label        |  100  |    70  |    40
 *   domain       |   30  |    20  |    15
 *   subtitle     |    —  |     —  |    20
 *   keyword      |   30  |    15  |     8
 *
 * Multi-word queries: scored as (a) the full phrase and (b) each word token.
 * The higher of the two strategies wins for each document.
 *
 * Graph-density bonus: min(edgeCount × 1.0, 25)
 * Saturates at 25 points to prevent high-connectivity entities from overwhelming
 * exact match results.
 *
 * Deterministic tie-breaking: score DESC → typeOrder ASC → label ASC
 *
 * Dependency: ./search-types (types only — zero KC registry imports)
 */

import type {
  KCSearchDocument,
  KCSearchEntityType,
  KCSearchMatch,
  KCSearchResult,
} from './search-types';

// ── Type priority for tiebreaking ─────────────────────────────────────────────
// Lower number = higher priority when scores are equal.

const TYPE_ORDER: Record<KCSearchEntityType, number> = {
  standard:    0,
  technology:  1,
  article:     2,
  term:        3,
  system:      4,
  diagram:     5,
  calculator:  6,
  comparison:  7,
  industry:    8,
  problem:     9,
};

// ── Single-token scoring ──────────────────────────────────────────────────────

function scoreOneToken(
  doc:   KCSearchDocument,
  token: string,   // already lowercased
): { score: number; matches: KCSearchMatch[] } {
  let score   = 0;
  const hits: KCSearchMatch[] = [];

  function hit(field: KCSearchMatch['field'], value: string, pts: number, exact: boolean) {
    score += pts;
    hits.push({ field, value, score: pts, exact });
  }

  // ── code (standard/calculator codes) ─────────────────────────────────────
  if (doc.code) {
    const c = doc.code.toLowerCase();
    if      (c === token)           hit('code', doc.code, 200, true);
    else if (c.startsWith(token))   hit('code', doc.code, 150, false);
    else if (c.includes(token))     hit('code', doc.code,  80, false);
  }

  // ── label ─────────────────────────────────────────────────────────────────
  const lbl = doc.label.toLowerCase();
  if      (lbl === token)           hit('label', doc.label, 100, true);
  else if (lbl.startsWith(token))   hit('label', doc.label,  70, false);
  else if (lbl.includes(token))     hit('label', doc.label,  40, false);

  // ── domain ────────────────────────────────────────────────────────────────
  if (doc.domain) {
    const dom = doc.domain.toLowerCase();
    if      (dom === token)         hit('domain', doc.domain, 30, true);
    else if (dom.startsWith(token)) hit('domain', doc.domain, 20, false);
    else if (dom.includes(token))   hit('domain', doc.domain, 15, false);
  }

  // ── subtitle ──────────────────────────────────────────────────────────────
  if (doc.subtitle.toLowerCase().includes(token)) {
    hit('subtitle', token, 20, false);
  }

  // ── keywords ──────────────────────────────────────────────────────────────
  const seenKw = new Set<string>();
  for (const kw of doc.keywords) {
    const k = kw.toLowerCase();
    if (seenKw.has(k)) continue; // deduplicate
    seenKw.add(k);
    if      (k === token)         { hit('keyword', kw, 30, true);  }
    else if (k.startsWith(token)) { hit('keyword', kw, 15, false); }
    else if (k.includes(token))   { hit('keyword', kw,  8, false); }
  }

  return { score, matches: hits };
}

// ── Document scoring ──────────────────────────────────────────────────────────

/**
 * Score a single document against a query.
 * Returns null if the document does not match at all.
 */
export function scoreDocument(
  doc:   KCSearchDocument,
  query: string,
): KCSearchResult | null {
  const q = query.trim().toLowerCase();
  if (!q || q.length < 2) return null;

  // Strategy A: full query as one token
  const { score: fullScore, matches: fullMatches } = scoreOneToken(doc, q);

  // Strategy B: each whitespace-separated word (skip single-char tokens)
  const tokens = q.split(/\s+/).filter(t => t.length >= 2);
  let tokenScore      = 0;
  let tokenMatches: KCSearchMatch[] = [];

  if (tokens.length > 1) {
    for (const tok of tokens) {
      const { score: ts, matches: tm } = scoreOneToken(doc, tok);
      tokenScore += ts;
      tokenMatches.push(...tm);
    }
  }

  const baseScore = Math.max(fullScore, tokenScore);
  if (baseScore === 0) return null;

  const bestMatches = fullScore >= tokenScore ? fullMatches : tokenMatches;

  // Graph-density bonus: rewards well-connected entities in tie situations
  const graphBonus = Math.min(doc.edgeCount * 1.0, 25);
  const totalScore = baseScore + graphBonus;

  // Sort matches by score descending for explanation ordering
  const sortedMatches = bestMatches
    .slice()
    .sort((a, b) => b.score - a.score);

  return {
    document:   doc,
    score:      totalScore,
    matches:    sortedMatches,
    graphBonus,
  };
}

// ── Search ────────────────────────────────────────────────────────────────────

export function search(
  index:     KCSearchDocument[],
  query:     string,
  maxResults = 40,
): KCSearchResult[] {
  const scored = index
    .map(doc => scoreDocument(doc, query))
    .filter((r): r is KCSearchResult => r !== null);

  // Deterministic sort: score DESC → typeOrder ASC → label ASC
  scored.sort((a, b) =>
    b.score - a.score ||
    TYPE_ORDER[a.document.type] - TYPE_ORDER[b.document.type] ||
    a.document.label.localeCompare(b.document.label),
  );

  return scored.slice(0, maxResults);
}

// ── Explanation ───────────────────────────────────────────────────────────────

/** Human-readable explanation of why a result appeared and how it ranked. */
export function explainResult(result: KCSearchResult): string {
  const top = result.matches[0];
  if (!top) return '';

  const parts: string[] = [];

  switch (top.field) {
    case 'code':
      parts.push(top.exact ? `Exact code match: ${top.value}` : `Code: ${top.value}`);
      break;
    case 'label':
      parts.push(top.exact ? 'Exact title match' : 'Title matches search term');
      break;
    case 'domain':
      parts.push(`Domain: ${top.value}`);
      break;
    case 'subtitle':
      parts.push('Description contains search term');
      break;
    case 'keyword':
      parts.push(`Keyword: ${top.value}`);
      break;
  }

  if (result.graphBonus > 0) {
    parts.push(`${result.document.edgeCount} graph connections`);
  }

  return parts.join(' · ');
}
