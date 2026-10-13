import type { Metadata } from 'next';
import { AutomotiveIndustryPage } from '@/components/AutomotiveIndustryPage';
import { languageAlternates } from '@/lib/localized-routes';
const canonical = 'https://elimfilters.com/pt/industries/automotive/';
export const metadata: Metadata = { title: "Filtração automotiva para veículos leves | ELIMFILTERS", description: "Filtros de ar, combustível, óleo e cabine para veículos de passageiros, comerciais leves e frotas.", alternates: { canonical, languages: languageAlternates('/industries/automotive') }, openGraph: { title: "Filtração automotiva para veículos leves | ELIMFILTERS", description: "Filtros de ar, combustível, óleo e cabine para veículos de passageiros, comerciais leves e frotas.", url: canonical, locale: 'pt_BR', type: 'website', siteName: 'ELIMFILTERS' } };
export default function AutomotiveLocalizedPage() { return <AutomotiveIndustryPage lang="pt" />; }
