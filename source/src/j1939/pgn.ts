export const MAX_J1939_CAN_ID = 0x1fffffff;
export const MAX_J1939_PGN = 0x3ffff;

export type NumberRadix = 10 | 16;

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

export type J1939BuildInput = {
  pgn: number;
  priority: number;
  sourceAddress: number;
  destinationAddress: number;
};

export function parseFormattedNumber(value: string, radix: NumberRadix, maximum: number): number | null {
  const normalized = value.trim().replaceAll("_", "").replaceAll(" ", "");
  if (!normalized) return null;

  const withoutPrefix = normalized.replace(/^0x/i, "");
  const pattern = radix === 16 ? /^[0-9a-f]+$/i : /^\d+$/;
  if (!pattern.test(withoutPrefix)) return null;

  const parsed = Number.parseInt(withoutPrefix, radix);
  return Number.isSafeInteger(parsed) && parsed >= 0 && parsed <= maximum ? parsed : null;
}

export function parseAutoNumber(value: string, maximum: number): number | null {
  const normalized = value.trim().replaceAll("_", "");
  const radix: NumberRadix = /^0x/i.test(normalized) || /[a-f]/i.test(normalized) ? 16 : 10;
  return parseFormattedNumber(normalized, radix, maximum);
}

export function decodeJ1939CanId(id: number): J1939Identifier | null {
  if (!Number.isInteger(id) || id < 0 || id > MAX_J1939_CAN_ID) return null;

  const priority = Math.floor(id / 0x4000000) & 0x7;
  const extendedDataPage = Math.floor(id / 0x2000000) & 0x1;
  const dataPage = Math.floor(id / 0x1000000) & 0x1;
  const pduFormat = Math.floor(id / 0x10000) & 0xff;
  const pduSpecific = Math.floor(id / 0x100) & 0xff;
  const sourceAddress = id & 0xff;
  const pduType = pduFormat < 240 ? "PDU1" : "PDU2";
  const destinationAddress = pduType === "PDU1" ? pduSpecific : null;
  const pgn =
    extendedDataPage * 0x20000
    + dataPage * 0x10000
    + pduFormat * 0x100
    + (pduType === "PDU2" ? pduSpecific : 0);

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

export function buildJ1939CanId(input: J1939BuildInput): number | null {
  const { pgn, priority, sourceAddress, destinationAddress } = input;
  if (!Number.isInteger(pgn) || pgn < 0 || pgn > MAX_J1939_PGN) return null;
  if (!Number.isInteger(priority) || priority < 0 || priority > 7) return null;
  if (!Number.isInteger(sourceAddress) || sourceAddress < 0 || sourceAddress > 0xff) return null;
  if (!Number.isInteger(destinationAddress) || destinationAddress < 0 || destinationAddress > 0xff) return null;

  const extendedDataPage = Math.floor(pgn / 0x20000) & 0x1;
  const dataPage = Math.floor(pgn / 0x10000) & 0x1;
  const pduFormat = Math.floor(pgn / 0x100) & 0xff;
  const pduSpecific = pgn & 0xff;
  const isPdu1 = pduFormat < 240;
  if (isPdu1 && pduSpecific !== 0) return null;

  return priority * 0x4000000
    + extendedDataPage * 0x2000000
    + dataPage * 0x1000000
    + pduFormat * 0x10000
    + (isPdu1 ? destinationAddress : pduSpecific) * 0x100
    + sourceAddress;
}

export function formatHex(value: number, width: number): string {
  return `0x${value.toString(16).toUpperCase().padStart(width, "0")}`;
}

export function formatAddress(value: number): string {
  return `${formatHex(value, 2)} · ${value}`;
}

export function formatCanIdBinary(value: number): string {
  const bits = value.toString(2).padStart(29, "0");
  return [bits.slice(0, 3), bits.slice(3, 4), bits.slice(4, 5), bits.slice(5, 13), bits.slice(13, 21), bits.slice(21)].join(" ");
}
