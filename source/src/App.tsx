"use client";

import { useEffect, useState } from "react";

type Language = "tr" | "en";

/**
 * Yenilenmiş ana sayfa — Modern tema.
 * Önceki sürümde numaralı bölüm tasarımı ve iki dilli içerik vardı; bu
 * sürüm tasarımı tamamen yeniler ve TR/EN metin eşliğini korur.
 * Yeni stiller "rv-" önekli sınıflarla home.css'te tanımlıdır; diğer
 * sayfaların (blog, news, learn, tools, legal) stilleri etkilenmez.
 */
const copy = {
  tr: {
    nav: {
      tools: "Araçlar",
      learn: "Learn",
      roadmap: "Yol Haritası",
      news: "Haberler",
      contact: "İletişim",
      menu: "Site Menüsü",
    },
    hero: {
      badge: "7 ücretsiz araç · kurulum gerektirmez",
      titleLead: "CAN Bus ve J1939 analizini",
      titleAccent: "tarayıcında",
      titleTail: "yap.",
      text: "CAN Bus ve J1939 analizi, DBC düzenleme, CAN log inceleme ve hidrolik devre simülasyonu için ücretsiz çevrimiçi mühendislik araçları. Kurulum yok, lisans yok — DBC düzenle, CAN log çözümle, ECU simüle et, arıza kodlarını oku.",
      ctaPrimary: "Araçları İncele",
      ctaSecondary: "Yeniliklere göz at",
      stats: [
        { value: "7", label: "ücretsiz araç" },
        { value: "8", label: "rehber makalesi" },
        { value: "0", label: "kurulum gerekir" },
        { value: "4", label: "log formatı" },
      ],
    },
    panel: {
      title: "DM1 çözümleme · J1939",
      link: "CAN 250 kbit/s",
      canId: "CAN ID",
      bytes: "8 bayt",
      result: "Sonuç →",
      resultValue: "Aftertreatment 1 DEF Pump · oturum durumu:",
      resultStatus: "aktif",
      note: "Tüm çözümleme tarayıcıda çalışır; veri sunucuya gitmez.",
    },
    tools: {
      kicker: "Araçlar",
      title: "Kategoriye göre seç",
      intro:
        "Yedi araç, tek çatı altında: CAN Bus analizi, J1939 çözümleme ve hidrolik devre simülasyonu.",
      allTools: "Tüm araçlar sayfası",
      open: "aracını aç",
      filters: ["Tümü", "CAN Bus", "J1939", "Hidrolik"] as const,
      items: [
        {
          code: "DBC",
          discipline: "CAN / J1939",
          title: "DBC Editörü",
          text: "Mesaj ve sinyalleri oluşturun, bit yerleşimini doğrulayın ve standart DBC çıktısı alın.",
          features: ["CAN / CAN FD", "Intel / Motorola", "DBC dışa aktarma"],
          href: "/dbc-editor/",
          kind: "tool",
        },
        {
          code: "LIVE CAN",
          discipline: "CAN / J1939",
          title: "CAN Viewer",
          text: "PCAN-USB ile canlı trafiği izleyin, kontrollü mesaj gönderin ve TRC/CSV kaydı alın.",
          features: ["PCAN-USB", "RX / TX", "TRC / CSV kayıt"],
          href: "/can-viewer/",
          kind: "tool",
        },
        {
          code: "LOG ANALYSIS",
          discipline: "Veri Analizi",
          title: "CAN Log Analyzer",
          text: "TRC, ASC, CSV ve SocketCAN kayıtlarında çevrim zamanı, jitter, kayıp mesaj ve DBC sinyallerini inceleyin.",
          features: ["Çoklu log formatı", "Periyot ve jitter", "Sinyal grafikleri"],
          href: "/can-log-analyzer/",
          kind: "tool",
        },
        {
          code: "PGN / CAN ID",
          discipline: "CAN / J1939",
          title: "J1939 PGN Hesaplayıcı",
          text: "29-bit CAN kimliğini PGN ve adres alanlarına ayırın veya PGN'den gönderilecek CAN ID'yi oluşturun.",
          features: ["CAN ID ↔ PGN", "PDU1 / PDU2", "Toplu çözümleme"],
          href: "/j1939-pgn-calculator/",
          kind: "tool",
        },
        {
          code: "J1939",
          discipline: "CAN / J1939",
          title: "DM1 / DTC Analyzer",
          text: "DM1 arızalarını, BAM/TP.DT mesajlarını ve arıza anındaki motor çalışma koşullarını çözümleyin.",
          features: ["SPN / FMI", "BAM / TP.DT", "Arıza anı raporu"],
          href: "/j1939-dtc-decoder/",
          kind: "tool",
        },
        {
          code: "DBC ECU",
          discipline: "CAN / J1939",
          title: "DBC ECU Simülatörü",
          text: "DBC mesajlarını sinyal kontrollerine dönüştürün; Standard veya Extended CAN frame'lerini tek seferlik ya da periyodik gönderin.",
          features: ["Sinyal kodlama", "STD / EXT", "Periyodik TX"],
          href: "/dbc-ecu-simulator/",
          kind: "simulator",
        },
        {
          code: "HYDRAULICS",
          discipline: "Hidrolik",
          title: "Hidrolik Devre Simülatörü",
          text: "Devre elemanlarını sürükleyip bağlayın; basınç, debi ve silindir hareketini çalıştırarak bağlantıları doğrulayın.",
          features: ["Sürükle ve bırak", "Canlı akış görünümü", "Devre doğrulama"],
          href: "/hydraulic-simulator/",
          kind: "simulator",
        },
      ] as Array<{
        code: string;
        discipline: string;
        title: string;
        text: string;
        features: string[];
        href: string;
        kind: string;
      }>,
    },
    workflow: {
      kicker: "İş akışı",
      title: "Üç adımda analiz",
      steps: [
        {
          step: "01",
          title: "Bağlan veya yükle",
          text: "PCAN-USB ile canlı CAN Bus'a bağlan ya da TRC, ASC, CSV, SocketCAN kaydını tarayıcıya sürükle.",
        },
        {
          step: "02",
          title: "DBC ile çözümle",
          text: "Sinyalleri fiziksel değerlere çevir; periyot, jitter ve kayıp mesajları tek ekranda incele.",
        },
        {
          step: "03",
          title: "Doğrula ve raporla",
          text: "Arıza kodlarını SPN/FMI bazında çöz, sonuçları ekran görüntüsü ve kayıt dosyasıyla paylaş.",
        },
      ],
    },
    guides: {
      kicker: "Rehberler",
      title: "Öğren, sonra uygula",
      intro:
        "Temellerden ileri seviyeye: DBC, J1939 PGN/DM1 ve hidrolik güç kontrolü üzerine uygulamalı yazılar.",
      all: "Tüm rehberler",
      read: "Oku",
      items: [
        {
          category: "DBC",
          title: "DBC Dosyası Nedir?",
          href: "/learn/dbc-dosyasi-nedir/",
        },
        {
          category: "Hidrolik",
          title: "A10VO LA Güç Kontrolü",
          href: "/learn/a10vo-la-guc-kontrolu/",
        },
        {
          category: "J1939",
          title: "DM1 / SPN-FMI Çözümleme",
          href: "/learn/j1939-dm1-spn-fmi-cozumleme/",
        },
      ],
    },
    news: {
      kicker: "Haberler",
      title: "Sitede ve araçlarda yenilikler",
      intro:
        "Sürüm notları, yeni rehberler ve site güncellemeleri tek akışta. Eski blog ve haber sayfalarının yerini bu canlı akış alır.",
      all: "Tüm haberler",
      items: [
        {
          date: "2026-09-12",
          title: "A10VO LA güç kontrolü rehberi ve laboratuvarı yayında",
          text: "RE 92705 kaynaklı TR/EN rehber, p-Q eğrisi ve etkileşimli laboratuvar eklendi.",
          href: "/learn/a10vo-la-guc-kontrolu/",
        },
        {
          date: "2026-09-12",
          title: "Hidrolik simülatöre LA Güç Kontrolü laboratuvarı geldi",
          text: "Pompa regülatörü, yük basıncı ve p-Q haritasını canlı deneyebileceğiniz yeni sayfa.",
          href: "/hydraulic-simulator/la-power-controller/",
        },
        {
          date: "2026-08-30",
          title: "J1939 PGN Hesaplayıcı'ya toplu çözümleme",
          text: "Birden fazla CAN ID'yi aynı anda çözümleyip tablo hâlinde kopyalayın.",
          href: "/j1939-pgn-calculator/",
        },
        {
          date: "2026-08-18",
          title: "CAN Log Analyzer sinyal grafikleri",
          text: "DBC sinyallerini zaman ekseninde çizdirin; dönüm noktalarını hızlıca bulun.",
          href: "/can-log-analyzer/",
        },
      ],
    },
    roadmap: {
      kicker: "Yol Haritası",
      title: "Sıradaki mühendislik araçları.",
      intro:
        "Hidrolik, mekanik, elektrik, kontrol, CAN/J1939 ve makine emniyeti aynı araç altyapısında adım adım büyüyecek.",
      status: "Planlanıyor",
      items: [
        {
          code: "J1939",
          title: "SPN / FMI Sözlüğü",
          text: "SPN, FMI ve arıza açıklamalarını üretici notlarıyla birlikte hızlı arama.",
        },
        {
          code: "CAN",
          title: "Bit Yerleşim Hesaplayıcı",
          text: "Intel ve Motorola sinyaller için start bit, uzunluk, ölçek ve byte görünümü.",
        },
        {
          code: "LOG",
          title: "CAN Trace Karşılaştırıcı",
          text: "İki trace dosyası arasında yeni, kayıp veya davranışı değişen mesajları bulma.",
        },
      ],
    },
    platform: {
      kicker: "Platform",
      title: "Mobil makineler için araçlar ve teknik notlar.",
      intro:
        "CAN, J1939, kontrol sistemleri ve saha verisi üzerine; işe yaradığı ölçüde büyüyen bir çalışma alanı.",
      items: [
        {
          title: "Yerel ve gizli",
          text: "Desteklenen işlemlerde dosya ve CAN verisi sunucuya gönderilmez.",
        },
        {
          title: "Açıklanabilir",
          text: "Sonuç kadar kullanılan ölçek, bit düzeni ve hesap adımları da görünür tutulur.",
        },
        {
          title: "Saha odaklı",
          text: "Araçlar gerçek loglar, cihaz entegrasyonu ve devreye alma ihtiyaçları üzerinden şekillenir.",
        },
      ],
    },
    contact: {
      kicker: "İletişim",
      title: "Bir konu varsa, yazabilirsiniz.",
      intro: "Araçlarla ilgili hata, öneri veya teknik iş birliği için.",
      name: "İsim",
      email: "E-posta",
      message: "Mesaj",
      namePlaceholder: "Adınız",
      emailPlaceholder: "ornek@firma.com",
      messagePlaceholder: "Kısaca anlatın…",
      send: "Mesajı hazırla",
      direct: "Doğrudan e-posta",
      note: "Gönder düğmesi, mesajı e-posta uygulamanızda hazırlar.",
    },
    footer: {
      note: "CAN Bus, J1939 ve hidrolik mühendislik araçları — tamamen ücretsiz, tarayıcıda çalışır, dosyalarınız cihazınızdan çıkmaz.",
      label: "ALGO TEAM · ENGINEERING TOOLS",
    },
  },
  en: {
    nav: {
      tools: "Tools",
      learn: "Learn",
      roadmap: "Roadmap",
      news: "News",
      contact: "Contact",
      menu: "Site Menu",
    },
    hero: {
      badge: "7 free tools · no installation",
      titleLead: "Analyze CAN Bus and J1939",
      titleAccent: "in your browser",
      titleTail: ".",
      text: "Free online engineering tools for CAN Bus and J1939 analysis, DBC editing, CAN log inspection, and hydraulic circuit simulation. No installation, no license — edit DBC files, decode CAN logs, simulate ECUs, read fault codes.",
      ctaPrimary: "Explore tools",
      ctaSecondary: "See what's new",
      stats: [
        { value: "7", label: "free tools" },
        { value: "8", label: "guide articles" },
        { value: "0", label: "installations" },
        { value: "4", label: "log formats" },
      ],
    },
    panel: {
      title: "DM1 decoding · J1939",
      link: "CAN 250 kbit/s",
      canId: "CAN ID",
      bytes: "8 bytes",
      result: "Result →",
      resultValue: "Aftertreatment 1 DEF Pump · session state:",
      resultStatus: "active",
      note: "All decoding runs in the browser; data never leaves your device.",
    },
    tools: {
      kicker: "Tools",
      title: "Pick by category",
      intro:
        "Seven tools under one roof: CAN Bus analysis, J1939 decoding, and hydraulic circuit simulation.",
      allTools: "All tools page",
      open: "open",
      filters: ["All", "CAN Bus", "J1939", "Hydraulics"] as const,
      items: [
        {
          code: "DBC",
          discipline: "CAN / J1939",
          title: "DBC Editor",
          text: "Create messages and signals, verify the bit layout, and export a standards-compatible DBC.",
          features: ["CAN / CAN FD", "Intel / Motorola", "DBC export"],
          href: "/dbc-editor/",
          kind: "tool",
        },
        {
          code: "LIVE CAN",
          discipline: "CAN / J1939",
          title: "CAN Viewer",
          text: "Monitor live traffic with PCAN-USB, transmit controlled frames, and record TRC/CSV logs.",
          features: ["PCAN-USB", "RX / TX", "TRC / CSV recording"],
          href: "/can-viewer/",
          kind: "tool",
        },
        {
          code: "LOG ANALYSIS",
          discipline: "Data Analysis",
          title: "CAN Log Analyzer",
          text: "Inspect cycle time, jitter, missing messages, and DBC signals in TRC, ASC, CSV, and SocketCAN logs.",
          features: ["Multiple log formats", "Period and jitter", "Signal charts"],
          href: "/can-log-analyzer/",
          kind: "tool",
        },
        {
          code: "PGN / CAN ID",
          discipline: "CAN / J1939",
          title: "J1939 PGN Calculator",
          text: "Decode a 29-bit CAN identifier into PGN and address fields, or build a transmit CAN ID from a PGN.",
          features: ["CAN ID ↔ PGN", "PDU1 / PDU2", "Batch decode"],
          href: "/j1939-pgn-calculator/",
          kind: "tool",
        },
        {
          code: "J1939",
          discipline: "CAN / J1939",
          title: "DM1 / DTC Analyzer",
          text: "Decode DM1 faults, BAM/TP.DT messages, and engine operating conditions at fault onset.",
          features: ["SPN / FMI", "BAM / TP.DT", "Fault-context report"],
          href: "/j1939-dtc-decoder/",
          kind: "tool",
        },
        {
          code: "DBC ECU",
          discipline: "CAN / J1939",
          title: "DBC ECU Simulator",
          text: "Turn DBC messages into signal controls, then transmit Standard or Extended CAN frames once or cyclically.",
          features: ["Signal encoding", "STD / EXT", "Cyclic TX"],
          href: "/dbc-ecu-simulator/",
          kind: "simulator",
        },
        {
          code: "HYDRAULICS",
          discipline: "Hydraulics",
          title: "Hydraulic Circuit Simulator",
          text: "Drag and connect circuit components, then run pressure, flow, and cylinder motion to validate the design.",
          features: ["Drag and drop", "Live flow view", "Circuit validation"],
          href: "/hydraulic-simulator/",
          kind: "simulator",
        },
      ] as Array<{
        code: string;
        discipline: string;
        title: string;
        text: string;
        features: string[];
        href: string;
        kind: string;
      }>,
    },
    workflow: {
      kicker: "Workflow",
      title: "Analysis in three steps",
      steps: [
        {
          step: "01",
          title: "Connect or upload",
          text: "Connect to the live CAN Bus with PCAN-USB or drag a TRC, ASC, CSV, or SocketCAN recording into the browser.",
        },
        {
          step: "02",
          title: "Decode with DBC",
          text: "Convert signals to physical values; inspect period, jitter, and missing messages on one screen.",
        },
        {
          step: "03",
          title: "Verify and report",
          text: "Decode fault codes by SPN/FMI and share results with screenshots and recording files.",
        },
      ],
    },
    guides: {
      kicker: "Guides",
      title: "Learn, then apply",
      intro:
        "From basics to advanced: hands-on articles on DBC, J1939 PGN/DM1, and hydraulic power control.",
      all: "All guides",
      read: "Read",
      items: [
        {
          category: "DBC",
          title: "What is a DBC file?",
          href: "/learn/dbc-dosyasi-nedir/",
        },
        {
          category: "Hydraulics",
          title: "A10VO LA power control",
          href: "/learn/a10vo-la-power-control/",
        },
        {
          category: "J1939",
          title: "DM1 / SPN-FMI decoding",
          href: "/learn/j1939-dm1-spn-fmi-cozumleme/",
        },
      ],
    },
    news: {
      kicker: "News",
      title: "Site and tool updates",
      intro:
        "Release notes, new guides, and site updates in one feed. This live feed replaces the earlier blog and news pages.",
      all: "All news",
      items: [
        {
          date: "2026-09-12",
          title: "A10VO LA power control guide and lab are live",
          text: "TR/EN guide based on RE 92705 with p-Q curve and interactive lab.",
          href: "/learn/a10vo-la-power-control/",
        },
        {
          date: "2026-09-12",
          title: "LA power control lab joins the hydraulic simulator",
          text: "A new page to experiment with pump control, load pressure, and the p-Q map.",
          href: "/hydraulic-simulator/la-power-controller/",
        },
        {
          date: "2026-08-30",
          title: "Batch decoding in the J1939 PGN Calculator",
          text: "Decode multiple CAN IDs at once and copy the result as a table.",
          href: "/j1939-pgn-calculator/",
        },
        {
          date: "2026-08-18",
          title: "Signal charts in CAN Log Analyzer",
          text: "Plot DBC signals over time and find turning points quickly.",
          href: "/can-log-analyzer/",
        },
      ],
    },
    roadmap: {
      kicker: "Roadmap",
      title: "Engineering tools coming next.",
      intro:
        "Hydraulics, mechanical, electrical, controls, CAN/J1939, and machine safety will grow step by step on one tool foundation.",
      status: "Planned",
      items: [
        {
          code: "J1939",
          title: "SPN / FMI Dictionary",
          text: "Fast lookup for SPNs, FMIs, fault descriptions, and manufacturer notes.",
        },
        {
          code: "CAN",
          title: "Bit Layout Calculator",
          text: "Start bit, length, scale, and byte views for Intel and Motorola signals.",
        },
        {
          code: "LOG",
          title: "CAN Trace Comparator",
          text: "Find new, missing, or behaviorally changed messages across two trace files.",
        },
      ],
    },
    platform: {
      kicker: "Platform",
      title: "Tools and technical notes for mobile machines.",
      intro:
        "A working space for CAN, J1939, control systems, and field data—growing only where it proves useful.",
      items: [
        {
          title: "Local and private",
          text: "For supported workflows, files and CAN data never leave the browser.",
        },
        {
          title: "Explainable",
          text: "Scaling, bit layout, and calculation steps remain visible alongside the result.",
        },
        {
          title: "Field-driven",
          text: "Tools evolve around real logs, device integration, and commissioning needs.",
        },
      ],
    },
    contact: {
      kicker: "Contact",
      title: "If there is something to discuss, write.",
      intro: "For tool feedback, bug reports, or technical collaboration.",
      name: "Name",
      email: "Email",
      message: "Message",
      namePlaceholder: "Your name",
      emailPlaceholder: "name@company.com",
      messagePlaceholder: "A short note…",
      send: "Prepare message",
      direct: "Email directly",
      note: "The button prepares the message in your email application.",
    },
    footer: {
      note: "CAN Bus, J1939, and hydraulic engineering tools — completely free, runs in the browser, your files never leave your device.",
      label: "ALGO TEAM · ENGINEERING TOOLS",
    },
  },
} as const;

function Arrow({ direction = "right" }: { direction?: "right" | "down" }) {
  return (
    <span aria-hidden="true" className={`rv-arrow rv-arrow--${direction}`}>
      <span />
    </span>
  );
}

const toolFilters: Record<Language, readonly string[]> = {
  tr: ["CAN Bus", "J1939", "Hidrolik"],
  en: ["CAN Bus", "J1939", "Hydraulics"],
};

export default function Home() {
  const [language, setLanguage] = useState<Language>("tr");
  const [filter, setFilter] = useState<string>("all");
  const t = copy[language];

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  function prepareEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();
    const subject =
      language === "tr"
        ? `ALGO TEAM iletişim — ${name}`
        : `ALGO TEAM contact — ${name}`;
    const body =
      language === "tr"
        ? `İsim: ${name}\nE-posta: ${email}\n\n${message}`
        : `Name: ${name}\nEmail: ${email}\n\n${message}`;

    window.location.href = `mailto:info@algo-team.com?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
  }

  const activeFilter = filter === "all" ? null : filter;

  const visibleTools = t.tools.items.filter((item) => {
    if (!activeFilter) return true;
    if (activeFilter === toolFilters[language][0]) {
      return item.discipline.includes("CAN / J1939") && item.kind === "tool";
    }
    if (activeFilter === toolFilters[language][1]) {
      return item.discipline.includes("J1939");
    }
    if (activeFilter === toolFilters[language][2]) {
      return item.discipline === "Hidrolik" || item.discipline === "Hydraulics";
    }
    return true;
  });

  return (
    <main id="top">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="ALGO TEAM ana sayfa">
          <img
            src="/assets/algo-team-logo.png"
            alt="ALGO TEAM"
            width={1200}
            height={206}
          />
        </a>
        <nav className="desktop-nav" aria-label="Ana menü">
          <a href="#tools">{t.nav.tools}</a>
          <a href="/learn/">{t.nav.learn}</a>
          <a href="#roadmap">{t.nav.roadmap}</a>
          <a href="/news/">{t.nav.news}</a>
          <a href="#contact">{t.nav.contact}</a>
        </nav>
        <details className="mobile-site-menu">
          <summary>{t.nav.menu}</summary>
          <div>
            <a href="#tools">{t.nav.tools}</a>
            <a href="/learn/">{t.nav.learn}</a>
            <a href="#roadmap">{t.nav.roadmap}</a>
            <a href="/news/">{t.nav.news}</a>
            <a href="#contact">{t.nav.contact}</a>
          </div>
        </details>
        <div className="language-switch" aria-label="Dil seçimi">
          <button
            className={language === "tr" ? "active" : ""}
            onClick={() => setLanguage("tr")}
            type="button"
            aria-pressed={language === "tr"}
          >
            TR
          </button>
          <button
            className={language === "en" ? "active" : ""}
            onClick={() => setLanguage("en")}
            type="button"
            aria-pressed={language === "en"}
          >
            EN
          </button>
        </div>
      </header>

      <section className="rv-hero">
        <div className="rv-hero-grid" aria-hidden="true" />
        <div className="rv-hero-glow" aria-hidden="true" />
        <div className="rv-hero-inner">
          <div className="rv-hero-copy">
            <p className="rv-hero-badge">
              <span className="rv-pulse" aria-hidden="true" />
              {t.hero.badge}
            </p>
            <h1 id="hero-title">
              {t.hero.titleLead}{" "}
              <span className="rv-accent">{t.hero.titleAccent}</span>{" "}
              {t.hero.titleTail}
            </h1>
            <p className="rv-hero-text">{t.hero.text}</p>
            <div className="rv-hero-actions">
              <a className="rv-btn rv-btn--primary" href="#tools">
                {t.hero.ctaPrimary}
                <Arrow />
              </a>
              <a className="rv-btn rv-btn--ghost" href="/news/">
                {t.hero.ctaSecondary}
              </a>
            </div>
            <dl className="rv-hero-stats">
              {t.hero.stats.map((s) => (
                <div key={s.label}>
                  <dt className="rv-sr-only">{s.label}</dt>
                  <dd className="rv-stat-value">{s.value}</dd>
                  <dd className="rv-stat-label">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="rv-hero-panel" role="presentation">
            <div className="rv-panel-head">
              <span className="rv-panel-title">▮ {t.panel.title}</span>
              <span className="rv-panel-live">
                <span className="rv-pulse" aria-hidden="true" />
                {t.panel.link}
              </span>
            </div>
            <div className="rv-panel-body">
              <div className="rv-panel-line">
                <span className="rv-muted">{t.panel.canId}</span>{" "}
                <span className="rv-accent">0x18FECA03</span>{" "}
                <span className="rv-muted">· {t.panel.bytes}</span>
              </div>
              <div className="rv-panel-chips">
                <div className="rv-chip">
                  <span className="rv-chip-k">PGN</span>
                  <span className="rv-chip-v">65226</span>
                </div>
                <div className="rv-chip">
                  <span className="rv-chip-k">SPN</span>
                  <span className="rv-chip-v">3362</span>
                </div>
                <div className="rv-chip">
                  <span className="rv-chip-k">FMI</span>
                  <span className="rv-chip-v">31</span>
                </div>
              </div>
              <div className="rv-panel-result">
                <span className="rv-muted">{t.panel.result} </span>
                {t.panel.resultValue}{" "}
                <strong className="rv-accent">{t.panel.resultStatus}</strong>
              </div>
              <p className="rv-panel-note">🔒 {t.panel.note}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="tools" className="rv-section">
        <div className="rv-section-head">
          <div>
            <p className="rv-kicker">{t.tools.kicker}</p>
            <h2>{t.tools.title}</h2>
            <p className="rv-section-intro">{t.tools.intro}</p>
          </div>
          <a className="rv-text-link" href="/tools/">
            {t.tools.allTools}
            <Arrow />
          </a>
        </div>
        <div className="rv-chip-row" role="group" aria-label={t.tools.kicker}>
          {[t.tools.filters[0], ...toolFilters[language]].map((f) => (
            <button
              key={f}
              type="button"
              className={`rv-chip-btn${filter === (f === t.tools.filters[0] ? "all" : f) ? " active" : ""}`}
              aria-pressed={filter === (f === t.tools.filters[0] ? "all" : f)}
              onClick={() => setFilter(f === t.tools.filters[0] ? "all" : f)}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="rv-card-grid">
          {visibleTools.map((tool) => (
            <a className="rv-card" key={tool.href + tool.title} href={tool.href}>
              <div className="rv-card-top">
                <span className="rv-card-code">{tool.code}</span>
                <span className="rv-card-disc">{tool.discipline}</span>
              </div>
              <h3>{tool.title}</h3>
              <p>{tool.text}</p>
              <ul className="rv-feature-list">
                {tool.features.map((f) => (
                  <li key={f}>
                    <span aria-hidden="true">✓</span> {f}
                  </li>
                ))}
              </ul>
              <span className="rv-card-open">
                {tool.title} {t.tools.open}
                <Arrow />
              </span>
            </a>
          ))}
        </div>
      </section>

      <section className="rv-section rv-section--tinted">
        <div className="rv-section-head rv-section-head--center">
          <div>
            <p className="rv-kicker">{t.workflow.kicker}</p>
            <h2>{t.workflow.title}</h2>
          </div>
        </div>
        <div className="rv-grid-3">
          {t.workflow.steps.map((s) => (
            <div className="rv-card rv-card--flat" key={s.step}>
              <span className="rv-step-no">{s.step}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="guides" className="rv-section">
        <div className="rv-section-head">
          <div>
            <p className="rv-kicker">{t.guides.kicker}</p>
            <h2>{t.guides.title}</h2>
            <p className="rv-section-intro">{t.guides.intro}</p>
          </div>
          <a className="rv-text-link" href="/learn/">
            {t.guides.all}
            <Arrow />
          </a>
        </div>
        <div className="rv-grid-3">
          {t.guides.items.map((g) => (
            <a className="rv-card" key={g.href + g.title} href={g.href}>
              <div className="rv-card-top">
                <span className="rv-card-disc">{g.category}</span>
              </div>
              <h3>{g.title}</h3>
              <span className="rv-card-open">
                {t.guides.read}
                <Arrow />
              </span>
            </a>
          ))}
        </div>
      </section>

      <section id="news" className="rv-section rv-section--tinted">
        <div className="rv-section-head">
          <div>
            <p className="rv-kicker">{t.news.kicker}</p>
            <h2>{t.news.title}</h2>
            <p className="rv-section-intro">{t.news.intro}</p>
          </div>
          <a className="rv-text-link" href="/news/">
            {t.news.all}
            <Arrow />
          </a>
        </div>
        <div className="rv-grid-2">
          {t.news.items.map((n) => (
            <a className="rv-card" key={n.href + n.title} href={n.href}>
              <div className="rv-card-top">
                <span className="rv-card-disc">{n.date}</span>
              </div>
              <h3>{n.title}</h3>
              <p>{n.text}</p>
            </a>
          ))}
        </div>
      </section>

      <section id="roadmap" className="rv-section">
        <div className="rv-section-head">
          <div>
            <p className="rv-kicker">{t.roadmap.kicker}</p>
            <h2>{t.roadmap.title}</h2>
            <p className="rv-section-intro">{t.roadmap.intro}</p>
          </div>
        </div>
        <div className="rv-grid-3">
          {t.roadmap.items.map((r) => (
            <div className="rv-card rv-card--flat" key={r.code + r.title}>
              <div className="rv-card-top">
                <span className="rv-card-code">{r.code}</span>
                <span className="rv-status-badge">{t.roadmap.status}</span>
              </div>
              <h3>{r.title}</h3>
              <p>{r.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="platform" className="rv-section rv-section--tinted">
        <div className="rv-section-head rv-section-head--center">
          <div>
            <p className="rv-kicker">{t.platform.kicker}</p>
            <h2>{t.platform.title}</h2>
            <p className="rv-section-intro">{t.platform.intro}</p>
          </div>
        </div>
        <div className="rv-grid-3">
          {t.platform.items.map((p) => (
            <div className="rv-card rv-card--flat" key={p.title}>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="contact" className="rv-section">
        <div className="rv-contact-wrap">
          <div>
            <p className="rv-kicker">{t.contact.kicker}</p>
            <h2>{t.contact.title}</h2>
            <p className="rv-section-intro">{t.contact.intro}</p>
            <p className="rv-contact-direct">
              <span className="rv-muted">{t.contact.direct}:</span>{" "}
              <a href="mailto:info@algo-team.com">info@algo-team.com</a>
            </p>
          </div>
          <form
            className="rv-contact-form"
            onSubmit={prepareEmail}
            action="mailto:info@algo-team.com"
            method="post"
            encType="text/plain"
          >
            <label>
              {t.contact.name}
              <input name="name" placeholder={t.contact.namePlaceholder} required />
            </label>
            <label>
              {t.contact.email}
              <input
                name="email"
                type="email"
                placeholder={t.contact.emailPlaceholder}
                required
              />
            </label>
            <label>
              {t.contact.message}
              <textarea
                name="message"
                rows={4}
                placeholder={t.contact.messagePlaceholder}
                required
              />
            </label>
            <button className="rv-btn rv-btn--primary" type="submit">
              {t.contact.send}
            </button>
            <p className="rv-form-note">{t.contact.note}</p>
          </form>
        </div>
      </section>

      <footer className="rv-footer">
        <p className="rv-footer-label">{t.footer.label}</p>
        <p className="rv-footer-note">{t.footer.note}</p>
      </footer>
    </main>
  );
}
