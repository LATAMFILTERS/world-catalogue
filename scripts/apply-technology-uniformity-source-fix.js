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
    source = source.replace(
      "export function TechDetailPage({ data }: Props) {\n  const title = cleanText(data.heroTitle);",
      `export function TechDetailPage({ data }: Props) {\n  const title = cleanText(data.heroTitle);\n  const engineeringPrinciples: TechStage[] = [\n    ...data.stages.map((stage) => ({\n      ...stage,\n      tag: cleanText(stage.tag),\n      title: cleanText(stage.title),\n      body: cleanText(stage.body),\n      stat: cleanText(stage.stat),\n      statLabel: cleanText(stage.statLabel),\n    })),\n    ...data.specs.map((spec, index) => ({\n      number: String(data.stages.length + index + 1).padStart(2, '0'),\n      tag: 'SYSTEM ATTRIBUTE',\n      title: cleanText(spec.label),\n      body: cleanText(spec.sub),\n      stat: cleanText(spec.value),\n      statLabel: cleanText(spec.sub),\n    })),\n  ];\n  const engineeringHeading = data.specs.length > 0\n    ? \\`${'${engineeringPrinciples.length}'} ENGINEERING PRINCIPLES FOR ${'${title}'} RELIABILITY.\\`\n    : (data.stagesHeading ? cleanText(data.stagesHeading) : 'ENGINEERING PRINCIPLES FOR SYSTEM RELIABILITY.');`
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
