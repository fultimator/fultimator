import React, { useState } from "react";
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import {
  GroupAdd as GroupAddIcon,
  Bookmark as BookmarkIcon,
  ChatBubbleOutlineOutlined as ChatBubbleOutlineIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Palette as PaletteIcon,
  TagOutlined as ChannelIcon,
  FilterList as FilterListIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
} from "@mui/icons-material";
import { APP_DRAWER_WIDTH, TAB_RAIL_WIDTH } from "./constants";
import { ChatPanel } from "./panels/chat";
import { CustomizerPanel } from "./panels/CustomizerPanel";
import { SavedThemesPanel } from "./panels/SavedThemesPanel";
import { useAppDrawerStore, type DrawerTab } from "../../store/appDrawerStore";
import { useCombatActorSelectStore } from "../../store/combatActorSelectStore";
import { ActorSelectPanel } from "./panels/ActorSelectPanel";
import {
  useChatChannelStore,
  type ChatVisibleKind,
} from "../../stores/chatChannelStore";
import { useEncounterChatStore } from "../../stores/encounterChatStore";

const FILTER_OPTIONS: { kind: ChatVisibleKind; label: string }[] = [
  { kind: "logs", label: "Combat Logs" },
  { kind: "checks", label: "Checks" },
  { kind: "chat", label: "Chat" },
];

const ChatPanelHeader: React.FC = () => {
  const [channelAnchor, setChannelAnchor] = useState<null | HTMLElement>(null);
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null);

  const activeChannelId = useChatChannelStore((s) => s.activeChannelId);
  const encounterChannelLabel = useChatChannelStore(
    (s) => s.encounterChannelLabel,
  );
  const setActiveChannel = useChatChannelStore((s) => s.setActiveChannel);
  const visibleKinds = useChatChannelStore((s) => s.visibleKinds);
  const toggleVisibleKind = useChatChannelStore((s) => s.toggleVisibleKind);
  const encounterChatId = useEncounterChatStore((s) => s.encounterId);

  const isEncounter = activeChannelId.startsWith("encounter:");
  const channelLabel = isEncounter
    ? (encounterChannelLabel ?? "Encounter")
    : "All";
  const hasEncounter = Boolean(encounterChannelLabel && encounterChatId);
  const isFiltered = visibleKinds.length < FILTER_OPTIONS.length;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        px: 1,
        py: 1,
        borderBottom: "1px solid",
        borderColor: "divider",
        gap: 0.5,
      }}
    >
      {hasEncounter ? (
        <>
          <Tooltip
            title={
              isEncounter ? `Channel: ${encounterChannelLabel}` : "Channel: All"
            }
          >
            <IconButton
              size="small"
              onClick={(e) => setChannelAnchor(e.currentTarget)}
              sx={(theme) => ({
                borderRadius: 1,
                height: 30,
                minWidth: 0,
                padding: 0,
                px: 0.75,
                gap: 0.25,
                fontSize: "0.7rem",
                fontWeight: 700,
                color: isEncounter ? "text.primary" : "text.secondary",
                border: `1px solid ${isEncounter ? theme.palette.text.primary : theme.palette.divider}`,
                "&:hover": { backgroundColor: "action.hover" },
              })}
            >
              <ChannelIcon sx={{ fontSize: 14 }} />
              <Box
                component="span"
                sx={{ fontSize: "0.7rem", fontWeight: 700, lineHeight: 1 }}
              >
                {channelLabel}
              </Box>
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={channelAnchor}
            open={Boolean(channelAnchor)}
            onClose={() => setChannelAnchor(null)}
          >
            <MenuItem
              selected={!isEncounter}
              onClick={() => {
                setActiveChannel("global");
                setChannelAnchor(null);
              }}
            >
              All Channels
            </MenuItem>
            <MenuItem
              selected={isEncounter}
              onClick={() => {
                setActiveChannel(`encounter:${encounterChatId}`);
                setChannelAnchor(null);
              }}
            >
              {encounterChannelLabel}
            </MenuItem>
          </Menu>
        </>
      ) : (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ px: 0.5, fontWeight: 600 }}
        >
          Chat
        </Typography>
      )}

      <Box sx={{ flex: 1 }} />

      <Tooltip title="Filter messages">
        <IconButton
          size="small"
          onClick={(e) => setFilterAnchor(e.currentTarget)}
          sx={(theme) => ({
            borderRadius: 1,
            width: 30,
            height: 30,
            color: isFiltered ? "primary.main" : "text.secondary",
            border: `1px solid ${isFiltered ? theme.palette.primary.main : theme.palette.divider}`,
          })}
        >
          <FilterListIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={filterAnchor}
        open={Boolean(filterAnchor)}
        onClose={() => setFilterAnchor(null)}
      >
        {FILTER_OPTIONS.map(({ kind, label }) => (
          <MenuItem key={kind} onClick={() => toggleVisibleKind(kind)} dense>
            <ListItemIcon sx={{ minWidth: 32 }}>
              {visibleKinds.includes(kind) ? (
                <CheckBoxIcon fontSize="small" color="primary" />
              ) : (
                <CheckBoxOutlineBlankIcon fontSize="small" />
              )}
            </ListItemIcon>
            <ListItemText primary={label} />
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

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
          {activeTab === "chat" && <ChatPanelHeader />}
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
