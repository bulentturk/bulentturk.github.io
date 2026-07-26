import type { LogFrame, ParsedLog } from "../can-log/log";

export const DM1_PGN = 0xfeca;
export const TP_CM_PGN = 0xec00;
export const TP_DT_PGN = 0xeb00;

export type J1939Identifier = {
  priority: number;
  extendedDataPage: number;
  dataPage: number;
  pduFormat: number;
  pduSpecific: number;
  sourceAddress: number;
  destinationAddress: number | null;
  pduType: "PDU1" | "PDU2";
  pgn: number;
};

export type LampCommand = 0 | 1 | 2 | 3;
export type LampFlash = 0 | 1 | 2 | 3;
export type LampKey = "mil" | "redStop" | "amberWarning" | "protect";

export type LampState = {
  key: LampKey;
  command: LampCommand;
  flash: LampFlash;
};

export type SpnKnowledge = {
  spn: number;
  nameTr?: string;
  nameEn?: string;
  causeTr?: string;
  causeEn?: string;
  checkTr?: string;
  checkEn?: string;
  serviceNote?: string;
  source?: "dbc" | "dictionary";
};

export type DecodedDtc = {
  spn: number;
  fmi: number;
  occurrenceCount: number | null;
  conversionMethod: 0 | 1;
  conversionVersion: 1 | 2 | 3 | 4;
  legacyCandidates: number[];
  legacyAmbiguous: boolean;
  raw: number[];
};

export type Dm1Snapshot = {
  uid: string;
  timestampMs: number;
  channel: string;
  sourceAddress: number;
  destinationAddress: number | null;
  lamps: LampState[];
  dtcs: DecodedDtc[];
  transport: "single" | "bam" | "rts-cts";
  payload: number[];
  frameSequences: number[];
  sourceLines: number[];
  warnings: string[];
};

export type TransportIssue = {
  timestampMs: number;
  channel: string;
  sourceAddress: number;
  destinationAddress: number;
  transportedPgn: number;
  code:
    | "session-replaced"
    | "missing-packet"
    | "out-of-order"
    | "size-mismatch"
    | "aborted"
    | "incomplete-at-end";
  detail: string;
};

export type DtcInterval = {
  startMs: number;
  endMs: number | null;
  firstSnapshotUid: string;
  lastSnapshotUid: string;
};

export type DtcTimeline = {
  key: string;
  channel: string;
  sourceAddress: number;
  spn: number;
  fmi: number;
  conversionMethod: 0 | 1;
  conversionVersion: 1 | 2 | 3 | 4;
  legacyAmbiguous: boolean;
  legacyCandidates: number[];
  firstSeenMs: number;
  lastSeenMs: number;
  lastOccurrenceCount: number | null;
  maxOccurrenceCount: number | null;
  dm1Count: number;
  intervals: DtcInterval[];
  activeAtEnd: boolean;
  lampStates: LampState[];
  raw: number[];
};

export type EcuSummary = {
  key: string;
  channel: string;
  sourceAddress: number;
  defaultName: string;
  firstSeenMs: number;
  lastSeenMs: number;
  frameCount: number;
  dm1Count: number;
  pgns: number[];
};

export type J1939Analysis = {
  snapshots: Dm1Snapshot[];
  timelines: DtcTimeline[];
  ecus: EcuSummary[];
  transportIssues: TransportIssue[];
  j1939FrameCount: number;
  dm1FrameCount: number;
  tpFrameCount: number;
};

type TransportSession = {
  key: string;
  timestampMs: number;
  channel: string;
  sourceAddress: number;
  destinationAddress: number;
  transportedPgn: number;
  totalBytes: number;
  totalPackets: number;
  transport: "bam" | "rts-cts";
  packets: Map<number, number[]>;
  frameSequences: number[];
  sourceLines: number[];
  warnings: string[];
};

const DEFAULT_SOURCE_NAMES: Record<number, string> = {
  0x00: "Engine ECU #1",
  0x01: "Engine ECU #2",
  0x02: "Turbocharger",
  0x03: "Transmission #1",
  0x0b: "Brakes - System Controller",
  0x17: "Instrument Cluster",
  0x21: "Body Controller",
  0x27: "Vehicle Navigation",
  0x31: "Cab Controller",
  0x80: "Hydraulic Controller",
};

function uniqueNumbers(values: number[]): number[] {
  return [...new Set(values)].sort((first, second) => first - second);
}

export function sourceAddressName(address: number): string {
  return DEFAULT_SOURCE_NAMES[address] ?? `ECU 0x${address.toString(16).toUpperCase().padStart(2, "0")}`;
}

export function parseJ1939Identifier(id: number): J1939Identifier | null {
  if (!Number.isInteger(id) || id < 0 || id > 0x1fffffff) return null;
  const priority = (id >>> 26) & 0x7;
  const extendedDataPage = (id >>> 25) & 0x1;
  const dataPage = (id >>> 24) & 0x1;
  const pduFormat = (id >>> 16) & 0xff;
  const pduSpecific = (id >>> 8) & 0xff;
  const sourceAddress = id & 0xff;
  const pduType = pduFormat < 240 ? "PDU1" : "PDU2";
  const destinationAddress = pduType === "PDU1" ? pduSpecific : null;
  const pgn =
    (extendedDataPage << 17)
    | (dataPage << 16)
    | (pduFormat << 8)
    | (pduType === "PDU2" ? pduSpecific : 0);
  return {
    priority,
    extendedDataPage,
    dataPage,
    pduFormat,
    pduSpecific,
    sourceAddress,
    destinationAddress,
    pduType,
    pgn,
  };
}

export function pgnHex(pgn: number): string {
  return `0x${pgn.toString(16).toUpperCase().padStart(5, "0")}`;
}

function twoBit(byte: number, shift: number): 0 | 1 | 2 | 3 {
  return ((byte >>> shift) & 0x3) as 0 | 1 | 2 | 3;
}

export function decodeLampStates(commandByte: number, flashByte: number): LampState[] {
  return [
    { key: "mil", command: twoBit(commandByte, 6), flash: twoBit(flashByte, 6) },
    { key: "redStop", command: twoBit(commandByte, 4), flash: twoBit(flashByte, 4) },
    { key: "amberWarning", command: twoBit(commandByte, 2), flash: twoBit(flashByte, 2) },
    { key: "protect", command: twoBit(commandByte, 0), flash: twoBit(flashByte, 0) },
  ];
}

function currentSpn(bytes: number[]): number {
  return bytes[0] | (bytes[1] << 8) | ((bytes[2] & 0xe0) << 11);
}

function legacySpnCandidates(bytes: number[]): number[] {
  const highThree = (bytes[2] & 0xe0) >>> 5;
  const version1 = (bytes[0] << 11) | (bytes[1] << 3) | highThree;
  const version2 = (bytes[1] << 11) | (bytes[0] << 3) | highThree;
  const version3 = currentSpn(bytes);
  return uniqueNumbers([version1, version2, version3]);
}

function versionForLegacySpn(bytes: number[], selected: number): 1 | 2 | 3 {
  const highThree = (bytes[2] & 0xe0) >>> 5;
  if (((bytes[0] << 11) | (bytes[1] << 3) | highThree) === selected) return 1;
  if (((bytes[1] << 11) | (bytes[0] << 3) | highThree) === selected) return 2;
  return 3;
}

export function decodeDtc(
  bytes: number[],
  knownSpns: ReadonlySet<number> = new Set<number>(),
): DecodedDtc | null {
  if (bytes.length < 4) return null;
  const raw = bytes.slice(0, 4);
  if (raw.every((byte) => byte === 0) || raw.every((byte) => byte === 0xff)) return null;

  const fmi = raw[2] & 0x1f;
  const conversionMethod = ((raw[3] >>> 7) & 0x1) as 0 | 1;
  const rawOccurrence = raw[3] & 0x7f;
  const occurrenceCount = rawOccurrence === 0x7f ? null : rawOccurrence;

  if (conversionMethod === 0) {
    return {
      spn: currentSpn(raw),
      fmi,
      occurrenceCount,
      conversionMethod,
      conversionVersion: 4,
      legacyCandidates: [],
      legacyAmbiguous: false,
      raw,
    };
  }

  const candidates = legacySpnCandidates(raw);
  const dictionaryMatches = candidates.filter((candidate) => knownSpns.has(candidate));
  const selected = dictionaryMatches.length === 1
    ? dictionaryMatches[0]
    : currentSpn(raw);

  return {
    spn: selected,
    fmi,
    occurrenceCount,
    conversionMethod,
    conversionVersion: versionForLegacySpn(raw, selected),
    legacyCandidates: candidates,
    legacyAmbiguous: dictionaryMatches.length !== 1 && candidates.length > 1,
    raw,
  };
}

export function decodeDm1Payload(
  payload: number[],
  knownSpns: ReadonlySet<number> = new Set<number>(),
): { lamps: LampState[]; dtcs: DecodedDtc[]; warnings: string[] } {
  const warnings: string[] = [];
  if (payload.length < 2) {
    return { lamps: [], dtcs: [], warnings: ["DM1 payload has fewer than two lamp bytes."] };
  }

  const lamps = decodeLampStates(payload[0], payload[1]);
  const dtcs: DecodedDtc[] = [];
  const dtcBytes = payload.slice(2);
  if (dtcBytes.length % 4 !== 0 && dtcBytes.length > 4) {
    warnings.push("DM1 payload ends with an incomplete four-byte DTC record.");
  }
  for (let index = 0; index + 3 < dtcBytes.length; index += 4) {
    const decoded = decodeDtc(dtcBytes.slice(index, index + 4), knownSpns);
    if (decoded) dtcs.push(decoded);
  }
  return { lamps, dtcs, warnings };
}

function sessionKey(
  channel: string,
  sourceAddress: number,
  destinationAddress: number,
): string {
  return `${channel}:${sourceAddress}:${destinationAddress}`;
}

function issueFromSession(
  session: TransportSession,
  code: TransportIssue["code"],
  detail: string,
): TransportIssue {
  return {
    timestampMs: session.timestampMs,
    channel: session.channel,
    sourceAddress: session.sourceAddress,
    destinationAddress: session.destinationAddress,
    transportedPgn: session.transportedPgn,
    code,
    detail,
  };
}

function createSnapshot(
  timestampMs: number,
  channel: string,
  sourceAddress: number,
  destinationAddress: number | null,
  payload: number[],
  transport: Dm1Snapshot["transport"],
  frameSequences: number[],
  sourceLines: number[],
  sessionWarnings: string[],
  knownSpns: ReadonlySet<number>,
): Dm1Snapshot {
  const decoded = decodeDm1Payload(payload, knownSpns);
  return {
    uid: `${channel}-${sourceAddress}-${timestampMs}-${frameSequences.join("-")}`,
    timestampMs,
    channel,
    sourceAddress,
    destinationAddress,
    lamps: decoded.lamps,
    dtcs: decoded.dtcs,
    transport,
    payload,
    frameSequences,
    sourceLines,
    warnings: [...sessionWarnings, ...decoded.warnings],
  };
}

function completeTransportSession(
  session: TransportSession,
  completionTimestampMs: number,
  knownSpns: ReadonlySet<number>,
  issues: TransportIssue[],
): Dm1Snapshot | null {
  const payload: number[] = [];
  for (let sequence = 1; sequence <= session.totalPackets; sequence += 1) {
    const packet = session.packets.get(sequence);
    if (!packet) {
      issues.push(issueFromSession(
        session,
        "missing-packet",
        `Packet ${sequence} of ${session.totalPackets} is missing.`,
      ));
      return null;
    }
    payload.push(...packet);
  }
  const trimmed = payload.slice(0, session.totalBytes);
  if (trimmed.length !== session.totalBytes) {
    issues.push(issueFromSession(
      session,
      "size-mismatch",
      `Expected ${session.totalBytes} payload bytes but reconstructed ${trimmed.length}.`,
    ));
    return null;
  }
  if (session.transportedPgn !== DM1_PGN) return null;
  return createSnapshot(
    completionTimestampMs,
    session.channel,
    session.sourceAddress,
    session.destinationAddress,
    trimmed,
    session.transport,
    session.frameSequences,
    session.sourceLines,
    session.warnings,
    knownSpns,
  );
}

function lampSignature(lamps: LampState[]): string {
  return lamps.map((lamp) => `${lamp.key}:${lamp.command}:${lamp.flash}`).join("|");
}

export function buildDtcTimelines(snapshots: Dm1Snapshot[]): DtcTimeline[] {
  const timelines = new Map<string, DtcTimeline>();
  const activeByEcu = new Map<string, Set<string>>();
  const sorted = [...snapshots].sort(
    (first, second) => first.timestampMs - second.timestampMs || first.uid.localeCompare(second.uid),
  );

  for (const snapshot of sorted) {
    const ecuKey = `${snapshot.channel}:${snapshot.sourceAddress}`;
    const previousActive = activeByEcu.get(ecuKey) ?? new Set<string>();
    const currentActive = new Set<string>();

    for (const dtc of snapshot.dtcs) {
      const key = `${ecuKey}:${dtc.spn}:${dtc.fmi}`;
      currentActive.add(key);
      let timeline = timelines.get(key);
      if (!timeline) {
        timeline = {
          key,
          channel: snapshot.channel,
          sourceAddress: snapshot.sourceAddress,
          spn: dtc.spn,
          fmi: dtc.fmi,
          conversionMethod: dtc.conversionMethod,
          conversionVersion: dtc.conversionVersion,
          legacyAmbiguous: dtc.legacyAmbiguous,
          legacyCandidates: dtc.legacyCandidates,
          firstSeenMs: snapshot.timestampMs,
          lastSeenMs: snapshot.timestampMs,
          lastOccurrenceCount: dtc.occurrenceCount,
          maxOccurrenceCount: dtc.occurrenceCount,
          dm1Count: 0,
          intervals: [],
          activeAtEnd: true,
          lampStates: snapshot.lamps,
          raw: dtc.raw,
        };
        timelines.set(key, timeline);
      }

      timeline.lastSeenMs = snapshot.timestampMs;
      timeline.lastOccurrenceCount = dtc.occurrenceCount;
      timeline.maxOccurrenceCount =
        dtc.occurrenceCount === null
          ? timeline.maxOccurrenceCount
          : Math.max(timeline.maxOccurrenceCount ?? 0, dtc.occurrenceCount);
      timeline.dm1Count += 1;
      timeline.activeAtEnd = true;
      timeline.lampStates = snapshot.lamps;
      timeline.legacyAmbiguous ||= dtc.legacyAmbiguous;
      timeline.legacyCandidates = uniqueNumbers([
        ...timeline.legacyCandidates,
        ...dtc.legacyCandidates,
      ]);

      if (!previousActive.has(key)) {
        timeline.intervals.push({
          startMs: snapshot.timestampMs,
          endMs: null,
          firstSnapshotUid: snapshot.uid,
          lastSnapshotUid: snapshot.uid,
        });
      } else {
        const currentInterval = timeline.intervals[timeline.intervals.length - 1];
        if (currentInterval) currentInterval.lastSnapshotUid = snapshot.uid;
      }
    }

    for (const key of previousActive) {
      if (currentActive.has(key)) continue;
      const timeline = timelines.get(key);
      const currentInterval = timeline?.intervals[timeline.intervals.length - 1];
      if (timeline && currentInterval && currentInterval.endMs === null) {
        currentInterval.endMs = snapshot.timestampMs;
        currentInterval.lastSnapshotUid = snapshot.uid;
        timeline.activeAtEnd = false;
      }
    }
    activeByEcu.set(ecuKey, currentActive);
  }

  return [...timelines.values()].sort(
    (first, second) =>
      Number(second.activeAtEnd) - Number(first.activeAtEnd)
      || first.firstSeenMs - second.firstSeenMs
      || first.spn - second.spn,
  );
}

export function analyzeJ1939Log(
  log: ParsedLog,
  knownSpns: ReadonlySet<number> = new Set<number>(),
): J1939Analysis {
  const snapshots: Dm1Snapshot[] = [];
  const transportIssues: TransportIssue[] = [];
  const sessions = new Map<string, TransportSession>();
  const ecuMap = new Map<string, EcuSummary>();
  let j1939FrameCount = 0;
  let dm1FrameCount = 0;
  let tpFrameCount = 0;

  const frames = [...log.frames].sort(
    (first, second) => first.timestampMs - second.timestampMs || first.sequence - second.sequence,
  );

  for (const frame of frames) {
    if (!frame.extended || frame.error || frame.rtr) continue;
    const identifier = parseJ1939Identifier(frame.id);
    if (!identifier) continue;
    j1939FrameCount += 1;

    const ecuKey = `${frame.channel}:${identifier.sourceAddress}`;
    const ecu = ecuMap.get(ecuKey) ?? {
      key: ecuKey,
      channel: frame.channel,
      sourceAddress: identifier.sourceAddress,
      defaultName: sourceAddressName(identifier.sourceAddress),
      firstSeenMs: frame.timestampMs,
      lastSeenMs: frame.timestampMs,
      frameCount: 0,
      dm1Count: 0,
      pgns: [],
    };
    ecu.firstSeenMs = Math.min(ecu.firstSeenMs, frame.timestampMs);
    ecu.lastSeenMs = Math.max(ecu.lastSeenMs, frame.timestampMs);
    ecu.frameCount += 1;
    ecu.pgns.push(identifier.pgn);
    ecuMap.set(ecuKey, ecu);

    if (identifier.pgn === DM1_PGN) {
      dm1FrameCount += 1;
      ecu.dm1Count += 1;
      snapshots.push(createSnapshot(
        frame.timestampMs,
        frame.channel,
        identifier.sourceAddress,
        identifier.destinationAddress,
        frame.data,
        "single",
        [frame.sequence],
        [frame.sourceLine],
        [],
        knownSpns,
      ));
      continue;
    }

    if (identifier.pgn === TP_CM_PGN) {
      tpFrameCount += 1;
      if (frame.data.length < 8 || identifier.destinationAddress === null) continue;
      const control = frame.data[0];
      const destination = identifier.destinationAddress;
      const transportedPgn = frame.data[5] | (frame.data[6] << 8) | (frame.data[7] << 16);
      const key = sessionKey(frame.channel, identifier.sourceAddress, destination);

      if (control === 0x20 || control === 0x10) {
        const existing = sessions.get(key);
        if (existing) {
          transportIssues.push(issueFromSession(
            existing,
            "session-replaced",
            "A new TP session started before the previous session completed.",
          ));
        }
        const totalBytes = frame.data[1] | (frame.data[2] << 8);
        const totalPackets = frame.data[3];
        sessions.set(key, {
          key,
          timestampMs: frame.timestampMs,
          channel: frame.channel,
          sourceAddress: identifier.sourceAddress,
          destinationAddress: destination,
          transportedPgn,
          totalBytes,
          totalPackets,
          transport: control === 0x20 ? "bam" : "rts-cts",
          packets: new Map(),
          frameSequences: [frame.sequence],
          sourceLines: [frame.sourceLine],
          warnings: [],
        });
      } else if (control === 0xff) {
        const existing = sessions.get(key);
        if (existing) {
          transportIssues.push(issueFromSession(existing, "aborted", "TP session was aborted."));
          sessions.delete(key);
        }
      }
      continue;
    }

    if (identifier.pgn === TP_DT_PGN) {
      tpFrameCount += 1;
      if (frame.data.length < 2 || identifier.destinationAddress === null) continue;
      const destination = identifier.destinationAddress;
      const key = sessionKey(frame.channel, identifier.sourceAddress, destination);
      const session = sessions.get(key);
      if (!session) continue;
      const packetSequence = frame.data[0];
      const expectedSequence = session.packets.size + 1;
      if (packetSequence !== expectedSequence) {
        session.warnings.push(
          `Expected TP packet ${expectedSequence}, received ${packetSequence}.`,
        );
        transportIssues.push(issueFromSession(
          session,
          "out-of-order",
          `Expected packet ${expectedSequence}, received ${packetSequence}.`,
        ));
      }
      if (packetSequence >= 1 && packetSequence <= session.totalPackets) {
        session.packets.set(packetSequence, frame.data.slice(1, 8));
        session.frameSequences.push(frame.sequence);
        session.sourceLines.push(frame.sourceLine);
      }
      if (session.packets.size >= session.totalPackets) {
        const snapshot = completeTransportSession(
          session,
          frame.timestampMs,
          knownSpns,
          transportIssues,
        );
        if (snapshot) {
          snapshots.push(snapshot);
          const sourceEcu = ecuMap.get(`${session.channel}:${session.sourceAddress}`);
          if (sourceEcu) {
            sourceEcu.dm1Count += 1;
            dm1FrameCount += session.frameSequences.length;
          }
        }
        sessions.delete(key);
      }
    }
  }

  for (const session of sessions.values()) {
    transportIssues.push(issueFromSession(
      session,
      "incomplete-at-end",
      `TP session ended with ${session.packets.size} of ${session.totalPackets} packets.`,
    ));
  }

  const ecus = [...ecuMap.values()]
    .map((ecu) => ({ ...ecu, pgns: uniqueNumbers(ecu.pgns) }))
    .sort(
      (first, second) =>
        Number(second.dm1Count > 0) - Number(first.dm1Count > 0)
        || first.sourceAddress - second.sourceAddress,
    );
  snapshots.sort(
    (first, second) => first.timestampMs - second.timestampMs || first.uid.localeCompare(second.uid),
  );

  return {
    snapshots,
    timelines: buildDtcTimelines(snapshots),
    ecus,
    transportIssues,
    j1939FrameCount,
    dm1FrameCount,
    tpFrameCount,
  };
}

export function lampSignatureForTimeline(lamps: LampState[]): string {
  return lampSignature(lamps);
}

export function frameJ1939Pgn(frame: Pick<LogFrame, "id" | "extended">): number | null {
  if (!frame.extended) return null;
  return parseJ1939Identifier(frame.id)?.pgn ?? null;
}
