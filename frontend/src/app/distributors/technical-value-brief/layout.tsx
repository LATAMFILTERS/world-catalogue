import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Technical Value Brief | ELIMFILTERS',
  description: 'ELIMFILTERS technical value brief for distributor acquisition and asset-protection positioning.',
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://elimfilters.com/distributors/technical-value-brief/' },
};

export default function TechnicalValueBriefLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
