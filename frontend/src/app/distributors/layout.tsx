import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Authorized Distributors | ELIMFILTERS',
  description: 'Find ELIMFILTERS authorized distributors across the Americas — Dominican Republic, Colombia, and United States. Local access to industrial filtration products and technical support.',
  alternates: { canonical: 'https://elimfilters.com/distributors/' },
  openGraph: {
    title: 'Authorized Distributors | ELIMFILTERS',
    description: 'Find ELIMFILTERS authorized distributors across the Americas.',
    url: 'https://elimfilters.com/distributors/',
    siteName: 'ELIMFILTERS',
    type: 'website',
  },
};

export default function DistributorsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
