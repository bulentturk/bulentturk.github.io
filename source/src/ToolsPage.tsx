"use client";

import { useEffect, useState } from "react";

type Language = "tr" | "en";

const content = {
  tr: {
    nav: { home: "Ana Sayfa", learn: "Learn", tools: "Tools", news: "Haberler" },
    overline: "ALGO TEAM / TOOLS",
    title: "Ücretsiz online mühendislik araçları.",
    intro: "CAN Bus, J1939, DBC, CAN log analizi ve hidrolik devre doğrulaması için tarayıcıda çalışan araçlar. Desteklenen işlemlerde dosya ve teknik veri cihazınızdan dışarı çıkmaz.",
    listTitle: "Kullanıma açık araçlar",
    listIntro: "Araçlar kullanım amacı ve gelişim durumuyla birlikte listelenir. Çalışan adresler korunur; yeni sürümler aynı bağlantılarda yayımlanır.",
    open: "Aracı aç",
    beta: "Beta",
    validated: "Doğrulandı",
    statusTitle: "Durum etiketleri",
    betaText: "Temel işlevler kullanılabilir; gerçek saha örnekleriyle doğrulama ve kullanım geri bildirimi devam eder.",
    validatedText: "Tanımlanmış test kapsamı tamamlanmış ve desteklenen sınırlar açıkça yayımlanmış sürüm.",
    local: "Tarayıcıda yerel işlem",
    items: [
      { no: "01", code: "CAN / J1939", title: "Ücretsiz Online DBC Editörü", text: "CAN ve CAN FD mesajlarını ve sinyallerini oluşturun, doğrulayın ve DBC olarak indirin.", features: ["CAN / CAN FD", "Intel / Motorola", "DBC dışa aktarma"], href: "/dbc-editor/", status: "Beta" },
      { no: "02", code: "CAN / HARDWARE", title: "Online CAN Bus İzleyici", text: "PCAN-USB ile canlı CAN trafiğini izleyin, kontrollü mesaj gönderin ve TRC/CSV kaydı alın.", features: ["PCAN-USB", "RX / TX", "TRC / CSV"], href: "/can-viewer/", status: "Beta" },
      { no: "03", code: "DATA ANALYSIS", title: "Online CAN Log Analiz Programı", text: "TRC, ASC, CSV ve SocketCAN kayıtlarında periyot, jitter, kayıp mesaj ve DBC sinyallerini inceleyin.", features: ["Çoklu format", "Periyot / jitter", "Sinyal grafikleri"], href: "/can-log-analyzer/", status: "Beta" },
      { no: "04", code: "J1939 / DIAGNOSTICS", title: "J1939 SPN/FMI Arıza Kodu Çözücü", text: "DM1 mesajlarını, SPN/FMI kodlarını, ECU adreslerini ve çok paketli TP trafiğini çözümleyin.", features: ["DM1", "SPN / FMI", "BAM / TP.DT"], href: "/j1939-dtc-decoder/", status: "Beta" },
      { no: "05", code: "HYDRAULICS", title: "Ücretsiz Online Hidrolik Devre Simülatörü", text: "Pompa, valf ve silindirleri bağlayın; basınç, debi ve hareket davranışını tarayıcıda gözlemleyin.", features: ["Sürükle / bırak", "Canlı akış", "Devre kontrolü"], href: "/hydraulic-simulator/", status: "Beta" },
    ],
  },
  en: {
    nav: { home: "Home", learn: "Learn", tools: "Tools", news: "News" },
    overline: "ALGO TEAM / TOOLS",
    title: "Free online engineering tools.",
    intro: "Browser-based tools for CAN Bus, J1939, DBC, CAN log analysis, and hydraulic circuit validation. In supported workflows, files and technical data stay on your device.",
    listTitle: "Available tools",
    listIntro: "Tools are listed with their purpose and development status. Existing URLs remain stable as new versions are published.",
    open: "Open tool",
    beta: "Beta",
    validated: "Validated",
    statusTitle: "Status labels",
    betaText: "Core functions are available while validation with field examples and user feedback continues.",
    validatedText: "The defined test scope is complete and supported limits are published.",
    local: "Local browser processing",
    items: [
      { no: "01", code: "CAN / J1939", title: "Free Online DBC Editor", text: "Create, validate, and download CAN and CAN FD messages and signals as DBC.", features: ["CAN / CAN FD", "Intel / Motorola", "DBC export"], href: "/dbc-editor/", status: "Beta" },
      { no: "02", code: "CAN / HARDWARE", title: "Online CAN Bus Viewer", text: "Monitor live CAN traffic via PCAN-USB, transmit controlled frames, and record TRC/CSV logs.", features: ["PCAN-USB", "RX / TX", "TRC / CSV"], href: "/can-viewer/", status: "Beta" },
      { no: "03", code: "DATA ANALYSIS", title: "Online CAN Log Analyzer", text: "Inspect timing, jitter, missing messages, and DBC signals in TRC, ASC, CSV, and SocketCAN logs.", features: ["Multiple formats", "Period / jitter", "Signal charts"], href: "/can-log-analyzer/", status: "Beta" },
      { no: "04", code: "J1939 / DIAGNOSTICS", title: "J1939 SPN/FMI Fault Code Decoder", text: "Decode DM1 messages, SPN/FMI codes, ECU addresses, and multi-packet TP traffic.", features: ["DM1", "SPN / FMI", "BAM / TP.DT"], href: "/j1939-dtc-decoder/", status: "Beta" },
      { no: "05", code: "HYDRAULICS", title: "Free Online Hydraulic Circuit Simulator", text: "Connect pumps, valves, and cylinders, then observe pressure, flow, and motion in the browser.", features: ["Drag / drop", "Live flow", "Circuit checks"], href: "/hydraulic-simulator/", status: "Beta" },
    ],
  },
} as const;

export default function ToolsPage() {
  const [language, setLanguage] = useState<Language>("tr");
  const t = content[language];

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = language === "tr"
      ? "Ücretsiz Online Mühendislik Araçları | ALGO TEAM Tools"
      : "Free Online Engineering Tools | ALGO TEAM Tools";
  }, [language]);

  return (
    <main className="hub-page tools-hub">
      <header className="site-header hub-header">
        <a className="brand" href="/" aria-label="ALGO TEAM ana sayfa">
          <img src="/assets/algo-team-logo.png" alt="ALGO TEAM" width="1200" height="206" />
        </a>
        <nav className="hub-nav" aria-label="Ana menü">
          <a href="/">{t.nav.home}</a>
          <a href="/learn/">{t.nav.learn}</a>
          <a className="active" href="/tools/">{t.nav.tools}</a>
          <a href="/news/">{t.nav.news}</a>
        </nav>
        <div className="language-switch" aria-label="Dil seçimi">
          <button className={language === "tr" ? "active" : ""} onClick={() => setLanguage("tr")} type="button">TR</button>
          <span>/</span>
          <button className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")} type="button">EN</button>
        </div>
      </header>

      <section className="hub-hero">
        <p className="overline">{t.overline}</p>
        <h1>{t.title}</h1>
        <p>{t.intro}</p>
        <span className="hub-local"><i />{t.local}</span>
      </section>

      <section className="hub-section">
        <div className="hub-section-head">
          <span>01</span>
          <div><h2>{t.listTitle}</h2><p>{t.listIntro}</p></div>
        </div>
        <div className="tools-hub-list">
          {t.items.map((item) => (
            <article key={item.no}>
              <div className="tools-hub-index"><span>{item.no}</span><small>{item.code}</small></div>
              <div className="tools-hub-copy">
                <div className="tools-hub-title"><h2>{item.title}</h2><span>{item.status}</span></div>
                <p>{item.text}</p>
                <ul>{item.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
              </div>
              <a href={item.href}>{t.open} →</a>
            </article>
          ))}
        </div>
      </section>

      <section className="hub-status">
        <p className="section-kicker">02 / {t.statusTitle}</p>
        <h2>{t.statusTitle}</h2>
        <div>
          <article><strong>{t.beta}</strong><p>{t.betaText}</p></article>
          <article><strong>{t.validated}</strong><p>{t.validatedText}</p></article>
        </div>
      </section>

      <footer>
        <p>ALGO TEAM · TOOLS</p>
        <p>CAN · J1939 · DATA · HYDRAULICS</p>
        <p>© {new Date().getFullYear()}</p>
      </footer>
    </main>
  );
}
