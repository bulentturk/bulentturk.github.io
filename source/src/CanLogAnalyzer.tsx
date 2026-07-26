import { useEffect, useMemo, useRef, useState } from "react";
import "./can-log-analyzer.css";
import type { DbcDatabase, DbcMessage, DbcSignal } from "./dbc/dbc";
import { createExampleDatabase, parseDbc } from "./dbc/dbc";
import {
  decodeMessage,
  findDbcMessage,
  formatCanId,
  formatData,
  frameKey,
} from "./can/decode";
import type { DecodedSignal } from "./can/decode";
import {
  analyzeMessages,
  createExampleLog,
  parseCanLog,
} from "./can-log/log";
import type { LogFrame, MessageStats, ParsedLog } from "./can-log/log";

type Language = "tr" | "en";
type Tab = "overview" | "signals" | "frames";
type SortKey = "id" | "count" | "period" | "jitter" | "missing";
type ChartPoint = { x: number; y: number };
type SignalSummary = { min: number; max: number; average: number; count: number };
type ReportSignalCandidate = {
  key: string;
  message: DbcMessage;
  signal: DbcSignal;
  frames: LogFrame[];
};
type ReportSignalAnalysis = ReportSignalCandidate & {
  series: ChartPoint[];
  summary: SignalSummary;
};

const MAX_FILE_SIZE = 100 * 1024 * 1024;
const MAX_REPORT_SIGNALS = 12;
const DEFAULT_REPORT_SIGNALS = 6;
const CHART_COLORS = ["#087f8c", "#e08b36", "#446aa3", "#9a5877"];

const copy = {
  tr: {
    back: "Ana site",
    title: "CAN Log Analyzer",
    subtitle: "CAN kayıtlarını açın · zamanlamayı inceleyin · DBC ile sinyalleri çözün",
    privacy: "Tüm analiz tarayıcınızda yapılır; dosyalar sunucuya yüklenmez",
    openLog: "CAN log dosyası aç",
    example: "Örnek kaydı dene",
    openDbc: "DBC yükle",
    exampleDbc: "Örnek DBC",
    exportCsv: "Filtreli CSV indir",
    printReport: "Rapor / PDF",
    supported: "PEAK TRC 1.0–3.0 · Vector ASC · CSV · SocketCAN LOG",
    emptyTitle: "Analiz için bir CAN kaydı açın",
    emptyText:
      "PCAN-View/Explorer .trc, Vector .asc, başlıklı .csv veya candump .log dosyası kullanabilirsiniz.",
    local: "Yerel işlem",
    frames: "Toplam frame",
    ids: "Benzersiz ID",
    duration: "Kayıt süresi",
    rate: "Ort. frame/s",
    dbcMatch: "DBC eşleşmesi",
    file: "Kayıt dosyası",
    format: "Format",
    range: "Zaman aralığı",
    from: "Başlangıç (s)",
    to: "Bitiş (s)",
    resetRange: "Tüm kayıt",
    filter: "ID, mesaj adı veya byte ara",
    messageList: "Mesaj analizi",
    id: "CAN ID",
    name: "Mesaj",
    type: "Tip",
    count: "Adet",
    period: "Ort. periyot",
    jitter: "Jitter σ",
    missing: "Tahmini kayıp",
    frequency: "Frekans",
    dlc: "DLC",
    rxTx: "Rx / Tx",
    firstLast: "İlk / son",
    minMaxPeriod: "Min / maks. periyot",
    overview: "Genel analiz",
    signals: "DBC sinyalleri",
    rawFrames: "Ham frameler",
    chooseId: "Ayrıntıları görmek için soldan bir CAN ID seçin.",
    timingTitle: "Çevrim zamanı davranışı",
    timingText: "Ardışık mesajlar arasındaki zaman farkı",
    noTiming: "Periyot hesabı için en az iki frame gerekir.",
    byteActivity: "Byte değişim yoğunluğu",
    byteActivityText: "Aynı ID’nin ardışık framelerinde değişen byte oranı",
    byte: "Byte",
    unchanged: "Sabit",
    active: "Değişken",
    noDbc: "DBC yüklenmedi",
    noDbcText:
      "Sinyal grafikleri için bu CAN kaydına ait DBC dosyasını yükleyin.",
    noDbcMatch: "Seçilen CAN ID için DBC mesaj tanımı bulunamadı.",
    chooseSignal: "Grafiğe eklenecek sinyali seçin",
    signalStats: "Sinyal istatistikleri",
    minimum: "Minimum",
    maximum: "Maksimum",
    average: "Ortalama",
    samples: "Örnek",
    value: "Değer",
    unit: "Birim",
    time: "Zaman",
    direction: "Yön",
    channel: "Kanal",
    data: "Veri",
    shownFrames: "Son 400 eşleşen frame gösteriliyor",
    invalidLog: "Dosyada desteklenen CAN frame’i bulunamadı.",
    invalidDbc: "DBC dosyası okunamadı.",
    tooLarge: "Dosya 100 MB sınırını aşıyor.",
    loaded: "Kayıt analiz edildi.",
    dbcLoaded: "DBC yüklendi.",
    csvSaved: "Filtreli CAN verisi CSV olarak indirildi.",
    noExport: "Dışa aktarılacak frame bulunamadı.",
    warnings: "Dosya notları",
    parsed: "okunan frame",
    skipped: "atlanmış satır",
    sort: "Sırala",
    std: "STD",
    ext: "EXT",
    canFd: "CAN FD",
    can: "CAN",
    rtr: "RTR",
    reportTitle: "CAN Kayıt Analiz Raporu",
    reportDate: "Rapor tarihi",
    printHint: "Yazdırma penceresinde “PDF olarak kaydet” seçilebilir.",
    reportOptionsTitle: "PDF raporunu yapılandır",
    reportOptionsText:
      "Genel analiz ve mesaj tablosuna ek olarak raporda yer alacak DBC sinyallerini seçin.",
    reportSignals: "DBC sinyal grafikleri",
    reportSignalsHint: "En fazla 12 sinyal seçilebilir. Grafikler seçili zaman aralığını kullanır.",
    reportSelected: "seçili",
    selectAll: "İlk 12 sinyali seç",
    clearAll: "Seçimi temizle",
    generatePdf: "PDF raporunu aç",
    cancel: "Vazgeç",
    reportNoDbc:
      "DBC yüklenmediği için rapor yalnız genel analiz ve CAN mesaj tablosunu içerecek.",
    reportNoSignals:
      "Yüklenen DBC ile geçerli filtrelerde çözülebilen sinyal bulunamadı.",
    reportLimit: "Rapora en fazla 12 sinyal grafiği eklenebilir.",
    reportSummary: "Genel özet",
    reportMessageAnalysis: "CAN mesaj analizi",
    reportSignalAnalysis: "DBC sinyal grafikleri",
    reportSignalAnalysisText:
      "Fiziksel değerler yüklenen DBC tanımına göre çözümlenmiştir.",
    reportGeneratedBy: "Bülent Türk · Engineering Tools",
    dbcFile: "DBC dosyası",
    notLoaded: "Yüklenmedi",
    filteredRange: "Analiz aralığı",
    signalDetails: "Sinyal tanımı",
    matchedFrames: "Eşleşen frame",
    total: "toplam",
    frameUnit: "frame",
    signalUnit: "sinyal",
    byteUnit: "byte",
    median: "medyan",
  },
  en: {
    back: "Main site",
    title: "CAN Log Analyzer",
    subtitle: "Open CAN captures · inspect timing · decode signals with DBC",
    privacy: "All analysis runs in your browser; files are never uploaded",
    openLog: "Open CAN log",
    example: "Try example capture",
    openDbc: "Load DBC",
    exampleDbc: "Example DBC",
    exportCsv: "Download filtered CSV",
    printReport: "Report / PDF",
    supported: "PEAK TRC 1.0–3.0 · Vector ASC · CSV · SocketCAN LOG",
    emptyTitle: "Open a CAN capture to start analysis",
    emptyText:
      "Use a PCAN-View/Explorer .trc, Vector .asc, header-based .csv, or candump .log file.",
    local: "Local processing",
    frames: "Total frames",
    ids: "Unique IDs",
    duration: "Capture length",
    rate: "Avg. frames/s",
    dbcMatch: "DBC match",
    file: "Capture file",
    format: "Format",
    range: "Time range",
    from: "Start (s)",
    to: "End (s)",
    resetRange: "Full capture",
    filter: "Search ID, message name, or bytes",
    messageList: "Message analysis",
    id: "CAN ID",
    name: "Message",
    type: "Type",
    count: "Count",
    period: "Avg. period",
    jitter: "Jitter σ",
    missing: "Est. missing",
    frequency: "Frequency",
    dlc: "DLC",
    rxTx: "Rx / Tx",
    firstLast: "First / last",
    minMaxPeriod: "Min / max period",
    overview: "Overview",
    signals: "DBC signals",
    rawFrames: "Raw frames",
    chooseId: "Select a CAN ID on the left to inspect its details.",
    timingTitle: "Cycle-time behavior",
    timingText: "Time difference between consecutive messages",
    noTiming: "At least two frames are required for timing analysis.",
    byteActivity: "Byte change intensity",
    byteActivityText: "Share of consecutive frames where each byte changed",
    byte: "Byte",
    unchanged: "Stable",
    active: "Changing",
    noDbc: "No DBC loaded",
    noDbcText: "Load the DBC that belongs to this capture to graph physical signals.",
    noDbcMatch: "The DBC has no message definition for the selected CAN ID.",
    chooseSignal: "Choose a signal to graph",
    signalStats: "Signal statistics",
    minimum: "Minimum",
    maximum: "Maximum",
    average: "Average",
    samples: "Samples",
    value: "Value",
    unit: "Unit",
    time: "Time",
    direction: "Direction",
    channel: "Channel",
    data: "Data",
    shownFrames: "Latest 400 matching frames are shown",
    invalidLog: "No supported CAN data frames were found in the file.",
    invalidDbc: "The DBC file could not be parsed.",
    tooLarge: "The file exceeds the 100 MB limit.",
    loaded: "Capture analyzed.",
    dbcLoaded: "DBC loaded.",
    csvSaved: "Filtered CAN data downloaded as CSV.",
    noExport: "No frames match the current filters.",
    warnings: "File notes",
    parsed: "parsed frames",
    skipped: "skipped lines",
    sort: "Sort",
    std: "STD",
    ext: "EXT",
    canFd: "CAN FD",
    can: "CAN",
    rtr: "RTR",
    reportTitle: "CAN Capture Analysis Report",
    reportDate: "Report date",
    printHint: "Choose “Save as PDF” in the print dialog.",
    reportOptionsTitle: "Configure PDF report",
    reportOptionsText:
      "Select the DBC signals to include alongside the overview and message table.",
    reportSignals: "DBC signal charts",
    reportSignalsHint: "Up to 12 signals can be selected. Charts use the active time range.",
    reportSelected: "selected",
    selectAll: "Select first 12",
    clearAll: "Clear selection",
    generatePdf: "Open PDF report",
    cancel: "Cancel",
    reportNoDbc:
      "No DBC is loaded, so the report will contain only the overview and CAN message table.",
    reportNoSignals:
      "No signals can be decoded from the loaded DBC with the current filters.",
    reportLimit: "A maximum of 12 signal charts can be added to the report.",
    reportSummary: "Overview",
    reportMessageAnalysis: "CAN message analysis",
    reportSignalAnalysis: "DBC signal charts",
    reportSignalAnalysisText:
      "Physical values are decoded according to the loaded DBC definition.",
    reportGeneratedBy: "Bülent Türk · Engineering Tools",
    dbcFile: "DBC file",
    notLoaded: "Not loaded",
    filteredRange: "Analysis range",
    signalDetails: "Signal definition",
    matchedFrames: "Matched frames",
    total: "total",
    frameUnit: "frames",
    signalUnit: "signals",
    byteUnit: "bytes",
    median: "median",
  },
} as const;

function formatNumber(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return "—";
  if (Math.abs(value) >= 1_000_000) return value.toExponential(2);
  return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: digits }).format(value);
}

function formatPeriod(value: number | null): string {
  if (value === null) return "—";
  if (value >= 1000) return `${formatNumber(value / 1000, 3)} s`;
  if (value >= 1) return `${formatNumber(value, 3)} ms`;
  return `${formatNumber(value * 1000, 2)} µs`;
}

function formatDuration(value: number): string {
  if (value < 1000) return `${formatNumber(value, 0)} ms`;
  if (value < 60_000) return `${formatNumber(value / 1000, 2)} s`;
  const minutes = Math.floor(value / 60_000);
  const seconds = Math.floor((value % 60_000) / 1000);
  return `${minutes}m ${seconds}s`;
}

function escapeCsv(value: string | number): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function downloadText(filename: string, text: string, type = "text/csv;charset=utf-8"): void {
  const blob = new Blob(["\uFEFF", text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function messageMatches(
  stats: MessageStats,
  query: string,
  database: DbcDatabase | null,
  sample: LogFrame | undefined,
): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  const message = sample ? findDbcMessage(database, sample) : null;
  return [
    `0x${stats.id.toString(16)}`,
    stats.id.toString(16),
    stats.id.toString(),
    message?.name ?? "",
    ...(message?.signals.map((signal) => signal.name) ?? []),
    sample ? formatData(sample.data) : "",
  ].some((value) => value.toLowerCase().includes(normalized));
}

function downsample<T>(values: T[], limit: number): T[] {
  if (values.length <= limit) return values;
  const result: T[] = [];
  const step = (values.length - 1) / (limit - 1);
  for (let index = 0; index < limit; index += 1) {
    result.push(values[Math.round(index * step)]);
  }
  return result;
}

function summarizeSeries(series: ChartPoint[]): SignalSummary | null {
  if (!series.length) return null;
  let min = series[0].y;
  let max = series[0].y;
  let sum = 0;
  series.forEach((item) => {
    min = Math.min(min, item.y);
    max = Math.max(max, item.y);
    sum += item.y;
  });
  return {
    min,
    max,
    average: sum / series.length,
    count: series.length,
  };
}

function createSignalSeries(
  frames: LogFrame[],
  message: DbcMessage,
  signal: DbcSignal,
): ChartPoint[] {
  return frames.flatMap((frame) => {
    const decoded = signalForUid(decodeMessage(frame, message), signal.uid);
    return decoded && Number.isFinite(decoded.numericValue)
      ? [{ x: frame.timestampMs, y: decoded.numericValue }]
      : [];
  });
}

function LineChart({
  values,
  color = CHART_COLORS[0],
  emptyText,
  formatValue = (value) => formatNumber(value, 3),
}: {
  values: ChartPoint[];
  color?: string;
  emptyText: string;
  formatValue?: (value: number) => string;
}) {
  if (values.length < 2) return <div className="cla-chart-empty">{emptyText}</div>;
  const sampled = downsample(values, 900);
  const minX = sampled[0].x;
  const maxX = sampled[sampled.length - 1].x;
  const ys = sampled.map((item) => item.y);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const ySpan = maxY - minY || 1;
  const xSpan = maxX - minX || 1;
  const points = sampled
    .map((item) => {
      const x = 42 + ((item.x - minX) / xSpan) * 858;
      const y = 16 + (1 - (item.y - minY) / ySpan) * 158;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <div className="cla-line-chart">
      <svg viewBox="0 0 920 210" preserveAspectRatio="none" role="img">
        {[0, 1, 2, 3, 4].map((row) => (
          <line key={row} x1="42" x2="900" y1={16 + row * 39.5} y2={16 + row * 39.5} />
        ))}
        <polyline points={points} style={{ stroke: color }} />
        <text x="4" y="22">{formatValue(maxY)}</text>
        <text x="4" y="178">{formatValue(minY)}</text>
        <text x="42" y="202">{formatNumber((minX - minX) / 1000, 2)} s</text>
        <text x="858" y="202">{formatNumber((maxX - minX) / 1000, 2)} s</text>
      </svg>
    </div>
  );
}

function signalForUid(decoded: DecodedSignal[], uid: string): DecodedSignal | undefined {
  return decoded.find((item) => item.signal.uid === uid);
}

export default function CanLogAnalyzer() {
  const [language, setLanguage] = useState<Language>("tr");
  const [log, setLog] = useState<ParsedLog | null>(null);
  const [database, setDatabase] = useState<DbcDatabase | null>(null);
  const [dbcName, setDbcName] = useState("");
  const [query, setQuery] = useState("");
  const [selectedKey, setSelectedKey] = useState("");
  const [selectedSignalUid, setSelectedSignalUid] = useState("");
  const [tab, setTab] = useState<Tab>("overview");
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [rangeStartMs, setRangeStartMs] = useState(0);
  const [rangeEndMs, setRangeEndMs] = useState(0);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedReportSignalKeys, setSelectedReportSignalKeys] = useState<string[]>([]);
  const [toast, setToast] = useState("");
  const logInputRef = useRef<HTMLInputElement>(null);
  const dbcInputRef = useRef<HTMLInputElement>(null);
  const t = copy[language];

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = `${t.title} | Bülent Türk`;
  }, [language, t.title]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const loadParsedLog = (parsed: ParsedLog) => {
    if (!parsed.frames.length) {
      setToast(t.invalidLog);
      return;
    }
    const first = parsed.frames[0].timestampMs;
    const last = parsed.frames[parsed.frames.length - 1].timestampMs;
    setLog(parsed);
    setRangeStartMs(first);
    setRangeEndMs(last);
    const initialStats = analyzeMessages(parsed.frames).sort((a, b) => b.count - a.count);
    setSelectedKey(initialStats[0]?.key ?? "");
    setSelectedSignalUid("");
    setSelectedReportSignalKeys([]);
    setTab("overview");
    setQuery("");
    setToast(t.loaded);
  };

  const openLog = async (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      setToast(t.tooLarge);
      return;
    }
    try {
      loadParsedLog(parseCanLog(await file.text(), file.name));
    } catch {
      setToast(t.invalidLog);
    }
  };

  const openDbc = async (file: File) => {
    if (file.size > 20 * 1024 * 1024) {
      setToast(t.tooLarge);
      return;
    }
    try {
      const parsed = parseDbc(await file.text(), file.name);
      setDatabase(parsed);
      setDbcName(file.name);
      setSelectedSignalUid("");
      setSelectedReportSignalKeys([]);
      setToast(t.dbcLoaded);
    } catch {
      setToast(t.invalidDbc);
    }
  };

  const rangeFrames = useMemo(
    () =>
      log?.frames.filter(
        (frame) => frame.timestampMs >= rangeStartMs && frame.timestampMs <= rangeEndMs,
      ) ?? [],
    [log, rangeEndMs, rangeStartMs],
  );
  const stats = useMemo(() => analyzeMessages(rangeFrames), [rangeFrames]);
  const sampleByKey = useMemo(() => {
    const result = new Map<string, LogFrame>();
    rangeFrames.forEach((frame) => {
      if (!result.has(frameKey(frame))) result.set(frameKey(frame), frame);
    });
    return result;
  }, [rangeFrames]);
  const sortedStats = useMemo(() => {
    const filtered = stats.filter((item) =>
      messageMatches(item, query, database, sampleByKey.get(item.key)),
    );
    return filtered.sort((first, second) => {
      if (sortKey === "count") return second.count - first.count;
      if (sortKey === "period") {
        return (first.averagePeriodMs ?? Infinity) - (second.averagePeriodMs ?? Infinity);
      }
      if (sortKey === "jitter") return (second.jitterMs ?? -1) - (first.jitterMs ?? -1);
      if (sortKey === "missing") return second.estimatedMissing - first.estimatedMissing;
      return Number(first.extended) - Number(second.extended) || first.id - second.id;
    });
  }, [database, query, sampleByKey, sortKey, stats]);

  useEffect(() => {
    if (selectedKey && stats.some((item) => item.key === selectedKey)) return;
    setSelectedKey(stats[0]?.key ?? "");
  }, [selectedKey, stats]);

  const selectedStats = stats.find((item) => item.key === selectedKey) ?? null;
  const selectedFrames = rangeFrames.filter((frame) => frameKey(frame) === selectedKey);
  const selectedSample = selectedFrames[0];
  const selectedMessage = selectedSample ? findDbcMessage(database, selectedSample) : null;
  const selectedSignal: DbcSignal | null =
    selectedMessage?.signals.find((signal) => signal.uid === selectedSignalUid) ??
    selectedMessage?.signals[0] ??
    null;

  useEffect(() => {
    if (!selectedMessage?.signals.length) {
      setSelectedSignalUid("");
      return;
    }
    if (!selectedMessage.signals.some((signal) => signal.uid === selectedSignalUid)) {
      setSelectedSignalUid(selectedMessage.signals[0].uid);
    }
  }, [selectedMessage, selectedSignalUid]);

  const intervalSeries = useMemo(() => {
    const values: { x: number; y: number }[] = [];
    for (let index = 1; index < selectedFrames.length; index += 1) {
      values.push({
        x: selectedFrames[index].timestampMs,
        y: selectedFrames[index].timestampMs - selectedFrames[index - 1].timestampMs,
      });
    }
    return values;
  }, [selectedFrames]);

  const signalSeries = useMemo(() => {
    if (!selectedMessage || !selectedSignal) return [];
    return createSignalSeries(selectedFrames, selectedMessage, selectedSignal);
  }, [selectedFrames, selectedMessage, selectedSignal]);

  const signalSummary = useMemo(() => summarizeSeries(signalSeries), [signalSeries]);

  const dbcMatchedFrames = useMemo(
    () => rangeFrames.filter((frame) => Boolean(findDbcMessage(database, frame))).length,
    [database, rangeFrames],
  );
  const reportSignalCandidates = useMemo<ReportSignalCandidate[]>(() => {
    if (!database) return [];
    const framesByKey = new Map<string, LogFrame[]>();
    rangeFrames.forEach((frame) => {
      const key = frameKey(frame);
      const frames = framesByKey.get(key);
      if (frames) frames.push(frame);
      else framesByKey.set(key, [frame]);
    });

    return sortedStats.flatMap((item) => {
      const frames = framesByKey.get(item.key) ?? [];
      const message = frames[0] ? findDbcMessage(database, frames[0]) : null;
      if (!message) return [];
      return message.signals.map((signal) => ({
        key: `${message.uid}::${signal.uid}`,
        message,
        signal,
        frames,
      }));
    });
  }, [database, rangeFrames, sortedStats]);
  const reportSignalAnalyses = useMemo<ReportSignalAnalysis[]>(() => {
    const byKey = new Map(reportSignalCandidates.map((candidate) => [candidate.key, candidate]));
    return selectedReportSignalKeys.flatMap((key) => {
      const candidate = byKey.get(key);
      if (!candidate) return [];
      const series = createSignalSeries(candidate.frames, candidate.message, candidate.signal);
      const summary = summarizeSeries(series);
      return summary ? [{ ...candidate, series, summary }] : [];
    });
  }, [reportSignalCandidates, selectedReportSignalKeys]);
  const startTimestamp = log?.frames[0]?.timestampMs ?? 0;
  const rangeDuration = Math.max(0, rangeEndMs - rangeStartMs);
  const averageRate = rangeDuration > 0 ? (rangeFrames.length * 1000) / rangeDuration : 0;

  const openReportOptions = () => {
    const validKeys = new Set(reportSignalCandidates.map((candidate) => candidate.key));
    setSelectedReportSignalKeys((current) => {
      const validSelection = current.filter((key) => validKeys.has(key));
      return validSelection.length
        ? validSelection.slice(0, MAX_REPORT_SIGNALS)
        : reportSignalCandidates
            .slice(0, DEFAULT_REPORT_SIGNALS)
            .map((candidate) => candidate.key);
    });
    setReportDialogOpen(true);
  };

  const toggleReportSignal = (key: string) => {
    setSelectedReportSignalKeys((current) => {
      if (current.includes(key)) return current.filter((item) => item !== key);
      if (current.length >= MAX_REPORT_SIGNALS) {
        setToast(t.reportLimit);
        return current;
      }
      return [...current, key];
    });
  };

  const printConfiguredReport = () => {
    setReportDialogOpen(false);
    window.setTimeout(() => window.print(), 60);
  };

  const exportFrames = () => {
    const visibleKeys = new Set(sortedStats.map((item) => item.key));
    const frames = rangeFrames.filter((frame) => visibleKeys.has(frameKey(frame)));
    if (!frames.length) {
      setToast(t.noExport);
      return;
    }
    const rows = [
      ["timestamp_ms", "relative_time_s", "channel", "direction", "can_id", "extended", "type", "dlc", "data", "dbc_message"],
      ...frames.map((frame) => {
        const message = findDbcMessage(database, frame);
        return [
          frame.timestampMs.toFixed(6),
          ((frame.timestampMs - startTimestamp) / 1000).toFixed(6),
          frame.channel,
          frame.direction,
          formatCanId(frame),
          frame.extended ? "1" : "0",
          frame.type,
          frame.data.length,
          formatData(frame.data),
          message?.name ?? "",
        ];
      }),
    ];
    downloadText(
      `${(log?.name ?? "can-log").replace(/\.[^.]+$/, "")}-filtered.csv`,
      rows.map((row) => row.map(escapeCsv).join(",")).join("\r\n"),
    );
    setToast(t.csvSaved);
  };

  const renderEmpty = () => (
    <section className="cla-empty">
      <div className="cla-drop-mark" aria-hidden="true">
        <span>TRC</span><span>ASC</span><span>CSV</span>
      </div>
      <p>{t.supported}</p>
      <h1>{t.emptyTitle}</h1>
      <p>{t.emptyText}</p>
      <div>
        <button className="cla-button cla-button--primary" onClick={() => logInputRef.current?.click()} type="button">
          {t.openLog}<b>↗</b>
        </button>
        <button className="cla-button" onClick={() => loadParsedLog(createExampleLog())} type="button">
          {t.example}
        </button>
      </div>
      <small><i />{t.privacy}</small>
    </section>
  );

  return (
    <main className="cla-app">
      <input
        ref={logInputRef}
        className="cla-visually-hidden"
        type="file"
        accept=".trc,.asc,.csv,.log,text/plain,text/csv"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void openLog(file);
          event.currentTarget.value = "";
        }}
      />
      <input
        ref={dbcInputRef}
        className="cla-visually-hidden"
        type="file"
        accept=".dbc,text/plain"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void openDbc(file);
          event.currentTarget.value = "";
        }}
      />

      <header className="cla-topbar">
        <div className="cla-brand">
          <a href="/" aria-label={t.back}><span>←</span>{t.back}</a>
          <i />
          <div><strong>{t.title}</strong><small>{t.subtitle}</small></div>
        </div>
        <div className="cla-toolbar">
          <span className="cla-local-pill"><i />{t.local}</span>
          <button onClick={() => logInputRef.current?.click()} type="button">{t.openLog}</button>
          <button onClick={() => loadParsedLog(createExampleLog())} type="button">{t.example}</button>
          <span className="cla-lang">
            <button className={language === "tr" ? "active" : ""} onClick={() => setLanguage("tr")} type="button">TR</button>
            <i>/</i>
            <button className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")} type="button">EN</button>
          </span>
        </div>
      </header>

      {!log ? renderEmpty() : (
        <>
          <section className="cla-commandbar">
            <div className="cla-file-meta">
              <span>{t.file}</span>
              <strong title={log.name}>{log.name}</strong>
              <small>{log.formatLabel} · {log.frames.length.toLocaleString()} {t.parsed}</small>
            </div>
            <div className="cla-command-actions">
              <button onClick={() => dbcInputRef.current?.click()} type="button">
                <span>DBC</span>{database ? dbcName : t.openDbc}
              </button>
              <button onClick={() => {
                const example = createExampleDatabase();
                setDatabase(example);
                setDbcName(example.name);
                setSelectedReportSignalKeys([]);
                setToast(t.dbcLoaded);
              }} type="button">{t.exampleDbc}</button>
              <button onClick={exportFrames} type="button">{t.exportCsv}<b>↓</b></button>
              <button onClick={openReportOptions} type="button">{t.printReport}<b>↗</b></button>
            </div>
          </section>

          <section className="cla-summary" aria-label="Summary">
            <article><span>{t.frames}</span><strong>{rangeFrames.length.toLocaleString()}</strong><small>{log.frames.length.toLocaleString()} {t.total}</small></article>
            <article><span>{t.ids}</span><strong>{stats.length}</strong><small>{stats.filter((item) => item.extended).length} EXT</small></article>
            <article><span>{t.duration}</span><strong>{formatDuration(rangeDuration)}</strong><small>{formatDuration(log.durationMs)} {t.total}</small></article>
            <article><span>{t.rate}</span><strong>{formatNumber(averageRate, 1)}</strong><small>frame/s</small></article>
            <article className={database ? "matched" : ""}>
              <span>{t.dbcMatch}</span>
              <strong>{database && rangeFrames.length ? `${formatNumber((dbcMatchedFrames / rangeFrames.length) * 100, 1)}%` : "—"}</strong>
              <small>{database ? `${dbcMatchedFrames.toLocaleString()} ${t.frameUnit}` : t.noDbc}</small>
            </article>
          </section>

          <section className="cla-filters">
            <label className="cla-search">
              <span>⌕</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.filter} />
            </label>
            <div className="cla-range">
              <span>{t.range}</span>
              <label>{t.from}<input
                type="number"
                min="0"
                step="0.001"
                value={((rangeStartMs - startTimestamp) / 1000).toFixed(3)}
                onChange={(event) => {
                  const value = startTimestamp + Math.max(0, Number(event.target.value) || 0) * 1000;
                  setRangeStartMs(Math.min(value, rangeEndMs));
                }}
              /></label>
              <label>{t.to}<input
                type="number"
                min="0"
                step="0.001"
                value={((rangeEndMs - startTimestamp) / 1000).toFixed(3)}
                onChange={(event) => {
                  const last = log.frames[log.frames.length - 1].timestampMs;
                  const value = startTimestamp + Math.max(0, Number(event.target.value) || 0) * 1000;
                  setRangeEndMs(Math.max(rangeStartMs, Math.min(value, last)));
                }}
              /></label>
              <button type="button" onClick={() => {
                setRangeStartMs(startTimestamp);
                setRangeEndMs(log.frames[log.frames.length - 1].timestampMs);
              }}>{t.resetRange}</button>
            </div>
            <label className="cla-sort">{t.sort}
              <select value={sortKey} onChange={(event) => setSortKey(event.target.value as SortKey)}>
                <option value="id">CAN ID</option>
                <option value="count">{t.count}</option>
                <option value="period">{t.period}</option>
                <option value="jitter">{t.jitter}</option>
                <option value="missing">{t.missing}</option>
              </select>
            </label>
          </section>

          <section className="cla-workspace">
            <aside className="cla-message-panel">
              <div className="cla-panel-heading">
                <span>{t.messageList}</span>
                <strong>{sortedStats.length}</strong>
              </div>
              <div className="cla-message-head">
                <span>{t.id}</span><span>{t.count}</span><span>{t.period}</span><span>{t.jitter}</span>
              </div>
              <div className="cla-message-scroll">
                {sortedStats.map((item) => {
                  const sample = sampleByKey.get(item.key);
                  const message = sample ? findDbcMessage(database, sample) : null;
                  return (
                    <button
                      className={selectedKey === item.key ? "active" : ""}
                      key={item.key}
                      onClick={() => setSelectedKey(item.key)}
                      type="button"
                    >
                      <span><strong>{sample ? formatCanId(sample) : item.id.toString(16)}</strong><small>{message?.name ?? "—"} · {item.extended ? t.ext : t.std}</small></span>
                      <b>{item.count.toLocaleString()}</b>
                      <b>{formatPeriod(item.averagePeriodMs)}</b>
                      <b className={item.jitterMs !== null && item.averagePeriodMs && item.jitterMs > item.averagePeriodMs * 0.1 ? "warn" : ""}>{formatPeriod(item.jitterMs)}</b>
                    </button>
                  );
                })}
              </div>
            </aside>

            <div className="cla-detail">
              {!selectedStats || !selectedSample ? <div className="cla-choose">{t.chooseId}</div> : (
                <>
                  <div className="cla-detail-head">
                    <div>
                      <span>{selectedStats.extended ? "29-BIT EXTENDED CAN" : "11-BIT STANDARD CAN"}</span>
                      <h1>{formatCanId(selectedSample)}</h1>
                      <p>{selectedMessage?.name ?? "DBC message name unavailable"}</p>
                    </div>
                    <div className="cla-id-badges">
                      <span>{selectedSample.type === "canfd" ? t.canFd : selectedSample.rtr ? t.rtr : t.can}</span>
                      <span>DLC {selectedStats.dlcs.join(" / ")}</span>
                      <span>{selectedStats.rxCount} Rx · {selectedStats.txCount} Tx</span>
                    </div>
                  </div>

                  <nav className="cla-tabs">
                    <button className={tab === "overview" ? "active" : ""} onClick={() => setTab("overview")} type="button">{t.overview}</button>
                    <button className={tab === "signals" ? "active" : ""} onClick={() => setTab("signals")} type="button">{t.signals}</button>
                    <button className={tab === "frames" ? "active" : ""} onClick={() => setTab("frames")} type="button">{t.rawFrames}</button>
                  </nav>

                  {tab === "overview" && (
                    <div className="cla-tab-body">
                      <div className="cla-metric-grid">
                        <article><span>{t.count}</span><strong>{selectedStats.count.toLocaleString()}</strong><small>{selectedStats.rxCount} Rx · {selectedStats.txCount} Tx</small></article>
                        <article><span>{t.period}</span><strong>{formatPeriod(selectedStats.averagePeriodMs)}</strong><small>{t.frequency}: {selectedStats.frequencyHz ? `${formatNumber(selectedStats.frequencyHz, 2)} Hz` : "—"}</small></article>
                        <article><span>{t.jitter}</span><strong>{formatPeriod(selectedStats.jitterMs)}</strong><small>{t.minMaxPeriod}: {formatPeriod(selectedStats.minPeriodMs)} / {formatPeriod(selectedStats.maxPeriodMs)}</small></article>
                        <article className={selectedStats.estimatedMissing ? "warning" : ""}><span>{t.missing}</span><strong>{selectedStats.estimatedMissing}</strong><small>{t.firstLast}: {formatNumber((selectedStats.firstMs - startTimestamp) / 1000, 3)} / {formatNumber((selectedStats.lastMs - startTimestamp) / 1000, 3)} s</small></article>
                      </div>
                      <article className="cla-card">
                        <header><div><span>01 / TIMING</span><h2>{t.timingTitle}</h2><p>{t.timingText}</p></div><strong>{formatPeriod(selectedStats.medianPeriodMs)} {t.median}</strong></header>
                        <LineChart values={intervalSeries} emptyText={t.noTiming} formatValue={(value) => formatPeriod(value)} />
                      </article>
                      <article className="cla-card">
                        <header><div><span>02 / PAYLOAD</span><h2>{t.byteActivity}</h2><p>{t.byteActivityText}</p></div><strong>{selectedStats.dlcs.join(" / ")} {t.byteUnit}</strong></header>
                        <div className="cla-byte-grid">
                          {selectedStats.byteChanges.map((changes, index) => {
                            const samples = selectedStats.byteSamples[index] || 0;
                            const rate = samples ? (changes / samples) * 100 : 0;
                            return (
                              <div key={index}>
                                <span>{t.byte} {index}</span>
                                <i style={{ "--activity": `${rate}%` } as React.CSSProperties} />
                                <strong>{formatNumber(rate, 1)}%</strong>
                                <small>{changes.toLocaleString()} / {samples.toLocaleString()}</small>
                              </div>
                            );
                          })}
                        </div>
                        <div className="cla-activity-key"><span><i />{t.unchanged}</span><span><i />{t.active}</span></div>
                      </article>
                    </div>
                  )}

                  {tab === "signals" && (
                    <div className="cla-tab-body">
                      {!database ? (
                        <div className="cla-dbc-empty"><span>DBC</span><h2>{t.noDbc}</h2><p>{t.noDbcText}</p><button onClick={() => dbcInputRef.current?.click()} type="button">{t.openDbc}</button></div>
                      ) : !selectedMessage ? (
                        <div className="cla-dbc-empty"><span>0x</span><h2>{t.noDbcMatch}</h2><p>{formatCanId(selectedSample)}</p></div>
                      ) : (
                        <>
                          <div className="cla-signal-picker">
                            <label>{t.chooseSignal}
                              <select value={selectedSignal?.uid ?? ""} onChange={(event) => setSelectedSignalUid(event.target.value)}>
                                {selectedMessage.signals.map((signal) => <option key={signal.uid} value={signal.uid}>{signal.name}{signal.unit ? ` [${signal.unit}]` : ""}</option>)}
                              </select>
                            </label>
                            <span>{selectedMessage.name} · {selectedMessage.signals.length} {t.signalUnit}</span>
                          </div>
                          {selectedSignal && (
                            <article className="cla-card cla-signal-card">
                              <header><div><span>DBC / PHYSICAL VALUE</span><h2>{selectedSignal.name}</h2><p>{selectedSignal.length} bit · factor {selectedSignal.factor} · offset {selectedSignal.offset}</p></div><strong>{selectedSignal.unit || "—"}</strong></header>
                              <LineChart values={signalSeries} emptyText={t.noTiming} color={CHART_COLORS[1]} formatValue={(value) => `${formatNumber(value, 3)} ${selectedSignal.unit}`} />
                              {signalSummary && <div className="cla-signal-summary">
                                <div><span>{t.minimum}</span><strong>{formatNumber(signalSummary.min, 5)}</strong></div>
                                <div><span>{t.maximum}</span><strong>{formatNumber(signalSummary.max, 5)}</strong></div>
                                <div><span>{t.average}</span><strong>{formatNumber(signalSummary.average, 5)}</strong></div>
                                <div><span>{t.samples}</span><strong>{signalSummary.count.toLocaleString()}</strong></div>
                              </div>}
                            </article>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {tab === "frames" && (
                    <div className="cla-tab-body">
                      <div className="cla-frame-note">{t.shownFrames}</div>
                      <div className="cla-frame-table">
                        <div className="head"><span>#</span><span>{t.time}</span><span>{t.channel}</span><span>{t.direction}</span><span>{t.dlc}</span><span>{t.data}</span></div>
                        {selectedFrames.slice(-400).reverse().map((frame) => (
                          <div key={`${frame.sequence}-${frame.timestampMs}`}>
                            <span>{frame.sequence}</span>
                            <span>{formatNumber((frame.timestampMs - startTimestamp) / 1000, 6)} s</span>
                            <span>{frame.channel}</span>
                            <span>{frame.direction.toUpperCase()}</span>
                            <span>{frame.data.length}</span>
                            <code>{frame.rtr ? "RTR" : formatData(frame.data)}</code>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>

          {(log.warnings.length > 0 || log.skippedLines > 0) && (
            <details className="cla-warnings">
              <summary>{t.warnings} · {log.skippedLines} {t.skipped}</summary>
              {log.warnings.map((warning) => <p key={warning}>{warning}</p>)}
            </details>
          )}

          {reportDialogOpen && (
            <div
              className="cla-report-dialog-backdrop"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) setReportDialogOpen(false);
              }}
              role="presentation"
            >
              <section
                aria-labelledby="cla-report-dialog-title"
                aria-modal="true"
                className="cla-report-dialog"
                role="dialog"
              >
                <header>
                  <div>
                    <span>PDF / REPORT</span>
                    <h2 id="cla-report-dialog-title">{t.reportOptionsTitle}</h2>
                    <p>{t.reportOptionsText}</p>
                  </div>
                  <button
                    aria-label={t.cancel}
                    className="cla-report-dialog-close"
                    onClick={() => setReportDialogOpen(false)}
                    type="button"
                  >
                    ×
                  </button>
                </header>

                <div className="cla-report-dialog-summary">
                  <div><span>{t.file}</span><strong>{log.name}</strong></div>
                  <div><span>{t.filteredRange}</span><strong>{formatDuration(rangeDuration)}</strong></div>
                  <div><span>{t.dbcFile}</span><strong>{database ? dbcName : t.notLoaded}</strong></div>
                </div>

                <div className="cla-report-signal-toolbar">
                  <div>
                    <strong>{t.reportSignals}</strong>
                    <small>{selectedReportSignalKeys.length} / {MAX_REPORT_SIGNALS} {t.reportSelected}</small>
                  </div>
                  {reportSignalCandidates.length > 0 && (
                    <div>
                      <button
                        onClick={() =>
                          setSelectedReportSignalKeys(
                            reportSignalCandidates
                              .slice(0, MAX_REPORT_SIGNALS)
                              .map((candidate) => candidate.key),
                          )
                        }
                        type="button"
                      >
                        {t.selectAll}
                      </button>
                      <button onClick={() => setSelectedReportSignalKeys([])} type="button">
                        {t.clearAll}
                      </button>
                    </div>
                  )}
                </div>

                {!database ? (
                  <div className="cla-report-dialog-empty"><span>DBC</span><p>{t.reportNoDbc}</p></div>
                ) : reportSignalCandidates.length === 0 ? (
                  <div className="cla-report-dialog-empty"><span>0x</span><p>{t.reportNoSignals}</p></div>
                ) : (
                  <>
                    <p className="cla-report-signal-hint">{t.reportSignalsHint}</p>
                    <div className="cla-report-signal-list">
                      {reportSignalCandidates.map((candidate) => {
                        const selected = selectedReportSignalKeys.includes(candidate.key);
                        return (
                          <label className={selected ? "selected" : ""} key={candidate.key}>
                            <input
                              checked={selected}
                              onChange={() => toggleReportSignal(candidate.key)}
                              type="checkbox"
                            />
                            <span>
                              <strong>{candidate.signal.name}</strong>
                              <small>{candidate.message.name} · {formatCanId(candidate.message)}</small>
                            </span>
                            <b>{candidate.signal.unit || "—"}</b>
                          </label>
                        );
                      })}
                    </div>
                  </>
                )}

                <footer>
                  <button onClick={() => setReportDialogOpen(false)} type="button">{t.cancel}</button>
                  <button className="primary" onClick={printConfiguredReport} type="button">
                    {t.generatePdf}<b>↗</b>
                  </button>
                </footer>
              </section>
            </div>
          )}

          <section className="cla-print-report">
            <header className="cla-print-report-header">
              <div>
                <span>CAN LOG ANALYZER</span>
                <h1>{t.reportTitle}</h1>
                <p>{t.reportGeneratedBy}</p>
              </div>
              <strong>{new Date().toLocaleDateString(language === "tr" ? "tr-TR" : "en-GB")}</strong>
            </header>

            <section className="cla-print-report-meta">
              <div><span>{t.file}</span><strong>{log.name}</strong><small>{log.formatLabel}</small></div>
              <div><span>{t.dbcFile}</span><strong>{database ? dbcName : t.notLoaded}</strong><small>{database ? `${database.messages.length} ${t.messageList.toLocaleLowerCase()}` : t.noDbc}</small></div>
              <div><span>{t.filteredRange}</span><strong>{formatDuration(rangeDuration)}</strong><small>{formatNumber((rangeStartMs - startTimestamp) / 1000, 3)}–{formatNumber((rangeEndMs - startTimestamp) / 1000, 3)} s</small></div>
              <div><span>{t.reportDate}</span><strong>{new Date().toLocaleDateString(language === "tr" ? "tr-TR" : "en-GB")}</strong><small>{new Date().toLocaleTimeString(language === "tr" ? "tr-TR" : "en-GB")}</small></div>
            </section>

            <section className="cla-print-report-section">
              <div className="cla-print-section-heading">
                <span>01 / OVERVIEW</span>
                <h2>{t.reportSummary}</h2>
              </div>
              <div className="cla-print-kpis">
                <article><span>{t.frames}</span><strong>{rangeFrames.length.toLocaleString()}</strong><small>{log.frames.length.toLocaleString()} {t.total}</small></article>
                <article><span>{t.ids}</span><strong>{stats.length}</strong><small>{stats.filter((item) => item.extended).length} EXT</small></article>
                <article><span>{t.duration}</span><strong>{formatDuration(rangeDuration)}</strong><small>{formatDuration(log.durationMs)} {t.total}</small></article>
                <article><span>{t.rate}</span><strong>{formatNumber(averageRate, 1)}</strong><small>frame/s</small></article>
                <article><span>{t.dbcMatch}</span><strong>{database && rangeFrames.length ? `${formatNumber((dbcMatchedFrames / rangeFrames.length) * 100, 1)}%` : "—"}</strong><small>{database ? `${dbcMatchedFrames.toLocaleString()} ${t.matchedFrames.toLocaleLowerCase()}` : t.noDbc}</small></article>
              </div>
            </section>

            <section className="cla-print-report-section">
              <div className="cla-print-section-heading">
                <span>02 / TIMING</span>
                <h2>{t.reportMessageAnalysis}</h2>
              </div>
              <table>
                <thead><tr><th>{t.id}</th><th>{t.name}</th><th>{t.count}</th><th>{t.period}</th><th>{t.jitter}</th><th>{t.minMaxPeriod}</th><th>{t.missing}</th></tr></thead>
                <tbody>{sortedStats.map((item) => {
                  const sample = sampleByKey.get(item.key);
                  return <tr key={item.key}><td>{sample ? formatCanId(sample) : item.id}</td><td>{sample ? findDbcMessage(database, sample)?.name ?? "—" : "—"}</td><td>{item.count}</td><td>{formatPeriod(item.averagePeriodMs)}</td><td>{formatPeriod(item.jitterMs)}</td><td>{formatPeriod(item.minPeriodMs)} / {formatPeriod(item.maxPeriodMs)}</td><td>{item.estimatedMissing}</td></tr>;
                })}</tbody>
              </table>
            </section>

            {reportSignalAnalyses.length > 0 && (
              <section className="cla-print-report-section cla-print-signal-section">
                <div className="cla-print-section-heading">
                  <span>03 / DBC</span>
                  <h2>{t.reportSignalAnalysis}</h2>
                  <p>{t.reportSignalAnalysisText}</p>
                </div>
                {reportSignalAnalyses.map((analysis, index) => (
                  <article className="cla-print-signal-card" key={analysis.key}>
                    <header>
                      <div>
                        <span>{String(index + 1).padStart(2, "0")} · {formatCanId(analysis.message)} · {analysis.message.name}</span>
                        <h3>{analysis.signal.name}</h3>
                        <p>{analysis.signal.length} bit · factor {analysis.signal.factor} · offset {analysis.signal.offset}</p>
                      </div>
                      <strong>{analysis.signal.unit || "—"}</strong>
                    </header>
                    <LineChart
                      color={CHART_COLORS[index % CHART_COLORS.length]}
                      emptyText={t.noTiming}
                      formatValue={(value) => `${formatNumber(value, 3)} ${analysis.signal.unit}`}
                      values={analysis.series}
                    />
                    <div className="cla-print-signal-stats">
                      <div><span>{t.minimum}</span><strong>{formatNumber(analysis.summary.min, 5)}</strong></div>
                      <div><span>{t.maximum}</span><strong>{formatNumber(analysis.summary.max, 5)}</strong></div>
                      <div><span>{t.average}</span><strong>{formatNumber(analysis.summary.average, 5)}</strong></div>
                      <div><span>{t.samples}</span><strong>{analysis.summary.count.toLocaleString()}</strong></div>
                    </div>
                  </article>
                ))}
              </section>
            )}

            <footer className="cla-print-report-footer">
              <span>{t.reportGeneratedBy}</span>
              <small>{t.printHint}</small>
            </footer>
          </section>
        </>
      )}

      {toast && <div className="cla-toast" role="status">{toast}</div>}
    </main>
  );
}
