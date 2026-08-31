import type { Metadata } from 'next';
import { ThermacoreStablePage } from '@/components/ThermacoreStablePage';

const BASE_URL='https://elimfilters.com';
const URL=`${BASE_URL}/technologies/thermacore/`;
const HERO=`${BASE_URL}/images/THERMACORE-CAMION.avif`;

export const metadata: Metadata = {
 title:'THERMACORE™ Coolant Filtration Technology | ELIMFILTERS',
 description:'THERMACORE™ is the ELIMFILTERS cooling-system protection architecture for coolant cleanliness, chemistry compatibility and component protection in approved engine and equipment cooling applications.',
 keywords:['THERMACORE','coolant filtration','coolant filter','engine cooling system','coolant contamination','coolant chemistry','cooling system protection','water pump protection','heat transfer surfaces','coolant passages','cooling system maintenance','supplemental coolant additives','ELIMFILTERS'],
 alternates:{canonical:URL},
 openGraph:{title:'THERMACORE™ Coolant Filtration Technology | ELIMFILTERS',description:'Cooling-system filtration architecture for coolant cleanliness, chemistry compatibility, flow and component protection.',url:URL,type:'article',siteName:'ELIMFILTERS',images:[{url:HERO,width:1200,height:630,alt:'THERMACORE coolant filtration technology — ELIMFILTERS'}],locale:'en_US'},
 twitter:{card:'summary_large_image',title:'THERMACORE™ Coolant Filtration Technology | ELIMFILTERS',description:'Coolant and cooling-system filtration architecture for approved heavy-duty engine and equipment applications.',images:[HERO]},
 robots:{index:true,follow:true},
};

export default function ThermacorePage(){return <ThermacoreStablePage/>;}
