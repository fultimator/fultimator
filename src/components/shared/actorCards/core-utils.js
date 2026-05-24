import { useTranslate } from "../../../translation/translate";
import { useCustomTheme } from "../../../hooks/useCustomTheme";

export const ACTOR_DEFAULTS = {
  variant: "interactive",
  onAttackRoll: null,
  onSpellRoll: null,
};

// variants: "interactive" | "display" | "print"
export function isInteractive(variant) {
  return variant === "interactive";
}

export function getActorVariantScale(variant) {
  if (variant === "print")
    return { section: "1rem", body: "0.85rem", heading: "0.85rem" };
  return { section: "1.1rem", body: "1rem", heading: "1rem" };
}

export function getNpcBackground(customTheme) {
  return customTheme.mode === "dark"
    ? `linear-gradient(90deg, #583871 0%, rgba(255, 255, 255, 0) 100%)`
    : `linear-gradient(90deg, #6e468d 0%, #ffffff 100%)`;
}

export function useActorCardSetup(variant) {
  const { t } = useTranslate();
  const customTheme = useCustomTheme();
  const scale = getActorVariantScale(variant);
  const background = getNpcBackground(customTheme);
  return { t, customTheme, scale, background };
}
