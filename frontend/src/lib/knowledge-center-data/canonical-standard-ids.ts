import { STANDARD_IDS as LEGACY_STANDARD_IDS } from './entity-ids';

/**
 * Current public Standard IDs.
 *
 * Historical IDs remain reserved in entity-ids.ts. New canonical standards are
 * added here without reusing or deleting any legacy identifier.
 */
export const STANDARD_IDS = {
  ...LEGACY_STANDARD_IDS,
  'iso-2941': 'STD-ISO-2941',
} as const;

export function getStandardId(slug: string): string | undefined {
  return (STANDARD_IDS as Record<string, string>)[slug];
}
