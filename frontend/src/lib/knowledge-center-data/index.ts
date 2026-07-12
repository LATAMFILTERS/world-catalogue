/**
 * index.ts
 * ELIMFILTERS Knowledge Center — Data Registry Barrel Export
 *
 * Single import point for all KC data.
 * All existing imports from '@/lib/knowledge-center-data' resolve to this file.
 * Zero breaking changes — all previously exported names remain available.
 *
 * Dependency graph (acyclic):
 *   types.ts            ← no imports from this module
 *   entity-ids.ts       ← no imports from this module
 *   articles-registry   ← imports types
 *   standards-registry  ← imports types
 *   technologies-registry ← imports types
 *   systems-registry    ← imports types
 *   industries-registry ← imports types
 *   index.ts (this)     ← imports all above
 */

// ── Types ─────────────────────────────────────────────────────────────────────
export type { KCArticle, KCStandard, KCTechnology, KCSystemDetail, KCIndustryDetail } from './types';

// ── Entity IDs ────────────────────────────────────────────────────────────────
export {
  ARTICLE_IDS,
  STANDARD_IDS,
  TECHNOLOGY_IDS,
  SYSTEM_IDS,
  INDUSTRY_IDS,
  TERM_IDS,
  getArticleId,
  getStandardId,
  getTechnologyId,
  getSystemId,
  getIndustryId,
  getTermId,
} from './entity-ids';

// ── Data Registries ───────────────────────────────────────────────────────────
export { ENGINEERING_ARTICLES } from './articles-registry';
export { KC_STANDARDS } from './standards-registry';
export { KC_TECHNOLOGIES } from './technologies-registry';
export { KC_SYSTEMS, KC_SYSTEM_DETAILS } from './systems-registry';
export { KC_INDUSTRIES, KC_INDUSTRY_DETAILS } from './industries-registry';
export { GLOSSARY_REGISTRY } from './glossary-registry';

// ── Engineering Diagrams ───────────────────────────────────────────────────────
export type { KCDiagram } from './types';
export { DIAGRAM_IDS, getDiagramId } from './entity-ids';
export {
  ENGINEERING_DIAGRAMS,
  getDiagramBySlug,
  getDiagramsForArticle,
  getDiagramsForStandard,
} from './diagram-registry';
