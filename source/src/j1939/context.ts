import type { LogFrame, ParsedLog } from "../can-log/log";
import { decodeMessage } from "../can/decode";
import type { DbcDatabase, DbcMessage } from "../dbc/dbc";
import {
  parseJ1939Identifier,
  type DtcTimeline,
  type SpnKnowledge,
} from "./j1939";

export type ContextPoint = {
  timestampMs: number;
  value: number;
};

export type ContextSeries = {
  key: string;
  channel: string;
  sourceAddress: number;
  pgn: number;
  messageName: string;
  signalName: string;
  spn: number | null;
  unit: string;
  points: ContextPoint[];
};

export type ContextSnapshotValue = {
  key: string;
  signalName: string;
  spn: number | null;
  unit: string;
  value: number;
  timestampMs: number;
  ageMs: number;
};

export type DbcContext = {
  series: ContextSeries[];
  knownSpns: Set<number>;
  knowledge: Map<number, SpnKnowledge>;
  matchedFrames: number;
  decodedSignals: number;
  messageCount: number;
};

export const CONTEXT_SPN_PRIORITY = [
  190,
  247,
  513,
  512,
  92,
  91,
  110,
  175,
  100,
  94,
  102,
  168,
  158,
  84,
  183,
  250,
] as const;

function dbcIdForMessage(message: DbcMessage): number {
  return message.extended ? message.id + 0x80000000 : message.id;
}

function messageSignalKey(message: DbcMessage, signalName: string): string {
  return `${dbcIdForMessage(message)}:${signalName}`;
}

export function parseDbcSpnAttributes(text: string): Map<string, number> {
  const attributes = new Map<string, number>();
  const pattern =
    /BA_\s+"SPN"\s+SG_\s+(\d+)\s+([A-Za-z_][A-Za-z0-9_]*)\s+(\d+)\s*;/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text))) {
    const spn = Number(match[3]);
    if (Number.isInteger(spn) && spn >= 0 && spn <= 524287) {
      attributes.set(`${match[1]}:${match[2]}`, spn);
    }
  }
  return attributes;
}

function messagesByPgn(database: DbcDatabase): Map<number, DbcMessage[]> {
  const index = new Map<number, DbcMessage[]>();
  for (const message of database.messages) {
    if (!message.extended) continue;
    const identifier = parseJ1939Identifier(message.id);
    if (!identifier) continue;
    const list = index.get(identifier.pgn) ?? [];
    list.push(message);
    index.set(identifier.pgn, list);
  }
  return index;
}

function selectMessage(candidates: DbcMessage[], frame: LogFrame): DbcMessage | null {
  if (!candidates.length) return null;
  if (candidates.length === 1) return candidates[0];
  const frameIdentifier = parseJ1939Identifier(frame.id);
  if (!frameIdentifier) return candidates[0];
  return (
    candidates.find((message) => {
      const messageIdentifier = parseJ1939Identifier(message.id);
      return messageIdentifier?.sourceAddress === frameIdentifier.sourceAddress;
    })
    ?? candidates.find((message) => {
      const messageIdentifier = parseJ1939Identifier(message.id);
      return messageIdentifier?.sourceAddress === 0xfe;
    })
    ?? candidates[0]
  );
}

function inDeclaredRange(
  value: number,
  minimum: number,
  maximum: number,
): boolean {
  if (!Number.isFinite(value)) return false;
  if (minimum === 0 && maximum === 0) return true;
  const tolerance = Math.max(1e-9, Math.abs(maximum - minimum) * 1e-8);
  return value >= minimum - tolerance && value <= maximum + tolerance;
}

export function decodeDbcContext(
  log: ParsedLog,
  database: DbcDatabase,
  dbcText: string,
): DbcContext {
  const spnAttributes = parseDbcSpnAttributes(dbcText);
  const pgnIndex = messagesByPgn(database);
  const seriesMap = new Map<string, ContextSeries>();
  const knowledge = new Map<number, SpnKnowledge>();
  const knownSpns = new Set<number>();
  let matchedFrames = 0;
  let decodedSignals = 0;

  for (const frame of log.frames) {
    if (!frame.extended || frame.error || frame.rtr) continue;
    const identifier = parseJ1939Identifier(frame.id);
    if (!identifier) continue;
    const message = selectMessage(pgnIndex.get(identifier.pgn) ?? [], frame);
    if (!message) continue;
    matchedFrames += 1;

    for (const decoded of decodeMessage(frame, message)) {
      if (!inDeclaredRange(decoded.numericValue, decoded.signal.min, decoded.signal.max)) {
        continue;
      }
      const spn = spnAttributes.get(messageSignalKey(message, decoded.signal.name)) ?? null;
      if (spn !== null) {
        knownSpns.add(spn);
        const existing = knowledge.get(spn);
        if (!existing) {
          knowledge.set(spn, {
            spn,
            nameTr: decoded.signal.name,
            nameEn: decoded.signal.name,
            serviceNote: decoded.signal.comment || undefined,
            source: "dbc",
          });
        }
      }
      const key = `${frame.channel}:${identifier.sourceAddress}:${identifier.pgn}:${decoded.signal.name}`;
      const series = seriesMap.get(key) ?? {
        key,
        channel: frame.channel,
        sourceAddress: identifier.sourceAddress,
        pgn: identifier.pgn,
        messageName: message.name,
        signalName: decoded.signal.name,
        spn,
        unit: decoded.signal.unit,
        points: [],
      };
      series.points.push({
        timestampMs: frame.timestampMs,
        value: decoded.numericValue,
      });
      seriesMap.set(key, series);
      decodedSignals += 1;
    }
  }

  const series = [...seriesMap.values()]
    .map((item) => ({
      ...item,
      points: [...item.points].sort((first, second) => first.timestampMs - second.timestampMs),
    }))
    .sort((first, second) => {
      const firstPriority = first.spn === null
        ? Number.MAX_SAFE_INTEGER
        : CONTEXT_SPN_PRIORITY.indexOf(first.spn as (typeof CONTEXT_SPN_PRIORITY)[number]);
      const secondPriority = second.spn === null
        ? Number.MAX_SAFE_INTEGER
        : CONTEXT_SPN_PRIORITY.indexOf(second.spn as (typeof CONTEXT_SPN_PRIORITY)[number]);
      const normalizedFirst = firstPriority < 0 ? Number.MAX_SAFE_INTEGER : firstPriority;
      const normalizedSecond = secondPriority < 0 ? Number.MAX_SAFE_INTEGER : secondPriority;
      return normalizedFirst - normalizedSecond || first.signalName.localeCompare(second.signalName);
    });

  return {
    series,
    knownSpns,
    knowledge,
    matchedFrames,
    decodedSignals,
    messageCount: pgnIndex.size,
  };
}

function nearestPointAtOrBefore(
  points: ContextPoint[],
  timestampMs: number,
): ContextPoint | null {
  let low = 0;
  let high = points.length - 1;
  let result: ContextPoint | null = null;
  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    if (points[middle].timestampMs <= timestampMs) {
      result = points[middle];
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }
  return result;
}

export function contextSnapshotAt(
  context: DbcContext | null,
  timeline: Pick<DtcTimeline, "channel" | "sourceAddress" | "firstSeenMs" | "spn">,
  maximumAgeMs = 30_000,
  limit = 12,
): ContextSnapshotValue[] {
  if (!context) return [];
  const eligible = context.series.filter(
    (series) =>
      series.channel === timeline.channel
      && series.sourceAddress === timeline.sourceAddress
      && series.points.length > 0,
  );
  const prioritized = [...eligible].sort((first, second) => {
    if (first.spn === timeline.spn && second.spn !== timeline.spn) return -1;
    if (second.spn === timeline.spn && first.spn !== timeline.spn) return 1;
    const firstIndex = first.spn === null
      ? -1
      : CONTEXT_SPN_PRIORITY.indexOf(first.spn as (typeof CONTEXT_SPN_PRIORITY)[number]);
    const secondIndex = second.spn === null
      ? -1
      : CONTEXT_SPN_PRIORITY.indexOf(second.spn as (typeof CONTEXT_SPN_PRIORITY)[number]);
    const firstScore = firstIndex < 0 ? Number.MAX_SAFE_INTEGER : firstIndex;
    const secondScore = secondIndex < 0 ? Number.MAX_SAFE_INTEGER : secondIndex;
    return firstScore - secondScore || first.signalName.localeCompare(second.signalName);
  });

  const values: ContextSnapshotValue[] = [];
  for (const series of prioritized) {
    const point = nearestPointAtOrBefore(series.points, timeline.firstSeenMs);
    if (!point) continue;
    const ageMs = timeline.firstSeenMs - point.timestampMs;
    if (ageMs < 0 || ageMs > maximumAgeMs) continue;
    values.push({
      key: series.key,
      signalName: series.signalName,
      spn: series.spn,
      unit: series.unit,
      value: point.value,
      timestampMs: point.timestampMs,
      ageMs,
    });
    if (values.length >= limit) break;
  }
  return values;
}

export function contextSeriesAround(
  context: DbcContext | null,
  timeline: Pick<DtcTimeline, "channel" | "sourceAddress" | "firstSeenMs" | "spn">,
  beforeMs = 30_000,
  afterMs = 30_000,
  limit = 6,
): ContextSeries[] {
  if (!context) return [];
  const start = timeline.firstSeenMs - beforeMs;
  const end = timeline.firstSeenMs + afterMs;
  return context.series
    .filter(
      (series) =>
        series.channel === timeline.channel
        && series.sourceAddress === timeline.sourceAddress,
    )
    .map((series) => ({
      ...series,
      points: series.points.filter(
        (point) => point.timestampMs >= start && point.timestampMs <= end,
      ),
    }))
    .filter((series) => series.points.length >= 2)
    .sort((first, second) => {
      if (first.spn === timeline.spn && second.spn !== timeline.spn) return -1;
      if (second.spn === timeline.spn && first.spn !== timeline.spn) return 1;
      const firstIndex = first.spn === null
        ? -1
        : CONTEXT_SPN_PRIORITY.indexOf(first.spn as (typeof CONTEXT_SPN_PRIORITY)[number]);
      const secondIndex = second.spn === null
        ? -1
        : CONTEXT_SPN_PRIORITY.indexOf(second.spn as (typeof CONTEXT_SPN_PRIORITY)[number]);
      const firstScore = firstIndex < 0 ? Number.MAX_SAFE_INTEGER : firstIndex;
      const secondScore = secondIndex < 0 ? Number.MAX_SAFE_INTEGER : secondIndex;
      return firstScore - secondScore || first.signalName.localeCompare(second.signalName);
    })
    .slice(0, limit);
}
