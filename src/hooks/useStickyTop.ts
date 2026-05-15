import { useScrollTrigger, useMediaQuery } from "@mui/material";

const HOTBAR_HEIGHT = 56 + 8; // hotbar + gap

export function useStickyTop(): number {
  const appBarHidden = useScrollTrigger();
  const isMobile = useMediaQuery("(max-width:599px)");
  const appBarHeight = appBarHidden ? 0 : isMobile ? 56 : 64;
  return appBarHeight + 8 + HOTBAR_HEIGHT;
}
