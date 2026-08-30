'use client';

import { NetworkProfilePage } from '@/components/NetworkProfilePage';

export default function ColsaisaPage() {
  return (
    <NetworkProfilePage
      currentPageEn="COLSAISA"
      currentPageEs="COLSAISA"
      eyebrowEn="DISTRIBUTOR PARTNER · COLOMBIA"
      eyebrowEs="SOCIO DISTRIBUIDOR · COLOMBIA"
      titleEn="COLSAISA"
      titleEs="COLSAISA"
      bodyEn="Operating as a wholesale distributor (Distribuidor Mayorista), COLSAISA carried ELIMFILTERS alongside established automotive brands including Gulf, ACDelco, Fuka, and Yukkazo, extending the company's early reach across the Colombian wholesale market, together with network partner SAISA."
      bodyEs="Como distribuidor mayorista, COLSAISA comercializó ELIMFILTERS junto a marcas automotrices reconocidas como Gulf, ACDelco, Fuka y Yukkazo, ampliando el alcance inicial de la empresa en el mercado mayorista colombiano, junto al socio de la red SAISA."
      images={[
        { src: '/images/colsaisa_oficinas.jpg', altEn: 'COLSAISA distributor offices, Colombia', altEs: 'Oficinas del distribuidor COLSAISA, Colombia' },
        { src: '/images/saisa_bodega.jpg', altEn: 'SAISA warehouse with ELIMFILTERS inventory', altEs: 'Bodega de SAISA con inventario de ELIMFILTERS' },
      ]}
    />
  );
}
