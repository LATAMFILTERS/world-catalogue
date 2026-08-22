import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const industryRoot = path.join(root, 'frontend', 'out', 'industries');

function escapeHtml(value) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function updateAgriculture() {
  const file = path.join(industryRoot, 'agriculture', 'index.html');
  if (!fs.existsSync(file)) throw new Error('Agriculture industry output is missing');
  let html = fs.readFileSync(file, 'utf8');

  if (!html.includes('data-agriculture-direct-answer="true"')) {
    const direct = 'Agriculture filtration and asset protection controls contamination across the air intake, fuel, lubrication and hydraulic systems that support tractors, combines, harvesters and field equipment through dust, crop residue, heat and compressed seasonal operating windows.';
    const pattern = /(<h1\b[^>]*>[\s\S]*?<\/h1>[\s\S]*?<p\b)([^>]*>)([\s\S]*?)(<\/p>)/i;
    const match = html.match(pattern);
    if (!match) throw new Error('Agriculture opening paragraph could not be located');
    const attrs = match[2].replace(/>$/, ' data-agriculture-direct-answer="true">');
    const replacement = `${match[1]}${attrs}${escapeHtml(direct)} ${match[3]}${match[4]}`;
    html = html.replace(pattern, replacement);
  }

  fs.writeFileSync(file, html);
}

function updateMining() {
  const file = path.join(industryRoot, 'mining', 'index.html');
  if (!fs.existsSync(file)) throw new Error('Mining industry output is missing');
  let html = fs.readFileSync(file, 'utf8');

  if (!html.includes('data-mining-depth-final="true"')) {
    const section = `<section data-mining-depth-final="true" aria-label="Mining contamination-control verification">
<h2>Mining contamination-control verification</h2>
<p>Severe mining duty requires contamination evidence to be interpreted across the complete maintenance event. Before an interval or product choice is changed, teams should compare element condition with housing integrity, clean-side evidence, fuel and fluid handling, reservoir access, recent repairs and the machine's operating exposure. A filter that loads rapidly may be responding to unusually severe but legitimate service, or it may be revealing an upstream source such as damaged intake ducting, poor transfer cleanliness, open hydraulic service or recurring water ingress. Those conditions require different corrective actions.</p>
<p>Application review should also distinguish production assets by duty. Haulage, loading, drilling, excavation and support equipment can experience different airflow, vibration, hydraulic cycling, idle time and maintenance access even inside the same operation. The useful engineering question is therefore not whether one replacement interval can be imposed across the mine, but whether each protected system has a documented contamination boundary, suitable filtration function and service practice. That record gives maintenance teams a repeatable basis for investigating abnormal loading, confirming corrective work and preserving a consistent protection strategy across changing production conditions.</p>
</section>`;
    if (/<\/main>/i.test(html)) html = html.replace(/<\/main>/i, `${section}</main>`);
    else html = html.replace(/<\/body>/i, `${section}</body>`);
  }

  fs.writeFileSync(file, html);
}

updateAgriculture();
updateMining();
console.log('[close-industry-authority] PASS — Agriculture direct-answer alignment and Mining depth closed');
