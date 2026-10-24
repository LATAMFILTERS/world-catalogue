import { LocalizedDiagramPage, localizedDiagramMetadata, localizedDiagramParams } from '@/app/knowledge-center/diagrams/[diagram]/localized-diagram';

type Params = { params: Promise<{ diagram: string }> };
export const dynamicParams = false;
export const generateStaticParams = localizedDiagramParams;
export const generateMetadata = (props: Params) => localizedDiagramMetadata(props, 'es');
export default async function Page(props: Params) { return LocalizedDiagramPage(props, 'es'); }
