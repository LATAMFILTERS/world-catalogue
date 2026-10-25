import type { Metadata } from 'next';
import { RailwayIndustryPage } from '@/components/RailwayIndustryPage';
import { languageAlternates } from '@/lib/localized-routes';
const canonical = 'https://elimfilters.com/es/industries/railway/';
export const metadata: Metadata = { title: "Filtración para mantenimiento ferroviario | ELIMFILTERS", description: "Filtración para operadores ferroviarios, ingenieros y técnicos de depósito: admisión, diésel, lubricación e hidráulica auxiliar con aplicación verificada.", alternates: { canonical, languages: languageAlternates('/industries/railway') }, openGraph: { title: "Filtración para mantenimiento ferroviario | ELIMFILTERS", description: "Filtración para operadores ferroviarios, ingenieros y técnicos de depósito: admisión, diésel, lubricación e hidráulica auxiliar con aplicación verificada.", url: canonical, locale: 'es_419', type: 'website', siteName: 'ELIMFILTERS' } };
export default function RailwayLocalizedPage(){return <RailwayIndustryPage lang="es" />;}
