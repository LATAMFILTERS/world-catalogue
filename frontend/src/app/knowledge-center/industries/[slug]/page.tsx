import { PUBLIC_INDUSTRIES, PUBLIC_INDUSTRY_DETAILS } from '@/lib/public-taxonomy';
import { notFound } from 'next/navigation';
import IndustryContent from './IndustryContent';

export function generateStaticParams(){return PUBLIC_INDUSTRIES.map((industry)=>({slug:industry.slug}));}
export default function IndustryPage({params}:{params:{slug:string}}){const industry=PUBLIC_INDUSTRIES.find((item)=>item.slug===params.slug);if(!industry)return notFound();const detail=PUBLIC_INDUSTRY_DETAILS[params.slug]??null;return <IndustryContent industry={industry} detail={detail}/>;}
