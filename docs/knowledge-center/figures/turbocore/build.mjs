// DRAFT (internal-only, see ../README.md): TURBOCORE™ turbine-style FH/FG fuel/water separator housing.
// Built with the third-party "anatomy" kit (../.anatomy, pinned in ../README.md). Flow and percentages shown are illustrative, not product data.
// node build.mjs [--light] [--audit]
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { k, G, A, vertical, hexagon, studio, glassBowl, PAGE_CSS, LIVE_BOWL, KIT_NOTICE, draftPage } from "../common.mjs";
import { kitScript } from "../.anatomy/scripts/inline-kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
const WIDTH = 600;
const HEIGHT = 540;

const PLATE = { x: -88, y: -78, w: 176, d: 156, r: 8 };
const WALL = { x: -80, y: -74, w: 160, d: 8, r: 2 };
const WALL_TOP = 214;
const WALL_FACE = WALL.y + WALL.d;

const B = { z0: 36, z1: 80, r: 26, mark: 52, wing: 12, cupR: 13, cupH: 5 };
const CAP_Z = 28;
const VALVE_Z = 22;
const TURB = { r: 20, z0: 64, z1: 78, hub: 7 };
const COLLAR_Z = B.z1;
const BODY_Z = 86;
const BODY_TOP = 168;
const BODY_R = 30;
const LID_TOP = 175;
const STEM_TOP = 186;
const BAR_TOP = 190;
const PORT_Z = 156;
const CLAMP_Z = 128;
const VANES = 14;
const LIFT = 58;
const ELEMENT_R = 24;
const PIECES = { lid: [0, 0, LIFT], stand: [0, 0, 0] };
const SPRING = { stagger: 0.035, stiffness: 46, damping: 13.6, substeps: 4 };

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -15, 0), ...k.boxCorners(WALL, 0, WALL_TOP), [0, 0, BAR_TOP + LIFT + 2], [-20, 0, BAR_TOP + LIFT], [84, 0, PORT_Z], [-84, 0, PORT_Z]],
  WIDTH,
  HEIGHT,
  { pad: 24, azimuth: 40 },
);
const F = studio(P, { order: ["lid", "stand"], spring: SPRING, pieces: PIECES });
const { at, S, L, D, put, hose } = F;

F.plate(PLATE, { strip: { x: -66, y: PLATE.y + PLATE.d - 14, w: 132, d: 6, r: 1 }, label: { x: 44, y: 36, w: 30, d: 18, r: 1.5 } });
F.wall(WALL, WALL_TOP, [[-64, 40], [64, 40], [-64, 96], [64, 96]]);

// cast housing: a plain neck under the lid flange, a finned barrel and a band clamp in one profile
const BODY = vertical(BODY_Z);
const H = BODY_TOP - BODY_Z;
const c0 = CLAMP_Z - BODY_Z, c1 = c0 + 10, R1 = BODY_R + 0.8, RC = BODY_R + 1.8;
const bodyProfile = [[0, 28.5], [1.5, R1], [H, R1]];
const bodyShape = A.solid(BODY, bodyProfile, { name: "body" });
const clampEdges = L(G.arcOf(BODY, c0, R1, P, { trim: 0, least: 0 }) + G.arcOf(BODY, c1, R1, P, { trim: 0, least: 0 }), { tone: "mid" }) + L(G.arcOf(BODY, 12, R1, P, { trim: 0, least: 0 }) + G.arcOf(BODY, H - 18, R1, P, { trim: 0, least: 0 }), { tone: "faint" });
const gland = L(G.circleOf(vertical(BODY_TOP), 0, ELEMENT_R + 0.6, P), { tone: "faint" });
put(
  "body",
  [0, 0, BODY_Z + H / 2],
  S(G.solidOf(bodyProfile, BODY, P), { tone: "mid", inner: clampEdges }) +
    k.fadedSvg(G.ribsOf(BODY, 12, c0, R1, 40, P, { fade: [0.38, 0.8] }), { tone: "lo" }) +
    k.fadedSvg(G.ribsOf(BODY, c1, H - 18, R1, 40, P, { fade: [0.3, 0.75] }), { tone: "lo" }) +
    gland,
  [bodyShape],
);

// wall bracket: a plate on the wall and an arm to the clamp band
const BRACKET = { x: -22, y: WALL_FACE, w: 44, d: 5, r: 1.5 };
put("bracket", [0, WALL_FACE + 2.5, CLAMP_Z + 5], S(k.slabOf(BRACKET, CLAMP_Z - 16, 42, P, 3, 0.5), { tone: "mid" }) + D([[-17, CLAMP_Z - 11], [17, CLAMP_Z - 11], [-17, CLAMP_Z + 21], [17, CLAMP_Z + 21]].map(([x, z]) => at([x, BRACKET.y + BRACKET.d, z])), { size: 0.6, tone: "hi" }), [A.slab(BRACKET, CLAMP_Z - 16, 42, { name: "bracket" })]);
const armEnd = -R1 - 0.05;
const ARM = { x: -6, y: BRACKET.y + BRACKET.d, w: 12, d: armEnd - BRACKET.y - BRACKET.d, r: 1.5 };
put("bracket.arm", [0, (ARM.y + armEnd) / 2, CLAMP_Z + 5], S(k.slabOf(ARM, CLAMP_Z, 10, P, 3, 0.5), { tone: "mid" }), [A.slab(ARM, CLAMP_Z, 10, { name: "bracket.arm" })]);

// inlet and outlet: saddle pads on the curved body, hex fittings, rigid lines with elbows back to the wall
for (const side of [-1, 1]) {
  const name = side < 0 ? "inlet" : "outlet";
  const Fp = G.frameOf([0, 0, PORT_Z], [side, 0, 0], [0, 1, 0], [0, 0, 1]);
  const padTo = R1 + 4;
  put(`${name}.pad`, [side * (R1 + 2), 0, PORT_Z], S(G.saddleOf(Fp, 8, R1, padTo, P), { tone: "mid" }), [A.disc(Fp, Math.sqrt(R1 * R1 - 64) - 0.4, padTo, 8, { name: `${name}.pad`, seated: true, cut: bodyShape })]);
  put(`${name}.hex`, [side * (padTo + 2.75), 0, PORT_Z], S(G.prismOf(Fp, hexagon(6), padTo, padTo + 5.5, P), { tone: "mid" }), [A.prism(Fp, hexagon(6), padTo, padTo + 5.5, { name: `${name}.hex` })]);
  const reach = F.fitting(`${name}.bulkhead`, G.frameOf([side * 70, WALL_FACE, PORT_Z], [0, 1, 0], [1, 0, 0], [0, 0, 1]), { boss: 7, hex: 5.6 });
  const corner = [side * 70, 0, PORT_Z], ballR = 5.2, sink = Math.sqrt(ballR * ballR - 3.4 * 3.4);
  put(`${name}.elbow`, corner, S(G.sphereOf(corner, ballR, P), { tone: "mid" }), [A.ball(corner, ballR, { name: `${name}.elbow` })]);
  hose(`${name}.line`, [[side * (padTo + 5.5), 0, PORT_Z], [side * (70 - sink), 0, PORT_Z]], 3.4);
  hose(`${name}.line`, [[side * 70, -sink, PORT_Z], [side * 70, WALL_FACE + reach, PORT_Z]], 3.4);
}

// lid with its bolt circle and T-handle; lifting it draws the replaceable element out of the housing
const LID = vertical(BODY_TOP);
const lidProfile = [[0, BODY_R + 2], [LID_TOP - BODY_TOP - 1, BODY_R + 2], [LID_TOP - BODY_TOP, BODY_R + 1]];
// brand, technology and series prefix embossed on the lid, in front of the T-handle
const lidMark =
  k.faceTextSvg(k.topMatrix([0, 11], LID_TOP, P, "x"), "ELIMFILTERS", { size: 3.6, tone: "hi", anchor: "middle" }) +
  k.faceTextSvg(k.topMatrix([0, 16.5], LID_TOP, P, "x"), "TURBOCORE™ · ET9", { size: 2.6, tone: "mid", anchor: "middle" });
put("lid", [0, 0, BODY_TOP + 3.5], S(G.solidOf(lidProfile, LID, P), { tone: "mid" }) + D(G.dotsOf(vertical(LID_TOP), 0, BODY_R - 2, 8, P, { all: true, phase: Math.PI / 8 }), { size: 0.7, tone: "hi" }) + L(k.ring(0, 0, BODY_R - 6, LID_TOP, P, 64), { tone: "faint" }) + lidMark, [A.solid(LID, lidProfile, { name: "lid" })], { piece: "lid" });
put("handle.boss", [0, 0, LID_TOP + 1.5], S(k.cylinder(0, 0, 6, LID_TOP, 3, P, 32, 0.5), { tone: "mid" }), [A.cylinder(0, 0, 6, LID_TOP, 3, { name: "handle.boss" })], { piece: "lid" });
put("handle.stem", [0, 0, (LID_TOP + 3 + STEM_TOP) / 2], S(k.cylinder(0, 0, 2.6, LID_TOP + 3, STEM_TOP - LID_TOP - 3, P, 20), { tone: "mid", crease: "none" }), [A.cylinder(0, 0, 2.6, LID_TOP + 3, STEM_TOP - LID_TOP - 3, { name: "handle.stem" })], { piece: "lid" });
const BAR = { x: -16, y: -2.4, w: 32, d: 4.8, r: 2.2 };
put("handle.bar", [0, 0, STEM_TOP + 2], S(k.slabOf(BAR, STEM_TOP, BAR_TOP - STEM_TOP, P, 4, 0.6), { tone: "hi" }), [A.slab(BAR, STEM_TOP, BAR_TOP - STEM_TOP, { name: "handle.bar" })], { piece: "lid" });

const EL = vertical(BODY_TOP);
const ROD = G.rodOut(EL, 0, 0.4, ELEMENT_R, P, { stroke: LIFT });
const pleats = k.fadedSvg(G.ribsOf(EL, -LIFT, -2.6, ELEMENT_R + 0.01, 72, P, { fade: [0.2, 0.7] }), { tone: "lo" });
const element =
  `<clipPath id="tc-element"><path data-hold d="${ROD.clip}"/></clipPath><g clip-path="url(#tc-element)">` +
  S(G.disc(-LIFT, -2.6, ELEMENT_R, EL, P), { tone: "mid", className: "pc-media-solid", inner: pleats }) +
  S(G.disc(-2.6, 0.4, ELEMENT_R + 0.6, EL, P), { tone: "mid" }) +
  `</g>`;
put("element", [0, 0, BODY_TOP], element, [A.slide(EL, 0, 0.4, ELEMENT_R, { name: "element" })], { piece: "lid", bias: -0.5 });

// collar, bowl with the stage-1 turbine deflector inside, drain cap, drain and cup
const C = vertical(COLLAR_Z);
const collarProfile = [[0, B.r + 1], [0.8, B.r + 2.2], [BODY_Z - COLLAR_Z - 0.8, B.r + 2.2], [BODY_Z - COLLAR_Z, B.r + 1]];
put("collar", [0, 0, COLLAR_Z + 3], S(G.solidOf(collarProfile, C, P), { tone: "mid" }) + k.fadedSvg(G.ribsOf(C, 0.8, BODY_Z - COLLAR_Z - 0.8, B.r + 2.2, 44, P, { fade: [0.3, 0.75] }), { tone: "lo" }), [A.solid(C, collarProfile, { name: "collar" })]);
const TF = vertical(TURB.z0);
const turbProfile = [[-(TURB.z0 - 54), TURB.hub], [-2, TURB.r - 2, 1], [0, TURB.r], [TURB.z1 - TURB.z0, TURB.r], [COLLAR_Z - TURB.z0, TURB.r - 3]];
// the deflector is fixed: its helical vanes turn the fuel's own flow into a swirl, nothing rotates
const vanes = k.fadedSvg(G.ribsOf(TF, 0, TURB.z1 - TURB.z0, TURB.r, VANES, P, { twist: -0.7, fade: [0.25, 0.7] }), { tone: "hi" });
const turbine = S(G.solidOf(turbProfile, TF, P), { tone: "mid", inner: L(G.arcOf(TF, 0, TURB.r, P, { trim: 0 }) + G.arcOf(TF, TURB.z1 - TURB.z0, TURB.r, P, { trim: 0 }), { tone: "lo" }) }) + `<g data-part="vanes">${vanes}</g>`;
put("bowl", [0, 0, (B.z0 + B.z1) / 2], glassBowl(P, { ...B, inside: turbine }), [A.cylinder(0, 0, B.r, B.z0, B.z1 - B.z0, { name: "bowl", owner: "bowl" }), A.solid(TF, turbProfile, { name: "turbine", owner: "bowl" })]);
const V0 = vertical(VALVE_Z);
const capProfile = [[0, 6], [CAP_Z - VALVE_Z - 2, 16, 1], [CAP_Z - VALVE_Z, 23], [B.z0 - VALVE_Z, B.r + 1]];
put("cap", [0, 0, (VALVE_Z + B.z0) / 2], S(G.solidOf(capProfile, V0, P), { tone: "mid", inner: L(G.arcOf(V0, B.z0 - VALVE_Z - 2.4, B.r + 0.5, P), { tone: "faint" }) }), [A.solid(V0, capProfile, { name: "cap" })]);
F.drain(VALVE_Z, B.wing);
F.cup(B.cupR, B.cupH, B.wing - 5);

const layers = F.render();
A.auditOrExit(F.R, P);

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label:
    "Carcasa separadora de combustible y agua tipo turbina, con tapa y manija en T, montada con abrazadera a un soporte de pared. A través del vaso transparente se ve el deflector de turbina fijo, que con el propio flujo pone el combustible en remolino y lo centrifuga: el agua, más densa, se desplaza hacia la pared y cae al fondo del vaso, donde un purgador la descarga a una taza. Al levantar la tapa sale el elemento reemplazable.",
  body: layers,
});

const live = `
const P = ${JSON.stringify(P)};
const B = ${JSON.stringify(B)};
const T = ${JSON.stringify({ ...TURB, lift: LIFT, spring: SPRING })};
${LIVE_BOWL}
const lidGroups = [...svg.querySelectorAll('[data-piece="lid"]')];
const VIEW = [Math.cos(P.azimuth * Math.PI / 180), Math.sin(P.azimuth * Math.PI / 180)];
let flow = 0.6, flowTarget = 0.6, spawn = 0, clock = 0, touring = true, idle = 0, frame = 0, last = 0, visible = false;
const lid = { x: 0, v: 0, target: 0 };
const swirl = [];
function draw() {
  const hidden = (p) => p.z > T.z0 - 12 && Math.cos(p.a) * VIEW[0] + Math.sin(p.a) * VIEW[1] < 0;
  drawBowl(swirl.map((p) => ({ at: [p.r * Math.cos(p.a), p.r * Math.sin(p.a), p.z], back: hidden(p) })));
  const lift = translateAlong(P, [0, 0, T.lift * lid.x]);
  const [dx, dy] = lift.match(/-?[\\d.]+/g).map(Number);
  for (const group of lidGroups) { group.setAttribute("transform", lift); holdStill(group, [dx, dy]); }
  const text = (lid.x > 0.5 ? "elemento fuera" : "caudal " + (flow > 0.66 ? "alto" : flow > 0.33 ? "medio" : "bajo")) + " · " + (bowl.open > 0.5 ? "purgando" : bowl.level > 0.85 ? "agua en la marca" : "acumulando agua");
  if (readout.textContent !== text) readout.textContent = text;
  stage.setAttribute("aria-valuenow", String(Math.round(flow * 100)));
  stage.setAttribute("aria-valuetext", text);
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  clock += dt;
  if (touring) flowTarget = 0.55 + 0.4 * Math.sin(clock * 0.3);
  flow += (flowTarget - flow) * (1 - Math.exp(-dt / 0.6));
  // stage 1: the turbine deflector centrifuges the fuel; denser water moves out to the bowl wall and spirals down into the sump
  spawn += dt * (1 + 6 * flow);
  while (spawn > 1) { spawn -= 1; swirl.push({ r: T.r - 2, a: rand() * Math.PI * 2, z: T.z0 - 3 - rand() * 4, v: 4 }); }
  const top = waterTop();
  for (let i = swirl.length - 1; i >= 0; i--) {
    const p = swirl[i];
    p.r = Math.min(p.r + dt * 9, B.r - 2.4);
    p.a += dt * (0.8 + 3.2 * flow) * (T.r / p.r);
    p.v = Math.min(p.v + 30 * dt, 22);
    p.z -= p.v * dt;
    if (p.z <= top) { swirl.splice(i, 1); bowl.level = Math.min(bowl.level + 0.008, 1.06); }
  }
  stepBowl(dt);
  for (let i = 0; i < T.spring.substeps; i++) { const h = dt / T.spring.substeps; lid.v += ((lid.target - lid.x) * T.spring.stiffness - lid.v * T.spring.damping) * h; lid.x += lid.v * h; }
  draw();
  frame = visible && !still.matches ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } if (still.matches) { lid.x = lid.target; draw(); } };
const steer = (next) => { touring = false; flowTarget = clamp(next, 0.05, 1); clearTimeout(idle); idle = setTimeout(() => { touring = true; }, 4000); run(); };
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
stage.addEventListener("pointermove", (event) => {
  const box = svg.getBoundingClientRect();
  lid.target = (event.clientY - box.top) / box.height < 0.3 ? 1 : 0;
  steer(((event.clientX - box.left) / box.width - 0.2) / 0.6);
});
stage.addEventListener("pointerleave", () => { lid.target = 0; run(); });
stage.addEventListener("click", () => { bowl.opening = true; run(); });
stage.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight" || event.key === "ArrowUp") steer(flowTarget + 0.1);
  else if (event.key === "ArrowLeft" || event.key === "ArrowDown") steer(flowTarget - 0.1);
  else if (event.key === "e" || event.key === "E") { lid.target = lid.target ? 0 : 1; run(); }
  else if (event.key === " " || event.key === "Enter") { bowl.opening = true; run(); }
  else return;
  event.preventDefault();
});
draw();
`;

const body = PAGE_CSS + k.plateHtml({
  fig: "Fig 2",
  title: "ELIMFILTERS · TURBOCORE™ · ET9",
  hint: "Cursor: caudal · arriba: tapa · clic: purgar",
  readout: "caudal medio · acumulando agua",
  keys: [
    { mark: "lit", label: "Álabes del deflector de turbina y nivel de agua" },
    { mark: "blue", label: "Agua separada por centrifugado" },
    { mark: "raised", label: "Tapa con manija en T, elemento reemplazable, carcasa con aletas y abrazadera, vaso, purgador" },
  ],
  caption:
    "Ilustración conceptual de una carcasa separadora de combustible/agua tipo turbina (FH/FG), con separación por etapas. En la primera etapa, visible en el vaso, un deflector de turbina fijo pone el combustible en remolino y lo centrifuga: el agua, más densa, se desplaza hacia la pared y decanta al fondo, donde el purgador la descarga. Las etapas siguientes ocurren en el elemento reemplazable, que se retira por la tapa. Es una ilustración conceptual: no muestra datos de producto.",
  body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="Carcasa TURBOCORE: flechas cambian el caudal, E abre la tapa, espacio purga" aria-valuemin="0" aria-valuemax="100" aria-valuenow="60">${svg}</div>`,
});

const name = theme === "light" ? "turbocore-light.html" : "turbocore.html";
writeFileSync(join(HERE, name), draftPage(k.pageHtml({ title: "TURBOCORE carcasa", theme, body, script: KIT_NOTICE + kitScript() + live })));
console.log("wrote", name, F.R.items.length, "items");
