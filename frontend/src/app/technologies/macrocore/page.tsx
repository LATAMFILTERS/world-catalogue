import type { Metadata } from 'next';
import { MacrocoreTechnologyPage } from '@/components/MacrocoreTechnologyPage';

const BASE_URL = 'https://elimfilters.com';
const URL = `${BASE_URL}/technologies/macrocore/`;

export const metadata: Metadata = {
  title: 'MACROCORE Engine Air Filtration | ELIMFILTERS',
  description: 'MACROCORE™ is the ELIMFILTERS architecture for engine air-intake protection. It integrates media configuration, contaminant-holding capacity, restriction control, and sealing integrity according to airflow demand and operating conditions.',
  keywords: [
    'MACROCORE',
    'engine air filtration technology',
    'engine air filter media',
    'primary air filter',
    'secondary air filter',
    'safety air element',
    'fine fiber filtration media',
    'surface loading filtration',
    'depth loading filtration',
    'airflow restriction',
    'dust holding capacity',
    'air intake contamination control',
    'ISO 5011',
    'heavy duty air filtration',
    'ELIMFILTERS',
  ],
  alternates: { canonical: URL },
  openGraph: {
    title: 'MACROCORE™ Engine Air Filtration Technology | ELIMFILTERS',
    description: 'Engine-air contamination-control architecture integrating media configuration, contaminant capacity, restriction control and sealing integrity for primary and secondary intake protection.',
    url: URL,
    type: 'article',
    siteName: 'ELIMFILTERS',
    images: [{ url: `${BASE_URL}/images/mecanica-air.avif`, width: 1200, height: 630, alt: 'MACROCORE engine air filtration technology — ELIMFILTERS' }],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MACROCORE™ Engine Air Filtration Technology | ELIMFILTERS',
    description: 'Primary and secondary engine-air filtration architecture for particle control, airflow management, restriction control and validated application selection.',
    images: [`${BASE_URL}/images/mecanica-air.avif`],
  },
};

export default function MacrocorePage() {
  return (
    <div className="macrocore-route">
      <style>{`
        .macrocore-route section[aria-labelledby="macrocore-title"] img[alt="MACROCORE™"] {
          display: none !important;
        }

        .macrocore-route section[aria-labelledby="macrocore-title"]::after {
          content: "MACROCORE™";
          position: relative;
          z-index: 3;
          display: block;
          color: #ffffff;
          font-family: var(--font-display), Arial, sans-serif;
          font-size: clamp(3rem, 7vw, 6.8rem);
          font-style: italic;
          font-weight: 900;
          line-height: 1;
          letter-spacing: -0.055em;
          text-transform: uppercase;
          text-shadow: 0 8px 24px rgba(0,0,0,.42);
          white-space: nowrap;
        }

        @media (max-width: 640px) {
          .macrocore-route section[aria-labelledby="macrocore-title"]::after {
            font-size: clamp(2.3rem, 12vw, 4.1rem);
          }
        }
      `}</style>
      <MacrocoreTechnologyPage />
    </div>
  );
}
