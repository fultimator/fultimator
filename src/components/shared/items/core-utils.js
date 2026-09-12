import { useMemo, useState } from "react";
import { useTranslate } from "/src/translation/translate";
import { useCustomTheme } from "/src/hooks/useCustomTheme";

export const DEFAULT_IMAGE_TEMP_INFO_KEY = "equipment_image_temporary_notice";
const DEFAULT_IMAGE_TEMP_INFO_FALLBACK =
  "Images are temporary and are not saved.";
export const HEADER_MIN_HEIGHT = "36px";
export const IMAGE_COL_MIN_HEIGHT = "72px";

export const CARD_DEFAULTS = {
  id: undefined,
  onHeaderClick: undefined,
  showHeader: true,
  showCard: true,
  variant: "compendium",
  imageMode: "none",
  imageSize: 72,
  imageSlot: undefined,
  showImageToggle: false,
  showImage: undefined,
  onShowImageChange: undefined,
  showImageTempInfo: true,
  imageTempInfoTextKey: DEFAULT_IMAGE_TEMP_INFO_KEY,
  actionContent: null,
  defaultImageVisible: false,
};

export function getBackground(customTheme) {
  return customTheme.mode === "dark"
    ? `linear-gradient(90deg, ${customTheme.ternary}, rgba(24, 26, 27, 0) 100%)`
    : `linear-gradient(90deg, ${customTheme.ternary} 0%, #ffffff 100%)`;
}

export function getImageBackground(customTheme) {
  return customTheme.mode === "dark" ? "#181a1b" : "white";
}

export function isImageMode(imageMode) {
  return imageMode === "slot";
}

export function getVariantScale(variant) {
  if (variant === "interactive")
    return { header: "0.88rem", body: "0.84rem", headingRow: "0.84rem" };
  if (variant === "print")
    return { header: "1.1rem", body: "0.98rem", headingRow: "1rem" };
  return { header: "0.95rem", body: "0.9rem", headingRow: "0.9rem" };
}

function resolveHeaderMinHeight(scale) {
  const headerSize = Number.parseFloat(scale?.header ?? "0.95");
  if (headerSize >= 1.05) return "44px";
  if (headerSize <= 0.89) return "34px";
  return HEADER_MIN_HEIGHT;
}

function resolveHeaderWeight(scale) {
  const headerSize = Number.parseFloat(scale?.header ?? "0.95");
  return headerSize >= 1.05 ? 700 : 600;
}

export function resolveImageTempInfoText(t, key) {
  const k = key || DEFAULT_IMAGE_TEMP_INFO_KEY;
  const translated = t(k);
  return translated === k ? DEFAULT_IMAGE_TEMP_INFO_FALLBACK : translated;
}

export function useImageVisibility(
  showImage,
  onShowImageChange,
  defaultImageVisible,
) {
  const [internalImageVisible, setInternalImageVisible] = useState(
    Boolean(defaultImageVisible),
  );
  const isControlled = typeof showImage === "boolean";
  const imageVisible = isControlled ? showImage : internalImageVisible;
  const setImageVisible = (next) => {
    if (!isControlled) setInternalImageVisible(next);
    if (onShowImageChange) onShowImageChange(next);
  };
  return { imageVisible, setImageVisible };
}

export function headerBoxSx(
  customTheme,
  scale,
  onHeaderClick,
  imageSpacerWidth = 0,
) {
  return {
    pl: imageSpacerWidth ? `${imageSpacerWidth + 16}px` : 2,
    pr: 2,
    py: 0.5,
    minHeight: resolveHeaderMinHeight(scale),
    background: customTheme.primary,
    color: "#ffffff",
    cursor: onHeaderClick ? "pointer" : "default",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 1,
    "& .MuiTypography-root": {
      color: "inherit",
      textTransform: "uppercase",
      fontWeight: resolveHeaderWeight(scale),
      fontSize: scale.header,
      fontFamily: "Antonio",
      letterSpacing: "0.5px",
      lineHeight: 1.4,
    },
  };
}

export function headerGridSx(customTheme, scale, onHeaderClick, imageMode) {
  return {
    alignItems: "center",
    minHeight: resolveHeaderMinHeight(scale),
    px: 2,
    py: isImageMode(imageMode) ? 0 : 0.5,
    background: customTheme.primary,
    color: "#ffffff",
    cursor: onHeaderClick ? "pointer" : "default",
    "& .MuiTypography-root": {
      color: "inherit",
      textTransform: "uppercase",
      fontWeight: resolveHeaderWeight(scale),
      fontSize: scale.header,
      fontFamily: "Antonio",
      letterSpacing: "0.5px",
      lineHeight: 1.4,
    },
  };
}

export function nameRowSx(customTheme) {
  return {
    background: `linear-gradient(90deg, ${customTheme.ternary} 0%, transparent 100%)`,
    borderBottom: `1px solid ${customTheme.secondary}`,
    px: 2,
    py: "6px",
  };
}

export function bodyBoxSx() {
  return { px: 2, py: 0.75, fontSize: "0.875rem" };
}

export function useCardSetup({
  variant,
  showImage,
  onShowImageChange,
  defaultImageVisible,
  imageTempInfoTextKey,
}) {
  const { t } = useTranslate();
  const customTheme = useCustomTheme();
  const scale = getVariantScale(variant);
  const background = getBackground(customTheme);
  const { imageVisible, setImageVisible } = useImageVisibility(
    showImage,
    onShowImageChange,
    defaultImageVisible,
  );
  const imageTempInfoText = useMemo(
    () => resolveImageTempInfoText(t, imageTempInfoTextKey),
    [t, imageTempInfoTextKey],
  );
  return {
    t,
    customTheme,
    scale,
    background,
    imageVisible,
    setImageVisible,
    imageTempInfoText,
  };
}
