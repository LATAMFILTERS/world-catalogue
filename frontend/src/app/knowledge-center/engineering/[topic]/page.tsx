import { ENGINEERING_ARTICLES } from '@/lib/knowledge-center-data';
import { notFound } from 'next/navigation';
import ArticleContent from './ArticleContent';

export function generateStaticParams() {
  return ENGINEERING_ARTICLES.map((a) => ({ topic: a.slug }));
}

export default function EngineeringArticlePage({ params }: { params: { topic: string } }) {
  const article = ENGINEERING_ARTICLES.find((a) => a.slug === params.topic);
  if (!article) return notFound();
  return <ArticleContent article={article} />;
}
