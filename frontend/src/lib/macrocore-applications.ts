export interface ApplicationCard {
  id: string;
  label: string;
  route: string | null;
  status: 'confirmed' | 'pending' | 'hub_only';
  description: string | null;
}

/**
 * MACROCORE application cards, restricted to the operating environments
 * listed in technology-editorial.ts (macrocore.industries.items) and mapped
 * to the exact labels/slugs/routes already published at /industries/.
 * Descriptions are included only where they derive directly from an
 * approved editorial facet (macrocore.conditions.items) — otherwise omitted.
 */
export const MACROCORE_APPLICATIONS: readonly ApplicationCard[] = [
  { id: 'mining', label: 'Mining', route: '/industries/mining/', status: 'confirmed', description: 'Mining haul roads and quarry dust.' },
  { id: 'construction', label: 'Construction', route: '/industries/construction/', status: 'confirmed', description: 'Construction demolition environments.' },
  { id: 'agriculture', label: 'Agriculture', route: '/industries/agriculture/', status: 'confirmed', description: 'Agricultural chaff and seasonal loading.' },
  { id: 'trucks-fleets', label: 'Truck Fleets', route: '/industries/trucks-fleets/', status: 'confirmed', description: null },
  { id: 'power-generation', label: 'Power Generation', route: '/industries/power-generation/', status: 'confirmed', description: null },
  { id: 'waste-municipal', label: 'Waste Municipal', route: '/industries/waste-municipal/', status: 'confirmed', description: null },
  { id: 'bus-coach', label: 'Bus & Coach', route: '/industries/bus-coach/', status: 'confirmed', description: null },
] as const;
