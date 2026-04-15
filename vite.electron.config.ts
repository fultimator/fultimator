import { defineConfig } from "vite";
import path from "node:path";
import electron from "vite-plugin-electron/simple";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { readFileSync } from "fs";
const pkg = JSON.parse(readFileSync("./package.json", "utf-8"));

// https://vitejs.dev/config/
export default defineConfig({
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
        input: path.join(__dirname, "electron/preload.ts"),
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
      "@routes": path.resolve(__dirname, "src/routes"),
      "@platform/cloud": path.resolve(__dirname, "src/platform/web/db"),
      "@platform": path.resolve(__dirname, "src/platform/desktop"),
      crypto: "crypto-browserify",
      buffer: "buffer",
      process: "process/browser",
      stream: "stream-browserify",
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
