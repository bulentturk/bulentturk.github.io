"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import "./hydraulic-simulator.css";

type Language = "tr" | "en";
type ValveState = "neutral" | "extend" | "retract";
type ComponentKind =
  | "junction"
  | "tank"
  | "pump"
  | "gearPump"
  | "variablePump"
  | "lsPump"
  | "epPump"
  | "handPump"
  | "cylinder"
  | "singleCylinder"
  | "doubleRodCylinder"
  | "telescopicCylinder"
  | "motor"
  | "bidirectionalMotor"
  | "variableMotor"
  | "epMotor"
  | "valve43"
  | "valve43Tandem"
  | "valve43Open"
  | "valve43Float"
  | "valve42"
  | "valve32NC"
  | "valve32NO"
  | "valve22NC"
  | "proportional43"
  | "lsValvePvg16"
  | "check"
  | "pilotCheck"
  | "shuttle"
  | "logic2Way"
  | "diverter3Way"
  | "relief"
  | "pilotRelief"
  | "reducer"
  | "reducingRelieving"
  | "sequence"
  | "unloading"
  | "counterbalance"
  | "brakeValve"
  | "flow"
  | "needle"
  | "throttleCheck"
  | "fixedOrifice"
  | "compensatedFlow"
  | "priorityFlow"
  | "divider"
  | "dividerCombiner"
  | "epFlow"
  | "filter"
  | "cooler"
  | "heater"
  | "breather"
  | "accumulator"
  | "gauge"
  | "pressureSwitch"
  | "flowMeter";

type PortName = "in" | "out" | "p" | "t" | "a" | "b" | "c" | "ls" | "x";

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

type Point = { x: number; y: number };
type RoutedEdge = {
  edge: HydraulicEdge;
  points: Point[];
  bridges: Map<number, number[]>;
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
const NODE_HEIGHT = 72;
const SYMBOL_HEIGHT = 72;
const JUNCTION_SIZE = 30;
const CANVAS_WIDTH = 1350;
const CANVAS_HEIGHT = 800;
const ROUTE_MARGIN = 24;
const BRIDGE_RADIUS = 7;
const STORAGE_KEY = "algo-team-hydraulic-circuit-v2";

const PUMP_KINDS: ComponentKind[] = ["pump", "gearPump", "variablePump", "lsPump", "epPump", "handPump"];
const MOTOR_KINDS: ComponentKind[] = ["motor", "bidirectionalMotor", "variableMotor", "epMotor"];
const CYLINDER_KINDS: ComponentKind[] = ["cylinder", "singleCylinder", "doubleRodCylinder", "telescopicCylinder"];
const FOUR_WAY_VALVE_KINDS: ComponentKind[] = [
  "valve43",
  "valve43Tandem",
  "valve43Open",
  "valve43Float",
  "valve42",
  "proportional43",
  "lsValvePvg16",
];
const DIRECTIONAL_VALVE_KINDS: ComponentKind[] = [
  ...FOUR_WAY_VALVE_KINDS,
  "valve32NC",
  "valve32NO",
  "valve22NC",
];
const RELIEF_KINDS: ComponentKind[] = ["relief", "pilotRelief"];
const PRESSURE_SETTING_KINDS: ComponentKind[] = [
  "relief",
  "pilotRelief",
  "reducer",
  "reducingRelieving",
  "sequence",
  "unloading",
  "counterbalance",
  "brakeValve",
];
const FLOW_SETTING_KINDS: ComponentKind[] = [
  "flow",
  "needle",
  "throttleCheck",
  "compensatedFlow",
  "priorityFlow",
  "divider",
  "dividerCombiner",
  "epFlow",
];

const palette: Array<{
  titleTr: string;
  titleEn: string;
  items: ComponentKind[];
}> = [
  { titleTr: "Bağlantılar", titleEn: "Connections", items: ["junction"] },
  { titleTr: "Güç Kaynağı ve Pompalar", titleEn: "Power Supply & Pumps", items: ["tank", "pump", "gearPump", "variablePump", "lsPump", "epPump", "handPump"] },
  { titleTr: "Silindirler", titleEn: "Cylinders", items: ["cylinder", "singleCylinder", "doubleRodCylinder", "telescopicCylinder"] },
  { titleTr: "Hidrolik Motorlar", titleEn: "Hydraulic Motors", items: ["motor", "bidirectionalMotor", "variableMotor", "epMotor"] },
  { titleTr: "Yön Kontrol Valfleri", titleEn: "Directional Control Valves", items: ["valve43", "valve43Tandem", "valve43Open", "valve43Float", "valve42", "valve32NC", "valve32NO", "valve22NC", "proportional43", "lsValvePvg16"] },
  { titleTr: "Çek, Lojik ve Seçici Valfler", titleEn: "Check, Logic & Selector Valves", items: ["check", "pilotCheck", "shuttle", "logic2Way", "diverter3Way"] },
  { titleTr: "Basınç Kontrol Valfleri", titleEn: "Pressure Control Valves", items: ["relief", "pilotRelief", "reducer", "reducingRelieving", "sequence", "unloading", "counterbalance", "brakeValve"] },
  { titleTr: "Akış Kontrol Valfleri", titleEn: "Flow Control Valves", items: ["flow", "needle", "throttleCheck", "fixedOrifice", "compensatedFlow", "priorityFlow", "divider", "dividerCombiner", "epFlow"] },
  { titleTr: "Şartlandırma", titleEn: "Conditioning", items: ["filter", "cooler", "heater", "breather"] },
  { titleTr: "Ölçüm ve Depolama", titleEn: "Measurement & Storage", items: ["accumulator", "gauge", "pressureSwitch", "flowMeter"] },
];

const names: Record<ComponentKind, { tr: string; en: string; code: string }> = {
  junction: { tr: "T Bağlantı", en: "T Junction", code: "T•" },
  tank: { tr: "Tank", en: "Reservoir", code: "T" },
  pump: { tr: "Sabit Pompa", en: "Fixed Pump", code: "P" },
  gearPump: { tr: "Dişli Pompa", en: "Gear Pump", code: "GP" },
  variablePump: { tr: "Değişken Pompa", en: "Variable Pump", code: "P-VAR" },
  lsPump: { tr: "LS Değişken Pompa (A10VO tipi)", en: "LS Variable Pump (A10VO type)", code: "P-LS" },
  epPump: { tr: "Akım Kontrollü Değişken Pompa", en: "Current-Controlled Variable Pump", code: "P-EP" },
  handPump: { tr: "El Pompası", en: "Hand Pump", code: "HP" },
  cylinder: { tr: "Çift Etkili Silindir", en: "Double-Acting Cylinder", code: "CYL" },
  singleCylinder: { tr: "Tek Etkili Silindir", en: "Single-Acting Cylinder", code: "CYL" },
  doubleRodCylinder: { tr: "Çift Milli Silindir", en: "Double-Rod Cylinder", code: "CYL-DR" },
  telescopicCylinder: { tr: "Teleskopik Silindir", en: "Telescopic Cylinder", code: "CYL-T" },
  motor: { tr: "Hidrolik Motor", en: "Hydraulic Motor", code: "M" },
  bidirectionalMotor: { tr: "Çift Yönlü Sabit Motor", en: "Bi-Directional Fixed Motor", code: "M-BI" },
  variableMotor: { tr: "Değişken Motor (Rexroth A6VM tipi)", en: "Variable Motor (Rexroth A6VM type)", code: "M-VAR" },
  epMotor: { tr: "Akım Kontrollü Değişken Motor", en: "Current-Controlled Variable Motor", code: "M-EP" },
  valve43: { tr: "4/3 Kapalı Merkez Valf", en: "4/3 Closed-Center Valve", code: "4/3 C" },
  valve43Tandem: { tr: "4/3 Tandem Merkez Valf", en: "4/3 Tandem-Center Valve", code: "4/3 T" },
  valve43Open: { tr: "4/3 Açık Merkez Valf", en: "4/3 Open-Center Valve", code: "4/3 O" },
  valve43Float: { tr: "4/3 Yüzer Merkez Valf", en: "4/3 Float-Center Valve", code: "4/3 F" },
  valve42: { tr: "4/2 Yön Valfi", en: "4/2 Directional Valve", code: "4/2" },
  valve32NC: { tr: "3/2 Normalde Kapalı Valf", en: "3/2 Normally-Closed Valve", code: "3/2 NC" },
  valve32NO: { tr: "3/2 Normalde Açık Valf", en: "3/2 Normally-Open Valve", code: "3/2 NO" },
  valve22NC: { tr: "2/2 Solenoid Valf NC", en: "2/2 Solenoid Valve NC", code: "2/2 NC" },
  proportional43: { tr: "4/3 Oransal Yön Valfi", en: "4/3 Proportional Directional Valve", code: "4/3 PROP" },
  lsValvePvg16: { tr: "Danfoss PVG 16 LS Valf Dilimi", en: "Danfoss PVG 16 LS Valve Section", code: "PVG16" },
  check: { tr: "Çek Valf", en: "Check Valve", code: "CV" },
  pilotCheck: { tr: "Pilotlu Çek Valf", en: "Pilot Check Valve", code: "PCV" },
  shuttle: { tr: "VEYA Valfi", en: "Shuttle Valve", code: "OR" },
  logic2Way: { tr: "Sun Tipi 2 Yollu Lojik Eleman", en: "Sun-Type 2-Way Logic Element", code: "LOGIC" },
  diverter3Way: { tr: "3 Yollu Seçici Valf", en: "3-Way Diverter Valve", code: "DIV" },
  relief: { tr: "Basınç Emniyet", en: "Pressure Relief", code: "PRV" },
  pilotRelief: { tr: "Pilot Kumandalı Emniyet", en: "Pilot-Operated Relief", code: "PRV-P" },
  reducer: { tr: "Basınç Düşürücü", en: "Pressure Reducing", code: "RED" },
  reducingRelieving: { tr: "Düşürücü / Tahliye Valfi", en: "Reducing / Relieving Valve", code: "RED-R" },
  sequence: { tr: "Sıralama Valfi", en: "Sequence Valve", code: "SEQ" },
  unloading: { tr: "Boşaltma Valfi", en: "Unloading Valve", code: "UNL" },
  counterbalance: { tr: "Sun Tipi Karşı Denge Valfi", en: "Sun-Type Counterbalance Valve", code: "CB" },
  brakeValve: { tr: "Çift Karşı Denge / Fren Valfi", en: "Dual Counterbalance / Brake Valve", code: "DBV" },
  flow: { tr: "Debi Ayar Valfi", en: "Flow Control", code: "FCV" },
  needle: { tr: "İğne Valf", en: "Needle Valve", code: "NV" },
  throttleCheck: { tr: "Kısma + Çek Valf", en: "Throttle Check Valve", code: "T-CV" },
  fixedOrifice: { tr: "Sabit Orifis", en: "Fixed Orifice", code: "ORF" },
  compensatedFlow: { tr: "Basınç Kompanzasyonlu Debi", en: "Pressure-Compensated Flow Control", code: "FC-PC" },
  priorityFlow: { tr: "Sun FREL Tipi Öncelik Valfi", en: "Sun FREL-Type Priority Valve", code: "PRI" },
  divider: { tr: "Debi Bölücü", en: "Flow Divider", code: "FD" },
  dividerCombiner: { tr: "Debi Bölücü / Birleştirici", en: "Flow Divider / Combiner", code: "FD-C" },
  epFlow: { tr: "Elektro-Oransal Debi Valfi", en: "Electro-Proportional Flow Valve", code: "EP-FC" },
  filter: { tr: "Filtre", en: "Filter", code: "FLT" },
  cooler: { tr: "Yağ Soğutucu", en: "Oil Cooler", code: "CLR" },
  heater: { tr: "Yağ Isıtıcı", en: "Oil Heater", code: "HTR" },
  breather: { tr: "Tank Havalandırma Filtresi", en: "Reservoir Breather Filter", code: "BR" },
  accumulator: { tr: "Akümülatör", en: "Accumulator", code: "ACC" },
  gauge: { tr: "Manometre", en: "Pressure Gauge", code: "PG" },
  pressureSwitch: { tr: "Basınç Şalteri", en: "Pressure Switch", code: "PS" },
  flowMeter: { tr: "Debimetre", en: "Flow Meter", code: "FM" },
};

const text = {
  tr: {
    title: "Hidrolik Devre Simülatörü",
    back: "Engineering Tools",
    subtitle: "Devreyi kurun, bağlantıları doğrulayın ve akışı çalıştırın.",
    components: "Devre Elemanları",
    symbolStandard: "ISO 1219 sembol dili",
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
    hint: "İki porta sırayla tıklayın. Mevcut hatta dal vermek için önce portu, sonra hattı seçin.",
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
    pilotLine: "Pilot / LS",
    inactiveLine: "Pasif",
    connectionReady: "İkinci portu veya T bağlantı oluşturmak için mevcut bir hattı seçin.",
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
      lsMargin: "LS marjı (bar)",
      command: "Kontrol akımı (%)",
      pilotRatio: "Pilot oranı",
    },
  },
  en: {
    title: "Hydraulic Circuit Simulator",
    back: "Engineering Tools",
    subtitle: "Build the circuit, validate connections, and run the flow.",
    components: "Circuit Components",
    symbolStandard: "ISO 1219 symbol language",
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
    hint: "Click two ports in sequence. To branch, select a port and then click an existing line.",
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
    pilotLine: "Pilot / LS",
    inactiveLine: "Inactive",
    connectionReady: "Select the second port, or click an existing line to create a T junction.",
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
      lsMargin: "LS margin (bar)",
      command: "Control current (%)",
      pilotRatio: "Pilot ratio",
    },
  },
} as const;

function portsFor(kind: ComponentKind): PortName[] {
  if (kind === "junction") return ["a", "b", "c"];
  if (kind === "tank") return ["t"];
  if (kind === "lsPump") return ["in", "out", "ls"];
  if (PUMP_KINDS.includes(kind)) return ["in", "out"];
  if (kind === "pilotRelief") return ["p", "t", "x"];
  if (["relief", "unloading"].includes(kind)) return ["p", "t"];
  if (kind === "lsValvePvg16") return ["p", "t", "a", "b", "ls"];
  if (FOUR_WAY_VALVE_KINDS.includes(kind)) return ["p", "t", "a", "b"];
  if (kind === "valve32NC" || kind === "valve32NO") return ["p", "t", "a"];
  if (kind === "valve22NC" || kind === "logic2Way") return ["a", "b"];
  if (CYLINDER_KINDS.includes(kind) && kind !== "singleCylinder") return ["a", "b"];
  if (MOTOR_KINDS.includes(kind)) return ["a", "b"];
  if (["singleCylinder", "gauge", "accumulator", "pressureSwitch", "breather"].includes(kind)) return ["p"];
  if (["divider", "dividerCombiner", "shuttle", "diverter3Way", "priorityFlow"].includes(kind)) return ["a", "b", "c"];
  if (kind === "counterbalance" || kind === "brakeValve") return ["a", "b", "x"];
  return ["a", "b"];
}

function defaultParams(kind: ComponentKind): Record<string, number | string> {
  if (PUMP_KINDS.includes(kind)) {
    return {
      flow: kind === "handPump" ? 4 : 40,
      displacement: kind === "handPump" ? 12 : 28,
      lsMargin: kind === "lsPump" ? 18 : 0,
      command: kind === "epPump" ? 100 : 0,
    };
  }
  if (RELIEF_KINDS.includes(kind)) return { pressure: 160 };
  if (["reducer", "reducingRelieving", "sequence", "unloading", "counterbalance", "brakeValve"].includes(kind)) {
    return { pressure: 80, pilotRatio: kind === "counterbalance" || kind === "brakeValve" ? 3 : 0 };
  }
  if (CYLINDER_KINDS.includes(kind)) {
    return { bore: 80, rod: 45, stroke: 500, load: 20 };
  }
  if (MOTOR_KINDS.includes(kind)) {
    return { displacement: 50, torque: 120, command: kind === "epMotor" ? 100 : 0 };
  }
  if (FLOW_SETTING_KINDS.includes(kind)) {
    return { maxFlow: 25, command: kind === "epFlow" ? 100 : 0 };
  }
  if (kind === "accumulator") return { precharge: 80 };
  if (DIRECTIONAL_VALVE_KINDS.includes(kind)) {
    return { state: "neutral", command: kind === "proportional43" || kind === "lsValvePvg16" ? 0 : 0 };
  }
  if (kind === "pilotCheck") return { pilotRatio: 3 };
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

function nodeSize(kind: ComponentKind) {
  return kind === "junction"
    ? { width: JUNCTION_SIZE, height: JUNCTION_SIZE }
    : { width: NODE_WIDTH, height: NODE_HEIGHT };
}

function portPosition(kind: ComponentKind, port: PortName) {
  const { width, height } = nodeSize(kind);
  const middleY = kind === "junction" ? height / 2 : SYMBOL_HEIGHT / 2;
  if (kind === "junction") {
    if (port === "a") return { x: 0, y: middleY };
    if (port === "b") return { x: width, y: middleY };
    return { x: width / 2, y: 0 };
  }
  if (kind === "tank") return { x: width / 2, y: 0 };
  if (CYLINDER_KINDS.includes(kind)) {
    if (kind === "singleCylinder") return { x: 30, y: SYMBOL_HEIGHT };
    return port === "a"
      ? { x: 30, y: SYMBOL_HEIGHT }
      : { x: 91, y: SYMBOL_HEIGHT };
  }
  if (["gauge", "accumulator", "pressureSwitch", "breather"].includes(kind)) {
    return { x: width / 2, y: SYMBOL_HEIGHT };
  }
  if (kind === "relief" || kind === "unloading" || kind === "pilotRelief") {
    if (port === "x") return { x: 0, y: middleY };
    return port === "p"
      ? { x: width / 2, y: 0 }
      : { x: width / 2, y: SYMBOL_HEIGHT };
  }
  if (FOUR_WAY_VALVE_KINDS.includes(kind)) {
    const positions: Record<PortName, { x: number; y: number }> = {
      p: { x: 42, y: SYMBOL_HEIGHT },
      t: { x: 100, y: SYMBOL_HEIGHT },
      a: { x: 42, y: 0 },
      b: { x: 100, y: 0 },
      in: { x: 0, y: middleY },
      out: { x: width, y: middleY },
      c: { x: width / 2, y: 0 },
      ls: { x: width, y: 56 },
      x: { x: 0, y: 56 },
    };
    return positions[port];
  }
  if (kind === "valve32NC" || kind === "valve32NO") {
    if (port === "a") return { x: width / 2, y: 0 };
    return port === "p" ? { x: 42, y: SYMBOL_HEIGHT } : { x: 100, y: SYMBOL_HEIGHT };
  }
  if (["divider", "dividerCombiner", "shuttle", "diverter3Way", "priorityFlow"].includes(kind)) {
    if (port === "a") return { x: 0, y: middleY };
    if (port === "b") return { x: width, y: 22 };
    return { x: width, y: 50 };
  }
  if (kind === "counterbalance" || kind === "brakeValve") {
    if (port === "a") return { x: 0, y: middleY };
    if (port === "b") return { x: width, y: middleY };
    return { x: width / 2, y: SYMBOL_HEIGHT };
  }
  if (kind === "lsPump" && port === "ls") {
    return { x: width / 2, y: 0 };
  }
  const leftPort = port === "in" || port === "a";
  return { x: leftPort ? 0 : width, y: middleY };
}

function key(nodeId: string, port: PortName) {
  return `${nodeId}:${port}`;
}

function portDirection(kind: ComponentKind, port: PortName): Point {
  const position = portPosition(kind, port);
  const { width, height } = nodeSize(kind);
  if (position.x === 0) return { x: -1, y: 0 };
  if (position.x === width) return { x: 1, y: 0 };
  if (position.y === 0) return { x: 0, y: -1 };
  if (position.y === SYMBOL_HEIGHT || position.y === height) return { x: 0, y: 1 };
  return { x: 0, y: 1 };
}

function normalizePoints(points: Point[]) {
  const unique = points.filter((point, index) => (
    index === 0
    || point.x !== points[index - 1].x
    || point.y !== points[index - 1].y
  ));
  const result: Point[] = [];
  for (const point of unique) {
    const a = result.at(-2);
    const b = result.at(-1);
    if (a && b && ((a.x === b.x && b.x === point.x) || (a.y === b.y && b.y === point.y))) {
      result[result.length - 1] = point;
    } else {
      result.push(point);
    }
  }
  return result;
}

function segmentLength(a: Point, b: Point) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function segmentCrossesRect(a: Point, b: Point, node: HydraulicNode) {
  const margin = 14;
  const { width, height } = nodeSize(node.kind);
  const left = node.x - margin;
  const right = node.x + width + margin;
  const top = node.y - margin;
  const bottom = node.y + height + margin;
  if (a.y === b.y) {
    const minX = Math.min(a.x, b.x);
    const maxX = Math.max(a.x, b.x);
    return a.y > top && a.y < bottom && maxX > left && minX < right;
  }
  const minY = Math.min(a.y, b.y);
  const maxY = Math.max(a.y, b.y);
  return a.x > left && a.x < right && maxY > top && minY < bottom;
}

function segmentRelationship(a1: Point, a2: Point, b1: Point, b2: Point) {
  const aHorizontal = a1.y === a2.y;
  const bHorizontal = b1.y === b2.y;
  if (aHorizontal !== bHorizontal) {
    const horizontal = aHorizontal ? [a1, a2] : [b1, b2];
    const vertical = aHorizontal ? [b1, b2] : [a1, a2];
    const x = vertical[0].x;
    const y = horizontal[0].y;
    const insideHorizontal = x > Math.min(horizontal[0].x, horizontal[1].x)
      && x < Math.max(horizontal[0].x, horizontal[1].x);
    const insideVertical = y > Math.min(vertical[0].y, vertical[1].y)
      && y < Math.max(vertical[0].y, vertical[1].y);
    return insideHorizontal && insideVertical ? { type: "cross" as const, x, y } : null;
  }
  if (aHorizontal && a1.y === b1.y) {
    const overlap = Math.min(Math.max(a1.x, a2.x), Math.max(b1.x, b2.x))
      - Math.max(Math.min(a1.x, a2.x), Math.min(b1.x, b2.x));
    return overlap > 0 ? { type: "overlap" as const, length: overlap } : null;
  }
  if (!aHorizontal && a1.x === b1.x) {
    const overlap = Math.min(Math.max(a1.y, a2.y), Math.max(b1.y, b2.y))
      - Math.max(Math.min(a1.y, a2.y), Math.min(b1.y, b2.y));
    return overlap > 0 ? { type: "overlap" as const, length: overlap } : null;
  }
  return null;
}

function scoreRoute(
  points: Point[],
  nodes: HydraulicNode[],
  previousRoutes: Point[][],
  fromNodeId: string,
  toNodeId: string,
) {
  let score = Math.max(0, points.length - 2) * 18;
  for (let index = 0; index < points.length - 1; index += 1) {
    const a = points[index];
    const b = points[index + 1];
    score += segmentLength(a, b);
    if (
      Math.min(a.x, b.x) < 0
      || Math.max(a.x, b.x) > CANVAS_WIDTH
      || Math.min(a.y, b.y) < 0
      || Math.max(a.y, b.y) > CANVAS_HEIGHT
    ) score += 500_000;

    for (const node of nodes) {
      const allowedEndpointSegment = (index === 0 && node.id === fromNodeId)
        || (index === points.length - 2 && node.id === toNodeId);
      if (!allowedEndpointSegment && segmentCrossesRect(a, b, node)) score += 1_000_000;
    }

    for (const route of previousRoutes) {
      for (let otherIndex = 0; otherIndex < route.length - 1; otherIndex += 1) {
        const relationship = segmentRelationship(a, b, route[otherIndex], route[otherIndex + 1]);
        if (relationship?.type === "overlap") score += 2_000 + relationship.length * 30;
        if (relationship?.type === "cross") score += 180;
      }
    }
  }
  return score;
}

function routeConnection(
  edge: HydraulicEdge,
  nodes: HydraulicNode[],
  previousRoutes: Point[][],
) {
  const from = nodes.find((node) => node.id === edge.fromNode);
  const to = nodes.find((node) => node.id === edge.toNode);
  if (!from || !to) return [];
  const fromPort = portPosition(from.kind, edge.fromPort);
  const toPort = portPosition(to.kind, edge.toPort);
  const start = { x: from.x + fromPort.x, y: from.y + fromPort.y };
  const end = { x: to.x + toPort.x, y: to.y + toPort.y };
  const startDirection = portDirection(from.kind, edge.fromPort);
  const endDirection = portDirection(to.kind, edge.toPort);
  const startLead = {
    x: start.x + startDirection.x * ROUTE_MARGIN,
    y: start.y + startDirection.y * ROUTE_MARGIN,
  };
  const endLead = {
    x: end.x + endDirection.x * ROUTE_MARGIN,
    y: end.y + endDirection.y * ROUTE_MARGIN,
  };

  const xCandidates = new Set<number>([
    18,
    CANVAS_WIDTH - 18,
    startLead.x,
    endLead.x,
    Math.round(((startLead.x + endLead.x) / 2) / 10) * 10,
  ]);
  const yCandidates = new Set<number>([
    18,
    CANVAS_HEIGHT - 18,
    startLead.y,
    endLead.y,
    Math.round(((startLead.y + endLead.y) / 2) / 10) * 10,
  ]);
  for (const node of nodes) {
    const { width, height } = nodeSize(node.kind);
    xCandidates.add(Math.max(18, node.x - 28));
    xCandidates.add(Math.min(CANVAS_WIDTH - 18, node.x + width + 28));
    yCandidates.add(Math.max(18, node.y - 28));
    yCandidates.add(Math.min(CANVAS_HEIGHT - 18, node.y + height + 28));
  }

  const candidates: Point[][] = [];
  for (const x of xCandidates) {
    candidates.push(normalizePoints([
      start,
      startLead,
      { x, y: startLead.y },
      { x, y: endLead.y },
      endLead,
      end,
    ]));
  }
  for (const y of yCandidates) {
    candidates.push(normalizePoints([
      start,
      startLead,
      { x: startLead.x, y },
      { x: endLead.x, y },
      endLead,
      end,
    ]));
  }

  return candidates.reduce((best, candidate) => (
    scoreRoute(candidate, nodes, previousRoutes, edge.fromNode, edge.toNode)
      < scoreRoute(best, nodes, previousRoutes, edge.fromNode, edge.toNode)
      ? candidate
      : best
  ));
}

function routeEdges(nodes: HydraulicNode[], edges: HydraulicEdge[]): RoutedEdge[] {
  const routes: Array<{ edge: HydraulicEdge; points: Point[] }> = [];
  for (const edge of edges) {
    const points = routeConnection(edge, nodes, routes.map((route) => route.points));
    if (points.length) routes.push({ edge, points });
  }
  const bridgeMaps = routes.map(() => new Map<number, number[]>());

  for (let first = 0; first < routes.length; first += 1) {
    for (let second = first + 1; second < routes.length; second += 1) {
      const a = routes[first].points;
      const b = routes[second].points;
      for (let ai = 0; ai < a.length - 1; ai += 1) {
        for (let bi = 0; bi < b.length - 1; bi += 1) {
          const relationship = segmentRelationship(a[ai], a[ai + 1], b[bi], b[bi + 1]);
          if (relationship?.type !== "cross") continue;
          const horizontalRoute = a[ai].y === a[ai + 1].y ? first : second;
          const horizontalSegment = horizontalRoute === first ? ai : bi;
          const map = bridgeMaps[horizontalRoute];
          map.set(horizontalSegment, [...(map.get(horizontalSegment) ?? []), relationship.x]);
        }
      }
    }
  }

  return routes.map((route, index) => ({
    ...route,
    bridges: bridgeMaps[index],
  }));
}

function routePath(points: Point[], bridges: Map<number, number[]>) {
  if (!points.length) return "";
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const start = points[index];
    const end = points[index + 1];
    if (start.y !== end.y) {
      path += ` L ${end.x} ${end.y}`;
      continue;
    }
    const direction = end.x >= start.x ? 1 : -1;
    const crossings = [...(bridges.get(index) ?? [])]
      .sort((a, b) => direction > 0 ? a - b : b - a)
      .filter((value, crossingIndex, values) => (
        Math.abs(value - start.x) > BRIDGE_RADIUS + 2
        && Math.abs(value - end.x) > BRIDGE_RADIUS + 2
        && (crossingIndex === 0 || Math.abs(value - values[crossingIndex - 1]) > BRIDGE_RADIUS * 2.5)
      ));
    for (const x of crossings) {
      const before = x - direction * BRIDGE_RADIUS;
      const after = x + direction * BRIDGE_RADIUS;
      path += ` L ${before} ${start.y} Q ${x} ${start.y - BRIDGE_RADIUS * 1.35} ${after} ${start.y}`;
    }
    path += ` L ${end.x} ${end.y}`;
  }
  return path;
}

function circuitExample(language: Language, type: "cylinder" | "motor") {
  const tank = makeNode("tank", 50, 430, language, "tank-1");
  const pump = makeNode("pump", 250, 410, language, "pump-1");
  const junction = makeNode("junction", 410, 431, language, "junction-1");
  const relief = makeNode("relief", 440, 250, language, "relief-1");
  const valve = makeNode("valve43", 670, 275, language, "valve-1");
  valve.params.state = "extend";
  const actuator = makeNode(type === "cylinder" ? "cylinder" : "motor", 940, 210, language, "actuator-1");
  const nodes = [tank, pump, junction, relief, valve, actuator];
  const edges: HydraulicEdge[] = [
    { id: "e1", fromNode: tank.id, fromPort: "t", toNode: pump.id, toPort: "in" },
    { id: "e2", fromNode: pump.id, fromPort: "out", toNode: junction.id, toPort: "a" },
    { id: "e3", fromNode: junction.id, fromPort: "b", toNode: valve.id, toPort: "p" },
    { id: "e3b", fromNode: junction.id, fromPort: "c", toNode: relief.id, toPort: "p" },
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
  if (!has(PUMP_KINDS)) issues.push({ level: "error", text: tr ? "Devrede pompa bulunmuyor." : "The circuit has no pump." });
  if (!has(RELIEF_KINDS)) issues.push({ level: "error", text: tr ? "Pompayı koruyan basınç emniyet valfi bulunmuyor." : "No pressure relief valve protects the pump." });
  if (!has([...CYLINDER_KINDS, ...MOTOR_KINDS])) issues.push({ level: "warning", text: tr ? "Devrede hareket elemanı bulunmuyor." : "The circuit has no actuator." });

  const connected = connectedPorts(edges);
  for (const node of nodes) {
    if (node.kind === "junction") {
      const connectionCount = portsFor(node.kind)
        .reduce((total, port) => total + (connected.get(key(node.id, port)) ?? 0), 0);
      if (connectionCount < 3) {
        issues.push({
          level: "warning",
          text: tr ? "T bağlantının üç kolu da bağlı değil." : "The T junction does not have all three branches connected.",
        });
      }
      continue;
    }
    for (const port of portsFor(node.kind)) {
      if (!connected.has(key(node.id, port))) {
        const optional = ["gauge", "accumulator", "pressureSwitch"].includes(node.kind)
          || port === "ls"
          || port === "x";
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

  if (PUMP_KINDS.includes(node.kind)) {
    if (mode === "pressure") link("in", "out");
    return;
  }
  if (FOUR_WAY_VALVE_KINDS.includes(node.kind)) {
    const state = String(node.params.state ?? "neutral") as ValveState;
    if (state === "extend") {
      if (mode === "pressure") link("p", "a");
      if (mode === "return") link("b", "t");
    } else if (state === "retract") {
      if (mode === "pressure") link("p", "b");
      if (mode === "return") link("a", "t");
    } else if (node.kind === "valve43Open") {
      if (mode === "pressure") link("p", "t");
      if (mode === "return") {
        link("a", "t");
        link("b", "t");
      }
    } else if (node.kind === "valve43Tandem") {
      if (mode === "pressure") link("p", "t");
    } else if (node.kind === "valve43Float" && mode === "return") {
      link("a", "t");
      link("b", "t");
    }
    return;
  }
  if (node.kind === "valve32NC" || node.kind === "valve32NO") {
    const state = String(node.params.state ?? "neutral") as ValveState;
    const open = state !== "neutral" || node.kind === "valve32NO";
    if (open && mode === "pressure") link("p", "a");
    if (!open && mode === "return") link("a", "t");
    return;
  }
  if (node.kind === "valve22NC" || node.kind === "logic2Way") {
    if (String(node.params.state ?? "neutral") !== "neutral") link("a", "b", true);
    return;
  }
  if (node.kind === "junction") {
    link("a", "b", true);
    link("a", "c", true);
    return;
  }
  if (node.kind === "check" || node.kind === "pilotCheck" || node.kind === "throttleCheck") {
    link("a", "b");
    return;
  }
  if (["divider", "dividerCombiner", "shuttle", "diverter3Way", "priorityFlow"].includes(node.kind)) {
    link("a", "b", true);
    link("a", "c", true);
    return;
  }
  if (
    [
      "flow",
      "needle",
      "fixedOrifice",
      "compensatedFlow",
      "epFlow",
      "filter",
      "cooler",
      "heater",
      "flowMeter",
      "reducer",
      "reducingRelieving",
      "sequence",
      "counterbalance",
      "brakeValve",
    ].includes(node.kind)
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
  const pump = nodes.find((node) => PUMP_KINDS.includes(node.kind));
  const relief = nodes.find((node) => RELIEF_KINDS.includes(node.kind));
  const valve = nodes.find((node) => DIRECTIONAL_VALVE_KINDS.includes(node.kind));
  const cylinder = nodes.find((node) => CYLINDER_KINDS.includes(node.kind));
  const motor = nodes.find((node) => MOTOR_KINDS.includes(node.kind));
  const actuator = cylinder ?? motor;
  const state = String(valve?.params.state ?? "neutral") as ValveState;
  const pumpCommand = pump?.kind === "epPump" ? Math.abs(Number(pump.params.command ?? 0)) / 100 : 1;
  const pumpFlow = Number(pump?.params.flow ?? 0) * pumpCommand;
  const reliefPressure = Number(relief?.params.pressure ?? 160);
  const flowLimit = Math.min(
    pumpFlow,
    ...nodes
      .filter((node) => FLOW_SETTING_KINDS.includes(node.kind))
      .map((node) => (
        Number(node.params.maxFlow ?? pumpFlow)
        * (node.kind === "epFlow" ? Math.abs(Number(node.params.command ?? 0)) / 100 : 1)
      )),
  );
  const bore = Number(cylinder?.params.bore ?? 80);
  const rod = Number(cylinder?.params.rod ?? 45);
  const load = Number(cylinder?.params.load ?? 20);
  const pistonArea = Math.PI * bore * bore / 4;
  const annulusArea = Math.max(1, pistonArea - Math.PI * rod * rod / 4);
  const workingArea = state === "retract" ? annulusArea : pistonArea;
  const loadPressure = load * 10000 / workingArea;
  const motorCommand = motor?.kind === "epMotor"
    ? Math.max(0.1, Math.abs(Number(motor.params.command ?? 0)) / 100)
    : 1;
  const motorDisplacement = Number(motor?.params.displacement ?? 50) * motorCommand;
  const motorTorque = Number(motor?.params.torque ?? 0);
  const motorLoadPressure = motorTorque * 20 * Math.PI / Math.max(1, motorDisplacement);
  const blocked = state === "neutral" || !actuator || !pump;
  const unloadedCenter = state === "neutral"
    && (valve?.kind === "valve43Open" || valve?.kind === "valve43Tandem");
  const pressureMargin = pump?.kind === "lsPump" ? Number(pump.params.lsMargin ?? 18) : 8;
  const demandedPressure = unloadedCenter
    ? 5
    : blocked
      ? reliefPressure
      : (motor ? motorLoadPressure : loadPressure) + pressureMargin;
  const pressure = Math.min(reliefPressure, demandedPressure);
  const canMove = !blocked && demandedPressure < reliefPressure;
  const flow = canMove ? flowLimit : 0;
  const reliefFlow = unloadedCenter ? 0 : blocked || !canMove ? pumpFlow : Math.max(0, pumpFlow - flow);
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
  const line = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "square" as const,
    strokeLinejoin: "miter" as const,
    strokeWidth: 1.8,
    vectorEffect: "non-scaling-stroke" as const,
  };
  const svgProps = {
    "aria-hidden": true,
    viewBox: "0 0 120 72",
  };
  const spring = "m0 0 4-5 8 10 8-10 8 10 4-5";
  const variablePumps: ComponentKind[] = ["variablePump", "lsPump", "epPump"];
  const variableMotors: ComponentKind[] = ["variableMotor", "epMotor"];
  const valve43Kinds: ComponentKind[] = [
    "valve43",
    "valve43Tandem",
    "valve43Open",
    "valve43Float",
    "proportional43",
    "lsValvePvg16",
  ];

  if (kind === "junction") {
    return (
      <svg {...svgProps}>
        <path {...line} d="M8 36h104M60 36V8" />
        <circle cx="60" cy="36" r="5" fill="currentColor" />
      </svg>
    );
  }
  if (kind === "tank") {
    return (
      <svg {...svgProps}>
        <path {...line} d="M24 12v46h72V12M31 24h58" />
        <path {...line} d="M60 4v20" />
      </svg>
    );
  }
  if (PUMP_KINDS.includes(kind)) {
    return (
      <svg {...svgProps}>
        <path {...line} d="M8 36h30m44 0h30" />
        <circle {...line} cx="60" cy="36" r="22" />
        <path d="m68 29 13 7-13 7Z" fill="currentColor" />
        {kind === "gearPump" ? (
          <path {...line} d="M45 36h8m14 0h8M54 31l12 10m0-10L54 41" />
        ) : null}
        {variablePumps.includes(kind) ? <path {...line} d="M36 62 86 10m-10 0h10v10" /> : null}
        {kind === "lsPump" ? (
          <>
            <rect {...line} x="45" y="2" width="30" height="10" />
            <path {...line} strokeDasharray="4 3" d="M60 14V2m15 5h25v18" />
            <path {...line} d="M91 25h9m-9 0 3-4m-3 4 3 4" />
          </>
        ) : null}
        {kind === "epPump" ? (
          <>
            <rect {...line} x="88" y="3" width="19" height="13" />
            <path {...line} d="m91 13 13-7m-13 0 13 7M88 10H79" />
          </>
        ) : null}
        {kind === "handPump" ? (
          <path {...line} d="M42 17 24 4m18 13 6 10M20 4h16" />
        ) : null}
      </svg>
    );
  }
  if (CYLINDER_KINDS.includes(kind)) {
    if (kind === "telescopicCylinder") {
      return (
        <svg {...svgProps}>
          <rect {...line} x="12" y="19" width="62" height="34" />
          <path {...line} d="M34 19v34m0-17h27m0-9v18m0-9h27m0-7v14m0-7h24M25 53v19M77 53v19" />
        </svg>
      );
    }
    return (
      <svg {...svgProps}>
        <rect {...line} x={kind === "doubleRodCylinder" ? "20" : "13"} y="18" width={kind === "doubleRodCylinder" ? "80" : "75"} height="36" />
        <path {...line} d={kind === "doubleRodCylinder" ? "M60 18v36M8 36h104M25 54v18M77 54v18" : "M45 18v36m0-18h66M25 54v18"} />
        {kind === "cylinder" ? <path {...line} d="M77 54v18" /> : null}
        {kind === "singleCylinder" ? (
          <path {...line} d="m51 36 5-8 8 16 8-16 8 16 5-8" />
        ) : null}
      </svg>
    );
  }
  if (MOTOR_KINDS.includes(kind)) {
    return (
      <svg {...svgProps}>
        <path {...line} d="M8 36h30m44 0h30" />
        <circle {...line} cx="60" cy="36" r="22" />
        <path d="m52 29-13 7 13 7Z" fill="currentColor" />
        {kind === "bidirectionalMotor" || variableMotors.includes(kind) ? (
          <path d="m68 29 13 7-13 7Z" fill="currentColor" />
        ) : null}
        {variableMotors.includes(kind) ? <path {...line} d="M35 62 86 10m-10 0h10v10" /> : null}
        {kind === "epMotor" ? (
          <>
            <rect {...line} x="88" y="3" width="19" height="13" />
            <path {...line} d="m91 13 13-7m-13 0 13 7M88 10H79" />
          </>
        ) : null}
      </svg>
    );
  }
  if (valve43Kinds.includes(kind)) {
    const centerPath = kind === "valve43Tandem"
      ? "M52 24v9h16v-9M60 33v15M50 24h6m8 0h6"
      : kind === "valve43Open"
        ? "M50 24l20 24m0-24L50 48"
        : kind === "valve43Float"
          ? "M50 24v15h20V24M60 39v9M54 48h12"
          : "M53 25v14m-5 0h10M67 25v14m-5 0h10";
    return (
      <svg {...svgProps}>
        <rect {...line} className={state === "extend" ? "symbol-active-box" : ""} x="15" y="16" width="30" height="40" />
        <rect {...line} className={state === "neutral" ? "symbol-active-box" : ""} x="45" y="16" width="30" height="40" />
        <rect {...line} className={state === "retract" ? "symbol-active-box" : ""} x="75" y="16" width="30" height="40" />
        <path {...line} d="m20 48 20-24m-7 1 7-1-1 7M20 24l20 24m0-7v7l-7-1" />
        <path {...line} d={centerPath} />
        <path {...line} d="m80 24 20 24m-1-7 1 7-7-1M80 48l20-24m-7 1 7-1-1 7" />
        <path {...line} d="M36 0v16M84 0v16M36 56v16M84 56v16" />
        <path {...line} d={`M15 36H7${spring}M105 36h8${spring}`} />
        {kind === "proportional43" || kind === "lsValvePvg16" ? (
          <>
            <path {...line} d="M4 16h11m-8 5 8-10m90 5h11m-11-5 8 10" />
            <rect {...line} x="0" y="9" width="10" height="14" />
            <rect {...line} x="110" y="9" width="10" height="14" />
          </>
        ) : null}
        {kind === "lsValvePvg16" ? (
          <path {...line} strokeDasharray="4 3" d="M60 56v11h52M98 56v11" />
        ) : null}
      </svg>
    );
  }
  if (kind === "valve42") {
    return (
      <svg {...svgProps}>
        <rect {...line} className={state === "extend" || state === "neutral" ? "symbol-active-box" : ""} x="30" y="16" width="30" height="40" />
        <rect {...line} className={state === "retract" ? "symbol-active-box" : ""} x="60" y="16" width="30" height="40" />
        <path {...line} d="m35 48 20-24m-7 1 7-1-1 7M35 24l20 24m0-7v7l-7-1" />
        <path {...line} d="m65 24 20 24m-1-7 1 7-7-1M65 48l20-24m-7 1 7-1-1 7" />
        <path {...line} d="M36 0v16M84 0v16M36 56v16M84 56v16" />
        <path {...line} d={`M30 36h-8${spring}M90 36h8`} />
      </svg>
    );
  }
  if (kind === "valve32NC" || kind === "valve32NO") {
    const normallyOpen = kind === "valve32NO";
    return (
      <svg {...svgProps}>
        <rect {...line} className={state === "neutral" ? "symbol-active-box" : ""} x="30" y="16" width="30" height="40" />
        <rect {...line} className={state !== "neutral" ? "symbol-active-box" : ""} x="60" y="16" width="30" height="40" />
        <path {...line} d={normallyOpen ? "M37 49 53 23m-6 1 6-1-1 6M68 25v14m-5 0h10" : "M38 25v14m-5 0h10M67 49 83 23m-6 1 6-1-1 6"} />
        <path {...line} d="M60 0v16M36 56v16M84 56v16" />
        <path {...line} d={`M30 36H20${spring}M90 36h13`} />
      </svg>
    );
  }
  if (kind === "valve22NC") {
    return (
      <svg {...svgProps}>
        <rect {...line} className={state === "neutral" ? "symbol-active-box" : ""} x="30" y="18" width="30" height="36" />
        <rect {...line} className={state !== "neutral" ? "symbol-active-box" : ""} x="60" y="18" width="30" height="36" />
        <path {...line} d="M38 26v20m-5 0h10m9-20v20m-5 0h10M65 45l20-18m-7 1 7-1-1 7" />
        <path {...line} d={`M30 36H20${spring}`} />
        <rect {...line} x="90" y="26" width="18" height="20" />
        <path {...line} d="m93 42 12-12m-12 0 12 12" />
      </svg>
    );
  }
  if (kind === "check" || kind === "pilotCheck") {
    return (
      <svg {...svgProps}>
        <path {...line} d="M8 36h34m36 0h34M42 22v28l30-14Zm36-14v28" />
        {kind === "pilotCheck" ? (
          <path {...line} strokeDasharray="5 4" d="M60 64V48l18-12" />
        ) : null}
      </svg>
    );
  }
  if (kind === "logic2Way") {
    return (
      <svg {...svgProps}>
        <path {...line} d="M8 36h28m48 0h28" />
        <rect {...line} x="36" y="17" width="48" height="38" />
        <path {...line} d="M42 25v22l24-11Zm30 0v22M60 62V52" />
        <path {...line} strokeDasharray="4 3" d="M60 62h40V36" />
      </svg>
    );
  }
  if (kind === "diverter3Way") {
    return (
      <svg {...svgProps}>
        <path {...line} d="M8 36h35m34-16h35M77 52h35" />
        <rect {...line} x="43" y="16" width="34" height="40" />
        <path {...line} d="M48 36h16l8-14m-8 14 8 14" />
      </svg>
    );
  }
  if (kind === "shuttle") {
    return (
      <svg {...svgProps}>
        <path {...line} d="M8 20h36l16 16 16-16h36M60 36v28" />
        <circle cx="60" cy="36" r="4.5" fill="currentColor" />
        <path {...line} d="M44 12v16m32-16v16" />
      </svg>
    );
  }
  if (PRESSURE_SETTING_KINDS.includes(kind)) {
    if (kind === "brakeValve") {
      return (
        <svg {...svgProps}>
          <path {...line} d="M8 22h22m60 0h22M8 50h22m60 0h22M30 12h60v48H30Z" />
          <path {...line} d="M36 22h15l12 28h21M36 50h15l12-28h21" />
          <path {...line} d="M43 16v12m34 16v12" />
          <path {...line} strokeDasharray="4 3" d="M51 22 63 8l14 14M51 50 63 64l14-14" />
        </svg>
      );
    }
    const isReducer = kind === "reducer" || kind === "reducingRelieving";
    return (
      <svg {...svgProps}>
        <path {...line} d="M60 4v16m0 32v16" />
        <rect {...line} x="42" y="20" width="36" height="32" />
        <path {...line} d={isReducer ? "M60 46V26m-6 7 6-7 6 7" : "M60 46V26m-6 7 6-7 6 7"} />
        <path {...line} d={`M78 36h6${spring}`} />
        {kind === "relief" ? <path {...line} strokeDasharray="5 4" d="M42 46H28V12h32" /> : null}
        {kind === "pilotRelief" ? (
          <>
            <path {...line} strokeDasharray="5 4" d="M42 46H28V12h32M28 36H14" />
            <circle {...line} cx="25" cy="36" r="8" />
          </>
        ) : null}
        {kind === "reducer" ? <path {...line} strokeDasharray="5 4" d="M78 46h14v18H60" /> : null}
        {kind === "reducingRelieving" ? <path {...line} strokeDasharray="5 4" d="M78 46h14v18H60M47 26l26 20" /> : null}
        {kind === "sequence" ? <path {...line} strokeDasharray="5 4" d="M42 46H30V10h30" /> : null}
        {kind === "unloading" ? <path {...line} strokeDasharray="5 4" d="M42 28H28V60h32" /> : null}
        {kind === "counterbalance" ? (
          <>
            <path {...line} d="M32 20v32m-8-16h16M25 26l14 20" />
            <path {...line} strokeDasharray="5 4" d="M42 46H28V64h32" />
          </>
        ) : null}
      </svg>
    );
  }
  if (kind === "flow" || kind === "needle" || kind === "fixedOrifice") {
    return (
      <svg {...svgProps}>
        <path {...line} d="M8 36h40m24 0h40M48 22v28l24-28v28Z" />
        {kind === "needle" ? <path {...line} d="M40 60 80 12m-10 0h10v10" /> : null}
        {kind === "flow" ? <path {...line} d="M40 60 80 12m-10 0h10v10" /> : null}
      </svg>
    );
  }
  if (kind === "throttleCheck") {
    return (
      <svg {...svgProps}>
        <path {...line} d="M8 36h20m64 0h20M28 36v-17h28m36 17V19H64M48 9v20l16-10Zm21 0v20M42 52l36-34m-10 0h10v10" />
      </svg>
    );
  }
  if (kind === "compensatedFlow" || kind === "epFlow") {
    return (
      <svg {...svgProps}>
        <path {...line} d="M8 36h26m52 0h26M34 22v28l22-28v28Z" />
        <rect {...line} x="58" y="22" width="28" height="28" />
        <path {...line} d="M64 42 80 30m-7 0h7v7" />
        {kind === "epFlow" ? (
          <>
            <rect {...line} x="72" y="3" width="20" height="13" />
            <path {...line} d="m75 13 14-7m-14 0 14 7M82 16v6" />
          </>
        ) : null}
      </svg>
    );
  }
  if (kind === "priorityFlow") {
    return (
      <svg {...svgProps}>
        <path {...line} d="M8 36h32m40-17h32M80 53h32" />
        <rect {...line} x="40" y="14" width="40" height="44" />
        <path {...line} d="M46 36h17m0 0 12-15m-12 15 12 15M50 21v30" />
        <path {...line} d={`M52 14v-6${spring}`} />
      </svg>
    );
  }
  if (kind === "divider" || kind === "dividerCombiner") {
    return (
      <svg {...svgProps}>
        <path {...line} d="M8 36h34m36-14h34M78 50h34" />
        <rect {...line} x="42" y="16" width="36" height="40" />
        <path {...line} d="M48 36h24m0 0-10-10m10 10L62 46" />
        {kind === "dividerCombiner" ? <path {...line} d="M48 27 60 36 48 45" /> : null}
      </svg>
    );
  }
  if (kind === "filter") {
    return (
      <svg {...svgProps}>
        <path {...line} d="M8 36h28m48 0h28M36 36l24-24 24 24-24 24Z" />
        <path {...line} d="M44 52 76 20" />
      </svg>
    );
  }
  if (kind === "cooler" || kind === "heater") {
    return (
      <svg {...svgProps}>
        <path {...line} d="M8 36h28m48 0h28M36 36l24-24 24 24-24 24Z" />
        {kind === "cooler"
          ? <path {...line} d="m48 45 9-18m6 18 9-18M50 55l-4-8 8 1m10 7-4-8 8 1" />
          : <path {...line} d="m47 44 8-16 8 16 8-16M46 55l6-7m12 7 6-7" />}
      </svg>
    );
  }
  if (kind === "breather") {
    return (
      <svg {...svgProps}>
        <path {...line} d="M60 68V52M38 52h44M42 52l18-32 18 32ZM48 40h24M51 34h18M55 28h10" />
      </svg>
    );
  }
  if (kind === "accumulator") {
    return (
      <svg {...svgProps}>
        <path {...line} d="M60 66V56M34 56V31a26 26 0 0 1 52 0v25ZM34 36h52" />
        <path {...line} d="M40 26h40" />
      </svg>
    );
  }
  if (kind === "gauge") {
    return (
      <svg {...svgProps}>
        <circle {...line} cx="60" cy="32" r="25" />
        <path {...line} d="m60 32 14-14M60 57v11" />
      </svg>
    );
  }
  if (kind === "pressureSwitch") {
    return (
      <svg {...svgProps}>
        <circle {...line} cx="48" cy="32" r="23" />
        <path {...line} d="M48 55v13m0-36 13-13M72 18h18m-18 0 13 12m-13-12 13-12" />
      </svg>
    );
  }
  if (kind === "flowMeter") {
    return (
      <svg {...svgProps}>
        <path {...line} d="M8 36h28m48 0h28" />
        <circle {...line} cx="60" cy="36" r="24" />
        <path {...line} d="M45 42h30M51 31l9-7 9 7" />
      </svg>
    );
  }
  return <svg {...svgProps}><path {...line} d="M8 36h104" /></svg>;
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
  const routedEdges = useMemo(() => routeEdges(nodes, edges), [nodes, edges]);

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
      setNodes((current) => current.map((node) => {
        if (node.id !== dragging.id) return node;
        const { width, height } = nodeSize(node.kind);
        return {
          ...node,
          x: Math.max(8, Math.min(CANVAS_WIDTH - width - 8, event.clientX - rect.left - dragging.offsetX + canvasRef.current!.scrollLeft)),
          y: Math.max(8, Math.min(CANVAS_HEIGHT - height - 8, event.clientY - rect.top - dragging.offsetY + canvasRef.current!.scrollTop)),
        };
      }));
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

  function onLineClick(route: RoutedEdge, event: ReactMouseEvent<SVGPathElement>) {
    event.stopPropagation();
    if (!pendingPort) {
      setEdges((current) => current.filter((item) => item.id !== route.edge.id));
      return;
    }
    const svg = event.currentTarget.ownerSVGElement;
    const rect = svg?.getBoundingClientRect();
    if (!rect) return;
    const clickedX = (event.clientX - rect.left) * CANVAS_WIDTH / rect.width;
    const clickedY = (event.clientY - rect.top) * CANVAS_HEIGHT / rect.height;
    const junctionX = Math.max(8, Math.min(CANVAS_WIDTH - JUNCTION_SIZE - 8, Math.round(clickedX / 10) * 10 - JUNCTION_SIZE / 2));
    const junctionY = Math.max(8, Math.min(CANVAS_HEIGHT - JUNCTION_SIZE - 8, Math.round(clickedY / 10) * 10 - JUNCTION_SIZE / 2));
    const junction = makeNode("junction", junctionX, junctionY, language);
    setNodes((current) => [...current, junction]);
    setEdges((current) => [
      ...current.filter((item) => item.id !== route.edge.id),
      {
        id: `edge-${crypto.randomUUID()}`,
        fromNode: route.edge.fromNode,
        fromPort: route.edge.fromPort,
        toNode: junction.id,
        toPort: "a",
      },
      {
        id: `edge-${crypto.randomUUID()}`,
        fromNode: junction.id,
        fromPort: "b",
        toNode: route.edge.toNode,
        toPort: route.edge.toPort,
      },
      {
        id: `edge-${crypto.randomUUID()}`,
        fromNode: pendingPort.nodeId,
        fromPort: pendingPort.port,
        toNode: junction.id,
        toPort: "c",
      },
    ]);
    setPendingPort(null);
    setSelectedId(junction.id);
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
    if (["ls", "x"].includes(edge.fromPort) || ["ls", "x"].includes(edge.toPort)) return "pilot";
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
    <main className={`hyd-app ${pendingPort ? "is-connecting" : ""}`}>
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
            <small className="hyd-standard">{t.symbolStandard}</small>
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
              <svg className="hyd-lines" viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`} preserveAspectRatio="none">
                {routedEdges.map((route) => {
                  const path = routePath(route.points, route.bridges);
                  return (
                    <g className={`hyd-line hyd-line--${edgeClass(route.edge)}`} key={route.edge.id}>
                      <path className="hyd-line-hit" d={path} onClick={(event) => onLineClick(route, event)} />
                      <path className="hyd-line-visible" d={path} />
                    </g>
                  );
                })}
              </svg>

              {nodes.map((node) => (
                <article
                  className={`hyd-node ${node.kind === "junction" ? "hyd-node--junction" : ""} ${selectedId === node.id ? "is-selected" : ""}`}
                  key={node.id}
                  title={node.label}
                  style={{
                    left: node.x,
                    top: node.y,
                    width: nodeSize(node.kind).width,
                    height: nodeSize(node.kind).height,
                  }}
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
                  {PUMP_KINDS.includes(selected.kind) ? (
                    <>
                      <PropertyField label={t.params.pumpFlow} value={Number(selected.params.flow)} min={1} max={400} onChange={(value) => updateParam(selected.id, "flow", value)} />
                      <PropertyField label={t.params.displacement} value={Number(selected.params.displacement)} min={1} max={500} onChange={(value) => updateParam(selected.id, "displacement", value)} />
                    </>
                  ) : null}
                  {PRESSURE_SETTING_KINDS.includes(selected.kind) ? (
                    <PropertyField
                      label={RELIEF_KINDS.includes(selected.kind) ? t.params.reliefPressure : t.params.setPressure}
                      value={Number(selected.params.pressure)}
                      min={1}
                      max={500}
                      onChange={(value) => updateParam(selected.id, "pressure", value)}
                    />
                  ) : null}
                  {CYLINDER_KINDS.includes(selected.kind) ? (
                    <>
                      <PropertyField label={t.params.bore} value={Number(selected.params.bore)} min={10} max={500} onChange={(value) => updateParam(selected.id, "bore", value)} />
                      <PropertyField label={t.params.rod} value={Number(selected.params.rod)} min={1} max={450} onChange={(value) => updateParam(selected.id, "rod", value)} />
                      <PropertyField label={t.params.stroke} value={Number(selected.params.stroke)} min={10} max={5000} onChange={(value) => updateParam(selected.id, "stroke", value)} />
                      <PropertyField label={t.params.load} value={Number(selected.params.load)} min={0} max={1000} onChange={(value) => updateParam(selected.id, "load", value)} />
                    </>
                  ) : null}
                  {MOTOR_KINDS.includes(selected.kind) ? (
                    <>
                      <PropertyField label={t.params.displacement} value={Number(selected.params.displacement)} min={1} max={2000} onChange={(value) => updateParam(selected.id, "displacement", value)} />
                      <PropertyField label={t.params.torque} value={Number(selected.params.torque)} min={0} max={10000} onChange={(value) => updateParam(selected.id, "torque", value)} />
                    </>
                  ) : null}
                  {FLOW_SETTING_KINDS.includes(selected.kind) ? (
                    <PropertyField label={t.params.maxFlow} value={Number(selected.params.maxFlow)} min={0} max={400} onChange={(value) => updateParam(selected.id, "maxFlow", value)} />
                  ) : null}
                  {selected.kind === "lsPump" ? (
                    <PropertyField label={t.params.lsMargin} value={Number(selected.params.lsMargin)} min={5} max={40} onChange={(value) => updateParam(selected.id, "lsMargin", value)} />
                  ) : null}
                  {["epPump", "epMotor", "epFlow", "proportional43", "lsValvePvg16"].includes(selected.kind) ? (
                    <PropertyField label={t.params.command} value={Number(selected.params.command)} min={-100} max={100} onChange={(value) => updateParam(selected.id, "command", value)} />
                  ) : null}
                  {["pilotCheck", "counterbalance", "brakeValve"].includes(selected.kind) ? (
                    <PropertyField label={t.params.pilotRatio} value={Number(selected.params.pilotRatio)} min={1} max={20} onChange={(value) => updateParam(selected.id, "pilotRatio", value)} />
                  ) : null}
                  {selected.kind === "accumulator" ? (
                    <PropertyField label={t.params.precharge} value={Number(selected.params.precharge)} min={1} max={500} onChange={(value) => updateParam(selected.id, "precharge", value)} />
                  ) : null}
                  {DIRECTIONAL_VALVE_KINDS.includes(selected.kind) ? (
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
                  <li><i className="pilot" />{t.pilotLine}</li>
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
