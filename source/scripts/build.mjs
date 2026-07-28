import { readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { build } from "vite";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const clientOutDir = resolve(projectRoot, "dist");
const serverOutDir = resolve(projectRoot, ".ssr-build");
const homepagePath = resolve(clientOutDir, "index.html");

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

const { renderHomepage } = await import(
  `${pathToFileURL(resolve(serverOutDir, "entry-server.mjs")).href}?t=${Date.now()}`
);
const renderedHomepage = renderHomepage();
const template = await readFile(homepagePath, "utf8");
const mountPoint = '<div id="root"></div>';

if (!template.includes(mountPoint)) {
  throw new Error("Homepage root mount point was not found in the client build.");
}

await writeFile(
  homepagePath,
  template.replace(mountPoint, `<div id="root">${renderedHomepage}</div>`),
);
await rm(serverOutDir, { recursive: true, force: true });
