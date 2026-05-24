import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";
import { readFileSync } from "fs";
const pkg = JSON.parse(readFileSync("./package.json", "utf-8"));

export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
      },
    }),
    VitePWA({
      registerType: "autoUpdate",
      manifest: false,
      workbox: {
        navigateFallback: "/index.html",
        maximumFileSizeToCacheInBytes: 7 * 1024 * 1024,
        globPatterns: [
          "**/*.{js,css,html,ico,png,svg,webp,avif,jpg,jpeg,woff2,ttf}",
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  server: {
    port: 3000,
    open: true, // Automatically opens the browser
  },
  base: "/", // Ensures correct path resolution
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  resolve: {
    alias: {
      "@routes": path.resolve(__dirname, "src/routes"),
      "@platform/cloud": path.resolve(__dirname, "src/platform/web/db"),
      "@platform": path.resolve(__dirname, "src/platform/web"),
    },
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },
  css: {
    preprocessorOptions: {
      sass: {
        api: "modern",
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 500,
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    setupFiles: ["src/forms/tests/visibility/setup.ts"],
  },
});
