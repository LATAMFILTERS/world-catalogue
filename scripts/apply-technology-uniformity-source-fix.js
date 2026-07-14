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
    /\n\s*\.specs-grid \{[\s\S]*?\n\s*\}\n\s*\}\n\s*@media \(max-width: 480px\) \{[\s\S]*?\n\s*\}\n\s*\}/,
    ''
  );

  fs.writeFileSync(filePath, source, 'utf8');
  console.log('[technology-uniformity] applied before Next build: specs merged into engineering principles, duplicate containers removed');
} catch (error) {
  console.error('[technology-uniformity] failed:', error.message);
  process.exitCode = 1;
}
