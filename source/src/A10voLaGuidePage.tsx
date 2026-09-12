import { useEffect } from "react";
import { laGuideCopy, laGuidePaths, laGuidePdfs, laSource, type LaGuideLanguage, type LaGuideSection } from "./a10vo-la-guide-content";
import "./a10vo-la-guide.css";

const origin = "https://algo-team.com";

function persistLanguage(language: LaGuideLanguage) {
  try { localStorage.setItem("algo-team-language", language); } catch { /* Reading still works without storage. */ }
  document.documentElement.lang = language;
  window.dispatchEvent(new CustomEvent("site-language-changed", { detail: language }));
}

function OperatingEnvelope({ language }: { language: LaGuideLanguage }) {
  const copy = laGuideCopy[language];
  const x = (q: number) => 62 + q / 115 * 640;
  const y = (p: number) => 362 - p / 300 * 320;
  const q = (p: number) => Math.min(71.1, 7360 / Math.max(1, p)) * 1500 * 0.95 / 1000;
  const points = Array.from({ length: 141 }, (_, i) => `${x(q(i * 2)).toFixed(2)},${y(i * 2).toFixed(2)}`);
  points.push(`${x(0)},${y(280)}`);
  return <figure className="la-envelope">
    <svg viewBox="0 0 760 440" role="img" aria-labelledby="la-map-title la-map-description">
      <title id="la-map-title">{copy.curveTitle}</title>
      <desc id="la-map-description">{copy.curveCaption}</desc>
      <rect x="0" y="0" width="760" height="440" rx="12" fill="#fff" />
      {[0, 50, 100, 150, 200, 250, 300].map(p => <g key={p}><line x1="62" x2="702" y1={y(p)} y2={y(p)} stroke="#e1e6e5" /><text x="51" y={y(p) + 5} textAnchor="end" fontSize="14">{p}</text></g>)}
      {[0, 20, 40, 60, 80, 100].map(flow => <g key={flow}><line x1={x(flow)} x2={x(flow)} y1="42" y2="362" stroke="#e1e6e5" /><text x={x(flow)} y="386" textAnchor="middle" fontSize="14">{flow}</text></g>)}
      <path d="M62 42V362H702" fill="none" stroke="#102232" strokeWidth="2" />
      <polyline points={points.join(" ")} fill="none" stroke="#087f8c" strokeWidth="4" strokeLinejoin="round" />
      {[80, 150, 200, 250].map(p => <g key={p}><circle cx={x(q(p))} cy={y(p)} r="5" fill="#c0451b" stroke="white" strokeWidth="2" /><text x={x(q(p)) - 11} y={y(p) + (p === 80 ? 6 : 18)} textAnchor="end" fontSize="14">{p} bar</text></g>)}
      <text x="66" y="23" fontSize="14">p [bar]</text>
      <text x="382" y="417" textAnchor="middle" fontSize="15">{language === "tr" ? "Debi q [L/dak]" : "Flow q [L/min]"}</text>
      <text x="240" y={y(280) - 12} fontSize="14">DR · 280 bar</text>
    </svg>
    <figcaption><strong>{copy.curveTitle}.</strong> {copy.curveCaption}</figcaption>
  </figure>;
}

export default function A10voLaGuidePage({ language = "tr" }: { language?: LaGuideLanguage }) {
  const copy = laGuideCopy[language];
  const sections: readonly LaGuideSection[] = copy.sections;
  const url = origin + laGuidePaths[language];
  useEffect(() => { persistLanguage(language); }, [language]);
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article", headline: copy.title, description: copy.description,
        url, mainEntityOfPage: url, image: origin + "/assets/og-cover.png",
        inLanguage: language === "tr" ? "tr-TR" : "en",
        datePublished: "2026-09-12", dateModified: "2026-09-12",
        citation: [laSource, origin + laGuidePdfs[language]],
        author: { "@type": "Organization", name: "ALGO TEAM" },
        publisher: { "@type": "Organization", name: "ALGO TEAM", url: origin + "/", logo: { "@type": "ImageObject", url: origin + "/assets/algo-team-logo.png" } },
      },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "ALGO TEAM", item: origin + "/" },
        { "@type": "ListItem", position: 2, name: "Learn", item: origin + "/learn/" },
        { "@type": "ListItem", position: 3, name: copy.title, item: url },
      ] },
    ],
  };

  return <main className="la-guide-page" data-guide-language={language}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    <header className="la-guide-header">
      <a href="/" className="la-guide-brand" aria-label="ALGO TEAM"><img src="/assets/algo-team-logo.png" width="1200" height="206" alt="ALGO TEAM" /></a>
      <nav aria-label={language === "tr" ? "Ana menü" : "Main navigation"}><a href="/">{copy.home}</a><a href="/learn/">Learn</a><a href="/hydraulic-simulator/la-power-controller/">LA Lab</a></nav>
      <div className="la-guide-languages" aria-label="Language">
        {(["tr", "en"] as const).map(value => <a key={value} href={laGuidePaths[value]} hrefLang={value} lang={value} data-guide-locale={value} aria-current={value === language ? "page" : undefined} onClick={() => persistLanguage(value)}>{value.toUpperCase()}</a>)}
      </div>
    </header>
    <article>
      <header className="la-guide-hero">
        <div className="la-guide-container"><p className="la-overline">{copy.eyebrow}</p><h1>{copy.title}</h1><p className="la-guide-meta">{copy.updated}</p><p className="la-guide-intro">{copy.intro}</p>
          <div className="la-guide-actions"><a className="la-guide-button" data-guide-lab href="/hydraulic-simulator/la-power-controller/">{copy.lab} →</a><a className="la-guide-button secondary" data-la-download download href={laGuidePdfs[language]}>{copy.download} ↓</a></div><p className="la-guide-meta">{copy.pdfLabel}</p>
        </div>
      </header>
      <div className="la-guide-container la-guide-body">
        <nav className="la-guide-toc" aria-label={copy.toc}><h2>{copy.toc}</h2><ol>{sections.map(section => <li key={section.id}><a href={`#${section.id}`}>{section.title.replace(/^\d+\.\s*/, "")}</a></li>)}</ol></nav>
        {sections.map(section => <section key={section.id} id={section.id} className="la-guide-section">
          <h2>{section.title}</h2>
          {section.paragraphs?.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          {section.formulas ? <div className="la-guide-formulas">{section.formulas.map(formula => <p key={formula}><code>{formula}</code></p>)}</div> : null}
          {section.items ? (section.ordered ? <ol className="la-guide-steps">{section.items.map(item => <li key={item}>{item}</li>)}</ol> : <ul>{section.items.map(item => <li key={item}>{item}</li>)}</ul>) : null}
          {section.table ? <div className="la-guide-table" role="region" aria-label={section.title} tabIndex={0}><table><caption>{section.title}</caption><thead><tr>{section.table.columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead><tbody>{section.table.rows.map((row, index) => <tr key={index}>{row.map((cell, col) => col === 0 ? <th key={col} scope="row">{cell}</th> : <td key={col}>{cell}</td>)}</tr>)}</tbody></table></div> : null}
          {section.figures ? <div className={`la-guide-figures ${section.figures.length > 1 ? "multiple" : ""}`}>{section.figures.map(figure => <figure key={figure.src}><a href={figure.src} target="_blank" rel="noreferrer"><img src={figure.src} alt={figure.alt} loading="lazy" /></a><figcaption>{figure.caption}</figcaption></figure>)}</div> : null}
          {section.id === "regions" ? <OperatingEnvelope language={language} /> : null}
          <p className="la-guide-reference">{copy.reference}: RE 92705, {copy.page} {section.refs.map((page, index) => <span key={page}>{index > 0 ? ", " : ""}<a href={`${laSource}#page=${page}`} target="_blank" rel="noreferrer">{page}</a></span>)}</p>
        </section>)}
        <section className="la-guide-section" id="sources"><h2>{copy.sourceTitle}</h2><p>{copy.sourceText}</p><p><a href={laSource} target="_blank" rel="noreferrer">Bosch Rexroth — RE 92705/2019-03-25 (PDF)</a></p><p>{copy.sourceNote}</p></section>
        <aside className="la-guide-next"><h2>{copy.nextTitle}</h2><p>{copy.nextText}</p><div className="la-guide-actions"><a className="la-guide-button" href="/hydraulic-simulator/la-power-controller/">{copy.lab} →</a><a className="la-guide-button secondary" href="/hydraulic-simulator/">{copy.simulator} →</a></div></aside>
      </div>
    </article>
    <footer className="la-guide-footer"><span>ALGO TEAM · LEARN</span><a href="/learn/">{language === "tr" ? "Tüm rehberler" : "All guides"} →</a><span>Hydraulics · A10VO LA</span></footer>
  </main>;
}
