"use client";

import {
  type ChangeEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  type CanFrame,
  decodeMessage,
  findDbcMessage,
  formatCanId,
  formatData,
  frameKey,
} from "./can/decode";
import {
  type DbcDatabase,
  createExampleDatabase,
  displayCanId,
  parseDbc,
} from "./dbc/dbc";
import "./can-viewer.css";

type Language = "tr" | "en";
type ViewMode = "messages" | "trace";
type ConnectionMode = "listen" | "transmit";

type RecordedFrame = {
  frame: CanFrame;
  direction: "rx" | "tx";
  elapsedMs: number;
};

type BridgeStatus = {
  ok: boolean;
  version?: string;
  connected?: boolean;
  channel?: number;
  bitrate?: number;
  listenOnly?: boolean;
  error?: string;
  dropped?: number;
  sent?: number;
};

type AggregateRow = {
  frame: CanFrame;
  count: number;
  periodMs: number | null;
  firstSeen: number;
  lastSeen: number;
};

const BRIDGE_URL = "http://127.0.0.1:8765/api";
const MAX_DBC_SIZE = 20 * 1024 * 1024;
const MAX_HISTORY = 5000;
const MAX_RECORDING_FRAMES = 1_000_000;

const bitrates = [
  1_000_000,
  800_000,
  500_000,
  250_000,
  125_000,
  100_000,
  95_238,
  83_333,
  50_000,
  47_619,
  33_333,
  20_000,
  10_000,
  5_000,
];

const copy = {
  tr: {
    back: "Ana site",
    title: "CAN Viewer",
    subtitle: "PCAN-USB ile canlı izleme, güvenli gönderme ve CAN kaydı",
    readonly: "Varsayılan güvenli mod",
    privacy: "DBC ve CAN verisi bilgisayarınızdan dışarı çıkmaz",
    bridge: "Yerel köprü",
    device: "PCAN bağlantısı",
    online: "Hazır",
    offline: "Bulunamadı",
    connected: "Bağlı",
    disconnected: "Bağlı değil",
    channel: "Kanal",
    bitrate: "Bit hızı",
    listenOnly: "Listen-only",
    mode: "Çalışma modu",
    receiveMode: "Yalnız dinle",
    transmitMode: "Gönderme açık",
    txAcknowledgement:
      "Mesaj göndermenin bağlı makinede beklenmeyen hareket veya fonksiyon oluşturabileceğini anlıyorum.",
    txWarning:
      "Gönderme modu CAN hattına aktif mesaj yazar. Doğru ID, veri ve makine durumunu doğrulamadan kullanmayın.",
    connect: "CAN hattına bağlan",
    disconnect: "Bağlantıyı kes",
    demo: "Simülasyonu başlat",
    stopDemo: "Simülasyonu durdur",
    browserSupport: "Windows · Chrome veya Edge önerilir",
    setupTitle: "PCAN-USB bağlantısını bir kez hazırlayın",
    setupIntro:
      "Tarayıcı, PEAK sürücüsüne doğrudan erişemediği için küçük yerel köprü açık olmalıdır.",
    driverTitle: "PEAK sürücüsü",
    driverText: "Resmî PCAN sürücüsünü kurun ve PCAN-USB’yi bilgisayara bağlayın.",
    driverAction: "Sürücüyü indir",
    bridgeTitle: "Yerel köprü",
    bridgeText: "ZIP’i çıkarın ve Start-PCAN-Bridge.cmd dosyasını çalıştırın.",
    bridgeAction: "Windows köprüsünü indir",
    browserTitle: "Viewer’a bağlanın",
    browserText: "Kanalı ve bit hızını seçip CAN hattına bağlan düğmesine basın.",
    dbc: "DBC dosyası",
    noDbc: "DBC yüklenmedi",
    openDbc: "DBC yükle",
    exampleDbc: "Örnek DBC",
    dbcLoaded: "yüklendi",
    invalidDbc: "DBC dosyası okunamadı.",
    largeDbc: "DBC dosyası 20 MB sınırını aşıyor.",
    filter: "ID, mesaj, byte veya sinyal ara",
    messages: "Mesaj görünümü",
    trace: "Akış görünümü",
    pause: "Dondur",
    resume: "Devam et",
    clear: "Temizle",
    exportCsv: "CSV indir",
    waiting: "CAN mesajı bekleniyor",
    waitingHelp:
      "PCAN bağlantısını kurun veya cihaz olmadan arayüzü denemek için simülasyonu başlatın.",
    time: "Zaman",
    id: "CAN ID",
    name: "Mesaj",
    format: "Tip",
    dlc: "DLC",
    data: "Veri",
    count: "Sayaç",
    period: "Periyot",
    raw: "Ham",
    value: "Değer",
    unit: "Birim",
    signal: "Sinyal",
    details: "Canlı çözümleme",
    noMatch: "Bu ID için yüklenen DBC’de mesaj tanımı bulunamadı.",
    chooseFrame: "Ayrıntıları görmek için bir mesaj seçin.",
    standard: "STD",
    extended: "EXT",
    rtr: "RTR",
    error: "ERR",
    totalFrames: "Toplam frame",
    uniqueIds: "Benzersiz ID",
    frameRate: "Frame/s",
    dbcMatches: "DBC eşleşmesi",
    active: "CAN hattı dinleniyor",
    demoActive: "Simülasyon çalışıyor",
    paused: "Görünüm donduruldu",
    bridgeMissing:
      "Yerel köprüye ulaşılamadı. ZIP’i çıkarıp Start-PCAN-Bridge.cmd dosyasını çalıştırın.",
    bridgeUpgrade:
      "CAN gönderme için PCAN Local Bridge v1.1.0 gerekir. Yeni ZIP’i indirip eski köprünün yerine çalıştırın.",
    connectFailed: "PCAN bağlantısı kurulamadı.",
    csvEmpty: "Dışa aktarılacak CAN mesajı yok.",
    csvSaved: "CAN kaydı CSV olarak indirildi.",
    cleared: "CAN kayıtları temizlendi.",
    safety:
      "Varsayılan bağlantı listen-only açılır. Mesaj gönderme yalnız açık onayla etkinleştirilir.",
    dropped: "Yerel kuyrukta düşen frame",
    framesShown: "En fazla son 500 kayıt gösterilir",
    txTitle: "CAN mesajı gönder",
    txIntro: "Klasik CAN için tek seferlik STD veya EXT frame gönderimi.",
    txId: "CAN ID (hex)",
    txFormat: "Frame tipi",
    txData: "Veri byte’ları",
    sendOnce: "Bir kez gönder",
    sendSuccess: "CAN mesajı başarıyla gönderildi.",
    sendFailed: "CAN mesajı gönderilemedi.",
    invalidTx: "CAN ID veya veri byte’ları geçersiz.",
    requiresTxMode: "Gönderme için bağlantıyı “Gönderme açık” modunda kurun.",
    recordTitle: "CAN kaydı",
    recordIntro:
      "Görünüm dondurulsa bile gelen frame’leri kaydet; sonra TRC veya CSV olarak indir.",
    startRecord: "Kaydı başlat",
    stopRecord: "Kaydı durdur",
    downloadTrc: "TRC indir",
    downloadRecordCsv: "Kayıt CSV indir",
    recordFrames: "Kayıtlı frame",
    recordDuration: "Süre",
    recordEmpty: "İndirilecek kayıt bulunmuyor.",
    recordSaved: "CAN kaydı indirildi.",
    recordLimit: "1.000.000 frame kayıt sınırına ulaşıldı; kayıt otomatik durduruldu.",
    recording: "Kayıt yapılıyor",
    notRecording: "Kayıt bekliyor",
    txCount: "Gönderilen",
  },
  en: {
    back: "Main site",
    title: "CAN Viewer",
    subtitle: "Live monitoring, controlled transmission, and CAN recording via PCAN-USB",
    readonly: "Safe mode by default",
    privacy: "DBC and CAN data stay on your computer",
    bridge: "Local bridge",
    device: "PCAN connection",
    online: "Ready",
    offline: "Not found",
    connected: "Connected",
    disconnected: "Not connected",
    channel: "Channel",
    bitrate: "Bit rate",
    listenOnly: "Listen-only",
    mode: "Operating mode",
    receiveMode: "Receive only",
    transmitMode: "Transmit enabled",
    txAcknowledgement:
      "I understand that transmitting a message can trigger unexpected motion or functions on the connected machine.",
    txWarning:
      "Transmit mode actively writes to the CAN bus. Verify the ID, data, and machine state before use.",
    connect: "Connect to CAN",
    disconnect: "Disconnect",
    demo: "Start simulation",
    stopDemo: "Stop simulation",
    browserSupport: "Windows · Chrome or Edge recommended",
    setupTitle: "Prepare the PCAN-USB connection once",
    setupIntro:
      "A small local bridge must be open because browsers cannot access the PEAK driver directly.",
    driverTitle: "PEAK driver",
    driverText: "Install the official PCAN driver and connect PCAN-USB to the computer.",
    driverAction: "Download driver",
    bridgeTitle: "Local bridge",
    bridgeText: "Extract the ZIP and run Start-PCAN-Bridge.cmd.",
    bridgeAction: "Download Windows bridge",
    browserTitle: "Connect the viewer",
    browserText: "Choose the channel and bit rate, then select Connect to CAN.",
    dbc: "DBC file",
    noDbc: "No DBC loaded",
    openDbc: "Load DBC",
    exampleDbc: "Example DBC",
    dbcLoaded: "loaded",
    invalidDbc: "The DBC file could not be parsed.",
    largeDbc: "The DBC file exceeds the 20 MB limit.",
    filter: "Search ID, message, bytes, or signal",
    messages: "Message view",
    trace: "Trace view",
    pause: "Pause",
    resume: "Resume",
    clear: "Clear",
    exportCsv: "Download CSV",
    waiting: "Waiting for CAN messages",
    waitingHelp:
      "Connect PCAN or start the simulation to try the interface without hardware.",
    time: "Time",
    id: "CAN ID",
    name: "Message",
    format: "Type",
    dlc: "DLC",
    data: "Data",
    count: "Count",
    period: "Period",
    raw: "Raw",
    value: "Value",
    unit: "Unit",
    signal: "Signal",
    details: "Live decoding",
    noMatch: "The loaded DBC has no message definition for this ID.",
    chooseFrame: "Select a message to inspect its details.",
    standard: "STD",
    extended: "EXT",
    rtr: "RTR",
    error: "ERR",
    totalFrames: "Total frames",
    uniqueIds: "Unique IDs",
    frameRate: "Frames/s",
    dbcMatches: "DBC matches",
    active: "Listening to the CAN bus",
    demoActive: "Simulation is running",
    paused: "View is paused",
    bridgeMissing:
      "The local bridge could not be reached. Extract the ZIP and run Start-PCAN-Bridge.cmd.",
    bridgeUpgrade:
      "CAN transmission requires PCAN Local Bridge v1.1.0. Download and run the new ZIP instead of the old bridge.",
    connectFailed: "The PCAN connection could not be established.",
    csvEmpty: "There are no CAN messages to export.",
    csvSaved: "The CAN capture was downloaded as CSV.",
    cleared: "CAN records were cleared.",
    safety:
      "Connections use listen-only by default. Transmission is enabled only after explicit acknowledgement.",
    dropped: "Frames dropped in local queue",
    framesShown: "At most the latest 500 records are displayed",
    txTitle: "Transmit CAN message",
    txIntro: "Send a single classic CAN standard or extended frame.",
    txId: "CAN ID (hex)",
    txFormat: "Frame type",
    txData: "Data bytes",
    sendOnce: "Send once",
    sendSuccess: "CAN message transmitted successfully.",
    sendFailed: "The CAN message could not be transmitted.",
    invalidTx: "The CAN ID or data bytes are invalid.",
    requiresTxMode: "Reconnect with “Transmit enabled” to send messages.",
    recordTitle: "CAN recording",
    recordIntro:
      "Keep recording incoming frames even while the view is paused, then download TRC or CSV.",
    startRecord: "Start recording",
    stopRecord: "Stop recording",
    downloadTrc: "Download TRC",
    downloadRecordCsv: "Download recording CSV",
    recordFrames: "Recorded frames",
    recordDuration: "Duration",
    recordEmpty: "There is no recording to download.",
    recordSaved: "CAN recording downloaded.",
    recordLimit: "The 1,000,000-frame limit was reached and recording stopped automatically.",
    recording: "Recording",
    notRecording: "Ready to record",
    txCount: "Transmitted",
  },
} as const;

async function bridgeRequest<T>(
  path: string,
  options: RequestInit = {},
  timeoutMs = 1800,
): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${BRIDGE_URL}${path}`, {
      ...options,
      mode: "cors",
      cache: "no-store",
      signal: controller.signal,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return (await response.json()) as T;
  } finally {
    window.clearTimeout(timeout);
  }
}

function ToolbarButton({
  children,
  onClick,
  active = false,
  disabled = false,
}: {
  children: ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      className={`can-tool-button${active ? " is-active" : ""}`}
      type="button"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

function makeDemoFrames(
  sequence: number,
  timestampMs: number,
  database: DbcDatabase | null,
): CanFrame[] {
  if (database && database.name !== "off_highway_example.dbc") {
    return database.messages.slice(0, 6).map((message, index) => ({
      sequence: sequence + index,
      timestampMs,
      id: message.id,
      extended: message.extended,
      rtr: false,
      error: false,
      data: Array.from(
        { length: Math.min(8, Math.max(0, message.dlc)) },
        (_, byte) => (sequence * 17 + index * 43 + byte * 29) & 0xff,
      ),
    }));
  }

  const phase = sequence / 16;
  const rpm = Math.round(1450 + Math.sin(phase) * 620);
  const rpmRaw = Math.max(0, Math.round(rpm / 0.125));
  const speed = Math.max(0, 12.5 + Math.sin(phase / 2) * 8);
  const speedRaw = Math.round(speed / 0.01);
  const status = [
    rpmRaw & 0xff,
    (rpmRaw >> 8) & 0xff,
    speedRaw & 0xff,
    (speedRaw >> 8) & 0xff,
    Math.floor(sequence / 80) % 2,
    0,
    0,
    0,
  ];
  const voltageRaw = Math.round((92 + Math.sin(phase / 4) * 1.8) / 0.1);
  const currentRaw = Math.round((18 + Math.sin(phase / 3) * 7) / 0.1);

  return [
    {
      sequence,
      timestampMs,
      id: 0x201,
      extended: false,
      rtr: false,
      error: false,
      data: status,
    },
    {
      sequence: sequence + 1,
      timestampMs: timestampMs + 0.4,
      id: 0x18ff50e5,
      extended: true,
      rtr: false,
      error: false,
      data: [
        voltageRaw & 0xff,
        (voltageRaw >> 8) & 0xff,
        currentRaw & 0xff,
        (currentRaw >> 8) & 0xff,
        0x10,
        0,
        0x45,
        0,
      ],
    },
    ...(sequence % 4 === 0
      ? [
          {
            sequence: sequence + 2,
            timestampMs: timestampMs + 0.8,
            id: 0x301,
            extended: false,
            rtr: false,
            error: false,
            data: [sequence & 0xff, 0x7e, 0x20, 0x00, 0x18, 0x00, 0x00, 0x01],
          },
        ]
      : []),
  ];
}

function escapeCsv(value: string | number): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function parseCanId(value: string, extended: boolean): number | null {
  const clean = value.trim().replace(/^0x/i, "");
  if (!/^[0-9a-fA-F]+$/.test(clean)) return null;
  const id = Number.parseInt(clean, 16);
  const maximum = extended ? 0x1fffffff : 0x7ff;
  return Number.isFinite(id) && id >= 0 && id <= maximum ? id : null;
}

function parseDataBytes(value: string): number[] | null {
  const clean = value.trim();
  if (!clean) return [];
  const tokens = clean.split(/[\s,;]+/).filter(Boolean);
  if (tokens.length > 8 || tokens.some((token) => !/^[0-9a-fA-F]{1,2}$/.test(token))) {
    return null;
  }
  return tokens.map((token) => Number.parseInt(token, 16));
}

function downloadText(filename: string, text: string, type: string) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function durationLabel(milliseconds: number): string {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(seconds / 60);
  return `${minutes.toString().padStart(2, "0")}:${(seconds % 60)
    .toString()
    .padStart(2, "0")}`;
}

export default function CanViewer() {
  const [language, setLanguage] = useState<Language>("tr");
  const [bridge, setBridge] = useState<BridgeStatus>({ ok: false, connected: false });
  const [channel, setChannel] = useState(1);
  const [bitrate, setBitrate] = useState(250_000);
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>("listen");
  const [txAcknowledged, setTxAcknowledged] = useState(false);
  const [txId, setTxId] = useState("201");
  const [txExtended, setTxExtended] = useState(false);
  const [txData, setTxData] = useState("00 00 00 00 00 00 00 00");
  const [txBusy, setTxBusy] = useState(false);
  const [database, setDatabase] = useState<DbcDatabase | null>(null);
  const [dbcName, setDbcName] = useState("");
  const [rows, setRows] = useState<Map<string, AggregateRow>>(() => new Map());
  const [history, setHistory] = useState<CanFrame[]>([]);
  const [selectedFrame, setSelectedFrame] = useState<CanFrame | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("messages");
  const [query, setQuery] = useState("");
  const [paused, setPaused] = useState(false);
  const [demo, setDemo] = useState(false);
  const [totalFrames, setTotalFrames] = useState(0);
  const [frameRate, setFrameRate] = useState(0);
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordingCount, setRecordingCount] = useState(0);
  const [recordingElapsed, setRecordingElapsed] = useState(0);
  const [recordLimitReached, setRecordLimitReached] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const arrivalTimesRef = useRef<number[]>([]);
  const demoSequenceRef = useRef(1);
  const pollActiveRef = useRef(false);
  const recordedFramesRef = useRef<RecordedFrame[]>([]);
  const recordingRef = useRef(false);
  const recordingStartedAtRef = useRef(0);
  const recordingBaseTimestampRef = useRef<number | null>(null);
  const recordingBaseElapsedRef = useRef(0);
  const t = copy[language];

  const recordFrames = useCallback((frames: CanFrame[], direction: "rx" | "tx") => {
    if (!recordingRef.current || !frames.length) return;

    const arrivalElapsed = performance.now() - recordingStartedAtRef.current;
    if (recordingBaseTimestampRef.current === null && direction === "rx") {
      recordingBaseTimestampRef.current = frames[0].timestampMs;
      recordingBaseElapsedRef.current = arrivalElapsed;
    }

    for (const frame of frames) {
      if (recordedFramesRef.current.length >= MAX_RECORDING_FRAMES) {
        recordingRef.current = false;
        setRecording(false);
        setRecordLimitReached(true);
        break;
      }
      const elapsedMs =
        direction === "rx" && recordingBaseTimestampRef.current !== null
          ? recordingBaseElapsedRef.current +
            Math.max(0, frame.timestampMs - recordingBaseTimestampRef.current)
          : arrivalElapsed;
      recordedFramesRef.current.push({ frame, direction, elapsedMs });
    }
    setRecordingCount(recordedFramesRef.current.length);
  }, []);

  const ingestFrames = useCallback(
    (frames: CanFrame[]) => {
      if (!frames.length) return;
      recordFrames(frames, "rx");
      if (paused) return;
      const now = performance.now();
      arrivalTimesRef.current.push(...frames.map(() => now));
      arrivalTimesRef.current = arrivalTimesRef.current.filter((time) => now - time <= 1000);
      setFrameRate(arrivalTimesRef.current.length);
      setTotalFrames((value) => value + frames.length);
      setHistory((current) => [...current, ...frames].slice(-MAX_HISTORY));
      setRows((current) => {
        const next = new Map(current);
        for (const frame of frames) {
          const key = frameKey(frame);
          const previous = next.get(key);
          next.set(key, {
            frame,
            count: (previous?.count ?? 0) + 1,
            periodMs: previous ? Math.max(0, frame.timestampMs - previous.lastSeen) : null,
            firstSeen: previous?.firstSeen ?? frame.timestampMs,
            lastSeen: frame.timestampMs,
          });
        }
        return next;
      });
      setSelectedFrame((current) => {
        if (!current) return frames.at(-1) ?? null;
        const key = frameKey(current);
        return [...frames].reverse().find((frame) => frameKey(frame) === key) ?? current;
      });
    },
    [paused, recordFrames],
  );

  const refreshBridge = useCallback(async () => {
    try {
      const status = await bridgeRequest<BridgeStatus>("/status");
      setBridge(status);
    } catch {
      setBridge((current) => ({ ...current, ok: false, connected: false }));
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = `${t.title} | Bülent Türk`;
  }, [language, t.title]);

  useEffect(() => {
    void refreshBridge();
    const interval = window.setInterval(() => void refreshBridge(), 2500);
    return () => window.clearInterval(interval);
  }, [refreshBridge]);

  useEffect(() => {
    if (!bridge.connected || demo) return;
    const interval = window.setInterval(async () => {
      if (pollActiveRef.current) return;
      pollActiveRef.current = true;
      try {
        const response = await bridgeRequest<{ ok: boolean; frames: CanFrame[]; dropped?: number }>(
          "/frames?limit=5000",
          {},
          2500,
        );
        if (response.frames?.length) ingestFrames(response.frames);
        if (typeof response.dropped === "number") {
          setBridge((current) => ({ ...current, dropped: response.dropped }));
        }
      } catch {
        void refreshBridge();
      } finally {
        pollActiveRef.current = false;
      }
    }, 80);
    return () => window.clearInterval(interval);
  }, [bridge.connected, demo, ingestFrames, refreshBridge]);

  useEffect(() => {
    if (!demo) return;
    const interval = window.setInterval(() => {
      const frames = makeDemoFrames(
        demoSequenceRef.current,
        performance.now(),
        database,
      );
      demoSequenceRef.current += frames.length + 1;
      ingestFrames(frames);
    }, 100);
    return () => window.clearInterval(interval);
  }, [database, demo, ingestFrames]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 3600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    if (!recording) return;
    const update = () =>
      setRecordingElapsed(performance.now() - recordingStartedAtRef.current);
    update();
    const interval = window.setInterval(update, 250);
    return () => window.clearInterval(interval);
  }, [recording]);

  useEffect(() => {
    if (!recordLimitReached) return;
    setToast(t.recordLimit);
    setRecordLimitReached(false);
  }, [recordLimitReached, t.recordLimit]);

  const aggregateRows = useMemo(
    () =>
      [...rows.values()].sort(
        (first, second) =>
          Number(first.frame.extended) - Number(second.frame.extended) ||
          first.frame.id - second.frame.id,
      ),
    [rows],
  );

  const filteredAggregate = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return aggregateRows;
    return aggregateRows.filter((row) => {
      const message = findDbcMessage(database, row.frame);
      const searchText = [
        formatCanId(row.frame),
        row.frame.id.toString(),
        formatData(row.frame.data),
        message?.name ?? "",
        ...(message?.signals.map((signal) => signal.name) ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return searchText.includes(normalized);
    });
  }, [aggregateRows, database, query]);

  const filteredTrace = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return [...history]
      .reverse()
      .filter((frame) => {
        if (!normalized) return true;
        const message = findDbcMessage(database, frame);
        return [
          formatCanId(frame),
          frame.id.toString(),
          formatData(frame.data),
          message?.name ?? "",
          ...(message?.signals.map((signal) => signal.name) ?? []),
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      })
      .slice(0, 500);
  }, [database, history, query]);

  const selectedMessage = useMemo(
    () => (selectedFrame ? findDbcMessage(database, selectedFrame) : null),
    [database, selectedFrame],
  );
  const decoded = useMemo(
    () => (selectedFrame ? decodeMessage(selectedFrame, selectedMessage) : []),
    [selectedFrame, selectedMessage],
  );
  const dbcMatchCount = useMemo(
    () => aggregateRows.filter((row) => findDbcMessage(database, row.frame)).length,
    [aggregateRows, database],
  );

  async function connect() {
    if (connectionMode === "transmit" && !txAcknowledged) {
      setToast(t.txWarning);
      return;
    }
    setBusy(true);
    setDemo(false);
    try {
      if (!bridge.ok) await refreshBridge();
      const result = await bridgeRequest<BridgeStatus>("/connect", {
        method: "POST",
        body: JSON.stringify({
          channel,
          bitrate,
          listenOnly: connectionMode === "listen",
        }),
      });
      setBridge(result);
      if (!result.ok || !result.connected) {
        setToast(result.error || t.connectFailed);
      } else if (connectionMode === "transmit" && result.listenOnly !== false) {
        setToast(t.bridgeUpgrade);
      }
    } catch {
      setToast(bridge.ok ? t.connectFailed : t.bridgeMissing);
    } finally {
      setBusy(false);
    }
  }

  async function disconnect() {
    setBusy(true);
    setDemo(false);
    try {
      const result = await bridgeRequest<BridgeStatus>("/disconnect", {
        method: "POST",
        body: "{}",
      });
      setBridge(result);
      setTxAcknowledged(false);
    } catch {
      setBridge((current) => ({ ...current, connected: false }));
    } finally {
      setBusy(false);
    }
  }

  function toggleDemo() {
    if (demo) {
      setDemo(false);
      return;
    }
    if (!database) {
      const example = createExampleDatabase();
      setDatabase(example);
      setDbcName(example.name);
    }
    setDemo(true);
  }

  async function openDbc(file: File) {
    if (file.size > MAX_DBC_SIZE) {
      setToast(t.largeDbc);
      return;
    }
    try {
      const parsed = parseDbc(await file.text(), file.name);
      setDatabase(parsed);
      setDbcName(file.name);
      setToast(`${file.name} ${t.dbcLoaded}.`);
    } catch {
      setToast(t.invalidDbc);
    }
  }

  function onDbcChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) void openDbc(file);
    event.target.value = "";
  }

  function loadExample() {
    const example = createExampleDatabase();
    setDatabase(example);
    setDbcName(example.name);
    setToast(`${example.name} ${t.dbcLoaded}.`);
  }

  function clearCapture() {
    setRows(new Map());
    setHistory([]);
    setSelectedFrame(null);
    setTotalFrames(0);
    setFrameRate(0);
    arrivalTimesRef.current = [];
    setToast(t.cleared);
  }

  function exportCsv() {
    if (!history.length) {
      setToast(t.csvEmpty);
      return;
    }
    const header = [
      "timestamp_ms",
      "can_id",
      "frame_format",
      "dlc",
      "data_hex",
      "dbc_message",
      "decoded_signals",
    ];
    const lines = history.map((frame) => {
      const message = findDbcMessage(database, frame);
      const signals = decodeMessage(frame, message)
        .map(
          (item) =>
            `${item.signal.name}=${item.valueLabel ?? item.displayValue}${item.signal.unit ? ` ${item.signal.unit}` : ""}`,
        )
        .join("; ");
      return [
        frame.timestampMs.toFixed(3),
        formatCanId(frame),
        frame.extended ? "extended" : "standard",
        frame.data.length,
        formatData(frame.data),
        message?.name ?? "",
        signals,
      ]
        .map(escapeCsv)
        .join(",");
    });
    const blob = new Blob([[header.join(","), ...lines].join("\r\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `can-capture-${new Date().toISOString().replaceAll(":", "-")}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    setToast(t.csvSaved);
  }

  function startRecording() {
    recordedFramesRef.current = [];
    recordingBaseTimestampRef.current = null;
    recordingBaseElapsedRef.current = 0;
    recordingStartedAtRef.current = performance.now();
    recordingRef.current = true;
    setRecording(true);
    setRecordingCount(0);
    setRecordingElapsed(0);
    setRecordLimitReached(false);
  }

  function stopRecording() {
    recordingRef.current = false;
    setRecording(false);
    setRecordingElapsed(performance.now() - recordingStartedAtRef.current);
  }

  function downloadRecording(format: "trc" | "csv") {
    const recorded = recordedFramesRef.current;
    if (!recorded.length) {
      setToast(t.recordEmpty);
      return;
    }
    const stamp = new Date().toISOString().replaceAll(":", "-");

    if (format === "trc") {
      const header = [
        ";$FILEVERSION=1.3",
        `;$STARTTIME=${new Date().toISOString()}`,
        "; Generated by Bülent Türk CAN Viewer",
        "; Columns: message) time_ms channel direction can_id type dlc data",
      ];
      const lines = recorded.map(({ frame, direction, elapsedMs }, index) => {
        const identifier = `${frame.id.toString(16).toUpperCase()}${frame.extended ? "x" : ""}`;
        const payload = formatData(frame.data);
        return `${index + 1}) ${elapsedMs.toFixed(3)} 1 ${
          direction === "tx" ? "Tx" : "Rx"
        } ${identifier} - ${frame.data.length}${payload ? ` ${payload}` : ""}`;
      });
      downloadText(
        `can-recording-${stamp}.trc`,
        [...header, ...lines].join("\r\n"),
        "text/plain;charset=utf-8",
      );
    } else {
      const header = [
        "timestamp_ms",
        "can_id",
        "direction",
        "frame_format",
        "dlc",
        "data_hex",
      ];
      const lines = recorded.map(({ frame, direction, elapsedMs }) =>
        [
          elapsedMs.toFixed(3),
          formatCanId(frame),
          direction,
          frame.extended ? "extended" : "standard",
          frame.data.length,
          formatData(frame.data),
        ]
          .map(escapeCsv)
          .join(","),
      );
      downloadText(
        `can-recording-${stamp}.csv`,
        [header.join(","), ...lines].join("\r\n"),
        "text/csv;charset=utf-8",
      );
    }
    setToast(t.recordSaved);
  }

  async function sendFrame() {
    if (!bridge.connected || bridge.listenOnly !== false) {
      setToast(t.requiresTxMode);
      return;
    }
    const id = parseCanId(txId, txExtended);
    const data = parseDataBytes(txData);
    if (id === null || data === null) {
      setToast(t.invalidTx);
      return;
    }

    setTxBusy(true);
    try {
      const result = await bridgeRequest<{ ok: boolean; sent?: number; error?: string }>(
        "/send",
        {
          method: "POST",
          body: JSON.stringify({ id, extended: txExtended, data }),
        },
      );
      if (!result.ok) {
        setToast(result.error || t.sendFailed);
        return;
      }
      const frame: CanFrame = {
        sequence: (bridge.sent ?? 0) + 1,
        timestampMs: 0,
        id,
        extended: txExtended,
        rtr: false,
        error: false,
        direction: "tx",
        data,
      };
      recordFrames([frame], "tx");
      setBridge((current) => ({ ...current, sent: result.sent ?? current.sent }));
      setToast(t.sendSuccess);
    } catch {
      setToast(t.sendFailed);
    } finally {
      setTxBusy(false);
    }
  }

  const active = demo || bridge.connected;
  const activeText = paused
    ? t.paused
    : demo
      ? t.demoActive
      : bridge.connected
        ? bridge.listenOnly === false
          ? t.transmitMode
          : t.active
        : t.disconnected;

  return (
    <main className="can-viewer">
      <header className="can-header">
        <a className="can-back" href="/">
          <span aria-hidden="true">←</span> {t.back}
        </a>
        <div className="can-brand">
          <span>CAN / PCAN-BASIC</span>
          <strong>{t.title}</strong>
        </div>
        <div className="can-language" aria-label="Language">
          <button
            className={language === "tr" ? "is-active" : ""}
            type="button"
            onClick={() => setLanguage("tr")}
          >
            TR
          </button>
          <i>/</i>
          <button
            className={language === "en" ? "is-active" : ""}
            type="button"
            onClick={() => setLanguage("en")}
          >
            EN
          </button>
        </div>
      </header>

      <section className="can-intro">
        <div>
          <p>LIVE CAN MONITOR · WINDOWS</p>
          <h1>{t.title}</h1>
          <h2>{t.subtitle}</h2>
        </div>
        <div className="can-intro-notes">
          <span><i />{t.readonly} · {connectionMode === "listen" ? t.receiveMode : t.transmitMode}</span>
          <span><i />{t.privacy}</span>
          <small>{t.browserSupport}</small>
        </div>
      </section>

      <section className="can-connection-panel" aria-label="PCAN connection">
        <div className="can-status-card">
          <span>{t.bridge}</span>
          <strong className={bridge.ok ? "is-online" : "is-offline"}>
            <i />{bridge.ok ? t.online : t.offline}
          </strong>
          <small>{bridge.version ? `v${bridge.version}` : "127.0.0.1:8765"}</small>
        </div>
        <div className="can-status-card">
          <span>{t.device}</span>
          <strong className={bridge.connected ? "is-online" : "is-offline"}>
            <i />{bridge.connected ? t.connected : t.disconnected}
          </strong>
          <small>
            {bridge.connected
              ? `PCAN_USBBUS${bridge.channel ?? channel} · ${Math.round((bridge.bitrate ?? bitrate) / 1000)} kbit/s`
              : "PCAN-USB"}
          </small>
        </div>
        <label className="can-select-field">
          <span>{t.channel}</span>
          <select value={channel} onChange={(event) => setChannel(Number(event.target.value))}>
            {Array.from({ length: 16 }, (_, index) => (
              <option value={index + 1} key={index + 1}>PCAN_USBBUS{index + 1}</option>
            ))}
          </select>
        </label>
        <label className="can-select-field">
          <span>{t.bitrate}</span>
          <select value={bitrate} onChange={(event) => setBitrate(Number(event.target.value))}>
            {bitrates.map((value) => (
              <option value={value} key={value}>
                {value >= 1_000_000 ? "1 Mbit/s" : `${value / 1000} kbit/s`}
              </option>
            ))}
          </select>
        </label>
        <label className="can-select-field">
          <span>{t.mode}</span>
          <select
            value={connectionMode}
            onChange={(event) => {
              setConnectionMode(event.target.value as ConnectionMode);
              setTxAcknowledged(false);
            }}
            disabled={Boolean(bridge.connected)}
          >
            <option value="listen">{t.receiveMode}</option>
            <option value="transmit">{t.transmitMode}</option>
          </select>
        </label>
        <div className="can-connect-actions">
          <button
            className="can-primary"
            type="button"
            onClick={bridge.connected ? disconnect : connect}
            disabled={
              busy ||
              demo ||
              (connectionMode === "transmit" && !txAcknowledged && !bridge.connected)
            }
          >
            {bridge.connected ? t.disconnect : t.connect}
          </button>
          <button className="can-secondary" type="button" onClick={toggleDemo} disabled={busy}>
            {demo ? t.stopDemo : t.demo}
          </button>
        </div>
      </section>

      {connectionMode === "transmit" && !bridge.connected ? (
        <section className="can-transmit-warning">
          <div>
            <strong>{t.transmitMode}</strong>
            <p>{t.txWarning}</p>
          </div>
          <label>
            <input
              type="checkbox"
              checked={txAcknowledged}
              onChange={(event) => setTxAcknowledged(event.target.checked)}
            />
            <span>{t.txAcknowledgement}</span>
          </label>
        </section>
      ) : null}

      {!bridge.ok ? (
        <section className="can-setup">
          <div className="can-setup-head">
            <span>SETUP / 01—03</span>
            <h2>{t.setupTitle}</h2>
            <p>{t.setupIntro}</p>
          </div>
          <div className="can-setup-steps">
            <article>
              <span>01</span>
              <h3>{t.driverTitle}</h3>
              <p>{t.driverText}</p>
              <a
                href="https://www.peak-system.com/quick/DL-Driver-E"
                target="_blank"
                rel="noreferrer"
              >
                {t.driverAction} ↗
              </a>
            </article>
            <article>
              <span>02</span>
              <h3>{t.bridgeTitle}</h3>
              <p>{t.bridgeText}</p>
              <a href="/downloads/pcan-local-bridge-v1.1.0.zip" download>
                {t.bridgeAction} ↓
              </a>
            </article>
            <article>
              <span>03</span>
              <h3>{t.browserTitle}</h3>
              <p>{t.browserText}</p>
              <button type="button" onClick={() => void refreshBridge()}>
                {t.bridge} ↻
              </button>
            </article>
          </div>
          <p className="can-safety"><i />{t.safety}</p>
        </section>
      ) : null}

      <section className="can-io-panel" aria-label="CAN transmit and recording">
        <article className="can-tx-card">
          <div className="can-io-head">
            <span>TX / 01</span>
            <div>
              <h2>{t.txTitle}</h2>
              <p>{t.txIntro}</p>
            </div>
            <strong className={bridge.connected && bridge.listenOnly === false ? "is-ready" : ""}>
              {bridge.connected && bridge.listenOnly === false ? t.transmitMode : t.receiveMode}
            </strong>
          </div>
          <div className="can-tx-fields">
            <label>
              <span>{t.txId}</span>
              <input
                value={txId}
                onChange={(event) => setTxId(event.target.value)}
                placeholder={txExtended ? "18FF50E5" : "201"}
                spellCheck={false}
              />
            </label>
            <label>
              <span>{t.txFormat}</span>
              <select
                value={txExtended ? "extended" : "standard"}
                onChange={(event) => setTxExtended(event.target.value === "extended")}
              >
                <option value="standard">{t.standard} · 11 bit</option>
                <option value="extended">{t.extended} · 29 bit</option>
              </select>
            </label>
            <label className="can-tx-data">
              <span>{t.txData}</span>
              <input
                value={txData}
                onChange={(event) => setTxData(event.target.value.toUpperCase())}
                placeholder="00 00 00 00 00 00 00 00"
                spellCheck={false}
              />
            </label>
            <button
              type="button"
              onClick={() => void sendFrame()}
              disabled={txBusy || !bridge.connected || bridge.listenOnly !== false}
            >
              {t.sendOnce}
            </button>
          </div>
          {bridge.ok && bridge.version === "1.0.0" ? (
            <p className="can-bridge-upgrade">
              {t.bridgeUpgrade}{" "}
              <a href="/downloads/pcan-local-bridge-v1.1.0.zip" download>
                {t.bridgeAction} ↓
              </a>
            </p>
          ) : null}
        </article>

        <article className={`can-record-card${recording ? " is-recording" : ""}`}>
          <div className="can-io-head">
            <span>LOG / 02</span>
            <div>
              <h2>{t.recordTitle}</h2>
              <p>{t.recordIntro}</p>
            </div>
            <strong className={recording ? "is-ready" : ""}>
              {recording ? t.recording : t.notRecording}
            </strong>
          </div>
          <div className="can-record-stats">
            <div>
              <span>{t.recordFrames}</span>
              <strong>{recordingCount.toLocaleString()}</strong>
            </div>
            <div>
              <span>{t.recordDuration}</span>
              <strong>{durationLabel(recordingElapsed)}</strong>
            </div>
            <div>
              <span>{t.txCount}</span>
              <strong>{(bridge.sent ?? 0).toLocaleString()}</strong>
            </div>
          </div>
          <div className="can-record-actions">
            <button
              className="can-record-primary"
              type="button"
              onClick={recording ? stopRecording : startRecording}
              disabled={!active && !recording}
            >
              {recording ? t.stopRecord : t.startRecord}
            </button>
            <button type="button" onClick={() => downloadRecording("trc")} disabled={!recordingCount}>
              {t.downloadTrc}
            </button>
            <button type="button" onClick={() => downloadRecording("csv")} disabled={!recordingCount}>
              {t.downloadRecordCsv}
            </button>
          </div>
        </article>
      </section>

      <section className="can-workspace">
        <div className="can-toolbar">
          <div className="can-dbc-control">
            <span>{t.dbc}</span>
            <strong title={dbcName || t.noDbc}>
              {dbcName || t.noDbc}
            </strong>
            <input
              ref={fileInputRef}
              type="file"
              accept=".dbc,text/plain"
              onChange={onDbcChange}
              hidden
            />
            <button type="button" onClick={() => fileInputRef.current?.click()}>
              {t.openDbc}
            </button>
            <button type="button" onClick={loadExample}>{t.exampleDbc}</button>
          </div>
          <div className="can-toolbar-actions">
            <div className="can-view-switch">
              <ToolbarButton
                active={viewMode === "messages"}
                onClick={() => setViewMode("messages")}
              >
                {t.messages}
              </ToolbarButton>
              <ToolbarButton
                active={viewMode === "trace"}
                onClick={() => setViewMode("trace")}
              >
                {t.trace}
              </ToolbarButton>
            </div>
            <ToolbarButton onClick={() => setPaused((value) => !value)} active={paused}>
              {paused ? t.resume : t.pause}
            </ToolbarButton>
            <ToolbarButton onClick={clearCapture}>{t.clear}</ToolbarButton>
            <ToolbarButton onClick={exportCsv}>{t.exportCsv}</ToolbarButton>
          </div>
        </div>

        <div className="can-stats">
          <div><span>{t.totalFrames}</span><strong>{totalFrames.toLocaleString()}</strong></div>
          <div><span>{t.uniqueIds}</span><strong>{rows.size}</strong></div>
          <div><span>{t.frameRate}</span><strong>{frameRate.toLocaleString()}</strong></div>
          <div><span>{t.dbcMatches}</span><strong>{database ? `${dbcMatchCount}/${rows.size}` : "—"}</strong></div>
          <div className={`can-live-state${active ? " is-active" : ""}`}>
            <i />{activeText}
          </div>
        </div>

        <div className="can-monitor">
          <div className="can-table-panel">
            <div className="can-table-tools">
              <label>
                <span aria-hidden="true">⌕</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t.filter}
                />
              </label>
              <small>{viewMode === "trace" ? t.framesShown : `${filteredAggregate.length} ID`}</small>
            </div>

            {!history.length ? (
              <div className="can-empty">
                <div aria-hidden="true">
                  <i /><i /><i />
                </div>
                <h3>{t.waiting}</h3>
                <p>{t.waitingHelp}</p>
              </div>
            ) : (
              <div className="can-table-scroll">
                <table className="can-frame-table">
                  <thead>
                    <tr>
                      <th>{t.time}</th>
                      <th>{t.id}</th>
                      <th>{t.name}</th>
                      <th>{t.format}</th>
                      <th>{t.dlc}</th>
                      <th>{t.data}</th>
                      {viewMode === "messages" ? <th>{t.count}</th> : null}
                      {viewMode === "messages" ? <th>{t.period}</th> : null}
                    </tr>
                  </thead>
                  <tbody>
                    {viewMode === "messages"
                      ? filteredAggregate.map((row) => {
                          const message = findDbcMessage(database, row.frame);
                          const isSelected =
                            selectedFrame && frameKey(selectedFrame) === frameKey(row.frame);
                          return (
                            <tr
                              key={frameKey(row.frame)}
                              className={isSelected ? "is-selected" : ""}
                              onClick={() => setSelectedFrame(row.frame)}
                            >
                              <td>{(row.lastSeen / 1000).toFixed(3)}</td>
                              <td><strong>{formatCanId(row.frame)}</strong></td>
                              <td>{message?.name ?? "—"}</td>
                              <td>
                                <span className={`can-frame-type${row.frame.extended ? " is-ext" : ""}`}>
                                  {row.frame.error
                                    ? t.error
                                    : row.frame.rtr
                                      ? t.rtr
                                      : row.frame.extended
                                        ? t.extended
                                        : t.standard}
                                </span>
                              </td>
                              <td>{row.frame.data.length}</td>
                              <td><code>{formatData(row.frame.data) || "—"}</code></td>
                              <td>{row.count.toLocaleString()}</td>
                              <td>{row.periodMs === null ? "—" : `${row.periodMs.toFixed(1)} ms`}</td>
                            </tr>
                          );
                        })
                      : filteredTrace.map((frame) => {
                          const message = findDbcMessage(database, frame);
                          const isSelected = selectedFrame?.sequence === frame.sequence;
                          return (
                            <tr
                              key={frame.sequence}
                              className={isSelected ? "is-selected" : ""}
                              onClick={() => setSelectedFrame(frame)}
                            >
                              <td>{(frame.timestampMs / 1000).toFixed(3)}</td>
                              <td><strong>{formatCanId(frame)}</strong></td>
                              <td>{message?.name ?? "—"}</td>
                              <td>
                                <span className={`can-frame-type${frame.extended ? " is-ext" : ""}`}>
                                  {frame.error
                                    ? t.error
                                    : frame.rtr
                                      ? t.rtr
                                      : frame.extended
                                        ? t.extended
                                        : t.standard}
                                </span>
                              </td>
                              <td>{frame.data.length}</td>
                              <td><code>{formatData(frame.data) || "—"}</code></td>
                            </tr>
                          );
                        })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <aside className="can-decode-panel">
            <div className="can-decode-head">
              <span>{t.details}</span>
              {selectedFrame ? (
                <>
                  <strong>{selectedMessage?.name ?? formatCanId(selectedFrame)}</strong>
                  <small>
                    {formatCanId(selectedFrame)} · {selectedFrame.data.length} byte
                  </small>
                </>
              ) : null}
            </div>

            {!selectedFrame ? (
              <p className="can-decode-message">{t.chooseFrame}</p>
            ) : !selectedMessage ? (
              <div className="can-no-dbc-match">
                <span>{formatCanId(selectedFrame)}</span>
                <p>{t.noMatch}</p>
                <button type="button" onClick={() => fileInputRef.current?.click()}>
                  {t.openDbc}
                </button>
              </div>
            ) : (
              <div className="can-signal-list">
                <div className="can-signal-header">
                  <span>{t.signal}</span>
                  <span>{t.raw}</span>
                  <span>{t.value}</span>
                </div>
                {decoded.map((item) => (
                  <div className="can-signal-row" key={item.signal.uid}>
                    <span>
                      <strong>{item.signal.name}</strong>
                      <small>
                        {item.signal.startBit}|{item.signal.length} ·{" "}
                        {item.signal.byteOrder === "little" ? "Intel" : "Motorola"}
                      </small>
                    </span>
                    <code>{item.raw}</code>
                    <span>
                      <strong>{item.valueLabel ?? item.displayValue}</strong>
                      <small>
                        {item.valueLabel ? `${item.displayValue} · ` : ""}
                        {item.signal.unit || "—"}
                      </small>
                    </span>
                  </div>
                ))}
              </div>
            )}

            {selectedFrame ? (
              <div className="can-payload">
                <span>PAYLOAD</span>
                <div>
                  {selectedFrame.data.map((byte, index) => (
                    <span key={index}>
                      <small>{index}</small>
                      <strong>{byte.toString(16).toUpperCase().padStart(2, "0")}</strong>
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </aside>
        </div>

        {bridge.dropped ? (
          <p className="can-dropped">{t.dropped}: {bridge.dropped.toLocaleString()}</p>
        ) : null}
      </section>

      <footer className="can-footer">
        <p>Bülent Türk · CAN Viewer</p>
        <p>PCAN is a trademark of PEAK-System Technik GmbH.</p>
      </footer>

      {toast ? <div className="can-toast" role="status">{toast}</div> : null}
    </main>
  );
}
