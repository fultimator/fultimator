import { app, Menu, BrowserWindow, dialog, shell } from "electron";
import path from "node:path";
import fs from "fs";
import { fileURLToPath } from "node:url";
import os from "os";
import https from "https";
import semver from "semver";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Path to the package.json file
const packageJsonPath = path.join(__dirname, "..", "package.json");

export function createAppMenu(mainWindow: BrowserWindow) {
  const isMac = process.platform === "darwin";

  const template = [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: "about" },
              { type: "separator" },
              { role: "services" },
              { type: "separator" },
              { role: "hide" },
              { role: "hideOthers" },
              { role: "unhide" },
              { type: "separator" },
              { role: "quit" },
            ],
          },
        ]
      : []),
    {
      label: "File",
      submenu: [
        { type: "separator" },
        {
          label: "Exit",
          accelerator: "CmdOrCtrl+Q",
          click: () => {
            mainWindow.close();
          },
        },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        ...(isMac ? [{ role: "pasteAndMatchStyle" }] : []),
        { role: "delete" },
        { role: "selectAll" },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Help",
      submenu: [
        {
          label: "About",
          click: () => showAboutDialog(mainWindow),
        },
        { type: "separator" },
        {
          label: "Visit GitHub",
          click: () =>
            shell.openExternal(
              "https://github.com/fultimator/fultimator"
            ),
        },
        {
          label: "Report Issue",
          click: () =>
            shell.openExternal(
              "https://github.com/fultimator/fultimator/issues"
            ),
        },
        {
          label: "Join Discord",
          click: () => shell.openExternal("https://discord.gg/aNEgvHm3Re"),
        },
        {
          label: "Check for Updates",
          click: () => checkForUpdates(mainWindow),
        },
      ],
    },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const menu = Menu.buildFromTemplate(template as any);
  Menu.setApplicationMenu(menu);
}

export function showAboutDialog(mainWindow: BrowserWindow) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  const version = packageJson.version;

  // Retrieve the build counter data from package.json
  const buildCounter = packageJson.buildcounter || { count: 0 };

  const logoPossiblePaths = [
    path.join(process.env.VITE_PUBLIC!, "logo512.png"),
    path.join(process.env.VITE_PUBLIC!, "logo192.png"),
    path.join(process.env.VITE_PUBLIC!, "logo120.png"),
  ];
  const logoPath = logoPossiblePaths.find((p) => fs.existsSync(p));

  const systemInfo = `${os.type()} ${os.arch()} (${os.release()})`;

  dialog.showMessageBox(mainWindow, {
    type: "info",
    title: "About Fultimator",
    icon: logoPath || undefined,
    message: "Fultimator Desktop",
    detail: `Version: ${version} (Build: ${buildCounter.count})
    
License: MIT
System: ${systemInfo}`,
    buttons: ["OK"],
  });
}

export function checkForUpdates(mainWindow: BrowserWindow) {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8")
  );
  const currentVersion = packageJson.version;

  https
    .get(
      "https://api.github.com/repos/fultimator/fultimator/releases",
      {
        headers: { "User-Agent": "Fultimator" },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          const releases = JSON.parse(data);

          // Filter releases to exclude drafts, and pick the latest one
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const latestRelease = (releases as any[])
            .filter((r: Record<string, unknown>) => !r.draft) // Ignore drafts
            .sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
              semver.rcompare(
                String(a.tag_name).replace(/^v/, ""),
                String(b.tag_name).replace(/^v/, "")
              )
            )[0]; // Sort newest first

          if (!latestRelease) {
            dialog.showMessageBox(mainWindow, {
              type: "info",
              title: "Fultimator",
              message: "No updates found.",
              detail: `Current version: ${currentVersion}`,
            });
            return;
          }

          const latestVersion = latestRelease.tag_name.replace(/^v/, ""); // Strip "v" prefix

          if (semver.gt(latestVersion, currentVersion)) {
            dialog
              .showMessageBox(mainWindow, {
                type: "info",
                title: "Fultimator",
                buttons: ["Go to Release", "Cancel"],
                message: `A new version (${latestVersion}) is available!`,
                detail: `You are on version ${currentVersion}.`,
              })
              .then((result) => {
                if (result.response === 0) {
                  shell.openExternal(latestRelease.html_url);
                }
              });
          } else {
            dialog.showMessageBox(mainWindow, {
              type: "info",
              title: "Fultimator",
              message: "You are up to date!",
              detail: `Current version: ${currentVersion}`,
            });
          }
        });
      }
    )
    .on("error", (err) => {
      dialog.showErrorBox("Update Check Failed", err.message);
    });
}
