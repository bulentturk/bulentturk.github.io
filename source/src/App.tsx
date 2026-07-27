"use client";

import { useEffect, useState } from "react";

type Language = "tr" | "en";

const copy = {
  tr: {
    nav: {
      about: "Hakkımda",
      expertise: "Çalışma Alanları",
      work: "Yaklaşım",
      tools: "Araçlar",
      notes: "Teknik Notlar",
      contact: "İletişim",
    },
    hero: {
      role: "Electrical Design Specialist | Off-Highway Machines",
      intro:
        "İş makineleri için elektrik-elektronik sistemleri, kontrol çözümleri ve saha uygulamaları üzerine çalışıyorum. Teknik birikimimi sade, güvenilir ve uygulanabilir çözümlere dönüştürmeyi önemsiyorum.",
      fields: ["İş makineleri", "Kontrol sistemleri", "Telemetri"],
      primary: "Çalışma alanlarımı incele",
      secondary: "Kısaca hakkımda",
    },
    about: {
      kicker: "01 / Hakkımda",
      title: "Mühendislik ile saha uygulaması arasında.",
      body:
        "Elektrik-elektronik mühendisliği altyapımı; mobil iş makinelerinin kontrol sistemleri, elektrifikasyonu, veri haberleşmesi ve üretim süreçleri üzerine geliştiriyorum. Tasarımdan devreye almaya kadar farklı disiplinlerin birlikte çalıştığı projelerde görev alıyorum.",
      current:
        "Profesyonel kariyerime hâlen Titan Makina’da Montaj Müdürü olarak devam ediyorum. Bu görevde elektrik, hidrolik ve mekanik montaj süreçlerinin koordinasyonu ile sahada uygulanabilir mühendislik çözümlerine odaklanıyorum.",
      note: "Önceliğim; anlaşılır tasarım, güvenli çalışma ve sürdürülebilir saha performansı.",
    },
    expertise: {
      kicker: "02 / Çalışma Alanları",
      title: "Üzerinde çalıştığım teknik başlıklar",
      intro:
        "Aşağıdaki alanlar, günlük mühendislik çalışmalarımın ve öğrenme odağımın temelini oluşturuyor.",
      items: [
        {
          no: "01",
          title: "Elektrik ve Kontrol Sistemleri",
          text: "Mobil makinelerde elektrik mimarisi, sensörler, aktüatörler, kontrol üniteleri ve saha devreye alma çalışmaları.",
        },
        {
          no: "02",
          title: "CAN Tabanlı Haberleşme",
          text: "CAN, J1939 ve CANopen ağlarında mesaj analizi, cihaz entegrasyonu ve kontrol sistemi haberleşmesi.",
        },
        {
          no: "03",
          title: "İş Makinası Telemetrisi",
          text: "Makine verilerinin toplanması, anlamlandırılması, olay tabanlı izlenmesi ve uzaktan değerlendirilmesi.",
        },
        {
          no: "04",
          title: "Elektrikli ve Hibrit Sistemler",
          text: "Batarya, motor sürücü, şarj ve kontrol bileşenlerinin mobil makine kullanım senaryolarına entegrasyonu.",
        },
        {
          no: "05",
          title: "Makine Emniyeti",
          text: "Fonksiyonel emniyet yaklaşımı, risk değerlendirmesi ve güvenlikle ilgili kontrol fonksiyonlarının tasarımı.",
        },
        {
          no: "06",
          title: "Montaj ve Devreye Alma",
          text: "Elektrik, hidrolik ve mekanik disiplinler arasında üretilebilirlik, test ve saha geri bildirimi odaklı koordinasyon.",
        },
      ],
    },
    approach: {
      kicker: "03 / Yaklaşım",
      title: "Teknik olarak doğru, sahada uygulanabilir.",
      intro:
        "Bir çözümün yalnızca kâğıt üzerinde çalışması yeterli değil. Tasarımın üretilebilir, test edilebilir ve farklı disiplinlerce anlaşılabilir olmasına önem veriyorum.",
      items: [
        {
          title: "Sistemi anlamak",
          text: "İhtiyacı, çalışma koşullarını ve arızanın gerçek etkisini doğru tarif etmek.",
        },
        {
          title: "Sadeleştirmek",
          text: "Gereksiz karmaşıklığı azaltan, izlenebilir ve bakımı kolay çözümler geliştirmek.",
        },
        {
          title: "Sahada doğrulamak",
          text: "Hesap, yazılım ve dokümantasyonu gerçek çalışma koşullarıyla birlikte değerlendirmek.",
        },
      ],
    },
    notes: {
      kicker: "05 / Teknik Notlar",
      title: "Öğrendiklerimden kısa notlar.",
      intro:
        "İş makineleri, kontrol sistemleri ve saha uygulamaları üzerine zaman içinde paylaşacağım teknik yazılar için bir alan.",
      status: "Hazırlanıyor",
      items: [
        {
          type: "CAN Haberleşmesi",
          title: "CAN hattında sağlıklı mesaj analizine başlarken",
          text: "Bir sahadaki haberleşme sorununu anlamak için ilk bakılması gereken temel noktalar.",
        },
        {
          type: "Telemetri",
          title: "İş makinası telemetrisinde olay tabanlı veri",
          text: "Her veriyi sürekli toplamak yerine anlamlı olayları ve doğru örnekleme yaklaşımını belirlemek.",
        },
        {
          type: "Saha Notu",
          title: "Kontrol sistemlerinde tasarımdan saha doğrulamasına",
          text: "Hesap, yazılım ve dokümantasyonu gerçek çalışma koşullarıyla birlikte değerlendirmek.",
        },
      ],
    },
    tools: {
      kicker: "04 / Mühendislik Araçları",
      title: "CAN araçları, doğrudan tarayıcıda.",
      text:
        "CAN veritabanlarını hazırlamak ve gerçek CAN trafiğini incelemek için ücretsiz, yerel ve uygulamaya dönük araçlar.",
      dbcTitle: "DBC Editörü",
      dbcText:
        "Mesaj ve sinyalleri oluşturun, bit yerleşimini doğrulayın ve DBC dosyanızı dışa aktarın.",
      dbcAction: "DBC Editörü aç",
      guide: "PDF kılavuzunu indir",
      dbcFeatures: ["CAN / CAN FD", "Intel / Motorola", "DBC dışa aktarma"],
      viewerTitle: "CAN Viewer",
      viewerText:
        "PCAN-USB ile canlı CAN mesajlarını izleyin, kontrollü mesaj gönderin ve TRC/CSV kaydı alın.",
      viewerAction: "CAN Viewer aç",
      viewerFeatures: ["PCAN-USB", "RX / TX", "TRC / CSV kayıt"],
      analyzerTitle: "CAN Log Analyzer",
      analyzerText:
        "TRC, ASC, CSV ve SocketCAN kayıtlarını açın; çevrim zamanı, jitter, kayıp mesaj ve DBC sinyallerini inceleyin.",
      analyzerAction: "CAN Log Analyzer aç",
      analyzerFeatures: ["TRC / ASC / CSV", "Periyot ve jitter", "Sinyal grafikleri"],
      dtcTitle: "J1939 DM1 / DTC Analyzer",
      dtcText:
        "Motor CAN trace’inde DM1 arızalarını, çok paketli mesajları ve arıza anı çalışma koşullarını teşhis edin.",
      dtcAction: "J1939 arıza teşhisini aç",
      dtcFeatures: ["DM1 / SPN / FMI", "BAM / TP.DT", "Arıza anı raporu"],
      privacy: "Dosyalar ve CAN verisi sunucuya yüklenmez · Ücretsiz kullanım",
    },
    contact: {
      kicker: "06 / İletişim",
      title: "Teknik fikirler ve mesleki paylaşımlar için.",
      text:
        "İş makineleri, kontrol sistemleri ve mühendislik uygulamaları üzerine görüş alışverişine açığım.",
      email: "E-posta",
      linkedin: "LinkedIn",
    },
    footer: "Bülent Türk · Elektrik-Elektronik Mühendisi",
  },
  en: {
    nav: {
      about: "About",
      expertise: "Focus Areas",
      work: "Approach",
      tools: "Tools",
      notes: "Technical Notes",
      contact: "Contact",
    },
    hero: {
      role: "Electrical Design Specialist | Off-Highway Machines",
      intro:
        "I work on electrical and electronic systems, control solutions, and field applications for off-highway machines. I value turning technical knowledge into clear, reliable, and practical solutions.",
      fields: ["Off-highway machines", "Control systems", "Telemetry"],
      primary: "Explore my focus areas",
      secondary: "A short introduction",
    },
    about: {
      kicker: "01 / About",
      title: "Between engineering and field application.",
      body:
        "I continue to develop my electrical and electronics engineering background through work on mobile machine control systems, electrification, data communication, and production processes. I take part in multidisciplinary projects from design through commissioning.",
      current:
        "I currently continue my professional career as Assembly Manager at Titan Makina. In this role, I focus on coordinating electrical, hydraulic, and mechanical assembly processes and developing engineering solutions that can be applied in the field.",
      note: "My priorities are clear design, safe operation, and sustainable field performance.",
    },
    expertise: {
      kicker: "02 / Focus Areas",
      title: "Technical subjects I work on",
      intro:
        "These areas form the core of my day-to-day engineering work and ongoing learning.",
      items: [
        {
          no: "01",
          title: "Electrical & Control Systems",
          text: "Electrical architecture, sensors, actuators, control units, and field commissioning for mobile machinery.",
        },
        {
          no: "02",
          title: "CAN-Based Communication",
          text: "Message analysis, device integration, and control-system communication across CAN, J1939, and CANopen networks.",
        },
        {
          no: "03",
          title: "Machine Telemetry",
          text: "Collecting and interpreting machine data for event-based monitoring and remote evaluation.",
        },
        {
          no: "04",
          title: "Electric & Hybrid Systems",
          text: "Integrating batteries, motor drives, chargers, and controls into mobile-machine operating scenarios.",
        },
        {
          no: "05",
          title: "Machine Safety",
          text: "Functional-safety thinking, risk assessment, and the design of safety-related control functions.",
        },
        {
          no: "06",
          title: "Assembly & Commissioning",
          text: "Cross-disciplinary coordination focused on manufacturability, testing, and feedback from the field.",
        },
      ],
    },
    approach: {
      kicker: "03 / Approach",
      title: "Technically sound, practical in the field.",
      intro:
        "A solution should do more than work on paper. I care about designs that can be built, tested, maintained, and clearly understood across disciplines.",
      items: [
        {
          title: "Understand the system",
          text: "Define the need, operating conditions, and real-world impact of a failure.",
        },
        {
          title: "Simplify",
          text: "Reduce unnecessary complexity and develop traceable, maintainable solutions.",
        },
        {
          title: "Validate in the field",
          text: "Evaluate calculations, software, and documentation under real operating conditions.",
        },
      ],
    },
    notes: {
      kicker: "05 / Technical Notes",
      title: "Short notes from what I learn.",
      intro:
        "A place for technical writing I plan to share over time on off-highway machines, control systems, and field applications.",
      status: "In preparation",
      items: [
        {
          type: "CAN Communication",
          title: "Getting started with reliable CAN message analysis",
          text: "The fundamentals to examine first when investigating a communication issue in the field.",
        },
        {
          type: "Telemetry",
          title: "Event-based data in off-highway machine telemetry",
          text: "Identifying meaningful events and suitable sampling instead of collecting every signal continuously.",
        },
        {
          type: "Field Note",
          title: "From control-system design to field validation",
          text: "Evaluating calculations, software, and documentation together under real operating conditions.",
        },
      ],
    },
    tools: {
      kicker: "04 / Engineering Tools",
      title: "CAN tools, directly in your browser.",
      text:
        "Free, local, and practical tools for preparing CAN databases and inspecting real CAN traffic.",
      dbcTitle: "DBC Editor",
      dbcText:
        "Create messages and signals, validate the bit layout, and export your DBC file.",
      dbcAction: "Open DBC Editor",
      guide: "Download PDF guide",
      dbcFeatures: ["CAN / CAN FD", "Intel / Motorola", "DBC export"],
      viewerTitle: "CAN Viewer",
      viewerText:
        "Monitor live CAN traffic with PCAN-USB, transmit controlled frames, and record TRC/CSV logs.",
      viewerAction: "Open CAN Viewer",
      viewerFeatures: ["PCAN-USB", "RX / TX", "TRC / CSV recording"],
      analyzerTitle: "CAN Log Analyzer",
      analyzerText:
        "Open TRC, ASC, CSV, and SocketCAN captures; inspect cycle time, jitter, missing messages, and DBC signals.",
      analyzerAction: "Open CAN Log Analyzer",
      analyzerFeatures: ["TRC / ASC / CSV", "Period and jitter", "Signal charts"],
      dtcTitle: "J1939 DM1 / DTC Analyzer",
      dtcText:
        "Diagnose DM1 faults, multi-packet messages, and operating conditions at fault onset from an engine CAN trace.",
      dtcAction: "Open J1939 fault diagnosis",
      dtcFeatures: ["DM1 / SPN / FMI", "BAM / TP.DT", "Fault-context report"],
      privacy: "Files and CAN data are never uploaded · Free to use",
    },
    contact: {
      kicker: "06 / Contact",
      title: "For technical ideas and professional exchange.",
      text:
        "I am open to exchanging ideas on off-highway machines, control systems, and engineering practice.",
      email: "Email",
      linkedin: "LinkedIn",
    },
    footer: "Bülent Türk · Electrical & Electronics Engineer",
  },
} as const;

function Arrow({ direction = "right" }: { direction?: "right" | "down" }) {
  return (
    <span aria-hidden="true" className={`arrow arrow--${direction}`}>
      <span />
    </span>
  );
}

function TechnicalCanvas() {
  return (
    <div className="technical-canvas" aria-hidden="true">
      <div className="canvas-grid" />
      <div className="orbit orbit--one" />
      <div className="orbit orbit--two" />
      <div className="axis axis--x" />
      <div className="axis axis--y" />
      <div className="signal signal--one" />
      <div className="signal signal--two" />
      <div className="signal signal--three" />
      <div className="signal signal--four" />
      <i className="node node--one" />
      <i className="node node--two" />
      <i className="node node--three" />
      <i className="node node--four" />
      <i className="node node--five" />
      <div className="datum datum--one">CAN</div>
      <div className="datum datum--two">24V</div>
      <div className="datum datum--three">250k</div>
      <div className="measure measure--one">01</div>
      <div className="measure measure--two">02</div>
      <div className="measure measure--three">03</div>
    </div>
  );
}

export default function Home() {
  const [language, setLanguage] = useState<Language>("tr");
  const t = copy[language];

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <main id="top">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Bülent Türk, ana sayfa">
          Bülent Türk
        </a>
        <nav className="desktop-nav" aria-label="Ana menü">
          <a href="#about">{t.nav.about}</a>
          <a href="#expertise">{t.nav.expertise}</a>
          <a href="#approach">{t.nav.work}</a>
          <a href="#tools">{t.nav.tools}</a>
          <a href="#notes">{t.nav.notes}</a>
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

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="overline">Electrical · Control · Mobile Machines</p>
          <h1 id="hero-title">Bülent Türk</h1>
          <p className="role">{t.hero.role}</p>
          <div className="rule rule--accent" />
          <p className="hero-intro">{t.hero.intro}</p>
          <ul className="field-list" aria-label="Çalışma alanları">
            {t.hero.fields.map((field) => (
              <li key={field}>{field}</li>
            ))}
          </ul>
          <div className="hero-actions">
            <a className="button button--primary" href="#expertise">
              {t.hero.primary}
              <Arrow />
            </a>
            <a className="text-link" href="#about">
              {t.hero.secondary}
              <Arrow direction="down" />
            </a>
          </div>
        </div>
        <TechnicalCanvas />
        <p className="scroll-note">SCROLL / 01—06</p>
      </section>

      <section className="section about-section" id="about">
        <div className="section-label">
          <p>{t.about.kicker}</p>
        </div>
        <div className="about-content">
          <h2>{t.about.title}</h2>
          <div className="about-grid">
            <p className="lead">{t.about.body}</p>
            <div>
              <p>{t.about.current}</p>
              <p className="quiet-note">{t.about.note}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section expertise-section" id="expertise">
        <div className="section-head">
          <p className="section-kicker">{t.expertise.kicker}</p>
          <h2>{t.expertise.title}</h2>
          <p>{t.expertise.intro}</p>
        </div>
        <div className="expertise-grid">
          {t.expertise.items.map((item) => (
            <article className="expertise-card" key={item.no}>
              <span>{item.no}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <div className="card-trace" aria-hidden="true">
                <i />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section approach-section" id="approach">
        <div className="approach-intro">
          <p className="section-kicker">{t.approach.kicker}</p>
          <h2>{t.approach.title}</h2>
          <p>{t.approach.intro}</p>
        </div>
        <ol className="approach-list">
          {t.approach.items.map((item, index) => (
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

      <section className="section tools-section" id="tools">
        <div className="tools-copy">
          <p className="section-kicker">{t.tools.kicker}</p>
          <h2>{t.tools.title}</h2>
          <p>{t.tools.text}</p>
          <div className="tools-choice-list">
            <article>
              <span>01 / DBC</span>
              <h3>{t.tools.dbcTitle}</h3>
              <p>{t.tools.dbcText}</p>
              <ul>
                {t.tools.dbcFeatures.map((feature) => <li key={feature}>{feature}</li>)}
              </ul>
              <div className="tools-actions">
                <a className="button button--primary" href="/dbc-editor/">
                  {t.tools.dbcAction}
                  <Arrow />
                </a>
                <a
                  className="tools-guide-link"
                  href={language === "tr"
                    ? "/docs/dbc-editor-kullanim-kilavuzu-tr.pdf"
                    : "/docs/dbc-editor-user-guide-en.pdf"}
                  download
                >
                  {t.tools.guide}
                  <span aria-hidden="true">PDF ↓</span>
                </a>
              </div>
            </article>
            <article>
              <span>02 / LIVE CAN</span>
              <h3>{t.tools.viewerTitle}</h3>
              <p>{t.tools.viewerText}</p>
              <ul>
                {t.tools.viewerFeatures.map((feature) => <li key={feature}>{feature}</li>)}
              </ul>
              <div className="tools-actions">
                <a className="button button--primary" href="/can-viewer/">
                  {t.tools.viewerAction}
                  <Arrow />
                </a>
              </div>
            </article>
            <article>
              <span>03 / OFFLINE ANALYSIS</span>
              <h3>{t.tools.analyzerTitle}</h3>
              <p>{t.tools.analyzerText}</p>
              <ul>
                {t.tools.analyzerFeatures.map((feature) => <li key={feature}>{feature}</li>)}
              </ul>
              <div className="tools-actions">
                <a className="button button--primary" href="/can-log-analyzer/">
                  {t.tools.analyzerAction}
                  <Arrow />
                </a>
              </div>
            </article>
            <article>
              <span>04 / J1939 DIAGNOSTICS</span>
              <h3>{t.tools.dtcTitle}</h3>
              <p>{t.tools.dtcText}</p>
              <ul>
                {t.tools.dtcFeatures.map((feature) => <li key={feature}>{feature}</li>)}
              </ul>
              <div className="tools-actions">
                <a className="button button--primary" href="/j1939-dtc-decoder/">
                  {t.tools.dtcAction}
                  <Arrow />
                </a>
              </div>
            </article>
          </div>
          <small><i />{t.tools.privacy}</small>
        </div>
        <div className="tools-preview-stack" aria-hidden="true">
          <div className="dbc-tool-preview">
            <div className="preview-top">
              <span>DBC / CAN DATABASE</span>
              <i />
            </div>
            <div className="preview-body">
              <div className="preview-list">
                <span>0x201</span>
                <strong>VCU_Status</strong>
                <span>0x18FF50E5</span>
                <strong>Charger_Status</strong>
                <span>0x301</span>
                <strong>Telemetry_Data</strong>
              </div>
              <div className="preview-editor">
                <small>SG_ ENGINE_SPEED</small>
                <strong>0|16@1+</strong>
                <div className="preview-bits">
                  {Array.from({ length: 16 }, (_, index) => <i key={index} />)}
                </div>
                <p>(0.125,0) [0|8031.875] "rpm"</p>
              </div>
            </div>
            <div className="preview-status"><i /> VALID · CLIENT-SIDE</div>
          </div>
          <div className="can-tool-preview">
            <div className="preview-top">
              <span>PCAN-USB / LIVE MONITOR</span>
              <i />
            </div>
            <div className="can-preview-status">
              <span><i /> RX / TX · LOG</span>
              <strong>250 kbit/s</strong>
            </div>
            {[
              ["0x201", "VCU_Status", "40 2E E2 04 01 00 00 00"],
              ["0x18FF50E5", "Charger_Status", "98 03 B4 00 10 00 45 00"],
              ["0x301", "Telemetry_Data", "7E 20 18 00 00 01 00 00"],
            ].map(([id, name, data]) => (
              <div className="can-preview-row" key={id}>
                <strong>{id}</strong>
                <span>{name}</span>
                <code>{data}</code>
              </div>
            ))}
            <div className="preview-status"><i /> LIVE · DBC DECODED</div>
          </div>
          <div className="dtc-tool-preview">
            <div className="preview-top">
              <span>J1939 DM1 / DTC ANALYSIS</span>
              <i />
            </div>
            <div className="dtc-preview-summary">
              <span><i /> MOTOR ECU #1</span>
              <strong>2 ACTIVE DTC</strong>
            </div>
            <div className="dtc-preview-row">
              <div>
                <span>SPN 100</span>
                <strong>FMI 01</strong>
              </div>
              <p>Engine Oil Pressure</p>
              <small>ACTIVE</small>
            </div>
            <div className="dtc-preview-row">
              <div>
                <span>SPN 110</span>
                <strong>FMI 15</strong>
              </div>
              <p>Engine Coolant Temperature</p>
              <small>WARNING</small>
            </div>
            <div className="dtc-preview-context">
              <div><span>ENGINE</span><strong>1842 rpm</strong></div>
              <div><span>TORQUE</span><strong>68 %</strong></div>
              <div><span>HOURS</span><strong>4286 h</strong></div>
            </div>
            <div className="preview-status"><i /> DM1 DECODED · TRACE ANALYZED</div>
          </div>
        </div>
      </section>

      <section className="section notes-section" id="notes">
        <div className="notes-head">
          <p className="section-kicker">{t.notes.kicker}</p>
          <h2>{t.notes.title}</h2>
          <p>{t.notes.intro}</p>
        </div>
        <div className="notes-grid">
          {t.notes.items.map((item, index) => (
            <article className="note-card" key={item.title}>
              <div className="note-meta">
                <span>0{index + 1}</span>
                <span>{item.type}</span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <div className="note-status">
                <i aria-hidden="true" />
                {t.notes.status}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section contact-section" id="contact">
        <div>
          <p className="section-kicker">{t.contact.kicker}</p>
          <h2>{t.contact.title}</h2>
        </div>
        <div className="contact-copy">
          <p>{t.contact.text}</p>
          <div className="contact-links">
            <a href="mailto:bulentturk459@gmail.com">
              <span>{t.contact.email}</span>
              <strong>bulentturk459@gmail.com</strong>
              <Arrow />
            </a>
            <a
              href="https://www.linkedin.com/in/b%C3%BClent-t%C3%BCrk-ba29a577/"
              target="_blank"
              rel="noreferrer"
            >
              <span>{t.contact.linkedin}</span>
              <strong>linkedin.com/in/bülent-türk</strong>
              <Arrow />
            </a>
          </div>
        </div>
        <div className="contact-diagram" aria-hidden="true">
          <span />
          <i />
          <span />
        </div>
      </section>

      <footer>
        <p>{t.footer}</p>
        <p>© {new Date().getFullYear()}</p>
      </footer>
    </main>
  );
}
