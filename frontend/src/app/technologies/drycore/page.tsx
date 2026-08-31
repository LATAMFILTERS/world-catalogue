import type { Metadata } from 'next';
import { DrycoreStablePage } from '@/components/DrycoreStablePage';

const BASE_URL='https://elimfilters.com';
const URL=`${BASE_URL}/technologies/drycore/`;
const HERO=`${BASE_URL}/images/airdryer-hero.avif`;

export const metadata: Metadata = {
 title:'DRYCORE™ Air Dryer Filtration Technology | ELIMFILTERS',
 description:'DRYCORE™ is the ELIMFILTERS air-dryer filtration architecture for moisture control in compressed-air and pneumatic brake systems, matched to compressor duty, airflow, purge behavior and ambient moisture exposure.',
 keywords:['DRYCORE','air dryer filter','air dryer cartridge','compressed air moisture control','pneumatic brake system','truck air dryer','air dryer purge cycle','compressed air condensation','brake system moisture','pneumatic system protection','ELIMFILTERS'],
 alternates:{canonical:URL},
 openGraph:{title:'DRYCORE™ Air Dryer Filtration Technology | ELIMFILTERS',description:'Compressed-air moisture-control architecture for approved pneumatic brake-system applications.',url:URL,type:'article',siteName:'ELIMFILTERS',images:[{url:HERO,width:1200,height:630,alt:'DRYCORE air dryer filtration technology — ELIMFILTERS'}],locale:'en_US'},
 twitter:{card:'summary_large_image',title:'DRYCORE™ Air Dryer Filtration Technology | ELIMFILTERS',description:'Air-dryer filtration architecture for moisture control in compressed-air and pneumatic brake systems.',images:[HERO]},
 robots:{index:true,follow:true},
};

export default function DrycorePage(){return <DrycoreStablePage/>;}
