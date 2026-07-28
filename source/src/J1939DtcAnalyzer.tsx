import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { parseCanLog, type ParsedLog } from "./can-log/log";
import { loadTransferredCanLog } from "./can-log/transfer";
import { formatCanId, formatData } from "./can/decode";
import { parseDbc, type DbcDatabase } from "./dbc/dbc";
import {
  contextSeriesAround,
  contextSnapshotAt,
  decodeDbcContext,
  type ContextSeries,
  type DbcContext,
} from "./j1939/context";
import {
  clearStoredDictionary,
  fmiDefinition,
  loadStoredDictionary,
  mergeKnowledge,
  readSpnDictionary,
  storeDictionary,
  type Language,
} from "./j1939/dictionary";
import { createJ1939ExampleLog } from "./j1939/example";
import {
  DM1_PGN,
  analyzeJ1939Log,
  decodeDm1Payload,
  parseJ1939Identifier,
  pgnHex,
  sourceAddressName,
  type Dm1Snapshot,
  type DtcTimeline,
  type EcuSummary,
  type J1939Analysis,
  type LampState,
  type SpnKnowledge,
} from "./j1939/j1939";
import "./j1939-dtc-analyzer.css";

type View = "diagnosis" | "network" | "manual" | "dictionary";

type ReportMetadata = {
  machineModel: string;
  serialNumber: string;
  testLocation: string;
  technician: string;
  generalNote: string;
};

const copy = {
  tr: {
    title: "J1939 DM1 / DTC Analyzer",
    subtitle: "Motor CAN trace’inden arıza teşhisi",
    back: "Engineering Tools",
    privacy: "Dosyalar tarayıcınızda işlenir · Sunucuya yüklenmez",
    loadTrace: "Trace Dosyası Yükle ve Teşhis Et",
    loadTraceShort: "Trace yükle",
    traceFormats: "PEAK TRC · Vector ASC · CSV · SocketCAN LOG",
    traceHelp:
      "Motor CAN hattından aldığınız kaydı bırakın. DM1, çok paketli TP mesajları ve ECU adresleri otomatik analiz edilir.",
    heroPoints: [
      "DM1 + lamba durumu",
      "BAM / TP.DT birleştirme",
      "Arıza anı motor verileri",
      "Zaman çizgili PDF raporu",
    ],
    drop: "Dosyayı buraya bırakın",
    choose: "Dosya seç",
    sample: "Örnek J1939 kaydını aç",
    openDbc: "DBC yükle",
    dbcLoaded: "DBC yüklendi",
    openDictionary: "SPN sözlüğü",
    report: "Rapor / PDF",
    clear: "Yeni analiz",
    diagnosis: "Teşhis",
    network: "ECU / PGN",
    manual: "Tek Mesaj",
    dictionary: "SPN Sözlüğü",
    active: "Son DM1’de aktif",
    inactive: "Pasif",
    intermittent: "Aralıklı",
    noFault: "Aktif arıza bulunamadı",
    noFaultText:
      "Trace içinde geçerli DM1 mesajları bulundu ancak aktif DTC kaydı yok. Lamba ve ECU bilgileri yine de rapora alınabilir.",
    noDm1: "DM1 mesajı bulunamadı",
    noDm1Text:
      "Kayıtta J1939 trafiği olabilir fakat PGN 65226 tespit edilmedi. Doğru motor CAN kanalını ve 29-bit extended kayıt ayarını kontrol edin.",
    logFrames: "Toplam frame",
    j1939Frames: "J1939 frame",
    dm1Snapshots: "DM1 görüntüsü",
    uniqueDtc: "Benzersiz DTC",
    ecuCount: "ECU",
    tpIssues: "TP uyarısı",
    file: "Trace dosyası",
    format: "Format",
    duration: "Kayıt süresi",
    dbc: "DBC",
    notLoaded: "Yüklenmedi",
    localOnly: "Yerel kullanım",
    faults: "Arıza kayıtları",
    firstSeen: "İlk görülme",
    lastSeen: "Son görülme",
    status: "Durum",
    source: "Kaynak",
    count: "DM1 sayısı",
    occurrence: "OC",
    detail: "Arıza ayrıntısı",
    fmi: "FMI açıklaması",
    cm: "SPN dönüşümü",
    cmCurrent: "CM 0 · Güncel yöntem · otomatik",
    cmLegacy: "CM 1 · Legacy yöntem · otomatik",
    legacyWarning:
      "Legacy CM biti eski üç düzeni tek başına ayırmaz. DBC/sözlük eşleşmesiyle otomatik seçim yapıldı; kesinleşmeyen adaylar teknik ayrıntıda korunur.",
    candidates: "Legacy SPN adayları",
    rawDtc: "Ham DTC byte’ları",
    lamps: "Lamba durumu",
    lampMil: "MIL",
    lampRed: "Kırmızı stop",
    lampAmber: "Sarı ikaz",
    lampProtect: "Koruma",
    commandOff: "Kapalı",
    commandOn: "Açık",
    commandSpecial: "Özel / ayrılmış",
    commandUnavailable: "Mevcut değil",
    slowFlash: "Yavaş yanıp sönme",
    fastFlash: "Hızlı yanıp sönme",
    classC: "Class C / ayrılmış",
    noFlash: "Yanıp sönme yok",
    intervals: "Aktiflik zaman çizgisi",
    contextTitle: "Arıza anı motor görüntüsü",
    contextText:
      "İlk aktiflik anından önceki en yakın geçerli değerler. Çok eski değerler rapora alınmaz.",
    contextMissing: "Çalışma verileri için DBC yükleyin",
    contextMissingText:
      "DM1 çözümü DBC gerektirmez. Motor saati, devir, tork, sıcaklık ve basınç gibi arıza anı değerleri için kendi lisanslı J1939 DBC dosyanızı yükleyin.",
    noPublished: "Bu kayıtta yayınlanmadı",
    charts: "Arıza öncesi / sonrası sinyal grafikleri",
    chartsText: "Arızadan 30 saniye önce ve 30 saniye sonraki DBC sinyalleri.",
    evidence: "Ham CAN kanıtı",
    evidenceText: "Seçilen DTC’yi ilk taşıyan tamamlanmış DM1 kaydı.",
    serviceNote: "Servis notu",
    servicePlaceholder: "Kontrol sonucu, gözlem, yapılan işlem veya parça notu…",
    pgns: "PGN sayısı",
    frames: "Frame",
    ecuName: "ECU adı",
    address: "Source Address",
    discovered: "Trace içinde keşfedilen J1939 kaynakları",
    discoveredText:
      "PGN eşleşmesi mesajın işlevini, Source Address ise mesajı gönderen kontrol ünitesini belirtir. ECU adlarını rapor için düzenleyebilirsiniz.",
    pgnList: "Yayınlanan PGN’ler",
    manualTitle: "Tek DM1 mesajını çözümle",
    manualText: "CAN ID ve sekiz data byte girin. CM kullanıcı seçimi olmadan mesajdan okunur.",
    canId: "29-bit CAN ID",
    dataBytes: "Data byte’ları",
    invalidId: "Geçerli bir 29-bit CAN ID girin.",
    invalidData: "En az iki, en fazla sekiz HEX byte girin.",
    notDm1: "Girilen mesaj DM1 / PGN 65226 değil.",
    priority: "Priority",
    pgn: "PGN",
    destination: "Hedef",
    broadcast: "Broadcast",
    byteMap: "Byte ve bit açıklaması",
    dictTitle: "Güncellenebilir SPN sözlüğü",
    dictText:
      "CSV veya Excel dosyanızdaki SPN adlarını, muhtemel nedenleri, kontrol noktalarını ve servis notlarını rapora ekleyin.",
    dictUpload: "CSV / Excel yükle",
    dictRows: "SPN kaydı",
    dictStored: "Bu tarayıcıda saklanıyor",
    dictClear: "Sözlüğü temizle",
    dictEmpty: "Henüz özel SPN sözlüğü yüklenmedi.",
    dictColumns:
      "Önerilen başlıklar: SPN, Name_TR, Name_EN, Cause_TR, Cause_EN, Check_TR, Check_EN, Service_Note",
    reportTitle: "J1939 DM1 / DTC Teşhis Raporu",
    reportConfigure: "Teşhis raporunu yapılandır",
    reportText:
      "Makine bilgilerini ve rapora girecek arızaları seçin. En fazla 12 ayrıntılı arıza sayfası oluşturulur.",
    machineModel: "Makine modeli",
    serialNumber: "Seri numarası",
    testLocation: "Test yeri",
    technician: "Teknisyen / uzman",
    generalNote: "Genel not",
    selectFaults: "Ayrıntılı arızalar",
    selected: "seçili",
    cancel: "Vazgeç",
    generate: "PDF raporunu aç",
    overview: "Analiz özeti",
    dtcSummary: "DTC özeti",
    networkSummary: "ECU ve ağ özeti",
    detailedFindings: "Ayrıntılı bulgular",
    generatedBy: "ALGO TEAM · Engineering Tools",
    disclaimer:
      "Bu rapor bilgi amaçlı bir teşhis yardımcısıdır. Üretici servis prosedürleri ve güvenlik talimatlarının yerini almaz.",
    printHint: "Yazdırma penceresinde “PDF olarak kaydet” seçilebilir.",
    close: "Kapat",
    error: "Dosya işlenemedi.",
    dictionaryLoaded: "SPN sözlüğü yüklendi.",
    transferred: "CAN Log Analyzer’daki kayıt aktarıldı.",
    sourceLine: "Kaynak satır",
    transport: "Taşıma",
    single: "Tek frame",
    bam: "BAM / TP",
    rts: "RTS/CTS / TP",
    noContextGraph: "Bu zaman aralığında çizilebilecek DBC sinyali bulunamadı.",
  },
  en: {
    title: "J1939 DM1 / DTC Analyzer",
    subtitle: "Fault diagnosis from an engine CAN trace",
    back: "Engineering Tools",
    privacy: "Files are processed in your browser · Nothing is uploaded",
    loadTrace: "Load Trace File and Diagnose",
    loadTraceShort: "Load trace",
    traceFormats: "PEAK TRC · Vector ASC · CSV · SocketCAN LOG",
    traceHelp:
      "Drop a capture from the engine CAN bus. DM1, multi-packet TP traffic, and ECU addresses are analyzed automatically.",
    heroPoints: [
      "DM1 + lamp states",
      "BAM / TP.DT reassembly",
      "Engine data at fault onset",
      "Timeline-based PDF report",
    ],
    drop: "Drop the file here",
    choose: "Choose file",
    sample: "Open sample J1939 capture",
    openDbc: "Load DBC",
    dbcLoaded: "DBC loaded",
    openDictionary: "SPN dictionary",
    report: "Report / PDF",
    clear: "New analysis",
    diagnosis: "Diagnosis",
    network: "ECU / PGN",
    manual: "Single Message",
    dictionary: "SPN Dictionary",
    active: "Active in last DM1",
    inactive: "Inactive",
    intermittent: "Intermittent",
    noFault: "No active fault found",
    noFaultText:
      "Valid DM1 messages were found but no active DTC is present. Lamp and ECU information can still be included in the report.",
    noDm1: "No DM1 message found",
    noDm1Text:
      "The capture may contain J1939 traffic, but PGN 65226 was not detected. Check the engine CAN channel and 29-bit extended recording setting.",
    logFrames: "Total frames",
    j1939Frames: "J1939 frames",
    dm1Snapshots: "DM1 snapshots",
    uniqueDtc: "Unique DTCs",
    ecuCount: "ECUs",
    tpIssues: "TP issues",
    file: "Trace file",
    format: "Format",
    duration: "Capture duration",
    dbc: "DBC",
    notLoaded: "Not loaded",
    localOnly: "Local use",
    faults: "Fault records",
    firstSeen: "First seen",
    lastSeen: "Last seen",
    status: "Status",
    source: "Source",
    count: "DM1 count",
    occurrence: "OC",
    detail: "Fault detail",
    fmi: "FMI description",
    cm: "SPN conversion",
    cmCurrent: "CM 0 · Current method · automatic",
    cmLegacy: "CM 1 · Legacy method · automatic",
    legacyWarning:
      "The legacy CM bit does not identify one of the three old layouts by itself. The tool resolves it using the DBC/dictionary when possible and retains uncertain candidates in the technical detail.",
    candidates: "Legacy SPN candidates",
    rawDtc: "Raw DTC bytes",
    lamps: "Lamp state",
    lampMil: "MIL",
    lampRed: "Red stop",
    lampAmber: "Amber warning",
    lampProtect: "Protect",
    commandOff: "Off",
    commandOn: "On",
    commandSpecial: "Special / reserved",
    commandUnavailable: "Unavailable",
    slowFlash: "Slow flash",
    fastFlash: "Fast flash",
    classC: "Class C / reserved",
    noFlash: "No flash",
    intervals: "Active-state timeline",
    contextTitle: "Engine snapshot at fault onset",
    contextText:
      "Nearest valid values at or before first activation. Stale values are excluded.",
    contextMissing: "Load a DBC for operating context",
    contextMissingText:
      "DM1 decoding does not require a DBC. Load your licensed J1939 DBC to add engine hours, speed, torque, temperatures, and pressures at fault onset.",
    noPublished: "Not published in this capture",
    charts: "Signal charts before / after the fault",
    chartsText: "DBC signals from 30 seconds before to 30 seconds after fault onset.",
    evidence: "Raw CAN evidence",
    evidenceText: "The first complete DM1 record carrying the selected DTC.",
    serviceNote: "Service note",
    servicePlaceholder: "Inspection result, observation, action, or part note…",
    pgns: "PGNs",
    frames: "Frames",
    ecuName: "ECU name",
    address: "Source Address",
    discovered: "J1939 sources discovered in the trace",
    discoveredText:
      "PGN identifies message function; Source Address identifies the transmitting controller. ECU names can be edited for the report.",
    pgnList: "Published PGNs",
    manualTitle: "Decode a single DM1 message",
    manualText: "Enter a CAN ID and eight data bytes. CM is read from the message automatically.",
    canId: "29-bit CAN ID",
    dataBytes: "Data bytes",
    invalidId: "Enter a valid 29-bit CAN ID.",
    invalidData: "Enter between two and eight HEX bytes.",
    notDm1: "The entered message is not DM1 / PGN 65226.",
    priority: "Priority",
    pgn: "PGN",
    destination: "Destination",
    broadcast: "Broadcast",
    byteMap: "Byte and bit explanation",
    dictTitle: "Updatable SPN dictionary",
    dictText:
      "Add SPN names, possible causes, checks, and service notes from your CSV or Excel file.",
    dictUpload: "Load CSV / Excel",
    dictRows: "SPN records",
    dictStored: "Stored in this browser",
    dictClear: "Clear dictionary",
    dictEmpty: "No custom SPN dictionary has been loaded.",
    dictColumns:
      "Suggested columns: SPN, Name_TR, Name_EN, Cause_TR, Cause_EN, Check_TR, Check_EN, Service_Note",
    reportTitle: "J1939 DM1 / DTC Diagnostic Report",
    reportConfigure: "Configure diagnostic report",
    reportText:
      "Enter machine details and choose faults for the detailed section. Up to 12 detailed fault pages are generated.",
    machineModel: "Machine model",
    serialNumber: "Serial number",
    testLocation: "Test location",
    technician: "Technician / specialist",
    generalNote: "General note",
    selectFaults: "Detailed faults",
    selected: "selected",
    cancel: "Cancel",
    generate: "Open PDF report",
    overview: "Analysis overview",
    dtcSummary: "DTC summary",
    networkSummary: "ECU and network summary",
    detailedFindings: "Detailed findings",
    generatedBy: "ALGO TEAM · Engineering Tools",
    disclaimer:
      "This report is an informational diagnostic aid. It does not replace manufacturer service procedures or safety instructions.",
    printHint: "Choose “Save as PDF” in the print dialog.",
    close: "Close",
    error: "The file could not be processed.",
    dictionaryLoaded: "SPN dictionary loaded.",
    transferred: "Capture transferred from CAN Log Analyzer.",
    sourceLine: "Source line",
    transport: "Transport",
    single: "Single frame",
    bam: "BAM / TP",
    rts: "RTS/CTS / TP",
    noContextGraph: "No DBC signal can be charted in this time range.",
  },
} as const;

const CHART_COLORS = ["#49e3a6", "#59b9ff", "#ffb454", "#e987ff", "#ff6c79", "#a5df63"];
const MAX_REPORT_FAULTS = 12;

function formatDuration(milliseconds: number): string {
  const totalSeconds = Math.max(0, milliseconds) / 1000;
  if (totalSeconds < 60) return `${totalSeconds.toFixed(totalSeconds < 10 ? 2 : 1)} s`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds - minutes * 60;
  if (minutes < 60) return `${minutes} min ${seconds.toFixed(0)} s`;
  const hours = Math.floor(minutes / 60);
  return `${hours} h ${minutes % 60} min`;
}

function formatTime(milliseconds: number): string {
  const value = Math.max(0, milliseconds);
  const minutes = Math.floor(value / 60_000);
  const seconds = Math.floor((value % 60_000) / 1000);
  const millis = Math.floor(value % 1000);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(millis).padStart(3, "0")}`;
}

function formatValue(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const magnitude = Math.abs(value);
  if (magnitude >= 1000) return value.toLocaleString(undefined, { maximumFractionDigits: 1 });
  if (magnitude >= 10) return value.toFixed(1).replace(/\.0$/, "");
  return value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

function parseManualId(value: string): number | null {
  const clean = value.trim().replace(/^16#/i, "").replace(/^0x/i, "");
  if (!/^[0-9a-fA-F]{1,8}$/.test(clean)) return null;
  const parsed = Number.parseInt(clean, 16);
  return parsed >= 0 && parsed <= 0x1fffffff ? parsed : null;
}

function parseManualData(value: string): number[] | null {
  const tokens = value.trim().split(/[\s,;:-]+/).filter(Boolean);
  if (tokens.length < 2 || tokens.length > 8) return null;
  if (tokens.some((token) => !/^(?:0x)?[0-9a-fA-F]{2}$/.test(token))) return null;
  return tokens.map((token) => Number.parseInt(token.replace(/^0x/i, ""), 16));
}

function knowledgeName(
  knowledge: ReadonlyMap<number, SpnKnowledge>,
  spn: number,
  language: Language,
): string {
  const item = knowledge.get(spn);
  return (language === "tr" ? item?.nameTr || item?.nameEn : item?.nameEn || item?.nameTr)
    || `SPN ${spn}`;
}

function timelineStatus(timeline: DtcTimeline, language: Language): string {
  const t = copy[language];
  if (timeline.activeAtEnd) return t.active;
  if (timeline.intervals.length > 1) return t.intermittent;
  return t.inactive;
}

function lampLabels(lamp: LampState, language: Language) {
  const t = copy[language];
  const names = {
    mil: t.lampMil,
    redStop: t.lampRed,
    amberWarning: t.lampAmber,
    protect: t.lampProtect,
  };
  const commands = [t.commandOff, t.commandOn, t.commandSpecial, t.commandUnavailable];
  const flashes = [t.slowFlash, t.fastFlash, t.classC, t.noFlash];
  return {
    name: names[lamp.key],
    command: commands[lamp.command],
    flash: flashes[lamp.flash],
  };
}

function downsample<T>(values: T[], limit: number): T[] {
  if (values.length <= limit) return values;
  const output: T[] = [];
  const step = (values.length - 1) / (limit - 1);
  for (let index = 0; index < limit; index += 1) {
    output.push(values[Math.round(index * step)]);
  }
  return output;
}

function SignalChart({
  series,
  faultTime,
  compact = false,
}: {
  series: ContextSeries[];
  faultTime: number;
  compact?: boolean;
}) {
  if (!series.length) return null;
  const width = 920;
  const height = compact ? 210 : 270;
  const padding = { left: 46, right: 18, top: 18, bottom: 30 };
  const allPoints = series.flatMap((item) => item.points);
  const minX = Math.min(...allPoints.map((point) => point.timestampMs));
  const maxX = Math.max(...allPoints.map((point) => point.timestampMs));
  const xRange = Math.max(1, maxX - minX);
  const x = (value: number) =>
    padding.left + ((value - minX) / xRange) * (width - padding.left - padding.right);

  return (
    <div className={`jda-chart ${compact ? "jda-chart--compact" : ""}`}>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Fault context signal chart">
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = padding.top + ratio * (height - padding.top - padding.bottom);
          return <line className="jda-chart-grid" key={ratio} x1={padding.left} x2={width - padding.right} y1={y} y2={y} />;
        })}
        <line
          className="jda-chart-fault"
          x1={x(faultTime)}
          x2={x(faultTime)}
          y1={padding.top}
          y2={height - padding.bottom}
        />
        <text className="jda-chart-fault-label" x={Math.min(width - 72, x(faultTime) + 6)} y={padding.top + 10}>DTC</text>
        {series.map((item, seriesIndex) => {
          const points = downsample(item.points, 420);
          const values = points.map((point) => point.value);
          const minimum = Math.min(...values);
          const maximum = Math.max(...values);
          const range = Math.max(1e-9, maximum - minimum);
          const y = (value: number) =>
            padding.top + (1 - (value - minimum) / range) * (height - padding.top - padding.bottom);
          const path = points
            .map((point, index) => `${index ? "L" : "M"} ${x(point.timestampMs).toFixed(2)} ${y(point.value).toFixed(2)}`)
            .join(" ");
          return (
            <path
              className="jda-chart-line"
              d={path}
              key={item.key}
              style={{ stroke: CHART_COLORS[seriesIndex % CHART_COLORS.length] }}
            />
          );
        })}
        <text className="jda-chart-axis" x={padding.left} y={height - 8}>
          {((minX - faultTime) / 1000).toFixed(0)} s
        </text>
        <text className="jda-chart-axis" textAnchor="end" x={width - padding.right} y={height - 8}>
          +{((maxX - faultTime) / 1000).toFixed(0)} s
        </text>
      </svg>
      <div className="jda-chart-legend">
        {series.map((item, index) => {
          const values = item.points.map((point) => point.value);
          return (
            <span key={item.key}>
              <i style={{ background: CHART_COLORS[index % CHART_COLORS.length] }} />
              <strong>{item.signalName}</strong>
              <small>
                {formatValue(Math.min(...values))}–{formatValue(Math.max(...values))} {item.unit}
              </small>
            </span>
          );
        })}
      </div>
    </div>
  );
}

function LampStrip({ lamps, language }: { lamps: LampState[]; language: Language }) {
  return (
    <div className="jda-lamps">
      {lamps.map((lamp) => {
        const labels = lampLabels(lamp, language);
        return (
          <article
            className={`jda-lamp jda-lamp--${lamp.key} ${lamp.command === 1 ? "is-on" : ""}`}
            key={lamp.key}
          >
            <i />
            <div>
              <strong>{labels.name}</strong>
              <span>{labels.command}</span>
              {lamp.command === 1 && <small>{labels.flash}</small>}
            </div>
          </article>
        );
      })}
    </div>
  );
}

function TimelineBar({
  timeline,
  captureStartMs,
  durationMs,
}: {
  timeline: DtcTimeline;
  captureStartMs: number;
  durationMs: number;
}) {
  const safeDuration = Math.max(1, durationMs);
  return (
    <div className="jda-timeline-bar">
      {timeline.intervals.map((interval, index) => {
        const end = interval.endMs ?? captureStartMs + durationMs;
        const relativeStart = interval.startMs - captureStartMs;
        const left = Math.max(0, Math.min(100, (relativeStart / safeDuration) * 100));
        const width = Math.max(0.6, Math.min(100 - left, ((end - interval.startMs) / safeDuration) * 100));
        return (
          <i
            key={`${interval.startMs}-${index}`}
            style={{ left: `${left}%`, width: `${width}%` }}
          />
        );
      })}
      <span className="jda-timeline-start">0</span>
      <span className="jda-timeline-end">{formatDuration(durationMs)}</span>
    </div>
  );
}

function ManualDecoder({
  language,
  knownSpns,
  knowledge,
}: {
  language: Language;
  knownSpns: ReadonlySet<number>;
  knowledge: ReadonlyMap<number, SpnKnowledge>;
}) {
  const t = copy[language];
  const [idText, setIdText] = useState("18FECA00");
  const [dataText, setDataText] = useState("04 FF 00 54 8B 81 FF FF");
  const decoded = useMemo(() => {
    const id = parseManualId(idText);
    const data = parseManualData(dataText);
    if (id === null) return { error: t.invalidId };
    if (!data) return { error: t.invalidData };
    const identifier = parseJ1939Identifier(id);
    if (!identifier) return { error: t.invalidId };
    const dm1 = decodeDm1Payload(data, knownSpns);
    return { id, data, identifier, dm1 };
  }, [dataText, idText, knownSpns, t.invalidData, t.invalidId]);

  return (
    <section className="jda-panel jda-manual">
      <div className="jda-section-heading">
        <span>DM1 / 0xFECA</span>
        <h2>{t.manualTitle}</h2>
        <p>{t.manualText}</p>
      </div>
      <div className="jda-manual-inputs">
        <label>
          <span>{t.canId}</span>
          <input value={idText} onChange={(event) => setIdText(event.target.value)} spellCheck={false} />
        </label>
        <label>
          <span>{t.dataBytes}</span>
          <input value={dataText} onChange={(event) => setDataText(event.target.value)} spellCheck={false} />
        </label>
      </div>
      {"error" in decoded ? (
        <div className="jda-empty jda-empty--small"><strong>{decoded.error}</strong></div>
      ) : (
        <>
          {decoded.identifier.pgn !== DM1_PGN && (
            <div className="jda-warning">{t.notDm1}</div>
          )}
          <div className="jda-id-grid">
            <article><span>{t.priority}</span><strong>{decoded.identifier.priority}</strong></article>
            <article><span>{t.pgn}</span><strong>{decoded.identifier.pgn} / {pgnHex(decoded.identifier.pgn)}</strong></article>
            <article><span>{t.source}</span><strong>0x{decoded.identifier.sourceAddress.toString(16).toUpperCase().padStart(2, "0")}</strong></article>
            <article><span>{t.destination}</span><strong>{decoded.identifier.destinationAddress === null ? t.broadcast : `0x${decoded.identifier.destinationAddress.toString(16).toUpperCase().padStart(2, "0")}`}</strong></article>
          </div>
          <LampStrip lamps={decoded.dm1.lamps} language={language} />
          <div className="jda-manual-dtcs">
            {decoded.dm1.dtcs.length ? decoded.dm1.dtcs.map((dtc, index) => {
              const fmi = fmiDefinition(dtc.fmi);
              return (
                <article key={`${dtc.spn}-${dtc.fmi}-${index}`}>
                  <span>DTC {index + 1}</span>
                  <h3>SPN {dtc.spn} · FMI {dtc.fmi}</h3>
                  <p>{knowledgeName(knowledge, dtc.spn, language)}</p>
                  <dl>
                    <div><dt>{t.fmi}</dt><dd>{language === "tr" ? fmi.tr : fmi.en}</dd></div>
                    <div><dt>{t.occurrence}</dt><dd>{dtc.occurrenceCount ?? "N/A"}</dd></div>
                    <div><dt>{t.cm}</dt><dd>{dtc.conversionMethod === 0 ? t.cmCurrent : t.cmLegacy}</dd></div>
                    <div><dt>{t.rawDtc}</dt><dd><code>{formatData(dtc.raw)}</code></dd></div>
                  </dl>
                  {dtc.legacyAmbiguous && <div className="jda-warning">{t.legacyWarning}<br />{t.candidates}: {dtc.legacyCandidates.join(", ")}</div>}
                </article>
              );
            }) : (
              <div className="jda-empty jda-empty--small"><strong>{t.noFault}</strong></div>
            )}
          </div>
          <div className="jda-byte-map">
            <h3>{t.byteMap}</h3>
            <div>
              {decoded.data.map((byte, index) => (
                <article className={`byte-${index + 1}`} key={index}>
                  <span>B{index + 1}</span>
                  <strong>{byte.toString(16).toUpperCase().padStart(2, "0")}</strong>
                  <small>
                    {index === 0 ? t.lamps
                      : index === 1 ? `${t.lamps} · flash`
                        : index === 2 ? "SPN LSB"
                          : index === 3 ? "SPN"
                            : index === 4 ? "SPN MSB + FMI"
                              : index === 5 ? "CM + OC"
                                : "Padding"}
                  </small>
                </article>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default function J1939DtcAnalyzer() {
  const [language, setLanguage] = useState<Language>("tr");
  const [view, setView] = useState<View>("diagnosis");
  const [log, setLog] = useState<ParsedLog | null>(null);
  const [database, setDatabase] = useState<DbcDatabase | null>(null);
  const [dbcText, setDbcText] = useState("");
  const [dbcName, setDbcName] = useState("");
  const [dictionary, setDictionary] = useState<SpnKnowledge[]>(() => loadStoredDictionary());
  const [selectedTimelineKey, setSelectedTimelineKey] = useState("");
  const [ecuNames, setEcuNames] = useState<Record<string, string>>({});
  const [dtcNotes, setDtcNotes] = useState<Record<string, string>>({});
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportFaultKeys, setReportFaultKeys] = useState<string[]>([]);
  const [metadata, setMetadata] = useState<ReportMetadata>({
    machineModel: "",
    serialNumber: "",
    testLocation: "",
    technician: "",
    generalNote: "",
  });
  const traceInputRef = useRef<HTMLInputElement>(null);
  const dbcInputRef = useRef<HTMLInputElement>(null);
  const dictionaryInputRef = useRef<HTMLInputElement>(null);
  const t = copy[language];
  const captureStartMs = log?.frames[0]?.timestampMs ?? 0;
  const traceTime = (timestampMs: number) => formatTime(timestampMs - captureStartMs);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const parameters = new URLSearchParams(window.location.search);
    if (parameters.get("from") !== "can-log-analyzer") return;
    loadTransferredCanLog().then((record) => {
      if (!record) return;
      try {
        const parsed = parseCanLog(record.text, record.name);
        setLog(parsed);
        setToast(t.transferred);
      } catch {
        setError(t.error);
      }
    }).catch(() => undefined);
  }, [t.error, t.transferred]);

  const dbcContext = useMemo<DbcContext | null>(() => {
    if (!log || !database || !dbcText) return null;
    return decodeDbcContext(log, database, dbcText);
  }, [database, dbcText, log]);

  const knowledge = useMemo(
    () => mergeKnowledge(dbcContext?.knowledge ?? new Map(), dictionary),
    [dbcContext, dictionary],
  );
  const knownSpns = useMemo(() => new Set(knowledge.keys()), [knowledge]);
  const analysis = useMemo<J1939Analysis | null>(
    () => log ? analyzeJ1939Log(log, knownSpns) : null,
    [knownSpns, log],
  );

  const selectedTimeline = useMemo(() => {
    if (!analysis?.timelines.length) return null;
    return analysis.timelines.find((item) => item.key === selectedTimelineKey)
      ?? analysis.timelines[0];
  }, [analysis, selectedTimelineKey]);

  useEffect(() => {
    if (!analysis?.timelines.length) {
      setSelectedTimelineKey("");
      return;
    }
    if (!analysis.timelines.some((item) => item.key === selectedTimelineKey)) {
      setSelectedTimelineKey(analysis.timelines[0].key);
    }
  }, [analysis, selectedTimelineKey]);

  useEffect(() => {
    if (!analysis) return;
    setEcuNames((current) => {
      const next = { ...current };
      analysis.ecus.forEach((ecu) => {
        if (!next[ecu.key]) next[ecu.key] = ecu.defaultName;
      });
      return next;
    });
  }, [analysis]);

  const selectedSnapshot = useMemo<Dm1Snapshot | null>(() => {
    if (!analysis || !selectedTimeline) return null;
    const firstUid = selectedTimeline.intervals[0]?.firstSnapshotUid;
    return analysis.snapshots.find((item) => item.uid === firstUid) ?? null;
  }, [analysis, selectedTimeline]);

  const selectedContextValues = useMemo(
    () => selectedTimeline ? contextSnapshotAt(dbcContext, selectedTimeline) : [],
    [dbcContext, selectedTimeline],
  );
  const selectedContextSeries = useMemo(
    () => selectedTimeline ? contextSeriesAround(dbcContext, selectedTimeline) : [],
    [dbcContext, selectedTimeline],
  );

  const selectedReportTimelines = useMemo(() => {
    if (!analysis) return [];
    const selected = new Set(reportFaultKeys);
    return analysis.timelines.filter((timeline) => selected.has(timeline.key));
  }, [analysis, reportFaultKeys]);

  const processTraceText = (text: string, name: string) => {
    try {
      const parsed = parseCanLog(text, name);
      setLog(parsed);
      setError("");
      setView("diagnosis");
      setDtcNotes({});
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t.error);
    }
  };

  const loadTraceFile = async (file: File) => {
    processTraceText(await file.text(), file.name);
  };

  const onTraceChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) await loadTraceFile(file);
    event.target.value = "";
  };

  const onDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) await loadTraceFile(file);
  };

  const onDbcChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = parseDbc(text, file.name);
      setDatabase(parsed);
      setDbcText(text);
      setDbcName(file.name);
      setToast(t.dbcLoaded);
      setError("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t.error);
    }
    event.target.value = "";
  };

  const onDictionaryChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const items = await readSpnDictionary(file);
      setDictionary(items);
      storeDictionary(items);
      setToast(`${t.dictionaryLoaded} ${items.length} ${t.dictRows.toLocaleLowerCase()}.`);
      setError("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t.error);
    }
    event.target.value = "";
  };

  const resetAnalysis = () => {
    setLog(null);
    setSelectedTimelineKey("");
    setError("");
    setView("diagnosis");
  };

  const openReportDialog = () => {
    if (!analysis) return;
    setReportFaultKeys(
      analysis.timelines.slice(0, MAX_REPORT_FAULTS).map((timeline) => timeline.key),
    );
    setReportDialogOpen(true);
  };

  const toggleReportFault = (key: string) => {
    setReportFaultKeys((current) => {
      if (current.includes(key)) return current.filter((item) => item !== key);
      if (current.length >= MAX_REPORT_FAULTS) return current;
      return [...current, key];
    });
  };

  const printReport = () => {
    setReportDialogOpen(false);
    window.setTimeout(() => window.print(), 80);
  };

  const ecuLabel = (channel: string, sourceAddress: number) =>
    ecuNames[`${channel}:${sourceAddress}`]
    || sourceAddressName(sourceAddress);

  return (
    <main className="jda-app">
      <input ref={traceInputRef} hidden type="file" accept=".trc,.asc,.csv,.log,.txt,text/plain" onChange={onTraceChange} />
      <input ref={dbcInputRef} hidden type="file" accept=".dbc,text/plain" onChange={onDbcChange} />
      <input ref={dictionaryInputRef} hidden type="file" accept=".csv,.xlsx,.xls,text/csv" onChange={onDictionaryChange} />

      <header className="jda-header">
        <a className="jda-brand" href="/">
          <span>BT</span>
          <div><strong>{t.back}</strong><small>Engineering Tools</small></div>
        </a>
        <div className="jda-title">
          <span>J1939 · PGN 65226 · DM1</span>
          <strong>{t.title}</strong>
        </div>
        <div className="jda-header-actions">
          {log && (
            <>
              <button type="button" onClick={() => dbcInputRef.current?.click()} className={database ? "is-ready" : ""}>
                <span>DBC</span>{database ? dbcName : t.openDbc}
              </button>
              <button type="button" onClick={openReportDialog}>{t.report}<b>↗</b></button>
            </>
          )}
          <div className="jda-language">
            <button className={language === "tr" ? "active" : ""} onClick={() => setLanguage("tr")} type="button">TR</button>
            <span>/</span>
            <button className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")} type="button">EN</button>
          </div>
        </div>
      </header>

      {!log ? (
        <section className="jda-landing">
          <div className="jda-hero-copy">
            <p className="jda-kicker">READ-ONLY · CLIENT-SIDE · J1939-73</p>
            <h1>{t.loadTrace}</h1>
            <p>{t.traceHelp}</p>
            <div className="jda-hero-points">
              {t.heroPoints.map((point) => <span key={point}><i />{point}</span>)}
            </div>
          </div>
          <div
            className={`jda-drop-zone ${dragging ? "is-dragging" : ""}`}
            onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
          >
            <div className="jda-drop-icon"><span>CAN</span><i /><i /><i /></div>
            <span>{t.drop}</span>
            <strong>{t.traceFormats}</strong>
            <button type="button" onClick={() => traceInputRef.current?.click()}>{t.choose}<b>→</b></button>
            <button className="jda-sample-button" type="button" onClick={() => setLog(createJ1939ExampleLog())}>
              {t.sample}
            </button>
          </div>
          <div className="jda-privacy-note"><i />{t.privacy}</div>
          <div className="jda-workflow" aria-hidden="true">
            <span>01</span><strong>TRACE</strong><i />
            <span>02</span><strong>DM1 / TP</strong><i />
            <span>03</span><strong>SPN · FMI · OC</strong><i />
            <span>04</span><strong>REPORT</strong>
          </div>
        </section>
      ) : (
        <>
          <section className="jda-summary-strip">
            <div className="jda-file-meta">
              <span>TRACE / {log.format.toUpperCase()}</span>
              <strong>{log.name}</strong>
              <small>{log.formatLabel} · {formatDuration(log.durationMs)}</small>
            </div>
            <div className="jda-kpis">
              <article><span>{t.logFrames}</span><strong>{log.frames.length.toLocaleString()}</strong></article>
              <article><span>{t.j1939Frames}</span><strong>{analysis?.j1939FrameCount.toLocaleString() ?? 0}</strong></article>
              <article><span>{t.dm1Snapshots}</span><strong>{analysis?.snapshots.length.toLocaleString() ?? 0}</strong></article>
              <article><span>{t.uniqueDtc}</span><strong>{analysis?.timelines.length.toLocaleString() ?? 0}</strong></article>
              <article><span>{t.ecuCount}</span><strong>{analysis?.ecus.length.toLocaleString() ?? 0}</strong></article>
              <article className={analysis?.transportIssues.length ? "has-warning" : ""}><span>{t.tpIssues}</span><strong>{analysis?.transportIssues.length.toLocaleString() ?? 0}</strong></article>
            </div>
            <button className="jda-reset" type="button" onClick={resetAnalysis}>{t.clear} ×</button>
          </section>

          <nav className="jda-tabs" aria-label="Analyzer sections">
            {([
              ["diagnosis", t.diagnosis],
              ["network", t.network],
              ["manual", t.manual],
              ["dictionary", t.dictionary],
            ] as Array<[View, string]>).map(([key, label]) => (
              <button className={view === key ? "active" : ""} key={key} onClick={() => setView(key)} type="button">
                {label}
                {key === "diagnosis" && <span>{analysis?.timelines.length ?? 0}</span>}
              </button>
            ))}
          </nav>

          <div className="jda-workspace">
            {view === "diagnosis" && analysis && (
              analysis.snapshots.length === 0 ? (
                <section className="jda-panel jda-empty">
                  <span>0xFECA</span><h2>{t.noDm1}</h2><p>{t.noDm1Text}</p>
                  <button type="button" onClick={() => traceInputRef.current?.click()}>{t.loadTraceShort}</button>
                </section>
              ) : analysis.timelines.length === 0 ? (
                <section className="jda-panel jda-empty">
                  <span>DM1</span><h2>{t.noFault}</h2><p>{t.noFaultText}</p>
                  {analysis.snapshots.at(-1) && <LampStrip lamps={analysis.snapshots.at(-1)!.lamps} language={language} />}
                </section>
              ) : (
                <div className="jda-diagnosis-grid">
                  <section className="jda-panel jda-fault-list">
                    <div className="jda-panel-heading">
                      <div><span>DM1 / DTC</span><h2>{t.faults}</h2></div>
                      <strong>{analysis.timelines.length}</strong>
                    </div>
                    <div className="jda-fault-table-head">
                      <span>SPN / FMI</span><span>{t.source}</span><span>{t.status}</span>
                    </div>
                    <div className="jda-fault-rows">
                      {analysis.timelines.map((timeline) => {
                        const fmi = fmiDefinition(timeline.fmi);
                        const selected = selectedTimeline?.key === timeline.key;
                        return (
                          <button
                            className={`${selected ? "active" : ""} severity-${fmi.severity}`}
                            key={timeline.key}
                            onClick={() => setSelectedTimelineKey(timeline.key)}
                            type="button"
                          >
                            <div>
                              <strong>SPN {timeline.spn} <i /> FMI {timeline.fmi}</strong>
                              <small>{knowledgeName(knowledge, timeline.spn, language)}</small>
                            </div>
                            <span>
                              {ecuLabel(timeline.channel, timeline.sourceAddress)}
                              <small>SA 0x{timeline.sourceAddress.toString(16).toUpperCase().padStart(2, "0")}</small>
                            </span>
                            <span className={timeline.activeAtEnd ? "is-active" : ""}>
                              {timelineStatus(timeline, language)}
                              <small>{traceTime(timeline.firstSeenMs)}</small>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  {selectedTimeline && (
                    <section className="jda-panel jda-fault-detail">
                      <div className="jda-detail-hero">
                        <div>
                          <span>{t.detail}</span>
                          <h2>SPN {selectedTimeline.spn} <i>/</i> FMI {selectedTimeline.fmi}</h2>
                          <p>{knowledgeName(knowledge, selectedTimeline.spn, language)}</p>
                        </div>
                        <div className={`jda-status-badge ${selectedTimeline.activeAtEnd ? "is-active" : ""}`}>
                          <i />{timelineStatus(selectedTimeline, language)}
                        </div>
                      </div>
                      <div className="jda-detail-facts">
                        <article><span>{t.source}</span><strong>{ecuLabel(selectedTimeline.channel, selectedTimeline.sourceAddress)}</strong><small>CH {selectedTimeline.channel} · SA 0x{selectedTimeline.sourceAddress.toString(16).toUpperCase().padStart(2, "0")}</small></article>
                        <article><span>{t.firstSeen}</span><strong>{traceTime(selectedTimeline.firstSeenMs)}</strong><small>{t.lastSeen}: {traceTime(selectedTimeline.lastSeenMs)}</small></article>
                        <article><span>{t.occurrence}</span><strong>{selectedTimeline.maxOccurrenceCount ?? "N/A"}</strong><small>{selectedTimeline.dm1Count} DM1</small></article>
                        <article><span>{t.cm}</span><strong>CM {selectedTimeline.conversionMethod}</strong><small>Version {selectedTimeline.conversionVersion} · auto</small></article>
                      </div>
                      <div className="jda-fmi-line">
                        <span>FMI {selectedTimeline.fmi}</span>
                        <strong>{language === "tr" ? fmiDefinition(selectedTimeline.fmi).tr : fmiDefinition(selectedTimeline.fmi).en}</strong>
                      </div>
                      {selectedTimeline.legacyAmbiguous && (
                        <div className="jda-warning">
                          <strong>{t.cmLegacy}</strong>
                          <p>{t.legacyWarning}</p>
                          <small>{t.candidates}: {selectedTimeline.legacyCandidates.join(", ")}</small>
                        </div>
                      )}
                      <div className="jda-subsection">
                        <div className="jda-subsection-title"><span>{t.intervals}</span><small>{selectedTimeline.intervals.length} ×</small></div>
                        <TimelineBar timeline={selectedTimeline} captureStartMs={captureStartMs} durationMs={log.durationMs} />
                      </div>
                      {selectedSnapshot && (
                        <div className="jda-subsection">
                          <div className="jda-subsection-title"><span>{t.lamps}</span><small>{traceTime(selectedSnapshot.timestampMs)}</small></div>
                          <LampStrip lamps={selectedSnapshot.lamps} language={language} />
                        </div>
                      )}
                      <div className="jda-subsection">
                        <div className="jda-subsection-title"><span>{t.contextTitle}</span><small>t = {traceTime(selectedTimeline.firstSeenMs)}</small></div>
                        <p className="jda-subsection-copy">{t.contextText}</p>
                        {!dbcContext ? (
                          <div className="jda-context-empty">
                            <span>DBC</span>
                            <div><strong>{t.contextMissing}</strong><p>{t.contextMissingText}</p></div>
                            <button type="button" onClick={() => dbcInputRef.current?.click()}>{t.openDbc}</button>
                          </div>
                        ) : selectedContextValues.length ? (
                          <div className="jda-context-grid">
                            {selectedContextValues.map((item) => (
                              <article key={item.key}>
                                <span>{item.signalName}</span>
                                <strong>{formatValue(item.value)} <small>{item.unit}</small></strong>
                                <small>{item.spn === null ? "DBC" : `SPN ${item.spn}`} · −{(item.ageMs / 1000).toFixed(1)} s</small>
                              </article>
                            ))}
                          </div>
                        ) : (
                          <div className="jda-empty jda-empty--small"><strong>{t.noPublished}</strong></div>
                        )}
                      </div>
                      <div className="jda-subsection">
                        <div className="jda-subsection-title"><span>{t.charts}</span><small>−30 s / +30 s</small></div>
                        <p className="jda-subsection-copy">{t.chartsText}</p>
                        {selectedContextSeries.length
                          ? <SignalChart series={selectedContextSeries} faultTime={selectedTimeline.firstSeenMs} />
                          : <div className="jda-empty jda-empty--small"><strong>{t.noContextGraph}</strong></div>}
                      </div>
                      {selectedSnapshot && (
                        <div className="jda-subsection">
                          <div className="jda-subsection-title"><span>{t.evidence}</span><small>{t.transport}</small></div>
                          <p className="jda-subsection-copy">{t.evidenceText}</p>
                          <div className="jda-evidence">
                            <div><span>{t.transport}</span><strong>{selectedSnapshot.transport === "single" ? t.single : selectedSnapshot.transport === "bam" ? t.bam : t.rts}</strong></div>
                            <div><span>{t.sourceLine}</span><strong>{selectedSnapshot.sourceLines.join(", ")}</strong></div>
                            <code>{formatData(selectedSnapshot.payload)}</code>
                          </div>
                      </div>
                      )}
                      <label className="jda-service-note">
                        <span>{t.serviceNote}</span>
                        <textarea
                          value={dtcNotes[selectedTimeline.key] ?? ""}
                          onChange={(event) => setDtcNotes((current) => ({ ...current, [selectedTimeline.key]: event.target.value }))}
                          placeholder={t.servicePlaceholder}
                        />
                      </label>
                    </section>
                  )}
                </div>
              )
            )}

            {view === "network" && analysis && (
              <section className="jda-panel jda-network">
                <div className="jda-section-heading">
                  <span>J1939 / SOURCE ADDRESS</span>
                  <h2>{t.discovered}</h2>
                  <p>{t.discoveredText}</p>
                </div>
                <div className="jda-network-table">
                  <div className="jda-network-head">
                    <span>{t.ecuName}</span><span>{t.address}</span><span>{t.frames}</span><span>DM1</span><span>{t.pgns}</span>
                  </div>
                  {analysis.ecus.map((ecu) => (
                    <article key={ecu.key}>
                      <input
                        aria-label={t.ecuName}
                        value={ecuNames[ecu.key] ?? ecu.defaultName}
                        onChange={(event) => setEcuNames((current) => ({ ...current, [ecu.key]: event.target.value }))}
                      />
                      <strong>0x{ecu.sourceAddress.toString(16).toUpperCase().padStart(2, "0")}</strong>
                      <span>{ecu.frameCount.toLocaleString()}</span>
                      <span>{ecu.dm1Count.toLocaleString()}</span>
                      <span>{ecu.pgns.length.toLocaleString()}</span>
                      <div className="jda-pgn-list">
                        <small>{t.pgnList}</small>
                        <p>{ecu.pgns.map((pgn) => `${pgn} (${pgnHex(pgn)})`).join(" · ")}</p>
                      </div>
                    </article>
                  ))}
                </div>
                {analysis.transportIssues.length > 0 && (
                  <div className="jda-tp-issues">
                    <h3>{t.tpIssues}</h3>
                    {analysis.transportIssues.map((issue, index) => (
                      <article key={`${issue.timestampMs}-${index}`}>
                        <strong>{issue.code}</strong>
                        <span>{traceTime(issue.timestampMs)} · SA 0x{issue.sourceAddress.toString(16).toUpperCase().padStart(2, "0")} · {pgnHex(issue.transportedPgn)}</span>
                        <p>{issue.detail}</p>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}

            {view === "manual" && (
              <ManualDecoder language={language} knownSpns={knownSpns} knowledge={knowledge} />
            )}

            {view === "dictionary" && (
              <section className="jda-panel jda-dictionary">
                <div className="jda-section-heading">
                  <span>SPN / CSV / XLSX</span>
                  <h2>{t.dictTitle}</h2>
                  <p>{t.dictText}</p>
                </div>
                <div className="jda-dictionary-actions">
                  <button type="button" onClick={() => dictionaryInputRef.current?.click()}>{t.dictUpload}<b>↑</b></button>
                  {dictionary.length > 0 && (
                    <button
                      className="secondary"
                      type="button"
                      onClick={() => { setDictionary([]); clearStoredDictionary(); }}
                    >
                      {t.dictClear}
                    </button>
                  )}
                  <div><strong>{dictionary.length}</strong><span>{t.dictRows}<small>{t.dictStored}</small></span></div>
                </div>
                <p className="jda-dict-columns">{t.dictColumns}</p>
                {dictionary.length ? (
                  <div className="jda-dictionary-table">
                    <div><span>SPN</span><span>Name TR / EN</span><span>Cause / Check</span><span>Service</span></div>
                    {dictionary.slice(0, 250).map((item) => (
                      <article key={item.spn}>
                        <strong>{item.spn}</strong>
                        <span>{item.nameTr || item.nameEn || "—"}<small>{item.nameTr && item.nameEn ? item.nameEn : ""}</small></span>
                        <span>{item.causeTr || item.causeEn || "—"}<small>{item.checkTr || item.checkEn || ""}</small></span>
                        <span>{item.serviceNote || "—"}</span>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="jda-empty jda-empty--small"><strong>{t.dictEmpty}</strong></div>
                )}
              </section>
            )}
          </div>
        </>
      )}

      {error && <div className="jda-error-toast"><span>!</span>{error}<button onClick={() => setError("")} type="button">×</button></div>}
      {toast && <div className="jda-toast"><i />{toast}</div>}

      {reportDialogOpen && analysis && (
        <div className="jda-dialog-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setReportDialogOpen(false);
        }}>
          <section className="jda-dialog" role="dialog" aria-modal="true" aria-labelledby="jda-report-title">
            <header>
              <div><span>PDF / A4</span><h2 id="jda-report-title">{t.reportConfigure}</h2><p>{t.reportText}</p></div>
              <button type="button" onClick={() => setReportDialogOpen(false)} aria-label={t.close}>×</button>
            </header>
            <div className="jda-report-fields">
              {([
                ["machineModel", t.machineModel],
                ["serialNumber", t.serialNumber],
                ["testLocation", t.testLocation],
                ["technician", t.technician],
              ] as Array<[keyof ReportMetadata, string]>).map(([key, label]) => (
                <label key={key}><span>{label}</span><input value={metadata[key]} onChange={(event) => setMetadata((current) => ({ ...current, [key]: event.target.value }))} /></label>
              ))}
              <label className="wide"><span>{t.generalNote}</span><textarea value={metadata.generalNote} onChange={(event) => setMetadata((current) => ({ ...current, generalNote: event.target.value }))} /></label>
            </div>
            <div className="jda-report-select-head">
              <strong>{t.selectFaults}</strong>
              <span>{reportFaultKeys.length} / {MAX_REPORT_FAULTS} {t.selected}</span>
            </div>
            <div className="jda-report-faults">
              {analysis.timelines.map((timeline) => (
                <label key={timeline.key}>
                  <input checked={reportFaultKeys.includes(timeline.key)} onChange={() => toggleReportFault(timeline.key)} type="checkbox" />
                  <span><strong>SPN {timeline.spn} · FMI {timeline.fmi}</strong><small>{knowledgeName(knowledge, timeline.spn, language)}</small></span>
                  <i>{timelineStatus(timeline, language)}</i>
                </label>
              ))}
            </div>
            <footer>
              <button className="secondary" type="button" onClick={() => setReportDialogOpen(false)}>{t.cancel}</button>
              <button className="primary" type="button" onClick={printReport}>{t.generate}<b>↗</b></button>
            </footer>
          </section>
        </div>
      )}

      {log && analysis && (
        <section className="jda-print-report">
          <header className="jda-print-header">
            <div><span>J1939 · DM1 · PGN 65226</span><h1>{t.reportTitle}</h1><p>{t.generatedBy}</p></div>
            <strong>BT<small>ENGINEERING<br />TOOLS</small></strong>
          </header>
          <section className="jda-print-meta">
            <article><span>{t.machineModel}</span><strong>{metadata.machineModel || "—"}</strong><small>{t.serialNumber}: {metadata.serialNumber || "—"}</small></article>
            <article><span>{t.testLocation}</span><strong>{metadata.testLocation || "—"}</strong><small>{t.technician}: {metadata.technician || "—"}</small></article>
            <article><span>{t.file}</span><strong>{log.name}</strong><small>{log.formatLabel} · {formatDuration(log.durationMs)}</small></article>
            <article><span>{t.dbc}</span><strong>{database ? dbcName : t.notLoaded}</strong><small>{database ? `${dbcContext?.matchedFrames ?? 0} matched frames` : t.localOnly}</small></article>
          </section>
          {metadata.generalNote && <p className="jda-print-general-note"><strong>{t.generalNote}:</strong> {metadata.generalNote}</p>}
          <section className="jda-print-section">
            <div className="jda-print-section-title"><span>01</span><h2>{t.overview}</h2></div>
            <div className="jda-print-kpis">
              <article><span>{t.logFrames}</span><strong>{log.frames.length.toLocaleString()}</strong></article>
              <article><span>{t.j1939Frames}</span><strong>{analysis.j1939FrameCount.toLocaleString()}</strong></article>
              <article><span>{t.dm1Snapshots}</span><strong>{analysis.snapshots.length.toLocaleString()}</strong></article>
              <article><span>{t.uniqueDtc}</span><strong>{analysis.timelines.length.toLocaleString()}</strong></article>
              <article><span>{t.ecuCount}</span><strong>{analysis.ecus.length.toLocaleString()}</strong></article>
              <article><span>{t.tpIssues}</span><strong>{analysis.transportIssues.length.toLocaleString()}</strong></article>
            </div>
          </section>
          <section className="jda-print-section">
            <div className="jda-print-section-title"><span>02</span><h2>{t.dtcSummary}</h2></div>
            <table>
              <thead><tr><th>SPN / FMI</th><th>{t.source}</th><th>{t.firstSeen}</th><th>{t.occurrence}</th><th>{t.status}</th></tr></thead>
              <tbody>
                {analysis.timelines.map((timeline) => (
                  <tr key={timeline.key}>
                    <td><strong>SPN {timeline.spn} · FMI {timeline.fmi}</strong><small>{knowledgeName(knowledge, timeline.spn, language)}</small></td>
                    <td>{ecuLabel(timeline.channel, timeline.sourceAddress)}<small>SA 0x{timeline.sourceAddress.toString(16).toUpperCase().padStart(2, "0")}</small></td>
                    <td>{traceTime(timeline.firstSeenMs)}<small>{traceTime(timeline.lastSeenMs)}</small></td>
                    <td>{timeline.maxOccurrenceCount ?? "N/A"}</td>
                    <td>{timelineStatus(timeline, language)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <section className="jda-print-section">
            <div className="jda-print-section-title"><span>03</span><h2>{t.networkSummary}</h2></div>
            <table>
              <thead><tr><th>{t.ecuName}</th><th>{t.address}</th><th>{t.frames}</th><th>DM1</th><th>{t.pgns}</th></tr></thead>
              <tbody>
                {analysis.ecus.map((ecu) => (
                  <tr key={ecu.key}>
                    <td>{ecuLabel(ecu.channel, ecu.sourceAddress)}</td>
                    <td>CH {ecu.channel} · 0x{ecu.sourceAddress.toString(16).toUpperCase().padStart(2, "0")}</td>
                    <td>{ecu.frameCount.toLocaleString()}</td>
                    <td>{ecu.dm1Count.toLocaleString()}</td>
                    <td>{ecu.pgns.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          {selectedReportTimelines.length > 0 && (
            <section className="jda-print-section jda-print-details">
              <div className="jda-print-section-title"><span>04</span><h2>{t.detailedFindings}</h2></div>
              {selectedReportTimelines.map((timeline, index) => {
                const snapshot = analysis.snapshots.find((item) => item.uid === timeline.intervals[0]?.firstSnapshotUid);
                const values = contextSnapshotAt(dbcContext, timeline);
                const series = contextSeriesAround(dbcContext, timeline);
                const fmi = fmiDefinition(timeline.fmi);
                return (
                  <article className="jda-print-fault" key={timeline.key}>
                    <header>
                      <span>{String(index + 1).padStart(2, "0")} / DTC</span>
                      <div><h3>SPN {timeline.spn} · FMI {timeline.fmi}</h3><p>{knowledgeName(knowledge, timeline.spn, language)}</p></div>
                      <strong>{timelineStatus(timeline, language)}</strong>
                    </header>
                    <div className="jda-print-fault-facts">
                      <div><span>{t.source}</span><strong>{ecuLabel(timeline.channel, timeline.sourceAddress)}</strong></div>
                      <div><span>{t.firstSeen}</span><strong>{traceTime(timeline.firstSeenMs)}</strong></div>
                      <div><span>{t.occurrence}</span><strong>{timeline.maxOccurrenceCount ?? "N/A"}</strong></div>
                      <div><span>{t.cm}</span><strong>CM {timeline.conversionMethod} / V{timeline.conversionVersion}</strong></div>
                    </div>
                    <p className="jda-print-fmi"><strong>FMI {timeline.fmi}:</strong> {language === "tr" ? fmi.tr : fmi.en}</p>
                    {snapshot && <LampStrip lamps={snapshot.lamps} language={language} />}
                    <h4>{t.contextTitle}</h4>
                    {values.length ? (
                      <div className="jda-print-context">
                        {values.map((value) => <div key={value.key}><span>{value.signalName}</span><strong>{formatValue(value.value)} {value.unit}</strong></div>)}
                      </div>
                    ) : <p className="jda-print-muted">{t.contextMissingText}</p>}
                    {series.length > 0 && <SignalChart compact series={series} faultTime={timeline.firstSeenMs} />}
                    <div className="jda-print-evidence">
                      <span>{t.rawDtc}</span><code>{formatData(timeline.raw)}</code>
                      {snapshot && <><span>DM1 payload</span><code>{formatData(snapshot.payload)}</code></>}
                    </div>
                    {dtcNotes[timeline.key] && <p className="jda-print-service"><strong>{t.serviceNote}:</strong> {dtcNotes[timeline.key]}</p>}
                  </article>
                );
              })}
            </section>
          )}
          <footer className="jda-print-footer">
            <p>{t.disclaimer}</p>
            <span>{t.generatedBy}<small>{new Date().toLocaleString(language === "tr" ? "tr-TR" : "en-GB")} · {t.printHint}</small></span>
          </footer>
        </section>
      )}
    </main>
  );
}
