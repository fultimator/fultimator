export interface ThemeCustomization {
  primaryColor: string | null;
  secondaryColor: string | null;
  ternaryColor: string | null;
  quaternaryColor: string | null;

  panelRadius: number | null;
  controlRadius: number | null;

  bevelBordersEnabled: boolean | null;
  bevelBorderStyle: "solid" | "dashed" | "dotted" | "double" | null;
  bevelBorderColor: string | null;
  bevelBorderWidth: number | null;

  gradientsEnabled: boolean | null;
  gradientDirection: number | null;
  gradientLayers: number | null;
  gradientOpacity: number | null;

  frameEffectsEnabled: boolean | null;
  frameEffectColor: string | null;
  frameEffectIntensity: number | null;

  textEffectsEnabled: boolean | null;
  textEffectColor: string | null;
  textEffectType: "shadow" | "glow" | "outline" | null;
  textEffectIntensity: number | null;

  surfaceColor: string | null;
  surfaceDepth: string | null;
  vignetteStrength: number | null;
  backdropOpacity: number | null;
  buttonUppercase: boolean | null;
  buttonLetterSpacing: number | null;
  appBarGradient: boolean | null;
}

const HEX_COLOR_RE = /^#[0-9A-Fa-f]{6}$/;
const BORDER_STYLES = ["solid", "dashed", "dotted", "double"] as const;
const TEXT_EFFECT_TYPES = ["shadow", "glow", "outline"] as const;

function isNullOrHexColor(v: unknown): v is string | null {
  return v === null || (typeof v === "string" && HEX_COLOR_RE.test(v));
}
function isNullOrNumber(v: unknown): v is number | null {
  return v === null || typeof v === "number";
}
function isNullOrBoolean(v: unknown): v is boolean | null {
  return v === null || typeof v === "boolean";
}

/**
 * Validates and sanitizes an unknown value (e.g. from a JSON import) into a
 * safe Partial<ThemeCustomization>.
 */
export function sanitizeImportedCustomization(
  raw: unknown,
): Partial<ThemeCustomization> {
  if (typeof raw !== "object" || raw === null) return {};
  const obj = raw as Record<string, unknown>;
  const result: Partial<ThemeCustomization> = {};

  const hexFields: (keyof ThemeCustomization)[] = [
    "primaryColor",
    "secondaryColor",
    "ternaryColor",
    "quaternaryColor",
    "bevelBorderColor",
    "frameEffectColor",
    "textEffectColor",
    "surfaceColor",
    "surfaceDepth",
  ];
  const numFields: (keyof ThemeCustomization)[] = [
    "panelRadius",
    "controlRadius",
    "bevelBorderWidth",
    "gradientDirection",
    "gradientLayers",
    "gradientOpacity",
    "frameEffectIntensity",
    "textEffectIntensity",
    "vignetteStrength",
    "backdropOpacity",
    "buttonLetterSpacing",
  ];
  const boolFields: (keyof ThemeCustomization)[] = [
    "bevelBordersEnabled",
    "gradientsEnabled",
    "frameEffectsEnabled",
    "textEffectsEnabled",
    "buttonUppercase",
    "appBarGradient",
  ];

  for (const key of hexFields) {
    if (key in obj && isNullOrHexColor(obj[key]))
      (result as Record<string, unknown>)[key] = obj[key];
  }
  for (const key of numFields) {
    if (key in obj && isNullOrNumber(obj[key]))
      (result as Record<string, unknown>)[key] = obj[key];
  }
  for (const key of boolFields) {
    if (key in obj && isNullOrBoolean(obj[key]))
      (result as Record<string, unknown>)[key] = obj[key];
  }

  if ("bevelBorderStyle" in obj) {
    const v = obj.bevelBorderStyle;
    if (v === null || (BORDER_STYLES as readonly unknown[]).includes(v))
      result.bevelBorderStyle = v as typeof result.bevelBorderStyle;
  }
  if ("textEffectType" in obj) {
    const v = obj.textEffectType;
    if (v === null || (TEXT_EFFECT_TYPES as readonly unknown[]).includes(v))
      result.textEffectType = v as typeof result.textEffectType;
  }

  return result;
}

export const DEFAULT_CUSTOMIZATION: ThemeCustomization = {
  primaryColor: null,
  secondaryColor: null,
  ternaryColor: null,
  quaternaryColor: null,
  panelRadius: null,
  controlRadius: null,
  bevelBordersEnabled: null,
  bevelBorderStyle: null,
  bevelBorderColor: null,
  bevelBorderWidth: null,
  gradientsEnabled: null,
  gradientDirection: null,
  gradientLayers: null,
  gradientOpacity: null,
  frameEffectsEnabled: null,
  frameEffectColor: null,
  frameEffectIntensity: null,
  textEffectsEnabled: null,
  textEffectColor: null,
  textEffectType: null,
  textEffectIntensity: null,
  surfaceColor: null,
  surfaceDepth: null,
  vignetteStrength: null,
  backdropOpacity: null,
  buttonUppercase: null,
  buttonLetterSpacing: null,
  appBarGradient: null,
};
