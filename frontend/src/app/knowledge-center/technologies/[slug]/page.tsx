import { PUBLIC_TECHNOLOGIES } from '@/lib/public-taxonomy';
import { notFound } from 'next/navigation';
import TechContent from './TechContent';

export function generateStaticParams(){return PUBLIC_TECHNOLOGIES.map((t)=>({slug:t.slug}));}
export default function TechPage({params}:{params:{slug:string}}){const tech=PUBLIC_TECHNOLOGIES.find((t)=>t.slug===params.slug);if(!tech)return notFound();return <TechContent tech={tech}/>;}
