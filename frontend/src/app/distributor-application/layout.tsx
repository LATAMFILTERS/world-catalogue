import type { Metadata } from 'next';

const DESC = 'Apply to become an authorized ELIMFILTERS® distributor. Access 12 proprietary filtration technologies, dedicated account management, technical training, and co-branded marketing support.';

export const metadata: Metadata = {
  title: {
    absolute: 'Authorized Distributor Application | ELIMFILTERS®',
  },
  description: DESC,
  alternates: {
    canonical: 'https://elimfilters.com/distributor-application/',
  },
  openGraph: {
    title: 'Become an Authorized ELIMFILTERS® Distributor',
    description: 'Join the ELIMFILTERS® network. Access proprietary filtration technologies, wholesale pricing, and full marketing support across North America and Latin America.',
    url: 'https://elimfilters.com/distributor-application/',
    type: 'website',
    siteName: 'ELIMFILTERS® World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630, alt: 'ELIMFILTERS® Authorized Distributor Programme' }],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@elimfilters',
    title: 'Become an Authorized ELIMFILTERS® Distributor',
    description: 'Apply to join the ELIMFILTERS® network — access proprietary filtration tech, wholesale pricing, and dedicated support.',
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function DistributorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
