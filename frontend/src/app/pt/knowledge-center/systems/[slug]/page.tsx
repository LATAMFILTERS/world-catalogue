import { LocalizedSystemPage, localizedSystemMetadata, localizedSystemParams } from '@/app/knowledge-center/systems/[slug]/localized-system';

type Params = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export const generateStaticParams = localizedSystemParams;
export const generateMetadata = (props: Params) => localizedSystemMetadata(props, 'pt');
export default async function Page(props: Params) { return LocalizedSystemPage(props, 'pt'); }
