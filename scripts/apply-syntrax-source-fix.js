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

const industries = `
    applications: [
      { sector: 'AGRICULTURE', detail: 'Seasonal equipment exposed to moisture, oxidation and long storage periods.' },
      { sector: 'AUTOMOTIVE', detail: 'Light-duty gasoline and diesel engines requiring stable lubrication protection.' },
      { sector: 'BUS & COACH', detail: 'Passenger transport fleets requiring extended service intervals and dependable engine protection.' },
      { sector: 'CONSTRUCTION', detail: 'High-load equipment working continuously under severe vibration and airborne contaminants.' },
      { sector: 'MANUFACTURING', detail: 'Compressors, pumps and prime movers requiring precise lubrication control.' },
      { sector: 'MARINE', detail: 'Propulsion and auxiliary engines exposed to humidity, salt and continuous operation.' },
      { sector: 'MINING', detail: 'Heavy-duty engines operating in abrasive dust environments with extreme contamination loads.' },
      { sector: 'OIL & GAS', detail: 'Engines and auxiliary equipment operating across demanding upstream and downstream environments.' },
      { sector: 'POWER GENERATION', detail: 'Continuous-duty generator sets requiring stable lubricant cleanliness for maximum uptime.' },
      { sector: 'RAILWAY', detail: 'Locomotive diesel engines operating under prolonged high-load duty cycles.' },
      { sector: 'TRUCK FLEETS', detail: 'Long-haul diesel engines operating under high soot loads and extended oil drain intervals.' },
      { sector: 'WASTE MUNICIPAL', detail: 'Refuse fleets operating under repetitive stop-and-go severe-duty conditions.' },
    ],`;

try {
  let source = fs.readFileSync(sourcePath, 'utf8');

  const syntraxStart = source.indexOf('  syntrax: {');
  const syntraxEnd = source.indexOf('\n  nanoforce: {', syntraxStart);

  if (syntraxStart === -1 || syntraxEnd === -1) {
    throw new Error('SYNTRAX block not found');
  }

  let syntraxBlock = source.slice(syntraxStart, syntraxEnd);

  syntraxBlock = syntraxBlock.replace(
    /\n    specs: \[[\s\S]*?\n    \],\n    applicationsHeading:/,
    "\n    specs: [],\n    applicationsHeading:"
  );

  syntraxBlock = syntraxBlock.replace(
    /    applicationsSubtext: '[^']*',/,
    "    applicationsSubtext: 'Validated across every major engine application where lubricant cleanliness directly affects asset reliability.',"
  );

  syntraxBlock = syntraxBlock.replace(
    /\n    applications: \[[\s\S]*?\n    \],\n    testimonial:/,
    `${industries}\n    testimonial:`
  );

  source = source.slice(0, syntraxStart) + syntraxBlock + source.slice(syntraxEnd);
  fs.writeFileSync(sourcePath, source, 'utf8');

  console.log('[syntrax-source] applied before Next build: specs removed, 12 industries enabled');
} catch (error) {
  console.error('[syntrax-source] failed:', error.message);
  process.exitCode = 1;
}
