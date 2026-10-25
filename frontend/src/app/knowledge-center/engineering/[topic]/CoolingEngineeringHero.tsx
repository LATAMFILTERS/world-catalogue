'use client';
import type { KCArticle } from '@/lib/knowledge-center-data';
import { useTranslation } from 'react-i18next';
import { siteLangFromTag } from '@/lib/language-preference';
import styles from './CoolingEngineeringHero.module.css';

const COPY = {
  es: {eyebrow:'INGENIERÍA DE REFRIGERACIÓN',cards:[['MECANISMOS','Cavitación · corrosión · depósitos'],['COMPONENTES','Camisas húmedas · bomba · intercambiadores'],['DIAGNÓSTICO','Estado químico · aireación · contaminación cruzada'],['OBJETIVO','Integridad del circuito y estabilidad térmica']]},
  en: {eyebrow:'COOLING SYSTEM ENGINEERING',cards:[['MECHANISMS','Cavitation · corrosion · deposits'],['COMPONENTS','Wet liners · pump · heat exchangers'],['DIAGNOSTICS','Coolant chemistry · aeration · cross-contamination'],['OBJECTIVE','Circuit integrity and thermal stability']]},
  pt: {eyebrow:'ENGENHARIA DE ARREFECIMENTO',cards:[['MECANISMOS','Cavitação · corrosão · depósitos'],['COMPONENTES','Camisas úmidas · bomba · trocadores de calor'],['DIAGNÓSTICO','Química do fluido · aeração · contaminação cruzada'],['OBJETIVO','Integridade do circuito e estabilidade térmica']]}
} as const;

export default function CoolingEngineeringHero({article}:{article:KCArticle}){
  const {i18n}=useTranslation();
  const locale=siteLangFromTag(i18n.resolvedLanguage || i18n.language);
  const c=COPY[locale==='es'||locale==='pt'?locale:'en'];
  return <section className={styles.hero} aria-labelledby="cooling-hero-title">
    <div className={styles.layout}>
      <div className={styles.copy}>
        <p className={styles.eyebrow}>{c.eyebrow}</p>
        <h1 className={styles.title} id="cooling-hero-title">{article.title}</h1>
        <p className={styles.subtitle}>{article.subtitle}</p>
        <p className={styles.intro}>{article.intro}</p>
      </div>
      <aside className={styles.dashboard} aria-label={c.eyebrow}>
        {c.cards.map(([label,value])=><div className={styles.card} key={label}>
          <p className={styles.label}>{label}</p><p className={styles.value}>{value}</p>
        </div>)}
      </aside>
    </div>
  </section>;
}
