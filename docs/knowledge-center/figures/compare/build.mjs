// Spin-on vs cartridge (status in ../status.json): the two filter formats of one technology side by side.
//   left   spin-on: the whole can, element included, comes off and a new one goes on
//   right  cartridge: the bowl drops, the element stays on the head and is the only part replaced; the same bowl goes back
// Built with the third-party "anatomy" kit (../.anatomy, pinned in ../README.md). Loads shown are illustrative, not product data.
// node build.mjs --tech syntapore|syntrax|nanoforce [--lang es|en|pt] [--light] [--audit] [--public]
//   --public  write the page to frontend/public/knowledge-center/figures (compare-<tech>.html for en, -es / -pt otherwise)
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { k, G, A, vertical, studio, shellCut, pleatedElement, PAGE_CSS, KIT_NOTICE, draftPage } from "../common.mjs";
import { kitScript } from "../.anatomy/scripts/inline-kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const arg = (name, fallback) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : fallback; };
const theme = process.argv.includes("--light") ? "light" : "dark";
const LANG = arg("--lang", "es");
const PUBLIC = process.argv.includes("--public");

// technology identity (canonical registry names and prefixes, see CLAUDE.md)
const TECHS = {
  syntapore: { mark: "SYNTAPORE™ · EF9", fig: "Fig 3B", dirt: "#6b4f2e", fluid: { es: "combustible", en: "fuel", pt: "combustível" } },
  syntrax: { mark: "SYNTRAX™ · EL8", fig: "Fig 4B", dirt: "#2b2622", fluid: { es: "aceite", en: "oil", pt: "óleo" } },
  nanoforce: { mark: "NANOFORCE™ · EH6", fig: "Fig 5", dirt: "#4a4a52", fluid: { es: "fluido hidráulico", en: "hydraulic fluid", pt: "fluido hidráulico" } },
};
const TECH = arg("--tech", "syntapore");
const T = TECHS[TECH];
if (!T || !["es", "en", "pt"].includes(LANG)) throw new Error("usage: --tech syntapore|syntrax|nanoforce --lang es|en|pt");

const WIDTH = 640;
const HEIGHT = 520;
const SERVICE = [0, 70, 0]; // where the spin-on goes when it is changed
const DROP = 84; // how far the cartridge bowl drops to clear the element

const PLATE = { x: -150, y: -78, w: 300, d: 158, r: 8 };
const WALL = { x: -142, y: -74, w: 284, d: 8, r: 2 };
const WALL_TOP = 236;
const WALL_FACE = WALL.y + WALL.d;
const PY = -29;
const HEAD_Z = 170;
const HEAD_H = 20;
const PORT_Z = HEAD_Z + HEAD_H / 2;
const CAN_R = 24;
const ER = 17;
const LOW = 96; // bottom of the shells
const ST = HEAD_Z - 4;
const UNITS = [
  { name: "spinon", x: -72 },
  { name: "cartridge", x: 72 },
];

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -15, 0), ...k.boxCorners(WALL, 0, WALL_TOP), [-72 - CAN_R, PY + SERVICE[1] + CAN_R, LOW - 6], [72 + CAN_R, PY + CAN_R, LOW - DROP - 6]],
  WIDTH,
  HEIGHT,
  { pad: 24, azimuth: 40 },
);
const SPRING = { stagger: 0, stiffness: 46, damping: 13.6, substeps: 4 };
const F = studio(P, { order: ["spinon", "bowl", "stand"], spring: SPRING, pieces: { spinon: SERVICE, bowl: [0, 0, -DROP], stand: [0, 0, 0] } });
const { S, L, put, line, fitting } = F;

F.plate(PLATE, { strip: { x: -62, y: PLATE.y + PLATE.d - 14, w: 124, d: 6, r: 1 }, label: { x: 100, y: 40, w: 30, d: 18, r: 1.5 } });
F.wall(WALL, WALL_TOP, [[-115, 40], [115, 40], [0, 60], [0, 200]]);

const WORDS = {
  es: { spinon: "SPIN-ON", cartridge: "CARTUCHO" },
  en: { spinon: "SPIN-ON", cartridge: "CARTRIDGE" },
  pt: { spinon: "SPIN-ON", cartridge: "CARTUCHO" },
}[LANG];
const seam = [[0, CAN_R - 2.5], [1, CAN_R + 0.8], [3, CAN_R + 0.8], [4, CAN_R - 2.5]];
const endProfile = [[0, 13], [3, 21.5, 1], [6, CAN_R]];

for (const { name, x } of UNITS) {
  // head on the wall, ports to bulkheads in the wall
  const EARS = { x: x - 20, y: WALL_FACE, w: 40, d: 9, r: 2 };
  const HEAD = { x: x - 28, y: EARS.y + EARS.d, w: 56, d: 2 * (PY - EARS.y - EARS.d), r: 8 };
  put(`${name}.ears`, [x, EARS.y + EARS.d / 2, HEAD_Z + 4], S(k.slabOf(EARS, HEAD_Z - 10, 38, P, 3, 0.5), { tone: "mid" }), [A.slab(EARS, HEAD_Z - 10, 38, { name: `${name}.ears` })]);
  const FRONT = HEAD.y + HEAD.d;
  const headMark =
    k.faceTextSvg(k.sideMatrix([x, FRONT], HEAD_Z + 16.2, P, "left"), "ELIMFILTERS", { size: 2.8, tone: "hi", anchor: "middle" }) +
    k.faceTextSvg(k.sideMatrix([x, FRONT], HEAD_Z + 12.6, P, "left"), T.mark, { size: 2.1, tone: "mid", anchor: "middle" }) +
    k.faceTextSvg(k.sideMatrix([x, FRONT], HEAD_Z + 8.8, P, "left"), WORDS[name], { size: 1.9, tone: "lo", anchor: "middle" });
  put(`${name}.head`, [x, HEAD.y + HEAD.d / 2, HEAD_Z + HEAD_H / 2], S(k.slabOf(HEAD, HEAD_Z, HEAD_H, P, 8, 1), { tone: "mid", inner: L(k.sideSeam(HEAD, HEAD_Z + 6, P, 8), { tone: "faint" }) }) + headMark, [A.slab(HEAD, HEAD_Z, HEAD_H, { name: `${name}.head` })]);
  for (const dir of [-1, 1]) {
    const tip = x + dir * 28 + dir * fitting(`${name}.port`, G.frameOf([x + dir * 28, PY, PORT_Z], [dir, 0, 0], [0, 1, 0], [0, 0, 1]));
    const wx = x + dir * 46;
    const wallReach = fitting(`${name}.bulkhead`, G.frameOf([wx, WALL_FACE, PORT_Z], [0, 1, 0], [1, 0, 0], [0, 0, 1]), { boss: 6.6, hex: 5.2 });
    line(`${name}.line`, [[tip, PY, PORT_Z], [wx, PY, PORT_Z], [wx, WALL_FACE + wallReach, PORT_Z]]);
  }
  const dirt = `<g data-part="${name}-dirt" class="cp-dirt"></g>`;
  if (name === "spinon") {
    const element = pleatedElement(P, { x, y: PY, z0: LOW + 3, z1: ST, r: ER }) + dirt;
    // the spin-on: shell, element and closed end are one part that is replaced whole
    const piece = { piece: "spinon" };
    put(
      "spinon.can",
      [x, PY, (LOW + ST) / 2],
      shellCut(P, { x, y: PY, z0: LOW, z1: ST, r: CAN_R, inside: element }) + S(G.solidOf(seam, vertical(ST, x, PY), P), { tone: "hi" }),
      [A.ring(vertical(LOW, x, PY), 0, ST - LOW, ER + 3.2, CAN_R, { name: "spinon.can", owner: "spinon.can" }), A.cylinder(x, PY, ER + 3, LOW + 3, ST - LOW - 3, { name: "spinon.element", owner: "spinon.can" }), A.solid(vertical(ST, x, PY), seam, { name: "spinon.seam", owner: "spinon.can" })],
      piece,
    );
    put("spinon.end", [x, PY, LOW - 3], S(G.solidOf(endProfile, vertical(LOW - 6, x, PY), P), { tone: "hi" }), [A.solid(vertical(LOW - 6, x, PY), endProfile, { name: "spinon.end" })], piece);
  } else {
    // the cartridge: the element hangs from the head and stays there; the bowl, cut away in front (section),
    // sits behind it and drops away at service. Its recorded shape is the back wall it shows.
    const piece = { piece: "bowl" };
    const cartridgeElement = pleatedElement(P, { x, y: PY, z0: LOW + 3, z1: HEAD_Z, r: ER }) + dirt;
    // the back half of the wall as staves around the far side (the side facing away from the viewer)
    const away = (P.azimuth * Math.PI) / 180 + Math.PI;
    const back = Array.from({ length: 8 }, (_, i) => {
      const a = away + ((i + 0.5) / 8 - 0.5) * Math.PI * 1.1;
      const c = [x + Math.cos(a) * (CAN_R - 1.5), PY + Math.sin(a) * (CAN_R - 1.5), (LOW + HEAD_Z) / 2];
      return A.orientedBox(c, [[Math.cos(a), Math.sin(a), 0], [-Math.sin(a), Math.cos(a), 0], [0, 0, 1]], [1.5, CAN_R * Math.sin(Math.PI * 1.1 / 16) + 0.5, (HEAD_Z - LOW) / 2], { name: "cartridge.bowl", owner: "cartridge.bowl" });
    });
    put("cartridge.bowl", [x + Math.cos(away) * CAN_R * 0.6, PY + Math.sin(away) * CAN_R * 0.6, (LOW + HEAD_Z) / 2], shellCut(P, { x, y: PY, z0: LOW, z1: HEAD_Z, r: CAN_R, part: "back" }) + L(k.cylinder(x, PY, CAN_R, LOW, HEAD_Z - LOW, P, 72).outline, { tone: "mid" }), back, piece);
    put("cartridge.element", [x, PY, (LOW + HEAD_Z) / 2], cartridgeElement, [A.cylinder(x, PY, ER + 3, LOW + 3, HEAD_Z - LOW - 3, { name: "cartridge.element" })]);
    put("cartridge.end", [x, PY, LOW - 3], S(G.solidOf(endProfile, vertical(LOW - 6, x, PY), P), { tone: "hi" }), [A.solid(vertical(LOW - 6, x, PY), endProfile, { name: "cartridge.end" })], piece);
  }
}

const layers = F.render();
A.auditOrExit(F.R, P);

const fluid = T.fluid[LANG];
const COPY = {
  es: {
    hint: "Cursor: suciedad · arriba: servicio",
    readout: "ambos filtrando",
    keys: [
      { mark: "lit", label: "Partículas retenidas en el medio plisado de cada filtro" },
      { mark: "raised", label: "Izquierda: spin-on (se reemplaza completo) · derecha: cartucho en carcasa (se reemplaza solo el elemento)" },
    ],
    caption: `Comparación de los dos formatos de filtro ${T.mark.split(" · ")[0]}. En el spin-on, el medio plisado viene dentro de su propia carcasa sellada: en el servicio se desenrosca y se reemplaza el conjunto completo. En el cartucho, la carcasa es parte permanente del equipo: en el servicio se retira el vaso, se cambia solo el elemento y se vuelve a montar el mismo vaso. En ambos, el ${fluid} pasa a través del medio plisado, que retiene las partículas. Simulación ilustrativa del funcionamiento: es una animación conceptual, no un modelo de ingeniería ni un resultado de prueba, y no muestra datos de producto.`,
    aria: `Spin-on y cartucho ${T.mark}: flechas cambian la suciedad, E hace el servicio`,
    label: `Dos filtros en un soporte de pared, ambos en corte con su elemento plisado. A la izquierda un spin-on, que en el servicio sale completo; a la derecha un cartucho, cuyo vaso baja para dejar el elemento a la vista, se cambia solo el elemento y el mismo vaso vuelve a su lugar.`,
    title: "Spin-on y cartucho",
    live: { both: "ambos filtrando", service: "spin-on: completo · cartucho: elemento", fresh: "filtros nuevos" },
  },
  en: {
    hint: "Cursor: dirt · top: service",
    readout: "both filtering",
    keys: [
      { mark: "lit", label: "Particles held on each filter's pleated media" },
      { mark: "raised", label: "Left: spin-on (replaced whole) · right: cartridge in a housing (only the element is replaced)" },
    ],
    caption: `The two ${T.mark.split(" · ")[0]} filter formats compared. In the spin-on, the pleated media comes inside its own sealed can: at service the whole unit is unscrewed and replaced. In the cartridge, the housing is a permanent part of the equipment: at service the bowl comes off, only the element is changed and the same bowl is refitted. In both, the ${fluid} passes through the pleated media, which holds the particles. Illustrative simulation of how it works: a conceptual animation, not an engineering model or test result, and it shows no product data.`,
    aria: `${T.mark} spin-on and cartridge: arrow keys change the dirt, E runs the service`,
    label: `Two filters on a wall bracket, both in section with their pleated element. On the left a spin-on, which comes off whole at service; on the right a cartridge, whose bowl drops to expose the element; only the element is changed and the same bowl goes back.`,
    title: "Spin-on and cartridge",
    live: { both: "both filtering", service: "spin-on: whole · cartridge: element", fresh: "new filters" },
  },
  pt: {
    hint: "Cursor: sujeira · topo: serviço",
    readout: "ambos filtrando",
    keys: [
      { mark: "lit", label: "Partículas retidas no meio plissado de cada filtro" },
      { mark: "raised", label: "Esquerda: spin-on (substituído inteiro) · direita: cartucho em carcaça (só o elemento é substituído)" },
    ],
    caption: `Comparação dos dois formatos de filtro ${T.mark.split(" · ")[0]}. No spin-on, o meio plissado vem dentro da sua própria carcaça selada: na manutenção, o conjunto inteiro é desrosqueado e substituído. No cartucho, a carcaça é parte permanente do equipamento: na manutenção retira-se o copo, troca-se apenas o elemento e o mesmo copo é montado de volta. Em ambos, o ${fluid} passa pelo meio plissado, que retém as partículas. Simulação ilustrativa do funcionamento: é uma animação conceitual, não um modelo de engenharia nem um resultado de ensaio, e não mostra dados de produto.`,
    aria: `Spin-on e cartucho ${T.mark}: setas mudam a sujeira, E faz a manutenção`,
    label: `Dois filtros em um suporte de parede, ambos em corte com o elemento plissado. À esquerda um spin-on, que sai inteiro na manutenção; à direita um cartucho, cujo copo desce para expor o elemento; troca-se só o elemento e o mesmo copo volta ao lugar.`,
    title: "Spin-on e cartucho",
    live: { both: "ambos filtrando", service: "spin-on: inteiro · cartucho: elemento", fresh: "filtros novos" },
  },
}[LANG];

const live = `
const P = ${JSON.stringify(P)};
const W = ${JSON.stringify(COPY.live)};
const SV = ${JSON.stringify({ spinon: SERVICE, bowl: [0, 0, -DROP], spring: SPRING, units: UNITS, y: PY, z0: LOW + 8, z1: ST - 6, r: ER })};
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const readout = document.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
let seed = 17;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const VIEW = Math.atan2(Math.sin(P.azimuth * Math.PI / 180), Math.cos(P.azimuth * Math.PI / 180));
// particles carried by the fluid settle on the front half of each element; a new element starts clean
const units = SV.units.map((u) => ({ ...u, group: svg.querySelector('[data-part="' + u.name + '-dirt"]'), stuck: [], moving: [], spawn: 0 }));
const pieces = { spinon: { x: 0, v: 0, target: 0, groups: [...svg.querySelectorAll('[data-piece="spinon"]')] }, bowl: { x: 0, v: 0, target: 0, groups: [...svg.querySelectorAll('[data-piece="bowl"]')] } };
let dirty = 0.5, dirtyTarget = 0.5, clock = 0, touring = true, idle = 0, frame = 0, last = 0, visible = false, fresh = 0;
function draw() {
  for (const u of units) {
    const dot = (p) => { const [x, y] = iso([u.x + Math.cos(p.a) * p.r, SV.y + Math.sin(p.a) * p.r, p.z], P); return '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + p.size + '"/>'; };
    u.group.innerHTML = u.stuck.concat(u.moving).map(dot).join("");
  }
  for (const [name, part] of Object.entries(pieces)) {
    const shift = translateAlong(P, SV[name].map((v) => v * part.x));
    const [dx, dy] = shift.match(/-?[\\d.]+/g).map(Number);
    for (const g of part.groups) { g.setAttribute("transform", shift); holdStill(g, [dx, dy]); }
  }
  const text = pieces.spinon.x > 0.5 ? W.service : fresh > 0 ? W.fresh : W.both;
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
  const serviced = pieces.spinon.x > 0.05 || pieces.bowl.x > 0.05;
  for (const u of units) {
    if (serviced) continue;
    u.spawn += dt * (0.5 + 6 * dirty);
    while (u.spawn > 1) { u.spawn -= 1; u.moving.push({ a: VIEW + (rand() - 0.5) * 2.6, r: SV.r + 2.6, z: SV.z0 + rand() * (SV.z1 - SV.z0), size: rand() < 0.35 ? 1 : 0.6 }); }
    for (let i = u.moving.length - 1; i >= 0; i--) { const p = u.moving[i]; p.r -= dt * 3; if (p.r <= SV.r + 0.4) { u.moving.splice(i, 1); if (u.stuck.length < 180) u.stuck.push(p); } }
  }
  for (const part of Object.values(pieces)) for (let i = 0; i < SV.spring.substeps; i++) { const h = dt / SV.spring.substeps; part.v += ((part.target - part.x) * SV.spring.stiffness - part.v * SV.spring.damping) * h; part.x += part.v * h; }
  // out of the way: the whole spin-on is new, and on the cartridge only the exposed element is swapped
  if (pieces.spinon.x > 0.9 && pieces.bowl.x > 0.9 && units.some((u) => u.stuck.length)) { for (const u of units) { u.stuck = []; u.moving = []; } fresh = 2.5; }
  draw();
  frame = visible && !still.matches ? requestAnimationFrame(tick) : 0;
}
const service = (on) => { pieces.spinon.target = pieces.bowl.target = on ? 1 : 0; };
const run = () => { if (!frame && visible && !still.matches) { last = 0; frame = requestAnimationFrame(tick); } if (still.matches) { for (const part of Object.values(pieces)) part.x = part.target; draw(); } };
const steer = (next) => { touring = false; dirtyTarget = clamp(next, 0, 1); clearTimeout(idle); idle = setTimeout(() => { touring = true; }, 4000); run(); };
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
stage.addEventListener("pointermove", (event) => {
  const box = svg.getBoundingClientRect();
  service((event.clientY - box.top) / box.height < 0.25);
  steer(((event.clientX - box.left) / box.width - 0.2) / 0.6);
});
stage.addEventListener("pointerleave", () => { service(false); run(); });
stage.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight" || event.key === "ArrowUp") steer(dirtyTarget + 0.1);
  else if (event.key === "ArrowLeft" || event.key === "ArrowDown") steer(dirtyTarget - 0.1);
  else if (event.key === "e" || event.key === "E") { service(!pieces.spinon.target); run(); }
  else return;
  event.preventDefault();
});
draw();
`;

const svg = k.figureSvg({ width: WIDTH, height: HEIGHT, label: COPY.label, body: layers });
const CSS = `<style>.cp-dirt circle{fill:color-mix(in srgb,${T.dirt} 78%,var(--anatomy-hi))}</style>`;
const body = PAGE_CSS + CSS + k.plateHtml({
  fig: T.fig,
  title: `ELIMFILTERS · ${T.mark}`,
  hint: COPY.hint,
  readout: COPY.readout,
  keys: COPY.keys,
  caption: COPY.caption,
  body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="${COPY.aria}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50">${svg}</div>`,
});

const name = PUBLIC ? `compare-${TECH}${LANG === "en" ? "" : "-" + LANG}.html` : `compare-${TECH}${LANG === "es" ? "" : "-" + LANG}${theme === "light" ? "-light" : ""}.html`;
const OUT = PUBLIC ? join(HERE, "../../../../frontend/public/knowledge-center/figures") : HERE;
mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, name), draftPage(k.pageHtml({ title: `${COPY.title} · ${T.mark}`, theme, body, script: KIT_NOTICE + kitScript() + live }), LANG));
console.log("wrote", name, F.R.items.length, "items");
