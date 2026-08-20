import fs from 'node:fs';
import path from 'node:path';

const outDir = path.resolve(process.cwd(), 'out', 'locales');
if (!fs.existsSync(outDir)) {
  console.log('[sanitize-public-translations] out/locales not found; skipping');
  process.exit(0);
}

const safe = {
  en: {
    modeling: 'Advanced mathematical modeling',
    modelingDesc: 'Computational analysis supports evaluation of demanding operating conditions affecting protected assets and filtration media. It complements physical validation, documented test protocols, and professional engineering judgment.',
    mediaEngineering: 'Filtration media engineering',
    sealing: 'Application-specific sealing architecture',
    validation: 'Physical validation according to product and application requirements',
    crossref: 'Validated cross-reference capability',
    bypass: 'Seal and flow-path geometries are evaluated according to application requirements to reduce bypass risk.'
  },
  es: {
    modeling: 'Modelado matemático avanzado',
    modelingDesc: 'El análisis computacional apoya la evaluación de condiciones operativas exigentes que afectan a los activos protegidos y a los medios filtrantes. Complementa la validación física, los protocolos documentados de ensayo y el criterio profesional de ingeniería.',
    mediaEngineering: 'Ingeniería de medios filtrantes',
    sealing: 'Arquitectura de sellado específica para la aplicación',
    validation: 'Validación física según los requisitos del producto y la aplicación',
    crossref: 'Capacidad de referencia cruzada validada',
    bypass: 'Las geometrías de sellado y las trayectorias de flujo se evalúan según los requisitos de la aplicación para reducir el riesgo de bypass.'
  },
  pt: {
    modeling: 'Modelagem matemática avançada',
    modelingDesc: 'A análise computacional apoia a avaliação de condições operacionais exigentes que afetam os ativos protegidos e os meios filtrantes. Complementa a validação física, os protocolos documentados de ensaio e o julgamento profissional de engenharia.',
    mediaEngineering: 'Engenharia de meios filtrantes', sealing: 'Arquitetura de vedação específica da aplicação', validation: 'Validação física conforme os requisitos do produto e da aplicação', crossref: 'Capacidade validada de referência cruzada', bypass: 'As geometrias de vedação e os trajetos de fluxo são avaliados conforme os requisitos da aplicação para reduzir o risco de bypass.'
  },
  fr: { modeling: 'Modélisation mathématique avancée', modelingDesc: "L’analyse informatique soutient l’évaluation des conditions d’exploitation exigeantes affectant les actifs protégés et les médias filtrants. Elle complète la validation physique, les protocoles d’essai documentés et le jugement professionnel d’ingénierie.", mediaEngineering: 'Ingénierie des médias filtrants', sealing: 'Architecture d’étanchéité adaptée à l’application', validation: 'Validation physique selon les exigences du produit et de l’application', crossref: 'Capacité de référence croisée validée', bypass: 'Les géométries d’étanchéité et les chemins d’écoulement sont évalués selon les exigences de l’application afin de réduire le risque de dérivation.' },
  it: { modeling: 'Modellazione matematica avanzata', modelingDesc: "L’analisi computazionale supporta la valutazione di condizioni operative gravose che interessano gli asset protetti e i mezzi filtranti. Integra la validazione fisica, i protocolli di prova documentati e il giudizio professionale di ingegneria.", mediaEngineering: 'Ingegneria dei mezzi filtranti', sealing: 'Architettura di tenuta specifica per l’applicazione', validation: 'Validazione fisica secondo i requisiti del prodotto e dell’applicazione', crossref: 'Capacità di riferimento incrociato validata', bypass: 'Le geometrie di tenuta e i percorsi di flusso vengono valutati in base ai requisiti dell’applicazione per ridurre il rischio di bypass.' },
  nl: { modeling: 'Geavanceerde wiskundige modellering', modelingDesc: 'Computationele analyse ondersteunt de beoordeling van veeleisende bedrijfsomstandigheden die beschermde assets en filtermedia beïnvloeden. Dit vormt een aanvulling op fysieke validatie, gedocumenteerde testprotocollen en professioneel technisch oordeel.', mediaEngineering: 'Engineering van filtermedia', sealing: 'Toepassingsspecifieke afdichtingsarchitectuur', validation: 'Fysieke validatie volgens product- en toepassingsvereisten', crossref: 'Gevalideerde cross-referencecapaciteit', bypass: 'Afdichtingsgeometrieën en stroompaden worden beoordeeld volgens de toepassingsvereisten om bypassrisico te verminderen.' },
  de: { modeling: 'Fortgeschrittene mathematische Modellierung', modelingDesc: 'Computergestützte Analysen unterstützen die Bewertung anspruchsvoller Betriebsbedingungen, die geschützte Anlagen und Filtermedien beeinflussen. Sie ergänzen physische Validierung, dokumentierte Prüfprotokolle und professionelles Ingenieururteil.', mediaEngineering: 'Filtermedien-Engineering', sealing: 'Anwendungsspezifische Dichtungsarchitektur', validation: 'Physische Validierung gemäß Produkt- und Anwendungsanforderungen', crossref: 'Validierte Querverweisfähigkeit', bypass: 'Dichtungsgeometrien und Strömungswege werden entsprechend den Anwendungsanforderungen bewertet, um das Bypass-Risiko zu reduzieren.' },
  ru: { modeling: 'Расширенное математическое моделирование', modelingDesc: 'Вычислительный анализ помогает оценивать тяжелые условия эксплуатации, влияющие на защищаемые активы и фильтрующие материалы. Он дополняет физическую валидацию, документированные протоколы испытаний и профессиональное инженерное заключение.', mediaEngineering: 'Инжиниринг фильтрующих материалов', sealing: 'Архитектура уплотнений с учетом применения', validation: 'Физическая валидация по требованиям продукта и применения', crossref: 'Проверенная система перекрестных ссылок', bypass: 'Геометрия уплотнений и пути потока оцениваются в соответствии с требованиями применения для снижения риска байпаса.' },
  ja: { modeling: '高度な数理モデリング', modelingDesc: '計算解析は、保護対象資産およびろ材に影響する厳しい運転条件の評価を支援します。物理検証、文書化された試験手順、専門的な工学判断を補完するものであり、代替するものではありません。', mediaEngineering: 'ろ材エンジニアリング', sealing: '用途別シール設計', validation: '製品および用途要件に応じた物理検証', crossref: '検証済みクロスリファレンス機能', bypass: 'シール形状と流路は、バイパスリスクを低減するため用途要件に応じて評価されます。' },
  zh: { modeling: '高级数学建模', modelingDesc: '计算分析用于评估影响受保护资产和过滤介质的严苛运行条件。它用于补充物理验证、文件化测试规程和专业工程判断，而不是替代这些工作。', mediaEngineering: '过滤介质工程', sealing: '面向具体应用的密封架构', validation: '依据产品和应用要求进行物理验证', crossref: '经过验证的交叉参考能力', bypass: '密封几何结构和流路依据应用要求进行评估，以降低旁通风险。' },
  ar: { modeling: 'النمذجة الرياضية المتقدمة', modelingDesc: 'يدعم التحليل الحاسوبي تقييم ظروف التشغيل القاسية التي تؤثر في الأصول المحمية ووسائط الترشيح. وهو مكمل للتحقق المادي وبروتوكولات الاختبار الموثقة والحكم الهندسي المهني، وليس بديلاً عنها.', mediaEngineering: 'هندسة وسائط الترشيح', sealing: 'هندسة إحكام خاصة بالتطبيق', validation: 'تحقق مادي وفق متطلبات المنتج والتطبيق', crossref: 'قدرة موثقة للمراجع المتقاطعة', bypass: 'تُقيَّم هندسة الإحكام ومسارات التدفق وفق متطلبات التطبيق للحد من مخاطر التجاوز.' },
  fa: { modeling: 'مدل‌سازی ریاضی پیشرفته', modelingDesc: 'تحلیل محاسباتی برای ارزیابی شرایط عملیاتی سخت که بر دارایی‌های محافظت‌شده و رسانه‌های فیلتراسیون اثر می‌گذارد به کار می‌رود. این تحلیل مکمل اعتبارسنجی فیزیکی، پروتکل‌های مستند آزمون و قضاوت حرفه‌ای مهندسی است و جایگزین آنها نیست.', mediaEngineering: 'مهندسی رسانه‌های فیلتراسیون', sealing: 'معماری آب‌بندی متناسب با کاربرد', validation: 'اعتبارسنجی فیزیکی بر اساس الزامات محصول و کاربرد', crossref: 'قابلیت اعتبارسنجی‌شده ارجاع متقابل', bypass: 'هندسه آب‌بندی و مسیرهای جریان بر اساس الزامات کاربرد ارزیابی می‌شوند تا ریسک بای‌پس کاهش یابد.' }
};

function setPath(obj, keys, value) {
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!cur || typeof cur !== 'object' || !(keys[i] in cur)) return;
    cur = cur[keys[i]];
  }
  if (cur && typeof cur === 'object' && keys.at(-1) in cur) cur[keys.at(-1)] = value;
}

function rewriteStrings(value, s) {
  if (typeof value === 'string') {
    let v = value;
    if (/AI-assisted simulation|AI-assisted simulations|AI-formulated|AI-Formulated/i.test(v)) v = s.modeling;
    if (/available exclusively through authorized distributors|we do not sell directly to end users/i.test(v)) v = v.replace(/available exclusively through authorized distributors[^.]*\.?/gi, 'developed primarily through qualified commercial partners').replace(/we do not sell directly to end users[^.]*\.?/gi, 'strategic accounts may use coordinated commercial models where appropriate');
    if (/zero bypass|100% guaranteed|absolute protection/i.test(v)) v = s.bypass;
    if (/ISO 5011[^\n]*certified|complies with ISO 5011/i.test(v)) v = s.validation;
    if (/20,000\+ OEM/i.test(v)) v = s.crossref;
    return v;
  }
  if (Array.isArray(value)) return value.map((v) => rewriteStrings(v, s));
  if (value && typeof value === 'object') for (const k of Object.keys(value)) value[k] = rewriteStrings(value[k], s);
  return value;
}

let changed = 0;
for (const locale of fs.readdirSync(outDir)) {
  const file = path.join(outDir, locale, 'translation.json');
  if (!fs.existsSync(file)) continue;
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const s = safe[locale] || safe.en;
  rewriteStrings(data, s);
  setPath(data, ['technology', 'items', 'media', 'title'], s.modeling);
  setPath(data, ['technology', 'items', 'media', 'desc'], s.modelingDesc);
  setPath(data, ['technology', 'items', 'antibypass', 'desc'], s.bypass);
  if (data?.why?.card?.items && Array.isArray(data.why.card.items)) data.why.card.items = [s.mediaEngineering, s.sealing, s.validation, s.crossref];
  if (data?.home?.whyCardItems && Array.isArray(data.home.whyCardItems)) data.home.whyCardItems = [s.mediaEngineering, s.sealing, s.validation, s.crossref];
  if (data?.home?.techItems?.[0]) { data.home.techItems[0].title = s.modeling; data.home.techItems[0].desc = s.modelingDesc; }
  if (data?.home?.techItems?.[2]) data.home.techItems[2].desc = s.bypass;
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  changed++;
}

const forbidden = [/AI-assisted simulation/i, /AI-formulated/i, /available exclusively through authorized distributors/i, /we do not sell directly to end users/i, /zero bypass architecture/i, /100% guaranteed safety/i, /absolute protection/i, /20,000\+ OEM/i];
for (const locale of fs.readdirSync(outDir)) {
  const file = path.join(outDir, locale, 'translation.json');
  if (!fs.existsSync(file)) continue;
  const text = fs.readFileSync(file, 'utf8');
  const hit = forbidden.find((re) => re.test(text));
  if (hit) throw new Error(`[sanitize-public-translations] Forbidden public translation remains in ${locale}: ${hit}`);
}
console.log(`[sanitize-public-translations] Governed ${changed} locale files`);
