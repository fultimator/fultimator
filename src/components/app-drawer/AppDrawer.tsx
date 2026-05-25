import React from "react";
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import {
  GroupAdd as GroupAddIcon,
  Bookmark as BookmarkIcon,
  ChatBubbleOutlineOutlined as ChatBubbleOutlineIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Palette as PaletteIcon,
} from "@mui/icons-material";
import { APP_DRAWER_WIDTH, TAB_RAIL_WIDTH } from "./constants";
import { ChatPanel } from "./panels/chat";
import { CustomizerPanel } from "./panels/CustomizerPanel";
import { SavedThemesPanel } from "./panels/SavedThemesPanel";
import { useAppDrawerStore, type DrawerTab } from "../../store/appDrawerStore";
import { useCombatActorSelectStore } from "../../store/combatActorSelectStore";
import { ActorSelectPanel } from "./panels/ActorSelectPanel";

const BASE_TABS: { id: DrawerTab; label: string; icon: React.ReactNode }[] = [
  {
    id: "chat",
    label: "Chat",
    icon: <ChatBubbleOutlineIcon fontSize="small" />,
  },
  {
    id: "actorSelect",
    label: "Actor Select",
    icon: <GroupAddIcon fontSize="small" />,
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
  onOpen: () => void;
}

export const AppDrawer: React.FC<AppDrawerProps> = ({
  open,
  onClose,
  onOpen,
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const activeTab = useAppDrawerStore((s) => s.activeTab);
  const setActiveTab = useAppDrawerStore((s) => s.setActiveTab);
  const drawerBottomActions = useAppDrawerStore((s) => s.drawerBottomActions);
  const actorSelectEnabled = useCombatActorSelectStore((s) => s.enabled);
  const tabs = BASE_TABS.filter(
    (tab) => tab.id !== "actorSelect" || actorSelectEnabled,
  );

  React.useEffect(() => {
    if (activeTab === "actorSelect" && !actorSelectEnabled) {
      setActiveTab("chat");
    }
  }, [activeTab, actorSelectEnabled, setActiveTab]);

  return (
    <Drawer
      variant={isMobile ? "temporary" : "persistent"}
      anchor="right"
      open={isMobile ? open : true}
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
      sx={(theme) => ({
        ...(isMobile
          ? { width: 0, overflow: "visible", position: "static" }
          : { width: open ? APP_DRAWER_WIDTH : TAB_RAIL_WIDTH, flexShrink: 0 }),
        "& .MuiBackdrop-root": { position: "fixed !important", zIndex: 1200 },
        "& .MuiDrawer-paper": {
          width: isMobile
            ? APP_DRAWER_WIDTH
            : open
              ? APP_DRAWER_WIDTH
              : TAB_RAIL_WIDTH,
          transition: "width 0.25s ease !important",
          boxSizing: "border-box",
          position: "fixed !important",
          ...(isMobile
            ? {
                top: 0,
                height: "100%",
                right: 0,
                bottom: 0,
                zIndex: theme.zIndex.modal,
              }
            : {
                zIndex: theme.zIndex.appBar - 1,
                top: 0,
                height: "100%",
                paddingTop: `${theme.mixins.toolbar.minHeight ?? 56}px`,
                "@media (min-width:600px)": {
                  paddingTop: "64px",
                },
              }),
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
      })}
    >
      <Box sx={{ display: "flex", height: "100%" }}>
        {/* Tab rail */}
        <Box
          sx={{
            width: TAB_RAIL_WIDTH,
            flexShrink: 0,
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
          <Tooltip title={open ? "Collapse" : "Expand"} placement="left">
            <IconButton
              aria-label={open ? "Collapse drawer" : "Expand drawer"}
              onClick={open ? onClose : onOpen}
              size="small"
              sx={{
                width: 30,
                height: 30,
                borderRadius: 1,
                color: "text.secondary",
                "&:hover": { backgroundColor: "action.hover" },
              }}
            >
              {open ? (
                <ChevronRightIcon fontSize="small" />
              ) : (
                <ChevronLeftIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>

          <Divider flexItem />

          {tabs.map(({ id, label, icon }) => (
            <Tooltip key={id} title={label} placement="left">
              <IconButton
                aria-label={label}
                onClick={() => {
                  setActiveTab(id);
                  if (!open) onOpen();
                }}
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

          {drawerBottomActions.length > 0 && (
            <>
              <Box sx={{ flex: 1 }} />
              <Divider flexItem />
              {drawerBottomActions.map(
                ({ id, label, icon, onClick, disabled, color }) => (
                  <Tooltip key={id} title={label} placement="left">
                    <span>
                      <IconButton
                        aria-label={label}
                        onClick={disabled ? undefined : onClick}
                        size="small"
                        disabled={disabled}
                        sx={{
                          width: 30,
                          height: 30,
                          borderRadius: 1,
                          color: disabled
                            ? "text.disabled"
                            : (color ?? "primary.main"),
                          opacity: disabled ? 0.35 : 1,
                          "&:hover": {
                            backgroundColor: disabled
                              ? "transparent"
                              : "action.hover",
                          },
                          "&.Mui-disabled": { color: "text.disabled" },
                        }}
                      >
                        {icon}
                      </IconButton>
                    </span>
                  </Tooltip>
                ),
              )}
            </>
          )}
        </Box>

        {/* Content area */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: isMobile ? "flex" : open ? "flex" : "none",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Box sx={{ flex: 1, overflowY: "auto" }}>
            {activeTab === "chat" && <ChatPanel />}
            {activeTab === "actorSelect" && actorSelectEnabled && (
              <ActorSelectPanel />
            )}
            {activeTab === "customizer" && <CustomizerPanel />}
            {activeTab === "themes" && <SavedThemesPanel />}
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};
