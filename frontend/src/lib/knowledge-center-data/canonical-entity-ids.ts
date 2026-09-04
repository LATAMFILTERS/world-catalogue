/**
 * Current public Knowledge Center entity IDs.
 *
 * Historical IDs remain reserved in entity-ids.ts and are never reused. This
 * layer exposes only the current 5-system / 12-industry ontology to public
 * Knowledge Center consumers.
 */

export const SYSTEM_IDS = {
  'air-intake-protection': 'SYS-AIR-INTAKE-PROTECTION',
  'fuel-cleanliness-protection': 'SYS-FUEL-CLEANLINESS-PROTECTION',
  'lubrication-protection': 'SYS-LUBRICATION-PROTECTION',
  'hydraulic-protection': 'SYS-HYDRAULIC-PROTECTION',
  'cooling-system-protection': 'SYS-COOLING-SYSTEM-PROTECTION',
} as const;

export const INDUSTRY_IDS = {
  mining: 'IND-MINING',
  construction: 'IND-CONSTRUCTION',
  agriculture: 'IND-AGRICULTURE',
  'trucks-fleets': 'IND-TRUCK-FLEETS',
  marine: 'IND-MARINE',
  'oil-gas': 'IND-OIL-GAS',
  manufacturing: 'IND-MANUFACTURING',
  'power-generation': 'IND-POWER-GENERATION',
  railway: 'IND-RAILWAY',
  'waste-municipal': 'IND-WASTE-MUNICIPAL',
  'bus-coach': 'IND-BUS-COACH',
  automotive: 'IND-AUTOMOTIVE-LIGHT-DUTY',
} as const;

export function getSystemId(slug: string): string | undefined {
  return (SYSTEM_IDS as Record<string, string>)[slug];
}

export function getIndustryId(slug: string): string | undefined {
  return (INDUSTRY_IDS as Record<string, string>)[slug];
}
