import type { Metadata } from 'next';
import { IntekcoreStablePage } from '@/components/IntekcoreStablePage';

const BASE_URL='https://elimfilters.com';
const URL=`${BASE_URL}/technologies/intekcore/`;
const HERO=`${BASE_URL}/images/intekcor-hero.avif`;

export const metadata: Metadata = {
 title:'INTEKCORE™ Air Cleaner Housing Technology | ELIMFILTERS',
 description:'INTEKCORE™ is the ELIMFILTERS air-cleaner housing and sealing architecture for controlled airflow, element retention and bypass prevention in approved engine intake applications.',
 keywords:['INTEKCORE','air cleaner housing','engine air cleaner','air intake housing','air cleaner seal','unfiltered air bypass','air filter housing','engine intake sealing','ISO 5011 air cleaner','air intake restriction','ELIMFILTERS'],
 alternates:{canonical:URL},
 openGraph:{title:'INTEKCORE™ Air Cleaner Housing Technology | ELIMFILTERS',description:'Air-cleaner housing, retention and sealing architecture for controlled airflow and bypass prevention.',url:URL,type:'article',siteName:'ELIMFILTERS',images:[{url:HERO,width:1200,height:630,alt:'INTEKCORE air cleaner housing technology — ELIMFILTERS'}],locale:'en_US'},
 twitter:{card:'summary_large_image',title:'INTEKCORE™ Air Cleaner Housing Technology | ELIMFILTERS',description:'Engine air-cleaner housing and sealing architecture for controlled airflow and bypass prevention.',images:[HERO]},
 robots:{index:true,follow:true},
};

export default function IntekcorePage(){return <IntekcoreStablePage/>;}
