'use strict';

const { buildTicket, dispatchTicket } = require('./bot-protocol-escalation');
const { groqChatJson } = require('./bot-protocol-groq');

const SUPPORTED_LANGUAGES = ['es', 'en', 'pt', 'fr', 'it', 'nl', 'ru', 'zh', 'ja', 'ar', 'fa'];

const LANGUAGE_NAMES = {
  es: 'Spanish', en: 'English', pt: 'Portuguese', fr: 'French', it: 'Italian',
  nl: 'Dutch', ru: 'Russian', zh: 'Chinese', ja: 'Japanese', ar: 'Arabic', fa: 'Persian'
};

// Free-text catalog fields (product.description, knowledge-center comments)
// are stored in English regardless of the customer's language. Translating
// them per-request via the LLM -- rather than omitting them for anyone not
// talking to us in English, which is what this file used to do -- is what
// lets every customer get the same descriptive detail in their own
// language. SKU/OEM/part codes are never passed through this: they are
// interpolated separately, verbatim, in formatCatalogProduct/
// buildCrossReferenceNarrative below.
const descriptionTranslationCache = new Map();
const MAX_DESCRIPTION_CACHE = 800;

async function translateTechnicalText(text, language) {
  const targetName = LANGUAGE_NAMES[language];
  if (!targetName) return null;
  const result = await groqChatJson([
    {
      role: 'system',
      content: `You are a precise technical translator for ELIMFILTERS, an industrial filtration manufacturer. Translate the given English product-description text into ${targetName}. Rules: 1) Translate only -- never add, remove, invent, or alter any technical fact, spec, number, or claim. 2) Never translate, transliterate, or alter SKU codes, part numbers, OEM codes, or ELIMFILTERS product-family/technology brand names (e.g. SYNTRAX, HYDROCORE, MACROCORE) -- copy them exactly as given, verbatim, unchanged. 3) Keep it concise, natural, and professional in the target language, matching the register of a B2B technical support conversation. Return JSON {"text":"translated text"}.`
    },
    { role: 'user', content: JSON.stringify({ text }) }
  ], { maxTokens: 300, temperature: 0, timeoutMs: 4000 });
  return typeof result?.text === 'string' && result.text.trim() ? result.text.trim() : null;
}

// Returns `text` localized into `language`. English customers and empty
// input pass straight through with no LLM call. Any translation failure
// (timeout, no API key, malformed response) falls back to the original
// English text rather than dropping it -- an untranslated detail is still
// better than a silently missing one.
async function localizeDescription(text, language) {
  if (!text) return null;
  if (language === 'en' || !language) return text;
  const cacheKey = `${language}:${text}`;
  if (descriptionTranslationCache.has(cacheKey)) return descriptionTranslationCache.get(cacheKey);
  const translated = await translateTechnicalText(text, language);
  const result = translated || text;
  if (descriptionTranslationCache.size >= MAX_DESCRIPTION_CACHE) descriptionTranslationCache.clear();
  descriptionTranslationCache.set(cacheKey, result);
  return result;
}

const CHANNEL_LIMITS = Object.freeze({
  whatsapp: 3000,
  instagram: 900,
  facebook: 1800,
  linkedin: 1300,
  web: 5000,
  api: 8000
});

const MAX_UNRESOLVED_ATTEMPTS = 5;

const COPY = {
  es: {
    confirmed: 'Referencia confirmada en la base de datos ELIMFILTERS:',
    recommendationIntro: 'Esto es lo que te recomendamos:',
    recommendationIntroFor: vehicle => `Para tu ${vehicle}, esto es lo que te recomendamos:`,
    recommendationClosing: 'Elegí ELIMFILTERS: protección real para tu equipo, con tecnología validada y trazabilidad en cada referencia. ¿Seguimos con la compra o tenés otra consulta?',
    description: 'Descripción',
    technology: 'Tecnología ELIMFILTERS',
    technicalComment: 'Comentario técnico',
    authorizedDistributor: 'Para adquirir productos ELIMFILTERS, debe contactar al distribuidor autorizado de su país. ¿En qué país se encuentra?',
    noDistributor: 'Entiendo. Para orientarlo correctamente: ¿está interesado en distribuir ELIMFILTERS en su país, o necesita productos para una empresa, flota, mina, planta, taller u otra operación? Indique también el país y el tipo de operación.',
    escalated: ticket => `No pude confirmar una respuesta con suficiente evidencia. Su solicitud fue referida al departamento correspondiente de ELIMFILTERS bajo el Ticket #${ticket}. Nuestro equipo continuará la revisión.`,
    greeting: 'Hola. ¿En qué equipo o sistema necesitás ayuda? Podés indicar marca, modelo, motor, año y el problema que presenta.',
    noEvidence: 'No encontré una equivalencia confirmada en la base de datos ELIMFILTERS. No asignaré un SKU sin evidencia.',
    supportEmailRequest: 'Nuestro equipo técnico revisará tu caso personalmente. ¿Podrías compartirme tu correo electrónico para que te contactemos?',
    noVerifiedMatchReference: 'No encontré una coincidencia verificada para esa referencia en el catálogo ELIMFILTERS.',
    noVerifiedMatch: 'No encontré una coincidencia verificada en el catálogo ELIMFILTERS para esa referencia.',
    distributionConfirmed: 'Gracias por la información. Para iniciar el proceso de precalificación comercial B2B, completá el formulario en https://elimfilters.com/distributor-application. Nuestro equipo comercial evaluará tu solicitud según el país, la experiencia y el volumen estimado, y se pondrá en contacto.',
    distributionAsk: 'Para evaluar una oportunidad de distribución necesito país o territorio, tipo de clientes que atendés y experiencia en filtración, flotas o equipos pesados.',
    commercialAsk: 'Para preparar una cotización necesito el código o la aplicación exacta, la cantidad requerida y el país o ciudad de entrega.',
    supportAsk: 'Describí el equipo, el problema y cualquier código o referencia disponible. Con esos datos puedo iniciar la revisión técnica.',
    generalAsk: 'Indicá qué necesitás revisar: una aplicación, una equivalencia, una especificación, un diagnóstico técnico o información comercial.',
    supportEmailAlreadyRegistered: 'Tu consulta y tu correo ya están registrados. Nuestro equipo técnico se pondrá en contacto contigo a la brevedad.',
    supportEmailThanks: 'Gracias. Registramos tu correo y tu consulta -- nuestro equipo técnico la revisará y se pondrá en contacto contigo a la brevedad.',
    supportEmailInvalid: 'No pude identificar un correo válido. ¿Podrías confirmarlo nuevamente? Por ejemplo: nombre@dominio.com',
    crossRefLine: (ref, sku, filterType) => `La referencia OEM ${ref} cruza con el ELIMFILTERS ${sku}${filterType ? ` ${filterType}` : ''}.`,
    crossRefTechLine: (tech, purpose) => ` Incorpora tecnología ELIMFILTERS ${tech} para ayudar ${purpose}.`
  },
  en: {
    confirmed: 'Reference confirmed in the ELIMFILTERS database:',
    recommendationIntro: 'Here is what we recommend:',
    recommendationIntroFor: vehicle => `For your ${vehicle}, here is what we recommend:`,
    recommendationClosing: 'Choose ELIMFILTERS: real protection for your equipment, with validated technology and traceability on every reference. Shall we move forward, or do you have another question?',
    description: 'Description',
    technology: 'ELIMFILTERS technology',
    technicalComment: 'Technical comment',
    authorizedDistributor: 'To purchase ELIMFILTERS products, please contact the authorized distributor for your country. Which country are you located in?',
    noDistributor: 'Understood. To route your request correctly: are you interested in distributing ELIMFILTERS in your country, or do you need products for a company, fleet, mine, plant, workshop, or another operation? Please also indicate the country and type of operation.',
    escalated: ticket => `I could not confirm an answer with sufficient evidence. Your request was referred to the appropriate ELIMFILTERS department under Ticket #${ticket}. Our team will continue the review.`,
    greeting: 'Hi. What equipment or system do you need help with? You can share the brand, model, engine, year, and the problem it is showing.',
    noEvidence: 'I could not find a confirmed match in the ELIMFILTERS database. I will not assign a SKU without evidence.',
    supportEmailRequest: 'Our technical team will review your case personally. Could you share your email so we can contact you?',
    noVerifiedMatchReference: 'I could not find a verified match for that reference in the ELIMFILTERS catalog.',
    noVerifiedMatch: 'I could not find a verified match in the ELIMFILTERS catalog for that reference.',
    distributionConfirmed: 'Thank you for the information. To start the B2B commercial pre-qualification process, please complete the form at https://elimfilters.com/distributor-application. Our commercial team will evaluate your request based on country, experience, and estimated volume, and will get in touch.',
    distributionAsk: 'To evaluate a distribution opportunity I need your country or territory, the type of customers you serve, and your experience in filtration, fleets, or heavy equipment.',
    commercialAsk: 'To prepare a quote I need the exact code or application, the required quantity, and the country or city for delivery.',
    supportAsk: 'Describe the equipment, the problem, and any code or reference you have available. With that I can start the technical review.',
    generalAsk: 'Let me know what you need: an application lookup, a cross-reference, a specification, a technical diagnosis, or commercial information.',
    supportEmailAlreadyRegistered: 'Your inquiry and email are already registered. Our technical team will contact you shortly.',
    supportEmailThanks: 'Thank you. We have registered your email and your inquiry -- our technical team will review it and contact you shortly.',
    supportEmailInvalid: 'I could not identify a valid email. Could you confirm it again? For example: name@domain.com',
    crossRefLine: (ref, sku, filterType) => `The OEM part number ${ref} cross-references to the ELIMFILTERS ${sku}${filterType ? ` ${filterType}` : ''}.`,
    crossRefTechLine: (tech, purpose) => ` It incorporates ELIMFILTERS ${tech} technology to help ${purpose}.`
  },
  pt: {
    confirmed: 'Referência confirmada no banco de dados ELIMFILTERS:',
    recommendationIntro: 'Aqui está o que recomendamos:',
    recommendationIntroFor: vehicle => `Para o seu ${vehicle}, aqui está o que recomendamos:`,
    recommendationClosing: 'Escolha a ELIMFILTERS: proteção real para o seu equipamento, com tecnologia validada e rastreabilidade em cada referência. Seguimos com a compra ou tem outra dúvida?',
    description: 'Descrição',
    technology: 'Tecnologia ELIMFILTERS',
    technicalComment: 'Comentário técnico',
    authorizedDistributor: 'Para adquirir produtos ELIMFILTERS, entre em contato com o distribuidor autorizado do seu país. Em qual país você está?',
    noDistributor: 'Entendo. Para direcionar corretamente: você tem interesse em distribuir ELIMFILTERS no seu país ou precisa de produtos para uma empresa, frota, mina, planta, oficina ou outra operação? Informe também o país e o tipo de operação.',
    escalated: ticket => `Não consegui confirmar uma resposta com evidência suficiente. Sua solicitação foi encaminhada ao departamento correspondente da ELIMFILTERS sob o Ticket #${ticket}. Nossa equipe continuará a análise.`,
    greeting: 'Olá. Em qual equipamento ou sistema você precisa de ajuda? Você pode indicar marca, modelo, motor, ano e o problema apresentado.',
    noEvidence: 'Não encontrei uma equivalência confirmada no banco de dados ELIMFILTERS. Não vou atribuir um SKU sem evidência.',
    supportEmailRequest: 'Nossa equipe técnica revisará seu caso pessoalmente. Você poderia compartilhar seu e-mail para que possamos entrar em contato?',
    noVerifiedMatchReference: 'Não encontrei uma correspondência verificada para essa referência no catálogo ELIMFILTERS.',
    noVerifiedMatch: 'Não encontrei uma correspondência verificada no catálogo ELIMFILTERS para essa referência.',
    distributionConfirmed: 'Obrigado pelas informações. Para iniciar o processo de pré-qualificação comercial B2B, preencha o formulário em https://elimfilters.com/distributor-application. Nossa equipe comercial avaliará sua solicitação de acordo com o país, a experiência e o volume estimado, e entrará em contato.',
    distributionAsk: 'Para avaliar uma oportunidade de distribuição, preciso do país ou território, do tipo de clientes que você atende e da sua experiência em filtração, frotas ou equipamentos pesados.',
    commercialAsk: 'Para preparar uma cotação, preciso do código ou da aplicação exata, da quantidade necessária e do país ou cidade de entrega.',
    supportAsk: 'Descreva o equipamento, o problema e qualquer código ou referência disponível. Com esses dados posso iniciar a revisão técnica.',
    generalAsk: 'Indique o que você precisa revisar: uma aplicação, uma equivalência, uma especificação, um diagnóstico técnico ou informações comerciais.',
    supportEmailAlreadyRegistered: 'Sua consulta e seu e-mail já estão registrados. Nossa equipe técnica entrará em contato em breve.',
    supportEmailThanks: 'Obrigado. Registramos seu e-mail e sua consulta -- nossa equipe técnica irá revisá-la e entrará em contato em breve.',
    supportEmailInvalid: 'Não consegui identificar um e-mail válido. Você poderia confirmá-lo novamente? Por exemplo: nome@dominio.com',
    crossRefLine: (ref, sku, filterType) => `O código OEM ${ref} corresponde ao ELIMFILTERS ${sku}${filterType ? ` ${filterType}` : ''}.`,
    crossRefTechLine: (tech, purpose) => ` Incorpora a tecnologia ELIMFILTERS ${tech} para ${purpose}.`
  },
  fr: {
    confirmed: "Référence confirmée dans la base de données ELIMFILTERS :",
    recommendationIntro: "Voici ce que nous vous recommandons :",
    recommendationIntroFor: vehicle => `Pour votre ${vehicle}, voici ce que nous vous recommandons :`,
    recommendationClosing: "Choisissez ELIMFILTERS : une protection réelle pour votre équipement, avec une technologie validée et une traçabilité sur chaque référence. Souhaitez-vous poursuivre l'achat ou avez-vous une autre question ?",
    description: "Description",
    technology: "Technologie ELIMFILTERS",
    technicalComment: "Commentaire technique",
    authorizedDistributor: "Pour acheter des produits ELIMFILTERS, veuillez contacter le distributeur agréé de votre pays. Dans quel pays vous trouvez-vous ?",
    noDistributor: "Je comprends. Pour bien orienter votre demande : souhaitez-vous distribuer ELIMFILTERS dans votre pays, ou avez-vous besoin de produits pour une entreprise, une flotte, une mine, une usine, un atelier ou une autre opération ? Merci d'indiquer également le pays et le type d'opération.",
    escalated: ticket => `Je n'ai pas pu confirmer de réponse avec suffisamment d'éléments. Votre demande a été transmise au service ELIMFILTERS concerné sous le ticket n° ${ticket}. Notre équipe poursuivra l'examen.`,
    greeting: "Bonjour. Pour quel équipement ou système avez-vous besoin d'aide ? Vous pouvez indiquer la marque, le modèle, le moteur, l'année et le problème observé.",
    noEvidence: "Je n'ai trouvé aucune équivalence confirmée dans la base de données ELIMFILTERS. Je n'attribuerai pas de référence sans preuve.",
    supportEmailRequest: "Notre équipe technique examinera votre cas personnellement. Pourriez-vous nous communiquer votre adresse e-mail afin que nous puissions vous contacter ?",
    noVerifiedMatchReference: "Je n'ai trouvé aucune correspondance vérifiée pour cette référence dans le catalogue ELIMFILTERS.",
    noVerifiedMatch: "Je n'ai trouvé aucune correspondance vérifiée dans le catalogue ELIMFILTERS pour cette référence.",
    distributionConfirmed: "Merci pour ces informations. Pour lancer le processus de préqualification commerciale B2B, veuillez remplir le formulaire sur https://elimfilters.com/distributor-application. Notre équipe commerciale évaluera votre demande selon le pays, l'expérience et le volume estimé, puis vous contactera.",
    distributionAsk: "Pour évaluer une opportunité de distribution, j'ai besoin de votre pays ou territoire, du type de clients que vous servez et de votre expérience en filtration, flottes ou équipements lourds.",
    commercialAsk: "Pour préparer un devis, j'ai besoin du code ou de l'application exacte, de la quantité requise et du pays ou de la ville de livraison.",
    supportAsk: "Décrivez l'équipement, le problème et tout code ou référence disponible. Avec ces informations, je peux entamer l'examen technique.",
    generalAsk: "Indiquez ce que vous souhaitez vérifier : une application, une équivalence, une spécification, un diagnostic technique ou une information commerciale.",
    supportEmailAlreadyRegistered: "Votre demande et votre e-mail sont déjà enregistrés. Notre équipe technique vous contactera sous peu.",
    supportEmailThanks: "Merci. Nous avons enregistré votre e-mail et votre demande -- notre équipe technique l'examinera et vous contactera sous peu.",
    supportEmailInvalid: "Je n'ai pas pu identifier une adresse e-mail valide. Pourriez-vous la confirmer à nouveau ? Par exemple : nom@domaine.com",
    crossRefLine: (ref, sku, filterType) => `La référence OEM ${ref} correspond au ELIMFILTERS ${sku}${filterType ? ` ${filterType}` : ''}.`,
    crossRefTechLine: (tech, purpose) => ` Il intègre la technologie ELIMFILTERS ${tech} pour aider à ${purpose}.`
  },
  it: {
    confirmed: 'Riferimento confermato nel database ELIMFILTERS:',
    recommendationIntro: 'Ecco cosa ti consigliamo:',
    recommendationIntroFor: vehicle => `Per il tuo ${vehicle}, ecco cosa ti consigliamo:`,
    recommendationClosing: "Scegli ELIMFILTERS: protezione reale per il tuo mezzo, con tecnologia validata e tracciabilità su ogni riferimento. Procediamo con l'acquisto o hai un'altra domanda?",
    description: 'Descrizione',
    technology: 'Tecnologia ELIMFILTERS',
    technicalComment: 'Commento tecnico',
    authorizedDistributor: 'Per acquistare prodotti ELIMFILTERS, contatta il distributore autorizzato nel tuo paese. In quale paese ti trovi?',
    noDistributor: "Capito. Per indirizzarti correttamente: sei interessato a distribuire ELIMFILTERS nel tuo paese, oppure ti servono prodotti per un'azienda, una flotta, una miniera, un impianto, un'officina o un'altra attività? Indica anche il paese e il tipo di attività.",
    escalated: ticket => `Non sono riuscito a confermare una risposta con prove sufficienti. La tua richiesta è stata inoltrata al reparto ELIMFILTERS competente con il Ticket #${ticket}. Il nostro team proseguirà la revisione.`,
    greeting: 'Ciao. Per quale mezzo o sistema hai bisogno di aiuto? Puoi indicare marca, modello, motore, anno e il problema riscontrato.',
    noEvidence: "Non ho trovato un'equivalenza confermata nel database ELIMFILTERS. Non assegnerò un codice senza prove.",
    supportEmailRequest: 'Il nostro team tecnico esaminerà personalmente il tuo caso. Potresti condividere la tua email per poterti contattare?',
    noVerifiedMatchReference: 'Non ho trovato una corrispondenza verificata per quel riferimento nel catalogo ELIMFILTERS.',
    noVerifiedMatch: 'Non ho trovato una corrispondenza verificata nel catalogo ELIMFILTERS per quel riferimento.',
    distributionConfirmed: 'Grazie per le informazioni. Per avviare il processo di prequalifica commerciale B2B, compila il modulo su https://elimfilters.com/distributor-application. Il nostro team commerciale valuterà la tua richiesta in base a paese, esperienza e volume stimato, e ti contatterà.',
    distributionAsk: "Per valutare un'opportunità di distribuzione ho bisogno del paese o territorio, del tipo di clienti che servi e della tua esperienza in filtrazione, flotte o mezzi pesanti.",
    commercialAsk: "Per preparare un preventivo ho bisogno del codice o dell'applicazione esatta, della quantità richiesta e del paese o città di consegna.",
    supportAsk: 'Descrivi il mezzo, il problema e qualsiasi codice o riferimento disponibile. Con questi dati posso avviare la revisione tecnica.',
    generalAsk: "Indicami cosa devi verificare: un'applicazione, un'equivalenza, una specifica, una diagnosi tecnica o informazioni commerciali.",
    supportEmailAlreadyRegistered: 'La tua richiesta e la tua email sono già registrate. Il nostro team tecnico ti contatterà a breve.',
    supportEmailThanks: 'Grazie. Abbiamo registrato la tua email e la tua richiesta -- il nostro team tecnico la esaminerà e ti contatterà a breve.',
    supportEmailInvalid: "Non sono riuscito a identificare un'email valida. Potresti confermarla di nuovo? Ad esempio: nome@dominio.com",
    crossRefLine: (ref, sku, filterType) => `Il codice OEM ${ref} corrisponde all'ELIMFILTERS ${sku}${filterType ? ` ${filterType}` : ''}.`,
    crossRefTechLine: (tech, purpose) => ` Incorpora la tecnologia ELIMFILTERS ${tech} per aiutare a ${purpose}.`
  },
  nl: {
    confirmed: 'Referentie bevestigd in de ELIMFILTERS-database:',
    recommendationIntro: 'Dit raden wij aan:',
    recommendationIntroFor: vehicle => `Voor uw ${vehicle} raden wij het volgende aan:`,
    recommendationClosing: 'Kies voor ELIMFILTERS: echte bescherming voor uw apparatuur, met gevalideerde technologie en traceerbaarheid bij elke referentie. Gaan we verder met de aankoop, of heeft u nog een andere vraag?',
    description: 'Beschrijving',
    technology: 'ELIMFILTERS-technologie',
    technicalComment: 'Technische opmerking',
    authorizedDistributor: 'Om ELIMFILTERS-producten aan te schaffen, neemt u contact op met de erkende distributeur in uw land. In welk land bevindt u zich?',
    noDistributor: 'Begrepen. Om u correct door te verwijzen: bent u geïnteresseerd in het distribueren van ELIMFILTERS in uw land, of heeft u producten nodig voor een bedrijf, wagenpark, mijn, fabriek, werkplaats of andere activiteit? Geef ook het land en het type activiteit aan.',
    escalated: ticket => `Ik kon geen antwoord bevestigen met voldoende bewijs. Uw aanvraag is doorgestuurd naar de betreffende ELIMFILTERS-afdeling onder Ticket #${ticket}. Ons team zal de beoordeling voortzetten.`,
    greeting: 'Hallo. Bij welke apparatuur of welk systeem heeft u hulp nodig? U kunt merk, model, motor, bouwjaar en het probleem aangeven.',
    noEvidence: 'Ik heb geen bevestigde equivalentie gevonden in de ELIMFILTERS-database. Ik ken geen referentie toe zonder bewijs.',
    supportEmailRequest: 'Ons technisch team zal uw zaak persoonlijk beoordelen. Kunt u uw e-mailadres delen zodat wij contact met u kunnen opnemen?',
    noVerifiedMatchReference: 'Ik heb geen geverifieerde overeenkomst gevonden voor die referentie in de ELIMFILTERS-catalogus.',
    noVerifiedMatch: 'Ik heb geen geverifieerde overeenkomst gevonden in de ELIMFILTERS-catalogus voor die referentie.',
    distributionConfirmed: 'Dank u voor de informatie. Om het B2B-kwalificatieproces te starten, vult u het formulier in op https://elimfilters.com/distributor-application. Ons commerciële team beoordeelt uw aanvraag op basis van land, ervaring en geschat volume, en neemt contact met u op.',
    distributionAsk: 'Om een distributiekans te beoordelen heb ik uw land of gebied nodig, het type klanten dat u bedient en uw ervaring in filtratie, wagenparken of zware apparatuur.',
    commercialAsk: 'Om een offerte voor te bereiden heb ik de exacte code of toepassing, de benodigde hoeveelheid en het land of de stad van levering nodig.',
    supportAsk: 'Beschrijf de apparatuur, het probleem en eventuele beschikbare code of referentie. Met die gegevens kan ik de technische beoordeling starten.',
    generalAsk: 'Laat weten wat u wilt controleren: een toepassing, een equivalentie, een specificatie, een technische diagnose of commerciële informatie.',
    supportEmailAlreadyRegistered: 'Uw vraag en e-mailadres zijn al geregistreerd. Ons technisch team neemt spoedig contact met u op.',
    supportEmailThanks: 'Dank u. We hebben uw e-mailadres en vraag geregistreerd -- ons technisch team zal deze beoordelen en spoedig contact met u opnemen.',
    supportEmailInvalid: 'Ik kon geen geldig e-mailadres identificeren. Kunt u het opnieuw bevestigen? Bijvoorbeeld: naam@domein.com',
    crossRefLine: (ref, sku, filterType) => `Het OEM-onderdeelnummer ${ref} komt overeen met de ELIMFILTERS ${sku}${filterType ? ` ${filterType}` : ''}.`,
    crossRefTechLine: (tech, purpose) => ` Deze bevat ELIMFILTERS ${tech}-technologie om te helpen bij ${purpose}.`
  },
  ru: {
    confirmed: 'Артикул подтверждён в базе данных ELIMFILTERS:',
    recommendationIntro: 'Вот что мы рекомендуем:',
    recommendationIntroFor: vehicle => `Для вашего ${vehicle} мы рекомендуем следующее:`,
    recommendationClosing: 'Выбирайте ELIMFILTERS: реальная защита вашей техники, проверенная технология и прослеживаемость каждого артикула. Продолжим оформление покупки, или у вас есть другой вопрос?',
    description: 'Описание',
    technology: 'Технология ELIMFILTERS',
    technicalComment: 'Техническое примечание',
    authorizedDistributor: 'Чтобы приобрести продукцию ELIMFILTERS, обратитесь к официальному дистрибьютору в вашей стране. В какой стране вы находитесь?',
    noDistributor: 'Понятно. Чтобы направить вас правильно: вас интересует дистрибуция ELIMFILTERS в вашей стране, или вам нужна продукция для компании, автопарка, шахты, завода, мастерской или другой деятельности? Пожалуйста, укажите также страну и тип деятельности.',
    escalated: ticket => `Не удалось подтвердить ответ с достаточными доказательствами. Ваш запрос передан в соответствующий отдел ELIMFILTERS под номером тикета #${ticket}. Наша команда продолжит рассмотрение.`,
    greeting: 'Здравствуйте. С каким оборудованием или системой вам нужна помощь? Укажите марку, модель, двигатель, год выпуска и наблюдаемую проблему.',
    noEvidence: 'Я не нашёл подтверждённого соответствия в базе данных ELIMFILTERS. Я не буду присваивать артикул без доказательств.',
    supportEmailRequest: 'Наша техническая команда лично рассмотрит ваш случай. Не могли бы вы указать ваш адрес электронной почты, чтобы мы могли с вами связаться?',
    noVerifiedMatchReference: 'Я не нашёл проверенного соответствия для этого артикула в каталоге ELIMFILTERS.',
    noVerifiedMatch: 'Я не нашёл проверенного соответствия в каталоге ELIMFILTERS для этого артикула.',
    distributionConfirmed: 'Спасибо за информацию. Чтобы начать процесс коммерческой предквалификации B2B, заполните форму на https://elimfilters.com/distributor-application. Наша коммерческая команда оценит вашу заявку с учётом страны, опыта и предполагаемого объёма и свяжется с вами.',
    distributionAsk: 'Для оценки возможности дистрибуции мне нужны страна или территория, тип клиентов, которых вы обслуживаете, и ваш опыт в области фильтрации, автопарков или тяжёлой техники.',
    commercialAsk: 'Для подготовки коммерческого предложения мне нужен точный код или применение, требуемое количество и страна или город доставки.',
    supportAsk: 'Опишите оборудование, проблему и любой доступный код или артикул. С этими данными я могу начать техническую проверку.',
    generalAsk: 'Укажите, что вам нужно проверить: применение, аналог, спецификацию, техническую диагностику или коммерческую информацию.',
    supportEmailAlreadyRegistered: 'Ваш запрос и адрес электронной почты уже зарегистрированы. Наша техническая команда свяжется с вами в ближайшее время.',
    supportEmailThanks: 'Спасибо. Мы зарегистрировали ваш адрес электронной почты и запрос -- наша техническая команда рассмотрит его и свяжется с вами в ближайшее время.',
    supportEmailInvalid: 'Не удалось определить действительный адрес электронной почты. Не могли бы вы подтвердить его ещё раз? Например: имя@домен.com',
    crossRefLine: (ref, sku, filterType) => `Номер OEM ${ref} соответствует артикулу ELIMFILTERS ${sku}${filterType ? ` ${filterType}` : ''}.`,
    crossRefTechLine: (tech, purpose) => ` Используется технология ELIMFILTERS ${tech} для ${purpose}.`
  },
  zh: {
    confirmed: 'ELIMFILTERS 数据库中已确认的产品编号：',
    recommendationIntro: '以下是我们的推荐：',
    recommendationIntroFor: vehicle => `针对您的${vehicle}，以下是我们的推荐：`,
    recommendationClosing: '选择 ELIMFILTERS：为您的设备提供真正的保护，采用经过验证的技术，每个产品编号均可追溯。是否继续购买，或者您还有其他问题？',
    description: '描述',
    technology: 'ELIMFILTERS 技术',
    technicalComment: '技术说明',
    authorizedDistributor: '如需购买 ELIMFILTERS 产品，请联系您所在国家/地区的授权经销商。请问您在哪个国家？',
    noDistributor: '明白了。为了给您正确的指引：您是有意在您的国家经销 ELIMFILTERS，还是需要为公司、车队、矿山、工厂、维修车间或其他业务采购产品？请同时告知国家和业务类型。',
    escalated: ticket => `我未能凭现有信息确认答案。您的请求已转交 ELIMFILTERS 相关部门处理，工单编号 #${ticket}。我们的团队将继续跟进审核。`,
    greeting: '您好。请问您需要为哪种设备或系统提供帮助？可以告诉我品牌、型号、发动机、年份以及出现的问题。',
    noEvidence: '我未能在 ELIMFILTERS 数据库中找到确认的对应产品。没有确凿依据，我不会指定产品编号。',
    supportEmailRequest: '我们的技术团队会亲自审核您的情况。可以提供您的电子邮箱以便我们与您联系吗？',
    noVerifiedMatchReference: '我未能在 ELIMFILTERS 产品目录中找到该编号的已验证对应产品。',
    noVerifiedMatch: '我未能在 ELIMFILTERS 产品目录中找到该编号的已验证对应产品。',
    distributionConfirmed: '感谢您提供的信息。要开始 B2B 商务预审流程，请在 https://elimfilters.com/distributor-application 填写申请表。我们的商务团队将根据国家、经验和预计采购量评估您的申请，并与您联系。',
    distributionAsk: '为了评估经销机会，我需要了解您所在的国家或地区、您服务的客户类型，以及您在过滤产品、车队或重型设备方面的经验。',
    commercialAsk: '为了准备报价，我需要确切的产品编号或应用信息、所需数量以及交货国家或城市。',
    supportAsk: '请描述设备情况、出现的问题以及任何可用的编号或参考信息。有了这些信息，我可以开始技术审核。',
    generalAsk: '请告诉我您需要核实的内容：应用查询、替代型号、规格参数、技术诊断，或商务信息。',
    supportEmailAlreadyRegistered: '您的咨询和邮箱已登记。我们的技术团队会尽快与您联系。',
    supportEmailThanks: '谢谢。我们已登记您的邮箱和咨询内容——我们的技术团队会尽快审核并与您联系。',
    supportEmailInvalid: '我未能识别有效的电子邮箱地址。可以请您再次确认吗？例如：name@domain.com',
    crossRefLine: (ref, sku, filterType) => `OEM 编号 ${ref} 对应 ELIMFILTERS ${sku}${filterType ? ` ${filterType}` : ''}。`,
    crossRefTechLine: (tech, purpose) => `采用 ELIMFILTERS ${tech} 技术，有助于${purpose}。`
  },
  ja: {
    confirmed: 'ELIMFILTERSデータベースで確認された品番：',
    recommendationIntro: 'こちらがおすすめの製品です：',
    recommendationIntroFor: vehicle => `お使いの${vehicle}には、こちらをおすすめします：`,
    recommendationClosing: 'ELIMFILTERSをお選びください。検証済みの技術と、すべての品番にわたるトレーサビリティにより、機器を確実に保護します。このままご購入手続きに進みますか、それとも他にご質問はありますか？',
    description: '説明',
    technology: 'ELIMFILTERS技術',
    technicalComment: '技術コメント',
    authorizedDistributor: 'ELIMFILTERS製品をご購入いただくには、お住まいの国の正規代理店にお問い合わせください。どちらの国にお住まいですか？',
    noDistributor: '承知しました。適切にご案内するため、お伺いします。お住まいの国でELIMFILTERSの代理店になることにご興味がありますか、それとも企業、車両、鉱山、工場、整備工場などの業務用に製品が必要ですか？国と業務の種類もお知らせください。',
    escalated: ticket => `十分な根拠をもって回答を確認できませんでした。お問い合わせはELIMFILTERSの担当部署へチケット番号#${ticket}として転送されました。担当チームが引き続き確認いたします。`,
    greeting: 'こんにちは。どの機器やシステムについてお手伝いが必要ですか？メーカー、モデル、エンジン、年式、発生している問題を教えてください。',
    noEvidence: 'ELIMFILTERSデータベースで確認された適合品が見つかりませんでした。根拠がない状態で品番をご案内することはいたしません。',
    supportEmailRequest: '技術チームが個別にお客様のケースを確認いたします。ご連絡のためにメールアドレスを教えていただけますか？',
    noVerifiedMatchReference: 'その参照番号について、ELIMFILTERSカタログで確認された適合品が見つかりませんでした。',
    noVerifiedMatch: 'その参照番号について、ELIMFILTERSカタログで確認された適合品が見つかりませんでした。',
    distributionConfirmed: '情報をありがとうございます。B2B事前審査プロセスを開始するには、https://elimfilters.com/distributor-application のフォームにご記入ください。営業チームが国、経験、想定される取引量に基づいてお申し込みを審査し、ご連絡いたします。',
    distributionAsk: '代理店の機会を評価するために、国または地域、対応される顧客の種類、フィルトレーション・車両・重機に関するご経験を教えてください。',
    commercialAsk: 'お見積りを作成するために、正確な品番または用途、必要数量、納品先の国または都市を教えてください。',
    supportAsk: '機器の状況、問題、利用可能な品番や参照番号を教えてください。その情報をもとに技術的な確認を開始できます。',
    generalAsk: '確認したい内容をお知らせください：用途の確認、互換品、仕様、技術的な診断、または営業情報のいずれですか。',
    supportEmailAlreadyRegistered: 'お問い合わせとメールアドレスはすでに登録されています。技術チームが近日中にご連絡いたします。',
    supportEmailThanks: 'ありがとうございます。メールアドレスとお問い合わせ内容を登録いたしました。技術チームが確認のうえ、近日中にご連絡いたします。',
    supportEmailInvalid: '有効なメールアドレスを確認できませんでした。もう一度ご入力いただけますか？例：name@domain.com',
    crossRefLine: (ref, sku, filterType) => `OEM品番${ref}は、ELIMFILTERS ${sku}${filterType ? ` ${filterType}` : ''}に対応しています。`,
    crossRefTechLine: (tech, purpose) => `ELIMFILTERS ${tech}技術を採用しており、${purpose}のに役立ちます。`
  },
  ar: {
    confirmed: 'تم تأكيد الرقم المرجعي في قاعدة بيانات ELIMFILTERS:',
    recommendationIntro: 'إليك ما نوصي به:',
    recommendationIntroFor: vehicle => `بالنسبة لـ ${vehicle}، إليك ما نوصي به:`,
    recommendationClosing: 'اختر ELIMFILTERS: حماية حقيقية لمعداتك، بتقنية معتمدة وإمكانية تتبع لكل رقم مرجعي. هل نتابع عملية الشراء أم لديك استفسار آخر؟',
    description: 'الوصف',
    technology: 'تقنية ELIMFILTERS',
    technicalComment: 'ملاحظة فنية',
    authorizedDistributor: 'لشراء منتجات ELIMFILTERS، يرجى التواصل مع الموزع المعتمد في بلدك. في أي بلد تتواجد؟',
    noDistributor: 'مفهوم. لتوجيهك بشكل صحيح: هل أنت مهتم بتوزيع ELIMFILTERS في بلدك، أم تحتاج منتجات لشركة أو أسطول أو منجم أو مصنع أو ورشة أو نشاط آخر؟ يرجى تحديد البلد ونوع النشاط أيضًا.',
    escalated: ticket => `لم أتمكن من تأكيد إجابة بأدلة كافية. تم تحويل طلبك إلى القسم المختص في ELIMFILTERS تحت التذكرة رقم ${ticket}. سيواصل فريقنا المراجعة.`,
    greeting: 'مرحبًا. ما المعدة أو النظام الذي تحتاج مساعدة بشأنه؟ يمكنك ذكر العلامة التجارية والموديل والمحرك وسنة الصنع والمشكلة التي تلاحظها.',
    noEvidence: 'لم أجد مطابقة مؤكدة في قاعدة بيانات ELIMFILTERS. لن أحدد رقمًا مرجعيًا دون أدلة.',
    supportEmailRequest: 'سيقوم فريقنا الفني بمراجعة حالتك شخصيًا. هل يمكنك مشاركة بريدك الإلكتروني حتى نتمكن من التواصل معك؟',
    noVerifiedMatchReference: 'لم أجد مطابقة موثقة لهذا الرقم المرجعي في كتالوج ELIMFILTERS.',
    noVerifiedMatch: 'لم أجد مطابقة موثقة في كتالوج ELIMFILTERS لهذا الرقم المرجعي.',
    distributionConfirmed: 'شكرًا على المعلومات. لبدء عملية التأهيل التجاري B2B، يرجى تعبئة النموذج على https://elimfilters.com/distributor-application. سيقوم فريقنا التجاري بتقييم طلبك بناءً على البلد والخبرة والحجم المتوقع، وسيتواصل معك.',
    distributionAsk: 'لتقييم فرصة التوزيع أحتاج إلى معرفة بلدك أو منطقتك، ونوع العملاء الذين تخدمهم، وخبرتك في مجال الفلترة أو الأساطيل أو المعدات الثقيلة.',
    commercialAsk: 'لإعداد عرض سعر أحتاج إلى الرمز الدقيق أو التطبيق، والكمية المطلوبة، والبلد أو المدينة المقصودة للتسليم.',
    supportAsk: 'صف المعدة والمشكلة وأي رمز أو رقم مرجعي متاح. بهذه المعلومات يمكنني بدء المراجعة الفنية.',
    generalAsk: 'أخبرني بما تحتاج مراجعته: تطبيق معين، رقم بديل، مواصفة، تشخيص فني، أو معلومات تجارية.',
    supportEmailAlreadyRegistered: 'تم تسجيل استفسارك وبريدك الإلكتروني بالفعل. سيتواصل معك فريقنا الفني قريبًا.',
    supportEmailThanks: 'شكرًا. سجّلنا بريدك الإلكتروني واستفسارك -- سيقوم فريقنا الفني بمراجعته والتواصل معك قريبًا.',
    supportEmailInvalid: 'لم أتمكن من التعرف على بريد إلكتروني صالح. هل يمكنك تأكيده مرة أخرى؟ على سبيل المثال: name@domain.com',
    crossRefLine: (ref, sku, filterType) => `الرقم المرجعي الأصلي ${ref} يقابل منتج ELIMFILTERS ${sku}${filterType ? ` ${filterType}` : ''}.`,
    crossRefTechLine: (tech, purpose) => ` يحتوي على تقنية ELIMFILTERS ${tech} للمساعدة في ${purpose}.`
  },
  fa: {
    confirmed: 'مرجع در پایگاه داده ELIMFILTERS تأیید شد:',
    recommendationIntro: 'این چیزی است که پیشنهاد می‌کنیم:',
    recommendationIntroFor: vehicle => `برای ${vehicle} شما، این پیشنهاد ماست:`,
    recommendationClosing: 'ELIMFILTERS را انتخاب کنید: محافظت واقعی از تجهیزات شما، با فناوری تأییدشده و قابلیت ردیابی برای هر مرجع. آیا ادامه خرید را انجام دهیم یا سؤال دیگری دارید؟',
    description: 'توضیحات',
    technology: 'فناوری ELIMFILTERS',
    technicalComment: 'نظر فنی',
    authorizedDistributor: 'برای خرید محصولات ELIMFILTERS، لطفاً با نماینده رسمی کشور خود تماس بگیرید. در کدام کشور هستید؟',
    noDistributor: 'متوجه شدم. برای راهنمایی درست: آیا مایل به توزیع ELIMFILTERS در کشور خود هستید، یا به محصولاتی برای شرکت، ناوگان، معدن، کارخانه، تعمیرگاه یا فعالیت دیگری نیاز دارید؟ لطفاً کشور و نوع فعالیت را نیز مشخص کنید.',
    escalated: ticket => `نتوانستم پاسخی با شواهد کافی تأیید کنم. درخواست شما تحت شماره تیکت #${ticket} به بخش مربوطه ELIMFILTERS ارجاع داده شد. تیم ما بررسی را ادامه خواهد داد.`,
    greeting: 'سلام. برای کدام تجهیز یا سیستم به کمک نیاز دارید؟ می‌توانید برند، مدل، موتور، سال ساخت و مشکلی که مشاهده می‌کنید را ذکر کنید.',
    noEvidence: 'معادل تأییدشده‌ای در پایگاه داده ELIMFILTERS پیدا نکردم. بدون شواهد کافی، کد کالایی اختصاص نخواهم داد.',
    supportEmailRequest: 'تیم فنی ما به‌صورت شخصی به بررسی مورد شما خواهد پرداخت. آیا می‌توانید ایمیل خود را در اختیار ما بگذارید تا با شما تماس بگیریم؟',
    noVerifiedMatchReference: 'برای آن مرجع، تطابق تأییدشده‌ای در کاتالوگ ELIMFILTERS پیدا نکردم.',
    noVerifiedMatch: 'برای آن مرجع، تطابق تأییدشده‌ای در کاتالوگ ELIMFILTERS پیدا نکردم.',
    distributionConfirmed: 'از اطلاعات شما سپاسگزاریم. برای شروع فرآیند پیش‌ارزیابی تجاری B2B، لطفاً فرم موجود در https://elimfilters.com/distributor-application را تکمیل کنید. تیم تجاری ما درخواست شما را بر اساس کشور، تجربه و حجم تخمینی بررسی کرده و با شما تماس خواهد گرفت.',
    distributionAsk: 'برای ارزیابی یک فرصت توزیع، به کشور یا منطقه، نوع مشتریانی که خدمت می‌دهید، و تجربه شما در زمینه فیلتراسیون، ناوگان یا تجهیزات سنگین نیاز دارم.',
    commercialAsk: 'برای تهیه پیش‌فاکتور، به کد دقیق یا کاربرد، مقدار موردنیاز و کشور یا شهر تحویل نیاز دارم.',
    supportAsk: 'تجهیز، مشکل و هر کد یا مرجع در دسترس را شرح دهید. با این اطلاعات می‌توانم بررسی فنی را آغاز کنم.',
    generalAsk: 'بگویید چه چیزی نیاز به بررسی دارد: یک کاربرد، یک معادل، یک مشخصه فنی، یک تشخیص فنی یا اطلاعات تجاری.',
    supportEmailAlreadyRegistered: 'درخواست و ایمیل شما قبلاً ثبت شده است. تیم فنی ما به‌زودی با شما تماس خواهد گرفت.',
    supportEmailThanks: 'سپاسگزاریم. ایمیل و درخواست شما ثبت شد -- تیم فنی ما آن را بررسی کرده و به‌زودی با شما تماس خواهد گرفت.',
    supportEmailInvalid: 'نتوانستم یک ایمیل معتبر شناسایی کنم. آیا می‌توانید دوباره آن را تأیید کنید؟ برای مثال: name@domain.com',
    crossRefLine: (ref, sku, filterType) => `کد OEM ${ref} با محصول ELIMFILTERS ${sku}${filterType ? ` ${filterType}` : ''} مطابقت دارد.`,
    crossRefTechLine: (tech, purpose) => ` این محصول از فناوری ELIMFILTERS ${tech} برای کمک به ${purpose} استفاده می‌کند.`
  }
};

// Catalog data (`filter_type`) is stored in English regardless of the
// customer's language -- interpolating it verbatim into an otherwise-Spanish
// or Portuguese answer is what produced mixed-language, unconvincing replies
// (e.g. "SKU123 — Fuel Filter" inside a Spanish sentence). Unknown values
// fall back to the original text rather than disappearing, since an
// untranslated label is still better than a silently dropped one.
//
// The live catalog stores this as a short category tag, not a descriptive
// phrase -- confirmed directly against production (`SELECT DISTINCT
// filter_type FROM elimfilters_catalog`) returns 'air' (4998 rows),
// 'hydraulic' (2367), 'fuel' (2131), 'oil' (1855), 'cabin' (652), 'water'
// (102), 'other' (76), plus one legacy 'Fuel Filter' outlier. Both forms are
// kept here so a future data-format change doesn't silently reopen this bug.
const FILTER_TYPE_TRANSLATIONS = {
  es: {
    'oil': 'Filtro de aceite',
    'oil filter': 'Filtro de aceite',
    'lube filter': 'Filtro de aceite',
    'fuel': 'Filtro de combustible',
    'fuel filter': 'Filtro de combustible',
    'water': 'Separador de agua y combustible',
    'fuel water separator': 'Separador de agua y combustible',
    'water separator': 'Separador de agua',
    'air': 'Filtro de aire',
    'air filter': 'Filtro de aire',
    'cabin': 'Filtro de cabina',
    'cabin air filter': 'Filtro de cabina',
    'coolant': 'Filtro de refrigerante',
    'coolant filter': 'Filtro de refrigerante',
    'hydraulic': 'Filtro hidráulico',
    'hydraulic filter': 'Filtro hidráulico',
    'housing': 'Carcasa (housing)',
    'other': 'Filtro'
  },
  fr: {
    'oil': 'Filtre à huile', 'oil filter': 'Filtre à huile', 'lube filter': 'Filtre à huile',
    'fuel': 'Filtre à carburant', 'fuel filter': 'Filtre à carburant',
    'water': 'Séparateur eau-carburant', 'fuel water separator': 'Séparateur eau-carburant', 'water separator': "Séparateur d'eau",
    'air': 'Filtre à air', 'air filter': 'Filtre à air',
    'cabin': "Filtre d'habitacle", 'cabin air filter': "Filtre d'habitacle",
    'coolant': 'Filtre à liquide de refroidissement', 'coolant filter': 'Filtre à liquide de refroidissement',
    'hydraulic': 'Filtre hydraulique', 'hydraulic filter': 'Filtre hydraulique',
    'housing': 'Boîtier', 'other': 'Filtre'
  },
  it: {
    'oil': "Filtro dell'olio", 'oil filter': "Filtro dell'olio", 'lube filter': "Filtro dell'olio",
    'fuel': 'Filtro del carburante', 'fuel filter': 'Filtro del carburante',
    'water': 'Separatore acqua-carburante', 'fuel water separator': 'Separatore acqua-carburante', 'water separator': "Separatore d'acqua",
    'air': "Filtro dell'aria", 'air filter': "Filtro dell'aria",
    'cabin': 'Filtro abitacolo', 'cabin air filter': 'Filtro abitacolo',
    'coolant': 'Filtro del liquido di raffreddamento', 'coolant filter': 'Filtro del liquido di raffreddamento',
    'hydraulic': 'Filtro idraulico', 'hydraulic filter': 'Filtro idraulico',
    'housing': 'Alloggiamento (housing)', 'other': 'Filtro'
  },
  nl: {
    'oil': 'Oliefilter', 'oil filter': 'Oliefilter', 'lube filter': 'Oliefilter',
    'fuel': 'Brandstoffilter', 'fuel filter': 'Brandstoffilter',
    'water': 'Water-brandstofafscheider', 'fuel water separator': 'Water-brandstofafscheider', 'water separator': 'Waterafscheider',
    'air': 'Luchtfilter', 'air filter': 'Luchtfilter',
    'cabin': 'Cabinefilter', 'cabin air filter': 'Cabinefilter',
    'coolant': 'Koelvloeistoffilter', 'coolant filter': 'Koelvloeistoffilter',
    'hydraulic': 'Hydraulische filter', 'hydraulic filter': 'Hydraulische filter',
    'housing': 'Behuizing (housing)', 'other': 'Filter'
  },
  ru: {
    'oil': 'Масляный фильтр', 'oil filter': 'Масляный фильтр', 'lube filter': 'Масляный фильтр',
    'fuel': 'Топливный фильтр', 'fuel filter': 'Топливный фильтр',
    'water': 'Топливно-водяной сепаратор', 'fuel water separator': 'Топливно-водяной сепаратор', 'water separator': 'Водяной сепаратор',
    'air': 'Воздушный фильтр', 'air filter': 'Воздушный фильтр',
    'cabin': 'Салонный фильтр', 'cabin air filter': 'Салонный фильтр',
    'coolant': 'Фильтр охлаждающей жидкости', 'coolant filter': 'Фильтр охлаждающей жидкости',
    'hydraulic': 'Гидравлический фильтр', 'hydraulic filter': 'Гидравлический фильтр',
    'housing': 'Корпус (housing)', 'other': 'Фильтр'
  },
  zh: {
    'oil': '机油滤清器', 'oil filter': '机油滤清器', 'lube filter': '机油滤清器',
    'fuel': '燃油滤清器', 'fuel filter': '燃油滤清器',
    'water': '油水分离器', 'fuel water separator': '油水分离器', 'water separator': '水分离器',
    'air': '空气滤清器', 'air filter': '空气滤清器',
    'cabin': '空调滤芯', 'cabin air filter': '空调滤芯',
    'coolant': '冷却液滤清器', 'coolant filter': '冷却液滤清器',
    'hydraulic': '液压滤清器', 'hydraulic filter': '液压滤清器',
    'housing': '滤芯座（housing）', 'other': '滤清器'
  },
  ja: {
    'oil': 'オイルフィルター', 'oil filter': 'オイルフィルター', 'lube filter': 'オイルフィルター',
    'fuel': '燃料フィルター', 'fuel filter': '燃料フィルター',
    'water': 'フューエルウォーターセパレーター', 'fuel water separator': 'フューエルウォーターセパレーター', 'water separator': 'ウォーターセパレーター',
    'air': 'エアフィルター', 'air filter': 'エアフィルター',
    'cabin': 'キャビンエアフィルター', 'cabin air filter': 'キャビンエアフィルター',
    'coolant': 'クーラントフィルター', 'coolant filter': 'クーラントフィルター',
    'hydraulic': '油圧フィルター', 'hydraulic filter': '油圧フィルター',
    'housing': 'ハウジング', 'other': 'フィルター'
  },
  ar: {
    'oil': 'فلتر الزيت', 'oil filter': 'فلتر الزيت', 'lube filter': 'فلتر الزيت',
    'fuel': 'فلتر الوقود', 'fuel filter': 'فلتر الوقود',
    'water': 'فاصل الماء والوقود', 'fuel water separator': 'فاصل الماء والوقود', 'water separator': 'فاصل الماء',
    'air': 'فلتر الهواء', 'air filter': 'فلتر الهواء',
    'cabin': 'فلتر المقصورة', 'cabin air filter': 'فلتر المقصورة',
    'coolant': 'فلتر سائل التبريد', 'coolant filter': 'فلتر سائل التبريد',
    'hydraulic': 'فلتر هيدروليكي', 'hydraulic filter': 'فلتر هيدروليكي',
    'housing': 'العلبة (housing)', 'other': 'فلتر'
  },
  fa: {
    'oil': 'فیلتر روغن', 'oil filter': 'فیلتر روغن', 'lube filter': 'فیلتر روغن',
    'fuel': 'فیلتر سوخت', 'fuel filter': 'فیلتر سوخت',
    'water': 'جداکننده آب و سوخت', 'fuel water separator': 'جداکننده آب و سوخت', 'water separator': 'جداکننده آب',
    'air': 'فیلتر هوا', 'air filter': 'فیلتر هوا',
    'cabin': 'فیلتر کابین', 'cabin air filter': 'فیلتر کابین',
    'coolant': 'فیلتر مایع خنک‌کننده', 'coolant filter': 'فیلتر مایع خنک‌کننده',
    'hydraulic': 'فیلتر هیدرولیک', 'hydraulic filter': 'فیلتر هیدرولیک',
    'housing': 'محفظه (housing)', 'other': 'فیلتر'
  },
  pt: {
    'oil': 'Filtro de óleo',
    'oil filter': 'Filtro de óleo',
    'lube filter': 'Filtro de óleo',
    'fuel': 'Filtro de combustível',
    'fuel filter': 'Filtro de combustível',
    'water': 'Separador de água e combustível',
    'fuel water separator': 'Separador de água e combustível',
    'water separator': 'Separador de água',
    'air': 'Filtro de ar',
    'air filter': 'Filtro de ar',
    'cabin': 'Filtro de cabine',
    'cabin air filter': 'Filtro de cabine',
    'coolant': 'Filtro de arrefecimento',
    'coolant filter': 'Filtro de arrefecimento',
    'hydraulic': 'Filtro hidráulico',
    'hydraulic filter': 'Filtro hidráulico',
    'housing': 'Carcaça (housing)',
    'other': 'Filtro'
  }
};

function translateFilterType(value, language = 'es') {
  const text = cleanText(value, 60);
  if (!text) return null;
  const table = FILTER_TYPE_TRANSLATIONS[language];
  if (!table) return text;
  return table[text.toLowerCase()] || text;
}

function describeVehicle(equipment = {}, language = 'es') {
  const parts = [equipment.brand, equipment.model, equipment.year].filter(Boolean);
  if (!parts.length) return null;
  return parts.join(' ');
}

function normalizeChannel(value) {
  const channel = String(value || 'api').trim().toLowerCase();
  return Object.prototype.hasOwnProperty.call(CHANNEL_LIMITS, channel) ? channel : 'api';
}

function compactWhitespace(value) {
  return String(value || '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function truncateAtBoundary(text, limit) {
  if (text.length <= limit) return text;
  const slice = text.slice(0, Math.max(0, limit - 1));
  const boundary = Math.max(slice.lastIndexOf('\n'), slice.lastIndexOf('. '), slice.lastIndexOf(' '));
  return `${slice.slice(0, boundary > limit * 0.65 ? boundary : slice.length).trim()}…`;
}

function cleanText(value, maxLength = 220) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (!text) return null;
  return text.length > maxLength ? `${text.slice(0, maxLength - 1).trim()}…` : text;
}

// Non-Latin scripts are unambiguous, so they are checked first and settle
// the question outright -- no keyword scoring needed, and nothing here can
// be second-guessed by a geo-based hint.
// Common Persian words that use only base Arabic-script letters (no
// Persian-only letter), for messages the pe/che/zhe/gaf check below misses.
// No \b anchors here: JS's ASCII-only \w/\b never matches inside Arabic-script
// text, so a plain substring alternation is what actually works for this.
const PERSIAN_WORD_PATTERN = /(سلام|نیاز|می‌?باشد|های|برای|هستم|دارم|کنید|لطفا|چطور|چگونه|خیلی|ممنون|متشکرم)/;

function detectByScript(text) {
  if (/[Ѐ-ӿ]/.test(text)) return 'ru'; // Cyrillic
  if (/[぀-ヿ]/.test(text)) return 'ja'; // Hiragana/Katakana -> Japanese
  if (/[一-鿿]/.test(text)) return 'zh'; // CJK ideographs, no kana -> Chinese
  if (/[پچژگ]/.test(text)) return 'fa'; // Persian-only letters (pe/che/zhe/gaf)
  if (/[؀-ۿ]/.test(text)) return PERSIAN_WORD_PATTERN.test(text) ? 'fa' : 'ar'; // Arabic script
  return null;
}

// Common function words and domain vocabulary (filtration/fleet/purchase
// terms) that reliably tell Latin-script languages apart even in a short
// message, plus each language's own diacritics as a secondary signal.
const LATIN_LANGUAGE_PATTERNS = {
  es: /[¿¡ñ]|\b(cu[aá]ntos?|filtro|filtros|aceite|cami[oó]n|motor|necesito|tengo|busco|para|con|usa|utiliza|lleva|ayuda|d[oó]nde|comprar|distribuidor|equivalente|repuesto|país|pais|hola|gracias)\b/gi,
  pt: /[ãõç]|\b(quantos?|filtro|filtros|caminh[aã]o|preciso|tenho|onde|comprar|distribuidor|equivalente|peça|n[ãa]o|país|pais|ol[aá]|obrigado)\b/gi,
  fr: /[àâéèêëîïôùûüÿœ]|\b(combien|filtre|filtres|camion|moteur|besoin|avec|pour|où|acheter|distributeur|équivalent|pièce|bonjour|merci)\b/gi,
  it: /\b(ciao|quanti|filtro|filtri|camion|motore|bisogno|dove|comprare|distributore|equivalente|ricambio|pezzo|grazie|un\s+filtro|di\s+un|ho\s+bisogno)\b/gi,
  nl: /\b(hallo|hoeveel|filter|filters|vrachtwagen|motor|nodig|heb\b|voor|met|waar|kopen|distributeur|equivalent|onderdeel|dank)\b/gi,
  en: /\b(how\s+many|filters?|truck|engine|need|have|where|buy|distributor|equivalent|part|cross[\s-]?reference)\b/gi
};

function scoreLatinLanguages(text) {
  const scores = {};
  for (const [lang, pattern] of Object.entries(LATIN_LANGUAGE_PATTERNS)) {
    scores[lang] = (text.match(pattern) || []).length;
  }
  const [topLang, topScore] = Object.entries(scores).sort(([, a], [, b]) => b - a)[0];
  return topScore > 0 ? topLang : null;
}

// Language policy: the customer's own words -- in the message they are
// sending right now, and failing that in this conversation's own history --
// always decide the reply language. IP-based geolocation (whatever the
// client may have sent as an explicit hint before the customer typed
// anything) is only ever used as a last resort, when nothing the customer
// has actually written gives a signal (e.g. a bare "3" or "sí" reply).
function detectLanguage(requestBody = {}, payload = {}) {
  const current = String(requestBody.message || '');
  const history = Array.isArray(payload?.state?.conversationHistory)
    ? payload.state.conversationHistory.slice(-6).join(' ')
    : '';

  const currentScriptLang = detectByScript(current);
  if (currentScriptLang) return currentScriptLang;

  const currentLatinLang = scoreLatinLanguages(current);
  if (currentLatinLang) return currentLatinLang;

  if (history) {
    const historyScriptLang = detectByScript(history);
    if (historyScriptLang) return historyScriptLang;
    const historyLatinLang = scoreLatinLanguages(`${history} ${current}`);
    if (historyLatinLang) return historyLatinLang;
  }

  const explicitRaw = String(requestBody.language || requestBody.locale || requestBody.context?.language || '').toLowerCase().slice(0, 2);
  if (SUPPORTED_LANGUAGES.includes(explicitRaw)) return explicitRaw;

  return 'en';
}

function normalizeManufacturer(value) {
  return String(value || '').toUpperCase().replace(/[^A-Z0-9]+/g, ' ').trim();
}

function inferEngineManufacturers(engine) {
  const value = normalizeManufacturer(engine);
  if (!value) return [];
  if (/\bMP\d{1,2}\b/.test(value)) return ['MACK', 'VOLVO'];
  if (/\bD1[136]\b/.test(value)) return ['VOLVO', 'MACK'];
  if (/\bDD\d{1,2}\b|SERIES 60/.test(value)) return ['DETROIT'];
  if (/\bISX\d*\b|\bX15\b|\bL9\b|\bB6 7\b/.test(value)) return ['CUMMINS'];
  return [];
}

function allowedOemManufacturers(equipment = {}) {
  const brand = normalizeManufacturer(equipment.brand);
  const allowed = new Set();
  if (brand) allowed.add(brand);
  if (brand === 'MACK') allowed.add('VOLVO');
  if (brand === 'VOLVO') allowed.add('MACK');
  for (const manufacturer of inferEngineManufacturers(equipment.engine)) allowed.add(manufacturer);
  return allowed;
}

function manufacturerAllowed(manufacturer, allowed) {
  if (!allowed.size) return true;
  const normalized = normalizeManufacturer(manufacturer);
  if (!normalized) return false;
  return [...allowed].some(candidate => normalized === candidate || normalized.startsWith(`${candidate} `));
}

function normalizeOemCodes(value, equipment = {}) {
  if (!Array.isArray(value)) return [];
  const allowed = allowedOemManufacturers(equipment);
  const codes = [];
  for (const item of value) {
    if (typeof item === 'string') {
      const text = cleanText(item, 100);
      if (!text) continue;
      const match = text.match(/^([A-Za-z][A-Za-z0-9 &.-]{1,40})\s+([A-Za-z0-9][A-Za-z0-9./-]*)$/);
      if (allowed.size && (!match || !manufacturerAllowed(match[1], allowed))) continue;
      codes.push(text);
      continue;
    }
    if (!item || typeof item !== 'object') continue;
    const code = cleanText(item.code || item.reference || item.part_number || item.partNumber, 80);
    if (!code) continue;
    const manufacturer = cleanText(item.manufacturer || item.brand || item.oem, 60);
    if (!manufacturerAllowed(manufacturer, allowed)) continue;
    codes.push(manufacturer ? `${manufacturer} ${code}` : code);
  }
  return [...new Set(codes)].slice(0, 8);
}

function approvedKnowledgeComment(product) {
  const enrichment = product?.enrichment_data;
  if (!enrichment || typeof enrichment !== 'object') return null;
  const candidate = enrichment.knowledge_center_comment || enrichment.technical_comment || null;
  if (!candidate) return null;
  if (typeof candidate === 'string') return enrichment.approved_for_bot_use === true ? cleanText(candidate, 260) : null;
  if (typeof candidate !== 'object' || candidate.approved_for_bot_use !== true) return null;
  return cleanText(candidate.comment || candidate.text || candidate.statement, 260);
}

function protectOemCode(value, channel) {
  return ['whatsapp', 'instagram', 'facebook'].includes(channel) ? `\`${String(value || '')}\`` : String(value || '');
}

// Canonical fuel-technology scope:
// - TURBOCORE™ exclusively governs approved FH/FG turbine-style fuel/water
//   separation systems and their dedicated replacement-element architecture.
// - HYDROCORE™ governs approved standard non-turbine fuel/water separators.
// - SYNTAPORE™ governs plain diesel-fuel particulate filtration.
// These scopes are intentionally distinct and must not be merged.
function isTurbineHousingSignal(product = {}) {
  const haystack = `${product.filter_type || ''} ${product.sub_type || ''} ${product.name || ''} ${product.sku || ''} ${product.codigo_base || ''} ${product.description || ''}`.toUpperCase();
  const codigoBase = String(product.codigo_base || '').toUpperCase();
  if (/TURBINE|RACOR/.test(haystack)) return true;
  // Approved turbine housings may use FH/FG identifiers such as 900/902/1000/1002.
  if (/(?:^|[^A-Z0-9])(?:500|900|1000|2010|2020|2040)(?:FG|FH)(?:[^A-Z0-9]|$)/.test(haystack)) return true;
  // Dedicated replacement elements for those turbine systems may use the
  // 2010/2020/2040 series with PM/SM/TM variants.
  if (/^(2010|2020|2040)(SM|TM|PM)/.test(codigoBase)) return true;
  return false;
}

function inferTechnology(product = {}) {
  const explicit = cleanText(product.technology || product.specs?.technology || product.enrichment_data?.technology, 100);
  if (explicit) return explicit;
  const isTurbine = isTurbineHousingSignal(product);
  if (isTurbine) return 'TURBOCORE™';
  const type = `${product.filter_type || ''} ${product.sub_type || ''}`.toLowerCase();
  // A non-turbine water separator (production's bare 'water' filter_type
  // category, or explicit "fuel water separator" wording) is HYDROCORE™.
  // SYNTAPORE™ is scoped to plain fuel filtration only, never separators.
  const isFuelWaterSeparator = /\bwater\b|fuel.*water|water.*separator|separador.*agua/.test(type);
  if (isFuelWaterSeparator) return 'HYDROCORE™';
  if (/fuel|diesel|combustible/.test(type)) return 'SYNTAPORE™';
  if (/dryer|secador/.test(type)) return 'DRYCORE™';
  if (/hydraulic|hidr[aá]ul/.test(type)) return 'NANOFORCE™';
  if (/lube|lubric|oil|aceite/.test(type)) return 'SYNTRAX™';
  if (/coolant|refrigerante/.test(type)) return 'THERMACORE™';
  if (/cabin|cabina/.test(type)) return 'MICROKAPPA™';
  if (/air/.test(type) && /housing/.test(type)) return 'INTEKCORE™';
  if (/air|aire|intake|admisi[oó]n/.test(type)) return 'MACROCORE™';
  return null;
}

function extractInputReference(payload = {}, requestBody = {}) {
  const references = payload?.evidence?.references;
  if (Array.isArray(references) && references.length) return cleanText(references[0], 80);
  return cleanText(String(requestBody.message || '').match(/\b(?=[A-Z0-9./-]{4,}\b)(?=[A-Z0-9./-]*[A-Z])(?=[A-Z0-9./-]*\d)[A-Z0-9]+(?:[-/.][A-Z0-9]+)*\b/i)?.[0], 80);
}

async function formatCatalogProduct(product, { language = 'en', channel = 'api', equipment = {} } = {}) {
  const labels = COPY[language] || COPY.en;
  const filterTypeLabel = translateFilterType(product.filter_type, language);
  const header = `• ${product.sku}${product.codigo_base ? ` / ${product.codigo_base}` : ''}${filterTypeLabel ? ` — ${filterTypeLabel}` : ''}`;
  const details = [];
  // product.description/name and any knowledge-center comment are free-text
  // catalog data stored in English regardless of the customer's language
  // (same root cause as filter_type). Localizing them per-request via the
  // LLM -- translate only, never invent a technical claim, see
  // translateTechnicalText above -- is what gives every customer the same
  // descriptive detail in their own language instead of a silently omitted
  // line.
  const rawDescription = cleanText(product.description || product.name, 220);
  const description = await localizeDescription(rawDescription, language);
  const technology = inferTechnology(product);
  const oemCodes = normalizeOemCodes(product.oem_codes, equipment);
  const rawKnowledgeComment = approvedKnowledgeComment(product);
  const knowledgeComment = await localizeDescription(rawKnowledgeComment, language);
  if (description) details.push(`  ${labels.description}: ${description}`);
  if (technology) details.push(`  ${labels.technology}: ${technology}`);
  if (oemCodes.length) details.push(`  OEM: ${oemCodes.map(code => protectOemCode(code, channel)).join(', ')}`);
  if (knowledgeComment) details.push(`  ${labels.technicalComment}: ${knowledgeComment}`);
  return [header, ...details].join('\n');
}

// The specific benefit worth naming depends on which system the filter
// actually protects -- claiming "fuel cleanliness" for an oil or hydraulic
// filter is inaccurate and undercuts trust, which is the opposite of what a
// recommendation is for.
const TECHNOLOGY_PURPOSE_PHRASES = {
  es: {
    fuel: 'a mantener el combustible limpio y proteger el sistema de inyección',
    oil: 'a mantener la lubricación del motor y extender su vida útil',
    coolant: 'a mantener limpio el sistema de enfriamiento',
    hydraulic: 'a proteger los componentes hidráulicos de la contaminación',
    air: 'a evitar el ingreso de partículas y proteger el motor',
    cabin: 'a mantener el aire de la cabina limpio',
    default: 'a la protección del activo'
  },
  en: {
    fuel: 'keep the fuel clean and protect the injection system',
    oil: 'maintain engine lubrication and extend its service life',
    coolant: 'keep the cooling system clean',
    hydraulic: 'protect hydraulic components from contamination',
    air: 'keep particles out and protect the engine',
    cabin: 'keep cabin air clean',
    default: 'asset protection'
  },
  pt: {
    fuel: 'manter o combustível limpo e proteger o sistema de injeção',
    oil: 'manter a lubrificação do motor e prolongar sua vida útil',
    coolant: 'manter limpo o sistema de arrefecimento',
    hydraulic: 'proteger os componentes hidráulicos da contaminação',
    air: 'evitar a entrada de partículas e proteger o motor',
    cabin: 'manter o ar da cabine limpo',
    default: 'a proteção do ativo'
  },
  fr: {
    fuel: "garder le carburant propre et protéger le système d'injection",
    oil: 'maintenir la lubrification du moteur et prolonger sa durée de vie',
    coolant: 'maintenir la propreté du système de refroidissement',
    hydraulic: 'protéger les composants hydrauliques de la contamination',
    air: "empêcher l'entrée de particules et protéger le moteur",
    cabin: "maintenir la propreté de l'air de l'habitacle",
    default: "la protection de l'équipement"
  },
  it: {
    fuel: 'mantenere il carburante pulito e proteggere il sistema di iniezione',
    oil: "mantenere la lubrificazione del motore e prolungarne la vita utile",
    coolant: 'mantenere pulito il sistema di raffreddamento',
    hydraulic: 'proteggere i componenti idraulici dalla contaminazione',
    air: "impedire l'ingresso di particelle e proteggere il motore",
    cabin: "mantenere pulita l'aria dell'abitacolo",
    default: 'alla protezione del mezzo'
  },
  nl: {
    fuel: 'het schoon houden van de brandstof en het beschermen van het injectiesysteem',
    oil: 'het behoud van de motorsmering en het verlengen van de levensduur',
    coolant: 'het schoon houden van het koelsysteem',
    hydraulic: 'het beschermen van hydraulische componenten tegen vervuiling',
    air: 'het tegenhouden van deeltjes en het beschermen van de motor',
    cabin: 'het schoon houden van de cabinelucht',
    default: 'de bescherming van de apparatuur'
  },
  ru: {
    fuel: 'поддержания чистоты топлива и защиты системы впрыска',
    oil: 'поддержания смазки двигателя и продления срока его службы',
    coolant: 'поддержания чистоты системы охлаждения',
    hydraulic: 'защиты гидравлических компонентов от загрязнения',
    air: 'предотвращения попадания частиц и защиты двигателя',
    cabin: 'поддержания чистоты воздуха в кабине',
    default: 'защиты техники'
  },
  zh: {
    fuel: '保持燃油清洁并保护喷油系统',
    oil: '维持发动机润滑并延长使用寿命',
    coolant: '保持冷却系统清洁',
    hydraulic: '保护液压部件免受污染',
    air: '阻挡颗粒物并保护发动机',
    cabin: '保持驾驶室空气清洁',
    default: '保护设备'
  },
  ja: {
    fuel: '燃料を清浄に保ち噴射システムを保護する',
    oil: 'エンジンの潤滑を維持し寿命を延ばす',
    coolant: '冷却システムを清潔に保つ',
    hydraulic: '油圧部品を汚染から保護する',
    air: '粒子の侵入を防ぎエンジンを保護する',
    cabin: 'キャビン内の空気を清潔に保つ',
    default: '機器の保護をする'
  },
  ar: {
    fuel: 'الحفاظ على نظافة الوقود وحماية نظام الحقن',
    oil: 'الحفاظ على تزييت المحرك وإطالة عمره الافتراضي',
    coolant: 'الحفاظ على نظافة نظام التبريد',
    hydraulic: 'حماية المكونات الهيدروليكية من التلوث',
    air: 'منع دخول الجسيمات وحماية المحرك',
    cabin: 'الحفاظ على نظافة هواء المقصورة',
    default: 'حماية المعدات'
  },
  fa: {
    fuel: 'حفظ پاکیزگی سوخت و محافظت از سیستم انژکتور',
    oil: 'حفظ روان‌کاری موتور و افزایش عمر مفید آن',
    coolant: 'حفظ پاکیزگی سیستم خنک‌کننده',
    hydraulic: 'محافظت از قطعات هیدرولیک در برابر آلودگی',
    air: 'جلوگیری از ورود ذرات و محافظت از موتور',
    cabin: 'حفظ پاکیزگی هوای کابین',
    default: 'محافظت از تجهیزات'
  }
};

function technologyPurposePhrase(filterType, language) {
  const type = String(filterType || '').toLowerCase();
  const table = TECHNOLOGY_PURPOSE_PHRASES[language] || TECHNOLOGY_PURPOSE_PHRASES.es;
  if (/cabin/.test(type)) return table.cabin;
  if (/fuel/.test(type)) return table.fuel;
  if (/oil|lube/.test(type)) return table.oil;
  if (/coolant/.test(type)) return table.coolant;
  if (/hydraulic/.test(type)) return table.hydraulic;
  if (/air/.test(type)) return table.air;
  return table.default;
}

async function buildCrossReferenceNarrative(payload, requestBody, language) {
  const products = payload?.evidence?.products;
  if (!Array.isArray(products) || products.length !== 1) return null;
  if (!['cross_reference_lookup', 'exact_reference_lookup'].includes(payload?.intent)) return null;
  const inputReference = extractInputReference(payload, requestBody);
  if (!inputReference) return null;

  const product = products[0];
  const sku = cleanText(product.sku, 80);
  if (!sku) return null;
  const labels = COPY[language] || COPY.en;
  const filterType = translateFilterType(product.filter_type, language) || cleanText(product.name, 120);
  const rawDescription = cleanText(product.description, 260);
  const description = await localizeDescription(rawDescription, language);
  const technology = inferTechnology(product);
  const purpose = technologyPurposePhrase(product.filter_type, language);

  const base = labels.crossRefLine(inputReference, sku, filterType);
  const descLine = description ? ` ${description.replace(/[.]+$/, '')}.` : '';
  const tech = technology ? labels.crossRefTechLine(technology, purpose) : '';
  return `${base}${descLine}${tech}`;
}

async function enrichCatalogAnswer(payload, answer, options, requestBody) {
  const products = payload?.evidence?.products;
  if (!Array.isArray(products) || !products.length) return answer;
  const catalogIntent = ['exact_reference_lookup', 'cross_reference_lookup', 'specification_lookup', 'application_lookup'].includes(payload?.intent);
  if (!catalogIntent) return answer;
  const narrative = await buildCrossReferenceNarrative(payload, requestBody, options.language);
  if (narrative) return narrative;
  const labels = COPY[options.language] || COPY.en;
  const equipment = payload?.state?.equipment || {};
  const vehicle = describeVehicle(equipment, options.language);
  const intro = payload?.intent === 'application_lookup' && vehicle
    ? labels.recommendationIntroFor(vehicle)
    : labels.recommendationIntro;
  const productLines = (await Promise.all(products.map(product => formatCatalogProduct(product, { ...options, equipment })))).join('\n\n');
  return `${intro}\n\n${productLines}\n\n${labels.recommendationClosing}`;
}

function commercialRoutingAnswer(message, language) {
  const text = String(message || '').trim().toLowerCase();
  const labels = COPY[language] || COPY.en;
  const noDistributor = /(no\s+(hay|existe|tenemos?)\s+(un\s+)?distribuidor|sin\s+distribuidor|there\s+is\s+no\s+distributor|no\s+distributor|não\s+(há|tem)\s+distribuidor|nao\s+(ha|tem)\s+distribuidor)/i.test(text);
  if (noDistributor) return labels.noDistributor;
  const acquisition = /(d[oó]nde|donde|where|onde).*(comprar|adquirir|purchase|buy|obter)|\b(comprar|adquirir|purchase|buy)\b.*\b(d[oó]nde|donde|where|onde)\b/i.test(text);
  return acquisition ? labels.authorizedDistributor : null;
}

function shouldEscalate(payload = {}) {
  const attempts = Number(payload?.state?.unresolvedAttempts || 0);
  const pendingField = payload?.pending_field || payload?.state?.pendingField || null;
  const lookupStatus = payload?.evidence?.lookup_status || 'not_required';
  if (pendingField) return false;
  if (['collecting_diagnostic_data', 'collecting_application_data'].includes(payload?.phase)) return false;
  if (lookupStatus !== 'completed') return false;
  if (attempts < MAX_UNRESOLVED_ATTEMPTS) return false;
  if (payload?.evidence?.validated || Number(payload?.evidence?.count || 0) > 0) return false;
  return ['diagnostic', 'application_lookup', 'exact_reference_lookup', 'cross_reference_lookup', 'specification_lookup', 'support_request', 'general'].includes(payload?.intent);
}

function escalateAnswer(payload, requestBody, language) {
  if (!shouldEscalate(payload)) return null;
  const ticket = buildTicket({ payload, requestBody });
  dispatchTicket(ticket).catch(error => console.error('[bot-ticket-dispatch]', error.message));
  return { answer: (COPY[language] || COPY.en).escalated(ticket.ticket_id), ticket };
}

async function formatForChannel(payload = {}, requestBody = {}) {
  const channel = normalizeChannel(requestBody.channel || requestBody.context?.channel);
  const limit = CHANNEL_LIMITS[channel];
  const language = detectLanguage(requestBody, payload);
  let answer = compactWhitespace(payload.answer);
  let escalation = null;

  const escalated = escalateAnswer(payload, requestBody, language);
  if (escalated) {
    answer = escalated.answer;
    escalation = {
      ticket_id: escalated.ticket.ticket_id,
      status: escalated.ticket.status,
      department: escalated.ticket.department,
      priority: escalated.ticket.priority
    };
  } else {
    const routedCommercialAnswer = commercialRoutingAnswer(requestBody.message, language);
    if (routedCommercialAnswer) answer = routedCommercialAnswer;
    else answer = await enrichCatalogAnswer(payload, answer, { language, channel }, requestBody);
  }

  answer = truncateAtBoundary(answer, limit);
  return {
    ...payload,
    answer,
    escalation,
    delivery: {
      channel,
      language,
      character_limit: limit,
      character_count: answer.length,
      truncated: answer.endsWith('…'),
      format: channel === 'api' ? 'structured_json' : 'plain_text'
    }
  };
}

// Looks up a translated copy string by key for the given language, falling
// back to English if the language or key is missing (all 11 languages in
// SUPPORTED_LANGUAGES have full coverage -- this only ever fires for an
// unrecognized code). Use this instead of hardcoding a literal in any one
// language for a customer-facing bot response -- see COPY above.
function copyFor(language, key) {
  return (COPY[language] && COPY[language][key]) ?? COPY.en[key];
}

module.exports = {
  LANGUAGE_NAMES,
  SUPPORTED_LANGUAGES,
  formatForChannel,
  normalizeChannel,
  CHANNEL_LIMITS,
  MAX_UNRESOLVED_ATTEMPTS,
  formatCatalogProduct,
  normalizeOemCodes,
  approvedKnowledgeComment,
  detectLanguage,
  commercialRoutingAnswer,
  allowedOemManufacturers,
  inferEngineManufacturers,
  shouldEscalate,
  inferTechnology,
  buildCrossReferenceNarrative,
  extractInputReference,
  copyFor
};