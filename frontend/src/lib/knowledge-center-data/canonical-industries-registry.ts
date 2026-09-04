import { KC_INDUSTRIES as LEGACY_INDUSTRIES } from './industries-registry';

const LEGACY_SLUG_MAP: Record<string, string> = {
  'truck-fleets': 'trucks-fleets',
};

const INDUSTRY_OVERRIDES: Record<string, { title?: string; description?: string }> = {
  'trucks-fleets': {
    title: 'Commercial Truck Fleets',
    description: 'Commercial truck-fleet filtration for long-haul, regional, vocational and urban duty requiring coordinated engine-air, fuel, lubrication, cooling, cabin and applicable pneumatic protection.',
  },
  marine: {
    description: 'Marine filtration for propulsion, auxiliary, hydraulic and fuel-handling systems operating under salt exposure, water-contamination risk and application-specific vessel requirements.',
  },
  'waste-municipal': {
    title: 'Waste & Municipal Fleets',
    description: 'Waste and municipal fleet filtration for repeated stop-start duty, hydraulic compaction, road and organic particulate exposure, idling and scheduled public-service availability.',
  },
};

const canonicalLegacyIndustries = LEGACY_INDUSTRIES.map((industry) => {
  const slug = LEGACY_SLUG_MAP[industry.slug] ?? industry.slug;
  const override = INDUSTRY_OVERRIDES[slug] ?? {};
  return {
    ...industry,
    slug,
    title: override.title ?? industry.title,
    description: override.description ?? industry.description,
  };
});

const ADDITIONAL_CANONICAL_INDUSTRIES = [
  {
    slug: 'bus-coach',
    title: 'Bus & Coach',
    icon: '🚌',
    dust: 'Moderate',
    description: 'Passenger-fleet filtration for urban transit, intercity coaches, school buses and shuttle fleets operating through stop-and-go duty, continuous HVAC demand and scheduled depot maintenance.',
  },
  {
    slug: 'automotive',
    title: 'Automotive & Light Duty',
    icon: '🚗',
    dust: 'Moderate',
    description: 'Passenger-vehicle and light-duty filtration for urban, highway and fleet service requiring accurate vehicle, engine, model-year and protected-system identification.',
  },
] as const;

export const KC_INDUSTRIES = [
  ...canonicalLegacyIndustries,
  ...ADDITIONAL_CANONICAL_INDUSTRIES.filter(
    (candidate) => !canonicalLegacyIndustries.some((industry) => industry.slug === candidate.slug),
  ),
];
