import type { Metadata } from 'next';
import { LegacyRouteConsolidation } from '@/components/LegacyRouteConsolidation';

export const metadata: Metadata = {
  title: 'Manufacturing | ELIMFILTERS',
  description: 'Legacy ELIMFILTERS manufacturing route consolidated into the current manufacturing asset-protection page.',
  robots: { index: false, follow: true },
  alternates: { canonical: 'https://elimfilters.com/industries/manufacturing/' },
};

export default function LegacyManufacturingPage() {
  return <LegacyRouteConsolidation destination="/industries/manufacturing/" destinationLabel="VIEW MANUFACTURING PROTECTION" />;
}
