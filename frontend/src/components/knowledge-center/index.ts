// KC-05 Knowledge Center Component Library
// Design system: dark theme (#000), yellow accent (#FFF12D)
// Styling: inline CSS only — no Tailwind, no CSS modules
// Animation: motion/react (whileHover, initial/animate)
// Typography: JetBrains Mono (labels), Outfit (headings), Inter (body)

// ── Layout ───────────────────────────────────────────────────────────────────
export { default as ArticleLayout } from './ArticleLayout';
export type { ArticleLayoutProps } from './ArticleLayout';

export { default as ArticleHero } from './ArticleHero';
export type { ArticleHeroProps } from './ArticleHero';

export { default as ArticleBreadcrumb } from './ArticleBreadcrumb';
export type { ArticleBreadcrumbProps, BreadcrumbItem } from './ArticleBreadcrumb';

export { default as ArticleNavigation } from './ArticleNavigation';
export type { ArticleNavigationProps, ArticleNavigationItem } from './ArticleNavigation';

export { default as TableOfContents } from './TableOfContents';
export type { TableOfContentsProps, TOCSection } from './TableOfContents';

// ── Cards ─────────────────────────────────────────────────────────────────────
export { default as CategoryHub } from './CategoryHub';
export type { CategoryHubProps, CategoryHubItem } from './CategoryHub';

export { default as ISOStandardCard } from './ISOStandardCard';
export type { ISOStandardCardProps } from './ISOStandardCard';

export { default as KCTechnologyCard } from './TechnologyCard';
export type { KCTechnologyCardProps } from './TechnologyCard';

export { default as FamilyCard } from './FamilyCard';
export type { FamilyCardProps } from './FamilyCard';

export { default as SystemCard } from './SystemCard';
export type { SystemCardProps } from './SystemCard';

export { default as IndustryApplication } from './IndustryApplication';
export type { IndustryApplicationProps, SeverityLevel } from './IndustryApplication';

export { default as TechConnection } from './TechConnection';
export type { TechConnectionProps } from './TechConnection';

export { default as RelatedArticles } from './RelatedArticles';
export type { RelatedArticlesProps, RelatedArticleItem } from './RelatedArticles';

// ── Content ───────────────────────────────────────────────────────────────────
export { default as EngineeringNote } from './EngineeringNote';
export type { EngineeringNoteProps, EngineeringNoteItem } from './EngineeringNote';

export { default as WarningBox } from './WarningBox';
export type { WarningBoxProps, WarningBoxVariant } from './WarningBox';

export { default as FailureAnalysis } from './FailureAnalysis';
export type { FailureAnalysisProps } from './FailureAnalysis';

export { default as ComparisonTable } from './ComparisonTable';
export type { ComparisonTableProps } from './ComparisonTable';

export { default as SpecificationTable } from './SpecificationTable';
export type { SpecificationTableProps, SpecTableRow } from './SpecificationTable';

export { default as MaintenanceProcedure } from './MaintenanceProcedure';
export type { MaintenanceProcedureProps, ProcedureStep } from './MaintenanceProcedure';

export { default as DiagramBlock } from './DiagramBlock';
export type { DiagramBlockProps } from './DiagramBlock';

export { default as FAQSection } from './FAQSection';
export type { FAQSectionProps, FAQItem } from './FAQSection';

// ── Schema ────────────────────────────────────────────────────────────────────
export { default as ArticleSchema } from './ArticleSchema';
export type { ArticleSchemaProps } from './ArticleSchema';
