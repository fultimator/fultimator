// electron/window.ts
import { BrowserWindow } from "electron";
import path from "node:path";
import fs from "fs";

export function createLoadingWindow(parent: BrowserWindow): BrowserWindow {
  // Look for a logo file in public assets
  const logoPossiblePaths = [
    path.join(process.env.VITE_PUBLIC!, "logo512.png"),
    path.join(process.env.VITE_PUBLIC!, "logo192.png"),
    path.join(process.env.VITE_PUBLIC!, "logo120.png"),
  ];
  const logoPath = logoPossiblePaths.find((logo) => fs.existsSync(logo));

  const loadingHTML = `
      <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Fultimator - Loading</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background-color: #f0f0f0;
          flex-direction: column;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  
          background-color: canvas;
          color: canvastext;
        }
        .logo {
          max-width: 150px;
          margin-bottom: 20px;
          animation: pulse 1.5s infinite;
        }
        .spinner {
          border: 4px solid rgba(128, 128, 128, 0.2);
          border-top: 4px solid #3498db;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
        .loading-text {
          margin-top: 20px;
          font-size: 18px;
          color: inherit;
        }
      </style>
    </head>
    <body>
      ${
        logoPath
          ? `<img src="data:image/png;base64,${fs
              .readFileSync(logoPath)
              .toString("base64")}" alt="Fultimator Logo" class="logo">`
          : ""
      }
      <div class="spinner"></div>
    </body>
  </html>
      `;

  const loadingWindow = new BrowserWindow({
    parent,
    modal: false,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: true,
  });

  loadingWindow.loadURL(
    `data:text/html;charset=utf-8,${encodeURIComponent(loadingHTML)}`
  );
  return loadingWindow;
}
