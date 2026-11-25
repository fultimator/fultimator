import React, {
  useState,
  useEffect,
  useCallback,
  useDeferredValue,
  useMemo,
} from "react";
import {
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Paper,
  Tooltip,
  Snackbar,
  Alert,
  Fade,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Chip,
  Collapse as MuiCollapse,
  ToggleButtonGroup,
  ToggleButton,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  // TODO: re-enable when cross-db encounter copy/move is solved (NPC refs tied to source db)
  // ListItemIcon,
  // Menu as MuiMenu,
  Fab,
  Container,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  useMediaQuery,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router";
import SettingsIcon from "@mui/icons-material/Settings";
import StorageIcon from "@mui/icons-material/Storage";
import CloudIcon from "@mui/icons-material/Cloud";
import Layout from "../../components/Layout";
import { useTheme } from "@mui/material/styles";
import AppBarSearch from "../../components/appbar/AppBarSearch";
import MasonryColumns from "../../components/common/MasonryColumns";
import { useDockedBarInset } from "../../hooks/useDockedBarInset";
import { useAppBarTop } from "../npc-gallery/listPreview/useAppBarTop";
import SettingsDialog from "../../components/combatSim/SettingsDialog";
import {
  Delete,
  /*DriveFileMove, FileCopy,*/ LibraryAddCheck,
  DeleteSweep,
  Add,
  KeyboardArrowUp,
} from "@mui/icons-material";
import { t } from "../../translation/translate";
import { globalConfirm } from "../../utility/globalConfirm";
import EncounterCard from "../../components/combatSim/EncounterCard";
import { useCombatSimSettingsStore } from "../../stores/combatSimSettingsStore";
import { SignIn } from "../../components/auth";
import DriveSync from "../../components/DriveSync";
import { useDatabaseContext } from "../../context/useDatabaseContext";
import { useDatabase } from "../../hooks/useDatabase";
import {
  applyNpcPostLoadTransforms,
  getPendingNpcMigrations,
  npcNeedsMigration,
} from "../../libs/actor";
import {
  applyPostLoadTransforms,
  getPendingPlayerMigrations,
  playerNeedsMigration,
} from "../../libs/actor";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

const MAX_ENCOUNTERS = 3;

const toolButtonSx = {
  width: 36,
  height: 36,
  border: 1,
  borderColor: "divider",
  borderRadius: 1,
};

export default function CombatSimulatorEncounters() {
  const { authLoading, dbMode } = useDatabaseContext();

  return (
    <Layout fullWidth>
      <Box sx={{ px: { xs: 2, md: 3 } }}>
        {authLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
            <CircularProgress />
          </Box>
        )}
        {!authLoading && <CombatSimEncounters key={dbMode} />}
      </Box>
    </Layout>
  );
}

const CombatSimEncounters = () => {
  const { dbMode, requestModeSwitch, cloudUser } = useDatabaseContext();
  const db = useDatabase();
  // TODO: re-enable when cross-db encounter copy/move is solved (NPC refs tied to source db)
  // const localDb = useDatabase("local");
  // const cloudDb = useDatabase("cloud");

  const location = useLocation();
  const [encountersList, setEncountersList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEncounters = useCallback(async () => {
    if (dbMode === "cloud" && !cloudUser) {
      setEncountersList([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const constraints =
        dbMode === "cloud" ? [db.where("uid", "==", cloudUser.uid)] : [];
      const docs = await db.getDocs(
        db.query(db.collection("encounters"), ...constraints),
      );
      setEncountersList(docs ?? []);
    } catch (e) {
      console.error("Error loading encounters:", e);
    } finally {
      setLoading(false);
    }
  }, [db, dbMode, cloudUser]);

  // Fetch on mount and whenever returning to this page (e.g. after combat sim autosaved)
  useEffect(() => {
    fetchEncounters();
  }, [fetchEncounters, location.key]);

  const [showScrollTop, setShowScrollTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [encounters, setEncounters] = useState([]);
  const [encounterName, setEncounterName] = useState("");
  const [pendingMigrationEncounter, setPendingMigrationEncounter] =
    useState(null);
  const [pendingMigrationAction, setPendingMigrationAction] =
    useState("continue");
  const [expandedMigrationActorId, setExpandedMigrationActorId] =
    useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [sort, setSort] = useState("updatedAt");
  const [direction, setDirection] = useState("descending");
  const [createOpen, setCreateOpen] = useState(false);
  const desktop = useMediaQuery("(min-width: 900px)");
  const dockedBarInset = useDockedBarInset();
  const appBarHeight = useAppBarTop();
  // TODO: re-enable when cross-db encounter copy/move is solved
  // const [copyAnchor, setCopyAnchor] = useState(null);
  // const [moveAnchor, setMoveAnchor] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();

  const settingsStore = useCombatSimSettingsStore();
  const [localSettings, setLocalSettings] = useState({});

  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Handler to update individual settings
  const handleSettingChange = useCallback((name, value) => {
    setLocalSettings((prev) => ({ ...prev, [name]: value }));
  }, []);

  useEffect(() => {
    if (!loading && encountersList) {
      const sortedEncounters = [...encountersList].sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
      );
      setEncounters(sortedEncounters);
    }
  }, [encountersList, loading]);

  const filteredEncounters = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    const factor = direction === "ascending" ? 1 : -1;
    const valueOf = (encounter) =>
      sort === "name"
        ? (encounter.name ?? "")
        : new Date(encounter[sort] ?? 0).getTime();
    return encounters
      .filter((encounter) =>
        query ? (encounter.name ?? "").toLowerCase().includes(query) : true,
      )
      .sort((a, b) => {
        const [va, vb] = [valueOf(a), valueOf(b)];
        return (
          factor * (typeof va === "string" ? va.localeCompare(vb) : va - vb)
        );
      });
  }, [encounters, deferredSearch, sort, direction]);

  // Initialize settings
  useEffect(() => {
    // Check if settings exist in localStorage with getSettings
    let persistedSettings = settingsStore.getSettings();
    if (persistedSettings && Object.keys(persistedSettings).length > 0) {
      setLocalSettings(persistedSettings);
    } else if (!settingsStore.isInitialized) {
      // Only initialize settings if not already initialized
      settingsStore.initializeSettings();
      setLocalSettings(settingsStore.getSettings());
    }
  }, [settingsStore]);

  // Save settings to the persisted store
  const handleSaveSettings = useCallback(() => {
    // Save local settings to the persisted store
    settingsStore.updateSettings(localSettings);
    setSettingsOpen(false);
    showNotification(t("combat_sim_settings_saved_successfully"));
  }, [localSettings, settingsStore, setSettingsOpen]);

  // Close settings dialog without saving changes
  const handleCloseSettings = useCallback(() => {
    setSettingsOpen(false);
    // Reset local settings to match store when the user cancels
    setLocalSettings(settingsStore.settings);
  }, [settingsStore.settings]);

  // Show notification helper
  const showNotification = (message, severity = "success") => {
    setNotification({ open: true, message, severity });
  };

  // Handle notification close
  const handleNotificationClose = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  const handleEncounterNameChange = (event) => {
    setEncounterName(event.target.value);
  };

  const isAtCloudLimit =
    dbMode === "cloud" && encounters.length >= MAX_ENCOUNTERS;

  const handleSaveEncounter = async () => {
    if (!encounterName || isAtCloudLimit) return;

    const newEncounter = {
      name: encounterName,
      round: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      clocks: [],
      notes: [],
      private: true,
      ...(dbMode === "cloud" && cloudUser ? { uid: cloudUser.uid } : {}),
    };

    try {
      const res = await db.addDoc(db.collection("encounters"), newEncounter);
      console.debug(res);
      showNotification(t("combat_sim_encounter_created"));
      fetchEncounters();
    } catch (e) {
      console.error("Error saving encounter:", e);
      showNotification(t("combat_sim_error_creating_encounter"), "error");
    }

    setEncounterName("");
    setCreateOpen(false);
  };

  const handleDeleteEncounter = async (id) => {
    try {
      await db.deleteDoc(db.doc("encounters", id));
      setEncountersList((prev) =>
        prev.filter((encounter) => encounter.id !== id),
      );
      setEncounters((prev) => prev.filter((encounter) => encounter.id !== id));
      fetchEncounters();
      showNotification(t("combat_sim_encounter_deleted"));
    } catch (e) {
      console.error("Error deleting encounter:", e);
      showNotification(t("combat_sim_error_deleting_encounter"), "error");
    }
  };

  const getPendingMigrationCounts = (encounter) => {
    const npcs = Array.isArray(encounter?.selectedNPCs)
      ? encounter.selectedNPCs
      : [];
    const pcs = Array.isArray(encounter?.selectedPCs)
      ? encounter.selectedPCs
      : [];
    const npcCount = npcs.filter((npc) => npcNeedsMigration(npc)).length;
    const pcCount = pcs.filter((pc) => playerNeedsMigration(pc)).length;
    return { npcCount, pcCount, total: npcCount + pcCount };
  };

  const getPendingMigrationActors = (encounter) => {
    const npcs = Array.isArray(encounter?.selectedNPCs)
      ? encounter.selectedNPCs
      : [];
    const pcs = Array.isArray(encounter?.selectedPCs)
      ? encounter.selectedPCs
      : [];
    return [
      ...npcs
        .filter((npc) => npcNeedsMigration(npc))
        .map((npc) => ({
          id: `npc-${npc?.combatId ?? npc?.id ?? npc?.name ?? "unknown"}`,
          kind: "NPC",
          name: npc?.name || "Unnamed NPC",
          migrations: getPendingNpcMigrations(npc),
        })),
      ...pcs
        .filter((pc) => playerNeedsMigration(pc))
        .map((pc) => ({
          id: `pc-${pc?.combatId ?? pc?.id ?? pc?.name ?? "unknown"}`,
          kind: "PC",
          name: pc?.name || "Unnamed PC",
          migrations: getPendingPlayerMigrations(pc),
        })),
    ];
  };

  const handleNavigateToEncounter = (encounter) => {
    const pending = getPendingMigrationCounts(encounter);
    if (pending.total > 0) {
      setPendingMigrationEncounter(encounter);
      setPendingMigrationAction("continue");
      return;
    }
    navigate(`/combat-sim/${encounter.id}`, {
      state: { from: "/combat-sim", dbMode },
    });
  };

  const handleMigrateEncounterActors = async (encounter) => {
    if (!encounter?.id) return;
    const npcs = Array.isArray(encounter.selectedNPCs)
      ? encounter.selectedNPCs
      : [];
    const pcs = Array.isArray(encounter.selectedPCs)
      ? encounter.selectedPCs
      : [];
    const stripUndefined = (obj) => JSON.parse(JSON.stringify(obj));
    const nextNpcs = npcs.map((npc) =>
      npcNeedsMigration(npc)
        ? stripUndefined(applyNpcPostLoadTransforms(npc))
        : npc,
    );
    const nextPcs = pcs.map((pc) =>
      playerNeedsMigration(pc)
        ? stripUndefined(applyPostLoadTransforms(pc))
        : pc,
    );

    const changed =
      JSON.stringify(nextNpcs) !== JSON.stringify(npcs) ||
      JSON.stringify(nextPcs) !== JSON.stringify(pcs);
    if (!changed) {
      showNotification(t("No pending actor migrations in this encounter."));
      return;
    }

    const updatedEncounter = {
      ...encounter,
      selectedNPCs: nextNpcs,
      selectedPCs: nextPcs,
      updatedAt: new Date().toISOString(),
    };

    try {
      await db.setDoc(db.doc("encounters", encounter.id), updatedEncounter);
      setEncountersList((prev) =>
        prev.map((e) => (e.id === encounter.id ? updatedEncounter : e)),
      );
      setEncounters((prev) =>
        prev.map((e) => (e.id === encounter.id ? updatedEncounter : e)),
      );
      showNotification(t("Encounter actors migrated successfully."));
    } catch (e) {
      console.error("Error migrating encounter actors:", e);
      showNotification(t("Failed to migrate encounter actors."), "error");
      throw e;
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && encounterName.trim()) {
      handleSaveEncounter();
    }
  };

  const toggleSelectMode = () => {
    setSelectMode((prev) => {
      if (prev) setSelectedIds(new Set());
      return !prev;
    });
  };

  const toggleSelectEncounter = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const deleteSelectedEncounters = async () => {
    const confirmDelete = await globalConfirm(
      `${t("combat_sim_delete_encounter_confirm")} (${selectedIds.size})`,
    );
    if (!confirmDelete) return;
    const idsToDelete = new Set(selectedIds);
    for (const id of idsToDelete) {
      await db.deleteDoc(db.doc("encounters", id));
    }
    setEncountersList((prev) =>
      prev.filter((encounter) => !idsToDelete.has(encounter.id)),
    );
    setEncounters((prev) =>
      prev.filter((encounter) => !idsToDelete.has(encounter.id)),
    );
    fetchEncounters();
    setSelectedIds(new Set());
  };

  // TODO: re-enable when cross-db encounter copy/move is solved (NPC refs tied to source db)
  // const copyEncountersTo = async (targetDb, targetUid) => { ... };
  // const copySelectedToLocal = async () => { ... };
  // const copySelectedToCloud = async () => { ... };
  // const moveSelectedToLocal = async () => { ... };
  // const moveSelectedToCloud = async () => { ... };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  const clearFilters = () => {
    setSearch("");
    setSort("updatedAt");
    setDirection("descending");
  };

  const activeFilters = [
    sort !== "updatedAt" && sort,
    direction !== "descending" && direction,
  ].filter(Boolean);

  const filterPanel = (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(2, minmax(0, 1fr))",
          md: "repeat(2, minmax(0, 1fr)) auto",
        },
        alignItems: "center",
        gap: 1.5,
      }}
    >
      <FormControl fullWidth size="small">
        <InputLabel id="encounter-sort">{t("Sort:")}</InputLabel>
        <Select
          labelId="encounter-sort"
          value={sort}
          label={t("Sort:")}
          onChange={(evt) => setSort(evt.target.value)}
        >
          <MenuItem value="updatedAt">{t("updated_date")}</MenuItem>
          <MenuItem value="createdAt">{t("creation_date")}</MenuItem>
          <MenuItem value="name">{t("Name")}</MenuItem>
        </Select>
      </FormControl>
      <FormControl fullWidth size="small">
        <InputLabel id="encounter-direction">{t("Direction:")}</InputLabel>
        <Select
          labelId="encounter-direction"
          value={direction}
          label={t("Direction:")}
          onChange={(evt) => setDirection(evt.target.value)}
        >
          <MenuItem value="ascending">{t("Ascending")}</MenuItem>
          <MenuItem value="descending">{t("Descending")}</MenuItem>
        </Select>
      </FormControl>
      <Button
        variant="outlined"
        color="warning"
        startIcon={<DeleteSweep />}
        disabled={!activeFilters.length && !search}
        onClick={clearFilters}
        sx={{ gridColumn: { xs: "1 / -1", md: "auto" } }}
      >
        {t("clear_search_filters")}
      </Button>
    </Box>
  );

  return (
    <>
      <AppBarSearch
        value={search}
        onChange={setSearch}
        placeholder={t("Search encounters")}
        chips={activeFilters}
        panel={filterPanel}
      />
      <Box
        sx={{
          mb: 2.5,
          position: { md: "sticky" },
          top: { md: appBarHeight },
          zIndex: 2,
          ml: { md: -3 },
          ...dockedBarInset,
          transition: "margin-right 0.3s ease, padding-right 0.3s ease",
          mt: { md: `calc(${appBarHeight}px - 4.5em)` },
        }}
      >
        <Paper
          square={desktop}
          elevation={desktop ? 3 : 1}
          sx={{
            px: { xs: 2, md: 0 },
            py: 1,
            backgroundImage: "none",
            backgroundColor: (muiTheme) => muiTheme.palette.background.paper,
          }}
        >
          <Container disableGutters={!desktop}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1.5,
                rowGap: 1,
                "& .MuiToggleButton-root, & .MuiButton-root:not(.MuiToggleButton-root)":
                  { height: 36 },
              }}
            >
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setCreateOpen(true)}
                disabled={(dbMode === "cloud" && !cloudUser) || isAtCloudLimit}
                sx={{
                  flex: { xs: "1 1 100%", md: "none" },
                  order: { xs: 1, md: 0 },
                  whiteSpace: "nowrap",
                }}
              >
                {t("combat_sim_create_encounter")}
              </Button>
              <ToggleButtonGroup
                value={dbMode}
                exclusive
                size="small"
                onChange={(_, val) => val && requestModeSwitch(val)}
                sx={{
                  flex: { xs: 1, md: "none" },
                  order: { xs: 2, md: 0 },
                  "& .MuiToggleButton-root": { flex: { xs: 1, md: "none" } },
                }}
              >
                <ToggleButton value="local">
                  <StorageIcon sx={{ mr: 0.5 }} fontSize="small" />
                  {t("Local")}
                </ToggleButton>
                <ToggleButton value="cloud">
                  <CloudIcon sx={{ mr: 0.5 }} fontSize="small" />
                  {t("Cloud")}
                </ToggleButton>
              </ToggleButtonGroup>
              {dbMode === "local" && (
                <Box sx={{ order: { xs: 3, md: 0 } }}>
                  <DriveSync />
                </Box>
              )}
              <Box sx={{ flex: 1, display: { xs: "none", md: "block" } }} />
              <Tooltip title={t("combat_sim_settings")}>
                <IconButton
                  aria-label={t("combat_sim_settings")}
                  sx={{ ...toolButtonSx, order: { xs: 4, md: 0 } }}
                  onClick={() => setSettingsOpen(true)}
                >
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
              <Divider
                orientation="vertical"
                flexItem
                sx={{ display: { xs: "none", md: "block" } }}
              />
              <Box
                sx={{
                  display: { xs: "flex", md: "contents" },
                  alignItems: "center",
                  gap: 1.5,
                  flex: "1 1 100%",
                  order: { xs: 5, md: 0 },
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {t("combat_sim_saved_encounters")}{" "}
                  {dbMode === "cloud"
                    ? `(${encounters.length}/${MAX_ENCOUNTERS})`
                    : `(${encounters.length})`}
                </Typography>
                <Tooltip
                  title={
                    selectMode ? t("Exit Select Mode") : t("Select Encounters")
                  }
                >
                  <Button
                    variant={selectMode ? "contained" : "outlined"}
                    startIcon={<LibraryAddCheck />}
                    onClick={toggleSelectMode}
                    sx={{ ml: { xs: "auto", md: 0 } }}
                  >
                    {t("Select")}
                  </Button>
                </Tooltip>
              </Box>
            </Box>
            <Collapse in={selectMode}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 1,
                  mt: 0.75,
                  pt: 0.75,
                  borderTop: 1,
                  borderColor: "divider",
                }}
              >
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {selectedIds.size} {t("selected")}
                </Typography>
                <Box sx={{ flex: 1 }} />
                <Tooltip
                  title={`${t("Delete Selected")} (${selectedIds.size})`}
                >
                  <span>
                    <IconButton
                      onClick={deleteSelectedEncounters}
                      disabled={selectedIds.size === 0}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            </Collapse>
          </Container>
        </Paper>
      </Box>
      <Container disableGutters={!desktop}>
        {dbMode === "cloud" && !cloudUser && (
          <Paper
            elevation={3}
            sx={{
              p: 2,
              mb: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <CloudIcon color="primary" />
            <Typography
              variant="body2"
              sx={{ color: "text.primary", flex: 1, minWidth: 200 }}
            >
              {t("You have to be logged in to access this feature")}
            </Typography>
            <SignIn />
          </Paper>
        )}
        {encounters.length === 0 ? (
          <Paper
            sx={{
              p: 3,
              textAlign: "center",
              borderRadius: 2,
              backgroundColor: theme.palette.background.paper,
              border: `1px dashed ${theme.palette.divider}`,
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{ color: "text.secondary" }}
            >
              {t("combat_sim_no_encounters")}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {t("combat_sim_create_first_encounter")}
            </Typography>
          </Paper>
        ) : (
          <MasonryColumns columnWidth={360}>
            {filteredEncounters.map((encounter) => (
              <Box key={encounter.id} sx={{ mb: 2.5 }}>
                <EncounterCard
                  encounter={encounter}
                  onDelete={handleDeleteEncounter}
                  onClick={() => handleNavigateToEncounter(encounter)}
                  onMigrate={() => {
                    setPendingMigrationEncounter(encounter);
                    setPendingMigrationAction("migrate");
                  }}
                  hasPendingMigrations={
                    getPendingMigrationCounts(encounter).total > 0
                  }
                  selectMode={selectMode}
                  isSelected={selectedIds.has(encounter.id)}
                  onToggleSelect={toggleSelectEncounter}
                />
              </Box>
            ))}
          </MasonryColumns>
        )}
      </Container>
      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>{t("combat_sim_new_encounter")}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label={t("combat_sim_encounter_name")}
            variant="outlined"
            fullWidth
            value={encounterName}
            onKeyDown={handleKeyDown}
            onChange={handleEncounterNameChange}
            sx={{ mt: 1 }}
            slotProps={{ htmlInput: { maxLength: 200 } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>{t("Cancel")}</Button>
          <Button
            variant="contained"
            onClick={handleSaveEncounter}
            disabled={!encounterName || isAtCloudLimit}
          >
            {t("combat_sim_create_encounter")}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Settings Dialog */}
      <SettingsDialog
        open={settingsOpen}
        onClose={handleCloseSettings}
        onSave={handleSaveSettings}
        settings={localSettings}
        onSettingChange={handleSettingChange}
        storeSettings={settingsStore.settings}
        resetToDefaults={settingsStore.resetToDefaults}
      />
      <Dialog
        open={!!pendingMigrationEncounter}
        onClose={() => {
          setPendingMigrationEncounter(null);
          setPendingMigrationAction("continue");
          setExpandedMigrationActorId(null);
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{t("Pending Actor Migrations")}</DialogTitle>
        <DialogContent>
          {pendingMigrationEncounter && (
            <>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {(() => {
                  const { npcCount, pcCount } = getPendingMigrationCounts(
                    pendingMigrationEncounter,
                  );
                  return `This encounter has actors pending migration (${npcCount} NPC, ${pcCount} PC).`;
                })()}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, fontWeight: 700 }}>
                Actors to migrate:
              </Typography>
              <List dense sx={{ mt: 0.5, maxHeight: 240, overflowY: "auto" }}>
                {getPendingMigrationActors(pendingMigrationEncounter).map(
                  (actor) => {
                    const isExpanded = expandedMigrationActorId === actor.id;
                    return (
                      <Box key={actor.id}>
                        <ListItem
                          onClick={() =>
                            setExpandedMigrationActorId((prev) =>
                              prev === actor.id ? null : actor.id,
                            )
                          }
                          sx={{ cursor: "pointer", userSelect: "none", py: 0 }}
                          secondaryAction={
                            <Chip
                              label={`${actor.migrations.length} steps`}
                              size="small"
                              color="warning"
                              variant="outlined"
                            />
                          }
                        >
                          <ListItemText
                            primary={
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                }}
                              >
                                {isExpanded ? (
                                  <ExpandLessIcon
                                    fontSize="small"
                                    sx={{ color: "text.secondary" }}
                                  />
                                ) : (
                                  <ExpandMoreIcon
                                    fontSize="small"
                                    sx={{ color: "text.secondary" }}
                                  />
                                )}
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 500 }}
                                >
                                  {actor.name} ({actor.kind})
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                        <MuiCollapse in={isExpanded} unmountOnExit>
                          <Box sx={{ px: 3, pb: 1, pt: 0.25 }}>
                            {actor.migrations.map((step, idx) => (
                              <Typography
                                key={`${actor.id}-step-${idx}`}
                                variant="body2"
                                sx={{
                                  color: "text.secondary",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.75,
                                }}
                              >
                                <Box
                                  component="span"
                                  sx={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: "50%",
                                    bgcolor: "warning.main",
                                    flexShrink: 0,
                                    display: "inline-block",
                                  }}
                                />
                                {step}
                              </Typography>
                            ))}
                          </Box>
                        </MuiCollapse>
                      </Box>
                    );
                  },
                )}
              </List>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setPendingMigrationEncounter(null);
              setPendingMigrationAction("continue");
            }}
          >
            {t("Cancel")}
          </Button>
          {pendingMigrationAction === "migrate" && (
            <Button
              variant="outlined"
              color="warning"
              onClick={async () => {
                if (!pendingMigrationEncounter) return;
                await handleMigrateEncounterActors(pendingMigrationEncounter);
                setPendingMigrationEncounter(null);
                setPendingMigrationAction("continue");
                setExpandedMigrationActorId(null);
              }}
            >
              {t("Migrate Actors")}
            </Button>
          )}
          <Button
            variant="contained"
            onClick={() => {
              if (!pendingMigrationEncounter) return;
              navigate(`/combat-sim/${pendingMigrationEncounter.id}`, {
                state: { from: "/combat-sim", dbMode },
              });
              setPendingMigrationEncounter(null);
            }}
          >
            {t("Continue")}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleNotificationClose}
        slots={{ transition: Fade }}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleNotificationClose}
          severity={notification.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
      {showScrollTop && (
        <Tooltip title={t("Scroll to top")}>
          <Fab
            size="small"
            color="primary"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 1200 }}
          >
            <KeyboardArrowUp />
          </Fab>
        </Tooltip>
      )}
    </>
  );
};
