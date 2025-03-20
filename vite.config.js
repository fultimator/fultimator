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
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react'; // Separate React and ReactDOM into a chunk
            }
            if (id.includes('@mui/material')) {
              return 'mui-material'; // Separate MUI core
            }
            if (id.includes('@mui/icons-material')) {
              return 'mui-icons'; // Separate MUI icons
            }
            if (id.includes('@fortawesome')) {
              return 'fontawesome'; // Separate FontAwesome icons
            }
            if (id.includes('firebase')) {
              return 'firebase'; // Separate Firebase
            }
            if (id.includes('axios')) {
              return 'axios'; // Separate Axios
            }
            if (id.includes('date-fns')) {
              return 'date-fns'; // Separate Date-fns
            }
            if (id.includes('react-router-dom')) {
              return 'react-router'; // Separate React Router
            }
            if (id.includes('react-icons')) {
              return 'react-icons'; // Separate React Icons
            }
            if (id.includes('react-markdown')) {
              return 'react-markdown'; // Separate React Markdown
            }
          }
        },
      },
    },
  },
});
