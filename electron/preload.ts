import { ipcRenderer, contextBridge } from "electron";
import { safeOpenExternal } from "./urlGuard";

const ALLOWED_INVOKE_CHANNELS = new Set<string>([
  "login-google",
  "check-auth",
  "logoutGoogle",
  "get-google-tokens",
  "list-files",
  "download-from-google-drive",
  "upload-to-google-drive",
  "upload-buffer-to-google-drive",
  "read-file",
]);

contextBridge.exposeInMainWorld("ipcRenderer", {
  invoke(channel: string, ...args: unknown[]) {
    if (!ALLOWED_INVOKE_CHANNELS.has(channel)) {
      return Promise.reject(new Error(`Blocked IPC channel: ${channel}`));
    }
    return ipcRenderer.invoke(channel, ...args);
  },
});

// Expose the Electron API to the renderer process
contextBridge.exposeInMainWorld("electron", {
  confirm: (message) => ipcRenderer.invoke("dialog-confirm", message),
  alert: (message) => ipcRenderer.invoke("dialog-alert", message),
  getVersion: () => ipcRenderer.invoke("get-version"),
  uploadToGoogleDrive: (filePath) =>
    ipcRenderer.invoke("upload-to-google-drive", filePath),
  downloadFromGoogleDrive: (fileId) =>
    ipcRenderer.invoke("download-from-google-drive", fileId),
  saveFile: (fileName, buffer) =>
    ipcRenderer.invoke("save-file", { fileName, buffer }),
  listFiles: () => ipcRenderer.invoke("list-files"),
  logoutGoogle: () => ipcRenderer.invoke("logoutGoogle"),
  navigateHome: () => ipcRenderer.send("navigate-home"),
  readFile: (filePath) => ipcRenderer.invoke("read-file", filePath),
  loginWithGoogle: () => ipcRenderer.invoke("login-google"),
  checkAuth: () => ipcRenderer.invoke("check-auth"),
  getGoogleTokens: () => ipcRenderer.invoke("get-google-tokens"),
  uploadBufferToGoogleDrive: (buffer: ArrayBuffer, fileName: string) =>
    ipcRenderer.invoke("upload-buffer-to-google-drive", buffer, fileName),
  openExternal: (url: string) => safeOpenExternal(url),
  checkForUpdates: () => ipcRenderer.invoke("check-for-updates"),
  openFile: (filePath: string) => ipcRenderer.invoke("open-file", filePath),
  showFileInFolder: (filePath: string) =>
    ipcRenderer.invoke("show-file-in-folder", filePath),
});
