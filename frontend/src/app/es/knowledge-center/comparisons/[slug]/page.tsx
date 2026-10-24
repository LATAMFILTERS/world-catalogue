import { LocalizedComparisonPage, localizedComparisonMetadata, localizedComparisonParams } from '@/app/knowledge-center/comparisons/[slug]/localized-comparison';

type Params = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export const generateStaticParams = localizedComparisonParams;
export const generateMetadata = (props: Params) => localizedComparisonMetadata(props, 'es');
export default async function Page(props: Params) { return LocalizedComparisonPage(props, 'es'); }
