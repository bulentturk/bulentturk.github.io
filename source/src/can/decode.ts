import type { DbcDatabase, DbcMessage, DbcSignal } from "../dbc/dbc";
import { computeSignalBits } from "../dbc/dbc";

export type CanFrame = {
  sequence: number;
  timestampMs: number;
  id: number;
  extended: boolean;
  rtr: boolean;
  error: boolean;
  direction?: "rx" | "tx" | "unknown";
  data: number[];
};

export type DecodedSignal = {
  signal: DbcSignal;
  raw: string;
  numericValue: number;
  displayValue: string;
  valueLabel: string | null;
};

export function frameKey(frame: Pick<CanFrame, "id" | "extended">): string {
  return `${frame.extended ? "E" : "S"}:${frame.id}`;
}

export function findDbcMessage(
  database: DbcDatabase | null,
  frame: Pick<CanFrame, "id" | "extended">,
): DbcMessage | null {
  if (!database) return null;
  return (
    database.messages.find(
      (message) => message.id === frame.id && message.extended === frame.extended,
    ) ?? null
  );
}

function rawInteger(signal: DbcSignal, data: number[]): bigint | null {
  const bits = computeSignalBits(signal);
  if (!bits.length || bits.some((bit) => bit < 0 || Math.floor(bit / 8) >= data.length)) {
    return null;
  }

  let raw = 0n;
  if (signal.byteOrder === "little") {
    bits.forEach((bit, index) => {
      const value = (data[Math.floor(bit / 8)] >> (bit % 8)) & 1;
      if (value) raw |= 1n << BigInt(index);
    });
  } else {
    for (const bit of bits) {
      const value = (data[Math.floor(bit / 8)] >> (bit % 8)) & 1;
      raw = (raw << 1n) | BigInt(value);
    }
  }

  if (signal.signed && signal.length > 0) {
    const signBit = 1n << BigInt(signal.length - 1);
    if ((raw & signBit) !== 0n) raw -= 1n << BigInt(signal.length);
  }
  return raw;
}

function floatingValue(signal: DbcSignal, raw: bigint): number {
  const byteLength = signal.valueType === "double" ? 8 : 4;
  const buffer = new ArrayBuffer(byteLength);
  const view = new DataView(buffer);
  const unsigned = raw < 0n ? raw + (1n << BigInt(byteLength * 8)) : raw;

  if (signal.valueType === "float") {
    view.setUint32(0, Number(unsigned & 0xffffffffn), signal.byteOrder === "little");
    return view.getFloat32(0, signal.byteOrder === "little");
  }

  view.setBigUint64(0, unsigned & 0xffffffffffffffffn, signal.byteOrder === "little");
  return view.getFloat64(0, signal.byteOrder === "little");
}

function formatPhysical(value: number): string {
  if (!Number.isFinite(value)) return String(value);
  if (Number.isInteger(value)) return value.toString();
  const magnitude = Math.abs(value);
  if (magnitude !== 0 && (magnitude >= 1e7 || magnitude < 1e-5)) {
    return value.toExponential(5);
  }
  return Number(value.toPrecision(8)).toString();
}

function multiplexValue(message: DbcMessage, data: number[]): bigint | null {
  const multiplexer = message.signals.find((signal) => signal.multiplex === "M");
  return multiplexer ? rawInteger(multiplexer, data) : null;
}

function signalIsActive(signal: DbcSignal, muxValue: bigint | null): boolean {
  if (!signal.multiplex || signal.multiplex === "M") return true;
  const match = signal.multiplex.match(/^m(\d+)/);
  return !match || muxValue === null || muxValue === BigInt(match[1]);
}

export function decodeMessage(frame: CanFrame, message: DbcMessage | null): DecodedSignal[] {
  if (!message || frame.rtr || frame.error) return [];
  const muxValue = multiplexValue(message, frame.data);

  return message.signals.flatMap((signal) => {
    if (!signalIsActive(signal, muxValue)) return [];
    const raw = rawInteger(signal, frame.data);
    if (raw === null) return [];

    const unscaled =
      signal.valueType === "integer" ? Number(raw) : floatingValue(signal, raw);
    const numericValue = unscaled * signal.factor + signal.offset;
    const rawText = raw.toString();
    const valueLabel =
      signal.values.find((item) => item.value.trim() === rawText)?.label ?? null;

    return [
      {
        signal,
        raw: rawText,
        numericValue,
        displayValue: formatPhysical(numericValue),
        valueLabel,
      },
    ];
  });
}

export function formatCanId(frame: Pick<CanFrame, "id" | "extended">): string {
  return `0x${Math.max(0, frame.id)
    .toString(16)
    .toUpperCase()
    .padStart(frame.extended ? 8 : 3, "0")}`;
}

export function formatData(data: number[]): string {
  return data.map((byte) => byte.toString(16).toUpperCase().padStart(2, "0")).join(" ");
}
