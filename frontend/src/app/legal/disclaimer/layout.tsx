import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Technical Disclaimer | ELIMFILTERS',
  description: 'Technical-use, application-validation and engineering-information disclaimer for ELIMFILTERS digital content and Product Intelligence.',
  alternates: { canonical: 'https://elimfilters.com/legal/disclaimer/' },
  robots: { index: true, follow: true },
};

export default function DisclaimerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
