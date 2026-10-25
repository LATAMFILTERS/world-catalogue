import type { Metadata } from 'next';
import { AutomotiveIndustryPage } from '@/components/AutomotiveIndustryPage';
import { languageAlternates } from '@/lib/localized-routes';
const canonical = 'https://elimfilters.com/pt/industries/automotive/';
export const metadata: Metadata = { title: "Filtração para oficinas e veículos leves | ELIMFILTERS", description: "Engenharia de filtração para proprietários, oficinas e frotas leves: admissão, combustível, óleo, cabine e compatibilidade por motor, VIN e referência OEM.", alternates: { canonical, languages: languageAlternates('/industries/automotive') }, openGraph: { title: "Filtração para oficinas e veículos leves | ELIMFILTERS", description: "Engenharia de filtração para proprietários, oficinas e frotas leves: admissão, combustível, óleo, cabine e compatibilidade por motor, VIN e referência OEM.", url: canonical, locale: 'pt_BR', type: 'website', siteName: 'ELIMFILTERS' } };
export default function AutomotiveLocalizedPage() { return <AutomotiveIndustryPage lang="pt" />; }
