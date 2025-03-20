import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from 'vite-plugin-svgr';
import path from 'path';

export default defineConfig({
  plugins: [react(), svgr({
    svgrOptions: {
      icon: true,
    },
  })],
  server: {
    port: 3000,
    open: true, // Automatically opens the browser
  },
  base: "/", // Ensures correct path resolution
  resolve: {
    alias: {
      '@routes': path.resolve(__dirname, 'src/routes')
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  build: {
    chunkSizeWarningLimit: 500,   
  },
});
