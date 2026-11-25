import { useMediaQuery } from "@mui/material";
import { useThemeStore } from "../store/themeStore";
import {
  APP_DRAWER_WIDTH,
  TAB_RAIL_WIDTH,
} from "../components/app-drawer/constants";

const PAGE_GUTTER = 24;
const CONTENT_WIDTH = 1152;

export function useDockedBarInset() {
  const drawerOpen = useThemeStore((state) => state.drawerOpen);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const inset = isMobile ? 0 : drawerOpen ? APP_DRAWER_WIDTH : TAB_RAIL_WIDTH;

  return {
    mr: { md: `${-(PAGE_GUTTER + inset)}px` },
    pr: {
      md: `clamp(0px, calc(${CONTENT_WIDTH}px + ${2 * inset}px - 100vw), ${inset}px)`,
    },
  };
}
