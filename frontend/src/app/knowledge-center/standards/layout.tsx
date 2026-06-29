import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-center/standards',
  },
};

export default function StandardsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
