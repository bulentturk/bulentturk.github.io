"use client";

import { useEffect, useState } from "react";

type Language = "tr" | "en";

const copy = {
  tr: {
    nav: {
      home: "Ana Sayfa",
      learn: "Learn",
      engineering: "Mühendislik",
      tools: "Mevcut Araçlar",
      simulators: "Simülatörler",
      roadmap: "Yol Haritası",
      content: "İçerikler",
      blog: "Teknik Yazılar",
      news: "Haberler",
      principles: "Platform",
      contact: "İletişim",
      menu: "Site Menüsü",
    },
    hero: {
      title: "CAN Bus, J1939 ve Hidrolik Mühendislik Araçları",
      fields: ["Mobil İş Makineleri", "CAN Bus", "J1939"],
      fieldLabel: "Mühendislik alanları",
      scroll: "Araçlar",
    },
    tools: {
      kicker: "01 / Kullanıma Açık",
      title: "Gerçek mühendislik işi için çalışan araçlar.",
      intro:
        "Dosyalar ve CAN verileri tarayıcıda işlenir. Mevcut araçlar doğrudan kullanılabilir; hesap açma veya kurulum gerekmez.",
      open: "Aracı aç",
      guide: "PDF kılavuzu",
      availableTitle: "Mevcut mühendislik araçları",
      availableIntro: "CAN, J1939 ve veri analizi için doğrudan kullanabileceğiniz araçlar.",
      simulatorTitle: "Simülatörler",
      simulatorIntro: "Sistem davranışını tarayıcıda kurup gözlemleyebileceğiniz etkileşimli çalışma alanları.",
      items: [
        {
          kind: "tool",
          no: "01",
          code: "DBC",
          discipline: "CAN / J1939",
          title: "DBC Editörü",
          text: "Mesaj ve sinyalleri oluşturun, bit yerleşimini doğrulayın ve standart DBC çıktısı alın.",
          features: ["CAN / CAN FD", "Intel / Motorola", "DBC dışa aktarma"],
          href: "/dbc-editor/",
          guide: "/docs/dbc-editor-kullanim-kilavuzu-tr.pdf",
        },
        {
          kind: "tool",
          no: "02",
          code: "LIVE CAN",
          discipline: "CAN / J1939",
          title: "CAN Viewer",
          text: "PCAN-USB ile canlı trafiği izleyin, kontrollü mesaj gönderin ve TRC/CSV kaydı alın.",
          features: ["PCAN-USB", "RX / TX", "TRC / CSV kayıt"],
          href: "/can-viewer/",
        },
        {
          kind: "tool",
          no: "03",
          code: "LOG ANALYSIS",
          discipline: "Veri Analizi",
          title: "CAN Log Analyzer",
          text: "TRC, ASC, CSV ve SocketCAN kayıtlarında çevrim zamanı, jitter, kayıp mesaj ve DBC sinyallerini inceleyin.",
          features: ["Çoklu log formatı", "Periyot ve jitter", "Sinyal grafikleri"],
          href: "/can-log-analyzer/",
        },
        {
          kind: "tool",
          no: "04",
          code: "J1939",
          discipline: "CAN / J1939",
          title: "DM1 / DTC Analyzer",
          text: "DM1 arızalarını, BAM/TP.DT mesajlarını ve arıza anındaki motor çalışma koşullarını çözümleyin.",
          features: ["SPN / FMI", "BAM / TP.DT", "Arıza anı raporu"],
          href: "/j1939-dtc-decoder/",
        },
        {
          kind: "simulator",
          no: "05",
          code: "HYDRAULICS",
          discipline: "Hidrolik",
          title: "Hidrolik Devre Simülatörü",
          text: "Devre elemanlarını sürükleyip bağlayın; basınç, debi ve silindir hareketini çalıştırarak bağlantıları doğrulayın.",
          features: ["Sürükle ve bırak", "Canlı akış görünümü", "Devre doğrulama"],
          href: "/hydraulic-simulator/",
        },
      ],
    },
    roadmap: {
      kicker: "02 / Yol Haritası",
      title: "Sıradaki mühendislik araçları.",
      intro:
        "Hidrolik, mekanik, elektrik, kontrol, CAN/J1939 ve makine emniyeti aynı araç altyapısında adım adım büyüyecek.",
      status: "Planlanıyor",
      items: [
        {
          code: "J1939",
          discipline: "CAN / J1939",
          title: "SPN / FMI Sözlüğü",
          text: "SPN, FMI ve arıza açıklamalarını üretici notlarıyla birlikte hızlı arama.",
        },
        {
          code: "CAN",
          discipline: "CAN / J1939",
          title: "Bit Yerleşim Hesaplayıcı",
          text: "Intel ve Motorola sinyaller için start bit, uzunluk, ölçek ve byte görünümü.",
        },
        {
          code: "J1939",
          discipline: "CAN / J1939",
          title: "PGN Explorer",
          text: "PGN, source address, priority ve veri alanlarını açıklayan etkileşimli gezgin.",
        },
        {
          code: "LOG",
          discipline: "Veri Analizi",
          title: "CAN Trace Karşılaştırıcı",
          text: "İki trace dosyası arasında yeni, kayıp veya davranışı değişen mesajları bulma.",
        },
        {
          code: "SAFETY",
          discipline: "Makine Emniyeti",
          title: "PL Hesaplama Çalışma Sayfası",
          text: "ISO 13849 yaklaşımında kanal yapısı, MTTFd, DC ve CCF girdilerini düzenleme.",
        },
        {
          code: "MECHANICAL",
          discipline: "Mekanik",
          title: "Pim, Mil ve Burç Geçme Asistanı",
          text: "Yataklama tipi, tolerans, yüzey basıncı ve montaj boşluğu için kontrollü seçim.",
        },
        {
          code: "HYDRAULICS",
          discipline: "Hidrolik",
          title: "Silindir ve Hat Boyutlandırma",
          text: "Kuvvet, hız, debi, boru çapı ve hat hızını birlikte hesaplama.",
        },
        {
          code: "ELECTRICAL",
          discipline: "Elektrik",
          title: "24 V Kablo ve Gerilim Düşümü",
          text: "Akım, kablo uzunluğu, kesit, sigorta ve izin verilen gerilim düşümü kontrolü.",
        },
        {
          code: "CONTROL",
          discipline: "Kontrol Sistemleri",
          title: "Emniyet Kilidi Mantık Oluşturucu",
          text: "Sensör, izin, engelleme ve hata koşullarından okunabilir interlock akışı hazırlama.",
        },
      ],
    },
    blog: {
      kicker: "03 / Mühendislik Blogu",
      title: "Sahadan kısa, kullanılabilir teknik notlar.",
      intro:
        "Uzun teorik anlatımlar yerine; bir problemi anlamaya, ölçmeye veya doğrulamaya yardım eden kısa mühendislik notları.",
      all: "Blogu aç",
      read: "Notu oku",
      items: [
        {
          type: "Teknik Makale / CAN",
          title: "CAN hattında mesaj analizine nereden başlanır?",
          text: "Fiziksel katman, çevrim zamanı, jitter, byte order ve ölçek doğrulaması için pratik başlangıç sırası.",
          href: "/blog/#can-analizi",
        },
        {
          type: "Araştırma Notu / Saha Doğrulaması",
          title: "Hesap doğruysa makine neden farklı davranır?",
          text: "Ölçeklendirme, örnekleme, tolerans ve çalışma koşullarını birlikte kontrol etme.",
          href: "/blog/#saha-dogrulamasi",
        },
      ],
    },
    news: {
      kicker: "04 / Haberler",
      title: "Seçilmiş gelişmeler, kalıcı bir arşivde.",
      intro: "Her sabah eklenen haberler eskileri silmeden büyür. Her başlık, kaynak özeti ve mühendislik açısından neden önemli olduğuyla birlikte yayımlanır.",
      open: "Tüm haberleri aç",
      categories: [
        { code: "01", slug: "health", title: "Sağlık", text: "Klinik araştırmalar, biyomedikal teknoloji ve halk sağlığı." },
        { code: "02", slug: "science-tech", title: "Bilim ve Teknoloji", text: "Yapay zekâ, uzay, enerji, robotik ve yeni araştırmalar." },
        { code: "03", slug: "mobile-machines", title: "Mobil İş Makineleri", text: "İş, inşaat, tarım ve maden makineleri; güç aktarma ve elektrifikasyon." },
        { code: "04", slug: "mining", title: "Madencilik Teknolojileri", text: "Maden otomasyonu, filo yönetimi, emniyet ve üretim teknolojileri." },
      ],
    },
    platform: {
      kicker: "05 / Platform",
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
      kicker: "06 / İletişim",
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
      label: "ALGO TEAM · ENGINEERING TOOLS",
      note: "CAN · J1939 · HYDRAULICS · MOBILE MACHINES",
    },
  },
  en: {
    nav: {
      home: "Home",
      learn: "Learn",
      engineering: "Engineering",
      tools: "Available Tools",
      simulators: "Simulators",
      roadmap: "Roadmap",
      content: "Content",
      blog: "Technical Articles",
      news: "News",
      principles: "Platform",
      contact: "Contact",
      menu: "Site Menu",
    },
    hero: {
      title: "CAN Bus, J1939 & Hydraulic Engineering Tools",
      fields: ["Off-Highway Machinery", "CAN Bus", "J1939"],
      fieldLabel: "Engineering fields",
      scroll: "Tools",
    },
    tools: {
      kicker: "01 / Available Now",
      title: "Working tools for real engineering tasks.",
      intro:
        "Files and CAN data are processed in the browser. Current tools are ready to use with no account or installation.",
      open: "Open tool",
      guide: "PDF guide",
      availableTitle: "Available engineering tools",
      availableIntro: "Tools you can use directly for CAN, J1939, and data analysis.",
      simulatorTitle: "Simulators",
      simulatorIntro: "Interactive workspaces for building and observing system behaviour in the browser.",
      items: [
        {
          kind: "tool",
          no: "01",
          code: "DBC",
          discipline: "CAN / J1939",
          title: "DBC Editor",
          text: "Create messages and signals, verify the bit layout, and export a standards-compatible DBC.",
          features: ["CAN / CAN FD", "Intel / Motorola", "DBC export"],
          href: "/dbc-editor/",
          guide: "/docs/dbc-editor-user-guide-en.pdf",
        },
        {
          kind: "tool",
          no: "02",
          code: "LIVE CAN",
          discipline: "CAN / J1939",
          title: "CAN Viewer",
          text: "Monitor live traffic with PCAN-USB, transmit controlled frames, and record TRC/CSV logs.",
          features: ["PCAN-USB", "RX / TX", "TRC / CSV recording"],
          href: "/can-viewer/",
        },
        {
          kind: "tool",
          no: "03",
          code: "LOG ANALYSIS",
          discipline: "Data Analysis",
          title: "CAN Log Analyzer",
          text: "Inspect cycle time, jitter, missing messages, and DBC signals in TRC, ASC, CSV, and SocketCAN logs.",
          features: ["Multiple log formats", "Period and jitter", "Signal charts"],
          href: "/can-log-analyzer/",
        },
        {
          kind: "tool",
          no: "04",
          code: "J1939",
          discipline: "CAN / J1939",
          title: "DM1 / DTC Analyzer",
          text: "Decode DM1 faults, BAM/TP.DT messages, and engine operating conditions at fault onset.",
          features: ["SPN / FMI", "BAM / TP.DT", "Fault-context report"],
          href: "/j1939-dtc-decoder/",
        },
        {
          kind: "simulator",
          no: "05",
          code: "HYDRAULICS",
          discipline: "Hydraulics",
          title: "Hydraulic Circuit Simulator",
          text: "Drag and connect circuit components, then run pressure, flow, and cylinder motion to validate the design.",
          features: ["Drag and drop", "Live flow view", "Circuit validation"],
          href: "/hydraulic-simulator/",
        },
      ],
    },
    roadmap: {
      kicker: "02 / Roadmap",
      title: "Engineering tools coming next.",
      intro:
        "Hydraulics, mechanical, electrical, controls, CAN/J1939, and machine safety will grow step by step on one tool foundation.",
      status: "Planned",
      items: [
        {
          code: "J1939",
          discipline: "CAN / J1939",
          title: "SPN / FMI Dictionary",
          text: "Fast lookup for SPNs, FMIs, fault descriptions, and manufacturer notes.",
        },
        {
          code: "CAN",
          discipline: "CAN / J1939",
          title: "Bit Layout Calculator",
          text: "Start bit, length, scale, and byte views for Intel and Motorola signals.",
        },
        {
          code: "J1939",
          discipline: "CAN / J1939",
          title: "PGN Explorer",
          text: "An interactive guide to PGNs, source addresses, priority, and data fields.",
        },
        {
          code: "LOG",
          discipline: "Data Analysis",
          title: "CAN Trace Comparator",
          text: "Find new, missing, or behaviorally changed messages across two trace files.",
        },
        {
          code: "SAFETY",
          discipline: "Machine Safety",
          title: "PL Calculation Worksheet",
          text: "Organize channel architecture, MTTFd, DC, and CCF inputs for ISO 13849 work.",
        },
        {
          code: "MECHANICAL",
          discipline: "Mechanical",
          title: "Pin, Shaft & Bushing Fit Assistant",
          text: "Controlled selection of bearing arrangement, tolerance, surface pressure, and assembly clearance.",
        },
        {
          code: "HYDRAULICS",
          discipline: "Hydraulics",
          title: "Cylinder & Line Sizing",
          text: "Calculate force, speed, flow, pipe diameter, and line velocity together.",
        },
        {
          code: "ELECTRICAL",
          discipline: "Electrical",
          title: "24 V Cable & Voltage Drop",
          text: "Check current, cable length, conductor size, fuse, and allowable voltage drop.",
        },
        {
          code: "CONTROL",
          discipline: "Control Systems",
          title: "Safety Interlock Logic Builder",
          text: "Build a readable interlock flow from sensors, permissions, inhibit conditions, and faults.",
        },
      ],
    },
    blog: {
      kicker: "03 / Engineering Blog",
      title: "Short, usable technical notes from the field.",
      intro:
        "Instead of long theoretical essays: concise engineering notes that help understand, measure, or validate a problem.",
      all: "Open blog",
      read: "Read note",
      items: [
        {
          type: "Technical Article / CAN",
          title: "Where should CAN message analysis begin?",
          text: "A practical starting sequence for the physical layer, cycle time, jitter, byte order, and scaling.",
          href: "/blog/#can-analizi",
        },
        {
          type: "Research Note / Field Validation",
          title: "Why does the machine behave differently when the math is right?",
          text: "Checking scaling, sampling, tolerances, and operating conditions together.",
          href: "/blog/#saha-dogrulamasi",
        },
      ],
    },
    news: {
      kicker: "04 / News",
      title: "Selected developments in a permanent archive.",
      intro: "New stories are added every morning without deleting earlier coverage. Each item includes a source-backed summary and why it matters to engineers.",
      open: "Open all news",
      categories: [
        { code: "01", slug: "health", title: "Health", text: "Clinical research, biomedical technology, and public health." },
        { code: "02", slug: "science-tech", title: "Science & Technology", text: "AI, space, energy, robotics, and emerging research." },
        { code: "03", slug: "mobile-machines", title: "Mobile Machinery", text: "Construction, agricultural, mining, and other off-highway equipment." },
        { code: "04", slug: "mining", title: "Mining Technology", text: "Mine automation, fleet management, safety, and production technologies." },
      ],
    },
    platform: {
      kicker: "05 / Platform",
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
      kicker: "06 / Contact",
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
      label: "ALGO TEAM · ENGINEERING TOOLS",
      note: "CAN · J1939 · HYDRAULICS · MOBILE MACHINES",
    },
  },
} as const;

function Arrow({ direction = "right" }: { direction?: "right" | "down" }) {
  return (
    <span aria-hidden="true" className={`arrow arrow--${direction}`}>
      <span />
    </span>
  );
}

export default function Home() {
  const [language, setLanguage] = useState<Language>("tr");
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
    const subject = language === "tr"
      ? `ALGO TEAM iletişim — ${name}`
      : `ALGO TEAM contact — ${name}`;
    const body = language === "tr"
      ? `İsim: ${name}\nE-posta: ${email}\n\n${message}`
      : `Name: ${name}\nEmail: ${email}\n\n${message}`;

    window.location.href = `mailto:info@algo-team.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <main id="top">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="ALGO TEAM ana sayfa">
          ALGO<span>TEAM</span>
        </a>
        <nav className="desktop-nav" aria-label="Ana menü">
          <a href="/learn/">{t.nav.learn}</a>
          <a href="/tools/">Tools</a>
          <a href="/news/">{t.nav.news}</a>
          <a href="#platform">{t.nav.principles}</a>
          <a href="#contact">{t.nav.contact}</a>
        </nav>
        <details className="mobile-site-menu">
          <summary>{t.nav.menu}</summary>
          <div>
            <a href="/learn/">{t.nav.learn}</a>
            <a href="/tools/">Tools</a>
            <a href="/news/">{t.nav.news}</a>
            <a href="#platform">{t.nav.principles}</a>
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
          <span>/</span>
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

      <section className="hero platform-hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <h1 id="hero-title">{t.hero.title}</h1>
          <div className="rule rule--accent" />
          <ul className="field-list" aria-label={t.hero.fieldLabel}>
            {t.hero.fields.map((field) => <li key={field}>{field}</li>)}
          </ul>
          <a className="hero-entry" href="#tools">
            {t.hero.scroll}
            <Arrow direction="down" />
          </a>
        </div>
      </section>

      <section className="section tools-section tools-section--platform" id="tools">
        <div className="tools-copy">
          <div className="section-head compact-head tools-section-head">
            <div>
              <p className="section-kicker">{t.tools.kicker}</p>
              <h2>{t.tools.title}</h2>
            </div>
            <p className="tools-availability-note">{t.tools.intro}</p>
          </div>
          <div className="tools-choice-list">
            <div className="tool-group-heading" id="available-tools">
              <span>01</span>
              <div><h3>{t.tools.availableTitle}</h3><p>{t.tools.availableIntro}</p></div>
            </div>
            {t.tools.items.filter((item) => item.kind === "tool").map((item) => (
              <article key={item.no}>
                <span>{item.no} / {item.discipline} / {item.code}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <ul>
                  {item.features.map((feature) => <li key={feature}>{feature}</li>)}
                </ul>
                <div className="tools-actions">
                  <a className="button button--primary" href={item.href}>
                    {t.tools.open}
                    <Arrow />
                  </a>
                  {"guide" in item && item.guide ? (
                    <a className="tools-guide-link" href={item.guide} download>
                      {t.tools.guide}<span aria-hidden="true">PDF ↓</span>
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
            <div className="tool-group-heading" id="simulators">
              <span>02</span>
              <div><h3>{t.tools.simulatorTitle}</h3><p>{t.tools.simulatorIntro}</p></div>
            </div>
            {t.tools.items.filter((item) => item.kind === "simulator").map((item) => (
              <article key={item.no}>
                <span>{item.no} / {item.discipline} / {item.code}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <ul>{item.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
                <div className="tools-actions">
                  <a className="button button--primary" href={item.href}>{t.tools.open}<Arrow /></a>
                </div>
              </article>
            ))}
          </div>
          <small><i />CLIENT-SIDE PROCESSING · NO ACCOUNT</small>
        </div>
      </section>

      <section className="section roadmap-section" id="roadmap">
        <div className="section-head">
          <p className="section-kicker">{t.roadmap.kicker}</p>
          <h2>{t.roadmap.title}</h2>
          <p>{t.roadmap.intro}</p>
        </div>
        <div className="roadmap-grid">
          {t.roadmap.items.map((item, index) => (
            <article className="roadmap-card" key={item.title}>
              <div className="roadmap-meta">
                <span>0{index + 1}</span>
                <span>{item.discipline} · {item.code}</span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <div className="planned-status"><i />{t.roadmap.status}</div>
            </article>
          ))}
        </div>
      </section>

      <section className="section notes-section" id="blog">
        <div className="notes-head">
          <p className="section-kicker">{t.blog.kicker}</p>
          <h2>{t.blog.title}</h2>
          <p>{t.blog.intro}</p>
          <a className="text-link blog-all-link" href="/blog/">
            {t.blog.all}<Arrow />
          </a>
        </div>
        <div className="notes-grid">
          {t.blog.items.map((item, index) => (
            <article className="note-card" key={item.title}>
              <div className="note-meta">
                <span>0{index + 1}</span>
                <span>{item.type}</span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <a className="note-link" href={item.href}>{t.blog.read}<Arrow /></a>
            </article>
          ))}
        </div>
      </section>

      <section className="section news-home-section" id="news">
        <div className="section-head">
          <p className="section-kicker">{t.news.kicker}</p>
          <h2>{t.news.title}</h2>
          <p>{t.news.intro}</p>
        </div>
        <div className="news-category-grid">
          {t.news.categories.map((category) => (
            <a href={`/news/#${category.slug}`} key={category.code}>
              <span>{category.code}</span>
              <h3>{category.title}</h3>
              <p>{category.text}</p>
              <Arrow />
            </a>
          ))}
        </div>
        <a className="text-link news-home-link" href="/news/">{t.news.open}<Arrow /></a>
      </section>

      <section className="section approach-section platform-section" id="platform">
        <div className="approach-intro">
          <p className="section-kicker">{t.platform.kicker}</p>
          <h2>{t.platform.title}</h2>
          <p>{t.platform.intro}</p>
        </div>
        <ol className="approach-list">
          {t.platform.items.map((item, index) => (
            <li key={item.title}>
              <span>0{index + 1}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="section contact-section" id="contact">
        <div className="contact-copy">
          <p className="section-kicker">{t.contact.kicker}</p>
          <h2>{t.contact.title}</h2>
          <p>{t.contact.intro}</p>
          <a className="contact-email" href="mailto:info@algo-team.com">
            <span>{t.contact.direct}</span>
            info@algo-team.com
          </a>
        </div>
        <form className="contact-form" onSubmit={prepareEmail}>
          <div className="contact-field-row">
            <label>
              <span>{t.contact.name}</span>
              <input
                name="name"
                placeholder={t.contact.namePlaceholder}
                required
                type="text"
                autoComplete="name"
              />
            </label>
            <label>
              <span>{t.contact.email}</span>
              <input
                name="email"
                placeholder={t.contact.emailPlaceholder}
                required
                type="email"
                autoComplete="email"
              />
            </label>
          </div>
          <label>
            <span>{t.contact.message}</span>
            <textarea
              name="message"
              placeholder={t.contact.messagePlaceholder}
              required
              rows={6}
            />
          </label>
          <div className="contact-submit">
            <button className="button button--primary" type="submit">
              {t.contact.send}
              <Arrow />
            </button>
            <small>{t.contact.note}</small>
          </div>
        </form>
      </section>

      <footer>
        <p>{t.footer.label}</p>
        <p>{t.footer.note}</p>
        <p>© {new Date().getFullYear()}</p>
      </footer>
    </main>
  );
}
