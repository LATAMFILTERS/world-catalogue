// MICROKAPPA™ cabin air filtration (status in ../status.json): a pleated panel filter in a cabin HVAC housing.
//   outside air (wall grille) → MICROKAPPA panel (dust and pollen held on its upstream face) → blower → cabin
//   the housing is drawn cut away in front and open on top so the panel can be seen; at service the panel slides out
// Built with the third-party "anatomy" kit (../.anatomy, pinned in ../README.md). Loads shown are illustrative, not product data.
// node build.mjs [--light] [--audit] [--lang es|en|pt] [--public]   (see pageTarget in ../common.mjs)
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { k, G, A, studio, PAGE_CSS, KIT_NOTICE, draftPage, pageTarget } from "../common.mjs";
import { kitScript } from "../.anatomy/scripts/inline-kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const TARGET = pageTarget(HERE, "microkappa");
const { lang: LANG, theme } = TARGET;
const WIDTH = 620;
const HEIGHT = 540;
const SLIDE = [0, 74, 0]; // the panel slides straight out of the front of the housing

const PLATE = { x: -130, y: -78, w: 260, d: 160, r: 8 };
const WALL = { x: -122, y: -74, w: 244, d: 8, r: 2 };
const WALL_TOP = 236;
const WALL_FACE = WALL.y + WALL.d;
const FRONT = -4; // front edge of the housing
const HW = 56; // housing half width
const BOT = 112; // housing floor (top face)
const SIDE_TOP = 176;
const PANEL = { x: -HW + 4, y: WALL_FACE + 2, w: 2 * (HW - 4), d: FRONT - 2 - (WALL_FACE + 2), r: 1.5 };
const PANEL_Z = 140;
const PANEL_H = 10;
const BLOWER = { x: 0, z: BOT - 4 - 15, r: 15 };
const CABIN = { x: -38, y: 20, w: 76, d: 46, r: 5 }; // straight below the blower outlet, clear of the ruler
const CABIN_H = 40;

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -15, 0), ...k.boxCorners(WALL, 0, WALL_TOP), [PANEL.x, PANEL.y + SLIDE[1] + PANEL.d, PANEL_Z], [PANEL.x + PANEL.w, PANEL.y + SLIDE[1] + PANEL.d, PANEL_Z + PANEL_H]],
  WIDTH,
  HEIGHT,
  { pad: 24, azimuth: 40 },
);
const SPRING = { stagger: 0, stiffness: 46, damping: 13.6, substeps: 4 };
const F = studio(P, { order: ["panel", "stand"], spring: SPRING, pieces: { panel: SLIDE, stand: [0, 0, 0] } });
const { S, L, D, put, line, fitting } = F;

F.plate(PLATE, { strip: { x: -62, y: PLATE.y + PLATE.d - 14, w: 124, d: 6, r: 1 }, label: { x: 80, y: 40, w: 30, d: 18, r: 1.5 } });
F.wall(WALL, WALL_TOP, [[-100, 40], [100, 40], [-100, 210], [100, 210]]);

const WORDS = {
  es: { outside: "AIRE EXTERIOR", cabin: "CABINA" },
  en: { outside: "OUTSIDE AIR", cabin: "CABIN" },
  pt: { outside: "AR EXTERNO", cabin: "CABINE" },
}[LANG];

// the housing: two side walls and a floor against the wall, cut away in front and open on top
const SIDE = (sx) => ({ x: sx, y: WALL_FACE, w: 4, d: FRONT - WALL_FACE, r: 1 });
for (const sx of [-HW, HW - 4]) put("housing.side", [sx + 2, (WALL_FACE + FRONT) / 2, (BOT + SIDE_TOP) / 2], S(k.slabOf(SIDE(sx), BOT - 4, SIDE_TOP - BOT + 4, P, 2, 0.4), { tone: "mid" }), [A.slab(SIDE(sx), BOT - 4, SIDE_TOP - BOT + 4, { name: "housing.side" })]);
const FLOOR = { x: -HW + 4, y: WALL_FACE, w: 2 * HW - 8, d: FRONT - WALL_FACE, r: 0.5 };
put("housing.floor", [0, (WALL_FACE + FRONT) / 2, BOT - 2], S(k.slabOf(FLOOR, BOT - 4, 4, P, 2), { tone: "mid", crease: "none" }), [A.slab(FLOOR, BOT - 4, 4, { name: "housing.floor" })]);
// rails the panel slides on
for (const rx of [-HW + 4, HW - 8]) {
  const RAIL = { x: rx, y: WALL_FACE, w: 4, d: FRONT - WALL_FACE, r: 0.5 };
  put("rail", [rx + 2, (WALL_FACE + FRONT) / 2, PANEL_Z - 2], S(k.slabOf(RAIL, PANEL_Z - 4, 4, P, 2), { tone: "lo", crease: "none" }), [A.slab(RAIL, PANEL_Z - 4, 4, { name: "rail" })]);
}
// outside-air grille in the wall above the panel
const GRILLE = { x: -HW + 8, y: WALL_FACE, w: 2 * HW - 16, d: 1.2, r: 1 };
const louvres = Array.from({ length: 5 }, (_, i) => k.segment([GRILLE.x + 4, WALL_FACE + 1.2, 156 + i * 3.6], [GRILLE.x + GRILLE.w - 4, WALL_FACE + 1.2, 156 + i * 3.6], P)).join("");
put("grille", [0, WALL_FACE + 0.6, 163], S(k.slabOf(GRILLE, 152, 22, P, 2), { tone: "mid", inner: L(louvres, { tone: "lo", free: true }) }) + k.faceTextSvg(k.sideMatrix([0, WALL_FACE + 1.2], 176.5, P, "left"), WORDS.outside, { size: 2.6, tone: "lo", anchor: "middle" }), [A.slab(GRILLE, 152, 22, { name: "grille" })]);

// the MICROKAPPA panel: a frame with pleats across its top face, and its dust load
const pleats = [];
for (let x = PANEL.x + 3; x <= PANEL.x + PANEL.w - 3; x += 3) pleats.push(k.segment([x, PANEL.y + 1.5, PANEL_Z + PANEL_H], [x, PANEL.y + PANEL.d - 1.5, PANEL_Z + PANEL_H], P));
const mark =
  k.faceTextSvg(k.sideMatrix([0, PANEL.y + PANEL.d], PANEL_Z + 7.4, P, "left"), "ELIMFILTERS · MICROKAPPA™ · EC1", { size: 2.4, tone: "hi", anchor: "middle" }) +
  k.faceTextSvg(k.sideMatrix([0, PANEL.y + PANEL.d], PANEL_Z + 3.4, P, "left"), { es: "FILTRO DE CABINA", en: "CABIN FILTER", pt: "FILTRO DE CABINE" }[LANG], { size: 1.9, tone: "lo", anchor: "middle" });
put("panel", [0, PANEL.y + PANEL.d / 2, PANEL_Z + PANEL_H / 2], S(k.slabOf(PANEL, PANEL_Z, PANEL_H, P, 2, 0.5), { tone: "mid", className: "mk-media", inner: L(pleats.join(""), { tone: "lo", free: true }) }) + mark + `<g data-part="dust" class="mk-dust"></g>`, [A.slab(PANEL, PANEL_Z, PANEL_H, { name: "panel" })], { piece: "panel" });

// the blower under the housing floor, and its outlet to the cabin
const BF = G.frameOf([0, WALL_FACE, BLOWER.z], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
const BL = FRONT - WALL_FACE - 6;
put("blower", G.pointOf(BF, BL / 2, 0, 0), S(G.disc(0, BL, BLOWER.r, BF, P), { tone: "mid", inner: k.fadedSvg(G.ribsOf(BF, 0, BL, BLOWER.r + 0.01, 30, P, { fade: [0.2, 0.7] }), { tone: "faint" }) }), [A.disc(BF, 0, BL, BLOWER.r, { name: "blower" })]);
const OUTF = G.frameOf([0, WALL_FACE + BL, BLOWER.z], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
const outReach = WALL_FACE + BL + fitting("blower.outlet", OUTF, { boss: 7.5, bossH: 3, hex: 6.2, hexH: 4 });
put("cabin", [CABIN.x + CABIN.w / 2, CABIN.y + CABIN.d / 2, CABIN_H / 2], S(k.slabOf(CABIN, 0, CABIN_H, P, 5, 1), { tone: "mid", inner: L(k.sideSeam(CABIN, CABIN_H - 8, P, 5), { tone: "faint" }) }) + k.faceTextSvg(k.sideMatrix([CABIN.x + CABIN.w / 2, CABIN.y + CABIN.d], 16, P, "left"), WORDS.cabin, { size: 3.2, tone: "lo", anchor: "middle" }), [A.slab(CABIN, 0, CABIN_H, { name: "cabin" })]);
const CIN = [0, CABIN.y + 22];
const cabinTop = CABIN_H + fitting("cabin.inlet", G.frameOf([...CIN, CABIN_H], [0, 0, 1], [1, 0, 0], [0, 1, 0]), { boss: 7.5, bossH: 3, hex: 6.2, hexH: 4 });
line("supply", [[0, outReach, BLOWER.z], [...CIN, BLOWER.z], [...CIN, cabinTop]], { r: 5, ball: 7.5 });

const layers = F.render();
A.auditOrExit(F.R, P);

const SIM = {
  es: "Simulación ilustrativa del funcionamiento: es una animación conceptual, no un modelo de ingeniería ni un resultado de prueba, y no muestra datos de producto.",
  en: "Illustrative simulation of how it works: a conceptual animation, not an engineering model or test result, and it shows no product data.",
  pt: "Simulação ilustrativa do funcionamento: é uma animação conceitual, não um modelo de engenharia nem um resultado de ensaio, e não mostra dados de produto.",
}[LANG];
const COPY = {
  es: {
    hint: "Cursor: polvo · arriba: servicio",
    readout: "filtro: carga baja",
    keys: [
      { mark: "lit", label: "Polvo y polen retenidos en la cara de entrada del panel plisado" },
      { mark: "raised", label: "Rejilla de aire exterior, carcasa HVAC (en corte), panel MICROKAPPA, soplador, cabina" },
    ],
    caption: `Ilustración conceptual de la ventilación de una cabina con un filtro de panel MICROKAPPA™. El aire exterior entra por la rejilla, atraviesa el panel plisado, que retiene el polvo y el polen en su cara de entrada, y el soplador lo lleva a la cabina. A medida que el panel se carga, aumenta su resistencia al paso del aire, lo que puede reducir la ventilación y el desempañado; el marco debe sellar de forma continua dentro de la carcasa. En el servicio el panel se desliza fuera de la carcasa y se reemplaza. ${SIM}`,
    aria: "Filtro de cabina MICROKAPPA: flechas cambian el polvo en el aire, E cambia el panel",
    label: "Caja de ventilación de una cabina sobre un soporte de pared, cortada al frente: el aire exterior entra por una rejilla, atraviesa un filtro de panel plisado que retiene polvo y polen, y un soplador lo envía a la cabina. En el servicio el panel sale deslizándose.",
    title: "MICROKAPPA filtro de cabina",
    live: { filter: "filtro", light: "carga baja", building: "cargando", heavy: "carga alta", fresh: "panel nuevo", out: "panel fuera · se reemplaza" },
  },
  en: {
    hint: "Cursor: dust · top: service",
    readout: "filter: low load",
    keys: [
      { mark: "lit", label: "Dust and pollen held on the upstream face of the pleated panel" },
      { mark: "raised", label: "Outside-air grille, HVAC housing (in section), MICROKAPPA panel, blower, cabin" },
    ],
    caption: `Conceptual illustration of a cabin ventilation path with a MICROKAPPA™ panel filter. Outside air enters through the grille and passes through the pleated panel, which holds dust and pollen on its upstream face, and the blower carries it to the cabin. As the panel loads its airflow resistance rises, which can reduce ventilation and demisting; the frame must seal continuously inside the housing. At service the panel slides out of the housing and is replaced. ${SIM}`,
    aria: "MICROKAPPA cabin filter: arrow keys change the dust in the air, E changes the panel",
    label: "Cabin ventilation box on a wall bracket, cut away in front: outside air enters through a grille, passes a pleated panel filter that holds dust and pollen, and a blower sends it to the cabin. At service the panel slides out.",
    title: "MICROKAPPA cabin filter",
    live: { filter: "filter", light: "low load", building: "loading", heavy: "high load", fresh: "new panel", out: "panel out · replaced" },
  },
  pt: {
    hint: "Cursor: poeira · topo: manutenção",
    readout: "filtro: carga baixa",
    keys: [
      { mark: "lit", label: "Poeira e pólen retidos na face de entrada do painel plissado" },
      { mark: "raised", label: "Grade de ar externo, caixa HVAC (em corte), painel MICROKAPPA, soprador, cabine" },
    ],
    caption: `Ilustração conceitual da ventilação de uma cabine com um filtro de painel MICROKAPPA™. O ar externo entra pela grade, atravessa o painel plissado, que retém a poeira e o pólen na face de entrada, e o soprador o leva à cabine. À medida que o painel se carrega, aumenta sua resistência à passagem do ar, o que pode reduzir a ventilação e o desembaçamento; a moldura deve vedar de forma contínua dentro da caixa. Na manutenção o painel desliza para fora da caixa e é substituído. ${SIM}`,
    aria: "Filtro de cabine MICROKAPPA: setas mudam a poeira no ar, E troca o painel",
    label: "Caixa de ventilação de uma cabine sobre um suporte de parede, cortada na frente: o ar externo entra por uma grade, atravessa um filtro de painel plissado que retém poeira e pólen, e um soprador o envia à cabine. Na manutenção o painel sai deslizando.",
    title: "MICROKAPPA filtro de cabine",
    live: { filter: "filtro", light: "carga baixa", building: "carregando", heavy: "carga alta", fresh: "painel novo", out: "painel fora · substituído" },
  },
}[LANG];

const live = `
const P = ${JSON.stringify(P)};
const W = ${JSON.stringify(COPY.live)};
const SV = ${JSON.stringify({ move: SLIDE, spring: SPRING, x0: PANEL.x + 3, x1: PANEL.x + PANEL.w - 3, y0: PANEL.y + 3, y1: PANEL.y + PANEL.d - 3, top: PANEL_Z + PANEL_H, from: 170 })};
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const readout = document.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
let seed = 23;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const group = svg.querySelector('[data-part="dust"]');
const parts = [...svg.querySelectorAll('[data-piece="panel"]')];
// dust and pollen drift down from the grille and settle on the panel's upstream (top) face
const panel = { stuck: [], moving: [], load: 0, x: 0, v: 0, target: 0, spawn: 0 };
let dirty = 0.5, dirtyTarget = 0.5, clock = 0, touring = true, idle = 0, frame = 0, last = 0, visible = false, fresh = 0;
function draw() {
  const dot = (p) => { const [x, y] = iso([p.x, p.y, p.z], P); return '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + p.size + '"' + (p.pollen ? ' class="p"' : "") + '/>'; };
  group.innerHTML = panel.stuck.concat(panel.moving).map(dot).join("");
  const shift = translateAlong(P, SV.move.map((v) => v * panel.x));
  const [dx, dy] = shift.match(/-?[\\d.]+/g).map(Number);
  for (const g of parts) { g.setAttribute("transform", shift); holdStill(g, [dx, dy]); }
  const word = panel.load > 0.6 ? W.heavy : panel.load > 0.15 ? W.building : W.light;
  const text = panel.x > 0.5 ? W.out : fresh > 0 ? W.fresh : W.filter + ": " + word;
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
  if (panel.x < 0.05) {
    panel.spawn += dt * (0.6 + 8 * dirty);
    while (panel.spawn > 1) { panel.spawn -= 1; panel.moving.push({ x: SV.x0 + rand() * (SV.x1 - SV.x0), y: SV.y0 + rand() * (SV.y1 - SV.y0), z: SV.from - rand() * 8, size: rand() < 0.3 ? 0.9 : 0.55, pollen: rand() < 0.25 }); }
    for (let i = panel.moving.length - 1; i >= 0; i--) { const p = panel.moving[i]; p.z -= dt * 16; if (p.z <= SV.top + 0.3) { p.z = SV.top + 0.3; panel.moving.splice(i, 1); if (panel.stuck.length < 320) panel.stuck.push(p); } }
    panel.load = Math.min(1, panel.stuck.length / 320);
  }
  for (let i = 0; i < SV.spring.substeps; i++) { const h = dt / SV.spring.substeps; panel.v += ((panel.target - panel.x) * SV.spring.stiffness - panel.v * SV.spring.damping) * h; panel.x += panel.v * h; }
  // a new panel goes in clean
  if (panel.x > 0.9 && panel.stuck.length) { panel.stuck = []; panel.moving = []; panel.load = 0; fresh = 2.5; }
  draw();
  frame = visible && !still.matches ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible && !still.matches) { last = 0; frame = requestAnimationFrame(tick); } if (still.matches) { panel.x = panel.target; draw(); } };
const steer = (next) => { touring = false; dirtyTarget = clamp(next, 0, 1); clearTimeout(idle); idle = setTimeout(() => { touring = true; }, 4000); run(); };
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
stage.addEventListener("pointermove", (event) => {
  const box = svg.getBoundingClientRect();
  panel.target = (event.clientY - box.top) / box.height < 0.25 ? 1 : 0;
  steer(((event.clientX - box.left) / box.width - 0.2) / 0.6);
});
stage.addEventListener("pointerleave", () => { panel.target = 0; run(); });
stage.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight" || event.key === "ArrowUp") steer(dirtyTarget + 0.1);
  else if (event.key === "ArrowLeft" || event.key === "ArrowDown") steer(dirtyTarget - 0.1);
  else if (event.key === "e" || event.key === "E") { panel.target = panel.target ? 0 : 1; run(); }
  else return;
  event.preventDefault();
});
draw();
`;

const svg = k.figureSvg({ width: WIDTH, height: HEIGHT, label: COPY.label, body: layers });
const CSS = `<style>
.mk-dust circle{fill:color-mix(in srgb,#9a7b52 80%,var(--anatomy-hi))}.mk-dust circle.p{fill:color-mix(in srgb,#d9b23a 80%,var(--anatomy-hi))}
.mk-media>.iso-top{fill:color-mix(in srgb,#c9a253 12%,var(--anatomy-paper))}
</style>`;
const body = PAGE_CSS + CSS + k.plateHtml({
  fig: "Fig 8",
  title: "ELIMFILTERS · MICROKAPPA™ · EC1",
  hint: COPY.hint,
  readout: COPY.readout,
  keys: COPY.keys,
  caption: COPY.caption,
  body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="${COPY.aria}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50">${svg}</div>`,
});

mkdirSync(TARGET.dir, { recursive: true });
writeFileSync(TARGET.path, draftPage(k.pageHtml({ title: COPY.title, theme, body, script: KIT_NOTICE + kitScript() + live }), LANG));
console.log("wrote", TARGET.file, F.R.items.length, "items");
