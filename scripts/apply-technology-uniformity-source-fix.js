const fs = require('fs');
const path = require('path');

const filePath = path.join(
  __dirname,
  '..',
  'frontend',
  'src',
  'components',
  'TechDetailPage.tsx'
);

const marker = 'const engineeringPrinciples: TechStage[] = [';

try {
  let source = fs.readFileSync(filePath, 'utf8');

  if (!source.includes(marker)) {
    const insertion = [
      'export function TechDetailPage({ data }: Props) {',
      '  const title = cleanText(data.heroTitle);',
      '  const paragraphSplit = Math.max(1, Math.ceil(data.systemParagraphs.length / 2));',
      '  const systemParagraphs = [',
      "    data.systemParagraphs.slice(0, paragraphSplit).map(cleanText).join(' '),",
      "    data.systemParagraphs.slice(paragraphSplit).map(cleanText).join(' '),",
      '  ].filter(Boolean);',
      '  const industryContexts = [',
      "    { sector: 'AGRICULTURE', context: 'protects agricultural assets operating through dust, moisture and seasonal duty cycles.' },",
      "    { sector: 'AUTOMOTIVE', context: 'supports dependable protection for light-duty gasoline and diesel platforms.' },",
      "    { sector: 'AUTOBUSES Y TRANSPORTE', context: 'supports passenger fleets requiring reliability across intensive service schedules.' },",
      "    { sector: 'CONSTRUCTION', context: 'protects high-load equipment exposed to vibration, dust and continuous operation.' },",
      "    { sector: 'MANUFACTURING', context: 'supports industrial equipment requiring stable performance and controlled contamination.' },",
      "    { sector: 'MARINE', context: 'protects propulsion and auxiliary systems exposed to humidity, salt and continuous duty.' },",
      "    { sector: 'MINING', context: 'protects severe-duty equipment operating under abrasive contamination and sustained load.' },",
      "    { sector: 'OIL & GAS', context: 'supports upstream and downstream assets operating in demanding field environments.' },",
      "    { sector: 'POWER GENERATION', context: 'supports generator systems requiring dependable protection and maximum uptime.' },",
      "    { sector: 'RAILWAY', context: 'protects locomotive and rail assets operating through prolonged high-load cycles.' },",
      "    { sector: 'TRUCK FLEETS', context: 'supports heavy-duty fleets operating across extended service intervals.' },",
      "    { sector: 'WASTE MUNICIPAL', context: 'protects refuse fleets exposed to repetitive stop-and-go severe-duty operation.' },",
      '  ];',
      '  const uniformApplications: TechApplication[] = industryContexts.map((item) => ({',
      '    sector: item.sector,',
      '    detail: `${title} ${item.context}`,',
      '  }));',
      '  const engineeringPrinciples: TechStage[] = [',
      '    ...data.stages.map((stage) => ({',
      '      ...stage,',
      '      tag: cleanText(stage.tag),',
      '      title: cleanText(stage.title),',
      '      body: cleanText(stage.body),',
      '      stat: cleanText(stage.stat),',
      '      statLabel: cleanText(stage.statLabel),',
      '    })),',
      '    ...data.specs.map((spec, index) => ({',
      "      number: String(data.stages.length + index + 1).padStart(2, '0'),",
      "      tag: 'SYSTEM ATTRIBUTE',",
      '      title: cleanText(spec.label),',
      '      body: cleanText(spec.sub),',
      '      stat: cleanText(spec.value),',
      '      statLabel: cleanText(spec.sub),',
      '    })),',
      '  ];',
      '  const engineeringHeading = data.specs.length > 0',
      "    ? `${engineeringPrinciples.length} ENGINEERING PRINCIPLES FOR ${title} RELIABILITY.`",
      "    : (data.stagesHeading ? cleanText(data.stagesHeading) : 'ENGINEERING PRINCIPLES FOR SYSTEM RELIABILITY.');",
    ].join('\n');

    source = source.replace(
      "export function TechDetailPage({ data }: Props) {\n  const title = cleanText(data.heroTitle);",
      insertion
    );
  }

  source = source.replace(
    /\{data\.systemParagraphs\.map\(\(para, i\) => <p key=\{i\} style=\{bodyCopy\}>\{cleanText\(para\)\}<\/p>\)\}/,
    '{systemParagraphs.map((para, i) => <p key={i} style={bodyCopy}>{para}</p>)}'
  );

  source = source.replace(
    /<h2 style=\{sectionHeadline\}>\{data\.stagesHeading \? cleanText\(data\.stagesHeading\) : 'EACH LAYER STOPS WHAT THE PREVIOUS CANNOT\.'\}<\/h2>/,
    '<h2 style={sectionHeadline}>{engineeringHeading}</h2>'
  );

  source = source.replace(
    /<StagesAccordion stages=\{data\.stages\.map\(\(stage\) => \(\{ \.\.\.stage, tag: cleanText\(stage\.tag\), title: cleanText\(stage\.title\), body: cleanText\(stage\.body\), stat: cleanText\(stage\.stat\), statLabel: cleanText\(stage\.statLabel\) \}\)\)\} \/>/,
    '<StagesAccordion stages={engineeringPrinciples} />'
  );

  source = source.replace(
    /\n\s*\{data\.specs\.length > 0 && \([\s\S]*?\n\s*\)\}\n\n\s*\{data\.testimonial && \(/,
    '\n\n        {data.testimonial && ('
  );

  source = source.replace(
    /<StaggerContainer style=\{\{ display: 'grid', gridTemplateColumns: 'repeat\(auto-fit, minmax\(260px, 1fr\)\)', gap: '1rem', marginTop: '2rem' \}\}>/,
    '<StaggerContainer className="technology-applications-grid" style={{ display: \'grid\', gridTemplateColumns: \'repeat(4, minmax(0, 1fr))\', gap: \'1rem\', marginTop: \'2rem\' }}>'
  );

  source = source.replace(
    /\{data\.applications\.map\(\(app\) => \(/,
    '{uniformApplications.map((app) => ('
  );

  source = source.replace(
    /style=\{\{ background: '#000', border: '1px solid rgba\(255,255,255,0\.08\)', padding: '1\.75rem' \}\}/,
    "style={{ background: '#000', border: '1px solid rgba(255,255,255,0.08)', padding: '1.35rem', minHeight: '150px' }}"
  );

  source = source.replace(
    /fontSize: '0\.9rem', color: 'rgba\(255,255,255,0\.62\)', lineHeight: 1\.65/,
    "fontSize: '0.8rem', color: 'rgba(255,255,255,0.62)', lineHeight: 1.5"
  );

  source = source.replace(
    /\n\s*\.specs-grid \{[\s\S]*?\n\s*\}\n\s*\}\n\s*@media \(max-width: 480px\) \{[\s\S]*?\n\s*\}\n\s*\}/,
    ''
  );

  if (!source.includes('/* technology applications responsive matrix */')) {
    const responsiveCss = [
      '        /* technology applications responsive matrix */',
      '        .technology-applications-grid {',
      '          grid-template-columns: repeat(4, minmax(0, 1fr)) !important;',
      '        }',
      '        @media (max-width: 1100px) {',
      '          .technology-applications-grid {',
      '            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;',
      '          }',
      '        }',
      '        @media (max-width: 768px) {',
      '          .technology-applications-grid {',
      '            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;',
      '          }',
      '        }',
      '        @media (max-width: 480px) {',
      '          .technology-applications-grid {',
      '            grid-template-columns: 1fr !important;',
      '          }',
      '        }',
    ].join('\n');

    source = source.replace(
      '      `}</style>',
      `${responsiveCss}\n      \`}</style>`
    );
  }

  fs.writeFileSync(filePath, source, 'utf8');
  console.log('[technology-uniformity] applied before Next build: two-paragraph introductions, unified principles and 12-industry matrix');
} catch (error) {
  console.error('[technology-uniformity] failed:', error.message);
  process.exitCode = 1;
}
