import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ELIMFILTERS — World Catalogue | Industrial Filtration Systems',
  description:
    'ELIMFILTERS World Catalogue: 12 industries, 12 products, 12 proprietary technologies. Industrial-grade filtration engineered for maximum performance.',
  keywords: 'filtration, industrial filters, air filters, fuel filters, hydraulic filters, oil filters, mining, agriculture, marine',
  openGraph: {
    title: 'ELIMFILTERS — World Catalogue',
    description: 'Industrial-grade filtration systems engineered for maximum performance.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
