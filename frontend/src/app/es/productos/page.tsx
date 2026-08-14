import type { Metadata } from 'next';
import { LegacyRouteConsolidation } from '@/components/LegacyRouteConsolidation';

export const metadata: Metadata = {
  title: 'ELIMFILTERS Product Families',
  description: 'Legacy ELIMFILTERS product route consolidated into the current product-family architecture.',
  robots: { index: false, follow: true },
  alternates: { canonical: 'https://elimfilters.com/families/' },
};

export default function LegacySpanishProductsPage() {
  return <LegacyRouteConsolidation destination="/families/" destinationLabel="VIEW PRODUCT FAMILIES" />;
}
