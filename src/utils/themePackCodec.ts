import type { ThemeValue, StyleProfileValue } from "../store/themeStore";
import {
  sanitizeImportedCustomization,
  DEFAULT_CUSTOMIZATION,
  type ThemeCustomization,
} from "../themes/themeCustomization";

const SCHEMA = "fultimator.theme@1";

const VALID_THEMES: ThemeValue[] = [
  "Fabula",
  "High",
  "Techno",
  "Natural",
  "Bravely",
  "Obscura",
  "Noir",
  "ClearBlue",
  "MidnightBlue",
];

const VALID_STYLE_PROFILES: StyleProfileValue[] = [
  "ThemeDefault",
  "Flat",
  "Regalia",
  "Dystopian",
  "Noir",
];

export interface ThemeFilePayload {
  schema: string;
  id: string;
  name: string;
  description: string | null;
  baseTheme: ThemeValue;
  styleProfile: StyleProfileValue;
  isDarkMode: boolean;
  customization: ThemeCustomization;
}

export interface DecodeResult {
  ok: true;
  payload: ThemeFilePayload;
}
export interface DecodeError {
  ok: false;
  reason: string;
}

export function decodeThemeFile(raw: unknown): DecodeResult | DecodeError {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, reason: "not a JSON object" };
  }
  const obj = raw as Record<string, unknown>;

  if (obj.schema !== SCHEMA) {
    return {
      ok: false,
      reason: `unrecognized schema "${obj.schema}" (expected "${SCHEMA}")`,
    };
  }
  if (!obj.id || typeof obj.id !== "string") {
    return { ok: false, reason: 'missing or invalid "id"' };
  }
  if (!obj.name || typeof obj.name !== "string" || !obj.name.trim()) {
    return { ok: false, reason: 'missing or invalid "name"' };
  }
  if (
    obj.description !== undefined &&
    obj.description !== null &&
    typeof obj.description !== "string"
  ) {
    return { ok: false, reason: '"description" must be a string or null' };
  }
  if (!(VALID_THEMES as unknown[]).includes(obj.baseTheme)) {
    return { ok: false, reason: `unrecognized baseTheme "${obj.baseTheme}"` };
  }
  if (!(VALID_STYLE_PROFILES as unknown[]).includes(obj.styleProfile)) {
    return {
      ok: false,
      reason: `unrecognized styleProfile "${obj.styleProfile}"`,
    };
  }
  if (typeof obj.isDarkMode !== "boolean") {
    return { ok: false, reason: '"isDarkMode" must be a boolean' };
  }

  const sanitized = sanitizeImportedCustomization(obj.customization);
  const customization: ThemeCustomization = {
    ...DEFAULT_CUSTOMIZATION,
    ...sanitized,
  };

  return {
    ok: true,
    payload: {
      schema: SCHEMA,
      id: obj.id as string,
      name: (obj.name as string).trim(),
      description:
        typeof obj.description === "string"
          ? obj.description.trim() || null
          : null,
      baseTheme: obj.baseTheme as ThemeValue,
      styleProfile: obj.styleProfile as StyleProfileValue,
      isDarkMode: obj.isDarkMode as boolean,
      customization,
    },
  };
}

export function themeSlug(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "theme"
  );
}
