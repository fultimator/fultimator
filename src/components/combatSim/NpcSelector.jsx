import React, { useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Divider,
  IconButton,
  Drawer,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material"; // Import Material-UI icons
import {
  GiRaiseZombie,
  GiWolfHead,
  GiRobotGolem,
  GiEvilBat,
  GiFire,
  GiSwordwoman,
  GiGooeyDaemon,
  GiRose,
} from "react-icons/gi";
import { t } from "../../translation/translate";
import { useTheme } from "@mui/material/styles";

function rankText(rank) {
  const rankMap = {
    soldier: "Soldier",
    elite: "Elite",
    companion: "Companion",
    groupveichle: "Group Vehicle",
    champion1: "Champion (1)",
    champion2: "Champion (2)",
    champion3: "Champion (3)",
    champion4: "Champion (4)",
    champion5: "Champion (5)",
    champion6: "Champion (6)",
  };

  return rankMap[rank] || "";
}

export default function NpcSelector({
  isMobile,
  npcList = [], // Default to an empty array if npcList is not passed
  handleSelectNPC,
  npcDrawerOpen,
  setNpcDrawerOpen,
  loading,
}) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const [filterText, setFilterText] = useState("");
  const [filterField, setFilterField] = useState("name");
  const [isExpanded, setIsExpanded] = useState(true);

  // Filtered NPC list based on selected filter field and text
  const filteredNpcList = npcList.filter((npc) => {
    if (filterText === "") return true;

    let value = "";
    if (filterField === "tags") {
      // Translate each tag before filtering
      value = (npc.tags || [])
        .map((tag) => tag.name)
        .join(", ")
        .toLowerCase();
    } else if (filterField === "rank") {
      // Get the readable rank text and translate it
      value = t(rankText(npc.rank));
    } else {
      value = npc[filterField] ? t(npc[filterField].toString()) : "";
    }

    return value.toLowerCase().includes(filterText.toLowerCase());
  });

  return isMobile ? (
    <>
      <Button
        variant="contained"
        size="small"
        onClick={() => setNpcDrawerOpen(true)}
      >
        {t("combat_sim_select_npcs")}
      </Button>
      <Drawer
        anchor="left"
        open={npcDrawerOpen}
        onClose={() => setNpcDrawerOpen(false)}
      >
        <Box sx={{ width: 250, padding: 2 }}>
          <Typography variant="h5" sx={{ marginBottom: 1 }}>
            {t("combat_sim_npc_selector")}
          </Typography>

          {/* Filter Controls */}
          <Box sx={{ marginBottom: 1 }}>
            <TextField
              label={t("combat_sim_search")}
              variant="outlined"
              fullWidth
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              sx={{ marginBottom: 2 }}
              size="small"
              inputProps={{ maxLength: 100 }}
            />
            <FormControl fullWidth>
              <InputLabel>{t("combat_sim_filter_by")}</InputLabel>
              <Select
                value={filterField}
                onChange={(e) => setFilterField(e.target.value)}
                label={t("combat_sim_filter_by")}
                size="small"
              >
                <MenuItem value="name">{t("Name")}</MenuItem>
                <MenuItem value="lvl">{t("Level")}</MenuItem>
                <MenuItem value="species">{t("Species")}</MenuItem>
                <MenuItem value="rank">{t("Rank")}</MenuItem>
                <MenuItem value="tags">{t("Personal Tags")}</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ maxHeight: "calc(100vh - 170px)", overflowY: "auto" }}>
            {loading && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
                <CircularProgress />
              </Box>
            )}
            {filteredNpcList.length > 0 ? (
              filteredNpcList.map((npc) => (
                <React.Fragment key={npc.id}>
                  <Button
                    sx={{
                      display: "flex",
                      justifyContent: "flex-start",
                      width: "100%",
                      padding: "10px",
                      textAlign: "left",
                      textTransform: "none", // Prevent text from being automatically converted to uppercase
                      "&:hover": {
                        bgcolor: "rgba(0, 0, 0, 0.08)",
                      },
                    }}
                    onClick={() => handleSelectNPC(npc.id)}
                  >
                    {/* Displaying NPC Icon based on species */}
                    {npc.species === "Beast" && (
                      <GiWolfHead
                        style={{
                          marginRight: 10,
                          color: isDarkMode ? "white" : "black",
                        }}
                      />
                    )}
                    {npc.species === "Construct" && (
                      <GiRobotGolem
                        style={{
                          marginRight: 10,
                          color: isDarkMode ? "white" : "black",
                        }}
                      />
                    )}
                    {npc.species === "Demon" && (
                      <GiEvilBat
                        style={{
                          marginRight: 10,
                          color: isDarkMode ? "white" : "black",
                        }}
                      />
                    )}
                    {npc.species === "Elemental" && (
                      <GiFire
                        style={{
                          marginRight: 10,
                          color: isDarkMode ? "white" : "black",
                        }}
                      />
                    )}
                    {npc.species === "Humanoid" && (
                      <GiSwordwoman
                        style={{
                          marginRight: 10,
                          color: isDarkMode ? "white" : "black",
                        }}
                      />
                    )}
                    {npc.species === "Undead" && (
                      <GiRaiseZombie
                        style={{
                          marginRight: 10,
                          color: isDarkMode ? "white" : "black",
                        }}
                      />
                    )}
                    {npc.species === "Plant" && (
                      <GiRose
                        style={{
                          marginRight: 10,
                          color: isDarkMode ? "white" : "black",
                        }}
                      />
                    )}
                    {npc.species === "Monster" && (
                      <GiGooeyDaemon
                        style={{
                          marginRight: 10,
                          color: isDarkMode ? "white" : "black",
                        }}
                      />
                    )}

                    <Box>
                      <Typography variant="body1" fontWeight="bold">
                        {npc.name} {/* Displaying the original NPC name */}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ display: "flex", alignItems: "center" }}
                      >
                        {t("Level")}: {npc.lvl}{" "}
                        {npc.rank && " | " + t(rankText(npc.rank))}
                      </Typography>
                    </Box>
                  </Button>
                  <Divider />
                </React.Fragment>
              ))
            ) : (
              <Typography
                variant="body2"
                sx={{ padding: 2, color: "text.secondary" }}
              >
                {t("combat_sim_no_npc_found")}.
              </Typography>
            )}
          </Box>
        </Box>
      </Drawer>
    </>
  ) : (
    <Box
      sx={{
        width: isExpanded ? "20%" : "60px", // Collapsed view
        bgcolor: isDarkMode ? "#333333" : "#ffffff",
        padding: 2,
        height: "100%",
        borderRadius: "8px",
        transition: "width 0.3s ease-in-out", // Smooth transition
      }}
    >
      {isExpanded && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between", // Ensure title and button are on opposite ends
            alignItems: "center",
            borderBottom: "1px solid #ccc",
            marginBottom: 2,
            paddingBottom: 1,
          }}
        >
          <Typography variant="h5">{t("combat_sim_npc_selector")}</Typography>
          <Tooltip
            title={t("Collapse")}
            placement="left"
            enterDelay={500}
            enterNextDelay={300}
          >
            <IconButton
              onClick={() => setIsExpanded(!isExpanded)}
              sx={{ padding: 0 }}
            >
              <KeyboardArrowLeft />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {!isExpanded && (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Tooltip
            title={t("Expand")}
            placement="bottom"
            enterDelay={500}
            enterNextDelay={300}
          >
            <IconButton
              onClick={() => setIsExpanded(!isExpanded)}
              sx={{ padding: 0 }}
            >
              <KeyboardArrowRight />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {isExpanded && (
        <>
          {/* Filter Controls */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              marginBottom: 2,
            }}
          >
            <TextField
              label={t("combat_sim_search")}
              variant="outlined"
              size="small"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              sx={{ width: "60%" }}
            />
            <FormControl size="small" sx={{ width: "35%" }}>
              <InputLabel>{t("combat_sim_filter_by")}</InputLabel>
              <Select
                value={filterField}
                onChange={(e) => setFilterField(e.target.value)}
                label={t("combat_sim_filter_by")}
              >
                <MenuItem value="name">{t("Name")}</MenuItem>
                <MenuItem value="lvl">{t("Level")}</MenuItem>
                <MenuItem value="species">{t("Species")}</MenuItem>
                <MenuItem value="rank">{t("Rank")}</MenuItem>
                <MenuItem value="tags">{t("Personal Tags")}</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* NPC List */}
          <Box sx={{ maxHeight: "calc(100vh - 295px)", overflowY: "auto" }}>
            <List sx={{ height: "calc(100vh - 295px)", overflowY: "auto" }}>
              {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
                  <CircularProgress />
                </Box>
              )}
              {filteredNpcList.map((npc) => (
                <Box key={npc.id}>
                  <ListItem
                    button
                    onClick={() => handleSelectNPC(npc.id)}
                    sx={{ padding: "5px 10px" }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="h5" fontWeight={"bold"}>
                            {npc.name}
                          </Typography>
                        }
                        secondary={
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontFamily: "Antonio" }}
                            component="span"
                          >
                            <Tooltip title={t(npc.species)}>
                              <span>
                                {npc.species === "Beast" && <GiWolfHead />}
                                {npc.species === "Construct" && (
                                  <GiRobotGolem />
                                )}
                                {npc.species === "Demon" && <GiEvilBat />}
                                {npc.species === "Elemental" && <GiFire />}
                                {npc.species === "Humanoid" && <GiSwordwoman />}
                                {npc.species === "Undead" && <GiRaiseZombie />}
                                {npc.species === "Plant" && <GiRose />}
                                {npc.species === "Monster" && <GiGooeyDaemon />}
                              </span>
                            </Tooltip>
                            {" | "}
                            {t("Level")}: {npc.lvl}
                            {npc.rank && " | " + t(rankText(npc.rank))}
                          </Typography>
                        }
                      />
                    </Box>
                  </ListItem>
                  <Divider />
                </Box>
              ))}
            </List>
          </Box>
        </>
      )}
    </Box>
  );
}
