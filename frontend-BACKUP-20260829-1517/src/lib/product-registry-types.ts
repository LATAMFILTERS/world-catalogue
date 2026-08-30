import {
  TechnologyKey,
  EcosystemKey,
} from './canonical-entity-types';
import { ProtectionSystemKey } from './protection-systems-data';
import { FamilyKey } from './product-families-data';

/**
 * Global constant for missing documentation, strictly enforcing the rule:
 * "If information does not exist: DOCUMENTATION PENDING. Never fabricate data."
 */
export const PENDING = 'DOCUMENTATION PENDING';
export type DocumentationPending = typeof PENDING;

export type ProductStatus = 'ACTIVE' | 'DISCONTINUED' | 'IN_DEVELOPMENT' | DocumentationPending;
export type ProductDuty = 'HD' | 'LD' | DocumentationPending;

export interface ProductRegistryEntry {
  // ── Core Identifiers ──
  partNumber: string;
  status: ProductStatus;
  duty: ProductDuty;

  // ── Hierarchical Classification ──
  protectionSystem: ProtectionSystemKey | DocumentationPending;
  technology: TechnologyKey | DocumentationPending;
  productPlatform: EcosystemKey | DocumentationPending | null; // null if not applicable (optional)
  productFamily: FamilyKey | DocumentationPending;

  // ── Technical Specifications ──
  mediaType: string | DocumentationPending;
  dimensions: string | DocumentationPending;
  thread: string | DocumentationPending;
  seal: string | DocumentationPending;
  gasket: string | DocumentationPending;
  reliefValve: string | DocumentationPending;
  bypassValve: string | DocumentationPending;

  // ── Performance Metrics ──
  micronRating: string | DocumentationPending;
  betaRatio: string | DocumentationPending;
  efficiency: string | DocumentationPending;
  collapsePressure: string | DocumentationPending;
  burstPressure: string | DocumentationPending;
  flowRate: string | DocumentationPending;
  maximumTemperature: string | DocumentationPending;
  operatingPressure: string | DocumentationPending;

  // ── Application & Compatibility ──
  applications: string[] | DocumentationPending;
  oemCrossReferences: string[] | DocumentationPending;
  compatibleEquipment: string[] | DocumentationPending;
  relatedProducts: string[] | DocumentationPending; // other part numbers

  // ── Reference & Media ──
  applicableStandards: string[] | DocumentationPending;
  downloads: string[] | DocumentationPending; // URLs to PDFs, etc.
  images: string[] | DocumentationPending; // URLs to product images
  certifications: string[] | DocumentationPending;

  // ── Engineering Links ──
  engineeringReferences: string[] | DocumentationPending;
  knowledgeCenterReferences: string[] | DocumentationPending;
}
