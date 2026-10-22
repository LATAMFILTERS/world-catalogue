import { LocalizedArticlePage, localizedArticleMetadata, localizedArticleParams } from '@/app/knowledge-center/engineering/[topic]/localized-article';

type Params = { params: Promise<{ topic: string }> };
export const dynamicParams = false;
export const generateStaticParams = localizedArticleParams;
export const generateMetadata = (props: Params) => localizedArticleMetadata(props, 'es');
export default async function Page(props: Params) { return LocalizedArticlePage(props, 'es'); }
