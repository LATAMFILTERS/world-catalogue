import { LocalizedProblemPage, localizedProblemMetadata, localizedProblemParams } from '@/app/knowledge-center/problems/[slug]/localized-problem';

type Params = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export const generateStaticParams = localizedProblemParams;
export const generateMetadata = (props: Params) => localizedProblemMetadata(props, 'pt');
export default async function Page(props: Params) { return LocalizedProblemPage(props, 'pt'); }
