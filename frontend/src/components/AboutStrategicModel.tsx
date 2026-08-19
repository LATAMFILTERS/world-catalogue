'use client';

import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import '@/i18n';

type Locale = 'en' | 'es' | 'pt' | 'fr' | 'it' | 'nl' | 'ru' | 'zh' | 'ja' | 'ar' | 'fa';

type Copy = {
  title: string;
  intro1: string;
  intro2: string;
  statement1: string;
  statement2: string;
  partnersTitle: string;
  partners1: string;
  partners2: string;
  partners3: string;
  globalTitle: string;
  global1: string;
  global2: string;
  global3: string;
  horizontalTitle: string;
  horizontal1: string;
  horizontal2: string;
  horizontal3: string;
  horizontal4: string;
  efficiencyTitle: string;
  efficiency1: string;
  efficiency2: string;
  efficiency3: string;
  closing1: string;
  closing2: string;
};

const COPY: Record<Locale, Copy> = {
  en: {
    title: 'Strategic Asset Engineering & Protection',
    intro1: 'We do not design isolated components as simple replacement products. We develop protection systems focused on contamination control, equipment reliability, and reducing the risk of premature wear and failure.',
    intro2: 'Every filtration decision begins with the protected asset, its operating duty, contamination exposure, and the evidence required to select the appropriate protection architecture.',
    statement1: 'The filter element is the means.',
    statement2: 'Asset protection is the objective.',
    partnersTitle: 'We grow through partners, not by competing with them',
    partners1: 'Our commercial model is designed to prioritize and strengthen our distributor partners.',
    partners2: 'We understand that real market value is created close to the customer: local technical support, inventory availability, application knowledge, response capability, and long-term commercial relationships.',
    partners3: 'ELIMFILTERS contributes engineering architecture, product intelligence, structured data, technical knowledge, and a commercial platform designed to improve our partners’ competitive capacity. Our objective is not to displace the distributor, but to increase its ability to create value, protect its economic participation, and strengthen its market position.',
    globalTitle: 'Global infrastructure, industrial precision',
    global1: 'The development and formulation of ELIMFILTERS filtration media is carried out in Germany under defined criteria for efficiency, capacity, resistance, stability, and behavior within the intended application.',
    global2: 'Manufacturing is executed through qualified production partners in the People’s Republic of China (PRC), selected for industrial specialization, manufacturing capability, scalability, and experience within automotive and heavy-duty supply chains.',
    global3: 'Materials, manufacturing processes, dimensional control, and physical validation are governed by ELIMFILTERS-defined specifications. AI-assisted systems complement this process by analyzing production and product data to identify inconsistencies, deviations, and anomalous patterns. Physical validation remains based on defined laboratory and production protocols, with accountable human oversight.',
    horizontalTitle: 'Horizontal structure, not quality cuts',
    horizontal1: 'Traditional multi-layer corporate structures often accumulate administrative layers, repetitive processes, and operating costs that ultimately become part of the product price.',
    horizontal2: 'ELIMFILTERS operates with a more horizontal structure. Trained AI agents support repetitive data, documentation, catalog analysis, and information-control processes, reducing operational burden without replacing human technical responsibility.',
    horizontal3: 'These processes are periodically reviewed by professionals in industrial, mechanical, process, and systems engineering.',
    horizontal4: 'Economic efficiency does not come from reducing the quality of materials, engineering, manufacturing, or validation. It comes from operating with less administrative friction, greater automation of repetitive tasks, and an organizational structure designed to convert operating efficiency into commercial value.',
    efficiencyTitle: 'Efficiency becomes an advantage for our partners',
    efficiency1: 'The result is a different cost structure.',
    efficiency2: 'Not a low-price strategy.',
    efficiency3: 'ELIMFILTERS seeks to transfer that efficiency to its commercial partners through a proposition that combines engineering, controlled manufacturing, product intelligence, technical support, and an economic structure that helps them compete with greater capacity in their markets.',
    closing1: 'ELIMFILTERS builds the platform.',
    closing2: 'Our partners build the market.',
  },
  es: {
    title: 'Ingeniería y Protección Estratégica del Activo',
    intro1: 'No diseñamos componentes aislados como simples productos de reemplazo. Desarrollamos sistemas de protección orientados al control de contaminación, la confiabilidad del equipo y la reducción del riesgo de desgaste y fallas prematuras.',
    intro2: 'Cada decisión de filtración comienza con el activo protegido, su ciclo de trabajo, la exposición a contaminantes y la evidencia necesaria para seleccionar la arquitectura de protección adecuada.',
    statement1: 'El elemento filtrante es el medio.',
    statement2: 'La protección del activo es el objetivo.',
    partnersTitle: 'Crecemos a través de socios, no compitiendo con ellos',
    partners1: 'Nuestro modelo comercial está diseñado para priorizar y fortalecer a nuestros socios distribuidores.',
    partners2: 'Entendemos que el valor real en el mercado lo construyen quienes están cerca del cliente: soporte técnico local, disponibilidad de inventario, conocimiento de la aplicación, capacidad de respuesta y relaciones comerciales de largo plazo.',
    partners3: 'ELIMFILTERS aporta la arquitectura de ingeniería, la inteligencia de producto, la estructura de datos, el conocimiento técnico y una plataforma comercial diseñada para mejorar la capacidad competitiva de nuestros socios. Nuestro objetivo no es desplazar al distribuidor, sino aumentar su capacidad de generar valor, proteger su participación económica y fortalecer su posición en el mercado.',
    globalTitle: 'Infraestructura global, precisión industrial',
    global1: 'El desarrollo y formulación de los medios filtrantes ELIMFILTERS se realiza en Alemania, bajo criterios definidos de eficiencia, capacidad, resistencia, estabilidad y comportamiento dentro de la aplicación prevista.',
    global2: 'La manufactura se ejecuta mediante socios de producción calificados en la República Popular China (RPC), seleccionados por su especialización industrial, capacidad de manufactura, escalabilidad y experiencia dentro de cadenas de suministro automotrices y Heavy Duty.',
    global3: 'La selección de materiales, los procesos de fabricación, el control dimensional y la validación física se rigen por especificaciones definidas por ELIMFILTERS. Los sistemas asistidos por IA complementan este proceso mediante el análisis de datos de producción y producto para detectar inconsistencias, desviaciones y patrones anómalos. La validación física continúa basada en protocolos definidos de laboratorio y producción, bajo supervisión humana responsable.',
    horizontalTitle: 'Estructura horizontal, no recortes de calidad',
    horizontal1: 'Las estructuras corporativas tradicionales de múltiples capas suelen acumular niveles administrativos, procesos repetitivos y costos operativos que terminan incorporándose al precio del producto.',
    horizontal2: 'ELIMFILTERS opera con una estructura más horizontal. Agentes de inteligencia artificial entrenados apoyan procesos repetitivos de datos, documentación, análisis de catálogo y control de información, reduciendo carga operativa sin sustituir la responsabilidad técnica humana.',
    horizontal3: 'Estos procesos son revisados periódicamente por profesionales de ingeniería industrial, mecánica, de procesos y de sistemas.',
    horizontal4: 'La eficiencia económica no proviene de reducir la calidad de los materiales, la ingeniería, la manufactura o la validación. Proviene de operar con menos fricción administrativa, mayor automatización de tareas repetitivas y una estructura organizacional diseñada para convertir eficiencia operativa en valor comercial.',
    efficiencyTitle: 'La eficiencia se convierte en ventaja para nuestros socios',
    efficiency1: 'El resultado es una estructura de costos diferente.',
    efficiency2: 'No una estrategia de bajo precio.',
    efficiency3: 'ELIMFILTERS busca trasladar esa eficiencia a sus socios comerciales mediante una propuesta que combine ingeniería, manufactura controlada, inteligencia de producto, soporte técnico y una estructura económica que les permita competir con mayor capacidad en sus mercados.',
    closing1: 'ELIMFILTERS construye la plataforma.',
    closing2: 'Nuestros socios construyen el mercado.',
  },
  pt: {
    title: 'Engenharia e Proteção Estratégica de Ativos',
    intro1: 'Não projetamos componentes isolados como simples produtos de reposição. Desenvolvemos sistemas de proteção voltados ao controle de contaminação, à confiabilidade dos equipamentos e à redução do risco de desgaste e falhas prematuras.',
    intro2: 'Cada decisão de filtração começa pelo ativo protegido, seu regime de operação, a exposição à contaminação e as evidências necessárias para selecionar a arquitetura de proteção adequada.',
    statement1: 'O elemento filtrante é o meio.',
    statement2: 'A proteção do ativo é o objetivo.',
    partnersTitle: 'Crescemos por meio de parceiros, não competindo com eles',
    partners1: 'Nosso modelo comercial foi desenvolvido para priorizar e fortalecer nossos parceiros distribuidores.',
    partners2: 'Entendemos que o valor real no mercado é construído por quem está próximo do cliente: suporte técnico local, disponibilidade de estoque, conhecimento da aplicação, capacidade de resposta e relacionamentos comerciais de longo prazo.',
    partners3: 'A ELIMFILTERS oferece arquitetura de engenharia, inteligência de produto, dados estruturados, conhecimento técnico e uma plataforma comercial criada para ampliar a capacidade competitiva de nossos parceiros. Nosso objetivo não é substituir o distribuidor, mas aumentar sua capacidade de gerar valor, proteger sua participação econômica e fortalecer sua posição no mercado.',
    globalTitle: 'Infraestrutura global, precisão industrial',
    global1: 'O desenvolvimento e a formulação dos meios filtrantes ELIMFILTERS são realizados na Alemanha, segundo critérios definidos de eficiência, capacidade, resistência, estabilidade e comportamento na aplicação prevista.',
    global2: 'A fabricação é realizada por parceiros de produção qualificados na República Popular da China (RPC), selecionados por sua especialização industrial, capacidade de fabricação, escalabilidade e experiência em cadeias de suprimento automotivas e Heavy Duty.',
    global3: 'Materiais, processos de fabricação, controle dimensional e validação física seguem especificações definidas pela ELIMFILTERS. Sistemas assistidos por IA complementam esse processo analisando dados de produção e produto para identificar inconsistências, desvios e padrões anômalos. A validação física permanece baseada em protocolos definidos de laboratório e produção, com supervisão humana responsável.',
    horizontalTitle: 'Estrutura horizontal, não cortes de qualidade',
    horizontal1: 'Estruturas corporativas tradicionais com muitas camadas tendem a acumular níveis administrativos, processos repetitivos e custos operacionais que acabam incorporados ao preço do produto.',
    horizontal2: 'A ELIMFILTERS opera com uma estrutura mais horizontal. Agentes de inteligência artificial treinados apoiam processos repetitivos de dados, documentação, análise de catálogo e controle de informações, reduzindo a carga operacional sem substituir a responsabilidade técnica humana.',
    horizontal3: 'Esses processos são revisados periodicamente por profissionais de engenharia industrial, mecânica, de processos e de sistemas.',
    horizontal4: 'A eficiência econômica não vem da redução da qualidade dos materiais, da engenharia, da fabricação ou da validação. Ela vem de menos atrito administrativo, maior automação de tarefas repetitivas e uma estrutura organizacional projetada para transformar eficiência operacional em valor comercial.',
    efficiencyTitle: 'A eficiência se transforma em vantagem para nossos parceiros',
    efficiency1: 'O resultado é uma estrutura de custos diferente.',
    efficiency2: 'Não uma estratégia de preço baixo.',
    efficiency3: 'A ELIMFILTERS busca transferir essa eficiência aos parceiros comerciais por meio de uma proposta que combina engenharia, fabricação controlada, inteligência de produto, suporte técnico e uma estrutura econômica que lhes permita competir com maior capacidade em seus mercados.',
    closing1: 'A ELIMFILTERS constrói a plataforma.',
    closing2: 'Nossos parceiros constroem o mercado.',
  },
  fr: {
    title: 'Ingénierie et Protection Stratégique des Actifs',
    intro1: 'Nous ne concevons pas des composants isolés comme de simples produits de remplacement. Nous développons des systèmes de protection axés sur la maîtrise de la contamination, la fiabilité des équipements et la réduction du risque d’usure et de défaillances prématurées.',
    intro2: 'Chaque décision de filtration part de l’actif à protéger, de son cycle de fonctionnement, de son exposition aux contaminants et des preuves nécessaires pour sélectionner l’architecture de protection appropriée.',
    statement1: 'L’élément filtrant est le moyen.',
    statement2: 'La protection de l’actif est l’objectif.',
    partnersTitle: 'Nous grandissons avec nos partenaires, sans leur faire concurrence',
    partners1: 'Notre modèle commercial est conçu pour donner la priorité à nos partenaires distributeurs et renforcer leur position.',
    partners2: 'Nous savons que la valeur réelle sur le marché se construit au plus près du client : assistance technique locale, disponibilité des stocks, connaissance des applications, réactivité et relations commerciales à long terme.',
    partners3: 'ELIMFILTERS apporte l’architecture d’ingénierie, l’intelligence produit, les données structurées, les connaissances techniques et une plateforme commerciale conçue pour accroître la capacité concurrentielle de nos partenaires. Notre objectif n’est pas de remplacer le distributeur, mais d’augmenter sa capacité à créer de la valeur, à préserver sa participation économique et à renforcer sa position sur le marché.',
    globalTitle: 'Infrastructure mondiale, précision industrielle',
    global1: 'Le développement et la formulation des médias filtrants ELIMFILTERS sont réalisés en Allemagne selon des critères définis d’efficacité, de capacité, de résistance, de stabilité et de comportement dans l’application prévue.',
    global2: 'La fabrication est assurée par des partenaires de production qualifiés en République populaire de Chine (RPC), sélectionnés pour leur spécialisation industrielle, leurs capacités de fabrication, leur évolutivité et leur expérience des chaînes d’approvisionnement automobile et Heavy Duty.',
    global3: 'Les matériaux, les procédés de fabrication, le contrôle dimensionnel et la validation physique sont régis par des spécifications définies par ELIMFILTERS. Les systèmes assistés par IA complètent ce processus en analysant les données de production et de produit afin d’identifier les incohérences, les écarts et les tendances anormales. La validation physique reste fondée sur des protocoles définis de laboratoire et de production, avec une supervision humaine responsable.',
    horizontalTitle: 'Une structure horizontale, sans compromis sur la qualité',
    horizontal1: 'Les structures d’entreprise traditionnelles à multiples niveaux accumulent souvent des couches administratives, des processus répétitifs et des coûts d’exploitation qui finissent par être intégrés au prix du produit.',
    horizontal2: 'ELIMFILTERS fonctionne avec une structure plus horizontale. Des agents d’intelligence artificielle entraînés prennent en charge des processus répétitifs liés aux données, à la documentation, à l’analyse du catalogue et au contrôle de l’information, réduisant la charge opérationnelle sans remplacer la responsabilité technique humaine.',
    horizontal3: 'Ces processus sont examinés périodiquement par des professionnels de l’ingénierie industrielle, mécanique, des procédés et des systèmes.',
    horizontal4: 'L’efficacité économique ne provient pas d’une réduction de la qualité des matériaux, de l’ingénierie, de la fabrication ou de la validation. Elle provient d’une moindre friction administrative, d’une automatisation accrue des tâches répétitives et d’une structure organisationnelle conçue pour transformer l’efficacité opérationnelle en valeur commerciale.',
    efficiencyTitle: 'L’efficacité devient un avantage pour nos partenaires',
    efficiency1: 'Le résultat est une structure de coûts différente.',
    efficiency2: 'Pas une stratégie de bas prix.',
    efficiency3: 'ELIMFILTERS cherche à transférer cette efficacité à ses partenaires commerciaux grâce à une proposition qui associe ingénierie, fabrication contrôlée, intelligence produit, assistance technique et structure économique leur permettant de renforcer leur capacité concurrentielle sur leurs marchés.',
    closing1: 'ELIMFILTERS construit la plateforme.',
    closing2: 'Nos partenaires construisent le marché.',
  },
  it: {
    title: 'Ingegneria e Protezione Strategica degli Asset',
    intro1: 'Non progettiamo componenti isolati come semplici prodotti di ricambio. Sviluppiamo sistemi di protezione orientati al controllo della contaminazione, all’affidabilità delle apparecchiature e alla riduzione del rischio di usura e guasti prematuri.',
    intro2: 'Ogni decisione di filtrazione parte dall’asset da proteggere, dal suo ciclo operativo, dall’esposizione ai contaminanti e dalle evidenze necessarie per selezionare l’architettura di protezione appropriata.',
    statement1: 'L’elemento filtrante è il mezzo.',
    statement2: 'La protezione dell’asset è l’obiettivo.',
    partnersTitle: 'Cresciamo attraverso i partner, non competendo con loro',
    partners1: 'Il nostro modello commerciale è progettato per dare priorità e rafforzare i nostri partner distributori.',
    partners2: 'Sappiamo che il vero valore sul mercato viene costruito vicino al cliente: supporto tecnico locale, disponibilità di magazzino, conoscenza dell’applicazione, capacità di risposta e relazioni commerciali di lungo periodo.',
    partners3: 'ELIMFILTERS mette a disposizione architettura ingegneristica, intelligence di prodotto, dati strutturati, conoscenza tecnica e una piattaforma commerciale progettata per aumentare la capacità competitiva dei nostri partner. Il nostro obiettivo non è sostituire il distributore, ma aumentarne la capacità di creare valore, tutelarne la partecipazione economica e rafforzarne la posizione sul mercato.',
    globalTitle: 'Infrastruttura globale, precisione industriale',
    global1: 'Lo sviluppo e la formulazione dei media filtranti ELIMFILTERS avvengono in Germania secondo criteri definiti di efficienza, capacità, resistenza, stabilità e comportamento nell’applicazione prevista.',
    global2: 'La produzione è affidata a partner qualificati nella Repubblica Popolare Cinese (RPC), selezionati per specializzazione industriale, capacità produttiva, scalabilità ed esperienza nelle catene di fornitura automotive e Heavy Duty.',
    global3: 'Materiali, processi produttivi, controllo dimensionale e validazione fisica sono regolati da specifiche definite da ELIMFILTERS. I sistemi assistiti dall’IA completano il processo analizzando i dati di produzione e di prodotto per individuare incoerenze, deviazioni e pattern anomali. La validazione fisica resta basata su protocolli definiti di laboratorio e produzione, con supervisione umana responsabile.',
    horizontalTitle: 'Struttura orizzontale, non tagli alla qualità',
    horizontal1: 'Le strutture aziendali tradizionali a più livelli tendono ad accumulare livelli amministrativi, processi ripetitivi e costi operativi che finiscono per essere incorporati nel prezzo del prodotto.',
    horizontal2: 'ELIMFILTERS opera con una struttura più orizzontale. Agenti di intelligenza artificiale addestrati supportano processi ripetitivi di dati, documentazione, analisi del catalogo e controllo delle informazioni, riducendo il carico operativo senza sostituire la responsabilità tecnica umana.',
    horizontal3: 'Questi processi vengono periodicamente riesaminati da professionisti dell’ingegneria industriale, meccanica, di processo e dei sistemi.',
    horizontal4: 'L’efficienza economica non deriva da una riduzione della qualità dei materiali, dell’ingegneria, della produzione o della validazione. Deriva da minore attrito amministrativo, maggiore automazione delle attività ripetitive e una struttura organizzativa progettata per trasformare l’efficienza operativa in valore commerciale.',
    efficiencyTitle: 'L’efficienza diventa un vantaggio per i nostri partner',
    efficiency1: 'Il risultato è una struttura dei costi diversa.',
    efficiency2: 'Non una strategia di basso prezzo.',
    efficiency3: 'ELIMFILTERS mira a trasferire questa efficienza ai propri partner commerciali attraverso una proposta che combina ingegneria, produzione controllata, intelligence di prodotto, supporto tecnico e una struttura economica che consenta loro di competere con maggiore capacità nei propri mercati.',
    closing1: 'ELIMFILTERS costruisce la piattaforma.',
    closing2: 'I nostri partner costruiscono il mercato.',
  },
  nl: {
    title: 'Strategische Engineering en Bescherming van Bedrijfsmiddelen',
    intro1: 'Wij ontwerpen geen geïsoleerde componenten als eenvoudige vervangingsproducten. Wij ontwikkelen beschermingssystemen die gericht zijn op verontreinigingsbeheersing, betrouwbaarheid van apparatuur en het verminderen van het risico op voortijdige slijtage en uitval.',
    intro2: 'Elke filtratiebeslissing begint bij het te beschermen bedrijfsmiddel, de bedrijfsomstandigheden, de blootstelling aan verontreiniging en het bewijs dat nodig is om de juiste beschermingsarchitectuur te selecteren.',
    statement1: 'Het filterelement is het middel.',
    statement2: 'Bescherming van het bedrijfsmiddel is het doel.',
    partnersTitle: 'Wij groeien via partners, niet door met hen te concurreren',
    partners1: 'Ons commerciële model is ontworpen om onze distributiepartners voorrang te geven en hun positie te versterken.',
    partners2: 'Wij begrijpen dat echte marktwaarde dicht bij de klant ontstaat: lokale technische ondersteuning, voorraadbeschikbaarheid, toepassingskennis, reactiesnelheid en langdurige commerciële relaties.',
    partners3: 'ELIMFILTERS levert engineeringarchitectuur, productintelligentie, gestructureerde data, technische kennis en een commercieel platform dat is ontworpen om het concurrentievermogen van onze partners te vergroten. Ons doel is niet om de distributeur te verdringen, maar om diens vermogen om waarde te creëren, economische participatie te beschermen en marktpositie te versterken.',
    globalTitle: 'Wereldwijde infrastructuur, industriële precisie',
    global1: 'De ontwikkeling en formulering van ELIMFILTERS-filtermedia vindt plaats in Duitsland volgens vastgelegde criteria voor efficiëntie, capaciteit, sterkte, stabiliteit en gedrag binnen de beoogde toepassing.',
    global2: 'De productie wordt uitgevoerd door gekwalificeerde productiepartners in de Volksrepubliek China (VRC), geselecteerd op industriële specialisatie, productiecapaciteit, schaalbaarheid en ervaring binnen automotive- en Heavy Duty-toeleveringsketens.',
    global3: 'Materialen, productieprocessen, maatvoering en fysieke validatie vallen onder door ELIMFILTERS vastgestelde specificaties. AI-ondersteunde systemen vullen dit proces aan door productie- en productgegevens te analyseren op inconsistenties, afwijkingen en abnormale patronen. Fysieke validatie blijft gebaseerd op vastgelegde laboratorium- en productieprotocollen, met verantwoordelijke menselijke supervisie.',
    horizontalTitle: 'Horizontale structuur, geen kwaliteitsbesparingen',
    horizontal1: 'Traditionele bedrijfsstructuren met veel lagen stapelen vaak administratieve niveaus, repetitieve processen en bedrijfskosten op die uiteindelijk in de productprijs terechtkomen.',
    horizontal2: 'ELIMFILTERS werkt met een horizontalere structuur. Getrainde AI-agenten ondersteunen repetitieve processen voor data, documentatie, catalogusanalyse en informatiebeheer, waardoor de operationele belasting afneemt zonder menselijke technische verantwoordelijkheid te vervangen.',
    horizontal3: 'Deze processen worden periodiek beoordeeld door professionals uit de industriële, werktuigbouwkundige, proces- en systeemtechniek.',
    horizontal4: 'Economische efficiëntie komt niet voort uit lagere kwaliteit van materialen, engineering, productie of validatie. Ze komt voort uit minder administratieve frictie, meer automatisering van repetitieve taken en een organisatiestructuur die operationele efficiëntie omzet in commerciële waarde.',
    efficiencyTitle: 'Efficiëntie wordt een voordeel voor onze partners',
    efficiency1: 'Het resultaat is een andere kostenstructuur.',
    efficiency2: 'Geen lageprijsstrategie.',
    efficiency3: 'ELIMFILTERS wil die efficiëntie doorgeven aan commerciële partners via een propositie die engineering, gecontroleerde productie, productintelligentie, technische ondersteuning en een economische structuur combineert waarmee zij sterker kunnen concurreren in hun markten.',
    closing1: 'ELIMFILTERS bouwt het platform.',
    closing2: 'Onze partners bouwen de markt.',
  },
  ru: {
    title: 'Стратегический инжиниринг и защита активов',
    intro1: 'Мы не проектируем отдельные компоненты как простые товары для замены. Мы разрабатываем системы защиты, ориентированные на контроль загрязнений, надежность оборудования и снижение риска преждевременного износа и отказов.',
    intro2: 'Каждое решение по фильтрации начинается с защищаемого актива, режима его эксплуатации, воздействия загрязнений и доказательной базы, необходимой для выбора подходящей архитектуры защиты.',
    statement1: 'Фильтрующий элемент — это средство.',
    statement2: 'Защита актива — это цель.',
    partnersTitle: 'Мы растем вместе с партнерами, а не конкурируем с ними',
    partners1: 'Наша коммерческая модель создана для того, чтобы отдавать приоритет дистрибьюторским партнерам и укреплять их позиции.',
    partners2: 'Мы понимаем, что реальная ценность на рынке создается рядом с клиентом: локальная техническая поддержка, наличие продукции, знание применения, оперативность и долгосрочные коммерческие отношения.',
    partners3: 'ELIMFILTERS предоставляет инженерную архитектуру, продуктовую аналитику, структурированные данные, технические знания и коммерческую платформу, повышающую конкурентоспособность партнеров. Наша цель — не вытеснить дистрибьютора, а усилить его способность создавать ценность, защищать экономическое участие и укреплять позицию на рынке.',
    globalTitle: 'Глобальная инфраструктура, промышленная точность',
    global1: 'Разработка и формулирование фильтрующих материалов ELIMFILTERS выполняются в Германии по заданным критериям эффективности, емкости, прочности, стабильности и поведения в предусмотренном применении.',
    global2: 'Производство осуществляется через квалифицированных партнеров в Китайской Народной Республике (КНР), выбранных за промышленную специализацию, производственные возможности, масштабируемость и опыт в автомобильных и Heavy Duty цепочках поставок.',
    global3: 'Материалы, производственные процессы, размерный контроль и физическая валидация регулируются спецификациями ELIMFILTERS. Системы с поддержкой ИИ дополняют этот процесс, анализируя производственные и продуктовые данные для выявления несоответствий, отклонений и аномальных закономерностей. Физическая валидация по-прежнему основывается на определенных лабораторных и производственных протоколах при ответственной человеческой проверке.',
    horizontalTitle: 'Горизонтальная структура без снижения качества',
    horizontal1: 'Традиционные многоуровневые корпоративные структуры часто накапливают административные уровни, повторяющиеся процессы и операционные расходы, которые в итоге включаются в цену продукта.',
    horizontal2: 'ELIMFILTERS работает с более горизонтальной структурой. Обученные ИИ-агенты поддерживают повторяющиеся процессы обработки данных, документации, анализа каталога и контроля информации, снижая операционную нагрузку без замены человеческой технической ответственности.',
    horizontal3: 'Эти процессы периодически проверяются специалистами по промышленной, механической, процессной и системной инженерии.',
    horizontal4: 'Экономическая эффективность достигается не за счет снижения качества материалов, инженерии, производства или валидации. Она обеспечивается меньшим административным трением, большей автоматизацией повторяющихся задач и организационной структурой, превращающей операционную эффективность в коммерческую ценность.',
    efficiencyTitle: 'Эффективность становится преимуществом для наших партнеров',
    efficiency1: 'Результат — иная структура затрат.',
    efficiency2: 'Это не стратегия низкой цены.',
    efficiency3: 'ELIMFILTERS стремится передавать эту эффективность коммерческим партнерам через сочетание инженерии, контролируемого производства, продуктовой аналитики, технической поддержки и экономической структуры, позволяющей им увереннее конкурировать на своих рынках.',
    closing1: 'ELIMFILTERS строит платформу.',
    closing2: 'Наши партнеры строят рынок.',
  },
  zh: {
    title: '资产战略工程与保护',
    intro1: '我们并不把独立部件设计成简单的替换产品。我们开发以污染控制、设备可靠性以及降低过早磨损和故障风险为核心的保护系统。',
    intro2: '每一项过滤决策都从受保护资产、运行工况、污染暴露以及选择适当保护架构所需的证据开始。',
    statement1: '滤芯是手段。',
    statement2: '资产保护才是目标。',
    partnersTitle: '我们通过合作伙伴成长，而不是与他们竞争',
    partners1: '我们的商业模式旨在优先支持并强化经销合作伙伴。',
    partners2: '我们理解，真正的市场价值产生于最接近客户的地方：本地技术支持、库存可用性、应用知识、响应能力以及长期商业关系。',
    partners3: 'ELIMFILTERS 提供工程架构、产品智能、结构化数据、技术知识以及旨在提升合作伙伴竞争力的商业平台。我们的目标不是取代经销商，而是增强其创造价值、维护经济参与并巩固市场地位的能力。',
    globalTitle: '全球基础设施，工业级精度',
    global1: 'ELIMFILTERS 过滤介质的开发与配方在德国进行，并依据针对预期应用所定义的效率、容量、强度、稳定性和工作特性标准。',
    global2: '制造由位于中华人民共和国的合格生产合作伙伴执行，这些伙伴基于其工业专业能力、制造能力、可扩展性以及汽车和 Heavy Duty 供应链经验进行选择。',
    global3: '材料、制造工艺、尺寸控制和物理验证均受 ELIMFILTERS 定义的规范管理。AI 辅助系统通过分析生产和产品数据来识别不一致、偏差和异常模式，从而补充这一流程。物理验证仍基于明确的实验室和生产协议，并由具备责任主体的人类专业人员监督。',
    horizontalTitle: '水平化结构，而非削减质量',
    horizontal1: '传统的多层级企业结构往往会累积管理层级、重复流程和运营成本，并最终反映在产品价格中。',
    horizontal2: 'ELIMFILTERS 采用更加水平化的结构。经过训练的 AI 智能体支持数据、文档、目录分析和信息控制等重复性流程，在不替代人类技术责任的前提下降低运营负担。',
    horizontal3: '这些流程由工业、机械、流程和系统工程专业人员定期审查。',
    horizontal4: '经济效率并非来自降低材料、工程、制造或验证质量，而是来自更少的行政摩擦、更高程度的重复任务自动化，以及将运营效率转化为商业价值的组织结构。',
    efficiencyTitle: '效率转化为合作伙伴的竞争优势',
    efficiency1: '最终形成的是一种不同的成本结构。',
    efficiency2: '这不是低价战略。',
    efficiency3: 'ELIMFILTERS 致力于通过工程、受控制造、产品智能、技术支持和合理的经济结构，将这种效率传递给商业合作伙伴，使其能够在各自市场中以更强的能力竞争。',
    closing1: 'ELIMFILTERS 构建平台。',
    closing2: '我们的合作伙伴构建市场。',
  },
  ja: {
    title: '資産保護のための戦略的エンジニアリング',
    intro1: '私たちは、単なる交換品として個別部品を設計するのではありません。汚染管理、設備信頼性、早期摩耗や故障リスクの低減を目的とした保護システムを開発しています。',
    intro2: 'すべてのろ過判断は、保護対象となる資産、運転条件、汚染への曝露、そして適切な保護アーキテクチャを選定するために必要な根拠から始まります。',
    statement1: 'フィルターエレメントは手段です。',
    statement2: '資産保護こそが目的です。',
    partnersTitle: '私たちはパートナーと競うのではなく、パートナーとともに成長します',
    partners1: '当社の商業モデルは、販売パートナーを優先し、その競争力を強化するよう設計されています。',
    partners2: '市場における本当の価値は、顧客に近い場所で生まれると考えています。現地の技術支援、在庫の即応性、用途知識、対応力、そして長期的な商取引関係です。',
    partners3: 'ELIMFILTERS は、エンジニアリングアーキテクチャ、製品インテリジェンス、構造化データ、技術知識、そしてパートナーの競争力向上を目的とした商業プラットフォームを提供します。私たちの目的は販売代理店を置き換えることではなく、価値創出能力、経済的な参加価値、市場での立場を強化することです。',
    globalTitle: 'グローバルな基盤、産業レベルの精度',
    global1: 'ELIMFILTERS のろ材開発および配合はドイツで行われ、想定用途における効率、容量、強度、安定性、挙動について定義された基準に基づいています。',
    global2: '製造は、中華人民共和国の認定生産パートナーを通じて行われます。パートナーは、産業分野の専門性、製造能力、拡張性、ならびに自動車および Heavy Duty サプライチェーンでの経験に基づいて選定されます。',
    global3: '材料、製造工程、寸法管理、物理検証は、ELIMFILTERS が定める仕様に基づいて管理されます。AI 支援システムは、生産・製品データを分析して不整合、逸脱、異常パターンを検出し、このプロセスを補完します。物理検証は、定義された試験室および生産プロトコルに基づき、責任ある人間の監督のもとで行われます。',
    horizontalTitle: '品質を削らない、水平型の組織構造',
    horizontal1: '従来の多層型企業組織では、管理階層、反復業務、運営コストが積み重なり、最終的に製品価格へ反映されることがあります。',
    horizontal2: 'ELIMFILTERS は、より水平的な組織構造で運営しています。訓練された AI エージェントが、データ処理、文書管理、カタログ分析、情報管理などの反復業務を支援し、人間の技術責任を置き換えることなく運営負荷を軽減します。',
    horizontal3: 'これらのプロセスは、産業、機械、プロセス、システム各分野のエンジニアリング専門家によって定期的にレビューされます。',
    horizontal4: '経済効率は、材料、エンジニアリング、製造、検証の品質を下げることで生まれるものではありません。管理上の摩擦を減らし、反復作業の自動化を進め、運営効率を商業価値へ転換する組織構造によって生まれます。',
    efficiencyTitle: '効率性をパートナーの競争優位へ',
    efficiency1: 'その結果として、異なるコスト構造が生まれます。',
    efficiency2: '低価格戦略ではありません。',
    efficiency3: 'ELIMFILTERS は、エンジニアリング、管理された製造、製品インテリジェンス、技術支援、そして健全な経済構造を組み合わせることで、その効率を商業パートナーへ還元し、各市場でより強く競争できるよう支援します。',
    closing1: 'ELIMFILTERS がプラットフォームを構築します。',
    closing2: '市場を築くのは私たちのパートナーです。',
  },
  ar: {
    title: 'الهندسة الاستراتيجية وحماية الأصول',
    intro1: 'نحن لا نصمم مكونات منفصلة باعتبارها مجرد منتجات بديلة. بل نطور أنظمة حماية تركز على التحكم في التلوث، وموثوقية المعدات، وتقليل مخاطر التآكل والأعطال المبكرة.',
    intro2: 'يبدأ كل قرار ترشيح من الأصل المراد حمايته، وظروف تشغيله، ومدى تعرضه للملوثات، والأدلة اللازمة لاختيار بنية الحماية المناسبة.',
    statement1: 'عنصر الترشيح هو الوسيلة.',
    statement2: 'حماية الأصل هي الهدف.',
    partnersTitle: 'ننمو من خلال شركائنا، لا عبر منافستهم',
    partners1: 'تم تصميم نموذجنا التجاري لإعطاء الأولوية لشركائنا الموزعين وتعزيز قدرتهم التنافسية.',
    partners2: 'ندرك أن القيمة الحقيقية في السوق تُبنى بالقرب من العميل: الدعم الفني المحلي، وتوفر المخزون، ومعرفة التطبيق، وسرعة الاستجابة، والعلاقات التجارية طويلة الأجل.',
    partners3: 'توفر ELIMFILTERS بنية هندسية، وذكاءً للمنتج، وبيانات منظمة، ومعرفة تقنية، ومنصة تجارية مصممة لتعزيز القدرة التنافسية لشركائنا. هدفنا ليس إزاحة الموزع، بل زيادة قدرته على خلق القيمة، وحماية مشاركته الاقتصادية، وتعزيز موقعه في السوق.',
    globalTitle: 'بنية تحتية عالمية، ودقة صناعية',
    global1: 'يتم تطوير وصياغة وسائط الترشيح الخاصة بـ ELIMFILTERS في ألمانيا وفق معايير محددة للكفاءة والسعة والمقاومة والاستقرار والسلوك ضمن التطبيق المقصود.',
    global2: 'يتم التصنيع من خلال شركاء إنتاج مؤهلين في جمهورية الصين الشعبية، يتم اختيارهم بناءً على التخصص الصناعي، والقدرة التصنيعية، وقابلية التوسع، والخبرة في سلاسل توريد السيارات وHeavy Duty.',
    global3: 'تخضع المواد وعمليات التصنيع والرقابة على الأبعاد والتحقق الفيزيائي لمواصفات تحددها ELIMFILTERS. وتكمل الأنظمة المدعومة بالذكاء الاصطناعي هذه العملية عبر تحليل بيانات الإنتاج والمنتج لاكتشاف حالات عدم الاتساق والانحرافات والأنماط غير الطبيعية. ويظل التحقق الفيزيائي قائمًا على بروتوكولات مختبرية وإنتاجية محددة مع إشراف بشري مسؤول.',
    horizontalTitle: 'هيكل أفقي من دون خفض الجودة',
    horizontal1: 'غالبًا ما تراكم الهياكل المؤسسية التقليدية متعددة المستويات طبقات إدارية وعمليات متكررة وتكاليف تشغيلية تنعكس في النهاية على سعر المنتج.',
    horizontal2: 'تعمل ELIMFILTERS بهيكل أكثر أفقية. تدعم وكلاء الذكاء الاصطناعي المدربون العمليات المتكررة المتعلقة بالبيانات والوثائق وتحليل الكتالوج وضبط المعلومات، مما يقلل العبء التشغيلي من دون أن يحل محل المسؤولية التقنية البشرية.',
    horizontal3: 'تتم مراجعة هذه العمليات دوريًا بواسطة متخصصين في الهندسة الصناعية والميكانيكية وهندسة العمليات والأنظمة.',
    horizontal4: 'لا تأتي الكفاءة الاقتصادية من خفض جودة المواد أو الهندسة أو التصنيع أو التحقق. بل تأتي من تقليل الاحتكاك الإداري، وزيادة أتمتة المهام المتكررة، وبناء هيكل تنظيمي يحول الكفاءة التشغيلية إلى قيمة تجارية.',
    efficiencyTitle: 'تتحول الكفاءة إلى ميزة لشركائنا',
    efficiency1: 'والنتيجة هي هيكل تكلفة مختلف.',
    efficiency2: 'وليست استراتيجية سعر منخفض.',
    efficiency3: 'تسعى ELIMFILTERS إلى نقل هذه الكفاءة إلى شركائها التجاريين من خلال عرض يجمع بين الهندسة والتصنيع المنضبط وذكاء المنتج والدعم الفني وهيكل اقتصادي يمكّنهم من المنافسة بقدرة أكبر في أسواقهم.',
    closing1: 'ELIMFILTERS تبني المنصة.',
    closing2: 'وشركاؤنا يبنون السوق.',
  },
  fa: {
    title: 'مهندسی راهبردی و حفاظت از دارایی',
    intro1: 'ما قطعات منفرد را صرفاً به‌عنوان محصولات جایگزین طراحی نمی‌کنیم. ما سامانه‌های حفاظتی را با تمرکز بر کنترل آلودگی، قابلیت اطمینان تجهیزات و کاهش خطر سایش و خرابی زودرس توسعه می‌دهیم.',
    intro2: 'هر تصمیم فیلتراسیون از دارایی مورد حفاظت، شرایط کاری آن، میزان مواجهه با آلودگی و شواهد لازم برای انتخاب معماری حفاظتی مناسب آغاز می‌شود.',
    statement1: 'عنصر فیلتر وسیله است.',
    statement2: 'حفاظت از دارایی هدف است.',
    partnersTitle: 'ما از طریق شرکا رشد می‌کنیم، نه با رقابت با آن‌ها',
    partners1: 'مدل تجاری ما برای اولویت دادن به شرکای توزیع‌کننده و تقویت جایگاه آن‌ها طراحی شده است.',
    partners2: 'ما می‌دانیم ارزش واقعی بازار نزدیک به مشتری ساخته می‌شود: پشتیبانی فنی محلی، دسترسی به موجودی، شناخت کاربرد، توان پاسخ‌گویی و روابط تجاری بلندمدت.',
    partners3: 'ELIMFILTERS معماری مهندسی، هوشمندی محصول، داده‌های ساختاریافته، دانش فنی و یک پلتفرم تجاری برای تقویت توان رقابتی شرکا فراهم می‌کند. هدف ما حذف توزیع‌کننده نیست، بلکه افزایش توان او در خلق ارزش، حفاظت از سهم اقتصادی و تقویت جایگاهش در بازار است.',
    globalTitle: 'زیرساخت جهانی، دقت صنعتی',
    global1: 'توسعه و فرمولاسیون مدیای فیلتراسیون ELIMFILTERS در آلمان و بر اساس معیارهای تعریف‌شده برای بازده، ظرفیت، مقاومت، پایداری و رفتار در کاربرد موردنظر انجام می‌شود.',
    global2: 'تولید از طریق شرکای واجد صلاحیت در جمهوری خلق چین انجام می‌شود که بر اساس تخصص صنعتی، توان تولید، مقیاس‌پذیری و تجربه در زنجیره‌های تأمین خودرویی و Heavy Duty انتخاب شده‌اند.',
    global3: 'مواد، فرایندهای تولید، کنترل ابعادی و اعتبارسنجی فیزیکی بر اساس مشخصات تعریف‌شده توسط ELIMFILTERS مدیریت می‌شوند. سامانه‌های مجهز به هوش مصنوعی با تحلیل داده‌های تولید و محصول برای شناسایی ناسازگاری‌ها، انحراف‌ها و الگوهای غیرعادی این فرایند را تکمیل می‌کنند. اعتبارسنجی فیزیکی همچنان بر پروتکل‌های مشخص آزمایشگاهی و تولیدی و نظارت مسئولانه انسانی استوار است.',
    horizontalTitle: 'ساختار افقی، بدون کاهش کیفیت',
    horizontal1: 'ساختارهای سنتی چندلایه سازمانی اغلب لایه‌های مدیریتی، فرایندهای تکراری و هزینه‌های عملیاتی را انباشته می‌کنند که در نهایت وارد قیمت محصول می‌شود.',
    horizontal2: 'ELIMFILTERS با ساختاری افقی‌تر فعالیت می‌کند. عامل‌های آموزش‌دیده هوش مصنوعی از فرایندهای تکراری داده، مستندسازی، تحلیل کاتالوگ و کنترل اطلاعات پشتیبانی می‌کنند و بدون جایگزین کردن مسئولیت فنی انسان، بار عملیاتی را کاهش می‌دهند.',
    horizontal3: 'این فرایندها به‌صورت دوره‌ای توسط متخصصان مهندسی صنایع، مکانیک، فرایند و سیستم‌ها بازبینی می‌شوند.',
    horizontal4: 'بهره‌وری اقتصادی از کاهش کیفیت مواد، مهندسی، تولید یا اعتبارسنجی به دست نمی‌آید. این بهره‌وری از کاهش اصطکاک اداری، خودکارسازی بیشتر وظایف تکراری و ساختاری سازمانی حاصل می‌شود که کارایی عملیاتی را به ارزش تجاری تبدیل می‌کند.',
    efficiencyTitle: 'بهره‌وری به مزیت شرکای ما تبدیل می‌شود',
    efficiency1: 'نتیجه، ساختار هزینه‌ای متفاوت است.',
    efficiency2: 'نه یک راهبرد قیمت پایین.',
    efficiency3: 'ELIMFILTERS تلاش می‌کند این بهره‌وری را از طریق ترکیب مهندسی، تولید کنترل‌شده، هوشمندی محصول، پشتیبانی فنی و ساختار اقتصادی مناسب به شرکای تجاری منتقل کند تا آن‌ها بتوانند با توان بیشتری در بازارهای خود رقابت کنند.',
    closing1: 'ELIMFILTERS پلتفرم را می‌سازد.',
    closing2: 'شرکای ما بازار را می‌سازند.',
  },
};

function getLocale(value: string | undefined): Locale {
  const short = (value || 'en').toLowerCase().slice(0, 2) as Locale;
  return short in COPY ? short : 'en';
}

export function AboutStrategicModel() {
  const { i18n } = useTranslation();
  const copy = COPY[getLocale(i18n.resolvedLanguage || i18n.language)];

  return (
    <section style={section}>
      <div style={wrap}>
        <p style={eyebrow}>ELIMFILTERS®</p>
        <h2 style={title}>{copy.title}</h2>
        <div style={introGrid}>
          <p style={lead}>{copy.intro1}</p>
          <p style={body}>{copy.intro2}</p>
        </div>

        <div style={statementBlock} aria-label={`${copy.statement1} ${copy.statement2}`}>
          <span style={statementPrimary}>{copy.statement1}</span>
          <span style={statementSecondary}>{copy.statement2}</span>
        </div>

        <div style={contentGrid}>
          <article style={panel}>
            <p style={sectionNumber}>01</p>
            <h3 style={panelTitle}>{copy.partnersTitle}</h3>
            <p style={body}>{copy.partners1}</p>
            <p style={body}>{copy.partners2}</p>
            <p style={body}>{copy.partners3}</p>
          </article>

          <article style={panel}>
            <p style={sectionNumber}>02</p>
            <h3 style={panelTitle}>{copy.globalTitle}</h3>
            <p style={body}>{copy.global1}</p>
            <p style={body}>{copy.global2}</p>
            <p style={body}>{copy.global3}</p>
          </article>

          <article style={panel}>
            <p style={sectionNumber}>03</p>
            <h3 style={panelTitle}>{copy.horizontalTitle}</h3>
            <p style={body}>{copy.horizontal1}</p>
            <p style={body}>{copy.horizontal2}</p>
            <p style={body}>{copy.horizontal3}</p>
            <p style={body}>{copy.horizontal4}</p>
          </article>

          <article style={panel}>
            <p style={sectionNumber}>04</p>
            <h3 style={panelTitle}>{copy.efficiencyTitle}</h3>
            <p style={body}>{copy.efficiency1}</p>
            <p style={{ ...body, color: '#FFF12D', fontWeight: 700 }}>{copy.efficiency2}</p>
            <p style={body}>{copy.efficiency3}</p>
          </article>
        </div>

        <div style={closingBlock}>
          <span style={closingPrimary}>{copy.closing1}</span>
          <span style={closingSecondary}>{copy.closing2}</span>
        </div>
      </div>
    </section>
  );
}

const section: CSSProperties = {
  padding: 'clamp(4.5rem, 9vw, 8rem) clamp(1.25rem, 6vw, 6rem)',
  background: 'linear-gradient(180deg, #050505 0%, #000 100%)',
  borderTop: '1px solid rgba(255,241,45,0.24)',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
};

const wrap: CSSProperties = { maxWidth: '1180px', margin: '0 auto' };

const eyebrow: CSSProperties = {
  color: '#FFF12D',
  fontFamily: 'var(--font-display)',
  fontWeight: 700,
  fontSize: '0.76rem',
  letterSpacing: '0.18em',
  margin: '0 0 1rem',
};

const title: CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontWeight: 700,
  fontSize: 'clamp(2.4rem, 5vw, 4.8rem)',
  lineHeight: 0.96,
  letterSpacing: '-0.035em',
  textTransform: 'uppercase',
  maxWidth: '980px',
  margin: 0,
};

const introGrid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: 'clamp(2rem, 5vw, 4rem)',
  marginTop: '2.5rem',
};

const lead: CSSProperties = {
  color: 'rgba(255,255,255,0.88)',
  fontSize: 'clamp(1.08rem, 1.7vw, 1.35rem)',
  lineHeight: 1.7,
  fontWeight: 600,
  margin: 0,
};

const body: CSSProperties = {
  color: 'rgba(255,255,255,0.68)',
  fontSize: '1rem',
  lineHeight: 1.78,
  margin: '1rem 0 0',
};

const statementBlock: CSSProperties = {
  margin: 'clamp(4rem, 8vw, 7rem) 0',
  padding: 'clamp(2.2rem, 5vw, 4.5rem)',
  border: '1px solid rgba(255,241,45,0.44)',
  borderLeft: '8px solid #FFF12D',
  background: 'radial-gradient(circle at 0% 50%, rgba(255,241,45,0.12), transparent 42%), #050505',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.35rem',
};

const statementPrimary: CSSProperties = {
  color: '#fff',
  fontFamily: 'var(--font-display)',
  fontWeight: 700,
  fontSize: 'clamp(2rem, 4.6vw, 4.5rem)',
  lineHeight: 0.98,
  letterSpacing: '-0.035em',
};

const statementSecondary: CSSProperties = {
  color: '#FFF12D',
  fontFamily: 'var(--font-display)',
  fontWeight: 700,
  fontSize: 'clamp(2rem, 4.6vw, 4.5rem)',
  lineHeight: 0.98,
  letterSpacing: '-0.035em',
};

const contentGrid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  gap: '1rem',
};

const panel: CSSProperties = {
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.025)',
  padding: 'clamp(1.5rem, 3vw, 2.2rem)',
};

const sectionNumber: CSSProperties = {
  color: '#FFF12D',
  fontFamily: 'var(--font-display)',
  fontWeight: 700,
  letterSpacing: '0.16em',
  fontSize: '0.78rem',
  margin: 0,
};

const panelTitle: CSSProperties = {
  color: '#fff',
  fontFamily: 'var(--font-display)',
  fontWeight: 700,
  fontSize: 'clamp(1.45rem, 2.6vw, 2.4rem)',
  lineHeight: 1.02,
  letterSpacing: '-0.025em',
  textTransform: 'uppercase',
  margin: '1.1rem 0 1.4rem',
};

const closingBlock: CSSProperties = {
  marginTop: 'clamp(3rem, 7vw, 6rem)',
  paddingTop: '2.5rem',
  borderTop: '1px solid rgba(255,241,45,0.35)',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.4rem',
};

const closingPrimary: CSSProperties = {
  color: '#fff',
  fontFamily: 'var(--font-display)',
  fontWeight: 700,
  fontSize: 'clamp(1.8rem, 3.6vw, 3.4rem)',
  lineHeight: 1,
};

const closingSecondary: CSSProperties = {
  color: '#FFF12D',
  fontFamily: 'var(--font-display)',
  fontWeight: 700,
  fontSize: 'clamp(1.8rem, 3.6vw, 3.4rem)',
  lineHeight: 1,
};
