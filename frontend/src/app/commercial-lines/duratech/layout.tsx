import type { Metadata } from 'next';

const DESTINATION = 'https://elimfilters.com/commercial-lines/duractech/';

export const metadata: Metadata = {
  title: 'Moved | ELIMFILTERS®',
  description: 'This resource has moved to its canonical ELIMFILTERS URL.',
  robots: { index: false, follow: true },
  alternates: { canonical: DESTINATION },
};

export default function LegacyCommercialLineLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
