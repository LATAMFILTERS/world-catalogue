import type { Metadata } from 'next';
import { PUBLIC_INDUSTRIES } from '@/lib/public-taxonomy';

export function generateMetadata({params}:{params:{slug:string}}):Metadata {
  const item=PUBLIC_INDUSTRIES.find((entry)=>entry.slug===params.slug);
  if(!item) return {};
  const canonical=`https://elimfilters.com/knowledge-center/industries/${item.slug}/`;
  return {title:`${item.title} Filtration Engineering | ELIMFILTERS`,description:item.description,alternates:{canonical}};
}

export default function Layout({children}:{children:React.ReactNode}){return children;}
