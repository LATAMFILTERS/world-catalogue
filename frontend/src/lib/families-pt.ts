// Portuguese (pt-BR) copy for the published /pt/families/ pages.
// Translations of the governed English sources (product-families-data, canonical-engineering,
// protection-systems-data, failure-knowledge). Technology names stay as registered marks.
// Keep meaning identical to the English source: no added claims, values or certifications.
import type { FailureEs, FamilyEs, SystemEs, TechnologyEs } from './families-es';

export const FAMILY_PT: Record<string, FamilyEs> = {
  'primary-air': {
    name: 'Ar primário',
    seoTitle: 'Elementos de filtro de ar primário para motores pesados',
    purpose: 'Os elementos de ar primário são a principal barreira contra a contaminação que protege a câmara de combustão da ingestão de partículas.',
    engineering: 'O meio de densidade progressiva MACROCORE™ distribui a carga de contaminantes por toda a profundidade do meio, equilibrando eficiência, capacidade e restrição.',
  },
  'secondary-air': {
    name: 'Elementos de ar secundário / de segurança',
    seoTitle: 'Elementos de filtro de ar secundário e de segurança',
    purpose: 'Os elementos de ar secundário e de segurança formam a barreira de proteção final a jusante do elemento primário quando ele está danificado, sobrecarregado, mal assentado ou removido durante a manutenção.',
    engineering: 'O meio de segurança de fibra fina oferece redundância de proteção, e não carga rotineira de poeira. Esta família única substitui a antiga listagem duplicada de Elementos de Segurança.',
  },
  'air-cleaner-housings': {
    name: 'Carcaças de filtro de ar',
    seoTitle: 'Carcaças de filtro de ar para linha pesada',
    purpose: 'As carcaças de filtro de ar fornecem o invólucro estrutural e a interface de vedação para os elementos de ar primário e secundário.',
    engineering: 'A arquitetura de carcaça INTEKCORE™ controla a geometria de vedação, a integridade estrutural, o trajeto do fluxo de ar e a proteção contra bypass na interface entre elemento e carcaça.',
  },
  'primary-fuel': {
    name: 'Combustível primário',
    seoTitle: 'Filtros de combustível diesel primários',
    purpose: 'Os filtros de combustível primários retêm sedimentos, ferrugem e contaminação grossa por partículas antes que o combustível chegue ao estágio de filtração final e ao circuito de injeção.',
    engineering: 'O meio SYNTAPORE™ oferece retenção de partículas em estágios, de acordo com os requisitos de limpeza do sistema de combustível e as condições de serviço.',
  },
  'secondary-fuel': {
    name: 'Combustível secundário',
    seoTitle: 'Filtros de combustível diesel secundários',
    purpose: 'Os filtros de combustível secundários fazem o controle final de partículas imediatamente a montante da bomba de alta pressão e dos injetores.',
    engineering: 'A filtração fina SYNTAPORE™ controla a população crítica de partículas que ameaça as folgas de precisão da injeção.',
  },
  'fuel-water-separators': {
    name: 'Separadores de água e combustível',
    seoTitle: 'Filtros separadores de água para diesel',
    purpose: 'Os separadores de água e combustível removem a água livre e emulsionada e apoiam o controle de partículas nos sistemas de combustível diesel.',
    engineering: 'O HYDROCORE™ combina separação em estágios, coalescência de gotas, coleta de água e uma barreira hidrofóbica final para aplicações padrão de separadores de água e combustível spin-on e de cartucho, não tipo turbina.',
  },
  'oil-filters': {
    name: 'Filtros de óleo',
    seoTitle: 'Filtros de óleo de motor para linha pesada e leve',
    purpose: 'Os filtros de óleo controlam aglomerados de fuligem, partículas de desgaste e subprodutos de oxidação antes que o lubrificante retorne às interfaces críticas.',
    engineering: 'O meio composto de fluxo total SYNTRAX™ equilibra eficiência, capacidade de retenção, perda de carga e integridade das válvulas ao longo do intervalo de troca.',
  },
  'hydraulic-filters': {
    name: 'Filtros hidráulicos',
    seoTitle: 'Filtros hidráulicos para máquinas pesadas',
    purpose: 'Os filtros hidráulicos mantêm a limpeza do fluido de acordo com as tolerâncias de bombas, válvulas, atuadores e servocontroles.',
    engineering: 'O NANOFORCE™ utiliza meios com classificação Beta e construção resistente ao colapso, adequados à vazão, à pressão, ao tamanho de partícula e ao ciclo de trabalho.',
  },
  'coolant-filters': {
    name: 'Filtros de líquido de arrefecimento',
    seoTitle: 'Filtros de líquido de arrefecimento para linha pesada',
    purpose: 'Os filtros de líquido de arrefecimento controlam produtos de corrosão e incrustações e apoiam a condição dos aditivos do líquido de arrefecimento em circuitos de arrefecimento de linha pesada.',
    engineering: 'O THERMACORE™ combina liberação controlada de aditivos com retenção de partículas para proteger camisas, vedações, galerias e superfícies de troca térmica.',
  },
  'cabin-filters': {
    name: 'Filtros de cabine',
    seoTitle: 'Filtros de ar de cabine para caminhões e equipamentos',
    purpose: 'Os filtros de cabine protegem o ar do operador e dos passageiros contra partículas, alérgenos, odores e determinados contaminantes gasosos.',
    engineering: 'O MICROKAPPA™ combina captura mecânica e eletrostática de partículas com camadas de adsorção quando a aplicação exige.',
  },
  'fuel-turbine': {
    name: 'Separação de combustível tipo turbina',
    seoTitle: 'Separadores de água de combustível tipo turbina (FH / FG)',
    purpose: 'Carcaças de separação de combustível Turbine Series FH e FG e seus elementos de reposição dedicados para a arquitetura aprovada de separação de água e combustível tipo turbina.',
    engineering: 'O TURBOCORE™ governa exclusivamente a arquitetura de carcaça e elemento tipo turbina FH/FG. A família do elemento e o grau de mícrons são selecionados separadamente: 2010 = série 500, 2020 = série 1000 e 2040 = série 900. Cada família pode usar graus de 2, 10 ou 30 µm quando aprovados; 2 µm é filtração final, 10 µm filtração secundária e 30 µm filtração primária. Os sufixos históricos SM/TM/PM correspondem a 2/10/30 µm. O número 2010/2020/2040 nunca define sozinho o grau de mícrons. O HYDROCORE™ fica reservado aos separadores de água e combustível padrão, não tipo turbina.',
  },
  'air-dryer-filters': {
    name: 'Filtros secadores de ar',
    seoTitle: 'Cartuchos secadores de ar para freios',
    purpose: 'Os elementos secadores de ar removem o vapor de água dos sistemas pneumáticos de freio e de ar de instrumentos.',
    engineering: 'O dessecante de peneira molecular DRYCORE™ adsorve o vapor de água para proteger válvulas, atuadores e controles pneumáticos contra corrosão e congelamento.',
  },
};

export const TECHNOLOGY_PT: Record<string, TechnologyEs> = {
  macrocore: {
    engineeringPrinciple: 'A configuração do meio, a integridade da vedação e o gerenciamento do fluxo de ar atuam em conjunto para controlar a contaminação transportada pelo ar antes que ela chegue ao motor.',
    operationalImpact: 'O controle da contaminação na admissão ajuda a proteger cilindros, anéis de pistão, turbocompressores e o desempenho do sistema de combustão.',
    controlStrategy: 'Adequar a configuração do meio, a geometria de vedação, os limites de restrição e o intervalo de troca ao ciclo de trabalho da admissão e à carga de contaminação.',
    definition: 'Uma arquitetura de filtração de ar do motor para a proteção primária e secundária da admissão.',
  },
  intekcore: {
    engineeringPrinciple: 'A geometria da carcaça, a integridade estrutural, a retenção do elemento e a carga da vedação preservam o limite protegido da admissão.',
    operationalImpact: 'Vedação e gerenciamento do fluxo de ar confiáveis reduzem a entrada de ar não filtrado e apoiam o desempenho do sistema de admissão.',
    controlStrategy: 'Validar o dimensionamento da carcaça, o trajeto de entrada, a restrição, o encaixe do elemento e a vedação no ciclo de trabalho previsto.',
    definition: 'Uma arquitetura de carcaça de filtro de ar e vedação para fluxo de ar controlado e prevenção de bypass.',
  },
  syntapore: {
    engineeringPrinciple: 'A filtração de combustível é feita em estágios para controlar a contaminação por partículas antes que ela chegue às bombas e aos injetores.',
    operationalImpact: 'Um combustível mais limpo ajuda a manter a confiabilidade do sistema de combustível e a proteção dos componentes de precisão.',
    controlStrategy: 'Aplicar a eficiência, a capacidade, a vazão e a perda de carga exigidas em cada estágio aprovado de filtração de combustível.',
    definition: 'Uma arquitetura de filtração de partículas do combustível diesel para aplicações de filtros de combustível primários, secundários e de cartucho.',
  },
  hydrocore: {
    engineeringPrinciple: 'O comportamento de separação e coalescência é adequado à configuração aprovada de separador padrão, sem estender o escopo do HYDROCORE aos sistemas tipo turbina FH ou FG.',
    operationalImpact: 'A separação controlada da água ajuda a reduzir o arraste de água para os componentes do sistema de combustível a jusante.',
    controlStrategy: 'Adequar o elemento separador, a vazão exigida, a configuração de gerenciamento da água e a condição de serviço à aplicação aprovada não tipo turbina.',
    definition: 'Uma arquitetura de separação de água e combustível para filtros separadores padrão aprovados, não tipo turbina, incluindo as configurações com dreno e com copo transparente.',
  },
  syntrax: {
    engineeringPrinciple: 'O desempenho de filtração, a capacidade de retenção, a perda de carga e a integridade das válvulas são equilibrados ao longo do intervalo de troca do lubrificante.',
    operationalImpact: 'Um lubrificante mais limpo ajuda a proteger mancais, munhões e outros componentes lubrificados.',
    controlStrategy: 'Adequar o desempenho de filtração e o intervalo de troca à severidade do motor e à condição do lubrificante.',
    definition: 'Uma arquitetura de filtração da lubrificação para controlar partículas de desgaste e a contaminação do lubrificante.',
  },
  nanoforce: {
    engineeringPrinciple: 'O meio e a construção do elemento são adequados à vazão, à pressão, ao tamanho de partícula, à temperatura e ao ciclo de trabalho.',
    operationalImpact: 'O controle da limpeza do fluido ajuda a reduzir o desgaste, o travamento de válvulas e a perda de precisão hidráulica.',
    controlStrategy: 'Definir as metas de limpeza a partir do componente hidráulico mais sensível e validar a seleção do filtro conforme os requisitos aplicáveis.',
    definition: 'Uma arquitetura de filtração hidráulica para o controle da contaminação em sistemas de potência fluida.',
  },
  thermacore: {
    engineeringPrinciple: 'A filtração do líquido de arrefecimento apoia a limpeza de galerias, vedações e superfícies de troca térmica dentro da estratégia aprovada de manutenção do sistema de arrefecimento.',
    operationalImpact: 'Uma condição estável do líquido de arrefecimento ajuda a proteger os componentes do sistema de arrefecimento e o desempenho térmico.',
    controlStrategy: 'Adequar a química do filtro, a capacidade, a vazão e o intervalo de troca aos requisitos do motor e do líquido de arrefecimento.',
    definition: 'Uma arquitetura de proteção do sistema de arrefecimento para a limpeza do líquido de arrefecimento e a proteção dos componentes.',
  },
  microkappa: {
    engineeringPrinciple: 'A filtração da cabine é selecionada de acordo com a exposição do operador, a demanda de fluxo de ar e os limites de perda de carga do sistema de climatização.',
    operationalImpact: 'Uma melhor qualidade do ar da cabine favorece o conforto do operador e a operação contínua do equipamento.',
    controlStrategy: 'Adequar a configuração do meio ao ambiente de operação e ao requisito de proteção do ar da cabine.',
    definition: 'Uma arquitetura de proteção do ar da cabine para o controle de partículas e de determinados contaminantes gasosos.',
  },
  turbocore: {
    engineeringPrinciple: 'A geometria da carcaça, a separação em estágios, a retenção do elemento, a vedação e o trajeto do fluxo funcionam como uma única arquitetura de separação de água e combustível específica para turbina. A família do elemento e o grau de filtração são variáveis de seleção independentes: 2010 atende à arquitetura série 500, 2020 à série 1000 e 2040 à série 900; cada família pode ser especificada em graus de 2, 10 ou 30 µm quando aprovados.',
    operationalImpact: 'Manter tanto a família de elemento correta para a turbina quanto o grau de mícrons correto apoia a função de separação em estágios prevista e reduz os riscos de bypass, vedação, montagem e seleção de estágio incorreto.',
    controlStrategy: 'Primeiro, associar a carcaça FH ou FG aprovada à família de elemento correta (2010, 2020 ou 2040). Depois, selecionar de forma independente o grau de filtração aprovado: 2 µm final, 10 µm secundária ou 30 µm primária. Os sufixos históricos SM/TM/PM correspondem a 2/10/30 µm, respectivamente. Não deduzir o grau de mícrons a partir do número de família 2010/2020/2040 nem substituir por elementos de separadores padrão não tipo turbina.',
    definition: 'Uma arquitetura de separação de água e combustível tipo turbina, reservada exclusivamente aos sistemas aprovados das séries FH e FG e aos seus elementos de reposição dedicados.',
  },
  drycore: {
    engineeringPrinciple: 'O meio do secador de ar remove a umidade do ar comprimido antes que a condensação afete os componentes pneumáticos.',
    operationalImpact: 'O ar comprimido seco ajuda a proteger válvulas, atuadores e a confiabilidade do sistema de freios.',
    controlStrategy: 'Adequar a capacidade, o comportamento de purga, o fluxo de ar e o intervalo de troca à severidade do compressor e à exposição à umidade ambiente.',
    definition: 'Uma arquitetura de filtração para secadores de ar que controla a umidade em sistemas pneumáticos de freio.',
  },
};

export const SYSTEM_PT: Record<string, SystemEs> = {
  'air-intake': {
    name: 'Proteção da admissão e do fluxo de ar',
    engineeringPrinciple: 'A densidade progressiva do meio, a vedação controlada, a captura eletrostática, a adsorção e a secagem com dessecante são aplicadas de acordo com o trajeto de ar protegido. Cada família atende a um limite de contaminação diferente e faz parte de uma única arquitetura de proteção do fluxo de ar.',
    overview: 'A proteção da admissão e do fluxo de ar é a primeira camada de defesa de qualquer estratégia de controle de contaminação. Ela reúne a filtração de ar do motor, a proteção secundária de segurança, a qualidade do ar da cabine do operador, as carcaças de filtro de ar e os elementos secadores de ar em um único domínio coordenado de proteção do fluxo de ar.',
  },
  'fuel-cleanliness': {
    name: 'Proteção da limpeza do combustível',
    engineeringPrinciple: 'O SYNTAPORE™ controla a contaminação por partículas. O HYDROCORE™ governa as aplicações padrão de separadores de água e combustível spin-on e de cartucho, não tipo turbina, enquanto o TURBOCORE™ governa as carcaças de separação de água e combustível tipo turbina FH/FG aplicáveis e suas configurações de reposição dedicadas das séries 2010/2020/2040.',
    overview: 'A proteção da limpeza do combustível defende os sistemas de injeção de alta pressão ao controlar a contaminação por partículas e a água antes que o combustível chegue às bombas e aos injetores de precisão.',
  },
  lubrication: {
    name: 'Proteção da lubrificação',
    engineeringPrinciple: 'O meio composto de fluxo total equilibra eficiência, capacidade de retenção, perda de carga e integridade das válvulas diante de variações de viscosidade e temperatura.',
    overview: 'A proteção da lubrificação controla fuligem, partículas de desgaste e subprodutos de oxidação antes que o óleo retorne aos mancais críticos e às interfaces lubrificadas.',
  },
  hydraulic: {
    name: 'Proteção hidráulica',
    engineeringPrinciple: 'O meio com classificação Beta, a construção resistente ao colapso e a estabilidade térmica são adequados à vazão, à pressão, ao tamanho crítico de partícula e ao ciclo de trabalho.',
    overview: 'A proteção hidráulica mantém a limpeza do fluido de acordo com as tolerâncias de bombas, válvulas, atuadores e servocontroles.',
  },
  'cooling-system': {
    name: 'Proteção do sistema de arrefecimento',
    engineeringPrinciple: 'A liberação controlada de aditivos e a retenção de partículas protegem camisas úmidas, superfícies de troca térmica, vedações e galerias de líquido de arrefecimento ao longo do intervalo de troca.',
    overview: 'A proteção do sistema de arrefecimento controla produtos de corrosão, resíduos de incrustação e a condição dos aditivos do líquido de arrefecimento em circuitos de arrefecimento de motores de linha pesada.',
  },
};

export const FAILURE_PT: Record<string, FailureEs> = {
  'particle-wear': {
    name: 'Desgaste por partículas',
    mechanism: 'As partículas cortam, desgastam, marcam ou iniciam fadiga nas superfícies dos componentes quando seu tamanho, dureza e concentração excedem a tolerância de folga da interface protegida.',
    operationalImpact: 'O resultado é perda progressiva de vedação, menor eficiência, aumento de folgas, controle instável e menor vida útil dos componentes.',
  },
  'diesel-water': {
    name: 'Contaminação do diesel por água',
    mechanism: 'A água favorece a corrosão, reduz a lubricidade, propicia o crescimento microbiano e gera risco de erosão ou travamento nos componentes de injeção de alta pressão.',
    operationalImpact: 'A qualidade do combustível se degrada, os injetores perdem precisão de dosagem, a qualidade da combustão diminui e aumenta a probabilidade de falha de bombas e injetores.',
  },
  'hydraulic-system': {
    name: 'Contaminação do sistema hidráulico',
    mechanism: 'As partículas circulam por bombas, válvulas, atuadores e servocontroles, onde causam abrasão, fadiga superficial, travamento e desgaste acelerado das vedações.',
    operationalImpact: 'A contaminação progressiva aumenta os vazamentos, reduz a precisão de controle, eleva a geração de calor e aumenta a exposição a falhas de bombas, válvulas e atuadores.',
  },
};

export const PROTECTED_COMPONENTS_PT: Record<string, readonly string[]> = {
  macrocore: ['Cilindros', 'Anéis de pistão', 'Turbocompressores', 'Trajeto do ar de combustão'],
  microkappa: ['Ambiente do operador', 'Trajeto de ar da climatização', 'Qualidade do ar da cabine'],
  intekcore: ['Vedação entre elemento e carcaça', 'Limite da admissão', 'Trajeto do fluxo de ar', 'Interface de retenção do filtro'],
  drycore: ['Válvulas pneumáticas', 'Atuadores', 'Circuito de ar dos freios', 'Controles de ar comprimido'],
  syntapore: ['Bomba de combustível de alta pressão', 'Injetores', 'Componentes de dosagem de combustível', 'Circuito de injeção'],
  hydrocore: ['Trajeto de transferência de combustível', 'Componentes de combustível sensíveis à água', 'Alimentação do sistema de injeção'],
  turbocore: ['Carcaça de turbina FH/FG', 'Elemento separador dedicado', 'Conjunto de copo e dreno', 'Alimentação do sistema de combustível a jusante'],
  syntrax: ['Mancais', 'Munhões', 'Interfaces lubrificadas', 'Circuito de óleo do motor'],
  nanoforce: ['Bombas hidráulicas', 'Válvulas de controle', 'Atuadores', 'Servocontroles'],
  thermacore: ['Galerias de líquido de arrefecimento', 'Vedações', 'Camisas úmidas', 'Superfícies de troca térmica'],
};

export const FIELD_QUESTIONS_PT: Record<string, readonly string[]> = {
  'primary-air': ['Qual é a carga de poeira ambiente?', 'Qual limite de restrição se aplica à admissão?', 'Como a vedação é verificada após a manutenção?', 'Qual ciclo de trabalho determina a frequência de inspeção?'],
  'secondary-air': ['O elemento de segurança é usado como barreira final, e não como elemento de carga rotineira de poeira?', 'A manutenção do elemento primário é feita sem contaminar o lado limpo?', 'O assentamento do elemento é verificado antes de religar?', 'A carcaça foi inspecionada em busca de caminhos de bypass?'],
  'air-cleaner-housings': ['A carcaça está corretamente dimensionada para o fluxo de ar exigido?', 'O trajeto de entrada e a restrição são aceitáveis?', 'O elemento assenta de maneira uniforme contra a vedação?', 'Abraçadeiras, tampas e interfaces estão estruturalmente íntegras?'],
  'primary-fuel': ['Que contaminação entra pelo armazenamento e pela transferência?', 'Quais limites de vazão e perda de carga se aplicam?', 'Também há água no suprimento de combustível?', 'Qual estágio de filtração a jusante deve ser protegido?'],
  'secondary-fuel': ['Qual nível de limpeza é exigido a montante do circuito de injeção?', 'Quais limites de vazão e perda de carga se aplicam na filtração final?', 'A separação de água a montante é eficaz?', 'As práticas de manutenção evitam a contaminação do lado limpo?'],
  'fuel-water-separators': ['A contaminação é água livre, água emulsionada, partículas ou uma combinação?', 'Qual vazão de combustível o separador deve suportar?', 'Como a água coletada é inspecionada e drenada?', 'A orientação de instalação e o acesso para manutenção estão corretos?'],
  'fuel-turbine': ['Qual carcaça FH ou FG aprovada está instalada?', 'Qual configuração de reposição dedicada das séries 2010, 2020 ou 2040 se aplica?', 'Qual vazão de combustível, disposição de portas e condição de serviço o sistema tipo turbina deve suportar?', 'O copo, o dreno, as vedações e a orientação do elemento foram verificados para a carcaça aprovada?'],
  'oil-filters': ['Qual severidade do motor e condição do óleo definem o intervalo de troca?', 'Qual faixa de viscosidade e vazão deve ser suportada?', 'Que carga de contaminantes é esperada?', 'As funções de bypass e antidrenagem são adequadas à aplicação?'],
  'hydraulic-filters': ['Qual componente tem a folga mais estreita?', 'Qual meta de limpeza se aplica ao circuito?', 'Quais são a vazão, a pressão e a temperatura do sistema?', 'Que resistência ao colapso e ciclo de trabalho são exigidos?'],
  'coolant-filters': ['Qual química de líquido de arrefecimento é aprovada para o motor?', 'Que contaminação ou produtos de corrosão estão presentes?', 'Qual vazão e capacidade são exigidas?', 'Como o filtro se encaixa na estratégia de manutenção do sistema de arrefecimento?'],
  'cabin-filters': ['Quais contaminantes estão presentes no ambiente do operador?', 'Quais limites de fluxo de ar e perda de carga da climatização se aplicam?', 'É necessário um meio só para partículas ou com adsorção?', 'Com que frequência o ambiente de operação justifica uma inspeção?'],
  'air-dryer-filters': ['Qual é o ciclo de trabalho do compressor?', 'Que exposição à umidade ambiente é esperada?', 'A purga está funcionando corretamente?', 'Qual intervalo de troca corresponde à severidade pneumática?'],
};

export const SERVICE_DISCIPLINE_PT: Record<string, readonly string[]> = {
  macrocore: ['Inspecionar todo o limite da admissão, não apenas o elemento.', 'Manter o lado limpo protegido durante a remoção do elemento.', 'Verificar o assentamento do elemento e o contato da vedação antes de devolver o ativo à operação.'],
  microkappa: ['Inspecionar o desempenho do fluxo de ar junto com a condição do meio.', 'Usar a configuração de meio exigida pelo ambiente de operação.', 'Evitar introduzir resíduos no lado limpo da climatização durante a troca.'],
  intekcore: ['Inspecionar a geometria da carcaça, as tampas, as abraçadeiras e as superfícies de vedação.', 'Corrigir qualquer caminho de bypass antes de instalar um elemento novo.', 'Confirmar o trajeto de entrada e a retenção do elemento após a manutenção.'],
  drycore: ['Tratar o controle de umidade como uma função de confiabilidade do sistema pneumático.', 'Confirmar o comportamento de purga e a severidade do compressor quando a vida útil parecer anormal.', 'Inspecionar evidências de umidade a jusante em vez de trocar o elemento de forma isolada.'],
  syntapore: ['Proteger o lado limpo do circuito de combustível durante a manutenção.', 'Investigar a contaminação do armazenamento ou da transferência quando os filtros saturarem anormalmente rápido.', 'Verificar todo o trajeto de filtração em estágios em vez de tratar um único elemento como o sistema inteiro.'],
  hydrocore: ['Drenar a água coletada de acordo com as condições de operação.', 'Inspecionar as vedações, o estado do copo e a orientação de instalação.', 'Investigar a fonte de combustível a montante quando a carga de água se tornar recorrente.'],
  turbocore: ['Fazer a manutenção da carcaça FH/FG e do seu elemento dedicado como uma única arquitetura aprovada específica para turbina.', 'Verificar o copo, o dreno, as vedações, a orientação do elemento e o trajeto do fluxo antes de devolver o sistema à operação.', 'Não substituir por elementos de separadores padrão não tipo turbina com base apenas em dimensões ou aparência.'],
  syntrax: ['Avaliar a condição do filtro junto com a condição do lubrificante e a severidade do motor.', 'Evitar a entrada de contaminação durante a troca de filtro e óleo.', 'Investigar uma carga anormal de resíduos como possível indicador de desgaste de componentes.'],
  nanoforce: ['Definir a meta de filtração a partir do componente mais sensível à contaminação.', 'Controlar a contaminação introduzida durante a manutenção de mangueiras, cilindros e reservatórios.', 'Investigar pressão diferencial ou carga de resíduos anormais antes de simplesmente encurtar os intervalos.'],
  thermacore: ['Manter a seleção do filtro alinhada com a química de líquido de arrefecimento aprovada.', 'Inspecionar a condição do líquido de arrefecimento e as fontes de contaminação quando a carga for anormal.', 'Tratar a filtração como parte da estratégia completa de manutenção do sistema de arrefecimento.'],
};

export const INDUSTRY_PT: Record<string, string> = {
  mining: 'Mineração',
  agriculture: 'Agricultura',
  construction: 'Construção',
  'trucks-fleets': 'Frotas de caminhões',
  'power-generation': 'Geração de energia',
  marine: 'Setor marítimo',
  'oil-gas': 'Petróleo e gás',
  railway: 'Ferroviário',
  'bus-coach': 'Ônibus e rodoviário',
  manufacturing: 'Manufatura',
  'waste-municipal': 'Resíduos e serviços municipais',
  automotive: 'Automotivo',
};
