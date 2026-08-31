import type { Metadata } from 'next';
import { MacrocoreStablePage } from '@/components/MacrocoreStablePage';

const BASE_URL = 'https://elimfilters.com';
const URL = `${BASE_URL}/technologies/macrocore/`;

export const metadata: Metadata = {
  title: 'MACROCORE™ Engine Air Filtration Technology | ELIMFILTERS',
  description: 'MACROCORE™ is the ELIMFILTERS architecture for primary and secondary engine air-intake protection, integrating media configuration, contaminant capacity, restriction control and sealing integrity.',
  keywords: [
    'MACROCORE',
    'engine air filtration technology',
    'engine air filter media',
    'primary engine air filter',
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
    description: 'Primary and secondary engine-air contamination-control architecture integrating media configuration, contaminant capacity, restriction control and sealing integrity.',
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
      <link rel="preload" as="image" href="/assets/MACROCORE_final.avif" fetchPriority="high" />
      <style>{`
        .macrocoreHeroWordmark {
          position: relative;
          z-index: 3;
          display: block;
          width: min(620px, 74vw);
          height: clamp(125px, 17vw, 175px);
          overflow: hidden;
          color: transparent;
          font-size: 0;
          line-height: 0;
          background-image: url('/assets/MACROCORE_final.avif');
          background-repeat: no-repeat;
          background-size: 100% auto;
          background-position: center 45%;
          mix-blend-mode: screen;
          filter: drop-shadow(0 8px 24px rgba(0,0,0,.34));
        }

        .macrocore-route main#main-content > section:nth-of-type(2) h2 {
          font-size: clamp(2.25rem, 5.25vw, 4.65rem) !important;
        }

        @media (max-width: 640px) {
          .macrocoreHeroWordmark {
            width: min(300px, 55vw);
            height: clamp(58px, 15vw, 78px);
            background-position: center 45%;
          }
        }
      `}</style>
      <MacrocoreStablePage />
    </div>
  );
}
