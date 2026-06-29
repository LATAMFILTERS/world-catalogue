import type { Metadata } from 'next';
import ClientNav from './ClientNav';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-center',
  },
};

export default function KnowledgeCenterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#000', minHeight: '100vh' }}>
      <ClientNav />
      {children}
    </div>
  );
}
