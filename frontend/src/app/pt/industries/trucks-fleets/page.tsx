import type { Metadata } from 'next';
import { TrucksFleetsIndustryPage } from '@/components/TrucksFleetsIndustryPage';
import { languageAlternates } from '@/lib/localized-routes';
const canonical = 'https://elimfilters.com/pt/industries/trucks-fleets/';
export const metadata: Metadata = { title: "Filtração e manutenção de frotas | ELIMFILTERS", description: "Filtração para responsáveis por frotas, engenheiros e técnicos: diesel, ar, lubrificação e filtros de arrefecimento, secador pneumático e cabine somente em aplicações OEM verificadas.", alternates: { canonical, languages: languageAlternates('/industries/trucks-fleets') }, openGraph: { title: "Filtração e manutenção de frotas | ELIMFILTERS", description: "Filtração para responsáveis por frotas, engenheiros e técnicos: diesel, ar, lubrificação e filtros de arrefecimento, secador pneumático e cabine somente em aplicações OEM verificadas.", url: canonical, locale: 'pt_BR', type: 'website', siteName: 'ELIMFILTERS' } };
export default function TrucksFleetsLocalizedPage() { return <TrucksFleetsIndustryPage lang="pt" />; }
