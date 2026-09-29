for (const code of ['FF5776','FF2200']) {
  const u = 'https://www.fleetguard.com/product/' + code;
  const res = await fetch(u, { headers: { 'user-agent': 'Mozilla/5.0' } });
  const t = await res.text();
  const urls = [...t.matchAll(/https?:[^"'<> ]+?(?:jpg|jpeg|png|webp)/ig)].map(m => m[0]);
  console.log(JSON.stringify({
    code,
    status: res.status,
    html_length: t.length,
    has_code: t.toUpperCase().includes(code),
    matching_images: urls.filter(x => x.toUpperCase().includes(code) || x.toLowerCase().includes('widen')).slice(0,20)
  }, null, 2));
}
