import type { Metadata } from 'next';
import { HydrocoreStablePage } from '@/components/HydrocoreStablePage';

const BASE_URL='https://elimfilters.com';
const URL=`${BASE_URL}/technologies/hydrocore/`;
const HERO=`${BASE_URL}/images/fuellseparator-hero.avif`;

export const metadata: Metadata = {
  title: 'HYDROCORE™ Fuel/Water Separation Technology | ELIMFILTERS',
  description: 'HYDROCORE™ is the ELIMFILTERS fuel/water separation architecture for approved standard non-turbine separator filters, coordinating water control, flow, drainage, restriction and service access.',
  keywords: ['HYDROCORE','fuel water separator','diesel fuel water separation','diesel water contamination','fuel separator drainage','fuel restriction','fuel starvation under load','diesel fuel corrosion','microbial fuel contamination','fuel cleanliness protection','ELIMFILTERS'],
  alternates: { canonical: URL },
  openGraph: { title: 'HYDROCORE™ Fuel/Water Separation Technology | ELIMFILTERS', description: 'Standard non-turbine fuel/water separation architecture for controlling water, restriction and service conditions in diesel fuel systems.', url: URL, type: 'article', siteName: 'ELIMFILTERS', images: [{url:HERO,width:1200,height:630,alt:'HYDROCORE fuel/water separation technology — ELIMFILTERS'}], locale:'en_US' },
  twitter: { card:'summary_large_image', title:'HYDROCORE™ Fuel/Water Separation Technology | ELIMFILTERS', description:'Diesel fuel/water separation architecture for standard non-turbine separator applications.', images:[HERO] },
};

export default function HydrocorePage(){return <HydrocoreStablePage/>;}
