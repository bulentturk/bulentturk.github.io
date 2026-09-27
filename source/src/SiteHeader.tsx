import type { SiteLanguage } from "./use-site-language";

export type SiteNavKey = "tools" | "learn" | "roadmap" | "news" | "contact";

const NAV_LABELS: Record<SiteLanguage, Record<SiteNavKey | "menu", string>> = {
  tr: {
    tools: "Araçlar",
    learn: "Learn",
    roadmap: "Yol Haritası",
    news: "Haberler",
    contact: "İletişim",
    menu: "Site menüsü",
  },
  en: {
    tools: "Tools",
    learn: "Learn",
    roadmap: "Roadmap",
    news: "News",
    contact: "Contact",
    menu: "Site menu",
  },
};

type LanguageSwitchProps = {
  language: SiteLanguage;
  onLanguage?: (language: SiteLanguage) => void;
  languageLinks?: Record<SiteLanguage, string>;
};

function LanguageSwitch({ language, onLanguage, languageLinks }: LanguageSwitchProps) {
  if (languageLinks) {
    return (
      <div className="rv-lang" aria-label="Dil seçimi">
        {(["tr", "en"] as const).map((value) => (
          <a
            aria-current={value === language ? "page" : undefined}
            className={value === language ? "active" : undefined}
            href={languageLinks[value]}
            hrefLang={value}
            key={value}
            onClick={() => onLanguage?.(value)}
          >
            {value.toUpperCase()}
          </a>
        ))}
      </div>
    );
  }

  if (!onLanguage) return null;

  return (
    <div className="rv-lang" aria-label="Dil seçimi">
      {(["tr", "en"] as const).map((value) => (
        <button
          aria-pressed={value === language}
          className={value === language ? "active" : undefined}
          key={value}
          onClick={() => onLanguage(value)}
          type="button"
        >
          {value.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export type SiteHeaderProps = {
  language: SiteLanguage;
  /** Butonlu TR/EN seçimi kullanılacaksa. */
  onLanguage?: (language: SiteLanguage) => void;
  /** Ayrı adreslere giden dil bağlantıları (A10VO LA rehberi gibi). */
  languageLinks?: Record<SiteLanguage, string>;
  /** Ana sayfa içinde hash bağlantıları kullanılsın. */
  inPage?: boolean;
  active?: SiteNavKey;
};

/**
 * Tüm sayfaların kullandığı ortak üst menü: logo, ana menü, mobil menü
 * ve dil seçimi. Ana sayfadaki yapıyla birebir aynıdır.
 */
export default function SiteHeader({ language, onLanguage, languageLinks, inPage = false, active }: SiteHeaderProps) {
  const labels = NAV_LABELS[language];
  const prefix = inPage ? "" : "/";
  const links: Array<{ key: SiteNavKey; href: string }> = [
    { key: "tools", href: `${prefix}#tools` },
    { key: "learn", href: "/learn/" },
    { key: "roadmap", href: `${prefix}#roadmap` },
    { key: "news", href: "/news/" },
    { key: "contact", href: `${prefix}#contact` },
  ];

  return (
    <header className="rv-header">
      <div className="rv-header-inner">
        <a className="rv-brand" href={inPage ? "#top" : "/"} aria-label="ALGO TEAM ana sayfa">
          <img src="/assets/algo-team-logo.png" alt="ALGO TEAM" width={1200} height={206} />
        </a>
        <nav className="rv-nav" aria-label="Ana menü">
          {links.map((link) => (
            <a className={link.key === active ? "active" : undefined} href={link.href} key={link.key}>
              {labels[link.key]}
            </a>
          ))}
        </nav>
        <details className="rv-mobile-menu">
          <summary>{labels.menu}</summary>
          <div>
            {links.map((link) => (
              <a className={link.key === active ? "active" : undefined} href={link.href} key={link.key}>
                {labels[link.key]}
              </a>
            ))}
          </div>
        </details>
        <LanguageSwitch language={language} onLanguage={onLanguage} languageLinks={languageLinks} />
      </div>
    </header>
  );
}
