// Makine Nabzı'nın haber RSS akışından son başlıkları çeker ve
// src/content/sector-feed.json dosyasını günceller. Zamanlanmış iş akışı
// haftalık çalıştırır; içerik değişmediyse dosyaya dokunmaz.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const FEED_URL = "https://makinenabzi.com/rss.xml";
const SECTION_URL = "https://makinenabzi.com/haberler/";
const LIMIT = 6;
const OUTPUT = fileURLToPath(new URL("../src/content/sector-feed.json", import.meta.url));

/** RSS metnindeki HTML varlıklarını çözer ve boşlukları sadeleştirir. */
function decode(value) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&rsquo;|&lsquo;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/** "Sun, 27 Sep 2026 19:45:01 GMT" → "2026-09-27" */
function toDate(value) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
}

function readTag(body, tag) {
  const match = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`).exec(body);
  return match ? decode(match[1]) : "";
}

function parseItems(xml) {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
    .map(([, body]) => ({
      title: readTag(body, "title"),
      url: readTag(body, "link"),
      publishedAt: toDate(readTag(body, "pubDate")),
    }))
    .filter((item) => item.title && item.url.startsWith("https://makinenabzi.com/"))
    .filter((item, index, all) => all.findIndex((other) => other.url === item.url) === index)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, LIMIT);
}

const response = await fetch(FEED_URL, {
  headers: { "user-agent": "ALGO-TEAM-Sector-Feed/1.0 (+https://algo-team.com/news/)" },
});
if (!response.ok) throw new Error(`Sector feed fetch failed: ${response.status}`);

const items = parseItems(await response.text());
if (!items.length) throw new Error("Sector feed did not contain any usable item");

const next = `${JSON.stringify(
  {
    source: "Makine Nabzı",
    sectionUrl: SECTION_URL,
    feedUrl: FEED_URL,
    items,
  },
  null,
  2,
)}\n`;

const current = (() => {
  try {
    return readFileSync(OUTPUT, "utf8");
  } catch {
    return "";
  }
})();

if (current === next) {
  console.log(`sector feed unchanged (${items.length} items)`);
} else {
  writeFileSync(OUTPUT, next);
  console.log(`sector feed updated (${items.length} items, newest ${items[0].publishedAt})`);
}
