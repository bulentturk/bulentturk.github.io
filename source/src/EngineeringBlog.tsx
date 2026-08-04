"use client";

import { useEffect, useState } from "react";
import dailyBriefing from "./content/daily-briefing.json";

type Language = "tr" | "en";

const articles = {
  tr: [
    {
      id: "can-analizi",
      code: "CAN / 01",
      title: "CAN hattında mesaj analizine nereden başlanır?",
      lead: "Bir CAN sorununda ilk hedef mesajları yorumlamak değil, hattın fiziksel ve zamansal olarak sağlıklı olduğunu doğrulamaktır.",
      points: [
        "Bit hızını ve örnekleme ayarını cihazlarla eşleştir.",
        "Enerji kapalıyken CAN-H ile CAN-L arasında yaklaşık 60 Ω terminasyon kontrolü yap.",
        "Mesaj çevrim zamanlarını ölç; yalnız ortalamaya değil jitter ve kayıp periyotlara da bak.",
        "Alive counter ve checksum varsa önce bu alanların gerçekten nasıl değiştiğini belirle.",
      ],
      note: "Sağlıklı görünen bir trace, doğru ölçeklendirilmiş bir trace anlamına gelmez. Byte order, factor ve offset ayrı doğrulanmalıdır.",
    },
    {
      id: "olay-tabanli-telemetri",
      code: "TELEMETRY / 02",
      title: "Her veriyi değil, doğru olayı kaydetmek",
      lead: "Telemetride depolama ihtiyacını asıl büyüten sinyal sayısı değil; örnekleme sıklığı, olay öncesi/sonrası pencere ve çevrimdışı kalma süresidir.",
      points: [
        "Sürekli sinyalleri düşük ve gerekçeli bir temel frekansta tut.",
        "Eşik aşımı, durum geçişi ve hata oluşumu gibi olayları ayrı tanımla.",
        "Olaydan önceki kısa tamponu ve olay sonrası gözlem süresini birlikte kaydet.",
        "Sunucuya aktarım ile cihaz içi ham kayıt gereksinimini birbirinden ayır.",
      ],
      note: "İyi bir olay kütüphanesi; olay adı, tetik koşulu, debounce süresi, öncelik, kaydedilecek sinyaller ve kapanış koşulunu açıkça tanımlar.",
    },
    {
      id: "saha-dogrulamasi",
      code: "FIELD / 03",
      title: "Hesap doğruysa makine neden farklı davranır?",
      lead: "Kâğıt üzerindeki sonuç ile makine davranışı arasındaki fark çoğu zaman tek bir büyük hatadan değil, küçük varsayımların üst üste binmesinden çıkar.",
      points: [
        "Komut edilen değer ile ölçülen fiziksel değeri bağımsız bir cihazla karşılaştır.",
        "Ham CAN değerini ölçeklenmiş değerden ayır ve iki aşamayı ayrı doğrula.",
        "Sensör toleransı, filtre gecikmesi ve kontrol çevrim süresini hesaba kat.",
        "Test koşullarını; sıcaklık, yük, besleme gerilimi ve makine durumuyla birlikte kaydet.",
      ],
      note: "Doğrulama kaydı tekrar üretilebilir olmalıdır: yazılım sürümü, parametre seti, test adımı ve kabul kriteri aynı yerde bulunmalıdır.",
    },
  ],
  en: [
    {
      id: "can-analizi",
      code: "CAN / 01",
      title: "Where should CAN message analysis begin?",
      lead: "The first goal in a CAN investigation is not decoding messages; it is proving that the bus is physically and temporally healthy.",
      points: [
        "Match bitrate and sampling settings across all participating devices.",
        "With power off, verify roughly 60 Ω between CAN-H and CAN-L.",
        "Measure message cycle times; inspect jitter and missing periods, not only averages.",
        "When alive counters or checksums exist, determine how those fields actually change first.",
      ],
      note: "A clean-looking trace is not necessarily a correctly scaled trace. Byte order, factor, and offset require separate validation.",
    },
    {
      id: "olay-tabanli-telemetri",
      code: "TELEMETRY / 02",
      title: "Record the right event, not every value",
      lead: "Telemetry storage is driven less by signal count than by sample rate, pre/post-event windows, and expected offline duration.",
      points: [
        "Keep continuous signals at a low, justified baseline rate.",
        "Define threshold crossings, state transitions, and fault onset as separate events.",
        "Capture a short pre-event buffer together with a useful post-event window.",
        "Separate cloud transfer requirements from raw on-device recording.",
      ],
      note: "A useful event library defines the trigger, debounce, priority, captured signals, and clear condition for every event.",
    },
    {
      id: "saha-dogrulamasi",
      code: "FIELD / 03",
      title: "Why does the machine behave differently when the math is right?",
      lead: "The gap between a calculation and machine behavior often comes from stacked small assumptions rather than one large error.",
      points: [
        "Compare the commanded value with an independently measured physical value.",
        "Separate the raw CAN value from its scaled engineering value and validate both.",
        "Account for sensor tolerance, filter delay, and control-loop period.",
        "Record temperature, load, supply voltage, and machine state with the test.",
      ],
      note: "Validation must be repeatable: software version, parameters, test step, and acceptance criteria belong in the same record.",
    },
  ],
} as const;

export default function EngineeringBlog() {
  const [language, setLanguage] = useState<Language>("tr");
  const items = articles[language];
  const labels = language === "tr"
    ? {
        back: "Araçlara dön",
        overline: "ALGO TEAM / MÜHENDİSLİK BLOGU",
        title: "Günlük özet ve saha notları.",
        intro: "Her sabah güncellenen mühendislik seçkisi; CAN, J1939, telemetri ve saha doğrulaması üzerine kalıcı çalışma notlarıyla birlikte.",
        daily: "Günlük mühendislik özeti",
        issue: "Sayı",
        selected: "10 seçilmiş gelişme",
        why: "Neden önemli?",
        source: "Kaynağı aç",
        archive: "Kalıcı teknik notlar",
        archiveIntro: "Sahada tekrar kullanılabilecek kısa kontrol sıraları ve doğrulama notları.",
        checklist: "Kontrol sırası",
        fieldNote: "Saha notu",
      }
    : {
        back: "Back to tools",
        overline: "ALGO TEAM / ENGINEERING BLOG",
        title: "Daily brief and field notes.",
        intro: "A daily engineering selection, together with reusable working notes on CAN, J1939, telemetry, and field validation.",
        daily: "Daily engineering brief",
        issue: "Issue",
        selected: "10 selected developments",
        why: "Why it matters",
        source: "Open source",
        archive: "Evergreen technical notes",
        archiveIntro: "Short check sequences and validation notes designed for repeated use in the field.",
        checklist: "Check sequence",
        fieldNote: "Field note",
      };

  const getText = (tr: string, en: string) => language === "tr" ? tr : en;

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = language === "tr"
      ? "Mühendislik Blogu | Engineering Tools"
      : "Engineering Blog | Engineering Tools";
  }, [language]);

  return (
    <main className="blog-page">
      <header className="site-header blog-header">
        <a className="brand" href="/" aria-label="ALGO TEAM ana sayfa">ALGO<span>TEAM</span></a>
        <a className="blog-back" href="/">← {labels.back}</a>
        <div className="language-switch" aria-label="Dil seçimi">
          <button className={language === "tr" ? "active" : ""} onClick={() => setLanguage("tr")} type="button">TR</button>
          <span>/</span>
          <button className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")} type="button">EN</button>
        </div>
      </header>

      <section className="blog-hero">
        <p className="overline">{labels.overline}</p>
        <h1>{labels.title}</h1>
        <p>{labels.intro}</p>
      </section>

      <section className="daily-brief" id="daily-briefing">
        <div className="daily-brief-head">
          <div>
            <p className="section-kicker">{labels.daily}</p>
            <h2>{getText(dailyBriefing.titleTr, dailyBriefing.titleEn)}</h2>
            <p>{getText(dailyBriefing.dekTr, dailyBriefing.dekEn)}</p>
          </div>
          <div className="daily-brief-meta">
            <span>{labels.issue} {dailyBriefing.issue}</span>
            <span>{getText(dailyBriefing.readingTimeTr, dailyBriefing.readingTimeEn)}</span>
            <span>{labels.selected}</span>
          </div>
        </div>

        <div className="daily-topic-strip" aria-label={labels.daily}>
          {dailyBriefing.topics.map((topic) => (
            <div className={`daily-topic daily-topic--${topic.key}`} key={topic.key}>
              <span>{topic.count.toString().padStart(2, "0")}</span>
              <strong>{getText(topic.labelTr, topic.labelEn)}</strong>
            </div>
          ))}
        </div>

        <div className="daily-card-grid">
          {dailyBriefing.items.map((item, index) => {
            const topic = dailyBriefing.topics.find((entry) => entry.key === item.category);
            const symbol = item.category === "machines" ? "EM" : item.category === "ai" ? "AI" : "SC";

            return (
              <article className={`daily-card daily-card--${item.category}`} id={`daily-${item.id}`} key={item.id}>
                <div className="daily-card-topline">
                  <span>{(index + 1).toString().padStart(2, "0")}</span>
                  <span>{topic ? getText(topic.labelTr, topic.labelEn) : item.category}</span>
                </div>
                <div className={`daily-card-visual daily-card-visual--${item.category}`} aria-hidden="true">
                  <span>{symbol}</span>
                  <i />
                  <i />
                </div>
                <div className="daily-card-copy">
                  <div className="daily-card-evidence">
                    <span>{getText(item.evidenceTr, item.evidenceEn)}</span>
                    <time dateTime={item.publishedDate}>{item.publishedDate}</time>
                  </div>
                  <h3>{getText(item.titleTr, item.titleEn)}</h3>
                  <p>{getText(item.summaryTr, item.summaryEn)}</p>
                  <aside>
                    <strong>{labels.why}</strong>
                    <p>{getText(item.whyTr, item.whyEn)}</p>
                  </aside>
                  <a href={item.sourceUrl} target="_blank" rel="noreferrer">
                    <span>{item.sourceName}</span>
                    <strong>{labels.source} ↗</strong>
                  </a>
                </div>
              </article>
            );
          })}
        </div>

        <aside className="daily-health-note">
          <strong>{language === "tr" ? "Sağlık notu" : "Health note"}</strong>
          <p>{getText(dailyBriefing.healthNoteTr, dailyBriefing.healthNoteEn)}</p>
        </aside>
      </section>

      <section className="blog-archive-head">
        <p className="section-kicker">{labels.archive}</p>
        <h2>{labels.archive}</h2>
        <p>{labels.archiveIntro}</p>
      </section>

      <section className="blog-articles">
        {items.map((article) => (
          <article id={article.id} className="blog-article" key={article.id}>
            <div className="blog-article-code">{article.code}</div>
            <div className="blog-article-content">
              <h2>{article.title}</h2>
              <p className="blog-lead">{article.lead}</p>
              <h3>{labels.checklist}</h3>
              <ol>
                {article.points.map((point) => <li key={point}>{point}</li>)}
              </ol>
              <aside>
                <strong>{labels.fieldNote}</strong>
                <p>{article.note}</p>
              </aside>
            </div>
          </article>
        ))}
      </section>

      <footer>
        <p>ALGO TEAM · ENGINEERING TOOLS</p>
        <p>CAN · J1939 · TELEMETRY · MOBILE MACHINES</p>
        <p>© {new Date().getFullYear()}</p>
      </footer>
    </main>
  );
}
