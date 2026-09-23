import { execFileSync } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const routes = [
  ["/", ["index.html", "src/App.tsx"]],
  ["/learn/", ["learn/index.html", "src/LearnPage.tsx"]],
  ["/learn/dbc-dosyasi-nedir/", ["learn/dbc-dosyasi-nedir/index.html", "src/DbcGuidePage.tsx"]],
  ["/learn/can-bus-ariza-tespiti/", ["learn/can-bus-ariza-tespiti/index.html", "src/GuidePage.tsx"]],
  ["/learn/can-log-analizi/", ["learn/can-log-analizi/index.html", "src/GuidePage.tsx"]],
  ["/learn/j1939-pgn-nedir/", ["learn/j1939-pgn-nedir/index.html", "src/GuidePage.tsx"]],
  ["/learn/j1939-dm1-spn-fmi-cozumleme/", ["learn/j1939-dm1-spn-fmi-cozumleme/index.html", "src/GuidePage.tsx"]],
  ["/learn/dbc-ile-ecu-simulasyonu/", ["learn/dbc-ile-ecu-simulasyonu/index.html", "src/GuidePage.tsx"]],
  ["/learn/a10vo-la-guc-kontrolu/", ["learn/a10vo-la-guc-kontrolu/index.html", "src/A10voLaGuidePage.tsx", "src/a10vo-la-guide-content.ts", "src/a10vo-la-guide.css"]],
  ["/learn/a10vo-la-power-control/", ["learn/a10vo-la-power-control/index.html", "src/A10voLaGuidePage.tsx", "src/a10vo-la-guide-content.ts", "src/a10vo-la-guide.css"]],
  ["/tools/", ["tools/index.html", "src/ToolsPage.tsx"]],
  ["/dbc-editor/", ["dbc-editor/index.html", "src/DbcEditor.tsx", "src/ToolSeoContent.tsx"]],
  ["/can-viewer/", ["can-viewer/index.html", "src/CanViewer.tsx", "src/ToolSeoContent.tsx"]],
  ["/dbc-ecu-simulator/", ["dbc-ecu-simulator/index.html", "src/DbcEcuSimulator.tsx", "src/ToolSeoContent.tsx"]],
  ["/can-log-analyzer/", ["can-log-analyzer/index.html", "src/CanLogAnalyzer.tsx", "src/ToolSeoContent.tsx"]],
  ["/j1939-dtc-decoder/", ["j1939-dtc-decoder/index.html", "src/J1939DtcAnalyzer.tsx", "src/ToolSeoContent.tsx"]],
  ["/j1939-pgn-calculator/", ["j1939-pgn-calculator/index.html", "src/J1939PgnCalculator.tsx", "src/j1939/pgn.ts", "src/ToolSeoContent.tsx"]],
  ["/hydraulic-simulator/", ["hydraulic-simulator/index.html"]],
  ["/hydraulic-simulator/la-power-controller/", ["hydraulic-simulator/la-power-controller/index.html", "hydraulic-simulator/la-power-controller/lab.css", "hydraulic-simulator/la-power-controller/lab.js"]],
  ["/blog/", ["blog/index.html", "src/EngineeringBlog.tsx"]],
  ["/news/", ["news/index.html", "src/NewsPage.tsx"]],
  ["/gizlilik-politikasi/", ["gizlilik-politikasi/index.html", "src/LegalPage.tsx"]],
  ["/cerez-politikasi/", ["cerez-politikasi/index.html", "src/LegalPage.tsx"]],
  ["/kvkk-aydinlatma-metni/", ["kvkk-aydinlatma-metni/index.html", "src/LegalPage.tsx"]],
];

/**
 * Dil çiftleri: rota -> hreflang haritası. Yeni bir TR/EN çifti eklendiğinde
 * yalnızca bu haritaya iki satır eklemek yeterlidir; alternates otomatik
 * üretilir. hreflang="x-default" Türkçe sürümü gösterir.
 */
const languageAlternates = {
  "/learn/a10vo-la-guc-kontrolu/": {
    tr: "/learn/a10vo-la-guc-kontrolu/",
    en: "/learn/a10vo-la-power-control/",
    "x-default": "/learn/a10vo-la-guc-kontrolu/",
  },
  "/learn/a10vo-la-power-control/": {
    tr: "/learn/a10vo-la-guc-kontrolu/",
    en: "/learn/a10vo-la-power-control/",
    "x-default": "/learn/a10vo-la-guc-kontrolu/",
  },
};

function lastModified(paths) {
  try {
    const changed = execFileSync("git", ["status", "--porcelain", "--", ...paths], { cwd: projectRoot, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    if (changed) return new Date().toISOString().slice(0, 10);
    const value = execFileSync("git", ["log", "-1", "--format=%cs", "--", ...paths], { cwd: projectRoot, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    if (value) return value;
  } catch { /* Source archives may not contain Git history. */ }
  return new Date().toISOString().slice(0, 10);
}

export async function generateSitemap() {
  const items = routes.map(([route, paths]) => {
    const alternates = languageAlternates[route];
    const links = alternates
      ? Object.entries(alternates)
          .map(
            ([lang, href]) =>
              `    <xhtml:link rel="alternate" hreflang="${lang}" href="https://algo-team.com${href}" />`,
          )
          .join("\n")
      : "";
    return `  <url>\n    <loc>https://algo-team.com${route}</loc>\n    <lastmod>${lastModified(paths)}</lastmod>\n${links ? `${links}\n` : ""}  </url>`;
  });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${items.join("\n")}\n</urlset>\n`;
  await writeFile(resolve(projectRoot, "public/sitemap.xml"), xml, "utf8");
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await generateSitemap();
