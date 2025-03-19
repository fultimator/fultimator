import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [react(),  svgr({
    svgrOptions: {
      icon: true, // This ensures you can use the `ReactComponent` export.
    },
  })],
  server: {
    port: 3000, // Change if needed
    open: true, // Automatically opens the browser
  },
  base: "/", // Ensures correct path resolution
});
