// electron/google.ts
import { google } from "googleapis";
import Store from "electron-store";
import fs from "fs";
import path from "node:path";
import http from "node:http";
import { Readable } from "node:stream";
import { app, BrowserWindow } from "electron";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;

// No redirect URI in constructor - we pass it dynamically per-login (local server port)
const OAuth2 = new google.auth.OAuth2(clientId, clientSecret);

const store = new Store();

function validateCredentials() {
  if (!clientId || !clientSecret) {
    throw new Error("Missing required parameter: VITE_GOOGLE_CLIENT_ID or VITE_GOOGLE_CLIENT_SECRET for desktop app. Please check your .env file.");
  }
}

// Function to start the login process.
// Spins up a temporary local HTTP server so the redirect_uri is
// http://127.0.0.1:<random-port> - Google allows any port on 127.0.0.1
// for "Desktop app" OAuth clients without registering each port.
export async function loginGoogle(): Promise<any> {
  validateCredentials();
  return new Promise((resolve, reject) => {
    const server = http.createServer();

    server.listen(0, "127.0.0.1", () => {
      const port = (server.address() as { port: number }).port;
      const redirectUri = `http://127.0.0.1:${port}`;

      const authUrl = OAuth2.generateAuthUrl({
        access_type: "offline",
        redirect_uri: redirectUri,
        scope: [
          "https://www.googleapis.com/auth/drive.file",
          "openid",
          "email",
          "profile",
        ],
      });

      let authWindow: BrowserWindow | null = new BrowserWindow({
        width: 500,
        height: 600,
        show: true,
      });

      authWindow.loadURL(authUrl);

      server.once("request", async (req, res) => {
        const url = new URL(req.url!, `http://127.0.0.1:${port}`);
        const code = url.searchParams.get("code");
        const error = url.searchParams.get("error");

        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(
          "<h1>Sign-in complete.</h1><p>You can close this window and return to Fultimator.</p>"
        );

        server.close();
        authWindow?.close();

        if (error) {
          reject(new Error(`Google sign-in error: ${error}`));
          return;
        }

        if (!code) {
          reject(new Error("No authorization code received"));
          return;
        }

        try {
          const { tokens } = await OAuth2.getToken({ code, redirect_uri: redirectUri });
          OAuth2.setCredentials(tokens);
          store.set("googleTokens", tokens);
          resolve(tokens);
        } catch (e) {
          reject(e);
        }
      });

      authWindow.on("closed", () => {
        authWindow = null;
        server.close();
      });
    });

    server.on("error", reject);
  });
}

// Function to check and refresh tokens if needed
export async function checkAuth() {
  const tokens = store.get("googleTokens");
  if (!tokens) return { isAuthenticated: false };

  OAuth2.setCredentials(tokens);

  // Check if the token is expired
  const now = new Date().getTime();
  const expiryDate = (tokens as any).expiry_date || 0;

  if (now >= expiryDate) {
    console.log("Token expired, refreshing...");
    try {
      const { credentials } = await OAuth2.refreshAccessToken();
      store.set("googleTokens", credentials);
      return { isAuthenticated: true, tokens: credentials };
    } catch (error) {
      store.delete("googleTokens");
      return { isAuthenticated: false };
    }
  }

  return { isAuthenticated: true, tokens };
}

export function logoutGoogle() {
  store.delete("googleTokens");
  return { isAuthenticated: false };
}

// Function to handle file upload to Google Drive
export async function uploadToGoogleDrive(filePath: string) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const { isAuthenticated } = await checkAuth();
    if (!isAuthenticated) throw new Error("Not authenticated with Google Drive. Please sign in.");

    const drive = google.drive({ version: "v3", auth: OAuth2 });

    const response = await drive.files.list({
      q: "name='fultimatordb.json'",
      fields: "files(id, name)",
    });

    const existingFile = response.data.files.find(
      (file) => file.name === "fultimatordb.json"
    );

    let res;
    if (existingFile) {
      res = await drive.files.update({
        fileId: existingFile.id,
        media: {
          body: fs.createReadStream(filePath),
        },
        fields: "id",
      });
    } else {
      const fileMetadata = {
        name: "fultimatordb.json",
        mimeType: "application/json",
      };
      const media = {
        body: fs.createReadStream(filePath),
      };
      res = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: "id",
      });
    }

    console.log("File uploaded with ID:", res.data.id);
    return res.data.id;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

// Handle download from Google Drive
export async function downloadFromGoogleDrive(fileId: string) {
  console.log("Requested file ID:", fileId);
  try {
    const { isAuthenticated } = await checkAuth();
    if (!isAuthenticated) throw new Error("Not authenticated with Google Drive. Please sign in.");

    const drive = google.drive({ version: "v3", auth: OAuth2 });

    const res = await drive.files.get(
      { fileId: fileId, alt: "media" },
      { responseType: "stream" }
    );

    const filePath = path.join(app.getPath("documents"), "fultimatordb.json");
    const dest = fs.createWriteStream(filePath);
    res.data.pipe(dest);

    return new Promise((resolve, reject) => {
      dest.on("finish", () => {
        console.log("Download completed:", filePath);
        resolve(filePath);
      });
      dest.on("error", (err) => {
        console.error("Error writing file:", err);
        reject(err);
      });
      res.data.on("error", (err) => {
        console.error("Error in response stream:", err);
        reject(err);
      });
    });
  } catch (error) {
    console.error("Error downloading file", error);
    throw error;
  }
}

// Handle file list from Google Drive
export async function listGoogleDriveFiles() {
  try {
    const { isAuthenticated } = await checkAuth();
    if (!isAuthenticated) throw new Error("Not authenticated with Google Drive. Please sign in.");

    const drive = google.drive({ version: "v3", auth: OAuth2 });

    const response = await drive.files.list({
      q: "name='fultimatordb.json'",
      fields: "files(id, name)",
    });

    if (response.data.files.length > 0) {
      console.log("Files found in Google Drive:", response.data.files);
      return response.data.files;
    } else {
      console.log("No fultimator db files found in Google Drive.");
      throw new Error("No files found");
    }
  } catch (error) {
    console.error("Error listing files", error);
    throw error;
  }
}

// ── Token accessors (used by IPC handler to pass id_token to renderer) ────────

export function getStoredIdToken(): string | null {
  const tokens = store.get("googleTokens") as Record<string, string> | undefined;
  return tokens?.id_token ?? null;
}

export function getStoredAccessToken(): string | null {
  const tokens = store.get("googleTokens") as Record<string, string> | undefined;
  return tokens?.access_token ?? null;
}

// Handle upload from an in-memory buffer (used by IDB Drive sync)
export async function uploadBufferToGoogleDrive(buffer: ArrayBuffer, fileName: string): Promise<string> {
  const { isAuthenticated } = await checkAuth();
  if (!isAuthenticated) throw new Error("Not authenticated with Google Drive. Please sign in.");
  // checkAuth() already called OAuth2.setCredentials() with fresh tokens
  const drive = google.drive({ version: "v3", auth: OAuth2 });

  const response = await drive.files.list({
    q: `name='${fileName}'`,
    fields: "files(id, name)",
  });

  const existingFile = response.data.files?.find((f) => f.name === fileName);
  const stream = Readable.from(Buffer.from(buffer));

  let res: { data: { id?: string | null } };
  if (existingFile) {
    res = await drive.files.update({
      fileId: existingFile.id!,
      media: { body: stream },
      fields: "id",
    });
  } else {
    res = await drive.files.create({
      requestBody: { name: fileName, mimeType: "application/json" },
      media: { body: stream },
      fields: "id",
    });
  }

  return res.data.id!;
}
