import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  base: "/",
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        "dbc-editor": resolve(__dirname, "dbc-editor/index.html"),
        "can-viewer": resolve(__dirname, "can-viewer/index.html"),
        "can-log-analyzer": resolve(__dirname, "can-log-analyzer/index.html"),
        "j1939-dtc-decoder": resolve(__dirname, "j1939-dtc-decoder/index.html"),
        "hydraulic-simulator": resolve(__dirname, "hydraulic-simulator/index.html"),
        learn: resolve(__dirname, "learn/index.html"),
        tools: resolve(__dirname, "tools/index.html"),
        blog: resolve(__dirname, "blog/index.html"),
        news: resolve(__dirname, "news/index.html"),
      },
    },
  },
});
