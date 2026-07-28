"use client";

import { useEffect, useState } from "react";

type Language = "tr" | "en";

const copy = {
  tr: {
    nav: {
      tools: "Araçlar",
      roadmap: "Yol Haritası",
      blog: "Mühendislik Blogu",
      principles: "Platform",
      contact: "İletişim",
    },
    hero: {
      title: "Mühendislik Araçları",
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
      items: [
        {
          no: "01",
          code: "DBC",
          title: "DBC Editörü",
          text: "Mesaj ve sinyalleri oluşturun, bit yerleşimini doğrulayın ve standart DBC çıktısı alın.",
          features: ["CAN / CAN FD", "Intel / Motorola", "DBC dışa aktarma"],
          href: "/dbc-editor/",
          guide: "/docs/dbc-editor-kullanim-kilavuzu-tr.pdf",
        },
        {
          no: "02",
          code: "LIVE CAN",
          title: "CAN Viewer",
          text: "PCAN-USB ile canlı trafiği izleyin, kontrollü mesaj gönderin ve TRC/CSV kaydı alın.",
          features: ["PCAN-USB", "RX / TX", "TRC / CSV kayıt"],
          href: "/can-viewer/",
        },
        {
          no: "03",
          code: "LOG ANALYSIS",
          title: "CAN Log Analyzer",
          text: "TRC, ASC, CSV ve SocketCAN kayıtlarında çevrim zamanı, jitter, kayıp mesaj ve DBC sinyallerini inceleyin.",
          features: ["Çoklu log formatı", "Periyot ve jitter", "Sinyal grafikleri"],
          href: "/can-log-analyzer/",
        },
        {
          no: "04",
          code: "J1939",
          title: "DM1 / DTC Analyzer",
          text: "DM1 arızalarını, BAM/TP.DT mesajlarını ve arıza anındaki motor çalışma koşullarını çözümleyin.",
          features: ["SPN / FMI", "BAM / TP.DT", "Arıza anı raporu"],
          href: "/j1939-dtc-decoder/",
        },
      ],
    },
    roadmap: {
      kicker: "02 / Yol Haritası",
      title: "Sıradaki mühendislik araçları.",
      intro:
        "Aşağıdaki başlıklar geliştirme havuzunda. Öncelik, sahada sık tekrarlanan hesapları ve teşhis adımlarını hızlandıran araçlarda.",
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
          code: "J1939",
          title: "PGN Explorer",
          text: "PGN, source address, priority ve veri alanlarını açıklayan etkileşimli gezgin.",
        },
        {
          code: "LOG",
          title: "CAN Trace Karşılaştırıcı",
          text: "İki trace dosyası arasında yeni, kayıp veya davranışı değişen mesajları bulma.",
        },
        {
          code: "TELEMETRY",
          title: "Olay Kütüphanesi Oluşturucu",
          text: "Sinyal, eşik, süre ve koşullardan telemetri olay tanımları hazırlama.",
        },
        {
          code: "SAFETY",
          title: "PL Hesaplama Çalışma Sayfası",
          text: "ISO 13849 yaklaşımında kanal yapısı, MTTFd, DC ve CCF girdilerini düzenleme.",
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
          type: "CAN Haberleşmesi",
          title: "CAN hattında mesaj analizine nereden başlanır?",
          text: "Bit hızı, terminasyon, çevrim zamanı ve alive counter üzerinden ilk teşhis sırası.",
          href: "/blog/#can-analizi",
        },
        {
          type: "Telemetri",
          title: "Her veriyi değil, doğru olayı kaydetmek",
          text: "Sürekli, koşula bağlı ve olay tabanlı sinyalleri ayırmak için pratik çerçeve.",
          href: "/blog/#olay-tabanli-telemetri",
        },
        {
          type: "Saha Doğrulaması",
          title: "Hesap doğruysa makine neden farklı davranır?",
          text: "Ölçeklendirme, örnekleme, tolerans ve çalışma koşullarını birlikte kontrol etme.",
          href: "/blog/#saha-dogrulamasi",
        },
      ],
    },
    platform: {
      kicker: "04 / Platform",
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
      kicker: "05 / İletişim",
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
      note: "CAN · J1939 · TELEMETRY · MOBILE MACHINES",
    },
  },
  en: {
    nav: {
      tools: "Tools",
      roadmap: "Roadmap",
      blog: "Engineering Blog",
      principles: "Platform",
      contact: "Contact",
    },
    hero: {
      title: "Engineering Tools",
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
      items: [
        {
          no: "01",
          code: "DBC",
          title: "DBC Editor",
          text: "Create messages and signals, verify the bit layout, and export a standards-compatible DBC.",
          features: ["CAN / CAN FD", "Intel / Motorola", "DBC export"],
          href: "/dbc-editor/",
          guide: "/docs/dbc-editor-user-guide-en.pdf",
        },
        {
          no: "02",
          code: "LIVE CAN",
          title: "CAN Viewer",
          text: "Monitor live traffic with PCAN-USB, transmit controlled frames, and record TRC/CSV logs.",
          features: ["PCAN-USB", "RX / TX", "TRC / CSV recording"],
          href: "/can-viewer/",
        },
        {
          no: "03",
          code: "LOG ANALYSIS",
          title: "CAN Log Analyzer",
          text: "Inspect cycle time, jitter, missing messages, and DBC signals in TRC, ASC, CSV, and SocketCAN logs.",
          features: ["Multiple log formats", "Period and jitter", "Signal charts"],
          href: "/can-log-analyzer/",
        },
        {
          no: "04",
          code: "J1939",
          title: "DM1 / DTC Analyzer",
          text: "Decode DM1 faults, BAM/TP.DT messages, and engine operating conditions at fault onset.",
          features: ["SPN / FMI", "BAM / TP.DT", "Fault-context report"],
          href: "/j1939-dtc-decoder/",
        },
      ],
    },
    roadmap: {
      kicker: "02 / Roadmap",
      title: "Engineering tools coming next.",
      intro:
        "These concepts are in the development pool. Priority goes to tools that accelerate repetitive field calculations and diagnostic steps.",
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
          code: "J1939",
          title: "PGN Explorer",
          text: "An interactive guide to PGNs, source addresses, priority, and data fields.",
        },
        {
          code: "LOG",
          title: "CAN Trace Comparator",
          text: "Find new, missing, or behaviorally changed messages across two trace files.",
        },
        {
          code: "TELEMETRY",
          title: "Event Library Builder",
          text: "Build telemetry event definitions from signals, thresholds, durations, and conditions.",
        },
        {
          code: "SAFETY",
          title: "PL Calculation Worksheet",
          text: "Organize channel architecture, MTTFd, DC, and CCF inputs for ISO 13849 work.",
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
          type: "CAN Communication",
          title: "Where should CAN message analysis begin?",
          text: "A first-pass diagnostic order using bitrate, termination, cycle time, and alive counters.",
          href: "/blog/#can-analizi",
        },
        {
          type: "Telemetry",
          title: "Record the right event, not every value",
          text: "A practical way to separate continuous, conditional, and event-based signals.",
          href: "/blog/#olay-tabanli-telemetri",
        },
        {
          type: "Field Validation",
          title: "Why does the machine behave differently when the math is right?",
          text: "Checking scaling, sampling, tolerances, and operating conditions together.",
          href: "/blog/#saha-dogrulamasi",
        },
      ],
    },
    platform: {
      kicker: "04 / Platform",
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
      kicker: "05 / Contact",
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
      note: "CAN · J1939 · TELEMETRY · MOBILE MACHINES",
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
          <a href="#tools">{t.nav.tools}</a>
          <a href="#roadmap">{t.nav.roadmap}</a>
          <a href="#blog">{t.nav.blog}</a>
          <a href="#platform">{t.nav.principles}</a>
          <a href="#contact">{t.nav.contact}</a>
        </nav>
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
            {t.tools.items.map((item) => (
              <article key={item.no}>
                <span>{item.no} / {item.code}</span>
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
                <span>{item.code}</span>
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
