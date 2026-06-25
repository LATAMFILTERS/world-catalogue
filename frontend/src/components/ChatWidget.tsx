'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const SUPPORT_EMAIL = 'support@elimfilters.com';
const PART_SEARCH_BASE = 'https://part-search.elimfilters.com';

// ── i18n ─────────────────────────────────────────────────────────────────────
const T: Record<string, Record<string, string>> = {
  welcome: {
    es: '¿En qué puedo ayudarte hoy?',
    en: 'How can I help you today?',
    pt: 'Como posso ajudá-lo hoje?',
    fr: 'Comment puis-je vous aider aujourd\'hui?',
    it: 'Come posso aiutarti oggi?',
    nl: 'Hoe kan ik u vandaag helpen?',
    ru: 'Чем могу помочь сегодня?',
    zh: '今天我能帮您什么？',
    de: 'Wie kann ich Ihnen heute helfen?',
    ar: 'كيف يمكنني مساعدتك اليوم؟',
  },
  placeholder: {
    es: 'Escribe tu consulta o número de parte…',
    en: 'Type your question or part number…',
    pt: 'Digite sua dúvida ou número da peça…',
    fr: 'Écrivez votre question ou référence…',
    it: 'Scrivi la tua domanda o codice parte…',
    de: 'Frage oder Teilenummer eingeben…',
    nl: 'Typ uw vraag of onderdeelnummer…',
    ru: 'Напишите вопрос или номер детали…',
    zh: '输入问题或零件编号…',
    ar: 'اكتب سؤالك أو رقم القطعة…',
  },
  redirect_part: {
    es: 'Buscando',
    en: 'Searching for',
    pt: 'Buscando',
    fr: 'Recherche de',
    it: 'Ricerca di',
    de: 'Suche nach',
    nl: 'Zoeken naar',
    ru: 'Поиск',
    zh: '搜索',
    ar: 'البحث عن',
  },
  redirect_dist: {
    es: 'Te redirigimos al formulario de distribuidores ELIMFILTERS.',
    en: 'Redirecting you to the ELIMFILTERS distributor application form.',
    pt: 'Redirecionando para o formulário de distribuidores ELIMFILTERS.',
    fr: 'Redirection vers le formulaire distributeur ELIMFILTERS.',
    it: 'Reindirizzamento al modulo distributore ELIMFILTERS.',
    de: 'Weiterleitung zum ELIMFILTERS Distributor-Formular.',
    nl: 'Doorverwijzing naar het ELIMFILTERS distributeurformulier.',
    ru: 'Перенаправляю на форму дистрибьютора ELIMFILTERS.',
    zh: '正在跳转到ELIMFILTERS经销商申请表。',
    ar: 'إعادة التوجيه إلى نموذج موزع ELIMFILTERS.',
  },
  escalated: {
    es: 'Tu consulta fue recibida. Nuestro equipo técnico te responderá en menos de 24 horas.\n\n📧 ' + SUPPORT_EMAIL,
    en: 'Your inquiry was received. Our technical team will respond within 24 hours.\n\n📧 ' + SUPPORT_EMAIL,
    pt: 'Sua consulta foi recebida. Nossa equipe técnica responderá em 24 horas.\n\n📧 ' + SUPPORT_EMAIL,
    fr: 'Votre demande a été reçue. Notre équipe technique répondra dans les 24 heures.\n\n📧 ' + SUPPORT_EMAIL,
    it: 'La tua richiesta è stata ricevuta. Il nostro team tecnico risponderà entro 24 ore.\n\n📧 ' + SUPPORT_EMAIL,
    de: 'Ihre Anfrage wurde erhalten. Unser technisches Team antwortet innerhalb von 24 Stunden.\n\n📧 ' + SUPPORT_EMAIL,
    nl: 'Uw vraag is ontvangen. Ons technisch team reageert binnen 24 uur.\n\n📧 ' + SUPPORT_EMAIL,
    ru: 'Ваш запрос получен. Наша техническая команда ответит в течение 24 часов.\n\n📧 ' + SUPPORT_EMAIL,
    zh: '您的咨询已收到。我们的技术团队将在24小时内回复。\n\n📧 ' + SUPPORT_EMAIL,
    ar: 'تم استلام استفسارك. سيرد فريقنا التقني خلال 24 ساعة.\n\n📧 ' + SUPPORT_EMAIL,
  },
  error_send: {
    es: 'Error al enviar. Escríbenos directamente a ' + SUPPORT_EMAIL,
    en: 'Failed to send. Please write to us at ' + SUPPORT_EMAIL,
    pt: 'Falha ao enviar. Escreva-nos em ' + SUPPORT_EMAIL,
    fr: 'Échec de l\'envoi. Écrivez-nous à ' + SUPPORT_EMAIL,
    it: 'Invio fallito. Scrivici a ' + SUPPORT_EMAIL,
    de: 'Senden fehlgeschlagen. Schreiben Sie uns: ' + SUPPORT_EMAIL,
    nl: 'Verzenden mislukt. Schrijf ons op ' + SUPPORT_EMAIL,
    ru: 'Ошибка отправки. Напишите нам: ' + SUPPORT_EMAIL,
    zh: '发送失败。请直接写信至 ' + SUPPORT_EMAIL,
    ar: 'فشل الإرسال. اكتب إلينا على ' + SUPPORT_EMAIL,
  },
};

function t(key: string, lang: string): string {
  return T[key]?.[lang] || T[key]?.en || key;
}

function getLang(): string {
  if (typeof navigator === 'undefined') return 'en';
  const l = navigator.language?.slice(0, 2).toLowerCase();
  return T.welcome[l] ? l : 'en';
}

function genSessionId() {
  return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const PART_RE = /^[A-Z0-9][A-Z0-9\-]{3,19}$/i;

const DIST_KEYWORDS: Record<string, string[]> = {
  en: ['distributor', 'dealer', 'reseller', 'wholesale', 'distribute'],
  es: ['distribuidor', 'revendedor', 'mayorista', 'distribuir', 'dealer'],
  pt: ['distribuidor', 'revendedor', 'atacado', 'distribuir'],
  fr: ['distributeur', 'revendeur', 'grossiste', 'distribuer'],
  it: ['distributore', 'rivenditore', 'grossista', 'distribuire'],
  de: ['distributor', 'händler', 'großhändler', 'verteilen'],
  nl: ['distributeur', 'dealer', 'groothandel', 'verdelen'],
  ru: ['дистрибьютор', 'дилер', 'оптовик', 'распространять'],
  zh: ['经销商', '分销商', '批发'],
  ar: ['موزع', 'تاجر', 'بالجملة'],
};

function detectIntent(text: string, lang: string): 'part' | 'dist' | 'tech' | 'oil' | 'fuel' | 'hydraulic' | 'cabin' | 'air' | 'warranty' | 'contact' {
  const clean = text.trim().replace(/\s+/g, ' ');
  const lower = clean.toLowerCase();

  if (/^\S+$/.test(clean) && PART_RE.test(clean)) return 'part';

  const distWords = [...(DIST_KEYWORDS[lang] || []), ...DIST_KEYWORDS.en];
  if (distWords.some(w => lower.includes(w))) return 'dist';

  if (/oil|lube|aceite|lubric|huile|öl|olio|oleo/.test(lower)) return 'oil';
  if (/fuel|diesel|combustib|gasoil|kraftstoff|carburant|carburante/.test(lower)) return 'fuel';
  if (/hydraul|hidraul/.test(lower)) return 'hydraulic';
  if (/cabin|cab[iî]ne|habitaculo|innenraum|cabina|salon/.test(lower)) return 'cabin';
  if (/air|aire|luft|aria|ar |intake/.test(lower)) return 'air';
  if (/warrant|garant|garantie|garanzia|garantia/.test(lower)) return 'warranty';
  if (/contact|soporte|support|help|ayuda|hilfe|aide|aiuto|ajuda/.test(lower)) return 'contact';

  return 'tech';
}

// ── Dynamic suggestion engine ─────────────────────────────────────────────────
// Each context maps to language → suggestions array (max 4 chips).
// Suggestions are shown BELOW the last assistant message as clickable chips.

type SuggestionContext =
  | 'initial' | 'after_part' | 'after_dist' | 'after_oil' | 'after_fuel'
  | 'after_hydraulic' | 'after_cabin' | 'after_air' | 'after_warranty'
  | 'after_escalated' | 'after_tech';

const SUGGESTIONS: Record<SuggestionContext, Record<string, string[]>> = {
  initial: {
    en: ['Find a filter by part number', 'Oil filtration question', 'Hydraulic filter help', 'Become a distributor'],
    es: ['Buscar filtro por número de parte', 'Pregunta sobre filtros de aceite', 'Ayuda con filtros hidráulicos', 'Ser distribuidor'],
    pt: ['Buscar filtro por número', 'Filtração de óleo', 'Filtros hidráulicos', 'Ser distribuidor'],
    fr: ['Trouver un filtre par référence', 'Question filtre huile', 'Aide filtre hydraulique', 'Devenir distributeur'],
    it: ['Trovare un filtro per codice', 'Domanda filtro olio', 'Aiuto filtro idraulico', 'Diventare distributore'],
    de: ['Filter nach Teilenummer suchen', 'Ölfilter-Frage', 'Hydraulikfilter-Hilfe', 'Distributor werden'],
    nl: ['Filter zoeken op nummer', 'Oliefilter vraag', 'Hydraulisch filter hulp', 'Distributeur worden'],
    ru: ['Найти фильтр по номеру', 'Вопрос о масляном фильтре', 'Гидравлический фильтр', 'Стать дистрибьютором'],
    zh: ['按零件号查找滤芯', '机油滤清器问题', '液压滤清器帮助', '成为经销商'],
    ar: ['البحث بالرقم', 'سؤال عن فلتر الزيت', 'مساعدة فلتر هيدروليك', 'أصبح موزعاً'],
  },
  after_part: {
    en: ['Search a different part number', 'What does this filter fit?', 'Find equivalent filters', 'Contact technical support'],
    es: ['Buscar otro número de parte', '¿Para qué vehículo es este filtro?', 'Buscar filtros equivalentes', 'Contactar soporte técnico'],
    pt: ['Buscar outro número', 'Para qual veículo é este filtro?', 'Filtros equivalentes', 'Suporte técnico'],
    fr: ['Rechercher autre référence', 'Ce filtre convient à quel véhicule?', 'Filtres équivalents', 'Support technique'],
    it: ['Cercare altro codice', 'Per quale veicolo è questo filtro?', 'Filtri equivalenti', 'Supporto tecnico'],
    de: ['Andere Teilenummer suchen', 'Für welches Fahrzeug?', 'Gleichwertige Filter', 'Technischer Support'],
    nl: ['Ander nummer zoeken', 'Voor welk voertuig?', 'Equivalente filters', 'Technische ondersteuning'],
    ru: ['Найти другой номер', 'Для какого авто?', 'Эквивалентные фильтры', 'Техническая поддержка'],
    zh: ['搜索其他零件号', '这个滤芯适合什么车？', '查找等效滤芯', '技术支持'],
    ar: ['البحث بكود آخر', 'لأي سيارة هذا الفلتر؟', 'فلاتر مماثلة', 'الدعم الفني'],
  },
  after_dist: {
    en: ['Learn about ELIMFILTERS products', 'Technical support for distributors', 'Download product catalog', 'Contact us directly'],
    es: ['Conocer productos ELIMFILTERS', 'Soporte técnico para distribuidores', 'Descargar catálogo', 'Contacto directo'],
    pt: ['Produtos ELIMFILTERS', 'Suporte técnico distribuidores', 'Baixar catálogo', 'Contato direto'],
    fr: ['Produits ELIMFILTERS', 'Support distributeurs', 'Télécharger catalogue', 'Contact direct'],
    it: ['Prodotti ELIMFILTERS', 'Supporto distributori', 'Scarica catalogo', 'Contatto diretto'],
    de: ['ELIMFILTERS Produkte', 'Distributor-Support', 'Katalog herunterladen', 'Direktkontakt'],
    nl: ['ELIMFILTERS producten', 'Support voor distributeurs', 'Catalogus downloaden', 'Direct contact'],
    ru: ['Продукты ELIMFILTERS', 'Поддержка дистрибьюторов', 'Скачать каталог', 'Прямой контакт'],
    zh: ['ELIMFILTERS产品', '经销商技术支持', '下载产品目录', '直接联系'],
    ar: ['منتجات ELIMFILTERS', 'دعم الموزعين', 'تحميل الكتالوج', 'تواصل مباشر'],
  },
  after_oil: {
    en: ['ISO 4406 cleanliness codes explained', 'Oil filter selection for heavy duty', 'How often to change oil filter?', 'SYNTRAX technology details'],
    es: ['Códigos de limpieza ISO 4406', 'Selección de filtro de aceite heavy duty', '¿Cada cuánto cambiar el filtro?', 'Tecnología SYNTRAX'],
    pt: ['Códigos ISO 4406', 'Filtro de óleo heavy duty', 'Intervalo de troca do filtro', 'Tecnologia SYNTRAX'],
    fr: ['Codes propreté ISO 4406', 'Filtre huile heavy duty', 'Fréquence de remplacement', 'Technologie SYNTRAX'],
    it: ['Codici pulizia ISO 4406', 'Filtro olio heavy duty', 'Frequenza sostituzione', 'Tecnologia SYNTRAX'],
    de: ['ISO 4406 Reinheitscodes', 'Ölfilter Heavy Duty', 'Wechselintervalle', 'SYNTRAX Technologie'],
    nl: ['ISO 4406 reinheids codes', 'Oliefilter heavy duty', 'Wisseltijden', 'SYNTRAX technologie'],
    ru: ['Коды чистоты ISO 4406', 'Масляный фильтр heavy duty', 'Интервалы замены', 'Технология SYNTRAX'],
    zh: ['ISO 4406清洁度代码', 'Heavy duty机油滤清器', '更换频率', 'SYNTRAX技术'],
    ar: ['رموز نظافة ISO 4406', 'فلتر الزيت heavy duty', 'تكرار التغيير', 'تقنية SYNTRAX'],
  },
  after_fuel: {
    en: ['Water contamination in diesel fuel', 'SYNTEPORE vs HYDROCORE technology', 'Fuel filter for HPCR injectors', 'Fuel filter selection guide'],
    es: ['Contaminación por agua en diésel', 'Tecnología SYNTEPORE vs HYDROCORE', 'Filtro combustible para inyectores HPCR', 'Guía de selección'],
    pt: ['Contaminação de água no diesel', 'SYNTEPORE vs HYDROCORE', 'Filtro para injetores HPCR', 'Guia de seleção'],
    fr: ['Contamination eau diesel', 'SYNTEPORE vs HYDROCORE', 'Filtre carburant injecteurs HPCR', 'Guide sélection'],
    it: ['Contaminazione acqua diesel', 'SYNTEPORE vs HYDROCORE', 'Filtro carburante iniettori HPCR', 'Guida selezione'],
    de: ['Wasserverunreinigung Diesel', 'SYNTEPORE vs HYDROCORE', 'Kraftstofffilter HPCR', 'Auswahlhilfe'],
    nl: ['Waterverontreiniging diesel', 'SYNTEPORE vs HYDROCORE', 'Brandstoffilter HPCR', 'Selectiegids'],
    ru: ['Вода в дизельном топливе', 'SYNTEPORE vs HYDROCORE', 'Фильтр для HPCR форсунок', 'Руководство по выбору'],
    zh: ['柴油水污染', 'SYNTEPORE vs HYDROCORE', 'HPCR喷油嘴燃油滤清器', '选型指南'],
    ar: ['تلوث الماء في الديزل', 'SYNTEPORE vs HYDROCORE', 'فلتر وقود ل HPCR', 'دليل الاختيار'],
  },
  after_hydraulic: {
    en: ['ISO 16889 beta ratio explained', 'NANOFORCE technology for hydraulics', 'Hydraulic cleanliness targets', 'Proportional valve protection'],
    es: ['Razón beta ISO 16889', 'Tecnología NANOFORCE hidráulica', 'Objetivos de limpieza hidráulica', 'Protección válvula proporcional'],
    pt: ['Razão beta ISO 16889', 'NANOFORCE para hidráulica', 'Metas de limpeza hidráulica', 'Proteção válvula proporcional'],
    fr: ['Bêta ratio ISO 16889', 'NANOFORCE hydraulique', 'Objectifs propreté hydraulique', 'Protection vanne proportionnelle'],
    it: ['Rapporto beta ISO 16889', 'NANOFORCE idraulica', 'Target pulizia idraulica', 'Protezione valvola proporzionale'],
    de: ['ISO 16889 Beta-Verhältnis', 'NANOFORCE Hydraulik', 'Hydraulikreinheit', 'Proportionalventil-Schutz'],
    nl: ['ISO 16889 bèta verhouding', 'NANOFORCE hydrauliek', 'Hydraulische reinheid', 'Proportioneel ventiel'],
    ru: ['Бета-отношение ISO 16889', 'NANOFORCE для гидравлики', 'Чистота гидравлики', 'Защита пропорционального клапана'],
    zh: ['ISO 16889 β值', '液压NANOFORCE技术', '液压清洁度目标', '比例阀保护'],
    ar: ['نسبة بيتا ISO 16889', 'NANOFORCE للهيدروليك', 'أهداف نظافة الهيدروليك', 'حماية الصمام النسبي'],
  },
  after_cabin: {
    en: ['ISO 11155 cabin air standards', 'MICROKAPPA technology details', 'PM10 and operator health', 'Cabin filter replacement interval'],
    es: ['Norma ISO 11155 cabina', 'Tecnología MICROKAPPA', 'PM10 y salud del operador', 'Intervalo de cambio cabina'],
    pt: ['Norma ISO 11155 cabine', 'Tecnologia MICROKAPPA', 'PM10 e saúde do operador', 'Intervalo de troca cabine'],
    fr: ['Norme ISO 11155 cabine', 'Technologie MICROKAPPA', 'PM10 santé opérateur', 'Remplacement filtre cabine'],
    it: ['Norma ISO 11155 cabina', 'Tecnologia MICROKAPPA', 'PM10 salute operatore', 'Sostituzione filtro cabina'],
    de: ['ISO 11155 Kabinenluft', 'MICROKAPPA Technologie', 'PM10 Betriebsgesundheit', 'Kabinenwechselintervall'],
    nl: ['ISO 11155 cabinelucht', 'MICROKAPPA technologie', 'PM10 bedrijfsgezondheidszorg', 'Cabinefilter interval'],
    ru: ['ISO 11155 кабинный воздух', 'Технология MICROKAPPA', 'PM10 и здоровье оператора', 'Интервал замены'],
    zh: ['ISO 11155驾驶室空气标准', 'MICROKAPPA技术', 'PM10与操作员健康', '更换间隔'],
    ar: ['معيار ISO 11155 للكابينة', 'تقنية MICROKAPPA', 'PM10 وصحة المشغل', 'فترة تغيير فلتر الكابينة'],
  },
  after_air: {
    en: ['SAE J726 air filter standards', 'MACROCORE technology details', 'Air filter efficiency for engines', 'Bypass valve behavior'],
    es: ['Norma SAE J726 filtro de aire', 'Tecnología MACROCORE', 'Eficiencia filtro de aire motores', 'Comportamiento válvula bypass'],
    pt: ['Norma SAE J726', 'Tecnologia MACROCORE', 'Eficiência filtro de ar motores', 'Válvula bypass'],
    fr: ['Norme SAE J726', 'Technologie MACROCORE', 'Efficacité filtre air moteurs', 'Clapet de dérivation'],
    it: ['Norma SAE J726', 'Tecnologia MACROCORE', 'Efficienza filtro aria motori', 'Valvola bypass'],
    de: ['SAE J726 Luftfilter', 'MACROCORE Technologie', 'Luftfiltereffizienz', 'Bypass-Ventil'],
    nl: ['SAE J726 luchtfilter', 'MACROCORE technologie', 'Luchtfilter efficiëntie', 'Bypassklep'],
    ru: ['SAE J726 воздушный фильтр', 'Технология MACROCORE', 'Эффективность воздушного фильтра', 'Обходной клапан'],
    zh: ['SAE J726空气滤清器标准', 'MACROCORE技术', '发动机空气过滤效率', '旁通阀行为'],
    ar: ['معيار SAE J726', 'تقنية MACROCORE', 'كفاءة فلتر الهواء', 'صمام التجاوز'],
  },
  after_warranty: {
    en: ['Submit a warranty claim', 'Warranty coverage details', 'Contact technical support', 'Find nearest authorized dealer'],
    es: ['Enviar reclamación de garantía', 'Detalles de cobertura', 'Contactar soporte técnico', 'Distribuidor autorizado'],
    pt: ['Enviar reclamação de garantia', 'Detalhes da cobertura', 'Suporte técnico', 'Distribuidor autorizado'],
    fr: ['Déposer une réclamation garantie', 'Détails de la couverture', 'Support technique', 'Distributeur agréé'],
    it: ['Inviare reclamo garanzia', 'Dettagli copertura', 'Supporto tecnico', 'Distributore autorizzato'],
    de: ['Garantiefall einreichen', 'Abdeckungsdetails', 'Technischer Support', 'Autorisierter Händler'],
    nl: ['Garantieclaim indienen', 'Dekkingsdetails', 'Technische ondersteuning', 'Geautoriseerde dealer'],
    ru: ['Подать гарантийную претензию', 'Условия гарантии', 'Техническая поддержка', 'Авторизованный дилер'],
    zh: ['提交保修索赔', '保修覆盖详情', '技术支持', '授权经销商'],
    ar: ['تقديم مطالبة ضمان', 'تفاصيل التغطية', 'الدعم الفني', 'وكيل معتمد'],
  },
  after_escalated: {
    en: ['Ask another question', 'Find a part number', 'View product catalog', 'Contact by email'],
    es: ['Hacer otra pregunta', 'Buscar número de parte', 'Ver catálogo de productos', 'Contactar por correo'],
    pt: ['Fazer outra pergunta', 'Buscar número de peça', 'Ver catálogo', 'Contato por e-mail'],
    fr: ['Poser une autre question', 'Trouver une référence', 'Voir le catalogue', 'Contact par email'],
    it: ['Fare un\'altra domanda', 'Trovare codice parte', 'Vedere catalogo', 'Contatto via email'],
    de: ['Weitere Frage stellen', 'Teilenummer suchen', 'Katalog ansehen', 'Per E-Mail kontaktieren'],
    nl: ['Nog een vraag stellen', 'Onderdeel nummer zoeken', 'Catalogus bekijken', 'Contact per email'],
    ru: ['Задать другой вопрос', 'Найти номер детали', 'Просмотреть каталог', 'Написать на email'],
    zh: ['再问一个问题', '查找零件号', '查看产品目录', '发送邮件联系'],
    ar: ['طرح سؤال آخر', 'البحث عن رقم قطعة', 'عرض الكتالوج', 'التواصل عبر البريد'],
  },
  after_tech: {
    en: ['Oil filtration systems', 'Hydraulic filter selection', 'Fuel contamination control', 'Find a specific part'],
    es: ['Sistemas de filtración de aceite', 'Selección filtros hidráulicos', 'Control contaminación combustible', 'Buscar parte específica'],
    pt: ['Sistemas de filtração de óleo', 'Seleção filtros hidráulicos', 'Controle contaminação combustível', 'Buscar peça específica'],
    fr: ['Systèmes filtration huile', 'Sélection filtres hydrauliques', 'Contrôle contamination carburant', 'Trouver une référence'],
    it: ['Sistemi filtrazione olio', 'Selezione filtri idraulici', 'Controllo contaminazione carburante', 'Trovare pezzo specifico'],
    de: ['Ölfiltrationssysteme', 'Hydraulikfilter-Auswahl', 'Kraftstoffkontamination', 'Teil suchen'],
    nl: ['Oliefiltratiesystemen', 'Hydraulisch filter selectie', 'Brandstof contaminatie', 'Onderdeel zoeken'],
    ru: ['Системы масляной фильтрации', 'Выбор гидравлических фильтров', 'Контроль загрязнения топлива', 'Найти деталь'],
    zh: ['机油过滤系统', '液压滤清器选型', '燃油污染控制', '查找特定零件'],
    ar: ['أنظمة ترشيح الزيت', 'اختيار فلاتر هيدروليك', 'التحكم في تلوث الوقود', 'البحث عن قطعة'],
  },
};

function getSuggestions(context: SuggestionContext, lang: string): string[] {
  const map = SUGGESTIONS[context];
  return map[lang] || map.en || [];
}

interface Msg { role: 'user' | 'assistant'; text: string; }

async function escalate(sessionId: string, lang: string, history: Msg[]) {
  const transcript = history
    .map(m => `${m.role === 'user' ? 'CLIENT' : 'BOT'}: ${m.text}`)
    .join('\n\n');
  const turnstileToken = typeof window !== 'undefined' ? (window as any).__turnstileToken || '' : '';
  await fetch(`${PART_SEARCH_BASE}/api/ai/escalate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, lang, transcript, turnstileToken }),
  });
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [sessionId] = useState(genSessionId);
  const [lang] = useState(getLang);
  const [started, setStarted] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending, suggestions]);

  useEffect(() => {
    if (open && !started) {
      setMessages([{ role: 'assistant', text: t('welcome', lang) }]);
      setSuggestions(getSuggestions('initial', lang));
      setStarted(true);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open, started, lang]);

  const addMsg = (msg: Msg) => setMessages(prev => [...prev, msg]);

  const handleSend = useCallback(async (text: string) => {
    if (!text.trim() || sending || done) return;
    setInput('');
    setSuggestions([]);
    addMsg({ role: 'user', text });

    const intent = detectIntent(text, lang);

    if (intent === 'part') {
      addMsg({ role: 'assistant', text: `${t('redirect_part', lang)} "${text.toUpperCase()}"…` });
      setSuggestions(getSuggestions('after_part', lang));
      setTimeout(() => window.open(`${PART_SEARCH_BASE}?q=${encodeURIComponent(text)}`, '_blank'), 900);
      return;
    }

    if (intent === 'dist') {
      addMsg({ role: 'assistant', text: t('redirect_dist', lang) });
      setSuggestions(getSuggestions('after_dist', lang));
      setTimeout(() => window.open('/dealer', '_blank'), 1000);
      return;
    }

    // Map intent to post-response suggestion context
    const suggestionContext: SuggestionContext =
      intent === 'oil'       ? 'after_oil'       :
      intent === 'fuel'      ? 'after_fuel'       :
      intent === 'hydraulic' ? 'after_hydraulic'  :
      intent === 'cabin'     ? 'after_cabin'      :
      intent === 'air'       ? 'after_air'        :
      intent === 'warranty'  ? 'after_warranty'   :
      'after_tech';

    setSending(true);
    try {
      await escalate(sessionId, lang, [
        ...messages,
        { role: 'user', text },
      ]);
      addMsg({ role: 'assistant', text: t('escalated', lang) });
      setSuggestions(getSuggestions('after_escalated', lang));
      setDone(true);
    } catch {
      addMsg({ role: 'assistant', text: t('error_send', lang) });
      setSuggestions(getSuggestions(suggestionContext, lang));
    } finally {
      setSending(false);
    }
  }, [sending, done, lang, messages, sessionId]);

  const send = () => handleSend(input);

  const clickSuggestion = (s: string) => {
    setSuggestions([]);
    handleSend(s);
  };

  const isRTL = ['ar', 'fa'].includes(lang);

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setOpen(true)}
            style={{
              position: 'fixed', bottom: '1.5rem', right: '1.5rem',
              width: '56px', height: '56px',
              background: '#FFF12D', border: 'none', borderRadius: '4px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 9999, boxShadow: '0 4px 20px rgba(255,241,45,0.35)',
            }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Chat with ELIMFILTERS"
          >
            <img src="/assets/elimfilters-e.png" alt="ELIMFILTERS" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            dir={isRTL ? 'rtl' : 'ltr'}
            style={{
              position: 'fixed', bottom: '1.5rem', right: '1.5rem',
              width: '310px', maxWidth: 'calc(100vw - 2rem)',
              background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '4px', display: 'flex', flexDirection: 'column',
              zIndex: 9999, boxShadow: '0 8px 40px rgba(0,0,0,0.6)', overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              background: '#FFF12D', padding: '0.6rem 0.85rem',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <img src="/assets/elimfilters-e.png" alt="ELIMFILTERS" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                <span style={{ fontFamily: 'Titillium Web, sans-serif', fontWeight: 700, fontSize: '0.8rem', color: '#000' }}>ELIMFILTERS</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem', lineHeight: 1 }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M1 1L17 17M17 1L1 17" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Messages + suggestions */}
            <div style={{ maxHeight: '360px', overflowY: 'auto', padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                  style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '88%' }}
                >
                  <div style={{
                    background: m.role === 'user' ? '#FFF12D' : 'rgba(255,255,255,0.07)',
                    color: m.role === 'user' ? '#000' : '#fff',
                    borderRadius: m.role === 'user' ? '10px 10px 2px 10px' : '10px 10px 10px 2px',
                    padding: '0.5rem 0.75rem', fontSize: '0.8rem', lineHeight: 1.5,
                    whiteSpace: 'pre-wrap', fontFamily: 'Inter, sans-serif',
                  }}>
                    {m.text}
                  </div>
                </motion.div>
              ))}

              {sending && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ alignSelf: 'flex-start' }}>
                  <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '12px 12px 12px 2px', padding: '0.65rem 0.9rem', display: 'flex', gap: '4px', alignItems: 'center' }}>
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FFF12D' }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Dynamic suggestion chips */}
              <AnimatePresence>
                {suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.2 }}
                    style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.2rem' }}
                  >
                    {suggestions.map((s, i) => (
                      <motion.button
                        key={s}
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.15, delay: i * 0.05 }}
                        onClick={() => clickSuggestion(s)}
                        whileHover={{ background: 'rgba(255,241,45,0.18)', borderColor: 'rgba(255,241,45,0.6)' }}
                        style={{
                          background: 'rgba(255,241,45,0.08)',
                          border: '1px solid rgba(255,241,45,0.3)',
                          borderRadius: '20px',
                          color: '#FFF12D',
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '0.7rem',
                          padding: '0.3rem 0.65rem',
                          cursor: 'pointer',
                          lineHeight: 1.4,
                          textAlign: 'left',
                        }}
                      >
                        {s}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            {!done && (
              <div style={{ padding: '0.5rem 0.6rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '0.4rem', flexShrink: 0, background: '#0a0a0a' }}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => { setInput(e.target.value); if (e.target.value.trim()) setSuggestions([]); }}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder={t('placeholder', lang)}
                  rows={1}
                  style={{
                    flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '4px', color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '0.8rem',
                    padding: '0.6rem 0.75rem', outline: 'none', resize: 'none', lineHeight: 1.5,
                  }}
                />
                <button
                  onClick={send}
                  disabled={sending || !input.trim()}
                  style={{
                    background: sending || !input.trim() ? 'rgba(255,241,45,0.3)' : '#FFF12D',
                    border: 'none', borderRadius: '4px', width: '40px',
                    cursor: sending || !input.trim() ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.15s',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M14 8L2 2L5 8L2 14L14 8Z" fill="#000"/>
                  </svg>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
