import type { Metadata } from 'next';
import { BusCoachIndustryPage } from '@/components/BusCoachIndustryPage';
import { languageAlternates } from '@/lib/localized-routes';
const canonical = 'https://elimfilters.com/pt/industries/bus-coach/';
export const metadata: Metadata = { title: "Filtração para ônibus e rodoviários | ELIMFILTERS", description: "Filtração para operadores e técnicos de transporte de passageiros: motores diesel, separação de água, lubrificação, secadores pneumáticos, climatização e arrefecimento compatível.", alternates: { canonical, languages: languageAlternates('/industries/bus-coach') }, openGraph: { title: "Filtração para ônibus e rodoviários | ELIMFILTERS", description: "Filtração para operadores e técnicos de transporte de passageiros: motores diesel, separação de água, lubrificação, secadores pneumáticos, climatização e arrefecimento compatível.", url: canonical, locale: 'pt_BR', type: 'website', siteName: 'ELIMFILTERS' } };
export default function BusCoachLocalizedPage() { return <BusCoachIndustryPage lang="pt" />; }
