import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ELIMFILTERS | Asset Protection Systems',
  description: 'Industrial filtration engineering for heavy-duty and light-duty engines.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
