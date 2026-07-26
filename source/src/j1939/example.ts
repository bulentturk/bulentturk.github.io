import type { LogFrame, ParsedLog } from "../can-log/log";

function extendedFrame(
  sequence: number,
  timestampMs: number,
  id: number,
  data: number[],
): LogFrame {
  return {
    sequence,
    timestampMs,
    id,
    extended: true,
    rtr: false,
    error: false,
    data,
    direction: "rx",
    channel: "1",
    sourceLine: sequence,
    type: "can",
  };
}

function u16(value: number): [number, number] {
  return [value & 0xff, (value >>> 8) & 0xff];
}

function u32(value: number): [number, number, number, number] {
  return [
    value & 0xff,
    (value >>> 8) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 24) & 0xff,
  ];
}

function dtc(spn: number, fmi: number, occurrenceCount: number): number[] {
  return [
    spn & 0xff,
    (spn >>> 8) & 0xff,
    ((spn >>> 16) & 0x7) << 5 | (fmi & 0x1f),
    occurrenceCount & 0x7f,
  ];
}

function singleDm1(sequence: number, timestampMs: number, records: number[][]): LogFrame {
  const record = records[0] ?? [0, 0, 0, 0];
  const lamps = records.length ? [0x04, 0xff] : [0x00, 0xff];
  return extendedFrame(
    sequence,
    timestampMs,
    0x18feca00,
    [...lamps, ...record, 0xff, 0xff],
  );
}

export function createJ1939ExampleLog(): ParsedLog {
  const frames: LogFrame[] = [];
  let sequence = 1;
  let engineHours = 6842.5;

  for (let second = 0; second <= 24; second += 1) {
    const timestampMs = second * 1000;
    const rpm = second < 3 ? 780 : Math.round(1150 + 650 * Math.sin(second / 3.2));
    const torque = Math.max(0, Math.round(35 + 28 * Math.sin(second / 2.1)));
    const demandedTorque = Math.min(100, torque + 8);
    const coolant = second < 5 ? 86 : Math.min(116, 86 + (second - 5) * 2.15);
    const oilTemperature = 91 + second * 0.5;
    const oilPressure = second < 12 ? 420 - second * 4 : Math.max(92, 372 - (second - 11) * 31);
    const speed = Math.max(0, rpm - 700) * 0.018;
    const battery = 27.8 - Math.max(0, second - 18) * 0.16;

    const rpmRaw = Math.round(rpm / 0.125);
    frames.push(extendedFrame(
      sequence++,
      timestampMs + 20,
      0x0cf00400,
      [
        0x01,
        demandedTorque + 125,
        torque + 125,
        ...u16(rpmRaw),
        0x00,
        0x00,
        demandedTorque + 125,
      ],
    ));

    engineHours += 1 / 3600;
    frames.push(extendedFrame(
      sequence++,
      timestampMs + 40,
      0x18fee500,
      [...u32(Math.round(engineHours / 0.05)), 0xff, 0xff, 0xff, 0xff],
    ));

    const oilTemperatureRaw = Math.round((oilTemperature + 273) / 0.03125);
    frames.push(extendedFrame(
      sequence++,
      timestampMs + 60,
      0x18feee00,
      [
        Math.round(coolant + 40),
        0xff,
        ...u16(oilTemperatureRaw),
        0xff,
        0xff,
        0xff,
        0xff,
      ],
    ));

    frames.push(extendedFrame(
      sequence++,
      timestampMs + 80,
      0x18feef00,
      [125, 0xff, 0xfa, Math.round(oilPressure / 4), 0xff, 0xff, 0x64, 0xfa],
    ));

    const speedRaw = Math.round(speed / 0.00390625);
    frames.push(extendedFrame(
      sequence++,
      timestampMs + 100,
      0x18fef100,
      [0x00, ...u16(speedRaw), 0x00, 0x00, 0x00, 0x00, 0x00],
    ));

    const voltageRaw = Math.round(battery / 0.05);
    frames.push(extendedFrame(
      sequence++,
      timestampMs + 120,
      0x18fef700,
      [125, 45, ...u16(voltageRaw), ...u16(voltageRaw), ...u16(voltageRaw - 2)],
    ));

    if (second < 5 || second >= 21) {
      frames.push(singleDm1(sequence++, timestampMs + 200, []));
    } else if (second < 12) {
      frames.push(singleDm1(sequence++, timestampMs + 200, [dtc(110, 0, 1)]));
    } else if (second < 18) {
      const payload = [0x14, 0xff, ...dtc(110, 0, 1), ...dtc(100, 1, 2)];
      const first = payload.slice(0, 7);
      const secondPacket = payload.slice(7);
      while (secondPacket.length < 7) secondPacket.push(0xff);
      frames.push(extendedFrame(
        sequence++,
        timestampMs + 180,
        0x1cecff00,
        [0x20, payload.length, 0x00, 0x02, 0xff, 0xca, 0xfe, 0x00],
      ));
      frames.push(extendedFrame(
        sequence++,
        timestampMs + 190,
        0x1cebff00,
        [0x01, ...first],
      ));
      frames.push(extendedFrame(
        sequence++,
        timestampMs + 200,
        0x1cebff00,
        [0x02, ...secondPacket],
      ));
    } else {
      frames.push(singleDm1(sequence++, timestampMs + 200, [dtc(100, 1, 2)]));
    }
  }

  frames.sort(
    (first, second) => first.timestampMs - second.timestampMs || first.sequence - second.sequence,
  );
  frames.forEach((frame, index) => {
    frame.sequence = index + 1;
    frame.sourceLine = index + 1;
  });
  return {
    name: "j1939-dm1-ornek-motor-kaydi.trc",
    format: "trc",
    formatLabel: "PEAK TRC 2.1",
    version: "2.1",
    frames,
    skippedLines: 0,
    warnings: [],
    durationMs: frames[frames.length - 1].timestampMs - frames[0].timestampMs,
  };
}
