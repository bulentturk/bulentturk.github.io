"use client";

import {
  type ChangeEvent,
  type ClipboardEvent,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ToolSeoContent from "./ToolSeoContent";
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
  parseDbc,
} from "./dbc/dbc";
import {
  type TxByteConfig,
  advanceTxCounters,
  clampByte,
  createDefaultTxByteConfigs,
  formatTxByte,
  generateTxPayload,
  normalizeTxByteConfig,
} from "./can/tx-generation";
import "./can-viewer.css";

type Language = "tr" | "en";
type ViewMode = "messages" | "trace";
type ConnectionMode = "listen" | "transmit";
type NumericFormat = "hex" | "decimal";

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

type SentMessage = {
  uid: number;
  id: number;
  extended: boolean;
  data: number[];
  byteValues: number[];
  byteConfigs: TxByteConfig[];
  cycleMs: number;
  enabled: boolean;
  sentCount: number;
  lastSentAt: number | null;
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
    title: "Online CAN Bus İzleyici",
    subtitle: "PCAN-USB ile canlı CAN mesajlarını izleyin, güvenli mesaj gönderin, TRC/CSV kaydı alın ve DBC sinyallerini çözün",
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
      "CAN gönderme için PCAN Local Bridge v1.2.0 gerekir. Yeni ZIP’i indirip eski köprünün yerine çalıştırın.",
    connectFailed: "PCAN bağlantısı kurulamadı.",
    csvEmpty: "Dışa aktarılacak CAN mesajı yok.",
    csvSaved: "CAN kaydı CSV olarak indirildi.",
    cleared: "CAN kayıtları temizlendi.",
    safety:
      "Varsayılan bağlantı listen-only açılır. Mesaj gönderme yalnız açık onayla etkinleştirilir.",
    dropped: "Yerel kuyrukta düşen frame",
    framesShown: "En fazla son 500 kayıt gösterilir",
    txTitle: "CAN mesajı gönder",
    txIntro: "Klasik CAN için birden fazla tek seferlik veya periyodik STD / EXT frame oluşturun.",
    txId: "CAN ID (hex)",
    txFormat: "Frame tipi",
    txDlc: "DLC (byte)",
    txData: "Veri byte’ları",
    txCycle: "Cycle (ms)",
    txCycleHint: "10–60000 ms · tarayıcı zamanlaması",
    dynamicTitle: "Dinamik mesaj üretici",
    dynamicIntro:
      "Her byte için sabit, manuel, sayaç veya checksum davranışı seçin. Değişiklikler çalışan mesajın sonraki çevrimine uygulanır.",
    fixedMode: "Sabit",
    manualMode: "Manuel",
    counterMode: "Sayaç",
    checksumMode: "Checksum",
    minimum: "Minimum",
    maximum: "Maksimum",
    step: "Adım",
    currentValue: "Değer",
    wrapsAtMaximum: "Üst sınırdan sonra minimuma döner",
    checksumAlgorithm: "Algoritma",
    checksumRange: "Hesap aralığı",
    checksumExcludesSelf: "Çıkış byte’ı hesaplamaya katılmaz",
    livePreview: "Sonraki gönderim önizlemesi",
    decrease: "Azalt",
    increase: "Artır",
    sendOnce: "Bir kez gönder",
    startCycle: "Periyodik listeye ekle",
    stopCycle: "Periyodik durdur",
    sendSuccess: "CAN mesajı başarıyla gönderildi.",
    sendFailed: "CAN mesajı gönderilemedi.",
    cycleStarted: "Periyodik CAN gönderimi başlatıldı.",
    cycleStopped: "Periyodik CAN gönderimi durduruldu.",
    invalidTx: "CAN ID veya DLC için etkin veri byte’ları geçersiz.",
    invalidCycle: "Cycle değeri 10–60000 ms arasında tam sayı olmalıdır.",
    requiresTxMode: "Gönderme için bağlantıyı “Gönderme açık” modunda kurun.",
    byteLabel: "Byte",
    cyclicActive: "Periyodik gönderim",
    editingTx: "Gönderilen mesaj düzenleniyor",
    newTx: "Yeni mesaj",
    updateCycle: "Değişiklikleri uygula ve çalıştır",
    sentTitle: "Gönderilen Mesajlar",
    sentIntro:
      "RX listesinden ayrı çalışan TX mesajları. Satıra tıklayarak düzenleyin; kutucuğu işaretleyerek çalıştırın veya kaldırarak durdurun.",
    sentEmpty: "Henüz gönderilmiş veya çevrimsel listeye eklenmiş mesaj yok.",
    sentEnabled: "Çalışıyor",
    sentDisabled: "Durdu",
    sentStatus: "Durum",
    sentCycle: "Cycle",
    sentCountLabel: "Gönderim",
    sentLast: "Son gönderim",
    sentActions: "İşlem",
    stopAllTx: "Tümünü durdur",
    deleteTx: "Sil",
    editTx: "Düzenle",
    allCyclesStopped: "Tüm periyodik CAN mesajları durduruldu.",
    messageDeleted: "Gönderilen mesaj listeden silindi.",
    messageUpdated: "Gönderilen mesaj güncellendi.",
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
    displayFormat: "Gösterim",
    idDisplay: "CAN ID",
    dataDisplay: "Veri byte'ları",
    hexadecimal: "HEX",
    decimal: "DEC",
    openEcuSimulator: "DBC ECU Simülatörü",
  },
  en: {
    back: "Main site",
    title: "Online CAN Bus Viewer",
    subtitle: "Monitor live CAN messages via PCAN-USB, transmit safely, record TRC/CSV logs, and decode DBC signals",
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
      "CAN transmission requires PCAN Local Bridge v1.2.0. Download and run the new ZIP instead of the old bridge.",
    connectFailed: "The PCAN connection could not be established.",
    csvEmpty: "There are no CAN messages to export.",
    csvSaved: "The CAN capture was downloaded as CSV.",
    cleared: "CAN records were cleared.",
    safety:
      "Connections use listen-only by default. Transmission is enabled only after explicit acknowledgement.",
    dropped: "Frames dropped in local queue",
    framesShown: "At most the latest 500 records are displayed",
    txTitle: "Transmit CAN message",
    txIntro: "Create multiple classic CAN standard or extended frames for one-shot or cyclic transmission.",
    txId: "CAN ID (hex)",
    txFormat: "Frame type",
    txDlc: "DLC (bytes)",
    txData: "Data bytes",
    txCycle: "Cycle (ms)",
    txCycleHint: "10–60000 ms · browser timing",
    dynamicTitle: "Dynamic message generator",
    dynamicIntro:
      "Choose fixed, manual, counter, or checksum behavior for each byte. Changes apply to the next cycle of a running message.",
    fixedMode: "Fixed",
    manualMode: "Manual",
    counterMode: "Counter",
    checksumMode: "Checksum",
    minimum: "Minimum",
    maximum: "Maximum",
    step: "Step",
    currentValue: "Value",
    wrapsAtMaximum: "Wraps to minimum after the maximum",
    checksumAlgorithm: "Algorithm",
    checksumRange: "Input range",
    checksumExcludesSelf: "The output byte is excluded from the calculation",
    livePreview: "Next transmission preview",
    decrease: "Decrease",
    increase: "Increase",
    sendOnce: "Send once",
    startCycle: "Add cyclic message",
    stopCycle: "Stop cyclic",
    sendSuccess: "CAN message transmitted successfully.",
    sendFailed: "The CAN message could not be transmitted.",
    cycleStarted: "Cyclic CAN transmission started.",
    cycleStopped: "Cyclic CAN transmission stopped.",
    invalidTx: "The CAN ID or the data bytes enabled by the DLC are invalid.",
    invalidCycle: "Cycle must be an integer between 10 and 60000 ms.",
    requiresTxMode: "Reconnect with “Transmit enabled” to send messages.",
    byteLabel: "Byte",
    cyclicActive: "Cyclic transmission",
    editingTx: "Editing transmitted message",
    newTx: "New message",
    updateCycle: "Apply changes and run",
    sentTitle: "Transmitted Messages",
    sentIntro:
      "TX messages are kept separate from the RX list. Select a row to edit it; check the box to run it or clear the box to stop it.",
    sentEmpty: "No message has been transmitted or added to the cyclic list yet.",
    sentEnabled: "Running",
    sentDisabled: "Stopped",
    sentStatus: "Status",
    sentCycle: "Cycle",
    sentCountLabel: "Sent",
    sentLast: "Last sent",
    sentActions: "Action",
    stopAllTx: "Stop all",
    deleteTx: "Delete",
    editTx: "Edit",
    allCyclesStopped: "All cyclic CAN messages were stopped.",
    messageDeleted: "The transmitted message was removed from the list.",
    messageUpdated: "The transmitted message was updated.",
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
    displayFormat: "Display",
    idDisplay: "CAN ID",
    dataDisplay: "Data bytes",
    hexadecimal: "HEX",
    decimal: "DEC",
    openEcuSimulator: "DBC ECU Simulator",
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
  if (database && database.name !== "j1939_eec_example.dbc") {
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
  const pedalPercent = Math.max(0, Math.min(100, 42 + Math.sin(phase / 2) * 28));
  const loadPercent = Math.max(0, Math.min(100, 48 + Math.sin(phase / 3) * 24));
  const demandTorquePercent = Math.round(loadPercent * 0.82);
  const actualTorquePercent = Math.round(loadPercent * 0.76);
  const pedalRaw = Math.round(pedalPercent / 0.4);

  return [
    {
      sequence,
      timestampMs,
      id: 0x0cf00400,
      extended: true,
      rtr: false,
      error: false,
      data: [
        0x01,
        Math.max(0, Math.min(250, demandTorquePercent + 125)),
        Math.max(0, Math.min(250, actualTorquePercent + 125)),
        rpmRaw & 0xff,
        (rpmRaw >> 8) & 0xff,
        0x00,
        0x00,
        Math.max(0, Math.min(250, demandTorquePercent + 125)),
      ],
    },
    {
      sequence: sequence + 1,
      timestampMs: timestampMs + 0.4,
      id: 0x0cf00300,
      extended: true,
      rtr: false,
      error: false,
      data: [
        pedalPercent < 1 ? 0x01 : 0x00,
        Math.max(0, Math.min(250, pedalRaw)),
        Math.round(loadPercent),
        0xff,
        0xff,
        0xff,
        0xff,
        0xff,
      ],
    },
  ];
}

function escapeCsv(value: string | number): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function parseCanId(
  value: string,
  extended: boolean,
  format: NumericFormat = "hex",
): number | null {
  const clean = value.trim().replace(/^0x/i, "");
  const pattern = format === "hex" ? /^[0-9a-fA-F]+$/ : /^\d+$/;
  if (!pattern.test(clean)) return null;
  const id = Number.parseInt(clean, format === "hex" ? 16 : 10);
  const maximum = extended ? 0x1fffffff : 0x7ff;
  return Number.isFinite(id) && id >= 0 && id <= maximum ? id : null;
}

function formatTxMessageId(
  message: Pick<SentMessage, "id" | "extended">,
  format: NumericFormat = "hex",
): string {
  if (format === "decimal") return message.id.toString(10);
  return message.extended
    ? `0x${message.id.toString(16).toUpperCase().padStart(8, "0")}`
    : `0x${message.id.toString(16).toUpperCase().padStart(3, "0")}`;
}

function formatFrameId(
  frame: Pick<CanFrame, "id" | "extended">,
  format: NumericFormat,
): string {
  return format === "hex" ? formatCanId(frame) : Math.max(0, frame.id).toString(10);
}

function formatPayload(data: number[], format: NumericFormat): string {
  return format === "hex" ? formatData(data) : data.join(" ");
}

function displayTxByte(value: string, format: NumericFormat): string {
  if (format === "hex" || !/^[0-9A-Fa-f]{2}$/.test(value)) return value;
  return Number.parseInt(value, 16).toString(10);
}

function parseDataBytes(values: string[], dlc: number): number[] | null {
  const activeValues = values.slice(0, dlc);
  if (
    dlc < 0 ||
    dlc > 8 ||
    activeValues.length !== dlc ||
    activeValues.some((value) => !/^[0-9a-fA-F]{2}$/.test(value))
  ) {
    return null;
  }
  return activeValues.map((value) => Number.parseInt(value, 16));
}

function pastedDataBytes(value: string, format: NumericFormat = "hex"): string[] {
  if (format === "decimal") {
    const separated = value.trim().split(/[\s,;]+/).filter(Boolean);
    if (!separated.length || separated.some((token) => !/^\d{1,3}$/.test(token))) {
      return [];
    }
    const values = separated.map(Number);
    if (values.some((item) => item < 0 || item > 255)) return [];
    return values.map(formatTxByte);
  }
  const trimmed = value.trim().replaceAll("0x", "").replaceAll("0X", "");
  if (!trimmed) return [];
  const separated = trimmed.split(/[\s,;]+/).filter(Boolean);
  if (
    separated.length > 1 &&
    separated.every((token) => /^[0-9a-fA-F]{1,2}$/.test(token))
  ) {
    return separated.map((token) => token.padStart(2, "0").toUpperCase());
  }
  const compact = trimmed.replace(/[^0-9a-fA-F]/g, "");
  if (!compact || compact.length % 2 !== 0) return [];
  return compact.match(/.{2}/g)?.map((token) => token.toUpperCase()) ?? [];
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
  const [txDlc, setTxDlc] = useState(8);
  const [txBytes, setTxBytes] = useState<string[]>(() => Array(8).fill("00"));
  const [txByteConfigs, setTxByteConfigs] = useState<TxByteConfig[]>(
    createDefaultTxByteConfigs,
  );
  const [txCycle, setTxCycle] = useState("100");
  const [txBusy, setTxBusy] = useState(false);
  const [sentMessages, setSentMessages] = useState<SentMessage[]>([]);
  const [editingTxUid, setEditingTxUid] = useState<number | null>(null);
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
  const [idFormat, setIdFormat] = useState<NumericFormat>("hex");
  const [dataFormat, setDataFormat] = useState<NumericFormat>("hex");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const arrivalTimesRef = useRef<number[]>([]);
  const demoSequenceRef = useRef(1);
  const pollActiveRef = useRef(false);
  const recordedFramesRef = useRef<RecordedFrame[]>([]);
  const recordingRef = useRef(false);
  const recordingStartedAtRef = useRef(0);
  const recordingBaseTimestampRef = useRef<number | null>(null);
  const recordingBaseElapsedRef = useRef(0);
  const txByteRefs = useRef<Array<HTMLInputElement | null>>([]);
  const sentMessagesRef = useRef<SentMessage[]>([]);
  const cycleTimersRef = useRef<Map<number, number>>(new Map());
  const nextTxUidRef = useRef(1);
  const t = copy[language];

  const editingMessage = useMemo(
    () => sentMessages.find((message) => message.uid === editingTxUid) ?? null,
    [editingTxUid, sentMessages],
  );

  const txPreview = useMemo(() => {
    if (editingMessage?.enabled) {
      return generateTxPayload(
        editingMessage.byteValues,
        editingMessage.byteConfigs,
        editingMessage.data.length,
      );
    }
    const values = parseDataBytes(txBytes, txDlc);
    return values ? generateTxPayload(values, txByteConfigs, txDlc) : null;
  }, [editingMessage, txByteConfigs, txBytes, txDlc]);

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
    (frames: CanFrame[], direction: "rx" | "tx" = "rx") => {
      if (!frames.length) return;
      recordFrames(frames, direction);
      if (direction === "tx") return;
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
    document.title = `${t.title} | ALGO TEAM`;
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

  useEffect(() => {
    if (
      demo ||
      (bridge.connected && bridge.listenOnly === false && connectionMode === "transmit")
    ) {
      return;
    }
    for (const timer of cycleTimersRef.current.values()) window.clearTimeout(timer);
    cycleTimersRef.current.clear();
    if (sentMessagesRef.current.some((message) => message.enabled)) {
      const next = sentMessagesRef.current.map((message) => ({
        ...message,
        enabled: false,
      }));
      sentMessagesRef.current = next;
      setSentMessages(next);
    }
  }, [bridge.connected, bridge.listenOnly, connectionMode, demo]);

  useEffect(
    () => () => {
      for (const timer of cycleTimersRef.current.values()) window.clearTimeout(timer);
      cycleTimersRef.current.clear();
    },
    [],
  );

  const cycleSending = sentMessages.some((message) => message.enabled);

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
        row.frame.data.join(" "),
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
          frame.data.join(" "),
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
    stopAllCycles(false);
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
      stopAllCycles(false);
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
        "; Generated by ALGO TEAM CAN Viewer",
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

  function replaceSentMessages(next: SentMessage[]) {
    sentMessagesRef.current = next;
    setSentMessages(next);
  }

  function updateSentMessage(
    uid: number,
    updater: (message: SentMessage) => SentMessage,
  ) {
    replaceSentMessages(
      sentMessagesRef.current.map((message) =>
        message.uid === uid ? updater(message) : message,
      ),
    );
  }

  function stopMessage(uid: number, showToast = false) {
    const timer = cycleTimersRef.current.get(uid);
    if (timer !== undefined) window.clearTimeout(timer);
    cycleTimersRef.current.delete(uid);
    const message = sentMessagesRef.current.find((item) => item.uid === uid);
    if (message?.enabled) {
      updateSentMessage(uid, (item) => ({ ...item, enabled: false }));
      if (showToast) setToast(t.cycleStopped);
    }
  }

  function stopAllCycles(showToast = true) {
    const hadActive = sentMessagesRef.current.some((message) => message.enabled);
    for (const timer of cycleTimersRef.current.values()) window.clearTimeout(timer);
    cycleTimersRef.current.clear();
    if (hadActive) {
      replaceSentMessages(
        sentMessagesRef.current.map((message) => ({ ...message, enabled: false })),
      );
      if (showToast) setToast(t.allCyclesStopped);
    }
  }

  function preparedTx(): {
    id: number;
    extended: boolean;
    data: number[];
    byteValues: number[];
    byteConfigs: TxByteConfig[];
    cycleMs: number;
  } | null {
    const id = parseCanId(txId, txExtended, idFormat);
    const byteValues = parseDataBytes(txBytes, txDlc);
    const cycleMs = Number(txCycle);
    const byteConfigs = txByteConfigs
      .slice(0, txDlc)
      .map((config) => normalizeTxByteConfig(config, txDlc));
    return id === null || byteValues === null
      ? null
      : {
          id,
          extended: txExtended,
          data: generateTxPayload(byteValues, byteConfigs, txDlc),
          byteValues,
          byteConfigs,
          cycleMs,
        };
  }

  async function transmitPrepared(
    id: number,
    extended: boolean,
    data: number[],
    announce: boolean,
    showBusy: boolean,
  ): Promise<boolean> {
    if (demo) {
      if (showBusy) setTxBusy(true);
      const sequence = demoSequenceRef.current++;
      const frame: CanFrame = {
        sequence,
        timestampMs: performance.now(),
        id,
        extended,
        rtr: false,
        error: false,
        direction: "tx",
        data,
      };
      ingestFrames([frame], "tx");
      setBridge((current) => ({ ...current, sent: (current.sent ?? 0) + 1 }));
      if (announce) setToast(t.sendSuccess);
      if (showBusy) setTxBusy(false);
      return true;
    }

    if (!bridge.connected || bridge.listenOnly !== false) {
      if (announce) setToast(t.requiresTxMode);
      return false;
    }

    if (showBusy) setTxBusy(true);
    try {
      const result = await bridgeRequest<{ ok: boolean; sent?: number; error?: string }>(
        "/send",
        {
          method: "POST",
          body: JSON.stringify({ id, extended, data }),
        },
      );
      if (!result.ok) {
        if (announce) setToast(result.error || t.sendFailed);
        return false;
      }
      const frame: CanFrame = {
        sequence: result.sent ?? (bridge.sent ?? 0) + 1,
        timestampMs: performance.now(),
        id,
        extended,
        rtr: false,
        error: false,
        direction: "tx",
        data,
      };
      ingestFrames([frame], "tx");
      setBridge((current) => ({ ...current, sent: result.sent ?? current.sent }));
      if (announce) setToast(t.sendSuccess);
      return true;
    } catch {
      if (announce) setToast(t.sendFailed);
      return false;
    } finally {
      if (showBusy) setTxBusy(false);
    }
  }

  function saveMessageDefinition(
    prepared: {
      id: number;
      extended: boolean;
      data: number[];
      byteValues: number[];
      byteConfigs: TxByteConfig[];
      cycleMs: number;
    },
    enabled: boolean,
    sentIncrement: number,
  ): SentMessage {
    const existing = editingTxUid === null
      ? null
      : sentMessagesRef.current.find((message) => message.uid === editingTxUid) ?? null;
    const uid = existing?.uid ?? nextTxUidRef.current++;
    if (existing?.enabled) stopMessage(uid);
    const byteValues = prepared.byteValues.map((value, index) => (
      existing && prepared.byteConfigs[index]?.mode === "counter"
        ? existing.byteValues[index] ?? value
        : value
    ));
    const message: SentMessage = {
      uid,
      id: prepared.id,
      extended: prepared.extended,
      data: generateTxPayload(byteValues, prepared.byteConfigs, prepared.data.length),
      byteValues,
      byteConfigs: prepared.byteConfigs.map((config) => ({ ...config })),
      cycleMs: prepared.cycleMs,
      enabled,
      sentCount: (existing?.sentCount ?? 0) + sentIncrement,
      lastSentAt: sentIncrement ? Date.now() : (existing?.lastSentAt ?? null),
    };
    const next = existing
      ? sentMessagesRef.current.map((item) => (item.uid === uid ? message : item))
      : [...sentMessagesRef.current, message];
    replaceSentMessages(next);
    setEditingTxUid(uid);
    return message;
  }

  async function sendFrame() {
    const prepared = preparedTx();
    if (!prepared) {
      setToast(t.invalidTx);
      return;
    }
    if (
      !Number.isInteger(prepared.cycleMs) ||
      prepared.cycleMs < 10 ||
      prepared.cycleMs > 60000
    ) {
      setToast(t.invalidCycle);
      return;
    }
    const sent = await transmitPrepared(
      prepared.id,
      prepared.extended,
      prepared.data,
      true,
      true,
    );
    if (sent) saveMessageDefinition(prepared, false, 1);
  }

  async function runCyclicMessage(uid: number) {
    const message = sentMessagesRef.current.find((item) => item.uid === uid);
    if (!message?.enabled) return;
    if (!demo && (!bridge.connected || bridge.listenOnly !== false)) {
      stopMessage(uid);
      setToast(t.requiresTxMode);
      return;
    }

    const startedAt = performance.now();
    const data = generateTxPayload(
      message.byteValues,
      message.byteConfigs,
      message.data.length,
    );
    const sent = await transmitPrepared(
      message.id,
      message.extended,
      data,
      false,
      false,
    );
    if (!sent) {
      stopMessage(uid);
      setToast(t.sendFailed);
      return;
    }
    updateSentMessage(uid, (item) => {
      const nextByteValues = advanceTxCounters(
        item.byteValues,
        item.byteConfigs,
        item.data.length,
      );
      return {
        ...item,
        data,
        byteValues: nextByteValues,
        sentCount: item.sentCount + 1,
        lastSentAt: Date.now(),
      };
    });
    const current = sentMessagesRef.current.find((item) => item.uid === uid);
    if (!current?.enabled) return;
    const remaining = Math.max(0, current.cycleMs - (performance.now() - startedAt));
    const timer = window.setTimeout(() => void runCyclicMessage(uid), remaining);
    cycleTimersRef.current.set(uid, timer);
  }

  function startCycle() {
    if (!demo && (!bridge.connected || bridge.listenOnly !== false)) {
      setToast(t.requiresTxMode);
      return;
    }
    const prepared = preparedTx();
    if (!prepared) {
      setToast(t.invalidTx);
      return;
    }
    if (
      !Number.isInteger(prepared.cycleMs) ||
      prepared.cycleMs < 10 ||
      prepared.cycleMs > 60000
    ) {
      setToast(t.invalidCycle);
      return;
    }

    const message = saveMessageDefinition(prepared, true, 0);
    setToast(editingTxUid === null ? t.cycleStarted : t.messageUpdated);
    void runCyclicMessage(message.uid);
  }

  function toggleSentMessage(uid: number) {
    const message = sentMessagesRef.current.find((item) => item.uid === uid);
    if (!message) return;
    if (message.enabled) {
      stopMessage(uid, true);
      return;
    }
    if (!demo && (!bridge.connected || bridge.listenOnly !== false)) {
      setToast(t.requiresTxMode);
      return;
    }
    updateSentMessage(uid, (item) => ({ ...item, enabled: true }));
    setToast(t.cycleStarted);
    void runCyclicMessage(uid);
  }

  function editSentMessage(message: SentMessage) {
    setEditingTxUid(message.uid);
    setTxId(message.id.toString(idFormat === "hex" ? 16 : 10).toUpperCase());
    setTxExtended(message.extended);
    setTxDlc(message.data.length);
    setTxBytes([
      ...message.byteValues.map(formatTxByte),
      ...Array(Math.max(0, 8 - message.byteValues.length)).fill("00"),
    ].slice(0, 8));
    setTxByteConfigs([
      ...message.byteConfigs.map((config) => ({ ...config })),
      ...createDefaultTxByteConfigs().slice(message.byteConfigs.length),
    ].slice(0, 8));
    setTxCycle(String(message.cycleMs));
    window.requestAnimationFrame(() =>
      document.querySelector(".can-tx-card")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      }),
    );
  }

  function newTxMessage() {
    setEditingTxUid(null);
    setTxId(idFormat === "hex" ? "201" : "513");
    setTxExtended(false);
    setTxDlc(8);
    setTxBytes(Array(8).fill("00"));
    setTxByteConfigs(createDefaultTxByteConfigs());
    setTxCycle("100");
  }

  function changeTxDlc(nextDlc: number) {
    setTxDlc(nextDlc);
    setTxByteConfigs((current) => current.map((config) => (
      normalizeTxByteConfig(config, nextDlc)
    )));
  }

  function deleteSentMessage(uid: number) {
    stopMessage(uid);
    replaceSentMessages(
      sentMessagesRef.current.filter((message) => message.uid !== uid),
    );
    if (editingTxUid === uid) newTxMessage();
    setToast(t.messageDeleted);
  }

  function syncEditedByte(
    index: number,
    value?: number,
    config?: TxByteConfig,
  ) {
    if (editingTxUid === null) return;
    updateSentMessage(editingTxUid, (message) => {
      const byteValues = [...message.byteValues];
      const byteConfigs = message.byteConfigs.map((item) => ({ ...item }));
      if (value !== undefined && index < byteValues.length) {
        byteValues[index] = clampByte(value);
      }
      if (config && index < byteConfigs.length) {
        byteConfigs[index] = normalizeTxByteConfig(config, message.data.length);
      }
      return {
        ...message,
        byteValues,
        byteConfigs,
        data: generateTxPayload(byteValues, byteConfigs, message.data.length),
      };
    });
  }

  function setTxByteValue(index: number, value: number) {
    const normalized = formatTxByte(value);
    setTxBytes((current) => current.map((byte, byteIndex) => (
      byteIndex === index ? normalized : byte
    )));
    syncEditedByte(index, value);
  }

  function updateTxByteConfig(index: number, patch: Partial<TxByteConfig>) {
    const mergedConfig = { ...txByteConfigs[index], ...patch };
    if (patch.min !== undefined) {
      mergedConfig.min = clampByte(patch.min);
      mergedConfig.max = Math.max(mergedConfig.min, mergedConfig.max);
    }
    if (patch.max !== undefined) {
      mergedConfig.max = clampByte(patch.max);
      mergedConfig.min = Math.min(mergedConfig.min, mergedConfig.max);
    }
    const nextConfig = normalizeTxByteConfig(
      mergedConfig,
      txDlc,
    );
    const nextConfigs = txByteConfigs.map((config, byteIndex) => (
      byteIndex === index ? nextConfig : config
    ));
    setTxByteConfigs(nextConfigs);

    const currentValue = Number.parseInt(txBytes[index] || "00", 16);
    const boundedValue = nextConfig.mode === "manual" || nextConfig.mode === "counter"
      ? Math.min(nextConfig.max, Math.max(nextConfig.min, currentValue))
      : currentValue;
    if (boundedValue !== currentValue) {
      setTxBytes((current) => current.map((byte, byteIndex) => (
        byteIndex === index ? formatTxByte(boundedValue) : byte
      )));
    }
    syncEditedByte(index, boundedValue, nextConfig);
  }

  function updateTxByte(index: number, value: string) {
    let normalized: string;
    if (dataFormat === "decimal") {
      const decimal = value.replace(/\D/g, "").slice(0, 3);
      if (!decimal) {
        setTxBytes((current) => current.map((byte, byteIndex) => (
          byteIndex === index ? "" : byte
        )));
        return;
      }
      const parsedDecimal = Math.min(255, Number(decimal));
      normalized = formatTxByte(parsedDecimal);
    } else {
      normalized = value.replace(/[^0-9a-fA-F]/g, "").slice(0, 2).toUpperCase();
    }
    const config = txByteConfigs[index];
    if (
      normalized.length === 2 &&
      (config.mode === "manual" || config.mode === "counter")
    ) {
      const parsed = Number.parseInt(normalized, 16);
      normalized = formatTxByte(Math.min(config.max, Math.max(config.min, parsed)));
    }
    setTxBytes((current) => current.map((byte, byteIndex) => (
      byteIndex === index ? normalized : byte
    )));
    if (normalized.length === 2) {
      syncEditedByte(index, Number.parseInt(normalized, 16));
    }
    if (
      normalized.length === 2 &&
      index + 1 < txDlc &&
      (dataFormat === "hex" || value.length >= 3)
    ) {
      window.requestAnimationFrame(() => txByteRefs.current[index + 1]?.focus());
    }
  }

  function onTxByteKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !txBytes[index] && index > 0) {
      event.preventDefault();
      txByteRefs.current[index - 1]?.focus();
      txByteRefs.current[index - 1]?.select();
    }
    if (event.key === "ArrowLeft" && index > 0) {
      txByteRefs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowRight" && index + 1 < txDlc) {
      txByteRefs.current[index + 1]?.focus();
    }
  }

  function onTxBytePaste(index: number, event: ClipboardEvent<HTMLInputElement>) {
    const pasted = pastedDataBytes(event.clipboardData.getData("text"), dataFormat);
    if (!pasted.length) return;
    event.preventDefault();
    setTxBytes((current) => {
      const next = [...current];
      pasted.slice(0, txDlc - index).forEach((byte, offset) => {
        next[index + offset] = byte;
      });
      return next;
    });
    const nextIndex = Math.min(txDlc - 1, index + pasted.length);
    window.requestAnimationFrame(() => txByteRefs.current[nextIndex]?.focus());
  }

  const active = demo || bridge.connected;
  const transmitReady = demo || (bridge.connected && bridge.listenOnly === false);
  const activeText = paused
    ? t.paused
    : demo
      ? t.demoActive
      : bridge.connected
        ? bridge.listenOnly === false
          ? t.transmitMode
          : t.active
        : t.disconnected;

  function changeIdFormat(nextFormat: NumericFormat) {
    if (nextFormat === idFormat) return;
    const currentId = parseCanId(txId, txExtended, idFormat);
    setIdFormat(nextFormat);
    if (currentId !== null) {
      setTxId(currentId.toString(nextFormat === "hex" ? 16 : 10).toUpperCase());
    }
  }

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
              <a href="/downloads/pcan-local-bridge-v1.2.0.zip" download>
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

      <section className="can-format-panel" aria-label={t.displayFormat}>
        <strong>{t.displayFormat}</strong>
        <div>
          <span>{t.idDisplay}</span>
          <div className="can-format-switch">
            <button className={idFormat === "hex" ? "is-active" : ""} type="button" onClick={() => changeIdFormat("hex")}>{t.hexadecimal}</button>
            <button className={idFormat === "decimal" ? "is-active" : ""} type="button" onClick={() => changeIdFormat("decimal")}>{t.decimal}</button>
          </div>
        </div>
        <div>
          <span>{t.dataDisplay}</span>
          <div className="can-format-switch">
            <button className={dataFormat === "hex" ? "is-active" : ""} type="button" onClick={() => setDataFormat("hex")}>{t.hexadecimal}</button>
            <button className={dataFormat === "decimal" ? "is-active" : ""} type="button" onClick={() => setDataFormat("decimal")}>{t.decimal}</button>
          </div>
        </div>
      </section>

      <section className="can-io-panel" aria-label="CAN transmit and recording">
        <article className="can-tx-card">
          <div className="can-io-head">
            <span>TX / 01</span>
            <div>
              <h2>{t.txTitle}</h2>
              <p>{t.txIntro}</p>
            </div>
            <strong className={transmitReady ? "is-ready" : ""}>
              {cycleSending
                ? t.cyclicActive
                : demo
                  ? t.demoActive
                  : bridge.connected && bridge.listenOnly === false
                  ? t.transmitMode
                  : t.receiveMode}
            </strong>
          </div>
          {editingTxUid !== null ? (
            <div className="can-tx-editing">
              <span>{t.editingTx} · #{editingTxUid}</span>
              <button type="button" onClick={newTxMessage}>{t.newTx}</button>
            </div>
          ) : null}
          <div className="can-tx-fields">
            <label className="can-tx-id">
              <span>{idFormat === "hex" ? t.txId : `${t.idDisplay} (${t.decimal})`}</span>
              <input
                value={txId}
                onChange={(event) => setTxId(event.target.value)}
                placeholder={idFormat === "hex" ? (txExtended ? "18FF50E5" : "201") : (txExtended ? "419385573" : "513")}
                inputMode={idFormat === "decimal" ? "numeric" : "text"}
                spellCheck={false}
              />
            </label>
            <label className="can-tx-format">
              <span>{t.txFormat}</span>
              <select
                value={txExtended ? "extended" : "standard"}
                onChange={(event) => setTxExtended(event.target.value === "extended")}
              >
                <option value="standard">{t.standard} · 11 bit</option>
                <option value="extended">{t.extended} · 29 bit</option>
              </select>
            </label>
            <label className="can-tx-dlc">
              <span>{t.txDlc}</span>
              <select
                value={txDlc}
                onChange={(event) => changeTxDlc(Number(event.target.value))}
              >
                {Array.from({ length: 9 }, (_, dlc) => (
                  <option key={dlc} value={dlc}>{dlc}</option>
                ))}
              </select>
            </label>
            <label className="can-tx-cycle">
              <span>{t.txCycle}</span>
              <input
                type="number"
                min={10}
                max={60000}
                step={1}
                inputMode="numeric"
                value={txCycle}
                onChange={(event) => setTxCycle(event.target.value)}
              />
              <small>{t.txCycleHint}</small>
            </label>
            <div className="can-tx-data">
              <span>{t.txData}</span>
              <div className="can-byte-editor" aria-label={t.txData}>
                {txBytes.map((byte, index) => {
                  const enabled = index < txDlc;
                  const config = txByteConfigs[index];
                  const displayByte = enabled && config.mode === "checksum" && txPreview
                    ? formatTxByte(txPreview[index])
                    : byte;
                  return (
                    <label key={index} className={enabled ? "is-active" : "is-disabled"}>
                      <small>B{index}</small>
                      <input
                        ref={(element) => {
                          txByteRefs.current[index] = element;
                        }}
                        aria-label={`${t.byteLabel} ${index}`}
                        value={enabled ? displayTxByte(displayByte, dataFormat) : ""}
                        placeholder={enabled ? (dataFormat === "hex" ? "00" : "0") : "—"}
                        maxLength={dataFormat === "hex" ? 2 : 3}
                        inputMode={dataFormat === "decimal" ? "numeric" : "text"}
                        autoComplete="off"
                        spellCheck={false}
                        disabled={!enabled || config.mode === "checksum"}
                        onFocus={(event) => event.currentTarget.select()}
                        onChange={(event) => updateTxByte(index, event.target.value)}
                        onKeyDown={(event) => onTxByteKeyDown(index, event)}
                        onPaste={(event) => onTxBytePaste(index, event)}
                      />
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="can-dynamic-builder">
              <div className="can-dynamic-head">
                <div>
                  <span>{t.dynamicTitle}</span>
                  <p>{t.dynamicIntro}</p>
                </div>
                <div className="can-live-preview">
                  <small>{t.livePreview}</small>
                  <code>{txPreview?.length ? formatPayload(txPreview, dataFormat) : "—"}</code>
                </div>
              </div>
              <div className="can-dynamic-grid">
                {txByteConfigs.slice(0, txDlc).map((config, index) => {
                  const storedValue = Number.parseInt(txBytes[index] || "00", 16);
                  const liveValue = editingMessage?.enabled
                    ? editingMessage.byteValues[index] ?? storedValue
                    : storedValue;
                  return (
                    <article key={index} className={`can-dynamic-byte is-${config.mode}`}>
                      <div className="can-dynamic-byte-head">
                        <strong>B{index}</strong>
                        <code>{dataFormat === "hex"
                          ? formatTxByte(config.mode === "checksum" && txPreview ? txPreview[index] : liveValue)
                          : String(config.mode === "checksum" && txPreview ? txPreview[index] : liveValue)}</code>
                      </div>
                      <label className="can-mode-select">
                        <span>{t.mode}</span>
                        <select
                          value={config.mode}
                          onChange={(event) => updateTxByteConfig(index, {
                            mode: event.target.value as TxByteConfig["mode"],
                          })}
                        >
                          <option value="fixed">{t.fixedMode}</option>
                          <option value="manual">{t.manualMode}</option>
                          <option value="counter">{t.counterMode}</option>
                          <option value="checksum">{t.checksumMode}</option>
                        </select>
                      </label>

                      {config.mode === "manual" ? (
                        <>
                          <div className="can-slider-row">
                            <button
                              type="button"
                              aria-label={`${t.decrease} B${index}`}
                              onClick={() => setTxByteValue(
                                index,
                                Math.max(config.min, liveValue - config.step),
                              )}
                            >−</button>
                            <input
                              aria-label={`${t.byteLabel} ${index} ${t.currentValue}`}
                              type="range"
                              min={config.min}
                              max={config.max}
                              step={config.step}
                              value={Math.min(config.max, Math.max(config.min, liveValue))}
                              onChange={(event) => setTxByteValue(index, Number(event.target.value))}
                            />
                            <button
                              type="button"
                              aria-label={`${t.increase} B${index}`}
                              onClick={() => setTxByteValue(
                                index,
                                Math.min(config.max, liveValue + config.step),
                              )}
                            >+</button>
                          </div>
                          <div className="can-config-fields is-three">
                            <label><span>{t.minimum}</span><input type="number" min={0} max={255} value={config.min} onChange={(event) => updateTxByteConfig(index, { min: Number(event.target.value) })} /></label>
                            <label><span>{t.maximum}</span><input type="number" min={0} max={255} value={config.max} onChange={(event) => updateTxByteConfig(index, { max: Number(event.target.value) })} /></label>
                            <label><span>{t.step}</span><input type="number" min={1} max={255} value={config.step} onChange={(event) => updateTxByteConfig(index, { step: Number(event.target.value) })} /></label>
                          </div>
                        </>
                      ) : null}

                      {config.mode === "counter" ? (
                        <>
                          <div className="can-config-fields is-four">
                            <label><span>{t.currentValue}</span><input type="number" min={config.min} max={config.max} value={liveValue} onChange={(event) => setTxByteValue(index, Number(event.target.value))} /></label>
                            <label><span>{t.minimum}</span><input type="number" min={0} max={255} value={config.min} onChange={(event) => updateTxByteConfig(index, { min: Number(event.target.value) })} /></label>
                            <label><span>{t.maximum}</span><input type="number" min={0} max={255} value={config.max} onChange={(event) => updateTxByteConfig(index, { max: Number(event.target.value) })} /></label>
                            <label><span>{t.step}</span><input type="number" min={1} max={255} value={config.step} onChange={(event) => updateTxByteConfig(index, { step: Number(event.target.value) })} /></label>
                          </div>
                          <small className="can-mode-note">↻ {t.wrapsAtMaximum}</small>
                        </>
                      ) : null}

                      {config.mode === "checksum" ? (
                        <>
                          <label className="can-checksum-algorithm">
                            <span>{t.checksumAlgorithm}</span>
                            <select value={config.checksumAlgorithm} onChange={(event) => updateTxByteConfig(index, { checksumAlgorithm: event.target.value as TxByteConfig["checksumAlgorithm"] })}>
                              <option value="sum8">SUM8</option>
                              <option value="xor8">XOR8</option>
                              <option value="crc8-sae-j1850">CRC-8 SAE J1850</option>
                            </select>
                          </label>
                          <div className="can-checksum-range">
                            <span>{t.checksumRange}</span>
                            <select value={config.checksumStart} onChange={(event) => updateTxByteConfig(index, { checksumStart: Number(event.target.value) })}>
                              {Array.from({ length: txDlc }, (_, byteIndex) => <option key={byteIndex} value={byteIndex}>B{byteIndex}</option>)}
                            </select>
                            <i>→</i>
                            <select value={config.checksumEnd} onChange={(event) => updateTxByteConfig(index, { checksumEnd: Number(event.target.value) })}>
                              {Array.from({ length: txDlc }, (_, byteIndex) => <option key={byteIndex} value={byteIndex}>B{byteIndex}</option>)}
                            </select>
                          </div>
                          <small className="can-mode-note">✓ {t.checksumExcludesSelf}</small>
                        </>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </div>
            <div className="can-tx-actions">
              <button
                type="button"
                onClick={() => void sendFrame()}
                disabled={
                  txBusy ||
                  !transmitReady
                }
              >
                {t.sendOnce}
              </button>
              <button
                type="button"
                onClick={startCycle}
                disabled={txBusy || !transmitReady}
              >
                {editingTxUid === null ? t.startCycle : t.updateCycle}
              </button>
            </div>
          </div>
          {bridge.ok && bridge.version === "1.0.0" ? (
            <p className="can-bridge-upgrade">
              {t.bridgeUpgrade}{" "}
              <a href="/downloads/pcan-local-bridge-v1.2.0.zip" download>
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

      <section className="can-sent-panel" aria-labelledby="can-sent-title">
        <div className="can-sent-head">
          <div>
            <span>TX / QUEUE</span>
            <h2 id="can-sent-title">{t.sentTitle}</h2>
            <p>{t.sentIntro}</p>
          </div>
          <button
            type="button"
            onClick={() => stopAllCycles()}
            disabled={!cycleSending}
          >
            {t.stopAllTx}
          </button>
        </div>

        {!sentMessages.length ? (
          <div className="can-sent-empty">{t.sentEmpty}</div>
        ) : (
          <div className="can-sent-scroll">
            <table className="can-sent-table">
              <thead>
                <tr>
                  <th>{t.sentStatus}</th>
                  <th>{t.id}</th>
                  <th>{t.format}</th>
                  <th>{t.dlc}</th>
                  <th>{t.data}</th>
                  <th>{t.sentCycle}</th>
                  <th>{t.sentCountLabel}</th>
                  <th>{t.sentLast}</th>
                  <th>{t.sentActions}</th>
                </tr>
              </thead>
              <tbody>
                {sentMessages.map((message) => (
                  <tr
                    key={message.uid}
                    className={`${message.enabled ? "is-running" : ""}${
                      editingTxUid === message.uid ? " is-editing" : ""
                    }`}
                    tabIndex={0}
                    onClick={() => editSentMessage(message)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        editSentMessage(message);
                      }
                    }}
                  >
                    <td>
                      <label className="can-cycle-toggle" onClick={(event) => event.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={message.enabled}
                          onChange={() => toggleSentMessage(message.uid)}
                          aria-label={`${formatTxMessageId(message, idFormat)} · ${
                            message.enabled ? t.stopCycle : t.startCycle
                          }`}
                        />
                        <span aria-hidden="true" />
                        <strong>{message.enabled ? t.sentEnabled : t.sentDisabled}</strong>
                      </label>
                    </td>
                    <td>
                      <strong>{formatTxMessageId(message, idFormat)}</strong>
                    </td>
                    <td>
                      <span className={`can-frame-type${message.extended ? " is-ext" : ""}`}>
                        {message.extended ? t.extended : t.standard}
                      </span>
                    </td>
                    <td>{message.data.length}</td>
                    <td><code>{formatPayload(message.data, dataFormat) || "—"}</code></td>
                    <td>{message.cycleMs} ms</td>
                    <td>{message.sentCount.toLocaleString()}</td>
                    <td>
                      {message.lastSentAt
                        ? new Date(message.lastSentAt).toLocaleTimeString(
                            language === "tr" ? "tr-TR" : "en-GB",
                            { hour12: false },
                          )
                        : "—"}
                    </td>
                    <td>
                      <div className="can-sent-actions">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            editSentMessage(message);
                          }}
                        >
                          {t.editTx}
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            deleteSentMessage(message.uid);
                          }}
                        >
                          {t.deleteTx}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
            <button data-analytics-action="open_dbc" type="button" onClick={() => fileInputRef.current?.click()}>
              {t.openDbc}
            </button>
            <button data-analytics-action="load_example" type="button" onClick={loadExample}>{t.exampleDbc}</button>
            <a href="/dbc-ecu-simulator/">{t.openEcuSimulator} →</a>
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
                              <td><strong>{formatFrameId(row.frame, idFormat)}</strong></td>
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
                              <td><code>{formatPayload(row.frame.data, dataFormat) || "—"}</code></td>
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
                              <td><strong>{formatFrameId(frame, idFormat)}</strong></td>
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
                              <td><code>{formatPayload(frame.data, dataFormat) || "—"}</code></td>
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
                  <strong>{selectedMessage?.name ?? formatFrameId(selectedFrame, idFormat)}</strong>
                  <small>
                    {formatFrameId(selectedFrame, idFormat)} · {selectedFrame.data.length} byte
                  </small>
                </>
              ) : null}
            </div>

            {!selectedFrame ? (
              <p className="can-decode-message">{t.chooseFrame}</p>
            ) : !selectedMessage ? (
              <div className="can-no-dbc-match">
                <span>{formatFrameId(selectedFrame, idFormat)}</span>
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
                      <strong>{dataFormat === "hex" ? byte.toString(16).toUpperCase().padStart(2, "0") : byte}</strong>
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

      <ToolSeoContent tool="can-viewer" language={language} />

      <footer className="can-footer">
        <p>ALGO TEAM · CAN Viewer</p>
        <p>PCAN is a trademark of PEAK-System Technik GmbH.</p>
      </footer>

      {toast ? <div className="can-toast" role="status">{toast}</div> : null}
    </main>
  );
}
