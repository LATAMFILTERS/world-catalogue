import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-center/engineering',
  },
};

export default function EngineeringLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
