import { useScrollTrigger, useMediaQuery } from "@mui/material";

const HOTBAR_HEIGHT = 56 + 8; // hotbar + gap

export function useStickyTop(): number {
  const scrolled = useScrollTrigger();
  const isMobileBreakpoint = useMediaQuery("(max-width:599px)");
  const isDesktop = useMediaQuery("(min-width:769px)");
  // AppBar only hides on scroll when mobile (<=768px); desktop AppBar is always visible
  const appBarHidden = isDesktop ? false : scrolled;
  const appBarHeight = appBarHidden ? 0 : isMobileBreakpoint ? 56 : 64;
  return appBarHeight + 8 + HOTBAR_HEIGHT;
}
