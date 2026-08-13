import { PUBLIC_SYSTEMS, PUBLIC_SYSTEM_DETAILS } from '@/lib/public-taxonomy';
import { notFound } from 'next/navigation';
import SystemContent from './SystemContent';

export function generateStaticParams(){return PUBLIC_SYSTEMS.map((s)=>({slug:s.slug}));}
export default function SystemPage({params}:{params:{slug:string}}){const system=PUBLIC_SYSTEMS.find((s)=>s.slug===params.slug);if(!system)return notFound();const detail=PUBLIC_SYSTEM_DETAILS[params.slug]??null;return <SystemContent system={system} detail={detail}/>;}
