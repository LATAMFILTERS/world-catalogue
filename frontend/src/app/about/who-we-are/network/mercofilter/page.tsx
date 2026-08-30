'use client';

import { NetworkProfilePage } from '@/components/NetworkProfilePage';

export default function MercofilterPage() {
  return (
    <NetworkProfilePage
      currentPageEn="Mercofilter"
      currentPageEs="Mercofilter"
      eyebrowEn="DISTRIBUTOR PARTNER · VENEZUELA"
      eyebrowEs="SOCIO DISTRIBUIDOR · VENEZUELA"
      titleEn="Mercofilter"
      titleEs="Mercofilter"
      bodyEn="Mercofilter carried the ELIMFILTERS name in its home market of Venezuela, part of the founding network of distributor partners that supported the brand's earliest commercial operations, alongside network partner COBARCA."
      bodyEs="Mercofilter distribuyó ELIMFILTERS en su mercado de origen, Venezuela, formando parte de la red fundacional de socios distribuidores que respaldó las primeras operaciones comerciales de la marca, junto al socio de la red COBARCA."
      images={[
        { src: '/images/mercofilter_vzla.jpg', altEn: 'Mercofilter team, Venezuela', altEs: 'Equipo de Mercofilter, Venezuela' },
        { src: '/images/cobarca_venezuela.jpg', altEn: 'COBARCA team, Venezuela', altEs: 'Equipo de COBARCA, Venezuela' },
      ]}
    />
  );
}
