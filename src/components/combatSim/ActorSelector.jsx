import React, { useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  TextField,
  Divider,
  CircularProgress,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  IconButton,
  Drawer,
  Tooltip,
} from "@mui/material";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
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

function BaseActorSelector({
  filterText,
  onFilterTextChange,
  items = [],
  loading = false,
  emptyText = "",
  onSelectItem,
  getItemKey,
  renderPrimary,
  renderSecondary,
  filterControls = null,
}) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
      {filterControls ?? (
        <Box sx={{ marginBottom: 2 }}>
          <TextField
            label={t("combat_sim_search")}
            variant="outlined"
            size="small"
            value={filterText}
            onChange={(e) => onFilterTextChange(e.target.value)}
            fullWidth
            slotProps={{ htmlInput: { maxLength: 100 } }}
          />
        </Box>
      )}
      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
        <List sx={{ p: 0 }}>
          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
              <CircularProgress />
            </Box>
          )}
          {!loading && items.length === 0 && (
            <Typography
              variant="body2"
              sx={{ padding: 2, color: "text.secondary" }}
            >
              {emptyText}
            </Typography>
          )}
          {items.map((item) => (
            <Box key={getItemKey(item)}>
              <ListItem
                onClick={() => onSelectItem(item)}
                sx={{
                  padding: "5px 10px",
                  cursor: "pointer",
                  transition: "background-color 0.15s ease",
                  "&:hover": { backgroundColor: "action.hover" },
                }}
              >
                <ListItemText
                  primary={renderPrimary(item)}
                  secondary={renderSecondary ? renderSecondary(item) : null}
                />
              </ListItem>
              <Divider />
            </Box>
          ))}
        </List>
      </Box>
    </Box>
  );
}

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

export function PcSelector({ playerList = [], handleSelectPC, loading }) {
  const [filterText, setFilterText] = useState("");
  const filteredList = playerList.filter(
    (player) =>
      !filterText ||
      (player.name || "").toLowerCase().includes(filterText.toLowerCase()),
  );

  return (
    <BaseActorSelector
      filterText={filterText}
      onFilterTextChange={setFilterText}
      items={filteredList}
      loading={loading}
      emptyText={`${t("No players found")}.`}
      onSelectItem={handleSelectPC}
      getItemKey={(player) => player.id}
      renderPrimary={(player) => (
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          {player.name}
        </Typography>
      )}
      renderSecondary={(player) => (
        <Typography
          variant="body2"
          component="span"
          sx={{ color: "text.secondary", fontFamily: "Antonio" }}
        >
          {t("Level")}: {player.lvl ?? "?"}
        </Typography>
      )}
    />
  );
}

export function NpcSelector({
  isMobile = false,
  npcList = [],
  handleSelectNPC,
  npcDrawerOpen = false,
  setNpcDrawerOpen = () => {},
  loading = false,
  contentOnly = false,
}) {
  const theme = useTheme();
  const [filterText, setFilterText] = useState("");
  const [filterField, setFilterField] = useState("name");
  const [isExpanded, setIsExpanded] = useState(true);

  const filteredNpcList = npcList.filter((npc) => {
    if (filterText === "") return true;
    let value = "";
    if (filterField === "tags") {
      value = (npc.tags || [])
        .map((tag) => tag.name)
        .join(", ")
        .toLowerCase();
    } else if (filterField === "rank") {
      value = t(rankText(npc.rank));
    } else {
      value = npc[filterField] ? t(npc[filterField].toString()) : "";
    }
    return value.toLowerCase().includes(filterText.toLowerCase());
  });

  const sharedFilterControls = (
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
  );

  const renderNpcSecondary = (npc) => (
    <Typography
      variant="body2"
      component="span"
      sx={{ color: "text.secondary", fontFamily: "Antonio" }}
    >
      <Tooltip title={t(npc.species)}>
        <span>
          {npc.species === "Beast" && <GiWolfHead />}
          {npc.species === "Construct" && <GiRobotGolem />}
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
  );

  if (contentOnly) {
    return (
      <BaseActorSelector
        filterText={filterText}
        onFilterTextChange={setFilterText}
        items={filteredNpcList}
        loading={loading}
        emptyText={`${t("combat_sim_no_npc_found")}.`}
        onSelectItem={(npc) => handleSelectNPC(npc.id)}
        getItemKey={(npc) => npc.id}
        renderPrimary={(npc) => (
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            {npc.name}
          </Typography>
        )}
        renderSecondary={renderNpcSecondary}
        filterControls={sharedFilterControls}
      />
    );
  }

  if (isMobile) {
    return (
      <>
        <Button
          variant="contained"
          size="small"
          onClick={() => setNpcDrawerOpen(true)}
        >
          {t("combat_sim_select_actors")}
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
            <Box sx={{ marginBottom: 1 }}>
              <TextField
                label={t("combat_sim_search")}
                variant="outlined"
                fullWidth
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                sx={{ marginBottom: 2 }}
                size="small"
                slotProps={{ htmlInput: { maxLength: 100 } }}
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
                        textTransform: "none",
                        "&:hover": { bgcolor: "rgba(0, 0, 0, 0.08)" },
                      }}
                      onClick={() => handleSelectNPC(npc.id)}
                    >
                      {npc.species === "Beast" && (
                        <GiWolfHead
                          style={{
                            marginRight: 10,
                            color: theme.palette.text.primary,
                          }}
                        />
                      )}
                      {npc.species === "Construct" && (
                        <GiRobotGolem
                          style={{
                            marginRight: 10,
                            color: theme.palette.text.primary,
                          }}
                        />
                      )}
                      {npc.species === "Demon" && (
                        <GiEvilBat
                          style={{
                            marginRight: 10,
                            color: theme.palette.text.primary,
                          }}
                        />
                      )}
                      {npc.species === "Elemental" && (
                        <GiFire
                          style={{
                            marginRight: 10,
                            color: theme.palette.text.primary,
                          }}
                        />
                      )}
                      {npc.species === "Humanoid" && (
                        <GiSwordwoman
                          style={{
                            marginRight: 10,
                            color: theme.palette.text.primary,
                          }}
                        />
                      )}
                      {npc.species === "Undead" && (
                        <GiRaiseZombie
                          style={{
                            marginRight: 10,
                            color: theme.palette.text.primary,
                          }}
                        />
                      )}
                      {npc.species === "Plant" && (
                        <GiRose
                          style={{
                            marginRight: 10,
                            color: theme.palette.text.primary,
                          }}
                        />
                      )}
                      {npc.species === "Monster" && (
                        <GiGooeyDaemon
                          style={{
                            marginRight: 10,
                            color: theme.palette.text.primary,
                          }}
                        />
                      )}

                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                          {npc.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "text.secondary",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          {t("Level")}: {npc.lvl}
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
    );
  }

  return (
    <Box
      sx={{
        width: isExpanded ? "20%" : "60px",
        bgcolor: theme.palette.background.paper,
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
              borderBottom: `1px solid ${theme.palette.divider}`,
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
                onClick={() => setIsExpanded(false)}
                sx={{ padding: 0 }}
              >
                <KeyboardArrowLeft />
              </IconButton>
            </Tooltip>
          </Box>
          <BaseActorSelector
            filterText={filterText}
            onFilterTextChange={setFilterText}
            items={filteredNpcList}
            loading={loading}
            emptyText={`${t("combat_sim_no_npc_found")}.`}
            onSelectItem={(npc) => handleSelectNPC(npc.id)}
            getItemKey={(npc) => npc.id}
            renderPrimary={(npc) => (
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                {npc.name}
              </Typography>
            )}
            renderSecondary={renderNpcSecondary}
            filterControls={sharedFilterControls}
          />
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
