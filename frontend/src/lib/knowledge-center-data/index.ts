/**
 * index.ts
 * ELIMFILTERS Knowledge Center — Data Registry Barrel Export
 *
 * Single import point for all KC data.
 * All existing imports from '@/lib/knowledge-center-data' resolve to this file.
 * Zero breaking changes — all previously exported names remain available.
 *
 * Dependency graph (acyclic):
 *   types.ts              ← no imports from this module
 *   entity-ids.ts         ← no imports from this module
 *   calculator-engines.ts ← no imports from this module
 *   articles-registry     ← imports types
 *   standards-registry    ← imports types
 *   technologies-registry ← imports types
 *   systems-registry      ← imports types
 *   canonical-systems-registry ← derives public five-system ontology
 *   industries-registry   ← imports types
 *   calculators-registry  ← imports types, entity-ids
 *   comparisons-registry  ← imports types, entity-ids
 *   index.ts (this)       ← imports all above
 */

// ── Types ─────────────────────────────────────────────────────────────────────
export type {
  KCArticle, KCStandard, KCTechnology, KCSystemDetail, KCIndustryDetail,
  KCEeat, KCFaqItem, KCEngineeringReference, KCHowTo, KCHowToStep, KCDecisionGuide, KCDecisionNode,
} from './types';

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
export { KC_SYSTEMS } from './canonical-systems-registry';
export { KC_SYSTEM_DETAILS } from './systems-registry';
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

// ── Engineering Calculators ───────────────────────────────────────────────────
export type {
  KCCalculator,
  KCCalculatorFormula,
  KCCalculatorInputSpec,
  KCCalculatorOutputSpec,
  KCCalculatorVariable,
  KCCalculatorWorkedExample,
  KCCalculatorCategory,
} from './types';
export { CALCULATOR_IDS, getCalculatorId } from './entity-ids';
export {
  KC_CALCULATORS,
  getCalculatorBySlug,
  getCalculatorsByCategory,
} from './calculators-registry';
export type {
  Iso4406Code,
  FilterMediaType,
  HydraulicSystemType,
  CleanlinessEvaluation,
  OperatingEnvironment,
} from './calculator-engines';
export {
  iso4406RangeCode,
  iso4406CodeToRange,
  countsToIso4406Code,
  iso4406CodeToString,
  betaToEfficiency,
  efficiencyToBeta,
  pressureDropEstimate,
  dhcEstimate,
  intervalFromDhc,
  AIR_SERVICE_LIMIT_PA,
  airFilterRemainingLife,
  getCleanlinessTarget,
  evaluateCleanliness,
  getIngestionRate,
  getDefaultSafetyFactor,
  serviceInterval,
} from './calculator-engines';

// ── Engineering Comparisons ───────────────────────────────────────────────────
export type {
  KCComparison,
  KCComparisonDimension,
  KCComparisonOption,
  KCComparisonWhenClause,
  KCComparisonCategory,
} from './types';
export { COMPARISON_IDS, getComparisonId } from './entity-ids';
export {
  KC_COMPARISONS,
  getComparisonBySlug,
  getComparisonsByCategory,
} from './comparisons-registry';
