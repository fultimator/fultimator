import React, { useRef, useState } from "react";
import {
  Card,
  Box,
  Tabs,
  Tab,
  InputBase,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { Search, Clear, Lock, LockOpen } from "@mui/icons-material";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import { useTheme } from "@mui/material/styles";
import { useCustomTheme } from "/src/hooks/useCustomTheme";
import { useTranslate } from "/src/translation/translate";
import PcCompactHeader from "/src/components/shared/actors/pc/variants/compact/PcCompactHeader";
import PcCompactResources from "/src/components/shared/actors/pc/variants/compact/panels/PcCompactResources";
import PcCompactStats from "/src/components/shared/actors/pc/variants/compact/panels/PcCompactStats";
import PcCompactAffinities from "/src/components/shared/actors/pc/variants/compact/panels/PcCompactAffinities";

import PcCompactCompanion from "/src/components/shared/actors/pc/variants/compact/panels/PcCompactCompanion";
import BackpackTab from "/src/components/shared/actors/pc/variants/compact/tabs/BackpackTab";
import NoteTab from "/src/components/shared/actors/pc/variants/compact/tabs/NoteTab";
import ClassTab from "/src/components/shared/actors/pc/variants/compact/tabs/ClassTab";
import FeatureTab from "/src/components/shared/actors/pc/variants/compact/tabs/FeatureTab";
import MainTab from "/src/components/shared/actors/pc/variants/compact/tabs/MainTab";

function TabPanel({ value, index, children }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
    </div>
  );
}

export default function PcActorCardCompact({
  pc,
  id,
  isInteractive = false,
  isOwner = false,
  onUpdate,
  onQuickCheck,
  characterImage,
  canLevelUpFromExp = false,
  onLevelUpRequest,
  updateMaxStats,
  optionalRules = {},
  clockSections,
  setClockSections,
  clockState,
  setClockState,
  isExpanded = false,
  onToggleEditMode,
  onAddClass: _onAddClass,
  onAddFeature: _onAddFeature,
}) {
  const { t } = useTranslate();
  const theme = useTheme();
  const custom = useCustomTheme();
  const [tab, setTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const tabsWrapRef = useRef(null);
  const tabDragRef = useRef({
    pointerId: null,
    startX: 0,
    scrollLeft: 0,
    dragging: false,
    suppressClick: false,
  });

  const player = pc;
  const setPlayer = onUpdate;
  const _isEditMode = isInteractive;
  // Owner always has edit access to core data tabs regardless of preview toggle.
  const ownerEditMode = isOwner || isInteractive;
  const expandAllSections = pc?.settings?.expandAllSections ?? true;

  const sharedProps = { pc, isInteractive, onUpdate, onQuickCheck };

  const tabStyle = {
    borderRadius: 0,
    flex: 1,
    padding: 0,
    mt: 0.5,
    minHeight: "24px",
    height: "24px",
    color: "#ffffff",
    bgcolor: custom.mode === "dark" ? custom.ternary : custom.primary,
    border: `2px solid ${custom.mode === "dark" ? custom.ternary : custom.primary}`,
    "&:hover": {
      bgcolor: custom.mode === "dark" ? custom.ternary : custom.primary,
      color: custom.white,
    },
    "&.Mui-selected": {
      bgcolor: custom.mode === "dark" ? custom.ternary : custom.primary,
      color: "#fff",
      textShadow: "none",
      boxShadow: "none",
    },
  };

  const homeTabStyle = {
    ...tabStyle,
    flex: 0,
    minWidth: "56px !important",
    padding: "0 8px !important",
  };

  const getTabsScroller = () => {
    const root = tabsWrapRef.current;
    const tabList = root?.querySelector('[role="tablist"]');
    return root?.querySelector(".MuiTabs-scroller") ?? tabList?.parentElement;
  };

  const handleTabsWheel = (event) => {
    const scroller = getTabsScroller();
    if (!scroller) return;

    const delta =
      Math.abs(event.deltaX) > Math.abs(event.deltaY)
        ? event.deltaX
        : event.deltaY;
    if (!delta) return;

    event.preventDefault();
    event.stopPropagation();
    scroller.scrollLeft += delta;
  };

  const handleTabsPointerDown = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    const scroller = getTabsScroller();
    if (!scroller) return;

    tabDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      scrollLeft: scroller.scrollLeft,
      dragging: false,
      suppressClick: false,
    };
  };

  const handleTabsPointerMove = (event) => {
    const drag = tabDragRef.current;
    if (drag.pointerId !== event.pointerId) return;

    const scroller = getTabsScroller();
    if (!scroller) return;

    const distance = event.clientX - drag.startX;
    if (Math.abs(distance) < 4 && !drag.dragging) return;

    if (!drag.dragging) {
      tabsWrapRef.current?.setPointerCapture?.(event.pointerId);
    }
    drag.dragging = true;
    event.preventDefault();
    event.stopPropagation();
    scroller.scrollLeft = drag.scrollLeft - distance;
  };

  const handleTabsPointerEnd = (event) => {
    const drag = tabDragRef.current;
    if (drag.pointerId !== event.pointerId) return;

    if (drag.dragging) {
      tabsWrapRef.current?.releasePointerCapture?.(event.pointerId);
    }
    drag.pointerId = null;
    drag.suppressClick = drag.dragging;
    drag.dragging = false;

    if (drag.suppressClick) {
      window.setTimeout(() => {
        tabDragRef.current.suppressClick = false;
      }, 0);
    }
  };

  return (
    <Card id={id} sx={{ maxWidth: "566px", width: "100%", mx: "auto" }}>
      <PcCompactHeader
        {...sharedProps}
        characterImage={characterImage}
        canLevelUpFromExp={canLevelUpFromExp}
        onLevelUpRequest={onLevelUpRequest}
        updateMaxStats={updateMaxStats}
      />

      <PcCompactResources {...sharedProps} />
      <PcCompactStats {...sharedProps} updateMaxStats={updateMaxStats} />
      <PcCompactAffinities {...sharedProps} />
      <Box sx={{ p: 0, borderBottom: 1, borderColor: "divider" }}>
        <Box
          ref={tabsWrapRef}
          onWheel={handleTabsWheel}
          onPointerDown={handleTabsPointerDown}
          onPointerMove={handleTabsPointerMove}
          onPointerUp={handleTabsPointerEnd}
          onPointerCancel={handleTabsPointerEnd}
          sx={{
            touchAction: "pan-x",
            overscrollBehavior: "contain",
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, v) => {
              if (tabDragRef.current.suppressClick) return;
              setTab(v);
            }}
            aria-label="character sheet tabs"
            variant="scrollable"
            scrollButtons={false}
            allowScrollButtonsMobile={false}
            sx={{
              minHeight: "30px",
              height: "30px",
              "& .MuiTabs-indicator": {
                bgcolor: custom.quaternary,
                height: 3,
                borderRadius: "2px 2px 0 0",
                boxShadow: "none",
              },
              "@media (max-width:600px)": {
                minHeight: "30px",
                height: "30px",
              },
            }}
          >
            <Tab
              icon={<HomeOutlinedIcon sx={{ fontSize: "1rem" }} />}
              sx={homeTabStyle}
            />
            <Tab label={t("Classes")} sx={tabStyle} />
            <Tab label={t("Features")} sx={tabStyle} />
            <Tab label={t("Backpack")} sx={tabStyle} />
            <Tab label={t("Notes")} sx={tabStyle} />
          </Tabs>
        </Box>

        <Box
          sx={{
            px: 0.5,
            display: "flex",
            alignItems: "center",
            border: "1px solid #ccc",
            borderRadius: 0,
          }}
        >
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Search..."
            inputProps={{ "aria-label": "Search" }}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <IconButton
            type="button"
            sx={{ p: "0" }}
            aria-label={searchQuery ? "clear" : "search"}
            onClick={() => searchQuery && setSearchQuery("")}
          >
            {searchQuery ? <Clear /> : <Search />}
          </IconButton>
          {onToggleEditMode && (
            <Tooltip
              title={
                isInteractive
                  ? t("Switch to Preview Mode")
                  : t("Switch to Edit Mode")
              }
            >
              <IconButton
                size="small"
                sx={{ p: "0" }}
                onClick={onToggleEditMode}
              >
                {isInteractive ? (
                  <LockOpen fontSize="small" />
                ) : (
                  <Lock fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <TabPanel value={tab} index={0}>
          <MainTab
            player={player}
            setPlayer={setPlayer}
            isEditMode={ownerEditMode}
            searchQuery={searchQuery}
          />
        </TabPanel>
        <TabPanel value={tab} index={1}>
          <ClassTab
            player={player}
            setPlayer={setPlayer}
            isEditMode={ownerEditMode}
            searchQuery={searchQuery}
            defaultExpandAll={expandAllSections}
          />
        </TabPanel>
        <TabPanel value={tab} index={2}>
          <FeatureTab
            player={player}
            setPlayer={setPlayer}
            isEditMode={ownerEditMode}
            searchQuery={searchQuery}
            optionalRules={optionalRules}
            clockSections={clockSections}
            setClockSections={setClockSections}
            clockState={clockState}
            setClockState={setClockState}
          />
        </TabPanel>
        <TabPanel value={tab} index={3}>
          <BackpackTab
            player={player}
            setPlayer={setPlayer}
            isEditMode={ownerEditMode}
            isMainTab={false}
            searchQuery={searchQuery}
          />
          <PcCompactCompanion player={player} searchQuery={searchQuery} />
        </TabPanel>
        <TabPanel value={tab} index={4}>
          <NoteTab
            player={player}
            setPlayer={setPlayer}
            isEditMode={ownerEditMode}
            searchQuery={searchQuery}
            defaultExpanded={!ownerEditMode}
            speaker={pc?.name ?? ""}
          />
        </TabPanel>
      </Box>

      {isExpanded && (
        <Box
          sx={{
            borderTop: `1px solid ${theme.palette.divider}`,
            p: { xs: 0.5, sm: 1, md: 1.25 },
            display: "flex",
            flexDirection: "column",
            gap: { xs: 0.75, sm: 1 },
          }}
        >
          <Box
            sx={{
              border: `0.5px solid ${theme.palette.divider}`,
              borderRadius: "6px",
              overflow: "hidden",
            }}
          >
            <Box sx={{ background: custom.primary, px: 1, py: "2px" }}>
              <Typography
                sx={{
                  color: custom.white,
                  fontFamily: "Antonio",
                  fontSize: { xs: "0.85rem", sm: "1rem", md: "1.08rem" },
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {t("Description")}
              </Typography>
            </Box>
            <Box
              sx={{
                px: 1,
                py: { xs: "6px", sm: "8px" },
                maxHeight: "200px",
                overflow: "hidden",
                position: "relative",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "40px",
                  background: `linear-gradient(transparent, ${theme.palette.background.paper})`,
                  pointerEvents: "none",
                },
              }}
            >
              <Typography
                sx={{
                  fontFamily: ["PT Sans Narrow", "sans-serif"].join(","),
                  fontSize: { xs: "0.82rem", sm: "0.92rem", md: "0.98rem" },
                  lineHeight: 1.45,
                  whiteSpace: "pre-line",
                  color: pc?.info?.description?.trim()
                    ? "text.primary"
                    : "text.secondary",
                  fontStyle: pc?.info?.description?.trim()
                    ? "normal"
                    : "italic",
                }}
              >
                {pc?.info?.description?.trim() || t("No description")}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Card>
  );
}
