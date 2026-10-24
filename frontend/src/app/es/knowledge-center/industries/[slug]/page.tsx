import { LocalizedIndustryPage, localizedIndustryMetadata, localizedIndustryParams } from '@/app/knowledge-center/industries/[slug]/localized-industry';

type Params = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export const generateStaticParams = localizedIndustryParams;
export const generateMetadata = (props: Params) => localizedIndustryMetadata(props, 'es');
export default async function Page(props: Params) { return LocalizedIndustryPage(props, 'es'); }
