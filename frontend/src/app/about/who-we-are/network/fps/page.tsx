'use client';

import { NetworkProfilePage } from '@/components/NetworkProfilePage';

export default function FpsPage() {
  return (
    <NetworkProfilePage
      currentPageEn="FPS"
      currentPageEs="FPS"
      eyebrowEn="DISTRIBUTOR PARTNER · PANAMA"
      eyebrowEs="SOCIO DISTRIBUIDOR · PANAMÁ"
      titleEn="FPS"
      titleEs="FPS"
      bodyEn="Fluids Parts & Stuff (FPS) was one of the earliest distributor partners to bring ELIMFILTERS into the Panamanian market, carrying the brand as part of its multi-brand parts and lubricants offering during the company's first years of continental expansion."
      bodyEs="Fluids Parts & Stuff (FPS) fue uno de los primeros socios distribuidores en llevar ELIMFILTERS al mercado panameño, ofreciendo la marca dentro de su portafolio multimarca de piezas y lubricantes durante los primeros años de expansión continental de la empresa."
      eyebrowPt="PARCEIRO DISTRIBUIDOR · PANAMÁ"
      bodyPt="A Fluids Parts & Stuff (FPS) foi um dos primeiros parceiros distribuidores a levar a ELIMFILTERS ao mercado panamenho, oferecendo a marca como parte de seu portfólio multimarcas de peças e lubrificantes durante os primeiros anos de expansão continental da empresa."
      images={[{ src: '/images/fps_oficinas.jpg', altEn: 'FPS distributor offices, Panama', altEs: 'Oficinas del distribuidor FPS, Panamá', altPt: "Escritórios do distribuidor FPS, Panamá" }]}
    />
  );
}
