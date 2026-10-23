import { LocalizedTechnologyPage, localizedTechnologyMetadata, localizedTechnologyParams } from '@/app/knowledge-center/technologies/[slug]/localized-technology';

type Params = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export const generateStaticParams = localizedTechnologyParams;
export const generateMetadata = (props: Params) => localizedTechnologyMetadata(props, 'pt');
export default async function Page(props: Params) { return LocalizedTechnologyPage(props, 'pt'); }
