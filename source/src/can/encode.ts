import type { DbcMessage, DbcSignal } from "../dbc/dbc";
import { computeSignalBits } from "../dbc/dbc";

export type SignalValueMap = Record<string, number>;

function finiteOr(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
}

function signalBounds(signal: DbcSignal): { minimum: number; maximum: number } {
  const bitMaximum = signal.signed
    ? 2 ** Math.max(0, signal.length - 1) - 1
    : 2 ** Math.min(signal.length, 52) - 1;
  const bitMinimum = signal.signed ? -(2 ** Math.max(0, signal.length - 1)) : 0;
  const first = bitMinimum * signal.factor + signal.offset;
  const second = bitMaximum * signal.factor + signal.offset;
  const encodedMinimum = Math.min(first, second);
  const encodedMaximum = Math.max(first, second);
  const dbcMinimum = finiteOr(signal.min, encodedMinimum);
  const dbcMaximum = finiteOr(signal.max, encodedMaximum);

  if (dbcMaximum > dbcMinimum || (dbcMinimum === 0 && dbcMaximum === 0)) {
    return {
      minimum: dbcMaximum === dbcMinimum ? encodedMinimum : dbcMinimum,
      maximum: dbcMaximum === dbcMinimum ? encodedMaximum : dbcMaximum,
    };
  }
  return { minimum: encodedMinimum, maximum: encodedMaximum };
}

export function signalPhysicalBounds(signal: DbcSignal): {
  minimum: number;
  maximum: number;
} {
  return signalBounds(signal);
}

export function initialSignalValue(signal: DbcSignal): number {
  const { minimum, maximum } = signalBounds(signal);
  if (signal.values.length) {
    const zero = signal.values.find((item) => Number(item.value) === 0);
    const raw = Number(zero?.value ?? signal.values[0].value);
    const physical = raw * signal.factor + signal.offset;
    if (Number.isFinite(physical)) return Math.min(maximum, Math.max(minimum, physical));
  }
  return Math.min(maximum, Math.max(minimum, 0));
}

export function createInitialSignalValues(message: DbcMessage): SignalValueMap {
  return Object.fromEntries(
    message.signals.map((signal) => [signal.uid, initialSignalValue(signal)]),
  );
}

export function physicalToRaw(signal: DbcSignal, physicalValue: number): number {
  if (!Number.isFinite(physicalValue)) return 0;
  const unscaled = signal.factor === 0
    ? physicalValue - signal.offset
    : (physicalValue - signal.offset) / signal.factor;
  return signal.valueType === "integer" ? Math.round(unscaled) : unscaled;
}

export function rawToPhysical(signal: DbcSignal, rawValue: number): number {
  return rawValue * signal.factor + signal.offset;
}

function floatBits(signal: DbcSignal, value: number): bigint {
  if (signal.valueType === "float") {
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    view.setFloat32(0, value, signal.byteOrder === "little");
    return BigInt(view.getUint32(0, signal.byteOrder === "little"));
  }
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setFloat64(0, value, signal.byteOrder === "little");
  return view.getBigUint64(0, signal.byteOrder === "little");
}

function integerBits(signal: DbcSignal, value: number): bigint {
  const length = BigInt(Math.max(1, signal.length));
  const modulus = 1n << length;
  let raw = BigInt(Math.round(value));
  if (raw < 0n) raw = modulus + raw;
  return raw & (modulus - 1n);
}

function writeSignal(payload: number[], signal: DbcSignal, physicalValue: number) {
  const bits = computeSignalBits(signal);
  if (!bits.length || bits.some((bit) => bit < 0 || bit >= payload.length * 8)) return;
  const unscaled = physicalToRaw(signal, physicalValue);
  const raw = signal.valueType === "integer"
    ? integerBits(signal, unscaled)
    : floatBits(signal, unscaled);

  bits.forEach((payloadBit, index) => {
    const rawBit = signal.byteOrder === "little" ? index : signal.length - 1 - index;
    const value = Number((raw >> BigInt(rawBit)) & 1n);
    const byteIndex = Math.floor(payloadBit / 8);
    const mask = 1 << (payloadBit % 8);
    payload[byteIndex] = value ? payload[byteIndex] | mask : payload[byteIndex] & ~mask;
  });
}

function multiplexerRawValue(message: DbcMessage, values: SignalValueMap): number | null {
  const multiplexer = message.signals.find((signal) => signal.multiplex === "M");
  if (!multiplexer) return null;
  return physicalToRaw(
    multiplexer,
    values[multiplexer.uid] ?? initialSignalValue(multiplexer),
  );
}

export function signalIsActive(
  signal: DbcSignal,
  multiplexerRaw: number | null,
): boolean {
  if (!signal.multiplex || signal.multiplex === "M") return true;
  const match = signal.multiplex.match(/^m(\d+)/);
  return !match || multiplexerRaw === null || Number(match[1]) === multiplexerRaw;
}

export function activeMessageSignals(
  message: DbcMessage,
  values: SignalValueMap,
): DbcSignal[] {
  const multiplexerRaw = multiplexerRawValue(message, values);
  return message.signals.filter((signal) => signalIsActive(signal, multiplexerRaw));
}

export function encodeMessagePayload(
  message: DbcMessage,
  values: SignalValueMap,
): number[] {
  const payload = Array.from({ length: Math.max(0, Math.min(64, message.dlc)) }, () => 0xff);
  for (const signal of activeMessageSignals(message, values)) {
    writeSignal(payload, signal, values[signal.uid] ?? initialSignalValue(signal));
  }
  return payload;
}
