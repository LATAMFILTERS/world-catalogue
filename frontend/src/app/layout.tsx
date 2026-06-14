import type { Metadata } from 'next';
import Script from 'next/script';
import { Space_Grotesk, Outfit, JetBrains_Mono, Montserrat } from 'next/font/google';
import './globals.css';
import { ClientProviders } from '@/components/ClientProviders';
import Analytics from '@/components/Analytics';
import ConsentBanner from '@/components/ConsentBanner';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk', weight: ['400', '500', '700'] });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', weight: ['300', '400', '500', '600', '700'] });
const jetBrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono', weight: ['400', '500'] });
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat', weight: ['400', '500', '700', '900'] });

const GA_ID = 'G-T7STY4TY9C';

const BASE_URL = 'https://elimfilters.com';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'ELIMFILTERS — World Catalogue | Industrial Filtration Systems',
    template: '%s | ELIMFILTERS',
  },
  description:
    'ELIMFILTERS World Catalogue: 12 industries, 12 products, 12 proprietary technologies. Asset protection filtration engineered for maximum performance in mining, agriculture, marine, and heavy industry.',
  keywords: [
    'industrial filtration', 'asset protection filters', 'air filters industrial',
    'fuel filters heavy duty', 'hydraulic filters', 'oil filters industrial',
    'mining filtration', 'agriculture filtration', 'marine filtration',
    'SYNTRAX filter', 'NANOFORCE filter', 'INTEKCORE fuel filter', 'ELIMFILTERS',
  ],
  authors: [{ name: 'ELIMFILTERS', url: BASE_URL }],
  creator: 'ELIMFILTERS',
  publisher: 'ELIMFILTERS',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg' },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    siteName: 'ELIMFILTERS World Catalogue',
    title: 'ELIMFILTERS — World Catalogue | Industrial Filtration Systems',
    description: 'Asset protection filtration for mining, agriculture, marine and heavy industry. 12 industries · 12 systems · 12 proprietary technologies.',
    url: BASE_URL,
    images: [{ url: '/assets/logo-elimfilters.png', width: 1200, height: 630, alt: 'ELIMFILTERS World Catalogue' }],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@elimfilters',
    title: 'ELIMFILTERS — World Catalogue',
    description: 'Asset protection filtration for mining, agriculture, marine and heavy industry.',
    images: ['/assets/logo-elimfilters.png'],
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'ELIMFILTERS',
  url: BASE_URL,
  logo: `${BASE_URL}/assets/logo-elimfilters.png`,
  description: 'Industrial asset protection filtration systems engineered for mining, agriculture, marine, power generation, and heavy industry.',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    url: `${BASE_URL}/contact`,
    availableLanguage: ['English', 'Spanish'],
  },
  sameAs: ['https://www.linkedin.com/company/elimfilters'],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'ELIMFILTERS World Catalogue',
    itemListElement: [
      { '@type': 'OfferCatalog', name: 'Industrial Filtration by Industry', url: `${BASE_URL}/industries` },
      { '@type': 'OfferCatalog', name: 'Filtration Systems', url: `${BASE_URL}/systems` },
      { '@type': 'OfferCatalog', name: 'Proprietary Technologies', url: `${BASE_URL}/technologies` },
    ],
  },
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'ELIMFILTERS World Catalogue',
  url: BASE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: 'https://part-search.elimfilters.com?q={search_term_string}' },
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${outfit.variable} ${jetBrainsMono.variable} ${montserrat.variable}`}>
      <head>
        <meta name="theme-color" content="#000000" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body>
        {/* Skip to main content — keyboard/screen reader accessibility */}
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        <Analytics />
        <ConsentBanner />
        <ClientProviders>
          <div id="main-content">
            {children}
          </div>
        </ClientProviders>
        {/* ® in headings: wrap as small superscript so it doesn't look oversized */}
        <Script id="reg-in-headings" strategy="afterInteractive">{`
          (function(){
            function wrapReg(root){
              var heads = root.querySelectorAll('h1,h2,h3,h4');
              heads.forEach(function(h){
                h.innerHTML = h.innerHTML.replace(/®/g,'<span class="reg-sup">®</span>');
              });
            }
            wrapReg(document);
            var obs = new MutationObserver(function(muts){
              muts.forEach(function(m){ m.addedNodes.forEach(function(n){ if(n.nodeType===1) wrapReg(n); }); });
            });
            obs.observe(document.body,{childList:true,subtree:true});
          })();
        `}</Script>
      </body>
    </html>
  );
}
