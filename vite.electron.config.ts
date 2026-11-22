import { defineConfig } from "vite";
import path from "node:path";
import electron from "vite-plugin-electron/simple";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { readFileSync } from "fs";
const pkg = JSON.parse(readFileSync("./package.json", "utf-8"));

// https://vitejs.dev/config/
export default defineConfig({
  cacheDir: "node_modules/.vite-electron",
  plugins: [
    react(),
    svgr({
      svgrOptions: { icon: true },
    }),
    electron({
      main: {
        entry: "electron/main.ts",
      },
      preload: {
        input: path.join(import.meta.dirname, "electron/preload.ts"),
      },
      renderer: process.env.NODE_ENV === "test" ? undefined : {},
    }),
  ],
  define: {
    "import.meta.env.VITE_TARGET": '"electron"',
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  resolve: {
    alias: {
      "@routes": path.resolve(import.meta.dirname, "src/routes"),
      "@platform/cloud": path.resolve(
        import.meta.dirname,
        "src/platform/web/db",
      ),
      "@platform": path.resolve(import.meta.dirname, "src/platform/desktop"),
      crypto: "crypto-browserify",
      buffer: "buffer",
      process: "process/browser",
      stream: "stream-browserify",
      "virtual:pwa-register": path.resolve(
        import.meta.dirname,
        "src/pwa/registerSW.noop.js",
      ),
    },
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },
  optimizeDeps: {
    include: ["crypto-browserify", "buffer", "process", "stream-browserify"],
  },
  build: {
    chunkSizeWarningLimit: 500,
  },
});
