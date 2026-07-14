const fs = require('fs');
const path = require('path');

const sourcePath = path.join(
  __dirname,
  '..',
  'frontend',
  'src',
  'app',
  'technologies',
  '[slug]',
  'techPagesData.ts'
);

const stagesReplacement = `    stagesHeading: 'SIX ENGINEERING PRINCIPLES FOR HOUSING RELIABILITY.',
    stages: [
      {
        number: '01',
        tag: 'PRINCIPLE 1',
        title: 'HD-GRADE STRUCTURAL CONSTRUCTION',
        body: 'INTEKCORE™ housing bodies use ductile iron or cast aluminum selected according to load, pressure, weight and corrosion exposure. Wall geometry distributes cold-start pressure spikes across the full housing structure instead of concentrating stress at the thread interface or bypass valve seat, preserving structural integrity in heavy-duty service.',
        stat: 'HD-GRADE',
        statLabel: 'Ductile iron or cast aluminum matched to load and corrosion profile',
      },
      {
        number: '02',
        tag: 'PRINCIPLE 2',
        title: 'PRECISION SEAL SYSTEM',
        body: 'Torque-tolerant O-ring groove geometry maintains seal compression across repeated installation and removal cycles. Seal compounds are matched to housing material, fluid chemistry and operating temperature so technician torque variation does not create hidden bypass paths.',
        stat: 'PRECISION',
        statLabel: 'Material-matched sealing geometry for full-cycle integrity',
      },
      {
        number: '03',
        tag: 'PRINCIPLE 3',
        title: 'INTEGRATED BYPASS VALVE',
        body: 'The bypass valve is factory-calibrated as part of the complete housing system. Opening pressure, valve seat geometry and spring response are matched to the housing material and rated circuit pressure, preventing unfiltered flow caused by mismatched replacement components.',
        stat: 'INTEGRATED',
        statLabel: 'Factory-calibrated to housing material and rated pressure',
      },
      {
        number: '04',
        tag: 'PRINCIPLE 4',
        title: 'OEM-FIT THREAD STANDARD',
        body: 'Thread geometry and mounting interfaces follow major truck and machinery platform specifications. Direct-fit compatibility preserves alignment, torque transfer and sealing surface engagement without adapter plates, fabrication or field modification.',
        stat: 'OEM-FIT',
        statLabel: 'Compatible with major truck and machinery thread specifications',
      },
      {
        number: '05',
        tag: 'PRINCIPLE 5',
        title: 'ANTI-CORROSION SURFACE TREATMENT',
        body: 'Corrosion-resistant surface treatment protects the housing against humidity cycling, salt, fertilizers, alkaline washdown chemicals and abrasive contamination. The treatment preserves thread condition, valve movement and seal-groove dimensions throughout the service life.',
        stat: 'ANTI-CORR',
        statLabel: 'Surface protection for chemical, salt and severe-duty exposure',
      },
      {
        number: '06',
        tag: 'PRINCIPLE 6',
        title: 'TOOL-FIT SERVICE ACCESS',
        body: 'Service interfaces are designed around standard workshop tooling and clear access geometry. Technicians can remove, inspect and reinstall the housing without special equipment, reducing service time while maintaining the specified installation torque and seal alignment.',
        stat: 'TOOL-FIT',
        statLabel: 'Standard service tooling with no special equipment required',
      },
    ],
    specs: [],`;

try {
  let source = fs.readFileSync(sourcePath, 'utf8');

  const intekcoreStart = source.indexOf('  intekcore: {');
  const intekcoreEnd = source.indexOf('\n  syntepore: {', intekcoreStart);

  if (intekcoreStart === -1 || intekcoreEnd === -1) {
    throw new Error('INTEKCORE block boundaries not found');
  }

  const block = source.slice(intekcoreStart, intekcoreEnd);
  const stagesPattern = /    stagesHeading:[\s\S]*?    specs: \[[\s\S]*?\n    \],/;

  if (!stagesPattern.test(block)) {
    throw new Error('INTEKCORE stages/specs block not found');
  }

  const updatedBlock = block.replace(stagesPattern, stagesReplacement);
  source = source.slice(0, intekcoreStart) + updatedBlock + source.slice(intekcoreEnd);

  fs.writeFileSync(sourcePath, source, 'utf8');
  console.log('[intekcore-source] applied before Next build: six principles enabled, repeated specs removed');
} catch (error) {
  console.error('[intekcore-source] failed:', error.message);
  process.exitCode = 1;
}
