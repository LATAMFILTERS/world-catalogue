// INTEKCORE™ housing + MACROCORE™ elements (status in ../status.json): an engine air cleaner in section.
//   dirty air in → housing (drawn cut away in front) → primary element (dust builds up on its pleats) → safety element → clean air out
//   the restriction indicator on the head rises with the dust load; at service the cover and the primary come off and the
//   safety element stays in place, keeping the clean side closed
// Built with the third-party "anatomy" kit (../.anatomy, pinned in ../README.md). Loads shown are illustrative, not product data.
// node build.mjs [--light] [--audit] [--lang es|en|pt] [--public]   (see pageTarget in ../common.mjs)
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { k, G, A, vertical, studio, shellCut, pleatedElement, PAGE_CSS, KIT_NOTICE, draftPage, pageTarget, readingSteps, readingHtml } from "../common.mjs";
import { kitScript } from "../.anatomy/scripts/inline-kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const TARGET = pageTarget(HERE, "air-intake");
const { lang: LANG, theme } = TARGET;
const WIDTH = 600;
const HEIGHT = 560;
const OUT = [0, 62, -46]; // the cover comes off forward and down
const DROP = 80; // then the primary slides straight down off the safety element

const PLATE = { x: -110, y: -78, w: 220, d: 170, r: 8 };
const WALL = { x: -102, y: -74, w: 204, d: 8, r: 2 };
const WALL_TOP = 286;
const WALL_FACE = WALL.y + WALL.d;
const PY = -24;
const HEAD_Z = 226;
const HEAD_H = 32;
const PORT_Z = HEAD_Z + 19; // ports high on the head, clear of the element below it on screen
const HR = 32; // housing radius
const PR = 25; // primary media radius (end caps 3 wider)
const SR = 14; // safety element radius
const LOW = 110; // bottom of the housing
const SAFE = 46; // the safety element starts this far above the bottom of the housing
const COVER_H = 9;

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -15, 0), ...k.boxCorners(WALL, 0, WALL_TOP), [-HR, PY + OUT[1] + HR, LOW - COVER_H - 4 + OUT[2]], [HR, PY + HR, LOW - DROP]],
  WIDTH,
  HEIGHT,
  { pad: 24, azimuth: 40 },
);
const SPRING = { stagger: 0.7, stiffness: 46, damping: 13.6, substeps: 4 };
const F = studio(P, { order: ["cover", "primary", "stand"], spring: SPRING, pieces: { cover: OUT, primary: [0, 0, -DROP], stand: [0, 0, 0] } });
const { S, L, put, line, fitting } = F;

F.plate(PLATE, { strip: { x: -62, y: PLATE.y + PLATE.d - 14, w: 124, d: 6, r: 1 }, label: { x: 60, y: 50, w: 30, d: 18, r: 1.5 } });
F.wall(WALL, WALL_TOP, [[-80, 60], [80, 60], [-80, 266], [80, 266]]);

const WORDS = {
  es: { inlet: "AIRE SUCIO", outlet: "AL MOTOR" },
  en: { inlet: "DIRTY AIR", outlet: "TO ENGINE" },
  pt: { inlet: "AR SUJO", outlet: "AO MOTOR" },
}[LANG];

// the head: housing top casting bolted to the wall, with the inlet, the outlet and the restriction indicator
const EARS = { x: -24, y: WALL_FACE, w: 48, d: 9, r: 2 };
const HEAD = { x: -40, y: EARS.y + EARS.d, w: 80, d: 2 * (PY - EARS.y - EARS.d), r: 10 };
put("ears", [0, EARS.y + EARS.d / 2, HEAD_Z + 6], S(k.slabOf(EARS, HEAD_Z - 8, 42, P, 3, 0.5), { tone: "mid" }), [A.slab(EARS, HEAD_Z - 8, 42, { name: "ears" })]);
const FRONT = HEAD.y + HEAD.d;
const headMark =
  k.faceTextSvg(k.sideMatrix([0, FRONT], HEAD_Z + 20.5, P, "left"), "ELIMFILTERS", { size: 3, tone: "hi", anchor: "middle" }) +
  k.faceTextSvg(k.sideMatrix([0, FRONT], HEAD_Z + 16.6, P, "left"), "INTEKCORE™ · EA2", { size: 2.2, tone: "mid", anchor: "middle" }) +
  k.faceTextSvg(k.sideMatrix([0, FRONT], HEAD_Z + 12.8, P, "left"), "MACROCORE™ · EA1", { size: 2.2, tone: "lo", anchor: "middle" });
put("head", [0, HEAD.y + HEAD.d / 2, HEAD_Z + HEAD_H / 2], S(k.slabOf(HEAD, HEAD_Z, HEAD_H, P, 10, 1), { tone: "mid", inner: L(k.sideSeam(HEAD, HEAD_Z + 7, P, 10), { tone: "faint" }) }) + headMark, [A.slab(HEAD, HEAD_Z, HEAD_H, { name: "head" })]);
// restriction indicator: a body with a window whose band shows the restriction, colour-coded by the page
const IND = [22, PY + 6];
put("indicator", [...IND, HEAD_Z + HEAD_H + 6], S(k.cylinder(...IND, 4.6, HEAD_Z + HEAD_H, 12, P, 28, 0.4), { tone: "mid" }) + `<path data-part="band" class="ai-band" d=""/>` + S(k.cylinder(...IND, 5.2, HEAD_Z + HEAD_H + 12, 2, P, 28, 0.4), { tone: "hi" }), [A.cylinder(...IND, 4.6, HEAD_Z + HEAD_H, 12, { name: "indicator" }), A.cylinder(...IND, 5.2, HEAD_Z + HEAD_H + 12, 2, { name: "indicator.cap" })]);

// big ducts: inlet from the left, outlet on the right, each to a bulkhead in the wall
const DUCT = { boss: 10.5, bossH: 4, hex: 8.4, hexH: 5 };
for (const dir of [-1, 1]) {
  const tip = dir * 40 + dir * fitting(dir < 0 ? "inlet.port" : "outlet.port", G.frameOf([dir * 40, PY, PORT_Z], [dir, 0, 0], [0, 1, 0], [0, 0, 1]), DUCT);
  const wx = dir * 78;
  const reach = fitting(dir < 0 ? "inlet.bulkhead" : "outlet.bulkhead", G.frameOf([wx, WALL_FACE, PORT_Z], [0, 1, 0], [1, 0, 0], [0, 0, 1]), { boss: 11, bossH: 4, hex: 9, hexH: 5 });
  line(dir < 0 ? "inlet" : "outlet", [[tip, PY, PORT_Z], [wx, PY, PORT_Z], [wx, WALL_FACE + reach, PORT_Z]], { r: 6, ball: 9 });
  // a small plaque on the wall above each duct names it
  const TAG = { x: wx - 15, y: WALL_FACE, w: 30, d: 0.8, r: 0.3 };
  put(dir < 0 ? "inlet.tag" : "outlet.tag", [wx, WALL_FACE + 0.4, PORT_Z + 22], S(k.slabOf(TAG, PORT_Z + 18, 8, P, 2), { tone: "mid", crease: "none" }) + k.faceTextSvg(k.sideMatrix([wx, WALL_FACE + 0.8], PORT_Z + 20.4, P, "left"), dir < 0 ? WORDS.inlet : WORDS.outlet, { size: 2.6, tone: "lo", anchor: "middle" }), [A.slab(TAG, PORT_Z + 18, 8, { name: dir < 0 ? "inlet.tag" : "outlet.tag" })]);
}

// the housing, cut away in front: only its back wall is drawn, recorded as staves around the far side
const away = (P.azimuth * Math.PI) / 180 + Math.PI;
const staves = Array.from({ length: 10 }, (_, i) => {
  const a = away + ((i + 0.5) / 10 - 0.5) * Math.PI * 0.9;
  // the staves stop just above the cover's rim, so the wall and the cover meet edge to edge rather than face to face
  const c = [Math.cos(a) * (HR - 1.5), PY + Math.sin(a) * (HR - 1.5), (LOW + 2 + HEAD_Z) / 2];
  return A.orientedBox(c, [[Math.cos(a), Math.sin(a), 0], [-Math.sin(a), Math.cos(a), 0], [0, 0, 1]], [1.5, HR * Math.sin((Math.PI * 0.9) / 20) + 0.5, (HEAD_Z - LOW - 2) / 2], { name: "housing", owner: "housing" });
});
put("housing", [Math.cos(away) * HR * 0.6, PY + Math.sin(away) * HR * 0.6, (LOW + HEAD_Z) / 2], shellCut(P, { y: PY, z0: LOW, z1: HEAD_Z, r: HR, part: "back" }) + L(k.cylinder(0, PY, HR, LOW, HEAD_Z - LOW, P, 72).outline, { tone: "mid" }), staves);

// the safety element: a plain inner element on the outlet side; it stays in place when the primary comes out
const SF = vertical(LOW + SAFE, 0, PY);
const safety = k.solidSvg(k.cylinder(0, PY, SR, LOW + SAFE, HEAD_Z - LOW - SAFE, P, 48), { tone: "mid", className: "ai-safety" }) + k.fadedSvg(G.ribsOf(SF, 1, HEAD_Z - LOW - SAFE - 2, SR + 0.01, 28, P, { fade: [0.15, 0.6] }), { tone: "faint" });
put("safety", [0, PY, (LOW + SAFE + HEAD_Z) / 2], safety, [A.cylinder(0, PY, SR, LOW + SAFE, HEAD_Z - LOW - SAFE, { name: "safety" })], { bias: -200 });

// the primary element: pleated media with its dust load, hanging from the head; it covers the safety element
const primary = pleatedElement(P, { y: PY, z0: LOW, z1: HEAD_Z, r: PR, flow: false }) + `<g data-part="dust" class="ai-dust"></g>`;
put("primary", [0, PY, (LOW + HEAD_Z) / 2], primary, [A.ring(vertical(LOW, 0, PY), 0, HEAD_Z - LOW, SR + 1.2, PR + 3, { name: "primary" })], { piece: "primary" });

// the cover closes the bottom of the housing and holds the primary up against the head
const coverProfile = [[0, 16], [COVER_H - 3, HR - 3, 1], [COVER_H, HR - 0.5]];
put("cover", [0, PY, LOW - COVER_H / 2], S(G.solidOf(coverProfile, vertical(LOW - COVER_H, 0, PY), P), { tone: "hi", inner: L(G.arcOf(vertical(LOW - COVER_H, 0, PY), COVER_H - 1.5, HR - 1.2, P, { trim: 0, least: 0 }), { tone: "faint" }) }), [A.solid(vertical(LOW - COVER_H, 0, PY), coverProfile, { name: "cover" })], { piece: "cover" });
put("cover.latch", [0, PY, LOW - COVER_H - 2], S(k.cylinder(0, PY, 6, LOW - COVER_H - 4, 4, P, 24, 0.5), { tone: "mid" }), [A.cylinder(0, PY, 6, LOW - COVER_H - 4, 4, { name: "cover.latch" })], { piece: "cover" });

const layers = F.render();
// the primary is a ring around the safety element and covers it whole, and the housing is only its back wall: both are
// painted behind what sits inside them (bias), so the solver's ring-around-rod cycles are excused for these pairs only;
// the cover meets the back wall edge to edge at its rim
A.auditOrExit(F.R, P, { allow: [["safety", "primary"], ["housing", "primary"], ["housing", "cover"]] });

const SIM = {
  es: "Simulación ilustrativa del funcionamiento: es una animación conceptual, no un modelo de ingeniería ni un resultado de prueba, y no muestra datos de producto.",
  en: "Illustrative simulation of how it works: a conceptual animation, not an engineering model or test result, and it shows no product data.",
  pt: "Simulação ilustrativa do funcionamento: é uma animação conceitual, não um modelo de engenharia nem um resultado de ensaio, e não mostra dados de produto.",
}[LANG];
const COPY = {
  es: {
    hint: "Cursor: polvo · arriba: servicio",
    readout: "restricción: baja",
    keys: [
      { mark: "lit", label: "Polvo retenido en el medio plisado del elemento primario" },
      { mark: "blue", label: "Indicador de restricción: sube a medida que el elemento se carga" },
      { mark: "raised", label: "Carcasa INTEKCORE (en corte), elemento primario y elemento de seguridad MACROCORE, tapa, ductos de entrada y salida" },
    ],
    caption: `Ilustración conceptual de un filtro de aire de motor: carcasa INTEKCORE™ con elementos MACROCORE™, vista en corte. El aire sucio entra a la carcasa y atraviesa el elemento primario, cuyo medio plisado retiene el polvo; luego pasa por el elemento de seguridad y sale limpio hacia el motor. A medida que el primario se carga, sube la restricción, y el indicador lo muestra: el servicio se decide por la restricción medida. En el servicio se retira la tapa y el elemento primario; el elemento de seguridad queda en su lugar y mantiene cerrado el lado limpio. La integridad de sellos, tapa y ductos es parte de la protección. ${SIM}`,
    aria: "Filtro de aire INTEKCORE y MACROCORE: flechas cambian el polvo en el aire, E hace el servicio",
    label: "Filtro de aire de motor en un soporte de pared, con la carcasa cortada al frente para ver los elementos: un elemento primario plisado que retiene el polvo y, dentro de él, un elemento de seguridad. Arriba, un cabezal con ducto de entrada, ducto de salida al motor e indicador de restricción. En el servicio salen la tapa y el primario; el de seguridad queda en su lugar.",
    title: "INTEKCORE y MACROCORE admisión de aire",
    live: { restriction: "restricción", low: "baja", mid: "media", high: "alta", out: "primario fuera · el de seguridad queda", fresh: "primario nuevo · restricción baja" },
  },
  en: {
    hint: "Cursor: dust · top: service",
    readout: "restriction: low",
    keys: [
      { mark: "lit", label: "Dust held on the primary element's pleated media" },
      { mark: "blue", label: "Restriction indicator: rises as the element loads" },
      { mark: "raised", label: "INTEKCORE housing (in section), MACROCORE primary and safety elements, cover, inlet and outlet ducts" },
    ],
    caption: `Conceptual illustration of an engine air cleaner: an INTEKCORE™ housing with MACROCORE™ elements, shown in section. Dirty air enters the housing and passes through the primary element, whose pleated media holds the dust; it then passes the safety element and leaves clean for the engine. As the primary loads, restriction rises and the indicator shows it: service is decided by measured restriction. At service the cover and the primary element come off; the safety element stays in place and keeps the clean side closed. Seal, cover and duct integrity are part of the protection. ${SIM}`,
    aria: "INTEKCORE and MACROCORE air cleaner: arrow keys change the dust in the air, E runs the service",
    label: "Engine air cleaner on a wall bracket, its housing cut away in front to show the elements: a pleated primary element that holds the dust and, inside it, a safety element. On top, a head with the inlet duct, the outlet duct to the engine and a restriction indicator. At service the cover and the primary come off; the safety element stays in place.",
    title: "INTEKCORE and MACROCORE air intake",
    live: { restriction: "restriction", low: "low", mid: "medium", high: "high", out: "primary out · safety stays", fresh: "new primary · restriction low" },
  },
  pt: {
    hint: "Cursor: poeira · topo: manutenção",
    readout: "restrição: baixa",
    keys: [
      { mark: "lit", label: "Poeira retida no meio plissado do elemento primário" },
      { mark: "blue", label: "Indicador de restrição: sobe à medida que o elemento se carrega" },
      { mark: "raised", label: "Carcaça INTEKCORE (em corte), elemento primário e elemento de segurança MACROCORE, tampa, dutos de entrada e saída" },
    ],
    caption: `Ilustração conceitual de um filtro de ar de motor: carcaça INTEKCORE™ com elementos MACROCORE™, vista em corte. O ar sujo entra na carcaça e atravessa o elemento primário, cujo meio plissado retém a poeira; depois passa pelo elemento de segurança e sai limpo para o motor. À medida que o primário se carrega, a restrição sobe e o indicador a mostra: a manutenção é decidida pela restrição medida. Na manutenção retiram-se a tampa e o elemento primário; o elemento de segurança fica no lugar e mantém fechado o lado limpo. A integridade de vedações, tampa e dutos faz parte da proteção. ${SIM}`,
    aria: "Filtro de ar INTEKCORE e MACROCORE: setas mudam a poeira no ar, E faz a manutenção",
    label: "Filtro de ar de motor em um suporte de parede, com a carcaça cortada na frente para mostrar os elementos: um elemento primário plissado que retém a poeira e, dentro dele, um elemento de segurança. Em cima, um cabeçote com duto de entrada, duto de saída para o motor e indicador de restrição. Na manutenção saem a tampa e o primário; o de segurança fica no lugar.",
    title: "INTEKCORE e MACROCORE admissão de ar",
    live: { restriction: "restrição", low: "baixa", mid: "média", high: "alta", out: "primário fora · o de segurança fica", fresh: "primário novo · restrição baixa" },
  },
}[LANG];

const live = `
const P = ${JSON.stringify(P)};
const W = ${JSON.stringify(COPY.live)};
const SV = ${JSON.stringify({ out: OUT, drop: [0, 0, -DROP], spring: SPRING, y: PY, z0: LOW + 8, z1: HEAD_Z - 6, r: PR, ind: IND, indZ: HEAD_Z + HEAD_H + 1, indH: 10 })};
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const readout = document.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
let seed = 19;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const VIEW = Math.atan2(Math.sin(P.azimuth * Math.PI / 180), Math.cos(P.azimuth * Math.PI / 180));
const dustGroup = svg.querySelector('[data-part="dust"]'), band = svg.querySelector('[data-part="band"]');
const pieces = { cover: { x: 0, v: 0, target: 0, at: 0, next: 0 }, primary: { x: 0, v: 0, target: 0, at: 0, next: 0 } };
for (const [name, part] of Object.entries(pieces)) part.groups = [...svg.querySelectorAll('[data-piece="' + name + '"]')];
// dust carried by the air settles on the front half of the primary's pleats
const dust = { stuck: [], moving: [], spawn: 0 };
let dirty = 0.5, dirtyTarget = 0.5, clock = 0, touring = true, idle = 0, frame = 0, last = 0, visible = false, fresh = 0;
function service(on) {
  const order = on ? ["cover", "primary"] : ["primary", "cover"];
  order.forEach((name, i) => { pieces[name].next = on ? 1 : 0; pieces[name].at = clock + (still.matches ? 0 : i * SV.spring.stagger); });
}
const load = () => Math.min(1, dust.stuck.length / 260);
function draw() {
  const dot = (p) => { const [x, y] = iso([Math.cos(p.a) * p.r, SV.y + Math.sin(p.a) * p.r, p.z], P); return '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + p.size + '"/>'; };
  dustGroup.innerHTML = dust.stuck.concat(dust.moving).map(dot).join("");
  for (const [name, part] of Object.entries(pieces)) {
    const shift = translateAlong(P, (name === "cover" ? SV.out : SV.drop).map((v) => v * part.x));
    const [dx, dy] = shift.match(/-?[\\d.]+/g).map(Number);
    for (const g of part.groups) { g.setAttribute("transform", shift); holdStill(g, [dx, dy]); }
  }
  const l = load();
  band.setAttribute("d", cylinder(SV.ind[0], SV.ind[1], 4.7, SV.indZ, 0.6 + l * SV.indH, P, 28).fill);
  band.setAttribute("data-level", l > 0.66 ? "high" : l > 0.33 ? "mid" : "low");
  const word = l > 0.66 ? W.high : l > 0.33 ? W.mid : W.low;
  const text = pieces.primary.x > 0.5 ? W.out : fresh > 0 ? W.fresh : W.restriction + ": " + word;
  if (readout.textContent !== text) readout.textContent = text;
  stage.setAttribute("aria-valuenow", String(Math.round(dirty * 100)));
  stage.setAttribute("aria-valuetext", text);
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  clock += dt;
  fresh = Math.max(0, fresh - dt);
  if (touring) dirtyTarget = 0.55 + 0.4 * Math.sin(clock * 0.3);
  dirty += (dirtyTarget - dirty) * (1 - Math.exp(-dt / 0.5));
  if (pieces.cover.x < 0.05 && pieces.primary.x < 0.05) {
    dust.spawn += dt * (0.6 + 8 * dirty);
    while (dust.spawn > 1) { dust.spawn -= 1; dust.moving.push({ a: VIEW + (rand() - 0.5) * 2.6, r: SV.r + 3.5, z: SV.z0 + rand() * (SV.z1 - SV.z0), size: rand() < 0.3 ? 0.9 : 0.55 }); }
    for (let i = dust.moving.length - 1; i >= 0; i--) { const p = dust.moving[i]; p.r -= dt * 4; if (p.r <= SV.r + 0.4) { dust.moving.splice(i, 1); if (dust.stuck.length < 260) dust.stuck.push(p); } }
  }
  for (const part of Object.values(pieces)) {
    if (part.target !== part.next && clock >= part.at) part.target = part.next;
    for (let i = 0; i < SV.spring.substeps; i++) { const h = dt / SV.spring.substeps; part.v += ((part.target - part.x) * SV.spring.stiffness - part.v * SV.spring.damping) * h; part.x += part.v * h; }
  }
  // a new primary goes in clean
  if (pieces.primary.x > 0.9 && dust.stuck.length) { dust.stuck = []; dust.moving = []; fresh = 2.5; }
  draw();
  frame = visible && !still.matches ? requestAnimationFrame(tick) : 0;
}
let serviced = false;
const run = () => { if (!frame && visible && !still.matches) { last = 0; frame = requestAnimationFrame(tick); } if (still.matches) { for (const part of Object.values(pieces)) part.x = part.target = part.next; draw(); } };
const steer = (next) => { touring = false; dirtyTarget = clamp(next, 0, 1); clearTimeout(idle); idle = setTimeout(() => { touring = true; }, 4000); run(); };
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
stage.addEventListener("pointermove", (event) => {
  const box = svg.getBoundingClientRect();
  const want = (event.clientY - box.top) / box.height < 0.25;
  if (want !== serviced) { serviced = want; service(want); }
  steer(((event.clientX - box.left) / box.width - 0.2) / 0.6);
});
stage.addEventListener("pointerleave", () => { if (serviced) { serviced = false; service(false); } run(); });
stage.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight" || event.key === "ArrowUp") steer(dirtyTarget + 0.1);
  else if (event.key === "ArrowLeft" || event.key === "ArrowDown") steer(dirtyTarget - 0.1);
  else if (event.key === "e" || event.key === "E") { serviced = !serviced; service(serviced); run(); }
  else return;
  event.preventDefault();
});
draw();
`;

const svg = k.figureSvg({ width: WIDTH, height: HEIGHT, label: COPY.label, body: layers });
const CSS = `<style>
.ai-dust circle{fill:color-mix(in srgb,#9a7b52 80%,var(--anatomy-hi))}
.ai-safety>.iso-fill,.ai-safety>.iso-top{fill:color-mix(in srgb,#c9a253 8%,var(--anatomy-paper))}
.ai-band{fill:#3f9a6a}.ai-band[data-level="mid"]{fill:#d9a23a}.ai-band[data-level="high"]{fill:#c8372d}
</style>`;
const body = PAGE_CSS + CSS + k.plateHtml({
  fig: "Fig 7",
  title: "ELIMFILTERS · INTEKCORE™ · MACROCORE™",
  hint: COPY.hint,
  readout: COPY.readout,
  keys: COPY.keys,
  caption: COPY.caption,
  body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="${COPY.aria}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50">${svg}</div>`,
}) + readingHtml(LANG, readingSteps("macrocore", "air-intake", LANG));

mkdirSync(TARGET.dir, { recursive: true });
writeFileSync(TARGET.path, draftPage(k.pageHtml({ title: COPY.title, theme, body, script: KIT_NOTICE + kitScript() + live }), LANG));
console.log("wrote", TARGET.file, F.R.items.length, "items");
