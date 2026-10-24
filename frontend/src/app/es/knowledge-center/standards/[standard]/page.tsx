import { LocalizedStandardPage, localizedStandardMetadata, localizedStandardParams } from '@/app/knowledge-center/standards/[standard]/localized-standard';

type Params = { params: Promise<{ standard: string }> };
export const dynamicParams = false;
export const generateStaticParams = localizedStandardParams;
export const generateMetadata = (props: Params) => localizedStandardMetadata(props, 'es');
export default async function Page(props: Params) { return LocalizedStandardPage(props, 'es'); }
