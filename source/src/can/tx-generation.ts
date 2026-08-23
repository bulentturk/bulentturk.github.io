export type TxByteMode = "fixed" | "manual" | "counter" | "checksum";

export type ChecksumAlgorithm = "sum8" | "xor8" | "crc8-sae-j1850";

export type TxByteConfig = {
  mode: TxByteMode;
  min: number;
  max: number;
  step: number;
  checksumAlgorithm: ChecksumAlgorithm;
  checksumStart: number;
  checksumEnd: number;
};

export function createDefaultTxByteConfig(index: number): TxByteConfig {
  return {
    mode: "fixed",
    min: 0,
    max: 255,
    step: 1,
    checksumAlgorithm: "sum8",
    checksumStart: 0,
    checksumEnd: index > 0 ? index - 1 : 7,
  };
}

export function createDefaultTxByteConfigs(): TxByteConfig[] {
  return Array.from({ length: 8 }, (_, index) => createDefaultTxByteConfig(index));
}

export function clampByte(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(255, Math.max(0, Math.round(value)));
}

export function normalizeTxByteConfig(config: TxByteConfig, dlc: number): TxByteConfig {
  const lastByte = Math.max(0, Math.min(7, dlc - 1));
  const min = clampByte(Math.min(config.min, config.max));
  const max = clampByte(Math.max(config.min, config.max));
  return {
    ...config,
    min,
    max,
    step: Math.max(1, clampByte(config.step)),
    checksumStart: Math.min(lastByte, Math.max(0, Math.round(config.checksumStart))),
    checksumEnd: Math.min(lastByte, Math.max(0, Math.round(config.checksumEnd))),
  };
}

export function checksumBytes(
  algorithm: ChecksumAlgorithm,
  bytes: number[],
): number {
  if (algorithm === "sum8") {
    return bytes.reduce((sum, byte) => (sum + byte) & 0xff, 0);
  }
  if (algorithm === "xor8") {
    return bytes.reduce((result, byte) => result ^ byte, 0) & 0xff;
  }

  let crc = 0xff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x80 ? ((crc << 1) ^ 0x1d) & 0xff : (crc << 1) & 0xff;
    }
  }
  return (crc ^ 0xff) & 0xff;
}

export function generateTxPayload(
  byteValues: number[],
  byteConfigs: TxByteConfig[],
  dlc: number,
): number[] {
  const payload = byteValues.slice(0, dlc).map(clampByte);
  for (let index = 0; index < dlc; index += 1) {
    const config = normalizeTxByteConfig(
      byteConfigs[index] ?? createDefaultTxByteConfig(index),
      dlc,
    );
    if (config.mode === "manual" || config.mode === "counter") {
      payload[index] = Math.min(config.max, Math.max(config.min, payload[index]));
    }
  }
  for (let index = 0; index < dlc; index += 1) {
    const config = normalizeTxByteConfig(
      byteConfigs[index] ?? createDefaultTxByteConfig(index),
      dlc,
    );
    if (config.mode !== "checksum") continue;

    const first = Math.min(config.checksumStart, config.checksumEnd);
    const last = Math.max(config.checksumStart, config.checksumEnd);
    const checksumInput = payload.filter(
      (_, byteIndex) => byteIndex >= first && byteIndex <= last && byteIndex !== index,
    );
    payload[index] = checksumBytes(config.checksumAlgorithm, checksumInput);
  }
  return payload;
}

export function advanceTxCounters(
  byteValues: number[],
  byteConfigs: TxByteConfig[],
  dlc: number,
): number[] {
  return byteValues.slice(0, dlc).map((value, index) => {
    const config = normalizeTxByteConfig(
      byteConfigs[index] ?? createDefaultTxByteConfig(index),
      dlc,
    );
    if (config.mode !== "counter") return clampByte(value);
    const current = Math.min(config.max, Math.max(config.min, clampByte(value)));
    const next = current + config.step;
    return next > config.max ? config.min : next;
  });
}

export function formatTxByte(value: number): string {
  return clampByte(value).toString(16).toUpperCase().padStart(2, "0");
}
