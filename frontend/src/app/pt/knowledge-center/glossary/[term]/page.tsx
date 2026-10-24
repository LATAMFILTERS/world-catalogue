import { LocalizedGlossaryPage, localizedGlossaryMetadata, localizedGlossaryParams } from '@/app/knowledge-center/glossary/[term]/localized-glossary';

type Params = { params: Promise<{ term: string }> };
export const dynamicParams = false;
export const generateStaticParams = localizedGlossaryParams;
export const generateMetadata = (props: Params) => localizedGlossaryMetadata(props, 'pt');
export default async function Page(props: Params) { return LocalizedGlossaryPage(props, 'pt'); }
