import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Grid,
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Paper,
  CardActions,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import SettingsIcon from "@mui/icons-material/Settings";
import Layout from "../../components/Layout";
import { useTheme } from "@mui/material/styles";
import CustomHeaderAlt from "../../components/common/CustomHeaderAlt";
import { SportsMartialArts, NavigateNext } from "@mui/icons-material";
import { t } from "../../translation/translate";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, firestore } from "../../firebase";
import { SignIn } from "../../components/auth";
import {
  collection,
  query,
  where,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import SettingsDialog from "../../components/combatSim/SettingsDialog";

const MAX_ENCOUNTERS = 3;

export default function CombatSimulatorEncounters() {
  const [user, loading, error] = useAuthState(auth);
  console.debug("user, loading, error", user, loading, error);

  return (
    <Layout fullWidth={user}>
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
          <CircularProgress />
        </Box>
      )}
      {!loading && !user && (
        <>
          <Typography sx={{ my: 1 }}>
            {t("You must be logged in to use this feature")}
          </Typography>
          <SignIn />
        </>
      )}
      {user && <CombatSimEncounters user={user} />}
    </Layout>
  );
}

const CombatSimEncounters = ({ user }) => {
  const encountersRef = collection(firestore, "encounters");
  const encountersQuery = query(encountersRef, where("uid", "==", user.uid));
  const [encountersList, loading] = useCollectionData(encountersQuery, {
    idField: "id",
  });

  const [encounters, setEncounters] = useState([]);
  const [encounterName, setEncounterName] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false); // State for settings dialog
  const navigate = useNavigate();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  // Combine settings into a single state object
  const [settings, setSettings] = useState({
    autoUseMP:
      localStorage.getItem("combatSimAutoUseMP") === null
        ? true
        : localStorage.getItem("combatSimAutoUseMP") === "true",
    autoOpenLogs:
      localStorage.getItem("combatSimAutoOpenLogs") === null
        ? true
        : localStorage.getItem("combatSimAutoOpenLogs") === "true",
    useDragAndDrop:
      localStorage.getItem("combatSimUseDragAndDrop") === null
        ? true
        : localStorage.getItem("combatSimUseDragAndDrop") === "true",
    autosaveEnabled:
      localStorage.getItem("combatSimAutosave") === null
        ? true
        : localStorage.getItem("combatSimAutosave") === "true",
  });

  // Handler to update individual settings
  const handleSettingChange = (name, value) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      [name]: value,
    }));
  };

  useEffect(() => {
    // Ensure default values are set in localStorage if they don't exist
    const defaultSettings = {
      combatSimAutoUseMP: "true",
      combatSimAutoOpenLogs: "true",
      combatSimUseDragAndDrop: "true",
      combatSimAutosave: "false", // Disable autosave by default to prevent accidental saves
    };

    Object.entries(defaultSettings).forEach(([key, defaultValue]) => {
      if (localStorage.getItem(key) === null) {
        localStorage.setItem(key, defaultValue);
      }
    });

    // Initialize state from localStorage - This part might be redundant now with the initial state definition, but safe to keep.
    setSettings({
      autoUseMP: localStorage.getItem("combatSimAutoUseMP") === "true",
      autoOpenLogs: localStorage.getItem("combatSimAutoOpenLogs") === "true",
      useDragAndDrop:
        localStorage.getItem("combatSimUseDragAndDrop") === "true",
      autosaveEnabled: localStorage.getItem("combatSimAutosave") === "true",
    });
  }, []);

  useEffect(() => {
    if (!loading && encountersList) {
      const sortedEncounters = [...encountersList].sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );
      setEncounters(sortedEncounters);
    }
  }, [encountersList, loading]);

  const handleSaveSettings = () => {
    // Save settings from the state object
    localStorage.setItem("combatSimAutoUseMP", settings.autoUseMP);
    localStorage.setItem("combatSimAutoOpenLogs", settings.autoOpenLogs);
    localStorage.setItem("combatSimUseDragAndDrop", settings.useDragAndDrop);
    localStorage.setItem("combatSimAutosave", settings.autosaveEnabled);
    setSettingsOpen(false);
  };

  const handleCloseSettings = () => {
    setSettingsOpen(false);
    // Reset settings state from localStorage on close/cancel
    setSettings({
      autoUseMP: localStorage.getItem("combatSimAutoUseMP") === "true",
      autoOpenLogs: localStorage.getItem("combatSimAutoOpenLogs") === "true",
      useDragAndDrop:
        localStorage.getItem("combatSimUseDragAndDrop") === "true",
      autosaveEnabled: localStorage.getItem("combatSimAutosave") === "true",
    });
  };

  const handleEncounterNameChange = (event) => {
    setEncounterName(event.target.value);
  };

  const handleSaveEncounter = async () => {
    if (!encounterName || encounters.length >= MAX_ENCOUNTERS) return;

    const newEncounter = {
      name: encounterName,
      round: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      uid: user.uid,
      private: true,
    };

    // Add doc to firebase
    const docRef = collection(firestore, "encounters");
    try {
      const res = await addDoc(docRef, newEncounter);
      console.debug(res);
    } catch (e) {
      console.debug(e);
    }

    setEncounterName("");
  };

  const handleDeleteEncounter = async (id) => {
    const docRef = doc(firestore, "encounters", id);
    try {
      await deleteDoc(docRef);
    } catch (e) {
      console.debug(e);
    }
  };

  const handleNavigateToEncounter = (id) => {
    navigate(`/combat-sim/${id}`);
  };

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
                onChange={handleEncounterNameChange}
                inputProps={{ maxLength: 200 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleSaveEncounter}
                disabled={!encounterName || encounters.length >= MAX_ENCOUNTERS}
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
            <Typography variant="h5" color="text.primary">
              {t("combat_sim_saved_encounters")} ({encounters.length}/
              {MAX_ENCOUNTERS})
            </Typography>
            <Tooltip title={t("Settings")}>
              <IconButton
                color={isDarkMode ? "white" : "primary"}
                onClick={() => setSettingsOpen(true)}
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </div>
      </Paper>

      <Grid container spacing={3} sx={{ marginTop: 2 }}>
        {encounters.map((encounter) => (
          <Grid item xs={12} sm={6} md={4} key={encounter.id}>
            <Card
              sx={{
                backgroundColor: isDarkMode
                  ? "#292929"
                  : theme.palette.background.paper,
                borderRadius: 3,
                boxShadow: isDarkMode ? 6 : 4,
                transition: "0.3s",
                "&:hover": {
                  boxShadow: isDarkMode ? 10 : 8,
                  transform: "scale(1.03)",
                },
                cursor: "pointer",
                color: theme.palette.text.primary,
                position: "relative",
              }}
              onClick={() => handleNavigateToEncounter(encounter.id)}
            >
              <CardContent sx={{ paddingBottom: "10px" }}>
                <Typography
                  variant="h4"
                  gutterBottom
                  sx={{ fontWeight: "bold", color: "text.primary" }}
                >
                  {encounter.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("combat_sim_created")}:{" "}
                  {new Date(encounter.createdAt).toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("combat_sim_last_updated")}:{" "}
                  {new Date(encounter.updatedAt).toLocaleString()}
                </Typography>
              </CardContent>
              <CardActions
                sx={{ justifyContent: "flex-end", padding: "10px 16px" }}
              >
                <Tooltip
                  title={t("Delete")}
                  enterDelay={300}
                  leaveDelay={200}
                  enterNextDelay={300}
                >
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteEncounter(encounter.id);
                    }}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </CardActions>
              <Box
                sx={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: theme.palette.text.secondary,
                }}
              >
                <NavigateNext fontSize="medium" />
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Settings Dialog */}
      <SettingsDialog
        open={settingsOpen}
        onClose={handleCloseSettings}
        onSave={handleSaveSettings}
        settings={settings}
        onSettingChange={handleSettingChange}
      />
    </Box>
  );
};
