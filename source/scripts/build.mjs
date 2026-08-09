import { readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { build } from "vite";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const clientOutDir = resolve(projectRoot, "dist");
const serverOutDir = resolve(projectRoot, ".ssr-build");
const staticPages = [
  { route: "/", path: resolve(clientOutDir, "index.html") },
  { route: "/learn/", path: resolve(clientOutDir, "learn/index.html") },
  { route: "/tools/", path: resolve(clientOutDir, "tools/index.html") },
  { route: "/blog/", path: resolve(clientOutDir, "blog/index.html") },
  { route: "/news/", path: resolve(clientOutDir, "news/index.html") },
];

process.chdir(projectRoot);

await build();

await build({
  configFile: false,
  root: projectRoot,
  plugins: [react()],
  build: {
    ssr: resolve(projectRoot, "src/entry-server.tsx"),
    outDir: serverOutDir,
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: "entry-server.mjs",
      },
    },
  },
});

const { renderPage } = await import(
  `${pathToFileURL(resolve(serverOutDir, "entry-server.mjs")).href}?t=${Date.now()}`
);
const mountPoint = '<div id="root"></div>';

for (const page of staticPages) {
  const template = await readFile(page.path, "utf8");
  if (!template.includes(mountPoint)) {
    throw new Error(`Root mount point was not found in ${page.route}.`);
  }
  await writeFile(
    page.path,
    template.replace(mountPoint, `<div id="root">${renderPage(page.route)}</div>`),
  );
}
await rm(serverOutDir, { recursive: true, force: true });
