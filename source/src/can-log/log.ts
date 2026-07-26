import type { CanFrame } from "../can/decode";
import { frameKey } from "../can/decode";

export type LogDirection = "rx" | "tx" | "unknown";
export type LogFormat = "trc" | "asc" | "csv" | "socketcan";

export type LogFrame = CanFrame & {
  direction: LogDirection;
  channel: string;
  sourceLine: number;
  type: "can" | "canfd" | "rtr";
};

export type ParsedLog = {
  name: string;
  format: LogFormat;
  formatLabel: string;
  version: string;
  frames: LogFrame[];
  skippedLines: number;
  warnings: string[];
  durationMs: number;
};

export type MessageStats = {
  key: string;
  id: number;
  extended: boolean;
  count: number;
  rxCount: number;
  txCount: number;
  firstMs: number;
  lastMs: number;
  durationMs: number;
  minPeriodMs: number | null;
  maxPeriodMs: number | null;
  averagePeriodMs: number | null;
  medianPeriodMs: number | null;
  jitterMs: number | null;
  frequencyHz: number | null;
  estimatedMissing: number;
  dlcs: number[];
  byteChanges: number[];
  byteSamples: number[];
};

type CsvHeader = {
  delimiter: string;
  timestamp: number;
  id: number;
  data: number;
  dlc: number;
  direction: number;
  extended: number;
  channel: number;
  unit: "s" | "ms" | "us";
};

const FD_LENGTHS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 12, 16, 20, 24, 32, 48, 64];
const DATA_TYPES = new Set(["DT", "FD", "FB", "FE", "BI"]);

function finiteNumber(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseHexId(token: string): { id: number; extended: boolean } | null {
  const clean = token.trim().replace(/^0x/i, "").replace(/[xX]$/, "");
  if (!/^[0-9a-fA-F]{1,8}$/.test(clean)) return null;
  const id = Number.parseInt(clean, 16);
  if (!Number.isFinite(id) || id < 0 || id > 0x1fffffff) return null;
  return { id, extended: /[xX]$/.test(token) || clean.length > 4 || id > 0x7ff };
}

function parseDataTokens(tokens: string[], expectedLength?: number): number[] {
  const bytes: number[] = [];
  for (const token of tokens) {
    const clean = token.replace(/[,;]$/, "");
    if (!/^[0-9a-fA-F]{2}$/.test(clean)) break;
    bytes.push(Number.parseInt(clean, 16));
    if (expectedLength !== undefined && bytes.length >= expectedLength) break;
  }
  return bytes;
}

function directionOf(token: string | undefined): LogDirection {
  const normalized = token?.toLowerCase();
  if (normalized === "rx") return "rx";
  if (normalized === "tx") return "tx";
  return "unknown";
}

function makeFrame(
  sequence: number,
  timestampMs: number,
  idToken: string,
  data: number[],
  options: {
    direction?: string;
    channel?: string;
    sourceLine: number;
    rtr?: boolean;
    canFd?: boolean;
  },
): LogFrame | null {
  const parsedId = parseHexId(idToken);
  if (!parsedId || !Number.isFinite(timestampMs) || timestampMs < 0) return null;
  return {
    sequence,
    timestampMs,
    id: parsedId.id,
    extended: parsedId.extended,
    rtr: Boolean(options.rtr),
    error: false,
    data,
    direction: directionOf(options.direction),
    channel: options.channel || "1",
    sourceLine: options.sourceLine,
    type: options.rtr ? "rtr" : options.canFd ? "canfd" : "can",
  };
}

function detectTrcColumns(text: string): string[] {
  const match = text.match(/^\s*;\$COLUMNS=([^\r\n]+)/im);
  return match ? match[1].split(",").map((column) => column.trim()) : [];
}

function trcVersion(text: string): string {
  return text.match(/^\s*;\$FILEVERSION=([0-9.]+)/im)?.[1] ?? "1.0";
}

function dlcToLength(dlc: number): number {
  return FD_LENGTHS[dlc] ?? dlc;
}

function parseTrcModernLine(
  rawLine: string,
  lineNumber: number,
  columns: string[],
  sequence: number,
): LogFrame | null {
  const tokens = rawLine.trim().split(/\s+/);
  if (!tokens.length) return null;

  const values = new Map<string, string>();
  let cursor = 0;
  for (const column of columns) {
    if (column === "D") break;
    values.set(column, tokens[cursor] ?? "");
    cursor += 1;
  }

  const type = values.get("T")?.toUpperCase() ?? "";
  if (!DATA_TYPES.has(type) && type !== "RR") return null;
  const timestamp = finiteNumber(values.get("O") ?? "");
  const idToken = values.get("I") ?? "";
  if (timestamp === null || idToken === "-") return null;

  const rawLength = finiteNumber(values.get("l") ?? "");
  const dlc = finiteNumber(values.get("L") ?? "");
  const expectedLength =
    rawLength === null ? (dlc === null ? undefined : dlcToLength(dlc)) : rawLength;
  const data = type === "RR" ? [] : parseDataTokens(tokens.slice(cursor), expectedLength);

  return makeFrame(sequence, timestamp, idToken, data, {
    direction: values.get("d"),
    channel: values.get("B"),
    sourceLine: lineNumber,
    rtr: type === "RR",
    canFd: ["FD", "FB", "FE", "BI"].includes(type),
  });
}

function parseTrcLegacyLine(
  rawLine: string,
  lineNumber: number,
  version: string,
  sequence: number,
): LogFrame | null {
  const tokens = rawLine.trim().split(/\s+/);
  if (tokens.length < 4) return null;
  tokens[0] = tokens[0].replace(/\)$/, "");
  if (!/^\d+$/.test(tokens[0])) return null;
  const timestamp = finiteNumber(tokens[1]);
  if (timestamp === null) return null;

  let channel = "1";
  let direction = "unknown";
  let idIndex = 2;
  let dlcIndex = 3;
  let dataIndex = 4;

  if (version === "1.1") {
    direction = tokens[2];
    if (!["rx", "tx"].includes(direction.toLowerCase())) return null;
    idIndex = 3;
    dlcIndex = 4;
    dataIndex = 5;
  } else if (version === "1.2") {
    channel = tokens[2];
    direction = tokens[3];
    if (!["rx", "tx"].includes(direction.toLowerCase())) return null;
    idIndex = 4;
    dlcIndex = 5;
    dataIndex = 6;
  } else if (version === "1.3") {
    channel = tokens[2];
    direction = tokens[3];
    if (!["rx", "tx"].includes(direction.toLowerCase())) return null;
    idIndex = 4;
    dlcIndex = 6;
    dataIndex = 7;
  }

  const dlc = finiteNumber(tokens[dlcIndex]);
  if (dlc === null) return null;
  const rtr = tokens[dataIndex]?.toUpperCase() === "RTR";
  return makeFrame(
    sequence,
    timestamp,
    tokens[idIndex],
    rtr ? [] : parseDataTokens(tokens.slice(dataIndex), dlc),
    { direction, channel, sourceLine: lineNumber, rtr },
  );
}

function parseTrc(text: string, name: string): ParsedLog {
  const version = trcVersion(text);
  const columns = detectTrcColumns(text);
  const frames: LogFrame[] = [];
  let skippedLines = 0;

  text.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (!line || line.startsWith(";")) return;
    const frame = columns.length
      ? parseTrcModernLine(rawLine, index + 1, columns, frames.length + 1)
      : parseTrcLegacyLine(rawLine, index + 1, version, frames.length + 1);
    if (frame) frames.push(frame);
    else skippedLines += 1;
  });

  return finishLog(name, "trc", `PEAK TRC ${version}`, version, frames, skippedLines);
}

function parseAscClassic(tokens: string[], lineNumber: number, sequence: number): LogFrame | null {
  if (tokens.length < 6) return null;
  const timestamp = finiteNumber(tokens[0]);
  const dirIndex = tokens.findIndex((token, index) => index > 1 && /^(Rx|Tx)$/i.test(token));
  if (timestamp === null || dirIndex < 0) return null;

  const idIndex = dirIndex - 1;
  const channelIndex = Math.max(1, idIndex - 1);
  const frameKind = tokens[dirIndex + 1]?.toLowerCase();
  const dlc = finiteNumber(tokens[dirIndex + 2] ?? "");
  if (dlc === null || !["d", "r"].includes(frameKind)) return null;

  return makeFrame(
    sequence,
    timestamp * 1000,
    tokens[idIndex],
    frameKind === "r" ? [] : parseDataTokens(tokens.slice(dirIndex + 3), dlc),
    {
      direction: tokens[dirIndex],
      channel: tokens[channelIndex],
      sourceLine: lineNumber,
      rtr: frameKind === "r",
    },
  );
}

function parseAscFd(tokens: string[], lineNumber: number, sequence: number): LogFrame | null {
  if (tokens[1]?.toUpperCase() !== "CANFD" || tokens.length < 9) return null;
  const timestamp = finiteNumber(tokens[0]);
  const direction = tokens[3];
  if (timestamp === null || !/^(Rx|Tx)$/i.test(direction)) return null;

  const idToken = tokens[4];
  let lengthIndex = -1;
  for (let index = 6; index < Math.min(tokens.length, 12); index += 1) {
    const candidate = finiteNumber(tokens[index]);
    if (
      candidate !== null &&
      candidate >= 0 &&
      candidate <= 64 &&
      parseDataTokens(tokens.slice(index + 1), candidate).length === candidate
    ) {
      lengthIndex = index;
      break;
    }
  }
  if (lengthIndex < 0) return null;
  const length = Number(tokens[lengthIndex]);
  return makeFrame(
    sequence,
    timestamp * 1000,
    idToken,
    parseDataTokens(tokens.slice(lengthIndex + 1), length),
    {
      direction,
      channel: tokens[2],
      sourceLine: lineNumber,
      canFd: true,
    },
  );
}

function parseAsc(text: string, name: string): ParsedLog {
  const frames: LogFrame[] = [];
  let skippedLines = 0;
  text.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (
      !line ||
      /^(date|base|no internal events|begin triggerblock|end triggerblock)/i.test(line) ||
      line.startsWith("//")
    ) {
      return;
    }
    const tokens = line.split(/\s+/);
    const frame =
      parseAscFd(tokens, index + 1, frames.length + 1) ??
      parseAscClassic(tokens, index + 1, frames.length + 1);
    if (frame) frames.push(frame);
    else skippedLines += 1;
  });
  return finishLog(name, "asc", "Vector ASC", "", frames, skippedLines);
}

function splitCsvLine(line: string, delimiter: string): string[] {
  const values: string[] = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === delimiter && !quoted) {
      values.push(value.trim());
      value = "";
    } else {
      value += char;
    }
  }
  values.push(value.trim());
  return values;
}

function normalizedHeader(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s()[\]_-]+/g, "")
    .replace(/[ç]/g, "c")
    .replace(/[ğ]/g, "g")
    .replace(/[ı]/g, "i")
    .replace(/[ö]/g, "o")
    .replace(/[ş]/g, "s")
    .replace(/[ü]/g, "u");
}

function findHeaderIndex(headers: string[], candidates: string[]): number {
  return headers.findIndex((header) => candidates.some((candidate) => header === candidate));
}

function detectCsvHeader(line: string): CsvHeader | null {
  const delimiter = line.includes("\t")
    ? "\t"
    : line.split(";").length > line.split(",").length
      ? ";"
      : ",";
  const rawHeaders = splitCsvLine(line, delimiter);
  const headers = rawHeaders.map(normalizedHeader);
  const timestamp = findHeaderIndex(headers, [
    "timestamp",
    "timestampms",
    "timestampus",
    "time",
    "timems",
    "timeus",
    "zaman",
    "zamanms",
  ]);
  const id = findHeaderIndex(headers, ["id", "canid", "identifier", "messageid", "mesajid"]);
  if (timestamp < 0 || id < 0) return null;
  const timestampHeader = headers[timestamp];
  const unit = timestampHeader.endsWith("us")
    ? "us"
    : timestampHeader.endsWith("ms")
      ? "ms"
      : "s";
  return {
    delimiter,
    timestamp,
    id,
    data: findHeaderIndex(headers, ["data", "databytes", "bytes", "veri"]),
    dlc: findHeaderIndex(headers, ["dlc", "length", "datalength", "uzunluk"]),
    direction: findHeaderIndex(headers, ["direction", "dir", "rxtx", "type", "yon"]),
    extended: findHeaderIndex(headers, ["extended", "ext", "ide", "format"]),
    channel: findHeaderIndex(headers, ["channel", "bus", "kanal"]),
    unit,
  };
}

function timestampToMs(value: number, unit: CsvHeader["unit"]): number {
  if (unit === "us") return value / 1000;
  if (unit === "s") return value * 1000;
  return value;
}

function parseCsv(text: string, name: string): ParsedLog {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/);
  const firstLine = lines.findIndex((line) => line.trim().length > 0);
  const header = firstLine >= 0 ? detectCsvHeader(lines[firstLine]) : null;
  const frames: LogFrame[] = [];
  let skippedLines = 0;
  if (!header) {
    return finishLog(name, "csv", "CSV", "", frames, Math.max(0, lines.length - 1), [
      "CSV header must include timestamp/time and id/can_id columns.",
    ]);
  }

  lines.slice(firstLine + 1).forEach((rawLine, offset) => {
    if (!rawLine.trim()) return;
    const cells = splitCsvLine(rawLine, header.delimiter);
    const timestamp = finiteNumber(cells[header.timestamp] ?? "");
    const idToken = cells[header.id] ?? "";
    if (timestamp === null) {
      skippedLines += 1;
      return;
    }

    const dlc = header.dlc >= 0 ? finiteNumber(cells[header.dlc] ?? "") : null;
    let dataTokens: string[] = [];
    if (header.data >= 0) {
      dataTokens = (cells[header.data] ?? "").trim().split(/[\s:.-]+/);
    } else if (header.dlc >= 0) {
      dataTokens = cells.slice(header.dlc + 1);
    }
    const data = parseDataTokens(dataTokens, dlc ?? undefined);
    const extendedCell = header.extended >= 0 ? cells[header.extended]?.toLowerCase() : "";
    const forcedIdToken =
      ["1", "true", "ext", "extended", "29bit"].includes(extendedCell) &&
      !/[xX]$/.test(idToken)
        ? `${idToken}x`
        : idToken;
    const frame = makeFrame(
      frames.length + 1,
      timestampToMs(timestamp, header.unit),
      forcedIdToken,
      data,
      {
        direction: header.direction >= 0 ? cells[header.direction] : undefined,
        channel: header.channel >= 0 ? cells[header.channel] : undefined,
        sourceLine: firstLine + offset + 2,
      },
    );
    if (frame) frames.push(frame);
    else skippedLines += 1;
  });

  return finishLog(name, "csv", "CSV", "", frames, skippedLines);
}

function parseSocketCan(text: string, name: string): ParsedLog {
  const frames: LogFrame[] = [];
  let skippedLines = 0;
  let firstTimestamp: number | null = null;
  text.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) return;
    const match = line.match(
      /^\((\d+(?:\.\d+)?)\)\s+(\S+)\s+([0-9A-Fa-f]{1,8})(#{1,2})([Rr]|[0-9A-Fa-f]*)/,
    );
    if (!match) {
      skippedLines += 1;
      return;
    }
    const absolute = Number(match[1]) * 1000;
    firstTimestamp ??= absolute;
    const rtr = /^[Rr]$/.test(match[5]);
    const payload = match[4] === "##" ? match[5].slice(1) : match[5];
    const data = rtr ? [] : (payload.match(/.{1,2}/g) ?? []).map((byte) => Number.parseInt(byte, 16));
    const frame = makeFrame(frames.length + 1, absolute - firstTimestamp, match[3], data, {
      channel: match[2],
      direction: "rx",
      sourceLine: index + 1,
      rtr,
      canFd: match[4] === "##",
    });
    if (frame) frames.push(frame);
    else skippedLines += 1;
  });
  return finishLog(name, "socketcan", "SocketCAN candump", "", frames, skippedLines);
}

function finishLog(
  name: string,
  format: LogFormat,
  formatLabel: string,
  version: string,
  frames: LogFrame[],
  skippedLines: number,
  extraWarnings: string[] = [],
): ParsedLog {
  frames.sort((a, b) => a.timestampMs - b.timestampMs || a.sequence - b.sequence);
  frames.forEach((frame, index) => {
    frame.sequence = index + 1;
  });
  const durationMs = frames.length > 1
    ? Math.max(0, frames[frames.length - 1].timestampMs - frames[0].timestampMs)
    : 0;
  const warnings = [...extraWarnings];
  if (!frames.length) warnings.push("No supported CAN data frames were found.");
  if (skippedLines > 0) warnings.push(`${skippedLines} non-data or unsupported lines were skipped.`);
  return { name, format, formatLabel, version, frames, skippedLines, warnings, durationMs };
}

export function parseCanLog(text: string, name: string): ParsedLog {
  const extension = name.split(".").pop()?.toLowerCase();
  if (extension === "trc" || /^\s*;\$FILEVERSION=/im.test(text)) return parseTrc(text, name);
  if (extension === "asc" || /^\s*(date|base\s+(hex|dec))/im.test(text)) return parseAsc(text, name);
  if (extension === "log" || /^\s*\(\d+(?:\.\d+)?\)\s+\S+\s+[0-9a-f]+#/im.test(text)) {
    return parseSocketCan(text, name);
  }
  return parseCsv(text, name);
}

function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

function standardDeviation(values: number[], average: number): number {
  if (values.length < 2) return 0;
  const variance = values.reduce((sum, value) => sum + (value - average) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

export function analyzeMessages(frames: LogFrame[]): MessageStats[] {
  const groups = new Map<string, LogFrame[]>();
  frames.forEach((frame) => {
    const key = frameKey(frame);
    const group = groups.get(key);
    if (group) group.push(frame);
    else groups.set(key, [frame]);
  });

  return [...groups.entries()].map(([key, group]) => {
    const intervals: number[] = [];
    for (let index = 1; index < group.length; index += 1) {
      const interval = group[index].timestampMs - group[index - 1].timestampMs;
      if (interval >= 0) intervals.push(interval);
    }
    const averagePeriodMs = intervals.length
      ? intervals.reduce((sum, value) => sum + value, 0) / intervals.length
      : null;
    const medianPeriodMs = median(intervals);
    let maxDlc = 0;
    group.forEach((frame) => {
      maxDlc = Math.max(maxDlc, frame.data.length);
    });
    const byteChanges = Array.from({ length: maxDlc }, () => 0);
    const byteSamples = Array.from({ length: maxDlc }, () => 0);
    for (let index = 1; index < group.length; index += 1) {
      const previous = group[index - 1].data;
      const current = group[index].data;
      for (let byte = 0; byte < Math.max(previous.length, current.length); byte += 1) {
        if (previous[byte] === undefined || current[byte] === undefined) continue;
        byteSamples[byte] += 1;
        if (previous[byte] !== current[byte]) byteChanges[byte] += 1;
      }
    }

    let estimatedMissing = 0;
    if (medianPeriodMs !== null && medianPeriodMs > 0) {
      intervals.forEach((interval) => {
        if (interval > medianPeriodMs * 1.5) {
          estimatedMissing += Math.max(0, Math.round(interval / medianPeriodMs) - 1);
        }
      });
    }

    let minPeriodMs: number | null = null;
    let maxPeriodMs: number | null = null;
    intervals.forEach((interval) => {
      minPeriodMs = minPeriodMs === null ? interval : Math.min(minPeriodMs, interval);
      maxPeriodMs = maxPeriodMs === null ? interval : Math.max(maxPeriodMs, interval);
    });

    return {
      key,
      id: group[0].id,
      extended: group[0].extended,
      count: group.length,
      rxCount: group.filter((frame) => frame.direction === "rx").length,
      txCount: group.filter((frame) => frame.direction === "tx").length,
      firstMs: group[0].timestampMs,
      lastMs: group[group.length - 1].timestampMs,
      durationMs: Math.max(0, group[group.length - 1].timestampMs - group[0].timestampMs),
      minPeriodMs,
      maxPeriodMs,
      averagePeriodMs,
      medianPeriodMs,
      jitterMs:
        averagePeriodMs === null ? null : standardDeviation(intervals, averagePeriodMs),
      frequencyHz:
        averagePeriodMs !== null && averagePeriodMs > 0 ? 1000 / averagePeriodMs : null,
      estimatedMissing,
      dlcs: [...new Set(group.map((frame) => frame.data.length))].sort((a, b) => a - b),
      byteChanges,
      byteSamples,
    };
  });
}

export function createExampleLog(): ParsedLog {
  const frames: LogFrame[] = [];
  let sequence = 1;
  for (let time = 0; time <= 12_000; time += 20) {
    const rpm = Math.round(700 + 1050 * (0.5 + 0.5 * Math.sin(time / 1700)));
    const speed = Math.max(0, Math.round((rpm - 650) * 0.015 * 100));
    if (time % 100 === 0 && time !== 7_000) {
      const rpmRaw = Math.round(rpm / 0.125);
      frames.push({
        sequence: sequence++,
        timestampMs: time,
        id: 0x201,
        extended: false,
        rtr: false,
        error: false,
        data: [rpmRaw & 0xff, (rpmRaw >> 8) & 0xff, speed & 0xff, (speed >> 8) & 0xff, time > 8000 ? 1 : 0, 0, 0, 0],
        direction: "rx",
        channel: "1",
        sourceLine: sequence,
        type: "can",
      });
    }
    if (time % 500 === 0) {
      const voltage = Math.round((91.5 + 0.7 * Math.sin(time / 2200)) * 10);
      const current = Math.round((18 + 3 * Math.cos(time / 1500)) * 10);
      frames.push({
        sequence: sequence++,
        timestampMs: time + 2,
        id: 0x18ff50e5,
        extended: true,
        rtr: false,
        error: false,
        data: [voltage & 0xff, (voltage >> 8) & 0xff, current & 0xff, (current >> 8) & 0xff, 0x10, 0, 0x45, 0],
        direction: "rx",
        channel: "1",
        sourceLine: sequence,
        type: "can",
      });
    }
    if (time % 20 === 0) {
      frames.push({
        sequence: sequence++,
        timestampMs: time + 4,
        id: 0x301,
        extended: false,
        rtr: false,
        error: false,
        data: [Math.round(time / 20) & 0xff, rpm & 0xff, speed & 0xff, time > 8000 ? 1 : 0, 0, 0, 0, 0],
        direction: "rx",
        channel: "2",
        sourceLine: sequence,
        type: "can",
      });
    }
  }
  return finishLog("ornek-makine-kaydi.trc", "trc", "PEAK TRC 2.1", "2.1", frames, 0);
}
