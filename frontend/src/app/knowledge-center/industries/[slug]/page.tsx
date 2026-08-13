import { PUBLIC_INDUSTRIES, PUBLIC_INDUSTRY_DETAILS } from '@/lib/public-taxonomy';
import { notFound } from 'next/navigation';
import IndustryPublicContent from './IndustryPublicContent';

export function generateStaticParams(){return PUBLIC_INDUSTRIES.map((industry)=>({slug:industry.slug}));}
export default function IndustryPage({params}:{params:{slug:string}}){const industry=PUBLIC_INDUSTRIES.find((item)=>item.slug===params.slug);if(!industry)return notFound();const detail=PUBLIC_INDUSTRY_DETAILS[params.slug]??null;return <IndustryPublicContent industry={industry} detail={detail}/>;}
