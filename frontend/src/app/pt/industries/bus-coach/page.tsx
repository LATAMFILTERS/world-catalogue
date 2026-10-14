import type { Metadata } from 'next';
import { BusCoachIndustryPage } from '@/components/BusCoachIndustryPage';
import { languageAlternates } from '@/lib/localized-routes';
const canonical = 'https://elimfilters.com/pt/industries/bus-coach/';
export const metadata: Metadata = { title: "Filtração para ônibus e transporte rodoviário | ELIMFILTERS", description: "Filtração de ar, combustível, óleo, arrefecimento, freios pneumáticos e cabine para transporte de passageiros.", alternates: { canonical, languages: languageAlternates('/industries/bus-coach') }, openGraph: { title: "Filtração para ônibus e transporte rodoviário | ELIMFILTERS", description: "Filtração de ar, combustível, óleo, arrefecimento, freios pneumáticos e cabine para transporte de passageiros.", url: canonical, locale: 'pt_BR', type: 'website', siteName: 'ELIMFILTERS' } };
export default function BusCoachLocalizedPage() { return <BusCoachIndustryPage lang="pt" />; }
