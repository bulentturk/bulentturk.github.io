"use client";

import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  activeMessageSignals,
  createInitialSignalValues,
  encodeMessagePayload,
  physicalToRaw,
  rawToPhysical,
  signalPhysicalBounds,
  type SignalValueMap,
} from "./can/encode";
import {
  createExampleDatabase,
  displayCanId,
  parseDbc,
  type DbcDatabase,
  type DbcMessage,
  type DbcSignal,
} from "./dbc/dbc";
import "./dbc-ecu-simulator.css";

type Language = "tr" | "en";
type NumericFormat = "hex" | "decimal";

type BridgeStatus = {
  ok: boolean;
  version?: string;
  connected?: boolean;
  channel?: number;
  bitrate?: number;
  listenOnly?: boolean;
  error?: string;
  sent?: number;
};

type SimulationMessage = {
  uid: number;
  messageUid: string;
  id: number;
  extended: boolean;
  cycleMs: number;
  values: SignalValueMap;
  enabled: boolean;
  sentCount: number;
  lastSentAt: number | null;
};

const BRIDGE_URL = "http://127.0.0.1:8765/api";
const MAX_DBC_SIZE = 20 * 1024 * 1024;
const bitrates = [1_000_000, 800_000, 500_000, 250_000, 125_000, 100_000, 83_333, 50_000, 20_000, 10_000];

const copy = {
  tr: {
    back: "Araçlar",
    title: "DBC ECU Simülatörü",
    subtitle: "DBC mesajlarını sinyal kontrollerine dönüştürün; Standard veya Extended CAN frame’lerini tek seferlik ya da periyodik gönderin.",
    local: "DBC dosyası ve sinyal değerleri tarayıcınızda kalır",
    bridge: "Yerel köprü",
    device: "PCAN bağlantısı",
    ready: "Hazır",
    missing: "Bulunamadı",
    connected: "Gönderime bağlı",
    disconnected: "Bağlı değil",
    channel: "Kanal",
    bitrate: "Bit hızı",
    connect: "Gönderme modunda bağlan",
    disconnect: "Bağlantıyı kes",
    demo: "Çevrim demosu",
    stopDemo: "Demoyu durdur",
    safety: "CAN mesajlarının bağlı makinede beklenmeyen hareket veya fonksiyon oluşturabileceğini anlıyorum.",
    safetyText: "Bağlantı yalnız açık onaydan sonra transmit modunda kurulur. ID, sinyal değerleri ve makine durumunu doğrulayın.",
    loadTitle: "DBC’den mesaj oluştur",
    loadIntro: "Dosyadaki ECU/node ve mesaj tanımlarını kullanarak sinyal editörlerini otomatik oluşturun.",
    loadDbc: "DBC yükle",
    exampleDbc: "J1939 örneğini yükle",
    noDbc: "Henüz DBC yüklenmedi",
    loaded: "yüklendi",
    invalidDbc: "DBC dosyası okunamadı.",
    largeDbc: "DBC dosyası 20 MB sınırını aşıyor.",
    node: "ECU / Node",
    allNodes: "Tüm mesajlar",
    message: "Mesaj",
    addMessage: "Mesajı simülasyona ekle",
    standard: "STD · 11 bit",
    extended: "EXT · 29 bit",
    formatDetected: "DBC’den algılandı",
    formatHelp: "DBC hem Standard hem Extended mesaj içerebilir. Format her mesaj için ayrı korunur.",
    display: "Gösterim",
    idDisplay: "CAN ID",
    dataDisplay: "Payload",
    emptyTitle: "Simülasyon mesajı bekleniyor",
    emptyText: "DBC yükleyin, bir mesaj seçin ve simülasyon listesine ekleyin.",
    cycle: "Cycle",
    cycleHint: "10–60000 ms",
    signal: "Sinyal",
    physical: "Fiziksel değer",
    raw: "Raw",
    payload: "Canlı payload",
    sendOnce: "Bir kez gönder",
    start: "Periyodik başlat",
    stop: "Durdur",
    remove: "Kaldır",
    running: "Çalışıyor",
    stopped: "Durdu",
    sent: "Gönderim",
    noSignals: "Bu mesajda düzenlenebilir sinyal bulunmuyor.",
    txRequired: "Göndermek için PCAN bağlantısını kurun veya çevrim demosunu açın.",
    sendFailed: "CAN mesajı gönderilemedi.",
    invalidCycle: "Cycle değeri 10–60000 ms arasında tam sayı olmalıdır.",
    classicOnly: "Bu ilk sürüm klasik CAN içindir; DLC 8 üzerindeki CAN FD mesajı gönderilemez.",
    bridgeMissing: "Yerel köprüye ulaşılamadı. CAN Viewer köprü paketini çalıştırın.",
    bridgeUpgrade: "Gönderme için PCAN Local Bridge v1.2.0 veya üzeri gerekir.",
    noMessages: "Seçilen node için mesaj bulunamadı.",
    summary: "DBC özeti",
  },
  en: {
    back: "Tools",
    title: "DBC ECU Simulator",
    subtitle: "Turn DBC messages into signal controls and transmit Standard or Extended CAN frames once or cyclically.",
    local: "DBC files and signal values stay in your browser",
    bridge: "Local bridge",
    device: "PCAN connection",
    ready: "Ready",
    missing: "Not found",
    connected: "Connected for transmission",
    disconnected: "Not connected",
    channel: "Channel",
    bitrate: "Bit rate",
    connect: "Connect in transmit mode",
    disconnect: "Disconnect",
    demo: "Cycle demo",
    stopDemo: "Stop demo",
    safety: "I understand that CAN transmission may trigger unexpected motion or functions on the connected machine.",
    safetyText: "The bridge connects in transmit mode only after explicit acknowledgement. Verify IDs, signal values, and machine state.",
    loadTitle: "Build messages from DBC",
    loadIntro: "Use ECU/node and message definitions from the file to generate signal editors automatically.",
    loadDbc: "Load DBC",
    exampleDbc: "Load J1939 example",
    noDbc: "No DBC loaded",
    loaded: "loaded",
    invalidDbc: "The DBC file could not be parsed.",
    largeDbc: "The DBC file exceeds the 20 MB limit.",
    node: "ECU / Node",
    allNodes: "All messages",
    message: "Message",
    addMessage: "Add message to simulation",
    standard: "STD · 11 bit",
    extended: "EXT · 29 bit",
    formatDetected: "Detected from DBC",
    formatHelp: "A DBC may contain both Standard and Extended messages. Format is preserved per message.",
    display: "Display",
    idDisplay: "CAN ID",
    dataDisplay: "Payload",
    emptyTitle: "Waiting for simulation messages",
    emptyText: "Load a DBC, select a message, and add it to the simulation list.",
    cycle: "Cycle",
    cycleHint: "10–60000 ms",
    signal: "Signal",
    physical: "Physical value",
    raw: "Raw",
    payload: "Live payload",
    sendOnce: "Send once",
    start: "Start cyclic",
    stop: "Stop",
    remove: "Remove",
    running: "Running",
    stopped: "Stopped",
    sent: "Sent",
    noSignals: "This message has no editable signals.",
    txRequired: "Connect PCAN or enable the cycle demo to transmit.",
    sendFailed: "The CAN message could not be transmitted.",
    invalidCycle: "Cycle must be an integer between 10 and 60000 ms.",
    classicOnly: "This first release uses classic CAN; CAN FD messages above DLC 8 cannot be sent.",
    bridgeMissing: "The local bridge could not be reached. Start the CAN Viewer bridge package.",
    bridgeUpgrade: "PCAN Local Bridge v1.2.0 or newer is required for transmission.",
    noMessages: "No messages were found for the selected node.",
    summary: "DBC summary",
  },
} as const;

async function bridgeRequest<T>(path: string, options: RequestInit = {}, timeoutMs = 1800): Promise<T> {
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

function formatId(id: number, extended: boolean, format: NumericFormat): string {
  if (format === "decimal") return id.toString(10);
  return displayCanId({ id, extended });
}

function formatPayload(data: number[], format: NumericFormat): string {
  return data.map((byte) => format === "hex"
    ? byte.toString(16).toUpperCase().padStart(2, "0")
    : byte.toString(10)).join(" ");
}

function formatPhysical(value: number): string {
  if (!Number.isFinite(value)) return "0";
  return Number(value.toPrecision(10)).toString();
}

function signalStep(signal: DbcSignal): number {
  const factor = Math.abs(signal.factor);
  if (!Number.isFinite(factor) || factor === 0) return 1;
  return factor;
}

export default function DbcEcuSimulator() {
  const [language, setLanguage] = useState<Language>("tr");
  const [database, setDatabase] = useState<DbcDatabase | null>(null);
  const [dbcName, setDbcName] = useState("");
  const [selectedNode, setSelectedNode] = useState("*");
  const [selectedMessageUid, setSelectedMessageUid] = useState("");
  const [simulations, setSimulations] = useState<SimulationMessage[]>([]);
  const [bridge, setBridge] = useState<BridgeStatus>({ ok: false, connected: false });
  const [channel, setChannel] = useState(1);
  const [bitrate, setBitrate] = useState(250_000);
  const [acknowledged, setAcknowledged] = useState(false);
  const [demo, setDemo] = useState(false);
  const [busy, setBusy] = useState(false);
  const [idFormat, setIdFormat] = useState<NumericFormat>("hex");
  const [dataFormat, setDataFormat] = useState<NumericFormat>("hex");
  const [toast, setToast] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const simulationsRef = useRef<SimulationMessage[]>([]);
  const timersRef = useRef<Map<number, number>>(new Map());
  const nextUidRef = useRef(1);
  const t = copy[language];

  const replaceSimulations = useCallback((next: SimulationMessage[]) => {
    simulationsRef.current = next;
    setSimulations(next);
  }, []);

  const stopAll = useCallback(() => {
    for (const timer of timersRef.current.values()) window.clearTimeout(timer);
    timersRef.current.clear();
    if (simulationsRef.current.some((item) => item.enabled)) {
      replaceSimulations(simulationsRef.current.map((item) => ({ ...item, enabled: false })));
    }
  }, [replaceSimulations]);

  const refreshBridge = useCallback(async () => {
    try {
      setBridge(await bridgeRequest<BridgeStatus>("/status"));
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
    const timer = window.setInterval(() => void refreshBridge(), 2500);
    return () => window.clearInterval(timer);
  }, [refreshBridge]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => () => stopAll(), [stopAll]);

  useEffect(() => {
    if (demo || (bridge.connected && bridge.listenOnly === false)) return;
    stopAll();
  }, [bridge.connected, bridge.listenOnly, demo, stopAll]);

  const filteredMessages = useMemo(() => {
    if (!database) return [];
    return database.messages.filter((message) =>
      selectedNode === "*" || message.transmitter === selectedNode,
    );
  }, [database, selectedNode]);

  const selectedMessage = useMemo(
    () => filteredMessages.find((message) => message.uid === selectedMessageUid) ?? filteredMessages[0] ?? null,
    [filteredMessages, selectedMessageUid],
  );

  const messageByUid = useMemo(
    () => new Map(database?.messages.map((message) => [message.uid, message]) ?? []),
    [database],
  );

  const counts = useMemo(() => ({
    standard: database?.messages.filter((message) => !message.extended).length ?? 0,
    extended: database?.messages.filter((message) => message.extended).length ?? 0,
  }), [database]);

  function stopMessage(uid: number) {
    const timer = timersRef.current.get(uid);
    if (timer !== undefined) window.clearTimeout(timer);
    timersRef.current.delete(uid);
    replaceSimulations(simulationsRef.current.map((item) =>
      item.uid === uid ? { ...item, enabled: false } : item,
    ));
  }

  async function connect() {
    if (!acknowledged) return;
    setBusy(true);
    setDemo(false);
    try {
      const result = await bridgeRequest<BridgeStatus>("/connect", {
        method: "POST",
        body: JSON.stringify({ channel, bitrate, listenOnly: false }),
      });
      setBridge(result);
      if (!result.ok || !result.connected) setToast(result.error || t.bridgeMissing);
      else if (result.listenOnly !== false) setToast(t.bridgeUpgrade);
    } catch {
      setToast(t.bridgeMissing);
    } finally {
      setBusy(false);
    }
  }

  async function disconnect() {
    stopAll();
    setBusy(true);
    try {
      setBridge(await bridgeRequest<BridgeStatus>("/disconnect", {
        method: "POST",
        body: "{}",
      }));
    } catch {
      setBridge({ ok: false, connected: false });
    } finally {
      setBusy(false);
      setAcknowledged(false);
    }
  }

  function useDatabase(next: DbcDatabase, name: string) {
    stopAll();
    setDatabase(next);
    setDbcName(name);
    setSelectedNode("*");
    setSelectedMessageUid(next.messages[0]?.uid ?? "");
    replaceSimulations([]);
    setToast(`${name} ${t.loaded}.`);
  }

  async function openDbc(file: File) {
    if (file.size > MAX_DBC_SIZE) {
      setToast(t.largeDbc);
      return;
    }
    try {
      useDatabase(parseDbc(await file.text(), file.name), file.name);
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
    useDatabase(example, example.name);
  }

  function addMessage() {
    if (!selectedMessage) return;
    const existing = simulationsRef.current.find((item) => item.messageUid === selectedMessage.uid);
    if (existing) {
      document.getElementById(`sim-message-${existing.uid}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    const item: SimulationMessage = {
      uid: nextUidRef.current++,
      messageUid: selectedMessage.uid,
      id: selectedMessage.id,
      extended: selectedMessage.extended,
      cycleMs: Math.min(60000, Math.max(10, Math.round(selectedMessage.cycleTime ?? 100))),
      values: createInitialSignalValues(selectedMessage),
      enabled: false,
      sentCount: 0,
      lastSentAt: null,
    };
    replaceSimulations([...simulationsRef.current, item]);
    window.requestAnimationFrame(() =>
      document.getElementById(`sim-message-${item.uid}`)?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }

  function updateSimulation(uid: number, updater: (item: SimulationMessage) => SimulationMessage) {
    replaceSimulations(simulationsRef.current.map((item) => item.uid === uid ? updater(item) : item));
  }

  async function sendPayload(item: SimulationMessage, message: DbcMessage): Promise<boolean> {
    if (message.dlc > 8) {
      setToast(t.classicOnly);
      return false;
    }
    if (demo) return true;
    if (!bridge.connected || bridge.listenOnly !== false) {
      setToast(t.txRequired);
      return false;
    }
    try {
      const result = await bridgeRequest<{ ok: boolean; error?: string }>("/send", {
        method: "POST",
        body: JSON.stringify({
          id: item.id,
          extended: item.extended,
          data: encodeMessagePayload(message, item.values),
        }),
      });
      if (!result.ok) setToast(result.error || t.sendFailed);
      return result.ok;
    } catch {
      setToast(t.sendFailed);
      return false;
    }
  }

  async function sendOnce(uid: number) {
    const item = simulationsRef.current.find((candidate) => candidate.uid === uid);
    const message = item ? messageByUid.get(item.messageUid) : null;
    if (!item || !message) return;
    if (await sendPayload(item, message)) {
      updateSimulation(uid, (current) => ({
        ...current,
        sentCount: current.sentCount + 1,
        lastSentAt: Date.now(),
      }));
    }
  }

  async function runCyclic(uid: number) {
    const item = simulationsRef.current.find((candidate) => candidate.uid === uid);
    const message = item ? messageByUid.get(item.messageUid) : null;
    if (!item?.enabled || !message) return;
    const startedAt = performance.now();
    if (!(await sendPayload(item, message))) {
      stopMessage(uid);
      return;
    }
    updateSimulation(uid, (current) => ({
      ...current,
      sentCount: current.sentCount + 1,
      lastSentAt: Date.now(),
    }));
    const current = simulationsRef.current.find((candidate) => candidate.uid === uid);
    if (!current?.enabled) return;
    const remaining = Math.max(0, current.cycleMs - (performance.now() - startedAt));
    timersRef.current.set(uid, window.setTimeout(() => void runCyclic(uid), remaining));
  }

  function startCyclic(uid: number) {
    const item = simulationsRef.current.find((candidate) => candidate.uid === uid);
    if (!item) return;
    if (!Number.isInteger(item.cycleMs) || item.cycleMs < 10 || item.cycleMs > 60000) {
      setToast(t.invalidCycle);
      return;
    }
    if (!demo && (!bridge.connected || bridge.listenOnly !== false)) {
      setToast(t.txRequired);
      return;
    }
    updateSimulation(uid, (current) => ({ ...current, enabled: true }));
    void runCyclic(uid);
  }

  function toggleDemo() {
    if (demo) {
      stopAll();
      setDemo(false);
    } else {
      setDemo(true);
    }
  }

  function changeSignal(uid: number, signalUid: string, value: number) {
    updateSimulation(uid, (item) => ({
      ...item,
      values: { ...item.values, [signalUid]: value },
    }));
  }

  function removeMessage(uid: number) {
    stopMessage(uid);
    replaceSimulations(simulationsRef.current.filter((item) => item.uid !== uid));
  }

  const transmitReady = demo || (bridge.connected && bridge.listenOnly === false);

  return (
    <main className="dbc-simulator">
      <header className="sim-header">
        <a href="/tools/">← {t.back}</a>
        <div><span>CAN / DBC / J1939</span><strong>{t.title}</strong></div>
        <div className="sim-language">
          <button className={language === "tr" ? "is-active" : ""} type="button" onClick={() => setLanguage("tr")}>TR</button>
          <i>/</i>
          <button className={language === "en" ? "is-active" : ""} type="button" onClick={() => setLanguage("en")}>EN</button>
        </div>
      </header>

      <section className="sim-hero">
        <div><p>DBC → SIGNAL → CAN FRAME</p><h1>{t.title}</h1><h2>{t.subtitle}</h2></div>
        <aside><span><i />{t.local}</span><small>{t.formatHelp}</small></aside>
      </section>

      <section className="sim-connection">
        <div className="sim-status"><span>{t.bridge}</span><strong className={bridge.ok ? "is-online" : ""}><i />{bridge.ok ? t.ready : t.missing}</strong><small>{bridge.version ? `v${bridge.version}` : "127.0.0.1:8765"}</small></div>
        <div className="sim-status"><span>{t.device}</span><strong className={bridge.connected ? "is-online" : ""}><i />{bridge.connected ? t.connected : t.disconnected}</strong><small>{bridge.connected ? `PCAN_USBBUS${bridge.channel ?? channel}` : "PCAN-USB"}</small></div>
        <label><span>{t.channel}</span><select value={channel} disabled={Boolean(bridge.connected)} onChange={(event) => setChannel(Number(event.target.value))}>{Array.from({ length: 16 }, (_, index) => <option value={index + 1} key={index}>PCAN_USBBUS{index + 1}</option>)}</select></label>
        <label><span>{t.bitrate}</span><select value={bitrate} disabled={Boolean(bridge.connected)} onChange={(event) => setBitrate(Number(event.target.value))}>{bitrates.map((value) => <option value={value} key={value}>{value >= 1_000_000 ? "1 Mbit/s" : `${value / 1000} kbit/s`}</option>)}</select></label>
        <div className="sim-connect-actions">
          <button className="is-primary" type="button" disabled={busy || (!bridge.connected && !acknowledged)} onClick={() => void (bridge.connected ? disconnect() : connect())}>{bridge.connected ? t.disconnect : t.connect}</button>
          <button type="button" disabled={busy || Boolean(bridge.connected)} onClick={toggleDemo}>{demo ? t.stopDemo : t.demo}</button>
        </div>
      </section>

      {!bridge.connected && !demo ? <section className="sim-safety"><div><strong>TX SAFETY</strong><p>{t.safetyText}</p></div><label><input type="checkbox" checked={acknowledged} onChange={(event) => setAcknowledged(event.target.checked)} /><span>{t.safety}</span></label></section> : null}

      <section className="sim-config">
        <div className="sim-config-head"><span>DBC / 01</span><div><h2>{t.loadTitle}</h2><p>{t.loadIntro}</p></div><strong>{dbcName || t.noDbc}</strong></div>
        <div className="sim-load-row">
          <input ref={fileRef} type="file" accept=".dbc,text/plain" hidden onChange={onDbcChange} />
          <button type="button" onClick={() => fileRef.current?.click()}>{t.loadDbc}</button>
          <button type="button" onClick={loadExample}>{t.exampleDbc}</button>
          {database ? <div className="sim-dbc-summary"><span>{t.summary}</span><strong>{database.messages.length} message · {counts.standard} STD · {counts.extended} EXT · {database.nodes.length} node</strong></div> : null}
        </div>

        {database ? <div className="sim-message-picker">
          <label><span>{t.node}</span><select value={selectedNode} onChange={(event) => { setSelectedNode(event.target.value); setSelectedMessageUid(""); }}><option value="*">{t.allNodes}</option>{database.nodes.map((node) => <option value={node} key={node}>{node}</option>)}</select></label>
          <label><span>{t.message}</span><select value={selectedMessage?.uid ?? ""} onChange={(event) => setSelectedMessageUid(event.target.value)} disabled={!filteredMessages.length}>{filteredMessages.map((message) => <option value={message.uid} key={message.uid}>{message.name} · {displayCanId(message)} · {message.extended ? "EXT" : "STD"} · {message.dlc} B</option>)}</select><small>{!filteredMessages.length ? t.noMessages : t.formatDetected}</small></label>
          <button type="button" disabled={!selectedMessage} onClick={addMessage}>{t.addMessage} →</button>
        </div> : null}
      </section>

      <section className="sim-display-bar">
        <strong>{t.display}</strong>
        <div><span>{t.idDisplay}</span><div><button className={idFormat === "hex" ? "is-active" : ""} onClick={() => setIdFormat("hex")} type="button">HEX</button><button className={idFormat === "decimal" ? "is-active" : ""} onClick={() => setIdFormat("decimal")} type="button">DEC</button></div></div>
        <div><span>{t.dataDisplay}</span><div><button className={dataFormat === "hex" ? "is-active" : ""} onClick={() => setDataFormat("hex")} type="button">HEX</button><button className={dataFormat === "decimal" ? "is-active" : ""} onClick={() => setDataFormat("decimal")} type="button">DEC</button></div></div>
      </section>

      <section className="sim-workspace">
        {!simulations.length ? <div className="sim-empty"><div><i /><i /><i /></div><h2>{t.emptyTitle}</h2><p>{t.emptyText}</p></div> : simulations.map((item) => {
          const message = messageByUid.get(item.messageUid);
          if (!message) return null;
          const signals = activeMessageSignals(message, item.values);
          const payload = encodeMessagePayload(message, item.values);
          return <article className={`sim-message-card${item.enabled ? " is-running" : ""}`} id={`sim-message-${item.uid}`} key={item.uid}>
            <header>
              <div className="sim-message-index"><span>MSG</span><strong>{String(item.uid).padStart(2, "0")}</strong></div>
              <div className="sim-message-title"><span>{message.transmitter || "Vector__XXX"}</span><h2>{message.name}</h2><p>{formatId(item.id, item.extended, idFormat)} · DLC {message.dlc} · {message.cycleTime ? `DBC cycle ${message.cycleTime} ms` : "manual cycle"}</p></div>
              <div className="sim-message-state"><span className={item.enabled ? "is-live" : ""}><i />{item.enabled ? t.running : t.stopped}</span><small>{t.sent}: {item.sentCount.toLocaleString()}</small></div>
              <button className="sim-remove" type="button" onClick={() => removeMessage(item.uid)}>×<span>{t.remove}</span></button>
            </header>

            <div className="sim-message-settings">
              <label><span>{t.idDisplay}</span><strong>{formatId(item.id, item.extended, idFormat)}</strong></label>
              <label><span>{t.formatDetected}</span><select value={item.extended ? "extended" : "standard"} onChange={(event) => updateSimulation(item.uid, (current) => ({ ...current, extended: event.target.value === "extended" }))}><option value="standard" disabled={item.id > 0x7ff}>{t.standard}</option><option value="extended">{t.extended}</option></select></label>
              <label><span>{t.cycle} (ms)</span><input type="number" min={10} max={60000} step={1} value={item.cycleMs} onChange={(event) => updateSimulation(item.uid, (current) => ({ ...current, cycleMs: Number(event.target.value) }))} /><small>{t.cycleHint}</small></label>
              <div className="sim-payload"><span>{t.payload}</span><code>{formatPayload(payload, dataFormat) || "—"}</code></div>
            </div>

            <div className="sim-signal-head"><span>{t.signal}</span><span>{t.physical}</span><span>{t.raw}</span></div>
            {!signals.length ? <p className="sim-no-signals">{t.noSignals}</p> : <div className="sim-signals">{signals.map((signal) => {
              const bounds = signalPhysicalBounds(signal);
              const value = item.values[signal.uid] ?? 0;
              const raw = physicalToRaw(signal, value);
              const useSlider = Number.isFinite(bounds.minimum) && Number.isFinite(bounds.maximum) && bounds.maximum > bounds.minimum && bounds.maximum - bounds.minimum <= 10_000_000;
              return <div className="sim-signal-row" key={signal.uid}>
                <div className="sim-signal-name"><strong>{signal.name}</strong><small>{signal.startBit}|{signal.length} · {signal.byteOrder === "little" ? "Intel" : "Motorola"}{signal.multiplex ? ` · ${signal.multiplex}` : ""}</small></div>
                <div className="sim-signal-control">
                  {signal.values.length ? <select value={String(Math.round(raw))} onChange={(event) => changeSignal(item.uid, signal.uid, rawToPhysical(signal, Number(event.target.value)))}>{signal.values.map((option) => <option value={option.value} key={`${option.value}-${option.label}`}>{option.label} · {option.value}</option>)}</select> : <><div><input type="number" min={bounds.minimum} max={bounds.maximum} step={signalStep(signal)} value={formatPhysical(value)} onChange={(event) => changeSignal(item.uid, signal.uid, Number(event.target.value))} /><span>{signal.unit || "—"}</span></div>{useSlider ? <input type="range" min={bounds.minimum} max={bounds.maximum} step={signalStep(signal)} value={Math.min(bounds.maximum, Math.max(bounds.minimum, value))} onChange={(event) => changeSignal(item.uid, signal.uid, Number(event.target.value))} /> : null}</>}
                </div>
                <code>{formatPhysical(raw)}</code>
              </div>;
            })}</div>}

            {message.dlc > 8 ? <p className="sim-fd-warning">{t.classicOnly}</p> : null}
            <footer>
              <button type="button" disabled={!transmitReady || message.dlc > 8} onClick={() => void sendOnce(item.uid)}>{t.sendOnce}</button>
              <button className={item.enabled ? "is-stop" : ""} type="button" disabled={!transmitReady || message.dlc > 8} onClick={() => item.enabled ? stopMessage(item.uid) : startCyclic(item.uid)}>{item.enabled ? t.stop : t.start}</button>
            </footer>
          </article>;
        })}
      </section>

      <footer className="sim-footer"><p>ALGO TEAM · DBC ECU Simulator</p><p>CAN · J1939 · PCAN-BASIC</p></footer>
      {toast ? <div className="sim-toast" role="status">{toast}</div> : null}
    </main>
  );
}
