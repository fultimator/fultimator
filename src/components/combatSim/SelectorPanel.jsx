import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Drawer,
  Button,
  Tabs,
  Tab,
  Tooltip,
} from "@mui/material";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import { t } from "../../translation/translate";
import { useTheme } from "@mui/material/styles";
import NpcSelector from "./NpcSelector";
import PcSelector from "./PcSelector";

export default function SelectorPanel({
  isMobile,
  npcList = [],
  handleSelectNPC,
  playerList = [],
  handleSelectPC,
  npcDrawerOpen,
  setNpcDrawerOpen,
  loadingNpcs,
  loadingPlayers,
}) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectorTab, setSelectorTab] = useState(0);

  if (isMobile) {
    return (
      <>
        <Button
          variant="contained"
          size="small"
          onClick={() => setNpcDrawerOpen(true)}
        >
          {selectorTab === 0 ? t("combat_sim_select_npcs") : t("Select PCs")}
        </Button>
        <Drawer
          anchor="left"
          open={npcDrawerOpen}
          onClose={() => setNpcDrawerOpen(false)}
        >
          <Box sx={{ width: 280, padding: 2 }}>
            <Tabs
              value={selectorTab}
              onChange={(_, v) => setSelectorTab(v)}
              sx={{ mb: 2 }}
              variant="fullWidth"
            >
              <Tab label="NPCs" />
              <Tab label="PCs" />
            </Tabs>
            {selectorTab === 0 ? (
              <NpcSelector
                contentOnly
                npcList={npcList}
                handleSelectNPC={handleSelectNPC}
                loading={loadingNpcs}
              />
            ) : (
              <PcSelector
                playerList={playerList}
                handleSelectPC={handleSelectPC}
                loading={loadingPlayers}
              />
            )}
          </Box>
        </Drawer>
      </>
    );
  }

  // Desktop
  return (
    <Box
      sx={{
        width: isExpanded ? "20%" : "60px",
        bgcolor: isDarkMode ? "#333333" : "#ffffff",
        padding: 2,
        height: "100%",
        borderRadius: "8px",
        transition: "width 0.3s ease-in-out",
      }}
    >
      {isExpanded && (
        <>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #ccc",
              marginBottom: 1,
              paddingBottom: 1,
            }}
          >
            <Typography variant="h5">
              {selectorTab === 0 ? t("combat_sim_npc_selector") : t("PC Selector")}
            </Typography>
            <Tooltip
              title={t("Collapse")}
              placement="left"
              enterDelay={500}
              enterNextDelay={300}
            >
              <IconButton onClick={() => setIsExpanded(false)} sx={{ padding: 0 }}>
                <KeyboardArrowLeft />
              </IconButton>
            </Tooltip>
          </Box>

          <Tabs
            value={selectorTab}
            onChange={(_, v) => setSelectorTab(v)}
            variant="fullWidth"
            sx={{ mb: 1, minHeight: 36 }}
          >
            <Tab label="NPCs" sx={{ minHeight: 36, py: 0.5 }} />
            <Tab label="PCs" sx={{ minHeight: 36, py: 0.5 }} />
          </Tabs>

          {selectorTab === 0 ? (
            <NpcSelector
              contentOnly
              npcList={npcList}
              handleSelectNPC={handleSelectNPC}
              loading={loadingNpcs}
            />
          ) : (
            <PcSelector
              playerList={playerList}
              handleSelectPC={handleSelectPC}
              loading={loadingPlayers}
            />
          )}
        </>
      )}

      {!isExpanded && (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Tooltip
            title={t("Expand")}
            placement="bottom"
            enterDelay={500}
            enterNextDelay={300}
          >
            <IconButton onClick={() => setIsExpanded(true)} sx={{ padding: 0 }}>
              <KeyboardArrowRight />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Box>
  );
}
