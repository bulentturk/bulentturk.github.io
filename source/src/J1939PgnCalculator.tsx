import { useEffect, useMemo, useState } from "react";
import ToolSeoContent from "./ToolSeoContent";
import {
  MAX_J1939_CAN_ID,
  MAX_J1939_PGN,
  buildJ1939CanId,
  decodeJ1939CanId,
  formatAddress,
  formatCanIdBinary,
  formatHex,
  parseAutoNumber,
  parseFormattedNumber,
  type J1939Identifier,
  type NumberRadix,
} from "./j1939/pgn";
import "./j1939-pgn-calculator.css";

type Language = "tr" | "en";
type Mode = "decode" | "build";

const copy = {
  tr: {
    back: "Engineering Tools",
    overline: "J1939 / 29-BIT IDENTIFIER UTILITY",
    title: "J1939 PGN / CAN ID Hesaplayıcı",
    intro: "29-bit CAN kimliğini PGN alanlarına ayırın, PGN'den CAN ID üretin veya bir listeyi toplu çözümleyin.",
    local: "Hesaplama tarayıcınızda yapılır · Veri gönderilmez",
    decodeTab: "CAN ID → PGN",
    buildTab: "PGN → CAN ID",
    canId: "29-bit CAN ID",
    pgn: "PGN",
    hex: "HEX",
    decimal: "DEC",
    example: "Örneği yükle",
    invalidCanId: "0 ile 0x1FFFFFFF arasında geçerli bir 29-bit CAN ID girin.",
    invalidPgn: "0 ile 0x3FFFF arasında geçerli bir PGN girin.",
    pdu1PgnError: "PDU1 PGN değerinin son byte'ı 00 olmalıdır; PS alanı hedef adresidir.",
    result: "Çözüm sonucu",
    generated: "Üretilen CAN ID",
    copy: "Kopyala",
    copied: "Kopyalandı",
    priority: "Priority",
    edp: "EDP / R",
    dp: "Data Page",
    pf: "PDU Format",
    ps: "PDU Specific",
    sa: "Source Address",
    destination: "Destination Address",
    groupExtension: "Group Extension",
    pduType: "PDU tipi",
    broadcast: "Broadcast",
    global: "Global",
    bitMap: "29-bit alan haritası",
    bitOrder: "Priority · EDP/R · DP · PF · PS · SA",
    buildHelp: "Priority, PGN ve kaynak adresini girin. PDU1 mesajlarında hedef adresi ayrıca belirleyin.",
    source: "Kaynak adresi",
    target: "Hedef adresi",
    pdu1Note: "PF 240'tan küçük olduğu için PDU1: PGN'nin son byte'ı 00, PS ise hedef adrestir.",
    pdu2Note: "PF 240 veya büyük olduğu için PDU2: PS, PGN'nin group extension alanıdır ve mesaj broadcast'tir.",
    batchTitle: "Toplu CAN ID çözümleme",
    batchIntro: "Her satıra bir CAN ID yapıştırın. 0x önekli veya A–F içeren değerler HEX, yalnız rakam içerenler decimal okunur.",
    batchPlaceholder: "0x18FECA00\n0x0CF00403\n0x18ECFF00",
    batchInput: "CAN ID listesi",
    batchCount: "geçerli kimlik",
    invalidCount: "geçersiz",
    download: "CSV indir",
    input: "Girdi",
    type: "Tip",
    noRows: "Çözümlenecek CAN ID girin.",
    limited: "İlk 200 değer gösteriliyor.",
    reservedWarning: "EDP/R biti 1. Kullandığınız J1939 sürümü ve profilinde bu bitin anlamını doğrulayın.",
  },
  en: {
    back: "Engineering Tools",
    overline: "J1939 / 29-BIT IDENTIFIER UTILITY",
    title: "J1939 PGN / CAN ID Calculator",
    intro: "Break down a 29-bit CAN identifier, build a CAN ID from a PGN, or decode a list in one pass.",
    local: "Calculations stay in your browser · Nothing is uploaded",
    decodeTab: "CAN ID → PGN",
    buildTab: "PGN → CAN ID",
    canId: "29-bit CAN ID",
    pgn: "PGN",
    hex: "HEX",
    decimal: "DEC",
    example: "Load example",
    invalidCanId: "Enter a valid 29-bit CAN ID between 0 and 0x1FFFFFFF.",
    invalidPgn: "Enter a valid PGN between 0 and 0x3FFFF.",
    pdu1PgnError: "A PDU1 PGN must end in 00 because the PS field is the destination address.",
    result: "Decoded result",
    generated: "Generated CAN ID",
    copy: "Copy",
    copied: "Copied",
    priority: "Priority",
    edp: "EDP / R",
    dp: "Data Page",
    pf: "PDU Format",
    ps: "PDU Specific",
    sa: "Source Address",
    destination: "Destination Address",
    groupExtension: "Group Extension",
    pduType: "PDU type",
    broadcast: "Broadcast",
    global: "Global",
    bitMap: "29-bit field map",
    bitOrder: "Priority · EDP/R · DP · PF · PS · SA",
    buildHelp: "Enter priority, PGN, and source address. PDU1 messages also require a destination address.",
    source: "Source address",
    target: "Destination address",
    pdu1Note: "PF is below 240, so this is PDU1: the PGN ends in 00 and PS carries the destination.",
    pdu2Note: "PF is 240 or above, so this is PDU2: PS is the PGN group extension and the message is broadcast.",
    batchTitle: "Batch CAN ID decoder",
    batchIntro: "Paste one CAN ID per line. Values with a 0x prefix or A–F are read as HEX; digits-only values are decimal.",
    batchPlaceholder: "0x18FECA00\n0x0CF00403\n0x18ECFF00",
    batchInput: "CAN ID list",
    batchCount: "valid identifiers",
    invalidCount: "invalid",
    download: "Download CSV",
    input: "Input",
    type: "Type",
    noRows: "Enter CAN IDs to decode.",
    limited: "Only the first 200 values are shown.",
    reservedWarning: "EDP/R is set to 1. Confirm how this bit is used by your J1939 version and profile.",
  },
} as const;

function IdentifierResult({ identifier, language }: { identifier: J1939Identifier; language: Language }) {
  const t = copy[language];
  const target = identifier.pduType === "PDU1"
    ? `${formatAddress(identifier.destinationAddress ?? 0)}${identifier.destinationAddress === 0xff ? ` · ${t.global}` : ""}`
    : t.broadcast;

  return (
    <>
      <dl className="jpgn-result-grid">
        <div className="jpgn-result-primary"><dt>{t.pgn}</dt><dd>{formatHex(identifier.pgn, 5)}</dd><small>{identifier.pgn}</small></div>
        <div><dt>{t.pduType}</dt><dd>{identifier.pduType}</dd><small>{identifier.pduType === "PDU1" ? t.destination : t.broadcast}</small></div>
        <div><dt>{t.priority}</dt><dd>{identifier.priority}</dd><small>Bits 28–26</small></div>
        <div><dt>{t.edp}</dt><dd>{identifier.extendedDataPage}</dd><small>Bit 25</small></div>
        <div><dt>{t.dp}</dt><dd>{identifier.dataPage}</dd><small>Bit 24</small></div>
        <div><dt>{t.pf}</dt><dd>{formatAddress(identifier.pduFormat)}</dd><small>Bits 23–16</small></div>
        <div><dt>{t.ps}</dt><dd>{formatAddress(identifier.pduSpecific)}</dd><small>{identifier.pduType === "PDU1" ? t.destination : t.groupExtension}</small></div>
        <div><dt>{t.sa}</dt><dd>{formatAddress(identifier.sourceAddress)}</dd><small>Bits 7–0</small></div>
        <div><dt>{identifier.pduType === "PDU1" ? t.destination : t.groupExtension}</dt><dd>{target}</dd><small>{identifier.pduType === "PDU1" ? "PS" : "PDU2"}</small></div>
      </dl>
      {identifier.extendedDataPage === 1 ? <p className="jpgn-warning">{t.reservedWarning}</p> : null}
    </>
  );
}

function FieldMap({ identifier, canId }: { identifier: J1939Identifier; canId: number }) {
  return (
    <section className="jpgn-map" aria-label="29-bit J1939 identifier fields">
      <div className="jpgn-map-head"><strong>29-bit</strong><code>{formatCanIdBinary(canId)}</code></div>
      <div className="jpgn-map-grid">
        <div className="priority"><span>Priority</span><b>{identifier.priority}</b><small>3 bit</small></div>
        <div className="single"><span>EDP/R</span><b>{identifier.extendedDataPage}</b><small>1</small></div>
        <div className="single"><span>DP</span><b>{identifier.dataPage}</b><small>1</small></div>
        <div className="byte"><span>PF</span><b>{formatHex(identifier.pduFormat, 2)}</b><small>8 bit</small></div>
        <div className="byte"><span>PS</span><b>{formatHex(identifier.pduSpecific, 2)}</b><small>8 bit</small></div>
        <div className="byte"><span>SA</span><b>{formatHex(identifier.sourceAddress, 2)}</b><small>8 bit</small></div>
      </div>
    </section>
  );
}

export default function J1939PgnCalculator() {
  const [language, setLanguage] = useState<Language>("tr");
  const [mode, setMode] = useState<Mode>("decode");
  const [decodeRadix, setDecodeRadix] = useState<NumberRadix>(16);
  const [canIdInput, setCanIdInput] = useState("18FECA00");
  const [buildRadix, setBuildRadix] = useState<NumberRadix>(16);
  const [pgnInput, setPgnInput] = useState("FECA");
  const [priority, setPriority] = useState("6");
  const [sourceAddress, setSourceAddress] = useState("00");
  const [destinationAddress, setDestinationAddress] = useState("FF");
  const [batchInput, setBatchInput] = useState("0x18FECA00\n0x0CF00403\n0x18ECFF00");
  const [copied, setCopied] = useState<"decoded" | "built" | null>(null);
  const t = copy[language];

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = language === "tr"
      ? "J1939 PGN Hesaplayıcı: CAN ID Dönüştürücü | ALGO TEAM"
      : "J1939 PGN Calculator: CAN ID Converter | ALGO TEAM";
  }, [language]);

  const decodedCanId = useMemo(
    () => parseFormattedNumber(canIdInput, decodeRadix, MAX_J1939_CAN_ID),
    [canIdInput, decodeRadix],
  );
  const decoded = useMemo(
    () => decodedCanId === null ? null : decodeJ1939CanId(decodedCanId),
    [decodedCanId],
  );

  const parsedPgn = useMemo(
    () => parseFormattedNumber(pgnInput, buildRadix, MAX_J1939_PGN),
    [pgnInput, buildRadix],
  );
  const parsedSource = useMemo(
    () => parseFormattedNumber(sourceAddress, buildRadix, 0xff),
    [sourceAddress, buildRadix],
  );
  const parsedDestination = useMemo(
    () => parseFormattedNumber(destinationAddress, buildRadix, 0xff),
    [destinationAddress, buildRadix],
  );
  const buildPduFormat = parsedPgn === null ? null : Math.floor(parsedPgn / 0x100) & 0xff;
  const isBuildPdu1 = buildPduFormat !== null && buildPduFormat < 240;
  const hasPdu1LowByte = isBuildPdu1 && parsedPgn !== null && (parsedPgn & 0xff) !== 0;
  const builtCanId = useMemo(() => {
    const parsedPriority = Number.parseInt(priority, 10);
    if (parsedPgn === null || parsedSource === null || hasPdu1LowByte) return null;
    const effectiveDestination = isBuildPdu1 ? parsedDestination : 0xff;
    if (effectiveDestination === null) return null;
    return buildJ1939CanId({
      pgn: parsedPgn,
      priority: parsedPriority,
      sourceAddress: parsedSource,
      destinationAddress: effectiveDestination,
    });
  }, [hasPdu1LowByte, isBuildPdu1, parsedDestination, parsedPgn, parsedSource, priority]);
  const built = useMemo(
    () => builtCanId === null ? null : decodeJ1939CanId(builtCanId),
    [builtCanId],
  );

  const batchTokens = useMemo(
    () => batchInput.split(/[\s,;]+/).map((value) => value.trim()).filter(Boolean),
    [batchInput],
  );
  const batchRows = useMemo(() => batchTokens.slice(0, 200).map((input) => {
    const canId = parseAutoNumber(input, MAX_J1939_CAN_ID);
    const identifier = canId === null ? null : decodeJ1939CanId(canId);
    return { input, canId, identifier };
  }), [batchTokens]);
  const validBatchRows = batchRows.filter((row) => row.canId !== null && row.identifier !== null);
  const invalidBatchCount = batchRows.length - validBatchRows.length;

  async function copyValue(value: string, key: "decoded" | "built") {
    await navigator.clipboard?.writeText(value);
    setCopied(key);
    window.setTimeout(() => setCopied(null), 1400);
  }

  function changeDecodeRadix(radix: NumberRadix) {
    if (decodedCanId !== null) setCanIdInput(radix === 16 ? decodedCanId.toString(16).toUpperCase() : String(decodedCanId));
    setDecodeRadix(radix);
  }

  function changeBuildRadix(radix: NumberRadix) {
    if (parsedPgn !== null) setPgnInput(radix === 16 ? parsedPgn.toString(16).toUpperCase() : String(parsedPgn));
    if (parsedSource !== null) setSourceAddress(radix === 16 ? parsedSource.toString(16).toUpperCase().padStart(2, "0") : String(parsedSource));
    if (parsedDestination !== null) setDestinationAddress(radix === 16 ? parsedDestination.toString(16).toUpperCase().padStart(2, "0") : String(parsedDestination));
    setBuildRadix(radix);
  }

  function downloadCsv() {
    if (!validBatchRows.length) return;
    const header = "input,can_id_hex,can_id_decimal,pgn_hex,pgn_decimal,pdu_type,priority,source_address,destination_or_group_extension";
    const rows = validBatchRows.map(({ input, canId, identifier }) => {
      const item = identifier!;
      const target = item.pduType === "PDU1" ? formatHex(item.destinationAddress ?? 0, 2) : formatHex(item.pduSpecific, 2);
      return [input, formatHex(canId!, 8), canId, formatHex(item.pgn, 5), item.pgn, item.pduType, item.priority, formatHex(item.sourceAddress, 2), target].join(",");
    });
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "j1939-pgn-decode.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="jpgn-app">
      <header className="jpgn-header">
        <a href="/tools/"><span aria-hidden="true">←</span>{t.back}</a>
        <strong>ALGO TEAM <small>/ J1939</small></strong>
        <div className="jpgn-language" aria-label="Language">
          <button className={language === "tr" ? "active" : ""} onClick={() => setLanguage("tr")} type="button">TR</button>
          <span>/</span>
          <button className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")} type="button">EN</button>
        </div>
      </header>

      <section className="jpgn-hero">
        <div><p>{t.overline}</p><h1>{t.title}</h1><span>{t.intro}</span></div>
        <code>18 FE CA 00</code>
      </section>

      <section className="jpgn-workspace">
        <div className="jpgn-mode" role="group" aria-label="Calculator mode">
          <button className={mode === "decode" ? "active" : ""} aria-pressed={mode === "decode"} onClick={() => setMode("decode")} type="button">{t.decodeTab}</button>
          <button className={mode === "build" ? "active" : ""} aria-pressed={mode === "build"} onClick={() => setMode("build")} type="button">{t.buildTab}</button>
        </div>

        {mode === "decode" ? (
          <div className="jpgn-calculator-grid">
            <section className="jpgn-input-panel">
              <div className="jpgn-panel-head"><span>INPUT / 01</span><h2>{t.canId}</h2></div>
              <div className="jpgn-radix" role="group" aria-label="Number format">
                <button className={decodeRadix === 16 ? "active" : ""} onClick={() => changeDecodeRadix(16)} type="button">{t.hex}</button>
                <button className={decodeRadix === 10 ? "active" : ""} onClick={() => changeDecodeRadix(10)} type="button">{t.decimal}</button>
              </div>
              <label><span>{t.canId}</span><div className="jpgn-input-prefix"><b>{decodeRadix === 16 ? "0x" : "10#"}</b><input value={canIdInput} onChange={(event) => setCanIdInput(event.target.value)} spellCheck="false" inputMode="text" aria-invalid={decoded === null} /></div></label>
              {decoded === null ? <p className="jpgn-error">{t.invalidCanId}</p> : <p className="jpgn-input-note">{formatHex(decodedCanId!, 8)} · {decodedCanId}</p>}
              <button className="jpgn-example" onClick={() => { setDecodeRadix(16); setCanIdInput("18FECA00"); }} type="button">{t.example}</button>
              <p className="jpgn-local"><i />{t.local}</p>
            </section>
            <section className="jpgn-output-panel">
              <div className="jpgn-panel-head"><span>OUTPUT / 02</span><h2>{t.result}</h2></div>
              {decoded && decodedCanId !== null ? <><div className="jpgn-id-line"><div><span>{t.canId}</span><strong>{formatHex(decodedCanId, 8)}</strong><small>{decodedCanId}</small></div><button onClick={() => copyValue(formatHex(decodedCanId, 8), "decoded")} type="button">{copied === "decoded" ? t.copied : t.copy}</button></div><IdentifierResult identifier={decoded} language={language} /></> : <div className="jpgn-empty">29-bit CAN ID</div>}
            </section>
          </div>
        ) : (
          <div className="jpgn-calculator-grid">
            <section className="jpgn-input-panel">
              <div className="jpgn-panel-head"><span>INPUT / 01</span><h2>{t.buildTab}</h2></div>
              <p className="jpgn-build-help">{t.buildHelp}</p>
              <div className="jpgn-radix" role="group" aria-label="Number format">
                <button className={buildRadix === 16 ? "active" : ""} onClick={() => changeBuildRadix(16)} type="button">{t.hex}</button>
                <button className={buildRadix === 10 ? "active" : ""} onClick={() => changeBuildRadix(10)} type="button">{t.decimal}</button>
              </div>
              <div className="jpgn-build-fields">
                <label><span>{t.priority}</span><select value={priority} onChange={(event) => setPriority(event.target.value)}>{[0,1,2,3,4,5,6,7].map((value) => <option value={value} key={value}>{value}</option>)}</select></label>
                <label><span>{t.pgn}</span><input value={pgnInput} onChange={(event) => setPgnInput(event.target.value)} spellCheck="false" inputMode="text" aria-invalid={parsedPgn === null || hasPdu1LowByte} /></label>
                <label><span>{t.source}</span><input value={sourceAddress} onChange={(event) => setSourceAddress(event.target.value)} spellCheck="false" inputMode="text" aria-invalid={parsedSource === null} /></label>
                <label className={!isBuildPdu1 ? "disabled" : ""}><span>{t.target}</span><input value={destinationAddress} onChange={(event) => setDestinationAddress(event.target.value)} spellCheck="false" inputMode="text" disabled={!isBuildPdu1} aria-invalid={isBuildPdu1 && parsedDestination === null} /></label>
              </div>
              {parsedPgn === null ? <p className="jpgn-error">{t.invalidPgn}</p> : hasPdu1LowByte ? <p className="jpgn-error">{t.pdu1PgnError}</p> : <p className="jpgn-input-note">{isBuildPdu1 ? t.pdu1Note : t.pdu2Note}</p>}
              <button className="jpgn-example" onClick={() => { setBuildRadix(16); setPgnInput("FECA"); setPriority("6"); setSourceAddress("00"); setDestinationAddress("FF"); }} type="button">{t.example}</button>
            </section>
            <section className="jpgn-output-panel">
              <div className="jpgn-panel-head"><span>OUTPUT / 02</span><h2>{t.generated}</h2></div>
              {built && builtCanId !== null ? <><div className="jpgn-id-line"><div><span>{t.canId}</span><strong>{formatHex(builtCanId, 8)}</strong><small>{builtCanId}</small></div><button onClick={() => copyValue(formatHex(builtCanId, 8), "built")} type="button">{copied === "built" ? t.copied : t.copy}</button></div><IdentifierResult identifier={built} language={language} /></> : <div className="jpgn-empty">PGN → CAN ID</div>}
            </section>
          </div>
        )}

        {mode === "decode" && decoded && decodedCanId !== null ? <FieldMap identifier={decoded} canId={decodedCanId} /> : null}
        {mode === "build" && built && builtCanId !== null ? <FieldMap identifier={built} canId={builtCanId} /> : null}
      </section>

      <section className="jpgn-batch">
        <div className="jpgn-batch-head"><div><span>BATCH / 03</span><h2>{t.batchTitle}</h2><p>{t.batchIntro}</p></div><button onClick={downloadCsv} disabled={!validBatchRows.length} type="button">{t.download}</button></div>
        <label><span>{t.batchInput}</span><textarea value={batchInput} onChange={(event) => setBatchInput(event.target.value)} placeholder={t.batchPlaceholder} spellCheck="false" /></label>
        <div className="jpgn-batch-summary"><strong>{validBatchRows.length} {t.batchCount}</strong><span>{invalidBatchCount} {t.invalidCount}</span>{batchTokens.length > 200 ? <span>{t.limited}</span> : null}</div>
        <div className="jpgn-table-wrap">
          <table>
            <thead><tr><th>{t.input}</th><th>CAN ID</th><th>{t.pgn}</th><th>{t.type}</th><th>{t.priority}</th><th>SA</th><th>{t.destination} / GE</th></tr></thead>
            <tbody>
              {batchRows.length ? batchRows.map((row, index) => row.identifier && row.canId !== null ? <tr key={`${row.input}-${index}`}><td><code>{row.input}</code></td><td><strong>{formatHex(row.canId, 8)}</strong><small>{row.canId}</small></td><td><strong>{formatHex(row.identifier.pgn, 5)}</strong><small>{row.identifier.pgn}</small></td><td>{row.identifier.pduType}</td><td>{row.identifier.priority}</td><td>{formatAddress(row.identifier.sourceAddress)}</td><td>{row.identifier.pduType === "PDU1" ? formatAddress(row.identifier.destinationAddress ?? 0) : formatAddress(row.identifier.pduSpecific)}</td></tr> : <tr className="invalid" key={`${row.input}-${index}`}><td><code>{row.input}</code></td><td colSpan={6}>{t.invalidCanId}</td></tr>) : <tr><td colSpan={7}>{t.noRows}</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <ToolSeoContent tool="j1939-pgn-calculator" language={language} />
      <footer><a href="/">ALGO TEAM</a><span>J1939 · PGN · CAN ID</span><span>© {new Date().getFullYear()}</span></footer>
    </main>
  );
}
