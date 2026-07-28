"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import "./hydraulic-simulator.css";

type Language = "tr" | "en";
type ValveState = "neutral" | "extend" | "retract";
type ComponentKind =
  | "tank"
  | "pump"
  | "variablePump"
  | "cylinder"
  | "singleCylinder"
  | "motor"
  | "valve43"
  | "valve42"
  | "check"
  | "pilotCheck"
  | "shuttle"
  | "relief"
  | "reducer"
  | "sequence"
  | "unloading"
  | "flow"
  | "needle"
  | "divider"
  | "filter"
  | "cooler"
  | "accumulator"
  | "gauge";

type PortName = "in" | "out" | "p" | "t" | "a" | "b" | "c";

type HydraulicNode = {
  id: string;
  kind: ComponentKind;
  x: number;
  y: number;
  label: string;
  params: Record<string, number | string>;
};

type HydraulicEdge = {
  id: string;
  fromNode: string;
  fromPort: PortName;
  toNode: string;
  toPort: PortName;
};

type PortRef = { nodeId: string; port: PortName };
type Issue = { level: "error" | "warning" | "ok"; text: string };

type SimulationResult = {
  pressure: number;
  flow: number;
  reliefFlow: number;
  speed: number;
  force: number;
  power: number;
  activeActuator?: string;
  actuatorKind?: "cylinder" | "motor";
  direction?: "extend" | "retract";
  blocked: boolean;
  highPorts: Set<string>;
  returnPorts: Set<string>;
  suctionPorts: Set<string>;
};

const NODE_WIDTH = 142;
const NODE_HEIGHT = 102;
const STORAGE_KEY = "algo-team-hydraulic-circuit-v1";

const palette: Array<{
  titleTr: string;
  titleEn: string;
  items: ComponentKind[];
}> = [
  { titleTr: "Güç Kaynağı", titleEn: "Power Supply", items: ["tank", "pump", "variablePump"] },
  { titleTr: "Hareket Elemanları", titleEn: "Actuators", items: ["cylinder", "singleCylinder", "motor"] },
  { titleTr: "Yön Kontrol", titleEn: "Directional Control", items: ["valve43", "valve42", "check", "pilotCheck", "shuttle"] },
  { titleTr: "Basınç Kontrol", titleEn: "Pressure Control", items: ["relief", "reducer", "sequence", "unloading"] },
  { titleTr: "Debi Kontrol", titleEn: "Flow Control", items: ["flow", "needle", "divider"] },
  { titleTr: "Şartlandırma", titleEn: "Conditioning", items: ["filter", "cooler"] },
  { titleTr: "Ölçüm ve Depolama", titleEn: "Measurement & Storage", items: ["accumulator", "gauge"] },
];

const names: Record<ComponentKind, { tr: string; en: string; code: string }> = {
  tank: { tr: "Tank", en: "Reservoir", code: "T" },
  pump: { tr: "Sabit Pompa", en: "Fixed Pump", code: "P" },
  variablePump: { tr: "Değişken Pompa", en: "Variable Pump", code: "P↗" },
  cylinder: { tr: "Çift Etkili Silindir", en: "Double-Acting Cylinder", code: "CYL" },
  singleCylinder: { tr: "Tek Etkili Silindir", en: "Single-Acting Cylinder", code: "CYL" },
  motor: { tr: "Hidrolik Motor", en: "Hydraulic Motor", code: "M" },
  valve43: { tr: "4/3 Yön Valfi", en: "4/3 Directional Valve", code: "4/3" },
  valve42: { tr: "4/2 Yön Valfi", en: "4/2 Directional Valve", code: "4/2" },
  check: { tr: "Çek Valf", en: "Check Valve", code: "CV" },
  pilotCheck: { tr: "Pilotlu Çek Valf", en: "Pilot Check Valve", code: "PCV" },
  shuttle: { tr: "VEYA Valfi", en: "Shuttle Valve", code: "OR" },
  relief: { tr: "Basınç Emniyet", en: "Pressure Relief", code: "PRV" },
  reducer: { tr: "Basınç Düşürücü", en: "Pressure Reducing", code: "RED" },
  sequence: { tr: "Sıralama Valfi", en: "Sequence Valve", code: "SEQ" },
  unloading: { tr: "Boşaltma Valfi", en: "Unloading Valve", code: "UNL" },
  flow: { tr: "Debi Ayar Valfi", en: "Flow Control", code: "FCV" },
  needle: { tr: "İğne Valf", en: "Needle Valve", code: "NV" },
  divider: { tr: "Debi Bölücü", en: "Flow Divider", code: "FD" },
  filter: { tr: "Filtre", en: "Filter", code: "FLT" },
  cooler: { tr: "Yağ Soğutucu", en: "Oil Cooler", code: "CLR" },
  accumulator: { tr: "Akümülatör", en: "Accumulator", code: "ACC" },
  gauge: { tr: "Manometre", en: "Pressure Gauge", code: "PG" },
};

const text = {
  tr: {
    title: "Hidrolik Devre Simülatörü",
    back: "Engineering Tools",
    subtitle: "Devreyi kurun, bağlantıları doğrulayın ve akışı çalıştırın.",
    components: "Devre Elemanları",
    search: "Eleman ara…",
    workspace: "Çalışma Alanı",
    properties: "Özellikler",
    simulation: "Simülasyon",
    validation: "Devre Kontrolü",
    run: "Çalıştır",
    stop: "Durdur",
    validate: "Kontrol Et",
    clear: "Temizle",
    save: "Kaydet",
    saved: "Tarayıcıya kaydedildi",
    load: "Kayıtlı Devre",
    examples: "Örnek Devre",
    cylinderExample: "Silindir Kontrolü",
    motorExample: "Motor Kontrolü",
    empty: "Boş Sayfa",
    hint: "Bir elemanı sürükleyin veya dokunarak ekleyin. Bağlantı için iki porta sırayla tıklayın.",
    select: "Ayarlarını değiştirmek için bir devre elemanı seçin.",
    delete: "Elemanı Sil",
    valvePosition: "Valf konumu",
    neutral: "Merkez",
    extend: "Silindir İleri",
    retract: "Silindir Geri",
    pressure: "Basınç",
    flow: "Pompa Debisi",
    speed: "Silindir Hızı",
    force: "Teorik Kuvvet",
    power: "Hidrolik Güç",
    reliefFlow: "Tahliyeye Giden",
    lineLegend: "Hat renkleri",
    pressureLine: "Basınç",
    returnLine: "Dönüş",
    suctionLine: "Emiş",
    inactiveLine: "Pasif",
    connectionReady: "İlk port seçildi. Bağlanacak ikinci porta tıklayın.",
    cancelConnection: "Bağlantıyı iptal et",
    noIssues: "Devre temel kontrolleri geçti.",
    warning: "Uyarı",
    error: "Hata",
    approximation: "Ön boyutlandırma ve eğitim amaçlı kararlı durum modeli. Üreticiye özel dinamik analiz yerine geçmez.",
    params: {
      label: "Etiket",
      pumpFlow: "Debi (L/dk)",
      reliefPressure: "Ayar basıncı (bar)",
      bore: "Piston çapı (mm)",
      rod: "Mil çapı (mm)",
      stroke: "Strok (mm)",
      load: "Harici yük (kN)",
      torque: "Yük torku (Nm)",
      maxFlow: "Ayar debisi (L/dk)",
      setPressure: "Ayar basıncı (bar)",
      displacement: "Deplasman (cm³/dev)",
      precharge: "Ön şarj (bar)",
      position: "Valf konumu",
    },
  },
  en: {
    title: "Hydraulic Circuit Simulator",
    back: "Engineering Tools",
    subtitle: "Build the circuit, validate connections, and run the flow.",
    components: "Circuit Components",
    search: "Search components…",
    workspace: "Workspace",
    properties: "Properties",
    simulation: "Simulation",
    validation: "Circuit Check",
    run: "Run",
    stop: "Stop",
    validate: "Validate",
    clear: "Clear",
    save: "Save",
    saved: "Saved in this browser",
    load: "Saved Circuit",
    examples: "Example Circuit",
    cylinderExample: "Cylinder Control",
    motorExample: "Motor Control",
    empty: "Blank Sheet",
    hint: "Drag a component or tap to add it. To connect, click two ports in sequence.",
    select: "Select a circuit component to edit its settings.",
    delete: "Delete Component",
    valvePosition: "Valve position",
    neutral: "Neutral",
    extend: "Cylinder Extend",
    retract: "Cylinder Retract",
    pressure: "Pressure",
    flow: "Pump Flow",
    speed: "Cylinder Speed",
    force: "Theoretical Force",
    power: "Hydraulic Power",
    reliefFlow: "Relief Flow",
    lineLegend: "Line colors",
    pressureLine: "Pressure",
    returnLine: "Return",
    suctionLine: "Suction",
    inactiveLine: "Inactive",
    connectionReady: "First port selected. Click the second port to connect.",
    cancelConnection: "Cancel connection",
    noIssues: "The circuit passed the basic checks.",
    warning: "Warning",
    error: "Error",
    approximation: "Steady-state model for preliminary sizing and training. It does not replace manufacturer-specific dynamic analysis.",
    params: {
      label: "Label",
      pumpFlow: "Flow (L/min)",
      reliefPressure: "Set pressure (bar)",
      bore: "Bore diameter (mm)",
      rod: "Rod diameter (mm)",
      stroke: "Stroke (mm)",
      load: "External load (kN)",
      torque: "Load torque (Nm)",
      maxFlow: "Set flow (L/min)",
      setPressure: "Set pressure (bar)",
      displacement: "Displacement (cm³/rev)",
      precharge: "Pre-charge (bar)",
      position: "Valve position",
    },
  },
} as const;

function portsFor(kind: ComponentKind): PortName[] {
  if (kind === "tank") return ["t"];
  if (kind === "pump" || kind === "variablePump") return ["in", "out"];
  if (kind === "relief" || kind === "unloading") return ["p", "t"];
  if (kind === "valve43" || kind === "valve42") return ["p", "t", "a", "b"];
  if (kind === "cylinder" || kind === "motor") return ["a", "b"];
  if (kind === "singleCylinder" || kind === "gauge" || kind === "accumulator") return ["p"];
  if (kind === "divider" || kind === "shuttle") return ["a", "b", "c"];
  return ["a", "b"];
}

function defaultParams(kind: ComponentKind): Record<string, number | string> {
  if (kind === "pump" || kind === "variablePump") return { flow: 40, displacement: 28 };
  if (kind === "relief") return { pressure: 160 };
  if (kind === "reducer" || kind === "sequence" || kind === "unloading") return { pressure: 80 };
  if (kind === "cylinder" || kind === "singleCylinder") {
    return { bore: 80, rod: 45, stroke: 500, load: 20 };
  }
  if (kind === "motor") return { displacement: 50, torque: 120 };
  if (kind === "flow" || kind === "needle" || kind === "divider") return { maxFlow: 25 };
  if (kind === "accumulator") return { precharge: 80 };
  if (kind === "valve43" || kind === "valve42") return { state: "neutral" };
  return {};
}

function makeNode(kind: ComponentKind, x: number, y: number, language: Language, id?: string): HydraulicNode {
  return {
    id: id ?? `${kind}-${crypto.randomUUID()}`,
    kind,
    x,
    y,
    label: names[kind][language],
    params: defaultParams(kind),
  };
}

function portPosition(kind: ComponentKind, port: PortName) {
  const middleY = NODE_HEIGHT / 2;
  if (kind === "tank") return { x: NODE_WIDTH / 2, y: 0 };
  if (kind === "gauge" || kind === "accumulator" || kind === "singleCylinder") {
    return { x: NODE_WIDTH / 2, y: NODE_HEIGHT };
  }
  if (kind === "relief" || kind === "unloading") {
    return port === "p"
      ? { x: NODE_WIDTH / 2, y: 0 }
      : { x: NODE_WIDTH / 2, y: NODE_HEIGHT };
  }
  if (kind === "valve43" || kind === "valve42") {
    const positions: Record<PortName, { x: number; y: number }> = {
      p: { x: 42, y: NODE_HEIGHT },
      t: { x: 100, y: NODE_HEIGHT },
      a: { x: 42, y: 0 },
      b: { x: 100, y: 0 },
      in: { x: 0, y: middleY },
      out: { x: NODE_WIDTH, y: middleY },
      c: { x: NODE_WIDTH / 2, y: 0 },
    };
    return positions[port];
  }
  if (kind === "divider" || kind === "shuttle") {
    if (port === "a") return { x: 0, y: middleY };
    if (port === "b") return { x: NODE_WIDTH, y: 28 };
    return { x: NODE_WIDTH, y: 76 };
  }
  const leftPort = port === "in" || port === "a";
  return { x: leftPort ? 0 : NODE_WIDTH, y: middleY };
}

function key(nodeId: string, port: PortName) {
  return `${nodeId}:${port}`;
}

function circuitExample(language: Language, type: "cylinder" | "motor") {
  const tank = makeNode("tank", 50, 430, language, "tank-1");
  const pump = makeNode("pump", 250, 410, language, "pump-1");
  const relief = makeNode("relief", 440, 250, language, "relief-1");
  const valve = makeNode("valve43", 670, 275, language, "valve-1");
  valve.params.state = "extend";
  const actuator = makeNode(type === "cylinder" ? "cylinder" : "motor", 940, 210, language, "actuator-1");
  const nodes = [tank, pump, relief, valve, actuator];
  const edges: HydraulicEdge[] = [
    { id: "e1", fromNode: tank.id, fromPort: "t", toNode: pump.id, toPort: "in" },
    { id: "e2", fromNode: pump.id, fromPort: "out", toNode: relief.id, toPort: "p" },
    { id: "e3", fromNode: pump.id, fromPort: "out", toNode: valve.id, toPort: "p" },
    { id: "e4", fromNode: relief.id, fromPort: "t", toNode: tank.id, toPort: "t" },
    { id: "e5", fromNode: valve.id, fromPort: "t", toNode: tank.id, toPort: "t" },
    { id: "e6", fromNode: valve.id, fromPort: "a", toNode: actuator.id, toPort: "a" },
    { id: "e7", fromNode: valve.id, fromPort: "b", toNode: actuator.id, toPort: "b" },
  ];
  return { nodes, edges };
}

function connectedPorts(edges: HydraulicEdge[]) {
  const result = new Map<string, number>();
  for (const edge of edges) {
    result.set(key(edge.fromNode, edge.fromPort), (result.get(key(edge.fromNode, edge.fromPort)) ?? 0) + 1);
    result.set(key(edge.toNode, edge.toPort), (result.get(key(edge.toNode, edge.toPort)) ?? 0) + 1);
  }
  return result;
}

function validateCircuit(nodes: HydraulicNode[], edges: HydraulicEdge[], language: Language): Issue[] {
  const tr = language === "tr";
  const issues: Issue[] = [];
  const has = (kinds: ComponentKind[]) => nodes.some((node) => kinds.includes(node.kind));
  if (!has(["tank"])) issues.push({ level: "error", text: tr ? "Devrede tank bulunmuyor." : "The circuit has no reservoir." });
  if (!has(["pump", "variablePump"])) issues.push({ level: "error", text: tr ? "Devrede pompa bulunmuyor." : "The circuit has no pump." });
  if (!has(["relief"])) issues.push({ level: "error", text: tr ? "Pompayı koruyan basınç emniyet valfi bulunmuyor." : "No pressure relief valve protects the pump." });
  if (!has(["cylinder", "singleCylinder", "motor"])) issues.push({ level: "warning", text: tr ? "Devrede hareket elemanı bulunmuyor." : "The circuit has no actuator." });

  const connected = connectedPorts(edges);
  for (const node of nodes) {
    for (const port of portsFor(node.kind)) {
      if (!connected.has(key(node.id, port))) {
        const optional = node.kind === "gauge" || node.kind === "accumulator";
        issues.push({
          level: optional ? "warning" : "error",
          text: tr
            ? `${node.label}: ${port.toUpperCase()} portu bağlı değil.`
            : `${node.label}: port ${port.toUpperCase()} is not connected.`,
        });
      }
    }
  }
  if (nodes.length > 0 && issues.length === 0) {
    issues.push({ level: "ok", text: text[language].noIssues });
  }
  return issues;
}

function addInternalLinks(
  adjacency: Map<string, Set<string>>,
  node: HydraulicNode,
  mode: "pressure" | "return" | "suction",
) {
  const link = (from: PortName, to: PortName, bidirectional = false) => {
    const a = key(node.id, from);
    const b = key(node.id, to);
    if (!adjacency.has(a)) adjacency.set(a, new Set());
    adjacency.get(a)!.add(b);
    if (bidirectional) {
      if (!adjacency.has(b)) adjacency.set(b, new Set());
      adjacency.get(b)!.add(a);
    }
  };

  if (node.kind === "pump" || node.kind === "variablePump") {
    if (mode === "pressure") link("in", "out");
    return;
  }
  if (node.kind === "valve43" || node.kind === "valve42") {
    const state = String(node.params.state ?? "neutral") as ValveState;
    if (state === "extend") {
      if (mode === "pressure") link("p", "a");
      if (mode === "return") link("b", "t");
    } else if (state === "retract") {
      if (mode === "pressure") link("p", "b");
      if (mode === "return") link("a", "t");
    }
    return;
  }
  if (node.kind === "check" || node.kind === "pilotCheck") {
    link("a", "b");
    return;
  }
  if (node.kind === "divider" || node.kind === "shuttle") {
    link("a", "b", true);
    link("a", "c", true);
    return;
  }
  if (
    ["flow", "needle", "filter", "cooler", "reducer", "sequence"].includes(node.kind)
  ) {
    link("a", "b", true);
  }
}

function reachable(
  start: string[],
  nodes: HydraulicNode[],
  edges: HydraulicEdge[],
  mode: "pressure" | "return" | "suction",
) {
  const adjacency = new Map<string, Set<string>>();
  const tankIds = new Set(nodes.filter((node) => node.kind === "tank").map((node) => node.id));
  const link = (a: string, b: string) => {
    if (!adjacency.has(a)) adjacency.set(a, new Set());
    if (!adjacency.has(b)) adjacency.set(b, new Set());
    adjacency.get(a)!.add(b);
    adjacency.get(b)!.add(a);
  };
  for (const edge of edges) {
    link(key(edge.fromNode, edge.fromPort), key(edge.toNode, edge.toPort));
  }
  nodes.forEach((node) => addInternalLinks(adjacency, node, mode));
  const seen = new Set(start);
  const queue = [...start];
  while (queue.length) {
    const current = queue.shift()!;
    if (tankIds.has(current.split(":")[0])) continue;
    for (const next of adjacency.get(current) ?? []) {
      if (!seen.has(next)) {
        seen.add(next);
        queue.push(next);
      }
    }
  }
  return seen;
}

function calculateSimulation(nodes: HydraulicNode[], edges: HydraulicEdge[]): SimulationResult {
  const pump = nodes.find((node) => node.kind === "pump" || node.kind === "variablePump");
  const relief = nodes.find((node) => node.kind === "relief");
  const valve = nodes.find((node) => node.kind === "valve43" || node.kind === "valve42");
  const cylinder = nodes.find((node) => node.kind === "cylinder" || node.kind === "singleCylinder");
  const motor = nodes.find((node) => node.kind === "motor");
  const actuator = cylinder ?? motor;
  const state = String(valve?.params.state ?? "neutral") as ValveState;
  const pumpFlow = Number(pump?.params.flow ?? 0);
  const reliefPressure = Number(relief?.params.pressure ?? 160);
  const flowLimit = Math.min(
    pumpFlow,
    ...nodes
      .filter((node) => ["flow", "needle", "divider"].includes(node.kind))
      .map((node) => Number(node.params.maxFlow ?? pumpFlow)),
  );
  const bore = Number(cylinder?.params.bore ?? 80);
  const rod = Number(cylinder?.params.rod ?? 45);
  const load = Number(cylinder?.params.load ?? 20);
  const pistonArea = Math.PI * bore * bore / 4;
  const annulusArea = Math.max(1, pistonArea - Math.PI * rod * rod / 4);
  const workingArea = state === "retract" ? annulusArea : pistonArea;
  const loadPressure = load * 10000 / workingArea;
  const motorDisplacement = Number(motor?.params.displacement ?? 50);
  const motorTorque = Number(motor?.params.torque ?? 0);
  const motorLoadPressure = motorTorque * 20 * Math.PI / Math.max(1, motorDisplacement);
  const blocked = state === "neutral" || !actuator || !pump;
  const demandedPressure = blocked ? reliefPressure : (motor ? motorLoadPressure : loadPressure) + 8;
  const pressure = Math.min(reliefPressure, demandedPressure);
  const canMove = !blocked && demandedPressure < reliefPressure;
  const flow = canMove ? flowLimit : 0;
  const reliefFlow = blocked || !canMove ? pumpFlow : Math.max(0, pumpFlow - flow);
  const speed = motor
    ? flow * 1000 / Math.max(1, motorDisplacement)
    : flow * 1_000_000 / 60 / workingArea;
  const force = motor
    ? pressure * motorDisplacement / (20 * Math.PI)
    : pressure * workingArea / 10_000;
  const power = pressure * pumpFlow / 600;

  const pressureStart = pump ? [key(pump.id, "out")] : [];
  const pressurePorts = reachable(pressureStart, nodes, edges, "pressure");
  if (relief) pressurePorts.add(key(relief.id, "p"));
  const activePort: PortName = state === "retract" ? "b" : "a";
  const returnPort: PortName = state === "retract" ? "a" : "b";
  const returnPorts = actuator && !blocked
    ? reachable([key(actuator.id, returnPort)], nodes, edges, "return")
    : new Set<string>();
  if (relief && reliefFlow > 0) {
    for (const port of reachable([key(relief.id, "t")], nodes, edges, "return")) {
      returnPorts.add(port);
    }
  }
  const suctionPorts = pump ? reachable([key(pump.id, "in")], nodes, edges, "suction") : new Set<string>();

  return {
    pressure,
    flow,
    reliefFlow,
    speed,
    force,
    power,
    activeActuator: actuator?.id,
    actuatorKind: motor ? "motor" : cylinder ? "cylinder" : undefined,
    direction: state === "neutral" ? undefined : state,
    blocked,
    highPorts: pressurePorts,
    returnPorts,
    suctionPorts,
  };
}

function SymbolGraphic({ kind, state = "neutral" }: { kind: ComponentKind; state?: string }) {
  const line = { fill: "none", stroke: "currentColor", strokeWidth: 2 };
  if (kind === "tank") {
    return <svg viewBox="0 0 72 46"><path {...line} d="M12 8v28h48V8M18 18h36" /></svg>;
  }
  if (kind === "pump" || kind === "variablePump") {
    return (
      <svg viewBox="0 0 72 46">
        <circle {...line} cx="36" cy="23" r="18" />
        <path d="M43 23 30 15v16Z" fill="currentColor" />
        {kind === "variablePump" ? <path {...line} d="m18 38 36-30m-7 0h7v7" /> : null}
      </svg>
    );
  }
  if (kind === "cylinder" || kind === "singleCylinder") {
    return (
      <svg viewBox="0 0 72 46">
        <rect {...line} x="8" y="9" width="46" height="28" />
        <path {...line} d="M30 9v28m0-14h34" />
        {kind === "singleCylinder" ? <path {...line} d="m12 34 5-8 5 8 5-8" /> : null}
      </svg>
    );
  }
  if (kind === "motor") {
    return <svg viewBox="0 0 72 46"><circle {...line} cx="36" cy="23" r="18" /><path d="m29 23 13-8v16Z" fill="currentColor" /></svg>;
  }
  if (kind === "valve43" || kind === "valve42") {
    return (
      <svg viewBox="0 0 82 46">
        <rect {...line} x="5" y="7" width="72" height="32" />
        <path {...line} d="M29 7v32m24-32v32" />
        <path
          {...line}
          className={state === "extend" ? "symbol-active" : ""}
          d="m8 32 18-18m-6 0h6v6"
        />
        <path
          {...line}
          className={state === "retract" ? "symbol-active" : ""}
          d="m56 14 18 18m-6 0h6v-6"
        />
        <path {...line} className={state === "neutral" ? "symbol-active" : ""} d="M35 14v18m12-18v18" />
      </svg>
    );
  }
  if (kind === "relief" || kind === "reducer" || kind === "sequence" || kind === "unloading") {
    return (
      <svg viewBox="0 0 72 46">
        <rect {...line} x="20" y="7" width="32" height="32" />
        <path {...line} d="m25 34 22-22m-6 1h7v7M56 11l5 5-5 5 5 5-5 5" />
      </svg>
    );
  }
  if (kind === "check" || kind === "pilotCheck" || kind === "shuttle") {
    return (
      <svg viewBox="0 0 72 46">
        <path {...line} d="M8 23h19m18 0h19M27 12v22l18-11Z" />
        <path {...line} d="M45 12v22" />
        {kind === "pilotCheck" ? <path {...line} d="M36 38v-8" /> : null}
      </svg>
    );
  }
  if (kind === "flow" || kind === "needle" || kind === "divider") {
    return (
      <svg viewBox="0 0 72 46">
        <path {...line} d="M8 23h56M28 12l16 22m0-22L28 34m-4 6L49 6m-6 0h6v6" />
      </svg>
    );
  }
  if (kind === "filter") {
    return <svg viewBox="0 0 72 46"><path {...line} d="M8 23h16m24 0h16M24 8h24v30H24Zm2 27L46 11" /></svg>;
  }
  if (kind === "cooler") {
    return <svg viewBox="0 0 72 46"><path {...line} d="M8 23h14m28 0h14M22 9h28v28H22Zm4 24 20-20m0 20L26 13" /></svg>;
  }
  if (kind === "accumulator") {
    return <svg viewBox="0 0 72 46"><path {...line} d="M24 39V21a12 12 0 0 1 24 0v18M24 24h24" /></svg>;
  }
  if (kind === "gauge") {
    return <svg viewBox="0 0 72 46"><circle {...line} cx="36" cy="22" r="16" /><path {...line} d="m36 22 8-8m-8 24v8" /></svg>;
  }
  return <svg viewBox="0 0 72 46"><path {...line} d="M8 23h56" /></svg>;
}

function PropertyField({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <label className="hyd-field">
      <span>{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

export default function HydraulicSimulator() {
  const initial = useMemo(() => circuitExample("tr", "cylinder"), []);
  const [language, setLanguage] = useState<Language>("tr");
  const [nodes, setNodes] = useState<HydraulicNode[]>(initial.nodes);
  const [edges, setEdges] = useState<HydraulicEdge[]>(initial.edges);
  const [selectedId, setSelectedId] = useState<string | null>("valve-1");
  const [pendingPort, setPendingPort] = useState<PortRef | null>(null);
  const [running, setRunning] = useState(false);
  const [search, setSearch] = useState("");
  const [issuesOpen, setIssuesOpen] = useState(true);
  const [saveStatus, setSaveStatus] = useState("");
  const [pistonPositions, setPistonPositions] = useState<Record<string, number>>({ "actuator-1": 24 });
  const [dragging, setDragging] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const t = text[language];
  const selected = nodes.find((node) => node.id === selectedId);
  const issues = useMemo(() => validateCircuit(nodes, edges, language), [nodes, edges, language]);
  const simulation = useMemo(() => calculateSimulation(nodes, edges), [nodes, edges]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    if (
      !running
      || simulation.actuatorKind !== "cylinder"
      || !simulation.activeActuator
      || !simulation.direction
      || simulation.speed <= 0
    ) return;
    const cylinder = nodes.find((node) => node.id === simulation.activeActuator);
    const stroke = Number(cylinder?.params.stroke ?? 500);
    const interval = window.setInterval(() => {
      setPistonPositions((current) => {
        const old = current[simulation.activeActuator!] ?? 20;
        const delta = simulation.speed * 0.1 / stroke * 100;
        const next = simulation.direction === "extend"
          ? Math.min(100, old + delta)
          : Math.max(0, old - delta);
        return { ...current, [simulation.activeActuator!]: next };
      });
    }, 100);
    return () => window.clearInterval(interval);
  }, [running, simulation.activeActuator, simulation.actuatorKind, simulation.direction, simulation.speed, nodes]);

  useEffect(() => {
    if (!dragging) return;
    const move = (event: PointerEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      setNodes((current) => current.map((node) => node.id === dragging.id
        ? {
            ...node,
            x: Math.max(8, Math.min(1180, event.clientX - rect.left - dragging.offsetX + canvasRef.current!.scrollLeft)),
            y: Math.max(8, Math.min(680, event.clientY - rect.top - dragging.offsetY + canvasRef.current!.scrollTop)),
          }
        : node));
    };
    const up = () => setDragging(null);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up, { once: true });
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [dragging]);

  function updateNode(id: string, updates: Partial<HydraulicNode>) {
    setNodes((current) => current.map((node) => node.id === id ? { ...node, ...updates } : node));
  }

  function changeLanguage(next: Language) {
    setNodes((current) => current.map((node) => ({
      ...node,
      label: node.label === names[node.kind][language] ? names[node.kind][next] : node.label,
    })));
    setLanguage(next);
  }

  function updateParam(id: string, param: string, value: number | string) {
    setNodes((current) => current.map((node) => node.id === id
      ? { ...node, params: { ...node.params, [param]: value } }
      : node));
  }

  function addNode(kind: ComponentKind, x = 520, y = 340) {
    const node = makeNode(kind, x, y, language);
    setNodes((current) => [...current, node]);
    setSelectedId(node.id);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const kind = event.dataTransfer.getData("application/x-hydraulic-component") as ComponentKind;
    if (!kind || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    addNode(
      kind,
      event.clientX - rect.left + canvasRef.current.scrollLeft - NODE_WIDTH / 2,
      event.clientY - rect.top + canvasRef.current.scrollTop - NODE_HEIGHT / 2,
    );
  }

  function onPortClick(nodeId: string, port: PortName) {
    if (!pendingPort) {
      setPendingPort({ nodeId, port });
      return;
    }
    if (pendingPort.nodeId === nodeId && pendingPort.port === port) {
      setPendingPort(null);
      return;
    }
    const duplicate = edges.some((edge) => (
      edge.fromNode === pendingPort.nodeId
      && edge.fromPort === pendingPort.port
      && edge.toNode === nodeId
      && edge.toPort === port
    ) || (
      edge.toNode === pendingPort.nodeId
      && edge.toPort === pendingPort.port
      && edge.fromNode === nodeId
      && edge.fromPort === port
    ));
    if (!duplicate) {
      setEdges((current) => [...current, {
        id: `edge-${crypto.randomUUID()}`,
        fromNode: pendingPort.nodeId,
        fromPort: pendingPort.port,
        toNode: nodeId,
        toPort: port,
      }]);
    }
    setPendingPort(null);
  }

  function deleteSelected() {
    if (!selectedId) return;
    setNodes((current) => current.filter((node) => node.id !== selectedId));
    setEdges((current) => current.filter((edge) => edge.fromNode !== selectedId && edge.toNode !== selectedId));
    setSelectedId(null);
  }

  function loadExample(type: "cylinder" | "motor" | "empty") {
    setRunning(false);
    setPendingPort(null);
    if (type === "empty") {
      setNodes([]);
      setEdges([]);
      setSelectedId(null);
      return;
    }
    const example = circuitExample(language, type);
    setNodes(example.nodes);
    setEdges(example.edges);
    setSelectedId("valve-1");
    setPistonPositions({ "actuator-1": 24 });
  }

  function saveCircuit() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, edges, pistonPositions }));
    setSaveStatus(t.saved);
    window.setTimeout(() => setSaveStatus(""), 2200);
  }

  function loadCircuit() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const saved = JSON.parse(raw) as {
        nodes: HydraulicNode[];
        edges: HydraulicEdge[];
        pistonPositions?: Record<string, number>;
      };
      setNodes(saved.nodes);
      setEdges(saved.edges);
      setPistonPositions(saved.pistonPositions ?? {});
      setSelectedId(null);
      setRunning(false);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  function edgeClass(edge: HydraulicEdge) {
    const a = key(edge.fromNode, edge.fromPort);
    const b = key(edge.toNode, edge.toPort);
    if (!running) return "inactive";
    if (simulation.returnPorts.has(a) && simulation.returnPorts.has(b)) return "return";
    if (simulation.suctionPorts.has(a) && simulation.suctionPorts.has(b)) return "suction";
    if (simulation.highPorts.has(a) && simulation.highPorts.has(b)) return "pressure";
    return "inactive";
  }

  const filteredPalette = palette
    .map((group) => ({
      ...group,
      items: group.items.filter((kind) => {
        const query = search.toLocaleLowerCase(language === "tr" ? "tr-TR" : "en-US");
        return names[kind][language].toLocaleLowerCase(language === "tr" ? "tr-TR" : "en-US").includes(query)
          || names[kind].code.toLowerCase().includes(query);
      }),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <main className="hyd-app">
      <header className="hyd-header">
        <a className="hyd-brand" href="/">
          ALGO<span>TEAM</span>
          <small>{t.back}</small>
        </a>
        <div className="hyd-title">
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>
        <div className="hyd-language" aria-label="Language">
          <button className={language === "tr" ? "active" : ""} onClick={() => changeLanguage("tr")}>TR</button>
          <span>/</span>
          <button className={language === "en" ? "active" : ""} onClick={() => changeLanguage("en")}>EN</button>
        </div>
      </header>

      <section className="hyd-toolbar" aria-label="Circuit toolbar">
        <div className="hyd-toolbar-group">
          <button className={`hyd-run ${running ? "is-running" : ""}`} onClick={() => setRunning((value) => !value)}>
            <i />{running ? t.stop : t.run}
          </button>
          <button onClick={() => setIssuesOpen(true)}>{t.validate}</button>
        </div>
        <div className="hyd-toolbar-group">
          <label>
            <span>{t.examples}</span>
            <select
              defaultValue=""
              onChange={(event) => {
                loadExample(event.target.value as "cylinder" | "motor" | "empty");
                event.currentTarget.value = "";
              }}
            >
              <option value="" disabled>—</option>
              <option value="cylinder">{t.cylinderExample}</option>
              <option value="motor">{t.motorExample}</option>
              <option value="empty">{t.empty}</option>
            </select>
          </label>
        </div>
        <div className="hyd-toolbar-group hyd-toolbar-group--right">
          <button onClick={saveCircuit}>{t.save}</button>
          <button onClick={loadCircuit}>{t.load}</button>
          <button onClick={() => loadExample("empty")}>{t.clear}</button>
          {saveStatus ? <span className="hyd-save-status">{saveStatus}</span> : null}
        </div>
      </section>

      <div className="hyd-layout">
        <aside className="hyd-palette">
          <div className="hyd-panel-heading">
            <span>01</span>
            <h2>{t.components}</h2>
          </div>
          <input
            className="hyd-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t.search}
          />
          <div className="hyd-palette-scroll">
            {filteredPalette.map((group) => (
              <section className="hyd-palette-group" key={group.titleEn}>
                <h3>{language === "tr" ? group.titleTr : group.titleEn}</h3>
                <div>
                  {group.items.map((kind) => (
                    <button
                      draggable
                      key={kind}
                      onClick={() => addNode(kind)}
                      onDragStart={(event) => {
                        event.dataTransfer.setData("application/x-hydraulic-component", kind);
                        event.dataTransfer.effectAllowed = "copy";
                      }}
                      title={names[kind][language]}
                    >
                      <SymbolGraphic kind={kind} />
                      <span>{names[kind][language]}</span>
                      <small>{names[kind].code}</small>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </aside>

        <section className="hyd-workspace">
          <div className="hyd-workspace-head">
            <div>
              <span>02</span>
              <h2>{t.workspace}</h2>
            </div>
            <p>{t.hint}</p>
          </div>
          {pendingPort ? (
            <div className="hyd-connect-notice">
              <span>{t.connectionReady}</span>
              <button onClick={() => setPendingPort(null)}>{t.cancelConnection}</button>
            </div>
          ) : null}
          <div
            className="hyd-canvas-wrap"
            ref={canvasRef}
            onDragOver={(event) => event.preventDefault()}
            onDrop={onDrop}
            onClick={() => setSelectedId(null)}
          >
            <div className="hyd-canvas" aria-label={t.workspace}>
              <svg className="hyd-lines" viewBox="0 0 1350 800" preserveAspectRatio="none">
                {edges.map((edge) => {
                  const from = nodes.find((node) => node.id === edge.fromNode);
                  const to = nodes.find((node) => node.id === edge.toNode);
                  if (!from || !to) return null;
                  const p1 = portPosition(from.kind, edge.fromPort);
                  const p2 = portPosition(to.kind, edge.toPort);
                  const x1 = from.x + p1.x;
                  const y1 = from.y + p1.y;
                  const x2 = to.x + p2.x;
                  const y2 = to.y + p2.y;
                  const midX = (x1 + x2) / 2;
                  const path = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
                  return (
                    <g className={`hyd-line hyd-line--${edgeClass(edge)}`} key={edge.id}>
                      <path className="hyd-line-hit" d={path} onClick={(event) => {
                        event.stopPropagation();
                        setEdges((current) => current.filter((item) => item.id !== edge.id));
                      }} />
                      <path className="hyd-line-visible" d={path} />
                    </g>
                  );
                })}
              </svg>

              {nodes.map((node) => (
                <article
                  className={`hyd-node ${selectedId === node.id ? "is-selected" : ""}`}
                  key={node.id}
                  style={{ left: node.x, top: node.y }}
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedId(node.id);
                  }}
                  onPointerDown={(event: ReactPointerEvent<HTMLElement>) => {
                    if ((event.target as HTMLElement).closest(".hyd-port")) return;
                    const rect = event.currentTarget.getBoundingClientRect();
                    setDragging({ id: node.id, offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top });
                  }}
                >
                  <div className="hyd-node-code">{names[node.kind].code}</div>
                  <div className="hyd-node-symbol">
                    <SymbolGraphic kind={node.kind} state={String(node.params.state ?? "neutral")} />
                    {(node.kind === "cylinder" || node.kind === "singleCylinder") ? (
                      <i
                        className="hyd-piston"
                        style={{ left: `${18 + (pistonPositions[node.id] ?? 20) * 0.48}%` }}
                      />
                    ) : null}
                  </div>
                  <strong>{node.label}</strong>
                  {portsFor(node.kind).map((port) => {
                    const position = portPosition(node.kind, port);
                    const active = pendingPort?.nodeId === node.id && pendingPort.port === port;
                    return (
                      <button
                        className={`hyd-port ${active ? "is-pending" : ""}`}
                        key={port}
                        style={{ left: position.x, top: position.y }}
                        onClick={(event) => {
                          event.stopPropagation();
                          onPortClick(node.id, port);
                        }}
                        title={`${node.label} · ${port.toUpperCase()}`}
                      >
                        <span>{port.toUpperCase()}</span>
                      </button>
                    );
                  })}
                </article>
              ))}
            </div>
          </div>
        </section>

        <aside className="hyd-inspector">
          <div className="hyd-inspector-scroll">
            <section>
              <div className="hyd-panel-heading">
                <span>03</span>
                <h2>{t.properties}</h2>
              </div>
              {selected ? (
                <div className="hyd-properties">
                  <div className="hyd-selected-title">
                    <SymbolGraphic kind={selected.kind} state={String(selected.params.state ?? "neutral")} />
                    <div><small>{names[selected.kind].code}</small><strong>{selected.label}</strong></div>
                  </div>
                  <label className="hyd-field">
                    <span>{t.params.label}</span>
                    <input value={selected.label} onChange={(event) => updateNode(selected.id, { label: event.target.value })} />
                  </label>
                  {(selected.kind === "pump" || selected.kind === "variablePump") ? (
                    <>
                      <PropertyField label={t.params.pumpFlow} value={Number(selected.params.flow)} min={1} max={400} onChange={(value) => updateParam(selected.id, "flow", value)} />
                      <PropertyField label={t.params.displacement} value={Number(selected.params.displacement)} min={1} max={500} onChange={(value) => updateParam(selected.id, "displacement", value)} />
                    </>
                  ) : null}
                  {selected.kind === "relief" ? (
                    <PropertyField label={t.params.reliefPressure} value={Number(selected.params.pressure)} min={1} max={500} onChange={(value) => updateParam(selected.id, "pressure", value)} />
                  ) : null}
                  {["reducer", "sequence", "unloading"].includes(selected.kind) ? (
                    <PropertyField label={t.params.setPressure} value={Number(selected.params.pressure)} min={1} max={500} onChange={(value) => updateParam(selected.id, "pressure", value)} />
                  ) : null}
                  {(selected.kind === "cylinder" || selected.kind === "singleCylinder") ? (
                    <>
                      <PropertyField label={t.params.bore} value={Number(selected.params.bore)} min={10} max={500} onChange={(value) => updateParam(selected.id, "bore", value)} />
                      <PropertyField label={t.params.rod} value={Number(selected.params.rod)} min={1} max={450} onChange={(value) => updateParam(selected.id, "rod", value)} />
                      <PropertyField label={t.params.stroke} value={Number(selected.params.stroke)} min={10} max={5000} onChange={(value) => updateParam(selected.id, "stroke", value)} />
                      <PropertyField label={t.params.load} value={Number(selected.params.load)} min={0} max={1000} onChange={(value) => updateParam(selected.id, "load", value)} />
                    </>
                  ) : null}
                  {selected.kind === "motor" ? (
                    <>
                      <PropertyField label={t.params.displacement} value={Number(selected.params.displacement)} min={1} max={2000} onChange={(value) => updateParam(selected.id, "displacement", value)} />
                      <PropertyField label={t.params.torque} value={Number(selected.params.torque)} min={0} max={10000} onChange={(value) => updateParam(selected.id, "torque", value)} />
                    </>
                  ) : null}
                  {["flow", "needle", "divider"].includes(selected.kind) ? (
                    <PropertyField label={t.params.maxFlow} value={Number(selected.params.maxFlow)} min={0} max={400} onChange={(value) => updateParam(selected.id, "maxFlow", value)} />
                  ) : null}
                  {selected.kind === "accumulator" ? (
                    <PropertyField label={t.params.precharge} value={Number(selected.params.precharge)} min={1} max={500} onChange={(value) => updateParam(selected.id, "precharge", value)} />
                  ) : null}
                  {(selected.kind === "valve43" || selected.kind === "valve42") ? (
                    <label className="hyd-field">
                      <span>{t.params.position}</span>
                      <select value={String(selected.params.state)} onChange={(event) => updateParam(selected.id, "state", event.target.value)}>
                        <option value="neutral">{t.neutral}</option>
                        <option value="extend">{t.extend}</option>
                        <option value="retract">{t.retract}</option>
                      </select>
                    </label>
                  ) : null}
                  <button className="hyd-delete" onClick={deleteSelected}>{t.delete}</button>
                </div>
              ) : <p className="hyd-empty-selection">{t.select}</p>}
            </section>

            <section className="hyd-simulation-panel">
              <div className="hyd-panel-heading">
                <span>04</span>
                <h2>{t.simulation}</h2>
              </div>
              <div className="hyd-gauges">
                <div className="hyd-gauge hyd-gauge--primary">
                  <span>{t.pressure}</span>
                  <strong>{simulation.pressure.toFixed(1)}</strong>
                  <small>bar</small>
                  <i style={{ "--value": `${Math.min(100, simulation.pressure / 2.5)}%` } as React.CSSProperties} />
                </div>
                <div className="hyd-gauge">
                  <span>{t.flow}</span><strong>{simulation.flow.toFixed(1)}</strong><small>L/min</small>
                </div>
                <div className="hyd-gauge">
                  <span>{simulation.actuatorKind === "motor" ? (language === "tr" ? "Motor Devri" : "Motor Speed") : t.speed}</span>
                  <strong>{simulation.speed.toFixed(1)}</strong>
                  <small>{simulation.actuatorKind === "motor" ? "rpm" : "mm/s"}</small>
                </div>
                <div className="hyd-gauge">
                  <span>{simulation.actuatorKind === "motor" ? (language === "tr" ? "Teorik Tork" : "Theoretical Torque") : t.force}</span>
                  <strong>{simulation.force.toFixed(1)}</strong>
                  <small>{simulation.actuatorKind === "motor" ? "Nm" : "kN"}</small>
                </div>
                <div className="hyd-gauge">
                  <span>{t.power}</span><strong>{simulation.power.toFixed(1)}</strong><small>kW</small>
                </div>
                <div className="hyd-gauge">
                  <span>{t.reliefFlow}</span><strong>{simulation.reliefFlow.toFixed(1)}</strong><small>L/min</small>
                </div>
              </div>
              <div className="hyd-legend">
                <span>{t.lineLegend}</span>
                <ul>
                  <li><i className="pressure" />{t.pressureLine}</li>
                  <li><i className="return" />{t.returnLine}</li>
                  <li><i className="suction" />{t.suctionLine}</li>
                  <li><i className="inactive" />{t.inactiveLine}</li>
                </ul>
              </div>
            </section>

            <section className="hyd-validation">
              <button className="hyd-validation-head" onClick={() => setIssuesOpen((value) => !value)}>
                <span>{t.validation}</span>
                <strong>{issues.filter((issue) => issue.level === "error").length}</strong>
              </button>
              {issuesOpen ? (
                <ul>
                  {issues.slice(0, 9).map((issue, index) => (
                    <li className={issue.level} key={`${issue.text}-${index}`}>
                      <i />{issue.text}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
            <p className="hyd-disclaimer">{t.approximation}</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
