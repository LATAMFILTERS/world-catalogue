import type { Metadata } from 'next';
import LeadershipTitleNormalizer from './LeadershipTitleNormalizer';

export const metadata: Metadata = {
  title: 'Leadership — ELIMFILTERS Human-Governed AI Executive Model',
  description: 'Meet the ELIMFILTERS Founder & CEO and the specialized Executive AI Agents operating defined business domains under human governance, delegated authority, accountability, and escalation.',
  alternates: { canonical: 'https://elimfilters.com/about/leadership' },
  openGraph: {
    title: 'Leadership — ELIMFILTERS',
    description: 'Human Leadership. AI Native Execution. ELIMFILTERS combines a human Chief Executive Office with specialized executive AI functions.',
    url: 'https://elimfilters.com/about/leadership',
    type: 'website',
    siteName: 'ELIMFILTERS World Catalogue',
  },
};

export default function LeadershipLayout({ children }: { children: React.ReactNode }) {
  return <><LeadershipTitleNormalizer />{children}</>;
}
