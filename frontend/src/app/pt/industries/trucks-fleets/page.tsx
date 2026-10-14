import type { Metadata } from 'next';
import { TrucksFleetsIndustryPage } from '@/components/TrucksFleetsIndustryPage';
import { languageAlternates } from '@/lib/localized-routes';
const canonical = 'https://elimfilters.com/pt/industries/trucks-fleets/';
export const metadata: Metadata = { title: "Filtração para frotas de caminhões | ELIMFILTERS", description: "Filtros de ar, combustível, óleo, arrefecimento, ar comprimido e cabine para frotas comerciais e caminhões pesados.", alternates: { canonical, languages: languageAlternates('/industries/trucks-fleets') }, openGraph: { title: "Filtração para frotas de caminhões | ELIMFILTERS", description: "Filtros de ar, combustível, óleo, arrefecimento, ar comprimido e cabine para frotas comerciais e caminhões pesados.", url: canonical, locale: 'pt_BR', type: 'website', siteName: 'ELIMFILTERS' } };
export default function TrucksFleetsLocalizedPage() { return <TrucksFleetsIndustryPage lang="pt" />; }
