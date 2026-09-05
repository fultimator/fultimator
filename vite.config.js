import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";
import { readFileSync, readdirSync } from "fs";
const pkg = JSON.parse(readFileSync("./package.json", "utf-8"));

// Pre-bundle every @mui/icons-material deep import used in src, so Vite
// discovers them all upfront instead of mid-session.
function findMuiIconImports(dir) {
  const icons = new Set();
  const importRe = /@mui\/icons-material\/([A-Za-z0-9]+)/g;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      for (const icon of findMuiIconImports(fullPath)) icons.add(icon);
    } else if (/\.(jsx?|tsx?)$/.test(entry.name)) {
      const content = readFileSync(fullPath, "utf-8");
      for (const match of content.matchAll(importRe)) icons.add(match[1]);
    }
  }
  return icons;
}
const muiIconDeps = [...findMuiIconImports(path.resolve(__dirname, "src"))].map(
  (icon) => `@mui/icons-material/${icon}`,
);

export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
      },
    }),
    VitePWA({
      manifest: false,
      includeAssets: ["**/*"],
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
  cacheDir: "node_modules/.vite-web",
  server: {
    port: 3000,
    open: true, // Automatically opens the browser
  },
  optimizeDeps: {
    include: ["jszip", ...muiIconDeps],
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
