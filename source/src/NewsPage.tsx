"use client";

import { useEffect, useMemo, useState } from "react";
import newsArchive from "./content/news-archive.json";
import { newsDetails } from "./content/news-details";

type Language = "tr" | "en";
type Category = "all" | "health" | "science-tech" | "mobile-machines" | "mining";

const symbols: Record<Exclude<Category, "all">, string> = {
  health: "HL",
  "science-tech": "ST",
  "mobile-machines": "MM",
  mining: "MT",
};

export default function NewsPage() {
  const [language, setLanguage] = useState<Language>("tr");
  const [category, setCategory] = useState<Category>("all");
  const getText = (tr: string, en: string) => language === "tr" ? tr : en;

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
      ? newsArchive.items
      : newsArchive.items.filter((item) => item.category === category),
    [category],
  );

  const labels = language === "tr"
    ? {
        back: "Ana sayfa",
        blog: "Teknik yazılar",
        overline: "ALGO TEAM / HABERLER",
        title: "Mühendislik, bilim ve teknoloji haberleri.",
        intro: "Sağlık, bilim ve teknoloji, mobil iş makineleri ve madencilik teknolojilerinden güvenilir kaynaklara dayanan kalıcı bir haber arşivi.",
        count: "haber",
        why: "Mühendislik açısından neden önemli?",
        details: "Ayrıntılar ve bağlam",
        source: "Kaynağı aç",
        published: "Yayımlanma tarihi",
        healthNote: "Sağlık içerikleri hakkında",
      }
    : {
        back: "Home",
        blog: "Technical articles",
        overline: "ALGO TEAM / NEWS",
        title: "Engineering, science, and technology news.",
        intro: "A permanent, source-backed archive spanning health, science and technology, mobile machinery, and mining technology.",
        count: "stories",
        why: "Why does this matter to engineers?",
        details: "Details and context",
        source: "Open source",
        published: "Published",
        healthNote: "About health coverage",
      };

  function chooseCategory(next: Category) {
    setCategory(next);
    const nextUrl = next === "all" ? "/news/" : `/news/#${next}`;
    window.history.replaceState(null, "", nextUrl);
  }

  function formatDate(value: string) {
    return new Intl.DateTimeFormat(language === "tr" ? "tr-TR" : "en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(`${value}T12:00:00`));
  }

  return (
    <main className="news-page">
      <header className="site-header news-header">
        <a className="brand" href="/" aria-label="ALGO TEAM ana sayfa">
          <img src="/assets/algo-team-logo.png" alt="ALGO TEAM" width="1200" height="206" />
        </a>
        <nav className="news-top-nav" aria-label="İçerik menüsü">
          <a href="/">{labels.back}</a>
          <a href="/blog/">{labels.blog}</a>
        </nav>
        <div className="language-switch" aria-label="Dil seçimi">
          <button className={language === "tr" ? "active" : ""} onClick={() => setLanguage("tr")} type="button">TR</button>
          <span>/</span>
          <button className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")} type="button">EN</button>
        </div>
      </header>

      <section className="news-hero">
        <p className="overline">{labels.overline}</p>
        <h1>{labels.title}</h1>
        <p>{labels.intro}</p>
      </section>

      <nav className="news-filters" aria-label={language === "tr" ? "Haber kategorileri" : "News categories"}>
        {newsArchive.labels.map((label) => (
          <button
            className={category === label.key ? "active" : ""}
            id={label.key === "all" ? undefined : label.key}
            key={label.key}
            onClick={() => chooseCategory(label.key as Category)}
            type="button"
          >
            <span>{getText(label.labelTr, label.labelEn)}</span>
            <small>{label.key === "all" ? newsArchive.items.length : newsArchive.items.filter((item) => item.category === label.key).length}</small>
          </button>
        ))}
      </nav>

      <section className="news-feed" aria-live="polite">
        <p className="news-result-count">{items.length} {labels.count}</p>
        {items.map((item, index) => {
          const categoryLabel = newsArchive.labels.find((entry) => entry.key === item.category);
          const detail = newsDetails[item.id]?.[language];
          return (
            <article className={`news-story news-story--${item.category}`} id={`news-${item.id}`} key={item.id}>
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
                  <time dateTime={item.publishedDate}>{labels.published}: {formatDate(item.publishedDate)}</time>
                </div>
              </div>
            </article>
          );
        })}
        {category === "health" || category === "all" ? (
          <aside className="news-health-note">
            <strong>{labels.healthNote}</strong>
            <p>{getText(newsArchive.healthNoteTr, newsArchive.healthNoteEn)}</p>
          </aside>
        ) : null}
      </section>

      <footer>
        <p>ALGO TEAM · ENGINEERING TOOLS</p>
        <p>NEWS · RESEARCH · MOBILE MACHINES</p>
        <p>© {new Date().getFullYear()}</p>
      </footer>
    </main>
  );
}
