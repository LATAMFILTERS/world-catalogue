import type { Metadata } from 'next';
import { ENGINEERING_ARTICLES } from '@/lib/knowledge-center-data';
import { notFound } from 'next/navigation';
import ArticleContent from './ArticleContent';

export function generateStaticParams() {
  return ENGINEERING_ARTICLES.map((a) => ({ topic: a.slug }));
}

export async function generateMetadata({ params }: { params: { topic: string } }): Promise<Metadata> {
  const article = ENGINEERING_ARTICLES.find((a) => a.slug === params.topic);
  if (!article) return {};
  return {
    alternates: {
      canonical: `https://elimfilters.com/knowledge-center/engineering/${params.topic}`,
    },
  };
}

export default function EngineeringArticlePage({ params }: { params: { topic: string } }) {
  const article = ENGINEERING_ARTICLES.find((a) => a.slug === params.topic);
  if (!article) return notFound();
  return <ArticleContent article={article} />;
}
