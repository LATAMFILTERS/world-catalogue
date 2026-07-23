import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Engineering Knowledge Dashboard | ELIMFILTERS',
  description: 'Navigate ELIMFILTERS engineering standards, technologies, systems, tools, and technical resources from one dashboard.',
  alternates: { canonical: 'https://elimfilters.com/knowledge-center/dashboard' },
};

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
