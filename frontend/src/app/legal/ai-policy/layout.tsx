import type { Metadata } from 'next';

const URL = 'https://elimfilters.com/legal/ai-policy/';
const TITLE = 'AI Use Policy | ELIMFILTERS®';
const DESCRIPTION = 'ELIMFILTERS public policy governing mathematical and computational engineering use, physical validation, technical evidence, and human accountability.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  robots: { index: true, follow: true },
  alternates: { canonical: URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    type: 'article',
    siteName: 'ELIMFILTERS',
  },
  twitter: {
    card: 'summary',
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function AIUsePolicyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
