import { Components, Theme } from "@mui/material/styles";
import type { ThemeCustomization } from "./themeCustomization";

type Mode = "light" | "dark";
type ThemeStyleProfile = "default" | "dystopian" | "flat" | "regalia" | "noir";

const isEffectProfile = (profile: ThemeStyleProfile) =>
  profile === "dystopian" || profile === "regalia";

interface ThemeComponentFactoryOptions {
  mode: Mode;
  primary: string;
  secondary: string;
  ternary: string;
  quaternary: string;
  paper: string;
  profile?: ThemeStyleProfile;
  panelRadiusOverride?: number | null;
  controlRadiusOverride?: number | null;
  styleCustomization?: ThemeCustomization | null;
  successColor?: string | null;
  appBarGradient?: boolean | null;
}

interface ProfileTokens {
  panelRadius: number;
  controlRadius: number;
  multilineRadius: number;
  buttonRadius: number | null;

  textColor: string | null;
  accent: string | null;
  highlight: string | null;
  midTone: string | null;
  shadow: string | null;
  surface: string | null;

  bevelBorders: Record<string, string> | null;
  frameFx: Record<string, string> | null;

  panelSurface: string;
  arcGradient: string | null;
  vignetteGradient: string | null;

  menuShadow: string;
  paperBg: string;
  paperBorder: string;
  paperShadow: string;
  cardBg: string;
  outlinedBg: string;
  tabsBg: string;

  profileOutlinedBg: string;
  profileContainedBg: string;
  profileButtonTextColor: string;
}

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  const normalized =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const n = parseInt(normalized, 16);
  return {
    r: (n >> 16) & 255,
    g: (n >> 8) & 255,
    b: n & 255,
  };
}

function alpha(hex: string, opacity: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

function mix(hexA: string, hexB: string, weight: number) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const w = Math.max(0, Math.min(1, weight));
  const r = Math.round(a.r + (b.r - a.r) * w);
  const g = Math.round(a.g + (b.g - a.g) * w);
  const bCh = Math.round(a.b + (b.b - a.b) * w);
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(bCh)}`;
}

function getGradientDirection(
  customization: ThemeCustomization | null | undefined,
): number {
  return customization?.gradientDirection ?? 180;
}

function getGradientOpacity(
  customization: ThemeCustomization | null | undefined,
): number {
  const opacity = customization?.gradientOpacity ?? 100;
  return Math.max(0, Math.min(100, opacity)) / 100;
}

function getGradientLayers(
  customization: ThemeCustomization | null | undefined,
): number {
  return customization?.gradientLayers ?? 2;
}

function buildDefaultTokens(
  mode: Mode,
  primary: string,
  secondary: string,
  ternary: string,
  quaternary: string,
  paper: string,
  customization?: ThemeCustomization | null,
): ProfileTokens {
  const isDark = mode === "dark";
  const gradDir = getGradientDirection(customization);
  const surfaceColor =
    customization?.surfaceColor ??
    (isDark ? alpha(paper, 0.9) : alpha(paper, 0.95));

  return {
    panelRadius: 6,
    controlRadius: 6,
    multilineRadius: 6,
    buttonRadius: null,

    textColor: null,
    accent: null,
    highlight: null,
    midTone: null,
    shadow: null,
    surface: null,

    bevelBorders: null,
    frameFx: null,

    panelSurface: surfaceColor,
    arcGradient: null,
    vignetteGradient: null,

    menuShadow: isDark
      ? "0 6px 18px rgba(6,14,24,0.6)"
      : "0 4px 16px rgba(0,0,0,0.2)",
    paperBg: surfaceColor,
    paperBorder: `1px solid ${alpha(quaternary, isDark ? 0.6 : 0.45)}`,
    paperShadow: isDark
      ? `inset 0 1px 0 ${alpha(secondary, 0.18)}, 0 2px 10px rgba(7,16,28,0.5)`
      : `inset 0 1px 0 ${alpha("#ffffff", 0.75)}, 0 1px 4px ${alpha(primary, 0.14)}`,

    cardBg: isDark
      ? `linear-gradient(${gradDir}deg, ${alpha(ternary, 0.92)} 0%, ${alpha(paper, 0.95)} 100%)`
      : `linear-gradient(${gradDir}deg, ${alpha("#ffffff", 0.9)} 0%, ${alpha(ternary, 0.9)} 100%)`,
    outlinedBg: isDark
      ? `linear-gradient(${gradDir}deg, ${alpha(primary, 0.45)} 0%, ${alpha(ternary, 0.5)} 100%)`
      : `linear-gradient(${gradDir}deg, ${alpha("#ffffff", 0.9)} 0%, ${alpha(ternary, 0.92)} 100%)`,
    tabsBg: isDark
      ? `linear-gradient(${gradDir}deg, ${alpha(primary, 0.5)} 0%, ${alpha(ternary, 0.8)} 100%)`
      : `linear-gradient(${gradDir}deg, ${alpha("#ffffff", 0.9)} 0%, ${alpha(ternary, 0.9)} 100%)`,

    profileOutlinedBg: isDark
      ? `linear-gradient(${gradDir}deg, ${alpha(primary, 0.45)} 0%, ${alpha(ternary, 0.5)} 100%)`
      : `linear-gradient(${gradDir}deg, ${alpha("#ffffff", 0.9)} 0%, ${alpha(ternary, 0.92)} 100%)`,
    profileContainedBg: `linear-gradient(${gradDir}deg, ${secondary} 0%, ${primary} 55%, ${quaternary} 100%)`,
    profileButtonTextColor: isDark ? "#eaf3ff" : primary,
  };
}

function buildFlatTokens(
  mode: Mode,
  primary: string,
  secondary: string,
  ternary: string,
  quaternary: string,
  paper: string,
  customization?: ThemeCustomization | null,
): ProfileTokens {
  const isDark = mode === "dark";
  const surfaceColor =
    customization?.surfaceColor ??
    (isDark ? alpha(paper, 0.9) : alpha(paper, 0.95));

  return {
    panelRadius: 0,
    controlRadius: 0,
    multilineRadius: 0,
    buttonRadius: null,

    textColor: null,
    accent: null,
    highlight: null,
    midTone: null,
    shadow: null,
    surface: null,

    bevelBorders: null,
    frameFx: null,

    panelSurface: surfaceColor,
    arcGradient: null,
    vignetteGradient: null,

    menuShadow: "none",
    paperBg: surfaceColor,
    paperBorder: `1px solid ${alpha(quaternary, isDark ? 0.6 : 0.45)}`,
    paperShadow: "none",

    cardBg:
      customization?.surfaceColor ??
      (isDark ? alpha(paper, 0.96) : alpha(paper, 0.98)),
    outlinedBg:
      customization?.surfaceColor ??
      (isDark ? alpha(paper, 0.85) : alpha(paper, 0.98)),
    tabsBg:
      customization?.surfaceColor ??
      (isDark ? alpha(paper, 0.9) : alpha(paper, 0.98)),

    profileOutlinedBg:
      customization?.surfaceColor ??
      (isDark ? alpha(paper, 0.85) : alpha(paper, 0.98)),
    profileContainedBg: primary,
    profileButtonTextColor: isDark ? "#eaf3ff" : primary,
  };
}

function buildDystopianTokens(
  mode: Mode,
  primary: string,
  secondary: string,
  ternary: string,
  quaternary: string,
  paper: string,
  customization?: ThemeCustomization | null,
): ProfileTokens {
  const isDark = mode === "dark";
  const gradDir = getGradientDirection(customization);

  const textColor = isDark ? "#f3f8ff" : null;
  const accent = mix(secondary, "#9900dd", 0.3);
  const highlight = mix(secondary, "#ffffff", 0.88);
  const midTone = mix(primary, secondary, isDark ? 0.45 : 0.38);
  const shadow = mix(quaternary, "#000000", isDark ? 0.78 : 0.68);
  const surfaceBase =
    customization?.surfaceDepth ?? (isDark ? "#000018" : "#dde2ea");
  const surface = isDark
    ? mix(primary, surfaceBase, 0.65)
    : mix(ternary, surfaceBase, 0.55);
  const customSurfaceColor = customization?.surfaceColor;
  const vignetteOpacity = (customization?.vignetteStrength ?? 55) / 100;
  const layers = getGradientLayers(customization);

  const bevelBorders = {
    borderTop: `2px solid ${mix(highlight, "#ffffff", 0.3)}`,
    borderLeft: `2px solid ${highlight}`,
    borderBottom: `2px solid ${shadow}`,
    borderRight: `2px solid ${shadow}`,
  };

  const frameFx = isDark
    ? {
        boxShadow: `0 0 0 1px ${alpha(accent, 0.7)}, 0 0 6px ${alpha(accent, 0.25)}, 0 4px 12px rgba(0,0,0,0.65)`,
      }
    : {
        boxShadow: `0 0 0 1px ${alpha(quaternary, 0.55)}, 0 2px 8px rgba(0,0,0,0.22)`,
      };

  return {
    panelRadius: 0,
    controlRadius: 0,
    multilineRadius: 0,
    buttonRadius: 7,

    textColor,
    accent,
    highlight,
    midTone,
    shadow,
    surface,

    bevelBorders,
    frameFx,

    panelSurface:
      customSurfaceColor ||
      (isDark
        ? `linear-gradient(${gradDir}deg, ${mix(surface, highlight, 0.12)} 0%, ${surface} 40%, ${mix(surface, "#000000", 0.3)} 100%)`
        : `linear-gradient(${gradDir}deg, ${mix(surface, "#ffffff", 0.35)} 0%, ${surface} 60%, ${mix(surface, quaternary, 0.18)} 100%)`),

    arcGradient: isDark
      ? `linear-gradient(${gradDir}deg, ${mix(midTone, highlight, 0.2)} 0%, ${midTone} 100%)`
      : `linear-gradient(${gradDir}deg, ${mix(surface, "#ffffff", 0.4)} 0%, ${mix(surface, primary, 0.3)} 100%)`,

    vignetteGradient: isDark
      ? layers >= 2
        ? `linear-gradient(rgba(0,0,0,${vignetteOpacity}) 0%, rgba(0,0,0,0) 20%, rgba(0,0,0,0) 80%, rgba(0,0,0,${vignetteOpacity}) 100%), linear-gradient(${gradDir}deg, ${mix(surface, highlight, 0.08)} 0%, ${surface} 100%)`
        : `linear-gradient(${gradDir}deg, ${mix(surface, highlight, 0.08)} 0%, ${surface} 100%)`
      : layers >= 2
        ? `linear-gradient(rgba(0,0,0,${vignetteOpacity * 0.22}) 0%, rgba(0,0,0,0) 20%, rgba(0,0,0,0) 80%, rgba(0,0,0,${vignetteOpacity * 0.22}) 100%), linear-gradient(${gradDir}deg, ${mix(surface, "#ffffff", 0.5)} 0%, ${surface} 100%)`
        : `linear-gradient(${gradDir}deg, ${mix(surface, "#ffffff", 0.5)} 0%, ${surface} 100%)`,

    menuShadow: isDark
      ? "0 8px 18px rgba(0,0,0,0.72)"
      : `0 4px 16px ${alpha(primary, 0.2)}`,
    paperBg: customSurfaceColor || (isDark ? "#101b33" : alpha(paper, 0.95)),
    paperBorder: isDark ? "" : `1px solid ${alpha(quaternary, 0.45)}`,
    paperShadow: isDark
      ? "0 3px 12px rgba(6,12,20,0.65)"
      : `inset 0 1px 0 ${alpha("#ffffff", 0.75)}, 0 1px 4px ${alpha(primary, 0.14)}`,

    cardBg:
      customSurfaceColor ||
      (isDark
        ? `linear-gradient(${gradDir}deg, ${mix(surface, highlight, 0.12)} 0%, ${surface} 40%, ${mix(surface, "#000000", 0.3)} 100%)`
        : `linear-gradient(${gradDir}deg, ${mix(surface, "#ffffff", 0.35)} 0%, ${surface} 60%, ${mix(surface, quaternary, 0.18)} 100%)`),

    outlinedBg: isDark
      ? `linear-gradient(${gradDir}deg, ${mix(surface, midTone, 0.25)} 0%, ${surface} 100%)`
      : `linear-gradient(${gradDir}deg, ${mix(surface, "#ffffff", 0.4)} 0%, ${surface} 100%)`,

    tabsBg: isDark
      ? `linear-gradient(${gradDir}deg, ${mix(midTone, highlight, 0.2)} 0%, ${midTone} 100%)`
      : `linear-gradient(${gradDir}deg, ${mix(surface, "#ffffff", 0.4)} 0%, ${mix(surface, primary, 0.3)} 100%)`,

    profileOutlinedBg: isDark
      ? `linear-gradient(180deg, ${mix(surface, midTone, 0.25)} 0%, ${surface} 100%)`
      : `linear-gradient(180deg, ${mix(surface, "#ffffff", 0.4)} 0%, ${surface} 100%)`,

    profileContainedBg: isDark
      ? `linear-gradient(180deg, ${mix(secondary, "#000000", 0.18)} 0%, ${mix(primary, "#000000", 0.24)} 55%, ${mix(quaternary, "#000000", 0.16)} 100%)`
      : `linear-gradient(180deg, ${mix(secondary, "#ffffff", 0.66)} 0%, ${mix(primary, "#ffffff", 0.52)} 55%, ${mix(quaternary, "#ffffff", 0.42)} 100%)`,

    profileButtonTextColor: isDark ? "#f8fbff" : "#11264a",
  };
}

function buildRegaliaTokens(
  mode: Mode,
  primary: string,
  secondary: string,
  ternary: string,
  quaternary: string,
  paper: string,
  customization?: ThemeCustomization | null,
): ProfileTokens {
  const isDark = mode === "dark";
  const gradDir = getGradientDirection(customization);
  const customSurfaceColor = customization?.surfaceColor;

  return {
    panelRadius: 10,
    controlRadius: 999,
    multilineRadius: 10,
    buttonRadius: null,

    textColor: null,
    accent: null,
    highlight: null,
    midTone: null,
    shadow: null,
    surface: null,

    bevelBorders: null,
    frameFx: null,

    panelSurface:
      customSurfaceColor ||
      (isDark
        ? `linear-gradient(${gradDir}deg, ${alpha(secondary, 0.28)} 0%, ${alpha(primary, 0.84)} 55%, ${alpha(paper, 0.96)} 100%)`
        : `linear-gradient(${gradDir}deg, ${alpha(secondary, 0.12)} 0%, ${alpha(ternary, 0.9)} 100%)`),

    arcGradient: null,
    vignetteGradient: null,

    menuShadow: isDark
      ? `0 8px 24px ${alpha(primary, 0.35)}`
      : `0 6px 20px ${alpha(primary, 0.25)}`,

    paperBg:
      customSurfaceColor || (isDark ? alpha(paper, 0.9) : alpha(paper, 0.95)),
    paperBorder: `1px solid ${alpha(quaternary, isDark ? 0.6 : 0.45)}`,
    paperShadow: isDark
      ? `inset 0 1px 0 ${alpha(secondary, 0.18)}, 0 2px 10px rgba(7,16,28,0.5)`
      : `inset 0 1px 0 ${alpha("#ffffff", 0.75)}, 0 1px 4px ${alpha(primary, 0.14)}`,

    cardBg:
      customSurfaceColor ||
      (isDark
        ? `linear-gradient(${gradDir}deg, ${alpha(secondary, 0.28)} 0%, ${alpha(primary, 0.84)} 55%, ${alpha(paper, 0.96)} 100%)`
        : `linear-gradient(${gradDir}deg, ${alpha(secondary, 0.12)} 0%, ${alpha(ternary, 0.9)} 100%)`),

    outlinedBg: isDark
      ? `linear-gradient(${gradDir}deg, ${alpha(secondary, 0.3)} 0%, ${alpha(primary, 0.62)} 100%)`
      : `linear-gradient(${gradDir}deg, ${alpha("#ffffff", 0.9)} 0%, ${alpha(secondary, 0.22)} 100%)`,

    tabsBg: isDark
      ? `linear-gradient(${gradDir}deg, ${alpha(secondary, 0.24)} 0%, ${alpha(primary, 0.72)} 100%)`
      : `linear-gradient(${gradDir}deg, ${alpha("#ffffff", 0.92)} 0%, ${alpha(secondary, 0.22)} 100%)`,

    profileOutlinedBg: isDark
      ? `linear-gradient(${gradDir}deg, ${mix(secondary, "#000000", 0.3)} 0%, ${mix(primary, "#000000", 0.24)} 100%)`
      : `linear-gradient(${gradDir}deg, ${mix("#ffffff", secondary, 0.18)} 0%, ${mix("#ffffff", primary, 0.12)} 100%)`,

    profileContainedBg: isDark
      ? `linear-gradient(${gradDir}deg, ${mix(secondary, "#000000", 0.18)} 0%, ${mix(primary, "#000000", 0.24)} 55%, ${mix(quaternary, "#000000", 0.16)} 100%)`
      : `linear-gradient(${gradDir}deg, ${mix(secondary, "#ffffff", 0.66)} 0%, ${mix(primary, "#ffffff", 0.52)} 55%, ${mix(quaternary, "#ffffff", 0.42)} 100%)`,

    profileButtonTextColor: isDark ? "#f8fbff" : "#11264a",
  };
}

function buildNoirTokens(
  mode: Mode,
  primary: string,
  secondary: string,
  ternary: string,
  quaternary: string,
  paper: string,
  customization?: ThemeCustomization | null,
): ProfileTokens {
  const isDark = mode === "dark";
  const gradDir = getGradientDirection(customization);
  const surfaceColor =
    customization?.surfaceColor ?? (isDark ? "#111111" : "#ffffff");
  const surfaceDepth =
    customization?.surfaceDepth ?? (isDark ? "#0b0b0b" : ternary);
  const customSurfaceColor = customization?.surfaceColor;

  return {
    panelRadius: 4,
    controlRadius: 6,
    multilineRadius: 6,
    buttonRadius: null,

    textColor: null,
    accent: null,
    highlight: null,
    midTone: null,
    shadow: null,
    surface: null,

    bevelBorders: null,
    frameFx: null,

    panelSurface:
      customSurfaceColor ||
      (isDark
        ? `linear-gradient(${gradDir}deg, ${alpha(surfaceColor, 0.95)} 0%, ${alpha(surfaceDepth, 0.98)} 100%)`
        : `linear-gradient(${gradDir}deg, ${alpha(surfaceColor, 0.95)} 0%, ${alpha(surfaceDepth, 0.98)} 100%)`),
    arcGradient: null,
    vignetteGradient: null,

    menuShadow: isDark
      ? "0 6px 18px rgba(6,14,24,0.6)"
      : `0 4px 16px ${alpha(primary, 0.2)}`,
    paperBg: customSurfaceColor || alpha(paper, isDark ? 0.9 : 0.95),
    paperBorder: `1px solid ${alpha(quaternary, isDark ? 0.6 : 0.45)}`,
    paperShadow: isDark
      ? `inset 0 1px 0 ${alpha("#ffffff", 0.05)}, 0 0 0 1px ${alpha("#000000", 0.35)}`
      : `inset 0 1px 0 ${alpha("#ffffff", 0.75)}, 0 1px 4px ${alpha(primary, 0.14)}`,

    cardBg:
      customSurfaceColor ||
      (isDark
        ? `linear-gradient(${gradDir}deg, ${alpha(surfaceColor, 0.95)} 0%, ${alpha(surfaceDepth, 0.98)} 100%)`
        : `linear-gradient(${gradDir}deg, ${alpha("#ffffff", 0.9)} 0%, ${alpha(ternary, 0.9)} 100%)`),
    outlinedBg:
      customSurfaceColor ||
      (isDark
        ? `linear-gradient(${gradDir}deg, ${alpha(surfaceColor, 0.9)} 0%, ${alpha(surfaceDepth, 0.9)} 100%)`
        : `linear-gradient(${gradDir}deg, ${alpha("#ffffff", 0.9)} 0%, ${alpha(ternary, 0.92)} 100%)`),
    tabsBg:
      customSurfaceColor ||
      (isDark
        ? `linear-gradient(${gradDir}deg, ${alpha("#121212", 0.96)} 0%, ${alpha(surfaceDepth, 0.98)} 100%)`
        : `linear-gradient(${gradDir}deg, ${alpha("#ffffff", 0.9)} 0%, ${alpha(ternary, 0.9)} 100%)`),

    profileOutlinedBg:
      customSurfaceColor ||
      (isDark
        ? `linear-gradient(${gradDir}deg, ${alpha(surfaceColor, 0.9)} 0%, ${alpha(surfaceDepth, 0.9)} 100%)`
        : `linear-gradient(${gradDir}deg, ${alpha("#ffffff", 0.9)} 0%, ${alpha(ternary, 0.92)} 100%)`),
    profileContainedBg: isDark
      ? customSurfaceColor ||
        `linear-gradient(${gradDir}deg, ${alpha(surfaceColor, 0.9)} 0%, ${alpha(surfaceDepth, 0.9)} 100%)`
      : `linear-gradient(${gradDir}deg, ${secondary} 0%, ${primary} 55%, ${quaternary} 100%)`,
    profileButtonTextColor: isDark ? "#eaf3ff" : primary,
  };
}

function buildProfileTokens(
  profile: ThemeStyleProfile,
  mode: Mode,
  primary: string,
  secondary: string,
  ternary: string,
  quaternary: string,
  paper: string,
  customization?: ThemeCustomization | null,
): ProfileTokens {
  switch (profile) {
    case "flat":
      return buildFlatTokens(
        mode,
        primary,
        secondary,
        ternary,
        quaternary,
        paper,
        customization,
      );
    case "dystopian":
      return buildDystopianTokens(
        mode,
        primary,
        secondary,
        ternary,
        quaternary,
        paper,
        customization,
      );
    case "regalia":
      return buildRegaliaTokens(
        mode,
        primary,
        secondary,
        ternary,
        quaternary,
        paper,
        customization,
      );
    case "noir":
      return buildNoirTokens(
        mode,
        primary,
        secondary,
        ternary,
        quaternary,
        paper,
        customization,
      );
    case "default":
    default:
      return buildDefaultTokens(
        mode,
        primary,
        secondary,
        ternary,
        quaternary,
        paper,
        customization,
      );
  }
}

function applyStyleEffectCustomizations(
  tokens: ProfileTokens,
  customization: ThemeCustomization | null | undefined,
): ProfileTokens {
  if (!customization) return tokens;

  const modified = { ...tokens };

  if (customization.bevelBordersEnabled === false) modified.bevelBorders = null;
  if (customization.frameEffectsEnabled === false) modified.frameFx = null;
  if (customization.textEffectsEnabled === false) modified.textColor = null;

  if (customization.gradientsEnabled === false) {
    modified.cardBg = "transparent";
    modified.outlinedBg = "transparent";
    modified.tabsBg = "transparent";
    modified.panelSurface = "transparent";
    modified.profileOutlinedBg = "transparent";
    modified.profileContainedBg = "transparent";
    modified.arcGradient = null;
    modified.vignetteGradient = null;
  }

  return modified;
}

function isEffectEnabled(
  granular: boolean | null | undefined,
  legacy: boolean | null | undefined,
): boolean {
  if (granular !== null && granular !== undefined) return granular !== false;
  if (legacy !== null && legacy !== undefined) return legacy !== false;
  return true;
}

function getEffectIntensity(
  customIntensity: number | null | undefined,
  globalIntensity: number | null | undefined,
): number {
  if (customIntensity !== null && customIntensity !== undefined) {
    return Math.max(0, Math.min(100, customIntensity)) / 100;
  }
  if (globalIntensity !== null && globalIntensity !== undefined) {
    return Math.max(0, Math.min(100, globalIntensity)) / 100;
  }
  return 1;
}

function buildBevelBorders(
  baseTokens: Record<string, string> | null,
  customization: ThemeCustomization | null | undefined,
  fallbackColor: string,
): Record<string, string> | null {
  const hasCustomBorder =
    customization?.bevelBorderStyle ||
    customization?.bevelBorderColor ||
    customization?.bevelBorderWidth;

  if (!hasCustomBorder) return baseTokens;

  const borderWidth = (customization?.bevelBorderWidth ?? 2) + "px";
  const borderStyle = customization?.bevelBorderStyle ?? "solid";
  const finalColor =
    customization?.bevelBorderColor ||
    (baseTokens
      ? extractColorFromBorder(baseTokens.borderTop || fallbackColor)
      : fallbackColor);

  const value = `${borderWidth} ${borderStyle} ${finalColor}`;
  return {
    borderTop: value,
    borderLeft: value,
    borderBottom: value,
    borderRight: value,
  };
}

function extractColorFromBorder(borderStr: string): string {
  const parts = borderStr.split(" ");
  const lastPart = parts[parts.length - 1];
  return lastPart && (lastPart.startsWith("#") || lastPart.startsWith("rgb"))
    ? lastPart
    : "#000000";
}

function buildFrameEffect(
  baseTokens: Record<string, string> | null,
  customization: ThemeCustomization | null | undefined,
  intensity: number,
): Record<string, string> | null {
  const effectColor = customization?.frameEffectColor;
  const effectIntensity = Math.max(0, Math.min(1, intensity));

  if (effectColor) {
    return {
      boxShadow: `0 0 0 1px ${alpha(effectColor, 0.7 * effectIntensity)}, 0 0 6px ${alpha(effectColor, 0.35 * effectIntensity)}, 0 4px 12px rgba(0,0,0,${(0.65 * effectIntensity).toFixed(2)})`,
    };
  }

  if (!baseTokens?.boxShadow) return null;
  return { boxShadow: baseTokens.boxShadow };
}

function buildTextEffect(
  customization: ThemeCustomization | null | undefined,
  intensity: number,
): string {
  const effectColor = customization?.textEffectColor;
  const effectType = customization?.textEffectType ?? "shadow";
  const effectIntensity = Math.max(0, Math.min(1, intensity));

  if (!effectColor || effectIntensity === 0) return "none";

  switch (effectType) {
    case "glow":
      return `0 0 ${Math.round(4 * effectIntensity)}px ${effectColor}`;
    case "outline":
      return `0 0 ${Math.round(2 * effectIntensity)}px ${effectColor}`;
    case "shadow":
    default:
      return `${Math.round(1 * effectIntensity)}px ${Math.round(1 * effectIntensity)}px 0 ${effectColor}`;
  }
}

// Relative luminance (0-1), used to detect near-black primaries in dark mode.
function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

// Near-black primary in dark mode: use white-alpha so selected states stay visible.
function selectionBg(primary: string, isDark: boolean): string {
  if (isDark && relativeLuminance(primary) < 0.02)
    return alpha("#ffffff", 0.14);
  return alpha(primary, isDark ? 0.8 : 0.2);
}

function selectionHoverBg(
  quaternary: string,
  primary: string,
  isDark: boolean,
): string {
  if (isDark && relativeLuminance(primary) < 0.02)
    return alpha("#ffffff", 0.22);
  return alpha(quaternary, isDark ? 0.9 : 0.24);
}

function tableRowSelectionBg(primary: string, isDark: boolean): string {
  if (isDark && relativeLuminance(primary) < 0.02)
    return alpha("#ffffff", 0.12);
  return alpha(primary, isDark ? 0.16 : 0.1);
}

function applyGradientOpacity(
  background: string,
  opacity: number,
  isDark: boolean,
): string {
  if (opacity === 1) return background;
  const overlayColor = isDark ? "0,0,0" : "255,255,255";
  const overlayOpacity = 1 - opacity;
  return `linear-gradient(rgba(${overlayColor},${overlayOpacity})), ${background}`;
}

export function createThemeComponents({
  mode,
  primary,
  secondary,
  ternary,
  quaternary,
  paper,
  profile = "default",
  panelRadiusOverride,
  controlRadiusOverride,
  styleCustomization,
  successColor: successColorProp,
  appBarGradient: appBarGradientProp,
}: ThemeComponentFactoryOptions): Components<Theme> {
  const isDark = mode === "dark";

  let tokens = buildProfileTokens(
    profile,
    mode,
    primary,
    secondary,
    ternary,
    quaternary,
    paper,
    styleCustomization,
  );
  tokens = applyStyleEffectCustomizations(tokens, styleCustomization);

  const defaultColorTokens = buildDefaultTokens(
    mode,
    primary,
    secondary,
    ternary,
    quaternary,
    paper,
    styleCustomization,
  );

  const hasCustomSurfaceColor =
    styleCustomization?.surfaceColor !== null &&
    styleCustomization?.surfaceColor !== undefined;
  const hasCustomSurfaceDepth =
    styleCustomization?.surfaceDepth !== null &&
    styleCustomization?.surfaceDepth !== undefined;
  const hasCustomSurfaceEffectColor =
    hasCustomSurfaceColor || hasCustomSurfaceDepth;
  const allowProfileSurfaceColorStyling = hasCustomSurfaceEffectColor;

  const hasCustomVignetteStrength =
    styleCustomization?.vignetteStrength !== null &&
    styleCustomization?.vignetteStrength !== undefined;

  if (!hasCustomSurfaceEffectColor) {
    tokens = {
      ...tokens,
      panelSurface: defaultColorTokens.panelSurface,
      arcGradient: defaultColorTokens.arcGradient,
      vignetteGradient: hasCustomVignetteStrength
        ? tokens.vignetteGradient
        : defaultColorTokens.vignetteGradient,
      menuShadow: defaultColorTokens.menuShadow,
      paperBg: defaultColorTokens.paperBg,
      paperBorder: defaultColorTokens.paperBorder,
      paperShadow: defaultColorTokens.paperShadow,
      cardBg: defaultColorTokens.cardBg,
      outlinedBg: defaultColorTokens.outlinedBg,
      tabsBg: defaultColorTokens.tabsBg,
      profileOutlinedBg: defaultColorTokens.profileOutlinedBg,
      profileContainedBg: defaultColorTokens.profileContainedBg,
      profileButtonTextColor: defaultColorTokens.profileButtonTextColor,
    };
  }

  let panelRadius = tokens.panelRadius;
  let controlRadius = tokens.controlRadius;

  if (panelRadiusOverride !== null && panelRadiusOverride !== undefined)
    panelRadius = panelRadiusOverride;
  if (controlRadiusOverride !== null && controlRadiusOverride !== undefined)
    controlRadius = controlRadiusOverride;

  const multilineRadius = tokens.multilineRadius;

  const enableGradients =
    profile !== "noir" &&
    isEffectEnabled(styleCustomization?.gradientsEnabled, undefined);
  const enableBevelBorders = isEffectEnabled(
    styleCustomization?.bevelBordersEnabled,
    undefined,
  );
  const enableFrameEffects = isEffectEnabled(
    styleCustomization?.frameEffectsEnabled,
    undefined,
  );
  const enableTextEffects = isEffectEnabled(
    styleCustomization?.textEffectsEnabled,
    undefined,
  );
  const hasCustomFrameEffectColor =
    styleCustomization?.frameEffectColor !== null &&
    styleCustomization?.frameEffectColor !== undefined;
  const hasCustomTextEffectColor =
    styleCustomization?.textEffectColor !== null &&
    styleCustomization?.textEffectColor !== undefined;
  const shouldApplyTextEffectColor =
    enableTextEffects && hasCustomTextEffectColor;

  const buttonUppercase =
    styleCustomization?.buttonUppercase ??
    (profile === "regalia" || profile === "dystopian");
  const buttonLetterSpacing =
    styleCustomization?.buttonLetterSpacing !== null &&
    styleCustomization?.buttonLetterSpacing !== undefined
      ? `${styleCustomization.buttonLetterSpacing * 0.01}em`
      : profile === "regalia" || profile === "dystopian"
        ? "0.03em"
        : "normal";

  const backdropOpacity =
    styleCustomization?.backdropOpacity !== null &&
    styleCustomization?.backdropOpacity !== undefined
      ? styleCustomization.backdropOpacity / 100
      : isDark
        ? 0.85
        : 0.75;

  const frameEffectIntensity = getEffectIntensity(
    styleCustomization?.frameEffectIntensity,
    undefined,
  );
  const textEffectIntensity = getEffectIntensity(
    styleCustomization?.textEffectIntensity,
    undefined,
  );
  const gradientOpacity = getGradientOpacity(styleCustomization);

  const customBevelBorders = enableBevelBorders
    ? buildBevelBorders(tokens.bevelBorders, styleCustomization, quaternary)
    : null;
  const hasProfileFrameFx =
    tokens.frameFx !== null && tokens.frameFx !== undefined;
  const customFrameEffect =
    enableFrameEffects && (hasProfileFrameFx || hasCustomFrameEffectColor)
      ? buildFrameEffect(
          tokens.frameFx,
          styleCustomization,
          frameEffectIntensity,
        )
      : null;
  const customTextEffect = enableTextEffects
    ? buildTextEffect(styleCustomization, textEffectIntensity)
    : "none";

  return {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: tokens.paperBg,
          backgroundImage:
            !enableGradients || profile === "dystopian"
              ? "none"
              : gradientOpacity < 1
                ? applyGradientOpacity(tokens.paperBg, gradientOpacity, isDark)
                : tokens.paperBg,
          backgroundBlendMode: gradientOpacity < 1 ? "overlay" : "normal",
          border: tokens.paperBorder,
          boxShadow: tokens.paperShadow,
          borderRadius: panelRadius,
          ...(customBevelBorders ?? {}),
          ...(customFrameEffect ?? {}),
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background:
            profile === "dystopian"
              ? !enableGradients
                ? isDark
                  ? alpha(paper, 0.9)
                  : alpha(paper, 0.95)
                : tokens.panelSurface
              : tokens.paperBg,
          ...(profile === "dystopian" && enableGradients && gradientOpacity < 1
            ? {
                backgroundImage: applyGradientOpacity(
                  tokens.panelSurface,
                  gradientOpacity,
                  isDark,
                ),
                backgroundBlendMode: "overlay",
              }
            : {}),
          border: `1px solid ${alpha(quaternary, isDark ? 0.6 : 0.45)}`,
          borderRadius: panelRadius,
          ...(customBevelBorders ?? {}),
          ...(customFrameEffect ?? {}),
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: shouldApplyTextEffectColor
            ? (tokens.textColor ??
              (isDark ? alpha("#ffffff", 0.78) : alpha(quaternary, 0.9)))
            : isDark
              ? alpha("#ffffff", 0.78)
              : alpha(quaternary, 0.9),
          "&.Mui-focused": {
            color: isDark ? "#ffffff" : primary,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        outlined: {
          borderColor: isEffectProfile(profile)
            ? alpha(quaternary, isDark ? 0.95 : 0.7)
            : alpha(quaternary, isDark ? 0.9 : 0.6),
          color: shouldApplyTextEffectColor
            ? tokens.profileButtonTextColor
            : "inherit",
          background: !enableGradients
            ? "transparent"
            : tokens.profileOutlinedBg,
          ...(enableGradients && gradientOpacity < 1
            ? {
                backgroundImage: applyGradientOpacity(
                  tokens.profileOutlinedBg,
                  gradientOpacity,
                  isDark,
                ),
                backgroundBlendMode: "screen",
              }
            : {}),
          borderRadius: tokens.buttonRadius ?? controlRadius,
          textTransform: buttonUppercase ? "uppercase" : "none",
          letterSpacing: buttonLetterSpacing,
          textShadow:
            enableTextEffects && customTextEffect !== "none"
              ? customTextEffect
              : "none",
          "&:hover": {
            borderColor: isDark ? alpha(secondary, 0.95) : quaternary,
            backgroundColor: isDark
              ? alpha(
                  primary,
                  isEffectProfile(profile)
                    ? 0.7
                    : profile === "flat"
                      ? 0.48
                      : 0.72,
                )
              : alpha(ternary, 0.95),
            color: isDark
              ? "#ffffff"
              : shouldApplyTextEffectColor
                ? tokens.profileButtonTextColor
                : "inherit",
          },
        },
        contained: {
          color: shouldApplyTextEffectColor
            ? tokens.profileButtonTextColor
            : isDark
              ? "#f4f8ff"
              : "#ffffff",
          border: `1px solid ${alpha(quaternary, isDark ? 0.95 : 0.65)}`,
          background:
            profile === "flat"
              ? primary
              : isEffectProfile(profile)
                ? !enableGradients
                  ? alpha(primary, 0.8)
                  : tokens.profileContainedBg
                : !enableGradients
                  ? alpha(primary, 0.8)
                  : `linear-gradient(${getGradientDirection(styleCustomization)}deg, ${secondary} 0%, ${primary} 55%, ${quaternary} 100%)`,
          ...(profile !== "flat" && enableGradients && gradientOpacity < 1
            ? {
                backgroundImage: isEffectProfile(profile)
                  ? applyGradientOpacity(
                      tokens.profileContainedBg,
                      gradientOpacity,
                      isDark,
                    )
                  : applyGradientOpacity(
                      `linear-gradient(${getGradientDirection(styleCustomization)}deg, ${secondary} 0%, ${primary} 55%, ${quaternary} 100%)`,
                      gradientOpacity,
                      isDark,
                    ),
                backgroundBlendMode: "screen",
              }
            : {}),
          boxShadow:
            profile === "dystopian" &&
            enableFrameEffects &&
            hasCustomFrameEffectColor
              ? "0 1px 3px rgba(0,0,0,0.35)"
              : `inset 0 1px 0 ${alpha("#ffffff", isDark ? 0.24 : 0.45)}`,
          borderRadius: tokens.buttonRadius ?? controlRadius,
          textTransform: buttonUppercase ? "uppercase" : "none",
          letterSpacing: buttonLetterSpacing,
          textShadow:
            enableTextEffects && customTextEffect !== "none"
              ? customTextEffect
              : "none",
          ...(customBevelBorders ?? {}),
          ...(customFrameEffect ?? {}),
          "&:hover": {
            background:
              profile === "flat"
                ? alpha(primary, 0.9)
                : !enableGradients
                  ? alpha(primary, 0.85)
                  : `linear-gradient(180deg, ${alpha(secondary, 0.95)} 0%, ${alpha(primary, 0.92)} 55%, ${alpha(quaternary, 0.92)} 100%)`,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          color: isDark ? "#edf2f8" : "#243446",
          "&:hover": { color: isDark ? "#edf2f8" : "#243446" },
          "&.Mui-focused": { color: isDark ? "#edf2f8" : "#243446" },
        },
        input: {
          color: isDark ? "#edf2f8" : "#243446",
          "&:hover": { color: isDark ? "#edf2f8" : "#243446" },
          "&.Mui-focused": { color: isDark ? "#edf2f8" : "#243446" },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: isDark
              ? alpha(ternary, 0.65)
              : alpha(ternary, 0.7),
            borderRadius: controlRadius,
            "&.MuiInputBase-multiline": {
              borderRadius: multilineRadius,
            },
            "& fieldset": {
              borderColor: alpha(quaternary, 0.6),
            },
            "&:hover fieldset": {
              borderColor: alpha(secondary, isDark ? 0.92 : 0.85),
            },
            "&.Mui-focused fieldset": {
              borderColor: alpha(secondary, isDark ? 1 : 0.95),
            },
            "& .MuiInputBase-input": {
              color: isDark ? "#edf2f8" : "#243446",
            },
            "&:hover .MuiInputBase-input": {
              color: isDark ? "#edf2f8" : "#243446",
            },
            "&.Mui-focused .MuiInputBase-input": {
              color: isDark ? "#edf2f8" : "#243446",
            },
          },
        },
      },
    },
    MuiInput: {
      styleOverrides: {
        root: {
          color: isDark ? "#edf2f8" : "#243446",
          "&:hover": { color: isDark ? "#edf2f8" : "#243446" },
          "&.Mui-focused": { color: isDark ? "#edf2f8" : "#243446" },
        },
        input: {
          color: isDark ? "#edf2f8" : "#243446",
          "&:hover": { color: isDark ? "#edf2f8" : "#243446" },
          "&.Mui-focused": { color: isDark ? "#edf2f8" : "#243446" },
        },
        underline: {
          "&:before": {
            borderBottomColor: alpha(quaternary, 0.6),
          },
          "&:hover:not(.Mui-disabled):before": {
            borderBottomColor: alpha(secondary, isDark ? 0.92 : 0.85),
          },
          "&.Mui-focused:after": {
            borderBottomColor: alpha(secondary, isDark ? 1 : 0.95),
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          color: isDark ? "#edf2f8" : "#243446",
        },
        root: () => ({
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: alpha(secondary, 0.95),
          },
        }),
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          background: !enableGradients
            ? isDark
              ? alpha(paper, 0.96)
              : alpha(ternary, 0.95)
            : profile === "dystopian"
              ? tokens.panelSurface
              : isDark
                ? alpha(paper, 0.96)
                : alpha(ternary, 0.95),
          border: `1px solid ${alpha(quaternary, isDark ? 0.6 : 0.45)}`,
          boxShadow: tokens.menuShadow,
          borderRadius: panelRadius,
          ...(customBevelBorders ?? {}),
          ...(customFrameEffect ?? {}),
        },
      },
      defaultProps: {
        slotProps: {
          backdrop: {
            sx: {
              backgroundColor: "transparent",
            },
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: controlRadius,
          color: shouldApplyTextEffectColor
            ? (tokens.textColor ?? undefined)
            : undefined,
          textShadow:
            enableTextEffects && customTextEffect !== "none"
              ? customTextEffect
              : "none",
          "&.Mui-selected": {
            backgroundColor: selectionBg(primary, isDark),
            "&:hover": {
              backgroundColor: selectionHoverBg(quaternary, primary, isDark),
            },
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          textShadow:
            enableTextEffects && customTextEffect !== "none"
              ? customTextEffect
              : "none",
          "&.Mui-selected": {
            backgroundColor: selectionBg(primary, isDark),
            "&:hover": {
              backgroundColor: selectionHoverBg(quaternary, primary, isDark),
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        label: {
          textShadow:
            enableTextEffects && customTextEffect !== "none"
              ? customTextEffect
              : "none",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            backgroundColor: tableRowSelectionBg(primary, isDark),
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: (() => {
          const useGradient =
            styleCustomization?.appBarGradient ?? appBarGradientProp ?? false;
          if (useGradient) {
            return {
              background: `linear-gradient(180deg, ${secondary}, ${primary}, ${ternary})`,
            };
          }
          return {
            background: `linear-gradient(180deg, ${alpha(secondary, isDark ? 0.95 : 0.9)}, ${alpha(primary, isDark ? 1 : 0.95)})`,
          };
        })(),
      },
    },
    MuiListSubheader: {
      styleOverrides: {
        root: {
          backgroundColor: isDark ? alpha(paper, 0.96) : alpha(ternary, 0.95),
          color: shouldApplyTextEffectColor
            ? (tokens.textColor ?? (isDark ? "#eef4fb" : quaternary))
            : isDark
              ? "#eef4fb"
              : quaternary,
          textTransform: "uppercase",
          letterSpacing: "0.03em",
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: "100%",
          borderRadius: 0,
          zIndex: 0,
          background: !enableGradients
            ? alpha(primary, 0.6)
            : `linear-gradient(${getGradientDirection(styleCustomization)}deg, ${alpha(secondary, isDark ? 0.5 : 0.35)} 0%, ${alpha(primary, isDark ? 0.55 : 0.35)} 100%)`,
          border: `1px solid ${alpha(quaternary, isDark ? 0.8 : 0.5)}`,
          boxSizing: "border-box",
        },
        root: {
          minHeight: 34,
          borderBottom: `1px solid ${alpha(quaternary, isDark ? 0.7 : 0.45)}`,
          background: !enableGradients
            ? isDark
              ? alpha(paper, 0.9)
              : alpha(paper, 0.95)
            : profile === "dystopian"
              ? (tokens.arcGradient ?? tokens.tabsBg)
              : tokens.tabsBg,
          borderRadius: profile === "flat" ? 0 : panelRadius,
          textShadow:
            enableTextEffects && customTextEffect !== "none"
              ? customTextEffect
              : "none",
          ...(customBevelBorders ?? {}),
          ...(customFrameEffect ?? {}),
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: 34,
          paddingTop: 4,
          paddingBottom: 4,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          fontWeight: 700,
          color: shouldApplyTextEffectColor
            ? (tokens.textColor ??
              (isDark ? alpha(secondary, 0.9) : quaternary))
            : isDark
              ? alpha(secondary, 0.9)
              : quaternary,
          textShadow:
            enableTextEffects && customTextEffect !== "none"
              ? customTextEffect
              : "none",
          zIndex: 1,
          "&.Mui-selected": {
            color: isDark ? "#ffffff" : primary,
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          textShadow:
            enableTextEffects && customTextEffect !== "none"
              ? customTextEffect
              : "none",
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        "::selection": {
          backgroundColor: isDark
            ? alpha(secondary, 0.52)
            : alpha(primary, 0.24),
          color: isDark ? "#ffffff" : "#111111",
        },
        "::-moz-selection": {
          backgroundColor: isDark
            ? alpha(secondary, 0.52)
            : alpha(primary, 0.24),
          color: isDark ? "#ffffff" : "#111111",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          border: `1px solid ${alpha(quaternary, isDark ? 0.75 : 0.5)}`,
          borderRadius: panelRadius,
          background: !enableGradients
            ? isDark
              ? alpha(paper, 0.95)
              : alpha(paper, 0.98)
            : isDark
              ? profile === "dystopian" && allowProfileSurfaceColorStyling
                ? tokens.vignetteGradient
                : profile === "regalia" && allowProfileSurfaceColorStyling
                  ? `linear-gradient(${getGradientDirection(styleCustomization)}deg, ${alpha(secondary, 0.72)} 0%, ${alpha(primary, 0.95)} 45%, ${alpha(paper, 1)} 100%)`
                  : `linear-gradient(${getGradientDirection(styleCustomization)}deg, ${alpha(primary, 0.82)} 0%, ${alpha(paper, 1)} 100%)`
              : profile === "dystopian" && allowProfileSurfaceColorStyling
                ? tokens.vignetteGradient
                : profile === "regalia" && allowProfileSurfaceColorStyling
                  ? `linear-gradient(${getGradientDirection(styleCustomization)}deg, ${alpha("#ffffff", 1)} 0%, ${alpha(secondary, 0.5)} 100%)`
                  : `linear-gradient(${getGradientDirection(styleCustomization)}deg, ${alpha("#ffffff", 1)} 0%, ${alpha(ternary, 0.98)} 100%)`,
          ...(customBevelBorders ?? {}),
          ...(customFrameEffect ?? {}),
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          fontWeight: 700,
          borderTopLeftRadius: panelRadius,
          borderTopRightRadius: panelRadius,
          background: !enableGradients
            ? isDark
              ? alpha(paper, 0.95)
              : alpha(paper, 0.98)
            : isDark
              ? profile === "dystopian" && allowProfileSurfaceColorStyling
                ? tokens.arcGradient
                : profile === "regalia" && allowProfileSurfaceColorStyling
                  ? `linear-gradient(${getGradientDirection(styleCustomization)}deg, ${alpha(secondary, 0.82)} 0%, ${alpha(primary, 0.95)} 100%)`
                  : `linear-gradient(${getGradientDirection(styleCustomization)}deg, ${alpha(secondary, 0.75)} 0%, ${alpha(primary, 0.9)} 100%)`
              : profile === "dystopian" && allowProfileSurfaceColorStyling
                ? (tokens.arcGradient ?? tokens.tabsBg)
                : profile === "regalia" && allowProfileSurfaceColorStyling
                  ? `linear-gradient(${getGradientDirection(styleCustomization)}deg, ${alpha(secondary, 0.9)} 0%, ${alpha(primary, 0.95)} 100%)`
                  : `linear-gradient(${getGradientDirection(styleCustomization)}deg, ${alpha(secondary, 0.9)} 0%, ${alpha(primary, 0.92)} 100%)`,
          color: shouldApplyTextEffectColor
            ? profile === "dystopian" && !isDark
              ? "#0f1e3d"
              : "#f4faff"
            : "#f4faff",
          borderBottom: `1px solid ${alpha(quaternary, isDark ? 0.8 : 0.5)}`,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: alpha(quaternary, isDark ? 0.62 : 0.45),
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          color: isDark ? "#d1e2f4" : "#2f3f50",
          borderBottom: `1px solid ${alpha(quaternary, isDark ? 0.48 : 0.25)}`,
        },
        head: {
          color: isDark ? "#e3f0fc" : primary,
        },
        body: {
          color: isDark ? "#d1e2f4" : "#2f3f50",
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: secondary,
          "&.Mui-checked": { color: secondary },
          "&.Mui-disabled": { color: alpha(quaternary, 0.2) },
          "&:hover": { backgroundColor: alpha(primary, 0.12) },
          ...(() => {
            const sc = successColorProp ?? null;
            return sc
              ? {
                  "&.MuiCheckbox-colorSuccess": {
                    color: alpha(sc, 0.7),
                    "&.Mui-checked": { color: sc },
                  },
                }
              : {};
          })(),
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          "&.Mui-checked": {
            color: secondary,
            "& + .MuiSwitch-track": {
              backgroundColor: quaternary,
            },
          },
        },
        thumb: {
          backgroundColor: isDark ? primary : quaternary,
        },
        track: {
          backgroundColor: isDark ? alpha(paper, 0.9) : alpha(secondary, 0.45),
          transition: "background-color 0.3s",
          border: `1px solid ${alpha(quaternary, 0.72)}`,
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: { color: secondary },
        thumb: {
          backgroundColor: secondary,
          "&:hover, &.Mui-focusVisible": { backgroundColor: quaternary },
          "&.Mui-disabled": { backgroundColor: alpha(quaternary, 0.2) },
        },
        track: { backgroundColor: secondary },
        rail: { backgroundColor: quaternary },
        mark: { backgroundColor: quaternary },
        markActive: { backgroundColor: secondary },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: secondary,
          "&.Mui-checked": { color: secondary },
          "&.Mui-disabled": { color: alpha(quaternary, 0.2) },
          "&:hover": { backgroundColor: alpha(primary, 0.12) },
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          color: shouldApplyTextEffectColor
            ? (tokens.textColor ??
              (isDark ? alpha(secondary, 0.86) : quaternary))
            : isDark
              ? alpha(secondary, 0.86)
              : quaternary,
          "&.Mui-focused": {
            color: isDark ? "#ffffff" : primary,
          },
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: `rgba(0, 0, 0, ${backdropOpacity})`,
        },
      },
    },
  } as Components<Theme>;
}
