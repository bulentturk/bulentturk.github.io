import { useId } from "react";

type PortPoint = { x: number; y: number };

export type HydraulicSymbolMeta = {
  width: number;
  height: number;
  ports: Record<string, PortPoint>;
};

const PAD = 44;
const SQ = 34;
const TOP = 23;
const BOT = 57;
const VALVE_2_WIDTH = PAD * 2 + 2 * SQ;
const VALVE_3_WIDTH = PAD * 2 + 3 * SQ;

const META: Record<string, HydraulicSymbolMeta> = {
  junction: { width: 16, height: 16, ports: { a: { x: 0, y: 8 }, b: { x: 16, y: 8 }, c: { x: 8, y: 0 } } },
  tank: { width: 60, height: 50, ports: { t: { x: 30, y: 0 } } },
  pump: { width: 60, height: 90, ports: { out: { x: 30, y: 0 }, in: { x: 30, y: 90 } } },
  gearPump: { width: 60, height: 90, ports: { out: { x: 30, y: 0 }, in: { x: 30, y: 90 } } },
  variablePump: { width: 60, height: 90, ports: { out: { x: 30, y: 0 }, in: { x: 30, y: 90 } } },
  lsPump: { width: 92, height: 90, ports: { out: { x: 30, y: 0 }, in: { x: 30, y: 90 }, ls: { x: 92, y: 54 } } },
  epPump: { width: 92, height: 90, ports: { out: { x: 30, y: 0 }, in: { x: 30, y: 90 } } },
  handPump: { width: 72, height: 90, ports: { out: { x: 30, y: 0 }, in: { x: 30, y: 90 } } },
  cylinder: { width: 140, height: 80, ports: { a: { x: 24, y: 80 }, b: { x: 80, y: 80 } } },
  singleCylinder: { width: 140, height: 80, ports: { p: { x: 24, y: 80 } } },
  doubleRodCylinder: { width: 160, height: 80, ports: { a: { x: 48, y: 80 }, b: { x: 104, y: 80 } } },
  telescopicCylinder: { width: 150, height: 80, ports: { a: { x: 24, y: 80 }, b: { x: 82, y: 80 } } },
  motor: { width: 60, height: 90, ports: { a: { x: 30, y: 0 }, b: { x: 30, y: 90 } } },
  bidirectionalMotor: { width: 60, height: 90, ports: { a: { x: 30, y: 0 }, b: { x: 30, y: 90 } } },
  variableMotor: { width: 60, height: 90, ports: { a: { x: 30, y: 0 }, b: { x: 30, y: 90 } } },
  epMotor: { width: 92, height: 90, ports: { a: { x: 30, y: 0 }, b: { x: 30, y: 90 } } },
  valve43: { width: VALVE_3_WIDTH, height: 80, ports: { a: { x: 87, y: 0 }, b: { x: 103, y: 0 }, p: { x: 87, y: 80 }, t: { x: 103, y: 80 } } },
  valve43Tandem: { width: VALVE_3_WIDTH, height: 80, ports: { a: { x: 87, y: 0 }, b: { x: 103, y: 0 }, p: { x: 87, y: 80 }, t: { x: 103, y: 80 } } },
  valve43Open: { width: VALVE_3_WIDTH, height: 80, ports: { a: { x: 87, y: 0 }, b: { x: 103, y: 0 }, p: { x: 87, y: 80 }, t: { x: 103, y: 80 } } },
  valve43Float: { width: VALVE_3_WIDTH, height: 80, ports: { a: { x: 87, y: 0 }, b: { x: 103, y: 0 }, p: { x: 87, y: 80 }, t: { x: 103, y: 80 } } },
  proportional43: { width: VALVE_3_WIDTH, height: 80, ports: { a: { x: 87, y: 0 }, b: { x: 103, y: 0 }, p: { x: 87, y: 80 }, t: { x: 103, y: 80 } } },
  lsValvePvg16: { width: VALVE_3_WIDTH + 18, height: 80, ports: { a: { x: 87, y: 0 }, b: { x: 103, y: 0 }, p: { x: 87, y: 80 }, t: { x: 103, y: 80 }, ls: { x: VALVE_3_WIDTH + 18, y: 66 } } },
  valve42: { width: VALVE_2_WIDTH, height: 80, ports: { a: { x: 87, y: 0 }, b: { x: 103, y: 0 }, p: { x: 87, y: 80 }, t: { x: 103, y: 80 } } },
  valve32NC: { width: VALVE_2_WIDTH, height: 80, ports: { a: { x: 95, y: 0 }, p: { x: 87, y: 80 }, t: { x: 103, y: 80 } } },
  valve32NO: { width: VALVE_2_WIDTH, height: 80, ports: { a: { x: 95, y: 0 }, p: { x: 87, y: 80 }, t: { x: 103, y: 80 } } },
  valve22NC: { width: VALVE_2_WIDTH, height: 80, ports: { a: { x: 95, y: 0 }, b: { x: 95, y: 80 } } },
  check: { width: 80, height: 40, ports: { a: { x: 0, y: 20 }, b: { x: 80, y: 20 } } },
  pilotCheck: { width: 96, height: 64, ports: { a: { x: 0, y: 24 }, b: { x: 96, y: 24 }, x: { x: 28, y: 64 } } },
  shuttle: { width: 88, height: 48, ports: { a: { x: 0, y: 24 }, b: { x: 88, y: 24 }, c: { x: 44, y: 0 } } },
  logic2Way: { width: 96, height: 64, ports: { a: { x: 0, y: 24 }, b: { x: 96, y: 24 }, x: { x: 28, y: 64 } } },
  diverter3Way: { width: 112, height: 60, ports: { a: { x: 0, y: 30 }, b: { x: 112, y: 20 }, c: { x: 112, y: 40 } } },
  relief: { width: 96, height: 80, ports: { t: { x: 29, y: 0 }, p: { x: 29, y: 80 } } },
  pilotRelief: { width: 100, height: 96, ports: { t: { x: 29, y: 0 }, p: { x: 29, y: 96 }, x: { x: 100, y: 48 } } },
  reducer: { width: 96, height: 80, ports: { a: { x: 29, y: 0 }, b: { x: 29, y: 80 } } },
  reducingRelieving: { width: 96, height: 80, ports: { a: { x: 29, y: 0 }, b: { x: 29, y: 80 } } },
  sequence: { width: 96, height: 80, ports: { a: { x: 29, y: 0 }, b: { x: 29, y: 80 } } },
  unloading: { width: 96, height: 80, ports: { t: { x: 29, y: 0 }, p: { x: 29, y: 80 } } },
  counterbalance: { width: 104, height: 80, ports: { a: { x: 29, y: 0 }, b: { x: 29, y: 80 }, x: { x: 104, y: 64 } } },
  brakeValve: { width: 132, height: 80, ports: { a: { x: 0, y: 22 }, b: { x: 132, y: 22 }, x: { x: 66, y: 80 } } },
  flow: { width: 80, height: 48, ports: { a: { x: 0, y: 24 }, b: { x: 80, y: 24 } } },
  needle: { width: 80, height: 48, ports: { a: { x: 0, y: 24 }, b: { x: 80, y: 24 } } },
  fixedOrifice: { width: 80, height: 48, ports: { a: { x: 0, y: 24 }, b: { x: 80, y: 24 } } },
  throttleCheck: { width: 96, height: 72, ports: { a: { x: 0, y: 36 }, b: { x: 96, y: 36 } } },
  compensatedFlow: { width: 96, height: 72, ports: { a: { x: 0, y: 36 }, b: { x: 96, y: 36 } } },
  priorityFlow: { width: 112, height: 60, ports: { a: { x: 0, y: 30 }, b: { x: 112, y: 20 }, c: { x: 112, y: 40 } } },
  divider: { width: 112, height: 60, ports: { a: { x: 0, y: 30 }, b: { x: 112, y: 20 }, c: { x: 112, y: 40 } } },
  dividerCombiner: { width: 112, height: 60, ports: { a: { x: 0, y: 30 }, b: { x: 112, y: 20 }, c: { x: 112, y: 40 } } },
  epFlow: { width: 112, height: 72, ports: { a: { x: 0, y: 36 }, b: { x: 112, y: 36 } } },
  filter: { width: 72, height: 48, ports: { a: { x: 0, y: 24 }, b: { x: 72, y: 24 } } },
  cooler: { width: 72, height: 48, ports: { a: { x: 0, y: 24 }, b: { x: 72, y: 24 } } },
  heater: { width: 72, height: 48, ports: { a: { x: 0, y: 24 }, b: { x: 72, y: 24 } } },
  breather: { width: 64, height: 72, ports: { p: { x: 32, y: 72 } } },
  accumulator: { width: 40, height: 80, ports: { p: { x: 20, y: 80 } } },
  gauge: { width: 48, height: 60, ports: { p: { x: 24, y: 60 } } },
  pressureSwitch: { width: 76, height: 80, ports: { p: { x: 29, y: 80 } } },
  flowMeter: { width: 72, height: 48, ports: { a: { x: 0, y: 24 }, b: { x: 72, y: 24 } } },
};

export function hydraulicSymbolMeta(kind: string): HydraulicSymbolMeta {
  return META[kind] ?? { width: 96, height: 64, ports: {} };
}

const spring = (x: number, y: number, direction = 1) =>
  `<polyline class="thin" points="${x},${y} ${x + direction * 4},${y - 9} ${x + direction * 8},${y + 9} ${x + direction * 12},${y - 9} ${x + direction * 16},${y + 9} ${x + direction * 20},${y - 9} ${x + direction * 24},${y}"/>`;

const solenoid = (x: number, direction = 1) => {
  const left = direction > 0 ? x : x - 24;
  return `<rect x="${left}" y="28" width="24" height="24"/><path d="M${left + 2} 50L${left + 22} 30"/>`;
};

const CELL: Record<string, (x: number) => string> = {
  flow: (x) => `<path d="M${x + 17} ${BOT - 4}V${TOP + 4}" marker-end="url(#ah)"/>`,
  shut2: (x) => `<path d="M${x + 11} 33H${x + 23}M${x + 17} 33V${TOP}M${x + 11} 47H${x + 23}M${x + 17} 47V${BOT}"/>`,
  shut4: (x) => `<path d="M${x + 3} 33H${x + 15}M${x + 9} 33V${TOP}M${x + 19} 33H${x + 31}M${x + 25} 33V${TOP}M${x + 3} 47H${x + 15}M${x + 9} 47V${BOT}M${x + 19} 47H${x + 31}M${x + 25} 47V${BOT}"/>`,
  cross: (x) => `<path d="M${x + 5} ${BOT - 4}L${x + 29} ${TOP + 4}" marker-end="url(#ah)"/><path d="M${x + 29} ${BOT - 4}L${x + 5} ${TOP + 4}" marker-end="url(#ah)"/>`,
  para: (x) => `<path d="M${x + 9} ${BOT - 4}V${TOP + 4}" marker-end="url(#ah)"/><path d="M${x + 25} ${TOP + 4}V${BOT - 4}" marker-end="url(#ah)"/>`,
  tandem: (x) => `<path d="M${x + 3} 33H${x + 15}M${x + 9} 33V${TOP}M${x + 19} 33H${x + 31}M${x + 25} 33V${TOP}M${x + 9} ${BOT}V45H${x + 25}V${BOT}"/>`,
  open4: (x) => `<path d="M${x + 9} ${TOP}V40H${x + 25}V${TOP}M${x + 9} ${BOT}V40M${x + 25} ${BOT}V40"/><circle class="f" cx="${x + 17}" cy="40" r="2.5"/>`,
  float: (x) => `<path d="M${x + 9} ${TOP}V40H${x + 25}V${TOP}M${x + 25} ${BOT}V40M${x + 3} 47H${x + 15}M${x + 9} 47V${BOT}"/><circle class="f" cx="${x + 21}" cy="40" r="2.5"/>`,
  p2a: (x) => `<path d="M${x + 9} ${BOT - 4}L${x + 17} ${TOP + 4}" marker-end="url(#ah)"/><path d="M${x + 19} 47H${x + 31}M${x + 25} 47V${BOT}"/>`,
  a2t: (x) => `<path d="M${x + 3} 47H${x + 15}M${x + 9} 47V${BOT}"/><path d="M${x + 17} ${TOP + 4}L${x + 25} ${BOT - 4}" marker-end="url(#ah)"/>`,
};

function valveMarkup(kind: string, state: string) {
  let cells: string[] = ["cross", "shut4", "para"];
  let width = VALVE_3_WIDTH;
  if (kind === "valve43Tandem") cells = ["cross", "tandem", "para"];
  if (kind === "valve43Open") cells = ["cross", "open4", "para"];
  if (kind === "valve43Float") cells = ["cross", "float", "para"];
  if (kind === "valve42") {
    cells = ["cross", "para"];
    width = VALVE_2_WIDTH;
  }
  if (kind === "valve32NC") {
    cells = ["p2a", "a2t"];
    width = VALVE_2_WIDTH;
  }
  if (kind === "valve32NO") {
    cells = ["a2t", "p2a"];
    width = VALVE_2_WIDTH;
  }
  if (kind === "valve22NC") {
    cells = ["flow", "shut2"];
    width = VALVE_2_WIDTH;
  }

  const active = state === "extend" ? 0 : state === "retract" ? cells.length - 1 : Math.floor(cells.length / 2);
  const body = cells.map((cell, index) => {
    const x = PAD + index * SQ;
    return `<rect class="${index === active ? "active-box" : ""}" x="${x}" y="${TOP}" width="${SQ}" height="${SQ}"/>${CELL[cell](x)}`;
  }).join("");

  const twoPort = kind === "valve22NC";
  const threePort = kind === "valve32NC" || kind === "valve32NO";
  const leads = twoPort
    ? `<path d="M95 ${TOP}V0M95 ${BOT}V80"/>`
    : threePort
      ? `<path d="M95 ${TOP}V0M87 ${BOT}V80M103 ${BOT}V80"/>`
      : `<path d="M87 ${TOP}V0M103 ${TOP}V0M87 ${BOT}V80M103 ${BOT}V80"/>`;
  const proportional = kind === "proportional43" || kind === "lsValvePvg16"
    ? `<path d="M${PAD} ${TOP - 4}H${PAD + cells.length * SQ}M${PAD} ${BOT + 4}H${PAD + cells.length * SQ}"/>`
    : "";
  const actuators = kind === "valve42" || kind === "valve32NC" || kind === "valve32NO" || kind === "valve22NC"
    ? solenoid(PAD, -1) + spring(width - PAD, 40)
    : solenoid(PAD, -1) + solenoid(width - PAD, 1);
  const ls = kind === "lsValvePvg16"
    ? `<path class="dash" d="M103 80v-14H${VALVE_3_WIDTH + 18}"/>`
    : "";
  return body + leads + proportional + actuators + ls;
}

function dynamicCylinder(kind: string, position: number) {
  const value = Math.max(0, Math.min(100, position));
  if (kind === "doubleRodCylinder") {
    const pistonX = 56 + (value - 50) * 0.34;
    return `<rect x="30" y="18" width="78" height="40"/><path class="thick" d="M${pistonX} 18V58M0 38H160"/><path d="M48 58V80M104 58V80"/>`;
  }
  if (kind === "telescopicCylinder") {
    const stage = value * 0.28;
    return `<rect x="10" y="18" width="70" height="40"/><path class="thick" d="M34 18V58M34 38H${78 + stage}M${78 + stage} 29V47M${78 + stage} 38H${108 + stage}M${108 + stage} 32V44M${108 + stage} 38H${132 + stage * 0.35}"/><path d="M24 58V80M72 58V80"/>`;
  }
  const pistonX = 28 + value * 0.43;
  const rodEnd = 100 + value * 0.3;
  const springBody = kind === "singleCylinder"
    ? `<polyline class="thin" points="${pistonX + 6},38 ${pistonX + 11},29 ${pistonX + 16},47 ${pistonX + 21},29 ${pistonX + 26},47 ${pistonX + 31},38"/>`
    : "";
  const secondPort = kind === "singleCylinder" ? "" : `<path d="M80 58V80"/>`;
  return `<rect x="10" y="18" width="78" height="40"/><path class="thick" d="M${pistonX} 18V58M${pistonX} 38H${rodEnd}"/>${springBody}<path d="M24 58V80"/>${secondPort}`;
}

function symbolMarkup(kind: string, state: string, position: number) {
  if (kind === "junction") return `<circle class="f" cx="8" cy="8" r="4"/>`;
  if (kind === "tank") return `<path d="M6 12V44H54V12M30 0V28"/>`;
  if (kind === "pump" || kind === "gearPump") {
    const gears = kind === "gearPump" ? `<circle cx="22" cy="52" r="6"/><circle cx="38" cy="52" r="6"/>` : "";
    return `<circle cx="30" cy="45" r="26"/><path d="M30 19V0M30 71V90"/><polygon class="f" points="30,21 21,37 39,37"/>${gears}`;
  }
  if (kind === "variablePump" || kind === "lsPump" || kind === "epPump") {
    const control = kind === "lsPump"
      ? `<rect x="64" y="35" width="24" height="20"/><path class="dash" d="M56 64H76V55M88 45H92"/>`
      : kind === "epPump"
        ? `<rect x="64" y="35" width="24" height="20"/><path d="M66 53 86 37"/>`
        : "";
    return `<circle cx="30" cy="45" r="26"/><path d="M30 19V0M30 71V90"/><polygon class="f" points="30,21 21,37 39,37"/><path d="M4 84L56 6" marker-end="url(#ah)"/>${control}`;
  }
  if (kind === "handPump") return `<circle cx="30" cy="45" r="26"/><path d="M30 19V0M30 71V90"/><polygon class="f" points="30,21 21,37 39,37"/><path d="M42 26L58 12M50 6L70 18"/>`;
  if (["cylinder", "singleCylinder", "doubleRodCylinder", "telescopicCylinder"].includes(kind)) return dynamicCylinder(kind, position);
  if (kind === "motor" || kind === "bidirectionalMotor" || kind === "variableMotor" || kind === "epMotor") {
    const second = kind === "bidirectionalMotor" || kind === "variableMotor" || kind === "epMotor"
      ? `<polygon class="f" points="19,67 41,67 30,47"/>`
      : "";
    const variable = kind === "variableMotor" || kind === "epMotor"
      ? `<path d="M4 84L56 6" marker-end="url(#ah)"/>`
      : "";
    const control = kind === "epMotor" ? `<rect x="64" y="35" width="24" height="20"/><path d="M66 53 86 37"/>` : "";
    return `<circle cx="30" cy="45" r="26"/><path d="M30 19V0M30 71V90"/><polygon class="f" points="19,23 41,23 30,43"/>${second}${variable}${control}`;
  }
  if (kind.startsWith("valve") || kind === "proportional43" || kind === "lsValvePvg16") return valveMarkup(kind, state);
  if (kind === "check") return `<path d="M0 20H24"/><circle cx="31" cy="20" r="7"/><path d="M38 6V34M38 20H80"/>`;
  if (kind === "pilotCheck") return `<rect class="dash" x="8" y="4" width="80" height="40"/><path d="M0 24H32"/><circle cx="39" cy="24" r="7"/><path d="M46 12V36M46 24H96"/><path class="dash" d="M28 44V64"/>`;
  if (kind === "shuttle") return `<rect x="16" y="14" width="56" height="20" rx="10"/><circle cx="44" cy="24" r="7"/><path d="M0 24H16M72 24H88M44 14V0"/>`;
  if (kind === "logic2Way") return `<rect class="dash" x="8" y="4" width="80" height="48"/><path d="M0 24H32"/><circle cx="39" cy="24" r="7"/><path d="M46 12V36M46 24H96"/><path class="dash" d="M28 52V64"/>`;
  if (kind === "diverter3Way") return `<rect x="16" y="8" width="68" height="44"/><path d="M0 30H16M84 20H112M84 40H112M24 30L76 20" marker-end="url(#ah)"/>`;
  if (kind === "relief") return `<rect x="20" y="23" width="34" height="34"/><path d="M29 53V27" marker-end="url(#ah)"/><path d="M29 23V0M29 57V80"/>${spring(54, 40)}<path class="dash" d="M29 72H6V40H20"/>`;
  if (kind === "pilotRelief") return `<rect class="dash" x="10" y="8" width="80" height="80"/><rect x="20" y="31" width="34" height="34"/><path d="M29 61V35" marker-end="url(#ah)"/><path d="M29 31V0M29 65V96"/>${spring(54, 48)}<path class="dash" d="M90 48H100"/>`;
  if (["reducer", "reducingRelieving", "sequence", "unloading", "counterbalance"].includes(kind)) {
    const arrow = kind === "counterbalance"
      ? `<path d="M29 53V27" marker-end="url(#ah)"/><path d="M45 27V53" marker-end="url(#ah)"/>`
      : `<path d="M29 53V27" marker-end="url(#ah)"/>`;
    const sensing = kind === "reducer" || kind === "reducingRelieving"
      ? `<path class="dash" d="M29 8H6V40H20"/>`
      : `<path class="dash" d="M29 72H6V40H20"/>`;
    const relieving = kind === "reducingRelieving" ? `<path d="M24 31 48 49"/>` : "";
    return `<rect x="20" y="23" width="34" height="34"/>${arrow}<path d="M29 23V0M29 57V80"/>${spring(54, 40)}${sensing}${relieving}`;
  }
  if (kind === "brakeValve") return `<rect class="dash" x="12" y="8" width="108" height="56"/><path d="M0 22H22m88 0h22M22 14h34v32H22M76 14h34v32H76M31 42V18" marker-end="url(#ah)"/><path d="M101 18V42" marker-end="url(#ah)"/><path class="dash" d="M48 46 84 14M84 46 48 14M66 64V80"/>`;
  if (kind === "flow" || kind === "needle" || kind === "fixedOrifice") {
    const adjustment = kind === "fixedOrifice" ? "" : `<path d="M12 42L68 6" marker-end="url(#ah)"/>`;
    return `<path d="M0 24H80M32 8Q42 24 32 40M48 8Q38 24 48 40"/>${adjustment}`;
  }
  if (kind === "throttleCheck") return `<rect class="dash" x="8" y="10" width="80" height="52"/><path d="M0 36H16M80 36H96M16 36V22H80V36M42 12Q50 22 42 32M58 12Q50 22 58 32M16 36V50H80V36"/><circle cx="40" cy="50" r="6"/><path d="M47 42V58"/>`;
  if (kind === "compensatedFlow" || kind === "epFlow") {
    const extension = kind === "epFlow" ? `<path d="M96 36H112"/>` : "";
    return `<rect class="dash" x="8" y="10" width="80" height="52"/><path d="M0 36H96M40 20Q48 36 40 52M56 20Q48 36 56 52M20 56L76 16" marker-end="url(#ah)"/><path class="thin" d="M14 22L26 34"/>${extension}`;
  }
  if (kind === "priorityFlow" || kind === "divider" || kind === "dividerCombiner") {
    const reverse = kind === "dividerCombiner" ? `<path d="M76 20L24 30M76 40L24 30" marker-end="url(#ah)"/>` : "";
    return `<rect x="16" y="8" width="68" height="44"/><path d="M0 30H16M84 20H112M84 40H112M24 30L76 20M24 30L76 40" marker-end="url(#ah)"/>${reverse}`;
  }
  if (kind === "filter") return `<polygon points="36,8 60,24 36,40 12,24"/><path class="dash" d="M36 8V40"/><path d="M0 24H12M60 24H72"/>`;
  if (kind === "cooler" || kind === "heater") {
    const arrows = kind === "cooler"
      ? `<path d="M30 15V31M42 15V31" marker-end="url(#ah)"/>`
      : `<path d="M30 31V15M42 31V15" marker-end="url(#ah)"/>`;
    return `<polygon points="36,8 60,24 36,40 12,24"/>${arrows}<path d="M0 24H12M60 24H72"/>`;
  }
  if (kind === "breather") return `<path d="M32 72V58M10 58H54M14 58 32 22 50 58ZM20 46H44M23 39H41M27 32H37"/>`;
  if (kind === "accumulator") return `<rect x="4" y="4" width="32" height="56" rx="16"/><path d="M4 22H36M20 60V80"/>`;
  if (kind === "gauge") return `<circle cx="24" cy="20" r="18"/><path d="M24 20L36 8M24 38V60"/>`;
  if (kind === "pressureSwitch") return `<rect x="14" y="34" width="30" height="30"/><path d="M29 60V40" marker-end="url(#ah)"/>${spring(44, 49)}<path d="M29 64V80M29 34V18M20 18L42 8"/>`;
  if (kind === "flowMeter") return `<circle cx="36" cy="24" r="18"/><path d="M0 24H18M54 24H72M28 16L36 24L44 16"/>`;
  return `<path d="M0 32H96"/>`;
}

export default function HydraulicSymbolGraphic({
  kind,
  state = "neutral",
  position = 24,
}: {
  kind: string;
  state?: string;
  position?: number;
}) {
  const markerId = `hyd-arrow-${useId().replace(/:/g, "")}`;
  const meta = hydraulicSymbolMeta(kind);
  const markup = symbolMarkup(kind, state, position).replaceAll("url(#ah)", `url(#${markerId})`);

  return (
    <svg
      aria-hidden="true"
      className="hyd-iso-symbol"
      preserveAspectRatio="xMidYMid meet"
      viewBox={`0 0 ${meta.width} ${meta.height}`}
    >
      <defs>
        <marker id={markerId} markerHeight="6" markerWidth="6" orient="auto" refX="5" refY="3">
          <path className="hyd-arrow-head" d="M0 0 6 3 0 6Z" />
        </marker>
      </defs>
      <g dangerouslySetInnerHTML={{ __html: markup }} />
    </svg>
  );
}
