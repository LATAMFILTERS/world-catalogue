import type { Metadata } from 'next';
import { AssetProtectionConsultation } from './AssetProtectionConsultation';
import { ConversionProvider } from '@/components/conversion/ConversionContext';

export const metadata: Metadata = {
  title: 'Asset Protection Engineering Consultation | ELIMFILTERS',
  description:
    'An engineering-guided consultation that maps your operating conditions to contamination risks, failure modes, and the protection system that best fits your equipment.',
  alternates: {
    canonical: 'https://elimfilters.com/engineering/asset-protection',
  },
};

export default function AssetProtectionPage() {
  return (
    <ConversionProvider>
      <AssetProtectionConsultation />
    </ConversionProvider>
  );
}
