import styles from './MacrocoreTechnologyPage.module.css';

const principles = [
  ['Fine-fiber capture', 'Finer fiber structures can increase interception opportunities for small airborne particles. Whether a specific MACROCORE™ element uses a fine-fiber layer, a depth-oriented structure or another media configuration must be confirmed from validated product data.'],
  ['Surface-oriented loading', 'Media engineered to retain a greater share of contamination near the upstream surface can reduce deep particle penetration. That loading behavior must still be evaluated together with airflow, dust characteristics and available filtration area.'],
  ['Depth loading', 'A depth-oriented structure distributes contaminant through more of the media thickness. This can provide useful capacity in some duties, but the resulting restriction curve depends on fiber structure, contaminant distribution and airflow conditions.'],
  ['Restriction control', 'Higher particle capture is not useful if the element cannot support the airflow required by the engine. Efficiency, contaminant capacity and restriction development must therefore be treated as a coupled engineering decision.'],
] as const;

export function MacrocoreMediaEngineering() {
  return (
    <div className={styles.twoColumnNotes} aria-label="MACROCORE media engineering principles">
      {principles.map(([title, text]) => (
        <article className={styles.noteBlock} key={title}>
          <h3 className={styles.h3}>{title}</h3>
          <p className={styles.body}>{text}</p>
        </article>
      ))}
    </div>
  );
}
