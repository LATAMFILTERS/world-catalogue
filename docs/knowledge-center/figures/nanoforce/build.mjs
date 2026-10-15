// NANOFORCE™ hydraulic filtration (status in ../status.json): a pressure-line spin-on in a hydraulic circuit.
//   reservoir → pump → NANOFORCE pressure-line filter → control-valve block → return to the reservoir
// Built with the third-party "anatomy" kit (../.anatomy, pinned in ../README.md). Loads shown are illustrative, not product data.
// node build.mjs [--light] [--audit] [--lang es|en|pt] [--public]   (see pageTarget in ../common.mjs)
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { k, G, A, vertical, studio, shellCut, pleatedElement, PAGE_CSS, pageTarget, KIT_NOTICE, draftPage } from "../common.mjs";
import { kitScript } from "../.anatomy/scripts/inline-kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const TARGET = pageTarget(HERE, "nanoforce");
const { lang: LANG, theme } = TARGET;
const WIDTH = 640;
const HEIGHT = 520;
const SERVICE = [0, 70, 0]; // where the spin-on goes when it is changed

const PLATE = { x: -164, y: -78, w: 328, d: 158, r: 8 };
const WALL = { x: -156, y: -74, w: 312, d: 8, r: 2 };
const WALL_TOP = 236;
const WALL_FACE = WALL.y + WALL.d;
const PY = -29; // the circuit runs in one plane in front of the wall
const HEAD_Z = 150;
const HEAD_H = 20;
const PORT_Z = HEAD_Z + HEAD_H / 2;
const CAN_R = 24;
const ER = 18; // element media radius; its end caps are 3 wider
const CAN_Z = 74;
const ST = HEAD_Z - 4;
const FX = 45; // the filter's axis
const PUMP = { x: -54, y: WALL_FACE, w: 28, d: PY + 11 - WALL_FACE, r: 3 };
const PUMP_Z = 104;
const PUMP_H = 32;
const PUMP_PORT_Z = PUMP_Z + PUMP_H / 2;
const GAL = { x: -40, y: PY - 7, w: 140, d: 14, r: 4 };
const GAL_Z = 198;
const GAL_H = 14;
const GAL_PORT_Z = GAL_Z + GAL_H / 2;
const PAN = { x: -158, y: 6, w: 70, d: 66, r: 4 }; // the hydraulic reservoir
const PAN_H = 44;
const PICKUP = [-140, 40];
const RETURN = [-108, 40];
const COL = { left: -140, mid: -8, right: 135, drop: 140 };

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -15, 0), ...k.boxCorners(WALL, 0, WALL_TOP), [FX - CAN_R, PY + SERVICE[1] + CAN_R, CAN_Z - 6], [FX + CAN_R, PY + SERVICE[1] + CAN_R, ST]],
  WIDTH,
  HEIGHT,
  { pad: 24, azimuth: 40 },
);
const SPRING = { stagger: 0, stiffness: 46, damping: 13.6, substeps: 4 };
const F = studio(P, { order: ["filter", "stand"], spring: SPRING, pieces: { filter: SERVICE, stand: [0, 0, 0] } });
const { S, L, D, put, line, fitting } = F;

F.plate(PLATE, { strip: { x: -62, y: PLATE.y + PLATE.d - 14, w: 124, d: 6, r: 1 }, label: { x: 120, y: 40, w: 30, d: 18, r: 1.5 } });
F.wall(WALL, WALL_TOP, [[-130, 40], [130, 40], [100, 110], [-100, 180]]);
const side = (x, z, dir) => G.frameOf([x, PY, z], [dir, 0, 0], [0, 1, 0], [0, 0, 1]);

// filter head on the block, with the spin-on drawn in section so the pleated element can be seen
const EARS = { x: FX - 20, y: WALL_FACE, w: 40, d: 9, r: 2 };
const HEAD = { x: FX - 28, y: EARS.y + EARS.d, w: 56, d: 2 * (PY - EARS.y - EARS.d), r: 8 };
put("head.ears", [FX, EARS.y + EARS.d / 2, HEAD_Z + 4], S(k.slabOf(EARS, HEAD_Z - 10, 38, P, 3, 0.5), { tone: "mid" }), [A.slab(EARS, HEAD_Z - 10, 38, { name: "head.ears" })]);
const FRONT = HEAD.y + HEAD.d;
const headMark =
  k.faceTextSvg(k.sideMatrix([FX, FRONT], HEAD_Z + 16.2, P, "left"), "ELIMFILTERS", { size: 2.8, tone: "hi", anchor: "middle" }) +
  k.faceTextSvg(k.sideMatrix([FX, FRONT], HEAD_Z + 12.6, P, "left"), "NANOFORCE™ · EH6", { size: 2.1, tone: "mid", anchor: "middle" }) +
  k.faceTextSvg(k.sideMatrix([FX, FRONT], HEAD_Z + 8.8, P, "left"), { en: "PRESSURE LINE", es: "LÍNEA DE PRESIÓN", pt: "LINHA DE PRESSÃO" }[LANG], { size: 1.7, tone: "lo", anchor: "middle" });
put("head", [FX, HEAD.y + HEAD.d / 2, HEAD_Z + HEAD_H / 2], S(k.slabOf(HEAD, HEAD_Z, HEAD_H, P, 8, 1), { tone: "mid", inner: L(k.sideSeam(HEAD, HEAD_Z + 6, P, 8), { tone: "faint" }) }) + headMark, [A.slab(HEAD, HEAD_Z, HEAD_H, { name: "head" })]);
const filterIn = FX - 28 - fitting("head.inlet", side(FX - 28, PORT_Z, -1));
const filterOut = FX + 28 + fitting("head.outlet", side(FX + 28, PORT_Z, 1));
const seam = [[0, CAN_R - 2.5], [1, CAN_R + 0.8], [3, CAN_R + 0.8], [4, CAN_R - 2.5]];
const endProfile = [[0, 13], [3, 21.5, 1], [6, CAN_R]];
const piece = { piece: "filter" };
put(
  "canister",
  [FX, PY, (CAN_Z + ST) / 2],
  shellCut(P, { x: FX, y: PY, z0: CAN_Z, z1: ST, r: CAN_R, inside: pleatedElement(P, { x: FX, y: PY, z0: CAN_Z + 3, z1: ST, r: ER }) + `<g data-part="dirt" class="nf-dirt"></g>` }) + S(G.solidOf(seam, vertical(ST, FX, PY), P), { tone: "hi" }),
  [A.ring(vertical(CAN_Z, FX, PY), 0, ST - CAN_Z, ER + 3.2, CAN_R, { name: "canister", owner: "canister" }), A.cylinder(FX, PY, ER + 3, CAN_Z + 3, ST - CAN_Z - 3, { name: "element", owner: "canister" }), A.solid(vertical(ST, FX, PY), seam, { name: "seam", owner: "canister" })],
  piece,
);
put("end", [FX, PY, CAN_Z - 3], S(G.solidOf(endProfile, vertical(CAN_Z - 6, FX, PY), P), { tone: "hi" }), [A.solid(vertical(CAN_Z - 6, FX, PY), endProfile, { name: "end" })], piece);

// hydraulic pump, driven from its front cover
const PCX = PUMP.x + PUMP.w / 2;
put("pump", [PCX, PUMP.y + PUMP.d / 2, PUMP_Z + PUMP_H / 2], S(k.slabOf(PUMP, PUMP_Z, PUMP_H, P, 3, 0.6), { tone: "mid", inner: L(k.sideSeam(PUMP, PUMP_Z + 8, P, 3), { tone: "faint" }) }), [A.slab(PUMP, PUMP_Z, PUMP_H, { name: "pump" })]);
const PF = G.frameOf([PCX, PUMP.y + PUMP.d, PUMP_PORT_Z], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
put("pump.cover", G.pointOf(PF, 1, 0, 0), S(G.disc(0, 2, 9, PF, P), { tone: "hi" }) + D(G.dotsOf(PF, 2, 6.5, 4, P, { all: true }), { size: 0.45 }), [A.disc(PF, 0, 2, 9, { name: "pump.cover" })]);
const pumpIn = PUMP.x - fitting("pump.inlet", side(PUMP.x, PUMP_PORT_Z, -1), { boss: 6, hex: 4.6 });
const pumpOut = PUMP.x + PUMP.w + fitting("pump.outlet", side(PUMP.x + PUMP.w, PUMP_PORT_Z, 1), { boss: 6, hex: 4.6 });

// control-valve block on two brackets, with its spool caps along the top
for (const bx of [-20, 88]) {
  const BR = { x: bx - 4, y: WALL_FACE, w: 8, d: GAL.y - WALL_FACE, r: 1 };
  put("gallery.bracket", [bx, BR.y + BR.d / 2, GAL_Z + GAL_H / 2], S(k.slabOf(BR, GAL_Z + 2, GAL_H - 4, P, 2, 0.4), { tone: "mid" }), [A.slab(BR, GAL_Z + 2, GAL_H - 4, { name: "gallery.bracket" })]);
}
put("gallery", [GAL.x + GAL.w / 2, PY, GAL_PORT_Z], S(k.slabOf(GAL, GAL_Z, GAL_H, P, 6, 0.8), { tone: "mid" }), [A.slab(GAL, GAL_Z, GAL_H, { name: "gallery" })]);
for (const bx of [-6, 30, 66]) {
  put("spool", [bx, PY, GAL_Z + GAL_H + 4], S(k.cylinder(bx, PY, 4.4, GAL_Z + GAL_H, 8, P, 6, 0.4), { tone: "mid" }) + S(k.cylinder(bx, PY, 2.4, GAL_Z + GAL_H + 8, 3, P, 20), { tone: "hi" }), [A.cylinder(bx, PY, 4.4, GAL_Z + GAL_H, 8, { name: "spool" }), A.cylinder(bx, PY, 2.4, GAL_Z + GAL_H + 8, 3, { name: "spool.cap" })]);
}
const galIn = GAL.x + GAL.w + fitting("gallery.inlet", side(GAL.x + GAL.w, GAL_PORT_Z, 1), { boss: 4.6, bossH: 3, hex: 3.8, hexH: 4 });
const galOut = GAL.x - fitting("gallery.return", side(GAL.x, GAL_PORT_Z, -1), { boss: 4.6, bossH: 3, hex: 3.8, hexH: 4 });

// hydraulic reservoir on the bench: suction and return on top
put("pan", [PAN.x + PAN.w / 2, PAN.y + PAN.d / 2, PAN_H / 2], S(k.slabOf(PAN, 0, PAN_H, P, 6, 1), { tone: "mid", inner: L(k.sideSeam(PAN, PAN_H - 6, P, 6), { tone: "faint" }) }) + k.faceTextSvg(k.sideMatrix([PAN.x + PAN.w / 2, PAN.y + PAN.d], PAN_H - 15, P, "left"), { en: "HYDRAULIC", es: "HIDRÁULICO", pt: "HIDRÁULICO" }[LANG], { size: 3, tone: "lo", anchor: "middle" }), [A.slab(PAN, 0, PAN_H, { name: "pan" })]);
const up = ([x, y]) => G.frameOf([x, y, PAN_H], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
const pickupTop = PAN_H + fitting("pan.pickup", up(PICKUP));
const returnTop = PAN_H + fitting("pan.return", up(RETURN));

// the circuit: reservoir → pump → pressure-line filter → valve block, and the valve block's return to the reservoir
line("pickup", [[...PICKUP, pickupTop], [...PICKUP, PUMP_PORT_Z], [COL.left, PY, PUMP_PORT_Z], [pumpIn, PY, PUMP_PORT_Z]]);
line("pressure", [[pumpOut, PY, PUMP_PORT_Z], [COL.mid, PY, PUMP_PORT_Z], [COL.mid, PY, PORT_Z], [filterIn, PY, PORT_Z]]);
line("feed", [[filterOut, PY, PORT_Z], [COL.right, PY, PORT_Z], [COL.right, PY, GAL_PORT_Z], [galIn, PY, GAL_PORT_Z]]);
// the return drops above the suction run, then comes forward and down into the reservoir
line("return", [[galOut, PY, GAL_PORT_Z], [RETURN[0], PY, GAL_PORT_Z], [RETURN[0], PY, COL.drop], [...RETURN, COL.drop], [...RETURN, returnTop]]);

const layers = F.render();
// the valve-block hoses plug into the ends of the block, a rod, along its own axis: on screen their ends meet it by design
A.auditOrExit(F.R, P, { crowd: [["feed.hose#3", "gallery"], ["return.hose", "gallery"]] });

const COPY = {
  en: {
    hint: "Cursor: contamination · top: service",
    readout: "filter: low load",
    keys: [
      { mark: "lit", label: "Particles held on the pleated media before they reach the valves" },
      { mark: "raised", label: "Reservoir, pump, NANOFORCE pressure-line spin-on (in section), control-valve block, return" },
    ],
    caption:
      "Conceptual illustration of a hydraulic circuit with a NANOFORCE™ pressure-line spin-on. The pump draws fluid from the reservoir and sends it through the filter before the control-valve block, so the particles are held on the pleated media, shown in section, before they reach the close-tolerance valves; the fluid then returns to the reservoir. Pressure-line, return-line and offline positions carry different duties, and the position is chosen around the most contamination-sensitive component. At service the spin-on is replaced. Illustrative simulation of how it works: a conceptual animation, not an engineering model or test result, and it shows no product data.",
    aria: "NANOFORCE hydraulic filter: arrow keys change the contamination in the fluid, E changes the filter",
    label:
      "Hydraulic circuit on a wall bracket: a reservoir on the bench, a pump, a pressure-line spin-on filter drawn in section with its pleated element, and a control-valve block with its spool caps, with a return line to the reservoir. Particles carried by the fluid collect on the pleats.",
    title: "NANOFORCE hydraulic filtration",
    live: { filter: "filter", light: "low load", building: "loading", heavy: "high load", fresh: "new filter", out: "filter off · replaced" },
  },
  es: {
    hint: "Cursor: contaminación · arriba: servicio",
    readout: "filtro: carga baja",
    keys: [
      { mark: "lit", label: "Partículas retenidas en el medio plisado antes de llegar a las válvulas" },
      { mark: "raised", label: "Tanque, bomba, spin-on NANOFORCE de línea de presión (en corte), bloque de válvulas de control, retorno" },
    ],
    caption:
      "Ilustración conceptual de un circuito hidráulico con un filtro spin-on NANOFORCE™ de línea de presión. La bomba toma el fluido del tanque y lo envía a través del filtro antes del bloque de válvulas de control, de modo que las partículas quedan retenidas en el medio plisado, visto en corte, antes de llegar a las válvulas de tolerancias estrechas; luego el fluido regresa al tanque. Las posiciones de presión, de retorno y fuera de línea tienen exigencias distintas, y la posición se elige en función del componente más sensible a la contaminación. En el servicio se reemplaza el spin-on. Simulación ilustrativa del funcionamiento: es una animación conceptual, no un modelo de ingeniería ni un resultado de prueba, y no muestra datos de producto.",
    aria: "Filtro hidráulico NANOFORCE: flechas cambian la contaminación del fluido, E cambia el filtro",
    label:
      "Circuito hidráulico sobre un soporte de pared: un tanque en el banco, una bomba, un filtro spin-on de línea de presión en corte con su elemento plisado y un bloque de válvulas de control, con retorno al tanque. Las partículas que arrastra el fluido se acumulan en el plisado.",
    title: "NANOFORCE filtración hidráulica",
    live: { filter: "filtro", light: "carga baja", building: "cargando", heavy: "carga alta", fresh: "filtro nuevo", out: "filtro fuera · se reemplaza" },
  },
  pt: {
    hint: "Cursor: contaminação · topo: manutenção",
    readout: "filtro: carga baixa",
    keys: [
      { mark: "lit", label: "Partículas retidas no meio plissado antes de chegarem às válvulas" },
      { mark: "raised", label: "Reservatório, bomba, spin-on NANOFORCE de linha de pressão (em corte), bloco de válvulas de controle, retorno" },
    ],
    caption:
      "Ilustração conceitual de um circuito hidráulico com um filtro spin-on NANOFORCE™ de linha de pressão. A bomba retira o fluido do reservatório e o envia através do filtro antes do bloco de válvulas de controle, de modo que as partículas ficam retidas no meio plissado, visto em corte, antes de chegarem às válvulas de tolerâncias estreitas; depois o fluido volta ao reservatório. As posições de pressão, de retorno e fora de linha têm exigências diferentes, e a posição é escolhida em função do componente mais sensível à contaminação. Na manutenção substitui-se o spin-on. Simulação ilustrativa do funcionamento: é uma animação conceitual, não um modelo de engenharia nem um resultado de ensaio, e não mostra dados de produto.",
    aria: "Filtro hidráulico NANOFORCE: setas mudam a contaminação do fluido, E troca o filtro",
    label:
      "Circuito hidráulico sobre um suporte de parede: um reservatório na bancada, uma bomba, um filtro spin-on de linha de pressão em corte com o elemento plissado e um bloco de válvulas de controle, com retorno ao reservatório. As partículas arrastadas pelo fluido acumulam-se nas pregas.",
    title: "NANOFORCE filtração hidráulica",
    live: { filter: "filtro", light: "carga baixa", building: "carregando", heavy: "carga alta", fresh: "filtro novo", out: "filtro fora · substituído" },
  },
}[LANG];

const live = `
const P = ${JSON.stringify(P)};
const W = ${JSON.stringify(COPY.live)};
const SV = ${JSON.stringify({ move: SERVICE, spring: SPRING, x: FX, y: PY, z0: CAN_Z + 6, z1: ST - 5, r: ER })};
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const readout = document.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
let seed = 13;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const VIEW = Math.atan2(Math.sin(P.azimuth * Math.PI / 180), Math.cos(P.azimuth * Math.PI / 180));
const group = svg.querySelector('[data-part="dirt"]');
const parts = [...svg.querySelectorAll('[data-piece="filter"]')];
// particles carried by the hydraulic fluid settle on the front half of the pleats
const filter = { stuck: [], moving: [], load: 0, x: 0, v: 0, target: 0, spawn: 0 };
let wear = 0.5, wearTarget = 0.5, clock = 0, touring = true, idle = 0, frame = 0, last = 0, visible = false, fresh = 0;
function draw() {
  const dot = (p) => { const [x, y] = iso([SV.x + Math.cos(p.a) * p.r, SV.y + Math.sin(p.a) * p.r, p.z], P); return '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + p.size + '"/>'; };
  group.innerHTML = filter.stuck.concat(filter.moving).map(dot).join("");
  const shift = translateAlong(P, SV.move.map((v) => v * filter.x));
  const [dx, dy] = shift.match(/-?[\\d.]+/g).map(Number);
  for (const g of parts) { g.setAttribute("transform", shift); holdStill(g, [dx, dy]); }
  const word = filter.load > 0.6 ? W.heavy : filter.load > 0.15 ? W.building : W.light;
  const text = filter.x > 0.5 ? W.out : fresh > 0 ? W.fresh : W.filter + ": " + word;
  if (readout.textContent !== text) readout.textContent = text;
  stage.setAttribute("aria-valuenow", String(Math.round(wear * 100)));
  stage.setAttribute("aria-valuetext", text);
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  clock += dt;
  fresh = Math.max(0, fresh - dt);
  if (touring) wearTarget = 0.55 + 0.4 * Math.sin(clock * 0.3);
  wear += (wearTarget - wear) * (1 - Math.exp(-dt / 0.5));
  if (filter.x < 0.05) {
    filter.spawn += dt * (0.6 + 7 * wear);
    while (filter.spawn > 1) { filter.spawn -= 1; filter.moving.push({ a: VIEW + (rand() - 0.5) * 2.6, r: SV.r + 2.6, z: SV.z0 + rand() * (SV.z1 - SV.z0), size: rand() < 0.35 ? 1 : 0.6 }); }
    for (let i = filter.moving.length - 1; i >= 0; i--) { const p = filter.moving[i]; p.r -= dt * 3; if (p.r <= SV.r + 0.4) { filter.moving.splice(i, 1); if (filter.stuck.length < 200) filter.stuck.push(p); } }
    filter.load = Math.min(1, filter.stuck.length / 200);
  }
  for (let i = 0; i < SV.spring.substeps; i++) { const h = dt / SV.spring.substeps; filter.v += ((filter.target - filter.x) * SV.spring.stiffness - filter.v * SV.spring.damping) * h; filter.x += filter.v * h; }
  // a new spin-on goes on clean
  if (filter.x > 0.9 && filter.stuck.length) { filter.stuck = []; filter.moving = []; filter.load = 0; fresh = 2.5; }
  draw();
  frame = visible && !still.matches ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible && !still.matches) { last = 0; frame = requestAnimationFrame(tick); } if (still.matches) { filter.x = filter.target; draw(); } };
const steer = (next) => { touring = false; wearTarget = clamp(next, 0, 1); clearTimeout(idle); idle = setTimeout(() => { touring = true; }, 4000); run(); };
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
stage.addEventListener("pointermove", (event) => {
  const box = svg.getBoundingClientRect();
  filter.target = (event.clientY - box.top) / box.height < 0.25 ? 1 : 0;
  steer(((event.clientX - box.left) / box.width - 0.2) / 0.6);
});
stage.addEventListener("pointerleave", () => { filter.target = 0; run(); });
stage.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight" || event.key === "ArrowUp") steer(wearTarget + 0.1);
  else if (event.key === "ArrowLeft" || event.key === "ArrowDown") steer(wearTarget - 0.1);
  else if (event.key === "e" || event.key === "E") { filter.target = filter.target ? 0 : 1; run(); }
  else return;
  event.preventDefault();
});
draw();
`;

const svg = k.figureSvg({ width: WIDTH, height: HEIGHT, label: COPY.label, body: layers });
const CSS = `<style>.nf-dirt circle{fill:color-mix(in srgb,#4a4a52 80%,var(--anatomy-hi))}</style>`;
const body = PAGE_CSS + CSS + k.plateHtml({
  fig: "Fig 5B",
  title: "ELIMFILTERS · NANOFORCE™ · EH6",
  hint: COPY.hint,
  readout: COPY.readout,
  keys: COPY.keys,
  caption: COPY.caption,
  body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="${COPY.aria}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50">${svg}</div>`,
});

mkdirSync(TARGET.dir, { recursive: true });
writeFileSync(TARGET.path, draftPage(k.pageHtml({ title: COPY.title, theme, body, script: KIT_NOTICE + kitScript() + live }), LANG));
console.log("wrote", TARGET.file, F.R.items.length, "items");
