"use client";

import { useEffect, useState } from "react";

type Language = "tr" | "en";

const content = {
  tr: {
    nav: { home: "Ana Sayfa", learn: "Learn", tools: "Tools", news: "Haberler" },
    overline: "ALGO TEAM / LEARN",
    title: "Mühendisliği sahada işe yarayacak şekilde öğrenin.",
    intro: "CAN Bus, J1939, elektrik, hidrolik, makine ve kontrol konularını; çalışma mantığı, ölçüm sırası, örnek ve sık hatalarla açıklayan kalıcı teknik içerikler.",
    categoriesTitle: "Öğrenme alanları",
    categoriesIntro: "İçerikler tekil yazılar olarak değil, temelden teşhise ilerleyen konu kümeleri olarak düzenlenir.",
    featuredTitle: "Yayımdaki teknik içerikler",
    featuredIntro: "İlk içerik kümesi CAN ve J1939 çevresinde büyüyor. Yeni yazılar yayımlandıkça ilgili araçlara karşılıklı bağlantı verilecek.",
    openCategory: "İçeriği aç",
    read: "Yazıyı oku",
    available: "Yayında",
    planned: "Hazırlanıyor",
    categories: [
      { code: "01", title: "CAN & J1939", text: "Fiziksel katmandan PGN, SPN/FMI ve DM1 teşhisine uzanan uygulamalı öğrenme yolu.", state: "5 içerik yayında", href: "/blog/#can-analizi" },
      { code: "02", title: "Elektrik", text: "24 V sistemler, kablo kesiti, gerilim düşümü, sigorta seçimi ve saha ölçümleri.", state: "Hazırlanıyor" },
      { code: "03", title: "Hidrolik", text: "Basınç, debi, silindir kuvveti, valf davranışı ve devre doğrulama temelleri.", state: "Hazırlanıyor" },
      { code: "04", title: "Makine", text: "ISO 286 yaklaşımı, tolerans bölgeleri, geçmeler, cıvata bağlantıları ve imalat kararları.", state: "Hazırlanıyor" },
      { code: "05", title: "Kontrol", text: "PID, filtreleme, histerezis, durum makineleri ve güvenli kilitleme mantıkları.", state: "Hazırlanıyor" },
      { code: "06", title: "Mühendislik Temelleri", text: "Ölçüm, belirsizlik, saha doğrulaması, teknik çizim ve tekrar edilebilir test yaklaşımı.", state: "1 içerik yayında", href: "/blog/#saha-dogrulamasi" },
    ],
    featured: [
      { code: "CAN / 01", title: "CAN hattında mesaj analizine nereden başlanır?", text: "Fiziksel katman, zamanlama, jitter, byte order ve ölçek doğrulaması için pratik sıra.", href: "/blog/#can-analizi" },
      { code: "GATEWAY / 04", title: "GCAN-205 ile Modbus verisini CAN'a güvenli eşlemek", text: "Register sırası, byte order, ölçek ve gönderim tetiklerini tek sözleşmede doğrulama.", href: "/blog/#gcan-modbus-can-esleme" },
      { code: "J1939 / 05", title: "J1939 arızalarını SPN ve FMI ile okumak", text: "DM1/DM2, occurrence count ve fiziksel ölçümü birlikte yorumlama.", href: "/blog/#j1939-spn-pgn-okuma" },
      { code: "FIELD / 03", title: "Hesap doğruysa makine neden farklı davranır?", text: "Komut, ham değer, ölçekli değer ve bağımsız ölçümü aynı zaman çizelgesinde karşılaştırma.", href: "/blog/#saha-dogrulamasi" },
    ],
    policyTitle: "Yayın ilkesi",
    policyText: "Standart metinleri ve lisanslı tabloları kopyalamıyoruz. Kamuya açık kaynakları referans gösteriyor, özgün açıklamalar ve örnekler kullanıyor; müşteri, proje ve saha verilerini yayımlamıyoruz.",
  },
  en: {
    nav: { home: "Home", learn: "Learn", tools: "Tools", news: "News" },
    overline: "ALGO TEAM / LEARN",
    title: "Learn engineering in a form that works in the field.",
    intro: "Evergreen technical content for CAN Bus, J1939, electrical, hydraulics, mechanical, and controls—built around principles, measurement sequences, examples, and common mistakes.",
    categoriesTitle: "Learning areas",
    categoriesIntro: "Content is organized as learning paths that progress from fundamentals to diagnosis, not as isolated posts.",
    featuredTitle: "Published technical content",
    featuredIntro: "The first cluster is growing around CAN and J1939. Each new article will link to the relevant engineering tool.",
    openCategory: "Open content",
    read: "Read article",
    available: "Published",
    planned: "In preparation",
    categories: [
      { code: "01", title: "CAN & J1939", text: "A practical path from the physical layer to PGNs, SPN/FMI, DM1, and diagnosis.", state: "5 articles published", href: "/blog/#can-analizi" },
      { code: "02", title: "Electrical", text: "24 V systems, cable sizing, voltage drop, fuse selection, and field measurements.", state: "In preparation" },
      { code: "03", title: "Hydraulics", text: "Pressure, flow, cylinder force, valve behavior, and circuit-validation fundamentals.", state: "In preparation" },
      { code: "04", title: "Mechanical", text: "ISO 286 concepts, tolerance zones, fits, bolted joints, and manufacturing decisions.", state: "In preparation" },
      { code: "05", title: "Controls", text: "PID, filtering, hysteresis, state machines, and safe interlock logic.", state: "In preparation" },
      { code: "06", title: "Engineering Fundamentals", text: "Measurement, uncertainty, field validation, technical drawings, and repeatable testing.", state: "1 article published", href: "/blog/#saha-dogrulamasi" },
    ],
    featured: [
      { code: "CAN / 01", title: "Where should CAN message analysis begin?", text: "A practical sequence for the physical layer, timing, jitter, byte order, and scaling.", href: "/blog/#can-analizi" },
      { code: "GATEWAY / 04", title: "Mapping Modbus data to CAN safely with a GCAN-205", text: "Validate register order, byte order, scaling, and transmission triggers in one contract.", href: "/blog/#gcan-modbus-can-esleme" },
      { code: "J1939 / 05", title: "Reading J1939 faults through SPN and FMI", text: "Interpret DM1/DM2, occurrence count, and physical measurements together.", href: "/blog/#j1939-spn-pgn-okuma" },
      { code: "FIELD / 03", title: "Why does the machine behave differently when the math is right?", text: "Compare command, raw value, scaled value, and independent measurement on one timeline.", href: "/blog/#saha-dogrulamasi" },
    ],
    policyTitle: "Editorial policy",
    policyText: "We do not reproduce standards text or licensed tables. Public sources are referenced through original explanations and examples, while customer, project, and field data remain unpublished.",
  },
} as const;

export default function LearnPage() {
  const [language, setLanguage] = useState<Language>("tr");
  const t = content[language];

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = language === "tr"
      ? "Mühendislik Rehberleri ve Teknik Yazılar | ALGO TEAM Learn"
      : "Engineering Guides and Technical Articles | ALGO TEAM Learn";
  }, [language]);

  return (
    <main className="hub-page">
      <header className="site-header hub-header">
        <a className="brand" href="/" aria-label="ALGO TEAM ana sayfa">ALGO<span>TEAM</span></a>
        <nav className="hub-nav" aria-label="Ana menü">
          <a href="/">{t.nav.home}</a>
          <a className="active" href="/learn/">{t.nav.learn}</a>
          <a href="/tools/">{t.nav.tools}</a>
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
      </section>

      <section className="hub-section">
        <div className="hub-section-head">
          <span>01</span>
          <div><h2>{t.categoriesTitle}</h2><p>{t.categoriesIntro}</p></div>
        </div>
        <div className="hub-category-grid">
          {t.categories.map((item) => (
            <article key={item.code}>
              <div className="hub-card-meta"><span>{item.code}</span><small>{item.state}</small></div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              {"href" in item && item.href ? <a href={item.href}>{t.openCategory} →</a> : <span className="hub-planned">{t.planned}</span>}
            </article>
          ))}
        </div>
      </section>

      <section className="hub-section hub-section--dark">
        <div className="hub-section-head">
          <span>02</span>
          <div><h2>{t.featuredTitle}</h2><p>{t.featuredIntro}</p></div>
        </div>
        <div className="hub-article-list">
          {t.featured.map((item) => (
            <a href={item.href} key={item.code}>
              <span>{item.code}</span>
              <div><h3>{item.title}</h3><p>{item.text}</p></div>
              <strong>{t.read} →</strong>
            </a>
          ))}
        </div>
      </section>

      <section className="hub-policy">
        <p className="section-kicker">03 / {t.policyTitle}</p>
        <h2>{t.policyTitle}</h2>
        <p>{t.policyText}</p>
      </section>

      <footer>
        <p>ALGO TEAM · LEARN</p>
        <p>CAN · J1939 · HYDRAULICS · MECHANICAL</p>
        <p>© {new Date().getFullYear()}</p>
      </footer>
    </main>
  );
}
