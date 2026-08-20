import type { Metadata } from 'next';

const URL = 'https://elimfilters.com/knowledge-center/';
const TITLE = 'Knowledge Center – ELIMFILTERS® Technical Resources';
const DESCRIPTION = 'Technical resources for industrial filtration, contamination control, standards, reliability, fleet optimization, and asset protection engineering.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  robots: { index: true, follow: true },
  alternates: { canonical: URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    type: 'website',
    siteName: 'ELIMFILTERS',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function KnowledgeCenterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
