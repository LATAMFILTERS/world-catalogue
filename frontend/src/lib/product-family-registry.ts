import { ProductFamilyEntry } from './master-data-types';
import { FamilyKey } from './product-families-data';

/**
 * PRODUCT FAMILY REGISTRY
 * 
 * Master registry of all Product Families.
 */
export const PRODUCT_FAMILY_REGISTRY: Record<FamilyKey, ProductFamilyEntry> = {} as Record<FamilyKey, ProductFamilyEntry>;
