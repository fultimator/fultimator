import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  IconButton,
  Paper,
  Tooltip,
  Snackbar,
  Alert,
  Fade,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
  Collapse,
  // TODO: re-enable when cross-db encounter copy/move is solved (NPC refs tied to source db)
  // Divider,
  // ListItemIcon,
  // ListItemText,
  // Menu as MuiMenu,
  // MenuItem,
  Fab,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router";
import SettingsIcon from "@mui/icons-material/Settings";
import StorageIcon from "@mui/icons-material/Storage";
import CloudIcon from "@mui/icons-material/Cloud";
import Layout from "../../components/Layout";
import { useTheme } from "@mui/material/styles";
import CustomHeaderAlt from "../../components/common/CustomHeaderAlt";
import SettingsDialog from "../../components/combatSim/SettingsDialog";
import { Delete, /*DriveFileMove, FileCopy,*/ LibraryAddCheck, SportsMartialArts, KeyboardArrowUp } from "@mui/icons-material";
import { t } from "../../translation/translate";
import { globalConfirm } from "../../utility/globalConfirm";
import EncounterCard from "../../components/combatSim/EncounterCard";
import { useCombatSimSettingsStore } from "../../stores/combatSimSettingsStore";
import { SignIn } from "../../components/auth";
import DriveSync from "../../components/DriveSync";
import { useDatabaseContext } from "../../context/DatabaseContext";
import { useDatabase } from "../../hooks/useDatabase";

const MAX_ENCOUNTERS = 3;

export default function CombatSimulatorEncounters() {
  const { authLoading, dbMode } = useDatabaseContext();

  return (
    <Layout fullWidth>
      {authLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
          <CircularProgress />
        </Box>
      )}
      {!authLoading && <CombatSimEncounters key={dbMode} />}
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
      const docs = await db.getDocs(db.query(db.collection("encounters"), ...constraints));
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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  // TODO: re-enable when cross-db encounter copy/move is solved
  // const [copyAnchor, setCopyAnchor] = useState(null);
  // const [moveAnchor, setMoveAnchor] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

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
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );
      setEncounters(sortedEncounters);
    }
  }, [encountersList, loading]);

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

  const isAtCloudLimit = dbMode === "cloud" && encounters.length >= MAX_ENCOUNTERS;

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
  };

  const handleDeleteEncounter = async (id) => {
    const confirmDelete = await globalConfirm(
      t("combat_sim_delete_encounter_confirm")
    );
    if (!confirmDelete) return;

    try {
      await db.deleteDoc(db.doc("encounters", id));
      setEncountersList((prev) => prev.filter((encounter) => encounter.id !== id));
      setEncounters((prev) => prev.filter((encounter) => encounter.id !== id));
      fetchEncounters();
      showNotification(t("combat_sim_encounter_deleted"));
    } catch (e) {
      console.error("Error deleting encounter:", e);
      showNotification(t("combat_sim_error_deleting_encounter"), "error");
    }
  };

  const handleNavigateToEncounter = (id) => {
    navigate(`/combat-sim/${id}`, { state: { from: "/combat-sim", dbMode } });
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
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const deleteSelectedEncounters = async () => {
    const confirmDelete = await globalConfirm(
      `${t("combat_sim_delete_encounter_confirm")} (${selectedIds.size})`
    );
    if (!confirmDelete) return;
    const idsToDelete = new Set(selectedIds);
    for (const id of idsToDelete) {
      await db.deleteDoc(db.doc("encounters", id));
    }
    setEncountersList((prev) => prev.filter((encounter) => !idsToDelete.has(encounter.id)));
    setEncounters((prev) => prev.filter((encounter) => !idsToDelete.has(encounter.id)));
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

  return (
    <Box sx={{ padding: 3, maxWidth: "1200px", margin: "auto" }}>
      <Paper
        elevation={isDarkMode ? 6 : 3}
        sx={{
          p: "14px",
          borderRadius: "8px",
          border: `2px solid ${theme.palette.secondary.main}`,
          backgroundColor: theme.palette.background.paper,
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        {/* Header with Settings Button */}
        <CustomHeaderAlt
          headerText={t("combat_sim_title")}
          icon={<SportsMartialArts fontSize="large" />}
        />

        <div style={{ paddingLeft: 10, paddingRight: 10 }}>
          <Typography variant="h6" gutterBottom color="text.primary">
            {t("combat_sim_new_encounter")}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <TextField
                label={t("combat_sim_encounter_name")}
                variant="outlined"
                fullWidth
                value={encounterName}
                onKeyDown={handleKeyDown}
                onChange={handleEncounterNameChange}
                inputProps={{ maxLength: 200 }}
                disabled={dbMode === "cloud" && !cloudUser}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleSaveEncounter}
                disabled={!encounterName || isAtCloudLimit}
                sx={{ height: "100%" }}
              >
                {t("combat_sim_create_encounter")}
              </Button>
            </Grid>
          </Grid>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
            mt={2}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ToggleButtonGroup
                value={dbMode}
                exclusive
                size="small"
                onChange={(_, val) => val && requestModeSwitch(val)}
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
              {dbMode === "local" && <DriveSync />}
              <Typography variant="h5" color="text.primary">
                {t("combat_sim_saved_encounters")}{" "}
                {dbMode === "cloud"
                  ? `(${encounters.length}/${MAX_ENCOUNTERS})`
                  : `(${encounters.length})`}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Tooltip title={selectMode ? t("Exit Select Mode") : t("Select Encounters")}>
                <Button
                  variant={selectMode ? "contained" : "outlined"}
                  size="small"
                  startIcon={<LibraryAddCheck />}
                  onClick={toggleSelectMode}
                >
                  {t("Select")}
                </Button>
              </Tooltip>
              <Tooltip title={t("combat_sim_settings")}>
                <IconButton
                  color={isDarkMode ? "white" : "primary"}
                  onClick={() => setSettingsOpen(true)}
                >
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Select mode action bar */}
          <Collapse in={selectMode}>
            <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1, mt: 0.75, pt: 0.75, borderTop: 1, borderColor: "divider" }}>
              <Typography variant="body2" color="text.secondary">
                {selectedIds.size} {t("selected")}
              </Typography>
              <Box sx={{ flex: 1 }} />
              {/* TODO: re-enable Copy/Move when cross-db encounter solution is ready */}
              {/* <Button size="small" variant="outlined" startIcon={<FileCopy />} onClick={(e) => setCopyAnchor(e.currentTarget)}>{t("Copy")}</Button> */}
              {/* <Button size="small" variant="outlined" startIcon={<DriveFileMove />} onClick={(e) => setMoveAnchor(e.currentTarget)}>{t("Move")}</Button> */}
              <Tooltip title={`${t("Delete Selected")} (${selectedIds.size})`}>
                <span>
                  <IconButton onClick={deleteSelectedEncounters} disabled={selectedIds.size === 0} color="error">
                    <Delete />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Collapse>
        </div>
      </Paper>

      {dbMode === "cloud" && !cloudUser && (
        <Paper
          elevation={3}
          sx={{ p: 2, mt: 2, mb: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 2, flexWrap: "wrap" }}
        >
          <CloudIcon color="primary" />
          <Typography variant="body2" color="text.primary" sx={{ flex: 1, minWidth: 200 }}>
            {t("You have to be logged in to access this feature")}
          </Typography>
          <SignIn />
        </Paper>
      )}

      <Grid container spacing={3} sx={{ marginTop: 2 }}>
        {loading ? (
          <Grid
            item
            xs={12}
            sx={{ display: "flex", justifyContent: "center", py: 4 }}
          >
            <CircularProgress color="primary" />
          </Grid>
        ) : encounters.length === 0 ? (
          <Grid item xs={12}>
            <Paper
              sx={{
                p: 3,
                textAlign: "center",
                borderRadius: 2,
                backgroundColor: theme.palette.background.paper,
                border: `1px dashed ${theme.palette.divider}`,
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {t("combat_sim_no_encounters")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("combat_sim_create_first_encounter")}
              </Typography>
            </Paper>
          </Grid>
        ) : (
          encounters.map((encounter) => (
            <Grid item xs={12} sm={6} md={4} key={encounter.id}>
              <EncounterCard
                encounter={encounter}
                onDelete={handleDeleteEncounter}
                onClick={() => handleNavigateToEncounter(encounter.id)}
                selectMode={selectMode}
                isSelected={selectedIds.has(encounter.id)}
                onToggleSelect={toggleSelectEncounter}
              />
            </Grid>
          ))
        )}
      </Grid>

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

      {/* Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleNotificationClose}
        TransitionComponent={Fade}
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
    </Box>
  );
};
