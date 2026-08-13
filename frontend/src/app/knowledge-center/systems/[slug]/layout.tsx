import type { Metadata } from 'next';
import { CANONICAL_PUBLIC_SYSTEMS } from '@/lib/public-systems';

export function generateMetadata({params}:{params:{slug:string}}):Metadata {
  const item=CANONICAL_PUBLIC_SYSTEMS.find((entry)=>entry.slug===params.slug);
  if(!item) return {};
  const canonical=`https://elimfilters.com/knowledge-center/systems/${item.slug}/`;
  return {title:`${item.title} | ELIMFILTERS`,description:item.description,alternates:{canonical}};
}

export default function Layout({children}:{children:React.ReactNode}){return children;}
