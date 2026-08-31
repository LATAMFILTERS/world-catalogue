export interface ApplicationCard {
  id: string;
  label: string;
  route: string | null;
  status: 'confirmed' | 'pending' | 'hub_only';
  description: string | null;
}

/**
 * MACROCORE application cards restricted to confirmed operating environments
 * already published under /industries/. Descriptions use neutral engineering
 * context only and do not assign unvalidated product-level performance values.
 */
export const MACROCORE_APPLICATIONS: readonly ApplicationCard[] = [
  { id: 'mining', label: 'Mining', route: '/industries/mining/', status: 'confirmed', description: 'High airborne dust, heavy particulate loading and severe intake exposure on haul roads, pits and quarry operations.' },
  { id: 'construction', label: 'Construction', route: '/industries/construction/', status: 'confirmed', description: 'Demolition dust, changing job-site conditions and stop-start duty increase the importance of restriction and sealing control.' },
  { id: 'agriculture', label: 'Agriculture', route: '/industries/agriculture/', status: 'confirmed', description: 'Chaff, field dust and seasonal loading create variable contamination levels across long operating windows.' },
  { id: 'trucks-fleets', label: 'Truck Fleets', route: '/industries/trucks-fleets/', status: 'confirmed', description: 'Route variability, mixed dust exposure and uptime-sensitive maintenance require application-specific intake protection.' },
  { id: 'power-generation', label: 'Power Generation', route: '/industries/power-generation/', status: 'confirmed', description: 'Standby readiness and continuous-duty engines depend on stable airflow, clean-side integrity and controlled maintenance planning.' },
  { id: 'waste-municipal', label: 'Waste Municipal', route: '/industries/waste-municipal/', status: 'confirmed', description: 'Frequent stop-start cycles, urban particulate and mixed-route conditions create a demanding intake service environment.' },
  { id: 'bus-coach', label: 'Bus & Coach', route: '/industries/bus-coach/', status: 'confirmed', description: 'Passenger-service uptime, urban contamination and mixed operating environments require disciplined intake-system validation.' },
] as const;
