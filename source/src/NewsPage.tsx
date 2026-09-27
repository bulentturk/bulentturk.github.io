"use client";

import { useEffect, useMemo, useState } from "react";
import newsArchive from "./content/news-archive.json";
import { newsDetails } from "./content/news-details";
import sectorFeed from "./content/sector-feed.json";
import SiteHeader from "./SiteHeader";
import { useSiteLanguage } from "./use-site-language";

type Language = "tr" | "en";
type Category = "all" | "health" | "science-tech" | "mobile-machines" | "mining";
type NewsItem = (typeof newsArchive.items)[number];

/** Sektör gündeminin yayımlandığı kardeş site (haber bölümü). */
const SECTOR_SECTION = sectorFeed.sectionUrl || "https://makinenabzi.com/haberler/";
/** Haftalık iş akışının RSS'ten güncellediği son başlıklar. */
const sectorItems = sectorFeed.items.slice(0, 6);

/** Seçkide öne çıkan kategoriler: araçlarımızın kullanıldığı alanlar. */
const PICK_CATEGORIES: Category[] = ["mobile-machines", "mining"];
const PICK_COUNT = 6;

const symbols: Record<Exclude<Category, "all">, string> = {
  health: "HL",
  "science-tech": "ST",
  "mobile-machines": "MM",
  mining: "MT",
};

// Arşiv ve seçki statik içerikten türetilir; sayfa başına bir kez hesaplanır.
const allItems: NewsItem[] = [...newsArchive.items].sort((a, b) =>
  b.publishedDate.localeCompare(a.publishedDate),
);
const picks: NewsItem[] = allItems
  .filter((item) => PICK_CATEGORIES.includes(item.category as Category))
  .slice(0, PICK_COUNT);

type Labels = {
  archiveHint: string;
  archiveToggle: string;
  count: string;
  feedAll: string;
  feedKicker: string;
  feedNote: string;
  details: string;
  filterLabel: string;
  healthNote: string;
  intro: string;
  overline: string;
  partnerCta: string;
  partnerKicker: string;
  partnerNote: string;
  partnerText: string;
  partnerTitle: string;
  partnerTopics: string[];
  picksIntro: string;
  picksKicker: string;
  picksMore: string;
  picksTitle: string;
  published: string;
  source: string;
  title: string;
  why: string;
};

const LABELS: Record<Language, Labels> = {
  tr: {
    archiveHint: "Arşivi aç",
    archiveToggle: "Tüm haber arşivi",
    count: "haber",
    feedAll: "Makine Nabzı haberlerinin tamamı",
    feedKicker: "MAKİNE NABZI'NDAN SON BAŞLIKLAR",
    feedNote: "Bu altı başlık kardeş siteden haftalık olarak otomatik güncellenir; haberlerin tamamı Makine Nabzı'nda.",
    details: "Ayrıntılar ve bağlam",
    filterLabel: "Haber kategorileri",
    healthNote: "Sağlık içerikleri hakkında",
    intro:
      "algo-team.com mühendislik araçları ve teknik rehberlere odaklanıyor. İş makinaları, madencilik, liman, tarım, araç üstü ekipman ve elektrifikasyon haberleri kardeş sitemiz Makine Nabzı'nda yayımlanıyor. Burada araçlarımızı doğrudan ilgilendiren seçkiler ve eski haber arşivi kalıyor.",
    overline: "ALGO TEAM / HABERLER",
    partnerCta: "Makine Nabzı'na git",
    partnerKicker: "KARDEŞ SİTE",
    partnerNote: "Günlük sektör akışı orada; bu sayfa seçki ve arşiv olarak kalıyor.",
    partnerText:
      "İş makinaları, madencilik, liman, tarım, araç üstü ekipman ve elektrifikasyonda haber, teknik analiz ve teknoloji platformu.",
    partnerTitle: "Sektör gündemi: Makine Nabzı",
    partnerTopics: ["Elektrifikasyon", "İş makinaları", "Madencilik", "Liman & tarım"],
    picksIntro:
      "Mobil iş makinaları ve madencilik teknolojilerinden, mühendislik açısından öne çıkan seçilmiş haberler — kaynaklarıyla birlikte.",
    picksKicker: "SEÇKİ",
    picksMore: "Sektörün tamamını Makine Nabzı'nda takip edin",
    picksTitle: "Araçlarımızı ilgilendiren başlıklar",
    published: "Yayımlanma tarihi",
    source: "Kaynağı aç",
    title: "Sektör gündemi artık Makine Nabzı'nda.",
    why: "Mühendislik açısından neden önemli?",
  },
  en: {
    archiveHint: "Open the archive",
    archiveToggle: "Full news archive",
    count: "stories",
    feedAll: "All Makine Nabzı stories",
    feedKicker: "LATEST FROM MAKINE NABZI",
    feedNote: "These six headlines refresh automatically every week from our sister site; the full feed lives on Makine Nabzı.",
    details: "Details and context",
    filterLabel: "News categories",
    healthNote: "About health coverage",
    intro:
      "algo-team.com focuses on engineering tools and technical guides. Mobile machinery, mining, ports, agriculture, on-vehicle equipment and electrification coverage is published on our sister site Makine Nabzı. What remains here is a curated selection that touches our tools, plus the older news archive.",
    overline: "ALGO TEAM / NEWS",
    partnerCta: "Visit Makine Nabzı",
    partnerKicker: "SISTER SITE",
    partnerNote: "The daily sector feed lives there; this page stays as a selection and archive.",
    partnerText:
      "A news, technical analysis and technology platform for mobile machinery, mining, ports, agriculture, on-vehicle equipment and electrification.",
    partnerTitle: "Sector coverage: Makine Nabzı",
    partnerTopics: ["Electrification", "Mobile machinery", "Mining", "Ports & agriculture"],
    picksIntro:
      "Stories from mobile machinery and mining technology that matter most to engineers — each with its source.",
    picksKicker: "SELECTION",
    picksMore: "Follow the full sector feed on Makine Nabzı",
    picksTitle: "Stories that touch our tools",
    published: "Published",
    source: "Open source",
    title: "Sector news now lives on Makine Nabzı.",
    why: "Why does this matter to engineers?",
  },
};

function formatDate(value: string, language: Language) {
  return new Intl.DateTimeFormat(language === "tr" ? "tr-TR" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

function formatMonth(value: string, language: Language) {
  if (!value) return "";
  return new Intl.DateTimeFormat(language === "tr" ? "tr-TR" : "en-GB", {
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

const archiveOldest = allItems[allItems.length - 1]?.publishedDate ?? "";
const archiveNewest = allItems[0]?.publishedDate ?? "";

type StoryCardProps = {
  detail?: string[];
  idPrefix: string;
  index: number;
  item: NewsItem;
  labels: Labels;
  language: Language;
};

function StoryCard({ detail, idPrefix, index, item, labels, language }: StoryCardProps) {
  const getText = (tr: string, en: string) => (language === "tr" ? tr : en);
  const categoryLabel = newsArchive.labels.find((entry) => entry.key === item.category);

  return (
    <article className={`news-story news-story--${item.category}`} id={`${idPrefix}${item.id}`}>
      <div className="news-story-visual" aria-hidden="true">
        <span>{symbols[item.category as Exclude<Category, "all">]}</span>
        <strong>{(index + 1).toString().padStart(2, "0")}</strong>
        <i /><i />
      </div>
      <div className="news-story-content">
        <div className="news-story-meta">
          <span>{categoryLabel ? getText(categoryLabel.labelTr, categoryLabel.labelEn) : item.category}</span>
          <span>{getText(item.evidenceTr, item.evidenceEn)}</span>
        </div>
        <h2>{getText(item.titleTr, item.titleEn)}</h2>
        <p className="news-story-summary">{getText(item.summaryTr, item.summaryEn)}</p>
        {detail ? (
          <div className="news-story-detail">
            <h3>{labels.details}</h3>
            {detail.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        ) : null}
        <aside>
          <strong>{labels.why}</strong>
          <p>{getText(item.whyTr, item.whyEn)}</p>
        </aside>
        <div className="news-story-footer">
          <a href={item.sourceUrl} target="_blank" rel="noreferrer">
            <span>{item.sourceName}</span>
            <strong>{labels.source} ↗</strong>
          </a>
          <time dateTime={item.publishedDate}>{labels.published}: {formatDate(item.publishedDate, language)}</time>
        </div>
      </div>
    </article>
  );
}

export default function NewsPage() {
  const [language, setLanguage] = useSiteLanguage();
  const [category, setCategory] = useState<Category>("all");
  const getText = (tr: string, en: string) => language === "tr" ? tr : en;
  const labels = LABELS[language];

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = language === "tr"
      ? "Haberler | ALGO TEAM"
      : "News | ALGO TEAM";
  }, [language]);

  useEffect(() => {
    const hash = window.location.hash.slice(1) as Category;
    if (newsArchive.labels.some((label) => label.key === hash)) setCategory(hash);
  }, []);

  const items = useMemo(
    () => category === "all"
      ? allItems
      : allItems.filter((item) => item.category === category),
    [category],
  );

  function chooseCategory(next: Category) {
    setCategory(next);
    const nextUrl = next === "all" ? "/news/" : `/news/#${next}`;
    window.history.replaceState(null, "", nextUrl);
  }

  return (
    <main className="news-page">
      <SiteHeader active="news" language={language} onLanguage={setLanguage} />

      <section className="news-hero">
        <p className="overline">{labels.overline}</p>
        <h1>{labels.title}</h1>
        <p>{labels.intro}</p>
      </section>

      <section className="news-partner" aria-labelledby="news-partner-title">
        <div className="news-partner-card">
          <div className="news-partner-copy">
            <p className="section-kicker">{labels.partnerKicker}</p>
            <h2 id="news-partner-title">{labels.partnerTitle}</h2>
            <p>{labels.partnerText}</p>
            <ul className="news-partner-topics">
              {labels.partnerTopics.map((topic) => <li key={topic}>{topic}</li>)}
            </ul>
          </div>
          <div className="news-partner-action">
            <a
              className="news-partner-cta"
              data-analytics-action="makine_nabzi"
              href={SECTOR_SECTION}
              rel="noopener"
              target="_blank"
            >
              {labels.partnerCta} <span aria-hidden="true">↗</span>
            </a>
            <small>{labels.partnerNote}</small>
          </div>
        </div>

        {sectorItems.length ? (
          <div className="sector-feed">
            <div className="sector-feed-head">
              <p className="section-kicker">{labels.feedKicker}</p>
              <a href={SECTOR_SECTION} rel="noopener" target="_blank">
                {labels.feedAll} <span aria-hidden="true">↗</span>
              </a>
            </div>
            <ol className="sector-feed-list">
              {sectorItems.map((item) => (
                <li key={item.url}>
                  <a href={item.url} rel="noopener" target="_blank">
                    <span>{item.title}</span>
                    <time dateTime={item.publishedAt}>{formatMonth(item.publishedAt, language)}</time>
                  </a>
                </li>
              ))}
            </ol>
            <small className="sector-feed-note">{labels.feedNote}</small>
          </div>
        ) : null}
      </section>

      <section aria-labelledby="news-picks-title" className="news-picks">
        <div className="news-section-head">
          <p className="section-kicker">{labels.picksKicker}</p>
          <h2 id="news-picks-title">{labels.picksTitle}</h2>
          <p>{labels.picksIntro}</p>
        </div>
        <div className="news-picks-list">
          {picks.map((item, index) => (
            <StoryCard
              idPrefix="pick-"
              index={index}
              item={item}
              key={item.id}
              labels={labels}
              language={language}
            />
          ))}
        </div>
        <p className="news-picks-more">
          <a href={SECTOR_SECTION} rel="noopener" target="_blank">
            {labels.picksMore} <span aria-hidden="true">↗</span>
          </a>
        </p>
      </section>

      <details className="news-archive">
        <summary>
          <span className="news-archive-title">
            <strong>{labels.archiveToggle}</strong>
            <small>
              {allItems.length} {labels.count}
              {" · "}
              {formatMonth(archiveOldest, language)} – {formatMonth(archiveNewest, language)}
            </small>
          </span>
          <i aria-hidden="true">{labels.archiveHint}</i>
        </summary>

        <nav className="news-filters" aria-label={labels.filterLabel}>
          {newsArchive.labels.map((label) => (
            <button
              className={category === label.key ? "active" : ""}
              id={label.key === "all" ? undefined : label.key}
              key={label.key}
              onClick={() => chooseCategory(label.key as Category)}
              type="button"
            >
              <span>{getText(label.labelTr, label.labelEn)}</span>
              <small>{label.key === "all" ? allItems.length : allItems.filter((item) => item.category === label.key).length}</small>
            </button>
          ))}
        </nav>

        <section className="news-feed" aria-live="polite">
          <p className="news-result-count">{items.length} {labels.count}</p>
          {items.map((item, index) => (
            <StoryCard
              detail={newsDetails[item.id]?.[language]}
              idPrefix="news-"
              index={index}
              item={item}
              key={item.id}
              labels={labels}
              language={language}
            />
          ))}
          {category === "health" || category === "all" ? (
            <aside className="news-health-note">
              <strong>{labels.healthNote}</strong>
              <p>{getText(newsArchive.healthNoteTr, newsArchive.healthNoteEn)}</p>
            </aside>
          ) : null}
        </section>
      </details>

      <footer>
        <p>ALGO TEAM · ENGINEERING TOOLS</p>
        <p>NEWS · RESEARCH · MOBILE MACHINES</p>
        <p>© {new Date().getFullYear()}</p>
      </footer>
    </main>
  );
}
