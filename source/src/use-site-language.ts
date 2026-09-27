import { useEffect, useState } from "react";

export type SiteLanguage = "tr" | "en";

const STORAGE_KEY = "algo-team-language";

/**
 * Site genelinde dil seçimi. A10VO LA rehberiyle aynı localStorage
 * anahtarını kullanır; böylece sayfalar arasında geçiş yapıldığında
 * seçilen dil korunur.
 */
export function useSiteLanguage(initial: SiteLanguage = "tr") {
  const [language, setLanguage] = useState<SiteLanguage>(initial);

  // Sunucu çıktısı her zaman varsayılan dille eşleşsin diye kayıtlı
  // seçim yalnızca bağlanma (hydration) sonrasında okunur.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "tr" || stored === "en") setLanguage(stored);
    } catch {
      /* Depolama kapalıysa varsayılan dil geçerli olur. */
    }
  }, []);

  function selectLanguage(next: SiteLanguage) {
    setLanguage(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* Depolama kapalıysa seçim yalnızca bu sekmede geçerli olur. */
    }
    window.dispatchEvent(new CustomEvent("site-language-changed", { detail: next }));
  }

  return [language, selectLanguage] as const;
}
