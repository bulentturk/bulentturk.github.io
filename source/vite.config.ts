import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  base: "/",
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        "dbc-editor": resolve(__dirname, "dbc-editor/index.html"),
        "can-viewer": resolve(__dirname, "can-viewer/index.html"),
        "can-log-analyzer": resolve(__dirname, "can-log-analyzer/index.html"),
      },
    },
  },
});
