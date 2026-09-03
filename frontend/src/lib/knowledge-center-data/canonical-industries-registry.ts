import { KC_INDUSTRIES as LEGACY_INDUSTRIES } from './industries-registry';

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
  ...LEGACY_INDUSTRIES,
  ...ADDITIONAL_CANONICAL_INDUSTRIES.filter(
    (candidate) => !LEGACY_INDUSTRIES.some((industry) => industry.slug === candidate.slug),
  ),
];
