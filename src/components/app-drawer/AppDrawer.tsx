import React, { useState } from "react";
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import {
  Bookmark as BookmarkIcon,
  ChatBubbleOutlineOutlined as ChatBubbleOutlineIcon,
  ChevronRight as ChevronRightIcon,
  Palette as PaletteIcon,
} from "@mui/icons-material";
import { APP_DRAWER_WIDTH } from "./constants";
import { NotesPanel } from "./panels/NotesPanel";
import { CustomizerPanel } from "./panels/CustomizerPanel";
import { SavedThemesPanel } from "./panels/SavedThemesPanel";

const TAB_RAIL_WIDTH = 44;

type DrawerTab = "notes" | "customizer" | "themes";

const TAB_TITLE: Record<DrawerTab, string> = {
  notes: "Chat",
  customizer: "Customizer",
  themes: "Saved Themes",
};

const TABS: { id: DrawerTab; label: string; icon: React.ReactNode }[] = [
  {
    id: "notes",
    label: "Chat",
    icon: <ChatBubbleOutlineIcon fontSize="small" />,
  },
  {
    id: "customizer",
    label: "Customizer",
    icon: <PaletteIcon fontSize="small" />,
  },
  {
    id: "themes",
    label: "Saved Themes",
    icon: <BookmarkIcon fontSize="small" />,
  },
];

interface AppDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const AppDrawer: React.FC<AppDrawerProps> = ({ open, onClose }) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [activeTab, setActiveTab] = useState<DrawerTab>("customizer");

  return (
    <Drawer
      variant={isMobile ? "temporary" : "persistent"}
      anchor="right"
      open={open}
      onClose={onClose}
      ModalProps={
        isMobile
          ? {
              keepMounted: false,
              disableEnforceFocus: true,
              disableScrollLock: true,
              slotProps: {
                backdrop: { sx: { backgroundColor: "rgba(0, 0, 0, 0.5)" } },
              },
            }
          : undefined
      }
      sx={{
        ...(isMobile
          ? { width: 0, overflow: "visible", position: "static" }
          : { width: APP_DRAWER_WIDTH, flexShrink: 0 }),
        "& .MuiBackdrop-root": { position: "fixed !important", zIndex: 1200 },
        "& .MuiDrawer-paper": {
          width: APP_DRAWER_WIDTH,
          boxSizing: "border-box",
          position: "fixed !important",
          ...(isMobile
            ? { marginTop: 0, height: "100%", right: 0, top: 0, bottom: 0 }
            : { marginTop: "64px", height: "calc(100% - 64px)" }),
          overflow: "hidden",
          backgroundColor: "background.paper",
          color: "text.primary",
          "& .MuiAccordion-root": {
            backgroundImage: "none !important",
            backgroundColor: "background.paper",
          },
          "& .MuiAccordionSummary-root": {
            backgroundImage: "none !important",
            backgroundColor: "background.paper",
          },
          "& .MuiAccordionDetails-root": {
            backgroundImage: "none !important",
            backgroundColor: "background.paper",
          },
        },
      }}
    >
      <Box sx={{ display: "flex", height: "100%" }}>
        {/* Tab rail */}
        <Box
          sx={{
            width: TAB_RAIL_WIDTH,
            borderRight: 1,
            borderColor: "divider",
            backgroundColor: "action.hover",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            py: 1,
            gap: 1,
          }}
        >
          {TABS.map(({ id, label, icon }) => (
            <Tooltip key={id} title={label} placement="right">
              <IconButton
                aria-label={label}
                onClick={() => setActiveTab(id)}
                size="small"
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: 1,
                  color: activeTab === id ? "primary.main" : "text.secondary",
                  backgroundColor:
                    activeTab === id ? "action.selected" : "transparent",
                  "&:hover": { backgroundColor: "action.hover" },
                }}
              >
                {icon}
              </IconButton>
            </Tooltip>
          ))}
        </Box>

        {/* Content area */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              p: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {TAB_TITLE[activeTab]}
            </Typography>
            <IconButton onClick={onClose} size="small" sx={{ ml: 1 }}>
              <ChevronRightIcon />
            </IconButton>
          </Box>

          <Divider />

          <Box sx={{ flex: 1, overflowY: "auto" }}>
            {activeTab === "notes" && <NotesPanel />}
            {activeTab === "customizer" && <CustomizerPanel />}
            {activeTab === "themes" && <SavedThemesPanel />}
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};
