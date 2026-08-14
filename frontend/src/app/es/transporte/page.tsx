import type { Metadata } from 'next';
import { LegacyRouteConsolidation } from '@/components/LegacyRouteConsolidation';

export const metadata: Metadata = {
  title: 'Truck Fleets | ELIMFILTERS',
  description: 'Legacy ELIMFILTERS transport route consolidated into the current truck-fleet asset-protection page.',
  robots: { index: false, follow: true },
  alternates: { canonical: 'https://elimfilters.com/industries/truck-fleets/' },
};

export default function LegacySpanishTransportPage() {
  return <LegacyRouteConsolidation destination="/industries/truck-fleets/" destinationLabel="VIEW TRUCK FLEET PROTECTION" />;
}
