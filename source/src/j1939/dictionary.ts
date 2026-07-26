import { readSheet } from "read-excel-file/browser";
import type { SpnKnowledge } from "./j1939";

export type Language = "tr" | "en";

export type FmiDefinition = {
  fmi: number;
  tr: string;
  en: string;
  severity: "critical" | "warning" | "information" | "reserved";
};

const definitions: Array<[number, string, string, FmiDefinition["severity"]]> = [
  [0, "Değer normalin üzerinde - en ağır seviye", "Value above normal - most severe", "critical"],
  [1, "Değer normalin altında - en ağır seviye", "Value below normal - most severe", "critical"],
  [2, "Veri düzensiz, kesintili veya hatalı", "Data erratic, intermittent, or incorrect", "warning"],
  [3, "Gerilim normalin üzerinde veya üst hatta kısa devre", "Voltage above normal or shorted high", "warning"],
  [4, "Gerilim normalin altında veya alt hatta kısa devre", "Voltage below normal or shorted low", "warning"],
  [5, "Akım normalin altında veya devre açık", "Current below normal or open circuit", "warning"],
  [6, "Akım normalin üzerinde veya şaseye kısa devre", "Current above normal or grounded circuit", "warning"],
  [7, "Mekanik sistem tepki vermiyor veya ayarsız", "Mechanical system not responding or out of adjustment", "warning"],
  [8, "Frekans, darbe genişliği veya periyot anormal", "Abnormal frequency, pulse width, or period", "warning"],
  [9, "Güncelleme hızı anormal", "Abnormal update rate", "warning"],
  [10, "Değişim hızı anormal", "Abnormal rate of change", "warning"],
  [11, "Başka bir arıza türü algılandı", "Other failure mode detected", "warning"],
  [12, "Akıllı cihaz veya bileşen arızalı", "Bad intelligent device or component", "critical"],
  [13, "Kalibrasyon dışı", "Out of calibration", "warning"],
  [14, "Özel talimat gerektiren durum", "Special-instruction condition", "information"],
  [15, "Değer normalin üzerinde - en düşük seviye", "Value above normal - least severe", "information"],
  [16, "Değer normalin üzerinde - orta seviye", "Value above normal - moderately severe", "warning"],
  [17, "Değer normalin altında - en düşük seviye", "Value below normal - least severe", "information"],
  [18, "Değer normalin altında - orta seviye", "Value below normal - moderately severe", "warning"],
  [19, "Ağdan alınan veri hatalı", "Received network data is in error", "warning"],
  [20, "SAE tarafından ayrılmış", "Reserved by SAE", "reserved"],
  [21, "SAE tarafından ayrılmış", "Reserved by SAE", "reserved"],
  [22, "SAE tarafından ayrılmış", "Reserved by SAE", "reserved"],
  [23, "SAE tarafından ayrılmış", "Reserved by SAE", "reserved"],
  [24, "SAE tarafından ayrılmış", "Reserved by SAE", "reserved"],
  [25, "SAE tarafından ayrılmış", "Reserved by SAE", "reserved"],
  [26, "SAE tarafından ayrılmış", "Reserved by SAE", "reserved"],
  [27, "SAE tarafından ayrılmış", "Reserved by SAE", "reserved"],
  [28, "SAE tarafından ayrılmış", "Reserved by SAE", "reserved"],
  [29, "SAE tarafından ayrılmış", "Reserved by SAE", "reserved"],
  [30, "SAE tarafından ayrılmış", "Reserved by SAE", "reserved"],
  [31, "Koşul mevcut", "Condition exists", "information"],
];

export const FMI_DEFINITIONS: FmiDefinition[] = definitions.map(
  ([fmi, tr, en, severity]) => ({ fmi, tr, en, severity }),
);

export function fmiDefinition(fmi: number): FmiDefinition {
  return FMI_DEFINITIONS[fmi] ?? {
    fmi,
    tr: "Bilinmeyen FMI",
    en: "Unknown FMI",
    severity: "reserved",
  };
}

type Cell = string | number | boolean | Date | null;

const HEADER_ALIASES: Record<keyof Omit<SpnKnowledge, "source">, string[]> = {
  spn: ["spn", "suspect_parameter_number", "suspectparameternumber"],
  nameTr: ["name_tr", "ad_tr", "aciklama_tr", "description_tr", "turkce"],
  nameEn: ["name_en", "name", "description_en", "description", "english"],
  causeTr: ["cause_tr", "neden_tr", "muhtemel_neden", "possible_cause_tr"],
  causeEn: ["cause_en", "possible_cause", "possible_cause_en"],
  checkTr: ["check_tr", "kontrol_tr", "kontrol_noktasi", "inspection_tr"],
  checkEn: ["check_en", "inspection", "inspection_en", "check"],
  serviceNote: ["service_note", "servis_notu", "note", "not"],
};

function normalizeHeader(value: Cell): string {
  return String(value ?? "")
    .trim()
    .toLocaleLowerCase("en-US")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function fieldForHeader(header: string): keyof Omit<SpnKnowledge, "source"> | null {
  const entry = Object.entries(HEADER_ALIASES).find(([, aliases]) =>
    aliases.includes(header)
  );
  return (entry?.[0] as keyof Omit<SpnKnowledge, "source"> | undefined) ?? null;
}

function rowsToKnowledge(rows: Cell[][]): SpnKnowledge[] {
  if (rows.length < 2) return [];
  const fields = rows[0].map((cell) => fieldForHeader(normalizeHeader(cell)));
  const spnIndex = fields.indexOf("spn");
  if (spnIndex < 0) {
    throw new Error("SPN column was not found.");
  }
  const output = new Map<number, SpnKnowledge>();
  for (const row of rows.slice(1)) {
    const spn = Number(row[spnIndex]);
    if (!Number.isInteger(spn) || spn < 0 || spn > 524287) continue;
    const item: SpnKnowledge = { spn, source: "dictionary" };
    fields.forEach((field, index) => {
      if (!field || field === "spn") return;
      const text = String(row[index] ?? "").trim();
      if (text) item[field] = text;
    });
    output.set(spn, item);
  }
  return [...output.values()].sort((first, second) => first.spn - second.spn);
}

function parseCsvRows(text: string): Cell[][] {
  const firstLine = text.replace(/^\uFEFF/, "").split(/\r?\n/, 1)[0] ?? "";
  const delimiter = firstLine.split(";").length > firstLine.split(",").length ? ";" : ",";
  const rows: Cell[][] = [];
  let row: Cell[] = [];
  let value = "";
  let quoted = false;
  const source = text.replace(/^\uFEFF/, "");

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (character === "\"") {
      if (quoted && source[index + 1] === "\"") {
        value += "\"";
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }
    if (!quoted && character === delimiter) {
      row.push(value.trim());
      value = "";
      continue;
    }
    if (!quoted && (character === "\n" || character === "\r")) {
      if (character === "\r" && source[index + 1] === "\n") index += 1;
      row.push(value.trim());
      if (row.some((cell) => String(cell).length > 0)) rows.push(row);
      row = [];
      value = "";
      continue;
    }
    value += character;
  }
  row.push(value.trim());
  if (row.some((cell) => String(cell).length > 0)) rows.push(row);
  return rows;
}

export async function readSpnDictionary(file: File): Promise<SpnKnowledge[]> {
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".csv") || lower.endsWith(".txt")) {
    return rowsToKnowledge(parseCsvRows(await file.text()));
  }
  if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
    const rows = await readSheet(file);
    return rowsToKnowledge(rows as Cell[][]);
  }
  throw new Error("Unsupported dictionary file type.");
}

const STORAGE_KEY = "bt-j1939-spn-dictionary-v1";

export function loadStoredDictionary(): SpnKnowledge[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as SpnKnowledge[];
    return Array.isArray(parsed)
      ? parsed.filter((item) => Number.isInteger(item.spn) && item.spn >= 0)
      : [];
  } catch {
    return [];
  }
}

export function storeDictionary(items: SpnKnowledge[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function clearStoredDictionary(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function mergeKnowledge(
  dbcKnowledge: ReadonlyMap<number, SpnKnowledge>,
  dictionary: SpnKnowledge[],
): Map<number, SpnKnowledge> {
  const merged = new Map<number, SpnKnowledge>(dbcKnowledge);
  for (const item of dictionary) {
    merged.set(item.spn, {
      ...(merged.get(item.spn) ?? { spn: item.spn }),
      ...item,
      source: "dictionary",
    });
  }
  return merged;
}
