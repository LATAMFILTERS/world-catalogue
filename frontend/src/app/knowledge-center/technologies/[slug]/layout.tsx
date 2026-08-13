import type { Metadata } from 'next';
import { PUBLIC_TECHNOLOGIES } from '@/lib/public-taxonomy';

export function generateMetadata({params}:{params:{slug:string}}):Metadata {
  const item=PUBLIC_TECHNOLOGIES.find((entry)=>entry.slug===params.slug);
  if(!item) return {};
  const canonical=`https://elimfilters.com/knowledge-center/technologies/${item.slug}/`;
  return {title:`${item.name} Filtration Technology | ELIMFILTERS`,description:item.tagline,alternates:{canonical}};
}

export default function Layout({children}:{children:React.ReactNode}){return children;}
