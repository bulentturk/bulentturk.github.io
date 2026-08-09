import {
  type ChangeEvent,
  type DragEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  cloneMessage,
  cloneSignal,
  computeSignalBits,
  createDatabase,
  createExampleDatabase,
  createMessage,
  createSignal,
  displayCanId,
  parseCanId,
  parseDbc,
  serializeDbc,
  validateDbc,
  type DbcDatabase,
  type DbcMessage,
  type DbcSignal,
  type ValidationIssue,
} from "./dbc/dbc";
import "./dbc-editor.css";

type Language = "tr" | "en";
type WorkspaceTab = "editor" | "source" | "validation";

const DRAFT_KEY = "algo-team-dbc-editor-draft-v1";
const MAX_FILE_SIZE = 20 * 1024 * 1024;

const labels = {
  tr: {
    back: "Ana site",
    title: "Ücretsiz Online DBC Editörü",
    privacy: "CAN ve CAN FD mesajlarını ve sinyallerini düzenleyin, doğrulayın ve indirin · Dosya tarayıcıdan dışarı çıkmaz",
    new: "Yeni",
    example: "Örnek",
    guide: "PDF Kılavuzu",
    open: "DBC Aç",
    save: "DBC İndir",
    draft: "Taslağı Yükle",
    messages: "Mesajlar",
    search: "ID veya mesaj ara",
    addMessage: "Mesaj ekle",
    noMessages: "Eşleşen mesaj yok.",
    editor: "Editör",
    source: "DBC Kaynağı",
    validation: "Doğrulama",
    file: "Dosya",
    version: "Sürüm",
    nodes: "Node’lar",
    nodesHint: "Virgülle ayırın",
    message: "Mesaj",
    messageName: "Mesaj adı",
    canId: "CAN ID",
    frame: "Çerçeve",
    standard: "Standart · 11 bit",
    extended: "Extended · 29 bit",
    dlc: "DLC / byte",
    transmitter: "Gönderici",
    cycle: "Çevrim süresi",
    optional: "İsteğe bağlı",
    comment: "Açıklama",
    duplicate: "Çoğalt",
    delete: "Sil",
    signals: "Sinyaller",
    addSignal: "Sinyal ekle",
    noSignal: "Bu mesajda henüz sinyal yok.",
    signalName: "Sinyal adı",
    startBit: "Start bit",
    length: "Uzunluk",
    byteOrder: "Byte sırası",
    intel: "Intel · Little endian",
    motorola: "Motorola · Big endian",
    signed: "İşaretli",
    unsigned: "İşaretsiz",
    valueType: "Değer tipi",
    integer: "Integer",
    float: "Float · 32 bit",
    double: "Double · 64 bit",
    factor: "Factor",
    offset: "Offset",
    min: "Minimum",
    max: "Maksimum",
    unit: "Birim",
    receivers: "Alıcılar",
    multiplex: "Multiplex",
    multiplexHint: "Boş, M, m0, m1…",
    bitMap: "Bit yerleşimi",
    bitMapHint: "Bir sinyal seçmek için renkli bitlere tıklayın.",
    byte: "Byte",
    valueDescriptions: "Değer açıklamaları",
    rawValue: "Ham değer",
    description: "Açıklama",
    addValue: "Değer ekle",
    applySource: "Kaynağı uygula",
    copySource: "Kopyala",
    sourceHelp:
      "Üretilen DBC metnini burada inceleyebilir veya düzenleyip tekrar ayrıştırabilirsiniz.",
    valid: "Geçerli",
    errors: "hata",
    warnings: "uyarı",
    validationEmpty: "Hata veya uyarı bulunamadı. DBC dışa aktarılmaya hazır.",
    drop: "DBC dosyasını buraya bırakın",
    imported: "dosyası açıldı.",
    saved: "DBC dosyası indirildi.",
    copied: "DBC kaynağı panoya kopyalandı.",
    sourceApplied: "DBC kaynağı uygulandı.",
    draftLoaded: "Tarayıcı taslağı yüklendi.",
    draftMissing: "Kaydedilmiş tarayıcı taslağı bulunamadı.",
    invalidFile: "Dosya okunamadı. Geçerli bir metin tabanlı .dbc dosyası seçin.",
    tooLarge: "Dosya 20 MB sınırını aşıyor.",
    fixErrors: "İndirmeden önce doğrulama hatalarını düzeltin.",
    confirmNew: "Mevcut çalışmayı temizleyip yeni bir DBC oluşturmak istiyor musunuz?",
    confirmDeleteMessage: "Seçili mesaj ve tüm sinyalleri silinsin mi?",
    confirmDeleteSignal: "Seçili sinyal silinsin mi?",
    preserved: "Desteklenmeyen özel DBC ifadeleri korunuyor",
    messagesCount: "mesaj",
    signalsCount: "sinyal",
    offline: "Tamamen istemci tarafında · Sunucuya yükleme yok",
  },
  en: {
    back: "Main site",
    title: "Free Online DBC Editor",
    privacy: "Edit, validate, and download CAN and CAN FD messages and signals · Your file stays in this browser",
    new: "New",
    example: "Example",
    guide: "PDF Guide",
    open: "Open DBC",
    save: "Download DBC",
    draft: "Load draft",
    messages: "Messages",
    search: "Search ID or message",
    addMessage: "Add message",
    noMessages: "No matching messages.",
    editor: "Editor",
    source: "DBC Source",
    validation: "Validation",
    file: "File",
    version: "Version",
    nodes: "Nodes",
    nodesHint: "Separate with commas",
    message: "Message",
    messageName: "Message name",
    canId: "CAN ID",
    frame: "Frame",
    standard: "Standard · 11 bit",
    extended: "Extended · 29 bit",
    dlc: "DLC / bytes",
    transmitter: "Transmitter",
    cycle: "Cycle time",
    optional: "Optional",
    comment: "Comment",
    duplicate: "Duplicate",
    delete: "Delete",
    signals: "Signals",
    addSignal: "Add signal",
    noSignal: "This message has no signals yet.",
    signalName: "Signal name",
    startBit: "Start bit",
    length: "Length",
    byteOrder: "Byte order",
    intel: "Intel · Little endian",
    motorola: "Motorola · Big endian",
    signed: "Signed",
    unsigned: "Unsigned",
    valueType: "Value type",
    integer: "Integer",
    float: "Float · 32 bit",
    double: "Double · 64 bit",
    factor: "Factor",
    offset: "Offset",
    min: "Minimum",
    max: "Maximum",
    unit: "Unit",
    receivers: "Receivers",
    multiplex: "Multiplex",
    multiplexHint: "Blank, M, m0, m1…",
    bitMap: "Bit layout",
    bitMapHint: "Click a colored bit to select its signal.",
    byte: "Byte",
    valueDescriptions: "Value descriptions",
    rawValue: "Raw value",
    description: "Description",
    addValue: "Add value",
    applySource: "Apply source",
    copySource: "Copy",
    sourceHelp: "Inspect the generated DBC text or edit and parse it back into the workspace.",
    valid: "Valid",
    errors: "errors",
    warnings: "warnings",
    validationEmpty: "No errors or warnings. The DBC is ready to export.",
    drop: "Drop a DBC file here",
    imported: "was opened.",
    saved: "DBC file downloaded.",
    copied: "DBC source copied to the clipboard.",
    sourceApplied: "DBC source applied.",
    draftLoaded: "Browser draft loaded.",
    draftMissing: "No browser draft was found.",
    invalidFile: "The file could not be parsed. Choose a valid text-based .dbc file.",
    tooLarge: "The file exceeds the 20 MB limit.",
    fixErrors: "Resolve validation errors before downloading.",
    confirmNew: "Clear the current work and create a new DBC?",
    confirmDeleteMessage: "Delete the selected message and all of its signals?",
    confirmDeleteSignal: "Delete the selected signal?",
    preserved: "Unsupported custom DBC statements are preserved",
    messagesCount: "messages",
    signalsCount: "signals",
    offline: "Fully client-side · No server upload",
  },
} as const;

function Icon({ children }: { children: ReactNode }) {
  return <span className="dbc-icon" aria-hidden="true">{children}</span>;
}

function Field({
  label,
  children,
  wide = false,
  hint,
}: {
  label: string;
  children: ReactNode;
  wide?: boolean;
  hint?: string;
}) {
  return (
    <label className={`dbc-field${wide ? " dbc-field--wide" : ""}`}>
      <span>{label}</span>
      {children}
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}

function CanIdInput({
  message,
  onChange,
}: {
  message: DbcMessage;
  onChange: (id: number) => void;
}) {
  const [value, setValue] = useState(displayCanId(message));

  useEffect(() => setValue(displayCanId(message)), [message.id, message.extended]);

  return (
    <input
      className="dbc-input dbc-input--mono"
      value={value}
      onChange={(event) => {
        setValue(event.target.value);
        const parsed = parseCanId(event.target.value);
        if (parsed !== null) onChange(parsed);
      }}
      onBlur={() => setValue(displayCanId(message))}
      spellCheck={false}
    />
  );
}

function NumberInput({
  value,
  onChange,
  min,
  max,
  step = "any",
  optional = false,
  placeholder,
}: {
  value: number | null;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number | "any";
  optional?: boolean;
  placeholder?: string;
}) {
  return (
    <input
      className="dbc-input dbc-input--mono"
      type="number"
      value={value ?? ""}
      min={min}
      max={max}
      step={step}
      placeholder={placeholder}
      onChange={(event) => {
        if (optional && event.target.value === "") {
          onChange(null);
          return;
        }
        const parsed = Number(event.target.value);
        onChange(Number.isFinite(parsed) ? parsed : 0);
      }}
    />
  );
}

function issueText(issue: ValidationIssue, language: Language): string {
  if (language === "tr") return issue.text;
  const translations: Record<string, string> = {
    EMPTY_DATABASE: "The DBC does not contain any messages.",
    INVALID_NODE: "A node name is not a valid DBC identifier.",
    DUPLICATE_MESSAGE_ID: "The CAN ID is used by more than one message.",
    DUPLICATE_MESSAGE_NAME: "The message name is used more than once.",
    INVALID_MESSAGE_NAME: "The message name is not a valid DBC identifier.",
    INVALID_MESSAGE_ID: "The CAN ID is outside the selected frame range.",
    INVALID_DLC: "DLC must be between 0 and 64 bytes.",
    NON_STANDARD_FD_LENGTH: "The payload is not one of the standard CAN FD lengths.",
    INVALID_TRANSMITTER: "The transmitter is not a valid DBC identifier.",
    DUPLICATE_SIGNAL_NAME: "The signal name is used more than once in this message.",
    INVALID_SIGNAL_NAME: "The signal name is not a valid DBC identifier.",
    INVALID_START_BIT: "Start bit must be a non-negative integer.",
    INVALID_SIGNAL_LENGTH: "Signal length must be between 1 and 64 bits.",
    INVALID_FACTOR: "Factor must be finite and should not be zero.",
    MIN_GREATER_THAN_MAX: "Minimum is greater than maximum.",
    FLOAT_LENGTH: "A float signal must be 32 bits.",
    DOUBLE_LENGTH: "A double signal must be 64 bits.",
    SIGNAL_OUT_OF_BOUNDS: "The signal extends beyond the message payload.",
    SIGNAL_OVERLAP: "The signal overlaps another signal.",
  };
  return translations[issue.code] ?? issue.text;
}

function BitLayout({
  message,
  selectedSignalUid,
  onSelect,
  byteLabel,
}: {
  message: DbcMessage;
  selectedSignalUid: string | null;
  onSelect: (uid: string) => void;
  byteLabel: string;
}) {
  const signalBits = useMemo(
    () =>
      message.signals.map((signal, signalIndex) => ({
        signal,
        signalIndex,
        bits: new Set(computeSignalBits(signal)),
      })),
    [message],
  );

  return (
    <div className="dbc-bit-map" role="grid" aria-label="CAN payload bit layout">
      <div className="dbc-bit-row dbc-bit-row--head" role="row">
        <span>{byteLabel}</span>
        {[7, 6, 5, 4, 3, 2, 1, 0].map((bit) => <span key={bit}>b{bit}</span>)}
      </div>
      {Array.from({ length: Math.max(1, message.dlc) }, (_, byteIndex) => (
        <div className="dbc-bit-row" role="row" key={byteIndex}>
          <span>{byteIndex}</span>
          {[7, 6, 5, 4, 3, 2, 1, 0].map((bitInByte) => {
            const bit = byteIndex * 8 + bitInByte;
            const signals = signalBits.filter((item) => item.bits.has(bit));
            const primary = signals.at(-1);
            return (
              <button
                key={bit}
                type="button"
                className={[
                  "dbc-bit",
                  primary ? `dbc-bit--color-${primary.signalIndex % 8}` : "",
                  primary?.signal.uid === selectedSignalUid ? "is-selected" : "",
                  signals.length > 1 ? "has-conflict" : "",
                ].filter(Boolean).join(" ")}
                title={
                  signals.length
                    ? `Bit ${bit}: ${signals.map((item) => item.signal.name).join(", ")}`
                    : `Bit ${bit}`
                }
                onClick={() => primary && onSelect(primary.signal.uid)}
                disabled={!primary}
                role="gridcell"
              >
                <span>{bit}</span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default function DbcEditor() {
  const [language, setLanguage] = useState<Language>("tr");
  const [database, setDatabase] = useState<DbcDatabase>(() => createExampleDatabase());
  const [selectedMessageUid, setSelectedMessageUid] = useState<string | null>(
    () => database.messages[0]?.uid ?? null,
  );
  const [selectedSignalUid, setSelectedSignalUid] = useState<string | null>(
    () => database.messages[0]?.signals[0]?.uid ?? null,
  );
  const [tab, setTab] = useState<WorkspaceTab>("editor");
  const [query, setQuery] = useState("");
  const [dragging, setDragging] = useState(false);
  const [toast, setToast] = useState("");
  const [sourceDraft, setSourceDraft] = useState(() => serializeDbc(database));
  const fileInputRef = useRef<HTMLInputElement>(null);
  const skipInitialDraftSave = useRef(true);
  const t = labels[language];

  const selectedMessage =
    database.messages.find((message) => message.uid === selectedMessageUid) ?? database.messages[0] ?? null;
  const selectedSignal =
    selectedMessage?.signals.find((signal) => signal.uid === selectedSignalUid) ??
    selectedMessage?.signals[0] ??
    null;

  const source = useMemo(() => serializeDbc(database), [database]);
  const issues = useMemo(() => validateDbc(database), [database]);
  const errorCount = issues.filter((issue) => issue.level === "error").length;
  const warningCount = issues.length - errorCount;
  const signalCount = database.messages.reduce((total, message) => total + message.signals.length, 0);

  const filteredMessages = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return database.messages;
    return database.messages.filter(
      (message) =>
        message.name.toLowerCase().includes(normalized) ||
        displayCanId(message).toLowerCase().includes(normalized) ||
        message.id.toString().includes(normalized),
    );
  }, [database.messages, query]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title =
      language === "tr" ? "DBC Editör | ALGO TEAM" : "DBC Editor | ALGO TEAM";
  }, [language]);

  useEffect(() => {
    setSourceDraft(source);
    if (skipInitialDraftSave.current) {
      skipInitialDraftSave.current = false;
      return;
    }
    const timeout = window.setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(database));
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [database, source]);

  useEffect(() => {
    if (!selectedMessage) {
      setSelectedMessageUid(database.messages[0]?.uid ?? null);
      setSelectedSignalUid(database.messages[0]?.signals[0]?.uid ?? null);
      return;
    }
    if (!selectedSignal && selectedMessage.signals.length) {
      setSelectedSignalUid(selectedMessage.signals[0].uid);
    }
  }, [database.messages, selectedMessage, selectedSignal]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  function replaceDatabase(next: DbcDatabase) {
    setDatabase(next);
    setSelectedMessageUid(next.messages[0]?.uid ?? null);
    setSelectedSignalUid(next.messages[0]?.signals[0]?.uid ?? null);
    setTab("editor");
  }

  function updateMessage(patch: Partial<DbcMessage>) {
    if (!selectedMessage) return;
    setDatabase((current) => ({
      ...current,
      messages: current.messages.map((message) =>
        message.uid === selectedMessage.uid ? { ...message, ...patch } : message,
      ),
    }));
  }

  function updateSignal(patch: Partial<DbcSignal>) {
    if (!selectedMessage || !selectedSignal) return;
    setDatabase((current) => ({
      ...current,
      messages: current.messages.map((message) =>
        message.uid === selectedMessage.uid
          ? {
              ...message,
              signals: message.signals.map((signal) =>
                signal.uid === selectedSignal.uid ? { ...signal, ...patch } : signal,
              ),
            }
          : message,
      ),
    }));
  }

  async function openFile(file: File) {
    if (file.size > MAX_FILE_SIZE) {
      setToast(t.tooLarge);
      return;
    }
    try {
      const text = await file.text();
      const parsed = parseDbc(text, file.name);
      replaceDatabase(parsed);
      setToast(`${file.name} ${t.imported}`);
    } catch {
      setToast(t.invalidFile);
    }
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) void openFile(file);
    event.target.value = "";
  }

  function onDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void openFile(file);
  }

  function addMessage() {
    const message = createMessage(database.messages.length);
    const usedIds = new Set(database.messages.map((item) => `${item.extended}:${item.id}`));
    while (usedIds.has(`${message.extended}:${message.id}`)) message.id += 1;
    setDatabase((current) => ({ ...current, messages: [...current.messages, message] }));
    setSelectedMessageUid(message.uid);
    setSelectedSignalUid(message.signals[0]?.uid ?? null);
    setTab("editor");
  }

  function duplicateMessage() {
    if (!selectedMessage) return;
    const message = cloneMessage(selectedMessage, database.messages.length);
    const usedIds = new Set(database.messages.map((item) => `${item.extended}:${item.id}`));
    while (usedIds.has(`${message.extended}:${message.id}`)) message.id += 1;
    setDatabase((current) => ({ ...current, messages: [...current.messages, message] }));
    setSelectedMessageUid(message.uid);
    setSelectedSignalUid(message.signals[0]?.uid ?? null);
  }

  function deleteMessage() {
    if (!selectedMessage || !window.confirm(t.confirmDeleteMessage)) return;
    const index = database.messages.findIndex((message) => message.uid === selectedMessage.uid);
    const remaining = database.messages.filter((message) => message.uid !== selectedMessage.uid);
    const next = remaining[Math.min(index, remaining.length - 1)] ?? null;
    setDatabase((current) => ({ ...current, messages: remaining }));
    setSelectedMessageUid(next?.uid ?? null);
    setSelectedSignalUid(next?.signals[0]?.uid ?? null);
  }

  function addSignal() {
    if (!selectedMessage) return;
    const signal = createSignal(selectedMessage.signals.length);
    const occupied = new Set(selectedMessage.signals.flatMap((item) => computeSignalBits(item)));
    let candidate = 0;
    while (candidate < selectedMessage.dlc * 8 && occupied.has(candidate)) candidate += 1;
    signal.startBit = candidate;
    setDatabase((current) => ({
      ...current,
      messages: current.messages.map((message) =>
        message.uid === selectedMessage.uid
          ? { ...message, signals: [...message.signals, signal] }
          : message,
      ),
    }));
    setSelectedSignalUid(signal.uid);
  }

  function duplicateSignal() {
    if (!selectedMessage || !selectedSignal) return;
    const signal = cloneSignal(selectedSignal, selectedMessage.signals.length);
    setDatabase((current) => ({
      ...current,
      messages: current.messages.map((message) =>
        message.uid === selectedMessage.uid
          ? { ...message, signals: [...message.signals, signal] }
          : message,
      ),
    }));
    setSelectedSignalUid(signal.uid);
  }

  function deleteSignal() {
    if (!selectedMessage || !selectedSignal || !window.confirm(t.confirmDeleteSignal)) return;
    const index = selectedMessage.signals.findIndex((signal) => signal.uid === selectedSignal.uid);
    const remaining = selectedMessage.signals.filter((signal) => signal.uid !== selectedSignal.uid);
    setDatabase((current) => ({
      ...current,
      messages: current.messages.map((message) =>
        message.uid === selectedMessage.uid ? { ...message, signals: remaining } : message,
      ),
    }));
    setSelectedSignalUid(remaining[Math.min(index, remaining.length - 1)]?.uid ?? null);
  }

  function downloadDbc() {
    if (errorCount > 0) {
      setToast(t.fixErrors);
      setTab("validation");
      return;
    }
    const filename = database.name.toLowerCase().endsWith(".dbc")
      ? database.name
      : `${database.name || "database"}.dbc`;
    const blob = new Blob([source], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
    setToast(t.saved);
  }

  function applySource() {
    try {
      const parsed = parseDbc(sourceDraft, database.name);
      replaceDatabase(parsed);
      setSourceDraft(serializeDbc(parsed));
      setToast(t.sourceApplied);
    } catch {
      setToast(t.invalidFile);
    }
  }

  function loadDraft() {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) {
        setToast(t.draftMissing);
        return;
      }
      replaceDatabase(JSON.parse(raw) as DbcDatabase);
      setToast(t.draftLoaded);
    } catch {
      setToast(t.draftMissing);
    }
  }

  function openIssue(issue: ValidationIssue) {
    if (issue.messageUid) setSelectedMessageUid(issue.messageUid);
    if (issue.signalUid) setSelectedSignalUid(issue.signalUid);
    if (issue.messageUid) setTab("editor");
  }

  return (
    <main
      className={`dbc-app${dragging ? " is-dragging" : ""}`}
      onDragEnter={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={(event) => {
        if (event.currentTarget === event.target) setDragging(false);
      }}
      onDrop={onDrop}
    >
      <header className="dbc-topbar">
        <div className="dbc-brand-block">
          <a href="/" className="dbc-back-link" aria-label={t.back}>
            <Icon>←</Icon>
            <span>ALGO TEAM</span>
          </a>
          <span className="dbc-topbar-divider" />
          <div>
            <h1>{t.title}</h1>
            <small>{t.privacy}</small>
          </div>
        </div>

        <div className="dbc-toolbar">
          <a
            className="dbc-tool-button dbc-guide-link"
            href={language === "tr"
              ? "/docs/dbc-editor-kullanim-kilavuzu-tr.pdf"
              : "/docs/dbc-editor-user-guide-en.pdf"}
            download
            title={t.guide}
          >
            <Icon>?</Icon><span className="dbc-guide-label">{t.guide}</span>
          </a>
          <button
            className="dbc-tool-button"
            type="button"
            onClick={() => {
              if (window.confirm(t.confirmNew)) replaceDatabase(createDatabase());
            }}
          >
            <Icon>＋</Icon>{t.new}
          </button>
          <button
            className="dbc-tool-button"
            type="button"
            onClick={() => replaceDatabase(createExampleDatabase())}
          >
            <Icon>◇</Icon>{t.example}
          </button>
          <button className="dbc-tool-button" type="button" onClick={loadDraft}>
            <Icon>↺</Icon>{t.draft}
          </button>
          <button className="dbc-tool-button" type="button" onClick={() => fileInputRef.current?.click()}>
            <Icon>↑</Icon>{t.open}
          </button>
          <button className="dbc-tool-button dbc-tool-button--primary" type="button" onClick={downloadDbc}>
            <Icon>↓</Icon>{t.save}
          </button>
          <input
            ref={fileInputRef}
            className="dbc-visually-hidden"
            type="file"
            accept=".dbc,text/plain"
            onChange={onFileChange}
          />
          <div className="dbc-language" aria-label="Language">
            <button className={language === "tr" ? "active" : ""} onClick={() => setLanguage("tr")}>TR</button>
            <span>/</span>
            <button className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")}>EN</button>
          </div>
        </div>
      </header>

      <section className="dbc-statusbar">
        <div>
          <span className="dbc-status-dot" />
          <strong>{database.name}</strong>
          <span>{database.messages.length} {t.messagesCount}</span>
          <span>{signalCount} {t.signalsCount}</span>
          {database.preservedStatements.length ? (
            <span title={t.preserved}>＋{database.preservedStatements.length} preserved</span>
          ) : null}
        </div>
        <button
          type="button"
          className={`dbc-validation-pill${errorCount ? " has-errors" : warningCount ? " has-warnings" : ""}`}
          onClick={() => setTab("validation")}
        >
          <i />
          {errorCount || warningCount ? `${errorCount} ${t.errors} · ${warningCount} ${t.warnings}` : t.valid}
        </button>
      </section>

      <div className="dbc-shell">
        <aside className="dbc-sidebar">
          <div className="dbc-sidebar-head">
            <div>
              <span>CAN DATABASE</span>
              <strong>{t.messages}</strong>
            </div>
            <button type="button" onClick={addMessage} title={t.addMessage}>＋</button>
          </div>
          <div className="dbc-search">
            <span aria-hidden="true">⌕</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t.search}
              aria-label={t.search}
            />
          </div>
          <div className="dbc-message-list">
            {filteredMessages.map((message) => (
              <button
                type="button"
                key={message.uid}
                className={message.uid === selectedMessage?.uid ? "active" : ""}
                onClick={() => {
                  setSelectedMessageUid(message.uid);
                  setSelectedSignalUid(message.signals[0]?.uid ?? null);
                  setTab("editor");
                }}
              >
                <span className="dbc-message-id">{displayCanId(message)}</span>
                <span className="dbc-message-name">{message.name}</span>
                <small>{message.dlc} B · {message.signals.length} SG</small>
                {issues.some((issue) => issue.messageUid === message.uid && issue.level === "error") ? (
                  <i className="dbc-message-error" title="Validation error">!</i>
                ) : null}
              </button>
            ))}
            {!filteredMessages.length ? <p className="dbc-empty-list">{t.noMessages}</p> : null}
          </div>
          <button className="dbc-add-message" type="button" onClick={addMessage}>
            <span>＋</span>{t.addMessage}
          </button>
          <p className="dbc-offline-note"><i />{t.offline}</p>
        </aside>

        <section className="dbc-workspace">
          <nav className="dbc-tabs" aria-label="Workspace">
            {([
              ["editor", t.editor],
              ["source", t.source],
              ["validation", `${t.validation} (${issues.length})`],
            ] as [WorkspaceTab, string][]).map(([value, text]) => (
              <button
                key={value}
                type="button"
                className={tab === value ? "active" : ""}
                onClick={() => setTab(value)}
              >
                {text}
              </button>
            ))}
          </nav>

          {tab === "editor" ? (
            <div className="dbc-editor-scroll">
              <section className="dbc-file-panel">
                <Field label={t.file}>
                  <input
                    className="dbc-input"
                    value={database.name}
                    onChange={(event) => setDatabase((current) => ({ ...current, name: event.target.value }))}
                  />
                </Field>
                <Field label={t.version}>
                  <input
                    className="dbc-input dbc-input--mono"
                    value={database.version}
                    onChange={(event) => setDatabase((current) => ({ ...current, version: event.target.value }))}
                  />
                </Field>
                <Field label={t.nodes} wide hint={t.nodesHint}>
                  <input
                    className="dbc-input dbc-input--mono"
                    value={database.nodes.join(", ")}
                    onChange={(event) =>
                      setDatabase((current) => ({
                        ...current,
                        nodes: event.target.value.split(",").map((item) => item.trim()).filter(Boolean),
                      }))
                    }
                  />
                </Field>
              </section>

              {selectedMessage ? (
                <>
                  <section className="dbc-card">
                    <div className="dbc-card-heading">
                      <div>
                        <span>MESSAGE / {displayCanId(selectedMessage)}</span>
                        <h2>{selectedMessage.name}</h2>
                      </div>
                      <div className="dbc-card-actions">
                        <button type="button" onClick={duplicateMessage}>{t.duplicate}</button>
                        <button type="button" className="danger" onClick={deleteMessage}>{t.delete}</button>
                      </div>
                    </div>
                    <div className="dbc-form-grid">
                      <Field label={t.messageName}>
                        <input
                          className="dbc-input dbc-input--mono"
                          value={selectedMessage.name}
                          onChange={(event) => updateMessage({ name: event.target.value })}
                        />
                      </Field>
                      <Field label={t.canId}>
                        <CanIdInput message={selectedMessage} onChange={(id) => updateMessage({ id })} />
                      </Field>
                      <Field label={t.frame}>
                        <select
                          className="dbc-input"
                          value={selectedMessage.extended ? "extended" : "standard"}
                          onChange={(event) => updateMessage({ extended: event.target.value === "extended" })}
                        >
                          <option value="standard">{t.standard}</option>
                          <option value="extended">{t.extended}</option>
                        </select>
                      </Field>
                      <Field label={t.dlc}>
                        <NumberInput value={selectedMessage.dlc} onChange={(dlc) => updateMessage({ dlc: dlc ?? 0 })} min={0} max={64} step={1} />
                      </Field>
                      <Field label={t.transmitter}>
                        <input
                          className="dbc-input dbc-input--mono"
                          list="dbc-nodes"
                          value={selectedMessage.transmitter}
                          onChange={(event) => updateMessage({ transmitter: event.target.value })}
                        />
                      </Field>
                      <Field label={`${t.cycle} · ms`} hint={t.optional}>
                        <NumberInput
                          value={selectedMessage.cycleTime}
                          onChange={(cycleTime) => updateMessage({ cycleTime })}
                          min={0}
                          step={1}
                          optional
                          placeholder="—"
                        />
                      </Field>
                      <Field label={t.comment} wide>
                        <textarea
                          className="dbc-input dbc-textarea"
                          value={selectedMessage.comment}
                          onChange={(event) => updateMessage({ comment: event.target.value })}
                          rows={2}
                        />
                      </Field>
                    </div>
                  </section>

                  <section className="dbc-card dbc-signal-card">
                    <div className="dbc-card-heading dbc-card-heading--signals">
                      <div>
                        <span>SIGNALS / {selectedMessage.signals.length}</span>
                        <h2>{t.signals}</h2>
                      </div>
                      <button type="button" className="dbc-inline-add" onClick={addSignal}>＋ {t.addSignal}</button>
                    </div>

                    {selectedMessage.signals.length ? (
                      <>
                        <div className="dbc-signal-tabs" role="tablist" aria-label={t.signals}>
                          {selectedMessage.signals.map((signal, index) => (
                            <button
                              type="button"
                              role="tab"
                              aria-selected={signal.uid === selectedSignal?.uid}
                              className={signal.uid === selectedSignal?.uid ? "active" : ""}
                              onClick={() => setSelectedSignalUid(signal.uid)}
                              key={signal.uid}
                            >
                              <i className={`dbc-swatch dbc-swatch--${index % 8}`} />
                              <span>{signal.name}</span>
                              <small>{signal.startBit}|{signal.length}</small>
                              {issues.some((issue) => issue.signalUid === signal.uid && issue.level === "error") ? <b>!</b> : null}
                            </button>
                          ))}
                        </div>

                        {selectedSignal ? (
                          <div className="dbc-signal-editor">
                            <div className="dbc-signal-editor-head">
                              <strong>{selectedSignal.name}</strong>
                              <div>
                                <button type="button" onClick={duplicateSignal}>{t.duplicate}</button>
                                <button type="button" className="danger" onClick={deleteSignal}>{t.delete}</button>
                              </div>
                            </div>
                            <div className="dbc-form-grid dbc-form-grid--signal">
                              <Field label={t.signalName}>
                                <input className="dbc-input dbc-input--mono" value={selectedSignal.name} onChange={(event) => updateSignal({ name: event.target.value })} />
                              </Field>
                              <Field label={t.multiplex} hint={t.multiplexHint}>
                                <input className="dbc-input dbc-input--mono" value={selectedSignal.multiplex} onChange={(event) => updateSignal({ multiplex: event.target.value })} placeholder="—" />
                              </Field>
                              <Field label={t.startBit}>
                                <NumberInput value={selectedSignal.startBit} onChange={(startBit) => updateSignal({ startBit: startBit ?? 0 })} min={0} max={511} step={1} />
                              </Field>
                              <Field label={`${t.length} · bit`}>
                                <NumberInput value={selectedSignal.length} onChange={(length) => updateSignal({ length: length ?? 1 })} min={1} max={64} step={1} />
                              </Field>
                              <Field label={t.byteOrder}>
                                <select className="dbc-input" value={selectedSignal.byteOrder} onChange={(event) => updateSignal({ byteOrder: event.target.value as DbcSignal["byteOrder"] })}>
                                  <option value="little">{t.intel}</option>
                                  <option value="big">{t.motorola}</option>
                                </select>
                              </Field>
                              <Field label={t.signed}>
                                <select className="dbc-input" value={selectedSignal.signed ? "signed" : "unsigned"} onChange={(event) => updateSignal({ signed: event.target.value === "signed" })}>
                                  <option value="unsigned">{t.unsigned}</option>
                                  <option value="signed">{t.signed}</option>
                                </select>
                              </Field>
                              <Field label={t.valueType}>
                                <select className="dbc-input" value={selectedSignal.valueType} onChange={(event) => updateSignal({ valueType: event.target.value as DbcSignal["valueType"] })}>
                                  <option value="integer">{t.integer}</option>
                                  <option value="float">{t.float}</option>
                                  <option value="double">{t.double}</option>
                                </select>
                              </Field>
                              <Field label={t.factor}>
                                <NumberInput value={selectedSignal.factor} onChange={(factor) => updateSignal({ factor: factor ?? 1 })} />
                              </Field>
                              <Field label={t.offset}>
                                <NumberInput value={selectedSignal.offset} onChange={(offset) => updateSignal({ offset: offset ?? 0 })} />
                              </Field>
                              <Field label={t.min}>
                                <NumberInput value={selectedSignal.min} onChange={(min) => updateSignal({ min: min ?? 0 })} />
                              </Field>
                              <Field label={t.max}>
                                <NumberInput value={selectedSignal.max} onChange={(max) => updateSignal({ max: max ?? 0 })} />
                              </Field>
                              <Field label={t.unit}>
                                <input className="dbc-input" value={selectedSignal.unit} onChange={(event) => updateSignal({ unit: event.target.value })} />
                              </Field>
                              <Field label={t.receivers} wide>
                                <input
                                  className="dbc-input dbc-input--mono"
                                  value={selectedSignal.receivers.join(", ")}
                                  onChange={(event) => updateSignal({ receivers: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })}
                                />
                              </Field>
                              <Field label={t.comment} wide>
                                <textarea className="dbc-input dbc-textarea" rows={2} value={selectedSignal.comment} onChange={(event) => updateSignal({ comment: event.target.value })} />
                              </Field>
                            </div>

                            <div className="dbc-subsection">
                              <div className="dbc-subsection-head">
                                <div>
                                  <strong>{t.valueDescriptions}</strong>
                                  <small>VAL_</small>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => updateSignal({ values: [...selectedSignal.values, { value: "", label: "" }] })}
                                >
                                  ＋ {t.addValue}
                                </button>
                              </div>
                              {selectedSignal.values.length ? (
                                <div className="dbc-value-table">
                                  {selectedSignal.values.map((item, index) => (
                                    <div key={`${index}-${item.value}`}>
                                      <input
                                        className="dbc-input dbc-input--mono"
                                        aria-label={t.rawValue}
                                        placeholder={t.rawValue}
                                        value={item.value}
                                        onChange={(event) =>
                                          updateSignal({
                                            values: selectedSignal.values.map((current, currentIndex) =>
                                              currentIndex === index ? { ...current, value: event.target.value } : current,
                                            ),
                                          })
                                        }
                                      />
                                      <input
                                        className="dbc-input"
                                        aria-label={t.description}
                                        placeholder={t.description}
                                        value={item.label}
                                        onChange={(event) =>
                                          updateSignal({
                                            values: selectedSignal.values.map((current, currentIndex) =>
                                              currentIndex === index ? { ...current, label: event.target.value } : current,
                                            ),
                                          })
                                        }
                                      />
                                      <button
                                        type="button"
                                        aria-label={t.delete}
                                        onClick={() =>
                                          updateSignal({ values: selectedSignal.values.filter((_, currentIndex) => currentIndex !== index) })
                                        }
                                      >
                                        ×
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <div className="dbc-empty-signal">
                        <p>{t.noSignal}</p>
                        <button type="button" onClick={addSignal}>＋ {t.addSignal}</button>
                      </div>
                    )}
                  </section>

                  <section className="dbc-card">
                    <div className="dbc-card-heading dbc-card-heading--compact">
                      <div>
                        <span>PAYLOAD / {selectedMessage.dlc} BYTE</span>
                        <h2>{t.bitMap}</h2>
                      </div>
                      <p>{t.bitMapHint}</p>
                    </div>
                    <BitLayout
                      message={selectedMessage}
                      selectedSignalUid={selectedSignal?.uid ?? null}
                      onSelect={setSelectedSignalUid}
                      byteLabel={t.byte}
                    />
                  </section>
                </>
              ) : (
                <section className="dbc-no-message">
                  <span>BO_</span>
                  <h2>{t.noMessages}</h2>
                  <button type="button" onClick={addMessage}>＋ {t.addMessage}</button>
                </section>
              )}
            </div>
          ) : null}

          {tab === "source" ? (
            <div className="dbc-source-view">
              <div className="dbc-source-head">
                <div>
                  <strong>{database.name}</strong>
                  <p>{t.sourceHelp}</p>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(sourceDraft);
                      setToast(t.copied);
                    }}
                  >
                    {t.copySource}
                  </button>
                  <button type="button" className="primary" onClick={applySource}>{t.applySource}</button>
                </div>
              </div>
              <textarea
                value={sourceDraft}
                onChange={(event) => setSourceDraft(event.target.value)}
                spellCheck={false}
                aria-label={t.source}
              />
            </div>
          ) : null}

          {tab === "validation" ? (
            <div className="dbc-validation-view">
              <div className="dbc-validation-summary">
                <div className={errorCount ? "error" : "ok"}><strong>{errorCount}</strong><span>{t.errors}</span></div>
                <div className={warningCount ? "warning" : "ok"}><strong>{warningCount}</strong><span>{t.warnings}</span></div>
                <div><strong>{database.messages.length}</strong><span>{t.messagesCount}</span></div>
                <div><strong>{signalCount}</strong><span>{t.signalsCount}</span></div>
              </div>
              {issues.length ? (
                <div className="dbc-issue-list">
                  {issues.map((issue, index) => (
                    <button
                      type="button"
                      key={`${issue.code}-${issue.messageUid}-${issue.signalUid}-${index}`}
                      className={issue.level}
                      onClick={() => openIssue(issue)}
                    >
                      <i>{issue.level === "error" ? "!" : "△"}</i>
                      <span>
                        <strong>{issue.code.replaceAll("_", " ")}</strong>
                        <small>{issueText(issue, language)}</small>
                      </span>
                      {issue.messageUid ? <b>→</b> : null}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="dbc-validation-empty">
                  <i>✓</i>
                  <h2>{t.valid}</h2>
                  <p>{t.validationEmpty}</p>
                  <button type="button" onClick={downloadDbc}>{t.save}</button>
                </div>
              )}
            </div>
          ) : null}
        </section>
      </div>

      <datalist id="dbc-nodes">
        {database.nodes.map((node) => <option key={node} value={node} />)}
      </datalist>

      {dragging ? (
        <div className="dbc-drop-overlay">
          <div>
            <span>DBC</span>
            <strong>{t.drop}</strong>
          </div>
        </div>
      ) : null}
      {toast ? <div className="dbc-toast" role="status">{toast}</div> : null}
    </main>
  );
}
