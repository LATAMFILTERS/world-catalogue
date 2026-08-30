'use client';

import { NetworkProfilePage } from '@/components/NetworkProfilePage';

export default function TroyPage() {
  return (
    <NetworkProfilePage
      currentPageEn="TROY"
      currentPageEs="TROY"
      eyebrowEn="EXCLUSIVE DISTRIBUTOR · DOMINICAN REPUBLIC"
      eyebrowEs="DISTRIBUIDOR EXCLUSIVO · REPÚBLICA DOMINICANA"
      titleEn="TROY"
      titleEs="TROY"
      bodyEn="TROY served as the exclusive distributor for ELIMFILTERS in the Dominican Republic, representing the brand across the country as the company extended its network beyond South America into the Caribbean."
      bodyEs="TROY fue el distribuidor exclusivo de ELIMFILTERS en República Dominicana, representando la marca en todo el país mientras la empresa extendía su red más allá de Sudamérica hacia el Caribe."
      images={[{ src: '/images/troy_rd.jpg', altEn: 'TROY team event, Dominican Republic — exclusive ELIMFILTERS distributor', altEs: 'Evento del equipo TROY, República Dominicana — distribuidor exclusivo de ELIMFILTERS' }]}
    />
  );
}
