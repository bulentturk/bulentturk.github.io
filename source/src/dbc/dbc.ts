export type ByteOrder = "little" | "big";

export type ValueDescription = {
  value: string;
  label: string;
};

export type DbcSignal = {
  uid: string;
  name: string;
  startBit: number;
  length: number;
  byteOrder: ByteOrder;
  signed: boolean;
  factor: number;
  offset: number;
  min: number;
  max: number;
  unit: string;
  receivers: string[];
  comment: string;
  multiplex: string;
  valueType: "integer" | "float" | "double";
  values: ValueDescription[];
};

export type DbcMessage = {
  uid: string;
  id: number;
  extended: boolean;
  name: string;
  dlc: number;
  transmitter: string;
  cycleTime: number | null;
  comment: string;
  signals: DbcSignal[];
};

export type DbcDatabase = {
  name: string;
  version: string;
  nodes: string[];
  messages: DbcMessage[];
  preservedStatements: string[];
};

export type ValidationIssue = {
  level: "error" | "warning";
  code: string;
  messageUid?: string;
  signalUid?: string;
  text: string;
};

const IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_]*$/;
const CAN_FD_LENGTHS = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 12, 16, 20, 24, 32, 48, 64]);

function uid(prefix: string): string {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replaceAll("-", "").slice(0, 12)
      : Math.random().toString(36).slice(2, 14);
  return `${prefix}_${random}`;
}

export function createSignal(index = 0): DbcSignal {
  return {
    uid: uid("sig"),
    name: `Signal_${index + 1}`,
    startBit: index * 8,
    length: 8,
    byteOrder: "little",
    signed: false,
    factor: 1,
    offset: 0,
    min: 0,
    max: 255,
    unit: "",
    receivers: ["Vector__XXX"],
    comment: "",
    multiplex: "",
    valueType: "integer",
    values: [],
  };
}

export function createMessage(index = 0): DbcMessage {
  return {
    uid: uid("msg"),
    id: 0x100 + index,
    extended: false,
    name: `Message_${index + 1}`,
    dlc: 8,
    transmitter: "Vector__XXX",
    cycleTime: null,
    comment: "",
    signals: [createSignal(0)],
  };
}

export function createDatabase(name = "new_database.dbc"): DbcDatabase {
  return {
    name,
    version: "1.0",
    nodes: ["Vector__XXX"],
    messages: [createMessage(0)],
    preservedStatements: [],
  };
}

export function createExampleDatabase(): DbcDatabase {
  const db: DbcDatabase = {
    name: "off_highway_example.dbc",
    version: "1.0",
    nodes: ["VCU", "HMI", "TELEMATICS"],
    messages: [
      {
        uid: uid("msg"),
        id: 0x201,
        extended: false,
        name: "VCU_Status",
        dlc: 8,
        transmitter: "VCU",
        cycleTime: 100,
        comment: "Example status message for the browser-based DBC editor.",
        signals: [
          {
            ...createSignal(0),
            name: "EngineSpeed",
            startBit: 0,
            length: 16,
            factor: 0.125,
            max: 8031.875,
            unit: "rpm",
            receivers: ["HMI", "TELEMATICS"],
            comment: "Engine speed.",
          },
          {
            ...createSignal(1),
            name: "MachineSpeed",
            startBit: 16,
            length: 16,
            factor: 0.01,
            max: 655.35,
            unit: "km/h",
            receivers: ["HMI", "TELEMATICS"],
            comment: "Calculated machine speed.",
          },
          {
            ...createSignal(2),
            name: "ParkBrake",
            startBit: 32,
            length: 1,
            max: 1,
            receivers: ["HMI", "TELEMATICS"],
            values: [
              { value: "0", label: "Released" },
              { value: "1", label: "Applied" },
            ],
          },
        ],
      },
      {
        uid: uid("msg"),
        id: 0x18ff50e5,
        extended: true,
        name: "Charger_Status",
        dlc: 8,
        transmitter: "VCU",
        cycleTime: 500,
        comment: "Example 29-bit CAN message.",
        signals: [
          {
            ...createSignal(0),
            name: "OutputVoltage",
            startBit: 0,
            length: 16,
            factor: 0.1,
            max: 6553.5,
            unit: "V",
            receivers: ["TELEMATICS"],
          },
          {
            ...createSignal(1),
            name: "OutputCurrent",
            startBit: 16,
            length: 16,
            signed: true,
            factor: 0.1,
            min: -3276.8,
            max: 3276.7,
            unit: "A",
            receivers: ["TELEMATICS"],
          },
        ],
      },
    ],
    preservedStatements: [],
  };
  return db;
}

function unescapeDbcString(value: string): string {
  return value.replace(/\\"/g, '"').replace(/\\\\/g, "\\");
}

function escapeDbcString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\r?\n/g, "\\n");
}

function asNumber(value: string, fallback = 0): number {
  const parsed = Number(value.trim());
  return Number.isFinite(parsed) ? parsed : fallback;
}

function decodeDbcId(dbcId: number): { id: number; extended: boolean } {
  if (dbcId >= 0x80000000) {
    return { id: dbcId - 0x80000000, extended: true };
  }
  return { id: dbcId, extended: dbcId > 0x7ff };
}

function encodeDbcId(message: Pick<DbcMessage, "id" | "extended">): number {
  return message.extended ? message.id + 0x80000000 : message.id;
}

function parseMultiplex(token: string | undefined): string {
  if (!token) return "";
  return token.trim();
}

function statementLines(text: string): string[] {
  const lines = text.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n").split("\n");
  const statements: string[] = [];
  let buffer = "";
  let quoted = false;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (!buffer) {
      const requiresTerminator =
        /^\s*(CM_|BA_|BA_DEF_|BA_DEF_DEF_|VAL_|VAL_TABLE_|CAT_|CAT_DEF_|FILTER|EV_|ENVVAR_DATA_|SIG_|SGTYPE_|SIGTYPE_|BO_TX_BU_|BU_.._REL_|SG_MUL_VAL_)\s+/.test(
          line,
        ) && !/^\s*SG_\s/.test(line);
      if (!requiresTerminator || line.trimEnd().endsWith(";")) {
        statements.push(line);
        continue;
      }
      buffer = line;
    } else {
      buffer = `${buffer}\n${line}`;
    }

    quoted = false;
    for (let index = 0; index < buffer.length; index += 1) {
      if (buffer[index] === '"' && buffer[index - 1] !== "\\") quoted = !quoted;
    }
    if (!quoted && line.trimEnd().endsWith(";")) {
      statements.push(buffer);
      buffer = "";
    }
  }
  if (buffer.trim()) statements.push(buffer);
  return statements;
}

export function parseDbc(text: string, filename = "imported.dbc"): DbcDatabase {
  if (!/\b(?:VERSION|NS_|BS_|BU_|BO_)\b/.test(text)) {
    throw new Error("The input does not contain recognizable DBC structure.");
  }
  const database: DbcDatabase = {
    name: filename.toLowerCase().endsWith(".dbc") ? filename : `${filename}.dbc`,
    version: "",
    nodes: [],
    messages: [],
    preservedStatements: [],
  };

  const messagesByDbcId = new Map<number, DbcMessage>();
  let currentMessage: DbcMessage | null = null;
  let inNamespaceBlock = false;

  for (const statement of statementLines(text)) {
    const trimmed = statement.trim();
    if (!trimmed) continue;

    const version = trimmed.match(/^VERSION\s+"((?:\\.|[^"])*)"/);
    if (version) {
      database.version = unescapeDbcString(version[1]);
      continue;
    }

    if (/^NS_\s*:/.test(trimmed)) {
      inNamespaceBlock = true;
      continue;
    }
    if (inNamespaceBlock && /^\w+$/.test(trimmed)) continue;
    if (inNamespaceBlock && /^(BS_|BU_|BO_)/.test(trimmed)) inNamespaceBlock = false;

    if (/^BS_\s*:/.test(trimmed)) continue;

    const nodes = trimmed.match(/^BU_\s*:\s*(.*)$/);
    if (nodes) {
      database.nodes = nodes[1].trim().split(/\s+/).filter(Boolean);
      continue;
    }

    const messageMatch = trimmed.match(/^BO_\s+(\d+)\s+([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(\d+)\s+(\S+)/);
    if (messageMatch) {
      const dbcId = Number(messageMatch[1]);
      const decoded = decodeDbcId(dbcId);
      currentMessage = {
        uid: uid("msg"),
        id: decoded.id,
        extended: decoded.extended,
        name: messageMatch[2],
        dlc: Number(messageMatch[3]),
        transmitter: messageMatch[4],
        cycleTime: null,
        comment: "",
        signals: [],
      };
      database.messages.push(currentMessage);
      messagesByDbcId.set(dbcId, currentMessage);
      continue;
    }

    const signalMatch = statement.match(
      /^\s*SG_\s+([A-Za-z_][A-Za-z0-9_]*)(?:\s+([mM]\d*|m\d+M))?\s*:\s*(\d+)\|(\d+)@([01])([+-])\s+\(([^,]+),([^)]+)\)\s+\[([^|]+)\|([^\]]+)\]\s+"((?:\\.|[^"])*)"\s*(.*)$/s,
    );
    if (signalMatch && currentMessage) {
      const receiverText = signalMatch[12].trim();
      currentMessage.signals.push({
        uid: uid("sig"),
        name: signalMatch[1],
        multiplex: parseMultiplex(signalMatch[2]),
        startBit: Number(signalMatch[3]),
        length: Number(signalMatch[4]),
        byteOrder: signalMatch[5] === "1" ? "little" : "big",
        signed: signalMatch[6] === "-",
        factor: asNumber(signalMatch[7], 1),
        offset: asNumber(signalMatch[8]),
        min: asNumber(signalMatch[9]),
        max: asNumber(signalMatch[10]),
        unit: unescapeDbcString(signalMatch[11]),
        receivers: receiverText
          .replace(/;$/, "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        comment: "",
        valueType: "integer",
        values: [],
      });
      continue;
    }

    const messageComment = trimmed.match(/^CM_\s+BO_\s+(\d+)\s+"((?:\\.|[^"])*)"\s*;/s);
    if (messageComment) {
      const message = messagesByDbcId.get(Number(messageComment[1]));
      if (message) {
        message.comment = unescapeDbcString(messageComment[2]);
        continue;
      }
    }

    const signalComment = trimmed.match(
      /^CM_\s+SG_\s+(\d+)\s+([A-Za-z_][A-Za-z0-9_]*)\s+"((?:\\.|[^"])*)"\s*;/s,
    );
    if (signalComment) {
      const message = messagesByDbcId.get(Number(signalComment[1]));
      const signal = message?.signals.find((item) => item.name === signalComment[2]);
      if (signal) {
        signal.comment = unescapeDbcString(signalComment[3]);
        continue;
      }
    }

    const valueMatch = trimmed.match(
      /^VAL_\s+(\d+)\s+([A-Za-z_][A-Za-z0-9_]*)\s+([\s\S]*?)\s*;$/,
    );
    if (valueMatch) {
      const message = messagesByDbcId.get(Number(valueMatch[1]));
      const signal = message?.signals.find((item) => item.name === valueMatch[2]);
      if (signal) {
        const values: ValueDescription[] = [];
        const valueRegex = /(-?(?:\d+(?:\.\d+)?|\.\d+))\s+"((?:\\.|[^"])*)"/g;
        let valuePair: RegExpExecArray | null;
        while ((valuePair = valueRegex.exec(valueMatch[3]))) {
          values.push({ value: valuePair[1], label: unescapeDbcString(valuePair[2]) });
        }
        signal.values = values;
        continue;
      }
    }

    const cycleMatch = trimmed.match(/^BA_\s+"GenMsgCycleTime"\s+BO_\s+(\d+)\s+(-?\d+(?:\.\d+)?)\s*;/);
    if (cycleMatch) {
      const message = messagesByDbcId.get(Number(cycleMatch[1]));
      if (message) {
        message.cycleTime = Number(cycleMatch[2]);
        continue;
      }
    }

    const valueTypeMatch = trimmed.match(
      /^SIG_VALTYPE_\s+(\d+)\s+([A-Za-z_][A-Za-z0-9_]*)\s*:\s*([12])\s*;/,
    );
    if (valueTypeMatch) {
      const message = messagesByDbcId.get(Number(valueTypeMatch[1]));
      const signal = message?.signals.find((item) => item.name === valueTypeMatch[2]);
      if (signal) {
        signal.valueType = valueTypeMatch[3] === "1" ? "float" : "double";
        continue;
      }
    }

    if (
      !/^(NS_DESC_|CM_|BA_DEF_|BA_DEF_DEF_|BA_|VAL_TABLE_|CAT_DEF_|CAT_|FILTER|EV_DATA_|ENVVAR_DATA_|SGTYPE_|SGTYPE_VAL_|BA_DEF_SGTYPE_|BA_SGTYPE_|SIG_TYPE_REF_|VAL_|SIG_GROUP_|SIG_VALTYPE_|SIGTYPE_VALTYPE_|BO_TX_BU_|BA_DEF_REL_|BA_REL_|BA_DEF_DEF_REL_|BU_SG_REL_|BU_EV_REL_|BU_BO_REL_|SG_MUL_VAL_)/.test(
        trimmed,
      )
    ) {
      continue;
    }
    database.preservedStatements.push(statement.trim());
  }

  if (!database.version) database.version = "1.0";
  if (!database.nodes.length) {
    const inferred = new Set<string>();
    for (const message of database.messages) {
      if (message.transmitter && message.transmitter !== "Vector__XXX") inferred.add(message.transmitter);
      for (const signal of message.signals) {
        for (const receiver of signal.receivers) {
          if (receiver && receiver !== "Vector__XXX") inferred.add(receiver);
        }
      }
    }
    database.nodes = inferred.size ? [...inferred] : ["Vector__XXX"];
  }

  return database;
}

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "0";
  if (Object.is(value, -0)) return "0";
  return Number(value.toPrecision(14)).toString();
}

function namespaceBlock(): string {
  return `NS_ :
\tNS_DESC_
\tCM_
\tBA_DEF_
\tBA_
\tVAL_
\tCAT_DEF_
\tCAT_
\tFILTER
\tBA_DEF_DEF_
\tEV_DATA_
\tENVVAR_DATA_
\tSGTYPE_
\tSGTYPE_VAL_
\tBA_DEF_SGTYPE_
\tBA_SGTYPE_
\tSIG_TYPE_REF_
\tVAL_TABLE_
\tSIG_GROUP_
\tSIG_VALTYPE_
\tSIGTYPE_VALTYPE_
\tBO_TX_BU_
\tBA_DEF_REL_
\tBA_REL_
\tBA_DEF_DEF_REL_
\tBU_SG_REL_
\tBU_EV_REL_
\tBU_BO_REL_
\tSG_MUL_VAL_`;
}

export function serializeDbc(database: DbcDatabase): string {
  const lines: string[] = [];
  lines.push(`VERSION "${escapeDbcString(database.version)}"`, "", namespaceBlock(), "", "BS_:", "");
  lines.push(`BU_: ${database.nodes.join(" ")}`, "");

  for (const message of database.messages) {
    const dbcId = encodeDbcId(message);
    lines.push(`BO_ ${dbcId} ${message.name}: ${message.dlc} ${message.transmitter || "Vector__XXX"}`);
    for (const signal of message.signals) {
      const multiplex = signal.multiplex ? ` ${signal.multiplex}` : "";
      const byteOrder = signal.byteOrder === "little" ? "1" : "0";
      const sign = signal.signed ? "-" : "+";
      const receivers = signal.receivers.length ? signal.receivers.join(",") : "Vector__XXX";
      lines.push(
        ` SG_ ${signal.name}${multiplex} : ${signal.startBit}|${signal.length}@${byteOrder}${sign} (${formatNumber(signal.factor)},${formatNumber(signal.offset)}) [${formatNumber(signal.min)}|${formatNumber(signal.max)}] "${escapeDbcString(signal.unit)}" ${receivers}`,
      );
    }
    lines.push("");
  }

  const comments: string[] = [];
  const values: string[] = [];
  const valueTypes: string[] = [];
  const cycleTimes: string[] = [];
  for (const message of database.messages) {
    const dbcId = encodeDbcId(message);
    if (message.comment) comments.push(`CM_ BO_ ${dbcId} "${escapeDbcString(message.comment)}";`);
    if (message.cycleTime !== null && Number.isFinite(message.cycleTime)) {
      cycleTimes.push(`BA_ "GenMsgCycleTime" BO_ ${dbcId} ${formatNumber(message.cycleTime)};`);
    }
    for (const signal of message.signals) {
      if (signal.comment) {
        comments.push(`CM_ SG_ ${dbcId} ${signal.name} "${escapeDbcString(signal.comment)}";`);
      }
      if (signal.values.length) {
        const pairs = signal.values
          .filter((item) => item.value.trim() !== "" && item.label.trim() !== "")
          .map((item) => `${item.value.trim()} "${escapeDbcString(item.label.trim())}"`)
          .join(" ");
        if (pairs) values.push(`VAL_ ${dbcId} ${signal.name} ${pairs} ;`);
      }
      if (signal.valueType !== "integer") {
        valueTypes.push(`SIG_VALTYPE_ ${dbcId} ${signal.name} : ${signal.valueType === "float" ? 1 : 2};`);
      }
    }
  }

  if (comments.length) lines.push(...comments, "");
  if (database.messages.some((message) => message.cycleTime !== null)) {
    lines.push('BA_DEF_ BO_ "GenMsgCycleTime" INT 0 65535;', ...cycleTimes, "");
  }
  if (values.length) lines.push(...values, "");
  if (valueTypes.length) lines.push(...valueTypes, "");

  const generatedPrefixes = [
    'BA_DEF_ BO_ "GenMsgCycleTime"',
    'BA_ "GenMsgCycleTime"',
  ];
  const preserved = database.preservedStatements.filter(
    (statement) => !generatedPrefixes.some((prefix) => statement.startsWith(prefix)),
  );
  if (preserved.length) lines.push(...preserved, "");

  return `${lines.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd()}\n`;
}

export function displayCanId(message: Pick<DbcMessage, "id" | "extended">): string {
  return `0x${Math.max(0, message.id)
    .toString(16)
    .toUpperCase()
    .padStart(message.extended ? 8 : 3, "0")}`;
}

export function parseCanId(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = /^0x/i.test(trimmed) ? Number.parseInt(trimmed.slice(2), 16) : Number(trimmed);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}

export function computeSignalBits(signal: Pick<DbcSignal, "startBit" | "length" | "byteOrder">): number[] {
  if (!Number.isInteger(signal.startBit) || !Number.isInteger(signal.length) || signal.length < 1) return [];
  if (signal.byteOrder === "little") {
    return Array.from({ length: signal.length }, (_, index) => signal.startBit + index);
  }

  const bits: number[] = [];
  let bit = signal.startBit;
  for (let index = 0; index < signal.length; index += 1) {
    bits.push(bit);
    bit = bit % 8 === 0 ? bit + 15 : bit - 1;
  }
  return bits;
}

function overlapsAllowed(first: DbcSignal, second: DbcSignal): boolean {
  const firstMux = first.multiplex.match(/^m(\d+)/);
  const secondMux = second.multiplex.match(/^m(\d+)/);
  return Boolean(firstMux && secondMux && firstMux[1] !== secondMux[1]);
}

export function validateDbc(database: DbcDatabase): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const messageIds = new Map<string, DbcMessage>();
  const messageNames = new Map<string, DbcMessage>();

  if (!database.messages.length) {
    issues.push({ level: "warning", code: "EMPTY_DATABASE", text: "DBC dosyasında mesaj bulunmuyor." });
  }

  for (const node of database.nodes) {
    if (!IDENTIFIER.test(node)) {
      issues.push({ level: "error", code: "INVALID_NODE", text: `Geçersiz node adı: ${node}` });
    }
  }

  for (const message of database.messages) {
    const idKey = `${message.extended ? "E" : "S"}:${message.id}`;
    if (messageIds.has(idKey)) {
      issues.push({
        level: "error",
        code: "DUPLICATE_MESSAGE_ID",
        messageUid: message.uid,
        text: `${displayCanId(message)} kimliği birden fazla mesajda kullanılıyor.`,
      });
    } else {
      messageIds.set(idKey, message);
    }

    if (messageNames.has(message.name)) {
      issues.push({
        level: "error",
        code: "DUPLICATE_MESSAGE_NAME",
        messageUid: message.uid,
        text: `${message.name} mesaj adı birden fazla kez kullanılıyor.`,
      });
    } else {
      messageNames.set(message.name, message);
    }

    if (!IDENTIFIER.test(message.name)) {
      issues.push({
        level: "error",
        code: "INVALID_MESSAGE_NAME",
        messageUid: message.uid,
        text: `${message.name || "(boş)"} geçerli bir DBC mesaj adı değil.`,
      });
    }
    if (!Number.isInteger(message.id) || message.id < 0 || message.id > (message.extended ? 0x1fffffff : 0x7ff)) {
      issues.push({
        level: "error",
        code: "INVALID_MESSAGE_ID",
        messageUid: message.uid,
        text: `${message.name} için CAN ID ${message.extended ? "29 bit" : "11 bit"} sınırları dışında.`,
      });
    }
    if (!Number.isInteger(message.dlc) || message.dlc < 0 || message.dlc > 64) {
      issues.push({
        level: "error",
        code: "INVALID_DLC",
        messageUid: message.uid,
        text: `${message.name} için DLC 0–64 aralığında olmalı.`,
      });
    } else if (message.dlc > 8 && !CAN_FD_LENGTHS.has(message.dlc)) {
      issues.push({
        level: "warning",
        code: "NON_STANDARD_FD_LENGTH",
        messageUid: message.uid,
        text: `${message.name} için ${message.dlc} byte, standart CAN FD veri uzunluklarından biri değil.`,
      });
    }
    if (message.transmitter && message.transmitter !== "Vector__XXX" && !IDENTIFIER.test(message.transmitter)) {
      issues.push({
        level: "error",
        code: "INVALID_TRANSMITTER",
        messageUid: message.uid,
        text: `${message.name} mesajının transmitter adı geçersiz.`,
      });
    }

    const signalNames = new Set<string>();
    const occupied = new Map<number, DbcSignal[]>();
    for (const signal of message.signals) {
      if (signalNames.has(signal.name)) {
        issues.push({
          level: "error",
          code: "DUPLICATE_SIGNAL_NAME",
          messageUid: message.uid,
          signalUid: signal.uid,
          text: `${message.name} içinde ${signal.name} sinyali birden fazla kez bulunuyor.`,
        });
      }
      signalNames.add(signal.name);

      if (!IDENTIFIER.test(signal.name)) {
        issues.push({
          level: "error",
          code: "INVALID_SIGNAL_NAME",
          messageUid: message.uid,
          signalUid: signal.uid,
          text: `${signal.name || "(boş)"} geçerli bir DBC sinyal adı değil.`,
        });
      }
      if (!Number.isInteger(signal.startBit) || signal.startBit < 0) {
        issues.push({
          level: "error",
          code: "INVALID_START_BIT",
          messageUid: message.uid,
          signalUid: signal.uid,
          text: `${signal.name} için start bit negatif olmayan bir tam sayı olmalı.`,
        });
      }
      if (!Number.isInteger(signal.length) || signal.length < 1 || signal.length > 64) {
        issues.push({
          level: "error",
          code: "INVALID_SIGNAL_LENGTH",
          messageUid: message.uid,
          signalUid: signal.uid,
          text: `${signal.name} için uzunluk 1–64 bit aralığında olmalı.`,
        });
      }
      if (!Number.isFinite(signal.factor) || signal.factor === 0) {
        issues.push({
          level: signal.factor === 0 ? "warning" : "error",
          code: "INVALID_FACTOR",
          messageUid: message.uid,
          signalUid: signal.uid,
          text: `${signal.name} için factor sonlu ve tercihen sıfırdan farklı olmalı.`,
        });
      }
      if (signal.min > signal.max) {
        issues.push({
          level: "error",
          code: "MIN_GREATER_THAN_MAX",
          messageUid: message.uid,
          signalUid: signal.uid,
          text: `${signal.name} için minimum değer maksimumdan büyük.`,
        });
      }
      if (signal.valueType === "float" && signal.length !== 32) {
        issues.push({
          level: "error",
          code: "FLOAT_LENGTH",
          messageUid: message.uid,
          signalUid: signal.uid,
          text: `${signal.name} float sinyali 32 bit olmalı.`,
        });
      }
      if (signal.valueType === "double" && signal.length !== 64) {
        issues.push({
          level: "error",
          code: "DOUBLE_LENGTH",
          messageUid: message.uid,
          signalUid: signal.uid,
          text: `${signal.name} double sinyali 64 bit olmalı.`,
        });
      }

      const bits = computeSignalBits(signal);
      if (bits.some((bit) => bit < 0 || bit >= message.dlc * 8)) {
        issues.push({
          level: "error",
          code: "SIGNAL_OUT_OF_BOUNDS",
          messageUid: message.uid,
          signalUid: signal.uid,
          text: `${signal.name}, ${message.dlc} byte mesaj sınırının dışına taşıyor.`,
        });
      }
      for (const bit of bits) {
        const priorSignals = occupied.get(bit) ?? [];
        const conflicting = priorSignals.find((prior) => !overlapsAllowed(prior, signal));
        if (conflicting) {
          issues.push({
            level: "error",
            code: "SIGNAL_OVERLAP",
            messageUid: message.uid,
            signalUid: signal.uid,
            text: `${signal.name}, bit ${bit} üzerinde ${conflicting.name} ile çakışıyor.`,
          });
          break;
        }
        occupied.set(bit, [...priorSignals, signal]);
      }
    }
  }

  return issues;
}

export function cloneMessage(message: DbcMessage, index: number): DbcMessage {
  return {
    ...message,
    uid: uid("msg"),
    id: message.id + 1,
    name: `${message.name}_Copy_${index + 1}`,
    signals: message.signals.map((signal) => ({
      ...signal,
      uid: uid("sig"),
      receivers: [...signal.receivers],
      values: signal.values.map((item) => ({ ...item })),
    })),
  };
}

export function cloneSignal(signal: DbcSignal, index: number): DbcSignal {
  return {
    ...signal,
    uid: uid("sig"),
    name: `${signal.name}_Copy_${index + 1}`,
    startBit: signal.startBit + signal.length,
    receivers: [...signal.receivers],
    values: signal.values.map((item) => ({ ...item })),
  };
}
