// electron/ipc-handlers.ts
import { app, ipcMain, dialog, BrowserWindow, shell } from "electron";
import fs from "fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  loginGoogle,
  checkAuth,
  logoutGoogle,
  uploadToGoogleDrive,
  uploadBufferToGoogleDrive,
  downloadFromGoogleDrive,
  listGoogleDriveFiles,
  getStoredIdToken,
  getStoredAccessToken,
} from "./google";
import { checkForUpdates } from "./menus";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Remove any pre-existing handlers if necessary
function removeExistingHandlers() {
  const handlers = [
    "dialog-confirm",
    "dialog-alert",
    "login-google",
    "check-auth",
    "logoutGoogle",
    "upload-to-google-drive",
    "upload-buffer-to-google-drive",
    "download-from-google-drive",
    "get-google-tokens",
    "save-file",
    "read-file",
    "get-version",
    "list-files",
    "check-for-updates",
    "open-file",
    "show-file-in-folder",
  ];
  handlers.forEach((channel) => {
    ipcMain.removeHandler(channel);
  });
}

export function setupIpcHandlers(mainWindow: BrowserWindow) {
  removeExistingHandlers();

  // Handle dialog-confirm
  ipcMain.handle("dialog-confirm", async (event, message: string) => {
    const result = await dialog.showMessageBox(mainWindow, {
      type: "question",
      buttons: ["Yes", "No"],
      defaultId: 0,
      message,
      title: "Fultimator",
    });
    return result.response === 0; // Return true for 'Yes', false for 'No'
  });

  // Handle dialog-alert
  ipcMain.handle("dialog-alert", async (event, message: string) => {
    await dialog.showMessageBox(mainWindow, {
      type: "info",
      buttons: ["OK"],
      message,
      title: "Fultimator",
    });
  });

  // OAuth login function
  ipcMain.handle("login-google", async () => {
    return loginGoogle();
  });

  // Function to Check Authentication
  ipcMain.handle("check-auth", async () => {
    return checkAuth();
  });

  // Logout and Clear Tokens
  ipcMain.handle("logoutGoogle", () => {
    return logoutGoogle();
  });

  // Handle file upload to Google Drive
  ipcMain.handle("upload-to-google-drive", async (event, filePath) => {
    return await uploadToGoogleDrive(filePath);
  });

  // Handle download from Google Drive
  ipcMain.handle("download-from-google-drive", async (event, fileId) => {
    return await downloadFromGoogleDrive(fileId);
  });

  // Handle file list from Google Drive
  ipcMain.handle("list-files", async () => {
    return await listGoogleDriveFiles();
  });

  // Return stored id_token + access_token so the renderer can sign into Firebase
  ipcMain.handle("get-google-tokens", () => ({
    idToken: getStoredIdToken(),
    accessToken: getStoredAccessToken(),
  }));

  // Upload an in-memory buffer to Google Drive (used by IndexedDB sync)
  ipcMain.handle("upload-buffer-to-google-drive", async (_event, buffer: ArrayBuffer, fileName: string) => {
    return await uploadBufferToGoogleDrive(buffer, fileName);
  });

  // Handle file save with native dialog
  ipcMain.handle("save-file", async (event, { fileName, buffer }) => {
    try {
      const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
        defaultPath: path.join(app.getPath("downloads"), fileName),
        filters: [
          { name: 'All Files', extensions: ['*'] },
          { name: 'JSON', extensions: ['json'] },
          { name: 'Images', extensions: ['png', 'jpg', 'jpeg'] },
          { name: 'ZIP', extensions: ['zip'] }
        ]
      });

      if (canceled || !filePath) {
        return null;
      }

      fs.writeFileSync(filePath, Buffer.from(buffer));
      return filePath;
    } catch (error) {
      console.error("Failed to save file:", error);
      throw error;
    }
  });

  // Handle file read
  ipcMain.handle("read-file", async (event, filePath) => {
    try {
      const fileContent = fs.readFileSync(filePath, "utf-8");
      return fileContent;
    } catch (error) {
      console.error("Failed to read file", error);
      throw new Error("Failed to read file");
    }
  });

  // Handle version request
  ipcMain.handle("get-version", async () => {
    const packageJsonPath = path.join(__dirname, "..", "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    return packageJson.version;
  });

  // Handle update check request
  ipcMain.handle("check-for-updates", async () => {
    return checkForUpdates(mainWindow);
  });

  // Handle file open
  ipcMain.handle("open-file", async (event, filePath) => {
    try {
      await shell.openPath(filePath);
      return true;
    } catch (error) {
      console.error("Failed to open file", error);
      throw new Error("Failed to open file");
    }
  });

  // Handle showing a file in folder
  ipcMain.handle("show-file-in-folder", async (event, filePath: string) => {
    try {
      await shell.showItemInFolder(filePath);
      return true;
    } catch (error) {
      console.error("Failed to show file in folder:", error);
      throw error;
    }
  });

  // Handle getting system paths
  ipcMain.handle("get-path", (event, pathName) => {
    return app.getPath(pathName);
  });

}
