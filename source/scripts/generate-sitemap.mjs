import { execFileSync } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const routes = [
  ["/", ["index.html", "src/App.tsx"]],
  ["/learn/", ["learn/index.html", "src/LearnPage.tsx"]],
  ["/learn/dbc-dosyasi-nedir/", ["learn/dbc-dosyasi-nedir/index.html", "src/GuidePage.tsx"]],
  ["/learn/can-log-analizi/", ["learn/can-log-analizi/index.html", "src/GuidePage.tsx"]],
  ["/learn/dbc-ile-ecu-simulasyonu/", ["learn/dbc-ile-ecu-simulasyonu/index.html", "src/GuidePage.tsx"]],
  ["/tools/", ["tools/index.html", "src/ToolsPage.tsx"]],
  ["/dbc-editor/", ["dbc-editor/index.html", "src/DbcEditor.tsx", "src/ToolSeoContent.tsx"]],
  ["/can-viewer/", ["can-viewer/index.html", "src/CanViewer.tsx", "src/ToolSeoContent.tsx"]],
  ["/dbc-ecu-simulator/", ["dbc-ecu-simulator/index.html", "src/DbcEcuSimulator.tsx", "src/ToolSeoContent.tsx"]],
  ["/can-log-analyzer/", ["can-log-analyzer/index.html", "src/CanLogAnalyzer.tsx", "src/ToolSeoContent.tsx"]],
  ["/j1939-dtc-decoder/", ["j1939-dtc-decoder/index.html", "src/J1939DtcAnalyzer.tsx", "src/ToolSeoContent.tsx"]],
  ["/hydraulic-simulator/", ["hydraulic-simulator/index.html"]],
  ["/blog/", ["blog/index.html", "src/EngineeringBlog.tsx"]],
  ["/news/", ["news/index.html", "src/NewsPage.tsx"]],
];

function lastModified(paths) {
  try {
    const changed = execFileSync("git", ["status", "--porcelain", "--", ...paths], {
      cwd: projectRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (changed) return new Date().toISOString().slice(0, 10);

    const value = execFileSync("git", ["log", "-1", "--format=%cs", "--", ...paths], {
      cwd: projectRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (value) return value;
  } catch {
    // A source archive may not contain Git history; use the build date below.
  }
  return new Date().toISOString().slice(0, 10);
}

export async function generateSitemap() {
  const items = routes.map(([route, paths]) => `  <url>\n    <loc>https://algo-team.com${route}</loc>\n    <lastmod>${lastModified(paths)}</lastmod>\n  </url>`);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items.join("\n")}\n</urlset>\n`;
  await writeFile(resolve(projectRoot, "public/sitemap.xml"), xml, "utf8");
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await generateSitemap();
}
