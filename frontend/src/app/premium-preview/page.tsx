import type { Metadata } from 'next';
import { LegacyRouteConsolidation } from '@/components/LegacyRouteConsolidation';

export const metadata: Metadata = {
  title: 'Filtration Technologies | ELIMFILTERS',
  description: 'Legacy ELIMFILTERS preview route consolidated into the current canonical technology portfolio.',
  robots: { index: false, follow: true },
  alternates: { canonical: 'https://elimfilters.com/technologies/' },
};

export default function LegacyPremiumPreviewPage() {
  return <LegacyRouteConsolidation destination="/technologies/" destinationLabel="VIEW CURRENT TECHNOLOGIES" />;
}
