import type { Metadata } from 'next';
import PEPClientNav from './PEPClientNav';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://elimfilters.com/product-experience',
  },
};

export default function ProductExperienceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#000', minHeight: '100vh' }}>
      <PEPClientNav />
      {children}
    </div>
  );
}
