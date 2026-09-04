/**
 * index.ts
 * ELIMFILTERS Knowledge Center — Data Registry Barrel Export
 *
 * Single import point for all KC data. Public Technology, System and Industry
 * IDs are exported from the current canonical layer; historical identifiers
 * remain reserved in entity-ids.ts for backward compatibility and audit history.
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
  TERM_IDS,
  getArticleId,
  getStandardId,
  getTermId,
} from './entity-ids';
export {
  TECHNOLOGY_IDS,
  SYSTEM_IDS,
  INDUSTRY_IDS,
  getTechnologyId,
  getSystemId,
  getIndustryId,
} from './canonical-entity-ids';

// ── Data Registries ───────────────────────────────────────────────────────────
export { ENGINEERING_ARTICLES } from './articles-registry';
export { KC_STANDARDS } from './standards-registry';
export { KC_TECHNOLOGIES } from './technologies-registry';
export { KC_SYSTEMS } from './canonical-systems-registry';
export { KC_SYSTEM_DETAILS } from './systems-registry';
export { KC_INDUSTRIES } from './canonical-industries-registry';
export { KC_INDUSTRY_DETAILS } from './canonical-industry-details';
export { GLOSSARY_REGISTRY } from './glossary-registry';

// ── Engineering Diagrams ───────────────────────────────────────────────────────
export type { KCDiagram } from './types';
export { DIAGRAM_IDS, getDiagramId } from './entity-ids';
export {
  ENGINEERING_DIAGRAMS,
  getDiagramBySlug,
  getDiagramsForArticle,
  getDiagramsForStandard,
} from './canonical-diagram-registry';

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
