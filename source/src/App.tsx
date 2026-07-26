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
      title: "DBC dosyalarını tarayıcınızda oluşturun.",
      text:
        "CAN ve CAN FD veritabanlarını açın, mesaj ve sinyalleri düzenleyin, bit yerleşimini kontrol edin ve doğrulanmış DBC dosyanızı indirin.",
      action: "DBC Editörü aç",
      guide: "PDF kılavuzunu indir",
      privacy: "Dosyalar sunucuya yüklenmez · Ücretsiz kullanım",
      features: ["CAN / CAN FD", "Intel / Motorola", "Doğrulama ve dışa aktarma"],
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
      title: "Create DBC files directly in your browser.",
      text:
        "Open CAN and CAN FD databases, edit messages and signals, inspect the bit layout, and download a validated DBC file.",
      action: "Open DBC Editor",
      guide: "Download PDF guide",
      privacy: "Files are never uploaded · Free to use",
      features: ["CAN / CAN FD", "Intel / Motorola", "Validation and export"],
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
          <ul>
            {t.tools.features.map((feature) => <li key={feature}>{feature}</li>)}
          </ul>
          <div className="tools-actions">
            <a className="button button--primary" href="/dbc-editor/">
              {t.tools.action}
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
          <small><i />{t.tools.privacy}</small>
        </div>
        <div className="dbc-tool-preview" aria-hidden="true">
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
